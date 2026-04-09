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

        // Palmen am Strand (nur auf Sand, innerhalb Inselrand)
        const palmCount = Math.max(6, Math.floor((ROWS + COLS) * 0.3));
        let palmsPlaced = 0;
        for (let attempt = 0; attempt < 200 && palmsPlaced < palmCount; attempt++) {
            const r = WE + Math.floor(rng() * innerRows);
            const c = WE + Math.floor(rng() * innerCols);
            if (grid[r][c] === 'sand') { grid[r][c] = 'palm'; palmsPlaced++; }
        }

        // Bäume im Insel-Inneren (nie im Ozean)
        const treeCount = Math.max(4, Math.floor((ROWS + COLS) * 0.2));
        let treesPlaced = 0;
        for (let attempt = 0; attempt < 200 && treesPlaced < treeCount; attempt++) {
            const r = WE + Math.floor(rng() * innerRows);
            const c = WE + Math.floor(rng() * innerCols);
            const dx = (c - cx) / rx, dy = (r - cy) / ry;
            if (dx * dx + dy * dy < 0.4 && !grid[r][c]) {
                grid[r][c] = rng() < 0.5 ? 'tree' : 'small_tree';
                treesPlaced++;
            }
        }

        // Blumen und Pflanzen (nie im Ozean)
        const floraCount = Math.max(3, Math.floor((ROWS + COLS) * 0.15));
        let floraPlaced = 0;
        for (let attempt = 0; attempt < 200 && floraPlaced < floraCount; attempt++) {
            const r = WE + Math.floor(rng() * innerRows);
            const c = WE + Math.floor(rng() * innerCols);
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
            if (r >= WE && r < ROWS - WE && c >= WE && c < COLS - WE && !grid[r][c]) {
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
                if (r >= WE && r < ROWS - WE && c >= WE && c < COLS - WE && !grid[r][c]) {
                    grid[r][c] = 'mountain';
                    mountainsPlaced++;
                }
            }
        }

        // Dichter Wald im Zentrum (nie im Ozean)
        const extraTrees = Math.max(4, Math.floor((ROWS + COLS) * 0.15));
        let extraPlaced = 0;
        for (let attempt = 0; attempt < 300 && extraPlaced < extraTrees; attempt++) {
            const r = WE + Math.floor(rng() * innerRows);
            const c = WE + Math.floor(rng() * innerCols);
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

        // Lokführer-Schuppen
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

        // Krämerladen
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

    /**
     * Dino-Bucht — eine urzeitliche Insel voller Fossilien und Dinosaurier.
     * Fossilien im Strandsand, Dinos im Wald, T-Rex auf dem Gipfel.
     * @param {Array<Array<string|null>>} grid
     * @param {number} ROWS
     * @param {number} COLS
     * @param {Record<string, {emoji:string, label:string}>} MATERIALS
     */
    function generateDinoIsland(grid, ROWS, COLS, MATERIALS) {
        let seed = 66000000; // 66 Millionen Jahre — Kreide-Paläogen-Grenze
        function rng() { seed = (seed * 16807 + 0) % 2147483647; return seed / 2147483647; }

        const cx = Math.floor(COLS / 2), cy = Math.floor(ROWS / 2);
        const rx = Math.floor(COLS * 0.42), ry = Math.floor(ROWS * 0.42);

        // Strandring mit Fossilien-Einschlüssen
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                const dx = (c - cx) / rx, dy = (r - cy) / ry;
                const dist = dx * dx + dy * dy;
                const wobble = 0.1 * Math.sin(r * 2.1 + c * 1.3) + 0.08 * Math.cos(c * 1.7 - r * 0.9);
                if (dist < (0.72 + wobble) && dist >= (0.52 + wobble)) {
                    // Strandrand: meistens Sand, ab und zu Fossil
                    grid[r][c] = rng() < 0.18 && MATERIALS['fossil'] ? 'fossil' : 'sand';
                }
            }
        }

        // Dichter Urwald (Bäume + Pflanzen) im Inneren
        for (let attempt = 0; attempt < 400; attempt++) {
            const r = Math.floor(rng() * ROWS);
            const c = Math.floor(rng() * COLS);
            const dx = (c - cx) / rx, dy = (r - cy) / ry;
            const dist = dx * dx + dy * dy;
            if (dist < 0.38 && !grid[r][c]) {
                const roll = rng();
                grid[r][c] = roll < 0.45 ? 'tree' :
                             roll < 0.7  ? 'small_tree' :
                             roll < 0.85 ? 'plant' : 'flower';
            }
        }

        // Fossilien-Cluster im mittleren Bereich
        if (MATERIALS['fossil']) {
            const fossilMax = Math.max(5, Math.floor((ROWS + COLS) * 0.12));
            let fossilPlaced = 0;
            for (let attempt = 0; attempt < 300 && fossilPlaced < fossilMax; attempt++) {
                const r = Math.floor(rng() * ROWS);
                const c = Math.floor(rng() * COLS);
                const dx = (c - cx) / rx, dy = (r - cy) / ry;
                if (dx * dx + dy * dy < 0.45 && !grid[r][c]) {
                    grid[r][c] = 'fossil';
                    fossilPlaced++;
                }
            }
        }

        // Dinosaurier-Herde (6–8 Dinos)
        if (MATERIALS['dino']) {
            let placed = 0;
            for (let attempt = 0; attempt < 200 && placed < 7; attempt++) {
                const r = Math.floor(rng() * ROWS);
                const c = Math.floor(rng() * COLS);
                const dx = (c - cx) / rx, dy = (r - cy) / ry;
                if (dx * dx + dy * dy < 0.35 && !grid[r][c]) {
                    grid[r][c] = 'dino';
                    placed++;
                }
            }
        }

        // T-Rex auf dem höchsten Punkt (Mitte oben)
        if (MATERIALS['trex']) {
            const trexR = Math.floor(cy - ry * 0.35);
            const trexC = Math.floor(cx + (rng() - 0.5) * rx * 0.3);
            if (trexR >= 0 && trexR < ROWS && trexC >= 0 && trexC < COLS) {
                grid[trexR][trexC] = 'trex';
                // Steinpodest unter dem T-Rex
                for (const [dr, dc] of [[1,-1],[1,0],[1,1]]) {
                    const nr = trexR + dr, nc = trexC + dc;
                    if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && !grid[nr][nc]) {
                        grid[nr][nc] = 'stone';
                    }
                }
            }
        }

        // Meteorit-Einschlag-Krater (nordwestliche Ecke)
        if (MATERIALS['meteor']) {
            const kraterR = Math.floor(cy - ry * 0.2);
            const kraterC = Math.floor(cx - rx * 0.25);
            grid[kraterR][kraterC] = 'meteor';
            // Krater-Rand aus Stein
            for (const [dr, dc] of [[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[-1,1],[1,-1],[1,1]]) {
                const nr = kraterR + dr, nc = kraterC + dc;
                if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && !grid[nr][nc]) {
                    grid[nr][nc] = 'stone';
                }
            }
        }

        // Kleiner Tümpel (Wasserstelle)
        const tumpelR = Math.floor(cy + ry * 0.15), tumpelC = Math.floor(cx + rx * 0.1);
        for (const [dr, dc] of [[0,0],[0,1],[1,0],[0,-1]]) {
            const nr = tumpelR + dr, nc = tumpelC + dc;
            if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) grid[nr][nc] = 'water';
        }

        window.grid = grid;
    }

    /**
     * Mondlandschaft — staubig, karg, mit Kratern und Aliens.
     * Oscar landet hier mit seiner Rakete. Der erste Baum wächst nicht hier.
     * @param {Array<Array<string|null>>} grid
     * @param {number} ROWS
     * @param {number} COLS
     * @param {Record<string, {emoji:string, label:string}>} MATERIALS
     */
    function generateMoonIsland(grid, ROWS, COLS, MATERIALS) {
        let seed = 384400; // Mondentfernung in km
        function rng() { seed = (seed * 16807 + 0) % 2147483647; return seed / 2147483647; }

        const cx = Math.floor(COLS / 2), cy = Math.floor(ROWS / 2);
        const rx = Math.floor(COLS * 0.44), ry = Math.floor(ROWS * 0.44);

        // Mondstaub-Oberfläche: Stone-Rand + Innen leer (Regolith)
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                const dx = (c - cx) / rx, dy = (r - cy) / ry;
                const dist = dx * dx + dy * dy;
                const wobble = 0.08 * Math.sin(r * 3.1 + c * 2.3) + 0.06 * Math.cos(c * 1.9 - r * 1.4);
                if (dist < (0.68 + wobble) && dist >= (0.50 + wobble)) {
                    grid[r][c] = 'stone'; // Mondrand aus Gestein
                }
            }
        }

        // Krater: Ringe aus Stein (3 Krater)
        const craters = [
            [cy - Math.floor(ry * 0.3), cx - Math.floor(rx * 0.25)],
            [cy + Math.floor(ry * 0.2), cx + Math.floor(rx * 0.3)],
            [cy - Math.floor(ry * 0.1), cx + Math.floor(rx * 0.15)],
        ];
        for (const [cr, cc] of craters) {
            for (const [dr, dc] of [[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[-1,1],[1,-1],[1,1]]) {
                const nr = cr + dr, nc = cc + dc;
                if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && !grid[nr][nc]) {
                    grid[nr][nc] = 'stone';
                }
            }
        }

        // Sterne (über den Boden verteilt — Monde haben keinen Himmel, man sieht sie direkt)
        if (MATERIALS['star']) {
            let starsPlaced = 0;
            for (let attempt = 0; attempt < 200 && starsPlaced < 8; attempt++) {
                const r = Math.floor(rng() * ROWS);
                const c = Math.floor(rng() * COLS);
                const dx = (c - cx) / rx, dy = (r - cy) / ry;
                if (dx * dx + dy * dy < 0.38 && !grid[r][c]) {
                    grid[r][c] = 'star';
                    starsPlaced++;
                }
            }
        }

        // Meteoriteneinschläge
        if (MATERIALS['meteor']) {
            const meteorR = cy - Math.floor(ry * 0.15), meteorC = cx - Math.floor(rx * 0.1);
            if (meteorR >= 0 && meteorR < ROWS && meteorC >= 0 && meteorC < COLS) {
                grid[meteorR][meteorC] = 'meteor';
            }
        }

        // Mondkäse — Easter Egg (natürlich ist der Mond aus Käse!)
        if (MATERIALS['mooncheese']) {
            const cheeseR = cy + Math.floor(ry * 0.15), cheeseC = cx - Math.floor(rx * 0.2);
            if (cheeseR >= 0 && cheeseR < ROWS && cheeseC >= 0 && cheeseC < COLS && !grid[cheeseR][cheeseC]) {
                grid[cheeseR][cheeseC] = 'mooncheese';
            }
        }

        // Rakete — steht auf dem Mond
        if (MATERIALS['rocket']) {
            const rocketR = cy + Math.floor(ry * 0.25), rocketC = cx;
            if (rocketR >= 0 && rocketR < ROWS && rocketC >= 0 && rocketC < COLS) {
                grid[rocketR][rocketC] = 'rocket';
                // Landebeine aus Stein
                for (const [dr, dc] of [[0,-1],[0,1],[1,-1],[1,0],[1,1]]) {
                    const nr = rocketR + dr, nc = rocketC + dc;
                    if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && !grid[nr][nc]) {
                        grid[nr][nc] = 'stone';
                    }
                }
            }
        }

        // Alien — Bewohner des Mondes (mitten auf der Insel)
        if (MATERIALS['alien']) {
            const alienR = cy - Math.floor(ry * 0.1), alienC = cx - Math.floor(rx * 0.05);
            if (alienR >= 0 && alienR < ROWS && alienC >= 0 && alienC < COLS && !grid[alienR][alienC]) {
                grid[alienR][alienC] = 'alien';
            }
        }

        window.grid = grid;
    }

    function generateMarsIsland(grid, ROWS, COLS, MATERIALS) {
        let seed = 225000; // Mars-Entfernung in km (ca. Minimum)
        function rng() { seed = (seed * 16807 + 0) % 2147483647; return seed / 2147483647; }

        const cx = Math.floor(COLS / 2), cy = Math.floor(ROWS / 2);
        const rx = Math.floor(COLS * 0.42), ry = Math.floor(ROWS * 0.42);

        // Rote Oberfläche: Stein als Mars-Staub (Basalt)
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                const dx = (c - cx) / rx, dy = (r - cy) / ry;
                const dist = dx * dx + dy * dy;
                const wobble = 0.1 * Math.sin(r * 2.7 + c * 1.9) + 0.07 * Math.cos(c * 2.3 - r * 1.1);
                if (dist < (0.72 + wobble)) {
                    // Mars-Oberfläche: Mischung aus Stone (Basalt) und Sand (Staubebene)
                    grid[r][c] = rng() < 0.35 ? 'sand' : 'stone';
                }
            }
        }

        // Staubsturm-Muster: unregelmäßige Reihen (leere Streifen)
        for (let attempt = 0; attempt < 60; attempt++) {
            const r = Math.floor(rng() * ROWS);
            const c = Math.floor(rng() * COLS);
            const len = Math.floor(rng() * 4) + 2;
            for (let i = 0; i < len; i++) {
                const nc = c + i;
                if (nc < COLS && grid[r] && grid[r][nc]) grid[r][nc] = null;
            }
        }

        // Krater (größer als Mond)
        const craters = [
            [cy - Math.floor(ry * 0.35), cx + Math.floor(rx * 0.2)],
            [cy + Math.floor(ry * 0.3), cx - Math.floor(rx * 0.35)],
        ];
        for (const [cr, cc] of craters) {
            for (const [dr, dc] of [[-2,0],[2,0],[0,-2],[0,2],[-1,-1],[-1,1],[1,-1],[1,1],[-2,-1],[-2,1],[2,-1],[2,1]]) {
                const nr = cr + dr, nc = cc + dc;
                if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
                    grid[nr][nc] = 'stone';
                }
            }
        }

        // Mars-Material in der Mitte (Ressource für Oscar)
        if (MATERIALS['mars']) {
            if (grid[cy] && !grid[cy][cx]) grid[cy][cx] = 'mars';
        }

        // Meteor — Einschlag
        if (MATERIALS['meteor']) {
            const mR = cy - Math.floor(ry * 0.2), mC = cx + Math.floor(rx * 0.1);
            if (mR >= 0 && mR < ROWS && mC >= 0 && mC < COLS) grid[mR][mC] = 'meteor';
        }

        // Rover — Easter Egg (🤖 = robot = Curiosity/Perseverance)
        // Rover wird als 'alien' Block platziert (nächste sinnvolle Entsprechung)
        // Der echte Rover-Dialog kommt vom NPC-System des Mondes nicht — hier ist nur Deko
        const roverR = cy + Math.floor(ry * 0.2), roverC = cx + Math.floor(rx * 0.25);
        if (roverR >= 0 && roverR < ROWS && roverC >= 0 && roverC < COLS && !grid[roverR][roverC]) {
            // Kein Material für Rover — leeres Feld mit Stern als Markierung
            if (MATERIALS['star']) grid[roverR][roverC] = 'star';
        }

        window.grid = grid;
    }

    // === GENESIS PHASE 2: Wasser-Start (#37) ===
    // Für absolute Neuspieler: Insel beginnt als Ozean.
    // Nur eine kleine Sandinsel in der Mitte — Oscar muss selbst bauen.
    function generateWaterStart(grid, ROWS, COLS) {
        const cx = Math.floor(COLS / 2);
        const cy = Math.floor(ROWS / 2);
        // Alles Wasser — null = leere Zelle (Ozean-Hintergrund)
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                grid[r][c] = null;
            }
        }
        // Kleine Sandinsel: 3×3 in der Mitte, damit Oscar etwas unter den Füßen hat
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                const r = cy + dr, co = cx + dc;
                if (r >= 0 && r < ROWS && co >= 0 && co < COLS) {
                    grid[r][co] = 'sand';
                }
            }
        }
        // Eine Palme als Orientierungspunkt
        if (cy - 1 >= 0) grid[cy - 1][cx] = 'palm';
        window.grid = grid;
    }

    window.INSEL_GENERATORS = { generateStarterIsland, generateLummerland, generateDinoIsland, generateMoonIsland, generateMarsIsland, generateWaterStart };
})();
