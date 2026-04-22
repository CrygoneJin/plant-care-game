// === AUTOMERGE TESTS — Baryon-Triplet + Rule-Order ===
// S99: Proton (uud) + Neutron (udd) als Triplet-Merge.
// Prüft: Feynman-Gate gegen Rule-Order-Kollisionen
// (Wu-Xing-Metal, Pair-Merges Yang+Yin→Qi, Yang×Yang→Charm).

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

// Mini-Grid-Helper: 5x5 Grid mit gezielten Platzierungen
function makeGrid(rows, cols, placements) {
    const grid = Array.from({ length: rows }, () => Array(cols).fill(null));
    for (const [r, c, mat] of placements) {
        grid[r][c] = mat;
    }
    return grid;
}

describe('INSEL_AUTOMERGE — Baryon-Triplets', () => {
    let ctx;
    let checkMerge;

    beforeEach(() => {
        ctx = createBrowserContext();
        loadScript(path.join(WORLD, 'automerge.js'), ctx);
        checkMerge = ctx.INSEL_AUTOMERGE.checkMerge;
    });

    // === Baryon-Bildung ===

    it('Yang+Yang+Yin (clustered) → Proton', () => {
        // Yang an (2,2), Yang an (2,3), Yin an (3,2) — der platzierte Block ist Yin
        const grid = makeGrid(5, 5, [
            [2, 2, 'yang'],
            [2, 3, 'yang'],
            [3, 2, 'yin'],
        ]);
        const result = checkMerge(grid, 3, 2, 5, 5);
        assert.ok(result, 'merge result expected');
        assert.equal(result.result, 'proton', 'Yang+Yang+Yin should form Proton');
        assert.equal(result.type, 'triplet');
    });

    it('Yang+Yin+Yin (clustered) → Neutron', () => {
        const grid = makeGrid(5, 5, [
            [2, 2, 'yin'],
            [2, 3, 'yin'],
            [3, 2, 'yang'],
        ]);
        const result = checkMerge(grid, 3, 2, 5, 5);
        assert.ok(result, 'merge result expected');
        assert.equal(result.result, 'neutron', 'Yang+Yin+Yin should form Neutron');
        assert.equal(result.type, 'triplet');
    });

    it('Permutations-Invarianz: Yang-Yin-Yang (different layout) → Proton', () => {
        // diagonale Anordnung, Yin in der Mitte
        const grid = makeGrid(5, 5, [
            [1, 1, 'yang'],
            [2, 2, 'yin'],
            [1, 3, 'yang'],
        ]);
        // trigger beim Yin-Center
        const result = checkMerge(grid, 2, 2, 5, 5);
        assert.ok(result, 'merge result expected');
        assert.equal(result.result, 'proton');
    });

    // === Nicht-Kollision mit Wu-Xing-Metal ===

    it('fire+wood+water → metal (Wu-Xing, NICHT Baryon)', () => {
        const grid = makeGrid(5, 5, [
            [2, 2, 'fire'],
            [2, 3, 'wood'],
            [3, 2, 'water'],
        ]);
        const result = checkMerge(grid, 3, 2, 5, 5);
        assert.ok(result);
        assert.equal(result.result, 'metal', 'RGB-Farbneutralität → Metall');
    });

    // === Nicht-Kollision mit Gen2/Gen3 ===

    it('charm+charm+strange produziert KEIN Baryon', () => {
        const grid = makeGrid(5, 5, [
            [2, 2, 'charm'],
            [2, 3, 'charm'],
            [3, 2, 'strange'],
        ]);
        const result = checkMerge(grid, 3, 2, 5, 5);
        // charm+strange Pair-Merge → antimatter ist erlaubt
        // Aber KEIN Proton/Neutron!
        if (result) {
            assert.notEqual(result.result, 'proton');
            assert.notEqual(result.result, 'neutron');
        }
    });

    it('charm+charm+yin produziert KEIN Baryon (nur Gen1-Yang/Yin zählt)', () => {
        const grid = makeGrid(5, 5, [
            [2, 2, 'charm'],
            [2, 3, 'charm'],
            [3, 2, 'yin'],
        ]);
        const result = checkMerge(grid, 3, 2, 5, 5);
        if (result) {
            assert.notEqual(result.result, 'proton');
            assert.notEqual(result.result, 'neutron');
        }
    });

    // === Rule-Order: Triplet schlägt Pair-Merges ===

    it('Yang+Yang+Yin: Triplet schlägt Yang+Yin→Qi Pair-Merge', () => {
        // Wenn Yin zwischen 2 Yangs gesetzt wird: es gäbe Pair-Match (Yang+Yin→Qi)
        // UND Triplet-Match (Proton). Triplet muss gewinnen.
        const grid = makeGrid(5, 5, [
            [2, 1, 'yang'],
            [2, 3, 'yang'],
            [2, 2, 'yin'],   // Yin in der Mitte zwischen 2 Yangs
        ]);
        const result = checkMerge(grid, 2, 2, 5, 5);
        assert.ok(result);
        assert.equal(result.result, 'proton', 'Triplet must win over pair Yang+Yin→Qi');
    });

    it('Yang+Yin+Yin: Triplet schlägt Yin×Yin→Strange Pair-Merge', () => {
        const grid = makeGrid(5, 5, [
            [2, 1, 'yin'],
            [2, 3, 'yin'],
            [2, 2, 'yang'],  // Yang in der Mitte zwischen 2 Yins
        ]);
        const result = checkMerge(grid, 2, 2, 5, 5);
        assert.ok(result);
        assert.equal(result.result, 'neutron', 'Triplet must win over pair Yin×Yin→Strange');
    });

    // === Einzel-Pair darf noch funktionieren ===

    it('Yang+Yin allein (kein drittes Quark) → Qi (Pair-Merge intakt)', () => {
        const grid = makeGrid(5, 5, [
            [2, 2, 'yang'],
            [2, 3, 'yin'],
        ]);
        const result = checkMerge(grid, 2, 3, 5, 5);
        assert.ok(result);
        assert.equal(result.result, 'qi');
    });

    it('Yang+Yang allein → Charm (Pair-Merge intakt)', () => {
        const grid = makeGrid(5, 5, [
            [2, 2, 'yang'],
            [2, 3, 'yang'],
        ]);
        const result = checkMerge(grid, 2, 3, 5, 5);
        assert.ok(result);
        assert.equal(result.result, 'charm');
    });
});

