// conway.js — Evolution-Screensaver (Conway's Game of Life auf der Insel)
// Abhängigkeiten: bus.js (window.INSEL_BUS), game.js (window.grid, window.INSEL_DIMS, window.requestRedraw)

(function () {
    'use strict';

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const bus = window.INSEL_BUS;

    // Terrain-Kreaturen — klein und stimmig, kein Zoo
    const CONWAY_WATER   = ['🐟','🐠','🦀'];
    const CONWAY_BEACH   = ['🦀','🐚','🐸'];
    const CONWAY_LAND    = ['🦋','🐝','🌸'];
    const CONWAY_MIGRANT = ['🦅','🦢']; // erscheinen überall, kurz

    // Raubtiere — verscheuchen Beute, fressen nicht (kindgerecht)
    // Beute-Emoji flieht, Raubtier zieht allein weiter
    const PREDATORS = {
        '🦊': { habitat: 'land',  hunts: new Set(['🦋','🐝','🌸','🐸']) },
        '🦈': { habitat: 'water', hunts: new Set(['🐟','🐠']) },
        '🦉': { habitat: 'any',   hunts: new Set(['🦋','🐝','🌸','🐸','🦀']) },
    };
    const PREDATOR_EMOJIS = Object.keys(PREDATORS);
    // Toast wenn Raubtier auftaucht
    const PREDATOR_TOAST = {
        '🦊': '🦊 Ein Fuchs schleicht über die Insel!',
        '🦈': '🦈 Ein Hai kreist im Wasser!',
        '🦉': '🦉 Eine Eule wacht über die Insel!',
    };

    // State
    let conwayOverlay  = null; // 2D String-Array ('' = leer, sonst Emoji)
    let conwayInterval = null;
    let conwayFading   = false;
    let lastInteraction = Date.now();
    const CONWAY_IDLE_MS   = 120000; // 2 Minuten Idle → Screensaver
    // Oscar-Feedback (2026-04-19): Insel-Musik vermisst. #57 Stille-Spec
    // aufgeweicht — Ambient startet schon nach 3s und läuft durch.
    const AMBIENT_IDLE_MS  = 3000;

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

    // ============================================================
    // === GAMEPLAY-INTEGRATION: Muster-Erkennung & Events ========
    // ============================================================

    // Generationszähler pro Zelle — für "3+ Generationen stabil"
    let cellStableCount = null; // 2D-Array: wie viele Generationen war diese Zelle durchgehend lebendig

    // Glider-Tracking: Zellen die sich bewegt haben
    let prevCells = null; // Set von "r,c"-Strings der lebendigen Zellen aus dem letzten Schritt
    let gliderCooldown = 0;  // Schritte bis nächster Glider-Event erlaubt
    let bloomCooldown  = 0;  // Schritte bis nächster Bloom-Event erlaubt
    let stoneCooldown  = 0;  // Schritte bis nächster Stone-Event erlaubt

    function initGameplayTracking(ROWS, COLS) {
        cellStableCount = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
        prevCells = new Set();
        gliderCooldown = 0;
        bloomCooldown  = 0;
        stoneCooldown  = 0;
    }

    // Prüft ob eine 2x2-Region komplett lebendig ist (Still Life Block)
    function findStillLifeBlocks(overlay, ROWS, COLS) {
        const blocks = [];
        for (let r = 0; r < ROWS - 1; r++)
            for (let c = 0; c < COLS - 1; c++)
                if (overlay[r][c] && overlay[r+1][c] && overlay[r][c+1] && overlay[r+1][c+1])
                    blocks.push({ r, c });
        return blocks;
    }

    // Gameplay-Analyse nach jedem Step — gibt Events auf dem Bus aus
    function analyzeGameplay(overlay, nextOverlay, ROWS, COLS) {
        if (!cellStableCount || !bus) return;
        const grid = window.grid;
        if (!grid) return;

        // Cooldowns herunterzählen
        if (gliderCooldown > 0) gliderCooldown--;
        if (bloomCooldown  > 0) bloomCooldown--;
        if (stoneCooldown  > 0) stoneCooldown--;

        const nextCells = new Set();
        for (let r = 0; r < ROWS; r++)
            for (let c = 0; c < COLS; c++)
                if (nextOverlay[r][c]) nextCells.add(r + ',' + c);

        // --- Stabile Zellen: waren UND bleiben lebendig ---
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                if (overlay[r][c] && nextOverlay[r][c]) {
                    cellStableCount[r][c]++;
                } else {
                    cellStableCount[r][c] = 0;
                }
            }
        }

        // --- BLOOM: Zelle seit 3+ Generationen stabil → Blume wächst auf leerer Nachbarzelle ---
        if (bloomCooldown === 0) {
            const bloomCandidates = [];
            for (let r = 2; r < ROWS - 2; r++) {
                for (let c = 2; c < COLS - 2; c++) {
                    if (cellStableCount[r][c] >= 3 && grid[r][c] === null) {
                        const neighbors = [[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[-1,1],[1,-1],[1,1]];
                        for (const [dr, dc] of neighbors) {
                            const nr = r + dr, nc = c + dc;
                            if (nr >= 2 && nr < ROWS-2 && nc >= 2 && nc < COLS-2 && grid[nr][nc] === null && !nextOverlay[nr]?.[nc]) {
                                bloomCandidates.push({ r: nr, c: nc });
                                break;
                            }
                        }
                    }
                }
            }
            if (bloomCandidates.length > 0) {
                const pick = bloomCandidates[Math.floor(Math.random() * bloomCandidates.length)];
                bus.emit('conway:bloom', { r: pick.r, c: pick.c });
                bloomCooldown = 8; // 8 Schritte Pause (~5s)
            }
        }

        // --- STILL LIFE: 2x2-Block stabil (alle 4 Zellen ≥2 Generationen) → Stein ---
        if (stoneCooldown === 0) {
            const blocks = findStillLifeBlocks(nextOverlay, ROWS, COLS);
            const stableBlocks = blocks.filter(({ r, c }) =>
                cellStableCount[r][c] >= 2 && cellStableCount[r+1][c] >= 2 &&
                cellStableCount[r][c+1] >= 2 && cellStableCount[r+1][c+1] >= 2
            );
            if (stableBlocks.length > 0) {
                const blk = stableBlocks[Math.floor(Math.random() * stableBlocks.length)];
                const candidates = [];
                for (let dr = -1; dr <= 2; dr++)
                    for (let dc = -1; dc <= 2; dc++) {
                        if (dr >= 0 && dr <= 1 && dc >= 0 && dc <= 1) continue; // Block selbst überspringen
                        const nr = blk.r + dr, nc = blk.c + dc;
                        if (nr >= 2 && nr < ROWS-2 && nc >= 2 && nc < COLS-2 && grid[nr][nc] === null)
                            candidates.push({ r: nr, c: nc });
                    }
                if (candidates.length > 0) {
                    const pick = candidates[Math.floor(Math.random() * candidates.length)];
                    bus.emit('conway:stone', { r: pick.r, c: pick.c, blockR: blk.r, blockC: blk.c });
                    stoneCooldown = 12; // ~8s Pause
                }
            }
        }

        // --- GLIDER: Zellen bewegen sich (hohe Mobilität, stabile Population) → Wolke ---
        if (gliderCooldown === 0 && prevCells.size > 0) {
            const departed = [...prevCells].filter(k => !nextCells.has(k)).length;
            const arrived  = [...nextCells].filter(k => !prevCells.has(k)).length;
            const total    = Math.max(prevCells.size, nextCells.size) || 1;
            const mobility = (departed + arrived) / 2 / total;
            // Glider-Heuristik: >35% der Zellen bewegt, Population stabil (±20%)
            const popRatio = nextCells.size / (prevCells.size || 1);
            if (mobility > 0.35 && popRatio > 0.8 && popRatio < 1.25 && nextCells.size >= 3) {
                const movers = [...nextCells].filter(k => !prevCells.has(k));
                if (movers.length >= 2) {
                    const positions = movers.map(k => { const [r,c] = k.split(',').map(Number); return {r,c}; });
                    const avgR = Math.round(positions.reduce((s,p) => s+p.r, 0) / positions.length);
                    const avgC = Math.round(positions.reduce((s,p) => s+p.c, 0) / positions.length);
                    bus.emit('conway:glider', { r: avgR, c: avgC, size: nextCells.size });
                    gliderCooldown = 6; // ~4s Pause
                }
            }
        }

        prevCells = nextCells;
    }

    // Spezies-Gruppen für Schwarmerkennung
    const SPECIES_GROUP = {
        '🐟': 'fish', '🐠': 'fish', '🦀': 'crab',
        '🐚': 'shell', '🐸': 'frog',
        '🦋': 'butterfly', '🐝': 'bee', '🌸': 'flower',
        '🦅': 'bird', '🦢': 'bird',
    };

    // Habitat: wo darf dieses Tier leben?
    const HABITAT = {
        '🐟': 'water', '🐠': 'water', '🦀': 'beach',
        '🐚': 'beach', '🐸': 'beach',
        '🦋': 'land', '🐝': 'land', '🌸': 'land',
        '🦅': 'any', '🦢': 'any',
        '🦊': 'land', '🦈': 'water', '🦉': 'any',
    };

    function habitatOk(emoji, r, c) {
        const h = HABITAT[emoji] || 'land';
        if (h === 'any') return true;
        const z = conwayZone(r, c);
        if (h === 'water') return z === 'water';
        if (h === 'beach') return z === 'water' || z === 'beach';
        return z === 'land' || z === 'beach';
    }

    function isPredator(emoji) { return emoji in PREDATORS; }

    // Findet nächstes Raubtier das diese Spezies jagt, gibt Richtung zurück
    function fleeDir(emoji, r, c, overlay, ROWS, COLS) {
        const fleeRadius = 3;
        let threatR = -1, threatC = -1, minDist = Infinity;
        for (let dr = -fleeRadius; dr <= fleeRadius; dr++) {
            for (let dc = -fleeRadius; dc <= fleeRadius; dc++) {
                if (dr === 0 && dc === 0) continue;
                const nr = r + dr, nc = c + dc;
                if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) continue;
                const n = overlay[nr][nc];
                if (n && isPredator(n) && PREDATORS[n].hunts.has(emoji)) {
                    const d = Math.abs(dr) + Math.abs(dc);
                    if (d < minDist) { minDist = d; threatR = nr; threatC = nc; }
                }
            }
        }
        if (threatR < 0) return null;
        // Flieh weg vom Raubtier
        return [Math.sign(r - threatR), Math.sign(c - threatC)];
    }

    // Boids-Schritt: Kohäsion + Separation + Flucht + Brownsche Bewegung
    function boidMove(emoji, r, c, overlay, grid, ROWS, COLS) {
        const isPred = isPredator(emoji);
        const myGroup = SPECIES_GROUP[emoji] || emoji;
        const radius = isPred ? 5 : 4;

        // Flucht vor Raubtier (höchste Priorität für Beute)
        if (!isPred) {
            const flee = fleeDir(emoji, r, c, overlay, ROWS, COLS);
            if (flee) {
                const dirs = [];
                dirs.push(flee);
                if (flee[0] !== 0) dirs.push([flee[0], 0]);
                if (flee[1] !== 0) dirs.push([0, flee[1]]);
                // auch diagonale Fluchtwege
                dirs.push([flee[0] || (Math.random() < 0.5 ? 1 : -1), flee[1] || (Math.random() < 0.5 ? 1 : -1)]);
                for (const [dr, dc] of dirs) {
                    const nr = r + dr, nc = c + dc;
                    if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS
                        && grid[nr][nc] === null && !overlay[nr][nc]
                        && habitatOk(emoji, nr, nc)) {
                        return [nr, nc];
                    }
                }
            }
        }

        // Raubtier: jagt nächste Beute (bewegt sich Richtung Beute)
        if (isPred) {
            const hunts = PREDATORS[emoji].hunts;
            let nearestR = -1, nearestC = -1, minDist = Infinity;
            for (let dr = -radius; dr <= radius; dr++) {
                for (let dc = -radius; dc <= radius; dc++) {
                    if (dr === 0 && dc === 0) continue;
                    const nr = r + dr, nc = c + dc;
                    if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) continue;
                    if (overlay[nr][nc] && hunts.has(overlay[nr][nc])) {
                        const d = Math.abs(dr) + Math.abs(dc);
                        if (d < minDist) { minDist = d; nearestR = nr; nearestC = nc; }
                    }
                }
            }
            if (nearestR >= 0) {
                const dr = Math.sign(nearestR - r);
                const dc = Math.sign(nearestC - c);
                const candidates = [[dr, dc], [dr, 0], [0, dc]].filter(([a, b]) => a !== 0 || b !== 0);
                for (const [mdr, mdc] of candidates) {
                    const nr = r + mdr, nc = c + mdc;
                    if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS
                        && grid[nr][nc] === null && !overlay[nr][nc]
                        && habitatOk(emoji, nr, nc)) {
                        return [nr, nc];
                    }
                }
            }
            // Raubtier wandert allein (kein Schwarm)
            if (Math.random() < 0.6) {
                const dirs = [[-1,0],[1,0],[0,-1],[0,1]];
                const d = dirs[Math.floor(Math.random() * dirs.length)];
                const nr = r + d[0], nc = c + d[1];
                if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS
                    && grid[nr][nc] === null && !overlay[nr][nc]
                    && habitatOk(emoji, nr, nc)) return [nr, nc];
            }
            return null;
        }

        // Schwarm-Kohäsion und Separation für Beute
        let sumR = 0, sumC = 0, countSame = 0, crowding = 0;
        for (let dr = -radius; dr <= radius; dr++) {
            for (let dc = -radius; dc <= radius; dc++) {
                if (dr === 0 && dc === 0) continue;
                const nr = r + dr, nc = c + dc;
                if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) continue;
                const neighbor = overlay[nr][nc];
                if (!neighbor) continue;
                if (SPECIES_GROUP[neighbor] === myGroup) {
                    sumR += nr; sumC += nc; countSame++;
                    if (Math.abs(dr) <= 1 && Math.abs(dc) <= 1) crowding++;
                }
            }
        }

        if (crowding >= 3) {
            const dirs = [[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[-1,1],[1,-1],[1,1]];
            const free = dirs.filter(([dr, dc]) => {
                const nr = r + dr, nc = c + dc;
                return nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS
                    && grid[nr][nc] === null && !overlay[nr][nc]
                    && habitatOk(emoji, nr, nc);
            });
            if (free.length > 0) {
                const [dr, dc] = free[Math.floor(Math.random() * free.length)];
                return [r + dr, c + dc];
            }
            return null;
        }

        if (countSame > 0) {
            const targetR = Math.round(sumR / countSame);
            const targetC = Math.round(sumC / countSame);
            const dr = Math.sign(targetR - r);
            const dc = Math.sign(targetC - c);
            const candidates = [];
            if (dr !== 0 || dc !== 0) candidates.push([dr, dc]);
            if (dr !== 0) candidates.push([dr, 0]);
            if (dc !== 0) candidates.push([0, dc]);
            for (const [mdr, mdc] of candidates) {
                const nr = r + mdr, nc = c + mdc;
                if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS
                    && grid[nr][nc] === null && !overlay[nr][nc]
                    && habitatOk(emoji, nr, nc)) {
                    return [nr, nc];
                }
            }
        }

        // Brownsche Bewegung
        if (Math.random() < 0.4) {
            const dirs = [[-1,0],[1,0],[0,-1],[0,1]];
            const d = dirs[Math.floor(Math.random() * dirs.length)];
            const nr = r + d[0], nc = c + d[1];
            if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS
                && grid[nr][nc] === null && !overlay[nr][nc]
                && habitatOk(emoji, nr, nc)) {
                return [nr, nc];
            }
        }
        return null; // bleibt
    }

    function startConway() {
        const { ROWS, COLS } = dims();
        const grid = window.grid;
        if (conwayInterval || prefersReducedMotion || !grid) return;
        conwayFading = false;
        conwayOverlay = Array.from({ length: ROWS }, () => Array(COLS).fill(''));

        // Tiere in kleinen Gruppen spawnen (je 3-5 gleicher Spezies zusammen)
        const groups = [
            { pool: CONWAY_WATER,  zone: 'water', count: 2 },
            { pool: CONWAY_BEACH,  zone: 'beach', count: 2 },
            { pool: CONWAY_LAND,   zone: 'land',  count: 3 },
        ];
        for (const g of groups) {
            const emoji = g.pool[Math.floor(Math.random() * g.pool.length)];
            let placed = 0, attempts = 0;
            // Ankerpunkt für die Gruppe
            const ar = Math.floor(Math.random() * ROWS);
            const ac = Math.floor(Math.random() * COLS);
            while (placed < g.count && attempts < 80) {
                attempts++;
                const r = Math.max(0, Math.min(ROWS - 1, ar + Math.floor((Math.random() - 0.5) * 4)));
                const c = Math.max(0, Math.min(COLS - 1, ac + Math.floor((Math.random() - 0.5) * 4)));
                if (grid[r][c] === null && !conwayOverlay[r][c] && habitatOk(emoji, r, c)) {
                    conwayOverlay[r][c] = emoji;
                    placed++;
                }
            }
        }
        // 1-2 Migranten
        for (const emoji of CONWAY_MIGRANT) {
            if (Math.random() < 0.5) continue;
            for (let attempt = 0; attempt < 30; attempt++) {
                const r = Math.floor(Math.random() * ROWS);
                const c = Math.floor(Math.random() * COLS);
                if (grid[r][c] === null && !conwayOverlay[r][c]) {
                    conwayOverlay[r][c] = emoji;
                    break;
                }
            }
        }

        // 1 Raubtier — taucht nach 8s auf, verschwindet nach 30s
        setTimeout(() => {
            if (!conwayOverlay) return;
            const pred = PREDATOR_EMOJIS[Math.floor(Math.random() * PREDATOR_EMOJIS.length)];
            for (let attempt = 0; attempt < 50; attempt++) {
                const r = Math.floor(Math.random() * ROWS);
                const c = Math.floor(Math.random() * COLS);
                if (grid[r][c] === null && !conwayOverlay[r][c] && habitatOk(pred, r, c)) {
                    conwayOverlay[r][c] = pred;
                    if (window.showToast) window.showToast(PREDATOR_TOAST[pred]);
                    // Verschwindet nach 25-35s
                    setTimeout(() => {
                        if (!conwayOverlay) return;
                        for (let rr = 0; rr < ROWS; rr++)
                            for (let cc = 0; cc < COLS; cc++)
                                if (conwayOverlay[rr][cc] === pred) conwayOverlay[rr][cc] = '';
                    }, 25000 + Math.random() * 10000);
                    break;
                }
            }
        }, 8000);

        initGameplayTracking(ROWS, COLS);
        conwayInterval = setInterval(conwayStep, 650);
        bus && bus.emit('idle:start');
    }

    function conwayStep() {
        const { ROWS, COLS } = dims();
        const grid = window.grid;
        if (!conwayOverlay || conwayFading || !grid) return;

        // Boids: alle Tiere bewegen sich gleichzeitig (shuffle für Fairness)
        const creatures = [];
        for (let r = 0; r < ROWS; r++)
            for (let c = 0; c < COLS; c++)
                if (conwayOverlay[r][c]) creatures.push([r, c, conwayOverlay[r][c]]);

        // Fisher-Yates shuffle
        for (let i = creatures.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [creatures[i], creatures[j]] = [creatures[j], creatures[i]];
        }

        const next = Array.from({ length: ROWS }, () => Array(COLS).fill(''));

        // Erst alle Positionen reservieren (verhindert Kollisionen)
        const claimed = new Set();
        const moves = [];
        for (const [r, c, emoji] of creatures) {
            const target = boidMove(emoji, r, c, conwayOverlay, grid, ROWS, COLS);
            if (target && !claimed.has(target[0] + ',' + target[1])) {
                claimed.add(target[0] + ',' + target[1]);
                moves.push([r, c, emoji, target[0], target[1]]);
            } else {
                const key = r + ',' + c;
                if (!claimed.has(key)) {
                    claimed.add(key);
                    moves.push([r, c, emoji, r, c]);
                }
                // sonst: Tier stirbt (verdrängt)
            }
        }

        for (const [,, emoji, nr, nc] of moves) next[nr][nc] = emoji;

        analyzeGameplay(conwayOverlay, next, ROWS, COLS);
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
        cellStableCount = null;
        prevCells = null;
        gliderCooldown = 0;
        bloomCooldown  = 0;
        stoneCooldown  = 0;
        redraw();
    }

    function resetIdleTimer() {
        lastInteraction = Date.now();
        if (conwayOverlay) fadeConway(); // sanfter Abschied statt sofort weg
        // Ambient bleibt — Oscar will durchgehende Insel-Musik (2026-04-19).
        // Stoppen nur via Mute-Button.
        bus && bus.emit('idle:end');
    }

    // Idle-Poller
    setInterval(() => {
        const idle = Date.now() - lastInteraction;
        if (!conwayInterval && !conwayFading && idle > CONWAY_IDLE_MS) startConway();
        if (idle > AMBIENT_IDLE_MS && window.INSEL_SOUND) window.INSEL_SOUND.playAmbient();
    }, 5000);

    // ============================================================
    // === GAMEPLAY-EVENT-HANDLER ==================================
    // ============================================================

    // conway:bloom — stabile Zelle → Blume wächst auf leerer Nachbarzelle
    bus && bus.on('conway:bloom', ({ r, c }) => {
        if (!conwayOverlay) return; // nur während Screensaver aktiv
        const grid = window.grid;
        if (!grid || grid[r]?.[c] !== null) return;
        grid[r][c] = 'flower';
        window.grid = grid;
        redraw();
        // Blume verwelkt nach 20-30s wieder (temporärer Screensaver-Effekt)
        setTimeout(() => {
            if (!conwayOverlay) return; // Screensaver weg → nicht anfassen
            if (grid[r]?.[c] === 'flower') {
                grid[r][c] = null;
                window.grid = grid;
                redraw();
            }
        }, 20000 + Math.random() * 10000);
    });

    // conway:stone — Still-Life-Block → Stein-Formation
    bus && bus.on('conway:stone', ({ r, c }) => {
        if (!conwayOverlay) return;
        const grid = window.grid;
        if (!grid || grid[r]?.[c] !== null) return;
        grid[r][c] = 'stone';
        window.grid = grid;
        redraw();
        // Stein löst sich nach 40-60s auf
        setTimeout(() => {
            if (!conwayOverlay) return;
            if (grid[r]?.[c] === 'stone') {
                grid[r][c] = null;
                window.grid = grid;
                redraw();
            }
        }, 40000 + Math.random() * 20000);
    });

    // conway:glider — sich bewegende Muster → temporäre Wolken-Animation
    bus && bus.on('conway:glider', ({ r, c }) => {
        if (!conwayOverlay) return;
        const grid = window.grid;
        const { ROWS, COLS } = dims();
        if (!grid) return;
        // Wolke auf Glider-Position + 1-2 Nachbarn für ~8s
        const positions = [[r, c]];
        const neighbors = [[-1,0],[1,0],[0,-1],[0,1]];
        for (const [dr, dc] of neighbors) {
            const nr = r + dr, nc = c + dc;
            if (nr >= 2 && nr < ROWS-2 && nc >= 2 && nc < COLS-2 && grid[nr][nc] === null)
                positions.push([nr, nc]);
            if (positions.length >= 3) break;
        }
        const placed = [];
        for (const [cr, cc] of positions) {
            if (grid[cr]?.[cc] === null) {
                grid[cr][cc] = 'cloud';
                placed.push([cr, cc]);
            }
        }
        if (placed.length > 0) {
            window.grid = grid;
            redraw();
            setTimeout(() => {
                if (!conwayOverlay) return;
                for (const [cr, cc] of placed) {
                    if (grid[cr]?.[cc] === 'cloud') grid[cr][cc] = null;
                }
                window.grid = grid;
                redraw();
            }, 7000 + Math.random() * 3000);
        }
    });

    // Overlay-Zugriff für game.js draw-Loop
    function getOverlay() { return conwayOverlay; }

    // Window-Exports für Kompatibilität und draw-Loop
    window.startConway    = startConway;
    window.stopConway     = stopConway;
    window.resetIdleTimer = resetIdleTimer;
    window.INSEL_CONWAY   = { getOverlay };

})();
