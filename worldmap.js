// @ts-nocheck
// === WELTKARTE — Jim Knopfs Insel-Navigation (#54) ===

(function () {
    'use strict';

    // --- Insel-Definitionen ---
    const ISLANDS = [
        { id: 'lummerland',    name: 'Lummerland',        emoji: '🏝️', x: 0.15, y: 0.55, unlocked: true,  desc: 'Deine Heimatinsel' },
        { id: 'mandala',       name: 'Mandala',           emoji: '🏯', x: 0.40, y: 0.30, unlocked: false, desc: 'Stadt der Drachen' },
        { id: 'wueste',        name: 'Wüste des Endes',   emoji: '🏜️', x: 0.65, y: 0.65, unlocked: false, desc: 'Endlose Sanddünen' },
        { id: 'drachenstadt',  name: 'Drachenstadt',      emoji: '🐉', x: 0.80, y: 0.25, unlocked: false, desc: 'Hier wohnt Nepomuk' },
        { id: 'schatzinsel',   name: 'Schatzinsel',       emoji: '💎', x: 0.90, y: 0.75, unlocked: false, desc: 'Das Ziel aller Reisen' },
    ];

    // Seewege zwischen Inseln (Index-Paare)
    const SEA_ROUTES = [
        [0, 1], // Lummerland → Mandala
        [1, 2], // Mandala → Wüste
        [1, 3], // Mandala → Drachenstadt
        [2, 4], // Wüste → Schatzinsel
        [3, 4], // Drachenstadt → Schatzinsel
    ];

    let overlay = null;
    let canvas = null;
    let ctx = null;
    let visible = false;
    let hoverIsland = null;
    let sunAngle = 0;

    // --- Prüfe ob Spieler ein Boot hat ---
    function playerHasBoat() {
        // Boot ist im Grid platziert oder im Inventar
        if (window.grid) {
            for (const row of window.grid) {
                if (row && row.some(cell => cell === 'boat')) return true;
            }
        }
        // Inventar-Check über questSystem (inventory access)
        try {
            const inv = JSON.parse(localStorage.getItem('insel-inventar') || '{}');
            if ((inv['boat'] || 0) > 0) return true;
        } catch { /* ignore */ }
        return false;
    }

    // --- Overlay erstellen ---
    function createOverlay() {
        if (overlay) return;

        overlay = document.createElement('div');
        overlay.id = 'worldmap-overlay';
        overlay.style.cssText = `
            position: fixed; inset: 0; z-index: 8500;
            background: rgba(10, 25, 50, 0.95);
            display: flex; align-items: center; justify-content: center;
            flex-direction: column; gap: 16px;
            opacity: 0; transition: opacity 0.3s ease;
        `;

        // Titel
        const title = document.createElement('h2');
        title.textContent = '🗺️ Jim Knopfs Welt';
        title.style.cssText = `
            color: #f0d080; font-family: 'Fredoka', sans-serif;
            font-size: 28px; margin: 0; text-shadow: 0 2px 8px rgba(0,0,0,0.5);
        `;

        // Canvas
        canvas = document.createElement('canvas');
        canvas.width = 800;
        canvas.height = 500;
        canvas.style.cssText = `
            border-radius: 16px; cursor: pointer;
            max-width: 90vw; max-height: 65vh;
            box-shadow: 0 4px 32px rgba(0,0,0,0.5);
        `;
        ctx = canvas.getContext('2d');

        // Close-Button
        const closeBtn = document.createElement('button');
        closeBtn.textContent = '❌ Schließen';
        closeBtn.style.cssText = `
            background: rgba(255,255,255,0.15); color: white;
            border: 1px solid rgba(255,255,255,0.3); border-radius: 12px;
            padding: 8px 24px; font-size: 16px; cursor: pointer;
            font-family: 'Fredoka', sans-serif;
        `;
        closeBtn.addEventListener('click', hideWorldmap);

        overlay.appendChild(title);
        overlay.appendChild(canvas);
        overlay.appendChild(closeBtn);
        document.body.appendChild(overlay);

        // Events
        canvas.addEventListener('mousemove', onMouseMove);
        canvas.addEventListener('click', onCanvasClick);
        canvas.addEventListener('touchend', onTouchEnd);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) hideWorldmap();
        });
    }

    // --- Zeichnen ---
    function draw() {
        if (!ctx) return;
        const W = canvas.width;
        const H = canvas.height;

        // Hintergrund: Ozean-Gradient
        const grad = ctx.createLinearGradient(0, 0, 0, H);
        grad.addColorStop(0, '#1a3a5c');
        grad.addColorStop(0.5, '#1e5080');
        grad.addColorStop(1, '#0d2a4a');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, W, H);

        // Wellenlinien
        ctx.strokeStyle = 'rgba(100, 180, 255, 0.15)';
        ctx.lineWidth = 1.5;
        for (let y = 30; y < H; y += 40) {
            ctx.beginPath();
            for (let x = 0; x < W; x += 5) {
                const wave = Math.sin((x + sunAngle * 20) * 0.02) * 6 + Math.sin((x + sunAngle * 10) * 0.05) * 3;
                if (x === 0) ctx.moveTo(x, y + wave);
                else ctx.lineTo(x, y + wave);
            }
            ctx.stroke();
        }

        // Seewege zeichnen (gestrichelte Linien)
        ctx.setLineDash([8, 6]);
        ctx.strokeStyle = 'rgba(240, 208, 128, 0.4)';
        ctx.lineWidth = 2;
        for (const [a, b] of SEA_ROUTES) {
            const ia = ISLANDS[a];
            const ib = ISLANDS[b];
            ctx.beginPath();
            ctx.moveTo(ia.x * W, ia.y * H);
            ctx.lineTo(ib.x * W, ib.y * H);
            ctx.stroke();
        }
        ctx.setLineDash([]);

        // Abendsonne-Lichtstreifen Richtung Mandala (nächste Insel)
        const lummerland = ISLANDS[0];
        const mandala = ISLANDS[1];
        const sunGrad = ctx.createLinearGradient(
            lummerland.x * W, lummerland.y * H,
            mandala.x * W, mandala.y * H
        );
        sunGrad.addColorStop(0, 'rgba(255, 180, 50, 0.08)');
        sunGrad.addColorStop(0.5, 'rgba(255, 200, 80, 0.12)');
        sunGrad.addColorStop(1, 'rgba(255, 180, 50, 0)');
        ctx.fillStyle = sunGrad;

        // Breiter Lichtstreifen als Polygon
        const dx = mandala.x * W - lummerland.x * W;
        const dy = mandala.y * H - lummerland.y * H;
        const len = Math.sqrt(dx * dx + dy * dy);
        const nx = -dy / len * 30;
        const ny = dx / len * 30;
        ctx.beginPath();
        ctx.moveTo(lummerland.x * W + nx, lummerland.y * H + ny);
        ctx.lineTo(mandala.x * W + nx * 0.5, mandala.y * H + ny * 0.5);
        ctx.lineTo(mandala.x * W - nx * 0.5, mandala.y * H - ny * 0.5);
        ctx.lineTo(lummerland.x * W - nx, lummerland.y * H - ny);
        ctx.closePath();
        ctx.fill();

        // Inseln zeichnen
        for (let i = 0; i < ISLANDS.length; i++) {
            const island = ISLANDS[i];
            const ix = island.x * W;
            const iy = island.y * H;
            const isHover = hoverIsland === i;
            const radius = isHover ? 42 : 36;

            // Insel-Kreis (Hintergrund)
            ctx.beginPath();
            ctx.arc(ix, iy, radius, 0, Math.PI * 2);
            if (island.unlocked) {
                ctx.fillStyle = isHover ? 'rgba(80, 160, 80, 0.6)' : 'rgba(60, 130, 60, 0.5)';
            } else {
                ctx.fillStyle = isHover ? 'rgba(100, 100, 100, 0.5)' : 'rgba(70, 70, 70, 0.4)';
            }
            ctx.fill();
            ctx.strokeStyle = island.unlocked ? 'rgba(150, 220, 150, 0.7)' : 'rgba(120, 120, 120, 0.5)';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Lummerland: pulsierender Ring
            if (island.id === 'lummerland') {
                const pulse = Math.sin(sunAngle * 2) * 0.3 + 0.5;
                ctx.beginPath();
                ctx.arc(ix, iy, radius + 6, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(255, 220, 100, ${pulse})`;
                ctx.lineWidth = 2;
                ctx.stroke();
            }

            // Emoji
            ctx.font = `${isHover ? 32 : 28}px serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(island.emoji, ix, iy - 2);

            // Name
            ctx.font = `${isHover ? 15 : 13}px 'Fredoka', sans-serif`;
            ctx.fillStyle = island.unlocked ? '#f0e0b0' : '#999';
            ctx.textAlign = 'center';
            ctx.fillText(island.name, ix, iy + radius + 16);

            // Schloss-Icon für gesperrte Inseln
            if (!island.unlocked) {
                ctx.font = '14px serif';
                ctx.fillText('🔒', ix + radius - 8, iy - radius + 8);
            }
        }

        // Hover-Tooltip
        if (hoverIsland !== null) {
            const island = ISLANDS[hoverIsland];
            const ix = island.x * W;
            const iy = island.y * H;
            const tooltipY = iy - 60;

            ctx.font = '13px "Fredoka", sans-serif';
            const text = island.unlocked ? island.desc : '🔒 ' + island.desc;
            const tw = ctx.measureText(text).width + 20;

            ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            roundRect(ctx, ix - tw / 2, tooltipY - 14, tw, 28, 8);
            ctx.fill();

            ctx.fillStyle = '#f0e0b0';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(text, ix, tooltipY);
        }

        // Kompass in der Ecke
        drawCompass(W - 60, 60, 30);
    }

    function roundRect(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
    }

    function drawCompass(cx, cy, size) {
        // Kompassrose
        ctx.save();
        ctx.translate(cx, cy);

        // Kreis
        ctx.beginPath();
        ctx.arc(0, 0, size, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
        ctx.fill();
        ctx.strokeStyle = 'rgba(240, 208, 128, 0.6)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // N-Nadel
        ctx.beginPath();
        ctx.moveTo(0, -size + 6);
        ctx.lineTo(-5, 0);
        ctx.lineTo(5, 0);
        ctx.closePath();
        ctx.fillStyle = '#e04040';
        ctx.fill();

        // S-Nadel
        ctx.beginPath();
        ctx.moveTo(0, size - 6);
        ctx.lineTo(-5, 0);
        ctx.lineTo(5, 0);
        ctx.closePath();
        ctx.fillStyle = '#d0d0d0';
        ctx.fill();

        // N label
        ctx.font = '11px "Fredoka", sans-serif';
        ctx.fillStyle = '#f0d080';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('N', 0, -size - 10);

        ctx.restore();
    }

    // --- Hitdetection ---
    function getIslandAt(mx, my) {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const x = (mx - rect.left) * scaleX;
        const y = (my - rect.top) * scaleY;

        for (let i = 0; i < ISLANDS.length; i++) {
            const island = ISLANDS[i];
            const ix = island.x * canvas.width;
            const iy = island.y * canvas.height;
            const dist = Math.sqrt((x - ix) ** 2 + (y - iy) ** 2);
            if (dist < 42) return i;
        }
        return null;
    }

    function onMouseMove(e) {
        const prev = hoverIsland;
        hoverIsland = getIslandAt(e.clientX, e.clientY);
        if (hoverIsland !== prev) draw();
    }

    function onCanvasClick(e) {
        const idx = getIslandAt(e.clientX, e.clientY);
        handleIslandSelect(idx);
    }

    function onTouchEnd(e) {
        if (e.changedTouches && e.changedTouches.length > 0) {
            const t = e.changedTouches[0];
            const idx = getIslandAt(t.clientX, t.clientY);
            handleIslandSelect(idx);
        }
    }

    function handleIslandSelect(idx) {
        if (idx === null) return;
        const island = ISLANDS[idx];

        if (island.id === 'lummerland') {
            // Aktuelle Insel — schließe Karte
            if (window.showToast) window.showToast('🏝️ Du bist schon auf Lummerland!', 2000);
            hideWorldmap();
            return;
        }

        if (!playerHasBoat()) {
            if (window.showToast) {
                window.showToast('⛵ Du brauchst ein Boot! Crafte eins an der Werkbank.', 3000);
            }
            return;
        }

        // Boot vorhanden, aber Insel noch gesperrt
        if (!island.unlocked) {
            if (window.showToast) {
                window.showToast(`🔒 ${island.name} ist noch nicht erreichbar. Bald!`, 3000);
            }
            return;
        }
    }

    // --- Animation Loop ---
    let animFrame = null;
    function animate() {
        if (!visible) return;
        sunAngle += 0.02;
        draw();
        animFrame = requestAnimationFrame(animate);
    }

    // --- Show / Hide ---
    function showWorldmap() {
        createOverlay();
        visible = true;
        overlay.style.display = 'flex';
        // Trigger reflow for transition
        overlay.offsetHeight; // eslint-disable-line no-unused-expressions
        overlay.style.opacity = '1';
        hoverIsland = null;
        sunAngle = 0;
        animate();
    }

    function hideWorldmap() {
        if (!overlay) return;
        visible = false;
        overlay.style.opacity = '0';
        if (animFrame) cancelAnimationFrame(animFrame);
        setTimeout(() => {
            if (overlay) overlay.style.display = 'none';
        }, 300);
    }

    // --- Keyboard ---
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && visible) {
            hideWorldmap();
        }
        // M key toggles worldmap
        if (e.key === 'm' || e.key === 'M') {
            if (!visible && !e.ctrlKey && !e.metaKey) {
                const activeEl = document.activeElement;
                if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) return;
                showWorldmap();
            }
        }
    });

    // --- Toolbar Button ---
    // We add a new button next to existing toolbar, or repurpose karte-btn
    function initButton() {
        // Option 1: neuen Weltkarte-Button in die Toolbar
        const viewGroup = document.getElementById('view-group');
        if (viewGroup) {
            const btn = document.createElement('button');
            btn.className = 'tool-btn';
            btn.id = 'worldmap-btn';
            btn.title = 'Weltkarte (M)';
            btn.textContent = '🌍';
            btn.addEventListener('click', showWorldmap);
            viewGroup.appendChild(btn);
        }
    }

    // Init wenn DOM bereit
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initButton);
    } else {
        initButton();
    }

    // Public API
    window.INSEL_WORLDMAP = {
        show: showWorldmap,
        hide: hideWorldmap,
        islands: ISLANDS,
    };

})();
