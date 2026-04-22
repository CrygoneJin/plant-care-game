// === ATOM-RECOGNIZER — Cluster-Scan für Atom-Formationen ===
// Exportiert als window.INSEL_ATOM_RECOGNIZER
//
// Scannt das Grid nach zusammenhängenden Clustern aus {proton, neutron, electron}
// und matcht Patterns:
//   [proton, electron]                              → Wasserstoff H   (neutral)
//   [proton]                                        → H+ (Ion, optional Stretch)
//   [proton, proton, neutron, electron, electron]   → Helium-3 He-3
//   [proton, proton, neutron, neutron, electron, electron] → Helium-4 He-4
//
// MVP: H als sichtbare Auszahlung. He als Stretch.
//
// Adjazenz: 4-connected (Kante), konsistent mit automerge.js getNeighbors().
//
// Returned Array von:
//   { type: 'H' | 'He-3' | 'He-4' | 'H+',
//     cells: [[r,c], ...],
//     charge: number,
//     label: string }

(function() {
    'use strict';

    // Nur diese Materialien sind "Atom-Bestandteile".
    // muon/tau/neutrinos etc. bleiben draußen — MVP Fokus.
    const ATOM_PARTS = new Set(['proton', 'neutron', 'electron']);

    // Hardcoded Ladungen — NICHT materials.js anfassen (Scope).
    // Proton +1, Neutron 0, Electron -1 (wie in der echten Physik).
    const CHARGES = { proton: 1, neutron: 0, electron: -1 };

    // Pattern-Definitionen. Jedes Pattern ist ein sortiertes Multiset
    // der Cluster-Komponenten. Matching: cluster-sorted == pattern-sorted.
    const PATTERNS = [
        // Wasserstoff: 1 Proton + 1 Electron
        {
            type: 'H',
            parts: ['electron', 'proton'],
            label: 'H',
        },
        // Helium-3: 2p + 1n + 2e
        {
            type: 'He-3',
            parts: ['electron', 'electron', 'neutron', 'proton', 'proton'],
            label: 'He-3',
        },
        // Helium-4: 2p + 2n + 2e
        {
            type: 'He-4',
            parts: ['electron', 'electron', 'neutron', 'neutron', 'proton', 'proton'],
            label: 'He-4',
        },
    ];

    // Pattern-Strings für schnellen Vergleich (sorted-join).
    const PATTERN_INDEX = PATTERNS.map(function(p) {
        return { key: p.parts.slice().sort().join('|'), pattern: p };
    });

    function getNeighbors4(r, c, rows, cols) {
        return [[r-1,c],[r+1,c],[r,c-1],[r,c+1]]
            .filter(function(rc) { return rc[0] >= 0 && rc[0] < rows && rc[1] >= 0 && rc[1] < cols; });
    }

    // Berechnet die Gesamtladung eines Clusters.
    function clusterCharge(mats) {
        var sum = 0;
        for (var i = 0; i < mats.length; i++) {
            sum += (CHARGES[mats[i]] || 0);
        }
        return sum;
    }

    // Labelt einen Cluster der kein bekanntes Pattern ist.
    // Spezialfall: einzelnes Proton → H+ (Ion).
    // Rest: wird NICHT als Atom zurückgegeben (kein Rendering).
    function labelIon(mats) {
        if (mats.length === 1 && mats[0] === 'proton') {
            return { type: 'H+', label: 'H+' };
        }
        return null;
    }

    /**
     * scanForAtoms — Haupt-API.
     * Flood-Fill 4-connected über Zellen aus ATOM_PARTS, dann Pattern-Match.
     *
     * @param {Array<Array<string|null>>} grid
     * @param {number} rows
     * @param {number} cols
     * @returns {Array<{type:string,cells:Array<[number,number]>,charge:number,label:string}>}
     */
    function scanForAtoms(grid, rows, cols) {
        var visited = new Array(rows);
        for (var r = 0; r < rows; r++) {
            visited[r] = new Array(cols).fill(false);
        }

        var atoms = [];

        for (var r2 = 0; r2 < rows; r2++) {
            for (var c2 = 0; c2 < cols; c2++) {
                if (visited[r2][c2]) continue;
                var cell = grid[r2] && grid[r2][c2];
                if (!cell || !ATOM_PARTS.has(cell)) continue;

                // Flood-Fill Component starten
                var stack = [[r2, c2]];
                var clusterCells = [];
                var clusterMats = [];
                visited[r2][c2] = true;

                while (stack.length) {
                    var pos = stack.pop();
                    var pr = pos[0], pc = pos[1];
                    clusterCells.push([pr, pc]);
                    clusterMats.push(grid[pr][pc]);

                    var neigh = getNeighbors4(pr, pc, rows, cols);
                    for (var i = 0; i < neigh.length; i++) {
                        var nr = neigh[i][0], nc = neigh[i][1];
                        if (visited[nr][nc]) continue;
                        var nm = grid[nr] && grid[nr][nc];
                        if (!nm || !ATOM_PARTS.has(nm)) continue;
                        visited[nr][nc] = true;
                        stack.push([nr, nc]);
                    }
                }

                // Jetzt: Multiset matchen
                var sortedKey = clusterMats.slice().sort().join('|');
                var matched = null;
                for (var p = 0; p < PATTERN_INDEX.length; p++) {
                    if (PATTERN_INDEX[p].key === sortedKey) {
                        matched = PATTERN_INDEX[p].pattern;
                        break;
                    }
                }

                var charge = clusterCharge(clusterMats);

                if (matched) {
                    // Label anpassen bei Ion (Ladung != 0 und Neutral-Pattern)
                    var label = matched.label;
                    if (charge > 0) label += '+';
                    else if (charge < 0) label += '-';
                    atoms.push({
                        type: matched.type,
                        cells: clusterCells,
                        charge: charge,
                        label: label,
                    });
                } else {
                    // Kein bekanntes Atom-Pattern — prüfe Ion-Fallback
                    var ion = labelIon(clusterMats);
                    if (ion) {
                        atoms.push({
                            type: ion.type,
                            cells: clusterCells,
                            charge: charge,
                            label: ion.label,
                        });
                    }
                    // sonst: still ignorieren (z.B. alleinstehendes Neutron, zwei Electrons ohne Proton)
                }
            }
        }

        return atoms;
    }

    // Stable Key für Cluster-Identität (für Diff-Erkennung neuer Atome).
    // Sortierte Zellkoordinaten → "r1,c1|r2,c2|...".
    function clusterKey(atom) {
        var parts = atom.cells.map(function(rc) { return rc[0] + ',' + rc[1]; });
        parts.sort();
        return atom.type + ':' + parts.join('|');
    }

    window.INSEL_ATOM_RECOGNIZER = {
        scanForAtoms: scanForAtoms,
        clusterKey: clusterKey,
        ATOM_PARTS: ATOM_PARTS,
        CHARGES: CHARGES,
        PATTERNS: PATTERNS,
    };
})();
