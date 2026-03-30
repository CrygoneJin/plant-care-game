// === FAUNA — Tiere leben auf der Insel ===
// Krabben krabbeln am Strand. Vögel fliegen. Schmetterlinge flattern.
// Spieler kann Tiere streicheln (Herz + Drop) und bei hoher Zuneigung fangen.
// Gefangene Tiere → Tiersammlung (Pokédex-Stil).

(function () {
    'use strict';

    let animals = [];
    let npcsOnMap = [];
    let animationFrame = 0;

    // Tier-Reaktionen (Herzen, Sterne etc.)
    let reactions = [];

    // Tiersammlung (gefangene Tiere) — persistiert in localStorage
    let collection = JSON.parse(localStorage.getItem('insel-tiersammlung') || '[]');

    // Zuneigung pro Tier (Index → Wert, 0-5)
    let affection = {};

    // Bewegungsmuster pro Tierart
    const BEHAVIOR = {
        crab:      { speed: 3000, range: 3, emoji: '🦀', staysNear: 'beach',   catchAt: 3, drop: 'shell',    dropEmoji: '🐚', dropLabel: 'Muschel' },
        bird:      { speed: 2000, range: 5, emoji: '🐦', staysNear: 'trees',   catchAt: 4, drop: 'feather',  dropEmoji: '🪶', dropLabel: 'Feder' },
        turtle:    { speed: 8000, range: 2, emoji: '🐢', staysNear: 'beach',   catchAt: 3, drop: 'shell',    dropEmoji: '🐚', dropLabel: 'Muschel' },
        butterfly: { speed: 1500, range: 4, emoji: '🦋', staysNear: 'flowers', catchAt: 5, drop: 'flower',   dropEmoji: '🌸', dropLabel: 'Blütenstaub' },
        fish:      { speed: 2500, range: 3, emoji: '🐟', staysNear: 'water',   catchAt: 3, drop: 'fish',     dropEmoji: '🐟', dropLabel: 'Fisch' },
        frog:      { speed: 3000, range: 3, emoji: '🐸', staysNear: 'water',   catchAt: 3, drop: 'mushroom', dropEmoji: '🍄', dropLabel: 'Pilz' },
        rabbit:    { speed: 1800, range: 4, emoji: '🐇', staysNear: 'flowers', catchAt: 4, drop: 'flower',   dropEmoji: '🌼', dropLabel: 'Blume' },
        parrot:    { speed: 2200, range: 5, emoji: '🦜', staysNear: 'trees',   catchAt: 5, drop: 'feather',  dropEmoji: '🪶', dropLabel: 'Feder' },
    };

    // Tier-Persönlichkeiten (Streichel-Reaktionen)
    const PET_REACTIONS = {
        crab:      ['🦀 *kneift freundlich*', '🦀 Klack-klack!', '🦀 *winkt mit der Schere*'],
        bird:      ['🐦 *zwitschert fröhlich*', '🐦 Piep!', '🐦 *plustert sich auf*'],
        turtle:    ['🐢 *zieht Kopf rein... und wieder raus*', '🐢 ...langsam...', '🐢 *lächelt weise*'],
        butterfly: ['🦋 *flattert aufgeregt*', '🦋 *landet auf deiner Nase*', '🦋 *glitzert im Licht*'],
        fish:      ['🐟 *blubbert freudig*', '🐟 Blubb!', '🐟 *macht Kreise*'],
        frog:      ['🐸 Quak!', '🐸 *hüpft auf der Stelle*', '🐸 *blinzelt zufrieden*'],
        rabbit:    ['🐇 *mümmelt zufrieden*', '🐇 *stupst deine Hand*', '🐇 *wackelt mit der Nase*'],
        parrot:    ['🦜 HALLO! HALLO!', '🦜 *krächzt begeistert*', '🦜 Polly will einen Keks!'],
    };

    // Zuneigungsstufen
    const AFFECTION_LABELS = ['❔ Scheu', '💛 Neugierig', '🧡 Zutraulich', '❤️ Freundlich', '💕 Vertraut', '💖 Seelenverwandt'];

    function init(animalList, npcs) {
        animals = (animalList || []).map((a, i) => ({
            ...a,
            _id: i,
            homeR: a.r,
            homeC: a.c,
            lastMove: Date.now() + Math.random() * 2000,
            lastPet: 0,
            fleeing: false,
            fleeUntil: 0,
        }));
        npcsOnMap = (npcs || []).map(n => ({ ...n, _chatOpened: false }));

        // Zuneigung aus localStorage laden
        const stored = JSON.parse(localStorage.getItem('insel-tier-zuneigung') || '{}');
        affection = {};
        for (const a of animals) {
            affection[a._id] = stored[a._id] || 0;
        }
    }

    function saveAffection() {
        localStorage.setItem('insel-tier-zuneigung', JSON.stringify(affection));
    }

    function saveCollection() {
        localStorage.setItem('insel-tiersammlung', JSON.stringify(collection));
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

            // Fliehen: schnellere Bewegung weg vom Spieler
            if (animal.fleeing && now < animal.fleeUntil) {
                if (now - animal.lastMove < b.speed / 3) continue;
                animal.lastMove = now;
                const playerP = window.playerPos?.();
                if (playerP) {
                    const dr = animal.r > playerP.r ? 1 : -1;
                    const dc = animal.c > playerP.c ? 1 : -1;
                    const nr = animal.r + dr;
                    const nc = animal.c + dc;
                    if (nr >= 2 && nr < rows - 2 && nc >= 2 && nc < cols - 2 &&
                        Math.abs(nr - animal.homeR) <= b.range + 2) {
                        animal.r = nr;
                        animal.c = nc;
                    }
                }
                continue;
            }
            animal.fleeing = false;

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

        // Reaktionen aufräumen
        reactions = reactions.filter(r => now - r.start < r.duration);

        if (window.requestRedraw) window.requestRedraw();
    }

    // Spieler interagiert mit Tier (nah genug, 1 Feld)
    function tryInteract(playerR, playerC) {
        const now = Date.now();
        let interacted = false;

        for (const animal of animals) {
            const dist = Math.abs(playerR - animal.r) + Math.abs(playerC - animal.c);
            if (dist > 1) continue;
            if (now - animal.lastPet < 3000) continue; // Cooldown 3s

            animal.lastPet = now;
            interacted = true;

            const b = BEHAVIOR[animal.type] || BEHAVIOR.crab;
            const aff = affection[animal._id] || 0;

            // Scheue Tiere fliehen manchmal (je niedriger Zuneigung, desto öfter)
            if (aff < 2 && Math.random() < 0.4 - aff * 0.15) {
                animal.fleeing = true;
                animal.fleeUntil = now + 2000;
                addReaction(animal.r, animal.c, '💨', 800);
                if (window.showToast) window.showToast(`${b.emoji} *flieht verschreckt*`);
                continue;
            }

            // Zuneigung steigern
            if (aff < 5) {
                affection[animal._id] = aff + 1;
                saveAffection();
            }

            const newAff = affection[animal._id];

            // Herz-Reaktion
            addReaction(animal.r, animal.c, '❤️', 1200);

            // Streichel-Spruch
            const reactions_ = PET_REACTIONS[animal.type] || PET_REACTIONS.crab;
            const msg = reactions_[Math.floor(Math.random() * reactions_.length)];
            if (window.showToast) {
                const affLabel = AFFECTION_LABELS[newAff] || AFFECTION_LABELS[0];
                window.showToast(`${msg}  ${affLabel}`);
            }

            // Item-Drop bei Zuneigung >= 2
            if (newAff >= 2 && Math.random() < 0.5) {
                if (window.addToInventory) {
                    window.addToInventory(b.drop, 1);
                    addReaction(animal.r, animal.c, b.dropEmoji, 1500);
                    if (window.showToast) {
                        window.showToast(`${b.dropEmoji} ${b.dropLabel} bekommen!`, 2000);
                    }
                }
            }

            // Fangen möglich bei hoher Zuneigung
            if (newAff >= b.catchAt) {
                // Noch nicht in Sammlung?
                const alreadyCaught = collection.some(c =>
                    c.type === animal.type && c.homeR === animal.homeR && c.homeC === animal.homeC
                );
                if (!alreadyCaught) {
                    collection.push({
                        type: animal.type,
                        emoji: b.emoji,
                        label: b.dropLabel,
                        homeR: animal.homeR,
                        homeC: animal.homeC,
                        caughtAt: Date.now(),
                    });
                    saveCollection();
                    addReaction(animal.r, animal.c, '⭐', 2000);
                    if (window.showToast) {
                        window.showToast(`⭐ ${b.emoji} gefangen! Neues Tier in der Sammlung! (${collection.length} gesamt)`, 4000);
                    }
                    if (window.soundAchievement) window.soundAchievement();
                }
            }

            break; // Nur 1 Tier pro Interaktion
        }

        return interacted;
    }

    // Visuelle Reaktion über einem Tier (Herz, Stern etc.)
    function addReaction(r, c, emoji, duration) {
        reactions.push({ r, c, emoji, start: Date.now(), duration: duration || 1000 });
    }

    // Tiere + NPC + Reaktionen auf Canvas zeichnen
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

            // Scheue Tiere sind halbtransparent wenn fliehend
            if (animal.fleeing) {
                ctx.globalAlpha = 0.5;
            }

            // Schmetterlinge und Vögel "flattern" (leichtes Wippen)
            if (animal.type === 'butterfly' || animal.type === 'bird' || animal.type === 'parrot') {
                const wobble = Math.sin(Date.now() / 200 + animal.homeR) * 3;
                ctx.fillText(b.emoji, px, py + wobble);
            } else if (animal.type === 'rabbit') {
                // Hasen hüpfen
                const hop = Math.abs(Math.sin(Date.now() / 400 + animal.homeC)) * 4;
                ctx.fillText(b.emoji, px, py - hop);
            } else if (animal.type === 'frog') {
                // Frösche hüpfen langsamer
                const hop = Math.abs(Math.sin(Date.now() / 600 + animal.homeR)) * 3;
                ctx.fillText(b.emoji, px, py - hop);
            } else {
                ctx.fillText(b.emoji, px, py);
            }

            // Zuneigungsinidikator (kleines Herz bei hoher Zuneigung)
            const aff = affection[animal._id] || 0;
            if (aff >= 3) {
                ctx.font = `${cellSize * 0.2}px serif`;
                ctx.fillText('❤️', px + cellSize * 0.3, py - cellSize * 0.3);
            }

            ctx.restore();
        }

        // Reaktionen zeichnen (aufsteigende Emojis)
        const now = Date.now();
        for (const reaction of reactions) {
            const elapsed = now - reaction.start;
            const progress = elapsed / reaction.duration;
            const px = (reaction.c + waterBorder) * cellSize + cellSize / 2;
            const py = (reaction.r + waterBorder) * cellSize + cellSize / 2;

            ctx.save();
            ctx.font = `${cellSize * 0.4}px serif`;
            ctx.textAlign = 'center';
            ctx.globalAlpha = 1 - progress;
            ctx.fillText(reaction.emoji, px, py - progress * cellSize * 1.5);
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
                    const label = npc.id === 'lukas' ? `🔨 ${npc.emoji}` : `💬 ${npc.emoji}`;
                    ctx.fillRect(px - 24, py - cellSize * 0.85, 48, fontSize + 6);
                    ctx.fillStyle = 'white';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(label, px, py - cellSize * 0.65);

                    // Bei Berührung (1 Feld): Interaktion mit NPC
                    if (dist <= 1 && !npc._chatOpened) {
                        npc._chatOpened = true;
                        if (npc.id === 'lukas' && window.startHauDenLukas) {
                            // Lukas: Hau den Lukas statt Chat!
                            window.startHauDenLukas();
                        } else if (window.openChat) {
                            window.openChat(npc.id);
                        }
                        setTimeout(() => { npc._chatOpened = false; }, 5000);
                    }
                }
            }
            ctx.restore();
        }

        // Tier-Hinweis wenn Spieler nah an einem Tier
        if (playerP) {
            for (const animal of animals) {
                const dist = Math.abs(playerP.r - animal.r) + Math.abs(playerP.c - animal.c);
                if (dist <= 2 && dist > 0) {
                    const b = BEHAVIOR[animal.type] || BEHAVIOR.crab;
                    const aff = affection[animal._id] || 0;
                    const px = (animal.c + waterBorder) * cellSize + cellSize / 2;
                    const py = (animal.r + waterBorder) * cellSize + cellSize / 2;

                    // Kleiner Hinweis über dem Tier
                    ctx.save();
                    const fontSize = Math.max(7, cellSize * 0.18);
                    ctx.font = `${fontSize}px sans-serif`;
                    ctx.textAlign = 'center';
                    ctx.fillStyle = 'rgba(0,0,0,0.5)';
                    const hint = aff >= (b.catchAt || 3) ? '⭐ Fangen?' : '🤚 Streicheln';
                    ctx.fillRect(px - 22, py - cellSize * 0.75, 44, fontSize + 4);
                    ctx.fillStyle = 'white';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(hint, px, py - cellSize * 0.58);
                    ctx.restore();
                }
            }
        }
    }

    // Alle 500ms Tiere updaten
    setInterval(update, 500);

    // --- Public API ---
    window.Fauna = {
        init: init,
        draw: draw,
        tryInteract: tryInteract,
        get animals() { return animals; },
        get npcs() { return npcsOnMap; },
        get collection() { return collection; },
        getAffection: function (animalId) { return affection[animalId] || 0; },
        addAnimal: function (type, r, c) {
            const b = BEHAVIOR[type];
            if (!b) return;
            const id = animals.length;
            animals.push({ type, emoji: b.emoji, r, c, homeR: r, homeC: c, lastMove: Date.now(), lastPet: 0, fleeing: false, fleeUntil: 0, _id: id });
            affection[id] = 0;
        },
        getCollectionCount: function () { return collection.length; },
        getTotalSpecies: function () { return Object.keys(BEHAVIOR).length; },
    };

})();
