// === SCREENSAVER — Game of Life Easter Egg ===
// Conway's Rules auf Oscars Insel. Nach 2 Min Idle.
// Touch/Click/Tastendruck = zurück zur statischen Insel.

(function() {
    'use strict';

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let idleTimer = null;
    let animationInterval = null;
    let savedGrid = null;
    let active = false;
    const IDLE_TIMEOUT = 120000; // 2 Minuten

    function resetIdleTimer() {
        if (idleTimer) clearTimeout(idleTimer);
        if (active) stopScreensaver();
        idleTimer = setTimeout(startScreensaver, IDLE_TIMEOUT);
    }

    function startScreensaver() {
        if (prefersReducedMotion) return;
        const grid = window.grid;
        if (!grid || !grid.length) return;

        // Save current state
        savedGrid = grid.map(row => [...row]);
        active = true;

        if (window.showToast) window.showToast('🔬 Die Insel lebt...');

        // Run Game of Life every 500ms
        animationInterval = setInterval(() => {
            stepGameOfLife(grid);
            if (typeof window.requestRedraw === 'function') window.requestRedraw();
        }, 500);
    }

    function stopScreensaver() {
        if (!active) return;
        active = false;
        if (animationInterval) {
            clearInterval(animationInterval);
            animationInterval = null;
        }
        // Restore original grid
        if (savedGrid && window.grid) {
            for (let r = 0; r < savedGrid.length; r++) {
                for (let c = 0; c < savedGrid[r].length; c++) {
                    window.grid[r][c] = savedGrid[r][c];
                }
            }
            savedGrid = null;
            if (typeof window.requestRedraw === 'function') window.requestRedraw();
        }
        if (window.showToast) window.showToast('🏝️ Willkommen zurück!');
    }

    function stepGameOfLife(grid) {
        const rows = grid.length;
        const cols = grid[0].length;
        const next = grid.map(row => [...row]);

        // Materials that count as "alive"
        const ALIVE_MATERIALS = new Set([
            'metal','wood','fire','water','earth','stone','sand',
            'plant','tree','flower','mushroom','sapling'
        ]);

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                let neighbors = 0;
                let neighborMats = {};

                for (let dr = -1; dr <= 1; dr++) {
                    for (let dc = -1; dc <= 1; dc++) {
                        if (dr === 0 && dc === 0) continue;
                        const nr = r + dr, nc = c + dc;
                        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc]) {
                            if (ALIVE_MATERIALS.has(grid[nr][nc])) {
                                neighbors++;
                                neighborMats[grid[nr][nc]] = (neighborMats[grid[nr][nc]] || 0) + 1;
                            }
                        }
                    }
                }

                const isAlive = grid[r][c] && ALIVE_MATERIALS.has(grid[r][c]);

                if (isAlive) {
                    // Underpopulation or overpopulation: die
                    if (neighbors < 2 || neighbors > 3) {
                        next[r][c] = null;
                    }
                    // Else: survive (keep current material)
                } else {
                    // Birth: exactly 3 neighbors
                    if (neighbors === 3) {
                        // New cell gets the most common neighbor material
                        const dominant = Object.entries(neighborMats)
                            .sort((a,b) => b[1] - a[1])[0];
                        next[r][c] = dominant ? dominant[0] : 'plant';
                    }
                }
            }
        }

        // Apply
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                grid[r][c] = next[r][c];
            }
        }
    }

    // Listen for user activity
    ['click','keydown','touchstart','mousemove'].forEach(evt => {
        document.addEventListener(evt, resetIdleTimer, { passive: true });
    });

    // Start idle timer after page load
    setTimeout(resetIdleTimer, 3000);

    window.INSEL_SCREENSAVER = { start: startScreensaver, stop: stopScreensaver };
})();
