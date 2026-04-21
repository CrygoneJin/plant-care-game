const { describe, it } = require('node:test');
const assert = require('node:assert');

// quad-trixel.js wird als IIFE geladen — window simulieren.
globalThis.window = globalThis;
require('../../src/core/quad-trixel.js');

const QT = globalThis.INSEL_QUAD_TRIXEL;

describe('QuadTrixel — Basis', () => {
    it('exportiert Public API', () => {
        assert.strictEqual(typeof QT, 'object');
        assert.strictEqual(typeof QT.hasAt, 'function');
        assert.strictEqual(typeof QT.getAt, 'function');
        assert.strictEqual(typeof QT.initAt, 'function');
        assert.strictEqual(typeof QT.setTrixel, 'function');
        assert.strictEqual(typeof QT.mergeAt, 'function');
        assert.strictEqual(typeof QT.clearAt, 'function');
        assert.strictEqual(typeof QT.clear, 'function');
        assert.strictEqual(typeof QT.count, 'function');
        assert.strictEqual(typeof QT.drawQuadTrixels, 'function');
        assert.strictEqual(typeof QT.snapshot, 'function');
    });

    it('leerer Store: hasAt=false, getAt=null, count=0', () => {
        QT.clear();
        assert.strictEqual(QT.hasAt(0, 0), false);
        assert.strictEqual(QT.getAt(0, 0), null);
        assert.strictEqual(QT.count(), 0);
    });

    it('initAt ohne Material erzeugt 4 leere Trixels', () => {
        QT.clear();
        QT.initAt(2, 3);
        assert.strictEqual(QT.hasAt(2, 3), true);
        const arr = QT.getAt(2, 3);
        assert.strictEqual(arr.length, 4);
        arr.forEach(t => {
            assert.strictEqual(t.material, null);
            assert.strictEqual(t.depth, 0);
            assert.strictEqual(t.dark, 0);
        });
    });

    it('initAt mit Material fuellt alle 4 Slots', () => {
        QT.clear();
        QT.initAt(1, 1, 'stone', 2);
        const arr = QT.getAt(1, 1);
        assert.strictEqual(arr.length, 4);
        arr.forEach(t => {
            assert.strictEqual(t.material, 'stone');
            assert.strictEqual(t.depth, 2);
        });
    });

    it('setTrixel einzelne Indizes (0..3)', () => {
        QT.clear();
        QT.setTrixel(0, 0, 0, 'sand', 1);
        QT.setTrixel(0, 0, 2, 'water', 1);
        const arr = QT.getAt(0, 0);
        assert.strictEqual(arr[0].material, 'sand');
        assert.strictEqual(arr[1].material, null);
        assert.strictEqual(arr[2].material, 'water');
        assert.strictEqual(arr[3].material, null);
    });

    it('setTrixel ignoriert ungueltige Indizes', () => {
        QT.clear();
        QT.setTrixel(0, 0, -1, 'stone');
        QT.setTrixel(0, 0, 4, 'stone');
        assert.strictEqual(QT.hasAt(0, 0), false);
    });

    it('clearAt entfernt Zelle', () => {
        QT.clear();
        QT.initAt(5, 5, 'stone', 1);
        assert.strictEqual(QT.hasAt(5, 5), true);
        QT.clearAt(5, 5);
        assert.strictEqual(QT.hasAt(5, 5), false);
        assert.strictEqual(QT.count(), 0);
    });

    it('clear entfernt alle Zellen', () => {
        QT.clear();
        QT.initAt(0, 0, 'stone');
        QT.initAt(1, 1, 'sand');
        QT.initAt(2, 2, 'water');
        assert.strictEqual(QT.count(), 3);
        QT.clear();
        assert.strictEqual(QT.count(), 0);
    });
});

