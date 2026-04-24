// === IDB-BACKUP — Tesla-Persistenz-Schutz ===
// Warum: In PR #488 wurde beobachtet dass Tesla-Chromium localStorage
// zwischen Fahrten wischt. Oscars blocksPlaced=0 jeden Morgen.
//
// Strategie: Snapshot-Pattern. Alle insel-* Keys aus localStorage
// werden alle 30s + auf beforeunload in einen einzigen IDB-Record
// kopiert. Beim Start: wenn localStorage leer aber IDB-Snapshot da
// ist → restoren → location.reload().
//
// KEIN Refactor der 60+ direkten localStorage-Calls. Minimal-invasiv.
//
// Hebel gegen Chromium-Bucket-Eviction: navigator.storage.persist().
// Ohne das ist IDB genauso flüchtig wie localStorage.

(function () {
    'use strict';

    var DB_NAME = 'insel-backup';
    var DB_VERSION = 1;
    var STORE = 'snapshots';
    var SNAPSHOT_KEY = 'main';
    var SNAPSHOT_INTERVAL_MS = 30000; // 30s
    var MAX_AGE_DAYS = 30;
    var PREFIX = 'insel-';
    // sessionStorage-Guard damit ein defekter Restore keine Schleife baut
    var RELOAD_FLAG = 'insel-idb-restored';

    // --- IndexedDB-Primitives -----------------------------------------

    function openDB() {
        return new Promise(function (resolve, reject) {
            var req = indexedDB.open(DB_NAME, DB_VERSION);
            req.onupgradeneeded = function () {
                var db = req.result;
                if (!db.objectStoreNames.contains(STORE)) {
                    db.createObjectStore(STORE);
                }
            };
            req.onsuccess = function () { resolve(req.result); };
            req.onerror = function () { reject(req.error); };
        });
    }

    function idbGet(key) {
        return openDB().then(function (db) {
            return new Promise(function (resolve, reject) {
                var tx = db.transaction(STORE, 'readonly');
                var req = tx.objectStore(STORE).get(key);
                req.onsuccess = function () { resolve(req.result); };
                req.onerror = function () { reject(req.error); };
            });
        });
    }

    function idbPut(key, value) {
        return openDB().then(function (db) {
            return new Promise(function (resolve, reject) {
                var tx = db.transaction(STORE, 'readwrite');
                tx.objectStore(STORE).put(value, key);
                tx.oncomplete = function () { resolve(); };
                tx.onerror = function () { reject(tx.error); };
            });
        });
    }

    function idbClear() {
        return openDB().then(function (db) {
            return new Promise(function (resolve, reject) {
                var tx = db.transaction(STORE, 'readwrite');
                tx.objectStore(STORE).clear();
                tx.oncomplete = function () { resolve(); };
                tx.onerror = function () { reject(tx.error); };
            });
        });
    }

    // --- Snapshot-Logik ----------------------------------------------

    function collectLocalStorage() {
        var data = {};
        try {
            for (var i = 0; i < localStorage.length; i++) {
                var key = localStorage.key(i);
                if (key && key.indexOf(PREFIX) === 0) {
                    data[key] = localStorage.getItem(key);
                }
            }
        } catch (e) { /* quota / access errors */ }
        return data;
    }

    function writeSnapshot() {
        var data = collectLocalStorage();
        // Nur schreiben wenn echter Content da ist (Spieler hat was getan)
        var hasProjekte = data['insel-projekte'];
        if (!hasProjekte || hasProjekte === '{}') return Promise.resolve(false);

        var snapshot = {
            ts: Date.now(),
            persistGranted: window.__inselPersistGranted === true,
            data: data,
        };
        return idbPut(SNAPSHOT_KEY, snapshot).then(function () { return true; })
            .catch(function () { return false; });
    }

    function restoreIfWiped() {
        // Schleifen-Schutz: wenn dieser Tab schon reloaded wurde nach Restore,
        // nicht noch mal versuchen.
        try {
            if (sessionStorage.getItem(RELOAD_FLAG) === '1') {
                sessionStorage.removeItem(RELOAD_FLAG);
                return Promise.resolve({ restored: false, reason: 'already-reloaded' });
            }
        } catch (e) { /* sessionStorage kann auch failen */ }

        // Wenn localStorage noch was hat, kein Restore nötig
        var hasData = false;
        try {
            hasData = localStorage.getItem('insel-projekte') !== null;
        } catch (e) { hasData = true; /* im Zweifel nix tun */ }
        if (hasData) return Promise.resolve({ restored: false, reason: 'ls-has-data' });

        return idbGet(SNAPSHOT_KEY).then(function (snap) {
            if (!snap || !snap.data) return { restored: false, reason: 'no-snapshot' };

            // Alter-Check: verhindert dass eine uralte Insel zurückkommt
            var ageMs = Date.now() - (snap.ts || 0);
            var maxAge = MAX_AGE_DAYS * 24 * 60 * 60 * 1000;
            if (ageMs > maxAge) {
                return { restored: false, reason: 'snapshot-too-old', ageDays: Math.round(ageMs / 86400000) };
            }

            // Restore schreiben
            var written = 0;
            try {
                Object.keys(snap.data).forEach(function (key) {
                    localStorage.setItem(key, snap.data[key]);
                    written++;
                });
            } catch (e) {
                return { restored: false, reason: 'ls-write-failed', error: String(e) };
            }

            // Reload-Flag + Reload
            try { sessionStorage.setItem(RELOAD_FLAG, '1'); } catch (e) {}
            return { restored: true, keys: written, ageDays: Math.round(ageMs / 86400000) };
        }).catch(function (e) {
            return { restored: false, reason: 'idb-get-failed', error: String(e) };
        });
    }

    // --- Persistent-Storage-Hebel ------------------------------------

    function requestPersist() {
        if (!navigator.storage || !navigator.storage.persist) {
            window.__inselPersistGranted = false;
            return Promise.resolve(false);
        }
        // Erst checken ob schon granted
        var checkPromise = navigator.storage.persisted
            ? navigator.storage.persisted()
            : Promise.resolve(false);
        return checkPromise.then(function (already) {
            if (already) {
                window.__inselPersistGranted = true;
                return true;
            }
            return navigator.storage.persist().then(function (granted) {
                window.__inselPersistGranted = !!granted;
                return !!granted;
            });
        }).catch(function () {
            window.__inselPersistGranted = false;
            return false;
        });
    }

    // --- Bootstrapping ------------------------------------------------

    // Sofort: persist anfragen (parallel zum Restore)
    var persistPromise = requestPersist();

    // Sofort: Restore-Promise exposen. Die Seite läuft parallel weiter;
    // wenn ein Reload nötig ist, passiert er bevor Oscar das Game anfasst.
    window.INSEL_IDB_READY = restoreIfWiped().then(function (result) {
        // Log in die Konsole — Till kann bei Tesla-Check das DevTools-Log
        // checken (auch wenn localStorage gewiped ist, console bleibt).
        try { console.log('[IDB-Backup] Restore:', result); } catch (e) {}
        if (result.restored) {
            // Kurzer Delay damit etwaige Logs rausgehen
            setTimeout(function () {
                try { location.reload(); } catch (e) {}
            }, 50);
        }
        return result;
    });

    // Persist-Ergebnis loggen (nach Restore — der Wipe hat ggf. alte Logs gekillt)
    persistPromise.then(function (granted) {
        try { console.log('[IDB-Backup] navigator.storage.persist() →', granted); } catch (e) {}
    });

    // Periodischer Snapshot alle 30s
    var snapshotTimer = null;
    function startSnapshotLoop() {
        if (snapshotTimer) return;
        snapshotTimer = setInterval(function () { writeSnapshot(); }, SNAPSHOT_INTERVAL_MS);
    }

    // Auf beforeunload: letzten Snapshot schreiben. writeSnapshot ist async,
    // aber IDB-Transactions dürfen beforeunload starten — die meisten Browser
    // warten kurz. Kein Blocker, nur Best-Effort.
    window.addEventListener('beforeunload', function () { writeSnapshot(); });

    // Snapshot-Loop starten sobald DOM bereit — erst dann hat das Game
    // vermutlich initialen State gespeichert
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startSnapshotLoop);
    } else {
        startSnapshotLoop();
    }

    // --- Öffentliche API (für save.js und Tests) ---------------------

    window.INSEL_IDB = {
        // Manuell Snapshot schreiben (z.B. nach manuellem Save)
        snapshot: writeSnapshot,
        // Snapshot holen (für Debugging)
        getSnapshot: function () { return idbGet(SNAPSHOT_KEY); },
        // Snapshot löschen — wird von save.js/newProject aufgerufen
        clear: idbClear,
        // Ready-Promise (nach Restore-Entscheidung)
        ready: window.INSEL_IDB_READY,
        // Konstanten für Tests
        _constants: { DB_NAME: DB_NAME, STORE: STORE, SNAPSHOT_KEY: SNAPSHOT_KEY },
    };
})();
