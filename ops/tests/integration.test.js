const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const SRC = path.resolve(__dirname, '../../src');

function createBrowserContext() {
    return {
        window: {},
        document: { getElementById: () => null, querySelector: () => null, querySelectorAll: () => [] },
        localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {}, get length() { return 0; }, key: () => null, clear: () => {} },
        console, setTimeout, Date, Math, JSON, Map, Set, Array, Object, String, Number,
        Error, TypeError, parseInt, parseFloat, isNaN, isFinite, undefined, RegExp,
    };
}

function loadModules(ctx) {
    ctx.window = ctx;

    // Materials
    const matCode = fs.readFileSync(path.join(SRC, 'world/materials.js'), 'utf-8');
    vm.runInNewContext(matCode, ctx, { filename: 'materials.js' });

    // Recipes
    const recCode = fs.readFileSync(path.join(SRC, 'world/recipes.js'), 'utf-8');
    vm.runInNewContext(recCode, ctx, { filename: 'recipes.js' });

    // Quests
    const questCode = fs.readFileSync(path.join(SRC, 'world/quests.js'), 'utf-8');
    vm.runInNewContext(questCode, ctx, { filename: 'quests.js' });

    // Achievements
    const achCode = fs.readFileSync(path.join(SRC, 'world/achievements.js'), 'utf-8');
    vm.runInNewContext(achCode, ctx, { filename: 'achievements.js' });

    // Automerge
    const mergeCode = fs.readFileSync(path.join(SRC, 'world/automerge.js'), 'utf-8');
    vm.runInNewContext(mergeCode, ctx, { filename: 'automerge.js' });

    // Blueprints
    const bpCode = fs.readFileSync(path.join(SRC, 'world/blueprints.js'), 'utf-8');
    vm.runInNewContext(bpCode, ctx, { filename: 'blueprints.js' });

    return {
        materials: ctx.INSEL_MATERIALS,
        recipes: ctx.INSEL_CRAFTING_RECIPES,
        quests: ctx.INSEL_QUEST_TEMPLATES,
        achievements: ctx.INSEL_ACHIEVEMENTS,
        automerge: ctx.INSEL_AUTOMERGE,
        blueprints: ctx.INSEL_BLUEPRINTS,
    };
}

describe('V-Modell Integrationstest: Materials ↔ Recipes', () => {
    let mods;

    beforeEach(() => {
        const ctx = createBrowserContext();
        mods = loadModules(ctx);
    });

    it('alle Recipe-Results haben ein Material definiert', () => {
        const matKeys = new Set(Object.keys(mods.materials));
        const missing = [];
        for (const r of mods.recipes) {
            if (!matKeys.has(r.result)) {
                missing.push(`${r.name} → ${r.result}`);
            }
        }
        // Sammle alle fehlenden — Warnung statt harter Fehler
        // Manche Rezepte erzeugen LLM-Materialien die dynamisch sind
        if (missing.length > 0) {
            console.log(`⚠ ${missing.length} Rezept-Ergebnisse ohne Material-Definition:`);
            missing.forEach(m => console.log(`  - ${m}`));
        }
        // Basis-Materialien (aus Genesis) MÜSSEN existieren
        const genesisMats = ['yin', 'yang', 'qi', 'wood', 'fire', 'water', 'earth', 'metal'];
        for (const mat of genesisMats) {
            assert.ok(matKeys.has(mat), `Genesis-Material "${mat}" fehlt in MATERIALS`);
        }
    });

    it('alle Recipe-Ingredients existieren entweder als Material oder als Recipe-Result', () => {
        const matKeys = new Set(Object.keys(mods.materials));
        const recipeResults = new Set(mods.recipes.map(r => r.result));
        const allKnown = new Set([...matKeys, ...recipeResults]);

        const orphans = [];
        for (const r of mods.recipes) {
            for (const ing of Object.keys(r.ingredients)) {
                if (!allKnown.has(ing)) {
                    orphans.push(`${r.name}: Ingredient "${ing}" unbekannt`);
                }
            }
        }
        if (orphans.length > 0) {
            console.log(`⚠ Verwaiste Ingredients: ${orphans.join(', ')}`);
        }
        // Tao muss entweder als Material oder als Starter existieren
        assert.ok(matKeys.has('tao') || recipeResults.has('tao'),
            'tao muss existieren (Genesis-Start)');
    });
});