// === Standardmodell-Erweiterungen (Higgs, Mesonen, Positron) ===
// Scope: neue Materialien + neue Merges + Regressions-Check bestehender Pair-Merges.
describe('INSEL_AUTOMERGE — Standardmodell komplett', () => {
    let ctx;
    let checkMerge;

    beforeEach(() => {
        ctx = createBrowserContext();
        loadScript(path.join(WORLD, 'materials.js'), ctx);
        loadScript(path.join(WORLD, 'automerge.js'), ctx);
        checkMerge = ctx.INSEL_AUTOMERGE.checkMerge;
    });

    // === Higgs-Boson: mountain + cave → higgs_boson ===

    it('Mountain + Cave → Higgs-Boson (Top+Bottom-Fusion)', () => {
        const grid = makeGrid(5, 5, [
            [2, 2, 'mountain'],
            [2, 3, 'cave'],
        ]);
        const result = checkMerge(grid, 2, 3, 5, 5);
        assert.ok(result);
        assert.equal(result.result, 'higgs_boson');
        assert.equal(result.type, 'pair');
    });

    it('Cave + Mountain (Reihenfolge umgekehrt) → Higgs-Boson', () => {
        const grid = makeGrid(5, 5, [
            [2, 2, 'cave'],
            [2, 3, 'mountain'],
        ]);
        const result = checkMerge(grid, 2, 3, 5, 5);
        assert.ok(result);
        assert.equal(result.result, 'higgs_boson');
    });

    // === Mesonen: Yang+Electron → Pion, Strange+Electron → Kaon ===

    it('Yang + Electron → Pion (leichtestes Meson)', () => {
        const grid = makeGrid(5, 5, [
            [2, 2, 'yang'],
            [2, 3, 'electron'],
        ]);
        const result = checkMerge(grid, 2, 3, 5, 5);
        assert.ok(result);
        assert.equal(result.result, 'pion');
    });

    it('Strange + Electron → Kaon (seltsames Meson)', () => {
        const grid = makeGrid(5, 5, [
            [2, 2, 'strange'],
            [2, 3, 'electron'],
        ]);
        const result = checkMerge(grid, 2, 3, 5, 5);
        assert.ok(result);
        assert.equal(result.result, 'kaon');
    });

    // === Positron: antimatter + electron → positron ===

    it('Antimaterie + Elektron → Positron (Dirac 1928)', () => {
        const grid = makeGrid(5, 5, [
            [2, 2, 'antimatter'],
            [2, 3, 'electron'],
        ]);
        const result = checkMerge(grid, 2, 3, 5, 5);
        assert.ok(result);
        assert.equal(result.result, 'positron');
    });

    // === Neue Materialien existieren in INSEL_MATERIALS ===

    it('higgs_boson ist in INSEL_MATERIALS definiert (mass=125, spin=0)', () => {
        const mats = ctx.INSEL_MATERIALS;
        assert.ok(mats.higgs_boson, 'higgs_boson muss existieren');
        assert.equal(mats.higgs_boson.mass, 125);
        assert.equal(mats.higgs_boson.spin, 0);
        assert.equal(mats.higgs_boson.charge, 0);
    });

    it('pion, kaon, positron sind in INSEL_MATERIALS mit korrekten Feldern', () => {
        const mats = ctx.INSEL_MATERIALS;
        assert.ok(mats.pion);
        assert.equal(mats.pion.spin, 0);
        assert.ok(mats.kaon);
        assert.equal(mats.kaon.spin, 0);
        assert.ok(mats.positron);
        assert.equal(mats.positron.charge, 1, 'Positron = +1 (Anti-Elektron)');
        assert.equal(mats.positron.spin, 0.5);
    });

    // === Regressionen: bestehende Merges bleiben intakt ===

    it('Regression: Charm + Strange → Antimaterie (nicht Positron)', () => {
        const grid = makeGrid(5, 5, [
            [2, 2, 'charm'],
            [2, 3, 'strange'],
        ]);
        const result = checkMerge(grid, 2, 3, 5, 5);
        assert.ok(result);
        assert.equal(result.result, 'antimatter');
    });

    it('Regression: Antimaterie + Yang → Elektron (Paarproduktion bleibt)', () => {
        const grid = makeGrid(5, 5, [
            [2, 2, 'antimatter'],
            [2, 3, 'yang'],
        ]);
        const result = checkMerge(grid, 2, 3, 5, 5);
        assert.ok(result);
        assert.equal(result.result, 'electron');
    });

    it('Regression: Elektron × Elektron → Myon (Pauli, nicht Pion)', () => {
        // Verhindert Kollision: neuer Pion-Merge darf nicht Myon-Entstehung brechen.
        const grid = makeGrid(5, 5, [
            [2, 2, 'electron'],
            [2, 3, 'electron'],
        ]);
        const result = checkMerge(grid, 2, 3, 5, 5);
        assert.ok(result);
        assert.equal(result.result, 'muon');
    });

    it('Regression: Elektron + Yin → Neutrino (bleibt unverändert)', () => {
        const grid = makeGrid(5, 5, [
            [2, 2, 'electron'],
            [2, 3, 'yin'],
        ]);
        const result = checkMerge(grid, 2, 3, 5, 5);
        assert.ok(result);
        assert.equal(result.result, 'neutrino');
    });

    it('Regression: Yang+Yang+Yin → Proton (Baryon-Triplet nicht gebrochen)', () => {
        const grid = makeGrid(5, 5, [
            [2, 1, 'yang'],
            [2, 3, 'yang'],
            [2, 2, 'yin'],
        ]);
        const result = checkMerge(grid, 2, 2, 5, 5);
        assert.ok(result);
        assert.equal(result.result, 'proton');
    });

    it('Regression: Yang + Yin → Qi (allein, ohne drittes Quark)', () => {
        const grid = makeGrid(5, 5, [
            [2, 2, 'yang'],
            [2, 3, 'yin'],
        ]);
        const result = checkMerge(grid, 2, 3, 5, 5);
        assert.ok(result);
        assert.equal(result.result, 'qi');
    });
});
