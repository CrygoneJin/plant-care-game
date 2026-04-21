const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert');

// Fake DOM/Canvas-Umgebung fuer Modul-Load
globalThis.window = globalThis;

// Fake INSEL_AUTOMERGE mit echten Regeln (Teilmenge, reicht fuer Tests)
globalThis.INSEL_AUTOMERGE = {
    MERGE_RULES: [
        { a: 'yin', b: 'yang', result: 'qi', msg: 'Yin+Yang' },
        { a: 'yang', b: 'yang', result: 'charm', msg: 'Yang x Yang' },
        { a: 'yin', b: 'yin', result: 'strange', msg: 'Yin x Yin' },
    ],
    TRIPLET_RULES: [],
    checkMerge: function () { return null; },
};

// Fake INSEL_BUS damit emit() nicht kracht
globalThis.INSEL_BUS = { emit: function () {} };

// Fake INSEL_MATERIALS (Teilmenge)
globalThis.INSEL_MATERIALS = {
    yin: { emoji: 'Y', label: 'Yin', color: '#111', border: '#000' },
    yang: { emoji: 'A', label: 'Yang', color: '#eee', border: '#ccc' },
    charm: { emoji: 'C', label: 'Charm', color: '#ffaaff', border: '#cc88cc' },
    qi: { emoji: '*', label: 'Qi', color: '#ffd700', border: '#daa520' },
    strange: { emoji: 'S', label: 'Strange', color: '#7b2fbe', border: '#5b1f8e' },
};

require('../../src/core/particle-snap.js');
const PS = globalThis.INSEL_PARTICLE_SNAP;

describe('ParticleSnap — basic lifecycle', () => {
    beforeEach(() => { PS.clear(); });

    it('spawn() erzeugt Partikel und count() zaehlt korrekt', () => {
        PS.spawn('yin', 100, 100);
        PS.spawn('yang', 200, 200);
        assert.strictEqual(PS.count(), 2);
    });

    it('clear() leert alles', () => {
        PS.spawn('yin', 0, 0);
        PS.clear();
        assert.strictEqual(PS.count(), 0);
    });

    it('update() bewegt Partikel anhand vx/vy', () => {
        PS._setGravity(0);
        PS._setDamping(1); // Keine Reibung fuer Vorhersagbarkeit
        PS.spawn('yin', 0, 0, { vx: 10, vy: 0, ttl: 60000 });
        PS.update(16.667); // dt=1
        const snap = PS.snapshot();
        assert.strictEqual(snap.length, 1);
        assert.ok(snap[0].x > 9.9 && snap[0].x < 10.1, 'x sollte ~10 sein, war ' + snap[0].x);
    });

    it('update() entfernt abgelaufene Partikel', () => {
        PS.spawn('yin', 0, 0, { ttl: 1 });
        // Warten > ttl
        const start = Date.now();
        while (Date.now() - start < 20) { /* spin */ }
        PS.update(16.667);
        assert.strictEqual(PS.count(), 0);
    });
});

