// === TERRAIN-GENERATOR — Die Insel lebt bevor du ankommst ===
// Prozedural: Strand, Palmen, Fluss, Berge, Höhle, Tiere, ein NPC irgendwo.
// Jede Insel ist anders. Seed aus Spielernamen.

(function () {
    'use strict';

    // Einfacher Seeded Random (deterministische Insel pro Name)
    function mulberry32(seed) {
        let h = seed | 0;
        return function () {
            h = Math.imul(h ^ (h >>> 16), 2246822507);
            h = Math.imul(h ^ (h >>> 13), 3266489909);
            h ^= h >>> 16;
            return (h >>> 0) / 4294967296;
        };
    }

    function hashString(str) {
        let h = 0;
        for (let i = 0; i < str.length; i++) {
            h = ((h << 5) - h + str.charCodeAt(i)) | 0;
        }
        return h;
    }

    // --- Simplex-artiges Noise (leichtgewichtig) ---
    function makeNoise(rng) {
        const perm = Array.from({ length: 256 }, () => Math.floor(rng() * 256));
        return function noise2d(x, y) {
            const xi = Math.floor(x) & 255;
            const yi = Math.floor(y) & 255;
            const xf = x - Math.floor(x);
            const yf = y - Math.floor(y);
            const u = xf * xf * (3 - 2 * xf);
            const v = yf * yf * (3 - 2 * yf);
            const a = perm[(xi + perm[yi & 255]) & 255];
            const b = perm[(xi + 1 + perm[yi & 255]) & 255];
            const c = perm[(xi + perm[(yi + 1) & 255]) & 255];
            const d = perm[(xi + 1 + perm[(yi + 1) & 255]) & 255];
            return (a + u * (b - a) + v * (c - a + u * (d - c - b + a))) / 255;
        };
    }

    // --- Haupt-Generator ---
    function generateTerrain(grid, rows, cols, playerName) {
        const seed = hashString(playerName || 'Schatzinsel');
        const rng = mulberry32(seed);
        const noise = makeNoise(rng);

        // Abstand vom Rand (0 = Rand, 1 = Mitte)
        function distFromEdge(r, c) {
            const dr = Math.min(r - 2, rows - 3 - r) / (rows / 2 - 2);
            const dc = Math.min(c - 2, cols - 3 - c) / (cols / 2 - 2);
            return Math.min(dr, dc);
        }

        // === PHASE 1: Strand-Ring (äußerste bebaubare Reihen) ===
        for (let r = 2; r < rows - 2; r++) {
            for (let c = 2; c < cols - 2; c++) {
                const d = distFromEdge(r, c);
                if (d < 0.15) {
                    // Strand: Sand mit gelegentlichen Palmen und Muscheln
                    if (rng() < 0.03) {
                        grid[r][c] = 'tree'; // Palme am Strand
                    } else if (rng() < 0.02) {
                        grid[r][c] = 'sand';
                    }
                }
            }
        }

        // === PHASE 2: Vegetation (Noise-basiert) ===
        for (let r = 4; r < rows - 4; r++) {
            for (let c = 4; c < cols - 4; c++) {
                if (grid[r][c]) continue; // Schon belegt
                const d = distFromEdge(r, c);
                if (d < 0.15) continue; // Strand frei lassen

                const n = noise(r * 0.3, c * 0.3);

                if (n > 0.7 && d > 0.3) {
                    // Dichter Wald im Inneren
                    grid[r][c] = rng() < 0.6 ? 'tree' : (rng() < 0.5 ? 'plant' : 'flower');
                } else if (n > 0.55 && d > 0.2) {
                    // Lichtung mit Pflanzen
                    if (rng() < 0.3) {
                        grid[r][c] = rng() < 0.5 ? 'plant' : 'flower';
                    }
                }
            }
        }

        // === PHASE 3: Fluss (von Berg zur Küste) ===
        const riverStartR = Math.floor(rows * 0.3 + rng() * rows * 0.3);
        const riverStartC = Math.floor(cols * 0.4 + rng() * cols * 0.2);
        let rr = riverStartR, rc = riverStartC;

        for (let i = 0; i < 40; i++) {
            if (rr < 2 || rr >= rows - 2 || rc < 2 || rc >= cols - 2) break;
            grid[rr][rc] = 'water';
            // Fluss etwas breiter (1-2 Felder)
            if (rc + 1 < cols - 2) grid[rr][rc + 1] = 'water';

            // Fließrichtung: tendiert nach unten/rechts zur Küste
            const dir = rng();
            if (dir < 0.5) rr++;
            else if (dir < 0.8) rc++;
            else rr += (rng() < 0.5 ? 1 : -1);

            // Fische im Fluss
            if (rng() < 0.15 && grid[rr]?.[rc] === 'water') {
                grid[rr][rc] = 'fish';
            }
        }

        // === PHASE 4: Berg/Hügel (Stein-Cluster) ===
        const mountainR = Math.floor(rows * 0.2 + rng() * rows * 0.2);
        const mountainC = Math.floor(cols * 0.2 + rng() * cols * 0.2);
        const mountainSize = 3 + Math.floor(rng() * 3);

        for (let dr = -mountainSize; dr <= mountainSize; dr++) {
            for (let dc = -mountainSize; dc <= mountainSize; dc++) {
                const mr = mountainR + dr;
                const mc = mountainC + dc;
                if (mr < 3 || mr >= rows - 3 || mc < 3 || mc >= cols - 3) continue;
                const dist = Math.sqrt(dr * dr + dc * dc);
                if (dist < mountainSize && rng() < 0.7) {
                    grid[mr][mc] = 'stone';
                }
                // Rand des Bergs: Erde
                if (dist >= mountainSize && dist < mountainSize + 1.5 && rng() < 0.4) {
                    if (!grid[mr][mc]) grid[mr][mc] = 'earth';
                }
            }
        }

        // === PHASE 5: Höhle (Loch im Berg) ===
        const caveR = mountainR + Math.floor(rng() * 2);
        const caveC = mountainC + Math.floor(rng() * 2);
        if (caveR > 3 && caveR < rows - 3 && caveC > 3 && caveC < cols - 3) {
            grid[caveR][caveC] = 'door'; // Höhleneingang
            if (grid[caveR][caveC - 1]) grid[caveR][caveC - 1] = 'stone'; // Rahmen
            if (grid[caveR][caveC + 1]) grid[caveR][caveC + 1] = 'stone';
            // Pilze um den Eingang
            for (let d = -1; d <= 1; d++) {
                const mr = caveR + 1;
                const mc = caveC + d;
                if (mr < rows - 2 && mc > 2 && mc < cols - 2 && !grid[mr][mc]) {
                    if (rng() < 0.5) grid[mr][mc] = 'mushroom';
                }
            }
        }

        // === PHASE 6: Tiere (statische Platzierung, fauna.js animiert sie) ===
        const animals = [];

        // Krabben am Strand
        for (let i = 0; i < 3; i++) {
            const side = Math.floor(rng() * 4);
            let ar, ac;
            if (side === 0) { ar = 3; ac = Math.floor(4 + rng() * (cols - 8)); }
            else if (side === 1) { ar = rows - 4; ac = Math.floor(4 + rng() * (cols - 8)); }
            else if (side === 2) { ar = Math.floor(4 + rng() * (rows - 8)); ac = 3; }
            else { ar = Math.floor(4 + rng() * (rows - 8)); ac = cols - 4; }
            animals.push({ type: 'crab', emoji: '🦀', r: ar, c: ac });
        }

        // Vögel im Wald
        for (let i = 0; i < 2; i++) {
            const ar = Math.floor(5 + rng() * (rows - 10));
            const ac = Math.floor(5 + rng() * (cols - 10));
            animals.push({ type: 'bird', emoji: '🐦', r: ar, c: ac });
        }

        // Schildkröte am Strand
        animals.push({
            type: 'turtle',
            emoji: '🐢',
            r: rows - 4,
            c: Math.floor(cols * 0.3 + rng() * cols * 0.4),
        });

        // Schmetterling bei Blumen
        animals.push({
            type: 'butterfly',
            emoji: '🦋',
            r: Math.floor(rows * 0.4 + rng() * rows * 0.2),
            c: Math.floor(cols * 0.4 + rng() * cols * 0.2),
        });

        // Frosch am Fluss
        animals.push({
            type: 'frog',
            emoji: '🐸',
            r: riverStartR + 1,
            c: riverStartC - 1,
        });

        // Hase bei Blumen/Wald
        animals.push({
            type: 'rabbit',
            emoji: '🐇',
            r: Math.floor(rows * 0.5 + rng() * rows * 0.2),
            c: Math.floor(cols * 0.3 + rng() * cols * 0.3),
        });

        // Papagei im Dschungel
        animals.push({
            type: 'parrot',
            emoji: '🦜',
            r: Math.floor(rows * 0.3 + rng() * rows * 0.2),
            c: Math.floor(cols * 0.5 + rng() * cols * 0.3),
        });

        // Zweiter Schmetterling
        animals.push({
            type: 'butterfly',
            emoji: '🦋',
            r: Math.floor(rows * 0.6 + rng() * rows * 0.1),
            c: Math.floor(cols * 0.2 + rng() * cols * 0.3),
        });

        // === PHASE 7: NPCs über die Insel verteilen ===
        // Jeder NPC hat einen Lieblingsort. Man muss sie FINDEN.
        const npcPlacements = [
            { id: 'spongebob', emoji: '🧽', habitat: 'beach' },    // Am Strand
            { id: 'maus',      emoji: '🐭', habitat: 'flowers' },   // Bei Blumen
            { id: 'krabs',     emoji: '🦀', habitat: 'water' },     // Am Fluss/Hafen
            { id: 'elefant',   emoji: '🐘', habitat: 'forest' },    // Im Wald
            { id: 'tommy',     emoji: '🦞', habitat: 'boat' },      // Beim Boot
            { id: 'neinhorn',  emoji: '🦄', habitat: 'cave' },      // Bei der Höhle
            { id: 'paluten',   emoji: '💎', habitat: 'mountain' },   // Auf dem Berg
            { id: 'lukas',     emoji: '🚂', habitat: 'path' },       // Am Weg (Schienen!)
            // Bernd bleibt in der Chat-Bubble (Support-Agent, nicht auf der Karte)
        ];

        const npcsOnMap = [];
        for (const npc of npcPlacements) {
            let pos = null;
            switch (npc.habitat) {
                case 'beach':
                    pos = { r: rows - 4, c: Math.floor(cols * 0.5 + rng() * cols * 0.3) };
                    break;
                case 'flowers':
                    // Erste Blume finden
                    for (let r = 4; r < rows - 4 && !pos; r++) {
                        for (let c = 4; c < cols - 4 && !pos; c++) {
                            if (grid[r][c] === 'flower') pos = { r: r, c: c + 1 };
                        }
                    }
                    if (!pos) pos = { r: Math.floor(rows * 0.6), c: Math.floor(cols * 0.6) };
                    break;
                case 'water':
                    pos = { r: riverStartR + 2, c: riverStartC + 2 };
                    break;
                case 'forest':
                    // Waldstelle finden
                    for (let r = 5; r < rows - 5 && !pos; r++) {
                        for (let c = 5; c < cols - 5 && !pos; c++) {
                            if (grid[r][c] === 'tree' && !grid[r + 1]?.[c]) pos = { r: r + 1, c: c };
                        }
                    }
                    if (!pos) pos = { r: Math.floor(rows * 0.4), c: Math.floor(cols * 0.4) };
                    break;
                case 'boat':
                    pos = { r: 3, c: boatC > 2 ? boatC - 1 : Math.floor(cols * 0.7) };
                    break;
                case 'cave':
                    pos = { r: caveR + 1, c: caveC };
                    break;
                case 'mountain':
                    pos = { r: mountainR - 1, c: mountainC };
                    break;
                case 'path':
                    // Am Weg — Lukas steht bei seinen "Schienen"
                    pos = { r: Math.floor(rows * 0.65), c: Math.floor(cols * 0.5) };
                    break;
            }
            // Sicherheitscheck
            if (pos && pos.r >= 2 && pos.r < rows - 2 && pos.c >= 2 && pos.c < cols - 2) {
                npcsOnMap.push({ ...npc, pos });
            }
        }

        // === PHASE 8: Boot an der Küste (Einladung zum Segeln) ===
        const boatR = 2;
        const boatC = Math.floor(cols * 0.7 + rng() * cols * 0.15);
        if (boatC > 2 && boatC < cols - 2) {
            grid[boatR][boatC] = 'boat';
        }

        // === PHASE 9: Weg vom Strand ins Inselinnere ===
        const pathStart = Math.floor(cols * 0.5);
        for (let r = rows - 4; r > rows / 2; r--) {
            const wobble = Math.floor(noise(r * 0.5, 0) * 2 - 1);
            const pc = pathStart + wobble;
            if (pc > 3 && pc < cols - 3 && !grid[r][pc]) {
                grid[r][pc] = 'path';
            }
        }

        return {
            animals: animals,
            npcs: npcsOnMap,
            mountain: { r: mountainR, c: mountainC },
            cave: { r: caveR, c: caveC },
            river: { startR: riverStartR, startC: riverStartC },
        };
    }

    // --- Public API ---
    window.Terrain = {
        generate: generateTerrain,
    };

})();
