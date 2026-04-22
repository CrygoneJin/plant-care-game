const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

// NPC-Memory-Strings leben in src/core/game.js in der Funktion getNpcMemoryComment.
// Coverage-Check: jede unterstützte Sprache muss einen hart-kodierten Return-Zweig haben.
// Vollwert-Test ist schwer (game.js ist riesig und browser-bound). Daher: Regex-basiert.
//
// Supported langs:
//   DE/EN/FR — native (markiert ohne UNREVIEWED-Kommentar)
//   ES/IT    — LLM-Basis (markiert als UNREVIEWED, HITL #108)
//
// Für DE: Fallback-Return ohne lang-Check, deswegen separate Detection.

const GAME_JS = path.resolve(__dirname, '../../src/core/game.js');

describe('NPC-Memory language coverage (getNpcMemoryComment)', () => {
    const src = fs.readFileSync(GAME_JS, 'utf-8');

    // Die 4 Szenarien in getNpcMemoryComment:
    //   1. lastMaterial + quests  ("viel gebaut … Quests geschafft")
    //   2. lastMaterial           ("viel gebaut …")
    //   3. daysSince              ("schon … zuletzt hier")
    //   4. quests                 ("erinnerst du dich … Quests zusammen")
    //
    // Jedes Szenario muss für EN/FR/ES/IT einen `if (lang === 'xx') return ...` haben.
    // DE = Fallback-Return ohne lang-Check.

    const LANGS_WITH_CHECK = ['en', 'fr', 'es', 'it'];

    for (const lang of LANGS_WITH_CHECK) {
        it(`has hard-coded return for lang === '${lang}' in all 4 scenarios`, () => {
            const pattern = new RegExp(`lang === '${lang}'`, 'g');
            const matches = src.match(pattern) || [];
            assert.ok(
                matches.length >= 4,
                `Expected >=4 hard-coded branches for '${lang}', got ${matches.length}. ` +
                `getNpcMemoryComment hat 4 Szenarien, jedes braucht einen lang-Check.`
            );
        });
    }

    it('ES branches are marked UNREVIEWED (HITL #108)', () => {
        const esBranches = src.split('\n')
            .map((line, i) => ({ line, i }))
            .filter(({ line }) => line.includes(`lang === 'es'`));
        assert.ok(esBranches.length >= 4, 'ES branches must exist');
        for (const { line, i } of esBranches) {
            // Zeile direkt davor muss UNREVIEWED-Kommentar haben
            const prev = src.split('\n')[i - 1] || '';
            assert.ok(
                prev.includes('UNREVIEWED') && prev.includes('108'),
                `ES branch at line ${i + 1} missing UNREVIEWED comment on line above. ` +
                `Got: "${prev.trim()}"`
            );
        }
    });

    it('IT branches are marked UNREVIEWED (HITL #108)', () => {
        const itBranches = src.split('\n')
            .map((line, i) => ({ line, i }))
            .filter(({ line }) => line.includes(`lang === 'it'`));
        assert.ok(itBranches.length >= 4, 'IT branches must exist');
        for (const { line, i } of itBranches) {
            const prev = src.split('\n')[i - 1] || '';
            assert.ok(
                prev.includes('UNREVIEWED') && prev.includes('108'),
                `IT branch at line ${i + 1} missing UNREVIEWED comment on line above. ` +
                `Got: "${prev.trim()}"`
            );
        }
    });

    it('dayText object has all 5 language keys (de/en/fr/es/it)', () => {
        // Finde das dayText Objekt
        const dayTextStart = src.indexOf('const dayText = {');
        assert.ok(dayTextStart > 0, 'dayText object not found');
        const dayTextEnd = src.indexOf('}[lang]', dayTextStart);
        assert.ok(dayTextEnd > dayTextStart, 'dayText end not found');
        const block = src.substring(dayTextStart, dayTextEnd);

        for (const key of ['de', 'en', 'fr', 'es', 'it']) {
            const keyPattern = new RegExp(`\\b${key}:\\s`, 'g');
            assert.ok(
                keyPattern.test(block),
                `dayText object missing '${key}' key`
            );
        }
    });

    it('no placeholder leftovers (TODO, XXX, {playerName}-style) in ES/IT strings', () => {
        const lines = src.split('\n');
        // Match literal {foo} but NOT ${foo} (template-literal). (?<!\$) lookbehind.
        const suspect = /(?<!\$)\{[a-zA-Z_]+\}|\bTODO\b|\bXXX\b|\bFIXME\b/;
        const isEsIt = (line) =>
            line.includes(`lang === 'es'`) || line.includes(`lang === 'it'`);
        for (const line of lines) {
            if (isEsIt(line)) {
                assert.ok(
                    !suspect.test(line),
                    `Placeholder leftover in: ${line.trim()}`
                );
            }
        }
    });
});
