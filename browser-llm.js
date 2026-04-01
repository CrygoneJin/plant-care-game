// @ts-nocheck
/**
 * Browser-LLM — Lokale Inferenz als Fallback wenn kein API-Key oder Budget leer.
 *
 * Stack: Transformers.js v4 + SmolLM2-360M-Instruct (ONNX q4f16, ~190 MB)
 * Backend: WebGPU (Safari 26+, Chrome 113+, Firefox 141+) mit WASM-Fallback
 * Caching: OPFS — nach Erstladen < 1s Ladezeit
 *
 * Progressive Degradation: Cloud-LLM → Browser-LLM → ELIZA
 *
 * Backlog #90 — PoC-Stub, noch nicht aktiv in chat.js eingebunden.
 * Phase 1 abgeschlossen: Architektur + Evaluation (siehe docs/browser-llm-evaluation.md)
 * Phase 2: Integration in chat.js + iPad-Test
 */
(function () {
    'use strict';

    const MODEL_ID = 'HuggingFaceTB/SmolLM2-360M-Instruct';
    const MODEL_DTYPE = 'q4f16';
    const CDN_URL = 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@4';

    // Maximale Antwortlänge — kurz halten für Geschwindigkeit + Qualität
    const MAX_NEW_TOKENS = 80;

    let _pipeline = null;
    let _loadState = 'idle'; // idle | loading | ready | error
    let _loadError = null;

    /**
     * Vereinfachte Persona-Prompts für NPC-Dialoge.
     * Vollständige Prompts kommen aus eliza-scripts.js in Phase 2.
     */
    const NPC_PERSONAS = {
        spongebob: 'Du bist SpongeBob Schwammkopf. Enthusiastisch, naiv, herzlich. Sehr kurze Sätze. Deutsch.',
        krabs:     'Du bist Mr. Krabs. Geldgierig aber lustig. Sprichst über Geld und Krabbenburger. Deutsch.',
        elefant:   'Du bist der Elefant aus der Sendung mit der Maus. Musikbegeistert und sanftmütig. Deutsch.',
        tommy:     'Du bist Tommy der Seemann. Abenteuerlustig und mutig. Kurze Sätze. Deutsch.',
        neinhorn:  'Du bist das Neinhorn. Sagst fast immer Nein — aber auf witzige Art. Deutsch.',
        maus:      'Du bist die Maus aus der Sendung mit der Maus. Neugierig und erklärt alles einfach. Deutsch.',
        bernd:     'Du bist Bernd das Brot. Mürrisch und lustlos, aber eigentlich nett. Kurz und trocken. Deutsch.',
        floriane:  'Du bist Floriane die Fee. Magisch und verträumt. Sprichst von Sternen und Wundern. Deutsch.',
        bug:       'Du bist Bug der Käfer. Abenteuerlustig und neugierig über die Natur. Deutsch.',
        mephisto:  'Du bist Mephisto der Drache. Dramatisch und geheimnisvoll, aber nicht böse. Deutsch.',
    };

    const DEFAULT_PERSONA = 'Du bist ein freundlicher NPC in einem Kinderspiel auf Schatzinsel. Antworte kurz, kindgerecht und auf Deutsch.';

    window.BROWSER_LLM = {

        /** Aktueller Ladezustand: idle | loading | ready | error */
        getState: function () { return _loadState; },
        isReady: function () { return _loadState === 'ready'; },
        getError: function () { return _loadError; },

        /**
         * Modell im Hintergrund vorladen.
         * Sollte beim ersten Öffnen des Chat-Dialogs aufgerufen werden,
         * nicht erst wenn Budget leer ist.
         *
         * @param {function} [onProgress] - Callback mit { progress: 0-100 }
         */
        preload: async function (onProgress) {
            if (_loadState !== 'idle') return;
            _loadState = 'loading';
            _loadError = null;

            try {
                // Dynamischer ESM-Import — Transformers.js kommt vom CDN
                const { pipeline } = await import(CDN_URL);

                _pipeline = await pipeline('text-generation', MODEL_ID, {
                    dtype: MODEL_DTYPE,
                    device: 'webgpu',       // WASM-Fallback automatisch wenn kein WebGPU
                    progress_callback: onProgress || null
                });

                _loadState = 'ready';
                console.log('[BrowserLLM] Bereit —', MODEL_ID, MODEL_DTYPE);

            } catch (err) {
                _loadState = 'error';
                _loadError = err;
                console.warn('[BrowserLLM] Laden fehlgeschlagen:', err);
            }
        },

        /**
         * NPC-Antwort generieren.
         *
         * @param {Array<{role: string, content: string}>} messages - Chat-History
         * @param {string} charId - Charakter-ID (z.B. 'spongebob')
         * @returns {Promise<string>} - Generierte Antwort
         */
        generate: async function (messages, charId) {
            if (!_pipeline) {
                throw new Error('[BrowserLLM] Modell nicht geladen');
            }

            const systemPrompt = NPC_PERSONAS[charId] || DEFAULT_PERSONA;

            // Nur letzte 4 Nachrichten als Kontext — reicht für kurze Dialoge
            const contextMessages = messages.slice(-4);

            const prompt = [
                { role: 'system', content: systemPrompt },
                ...contextMessages
            ];

            const result = await _pipeline(prompt, {
                max_new_tokens: MAX_NEW_TOKENS,
                temperature: 0.8,
                do_sample: true,
                repetition_penalty: 1.2,
                return_full_text: false
            });

            // Transformers.js gibt Array zurück, letztes Element = neue Antwort
            const generated = result[0]?.generated_text;
            if (Array.isArray(generated)) {
                return generated.at(-1)?.content || '';
            }
            return generated || '';
        }
    };

})();