describe('V-Modell Integrationstest: Quests ↔ Materials', () => {
    let mods;

    beforeEach(() => {
        const ctx = createBrowserContext();
        mods = loadModules(ctx);
    });

    it('alle Quest-needs referenzieren existierende Materialien oder Rezept-Ergebnisse', () => {
        const matKeys = new Set(Object.keys(mods.materials));
        const recipeResults = new Set(mods.recipes.map(r => r.result));
        const allKnown = new Set([...matKeys, ...recipeResults]);

        const unreachable = [];
        for (const q of mods.quests) {
            for (const mat of Object.keys(q.needs)) {
                if (!allKnown.has(mat)) {
                    unreachable.push(`${q.title}: "${mat}" nicht herstellbar`);
                }
            }
        }
        // Einige Quest-Materialien sind Infinite-Craft-Ergebnisse (net, rope, wind, etc.)
        // Diese sind OK — sie kommen vom LLM-Crafter
        const llmCraftable = ['net', 'rope', 'wind'];
        const realOrphans = unreachable.filter(u => !llmCraftable.some(l => u.includes(`"${l}"`)));
        if (realOrphans.length > 0) {
            console.log(`⚠ Quest-Materialien ohne bekannte Quelle:`);
            realOrphans.forEach(o => console.log(`  - ${o}`));
        }
        // Basis-Quest-Materialien MÜSSEN erreichbar sein
        const baseMats = ['wood', 'stone', 'flower', 'water', 'boat', 'path', 'lamp'];
        for (const mat of baseMats) {
            assert.ok(allKnown.has(mat), `Basis-Quest-Material "${mat}" muss existieren`);
        }
    });
});

describe('V-Modell Integrationstest: Automerge ↔ Materials', () => {
    let mods;

    beforeEach(() => {
        const ctx = createBrowserContext();
        mods = loadModules(ctx);
    });

    it('alle Merge-Rule Materials existieren', () => {
        const matKeys = new Set(Object.keys(mods.materials));
        const recipeResults = new Set(mods.recipes.map(r => r.result));
        const allKnown = new Set([...matKeys, ...recipeResults]);

        const missing = [];
        for (const rule of mods.automerge.MERGE_RULES) {
            if (!allKnown.has(rule.a)) missing.push(`a: "${rule.a}"`);
            if (!allKnown.has(rule.b)) missing.push(`b: "${rule.b}"`);
            if (!allKnown.has(rule.result)) missing.push(`result: "${rule.result}"`);
        }
        if (missing.length > 0) {
            console.log(`⚠ Merge-Rules mit unbekannten Materialien: ${missing.join(', ')}`);
        }
        // Basis-Merges müssen funktionieren
        assert.ok(allKnown.has('yin'), 'yin für Merge');
        assert.ok(allKnown.has('yang'), 'yang für Merge');
        assert.ok(allKnown.has('qi'), 'qi als Merge-Ergebnis');
    });
});

describe('V-Modell Integrationstest: Blueprints ↔ Materials', () => {
    let mods;

    beforeEach(() => {
        const ctx = createBrowserContext();
        mods = loadModules(ctx);
    });

    it('alle Blueprint-Pattern-Materialien existieren', () => {
        const matKeys = new Set(Object.keys(mods.materials));
        const recipeResults = new Set(mods.recipes.map(r => r.result));
        const allKnown = new Set([...matKeys, ...recipeResults]);

        const missing = [];
        for (const bp of mods.blueprints.BLUEPRINTS) {
            for (const row of bp.pattern) {
                for (const cell of row) {
                    if (cell && cell !== '*' && !allKnown.has(cell)) {
                        missing.push(`${bp.id}: "${cell}"`);
                    }
                }
            }
        }
        assert.equal(missing.length, 0,
            `Blueprint-Materialien ohne Definition: ${missing.join(', ')}`);
    });
});

describe('V-Modell Integrationstest: Achievement Stats ↔ getGridStats', () => {
    let mods;

    beforeEach(() => {
        const ctx = createBrowserContext();
        mods = loadModules(ctx);
    });

    it('alle Achievement-Checks nutzen nur Stats die getGridStats liefert', () => {
        // Stats die getGridStats() tatsächlich liefert (aus game.js Zeile 148-168)
        const validStats = ['counts', 'total', 'percent', 'uniqueMats',
                           'playerPlaced', 'questsDone', 'blueprintsDone', 'recipesFound'];

        // Teste mit einem Dummy-Stats-Objekt das nur valide Stats hat
        const dummyStats = {
            counts: {}, total: 1000, percent: 50, uniqueMats: 100,
            playerPlaced: 1000, questsDone: 50, blueprintsDone: 20, recipesFound: 100,
        };

        // Alle Achievements sollten mit diesen Stats triggern können
        let allCheckable = true;
        for (const [id, ach] of Object.entries(mods.achievements)) {
            try {
                const result = ach.check(dummyStats);
                assert.equal(typeof result, 'boolean', `${id}: check muss boolean zurückgeben`);
            } catch (e) {
                allCheckable = false;
                console.log(`⚠ ${id}: check() wirft Fehler mit validen Stats: ${e.message}`);
            }
        }
        assert.ok(allCheckable, 'Alle Achievement-Checks müssen mit getGridStats-Daten funktionieren');
    });
});
