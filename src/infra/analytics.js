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

        // Crafting-Erfolge in den Buffer feeden (opt-in-gated innerhalb bufferCount)
        if (event === 'craft' || event === 'quick-craft' || event === 'llm-craft') {
            const recipe = (data && (data.recipe || data.name || data.result)) || 'unknown';
            bufferCount('crafts', recipe);
        }
    }

    // --- Opt-in-Gate für feingranulare Analytics ---
    // Session-Grundstats (aggregiert, PII-frei) laufen wie gehabt.
    // Material-/NPC-Granularität NUR wenn Till das Flag setzt.
    function isAnalyticsOptIn() {
        try {
            return localStorage.getItem('insel-analytics-optin') === '1';
        } catch (_) { return false; }
    }

    function setAnalyticsOptIn(on) {
        try {
            if (on) localStorage.setItem('insel-analytics-optin', '1');
            else localStorage.removeItem('insel-analytics-optin');
        } catch (_) {}
    }

    // --- Aggregations-Buffer (nur aktiv wenn Opt-in) ---
    // In-Memory-Zähler. Werden beim Flush an /metrics/ingest gepusht (in pingWebhook
    // eingebettet, kein separater Endpoint). Flush periodisch + beforeunload.
    const buffer = {
        placements: Object.create(null), // material -> count
        npcTaps:    Object.create(null), // npcId   -> count
        crafts:     Object.create(null), // recipe  -> count
    };

    function resetBuffer() {
        for (const k in buffer.placements) delete buffer.placements[k];
        for (const k in buffer.npcTaps)    delete buffer.npcTaps[k];
        for (const k in buffer.crafts)     delete buffer.crafts[k];
    }

    function bufferCount(bucket, key) {
        if (!isAnalyticsOptIn()) return;            // 0 Bytes verlassen den Browser
        if (!key || typeof key !== 'string') return;
        if (!buffer[bucket]) return;
        // Key-Sanitizing: max 30 chars, nur Wortzeichen/Bindestrich/Unterstrich
        const safe = String(key).slice(0, 30).replace(/[^\w\-]/g, '_');
        if (!safe) return;
        buffer[bucket][safe] = (buffer[bucket][safe] || 0) + 1;
    }

    function getBufferSnapshot() {
        // Pure Snapshot, kein Reset — für Tests und Dashboard-Preview
        return {
            placements: Object.assign({}, buffer.placements),
            npcTaps:    Object.assign({}, buffer.npcTaps),
            crafts:     Object.assign({}, buffer.crafts),
        };
    }

    // Automatische Buffer-Feeds via Event-Bus (wenn verfügbar)
    function wireBufferFeeds() {
        // block:placed → placements[material]++
        if (window.INSEL_BUS && typeof window.INSEL_BUS.on === 'function') {
            window.INSEL_BUS.on('block:placed', function (data) {
                if (data && data.material) bufferCount('placements', data.material);
            });
        }
        // openChat wrappen → npc_tap
        const origOpenChat = window.openChat;
        window.openChat = function (npcId) {
            bufferCount('npcTaps', npcId);
            if (typeof origOpenChat === 'function') return origOpenChat.apply(this, arguments);
        };
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
        start: null,          // Unix-ms (lokal) — für Milestones
        startUnix: null,      // Unix-s  (NTP wenn online) — für duration_s
        firstBlock: null,
        firstChat: null,
        firstCodeView: null,
        firstEasterEgg: null,
    };

    // NTP-Timestamp holen (worldtimeapi.org), Timeout 2s, Fallback: Date.now()
    async function fetchNtpUnixtime() {
        try {
            const controller = new AbortController();
            const tid = setTimeout(() => controller.abort(), 2000);
            const r = await fetch('https://worldtimeapi.org/api/timezone/UTC', { signal: controller.signal });
            clearTimeout(tid);
            if (!r.ok) throw new Error('http ' + r.status);
            const j = await r.json();
            return j.unixtime; // integer, Sekunden seit Epoch
        } catch (_) {
            return Math.floor(Date.now() / 1000);
        }
    }

    function startSessionClock() {
        sessionClock.start = Date.now();
        trackEvent('clock_start', {});
        // NTP-Timestamp async — speichern sobald verfügbar, Fallback bereits gesetzt
        const fallbackUnix = Math.floor(Date.now() / 1000);
        sessionClock.startUnix = fallbackUnix;
        localStorage.setItem('insel-session-start-ts', String(fallbackUnix));
        fetchNtpUnixtime().then(function (unix) {
            sessionClock.startUnix = unix;
            localStorage.setItem('insel-session-start-ts', String(unix));
        });
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
            duration_s: s.startUnix ? Math.round(Date.now() / 1000 - s.startUnix) : (s.start ? Math.round((Date.now() - s.start) / 1000) : 0),
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
            discovery_count: events.filter(e => e.e === 'discovery' || e.e === 'dungeon_level' || e.e === 'easter_egg' || e.e === 'hoerspiel' || e.e === 'code_zauber').length,
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
            // Feingranulare Daten NUR wenn Opt-in gesetzt — sonst null lassen
            const optIn = isAnalyticsOptIn();
            const snap  = optIn ? getBufferSnapshot() : null;
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
                discovery_count: data.discovery_count || 0,
                discovery_craft_ratio: crafts > 0 ? Math.round((data.discovery_count || 0) / crafts * 10) / 10 : null,
                // Opt-in-only Granularität
                session_id:            optIn ? data.id : null,
                placements_by_material: snap ? snap.placements : null,
                npc_taps:               snap ? snap.npcTaps    : null,
                crafting_successes:     snap ? snap.crafts     : null,
            }));
        } catch (e) { /* kein Tracking > kaputtes Tracking */ }
    }

    // --- Periodischer Flush (30s) — nur wenn Opt-in ---
    // Idempotenz: Worker UPSERTed per session_id (siehe handleMetricsIngest).
    // Zwischen Flushes darf der Buffer NICHT resetten, sonst gehen Platzierungen
    // verloren die schon gepingt wurden aber noch nicht aggregiert. Der Worker
    // akzeptiert die immer-komplette Snapshot-View.
    let _flushTimer = null;
    function startPeriodicFlush(intervalMs) {
        if (_flushTimer) return;
        const ms = intervalMs || 30000;
        _flushTimer = setInterval(function () {
            if (!isAnalyticsOptIn()) return;
            try { pingWebhook(); } catch (_) {}
        }, ms);
        // Node-Test-Kontext: unref() damit Node beenden kann. Browser ignoriert es.
        if (_flushTimer && typeof _flushTimer.unref === 'function') {
            _flushTimer.unref();
        }
    }

    function stopPeriodicFlush() {
        if (_flushTimer) { clearInterval(_flushTimer); _flushTimer = null; }
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

        // Granular-Analytics verdrahten (Opt-in-gated innerhalb bufferCount).
        // Bus-Listener + openChat-Wrapper werden immer gesetzt — sie feeden aber
        // nur Daten wenn das Opt-in-Flag aktiv ist. So kann Till im laufenden
        // Spiel opt-in togglen ohne Reload.
        try { wireBufferFeeds(); } catch (_) {}
        // Periodischer Flush. Ist ein No-op ohne Opt-in.
        try { startPeriodicFlush(30000); } catch (_) {}
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
        // Opt-in-API + Buffer (für Tests und Dashboard)
        isAnalyticsOptIn:   isAnalyticsOptIn,
        setAnalyticsOptIn:  setAnalyticsOptIn,
        bufferCount:        bufferCount,
        getBufferSnapshot:  getBufferSnapshot,
        resetBuffer:        resetBuffer,
        wireBufferFeeds:    wireBufferFeeds,
        startPeriodicFlush: startPeriodicFlush,
        stopPeriodicFlush:  stopPeriodicFlush,
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
