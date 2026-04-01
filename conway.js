// conway.js — Evolution-Screensaver (Conway's Game of Life auf der Insel)
// Abhängigkeiten: bus.js (window.INSEL_BUS), game.js (window.grid, window.INSEL_DIMS, window.requestRedraw)

(function () {
    'use strict';

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const bus = window.INSEL_BUS;

    // Terrain-Kreaturen
    const CONWAY_WATER   = ['🐟','🐠','🐡','🦑','🪼','🐙','🦐','🐬','🐳'];
    const CONWAY_BEACH   = ['🦀','🐚','🐸','🦎','🦭','🦞','🐊'];
    const CONWAY_LAND    = ['🦋','🐝','🐛','🐇','🦔','🐿️','🌸','🍄','🦜','🦊'];
    const CONWAY_MIGRANT = ['🐋','🦅','🐦‍⬛','🦢']; // erscheinen überall, kurz

    // State
    let conwayOverlay  = null; // 2D String-Array ('' = leer, sonst Emoji)
    let conwayInterval = null;
    let conwayFading   = false;
    let lastInteraction = Date.now();
    const CONWAY_IDLE_MS   = 30000;
    const AMBIENT_IDLE_MS  = 10000; // Stille-Momente nach 10s Idle (#57)

    // Lazy-Accessor — game.js muss window.INSEL_DIMS gesetzt haben
    function dims() { return window.INSEL_DIMS || { ROWS: 18, COLS: 32 }; }
    function redraw() { if (typeof window.requestRedraw === 'function') window.requestRedraw(); }

    function conwayZone(r, c) {
        const { ROWS, COLS } = dims();
        if (r < 2 || r >= ROWS - 2 || c < 2 || c >= COLS - 2) return 'water';
        if (r === 2 || r === ROWS - 3 || c === 2 || c === COLS - 3) return 'beach';
        return 'land';
    }

    function conwayCreature(r, c) {
        if (Math.random() < 0.04) return CONWAY_MIGRANT[Math.floor(Math.random() * CONWAY_MIGRANT.length)];
        const zone = conwayZone(r, c);
        const pool = zone === 'water' ? CONWAY_WATER : zone === 'beach' ? CONWAY_BEACH : CONWAY_LAND;
        return pool[Math.floor(Math.random() * pool.length)];
    }

    function startConway() {
        const { ROWS, COLS } = dims();
        const grid = window.grid;
        if (conwayInterval || prefersReducedMotion || !grid) return;
        conwayFading = false;
        conwayOverlay = Array.from({ length: ROWS }, () => Array(COLS).fill(''));
        for (let r = 0; r < ROWS; r++)
            for (let c = 0; c < COLS; c++)
                if (grid[r][c] === null && Math.random() < 0.18)
                    conwayOverlay[r][c] = conwayCreature(r, c);
        conwayInterval = setInterval(conwayStep, 650);
        bus && bus.emit('idle:start');
    }

    function conwayStep() {
        const { ROWS, COLS } = dims();
        const grid = window.grid;
        if (!conwayOverlay || conwayFading || !grid) return;
        const next = Array.from({ length: ROWS }, () => Array(COLS).fill(''));
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                if (grid[r][c] !== null) continue; // Materialien unberührt
                let alive = 0;
                for (let dr = -1; dr <= 1; dr++)
                    for (let dc = -1; dc <= 1; dc++)
                        if ((dr || dc) && conwayOverlay[r + dr]?.[c + dc]) alive++;
                const cur = conwayOverlay[r][c] !== '';
                const isMigrant = cur && CONWAY_MIGRANT.includes(conwayOverlay[r][c]);
                if (cur) {
                    next[r][c] = (alive >= 2 && alive <= 4 && !(isMigrant && Math.random() < 0.35))
                        ? conwayOverlay[r][c] : '';
                } else {
                    if (alive === 3 || (alive >= 1 && Math.random() < 0.008))
                        next[r][c] = conwayCreature(r, c);
                }
            }
        }
        conwayOverlay = next;
        redraw();
    }

    function fadeConway() {
        const { ROWS, COLS } = dims();
        if (!conwayOverlay) return;
        conwayFading = true;
        clearInterval(conwayInterval);
        conwayInterval = null;
        const fade = setInterval(() => {
            if (!conwayOverlay) { clearInterval(fade); return; }
            let left = 0;
            for (let r = 0; r < ROWS; r++)
                for (let c = 0; c < COLS; c++)
                    if (conwayOverlay[r][c] && Math.random() < 0.12) conwayOverlay[r][c] = '';
            for (let r = 0; r < ROWS; r++)
                for (let c = 0; c < COLS; c++)
                    if (conwayOverlay[r][c]) left++;
            redraw();
            if (left === 0) { clearInterval(fade); conwayOverlay = null; conwayFading = false; redraw(); }
        }, 120);
    }

    function stopConway() {
        clearInterval(conwayInterval);
        conwayInterval = null;
        conwayOverlay = null;
        conwayFading = false;
        redraw();
    }

    function resetIdleTimer() {
        lastInteraction = Date.now();
        if (conwayOverlay) fadeConway(); // sanfter Abschied statt sofort weg
        if (window.INSEL_SOUND) window.INSEL_SOUND.stopAmbient();
        bus && bus.emit('idle:end');
    }

    // Idle-Poller
    setInterval(() => {
        const idle = Date.now() - lastInteraction;
        if (!conwayInterval && !conwayFading && idle > CONWAY_IDLE_MS) startConway();
        if (idle > AMBIENT_IDLE_MS && window.INSEL_SOUND) window.INSEL_SOUND.playAmbient();
    }, 5000);

    // Overlay-Zugriff für game.js draw-Loop
    function getOverlay() { return conwayOverlay; }

    // Window-Exports für Kompatibilität und draw-Loop
    window.startConway    = startConway;
    window.stopConway     = stopConway;
    window.resetIdleTimer = resetIdleTimer;
    window.INSEL_CONWAY   = { getOverlay };

})();
