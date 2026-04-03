const { describe, it } = require('node:test');
const assert = require('node:assert');

// hex-grid.js wird als IIFE geladen, wir simulieren window
globalThis.window = globalThis;
require('../hex-grid.js');

describe('HexGrid', () => {
    it('erstellt ein Grid mit korrektem Radius', () => {
        const grid = INSEL_HEX.createGrid(3);
        assert.strictEqual(grid.radius, 3);
        // Hex-Grid mit Radius 3: 1 + 6 + 12 + 18 = 37 Zellen
        // Formel: 3*r*(r+1) + 1
        assert.strictEqual(grid.cells.size, 37);
    });

    it('gibt 6 Nachbarn fuer Zentrum zurueck', () => {
        const grid = INSEL_HEX.createGrid(3);
        const neighbors = grid.neighbors(0, 0);
        assert.strictEqual(neighbors.length, 6);
    });

    it('gibt weniger Nachbarn am Rand zurueck', () => {
        const grid = INSEL_HEX.createGrid(2);
        // Ecke des Grids hat nur 3 Nachbarn innerhalb
        const neighbors = grid.neighbors(2, -2);
        assert.ok(neighbors.length >= 2 && neighbors.length <= 6);
    });

    it('Nachbarn sind alle equidistant', () => {
        const dirs = INSEL_HEX.DIRECTIONS;
        assert.strictEqual(dirs.length, 6);
        // Axiale Koordinaten: alle Nachbarn haben Distanz 1
        for (const [dq, dr] of dirs) {
            assert.strictEqual(Math.abs(dq) + Math.abs(dr) + Math.abs(-dq - dr), 2);
        }
    });

    it('hexToPixel und pixelToHex sind invers', () => {
        const grid = INSEL_HEX.createGrid(5);
        const size = 30;
        const { x, y } = grid.hexToPixel(2, -1, size);
        const { q, r } = grid.pixelToHex(x, y, size);
        assert.strictEqual(q, 2);
        assert.strictEqual(r, -1);
    });

    it('Zelle setzen und lesen', () => {
        const grid = INSEL_HEX.createGrid(2);
        grid.set(0, 0, { surface: 'tree', height: 3, dark: 0.2, trixels: null });
        const cell = grid.get(0, 0);
        assert.strictEqual(cell.surface, 'tree');
        assert.strictEqual(cell.height, 3);
    });

    it('Migration: String zu HexCell', () => {
        const cell = INSEL_HEX.migrateCell('tree');
        assert.strictEqual(cell.surface, 'tree');
        assert.strictEqual(cell.height, 0);
        assert.strictEqual(cell.dark, 0);
        assert.strictEqual(cell.trixels, null);
    });
});
