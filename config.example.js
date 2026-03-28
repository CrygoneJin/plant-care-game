// Kopiere diese Datei als config.js und trage deinen Key ein.
// config.js ist gitignored — dein Key bleibt lokal.
window.INSEL_CONFIG = {
    provider: 'langdock',       // langdock | anthropic | openai | gemini | custom
    apiKey: '',                  // Dein API-Key hier rein
    // endpoint: '',             // Nur bei custom nötig

    // Hirn-Transplantation: Pro Charakter ein anderes Modell setzen.
    // Das Unterbewusstsein (Persönlichkeit) bleibt. Nur das Hirn wechselt.
    // models: {
    //     bernd:     'gpt-4o',              // Bernd mit OpenAI-Hirn
    //     neinhorn:  'claude-opus-4-5',     // Neinhorn mit Opus-Power
    //     spongebob: 'gemini-2.0-flash',    // SpongeBob bleibt Flash
    //     krabs:     'llama-3.3-70b',       // Mr. Krabs bleibt Open Source
    //     elefant:   'claude-haiku-4-5-20251001',  // Elefant mal sparsam
    //     tommy:     'mistral-large-3',     // Tommy mit französischem Hirn
    //     maus:      'gpt-5-nano',          // Maus & Ente nano-schnell
    // }
};
