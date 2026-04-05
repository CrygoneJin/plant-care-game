// === NPC-EVENTS — NPCs reagieren auf Wu-Xing Element-Events ===
// Lauscht auf INSEL_BUS Events und zeigt kontextbezogene NPC-Reaktionen als Toast.
// 30% Chance pro Event, max 1 Reaktion alle 15 Sekunden.

(function() {
    'use strict';

    var COOLDOWN_MS = 15000;
    var TRIGGER_CHANCE = 0.3;
    var MAX_PER_SESSION = 3;

    /** @type {number} */
    var lastReactionTime = 0;
    /** @type {number} */
    var sessionReactionCount = 0;

    /**
     * NPC-Reaktions-Tabelle: Event → Array von {npc, emoji, text}
     * @type {Record<string, Array<{npc: string, emoji: string, text: string}>>}
     */
    var REACTIONS = {
        'consequence:ash': [
            { npc: 'spongebob', emoji: '🧽', text: 'Hey, mein Grill! 🔥' },
            { npc: 'krabs', emoji: '🦀', text: 'Mein Holz! Das war teuer! 💸' },
        ],
        'consequence:flowers': [
            { npc: 'maus', emoji: '🐭', text: 'Schön hier! 🌺' },
            { npc: 'elefant', emoji: '🐘', text: 'Blumen! Die riechen gut! 🌸' },
            { npc: 'neinhorn', emoji: '🦄', text: 'NEIN! ...ok, die sind hübsch. 🌼' },
        ],
        'element:water': [
            { npc: 'elefant', emoji: '🐘', text: 'Brauche ich! 💦' },
            { npc: 'spongebob', emoji: '🧽', text: 'Wasser! Ich saug das auf! 💧' },
        ],
        'element:fire': [
            { npc: 'spongebob', emoji: '🧽', text: 'Feuer! Wo ist mein Eimer? 🪣' },
            { npc: 'mephisto', emoji: '😈', text: 'Ah, Feuer... mein Element. 🔥' },
        ],
        'element:metal': [
            { npc: 'krabs', emoji: '🦀', text: 'Metall! Das ist was wert! 💰' },
            { npc: 'tommy', emoji: '🦞', text: 'Glänzend! Kann man verkaufen? 🪙' },
        ],
        'element:wood': [
            { npc: 'spongebob', emoji: '🧽', text: 'Holz! Kann man drauf wohnen! 🏠' },
            { npc: 'maus', emoji: '🐭', text: 'Davon bau ich mir ein Nest! 🪹' },
        ],
        'element:earth': [
            { npc: 'elefant', emoji: '🐘', text: 'Erde! Gut für die Füße! 🐾' },
            { npc: 'maus', emoji: '🐭', text: 'Da kann man buddeln! 🕳️' },
        ],
        'merge:result': [
            { npc: 'mephisto', emoji: '😈', text: 'Interessant... was hast du da gemacht? 🧪' },
            { npc: 'neinhorn', emoji: '🦄', text: 'NEIN! ...ok, das war cool. ✨' },
        ],
        'craft:success': [
            { npc: 'mephisto', emoji: '😈', text: 'Interessant... 🧪' },
            { npc: 'krabs', emoji: '🦀', text: 'Kann man das verkaufen? 💰' },
            { npc: 'tommy', emoji: '🦞', text: 'Nicht schlecht! Klick-klack! 🦞' },
        ],
        'material:dino': [
            { npc: 'mephisto', emoji: '😈', text: 'Ah... Urzeitliche Energie. Die Saurier wussten was Macht ist. 🦕' },
            { npc: 'bernd', emoji: '🐻', text: 'WOW! Vor 66 Millionen Jahren war das lebendig! 🦴' },
            { npc: 'elefant', emoji: '🐘', text: 'Meine Vorfahren! Ich erkenne uns... 🦣' },
        ],
        'island:arrived': [
            { npc: 'bernd', emoji: '🐻', text: 'Neue Insel! Was werden wir hier entdecken? 🗺️' },
            { npc: 'maus', emoji: '🐭', text: 'Ich rieche Abenteuer! 🌊' },
        ],
    };

    /**
     * Prüft Cooldown und Chance, zeigt ggf. NPC-Toast
     * @param {string} eventName
     * @param {Object} [data]
     */
    function maybeReact(eventName, data) {
        if (sessionReactionCount >= MAX_PER_SESSION) return;
        var now = Date.now();
        if (now - lastReactionTime < COOLDOWN_MS) return;
        if (Math.random() > TRIGGER_CHANCE) return;

        var pool = REACTIONS[eventName];
        if (!pool || pool.length === 0) return;

        var pick = pool[Math.floor(Math.random() * pool.length)];
        lastReactionTime = now;
        sessionReactionCount++;

        if (typeof window.showToast === 'function') {
            window.showToast(pick.emoji + ' ' + pick.npc.charAt(0).toUpperCase() + pick.npc.slice(1) + ': ' + pick.text, 3500);
        }
    }

    /**
     * Bus-Listener registrieren
     */
    function init() {
        var bus = window.INSEL_BUS;
        if (!bus) return;

        var events = Object.keys(REACTIONS);
        for (var i = 0; i < events.length; i++) {
            (function(evt) {
                bus.on(evt, function(data) { maybeReact(evt, data); });
            })(events[i]);
        }
    }

    // Init wenn DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Public API (für Tests / Debugging)
    window.INSEL_NPC_EVENTS = {
        REACTIONS: REACTIONS,
        COOLDOWN_MS: COOLDOWN_MS,
        TRIGGER_CHANCE: TRIGGER_CHANCE,
        MAX_PER_SESSION: MAX_PER_SESSION,
    };
})();
