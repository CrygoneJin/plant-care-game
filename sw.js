// === SERVICE WORKER — Schatzinsel Offline ===
// Cache-First: Alles lokal, Netz nur zum Updaten.
// Kuba-tauglich: Einmal laden, für immer spielen.

const CACHE_NAME = 'schatzinsel-v2';
const CORE_ASSETS = [
    './',
    './index.html',
    './style.css',
    './game.js',
    './chat.js',
    './materials.js',
    './achievements.js',
    './quests.js',
    './recipes.js',
    './automerge.js',
    './screensaver.js',
    './sound.js',
    './worker.js',
    './browser-llm.js',
    './coop.js',
    './gamepad.js',
    './color-era.js',
    './gyro.js',
];

// Install: Core-Assets cachen
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(CORE_ASSETS);
        })
    );
    self.skipWaiting();
});

// Activate: Alte Caches löschen
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
            )
        )
    );
    self.clients.claim();
});

// Fetch: Cache-First, Network-Fallback
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // API-Calls und externe CDNs: Network-First (nicht cachen)
    if (url.origin !== self.location.origin) {
        event.respondWith(
            fetch(event.request).catch(() => {
                // Offline: Leere Antwort für API-Calls
                return new Response(JSON.stringify({ error: 'offline' }), {
                    status: 503,
                    headers: { 'Content-Type': 'application/json' },
                });
            })
        );
        return;
    }

    // Lokale Assets: Cache-First
    event.respondWith(
        caches.match(event.request).then((cached) => {
            if (cached) return cached;
            return fetch(event.request).then((response) => {
                // Erfolgreiche Responses cachen
                if (response.ok) {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
                }
                return response;
            }).catch(() => {
                // Komplett offline, kein Cache: Fallback
                if (event.request.destination === 'document') {
                    return caches.match('./index.html');
                }
                return new Response('Offline', { status: 503 });
            });
        })
    );
});
