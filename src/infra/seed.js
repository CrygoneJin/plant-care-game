// === SEED — deterministischer Weltzustand ===
// cyrb53 + mulberry32: Public Domain, https://stackoverflow.com/a/47593316
//
// Jeder Seed-Text (z.B. "Lummerland", "Tills Insel") erzeugt reproduzierbar
// dieselbe Welt. Weltstand pro Seed wird in 'insel-projekte' unter
// 'insel:<seed>' persistiert. URL-Parameter ?seed=Name aktiviert den Slot.
(function () {
    'use strict';

    const LAST_SEED_KEY = 'insel:lastSeed';
    const PROJECTS_KEY = 'insel-projekte';

    function cyrb53(str, seed) {
        seed = seed || 0;
        var h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
        for (var i = 0, ch; i < str.length; i++) {
            ch = str.charCodeAt(i);
            h1 = Math.imul(h1 ^ ch, 2654435761);
            h2 = Math.imul(h2 ^ ch, 1597334677);
        }
        h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
        h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
        h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
        h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
        return 4294967296 * (2097151 & h2) + (h1 >>> 0);
    }

    function mulberry32(seed) {
        return function () {
            seed |= 0; seed = seed + 0x6D2B79F5 | 0;
            var t = Math.imul(seed ^ seed >>> 15, 1 | seed);
            t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
            return ((t ^ t >>> 14) >>> 0) / 4294967296;
        };
    }

    function seedToRng(seedText) { return mulberry32(cyrb53(seedText)); }
    function getSeedFromURL() { return new URLSearchParams(location.search).get('seed') || null; }
    function getLastSeed() { return localStorage.getItem(LAST_SEED_KEY) || ''; }

    function saveSeedWorld(seedText, snapshot) {
        var key = 'insel:' + seedText;
        var projects = JSON.parse(localStorage.getItem(PROJECTS_KEY) || '{}');
        projects[key] = Object.assign({}, snapshot, {
            date: new Date().toLocaleDateString('de-DE'),
            seedKey: key,
        });
        localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
        localStorage.setItem(LAST_SEED_KEY, seedText);
    }

    function loadSeedWorld(seedText) {
        var key = 'insel:' + seedText;
        var projects = JSON.parse(localStorage.getItem(PROJECTS_KEY) || '{}');
        return projects[key] || null;
    }

    window.INSEL_SEED = { cyrb53, mulberry32, seedToRng, getSeedFromURL, getLastSeed, saveSeedWorld, loadSeedWorld };
})();
