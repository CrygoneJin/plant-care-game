const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const SRC = path.resolve(__dirname, '../../src');

function createBrowserContext() {
    return {
        window: {},
        document: { getElementById: () => null },
        localStorage: { getItem: () => null, setItem: () => {} },
        console, setTimeout, Date, Math, JSON, Map, Set, Array, Object, String, Number,
        Error, TypeError, parseInt, parseFloat, isNaN, isFinite, undefined,
    };
}

function load(ctx) {
    ctx.window = ctx;
    const code = fs.readFileSync(path.join(SRC, 'world/automerge.js'), 'utf-8');
    vm.runInNewContext(code, ctx, { filename: 'automerge.js' });
    return ctx.INSEL_AUTOMERGE;
}

function makeGrid(rows, cols, fill) {
    return Array.from({ length: rows }, () => Array(cols).fill(fill || null));
}

describe('Automerge', () => {
    let automerge;

    beforeEach(() => {
        const ctx = createBrowserContext();
        automerge = load(ctx);
    });

    it('exportiert checkMerge, MERGE_RULES, TRIPLET_RULES', () => {
        assert.equal(typeof automerge.checkMerge, 'function');
        assert.ok(Array.isArray(automerge.MERGE_RULES));
        assert.ok(Array.isArray(automerge.TRIPLET_RULES));
    });

    it('kein Merge auf leerem Grid', () => {
        const grid = makeGrid(5, 5);
        assert.equal(automerge.checkMerge(grid, 2, 2, 5, 5), null);
    });

    it('kein Merge wenn Material allein steht', () => {
        const grid = makeGrid(5, 5);
        grid[2][2] = 'yin';
        assert.equal(automerge.checkMerge(grid, 2, 2, 5, 5), null);
    });

    // --- Pair Merges ---

    it('yin + yang → qi', () => {
        const grid = makeGrid(5, 5);
        grid[2][2] = 'yin';
        grid[2][3] = 'yang';
        const result = automerge.checkMerge(grid, 2, 2, 5, 5);
        assert.ok(result, 'sollte mergen');
        assert.equal(result.result, 'qi');
        assert.equal(result.type, 'pair');
    });

    it('yang + yin → qi (Reihenfolge egal)', () => {
        const grid = makeGrid(5, 5);
        grid[2][2] = 'yang';
        grid[2][3] = 'yin';
        const result = automerge.checkMerge(grid, 2, 2, 5, 5);
        assert.ok(result);
        assert.equal(result.result, 'qi');
    });

    it('yang × yang → charm (Pauli-Druck)', () => {
        const grid = makeGrid(5, 5);
        grid[2][2] = 'yang';
        grid[2][3] = 'yang';
        const result = automerge.checkMerge(grid, 2, 2, 5, 5);
        assert.ok(result);
        assert.equal(result.result, 'charm');
    });

    it('yin × yin → strange (Pauli-Druck)', () => {
        const grid = makeGrid(5, 5);
        grid[2][2] = 'yin';
        grid[3][2] = 'yin';
        const result = automerge.checkMerge(grid, 2, 2, 5, 5);
        assert.ok(result);
        assert.equal(result.result, 'strange');
    });

    it('Merge nur orthogonal, nicht diagonal (für Pair)', () => {
        const grid = makeGrid(5, 5);
        grid[2][2] = 'yin';
        grid[3][3] = 'yang'; // diagonal
        const result = automerge.checkMerge(grid, 2, 2, 5, 5);
        assert.equal(result, null, 'diagonal sollte nicht pair-mergen');
    });

    it('Merge am Rand funktioniert', () => {
        const grid = makeGrid(5, 5);
        grid[0][0] = 'yin';
        grid[0][1] = 'yang';
        const result = automerge.checkMerge(grid, 0, 0, 5, 5);
        assert.ok(result);
        assert.equal(result.result, 'qi');
    });

    // --- Triplet Merges ---

    it('fire + wood + water → metal (RGB-Triplet)', () => {
        const grid = makeGrid(5, 5);
        grid[2][2] = 'fire';
        grid[1][1] = 'wood';   // diagonal oben-links
        grid[1][3] = 'water';  // diagonal oben-rechts
        const result = automerge.checkMerge(grid, 2, 2, 5, 5);
        assert.ok(result, 'sollte triplet mergen');
        assert.equal(result.result, 'metal');
        assert.equal(result.type, 'triplet');
        assert.equal(result.cells.length, 3);
    });

    it('kein Triplet wenn nur 2 von 3 Farben', () => {
        const grid = makeGrid(5, 5);
        grid[2][2] = 'fire';
        grid[1][1] = 'wood';
        // kein water
        const result = automerge.checkMerge(grid, 2, 2, 5, 5);
        assert.equal(result, null);
    });

    // --- Merge Rules Integrität ---

    it('alle MERGE_RULES haben a, b, result, msg', () => {
        for (const rule of automerge.MERGE_RULES) {
            assert.ok(rule.a, `Regel braucht a: ${JSON.stringify(rule)}`);
            assert.ok(rule.b, `Regel braucht b: ${JSON.stringify(rule)}`);
            assert.ok(rule.result, `Regel braucht result: ${JSON.stringify(rule)}`);
            assert.ok(rule.msg, `Regel braucht msg: ${JSON.stringify(rule)}`);
        }
    });

    it('alle TRIPLET_RULES haben materials (3), result, msg', () => {
        for (const rule of automerge.TRIPLET_RULES) {
            assert.ok(Array.isArray(rule.materials));
            assert.equal(rule.materials.length, 3);
            assert.ok(rule.result);
            assert.ok(rule.msg);
        }
    });
});
