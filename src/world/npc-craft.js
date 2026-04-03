// npc-craft.js — Wu-Xing NPC-Reaktionen auf Crafting-Events
// Backlog #95: NPCs lauschen auf craft:success und reagieren kontextbezogen.
//
// Wu-Xing-Elemente die ein Rezept bestimmen:
//   fire  → SpongeBob / Tommy (Feuer-Kommentar)
//   water → ELIZA (therapeutisch)
//   wood  → Haskell (Funktions-Witz)
//   metal → Krabs (Handelswert)
//   earth → Zufälls-NPC (Erde bleibt Erde)
//
// Abhängigkeiten: bus.js (window.INSEL_BUS), muss nach game.js geladen werden.

(function () {
    'use strict';

    // Wu-Xing-Elemente und welcher NPC reagiert
    const WU_XING_NPCS = {
        fire:  'fire',
        water: 'water',
        wood:  'wood',
        metal: 'metal',
        earth: 'earth',
    };

    // NPC-Profile für Crafting-Reaktionen
    const CRAFT_NPCS = {
        fire: {
            emoji: '🧽',
            name: 'SpongeBob / Tommy',
            lines: [
                '🧽 SpongeBob: FEUER! Das ist das HEISSESTE was ich je gesehen habe!',
                '🦞 Tommy: FEUER! Noch heißer! KAMERA AUF DAS FEUER!',
                '🧽 SpongeBob: OH! Feuer! ICH BIN BEREIT zum Grillen!',
                '🦞 Tommy: PENG! Flammen! Das kommt in den Film!',
                '🧽 SpongeBob: Das BESTE Feuer ALLER ZEITEN! Hihihi!',
            ],
        },
        water: {
            emoji: '🤖',
            name: 'ELIZA',
            lines: [
                '🤖 ELIZA: Wasser. Wie fühlt sich das für dich an?',
                '🤖 ELIZA: Interessant. Wasser bedeutet Reinigung. Was suchst du?',
                '🤖 ELIZA: Wasser... Erzähl mir mehr darüber, warum du das craftest.',
                '🤖 ELIZA: Du hast Wasser gewählt. Was verbindest du damit?',
                '🤖 ELIZA: Wasser fließt immer. Wohin fließt du gerade?',
            ],
        },
        wood: {
            emoji: '🟣',
            name: 'Haskell',
            lines: [
                '🟣 Haskell: Holz ist rein funktional — unveränderlich, bis es brennt.',
                '🟣 Haskell: craft :: Wood -> Result. Keine Seiteneffekte. Fast.',
                '🟣 Haskell: Bäume sind lazy evaluated. Erst wenn du sie brauchst, wachsen sie.',
                '🟣 Haskell: Holz? Das ist eine Monade. Versteh ich selbst nicht ganz.',
                '🟣 Haskell: map fällen tree = Bretter. Typen lösen alles!',
            ],
        },
        metal: {
            emoji: '🦀',
            name: 'Mr. Krabs',
            lines: [
                '🦀 Krabs: Metall! Das ist 3,5 Muscheln wert auf dem Markt!',
                '🦀 Krabs: Cha-ching! Metall = Kapital. Gut investiert!',
                '🦀 Krabs: Metall behält seinen Wert. Anders als Holz. Kluge Entscheidung!',
                '🦀 Krabs: Ich kauf das! 2 Muscheln! Letztes Angebot... naja, 2,5.',
                '🦀 Krabs: Metall! Damit bau ich eine Schmiede und dann... 💰',
            ],
        },
        earth: {
            emoji: '🌍',
            name: 'Insel',
            lines: [
                '🌍 Insel: Erde. Alles kommt aus ihr. Alles kehrt zurück.',
                '🌍 Insel: Gut. Die Erde wächst.',
                '🌍 Insel: Aus Erde wird Stein. Aus Stein wird Zeit.',
            ],
        },
    };

    // Bestimme das dominante Wu-Xing-Element aus den Zutaten
    function detectElement(ingredients) {
        const elementOrder = ['fire', 'water', 'wood', 'metal', 'earth'];
        // Direkt-Check: Ist das Ergebnis selbst ein Element?
        // (wird vom Aufrufer übergeben als result)
        // Zutaten-Check: Welches Element dominiert?
        const counts = {};
        for (const [mat, count] of Object.entries(ingredients)) {
            if (elementOrder.includes(mat)) {
                counts[mat] = (counts[mat] || 0) + (count || 1);
            }
        }
        // Element mit dem höchsten Anteil gewinnt
        let maxEl = null;
        let maxVal = 0;
        for (const el of elementOrder) {
            if ((counts[el] || 0) > maxVal) {
                maxVal = counts[el] || 0;
                maxEl = el;
            }
        }
        return maxEl;
    }

    // Zufälliges Element aus Array
    function pick(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    // NPC-Toast anzeigen (nach kurzem Delay, damit der Craft-Toast zuerst kommt)
    function showNpcReaction(element) {
        const npc = CRAFT_NPCS[element];
        if (!npc) return;
        const line = pick(npc.lines);
        setTimeout(() => {
            if (typeof window.showToast === 'function') {
                window.showToast(line, 3500);
            }
        }, 1800); // 1.8s Delay — Craft-Toast hat Zeit zu erscheinen
    }

    // Bus-Listener registrieren sobald DOM bereit
    function init() {
        const bus = window.INSEL_BUS;
        if (!bus) {
            // bus.js noch nicht geladen — sollte nicht passieren
            return;
        }

        bus.on('craft:success', function ({ result, ingredients }) {
            // Erst prüfen ob das Ergebnis selbst ein Wu-Xing-Element ist
            const elementOrder = ['fire', 'water', 'wood', 'metal', 'earth'];
            let element = elementOrder.includes(result) ? result : null;

            // Sonst aus den Zutaten bestimmen
            if (!element && ingredients) {
                element = detectElement(ingredients);
            }

            if (element) {
                showNpcReaction(element);
            }
        });
    }

    // Init: nach DOMContentLoaded oder sofort wenn schon geladen
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
