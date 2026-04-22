// === BLACKHOLE TESTS (S101) ===
// Einsauger + Hawking-Rückgabe. RNG injectable für Determinismus.

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

// Seeded pseudo-RNG (nicht kryptografisch, deterministisch genug für Tests)
function seededRng(seed) {
    let s = seed;
    return function() {
        s = (s * 9301 + 49297) % 233280;
        return s / 233280;
    };
}

describe('INSEL_BLACKHOLE — tickBlackhole', () => {
    let ctx;
    let tickBlackhole;

    beforeEach(() => {
        ctx = createBrowserContext();
        loadScript(path.join(WORLD, 'materials.js'), ctx);
        loadScript(path.join(WORLD, 'blackhole.js'), ctx);
        tickBlackhole = ctx.INSEL_BLACKHOLE.tickBlackhole;
    });

    it('Blackhole ohne Nachbarn → keine Events', () => {
        const grid = makeGrid(5, 5, [[2, 2, 'blackhole']]);
        const rng = () => 0.0; // forciert Einsaug wenn möglich
        const events = tickBlackhole(grid, 5, 5, rng);
        assert.equal(events.length, 0);
        assert.equal(grid[2][2], 'blackhole');
    });

    it('Blackhole + Yang-Nachbar, RNG 0 → Yang gefressen', () => {
        const grid = makeGrid(5, 5, [
            [2, 2, 'blackhole'],
            [2, 3, 'yang'],
        ]);
        // RNG ultra-niedrig: Einsaug (0.0 < 0.3) triggert. Hawking (0.0 < 0.2) auch.
        const rng = () => 0.0;
        const events = tickBlackhole(grid, 5, 5, rng);
        assert.equal(grid[2][3], null, 'Yang weg');
        assert.ok(events.some(e => e.type === 'eat' && e.material === 'yang'));
    });

    it('Blackhole + Nachbar, RNG hoch → kein Einsaug', () => {
        const grid = makeGrid(5, 5, [
            [2, 2, 'blackhole'],
            [2, 3, 'yang'],
        ]);
        const rng = () => 0.99; // > 0.3, kein Einsaug
        const events = tickBlackhole(grid, 5, 5, rng);
        assert.equal(grid[2][3], 'yang', 'Yang bleibt');
        assert.equal(events.length, 0);
    });

    it('Blackhole konsumiert Ocean NICHT (unbaubar-Schutz)', () => {
        const grid = makeGrid(5, 5, [
            [2, 2, 'blackhole'],
            [2, 3, 'ocean'],
        ]);
        const rng = () => 0.0;
        const events = tickBlackhole(grid, 5, 5, rng);
        assert.equal(grid[2][3], 'ocean', 'Ocean bleibt');
        assert.ok(!events.some(e => e.material === 'ocean'));
    });

    it('Blackhole konsumiert andere Blackhole NICHT', () => {
        const grid = makeGrid(5, 5, [
            [2, 2, 'blackhole'],
            [2, 3, 'blackhole'],
        ]);
        const rng = () => 0.0;
        const events = tickBlackhole(grid, 5, 5, rng);
        assert.equal(grid[2][2], 'blackhole');
        assert.equal(grid[2][3], 'blackhole');
        assert.equal(events.length, 0);
    });

    it('Hawking-Rückgabe: über viele Ticks erscheint Yin oder Yang in Radius 2', () => {
        // Blackhole in der Mitte, Nachbar-Yang als Einsaug-Futter (jeden Tick nachfüllen).
        // Mit 200 Ticks und RNG = 0.1 (immer Erfolgspfad) muss Hawking-Rückgabe kommen.
        const rng = seededRng(42);
        let hawkingSeen = false;

        for (let t = 0; t < 200; t++) {
            const grid = makeGrid(7, 7, [
                [3, 3, 'blackhole'],
                [3, 4, 'yang'], // frisches Futter pro Tick
            ]);
            const events = tickBlackhole(grid, 7, 7, rng);
            if (events.some(e => e.type === 'hawking')) {
                hawkingSeen = true;
                // Prüfe dass Hawking-Zelle tatsächlich Yin oder Yang ist
                const hawkEvent = events.find(e => e.type === 'hawking');
                assert.ok(['yin', 'yang'].includes(hawkEvent.result), 'Hawking muss yin/yang zurückgeben');
                const [hr, hc] = [hawkEvent.r, hawkEvent.c];
                assert.ok(Math.abs(hr - 3) <= 2 && Math.abs(hc - 3) <= 2, 'in Radius 2');
                break;
            }
        }
        assert.ok(hawkingSeen, 'Hawking-Rückgabe muss in 200 Ticks kommen');
    });

    it('RNG forciert: Einsaug 0.1 < 0.3, Hawking 0.1 < 0.2 → immer Hawking', () => {
        const grid = makeGrid(7, 7, [
            [3, 3, 'blackhole'],
            [3, 4, 'yang'],
        ]);
        const rng = () => 0.1;
        const events = tickBlackhole(grid, 7, 7, rng);
        assert.ok(events.some(e => e.type === 'eat'));
        assert.ok(events.some(e => e.type === 'hawking'));
    });

    it('Mehrere Blackholes im Grid funktionieren parallel', () => {
        const grid = makeGrid(10, 10, [
            [2, 2, 'blackhole'], [2, 3, 'yang'],
            [7, 7, 'blackhole'], [7, 8, 'yin'],
        ]);
        const rng = () => 0.0;
        tickBlackhole(grid, 10, 10, rng);
        assert.equal(grid[2][3], null);
        assert.equal(grid[7][8], null);
    });
});
