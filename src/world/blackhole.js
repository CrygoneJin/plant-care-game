// === BLACKHOLE — Einsauger + Hawking-Rückgabe (S101) ===
// Exportiert als window.INSEL_BLACKHOLE
//
// Physik:
//   Blackholes ziehen Masse an (Einsaug). Aber Hawking zeigte 1974:
//   sie strahlen langsam Teilchen ab. Nichts geht verloren, alles
//   wird transformiert. Reziproke Entropie.
//
// Mechanik:
//   Pro Tick (3s extern):
//     Für jede Blackhole-Zelle:
//       Für jeden 4-adjacent Nachbar:
//         Mit 30% Chance: Nachbar wird konsumiert (= null).
//         Auf Einsaug: Mit 20% Chance: zufällige freie Zelle in
//         2-Radius bekommt yin oder yang (50/50).
//
// Architektur:
//   tickBlackhole(grid, rows, cols, rng?) — pure Funktion.
//   Mutiert grid, returned Event-Array für Animation.
//   RNG injectable für Testbarkeit.

(function() {
    'use strict';

    const EINSAUG_P = 0.30;   // 30% Chance pro Nachbar
    const HAWKING_P = 0.20;   // 20% Chance pro Einsauger-Event
    const HAWKING_RADIUS = 2; // Rückgabe in 2-Zellen-Radius

    function getNeighbors4(r, c, rows, cols) {
        const n = [];
        if (r > 0)        n.push([r - 1, c]);
        if (r < rows - 1) n.push([r + 1, c]);
        if (c > 0)        n.push([r, c - 1]);
        if (c < cols - 1) n.push([r, c + 1]);
        return n;
    }

    // Sammelt alle freien Zellen im Quadrat-Radius um (r, c),
    // die NICHT die Blackhole selbst sind.
    function getFreeCellsInRadius(grid, r, c, rows, cols, radius) {
        const free = [];
        for (let dr = -radius; dr <= radius; dr++) {
            const nr = r + dr;
            if (nr < 0 || nr >= rows) continue;
            for (let dc = -radius; dc <= radius; dc++) {
                if (dr === 0 && dc === 0) continue;
                const nc = c + dc;
                if (nc < 0 || nc >= cols) continue;
                if (!grid[nr][nc]) free.push([nr, nc]);
            }
        }
        return free;
    }

    /**
     * tickBlackhole — ein Tick Einsaug-Logik.
     *
     * @param {Array<Array<string|null>>} grid — wird mutiert
     * @param {number} rows
     * @param {number} cols
     * @param {() => number} [rng] — default Math.random
     * @returns {Array<{type:'eat'|'hawking', r:number, c:number, material?:string, result?:string, source?:[number,number]}>}
     */
    function tickBlackhole(grid, rows, cols, rng) {
        const random = rng || Math.random;
        const events = [];

        // Blackhole-Positionen VORHER sammeln — wenn eine Blackhole
        // selbst konsumiert würde (sollte nie passieren, aber sicher ist sicher),
        // bleibt der Tick konsistent.
        const blackholes = [];
        for (let r = 0; r < rows; r++) {
            if (!grid[r]) continue;
            for (let c = 0; c < cols; c++) {
                if (grid[r][c] === 'blackhole') blackholes.push([r, c]);
            }
        }

        for (let i = 0; i < blackholes.length; i++) {
            const br = blackholes[i][0];
            const bc = blackholes[i][1];
            const neighbors = getNeighbors4(br, bc, rows, cols);

            for (let j = 0; j < neighbors.length; j++) {
                const nr = neighbors[j][0];
                const nc = neighbors[j][1];
                const mat = grid[nr][nc];
                // Leere Zelle oder andere Blackhole nicht konsumieren
                if (!mat || mat === 'blackhole') continue;
                // Ocean (unbaubar) in Lummerland: respektieren, nicht fressen
                // — sonst haut Blackhole Löcher in die Welt-Geometrie.
                if (mat === 'ocean') continue;

                if (random() >= EINSAUG_P) continue;

                // Einsaug
                grid[nr][nc] = null;
                events.push({
                    type: 'eat',
                    r: nr,
                    c: nc,
                    material: mat,
                    source: [br, bc],
                });

                // Hawking-Rückgabe?
                if (random() < HAWKING_P) {
                    const free = getFreeCellsInRadius(grid, br, bc, rows, cols, HAWKING_RADIUS);
                    if (free.length > 0) {
                        const pick = free[Math.floor(random() * free.length)];
                        const result = random() < 0.5 ? 'yin' : 'yang';
                        grid[pick[0]][pick[1]] = result;
                        events.push({
                            type: 'hawking',
                            r: pick[0],
                            c: pick[1],
                            result: result,
                            source: [br, bc],
                        });
                    }
                }
            }
        }

        return events;
    }

    if (typeof window !== 'undefined') {
        window.INSEL_BLACKHOLE = {
            tickBlackhole: tickBlackhole,
            EINSAUG_P: EINSAUG_P,
            HAWKING_P: HAWKING_P,
            HAWKING_RADIUS: HAWKING_RADIUS,
        };
    }
})();
