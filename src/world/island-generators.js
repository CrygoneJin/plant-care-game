// === INSEL-GENERATOREN ===
// Extrahiert aus game.js (Backlog #11, Zellteilung).
// Alle Funktionen sind zustandslos: grid wird direkt mutiert und zurückgegeben.
// Aufruf aus game.js via window.INSEL_GENERATORS.

(function () {
    'use strict';

    /**
     * Zufalls-Insel generieren: Strand, Palmen, Blumen, Steine, Fluss, Berge, Wald.
     * @param {Array<Array<string|null>>} grid
     * @param {number} ROWS
     * @param {number} COLS
     * @param {Record<string, {emoji:string, label:string}>} MATERIALS
     */
    function generateStarterIsland(grid, ROWS, COLS, MATERIALS) {
        let seed = Date.now();
        function rng() { seed = (seed * 16807 + 0) % 2147483647; return seed / 2147483647; }

        const WE = 2;
        const innerRows = ROWS - WE * 2;
        const innerCols = COLS - WE * 2;
        const cx = COLS / 2, cy = ROWS / 2;
        const rx = innerCols * 0.48, ry = innerRows * 0.48;

        // Strandrand
        for (let r = WE; r < ROWS - WE; r++) {
            for (let c = WE; c < COLS - WE; c++) {
                const dx = (c - cx) / rx, dy = (r - cy) / ry;
                const dist = dx * dx + dy * dy;
                const wobble = 0.15 * Math.sin(r * 1.7 + c * 0.9) + 0.1 * Math.cos(c * 2.3 - r * 0.7);
                if (dist < (0.7 + wobble) && dist >= (0.5 + wobble)) {
                    grid[r][c] = 'sand';
                }
            }
        }

        // Palmen am Strand
        const palmCount = Math.max(6, Math.floor((ROWS + COLS) * 0.3));
        let palmsPlaced = 0;
        for (let attempt = 0; attempt < 200 && palmsPlaced < palmCount; attempt++) {
            const r = Math.floor(rng() * ROWS);
            const c = Math.floor(rng() * COLS);
            if (grid[r][c] === 'sand') { grid[r][c] = 'palm'; palmsPlaced++; }
        }

        // Bäume im Insel-Inneren
        const treeCount = Math.max(4, Math.floor((ROWS + COLS) * 0.2));
        let treesPlaced = 0;
        for (let attempt = 0; attempt < 200 && treesPlaced < treeCount; attempt++) {
            const r = Math.floor(rng() * ROWS);
            const c = Math.floor(rng() * COLS);
            const dx = (c - cx) / rx, dy = (r - cy) / ry;
            if (dx * dx + dy * dy < 0.4 && !grid[r][c]) {
                grid[r][c] = rng() < 0.5 ? 'tree' : 'small_tree';
                treesPlaced++;
            }
        }

        // Blumen und Pflanzen
        const floraCount = Math.max(3, Math.floor((ROWS + COLS) * 0.15));
        let floraPlaced = 0;
        for (let attempt = 0; attempt < 200 && floraPlaced < floraCount; attempt++) {
            const r = Math.floor(rng() * ROWS);
            const c = Math.floor(rng() * COLS);
            const dx = (c - cx) / rx, dy = (r - cy) / ry;
            if (dx * dx + dy * dy < 0.45 && !grid[r][c]) {
                grid[r][c] = rng() < 0.6 ? 'flower' : 'plant';
                floraPlaced++;
            }
        }

        // Fluss
        const riverStartC = Math.floor(cx + (rng() - 0.5) * 4);
        let rc = riverStartC;
        for (let r = Math.floor(cy - ry * 0.6); r < Math.floor(cy + ry * 0.6); r++) {
            if (r >= 0 && r < ROWS && rc >= 0 && rc < COLS) {
                const dx = (rc - cx) / rx, dy = (r - cy) / ry;
                if (dx * dx + dy * dy < 0.5) {
                    grid[r][rc] = 'water';
                    if (rng() < 0.4 && rc + 1 < COLS) grid[r][rc + 1] = 'water';
                }
            }
            rc += rng() < 0.3 ? -1 : rng() > 0.7 ? 1 : 0;
            rc = Math.max(2, Math.min(COLS - 3, rc));
        }

        // Steingruppe
        const stoneCount = Math.max(3, Math.floor((ROWS + COLS) * 0.08));
        let stonesPlaced = 0;
        const stoneCy = cy - ry * 0.3;
        for (let attempt = 0; attempt < 200 && stonesPlaced < stoneCount; attempt++) {
            const r = Math.floor(stoneCy + (rng() - 0.5) * ry * 0.4);
            const c = Math.floor(cx + (rng() - 0.5) * rx * 0.5);
            if (r >= 0 && r < ROWS && c >= 0 && c < COLS && !grid[r][c]) {
                const dx = (c - cx) / rx, dy = (r - cy) / ry;
                if (dx * dx + dy * dy < 0.35) { grid[r][c] = 'stone'; stonesPlaced++; }
            }
        }

        // Berge
        if (MATERIALS['mountain']) {
            const mountainCount = rng() < 0.5 ? 1 : 2;
            let mountainsPlaced = 0;
            for (let attempt = 0; attempt < 100 && mountainsPlaced < mountainCount; attempt++) {
                const r = Math.floor(cy - ry * 0.2 + rng() * ry * 0.3);
                const c = Math.floor(cx + (rng() - 0.5) * rx * 0.4);
                if (r >= 0 && r < ROWS && c >= 0 && c < COLS && !grid[r][c]) {
                    grid[r][c] = 'mountain';
                    mountainsPlaced++;
                }
            }
        }

        // Dichter Wald im Zentrum
        const extraTrees = Math.max(4, Math.floor((ROWS + COLS) * 0.15));
        let extraPlaced = 0;
        for (let attempt = 0; attempt < 300 && extraPlaced < extraTrees; attempt++) {
            const r = Math.floor(rng() * ROWS);
            const c = Math.floor(rng() * COLS);
            const dx = (c - cx) / rx, dy = (r - cy) / ry;
            if (dx * dx + dy * dy < 0.3 && !grid[r][c]) {
                grid[r][c] = rng() < 0.3 ? 'tree' : rng() < 0.6 ? 'small_tree' : 'plant';
                extraPlaced++;
            }
        }

        // Weg vom Strand zum Zentrum
        const pathStartR = Math.floor(cy + ry * 0.6);
        for (let r = pathStartR; r > Math.floor(cy); r--) {
            const c = Math.floor(cx + Math.sin(r * 0.3) * 2);
            if (r >= 0 && r < ROWS && c >= 0 && c < COLS) {
                if (!grid[r][c] || grid[r][c] === 'sand') grid[r][c] = 'path';
            }
        }

        window.grid = grid;
    }

    /**
     * Lummerland — handgebaute Jim-Knopf-Insel.
     * Michael Ende: "Lummerland war nur eine kleine Insel mit zwei Bergen."
     * @param {Array<Array<string|null>>} grid
     * @param {number} ROWS
     * @param {number} COLS
     * @param {Record<string, {emoji:string, label:string}>} MATERIALS
     */
    function generateLummerland(grid, ROWS, COLS, MATERIALS) {
        const cx = Math.floor(COLS / 2), cy = Math.floor(ROWS / 2);
        const rx = Math.floor(COLS * 0.38), ry = Math.floor(ROWS * 0.38);

        // Inselform: ovaler Strand
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                const dx = (c - cx) / rx, dy = (r - cy) / ry;
                const dist = dx * dx + dy * dy;
                if (dist < 0.7 && dist >= 0.55) grid[r][c] = 'sand';
            }
        }

        // Zwei Berge
        const berg1r = cy - Math.floor(ry * 0.3), berg1c = cx - Math.floor(rx * 0.2);
        const berg2r = cy - Math.floor(ry * 0.2), berg2c = cx + Math.floor(rx * 0.25);
        if (MATERIALS['mountain']) {
            if (grid[berg1r]) grid[berg1r][berg1c] = 'mountain';
            if (grid[berg2r]) grid[berg2r][berg2c] = 'mountain';
            for (const [br, bc] of [[berg1r, berg1c], [berg2r, berg2c]]) {
                for (const [dr, dc] of [[0,1],[0,-1],[1,0],[-1,0]]) {
                    const nr = br + dr, nc = bc + dc;
                    if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && !grid[nr][nc]) {
                        grid[nr][nc] = 'stone';
                    }
                }
            }
        }

        // Lukas' Lokomotiv-Schuppen
        const schuppenR = cy + Math.floor(ry * 0.1), schuppenC = cx - Math.floor(rx * 0.1);
        const schuppen = [
            [-1,-1,'wood'],[-1,0,'wood'],[-1,1,'wood'],
            [0,-1,'wood'],[0,0,'door'],[0,1,'wood'],
            [-2,-1,'roof'],[-2,0,'roof'],[-2,1,'roof'],
        ];
        for (const [dr, dc, mat] of schuppen) {
            const r = schuppenR + dr, c = schuppenC + dc;
            if (r >= 0 && r < ROWS && c >= 0 && c < COLS && MATERIALS[mat]) grid[r][c] = mat;
        }

        // Frau Waas' Laden
        const ladenR = cy, ladenC = cx + Math.floor(rx * 0.15);
        const laden = [
            [-1,-1,'stone'],[-1,0,'glass'],[-1,1,'stone'],
            [0,-1,'stone'],[0,0,'door'],[0,1,'stone'],
            [-2,-1,'roof'],[-2,0,'lamp'],[-2,1,'roof'],
        ];
        for (const [dr, dc, mat] of laden) {
            const r = ladenR + dr, c = ladenC + dc;
            if (r >= 0 && r < ROWS && c >= 0 && c < COLS && MATERIALS[mat]) grid[r][c] = mat;
        }

        // Schienen
        for (let c = schuppenC + 2; c < cx + Math.floor(rx * 0.4); c++) {
            if (c >= 0 && c < COLS && schuppenR >= 0 && schuppenR < ROWS) {
                if (!grid[schuppenR][c]) grid[schuppenR][c] = 'path';
            }
        }

        // Bäume und Palmen
        const spots = [
            [cy - Math.floor(ry*0.1), cx - Math.floor(rx*0.35), 'palm'],
            [cy + Math.floor(ry*0.3), cx - Math.floor(rx*0.15), 'palm'],
            [cy + Math.floor(ry*0.35), cx + Math.floor(rx*0.1), 'palm'],
            [cy + Math.floor(ry*0.2), cx + Math.floor(rx*0.3), 'palm'],
            [cy - Math.floor(ry*0.15), cx + Math.floor(rx*0.35), 'tree'],
            [cy + Math.floor(ry*0.05), cx - Math.floor(rx*0.3), 'tree'],
            [cy - Math.floor(ry*0.35), cx, 'tree'],
            [cy + Math.floor(ry*0.1), cx + Math.floor(rx*0.05), 'flower'],
            [cy + Math.floor(ry*0.15), cx - Math.floor(rx*0.05), 'flower'],
            [cy + Math.floor(ry*0.25), cx, 'plant'],
        ];
        for (const [r, c, mat] of spots) {
            if (r >= 0 && r < ROWS && c >= 0 && c < COLS && !grid[r][c]) grid[r][c] = mat;
        }

        // Kleiner Hafen
        const hafenR = cy + Math.floor(ry * 0.45);
        const hafenC = cx;
        for (let dc = -1; dc <= 1; dc++) {
            const c = hafenC + dc;
            if (hafenR >= 0 && hafenR < ROWS && c >= 0 && c < COLS) grid[hafenR][c] = 'water';
            if (hafenR + 1 < ROWS && c >= 0 && c < COLS) grid[hafenR + 1][c] = 'water';
        }
        if (MATERIALS['boat'] && hafenR >= 0 && hafenR < ROWS && hafenC >= 0 && hafenC < COLS) {
            grid[hafenR][hafenC] = 'boat';
        }

        window.grid = grid;
    }

    window.INSEL_GENERATORS = { generateStarterIsland, generateLummerland };
})();
