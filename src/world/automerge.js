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

        // Paarproduktion: Antimaterie + Quark → Lepton (β-Zerfall-Analogon)
        { a: 'antimatter', b: 'yang', result: 'electron', msg: '🔹 Antimaterie + Yang → Elektron! (Paarproduktion)' },

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

        // === Higgs-Boson: Top+Bottom-Fusion (Gen3-Quark-Paar, 125 GeV) ===
        // Der LHC entdeckt Higgs u.a. durch Top-Quark-Loops (gg → H).
        // Im Spiel: Berg (Top) + Höhle (Bottom) → Higgs-Boson.
        // Kollisionsfrei: mountain×mountain und cave×cave haben keine Pair-Regel.
        { a: 'mountain', b: 'cave', result: 'higgs_boson', msg: '🫧 Berg + Höhle → Higgs-Boson! (Top+Bottom-Fusion, 125 GeV)' },

        // === Mesonen: Quark + Lepton-Proxy (Annihilations-Spielmechanik) ===
        // Echte Mesonen sind Quark-Antiquark-Paare. Im Spiel ist das Elektron
        // der Stellvertreter für ein Antiquark — negative Ladung, leicht, genau ein Partner.
        // Pion (π): up + anti-down → yang + electron
        // Kaon (K): up + anti-strange → strange + electron
        // Hinweis Rule-Order: electron+yin → neutrino steht WEITER UNTEN und bleibt
        // unverändert. yang+electron und strange+electron waren vorher kollisionsfrei.
        { a: 'yang', b: 'electron', result: 'pion', msg: '🎯 Yang + Elektron → Pion! (Leichtestes Meson)' },
        { a: 'strange', b: 'electron', result: 'kaon', msg: '🪩 Strange + Elektron → Kaon! (Seltsames Meson)' },

        // === Positron: Anti-Elektron ===
        // Antimaterie trifft Elektron → Positron (Paar-Vernichtungs-Proxy).
        // Kollisionsfrei: antimatter+electron hatte vorher keine Regel.
        // Bestehende Regel antimatter+yang → electron bleibt unverändert.
        { a: 'antimatter', b: 'electron', result: 'positron', msg: '🟠 Antimaterie + Elektron → Positron! (Dirac 1928)' },

        // === Neutrinos: Geister-Teilchen (schwache Wechselwirkung) ===
        // Elektron-Einfang: Elektron + Down-Quark → Neutrino (β⁺-Zerfall)
        { a: 'electron', b: 'yin', result: 'neutrino', msg: '👻 Elektron + Yin → Neutrino! (Geist-Teilchen!)' },
        { a: 'neutrino', b: 'neutrino', result: 'neutrino_mu', msg: '👻 Neutrino × Neutrino → Myon-Neutrino! (Pauli-Druck)' },
        { a: 'neutrino_mu', b: 'neutrino_mu', result: 'neutrino_tau', msg: '👻 Myon-ν × Myon-ν → Tau-Neutrino! (Pauli-Druck)' },

        // === Bosonen: Kraftteilchen ===
        // Gluon-Fusion → Photon (wie am LHC: gg → γγ)
        { a: 'qi', b: 'qi', result: 'photon', msg: '💛 Qi × Qi → Photon! (Licht aus Energie!)' },
        // W-Boson vermittelt Lepton-Neutrino-Umwandlung
        { a: 'electron', b: 'neutrino', result: 'w_boson', msg: '🔀 Elektron + Neutrino → W-Boson! (Schwache Kraft!)' },
        // Z-Boson: neutraler Partner des W
        { a: 'w_boson', b: 'antimatter', result: 'z_boson', msg: '⚖️ W-Boson + Antimaterie → Z-Boson! (Neutral!)' },

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

    // Triplet-Regeln (3 Materialien zusammen — Multiset, permutation-invariant)
    // `materials` wird sortiert mit dem Fund sortiert verglichen → Duplikate erlaubt
    // (Baryonen: Yang+Yang+Yin).
    const TRIPLET_RULES = [
        // RGB → weiß (Wu Xing: Farbneutralität via starke Kernkraft)
        {
            materials: ['fire', 'wood', 'water'],
            result: 'metal',
            msg: '⚪ Rot + Grün + Blau → Metall! Alle Farben zusammen!'
        },
        // Baryonen — gebundene Quark-Tripletts (Farbneutral via drei verschiedene Farbladungen)
        // Gen1-only: NUR yang/yin, NICHT charm/strange/mountain/cave
        {
            materials: ['yang', 'yang', 'yin'],
            result: 'proton',
            msg: '🔴 Yang + Yang + Yin → Proton! (uud, Farbneutral)'
        },
        {
            materials: ['yang', 'yin', 'yin'],
            result: 'neutron',
            msg: '⭕ Yang + Yin + Yin → Neutron! (udd, Farbneutral)'
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

    // Multiset-Vergleich: zwei sortierte Material-Arrays sind gleich?
    // Erlaubt Duplikate (Baryonen: ['yang','yang','yin']).
    function multisetEquals(sortedA, sortedB) {
        if (sortedA.length !== sortedB.length) return false;
        for (let i = 0; i < sortedA.length; i++) {
            if (sortedA[i] !== sortedB[i]) return false;
        }
        return true;
    }

    // Check and execute merges after a block is placed at (r,c)
    //
    // Rule-Order: TRIPLET vor PAIR.
    // Grund: Yang+Yang+Yin muss als Proton matchen, nicht als Yang+Yin→Qi
    // (das fing den dritten Block ab und machte Baryonen unmöglich).
    // Wu-Xing (fire/wood/water) ist davon unbetroffen, weil diese Materialien
    // in keiner Pair-Regel vorkommen.
    /** @param {Grid} grid @param {number} r @param {number} c @param {number} rows @param {number} cols @returns {MergeResult | null} */
    function checkMerge(grid, r, c, rows, cols) {
        const cell = grid[r][c];
        if (!cell) return null;

        // Triplet merges (RGB → Metal, Baryonen) — FIRST, damit sie Pair-Merges nicht verlieren
        const allNeighbors = getAllNeighbors(r, c, rows, cols);
        for (const rule of TRIPLET_RULES) {
            if (!rule.materials.includes(cell)) continue;
            const expectedSorted = [...rule.materials].sort();
            for (let i = 0; i < allNeighbors.length; i++) {
                const [nr1, nc1] = allNeighbors[i];
                const m1 = grid[nr1]?.[nc1];
                if (!rule.materials.includes(m1)) continue;
                for (let j = i + 1; j < allNeighbors.length; j++) {
                    const [nr2, nc2] = allNeighbors[j];
                    const m2 = grid[nr2]?.[nc2];
                    if (!rule.materials.includes(m2)) continue;
                    const found = [cell, m1, m2].sort();
                    if (multisetEquals(found, expectedSorted)) {
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

        return null;
    }

    window.INSEL_AUTOMERGE = {
        checkMerge,
        MERGE_RULES,
        TRIPLET_RULES,
    };
})();
