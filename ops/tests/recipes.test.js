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
    const code = fs.readFileSync(path.join(SRC, 'world/recipes.js'), 'utf-8');
    vm.runInNewContext(code, ctx, { filename: 'recipes.js' });
    return ctx.INSEL_CRAFTING_RECIPES;
}

describe('Recipes', () => {
    let recipes;

    beforeEach(() => {
        const ctx = createBrowserContext();
        recipes = load(ctx);
    });

    it('ist ein nicht-leeres Array', () => {
        assert.ok(Array.isArray(recipes));
        assert.ok(recipes.length > 50, `Erwartet >50 Rezepte, hat ${recipes.length}`);
    });

    it('jedes Rezept hat name, result, resultCount, ingredients, desc', () => {
        for (const r of recipes) {
            assert.ok(r.name, `Rezept braucht name: ${JSON.stringify(r)}`);
            assert.ok(r.result, `Rezept braucht result: ${JSON.stringify(r)}`);
            assert.ok(typeof r.resultCount === 'number' && r.resultCount >= 1,
                `${r.name}: resultCount muss >= 1 sein`);
            assert.ok(r.ingredients && typeof r.ingredients === 'object',
                `${r.name}: braucht ingredients`);
            assert.ok(Object.keys(r.ingredients).length > 0,
                `${r.name}: ingredients darf nicht leer sein`);
            assert.ok(r.desc, `${r.name}: braucht desc`);
        }
    });

    it('keine doppelten result-IDs (gleicher Name = Variante ok, gleicher result = Duplikat?)', () => {
        // Einige Rezepte haben absichtlich gleichen result (z.B. fire aus verschiedenen Quellen)
        // Aber name + result Kombination sollte unique-ish sein
        const seen = new Set();
        const duplicateNames = [];
        for (const r of recipes) {
            const key = r.name;
            if (seen.has(key)) duplicateNames.push(key);
            seen.add(key);
        }
        // "Tau" ist doppelt (Lepton Tau + Kondensations-Tau) — bekannter Namenskonflikt
        const knownDuplicates = ['Tau'];
        const unexpectedDuplicates = duplicateNames.filter(n => !knownDuplicates.includes(n));
        assert.equal(unexpectedDuplicates.length, 0,
            `Unerwartete doppelte Rezeptnamen: ${unexpectedDuplicates.join(', ')}`);
    });

    it('Genesis-Kette: tao → yin/yang → qi → 5 Elemente', () => {
        const byResult = {};
        for (const r of recipes) { byResult[r.result] = r; }

        assert.ok(byResult.yin, 'Yin-Rezept existiert');
        assert.equal(byResult.yin.ingredients.tao, 1);
        assert.equal(Object.keys(byResult.yin.ingredients).length, 1);

        assert.ok(byResult.yang, 'Yang-Rezept existiert');
        assert.equal(byResult.yang.ingredients.tao, 1);
        assert.equal(Object.keys(byResult.yang.ingredients).length, 1);

        assert.ok(byResult.qi, 'Qi-Rezept existiert');
        assert.equal(byResult.qi.ingredients.yin, 1);
        assert.equal(byResult.qi.ingredients.yang, 1);
    });

    it('Wu Xing Zyklus: Holz→Feuer→Erde→Metall→Wasser→Holz', () => {
        // Glut: wood+fire → fire
        const glut = recipes.find(r => r.name === 'Glut');
        assert.ok(glut, 'Glut-Rezept existiert');
        assert.ok(glut.ingredients.wood, 'Glut braucht Holz');
        assert.ok(glut.ingredients.fire, 'Glut braucht Feuer');
        assert.equal(glut.result, 'fire');

        // Trieb: water+wood → wood
        const trieb = recipes.find(r => r.name === 'Trieb');
        assert.ok(trieb, 'Trieb-Rezept existiert');
        assert.equal(trieb.result, 'wood');
    });

    it('alle Ingredient-IDs sind lowercase alphanumerisch', () => {
        for (const r of recipes) {
            for (const ing of Object.keys(r.ingredients)) {
                assert.ok(/^[a-z_]+$/.test(ing),
                    `${r.name}: Ingredient "${ing}" hat ungültige Zeichen`);
            }
            assert.ok(/^[a-z_]+$/.test(r.result),
                `${r.name}: result "${r.result}" hat ungültige Zeichen`);
        }
    });

    it('keine Rezepte mit negativen Mengen', () => {
        for (const r of recipes) {
            for (const [ing, count] of Object.entries(r.ingredients)) {
                assert.ok(count > 0, `${r.name}: ${ing} hat Menge ${count}`);
            }
        }
    });

    it('Höhle entsteht aus Berg + Wasser', () => {
        const cave = recipes.find(r => r.result === 'cave');
        assert.ok(cave, 'Höhle-Rezept existiert');
        assert.ok(cave.ingredients.mountain, 'braucht Berg');
        assert.ok(cave.ingredients.water, 'braucht Wasser');
    });
});
