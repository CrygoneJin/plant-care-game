// === HAUPTGRUPPEN-ELEMENTE RECIPE TESTS ===
// Prüft dass jedes Element-Rezept:
//   1. Ladungs-neutral ist (Σ charge = 0).
//   2. Massen-Konsistenz hat (Σ atomicMass/mass der Ingredients = Ziel-atomicMass).
//   3. Gültige Ingredients hat (alle als Material definiert).
//   4. Physikalisch korrekten Ordnungszahl/atomicMass-Wert trägt.
//
// Vorbild: ops/tests/atom-recognizer.test.js (vm.runInNewContext, node:test).

const { describe, it, before } = require('node:test');
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

// Liste der neuen Hauptgruppen-Elemente (Materials-Keys).
// Diese müssen in materials.js vorhanden sein und mit Recipe craftbar.
const HAUPTGRUPPEN_KEYS = [
    'hydrogen', 'helium', 'lithium', 'beryllium', 'boron',
    'carbon', 'nitrogen', 'oxygen', 'fluorine', 'neon',
    'sodium', 'magnesium', 'aluminum', 'silicon', 'phosphorus',
    'sulfur', 'chlorine', 'argon', 'potassium', 'calcium',
    'gallium', 'bromine', 'krypton', 'rubidium', 'strontium',
    'tin', 'iodine', 'xenon', 'cesium', 'barium', 'radon',
];

// Expected Periodensystem-Daten für Cross-Check.
const EXPECTED = {
    hydrogen:   { Z: 1,  A: 1 },
    helium:     { Z: 2,  A: 4 },
    lithium:    { Z: 3,  A: 7 },
    beryllium:  { Z: 4,  A: 9 },
    boron:      { Z: 5,  A: 11 },
    carbon:     { Z: 6,  A: 12 },
    nitrogen:   { Z: 7,  A: 14 },
    oxygen:     { Z: 8,  A: 16 },
    fluorine:   { Z: 9,  A: 19 },
    neon:       { Z: 10, A: 20 },
    sodium:     { Z: 11, A: 23 },
    magnesium:  { Z: 12, A: 24 },
    aluminum:   { Z: 13, A: 27 },
    silicon:    { Z: 14, A: 28 },
    phosphorus: { Z: 15, A: 31 },
    sulfur:     { Z: 16, A: 32 },
    chlorine:   { Z: 17, A: 35 },
    argon:      { Z: 18, A: 40 },
    potassium:  { Z: 19, A: 39 },
    calcium:    { Z: 20, A: 40 },
    gallium:    { Z: 31, A: 70 },
    bromine:    { Z: 35, A: 80 },
    krypton:    { Z: 36, A: 84 },
    rubidium:   { Z: 37, A: 85 },
    strontium:  { Z: 38, A: 88 },
    tin:        { Z: 50, A: 120 },
    iodine:     { Z: 53, A: 127 },
    xenon:      { Z: 54, A: 132 },
    cesium:     { Z: 55, A: 133 },
    barium:     { Z: 56, A: 138 },
    radon:      { Z: 86, A: 222 },
};

// Ladungen der Atom-Bausteine (aus atom-recognizer.js).
const CHARGES = { proton: 1, neutron: 0, electron: -1 };

describe('HAUPTGRUPPEN-ELEMENTE — Materials', () => {
    let ctx;
    let materials;

    before(() => {
        ctx = createBrowserContext();
        loadScript(path.join(WORLD, 'materials.js'), ctx);
        materials = ctx.window.INSEL_MATERIALS;
    });

    it('alle 31 Element-Keys sind in materials.js definiert', () => {
        for (const key of HAUPTGRUPPEN_KEYS) {
            assert.ok(materials[key], `Material fehlt: ${key}`);
        }
    });

    it('alle Elemente haben charge=0 (neutrale Atome)', () => {
        for (const key of HAUPTGRUPPEN_KEYS) {
            assert.strictEqual(materials[key].charge, 0, `${key}: charge sollte 0 sein`);
        }
    });

    it('alle Elemente haben korrekte ordnungszahl (Z)', () => {
        for (const key of HAUPTGRUPPEN_KEYS) {
            const expected = EXPECTED[key].Z;
            assert.strictEqual(
                materials[key].ordnungszahl, expected,
                `${key}: ordnungszahl sollte ${expected} sein, ist ${materials[key].ordnungszahl}`
            );
        }
    });

    it('alle Elemente haben korrekte atomicMass (A)', () => {
        for (const key of HAUPTGRUPPEN_KEYS) {
            const expected = EXPECTED[key].A;
            assert.strictEqual(
                materials[key].atomicMass, expected,
                `${key}: atomicMass sollte ${expected} sein, ist ${materials[key].atomicMass}`
            );
        }
    });

    it('alle Elemente haben Emoji + Label', () => {
        for (const key of HAUPTGRUPPEN_KEYS) {
            assert.ok(materials[key].emoji, `${key}: emoji fehlt`);
            assert.ok(materials[key].label, `${key}: label fehlt`);
        }
    });

    it('kein Element überschreibt das Spielphysik-mass-Feld', () => {
        // `mass` ist reserviert für Curvature/Blackhole.
        // Elemente speichern Atommasse in `atomicMass`, NICHT in `mass`.
        for (const key of HAUPTGRUPPEN_KEYS) {
            assert.strictEqual(
                materials[key].mass, undefined,
                `${key}: darf kein mass-Feld haben (kollidiert mit Curvature)`
            );
        }
    });
});

