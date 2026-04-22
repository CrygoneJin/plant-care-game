// === ATOM-RECOGNIZER TESTS ===
// S100: Cluster-Scan für Proton+Electron→H, + Negativ-Cases.
//
// Vorbild: ops/tests/automerge.test.js (vm.runInNewContext, node:test).

const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const WORLD = path.resolve(__dirname, '../../src/world');

function createBrowserContext() {
    const context = {
        window: {},
        console,
        Map,
        Set,
        Array,
        Object,
        Number,
        String,
        Error,
    };
    context.window = context;
    return context;
}

function loadScript(filePath, context) {
    const code = fs.readFileSync(filePath, 'utf-8');
    vm.runInNewContext(code, context, { filename: filePath });
}

function makeGrid(rows, cols, placements) {
    const grid = Array.from({ length: rows }, () => Array(cols).fill(null));
    for (const [r, c, mat] of placements) {
        grid[r][c] = mat;
    }
    return grid;
}

describe('INSEL_ATOM_RECOGNIZER — scanForAtoms', () => {
    let ctx;
    let scanForAtoms;
    let clusterKey;

    beforeEach(() => {
        ctx = createBrowserContext();
        loadScript(path.join(WORLD, 'atom-recognizer.js'), ctx);
        scanForAtoms = ctx.INSEL_ATOM_RECOGNIZER.scanForAtoms;
        clusterKey = ctx.INSEL_ATOM_RECOGNIZER.clusterKey;
    });

    // === H-Erkennung ===

    it('Proton+Electron adjacent → 1 H', () => {
        const grid = makeGrid(5, 5, [
            [2, 2, 'proton'],
            [2, 3, 'electron'],
        ]);
        const atoms = scanForAtoms(grid, 5, 5);
        assert.equal(atoms.length, 1, 'genau 1 Atom erwartet');
        assert.equal(atoms[0].type, 'H');
        assert.equal(atoms[0].label, 'H');
        assert.equal(atoms[0].charge, 0);
        assert.equal(atoms[0].cells.length, 2);
    });

    it('Proton+Electron diagonal (NICHT adjacent) → kein H, aber H+ (Proton isoliert)', () => {
        // 4-connected: diagonal zählt nicht als adjacent.
        // Electron allein wird nicht gelabelt, Proton allein wird zu H+.
        const grid = makeGrid(5, 5, [
            [2, 2, 'proton'],
            [3, 3, 'electron'],
        ]);
        const atoms = scanForAtoms(grid, 5, 5);
        assert.equal(atoms.length, 1, 'nur das isolierte Proton wird gelabelt');
        assert.equal(atoms[0].type, 'H+');
        assert.equal(atoms[0].label, 'H+');
    });

    it('Proton + Electron 2 Zellen auseinander → kein H, aber H+', () => {
        const grid = makeGrid(5, 5, [
            [2, 2, 'proton'],
            [2, 4, 'electron'],
        ]);
        const atoms = scanForAtoms(grid, 5, 5);
        assert.equal(atoms.length, 1);
        assert.equal(atoms[0].type, 'H+', 'Proton isoliert → Ion');
    });

    // === Negativ-Cases ===

    it('Nur Proton, kein Electron → 1 Ion H+', () => {
        // Einzelnes Proton ist ein H+ Ion, ladung +1.
        const grid = makeGrid(5, 5, [
            [2, 2, 'proton'],
        ]);
        const atoms = scanForAtoms(grid, 5, 5);
        assert.equal(atoms.length, 1);
        assert.equal(atoms[0].type, 'H+');
        assert.equal(atoms[0].charge, 1);
    });

    it('Nur Electron, kein Proton → 0 Atome (kein Pattern)', () => {
        const grid = makeGrid(5, 5, [
            [2, 2, 'electron'],
        ]);
        const atoms = scanForAtoms(grid, 5, 5);
        assert.equal(atoms.length, 0);
    });

    it('Einzelnes Neutron → 0 Atome (kein Pattern)', () => {
        const grid = makeGrid(5, 5, [
            [2, 2, 'neutron'],
        ]);
        const atoms = scanForAtoms(grid, 5, 5);
        assert.equal(atoms.length, 0);
    });

    it('Leeres Grid → 0 Atome', () => {
        const grid = makeGrid(5, 5, []);
        const atoms = scanForAtoms(grid, 5, 5);
        assert.equal(atoms.length, 0);
    });

    // === Mehrere H parallel ===

    it('Zwei getrennte H-Cluster → 2 Atome', () => {
        const grid = makeGrid(8, 8, [
            [1, 1, 'proton'],
            [1, 2, 'electron'],
            [5, 5, 'proton'],
            [5, 6, 'electron'],
        ]);
        const atoms = scanForAtoms(grid, 8, 8);
        assert.equal(atoms.length, 2);
        assert.ok(atoms.every(a => a.type === 'H'));
    });

    // === Helium (Stretch) ===

    it('He-3 Cluster (2p+1n+2e) → 1 He-3', () => {
        // Adjacency-Cluster (alle 4-connected):
        // p-p-n in Zeile 2, e-e in Zeile 3 unter den Protonen
        const grid = makeGrid(6, 6, [
            [2, 1, 'proton'],
            [2, 2, 'proton'],
            [2, 3, 'neutron'],
            [3, 1, 'electron'],
            [3, 2, 'electron'],
        ]);
        const atoms = scanForAtoms(grid, 6, 6);
        assert.equal(atoms.length, 1);
        assert.equal(atoms[0].type, 'He-3');
        assert.equal(atoms[0].charge, 0);
        assert.equal(atoms[0].cells.length, 5);
    });

    it('He-4 Cluster (2p+2n+2e) → 1 He-4', () => {
        const grid = makeGrid(6, 6, [
            [2, 1, 'proton'],
            [2, 2, 'proton'],
            [2, 3, 'neutron'],
            [2, 4, 'neutron'],
            [3, 1, 'electron'],
            [3, 2, 'electron'],
        ]);
        const atoms = scanForAtoms(grid, 6, 6);
        assert.equal(atoms.length, 1);
        assert.equal(atoms[0].type, 'He-4');
        assert.equal(atoms[0].charge, 0);
    });

    // === Ion-Label bei H (Ladungs-Berechnung) ===

    it('H mit 2 Protonen + 1 Electron (unpassendes Multiset) → Kein H-Match', () => {
        // 2p+1e ist kein Pattern → würde als unbekannter Cluster ignoriert
        // (kein H+, weil nicht "nur ein Proton" — Spec: Ion-Fallback nur für singuläres Proton)
        const grid = makeGrid(5, 5, [
            [2, 1, 'proton'],
            [2, 2, 'proton'],
            [2, 3, 'electron'],
        ]);
        const atoms = scanForAtoms(grid, 5, 5);
        assert.equal(atoms.length, 0);
    });

    // === Cluster-Key (Stabilität für Diff) ===

    it('clusterKey ist stabil für gleichen Cluster unabhängig von Einsammel-Reihenfolge', () => {
        const gridA = makeGrid(5, 5, [
            [2, 2, 'proton'],
            [2, 3, 'electron'],
        ]);
        const gridB = makeGrid(5, 5, [
            [2, 3, 'electron'],
            [2, 2, 'proton'],
        ]);
        const atomsA = scanForAtoms(gridA, 5, 5);
        const atomsB = scanForAtoms(gridB, 5, 5);
        assert.equal(clusterKey(atomsA[0]), clusterKey(atomsB[0]));
    });

    // === Großer Grid, keine Perf-Regression ===

    it('Großes Grid (40x40) mit 2 H läuft durch', () => {
        const grid = makeGrid(40, 40, [
            [5, 5, 'proton'], [5, 6, 'electron'],
            [30, 30, 'proton'], [30, 31, 'electron'],
        ]);
        const atoms = scanForAtoms(grid, 40, 40);
        assert.equal(atoms.length, 2);
    });
});
