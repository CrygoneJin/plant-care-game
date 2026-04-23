const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

// NPC-Memory-Strings leben in src/core/game.js in der Funktion getNpcMemoryComment.
// Coverage-Check: jede unterstützte Sprache muss einen hart-kodierten Return-Zweig haben.
// Vollwert-Test ist schwer (game.js ist riesig und browser-bound). Daher: Regex-basiert.
//
// Supported langs:
//   DE/EN/FR — native (Till)
//   ES/IT    — Opus-Review 2026-04-23 (HITL #108 aufgelöst, kein UNREVIEWED mehr)
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

    it('no UNREVIEWED markers remain in ES/IT strings (HITL #108 aufgelöst)', () => {
        // Inversion: Nach Opus-Review 2026-04-23 darf KEIN UNREVIEWED-Marker mehr
        // in ES- oder IT-Zweigen stehen. Wenn doch: HITL #108 ist zurück aus den Toten.
        const lines = src.split('\n');
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const isEsIt = line.includes(`lang === 'es'`) || line.includes(`lang === 'it'`);
            if (!isEsIt) continue;
            const prev = lines[i - 1] || '';
            assert.ok(
                !prev.includes('UNREVIEWED'),
                `Line ${i + 1}: ES/IT branch still marked UNREVIEWED. HITL #108 sollte aufgelöst sein. ` +
                `Got: "${prev.trim()}"`
            );
        }
    });

    it('no UNREVIEWED markers in dayText object (ES/IT keys)', () => {
        // Der dayText-Block hat inline Kommentare direkt vor "es:" und "it:" keys.
        const lines = src.split('\n');
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (/^(es|it):\s/.test(line)) {
                const prev = (lines[i - 1] || '').trim();
                assert.ok(
                    !prev.includes('UNREVIEWED'),
                    `Line ${i + 1}: dayText ${line.slice(0, 3)} key still marked UNREVIEWED. ` +
                    `Got: "${prev}"`
                );
            }
        }
    });

    it('IT plural morphology is correct (missione/missioni, not missionei)', () => {
        // Regression-Guard: alter Code hatte `missione${qs?'':'i'}` → "missionei" im Plural.
        // Italienisch: finale -e wird durch -i ersetzt, nicht angehängt.
        // Dieses Muster ist jetzt verboten.
        assert.ok(
            !/missione\$\{qs\s*\?\s*''\s*:\s*'i'\s*\}/.test(src),
            `Legacy broken IT-plural pattern detected: missione${'${qs?\\\'\\\':\\\'i\\\'}'} produziert "missionei". ` +
            `Use ternary: \${qs ? 'missione' : 'missioni'}`
        );
    });

    it('ES uses "misión" (Standard für Quest), not "búsqueda" (LLM-Literal)', () => {
        // Regression-Guard: "búsqueda" = "Suche" (Google-Translate-Tell).
        // Standard-Spanisch für Quest: "misión". Kind in Madrid hört "búsqueda" als roboterhaft.
        const esLines = src.split('\n').filter(l => l.includes(`lang === 'es'`));
        for (const line of esLines) {
            assert.ok(
                !/b[uú]squeda/i.test(line),
                `ES string enthält "búsqueda" (LLM-Literal). Verwende "misión" (Standard). ` +
                `Line: ${line.trim()}`
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
