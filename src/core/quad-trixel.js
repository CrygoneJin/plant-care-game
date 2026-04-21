// @ts-check
// quad-trixel.js — Quad-Grid-Trixel-Bridge
//
// "Magic subdivision": Quad-Grid-Zellen koennen optional in 4 Dreiecke (Trixel)
// geteilt werden — Nord/Ost/Sued/West relativ zur isometrischen Diamond-Form.
// Sidecar-Storage: keine Aenderung an Grid-Struktur. Wenn eine Zelle Trixels
// hat, rendert iso-renderer sie als 4 Dreiecke statt als Cube.
//
// Layout (isometrische Diamond-Ansicht):
//             N (0)
//           /   \
//       W (3)   E (1)
//           \   /
//             S (2)
//
// Trixel-Index 0..3: [N, E, S, W]
//
// 2048-Snap: Adjacent Trixels (0-1, 1-2, 2-3, 3-0) mit gleichem Material und
// gleicher Depth mergen zu Depth+1. Analog zu hex-grid Trixel-Merge.
//
// Ephemeral: Trixels werden NICHT persistiert (wie particle-snap).
// Persistence ist Follow-up-Arbeit (siehe BACKLOG).
//
// Exportiert als window.INSEL_QUAD_TRIXEL.
(function () {
    'use strict';

    /**
     * @typedef {object} QuadTrixel
     * @property {string|null} material
     * @property {number} depth
     * @property {number} dark
     */

    function key(r, c) { return r + ',' + c; }

    function emptyTrixel() {
        return { material: null, depth: 0, dark: 0 };
    }

    /** @type {Map<string, Array<QuadTrixel>>} */
    var store = new Map();

    /**
     * @param {number} r
     * @param {number} c
     * @returns {boolean}
     */
    function hasAt(r, c) {
        return store.has(key(r, c));
    }

    /**
     * @param {number} r
     * @param {number} c
     * @returns {Array<QuadTrixel>|null}
     */
    function getAt(r, c) {
        return store.get(key(r, c)) || null;
    }

    /**
     * Initialisiert eine Zelle mit 4 leeren Trixeln oder mit allen vier auf
     * demselben Material (z.B. bei "subdivide existing cube").
     * @param {number} r
     * @param {number} c
     * @param {string|null} [material]
     * @param {number} [depth]
     */
    function initAt(r, c, material, depth) {
        var d = typeof depth === 'number' ? depth : (material ? 1 : 0);
        var arr = [];
        for (var i = 0; i < 4; i++) {
            arr.push(material
                ? { material: material, depth: d, dark: 0 }
                : emptyTrixel());
        }
        store.set(key(r, c), arr);
    }

    /**
     * Setzt einen einzelnen Trixel-Index (0=N, 1=E, 2=S, 3=W).
     * @param {number} r
     * @param {number} c
     * @param {number} idx
     * @param {string|null} material
     * @param {number} [depth]
     * @param {number} [dark]
     */
    function setTrixel(r, c, idx, material, depth, dark) {
        if (idx < 0 || idx >= 4) return;
        var k = key(r, c);
        var arr = store.get(k);
        if (!arr) {
            arr = [emptyTrixel(), emptyTrixel(), emptyTrixel(), emptyTrixel()];
            store.set(k, arr);
        }
        arr[idx] = {
            material: material || null,
            depth: typeof depth === 'number' ? depth : (material ? 1 : 0),
            dark: typeof dark === 'number' ? dark : 0,
        };
    }

    /**
     * 2048-Snap: wenn zwei adjacent Trixels (cyclic) gleiches Material + Depth
     * haben, verschmelzen zu einem Trixel mit Depth+1.
     * @param {number} r
     * @param {number} c
     * @returns {{ merged: boolean, count: number }}
     */
    function mergeAt(r, c) {
        var arr = store.get(key(r, c));
        if (!arr) return { merged: false, count: 0 };
        var merged = false, count = 0;
        for (var i = 0; i < 4; i++) {
            var next = (i + 1) % 4;
            var a = arr[i], b = arr[next];
            if (a && b && a.material && a.material === b.material && a.depth === b.depth) {
                arr[i] = { material: a.material, depth: a.depth + 1, dark: a.dark };
                arr[next] = emptyTrixel();
                merged = true;
                count++;
            }
        }
        return { merged: merged, count: count };
    }

    /**
     * Entfernt Trixel-Sidecar fuer eine Zelle.
     * @param {number} r
     * @param {number} c
     */
    function clearAt(r, c) {
        store.delete(key(r, c));
    }

    function clear() {
        store.clear();
    }

    function count() {
        return store.size;
    }

    /**
     * Rendert 4 Trixel-Dreiecke in eine isometrische Diamond-Form.
     * Flach — keine Cube-Extrusion. Depth wird als Helligkeits-Modifier genutzt.
     *
     * @param {CanvasRenderingContext2D} ctx
     * @param {number} x       Diamond-Mittelpunkt X
     * @param {number} y       Diamond-Mittelpunkt Y
     * @param {number} tileW   Diamond-Breite
     * @param {number} tileH   Diamond-Hoehe
     * @param {Array<QuadTrixel>} trixels
     * @param {object} materials
     */
    function drawQuadTrixels(ctx, x, y, tileW, tileH, trixels, materials) {
        // Vier Ecken der Diamond: N, E, S, W
        var N = { x: x, y: y - tileH / 2 };
        var E = { x: x + tileW / 2, y: y };
        var S = { x: x, y: y + tileH / 2 };
        var W = { x: x - tileW / 2, y: y };
        var C = { x: x, y: y }; // Zentrum

        // Trixel-Reihenfolge: 0=N-Segment (zwischen W und N und E, Spitze oben)
        // 1=E-Segment, 2=S-Segment, 3=W-Segment
        // Jedes Dreieck: Center -> Corner1 -> Corner2
        var edges = [
            [W, N], // N-Segment
            [N, E], // E-Segment
            [E, S], // S-Segment
            [S, W], // W-Segment
        ];

        for (var i = 0; i < 4; i++) {
            var tri = trixels[i];
            if (!tri || !tri.material) continue;
            var mat = materials && materials[tri.material];
            if (!mat) continue;

            var color = mat.color || '#888';
            // Depth -> Helligkeit (mehr Depth = heller, wirkt "angehoben")
            // Dark-Wert dunkelt zusaetzlich
            var lift = Math.min(60, tri.depth * 18);
            var dark = Math.min(50, (tri.dark || 0) * 50);
            var fill = adjustColor(color, lift - dark);

            ctx.beginPath();
            ctx.moveTo(C.x, C.y);
            ctx.lineTo(edges[i][0].x, edges[i][0].y);
            ctx.lineTo(edges[i][1].x, edges[i][1].y);
            ctx.closePath();
            ctx.fillStyle = fill;
            ctx.fill();
            ctx.strokeStyle = mat.border || 'rgba(0,0,0,0.2)';
            ctx.lineWidth = 0.8;
            ctx.stroke();
        }
    }

    /** @param {string} hex @param {number} amount */
    function adjustColor(hex, amount) {
        var r, g, b;
        if (hex.startsWith('#')) {
            var n = parseInt(hex.slice(1), 16);
            r = (n >> 16) & 255; g = (n >> 8) & 255; b = n & 255;
        } else if (hex.startsWith('rgb')) {
            var m = hex.match(/(\d+)/g);
            if (!m) return hex;
            r = parseInt(m[0]); g = parseInt(m[1]); b = parseInt(m[2]);
        } else {
            return hex;
        }
        r = Math.max(0, Math.min(255, r + amount));
        g = Math.max(0, Math.min(255, g + amount));
        b = Math.max(0, Math.min(255, b + amount));
        return 'rgb(' + r + ',' + g + ',' + b + ')';
    }

    /**
     * Liefert ein flaches Snapshot aller Trixel-Zellen fuer Tests/Debug.
     * @returns {Array<{ r: number, c: number, trixels: Array<QuadTrixel> }>}
     */
    function snapshot() {
        var out = [];
        store.forEach(function (arr, k) {
            var parts = k.split(',');
            out.push({
                r: parseInt(parts[0]),
                c: parseInt(parts[1]),
                trixels: arr.map(function (t) { return Object.assign({}, t); }),
            });
        });
        return out;
    }

    window.INSEL_QUAD_TRIXEL = {
        hasAt: hasAt,
        getAt: getAt,
        initAt: initAt,
        setTrixel: setTrixel,
        mergeAt: mergeAt,
        clearAt: clearAt,
        clear: clear,
        count: count,
        drawQuadTrixels: drawQuadTrixels,
        snapshot: snapshot,
    };
})();
