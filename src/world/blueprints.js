// === BLUEPRINTS — 4×4 Baupläne (Satz-Grammatik) ===
// Exportiert als window.INSEL_BLUEPRINTS
//
// Linguistik-Analogie:
//   Emoji     = Buchstabe (🟩)
//   2er-Craft = Wort      (🟩+🟥 = 🌋)
//   4×4-Plan  = Satz      (Pattern aus Wörtern = Gebäude)
//   Insel     = Geschichte (alle Sätze zusammen)
//
// Ein Bauplan ist ein 4×4 Grid aus Material-IDs.
// null = leere Zelle (wird ignoriert beim Matching).
// '*' = Wildcard (jedes nicht-leere Material).
//
// Pattern-Matching: Das Grid wird nach dem platzierten Block
// in allen möglichen 4×4-Fenstern geprüft. Wenn ein Pattern
// erkannt wird → alle 16 Zellen werden zum Gebäude-Material.

(function () {
    'use strict';

    // Bauplan-Definitionen
    // pattern: 4×4 Array (row-major), null = leer erlaubt, '*' = beliebig gefüllt
    const BLUEPRINTS = [
        {
            id: 'hut',
            name: 'Hütte',
            emoji: '🛖',
            desc: 'Vier Wände und ein Dach — dein erstes Zuhause!',
            pattern: [
                [null,  'roof',   'roof',   null],
                ['planks', 'window_pane', 'window_pane', 'planks'],
                ['planks', null,    null,    'planks'],
                ['planks', 'door',  null,    'planks'],
            ],
        },
        {
            id: 'tower',
            name: 'Turm',
            emoji: '🗼',
            desc: 'Hoch hinaus! Ein Leuchtturm für die Insel.',
            pattern: [
                [null,  'lamp',   'lamp',   null],
                [null,  'stone',  'stone',  null],
                [null,  'stone',  'stone',  null],
                ['stone', 'door', 'stone',  'stone'],
            ],
        },
        {
            id: 'well',
            name: 'Brunnenhaus',
            emoji: '⛲',
            desc: 'Wasser aus der Tiefe — Wu Xing: Wasser nährt alles.',
            pattern: [
                ['stone', 'stone', 'stone', 'stone'],
                ['stone', 'water', 'water', 'stone'],
                ['stone', 'water', 'water', 'stone'],
                ['stone', 'stone', 'stone', 'stone'],
            ],
        },
        {
            id: 'garden',
            name: 'Garten',
            emoji: '🏡',
            desc: 'Ein Garten voller Leben — Holz nährt, Erde trägt.',
            pattern: [
                ['fence', 'flower', 'flower', 'fence'],
                ['flower', 'plant',  'plant',  'flower'],
                ['flower', 'plant',  'plant',  'flower'],
                ['fence', 'flower', 'flower', 'fence'],
            ],
        },
        {
            id: 'forge',
            name: 'Schmiede',
            emoji: '⚒️',
            desc: 'Feuer trifft Metall — hier entstehen Werkzeuge.',
            pattern: [
                ['stone', 'stone', 'stone', 'stone'],
                ['stone', 'fire',  'fire',  'stone'],
                ['stone', 'metal', 'metal', 'stone'],
                ['stone', 'door',  null,    'stone'],
            ],
        },
        {
            id: 'dock',
            name: 'Hafen',
            emoji: '⚓',
            desc: 'Von hier segeln die Boote los!',
            pattern: [
                ['planks', 'planks', 'planks', 'planks'],
                ['planks', 'water',  'water',  'planks'],
                ['planks', 'water',  'boat',   'planks'],
                ['planks', 'planks', 'planks', 'planks'],
            ],
        },
        {
            id: 'library',
            name: 'Bibliothek',
            emoji: '🏛️',
            desc: 'Wissen ist der wahre Schatz der Insel.',
            pattern: [
                ['roof',   'roof',   'roof',   'roof'],
                ['stone',  'planks', 'planks', 'stone'],
                ['stone',  'planks', 'planks', 'stone'],
                ['stone',  'door',   null,     'stone'],
            ],
        },
        {
            id: 'castle',
            name: 'Burg',
            emoji: '🏰',
            desc: 'Eine Burg! Schnipsel ist jetzt König der Insel!',
            pattern: [
                ['stone', 'flag',  'flag',  'stone'],
                ['stone', 'stone', 'stone', 'stone'],
                ['stone', 'window_pane', 'window_pane', 'stone'],
                ['stone', 'door',  'door',  'stone'],
            ],
        },
        {
            id: 'lighthouse',
            name: 'Leuchtturm',
            emoji: '🔦',
            desc: 'Ein Licht in der Nacht — Schiffe finden den Weg.',
            pattern: [
                [null,  'lamp',   'lamp',   null],
                [null,  'stone',  'stone',  null],
                ['stone', 'stone', 'stone', 'stone'],
                ['stone', 'door',  null,    'stone'],
            ],
        },
        {
            id: 'marketplace',
            name: 'Marktplatz',
            emoji: '🏪',
            desc: 'Hier wird gehandelt — Gold gegen Waren!',
            pattern: [
                ['roof',   'roof',   'roof',   'roof'],
                ['planks', null,     null,     'planks'],
                ['planks', 'metal',  'metal',  'planks'],
                ['planks', 'planks', 'planks', 'planks'],
            ],
        },
        {
            id: 'fountain_plaza',
            name: 'Brunnenplatz',
            emoji: '⛲',
            desc: 'Wasser plätschert — der Mittelpunkt der Insel.',
            pattern: [
                ['stone',  'flower', 'flower', 'stone'],
                ['flower', 'water',  'water',  'flower'],
                ['flower', 'water',  'water',  'flower'],
                ['stone',  'flower', 'flower', 'stone'],
            ],
        },
        {
            id: 'fortress',
            name: 'Festung',
            emoji: '🏯',
            desc: 'Dicke Mauern, starke Tore — hier kommt keiner rein!',
            pattern: [
                ['stone', 'stone',  'stone',  'stone'],
                ['stone', 'metal',  'metal',  'stone'],
                ['stone', 'metal',  'metal',  'stone'],
                ['stone', 'door',   'door',   'stone'],
            ],
        },
        {
            id: 'observatory',
            name: 'Observatorium',
            emoji: '🔭',
            desc: 'Sterne beobachten — das Universum wartet!',
            pattern: [
                [null,    'lamp',   'lamp',   null],
                ['stone', 'glass',  'glass',  'stone'],
                ['stone', 'glass',  'glass',  'stone'],
                ['stone', 'stone',  'door',   'stone'],
            ],
        },
        {
            id: 'bridge',
            name: 'Brücke',
            emoji: '🌉',
            desc: 'Über Wasser und Schluchten — Verbindung schaffen.',
            pattern: [
                [null,    null,     null,     null],
                ['stone', 'planks', 'planks', 'stone'],
                ['stone', 'planks', 'planks', 'stone'],
                ['stone', 'water',  'water',  'stone'],
            ],
        },
        {
            id: 'temple',
            name: 'Tempel',
            emoji: '⛩️',
            desc: 'Ein heiliger Ort — die Insel atmet Ruhe.',
            pattern: [
                ['stone', 'roof',   'roof',   'stone'],
                ['stone', 'lamp',   'lamp',   'stone'],
                ['stone', null,     null,     'stone'],
                ['stone', 'door',   'door',   'stone'],
            ],
        },
        {
            id: 'windmill',
            name: 'Windmühle',
            emoji: '🌬️',
            desc: 'Der Wind dreht die Flügel — Mehl für die Insel!',
            pattern: [
                ['planks', 'roof',   'roof',   'planks'],
                [null,     'stone',  'stone',  null],
                [null,     'stone',  'stone',  null],
                [null,     'door',   null,     null],
            ],
        },
        {
            id: 'tavern',
            name: 'Taverne',
            emoji: '🍺',
            desc: 'Geschichten und Lieder — hier kehren Abenteurer ein.',
            pattern: [
                ['roof',   'roof',   'roof',   'roof'],
                ['planks', 'lamp',   'lamp',   'planks'],
                ['planks', 'planks', 'planks', 'planks'],
                ['planks', 'door',   null,     'planks'],
            ],
        },
        {
            id: 'chapel',
            name: 'Kapelle',
            emoji: '⛪',
            desc: 'Glocken läuten über die Insel — Frieden für alle.',
            pattern: [
                [null,    'roof',   'roof',   null],
                ['stone', 'glass',  'glass',  'stone'],
                ['stone', 'lamp',   'lamp',   'stone'],
                ['stone', 'door',   null,     'stone'],
            ],
        },
    ];

    // Pattern-Matching: Prüft ob ein 4×4 Bereich im Grid einem Bauplan entspricht
    function matchPattern(grid, startR, startC, rows, cols, pattern) {
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                const gr = startR + r;
                const gc = startC + c;
                const expected = pattern[r][c];

                // Außerhalb des Grids = kein Match
                if (gr < 0 || gr >= rows || gc < 0 || gc >= cols) return false;

                if (expected === null) {
                    // null = Zelle muss leer sein
                    if (grid[gr][gc] !== null) return false;
                } else if (expected === '*') {
                    // Wildcard = muss belegt sein, egal womit
                    if (grid[gr][gc] === null) return false;
                } else {
                    // Exaktes Material
                    if (grid[gr][gc] !== expected) return false;
                }
            }
        }
        return true;
    }

    // Sucht nach einem passenden Bauplan um Position (r,c) herum
    // Prüft alle 4×4 Fenster die (r,c) enthalten
    function findBlueprint(grid, r, c, rows, cols) {
        for (const bp of BLUEPRINTS) {
            // Alle möglichen Startpositionen eines 4×4 Fensters das (r,c) enthält
            for (let sr = r - 3; sr <= r; sr++) {
                for (let sc = c - 3; sc <= c; sc++) {
                    if (sr < 0 || sc < 0 || sr + 3 >= rows || sc + 3 >= cols) continue;
                    if (matchPattern(grid, sr, sc, rows, cols, bp.pattern)) {
                        return {
                            blueprint: bp,
                            startR: sr,
                            startC: sc,
                        };
                    }
                }
            }
        }
        return null;
    }

    // Ghost-Overlay: Zeigt für einen Bauplan an, welche Zellen noch fehlen
    // Gibt Array von { r, c, material, status: 'placed'|'missing'|'wrong' } zurück
    /** @param {Grid} grid @param {number} startR @param {number} startC @param {number} rows @param {number} cols @param {PatternCell[][]} pattern @returns {OverlayCell[]} */
    function getOverlay(grid, startR, startC, rows, cols, pattern) {
        const cells = [];
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                const gr = startR + r;
                const gc = startC + c;
                const expected = pattern[r][c];

                if (expected === null) continue; // Leere Zellen überspringen

                let status = /** @type {'placed' | 'missing' | 'wrong'} */ ('missing');
                if (gr >= 0 && gr < rows && gc >= 0 && gc < cols) {
                    const actual = grid[gr][gc];
                    if (expected === '*') {
                        status = actual ? 'placed' : 'missing';
                    } else if (actual === expected) {
                        status = 'placed';
                    } else if (actual !== null) {
                        status = 'wrong';
                    }
                }

                cells.push({
                    r: gr,
                    c: gc,
                    material: expected,
                    status,
                });
            }
        }
        return cells;
    }

    window.INSEL_BLUEPRINTS = {
        BLUEPRINTS,
        findBlueprint,
        matchPattern,
        getOverlay,
    };
})();
