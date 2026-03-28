// === VARIANTE 1: Proxy (empfohlen) ===
// Key bleibt serverseitig. User braucht nichts. Einfach spielen.
// Siehe worker.js für Cloudflare Worker Setup.
//
// window.INSEL_CONFIG = {
//     proxy: 'https://dein-worker.workers.dev',
// };

// === VARIANTE 2: Direkter Key ===
// Für lokale Entwicklung oder eigenes Hosting.
// config.js ist gitignored — Key bleibt lokal.
//
// window.INSEL_CONFIG = {
//     provider: 'langdock',
//     apiKey: 'sk-...',
// };

// === VARIANTE 3: Nerd-Mode (Hirn-Transplantation) ===
// Pro Charakter ein anderes Modell. Persönlichkeit bleibt.
//
// window.INSEL_CONFIG = {
//     proxy: 'https://dein-worker.workers.dev',
//     models: {
//         bernd:     'gpt-4o',
//         neinhorn:  'claude-opus-4-5',
//         spongebob: 'gemini-2.0-flash',
//     }
// };

// Kopiere die gewünschte Variante als config.js:
// cp config.example.js config.js
window.INSEL_CONFIG = {};
