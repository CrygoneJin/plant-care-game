// === MASS-MAP TESTS (S101) ===
// Higgs-Feld pro Zelle + Gaussian-Falloff.

const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const vm = require('vm');
const path = require('path');

const WORLD = path.resolve(__dirname, '../../src/world');

function createBrowserContext() {
    const context = { window: {}, console, Map, Set, Array, Object, Number, String, Math, Error };
    context.window = context;
    return context;
}

function loadScript(filePath, context) {
    const code = fs.readFileSync(filePath, 'utf-8');
    vm.runInNewContext(code, context, { filename: filePath });
}

function makeGrid(rows, cols, placements) {
    const grid = Array.from({ length: rows }, () => Array(cols).fill(null));
    for (const [r, c, mat] of placements) grid[r][c] = mat;
    return grid;
}

describe('INSEL_MASS_MAP — computeMassMap', () => {
    let ctx;
    let computeMassMap;
    let curvatureDepth;
    let maxMass;

    beforeEach(() => {
        ctx = createBrowserContext();
        loadScript(path.join(WORLD, 'materials.js'), ctx);
        loadScript(path.join(WORLD, 'mass-map.js'), ctx);
        computeMassMap = ctx.INSEL_MASS_MAP.computeMassMap;
        curvatureDepth = ctx.INSEL_MASS_MAP.curvatureDepth;
        maxMass = ctx.INSEL_MASS_MAP.maxMass;
    });

    it('leeres Grid → überall 0', () => {
        const grid = makeGrid(10, 10, []);
        const map = computeMassMap(grid, 10, 10, ctx.INSEL_MATERIALS);
        assert.equal(maxMass(map), 0);
    });

    it('ein Proton auf (5,5) → Map[5][5] > 0, Map[0][0] = 0', () => {
        const grid = makeGrid(15, 15, [[5, 5, 'proton']]);
        const map = computeMassMap(grid, 15, 15, ctx.INSEL_MATERIALS);
        assert.ok(map[5][5] > 0, 'Proton-Zelle sollte Masse haben');
        assert.equal(map[0][0], 0, 'ferne Zelle sollte 0 sein');
    });

    it('Falloff: direkter Nachbar hat Masse, Radius-3-Zelle nicht', () => {
        const grid = makeGrid(15, 15, [[7, 7, 'proton']]);
        const map = computeMassMap(grid, 15, 15, ctx.INSEL_MATERIALS);
        assert.ok(map[7][8] > 0, 'direkter Nachbar bekommt Falloff');
        assert.ok(map[7][6] > 0, 'direkter Nachbar links auch');
        assert.equal(map[7][11], 0, 'Zelle 4 entfernt — jenseits Radius 2, muss 0 sein');
    });

    it('Berg (mass 20) erzeugt mehr Masse als Yang (mass undefined = 0)', () => {
        // Yang hat keine mass im MATERIALS → 0. Berg hat mass 20.
        const gridBerg = makeGrid(10, 10, [[5, 5, 'mountain']]);
        const gridYang = makeGrid(10, 10, [[5, 5, 'yang']]);
        const mapBerg = computeMassMap(gridBerg, 10, 10, ctx.INSEL_MATERIALS);
        const mapYang = computeMassMap(gridYang, 10, 10, ctx.INSEL_MATERIALS);
        assert.ok(mapBerg[5][5] > mapYang[5][5], 'Berg muss schwerer sein als Yang');
        assert.equal(mapYang[5][5], 0, 'Yang ohne mass → 0');
    });

    it('Blackhole erzeugt extrem große Masse', () => {
        const grid = makeGrid(10, 10, [[5, 5, 'blackhole']]);
        const map = computeMassMap(grid, 10, 10, ctx.INSEL_MATERIALS);
        assert.ok(map[5][5] > 1000, 'Blackhole muss >1000 ergeben');
    });

    it('curvatureDepth: Blackhole tiefer als Berg, beide > 0', () => {
        const dBerg = curvatureDepth(20);
        const dBlackhole = curvatureDepth(9999);
        assert.ok(dBerg > 0);
        assert.ok(dBlackhole > dBerg);
        assert.ok(dBlackhole <= 1);
    });

    it('curvatureDepth(0) = 0, curvatureDepth(-5) = 0', () => {
        assert.equal(curvatureDepth(0), 0);
        assert.equal(curvatureDepth(-5), 0);
    });

    it('Zwei Berge übereinander addieren Masse', () => {
        const grid1 = makeGrid(10, 10, [[5, 5, 'mountain']]);
        const grid2 = makeGrid(10, 10, [[5, 5, 'mountain'], [5, 6, 'mountain']]);
        const map1 = computeMassMap(grid1, 10, 10, ctx.INSEL_MATERIALS);
        const map2 = computeMassMap(grid2, 10, 10, ctx.INSEL_MATERIALS);
        // Zelle zwischen beiden Bergen sollte in map2 mehr kriegen
        assert.ok(map2[5][5] > map1[5][5], 'zweiter Berg addiert Falloff-Masse zur ersten Zelle');
    });

    it('Perf: 50×50 Grid mit 20 Bergen < 10ms', () => {
        const placements = [];
        for (let i = 0; i < 20; i++) {
            placements.push([i * 2, i * 2, 'mountain']);
        }
        const grid = makeGrid(50, 50, placements);
        const start = Date.now();
        const map = computeMassMap(grid, 50, 50, ctx.INSEL_MATERIALS);
        const elapsed = Date.now() - start;
        assert.ok(elapsed < 50, `Perf-Budget überschritten: ${elapsed}ms`);
        assert.ok(maxMass(map) > 0);
    });
});
