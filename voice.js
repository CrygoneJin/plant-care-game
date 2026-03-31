// === INSEL-VOICE — Gemini Live Voice Chat mit NPCs ===

(function () {
    'use strict';

    // --- Config ---
    const CFG = window.INSEL_CONFIG || {};
    const VOICE_PROXY = CFG.voiceProxy || 'wss://schatzinsel.hoffmeyer-zlotnik.workers.dev/voice';

    // NPC → Gemini Voice Mapping
    const VOICE_MAP = {
        mephisto:  'Charon',
        spongebob: 'Puck',
        elefant:   'Kore',
        floriane:  'Aoede',
    };
    const DEFAULT_VOICE = 'Fenrir';

    // Audio constants
    const SAMPLE_RATE = 16000;
    const CHANNELS = 1;
    const BUFFER_SIZE = 4096;

    // --- State ---
    let ws = null;
    let audioCtx = null;
    let micStream = null;
    let scriptProcessor = null;
    let isActive = false;
    let currentNpcId = null;
    let playbackQueue = [];
    let isPlaying = false;
    let currentSource = null;

    // --- Helpers ---

    function showToast(msg) {
        if (window.showToast) window.showToast(msg);
    }

    function getVoice(npcId) {
        return VOICE_MAP[npcId] || DEFAULT_VOICE;
    }

    function getSystemPrompt(npcId) {
        // CHARACTERS is inside chat.js IIFE — we read from openChat's exposed state
        // chat.js exposes window.openChat but not CHARACTERS directly.
        // We grab the system prompt via a data attribute or fallback.
        // Actually: chat.js doesn't export CHARACTERS. We duplicate the lookup
        // by reading the NPC's name from the DOM and using a minimal fallback.
        // Better approach: we check if chat.js exposes it, otherwise use empty.
        if (window.INSEL_CHARACTERS && window.INSEL_CHARACTERS[npcId]) {
            return window.INSEL_CHARACTERS[npcId].system;
        }
        // Fallback: minimal instruction
        return 'Du bist ein freundlicher Inselbewohner. Sprich Deutsch. Halte dich kurz.';
    }

    // --- Base64 encoding/decoding for PCM audio ---

    function pcmToBase64(float32Array) {
        const int16 = new Int16Array(float32Array.length);
        for (let i = 0; i < float32Array.length; i++) {
            const s = Math.max(-1, Math.min(1, float32Array[i]));
            int16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }
        const bytes = new Uint8Array(int16.buffer);
        let binary = '';
        for (let i = 0; i < bytes.length; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }

    function base64ToPcm(base64) {
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        const int16 = new Int16Array(bytes.buffer);
        const float32 = new Float32Array(int16.length);
        for (let i = 0; i < int16.length; i++) {
            float32[i] = int16[i] / (int16[i] < 0 ? 0x8000 : 0x7FFF);
        }
        return float32;
    }

    // --- Audio Playback ---

    function ensureAudioContext() {
        if (!audioCtx || audioCtx.state === 'closed') {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: SAMPLE_RATE });
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        return audioCtx;
    }

    function stopPlayback() {
        playbackQueue = [];
        isPlaying = false;
        if (currentSource) {
            try { currentSource.stop(); } catch (_) { /* already stopped */ }
            currentSource = null;
        }
    }

    function enqueueAudio(float32Data) {
        playbackQueue.push(float32Data);
        if (!isPlaying) {
            playNextChunk();
        }
    }

    function playNextChunk() {
        if (playbackQueue.length === 0) {
            isPlaying = false;
            return;
        }
        isPlaying = true;
        const ctx = ensureAudioContext();
        const data = playbackQueue.shift();
        const buffer = ctx.createBuffer(CHANNELS, data.length, SAMPLE_RATE);
        buffer.getChannelData(0).set(data);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        currentSource = source;
        source.onended = function () {
            currentSource = null;
            playNextChunk();
        };
        source.start();
    }

    // --- Microphone ---

    async function startMicrophone() {
        try {
            micStream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    sampleRate: SAMPLE_RATE,
                    channelCount: CHANNELS,
                    echoCancellation: true,
                    noiseSuppression: true,
                }
            });
        } catch (err) {
            showToast('🎤 Mikrofon nicht verfügbar');
            throw err;
        }

        const ctx = ensureAudioContext();
        const source = ctx.createMediaStreamSource(micStream);

        // ScriptProcessorNode (deprecated but universally supported, no build tools needed)
        scriptProcessor = ctx.createScriptProcessor(BUFFER_SIZE, CHANNELS, CHANNELS);
        scriptProcessor.onaudioprocess = function (e) {
            if (!isActive || !ws || ws.readyState !== WebSocket.OPEN) return;

            // Interruption: user speaks while NPC is talking → stop playback
            const input = e.inputBuffer.getChannelData(0);
            if (isPlaying && hasVoiceActivity(input)) {
                stopPlayback();
            }

            // Downsample if needed (AudioContext might not honour sampleRate request)
            const resampled = downsample(input, ctx.sampleRate, SAMPLE_RATE);
            const base64 = pcmToBase64(resampled);

            ws.send(JSON.stringify({
                realtime_input: {
                    media_chunks: [{
                        mime_type: 'audio/pcm;rate=16000',
                        data: base64,
                    }]
                }
            }));
        };

        source.connect(scriptProcessor);
        scriptProcessor.connect(ctx.destination); // needed for onaudioprocess to fire
    }

    function stopMicrophone() {
        if (scriptProcessor) {
            scriptProcessor.disconnect();
            scriptProcessor = null;
        }
        if (micStream) {
            micStream.getTracks().forEach(t => t.stop());
            micStream = null;
        }
    }

    function hasVoiceActivity(samples) {
        let sum = 0;
        for (let i = 0; i < samples.length; i++) {
            sum += samples[i] * samples[i];
        }
        const rms = Math.sqrt(sum / samples.length);
        return rms > 0.015; // threshold for voice activity
    }

    function downsample(buffer, fromRate, toRate) {
        if (fromRate === toRate) return new Float32Array(buffer);
        const ratio = fromRate / toRate;
        const newLength = Math.round(buffer.length / ratio);
        const result = new Float32Array(newLength);
        for (let i = 0; i < newLength; i++) {
            const idx = Math.round(i * ratio);
            result[i] = buffer[Math.min(idx, buffer.length - 1)];
        }
        return result;
    }

    // --- WebSocket (Gemini Live API via Cloudflare Worker proxy) ---

    function connectWebSocket(npcId) {
        return new Promise(function (resolve, reject) {
            const voice = getVoice(npcId);
            const systemPrompt = getSystemPrompt(npcId);

            ws = new WebSocket(VOICE_PROXY);

            ws.onopen = function () {
                // Send setup message with system instruction and voice config
                ws.send(JSON.stringify({
                    setup: {
                        model: 'models/gemini-2.0-flash-exp',
                        generation_config: {
                            response_modalities: ['AUDIO'],
                            speech_config: {
                                voice_config: {
                                    prebuilt_voice_config: {
                                        voice_name: voice,
                                    }
                                }
                            }
                        },
                        system_instruction: {
                            parts: [{ text: systemPrompt }]
                        }
                    }
                }));
                resolve();
            };

            ws.onmessage = function (event) {
                try {
                    const msg = JSON.parse(event.data);
                    handleServerMessage(msg);
                } catch (_) {
                    // ignore non-JSON messages
                }
            };

            ws.onerror = function () {
                // Silently fall back to text chat
                cleanup();
                reject(new Error('WebSocket Fehler'));
            };

            ws.onclose = function () {
                if (isActive) {
                    // Unexpected close — deactivate voice mode
                    deactivate();
                }
            };
        });
    }

    function handleServerMessage(msg) {
        // Gemini Live API sends audio in serverContent.modelTurn.parts
        if (msg.serverContent && msg.serverContent.modelTurn) {
            const parts = msg.serverContent.modelTurn.parts || [];
            for (let i = 0; i < parts.length; i++) {
                if (parts[i].inlineData && parts[i].inlineData.data) {
                    const pcm = base64ToPcm(parts[i].inlineData.data);
                    enqueueAudio(pcm);
                }
            }
        }

        // Handle text transcriptions if sent
        if (msg.serverContent && msg.serverContent.modelTurn) {
            const parts = msg.serverContent.modelTurn.parts || [];
            for (let i = 0; i < parts.length; i++) {
                if (parts[i].text) {
                    // Could display in chat as transcript — optional
                    addTranscript(parts[i].text, 'npc');
                }
            }
        }

        // Handle user speech transcription
        if (msg.serverContent && msg.serverContent.inputTranscript) {
            addTranscript(msg.serverContent.inputTranscript, 'user');
        }
    }

    function addTranscript(text, role) {
        const messagesEl = document.getElementById('chat-messages');
        if (!messagesEl || !text.trim()) return;
        const div = document.createElement('div');
        div.className = 'chat-msg ' + (role === 'npc' ? 'npc' : 'user');
        div.textContent = (role === 'npc' ? '🔊 ' : '🎤 ') + text;
        div.style.opacity = '0.7';
        div.style.fontStyle = 'italic';
        messagesEl.appendChild(div);
        messagesEl.scrollTop = messagesEl.scrollHeight;
    }

    // --- Activate / Deactivate ---

    async function activate(npcId) {
        if (isActive) return;
        currentNpcId = npcId;

        try {
            await connectWebSocket(npcId);
            await startMicrophone();
            isActive = true;
            updateButton(true);
        } catch (err) {
            cleanup();
            // Fall back to text chat silently (toast already shown for mic errors)
        }
    }

    function deactivate() {
        isActive = false;
        cleanup();
        updateButton(false);
    }

    function cleanup() {
        stopPlayback();
        stopMicrophone();
        if (ws) {
            try { ws.close(); } catch (_) { /* ok */ }
            ws = null;
        }
    }

    // --- UI: Mic Button ---

    function createMicButton() {
        const inputArea = document.getElementById('chat-input-area');
        if (!inputArea) return null;

        const btn = document.createElement('button');
        btn.id = 'voice-chat-btn';
        btn.textContent = '🎤';
        btn.title = 'Sprachmodus ein/aus';
        btn.setAttribute('aria-label', 'Sprachmodus ein/aus');

        // Style consistent with #chat-send-btn
        btn.style.cssText = [
            'width: 36px',
            'height: 36px',
            'border-radius: 50%',
            'border: none',
            'background: #3498DB',
            'color: white',
            'font-size: 16px',
            'cursor: pointer',
            'margin-left: 4px',
            'transition: transform 0.15s, background 0.3s',
            'flex-shrink: 0',
        ].join(';');

        btn.addEventListener('click', function () {
            // Get current NPC from chat.js — read from the character select or panel state
            const charSelect = document.getElementById('chat-character');
            const npcId = charSelect ? charSelect.value : 'bernd';

            if (isActive) {
                deactivate();
            } else {
                activate(npcId);
            }
        });

        // Insert after send button
        const sendBtn = document.getElementById('chat-send-btn');
        if (sendBtn && sendBtn.parentNode === inputArea) {
            inputArea.insertBefore(btn, sendBtn.nextSibling);
        } else {
            inputArea.appendChild(btn);
        }

        // Pulse animation for active state
        const style = document.createElement('style');
        style.textContent = [
            '@keyframes voice-pulse {',
            '  0%, 100% { box-shadow: 0 0 0 0 rgba(231, 76, 60, 0.6); }',
            '  50% { box-shadow: 0 0 0 8px rgba(231, 76, 60, 0); }',
            '}',
            '#voice-chat-btn.voice-active {',
            '  background: #E74C3C;',
            '  animation: voice-pulse 1.2s ease-in-out infinite;',
            '}',
            '#voice-chat-btn:hover {',
            '  transform: scale(1.1);',
            '}',
        ].join('\n');
        document.head.appendChild(style);

        return btn;
    }

    function updateButton(active) {
        const btn = document.getElementById('voice-chat-btn');
        if (!btn) return;
        if (active) {
            btn.classList.add('voice-active');
            btn.title = 'Sprachmodus beenden';
        } else {
            btn.classList.remove('voice-active');
            btn.title = 'Sprachmodus ein/aus';
        }
    }

    // --- Init ---

    function init() {
        // Wait for DOM / chat panel to be ready
        if (document.getElementById('chat-input-area')) {
            createMicButton();
        } else {
            // Retry once after DOM is loaded
            window.addEventListener('DOMContentLoaded', function () {
                createMicButton();
            });
            // Also try on load as fallback
            window.addEventListener('load', function () {
                if (!document.getElementById('voice-chat-btn')) {
                    createMicButton();
                }
            });
        }
    }

    // --- Public API ---

    window.startVoiceChat = function (npcId) {
        if (!npcId) {
            const charSelect = document.getElementById('chat-character');
            npcId = charSelect ? charSelect.value : 'bernd';
        }
        // Make sure chat panel is open
        if (window.openChat) window.openChat(npcId);
        activate(npcId);
    };

    window.stopVoiceChat = function () {
        deactivate();
    };

    // Expose CHARACTERS lookup for voice.js (chat.js can call this to register)
    // chat.js should call window.registerInselCharacters(CHARACTERS) if it wants voice to work fully.
    window.registerInselCharacters = function (chars) {
        window.INSEL_CHARACTERS = chars;
    };

    init();

})();
