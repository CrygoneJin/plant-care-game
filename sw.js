// Service Worker for Schatzinsel — offline play support
// Stale-While-Revalidate: zeigt Cache sofort, lädt im Hintergrund neu
const CACHE_VERSION = 6;
const CACHE_NAME = `schatzinsel-v${CACHE_VERSION}`;

// Muss exakt mit index.html <script>-Tags übereinstimmen
// config.js ist absichtlich NICHT drin (gitignored, optional, 404 killt addAll)
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/style.css',
    '/manifest.json',
    // core
    '/src/core/bus.js',
    '/src/core/insel.js',
    '/src/core/sound.js',
    '/src/core/screensaver.js',
    '/src/core/iso-renderer.js',
    '/src/core/fractal-trees.js',
    '/src/core/effects.js',
    '/src/core/conway.js',
    '/src/core/hex-grid.js',
    '/src/core/hex-renderer.js',
    '/src/core/hex-marble.js',
    '/src/core/game.js',
    // world
    '/src/world/npc-events.js',
    '/src/world/materials.js',
    '/src/world/achievements.js',
    '/src/world/quests.js',
    '/src/world/recipes.js',
    '/src/world/automerge.js',
    '/src/world/blueprints.js',
    '/src/world/island-generators.js',
    '/src/world/eliza.js',
    '/src/world/eliza-scripts.js',
    '/src/world/nature.js',
    '/src/world/marketplace.js',
    '/src/world/npc-craft.js',
    '/src/world/chat.js',
    '/src/world/voice.js',
    // infra
    '/src/infra/qr.js',
    '/src/infra/storage.js',
    '/src/infra/stories.js',
    '/src/infra/analytics.js',
    '/src/infra/healthcheck.js',
    '/src/infra/tts.js',
    '/src/infra/save.js',
    '/src/infra/tutorial.js',
    '/src/infra/bedtime.js',
];

// External API hosts — these get network-first strategy
const API_HOSTS = ['requesty', 'anthropic', 'open-meteo', 'workers.dev', 'googleapis.com', 'mmxplorer'];

function isApiRequest(url) {
    return API_HOSTS.some(host => url.hostname.includes(host));
}

// Install: pre-cache static assets, activate immediately
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(STATIC_ASSETS))
            .then(() => self.skipWaiting())
    );
});

// Activate: clean up ALL old caches, claim clients, notify about update
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(keys => Promise.all(
                keys.filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            ))
            .then(() => self.clients.claim())
            .then(() => self.clients.matchAll().then(clients => {
                clients.forEach(c => c.postMessage({
                    type: 'cache-update',
                    version: CACHE_VERSION
                }));
            }))
    );
});

// Version-Abfrage: Client kann aktuelle Cache-Version anfragen
self.addEventListener('message', event => {
    if (event.data?.type === 'version') {
        event.source.postMessage({ type: 'cache-version', version: CACHE_VERSION });
    }
});

// Fetch: network-first for API, stale-while-revalidate for static
self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);

    // Network-first for API calls
    if (isApiRequest(url)) {
        event.respondWith(
            fetch(event.request)
                .catch(() => caches.match(event.request))
        );
        return;
    }

    // Stale-While-Revalidate for static assets
    // 1. Sofort aus Cache antworten (schnell)
    // 2. Im Hintergrund vom Netzwerk laden und Cache updaten
    // 3. Beim nächsten Laden ist die neue Version da
    event.respondWith(
        caches.open(CACHE_NAME).then(cache =>
            cache.match(event.request).then(cached => {
                const fetched = fetch(event.request).then(response => {
                    if (response.ok && event.request.method === 'GET') {
                        cache.put(event.request, response.clone());
                    }
                    return response;
                });
                return cached || fetched;
            })
        )
    );
});
