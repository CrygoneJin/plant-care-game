// === INSEL — Zentraler Namespace ===
// Der Zellkern. Alle Module registrieren sich hier.
// Phase 1 aus EVOLUTION.md: Prokaryot → Eukaryot
(function() {
    'use strict';

    const INSEL = window.INSEL || {};

    // Event-Bus: einfaches Pub/Sub
    const listeners = {};

    INSEL.on = function(event, handler) {
        if (!listeners[event]) listeners[event] = [];
        listeners[event].push(handler);
    };

    INSEL.off = function(event, handler) {
        if (!listeners[event]) return;
        listeners[event] = listeners[event].filter(h => h !== handler);
    };

    INSEL.emit = function(event, data) {
        if (!listeners[event]) return;
        listeners[event].forEach(h => {
            try { h(data); } catch (e) { console.error('INSEL event error:', event, e); }
        });
    };

    // Modul-Registry: Module registrieren sich mit Namen
    INSEL.register = function(name, module) {
        if (INSEL[name]) {
            console.warn('INSEL: Modul ' + name + ' wird überschrieben');
        }
        INSEL[name] = module;
    };

    // Version & Debug
    INSEL.version = '1.0.0';
    INSEL.debug = function() {
        const modules = Object.keys(INSEL).filter(k =>
            typeof INSEL[k] === 'object' && k !== 'version'
        );
        return { modules, listeners: Object.keys(listeners), version: INSEL.version };
    };

    window.INSEL = INSEL;
})();
