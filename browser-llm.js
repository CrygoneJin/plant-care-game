// === BROWSER-LLM — Lokale KI direkt im Browser ===
// WebGPU (GPU/NPU) → WASM (CPU) Fallback
// Kein API-Key, kein Server, kein Tracking. Alles lokal.

(function () {
    'use strict';

    // --- Capability Detection ---
    const capabilities = {
        webgpu: false,
        wasm: typeof WebAssembly !== 'undefined',
        backend: 'none', // 'webgpu' | 'wasm' | 'none'
        deviceInfo: '',
        ready: false,
        loading: false,
        error: null,
        progress: 0,
    };

    async function detectCapabilities() {
        // WebGPU Check — GPU/NPU Beschleunigung
        if (navigator.gpu) {
            try {
                const adapter = await navigator.gpu.requestAdapter();
                if (adapter) {
                    capabilities.webgpu = true;
                    capabilities.backend = 'webgpu';
                    const info = await adapter.requestAdapterInfo?.() || {};
                    capabilities.deviceInfo = info.description || info.device || 'WebGPU';
                }
            } catch (_) {
                // WebGPU vorhanden aber Adapter failed — passiert auf manchen Geräten
            }
        }

        // WASM Fallback — läuft auf ALLEM (auch alte Handys)
        if (!capabilities.webgpu && capabilities.wasm) {
            capabilities.backend = 'wasm';
            capabilities.deviceInfo = 'CPU (WebAssembly)';
        }

        return capabilities;
    }

    // --- Model Config ---
    // SmolLM2-360M: Klein genug für Handys, schlau genug für NPC-Dialog
    const MODELS = {
        webgpu: {
            id: 'HuggingFaceTB/SmolLM2-360M-Instruct-q4f16_1-MLC',
            label: 'SmolLM2 360M (WebGPU)',
            size: '~200 MB',
        },
        wasm: {
            id: 'HuggingFaceTB/SmolLM2-135M-Instruct-q4f16_1-MLC',
            label: 'SmolLM2 135M (CPU)',
            size: '~70 MB',
        },
    };

    // --- Engine State ---
    let engine = null;
    let engineReady = false;
    let loadPromise = null;
    let onProgressCallback = null;

    // --- WebLLM laden (CDN, kein Build-Tool nötig) ---
    function getWebLLM() {
        return window.webllm;
    }

    async function loadEngine(progressCb) {
        if (engineReady && engine) return engine;
        if (loadPromise) return loadPromise;

        const webllm = getWebLLM();
        if (!webllm) {
            throw new Error('WebLLM nicht geladen. Prüfe die Internetverbindung.');
        }

        await detectCapabilities();
        if (capabilities.backend === 'none') {
            throw new Error('Weder WebGPU noch WebAssembly verfügbar.');
        }

        const modelConfig = MODELS[capabilities.backend];
        capabilities.loading = true;
        capabilities.error = null;
        onProgressCallback = progressCb || null;

        loadPromise = (async () => {
            try {
                engine = await webllm.CreateMLCEngine(modelConfig.id, {
                    initProgressCallback: (report) => {
                        capabilities.progress = Math.round(report.progress * 100);
                        if (onProgressCallback) {
                            onProgressCallback({
                                progress: capabilities.progress,
                                text: report.text || `Lade ${modelConfig.label}...`,
                            });
                        }
                    },
                });
                engineReady = true;
                capabilities.ready = true;
                capabilities.loading = false;
                return engine;
            } catch (err) {
                capabilities.error = err.message;
                capabilities.loading = false;
                capabilities.ready = false;
                loadPromise = null;
                engine = null;
                throw err;
            }
        })();

        return loadPromise;
    }

    // --- Chat Completion (OpenAI-kompatibles Interface) ---
    async function chatCompletion(messages, options = {}) {
        if (!engineReady || !engine) {
            throw new Error('Browser-LLM nicht geladen. Bitte warten...');
        }

        const response = await engine.chat.completions.create({
            messages: messages,
            max_tokens: options.max_tokens || 150,
            temperature: options.temperature || 0.7,
            top_p: options.top_p || 0.9,
        });

        return {
            choices: [{
                message: {
                    role: 'assistant',
                    content: response.choices[0]?.message?.content || '',
                },
            }],
            usage: {
                completion_tokens: response.usage?.completion_tokens || 0,
                prompt_tokens: response.usage?.prompt_tokens || 0,
                total_tokens: response.usage?.total_tokens || 0,
            },
        };
    }

    // --- Public API ---
    window.BrowserLLM = {
        // Hardware-Fähigkeiten prüfen
        detect: detectCapabilities,

        // Engine laden (mit optionalem Progress-Callback)
        load: loadEngine,

        // Chat-Nachricht senden (selbes Format wie OpenAI API)
        chat: chatCompletion,

        // Status abfragen
        get capabilities() { return { ...capabilities }; },
        get ready() { return engineReady; },
        get modelInfo() { return MODELS[capabilities.backend] || null; },

        // Engine entladen (Speicher freigeben)
        unload: async function () {
            if (engine) {
                try { await engine.unload(); } catch (_) {}
                engine = null;
                engineReady = false;
                capabilities.ready = false;
                loadPromise = null;
            }
        },

        // Kurzbeschreibung für UI
        getStatusText: function () {
            if (capabilities.error) return `❌ ${capabilities.error}`;
            if (capabilities.loading) return `⏳ Lade Modell... ${capabilities.progress}%`;
            if (capabilities.ready) return `✅ ${MODELS[capabilities.backend]?.label || 'Bereit'}`;
            if (capabilities.backend === 'webgpu') return '🎮 WebGPU erkannt — GPU/NPU bereit';
            if (capabilities.backend === 'wasm') return '🔧 CPU-Modus (WebAssembly)';
            return '❓ Browser-KI nicht verfügbar';
        },
    };

})();
