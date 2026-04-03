// hex-renderer.js — Flat-Top Hex-Rendering auf Canvas 2D
// Polytopia-Aesthetik: Terrain-Farben, isometrische Hoehe, Emojis
(function () {
    'use strict';

    var ISO_FACTOR = 0.5; // Y-Stauchung fuer isometrischen Look
    var HEIGHT_PX = 4;    // Pixel pro Hoehenstufe

    function drawHexGrid(ctx, grid, size, offsetX, offsetY, materials) {
        grid.forEach(function (cell, q, r) {
            if (!cell.surface) return;
            var pos = grid.hexToPixel(q, r, size);
            var x = pos.x + offsetX;
            var y = pos.y * ISO_FACTOR + offsetY;
            var heightOffset = cell.height * HEIGHT_PX;

            drawHex(ctx, x, y - heightOffset, size, cell, materials);

            // Seitenflaeche (Hoehe sichtbar machen)
            if (cell.height > 0) {
                drawHexSide(ctx, x, y - heightOffset, size, cell.height * HEIGHT_PX, cell, materials);
            }
        });
    }

    function drawHex(ctx, x, y, size, cell, materials) {
        var mat = materials[cell.surface];
        if (!mat) return;

        ctx.beginPath();
        for (var i = 0; i < 6; i++) {
            var angle = Math.PI / 180 * (60 * i);
            var hx = x + size * Math.cos(angle);
            var hy = y + size * Math.sin(angle) * ISO_FACTOR;
            if (i === 0) ctx.moveTo(hx, hy);
            else ctx.lineTo(hx, hy);
        }
        ctx.closePath();
        ctx.fillStyle = mat.color || '#333';
        ctx.fill();
        ctx.strokeStyle = mat.border || '#222';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Emoji zentriert
        if (mat.emoji) {
            ctx.font = Math.round(size * 0.7) + 'px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(mat.emoji, x, y);
        }
    }

    function drawHexSide(ctx, x, y, size, h, cell, materials) {
        var mat = materials[cell.surface];
        if (!mat) return;

        // Untere 3 Ecken des Hex -> Seitenflaeche
        var points = [];
        for (var i = 1; i <= 3; i++) {
            var angle = Math.PI / 180 * (60 * i);
            points.push({
                x: x + size * Math.cos(angle),
                y: y + size * Math.sin(angle) * ISO_FACTOR
            });
        }

        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        ctx.lineTo(points[1].x, points[1].y);
        ctx.lineTo(points[2].x, points[2].y);
        ctx.lineTo(points[2].x, points[2].y + h);
        ctx.lineTo(points[1].x, points[1].y + h);
        ctx.lineTo(points[0].x, points[0].y + h);
        ctx.closePath();

        // Dunklere Version der Farbe
        ctx.fillStyle = mat.border || '#222';
        ctx.globalAlpha = 0.6;
        ctx.fill();
        ctx.globalAlpha = 1;
    }

    // Trixel-Overlay fuer Nerd-View
    function drawTrixelOverlay(ctx, x, y, size, cell) {
        if (!cell.trixels) return;
        for (var i = 0; i < 6; i++) {
            var a1 = Math.PI / 180 * (60 * i);
            var a2 = Math.PI / 180 * (60 * (i + 1));
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + size * Math.cos(a1), y + size * Math.sin(a1) * ISO_FACTOR);
            ctx.lineTo(x + size * Math.cos(a2), y + size * Math.sin(a2) * ISO_FACTOR);
            ctx.closePath();
            ctx.strokeStyle = '#FF6B00';
            ctx.lineWidth = 0.5;
            ctx.stroke();
            // Depth-Label
            ctx.fillStyle = '#FF6B00';
            ctx.font = '7px monospace';
            ctx.textAlign = 'center';
            var mx = x + size * 0.5 * (Math.cos(a1) + Math.cos(a2));
            var my = y + size * 0.5 * (Math.sin(a1) + Math.sin(a2)) * ISO_FACTOR;
            ctx.fillText('d:' + cell.trixels[i].depth, mx, my);
        }
    }

    // Hit-Test: welches Hex wurde geklickt?
    function hitTest(mouseX, mouseY, grid, size, offsetX, offsetY) {
        var adjX = mouseX - offsetX;
        var adjY = (mouseY - offsetY) / ISO_FACTOR;
        return grid.pixelToHex(adjX, adjY, size);
    }

    window.INSEL_HEX_RENDERER = {
        drawHexGrid: drawHexGrid,
        drawHex: drawHex,
        drawTrixelOverlay: drawTrixelOverlay,
        hitTest: hitTest,
        ISO_FACTOR: ISO_FACTOR,
        HEIGHT_PX: HEIGHT_PX
    };
})();
