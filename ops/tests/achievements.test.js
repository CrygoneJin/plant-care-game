const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const SRC = path.resolve(__dirname, '../../src');

function createBrowserContext() {
    const storage = new Map();
    return {
        window: {},
        document: { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [] },
        localStorage: {
            getItem: (k) => storage.get(k) ?? null,
            setItem: (k, v) => storage.set(k, String(v)),
            removeItem: (k) => storage.delete(k),
            get length() { return storage.size; },
            key: (i) => [...storage.keys()][i],
            clear: () => storage.clear(),
        },
        console, setTimeout, Date, Math, JSON, Map, Set, Array, Object, String, Number,
        Error, TypeError, parseInt, parseFloat, isNaN, isFinite, undefined,
    };
}

function load(ctx) {
    ctx.window = ctx;
    const code = fs.readFileSync(path.join(SRC, 'world/achievements.js'), 'utf-8');
    vm.runInNewContext(code, ctx, { filename: 'achievements.js' });
    return ctx.INSEL_ACHIEVEMENTS;
}

describe('Achievements', () => {
    let achievements;

    beforeEach(() => {
        const ctx = createBrowserContext();
        achievements = load(ctx);
    });

    // --- Feste Achievements ---

    it('hat 20 feste Achievements', () => {
        const fixed = Object.keys(achievements).filter(k => !k.includes('_dyn_'));
        assert.equal(fixed.length, 20);
    });

    it('bau1: Grundstein bei playerPlaced >= 1', () => {
        assert.equal(achievements.bau1.check({ playerPlaced: 0 }), false);
        assert.equal(achievements.bau1.check({ playerPlaced: 1 }), true);
    });

    it('bau4: Burgherr bei playerPlaced >= 500', () => {
        assert.equal(achievements.bau4.check({ playerPlaced: 499 }), false);
        assert.equal(achievements.bau4.check({ playerPlaced: 500 }), true);
    });

    it('mix1: Erster Mix bei recipesFound >= 1', () => {
        assert.equal(achievements.mix1.check({ recipesFound: 0 }), false);
        assert.equal(achievements.mix1.check({ recipesFound: 1 }), true);
    });

    it('quest1: Guter Freund bei questsDone >= 1', () => {
        assert.equal(achievements.quest1.check({ questsDone: 0 }), false);
        assert.equal(achievements.quest1.check({ questsDone: 1 }), true);
    });

    it('plan4: Grossstadt bei blueprintsDone >= 8', () => {
        assert.equal(achievements.plan4.check({ blueprintsDone: 7 }), false);
        assert.equal(achievements.plan4.check({ blueprintsDone: 8 }), true);
    });

    it('mat4: Orca-Grossmutter bei uniqueMats >= 50', () => {
        assert.equal(achievements.mat4.check({ uniqueMats: 49 }), false);
        assert.equal(achievements.mat4.check({ uniqueMats: 50 }), true);
    });

    // --- Dynamische Achievements ---

    it('hat dynamische Achievements für bau, mix, mat', () => {
        const dynKeys = Object.keys(achievements).filter(k => k.includes('_dyn_'));
        assert.ok(dynKeys.length > 0, 'sollte dynamische Achievements haben');
        assert.ok(dynKeys.some(k => k.startsWith('bau_dyn_')));
        assert.ok(dynKeys.some(k => k.startsWith('mix_dyn_')));
        assert.ok(dynKeys.some(k => k.startsWith('mat_dyn_')));
    });

    it('bau_dyn_1000 triggert bei 1000 Blöcken', () => {
        assert.ok(achievements.bau_dyn_1000, 'bau_dyn_1000 sollte existieren');
        assert.equal(achievements.bau_dyn_1000.check({ playerPlaced: 999 }), false);
        assert.equal(achievements.bau_dyn_1000.check({ playerPlaced: 1000 }), true);
    });

    it('dynamische Schwellen steigen (Fibonacci-artig)', () => {
        const bauDyn = Object.keys(achievements)
            .filter(k => k.startsWith('bau_dyn_'))
            .map(k => parseInt(k.replace('bau_dyn_', '')))
            .sort((a, b) => a - b);

        assert.ok(bauDyn.length >= 5, 'min 5 dynamische Bau-Schwellen');
        // Jede Schwelle sollte höher sein als die vorherige
        for (let i = 1; i < bauDyn.length; i++) {
            assert.ok(bauDyn[i] > bauDyn[i - 1], `${bauDyn[i]} > ${bauDyn[i - 1]}`);
        }
    });

    // --- Jedes Achievement hat Pflichtfelder ---

    it('alle Achievements haben emoji, title, desc, check', () => {
        for (const [id, ach] of Object.entries(achievements)) {
            assert.ok(ach.emoji, `${id}: braucht emoji`);
            assert.ok(ach.title, `${id}: braucht title`);
            assert.ok(ach.desc, `${id}: braucht desc`);
            assert.equal(typeof ach.check, 'function', `${id}: check muss Funktion sein`);
        }
    });
});