describe('ParticleSnap — 2048 snap logic', () => {
    beforeEach(() => { PS.clear(); PS._setGravity(0); PS._setDamping(1); });

    it('gleiche Partikel mit Rule -> neues Material (Yang+Yang -> Charm)', () => {
        // Beide an exakt derselben Position, damit Distance < Summe.sizes
        PS.spawn('yang', 100, 100, { vx: 0, vy: 0, size: 8, ttl: 60000 });
        PS.spawn('yang', 100, 100, { vx: 0, vy: 0, size: 8, ttl: 60000 });
        const stats = PS.update(16.667);
        assert.strictEqual(stats.merged, 1, 'ein Merge erwartet');
        assert.strictEqual(PS.count(), 1, 'nach Merge: 1 Partikel');
        const snap = PS.snapshot();
        assert.strictEqual(snap[0].material, 'charm', 'Yang+Yang -> Charm');
    });

    it('unterschiedliche Partikel mit Rule -> neues Material (Yin+Yang -> Qi)', () => {
        PS.spawn('yin', 50, 50, { size: 8, ttl: 60000 });
        PS.spawn('yang', 50, 50, { size: 8, ttl: 60000 });
        const stats = PS.update(16.667);
        assert.strictEqual(stats.merged, 1);
        const snap = PS.snapshot();
        assert.strictEqual(snap[0].material, 'qi');
    });

    it('gleiche Partikel ohne Rule -> Partikel wachst', () => {
        // 'photon' hat keine Self-Merge-Regel in unserer Test-Regel-Tabelle
        PS.spawn('photon', 100, 100, { size: 8, ttl: 60000 });
        PS.spawn('photon', 100, 100, { size: 8, ttl: 60000 });
        const stats = PS.update(16.667);
        assert.strictEqual(stats.merged, 1);
        assert.strictEqual(PS.count(), 1, 'ein Partikel bleibt');
        const snap = PS.snapshot();
        assert.strictEqual(snap[0].material, 'photon', 'Material unveraendert');
        assert.ok(snap[0].size > 8, 'Groesse gewachsen: ' + snap[0].size);
    });

    it('Partikel die weit voneinander stehen mergen NICHT', () => {
        PS.spawn('yang', 0, 0, { size: 4, ttl: 60000 });
        PS.spawn('yang', 500, 500, { size: 4, ttl: 60000 });
        const stats = PS.update(16.667);
        assert.strictEqual(stats.merged, 0);
        assert.strictEqual(PS.count(), 2);
    });

    it('Merge-Position ist Mittelpunkt der beiden Partikel', () => {
        PS.spawn('yang', 100, 100, { size: 8, ttl: 60000 });
        PS.spawn('yang', 104, 100, { size: 8, ttl: 60000 });
        PS.update(16.667);
        const snap = PS.snapshot();
        assert.strictEqual(snap.length, 1);
        assert.ok(Math.abs(snap[0].x - 102) < 0.1, 'x ~102, war ' + snap[0].x);
    });

    it('Kaskaden: 4 Yang -> 2 Charm im selben Frame (je 2 nebeneinander)', () => {
        // Paar 1 bei (100,100)
        PS.spawn('yang', 100, 100, { size: 8, ttl: 60000 });
        PS.spawn('yang', 101, 100, { size: 8, ttl: 60000 });
        // Paar 2 bei (300,100) — weit genug weg vom Paar 1
        PS.spawn('yang', 300, 100, { size: 8, ttl: 60000 });
        PS.spawn('yang', 301, 100, { size: 8, ttl: 60000 });
        const stats = PS.update(16.667);
        assert.strictEqual(stats.merged, 2, 'zwei Paare gemerged');
        assert.strictEqual(PS.count(), 2, 'zwei neue Charm-Partikel');
        const snap = PS.snapshot();
        assert.ok(snap.every(p => p.material === 'charm'));
    });

    it('_lookupMergeResult findet kommutative Regeln', () => {
        assert.strictEqual(PS._lookupMergeResult('yin', 'yang'), 'qi');
        assert.strictEqual(PS._lookupMergeResult('yang', 'yin'), 'qi', 'kommutativ');
        assert.strictEqual(PS._lookupMergeResult('yang', 'yang'), 'charm');
        assert.strictEqual(PS._lookupMergeResult('xxx', 'yyy'), null, 'kein Match -> null');
    });
});

describe('ParticleSnap — draw() haelt sich an API', () => {
    it('draw() ruft Canvas-2D-Methoden auf ohne zu crashen', () => {
        PS.clear();
        PS.spawn('yin', 50, 50);
        const calls = [];
        const fakeCtx = {
            save: () => calls.push('save'),
            restore: () => calls.push('restore'),
            beginPath: () => calls.push('beginPath'),
            arc: () => calls.push('arc'),
            fill: () => calls.push('fill'),
            stroke: () => calls.push('stroke'),
            fillText: () => calls.push('fillText'),
            set fillStyle(v) { this._fs = v; },
            set strokeStyle(v) { this._ss = v; },
            set lineWidth(v) { this._lw = v; },
            set globalAlpha(v) { this._ga = v; },
            set font(v) { this._f = v; },
            set textAlign(v) { this._ta = v; },
            set textBaseline(v) { this._tb = v; },
        };
        PS.draw(fakeCtx);
        assert.ok(calls.includes('save'), 'save aufgerufen');
        assert.ok(calls.includes('arc'), 'arc aufgerufen');
        assert.ok(calls.includes('fill'), 'fill aufgerufen');
        assert.ok(calls.includes('restore'), 'restore aufgerufen');
    });
});
