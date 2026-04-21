// hex-grid.js — Hexagonales Grid mit axialen Koordinaten
// Referenz: redblobgames.com/grids/hexagons/
(function () {
    'use strict';

    // Axiale Richtungen (flat-top): 6 Nachbarn, alle equidistant
    var DIRECTIONS = [
        [1, 0], [-1, 0],
        [0, 1], [0, -1],
        [1, -1], [-1, 1]
    ];

    function hexKey(q, r) { return q + ',' + r; }

    function createGrid(radius) {
        var cells = new Map();

        // Hexagonales Grid: alle (q,r) mit |q| <= radius, |r| <= radius, |q+r| <= radius
        for (var q = -radius; q <= radius; q++) {
            for (var r = -radius; r <= radius; r++) {
                if (Math.abs(q + r) <= radius) {
                    cells.set(hexKey(q, r), {
                        surface: null,
                        height: 0,
                        dark: 0,
                        trixels: null
                    });
                }
            }
        }

        return {
            cells: cells,
            radius: radius,

            get: function (q, r) {
                return cells.get(hexKey(q, r));
            },

            set: function (q, r, cell) {
                if (cells.has(hexKey(q, r))) {
                    cells.set(hexKey(q, r), cell);
                }
            },

            neighbors: function (q, r) {
                var result = [];
                for (var i = 0; i < DIRECTIONS.length; i++) {
                    var nq = q + DIRECTIONS[i][0];
                    var nr = r + DIRECTIONS[i][1];
                    if (cells.has(hexKey(nq, nr))) {
                        result.push([nq, nr]);
                    }
                }
                return result;
            },

            // Flat-top hex: q -> x, r -> y (mit Offset)
            hexToPixel: function (q, r, size) {
                var x = size * (3 / 2 * q);
                var y = size * (Math.sqrt(3) / 2 * q + Math.sqrt(3) * r);
                return { x: x, y: y };
            },

            pixelToHex: function (x, y, size) {
                var q = (2 / 3 * x) / size;
                var r = (-1 / 3 * x + Math.sqrt(3) / 3 * y) / size;
                // Runden auf naechstes Hex (cube round)
                var s = -q - r;
                var rq = Math.round(q);
                var rr = Math.round(r);
                var rs = Math.round(s);
                var dq = Math.abs(rq - q);
                var dr = Math.abs(rr - r);
                var ds = Math.abs(rs - s);
                if (dq > dr && dq > ds) {
                    rq = -rr - rs;
                } else if (dr > ds) {
                    rr = -rq - rs;
                }
                return { q: rq, r: rr };
            },

            forEach: function (fn) {
                cells.forEach(function (cell, key) {
                    var parts = key.split(',');
                    fn(cell, parseInt(parts[0]), parseInt(parts[1]));
                });
            }
        };
    }

    function migrateCell(value) {
        if (typeof value === 'string') {
            return { surface: value, height: 0, dark: 0, trixels: null };
        }
        if (value && typeof value === 'object' && 'surface' in value) {
            return value;
        }
        return { surface: null, height: 0, dark: 0, trixels: null };
    }

    // === TRIXEL — Tetraeder-Voxel innerhalb eines Hex ===
    // Jedes Hex hat 6 Sektoren (i=0..5), jeweils ein Dreieck vom Zentrum zu einer Kante.
    // Trixel[i] = { material, depth, dark }
    //   material: Material-ID oder null
    //   depth:    0..N (Höhe des Trixels in "Schichten", stapelbar)
    //   dark:     0..1 (Abdunklung)

    function emptyTrixel() {
        return { material: null, depth: 0, dark: 0 };
    }

    /**
     * Erstellt 6 leere Trixel für ein Hex. Falls cell.surface gesetzt ist,
     * werden alle 6 Trixel mit diesem Material initialisiert (depth=1).
     */
    function createTrixels(cell) {
        var arr = [];
        for (var i = 0; i < 6; i++) {
            if (cell && cell.surface) {
                arr.push({ material: cell.surface, depth: Math.max(1, cell.height || 1), dark: cell.dark || 0 });
            } else {
                arr.push(emptyTrixel());
            }
        }
        return arr;
    }

    /**
     * Setzt einen einzelnen Trixel. Initialisiert trixels falls null.
     */
    function setTrixel(cell, idx, material, depth, dark) {
        if (!cell) return;
        if (!cell.trixels) cell.trixels = createTrixels({ surface: null, height: 0, dark: 0 });
        if (idx < 0 || idx >= 6) return;
        cell.trixels[idx] = {
            material: material || null,
            depth: depth || 0,
            dark: dark || 0
        };
    }

    /**
     * 2048-Snap: wenn zwei benachbarte Trixel im selben Hex gleiches Material haben,
     * mergen sie zu einem mit höherem depth. Gibt {merged: boolean, count: number} zurück.
     */
    function mergeTrixels(cell) {
        if (!cell || !cell.trixels) return { merged: false, count: 0 };
        var merged = false;
        var count = 0;
        for (var i = 0; i < 6; i++) {
            var next = (i + 1) % 6;
            var a = cell.trixels[i];
            var b = cell.trixels[next];
            if (a && b && a.material && a.material === b.material && a.depth === b.depth) {
                cell.trixels[i] = {
                    material: a.material,
                    depth: a.depth + 1,
                    dark: a.dark
                };
                cell.trixels[next] = emptyTrixel();
                merged = true;
                count++;
            }
        }
        return { merged: merged, count: count };
    }

    /**
     * Gibt true zurück wenn mindestens 1 Trixel gesetzt ist.
     */
    function hasTrixels(cell) {
        if (!cell || !cell.trixels) return false;
        for (var i = 0; i < 6; i++) {
            if (cell.trixels[i] && cell.trixels[i].material) return true;
        }
        return false;
    }

    window.INSEL_HEX = {
        createGrid: createGrid,
        migrateCell: migrateCell,
        createTrixels: createTrixels,
        setTrixel: setTrixel,
        mergeTrixels: mergeTrixels,
        hasTrixels: hasTrixels,
        emptyTrixel: emptyTrixel,
        DIRECTIONS: DIRECTIONS,
        hexKey: hexKey
    };
})();
