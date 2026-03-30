// === FAUNA — Tiere leben auf der Insel ===
// Krabben krabbeln am Strand. Vögel fliegen. Schmetterlinge flattern.
// Rein visuell, blockieren nichts. Die Insel atmet.

(function () {
    'use strict';

    let animals = [];
    let npcsOnMap = [];
    let animationFrame = 0;

    // Bewegungsmuster pro Tierart
    const BEHAVIOR = {
        crab: { speed: 3000, range: 3, emoji: '🦀', staysNear: 'beach' },
        bird: { speed: 2000, range: 5, emoji: '🐦', staysNear: 'trees' },
        turtle: { speed: 8000, range: 2, emoji: '🐢', staysNear: 'beach' },
        butterfly: { speed: 1500, range: 4, emoji: '🦋', staysNear: 'flowers' },
    };

    function init(animalList, npcs) {
        animals = (animalList || []).map(a => ({
            ...a,
            homeR: a.r,
            homeC: a.c,
            lastMove: Date.now() + Math.random() * 2000,
        }));
        npcsOnMap = (npcs || []).map(n => ({ ...n, _chatOpened: false }));
    }

    // Tiere bewegen sich in der Nähe ihres Startpunkts
    function update() {
        const now = Date.now();
        const grid = window.grid;
        if (!grid) return;
        const rows = grid.length;
        const cols = grid[0]?.length || 0;

        for (const animal of animals) {
            const b = BEHAVIOR[animal.type] || BEHAVIOR.crab;
            if (now - animal.lastMove < b.speed) continue;

            animal.lastMove = now;

            // Zufällige Bewegung innerhalb range von Home
            const dr = Math.floor(Math.random() * 3) - 1;
            const dc = Math.floor(Math.random() * 3) - 1;
            const nr = animal.r + dr;
            const nc = animal.c + dc;

            // Im Range bleiben
            if (Math.abs(nr - animal.homeR) > b.range) continue;
            if (Math.abs(nc - animal.homeC) > b.range) continue;

            // Im Grid bleiben
            if (nr < 2 || nr >= rows - 2 || nc < 2 || nc >= cols - 2) continue;

            animal.r = nr;
            animal.c = nc;
        }

        if (window.requestRedraw) window.requestRedraw();
    }

    // Tiere + NPC auf Canvas zeichnen
    function draw(ctx, cellSize, waterBorder) {
        animationFrame++;

        for (const animal of animals) {
            const b = BEHAVIOR[animal.type] || BEHAVIOR.crab;
            const px = (animal.c + waterBorder) * cellSize + cellSize / 2;
            const py = (animal.r + waterBorder) * cellSize + cellSize / 2;

            ctx.save();
            ctx.font = `${cellSize * 0.5}px serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            // Schmetterlinge und Vögel "flattern" (leichtes Wippen)
            if (animal.type === 'butterfly' || animal.type === 'bird') {
                const wobble = Math.sin(Date.now() / 200 + animal.homeR) * 3;
                ctx.fillText(b.emoji, px, py + wobble);
            } else {
                ctx.fillText(b.emoji, px, py);
            }
            ctx.restore();
        }

        // NPCs auf der Karte zeichnen — nur freigeschaltete! (Pokémon-Style)
        const playerP = window.playerPos?.();
        const unlockedChars = JSON.parse(localStorage.getItem('insel-unlocked') || '["spongebob","maus","bernd"]');

        for (const npc of npcsOnMap) {
            // Nur freigeschaltete NPCs sind sichtbar (Bernd ist nie auf der Karte)
            if (npc.id === 'bernd') continue;
            if (!unlockedChars.includes(npc.id)) continue;
            if (!npc.pos) continue;
            const px = (npc.pos.c + waterBorder) * cellSize + cellSize / 2;
            const py = (npc.pos.r + waterBorder) * cellSize + cellSize / 2;

            ctx.save();
            ctx.font = `${cellSize * 0.7}px serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            // NPCs wippen leicht (lebendig)
            const wobble = Math.sin(Date.now() / 800 + npc.pos.r * 3) * 2;
            ctx.fillText(npc.emoji, px, py + wobble);

            // Sprechblase wenn Spieler nah genug
            if (playerP) {
                const dist = Math.abs(playerP.r - npc.pos.r) + Math.abs(playerP.c - npc.pos.c);
                if (dist <= 3) {
                    const fontSize = Math.max(8, cellSize * 0.22);
                    ctx.font = `${fontSize}px sans-serif`;
                    ctx.fillStyle = 'rgba(0,0,0,0.6)';
                    const label = `💬 ${npc.emoji}`;
                    ctx.fillRect(px - 24, py - cellSize * 0.85, 48, fontSize + 6);
                    ctx.fillStyle = 'white';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(label, px, py - cellSize * 0.65);

                    // Bei Berührung (1 Feld): Chat öffnen mit diesem NPC
                    if (dist <= 1 && !npc._chatOpened) {
                        npc._chatOpened = true;
                        if (window.openChat) window.openChat(npc.id);
                        setTimeout(() => { npc._chatOpened = false; }, 5000);
                    }
                }
            }
            ctx.restore();
        }
    }

    // Alle 500ms Tiere updaten
    setInterval(update, 500);

    // --- Public API ---
    window.Fauna = {
        init: init,
        draw: draw,
        get animals() { return animals; },
        get npcs() { return npcsOnMap; },
        addAnimal: function (type, r, c) {
            const b = BEHAVIOR[type];
            if (!b) return;
            animals.push({ type, emoji: b.emoji, r, c, homeR: r, homeC: c, lastMove: Date.now() });
        },
    };

})();
