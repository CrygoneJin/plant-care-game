// Service Worker for Schatzinsel — offline play support
// Stale-While-Revalidate: zeigt Cache sofort, lädt im Hintergrund neu
const CACHE_VERSION = 2;
const CACHE_NAME = `schatzinsel-v${CACHE_VERSION}`;

const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/style.css',
    '/game.js',
    '/chat.js',
    '/bus.js',
    '/conway.js',
    '/tts.js',
    '/save.js',
    '/npc-craft.js',
    '/materials.js',
    '/achievements.js',
    '/quests.js',
    '/recipes.js',
    '/automerge.js',
    '/screensaver.js',
    '/sound.js',
    '/effects.js',
    '/nature.js',
    '/stories.js',
    '/voice.js',
    '/marketplace.js',
    '/blueprints.js',
    '/analytics.js',
    '/qr.js',
    '/healthcheck.js',
    '/eliza.js',
    '/eliza-scripts.js',
    '/config.example.js',
    '/manifest.json'
];

// External API hosts — these get network-first strategy
const API_HOSTS = ['requesty', 'anthropic', 'open-meteo', 'workers.dev', 'googleapis.com', 'mmxplorer', 'xchscan'];

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

// Activate: clean up ALL old caches, claim clients
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(keys => Promise.all(
                keys.filter(key => key !== CACHE_NAME)
                    .map(key => caches.delete(key))
            ))
            .then(() => self.clients.claim())
    );
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
