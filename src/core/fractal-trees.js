// === FRAKTALE BÄUME — Stochastisches L-System nach Prusinkiewicz & Lindenmayer ===
// Jeder Baum wächst anders: Winkel, Verzweigung, Farbe aus Zell-Hash.
// Keine zwei Bäume auf der Insel sind identisch.

(function () {
    'use strict';

    // --- Deterministic hash per cell --- mehrere unabhängige Werte
    function cellHash(r, c, salt) {
        salt = salt || 0;
        var h = ((r * 7919 + c * 104729 + salt * 1013) ^ (r << 5) ^ (c << 3)) >>> 0;
        h = ((h ^ (h >>> 16)) * 0x45d9f3b) >>> 0;
        h = ((h ^ (h >>> 16)) * 0x45d9f3b) >>> 0;
        return (h ^ (h >>> 16)) / 4294967296;
    }

    // --- Stochastisches L-System: Regelauswahl per Zell-Seed ---
    // Prusinkiewicz: p-Tabellen mit Wahrscheinlichkeiten → hier deterministisch per Position
    var RULE_VARIANTS = {
        tree: [
            { F: 'FF[+F[-F]F][-F[+F]F]' },           // klassisch symmetrisch
            { F: 'F[+F]F[-F]F' },                      // Zickzack
            { F: 'FF[+F][-F][++F][--F]' },             // breit gefächert
            { F: 'F[+FF][-FF]F[+F][-F]' },             // dicht
            { F: 'FF[+F[-F[-F]F]F][-F[+F]F]' },        // asymmetrisch tief
        ],
        small_tree: [
            { F: 'F[+F][-F]' },
            { F: 'F[+F][-F]F' },
            { F: 'F[++F][-F]' },
            { F: 'F[+F][--F]F' },
        ],
        sapling: [
            { F: 'F[+F][-F]' },
            { F: 'F[+F]F' },
            { F: 'F[-F][+F]' },
        ]
    };

    // Winkel-Varianten: verschiedene Spreizungen
    var ANGLE_VARIANTS = {
        tree:       [18, 22, 26, 30, 15, 35],
        small_tree: [20, 25, 30, 35],
        sapling:    [25, 30, 35, 40]
    };

    // Blattfarb-Palette — von hellgrün bis dunkelgrün bis herbstlich
    var LEAF_PALETTES = [
        ['#2E7D32', '#388E3C', '#43A047'],   // Tiefgrün
        ['#1B5E20', '#2E7D32', '#4CAF50'],   // Dunkelwald
        ['#558B2F', '#689F38', '#7CB342'],   // Hellgrün
        ['#33691E', '#558B2F', '#8BC34A'],   // Limettengrün
        ['#BF360C', '#E64A19', '#FF5722'],   // Herbst Orange
        ['#4E342E', '#6D4C41', '#8D6E63'],   // Winterkahl (nur Stamm)
        ['#1A237E', '#283593', '#3F51B5'],   // Magischer Blaubaum
        ['#F57F17', '#F9A825', '#FBC02D'],   // Goldener Herbst
    ];

    var TRUNK_COLORS = ['#4E342E', '#5D4037', '#6D4C41', '#3E2723', '#795548'];

    // --- L-System string generation ---
    function generateLSystem(axiom, rules, iterations) {
        var current = axiom;
        for (var i = 0; i < iterations; i++) {
            var next = '';
            for (var j = 0; j < current.length; j++) {
                var ch = current[j];
                next += rules[ch] || ch;
            }
            current = next;
        }
        return current;
    }

    // --- Per-Zelle eindeutige Baum-Konfiguration ---
    function getTreeConfig(treeType, r, c) {
        var h0 = cellHash(r, c, 0);
        var h1 = cellHash(r, c, 1);
        var h2 = cellHash(r, c, 2);
        var h3 = cellHash(r, c, 3);
        var h4 = cellHash(r, c, 4);

        var resolvedType = RULE_VARIANTS[treeType] ? treeType : 'tree';
        var rules    = RULE_VARIANTS[resolvedType];
        var angles   = ANGLE_VARIANTS[resolvedType];
        var palette  = LEAF_PALETTES[Math.floor(h3 * LEAF_PALETTES.length)];
        var trunk    = TRUNK_COLORS[Math.floor(h4 * TRUNK_COLORS.length)];

        var chosenRule  = rules[Math.floor(h0 * rules.length)];
        var chosenAngle = angles[Math.floor(h1 * angles.length)];

        var iterations = treeType === 'sapling' ? 1 : (h2 < 0.3 ? 3 : 2);
        var baseLength = treeType === 'tree'
            ? (0.9 + h0 * 0.6)
            : treeType === 'small_tree'
                ? (0.5 + h1 * 0.4)
                : (0.3 + h2 * 0.25);

        var leafSize = treeType === 'tree'
            ? (0.10 + h1 * 0.08)
            : (0.07 + h2 * 0.06);

        return {
            axiom:        'F',
            rules:        chosenRule,
            angle:        chosenAngle,
            iterations:   iterations,
            lengthFactor: treeType === 'tree' ? (0.45 + h2 * 0.15) : (0.55 + h0 * 0.15),
            baseLength:   baseLength,
            lineWidth:    treeType === 'tree' ? (2.5 + h3 * 1.5) : (1.5 + h4 * 1.0),
            trunkColor:   trunk,
            leafColor:    palette[Math.floor(h4 * palette.length)],
            leafColors:   palette,
            leafSize:     leafSize
        };
    }

    // --- Draw L-System tree on canvas ---
    function drawTree(ctx, x, y, cellSize, treeType, r, c) {
        var def = getTreeConfig(treeType, r, c);
        if (!def || !def.rules) return;
        var lStr = generateLSystem(def.axiom, def.rules, def.iterations);
        var len = cellSize * def.baseLength;
        var angleRad = def.angle * Math.PI / 180;

        // Winkeloffset: leichte Neigung je nach Zellposition
        var tilt = (cellHash(r, c, 5) - 0.5) * 8 * Math.PI / 180;

        ctx.save();
        ctx.translate(x, y);

        var stack = [];
        var currentAngle = -Math.PI / 2 + tilt;
        var currentLen = len;
        var depth = 0;
        var maxDepth = def.iterations + 1;

        ctx.lineCap = 'round';

        for (var i = 0; i < lStr.length; i++) {
            var ch = lStr[i];

            if (ch === 'F') {
                var branchWidth = def.lineWidth * Math.max(0.15, 1 - depth / (maxDepth + 1) * 0.75);
                var isLeafBranch = depth >= maxDepth - 1;
                ctx.strokeStyle = isLeafBranch ? def.leafColor : def.trunkColor;
                ctx.lineWidth = Math.max(0.4, branchWidth);

                var dx = Math.cos(currentAngle) * currentLen;
                var dy = Math.sin(currentAngle) * currentLen;

                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(dx, dy);
                ctx.stroke();

                ctx.translate(dx, dy);

                // Blatt an Endästen — Größe und Farbe variieren
                if (isLeafBranch) {
                    var leafIdx = Math.floor(cellHash(r + depth, c + i, 7) * def.leafColors.length);
                    var leafR = cellSize * def.leafSize * (0.7 + cellHash(r + i, c + depth, 6) * 0.6);
                    ctx.fillStyle = def.leafColors[leafIdx];
                    ctx.globalAlpha = 0.75 + cellHash(i, depth, 8) * 0.25;
                    ctx.beginPath();
                    ctx.arc(0, 0, leafR, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.globalAlpha = 1;
                }
            } else if (ch === '+') {
                currentAngle += angleRad;
            } else if (ch === '-') {
                currentAngle -= angleRad;
            } else if (ch === '[') {
                stack.push({
                    x:     ctx.getTransform().e,
                    y:     ctx.getTransform().f,
                    angle: currentAngle,
                    len:   currentLen,
                    depth: depth
                });
                currentLen *= def.lengthFactor;
                depth++;
            } else if (ch === ']') {
                if (stack.length > 0) {
                    var state = stack.pop();
                    ctx.setTransform(1, 0, 0, 1, 0, 0);
                    ctx.translate(state.x, state.y);
                    currentAngle = state.angle;
                    currentLen   = state.len;
                    depth        = state.depth;
                }
            }
        }

        ctx.restore();
    }

    // --- Flat (top-down) mode ---
    function drawFlatTree(ctx, r, c, cellSize, treeType, waterBorder) {
        var x = (c + waterBorder) * cellSize + cellSize / 2;
        var y = (r + waterBorder) * cellSize + cellSize * 0.85;
        drawTree(ctx, x, y, cellSize, treeType, r, c);
    }

    // --- Isometric mode ---
    function drawIsoTree(ctx, r, c, cellSize, treeType, waterBorder, COLS) {
        if (!window.ISO_RENDERER) return;
        var totalCols = COLS + waterBorder * 2;
        var originX   = (totalCols * cellSize) / 2;
        var originY   = cellSize * 2;
        var depth     = cellSize * 0.4;

        var pos = window.ISO_RENDERER.gridToIso(r + waterBorder, c + waterBorder, cellSize, originX, originY);
        drawTree(ctx, pos.x, pos.y - depth, cellSize, treeType, r, c);
    }

    // --- Batch draw all trees ---
    function drawAllTrees(ctx, grid, ROWS, COLS, cellSize, waterBorder, isoMode) {
        for (var r = 0; r < ROWS; r++) {
            for (var c = 0; c < COLS; c++) {
                var cell = grid[r][c];
                if (cell === 'sapling' || cell === 'small_tree' || cell === 'tree') {
                    if (isoMode) {
                        drawIsoTree(ctx, r, c, cellSize, cell, waterBorder, COLS);
                    } else {
                        drawFlatTree(ctx, r, c, cellSize, cell, waterBorder);
                    }
                }
            }
        }
    }

    window.FRACTAL_TREES = {
        drawAllTrees: drawAllTrees,
        drawFlatTree: drawFlatTree,
        drawIsoTree:  drawIsoTree
    };

})();
