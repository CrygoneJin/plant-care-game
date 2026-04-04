// === ELEVATION — Höhenkarte für die Insel ===
// Simplex-Noise basierte Heightmap, parallel zum Grid.
// Gravitation IST das Grid — und jetzt hat es Krümmung.

(function () {
    'use strict';

    // --- Simplex Noise (2D) ---
    // Minimal implementation — kein npm, kein build tool, passt zum Stack.
    // Based on Stefan Gustavson's simplified noise algorithm.

    var grad3 = [
        [1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],
        [1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],
        [0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]
    ];

    var perm = new Uint8Array(512);
    var permMod12 = new Uint8Array(512);

    function seedNoise(seed) {
        var p = new Uint8Array(256);
        for (var i = 0; i < 256; i++) p[i] = i;
        // Fisher-Yates mit seed
        var s = seed;
        for (var i = 255; i > 0; i--) {
            s = (s * 16807 + 0) % 2147483647;
            var j = s % (i + 1);
            var tmp = p[i]; p[i] = p[j]; p[j] = tmp;
        }
        for (var i = 0; i < 512; i++) {
            perm[i] = p[i & 255];
            permMod12[i] = perm[i] % 12;
        }
    }

    function dot2(g, x, y) { return g[0] * x + g[1] * y; }

    var F2 = 0.5 * (Math.sqrt(3) - 1);
    var G2 = (3 - Math.sqrt(3)) / 6;

    function simplex2(xin, yin) {
        var s = (xin + yin) * F2;
        var i = Math.floor(xin + s);
        var j = Math.floor(yin + s);
        var t = (i + j) * G2;
        var X0 = i - t, Y0 = j - t;
        var x0 = xin - X0, y0 = yin - Y0;
        var i1, j1;
        if (x0 > y0) { i1 = 1; j1 = 0; } else { i1 = 0; j1 = 1; }
        var x1 = x0 - i1 + G2, y1 = y0 - j1 + G2;
        var x2 = x0 - 1 + 2 * G2, y2 = y0 - 1 + 2 * G2;
        var ii = i & 255, jj = j & 255;
        var gi0 = permMod12[ii + perm[jj]];
        var gi1 = permMod12[ii + i1 + perm[jj + j1]];
        var gi2 = permMod12[ii + 1 + perm[jj + 1]];
        var n0 = 0, n1 = 0, n2 = 0;
        var t0 = 0.5 - x0 * x0 - y0 * y0;
        if (t0 >= 0) { t0 *= t0; n0 = t0 * t0 * dot2(grad3[gi0], x0, y0); }
        var t1 = 0.5 - x1 * x1 - y1 * y1;
        if (t1 >= 0) { t1 *= t1; n1 = t1 * t1 * dot2(grad3[gi1], x1, y1); }
        var t2 = 0.5 - x2 * x2 - y2 * y2;
        if (t2 >= 0) { t2 *= t2; n2 = t2 * t2 * dot2(grad3[gi2], x2, y2); }
        // Result in [-1, 1]
        return 70 * (n0 + n1 + n2);
    }

    // --- Multi-octave fractal noise ---
    function fbm(x, y, octaves, lacunarity, gain) {
        var sum = 0, amp = 1, freq = 1, max = 0;
        for (var i = 0; i < octaves; i++) {
            sum += amp * simplex2(x * freq, y * freq);
            max += amp;
            amp *= gain;
            freq *= lacunarity;
        }
        return sum / max; // normalized to [-1, 1]
    }

    // --- Material-Höheneinfluss ---
    // Bestimmte Materialien erzwingen eine Mindest-/Maximalhöhe
    var MATERIAL_ELEVATION = {
        mountain:   { min: 0.80, max: 1.00 },
        volcano:    { min: 0.85, max: 1.00 },
        cave:       { min: 0.05, max: 0.20 },
        stalactite: { min: 0.05, max: 0.20 },
        water:      { min: 0.10, max: 0.30 },
        fountain:   { min: 0.15, max: 0.35 },
        sand:       { min: 0.15, max: 0.35 },
        stone:      { min: 0.50, max: 0.75 },
        path:       { min: 0.30, max: 0.45 },
    };

    // --- Heightmap generieren ---
    // Erzeugt eine ROWS×COLS Float-Matrix [0..1]
    function generateHeightMap(grid, ROWS, COLS, seed) {
        seedNoise(seed || Date.now());

        var heightMap = [];
        var cx = COLS / 2, cy = ROWS / 2;
        var rx = COLS * 0.45, ry = ROWS * 0.45;

        // Pass 1: Base noise
        for (var r = 0; r < ROWS; r++) {
            heightMap[r] = new Float32Array(COLS);
            for (var c = 0; c < COLS; c++) {
                // Insel-Maske: Höhe fällt zum Rand hin ab (elliptisch)
                var dx = (c - cx) / rx, dy = (r - cy) / ry;
                var distSq = dx * dx + dy * dy;
                var islandMask = Math.max(0, 1 - distSq * 1.5);
                islandMask = islandMask * islandMask; // quadratischer Abfall

                // Fraktales Noise — mehrere Oktaven für natürliche Höhen
                var nx = c / COLS * 4;
                var ny = r / ROWS * 4;
                var noise = fbm(nx, ny, 5, 2.0, 0.5);
                // [-1, 1] → [0, 1]
                noise = (noise + 1) * 0.5;

                // Kombinieren: Noise × Insel-Maske
                heightMap[r][c] = noise * islandMask;
            }
        }

        // Pass 2: Material-Constraints anwenden
        for (var r = 0; r < ROWS; r++) {
            for (var c = 0; c < COLS; c++) {
                var mat = grid[r][c];
                if (mat && MATERIAL_ELEVATION[mat]) {
                    var constraint = MATERIAL_ELEVATION[mat];
                    var h = heightMap[r][c];
                    // Clamp in den Material-Bereich, aber sanft
                    if (h < constraint.min) {
                        heightMap[r][c] = constraint.min + (constraint.max - constraint.min) * 0.3;
                    } else if (h > constraint.max) {
                        heightMap[r][c] = constraint.max - (constraint.max - constraint.min) * 0.1;
                    }
                }
            }
        }

        // Pass 3: Sanfte Übergänge (3×3 Gauss-Blur, 2 Iterationen)
        for (var iter = 0; iter < 2; iter++) {
            var blurred = [];
            for (var r = 0; r < ROWS; r++) {
                blurred[r] = new Float32Array(COLS);
                for (var c = 0; c < COLS; c++) {
                    var sum = 0, weight = 0;
                    for (var dr = -1; dr <= 1; dr++) {
                        for (var dc = -1; dc <= 1; dc++) {
                            var nr = r + dr, nc = c + dc;
                            if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
                                var w = (dr === 0 && dc === 0) ? 4 : (dr === 0 || dc === 0) ? 2 : 1;
                                sum += heightMap[nr][nc] * w;
                                weight += w;
                            }
                        }
                    }
                    blurred[r][c] = sum / weight;
                }
            }
            // Re-apply material constraints nach Blur
            for (var r = 0; r < ROWS; r++) {
                for (var c = 0; c < COLS; c++) {
                    heightMap[r][c] = blurred[r][c];
                    var mat = grid[r][c];
                    if (mat && MATERIAL_ELEVATION[mat]) {
                        var constraint = MATERIAL_ELEVATION[mat];
                        heightMap[r][c] = Math.max(constraint.min, Math.min(constraint.max, heightMap[r][c]));
                    }
                }
            }
        }

        return heightMap;
    }

    // --- Höhenstufen für visuelle Darstellung ---
    // 5 Stufen: Tiefsee, Strand, Flachland, Hügel, Berg
    var ELEVATION_BANDS = [
        { max: 0.20, label: 'Tief',      tint: -25 },  // dunkler
        { max: 0.35, label: 'Strand',     tint: -10 },
        { max: 0.55, label: 'Flachland',  tint: 0 },    // neutral
        { max: 0.75, label: 'Hügel',      tint: 12 },   // heller
        { max: 1.01, label: 'Berg',       tint: 25 },   // am hellsten
    ];

    function getElevationTint(h) {
        for (var i = 0; i < ELEVATION_BANDS.length; i++) {
            if (h <= ELEVATION_BANDS[i].max) return ELEVATION_BANDS[i].tint;
        }
        return 0;
    }

    // --- Konturen: gibt true zurück wenn Nachbar-Höhe stark abweicht ---
    function hasContour(heightMap, r, c, ROWS, COLS, threshold) {
        var h = heightMap[r][c];
        threshold = threshold || 0.12;
        var neighbors = [[0,1],[0,-1],[1,0],[-1,0]];
        for (var i = 0; i < neighbors.length; i++) {
            var nr = r + neighbors[i][0], nc = c + neighbors[i][1];
            if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
                if (Math.abs(heightMap[nr][nc] - h) > threshold) return true;
            }
        }
        return false;
    }

    // --- Schattierung: einfacher Hillshade (Licht von NW) ---
    function getHillshade(heightMap, r, c, ROWS, COLS) {
        // Gradient in x und y Richtung
        var left = c > 0 ? heightMap[r][c - 1] : heightMap[r][c];
        var right = c < COLS - 1 ? heightMap[r][c + 1] : heightMap[r][c];
        var up = r > 0 ? heightMap[r - 1][c] : heightMap[r][c];
        var down = r < ROWS - 1 ? heightMap[r + 1][c] : heightMap[r][c];

        // Licht von NW → Schatten nach SE
        var dzdx = (right - left) * 2;
        var dzdy = (down - up) * 2;

        // Hillshade: -1 (voller Schatten) bis +1 (volles Licht)
        // Lichtrichtung 315° (NW), Elevation 45°
        var azimuth = 315 * Math.PI / 180;
        var altitude = 45 * Math.PI / 180;
        var slope = Math.atan(Math.sqrt(dzdx * dzdx + dzdy * dzdy));
        var aspect = Math.atan2(-dzdy, -dzdx);

        var hillshade = Math.cos(altitude) * Math.cos(slope) +
                        Math.sin(altitude) * Math.sin(slope) * Math.cos(azimuth - aspect);

        return Math.max(0, Math.min(1, hillshade));
    }

    // --- Heightmap serialisieren (kompakt für localStorage) ---
    // Quantisiert auf 0-255 → Base64
    function serializeHeightMap(heightMap, ROWS, COLS) {
        var bytes = new Uint8Array(ROWS * COLS);
        for (var r = 0; r < ROWS; r++) {
            for (var c = 0; c < COLS; c++) {
                bytes[r * COLS + c] = Math.round(Math.max(0, Math.min(1, heightMap[r][c])) * 255);
            }
        }
        // Uint8Array → Base64
        var binary = '';
        for (var i = 0; i < bytes.length; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }

    function deserializeHeightMap(encoded, ROWS, COLS) {
        try {
            var binary = atob(encoded);
            if (binary.length !== ROWS * COLS) return null;
            var heightMap = [];
            for (var r = 0; r < ROWS; r++) {
                heightMap[r] = new Float32Array(COLS);
                for (var c = 0; c < COLS; c++) {
                    heightMap[r][c] = binary.charCodeAt(r * COLS + c) / 255;
                }
            }
            return heightMap;
        } catch (e) {
            return null;
        }
    }

    // --- Export ---
    window.INSEL_ELEVATION = {
        generateHeightMap: generateHeightMap,
        getElevationTint: getElevationTint,
        hasContour: hasContour,
        getHillshade: getHillshade,
        serializeHeightMap: serializeHeightMap,
        deserializeHeightMap: deserializeHeightMap,
        MATERIAL_ELEVATION: MATERIAL_ELEVATION,
        ELEVATION_BANDS: ELEVATION_BANDS,
        // Noise direkt exponieren für Tests/Debugging
        simplex2: simplex2,
        fbm: fbm,
        seedNoise: seedNoise,
    };

})();
