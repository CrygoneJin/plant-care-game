// === STORAGE — Zentraler localStorage-Layer ===
// Erstes Mitochondrium: eine Organelle für Datenpersistenz
(function() {
    'use strict';

    const PREFIX = 'insel-';

    function getItem(key, fallback) {
        try {
            const raw = localStorage.getItem(PREFIX + key);
            if (raw === null) return fallback !== undefined ? fallback : null;
            return raw;
        } catch (e) { return fallback !== undefined ? fallback : null; }
    }

    function setItem(key, value) {
        try { localStorage.setItem(PREFIX + key, value); } catch (e) {}
    }

    function getJSON(key, fallback) {
        try {
            const raw = localStorage.getItem(PREFIX + key);
            if (raw === null) return fallback !== undefined ? fallback : null;
            return JSON.parse(raw);
        } catch (e) { return fallback !== undefined ? fallback : null; }
    }

    function setJSON(key, value) {
        try { localStorage.setItem(PREFIX + key, JSON.stringify(value)); } catch (e) {}
    }

    function removeItem(key) {
        try { localStorage.removeItem(PREFIX + key); } catch (e) {}
    }

    // Alle insel-* Keys auflisten
    function keys() {
        const result = [];
        for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (k && k.startsWith(PREFIX)) result.push(k.slice(PREFIX.length));
        }
        return result;
    }

    // Speicherverbrauch in Bytes
    function usageBytes() {
        let total = 0;
        for (let i = 0; i < localStorage.length; i++) {
            const k = localStorage.key(i);
            if (k && k.startsWith(PREFIX)) {
                total += k.length + (localStorage.getItem(k) || '').length;
            }
        }
        return total * 2; // UTF-16
    }

    window.INSEL_STORAGE = {
        get: getItem,
        set: setItem,
        getJSON,
        setJSON,
        remove: removeItem,
        keys,
        usageBytes,
        PREFIX,
    };
})();
