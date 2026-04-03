// === ANALYTICS === Extrahiert aus game.js (Zellteilung #11)
// Reine Datenschicht — localStorage, Events, Session-Tracking
// Kein DOM-Zugriff, keine game.js-Abhängigkeiten
(function () {
    'use strict';

    // --- Basis: localStorage-Zugriff ---
    function getAnalytics() {
        return JSON.parse(localStorage.getItem('insel-analytics') || '{}');
    }

    function saveAnalytics(analytics) {
        localStorage.setItem('insel-analytics', JSON.stringify(analytics));
    }

    // --- Event-Tracking ---
    function trackEvent(event, data) {
        const analytics = getAnalytics();
        if (!analytics.events) analytics.events = [];
        analytics.events.push({
            e: event,
            d: data || {},
            t: Date.now(),
        });
        // Max 500 Events speichern
        if (analytics.events.length > 500) {
            analytics.events = analytics.events.slice(-500);
        }
        saveAnalytics(analytics);
    }

    // --- Session-Tracking ---
    function trackSession(theme) {
        const analytics = getAnalytics();
        analytics.sessions = (analytics.sessions || 0) + 1;
        analytics.lastVisit = Date.now();
        analytics.theme = theme;
        if (!analytics.firstVisit) analytics.firstVisit = Date.now();
        saveAnalytics(analytics);
    }

    // --- A/B-Test ---
    function assignABTest(themes, applyThemeFn) {
        const analytics = getAnalytics();
        if (!analytics.abGroup) {
            const randomTheme = themes[Math.floor(Math.random() * themes.length)];
            analytics.abGroup = randomTheme;
            saveAnalytics(analytics);
            if (applyThemeFn) applyThemeFn(randomTheme);
            return randomTheme;
        }
        return analytics.abGroup;
    }

    // --- Session-Uhr (Feynman-Messpunkte) ---
    const sessionClock = {
        start: null,
        firstBlock: null,
        firstChat: null,
        firstCodeView: null,
        firstEasterEgg: null,
    };

    function startSessionClock() {
        sessionClock.start = Date.now();
        trackEvent('clock_start', {});
    }

    function recordMilestone(key) {
        if (sessionClock.start && !sessionClock[key]) {
            sessionClock[key] = Date.now();
            const elapsed = Math.round((sessionClock[key] - sessionClock.start) / 1000);
            trackEvent('milestone', { key, seconds: elapsed });
            INSEL.emit('milestone', { key, seconds: elapsed });
        }
        return sessionClock[key];
    }

    function getSessionClock() {
        return sessionClock;
    }

    // --- Anonyme Test-ID (pro Gerät) ---
    function getAnonId() {
        let id = localStorage.getItem('insel-anon-id');
        if (!id) {
            id = 'T' + Math.random().toString(36).slice(2, 8);
            localStorage.setItem('insel-anon-id', id);
        }
        return id;
    }

    // --- Testdaten sammeln ---
    // statsFn wird von game.js gesetzt (liefert Grid-Stats, Achievements, etc.)
    let gameStatsFn = null;

    function collectTestData() {
        const s = sessionClock;
        const analytics = getAnalytics();
        const events = analytics.events || [];
        const elapsed = (key) => s.start && s[key] ? Math.round((s[key] - s.start) / 1000) : null;
        const gameStats = gameStatsFn ? gameStatsFn() : {};

        return {
            id: getAnonId(),
            ts: new Date().toISOString(),
            session: analytics.sessions || 1,
            theme: analytics.theme || null,
            abGroup: analytics.abGroup || null,
            duration_s: s.start ? Math.round((Date.now() - s.start) / 1000) : 0,
            ms_firstBlock: elapsed('firstBlock'),
            ms_firstChat: elapsed('firstChat'),
            ms_firstCodeView: elapsed('firstCodeView'),
            ms_firstEasterEgg: elapsed('firstEasterEgg'),
            blocks: gameStats.total || 0,
            materials: gameStats.uniqueMats || 0,
            achievements: gameStats.achievements || 0,
            quests_done: gameStats.questsDone || 0,
            quests_active: gameStats.questsActive || 0,
            easter_eggs: gameStats.easterEggs || 0,
            hoerspiele: gameStats.hoerspiele || 0,
            builds: events.filter(e => e.e === 'build').length,
            demolishes: events.filter(e => e.e === 'demolish').length,
            zauber: events.filter(e => e.e === 'code_zauber').length,
            postcards: events.filter(e => e.e === 'postcard').length,
            // Neutrino-Metrik: Crafting- und Chat-Events zählen
            crafts_count: events.filter(e => e.e === 'craft' || e.e === 'quick-craft' || e.e === 'llm-craft').length,
            chats_count: events.filter(e => e.e === 'chat' || e.e === 'npc_chat').length,
        };
    }

    // --- Webhook-Ping (Session-Ende) ---
    function pingWebhook() {
        var data = collectTestData();
        // 1. Google Sheets Webhook (falls konfiguriert)
        var url = localStorage.getItem('insel-webhook');
        if (url) {
            try { navigator.sendBeacon(url, JSON.stringify(data)); } catch (e) { /* still */ }
        }
        // 2. Cloudflare Worker D1 — immer senden
        try {
            var proxy = (window.INSEL_CONFIG && window.INSEL_CONFIG.proxy) || 'https://schatzinsel.hoffmeyer-zlotnik.workers.dev';
            // Neutrino-Score: 1.0 = nur gebaut/geschaut, 0.5 = wenig Interaktion, 0.0 = viel interagiert
            var crafts = data.crafts_count || 0;
            var chats = data.chats_count || 0;
            var hasChat = data.ms_firstChat ? 1 : 0;
            var totalChats = chats + hasChat; // Chat-Events + Milestone als Proxy
            var neutrinoScore = (crafts === 0 && totalChats === 0) ? 1.0
                : (crafts < 3 && totalChats < 3) ? 0.5
                : 0.0;
            navigator.sendBeacon(proxy + '/metrics/ingest', JSON.stringify({
                type: 'session',
                player_name: localStorage.getItem('insel-spielername') || 'Anonym',
                duration_s: data.duration_s,
                blocks_placed: data.blocks || 0,
                blocks_harvested: data.demolishes || 0,
                quests_completed: data.quests_done || 0,
                crafts_total: data.builds || 0,
                chat_messages: totalChats,
                unique_materials: data.materials || 0,
                engagement_score: Math.min(100, Math.round(
                    (data.duration_s > 30 ? 20 : 0) +
                    (data.blocks > 0 ? 20 : 0) +
                    (data.ms_firstChat ? 20 : 0) +
                    (data.quests_done > 0 ? 20 : 0) +
                    (data.easter_eggs > 0 ? 10 : 0) +
                    (data.materials > 3 ? 10 : 0)
                )),
                neutrino_score: neutrinoScore,
            }));
        } catch (e) { /* kein Tracking > kaputtes Tracking */ }
    }

    // --- Bug-Reporter ---
    function reportBug(msg, showToastFn) {
        if (!msg || !msg.trim()) {
            if (showToastFn) showToastFn('🐛 Bitte beschreibe den Bug!');
            return;
        }
        const proxyUrl = (window.INSEL_CONFIG?.proxy || 'https://schatzinsel.hoffmeyer-zlotnik.workers.dev');
        const bug = {
            msg: msg.trim(),
            page: window.location.href,
            screen: window.innerWidth + 'x' + window.innerHeight,
            reporter: localStorage.getItem('insel-spielername') || 'Anonym',
        };
        fetch(proxyUrl + '/bugs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bug),
        }).then(r => r.json()).then(d => {
            if (showToastFn) showToastFn(d.ok ? '🐛 Bug gemeldet! Danke!' : '🐛 Fehler beim Melden.');
        }).catch(() => {
            if (showToastFn) showToastFn('🐛 Kein Netz — Bug nicht gemeldet.');
        });
    }

    // --- Init: Testmodus + Buttons ---
    function initTestUI(showToastFn) {
        const testdataBtn = document.getElementById('testdata-btn');
        if (testdataBtn) {
            testdataBtn.addEventListener('click', function () {
                var data = collectTestData();
                var json = JSON.stringify(data, null, 2);
                navigator.clipboard.writeText(json).then(function () {
                    if (showToastFn) showToastFn('📊 Testdaten kopiert! Einfügen mit Strg+V.');
                }).catch(function () {
                    var blob = new Blob([json], { type: 'application/json' });
                    var link = document.createElement('a');
                    link.download = 'testdaten-' + data.id + '.json';
                    link.href = URL.createObjectURL(blob);
                    link.click();
                    if (showToastFn) showToastFn('📊 Testdaten heruntergeladen!');
                });
            });
        }

        var bugBtn = document.getElementById('bug-btn');
        if (bugBtn) {
            bugBtn.addEventListener('click', function () {
                var msg = prompt('🐛 Was ist kaputt?');
                if (msg) reportBug(msg, showToastFn);
            });
        }

        // Testmodus aktivieren wenn ?test in URL oder localStorage
        if (window.location.search.includes('test') || localStorage.getItem('insel-testmode')) {
            if (testdataBtn) testdataBtn.style.display = '';
            if (bugBtn) bugBtn.style.display = '';
            localStorage.setItem('insel-testmode', '1');
        }

        // Ping bei Session-Ende
        window.addEventListener('beforeunload', pingWebhook);
    }

    // --- Exports ---
    var analytics = {
        getAnalytics: getAnalytics,
        trackEvent: trackEvent,
        trackSession: trackSession,
        assignABTest: assignABTest,
        startSessionClock: startSessionClock,
        recordMilestone: recordMilestone,
        getSessionClock: getSessionClock,
        getAnonId: getAnonId,
        collectTestData: collectTestData,
        reportBug: reportBug,
        initTestUI: initTestUI,
        setGameStatsFn: function (fn) { gameStatsFn = fn; },
    };

    // INSEL-Namespace
    if (window.INSEL) {
        window.INSEL.register('analytics', analytics);
    }

    // Globale Kompatibilität (chat.js, game.js)
    window.trackEvent = trackEvent;
    window.recordMilestone = recordMilestone;
    window.startSessionClock = startSessionClock;
    window.reportBug = reportBug;
    window.INSEL_ANALYTICS = analytics;
})();
