// === CURVATURE-ORDERING TESTS (S101) ===
// Verifiziert dass schwerere Materialien tiefere Dellen erzeugen.
// Integrations-Test: Mass-Map → Curvature-Depth.

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

describe('Curvature-Ordering — Masse → Dellen-Tiefe', () => {
    let ctx;
    let computeMassMap;
    let curvatureDepth;

    beforeEach(() => {
        ctx = createBrowserContext();
        loadScript(path.join(WORLD, 'materials.js'), ctx);
        loadScript(path.join(WORLD, 'mass-map.js'), ctx);
        computeMassMap = ctx.INSEL_MASS_MAP.computeMassMap;
        curvatureDepth = ctx.INSEL_MASS_MAP.curvatureDepth;
    });

    it('Mountain (mass 20) erzeugt tiefere Delle als Yang (mass 0)', () => {
        const gMountain = makeGrid(10, 10, [[5, 5, 'mountain']]);
        const gYang = makeGrid(10, 10, [[5, 5, 'yang']]);
        const mMountain = computeMassMap(gMountain, 10, 10, ctx.INSEL_MATERIALS);
        const mYang = computeMassMap(gYang, 10, 10, ctx.INSEL_MATERIALS);
        const dMountain = curvatureDepth(mMountain[5][5]);
        const dYang = curvatureDepth(mYang[5][5]);
        assert.ok(dMountain > dYang, `Mountain-Depth ${dMountain} muss > Yang-Depth ${dYang} sein`);
        assert.equal(dYang, 0, 'Yang hat keine Masse → Depth 0');
    });

    it('Blackhole (mass 9999) erzeugt tiefere Delle als Mountain (mass 20)', () => {
        const gBlackhole = makeGrid(10, 10, [[5, 5, 'blackhole']]);
        const gMountain = makeGrid(10, 10, [[5, 5, 'mountain']]);
        const mBlackhole = computeMassMap(gBlackhole, 10, 10, ctx.INSEL_MATERIALS);
        const mMountain = computeMassMap(gMountain, 10, 10, ctx.INSEL_MATERIALS);
        const dBlackhole = curvatureDepth(mBlackhole[5][5]);
        const dMountain = curvatureDepth(mMountain[5][5]);
        assert.ok(dBlackhole > dMountain, 'Blackhole tiefer als Berg');
    });

    it('Proton (mass 20) ≈ Mountain (mass 20) — gleiche Delle', () => {
        const gProton = makeGrid(10, 10, [[5, 5, 'proton']]);
        const gMountain = makeGrid(10, 10, [[5, 5, 'mountain']]);
        const mProton = computeMassMap(gProton, 10, 10, ctx.INSEL_MATERIALS);
        const mMountain = computeMassMap(gMountain, 10, 10, ctx.INSEL_MATERIALS);
        assert.equal(mProton[5][5], mMountain[5][5], 'gleiche Masse → gleiche Mass-Map-Werte');
    });

    it('Rail (mass 8) < Station (mass 15) < Mountain (mass 20) — Reihenfolge stimmt', () => {
        const gRail = makeGrid(10, 10, [[5, 5, 'rail']]);
        const gStation = makeGrid(10, 10, [[5, 5, 'station']]);
        const gMountain = makeGrid(10, 10, [[5, 5, 'mountain']]);
        const mRail = computeMassMap(gRail, 10, 10, ctx.INSEL_MATERIALS);
        const mStation = computeMassMap(gStation, 10, 10, ctx.INSEL_MATERIALS);
        const mMountain = computeMassMap(gMountain, 10, 10, ctx.INSEL_MATERIALS);
        assert.ok(mRail[5][5] < mStation[5][5]);
        assert.ok(mStation[5][5] < mMountain[5][5]);
    });
});
