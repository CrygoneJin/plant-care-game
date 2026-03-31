// Service Worker for Schatzinsel — offline play support
const CACHE_NAME = 'schatzinsel-v1';

const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/style.css',
    '/game.js',
    '/chat.js',
    '/materials.js',
    '/achievements.js',
    '/quests.js',
    '/recipes.js',
    '/automerge.js',
    '/screensaver.js',
    '/sound.js',
    '/healthcheck.js',
    '/eliza.js',
    '/eliza-scripts.js',
    '/config.example.js',
    '/manifest.json'
];

// External API hosts — these get network-first strategy
const API_HOSTS = ['requesty', 'anthropic', 'open-meteo', 'workers.dev', 'googleapis.com'];

function isApiRequest(url) {
    return API_HOSTS.some(host => url.hostname.includes(host));
}

// Install: pre-cache static assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(STATIC_ASSETS))
            .then(() => self.skipWaiting())
    );
});

// Activate: clean up old caches
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

// Fetch: cache-first for static, network-first for API
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

    // Cache-first for static assets
    event.respondWith(
        caches.match(event.request)
            .then(cached => cached || fetch(event.request).then(response => {
                // Cache successful GET responses
                if (response.ok && event.request.method === 'GET') {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
                }
                return response;
            }))
    );
});