describe('QuadTrixel — 2048-Snap (mergeAt)', () => {
    it('merged 2 adjacent Trixels mit gleichem Material+Depth → Depth+1', () => {
        QT.clear();
        QT.setTrixel(0, 0, 0, 'stone', 1);
        QT.setTrixel(0, 0, 1, 'stone', 1);
        const res = QT.mergeAt(0, 0);
        assert.strictEqual(res.merged, true);
        assert.ok(res.count >= 1);
        const arr = QT.getAt(0, 0);
        // einer der beiden hat jetzt Depth 2, der andere ist leer
        const depths = arr.map(t => t.depth);
        assert.ok(depths.includes(2));
    });

    it('merged NICHT wenn Material unterschiedlich', () => {
        QT.clear();
        QT.setTrixel(0, 0, 0, 'stone', 1);
        QT.setTrixel(0, 0, 1, 'sand', 1);
        const res = QT.mergeAt(0, 0);
        assert.strictEqual(res.merged, false);
        assert.strictEqual(res.count, 0);
    });

    it('merged NICHT wenn Depth unterschiedlich', () => {
        QT.clear();
        QT.setTrixel(0, 0, 0, 'stone', 1);
        QT.setTrixel(0, 0, 1, 'stone', 2);
        const res = QT.mergeAt(0, 0);
        assert.strictEqual(res.merged, false);
    });

    it('merged cyclic: Index 3 und 0 sind adjacent', () => {
        QT.clear();
        QT.setTrixel(0, 0, 3, 'stone', 1);
        QT.setTrixel(0, 0, 0, 'stone', 1);
        const res = QT.mergeAt(0, 0);
        assert.strictEqual(res.merged, true);
    });

    it('merged NICHT fuer diametral entgegengesetzte (0 und 2)', () => {
        QT.clear();
        QT.setTrixel(0, 0, 0, 'stone', 1);
        QT.setTrixel(0, 0, 2, 'stone', 1);
        const res = QT.mergeAt(0, 0);
        assert.strictEqual(res.merged, false);
    });

    it('4x gleiches Material kann zu hoeheren Depths kaskadieren', () => {
        QT.clear();
        QT.initAt(0, 0, 'stone', 1);
        // erste Runde merged Paare
        const r1 = QT.mergeAt(0, 0);
        assert.strictEqual(r1.merged, true);
        // zweite Runde merged die verbleibenden Depth-2-Paare
        const r2 = QT.mergeAt(0, 0);
        // mindestens ein Trixel sollte Depth > 1 haben
        const arr = QT.getAt(0, 0);
        const maxDepth = Math.max(...arr.map(t => t.depth));
        assert.ok(maxDepth >= 2);
    });

    it('mergeAt auf leerer Zelle: merged=false', () => {
        QT.clear();
        const res = QT.mergeAt(99, 99);
        assert.strictEqual(res.merged, false);
        assert.strictEqual(res.count, 0);
    });
});

describe('QuadTrixel — snapshot + draw', () => {
    it('snapshot liefert flaches Array aller Zellen', () => {
        QT.clear();
        QT.initAt(1, 2, 'stone', 1);
        QT.initAt(3, 4, 'sand', 2);
        const snap = QT.snapshot();
        assert.strictEqual(snap.length, 2);
        const e12 = snap.find(s => s.r === 1 && s.c === 2);
        assert.ok(e12);
        assert.strictEqual(e12.trixels.length, 4);
        assert.strictEqual(e12.trixels[0].material, 'stone');
    });

    it('snapshot ist immutable (Copies, keine Referenzen)', () => {
        QT.clear();
        QT.initAt(0, 0, 'stone', 1);
        const snap = QT.snapshot();
        snap[0].trixels[0].material = 'TAMPERED';
        const after = QT.getAt(0, 0);
        assert.strictEqual(after[0].material, 'stone');
    });

    it('drawQuadTrixels ruft Canvas-API fuer jeden gesetzten Trixel', () => {
        let beginCount = 0, fillCount = 0, strokeCount = 0;
        const fakeCtx = {
            beginPath: () => beginCount++,
            moveTo: () => {},
            lineTo: () => {},
            closePath: () => {},
            fill: () => fillCount++,
            stroke: () => strokeCount++,
            set fillStyle(_) {}, get fillStyle() { return ''; },
            set strokeStyle(_) {}, get strokeStyle() { return ''; },
            set lineWidth(_) {}, get lineWidth() { return 0; },
        };
        const materials = {
            stone: { color: '#888888', border: '#333' },
            sand: { color: 'rgb(200,180,120)', border: '#aa8' },
        };
        const trixels = [
            { material: 'stone', depth: 1, dark: 0 },
            { material: null, depth: 0, dark: 0 },
            { material: 'sand', depth: 2, dark: 0.2 },
            { material: 'stone', depth: 1, dark: 0 },
        ];
        QT.drawQuadTrixels(fakeCtx, 100, 100, 64, 32, trixels, materials);
        // 3 gesetzte Trixels -> 3 Draw-Calls
        assert.strictEqual(beginCount, 3);
        assert.strictEqual(fillCount, 3);
        assert.strictEqual(strokeCount, 3);
    });

    it('drawQuadTrixels skipped leere / unbekannte Trixels', () => {
        let beginCount = 0;
        const fakeCtx = {
            beginPath: () => beginCount++,
            moveTo: () => {}, lineTo: () => {}, closePath: () => {},
            fill: () => {}, stroke: () => {},
            set fillStyle(_) {}, get fillStyle() { return ''; },
            set strokeStyle(_) {}, get strokeStyle() { return ''; },
            set lineWidth(_) {}, get lineWidth() { return 0; },
        };
        const materials = { stone: { color: '#888' } };
        const trixels = [
            { material: 'stone', depth: 1, dark: 0 },
            { material: 'unknown-mat', depth: 1, dark: 0 }, // nicht in materials
            { material: null, depth: 0, dark: 0 },
            { material: null, depth: 0, dark: 0 },
        ];
        QT.drawQuadTrixels(fakeCtx, 0, 0, 64, 32, trixels, materials);
        assert.strictEqual(beginCount, 1);
    });
});
