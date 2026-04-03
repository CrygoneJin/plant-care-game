// config.js — Kopiere als config.js: cp config.example.js config.js
//
// Ohne config.js nutzt das Spiel automatisch den Cloudflare Proxy.
// Nur nötig wenn du einen eigenen API-Key verwenden willst.

// === Option 1: Eigener Requesty-Key ===
// window.INSEL_CONFIG = { provider: 'requesty', apiKey: 'rqsty-sk-...' };

// === Option 2: Eigener Proxy ===
// window.INSEL_CONFIG = { proxy: 'https://dein-worker.workers.dev' };

// Default: leer (Proxy-Fallback greift automatisch)
window.INSEL_CONFIG = {};
