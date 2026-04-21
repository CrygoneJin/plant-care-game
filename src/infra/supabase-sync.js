// === SUPABASE-SYNC — Cloud-Save (Opt-In, debounced) ===
// Schatzinsel ist offline-first. Cloud-Sync ist zusatz, nie Pflicht.
//
// Aktivierung (eins von beiden):
//   localStorage.setItem('insel-cloud-sync', '1')
//   window.INSEL_CONFIG = { cloudSync: true, cloudSyncUrl: 'https://...' }
//
// Device-ID wird einmalig in localStorage erzeugt (insel-device-id).
// Kein Login, keine Namen, keine PII — nur die opake Device-ID.
//
// Window-API: window.INSEL_SUPA
(function () {
    'use strict';

    var DEVICE_KEY = 'insel-device-id';
    var NAME_KEY = 'insel-player-name';
    var ENABLED_KEY = 'insel-cloud-sync';
    var DEFAULT_URL = 'https://schatzinsel.hoffmeyer-zlotnik.workers.dev';
    var DEBOUNCE_MS = 3000;

    var _pushTimer = null;
    var _lastHash = '';
    var _inFlight = false;

    function cfg() { return window.INSEL_CONFIG || {}; }

    function isEnabled() {
        if (cfg().cloudSync === true) return true;
        try { return localStorage.getItem(ENABLED_KEY) === '1'; }
        catch (_) { return false; }
    }

    function setEnabled(on) {
        try {
            if (on) localStorage.setItem(ENABLED_KEY, '1');
            else localStorage.removeItem(ENABLED_KEY);
        } catch (_) { /* private-mode */ }
    }

    function getUrl() {
        return (cfg().cloudSyncUrl || DEFAULT_URL).replace(/\/+$/, '');
    }

    function getDeviceId() {
        try {
            var id = localStorage.getItem(DEVICE_KEY);
            if (id && id.length >= 6) return id;
            id = 'dev-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
            localStorage.setItem(DEVICE_KEY, id);
            return id;
        } catch (_) {
            return 'dev-session-' + Math.random().toString(36).slice(2, 10);
        }
    }

    function getPlayerName() {
        try { return localStorage.getItem(NAME_KEY) || ''; }
        catch (_) { return ''; }
    }

    function setPlayerName(name) {
        try { localStorage.setItem(NAME_KEY, String(name || '').slice(0, 64)); }
        catch (_) { /* noop */ }
    }

    // Greift auf window.INSEL_SAVE-Kontext zu wenn vorhanden,
    // sonst auf localStorage-Autosave-Entry.
    function buildPayload(ctx) {
        var payload = {
            client_ts: Date.now(),
            version: 1,
        };
        if (ctx && typeof ctx.getGrid === 'function') {
            try {
                var grid = ctx.getGrid();
                payload.grid = grid || [];
                payload.inventory = ctx.getInventory ? ctx.getInventory() : {};
                payload.treeGrowth = ctx.getTreeGrowth ? ctx.getTreeGrowth() : {};
                payload.unlocked = ctx.getUnlockedMaterials
                    ? Array.from(ctx.getUnlockedMaterials()) : [];
                payload.discovered = ctx.getDiscoveredRecipes
                    ? Array.from(ctx.getDiscoveredRecipes()) : [];
                payload.playerPos = ctx.getPlayerPos ? ctx.getPlayerPos() : null;
            } catch (_) { /* partial payload ok */ }
        } else {
            // Fallback: direkt aus localStorage lesen
            try {
                var projects = JSON.parse(localStorage.getItem('insel-projekte') || '{}');
                var auto = projects['~autosave~'];
                if (auto) {
                    payload.grid = auto.grid || [];
                    payload.inventory = auto.inventory || {};
                    payload.treeGrowth = auto.treeGrowth || {};
                    payload.unlocked = auto.unlocked || [];
                    payload.discovered = auto.discovered || [];
                    payload.playerPos = auto.playerPos || null;
                }
            } catch (_) { /* noop */ }
        }
        var grid = payload.grid || [];
        var count = 0;
        for (var r = 0; r < grid.length; r++) {
            var row = grid[r] || [];
            for (var c = 0; c < row.length; c++) {
                if (row[c]) count++;
            }
        }
        payload.blocks_count = count;
        return payload;
    }

    function hashPayload(payload) {
        try { return JSON.stringify(payload.grid || []); }
        catch (_) { return String(Date.now()); }
    }

    function pushNow(ctx, opts) {
        if (_inFlight) return Promise.resolve({ skipped: 'in_flight' });
        if (!isEnabled() && !(opts && opts.force)) {
            return Promise.resolve({ skipped: 'disabled' });
        }
        var payload = buildPayload(ctx);
        var h = hashPayload(payload);
        if (!(opts && opts.force) && h === _lastHash) {
            return Promise.resolve({ skipped: 'unchanged' });
        }
        var body = {
            device_id: getDeviceId(),
            name: getPlayerName() || null,
            slot: (opts && opts.slot) || 'autosave',
            payload: payload,
        };
        _inFlight = true;
        return fetch(getUrl() + '/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        }).then(function (res) {
            return res.json().catch(function () { return { error: 'invalid-json' }; });
        }).then(function (data) {
            if (data && data.ok) _lastHash = h;
            return data;
        }).catch(function (e) {
            return { error: String(e && e.message || e) };
        }).finally(function () {
            _inFlight = false;
        });
    }

    // Debounced autosave push — safe to spam.
    function pushAutosave(ctx) {
        if (!isEnabled()) return;
        if (_pushTimer) clearTimeout(_pushTimer);
        _pushTimer = setTimeout(function () {
            _pushTimer = null;
            pushNow(ctx, { slot: 'autosave' });
        }, DEBOUNCE_MS);
    }

    function pushManual(ctx, slot) {
        return pushNow(ctx, { slot: slot || 'manual', force: true });
    }

    function pullLatest(slot) {
        var url = getUrl() + '/save?device_id=' + encodeURIComponent(getDeviceId())
            + '&slot=' + encodeURIComponent(slot || 'autosave');
        return fetch(url).then(function (r) { return r.json(); })
            .catch(function (e) { return { error: String(e && e.message || e) }; });
    }

    function listSaves() {
        var url = getUrl() + '/save/list?device_id=' + encodeURIComponent(getDeviceId());
        return fetch(url).then(function (r) { return r.json(); })
            .catch(function (e) { return { error: String(e && e.message || e) }; });
    }

    window.INSEL_SUPA = {
        isEnabled: isEnabled,
        setEnabled: setEnabled,
        getDeviceId: getDeviceId,
        getPlayerName: getPlayerName,
        setPlayerName: setPlayerName,
        buildPayload: buildPayload,
        pushAutosave: pushAutosave,
        pushManual: pushManual,
        pullLatest: pullLatest,
        listSaves: listSaves,
    };
})();
