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
    const code = fs.readFileSync(path.join(SRC, 'world/blueprints.js'), 'utf-8');
    vm.runInNewContext(code, ctx, { filename: 'blueprints.js' });
    return ctx.INSEL_BLUEPRINTS;
}

function makeGrid(rows, cols) {
    return Array.from({ length: rows }, () => Array(cols).fill(null));
}

describe('Blueprints', () => {
    let blueprints;

    beforeEach(() => {
        const ctx = createBrowserContext();
        blueprints = load(ctx);
    });

    it('exportiert BLUEPRINTS Array + findBlueprint + matchPattern', () => {
        assert.ok(Array.isArray(blueprints.BLUEPRINTS));
        assert.equal(typeof blueprints.findBlueprint, 'function');
        assert.equal(typeof blueprints.matchPattern, 'function');
    });

    it('hat mindestens 5 Baupläne', () => {
        assert.ok(blueprints.BLUEPRINTS.length >= 5,
            `Erwartet >= 5 Blueprints, hat ${blueprints.BLUEPRINTS.length}`);
    });

    it('jeder Blueprint hat id, name, emoji, desc, pattern', () => {
        for (const bp of blueprints.BLUEPRINTS) {
            assert.ok(bp.id, `Blueprint braucht id`);
            assert.ok(bp.name, `${bp.id}: braucht name`);
            assert.ok(bp.emoji, `${bp.id}: braucht emoji`);
            assert.ok(bp.desc, `${bp.id}: braucht desc`);
            assert.ok(Array.isArray(bp.pattern), `${bp.id}: pattern muss Array sein`);
        }
    });

    it('jedes Pattern ist 4×4', () => {
        for (const bp of blueprints.BLUEPRINTS) {
            assert.equal(bp.pattern.length, 4, `${bp.id}: Pattern muss 4 Zeilen haben`);
            for (const row of bp.pattern) {
                assert.equal(row.length, 4, `${bp.id}: Jede Pattern-Zeile muss 4 Spalten haben`);
            }
        }
    });

    it('keine doppelten Blueprint-IDs', () => {
        const ids = blueprints.BLUEPRINTS.map(b => b.id);
        const unique = new Set(ids);
        assert.equal(ids.length, unique.size, `Doppelte IDs: ${ids.filter((id, i) => ids.indexOf(id) !== i)}`);
    });

    it('Hütte (hut) hat korrektes Pattern', () => {
        const hut = blueprints.BLUEPRINTS.find(b => b.id === 'hut');
        assert.ok(hut, 'Hütte existiert');
        // Erste Reihe: roof in der Mitte
        assert.equal(hut.pattern[0][1], 'roof');
        assert.equal(hut.pattern[0][2], 'roof');
        // Letzte Reihe: door
        assert.equal(hut.pattern[3][1], 'door');
    });

    it('matchPattern erkennt korrektes Grid', () => {
        const hut = blueprints.BLUEPRINTS.find(b => b.id === 'hut');
        const grid = makeGrid(10, 10);
        // Pattern in Grid einsetzen ab (2,2)
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                if (hut.pattern[r][c]) {
                    grid[r + 2][c + 2] = hut.pattern[r][c];
                }
            }
        }
        const match = blueprints.matchPattern(grid, 2, 2, 10, 10, hut.pattern);
        assert.ok(match, 'Hütte sollte erkannt werden');
    });

    it('matchPattern erkennt falsches Grid nicht', () => {
        const hut = blueprints.BLUEPRINTS.find(b => b.id === 'hut');
        const grid = makeGrid(10, 10);
        grid[2][3] = 'stone'; // Falsches Material wo roof sein sollte
        const match = blueprints.matchPattern(grid, 2, 2, 10, 10, hut.pattern);
        assert.equal(match, false, 'Falsches Grid sollte nicht matchen');
    });

    it('Pattern-Zellen sind gültige Materialien oder null/*', () => {
        for (const bp of blueprints.BLUEPRINTS) {
            for (const row of bp.pattern) {
                for (const cell of row) {
                    if (cell !== null && cell !== '*') {
                        assert.ok(/^[a-z_]+$/.test(cell),
                            `${bp.id}: Ungültige Pattern-Zelle "${cell}"`);
                    }
                }
            }
        }
    });
});
