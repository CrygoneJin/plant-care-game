// === AUTOMERGE — Nachbarschafts-Physik ===
// Exportiert als window.INSEL_AUTOMERGE
// Wenn Materialien nebeneinander liegen, passieren Dinge.
// Wie 2048. Wie Lattice QCD. Wie Conway. Wie Oscar.

(function() {
    'use strict';

    // Nachbarschafts-Regeln: wenn A neben B → C entsteht
    const MERGE_RULES = [
        // === Genesis ===
        { a: 'yin', b: 'yang', result: 'qi', msg: '✨ Yin + Yang → Qi!' },

        // === Teilchenphysik (Pauli-Prinzip & Confinement) ===

        // Meson-Bildung: Charm + Strange → Antimaterie
        { a: 'charm', b: 'strange', result: 'antimatter', msg: '⚛️ Charm + Strange → Antimaterie!' },

        // E=mc²: Antimaterie trifft Materie → Energie
        { a: 'antimatter', b: 'qi', result: 'fire', msg: '💥 Antimaterie + Energie → Feuer! (E=mc²)' },

        // === Pauli-Prinzip: A×A → nächste Generation (Multiplikation) ===
        // Identische Fermionen können nicht am selben Ort sein.
        // Pauli-Druck → höhere Energie → schwerer → nächste Generation.
        //
        // Up-type:   Yang → Charm → Berg (Top)
        // Down-type: Yin → Strange → Höhle (Bottom)
        // Lepton:    Elektron → Myon → Tau
        { a: 'yang', b: 'yang', result: 'charm', msg: '💫 Yang × Yang → Charm! (Pauli-Druck: Gen1→2)' },
        { a: 'yin', b: 'yin', result: 'strange', msg: '🌀 Yin × Yin → Strange! (Pauli-Druck: Gen1→2)' },
        { a: 'charm', b: 'charm', result: 'mountain', msg: '🏔️ Charm × Charm → Berg! (Pauli-Druck: Gen2→3, Top-Quark)' },
        { a: 'strange', b: 'strange', result: 'cave', msg: '🕳️ Strange × Strange → Höhle! (Pauli-Druck: Gen2→3, Bottom-Quark)' },
        { a: 'electron', b: 'electron', result: 'muon', msg: '🔸 Elektron × Elektron → Myon! (Pauli-Druck: Gen1→2)' },
        { a: 'muon', b: 'muon', result: 'tau', msg: '🔻 Myon × Myon → Tau! (Pauli-Druck: Gen2→3)' },

        // === Wu Xing Erzeugungszyklus (相生 xiāng shēng) ===
        // Holz nährt Feuer, Feuer erzeugt Erde (Asche),
        // Erde birgt Metall, Metall sammelt Wasser (Kondensation),
        // Wasser nährt Holz
        // Diese Merges passieren NICHT automatisch — zu aggressiv.
        // Stattdessen: Wachstums-Bonus. Holz neben Wasser → Holz wächst.

        // === Starke Kernkraft: RGB → farbneutral ===
        // fire(rot) + wood(grün) + water(blau) nebeneinander → metal(weiß)
        // Dies ist eine Triplet-Regel, separat behandelt.
    ];

    // Triplet-Regeln (3 Materialien zusammen)
    const TRIPLET_RULES = [
        {
            materials: ['fire', 'wood', 'water'],
            result: 'metal',
            msg: '⚪ Rot + Grün + Blau → Metall! Alle Farben zusammen!'
        },
    ];

    function getNeighbors(r, c, rows, cols) {
        return [[r-1,c],[r+1,c],[r,c-1],[r,c+1]]
            .filter(([nr,nc]) => nr >= 0 && nr < rows && nc >= 0 && nc < cols);
    }

    function getAllNeighbors(r, c, rows, cols) {
        return [[r-1,c],[r+1,c],[r,c-1],[r,c+1],[r-1,c-1],[r+1,c+1],[r-1,c+1],[r+1,c-1]]
            .filter(([nr,nc]) => nr >= 0 && nr < rows && nc >= 0 && nc < cols);
    }

    // Check and execute merges after a block is placed at (r,c)
    /** @param {Grid} grid @param {number} r @param {number} c @param {number} rows @param {number} cols @returns {MergeResult | null} */
    function checkMerge(grid, r, c, rows, cols) {
        const cell = grid[r][c];
        if (!cell) return null;

        // Pair merges
        const neighbors = getNeighbors(r, c, rows, cols);
        for (const rule of MERGE_RULES) {
            if (cell === rule.a) {
                for (const [nr, nc] of neighbors) {
                    if (grid[nr][nc] === rule.b) {
                        return {
                            type: 'pair',
                            cells: [[r,c],[nr,nc]],
                            result: rule.result,
                            msg: rule.msg
                        };
                    }
                }
            }
            if (cell === rule.b) {
                for (const [nr, nc] of neighbors) {
                    if (grid[nr][nc] === rule.a) {
                        return {
                            type: 'pair',
                            cells: [[r,c],[nr,nc]],
                            result: rule.result,
                            msg: rule.msg
                        };
                    }
                }
            }
        }

        // Triplet merges (RGB → Metal)
        const allNeighbors = getAllNeighbors(r, c, rows, cols);
        for (const rule of TRIPLET_RULES) {
            if (!rule.materials.includes(cell)) continue;
            for (let i = 0; i < allNeighbors.length; i++) {
                const [nr1, nc1] = allNeighbors[i];
                if (!rule.materials.includes(grid[nr1]?.[nc1])) continue;
                for (let j = i + 1; j < allNeighbors.length; j++) {
                    const [nr2, nc2] = allNeighbors[j];
                    if (!rule.materials.includes(grid[nr2]?.[nc2])) continue;
                    const trio = new Set([cell, grid[nr1][nc1], grid[nr2][nc2]]);
                    if (trio.size === 3) {
                        return {
                            type: 'triplet',
                            cells: [[r,c],[nr1,nc1],[nr2,nc2]],
                            result: rule.result,
                            msg: rule.msg
                        };
                    }
                }
            }
        }

        return null;
    }

    window.INSEL_AUTOMERGE = {
        checkMerge,
        MERGE_RULES,
        TRIPLET_RULES,
    };
})();
