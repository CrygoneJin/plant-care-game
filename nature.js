// === INSEL NATURE — Baumwachstum + Welt-Konsequenzen ===
// Extrahiert aus game.js (Zellteilung #11)
(function() {
    'use strict';

    // Shared state — game.js liest/schreibt direkt auf dieses Objekt
    /** @type {Record<string, number>} */
    var treeGrowth = {};

    // Konstanten
    var TREE_GROWTH_TIME_1 = 30000; // Setzling → kleiner Baum: 30s
    var TREE_GROWTH_TIME_2 = 60000; // Kleiner Baum → großer Baum: 60s

    /**
     * Setzling → small_tree → tree Progression
     * @param {Array<Array<string|null>>} grid
     * @param {number} ROWS
     * @param {number} COLS
     * @param {Object} MATERIALS
     * @param {Object} callbacks - { addPlaceAnimation, unlockMaterial, updateStats, requestRedraw }
     */
    function updateTreeGrowth(grid, ROWS, COLS, MATERIALS, callbacks) {
        var now = Date.now();
        var changed = false;
        for (var key of Object.keys(treeGrowth)) {
            var parts = key.split(',').map(Number);
            var r = parts[0], c = parts[1];
            if (r >= ROWS || c >= COLS || r < 0 || c < 0) {
                delete treeGrowth[key];
                continue;
            }
            var planted = treeGrowth[key];
            var age = now - planted;
            var cell = grid[r] && grid[r][c];

            // Wu Xing: Wasser nährt Holz — Setzling neben Wasser wächst 2x schneller
            var hasWaterNeighbor = [[r-1,c],[r+1,c],[r,c-1],[r,c+1]]
                .some(function(pair) {
                    var nr = pair[0], nc = pair[1];
                    return nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && grid[nr] && grid[nr][nc] === 'water';
                });
            var growTime1 = hasWaterNeighbor ? TREE_GROWTH_TIME_1 / 2 : TREE_GROWTH_TIME_1;

            if (cell === 'sapling' && age >= growTime1) {
                grid[r][c] = 'small_tree';
                callbacks.addPlaceAnimation(r, c);
                changed = true;
            } else if (cell === 'small_tree' && age >= growTime1 + TREE_GROWTH_TIME_2) {
                grid[r][c] = 'tree';
                delete treeGrowth[key];
                callbacks.addPlaceAnimation(r, c);
                callbacks.unlockMaterial('tree');
                changed = true;
            } else if (cell !== 'sapling' && cell !== 'small_tree') {
                delete treeGrowth[key];
            }
        }
        if (changed) callbacks.updateStats();
    }

    /**
     * Brunnen → Blumen, Wasser → Blumen, Feuer → Asche
     * @param {Array<Array<string|null>>} grid
     * @param {number} ROWS
     * @param {number} COLS
     * @param {Object} MATERIALS
     * @param {Object} callbacks - { addPlaceAnimation, unlockMaterial, updateStats, showToast, requestRedraw }
     */
    function updateWorldConsequences(grid, ROWS, COLS, MATERIALS, callbacks) {
        var changed = false;
        var FLOWER_CHANCE = 0.15;
        var BEACH_EDGE = 2;
        for (var r = BEACH_EDGE + 1; r < ROWS - BEACH_EDGE - 1; r++) {
            for (var c = BEACH_EDGE + 1; c < COLS - BEACH_EDGE - 1; c++) {
                if (grid[r][c] !== null) continue;
                var neighbors = [[r-1,c],[r+1,c],[r,c-1],[r,c+1]];
                var hasFountain = neighbors.some(function(pair) {
                    var nr = pair[0], nc = pair[1];
                    return nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && grid[nr] && grid[nr][nc] === 'fountain';
                });
                if (hasFountain && Math.random() < FLOWER_CHANCE) {
                    grid[r][c] = 'flower';
                    callbacks.addPlaceAnimation(r, c);
                    callbacks.unlockMaterial('flower');
                    changed = true;
                }
            }
        }
        if (changed) {
            callbacks.updateStats();
            callbacks.showToast('🌺 Brunnen-Magie! Blumen wachsen...');
        }
    }

    // Public API
    window.INSEL_NATURE = {
        treeGrowth: treeGrowth,
        updateTreeGrowth: updateTreeGrowth,
        updateWorldConsequences: updateWorldConsequences,
        /** Timer starten — wird von game.js nach Grid-Init aufgerufen */
        start: function(grid, ROWS, COLS, MATERIALS, callbacks) {
            setInterval(function() { updateTreeGrowth(grid, ROWS, COLS, MATERIALS, callbacks); }, 5000);
            setInterval(function() { updateWorldConsequences(grid, ROWS, COLS, MATERIALS, callbacks); }, 8000);
        }
    };
})();