describe('HAUPTGRUPPEN-ELEMENTE — Recipes', () => {
    let ctx;
    let materials;
    let recipes;
    let elementRecipes;

    before(() => {
        ctx = createBrowserContext();
        loadScript(path.join(WORLD, 'materials.js'), ctx);
        loadScript(path.join(WORLD, 'recipes.js'), ctx);
        materials = ctx.window.INSEL_MATERIALS;
        recipes = ctx.window.INSEL_CRAFTING_RECIPES;

        // Alle Rezepte die ein Hauptgruppen-Element produzieren
        elementRecipes = recipes.filter(r => HAUPTGRUPPEN_KEYS.includes(r.result));
    });

    it('jedes Hauptgruppen-Element hat mindestens ein Rezept', () => {
        for (const key of HAUPTGRUPPEN_KEYS) {
            const r = elementRecipes.find(x => x.result === key);
            assert.ok(r, `Kein Rezept für ${key}`);
        }
    });

    it('Wasserstoff-Rezept funktioniert: 1p + 1e → 1 hydrogen', () => {
        const r = elementRecipes.find(x => x.result === 'hydrogen');
        assert.ok(r);
        assert.strictEqual(r.ingredients.proton, 1);
        assert.strictEqual(r.ingredients.electron, 1);
        assert.strictEqual(r.resultCount, 1);
    });

    it('Helium-Rezept funktioniert: 2p + 2n + 2e → 1 helium', () => {
        const r = elementRecipes.find(x => x.result === 'helium');
        assert.ok(r);
        assert.strictEqual(r.ingredients.proton, 2);
        assert.strictEqual(r.ingredients.neutron, 2);
        assert.strictEqual(r.ingredients.electron, 2);
    });

    it('alle Elemente bis Calcium (Z≤20) sind direkt craftbar aus p/n/e', () => {
        const Z20_KEYS = HAUPTGRUPPEN_KEYS.slice(0, 20);
        for (const key of Z20_KEYS) {
            const r = elementRecipes.find(x => x.result === key);
            const ing = r.ingredients;
            // Nur proton/neutron/electron zulässig als Ingredients für Z ≤ 20
            const allowed = new Set(['proton', 'neutron', 'electron']);
            for (const ingKey of Object.keys(ing)) {
                assert.ok(
                    allowed.has(ingKey),
                    `${key}-Rezept hat unerwartete Zutat "${ingKey}" — sollte nur p/n/e nutzen`
                );
            }
        }
    });

    it('alle Edelgase erscheinen als Zielmaterial (He, Ne, Ar, Kr, Xe, Rn)', () => {
        const NOBLE = ['helium', 'neon', 'argon', 'krypton', 'xenon', 'radon'];
        for (const key of NOBLE) {
            assert.ok(
                elementRecipes.find(x => x.result === key),
                `Edelgas ${key} hat kein Rezept`
            );
            assert.ok(materials[key], `Edelgas ${key} kein Material`);
        }
    });

    // HEILIGE KUH: Ladungs-Summe muss 0 sein in jedem Rezept.
    it('Ladungs-Summe im Rezept = 0 (physikalisch korrekt)', () => {
        for (const r of elementRecipes) {
            let charge = 0;
            for (const [ing, count] of Object.entries(r.ingredients)) {
                // Wenn Ingredient ein anderes Element ist, charge=0 (neutrale Atome)
                // Wenn Ingredient ein Baustein p/n/e, nimm CHARGES
                if (ing in CHARGES) {
                    charge += count * CHARGES[ing];
                } else if (materials[ing] && typeof materials[ing].charge === 'number') {
                    charge += count * materials[ing].charge;
                } else {
                    // unbekannte Ingredients → treat as charge 0 (wird separat geprüft)
                    charge += 0;
                }
            }
            // Ergebnis ist neutrales Atom (charge=0), also Ingredients müssen
            // zusammen ebenfalls neutral sein.
            assert.strictEqual(
                charge, 0,
                `Rezept für ${r.result}: Σ charge = ${charge}, erwartet 0`
            );
        }
    });

    // Masse: Σ(A der Ingredients) = atomicMass des Ziel-Elements
    it('Massen-Summe im Rezept = atomicMass des Elements', () => {
        // Proton und Neutron haben Nukleonen-Masse=1, Elektron=0 (physikalisch ~1/1836)
        const NUCLEON_MASS = { proton: 1, neutron: 1, electron: 0 };
        for (const r of elementRecipes) {
            let massSum = 0;
            for (const [ing, count] of Object.entries(r.ingredients)) {
                if (ing in NUCLEON_MASS) {
                    massSum += count * NUCLEON_MASS[ing];
                } else if (materials[ing] && typeof materials[ing].atomicMass === 'number') {
                    massSum += count * materials[ing].atomicMass;
                }
            }
            const expected = materials[r.result].atomicMass;
            assert.strictEqual(
                massSum, expected,
                `Rezept für ${r.result}: Σ Nukleonen = ${massSum}, atomicMass = ${expected}`
            );
        }
    });

    it('alle Recipe-Ingredients sind gültige Materials', () => {
        for (const r of elementRecipes) {
            for (const ing of Object.keys(r.ingredients)) {
                assert.ok(
                    materials[ing],
                    `Rezept ${r.result}: Ingredient "${ing}" ist kein Material`
                );
            }
        }
    });

    it('Z > 20 Rezepte nutzen Fusion (verweisen auf kleineres Element)', () => {
        const FUSION_KEYS = HAUPTGRUPPEN_KEYS.slice(20); // ab gallium
        for (const key of FUSION_KEYS) {
            const r = elementRecipes.find(x => x.result === key);
            const hasElementIngredient = Object.keys(r.ingredients).some(
                ing => HAUPTGRUPPEN_KEYS.includes(ing)
            );
            assert.ok(
                hasElementIngredient,
                `Fusion-Rezept für ${key} sollte ein anderes Element als Basis haben`
            );
        }
    });
});
