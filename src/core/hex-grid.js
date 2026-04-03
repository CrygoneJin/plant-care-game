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

    window.INSEL_HEX = {
        createGrid: createGrid,
        migrateCell: migrateCell,
        DIRECTIONS: DIRECTIONS,
        hexKey: hexKey
    };
})();
