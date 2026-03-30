// === GYRO-STEUERUNG — Handy neigen, Schiff steuern ===
// Wenn der Spieler auf einem Boot steht: Handy kippen = segeln.
// DeviceOrientation API → funktioniert auf iPhone, Android, Tablets.

(function () {
    'use strict';

    let gyroActive = false;
    let gyroPermission = false; // iOS 13+ braucht explizite Erlaubnis
    let sailing = false;
    let lastMoveTime = 0;
    const MOVE_COOLDOWN = 300; // ms zwischen Bewegungen (sonst zu schnell)
    const TILT_THRESHOLD = 15; // Grad Neigung bevor was passiert

    // Aktuelle Neigung
    let tiltX = 0; // Links/Rechts (gamma)
    let tiltY = 0; // Vor/Zurück (beta)

    // --- Permission (iOS 13+ verlangt Nutzer-Geste) ---
    async function requestPermission() {
        if (typeof DeviceOrientationEvent === 'undefined') return false;

        // iOS 13+: explizite Permission nötig
        if (typeof DeviceOrientationEvent.requestPermission === 'function') {
            try {
                const result = await DeviceOrientationEvent.requestPermission();
                gyroPermission = result === 'granted';
                return gyroPermission;
            } catch (_) {
                return false;
            }
        }

        // Android/ältere iOS: keine Permission nötig
        gyroPermission = true;
        return true;
    }

    // --- Orientation Handler ---
    function handleOrientation(e) {
        if (!sailing) return;

        // beta = Vor/Zurück Neigung (-180 bis 180, 0 = flach)
        // gamma = Links/Rechts Neigung (-90 bis 90)
        tiltX = e.gamma || 0; // Links (-) / Rechts (+)
        tiltY = e.beta || 0;  // Vor (-) / Zurück (+)

        // Nur bewegen wenn Neigung stark genug
        const now = Date.now();
        if (now - lastMoveTime < MOVE_COOLDOWN) return;

        let dr = 0, dc = 0;

        if (tiltY < -TILT_THRESHOLD) dr = -1;       // Nach vorne kippen = hoch
        else if (tiltY > TILT_THRESHOLD + 30) dr = 1; // Zurück kippen = runter (Offset weil Handy ~30° gehalten wird)

        if (tiltX < -TILT_THRESHOLD) dc = -1;       // Links kippen
        else if (tiltX > TILT_THRESHOLD) dc = 1;     // Rechts kippen

        if (dr === 0 && dc === 0) return;

        // Nur auf Wasser bewegen (Schiff segelt!)
        const pos = window.playerPos?.();
        if (!pos) return;
        const grid = window.grid;
        if (!grid) return;

        const nr = pos.r + dr;
        const nc = pos.c + dc;

        // Prüfen ob Zielfeld Wasser ist oder Boot
        if (nr >= 0 && nr < grid.length && nc >= 0 && nc < grid[0].length) {
            const target = grid[nr][nc];
            if (target === 'water' || target === 'boat' || target === 'fish' || target === null) {
                // Segeln!
                if (window.movePlayer) {
                    window.movePlayer(dr, dc);
                    lastMoveTime = now;

                    // Wellen-Effekt auf alter Position
                    if (window.applyToolAt && target === null) {
                        // Hinterlasse Wasserspritzer (kurz)
                    }
                }
            } else {
                // Land erreicht → Anlegen!
                stopSailing();
                if (window.movePlayer) window.movePlayer(dr, dc);
                if (window.showToast) window.showToast('⚓ Angelegt! Kippen zum Segeln auf Booten.');
            }
        }
    }

    // --- Segel-Modus starten/stoppen ---
    function startSailing() {
        if (sailing) return;
        if (!gyroPermission) return;

        sailing = true;
        window.addEventListener('deviceorientation', handleOrientation);

        if (window.showToast) {
            window.showToast('⛵ Segel gesetzt! Kippe das Handy zum Steuern!');
        }
    }

    function stopSailing() {
        sailing = false;
        window.removeEventListener('deviceorientation', handleOrientation);
    }

    // --- Auto-Detect: Spieler betritt Boot → Segeln starten ---
    // Auf Touch + Gyro: Neigen steuert. Auf Desktop: Pfeiltasten steuern wie immer.
    // Der Spieler merkt nur dass er plötzlich übers Wasser gleiten kann.
    let onWater = false;

    function checkSailingTrigger() {
        const pos = window.playerPos?.();
        if (!pos) return;
        const grid = window.grid;
        if (!grid) return;

        const cell = grid[pos.r]?.[pos.c];
        const isWaterCell = cell === 'boat' || cell === 'water' || cell === 'fish';
        const wasOnWater = onWater;
        onWater = isWaterCell;

        // Gyro-Geräte: Neigung aktivieren
        if (isWaterCell && !sailing && gyroPermission) {
            startSailing();
        } else if (!isWaterCell && sailing) {
            stopSailing();
        }

        // Desktop/kein Gyro: Nur visuelles Feedback (kein Unterschied in Steuerung)
        // Spieler bewegt sich auf Wasser genauso wie auf Land — Pfeiltasten funktionieren.
        // Aber: Toast beim ersten Betreten, Kompass-Emoji, Wellen-Feeling
        if (isWaterCell && !wasOnWater && !gyroPermission) {
            if (window.showToast) window.showToast('⛵ Du segelst! Steuere mit den Pfeiltasten.');
        }
    }

    // Alle 500ms prüfen ob Spieler auf Boot/Wasser steht
    setInterval(checkSailingTrigger, 500);

    // iOS Permission bei erstem Boot-Kontakt erfragen (braucht User-Geste)
    // Wir hängen uns an den nächsten Touch auf dem Canvas
    let permissionRequested = false;
    function requestOnFirstBoat() {
        if (permissionRequested || gyroPermission) return;
        if (!onWater) return;
        permissionRequested = true;

        const canvas = document.getElementById('game-canvas');
        if (!canvas) return;

        function onTouch() {
            canvas.removeEventListener('touchstart', onTouch);
            requestPermission().then(ok => {
                if (ok && onWater) startSailing();
            });
        }
        canvas.addEventListener('touchstart', onTouch, { once: true });
    }

    // Prüfe bei jedem Sailing-Check ob wir Permission anfragen sollten
    const _origCheck = checkSailingTrigger;
    // setInterval ruft checkSailingTrigger auf — wir hängen uns dran
    setInterval(requestOnFirstBoat, 1000);

    // --- Kompass-Anzeige (optional, zeigt Neigungsrichtung) ---
    function createCompass() {
        const compass = document.createElement('div');
        compass.id = 'gyro-compass';
        compass.style.cssText = `
            display: none; position: fixed; top: 80px; right: 12px; z-index: 999;
            width: 60px; height: 60px; border-radius: 50%;
            background: rgba(0,0,0,0.5); border: 2px solid rgba(255,255,255,0.3);
            color: white; font-size: 24px; text-align: center; line-height: 56px;
        `;
        compass.textContent = '🧭';
        document.body.appendChild(compass);
        return compass;
    }

    let compassEl = null;

    function updateCompass() {
        if (!sailing) {
            if (compassEl) compassEl.style.display = 'none';
            return;
        }
        if (!compassEl) compassEl = createCompass();
        compassEl.style.display = 'block';

        // Pfeil-Richtung basierend auf Neigung
        let arrow = '🧭';
        if (tiltY < -TILT_THRESHOLD) arrow = '⬆️';
        else if (tiltY > TILT_THRESHOLD + 30) arrow = '⬇️';
        if (tiltX < -TILT_THRESHOLD) arrow = '⬅️';
        else if (tiltX > TILT_THRESHOLD) arrow = '➡️';
        compassEl.textContent = arrow;
    }

    setInterval(updateCompass, 200);

    // --- Public API ---
    window.Gyro = {
        requestPermission: requestPermission,
        startSailing: startSailing,
        stopSailing: stopSailing,
        get sailing() { return sailing; },
        get hasGyro() { return typeof DeviceOrientationEvent !== 'undefined'; },
        get permitted() { return gyroPermission; },
        get tilt() { return { x: tiltX, y: tiltY }; },
    };

})();
