// === MASS-MAP — Higgs-Koppelung pro Zelle (S101) ===
// Exportiert als window.INSEL_MASS_MAP
//
// Das Higgs-Feld gibt jedem massebehafteten Material Gewicht.
// Massen-Verteilung + Nachbar-Falloff (Gaussian) erzeugt eine
// kontinuierliche Mass-Map — Grundlage der Raumkrümmung.
//
// Physik:
//   Masse ist lokal (eine Zelle), aber Gravitation ist nicht-lokal.
//   Ein schweres Teilchen krümmt den Raum um sich herum — nicht nur
//   am eigenen Punkt. Deshalb bluten Massen in Nachbar-Zellen.
//
// Implementation:
//   Pro Zelle: eigene Masse + Summe der Nachbarmassen × Gaussian-Falloff
//   Radius 2 Zellen reicht visuell, kostet O(grid × 25) pro Berechnung.
//   Bei 50×50 Grid: 2500 × 25 = 62500 ops — unter 5ms.
//
// Die Funktion ist pure: gleiches Grid → gleiche Map. Keine Seiteneffekte.

(function() {
    'use strict';

    // Falloff-Radius in Zellen. 2 = 5×5 Kernel.
    const FALLOFF_RADIUS = 2;
    // Sigma für Gaussian. Kleiner = spitzere Delle.
    const SIGMA = 1.2;

    // Gaussian-Kernel vorberechnet — weights[dr+R][dc+R] = exp(-(dr²+dc²)/(2σ²))
    function buildKernel() {
        const size = FALLOFF_RADIUS * 2 + 1;
        const k = new Array(size);
        for (let i = 0; i < size; i++) {
            k[i] = new Array(size);
            for (let j = 0; j < size; j++) {
                const dr = i - FALLOFF_RADIUS;
                const dc = j - FALLOFF_RADIUS;
                const dist2 = dr * dr + dc * dc;
                k[i][j] = Math.exp(-dist2 / (2 * SIGMA * SIGMA));
            }
        }
        return k;
    }

    const KERNEL = buildKernel();

    /**
     * getMaterialMass — liefert die Masse eines Materials.
     * Materials ohne explizites mass-Feld → 0.
     *
     * @param {string|null} matKey
     * @param {Object} materials — window.INSEL_MATERIALS
     * @returns {number}
     */
    function getMaterialMass(matKey, materials) {
        if (!matKey || !materials) return 0;
        const def = materials[matKey];
        if (!def) return 0;
        return typeof def.mass === 'number' ? def.mass : 0;
    }

    /**
     * computeMassMap — Mass-Verteilung mit Gaussian-Falloff.
     * Jede Zelle bekommt: eigene Masse + Σ (Nachbar-Masse × Gaussian-Gewicht).
     *
     * Höhlen (mass > 0) und Berge krümmen Raum um sich herum.
     *
     * @param {Array<Array<string|null>>} grid
     * @param {number} rows
     * @param {number} cols
     * @param {Object} [materials] — window.INSEL_MATERIALS (default: window.INSEL_MATERIALS)
     * @returns {Array<Array<number>>} mass map (rows × cols), values >= 0
     */
    function computeMassMap(grid, rows, cols, materials) {
        const mats = materials || (typeof window !== 'undefined' ? window.INSEL_MATERIALS : null);
        if (!mats) throw new Error('computeMassMap: materials dict required');

        // Init: alle Zellen 0
        const map = new Array(rows);
        for (let r = 0; r < rows; r++) {
            map[r] = new Array(cols).fill(0);
        }

        // Für jede Zelle mit Masse: Kernel in die Map streuen (Scatter)
        // Das ist schneller als Gather weil die meisten Zellen leer sind.
        for (let r = 0; r < rows; r++) {
            const row = grid[r];
            if (!row) continue;
            for (let c = 0; c < cols; c++) {
                const m = getMaterialMass(row[c], mats);
                if (m <= 0) continue;

                // Kernel um (r, c) streuen
                for (let dr = -FALLOFF_RADIUS; dr <= FALLOFF_RADIUS; dr++) {
                    const nr = r + dr;
                    if (nr < 0 || nr >= rows) continue;
                    for (let dc = -FALLOFF_RADIUS; dc <= FALLOFF_RADIUS; dc++) {
                        const nc = c + dc;
                        if (nc < 0 || nc >= cols) continue;
                        const w = KERNEL[dr + FALLOFF_RADIUS][dc + FALLOFF_RADIUS];
                        map[nr][nc] += m * w;
                    }
                }
            }
        }

        return map;
    }

    /**
     * curvatureDepth — nicht-lineare Abbildung Masse → Delle-Tiefe [0..1].
     * Nutzt log(mass+1) damit Blackhole (9999) nicht 500× tiefer ist als Berg (20).
     * Normalisiert auf Maximum log(10000+1) ≈ 9.2 — gibt schöne Kurve.
     *
     * @param {number} mass
     * @returns {number} 0..1
     */
    function curvatureDepth(mass) {
        if (mass <= 0) return 0;
        const MAX_LOG = Math.log(10000);
        return Math.min(1, Math.log(mass + 1) / MAX_LOG);
    }

    /**
     * maxMass — findet die höchste Masse in der Map (für Normalisierung beim Rendern).
     */
    function maxMass(map) {
        let max = 0;
        for (let r = 0; r < map.length; r++) {
            for (let c = 0; c < map[r].length; c++) {
                if (map[r][c] > max) max = map[r][c];
            }
        }
        return max;
    }

    if (typeof window !== 'undefined') {
        window.INSEL_MASS_MAP = {
            computeMassMap: computeMassMap,
            curvatureDepth: curvatureDepth,
            getMaterialMass: getMaterialMass,
            maxMass: maxMass,
            FALLOFF_RADIUS: FALLOFF_RADIUS,
            SIGMA: SIGMA,
        };
    }
})();
