// === FRAKTALE BÄUME — L-System SpreadTree auf dem Insel-Grid ===
// Lindenmayer (1968): Axiom + Regeln → Rekursion → Baum
// Jeder Baum wächst aus seiner Grid-Position, deterministisch pro Zelle.

(function () {
    'use strict';

    // --- L-System definitions ---
    // Each tree type has an axiom, rules, angle, iterations, and length shrink factor
    var TREE_TYPES = {
        small_tree: {
            axiom: 'F',
            rules: { F: 'F[+F][-F]' },
            angle: 25,
            iterations: 2,
            lengthFactor: 0.6,
            baseLength: 0.7,   // relative to CELL_SIZE
            lineWidth: 2.5,
            trunkColor: '#5D4037',
            leafColor: '#43A047',
            leafSize: 0.12     // relative to CELL_SIZE
        },
        tree: {
            axiom: 'F',
            rules: { F: 'FF[+F[-F]F][-F[+F]F]' },
            angle: 22,
            iterations: 2,
            lengthFactor: 0.5,
            baseLength: 1.2,
            lineWidth: 3,
            trunkColor: '#4E342E',
            leafColor: '#2E7D32',
            leafSize: 0.15
        },
        sapling: {
            axiom: 'F',
            rules: { F: 'F[+F][-F]' },
            angle: 30,
            iterations: 1,
            lengthFactor: 0.65,
            baseLength: 0.4,
            lineWidth: 1.5,
            trunkColor: '#795548',
            leafColor: '#66BB6A',
            leafSize: 0.08
        }
    };

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

    // --- Deterministic pseudo-random per cell (for variation) ---
    function cellHash(r, c) {
        // Simple hash for per-cell variation
        var h = (r * 7919 + c * 104729 + 31) % 256;
        return h / 256; // 0..1
    }

    // --- Draw L-System tree on canvas ---
    function drawTree(ctx, x, y, cellSize, treeType, r, c) {
        var def = TREE_TYPES[treeType];
        if (!def) return;

        var lStr = generateLSystem(def.axiom, def.rules, def.iterations);
        var len = cellSize * def.baseLength;
        var angleRad = def.angle * Math.PI / 180;

        // Per-cell variation: slight angle + length offset
        var hash = cellHash(r, c);
        var hash2 = cellHash(c, r);
        var angleVariation = (hash - 0.5) * 10 * Math.PI / 180; // ±5°
        var lengthVariation = 0.85 + hash2 * 0.3; // 0.85..1.15

        ctx.save();
        ctx.translate(x, y);

        // Start at bottom of cell, draw upward
        var stack = [];
        var currentAngle = -Math.PI / 2 + angleVariation; // straight up + variation
        var currentLen = len * lengthVariation;
        var depth = 0;
        var maxDepth = def.iterations + 1;

        ctx.lineCap = 'round';

        for (var i = 0; i < lStr.length; i++) {
            var ch = lStr[i];

            if (ch === 'F') {
                // Draw a branch
                var branchWidth = def.lineWidth * (1 - depth / (maxDepth + 2) * 0.6);
                ctx.strokeStyle = depth < maxDepth - 1 ? def.trunkColor : def.leafColor;
                ctx.lineWidth = Math.max(0.5, branchWidth);

                var dx = Math.cos(currentAngle) * currentLen;
                var dy = Math.sin(currentAngle) * currentLen;

                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(dx, dy);
                ctx.stroke();

                ctx.translate(dx, dy);

                // Draw leaf at terminal branches
                if (depth >= maxDepth - 1) {
                    var leafR = cellSize * def.leafSize * (0.8 + cellHash(r + depth, c + i) * 0.4);
                    ctx.fillStyle = def.leafColor;
                    ctx.globalAlpha = 0.8;
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
                    x: ctx.getTransform().e,
                    y: ctx.getTransform().f,
                    angle: currentAngle,
                    len: currentLen,
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
                    currentLen = state.len;
                    depth = state.depth;
                }
            }
        }

        ctx.restore();
    }

    // --- Draw tree in flat (top-down) mode ---
    // Renders on top of the grid cell, centered, growing "up" on canvas
    function drawFlatTree(ctx, r, c, cellSize, treeType, waterBorder) {
        var x = (c + waterBorder) * cellSize + cellSize / 2;
        var y = (r + waterBorder) * cellSize + cellSize * 0.85; // base at bottom of cell
        drawTree(ctx, x, y, cellSize, treeType, r, c);
    }

    // --- Draw tree in isometric mode ---
    function drawIsoTree(ctx, r, c, cellSize, treeType, waterBorder, COLS) {
        if (!window.ISO_RENDERER) return;
        var totalCols = COLS + waterBorder * 2;
        var originX = (totalCols * cellSize) / 2;
        var originY = cellSize * 2;
        var depth = cellSize * 0.4;

        var gr = r + waterBorder;
        var gc = c + waterBorder;
        var pos = window.ISO_RENDERER.gridToIso(gr, gc, cellSize, originX, originY);

        // Tree base is at the top of the iso cube
        drawTree(ctx, pos.x, pos.y - depth, cellSize, treeType, r, c);
    }

    // --- Batch draw all trees on the grid ---
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

    // --- Public API ---
    window.FRACTAL_TREES = {
        drawAllTrees: drawAllTrees,
        drawFlatTree: drawFlatTree,
        drawIsoTree: drawIsoTree,
        TREE_TYPES: TREE_TYPES
    };

})();
