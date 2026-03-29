// === VARIANTE 1: Requesty (empfohlen — Direct API) ===
// Key von requesty.ai → Dashboard → API Keys
// Routet alle Modelle (Anthropic, OpenAI, Google, Mistral…)
//
// window.INSEL_CONFIG = {
//     provider: 'requesty',
//     apiKey: 'sk-...',
// };

// === VARIANTE 2: Proxy (zero-setup für Spieler) ===
// Key bleibt serverseitig. User braucht nichts. Einfach spielen.
// Siehe worker.js für Cloudflare Worker Setup.
//
// window.INSEL_CONFIG = {
//     proxy: 'https://dein-worker.workers.dev',
// };

// === VARIANTE 3: Lokaler LiteLLM-Proxy ===
// LiteLLM läuft auf localhost:4000. Routet alle Modelle.
// Braucht: litellm --config ~/.claude/litellm-config.yaml --port 4000
//
// window.INSEL_CONFIG = {
//     proxy: 'http://localhost:4000',
//     proxyKey: 'sk-proxy',
// };

// === VARIANTE 4: Nerd-Mode (Hirn-Transplantation) ===
// Pro Charakter ein anderes Modell. Persönlichkeit bleibt.
// Geht mit Requesty, LiteLLM oder direktem Key.
//
// window.INSEL_CONFIG = {
//     provider: 'requesty',
//     apiKey: 'sk-...',
//     models: {
//         bernd:     'anthropic/claude-haiku-4-5-20251001',
//         neinhorn:  'mistralai/mistral-large-2',
//         spongebob: 'google/gemini-2.0-flash',
//     }
// };

// Kopiere die gewünschte Variante als config.js:
// cp config.example.js config.js
window.INSEL_CONFIG = {};
