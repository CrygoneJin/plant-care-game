// === TAO-CURVATURE — Raumkrümmung-Rendering (S101) ===
// Exportiert als window.INSEL_TAO_CURVATURE
//
// Higgs-Feld (Mass-Map) ist die Mechanik. Raumkrümmung ist die Sichtbarkeit.
// Zwei Seiten derselben Physik — wie Einstein es gesagt hätte.
//
// Visuell:
//   Flache Zelle (mass 0): nichts, transparent.
//   Schwere Zelle: radialer Gradient, dunkel in der Mitte, transparent am Rand.
//   Tiefe ∝ log(mass+1) → Berg (mass 20) sichtbar, Blackhole (mass 9999) extrem.
//
// Oscar-Satz (Einstein-Gate): „Der Berg ist schwer, deshalb ist da eine Mulde."

(function() {
    'use strict';

    /**
     * drawCurvature — rendert Raumkrümmung aus Mass-Map.
     *
     * @param {CanvasRenderingContext2D} ctx
     * @param {Array<Array<number>>} massMap — aus computeMassMap
     * @param {number} rows
     * @param {number} cols
     * @param {number} cellSize
     * @param {number} waterBorder — Pixel-Offset für WATER_BORDER
     * @param {Object} [opts]
     * @param {number} [opts.maxAlpha=0.55] — Obergrenze Dellen-Dunkelheit
     * @param {number} [opts.pulseTime] — Date.now()/1000 für sanftes Wabbern
     * @param {boolean} [opts.reducedMotion=false]
     */
    function drawCurvature(ctx, massMap, rows, cols, cellSize, waterBorder, opts) {
        const o = opts || {};
        const maxAlpha = typeof o.maxAlpha === 'number' ? o.maxAlpha : 0.55;
        const reduced = !!o.reducedMotion;
        const MM = (typeof window !== 'undefined') ? window.INSEL_MASS_MAP : null;
        if (!MM) return;

        ctx.save();

        for (let r = 0; r < rows; r++) {
            const row = massMap[r];
            if (!row) continue;
            for (let c = 0; c < cols; c++) {
                const mass = row[c];
                if (mass < 0.15) continue; // zu flach — überspringen, spart Zeichen-Ops

                const depth = MM.curvatureDepth(mass); // 0..1
                const alpha = Math.min(maxAlpha, depth * maxAlpha * 1.1);

                const x = (c + waterBorder) * cellSize;
                const y = (r + waterBorder) * cellSize;
                const cx = x + cellSize / 2;
                const cy = y + cellSize / 2;

                // Sanftes Wabbern der Tiefe (nicht für Reduced-Motion)
                let wobble = 1;
                if (!reduced && typeof o.pulseTime === 'number') {
                    wobble = 0.92 + Math.sin(o.pulseTime * 1.5 + r * 0.6 + c * 0.8) * 0.08;
                }

                // Radialer Gradient: dunkel in Mitte, klar am Rand
                const radius = cellSize * (0.55 + depth * 0.35) * wobble;
                const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
                // Zentrum: dunkel-violett (Raumzeit-Delle)
                grad.addColorStop(0, 'rgba(8, 12, 32, ' + alpha + ')');
                grad.addColorStop(0.6, 'rgba(20, 30, 70, ' + (alpha * 0.4) + ')');
                grad.addColorStop(1, 'rgba(40, 60, 120, 0)');

                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(cx, cy, radius, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        ctx.restore();
    }

    if (typeof window !== 'undefined') {
        window.INSEL_TAO_CURVATURE = {
            drawCurvature: drawCurvature,
        };
    }
})();
