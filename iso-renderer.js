// === ISOMETRISCHER RENDERER ===
// Tetraeder-Gitter: Dreiecke → isometrische Würfel → Raumzeit-Geometrie
// 道生一 — und die Eins ist ein Simplex.

(function () {
    'use strict';

    // --- Isometric coordinate helpers ---

    // Tile dimensions: width = CELL_SIZE * 2, height = CELL_SIZE
    // This gives the classic 2:1 isometric ratio

    function gridToIso(r, c, cellSize, originX, originY) {
        const tileW = cellSize * 1.8;
        const tileH = cellSize * 0.9;
        return {
            x: originX + (c - r) * tileW / 2,
            y: originY + (c + r) * tileH / 2
        };
    }

    function isoToGrid(px, py, cellSize, originX, originY) {
        const tileW = cellSize * 1.8;
        const tileH = cellSize * 0.9;
        const sx = px - originX;
        const sy = py - originY;
        const c = (sx / (tileW / 2) + sy / (tileH / 2)) / 2;
        const r = (sy / (tileH / 2) - sx / (tileW / 2)) / 2;
        return { r: Math.floor(r), c: Math.floor(c) };
    }

    // --- Draw an isometric diamond (top face) ---
    function drawDiamond(ctx, x, y, tileW, tileH) {
        ctx.beginPath();
        ctx.moveTo(x, y - tileH / 2);          // top
        ctx.lineTo(x + tileW / 2, y);           // right
        ctx.lineTo(x, y + tileH / 2);           // bottom
        ctx.lineTo(x - tileW / 2, y);           // left
        ctx.closePath();
    }

    // --- Draw an isometric cube (3 visible faces = 3 Kräfte) ---
    function drawIsoCube(ctx, x, y, tileW, tileH, depth, topColor, leftColor, rightColor) {
        // Top face (die sichtbare Fläche — elektromagnetisch)
        ctx.beginPath();
        ctx.moveTo(x, y - depth - tileH / 2);
        ctx.lineTo(x + tileW / 2, y - depth);
        ctx.lineTo(x, y - depth + tileH / 2);
        ctx.lineTo(x - tileW / 2, y - depth);
        ctx.closePath();
        ctx.fillStyle = topColor;
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.15)';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Left face (schwache Kraft)
        ctx.beginPath();
        ctx.moveTo(x - tileW / 2, y - depth);
        ctx.lineTo(x, y - depth + tileH / 2);
        ctx.lineTo(x, y + tileH / 2);
        ctx.lineTo(x - tileW / 2, y);
        ctx.closePath();
        ctx.fillStyle = leftColor;
        ctx.fill();
        ctx.stroke();

        // Right face (starke Kraft)
        ctx.beginPath();
        ctx.moveTo(x + tileW / 2, y - depth);
        ctx.lineTo(x, y - depth + tileH / 2);
        ctx.lineTo(x, y + tileH / 2);
        ctx.lineTo(x + tileW / 2, y);
        ctx.closePath();
        ctx.fillStyle = rightColor;
        ctx.fill();
        ctx.stroke();
    }

    // --- Color helpers: darken/lighten for cube faces ---
    function adjustColor(hex, amount) {
        // hex like '#3498DB' or 'rgb(...)' → darken/lighten
        let r, g, b;
        if (hex.startsWith('#')) {
            const num = parseInt(hex.slice(1), 16);
            r = (num >> 16) & 255;
            g = (num >> 8) & 255;
            b = num & 255;
        } else if (hex.startsWith('rgb')) {
            const m = hex.match(/(\d+)/g);
            if (!m) return hex;
            r = parseInt(m[0]); g = parseInt(m[1]); b = parseInt(m[2]);
        } else {
            return hex;
        }
        r = Math.max(0, Math.min(255, r + amount));
        g = Math.max(0, Math.min(255, g + amount));
        b = Math.max(0, Math.min(255, b + amount));
        return `rgb(${r},${g},${b})`;
    }

    // --- Main iso drawing functions exposed to game.js ---

    function drawIsoWater(ctx, totalRows, totalCols, ROWS, COLS, WATER_BORDER, cellSize, time, prefersReducedMotion) {
        const tileW = cellSize * 1.8;
        const tileH = cellSize * 0.9;
        const originX = (totalCols * cellSize) / 2;
        const originY = cellSize * 2;

        for (let r = 0; r < totalRows; r++) {
            for (let c = 0; c < totalCols; c++) {
                const isIsland = r >= WATER_BORDER && r < WATER_BORDER + ROWS &&
                                 c >= WATER_BORDER && c < WATER_BORDER + COLS;
                if (isIsland) continue;

                const pos = gridToIso(r, c, cellSize, originX, originY);
                const wave = prefersReducedMotion ? 0 : Math.sin(time * 2 + r * 0.5 + c * 0.3) * 10;
                const blue = 52 + wave;
                const color = `rgb(${blue}, ${blue + 100}, ${blue + 167})`;

                drawDiamond(ctx, pos.x, pos.y, tileW, tileH);
                ctx.fillStyle = color;
                ctx.fill();
            }
        }
    }

    function drawIsoIsland(ctx, grid, MATERIALS, ROWS, COLS, WATER_BORDER, cellSize, time, prefersReducedMotion) {
        const tileW = cellSize * 1.8;
        const tileH = cellSize * 0.9;
        const totalCols = COLS + WATER_BORDER * 2;
        const originX = (totalCols * cellSize) / 2;
        const originY = cellSize * 2;
        const depth = cellSize * 0.4;

        // Draw back-to-front for correct overlap (painter's algorithm)
        for (let r = 0; r < ROWS; r++) {
            for (let c = 0; c < COLS; c++) {
                const gr = r + WATER_BORDER;
                const gc = c + WATER_BORDER;
                const pos = gridToIso(gr, gc, cellSize, originX, originY);

                const isWaterEdge = r < 2 || r >= ROWS - 2 || c < 2 || c >= COLS - 2;
                const isBeachEdge = !isWaterEdge && (r === 2 || r === ROWS - 3 || c === 2 || c === COLS - 3);

                if (isWaterEdge) {
                    // Water edge — same as outer water
                    const wave = prefersReducedMotion ? 0 : Math.sin(time * 2 + gr * 0.5 + gc * 0.3) * 10;
                    const blue = 52 + wave;
                    drawDiamond(ctx, pos.x, pos.y, tileW, tileH);
                    ctx.fillStyle = `rgb(${blue}, ${blue + 100}, ${blue + 167})`;
                    ctx.fill();
                    continue;
                }

                // Sand base — flat diamond
                const sandVariation = ((r * 7 + c * 13) % 5) * 2;
                const sandBase = isBeachEdge ? [220, 185, 100] : [245, 222, 179];
                const sandColor = `rgb(${sandBase[0] - sandVariation}, ${sandBase[1] - sandVariation}, ${sandBase[2] - sandVariation})`;

                drawDiamond(ctx, pos.x, pos.y, tileW, tileH);
                ctx.fillStyle = sandColor;
                ctx.fill();
                ctx.strokeStyle = 'rgba(0,0,0,0.05)';
                ctx.lineWidth = 0.5;
                ctx.stroke();

                // Material — isometric cube!
                if (grid[r][c]) {
                    const mat = MATERIALS[grid[r][c]];
                    let topColor;

                    if (grid[r][c] === 'tao') {
                        const flicker = prefersReducedMotion ? 0 : Math.sin(time * 8 + r * 3.7 + c * 2.3) * 0.15;
                        const base = 128;
                        const v = Math.round(base + flicker * 80);
                        const bw = Math.sin(time * 3 + r + c) > 0 ? v + 20 : v - 20;
                        topColor = `rgb(${bw}, ${bw}, ${bw})`;
                    } else {
                        topColor = mat.color;
                    }

                    const leftColor = adjustColor(topColor, -30);
                    const rightColor = adjustColor(topColor, -55);

                    drawIsoCube(ctx, pos.x, pos.y, tileW, tileH, depth, topColor, leftColor, rightColor);

                    // Border on top face
                    ctx.beginPath();
                    ctx.moveTo(pos.x, pos.y - depth - tileH / 2);
                    ctx.lineTo(pos.x + tileW / 2, pos.y - depth);
                    ctx.lineTo(pos.x, pos.y - depth + tileH / 2);
                    ctx.lineTo(pos.x - tileW / 2, pos.y - depth);
                    ctx.closePath();
                    ctx.strokeStyle = mat.border;
                    ctx.lineWidth = 1.5;
                    ctx.stroke();

                    // Emoji on top face
                    ctx.font = `${cellSize * 0.5}px serif`;
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillStyle = '#000';
                    ctx.fillText(mat.emoji, pos.x, pos.y - depth);
                }
            }
        }
    }

    function drawIsoEntity(ctx, r, c, emoji, label, WATER_BORDER, COLS, cellSize, time, options) {
        const totalCols = COLS + WATER_BORDER * 2;
        const originX = (totalCols * cellSize) / 2;
        const originY = cellSize * 2;
        const depth = cellSize * 0.4;

        const gr = r + WATER_BORDER;
        const gc = c + WATER_BORDER;
        const pos = gridToIso(gr, gc, cellSize, originX, originY);

        const bob = options?.bob ? Math.sin(time * 2 + r + c) * 2 : 0;

        // Background circle
        if (options?.circle) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
            ctx.beginPath();
            ctx.arc(pos.x, pos.y - depth + bob, cellSize * 0.45, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
            ctx.lineWidth = 1;
            ctx.stroke();
        }

        // Shadow
        if (options?.shadow) {
            ctx.globalAlpha = 0.25;
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.ellipse(pos.x, pos.y + cellSize * 0.1, cellSize * 0.25, cellSize * 0.08, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
        }

        // Emoji
        ctx.font = `${cellSize * (options?.fontSize || 0.6)}px serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(emoji, pos.x, pos.y - depth + bob);

        // Label
        if (label) {
            ctx.font = `bold ${Math.max(8, cellSize * 0.25)}px sans-serif`;
            ctx.fillStyle = '#fff';
            ctx.strokeStyle = 'rgba(0,0,0,0.7)';
            ctx.lineWidth = 2;
            ctx.strokeText(label, pos.x, pos.y - depth - cellSize * 0.45);
            ctx.fillText(label, pos.x, pos.y - depth - cellSize * 0.45);
        }
    }

    function drawIsoHover(ctx, r, c, MATERIALS, currentMaterial, currentTool, grid, WATER_BORDER, COLS, cellSize) {
        const tileW = cellSize * 1.8;
        const tileH = cellSize * 0.9;
        const totalCols = COLS + WATER_BORDER * 2;
        const originX = (totalCols * cellSize) / 2;
        const originY = cellSize * 2;
        const depth = cellSize * 0.4;

        const gr = r + WATER_BORDER;
        const gc = c + WATER_BORDER;
        const pos = gridToIso(gr, gc, cellSize, originX, originY);

        if (currentTool === 'build') {
            const mat = MATERIALS[currentMaterial];
            const topColor = mat.color;
            const leftColor = adjustColor(topColor, -30);
            const rightColor = adjustColor(topColor, -55);

            ctx.globalAlpha = 0.45;
            drawIsoCube(ctx, pos.x, pos.y, tileW, tileH, depth, topColor, leftColor, rightColor);
            ctx.globalAlpha = 1;

            ctx.font = `${cellSize * 0.5}px serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.globalAlpha = 0.5;
            ctx.fillText(mat.emoji, pos.x, pos.y - depth);
            ctx.globalAlpha = 1;
        } else if (currentTool === 'harvest') {
            if (grid[r]?.[c] !== null) {
                drawDiamond(ctx, pos.x, pos.y, tileW, tileH);
                ctx.strokeStyle = '#F39C12';
                ctx.lineWidth = 3;
                ctx.stroke();
                ctx.font = `${cellSize * 0.4}px serif`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText('\u26CF\uFE0F', pos.x, pos.y - depth);
            }
        } else if (currentTool === 'fill') {
            drawDiamond(ctx, pos.x, pos.y, tileW, tileH);
            ctx.strokeStyle = '#F39C12';
            ctx.lineWidth = 3;
            ctx.setLineDash([4, 4]);
            ctx.stroke();
            ctx.setLineDash([]);
        }
    }

    function getIsoGridCell(px, py, cellSize, ROWS, COLS, WATER_BORDER) {
        const totalCols = COLS + WATER_BORDER * 2;
        const originX = (totalCols * cellSize) / 2;
        const originY = cellSize * 2;

        const cell = isoToGrid(px, py, cellSize, originX, originY);
        const r = cell.r - WATER_BORDER;
        const c = cell.c - WATER_BORDER;

        if (r >= 0 && r < ROWS && c >= 0 && c < COLS) {
            return { r, c };
        }
        return null;
    }

    function getIsoCanvasSize(cellSize, totalCols, totalRows) {
        // Isometric canvas needs more width and different height
        const tileW = cellSize * 1.8;
        const tileH = cellSize * 0.9;
        const width = (totalCols + totalRows) * tileW / 2 + tileW;
        const height = (totalCols + totalRows) * tileH / 2 + cellSize * 4;
        return { width: Math.ceil(width), height: Math.ceil(height) };
    }

    // --- Expose API ---
    window.ISO_RENDERER = {
        gridToIso,
        isoToGrid,
        drawDiamond,
        drawIsoCube,
        drawIsoWater,
        drawIsoIsland,
        drawIsoEntity,
        drawIsoHover,
        getIsoGridCell,
        getIsoCanvasSize,
        adjustColor
    };

})();
