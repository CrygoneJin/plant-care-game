// === ACHIEVEMENTS — Progressiv schwerer werdende Meilensteine ===
// Exportiert als window.INSEL_ACHIEVEMENTS (Vanilla JS, kein Build-Tool)
//
// Design-Prinzip:
//   - 5 Kategorien × 4 Stufen = 20 Achievements
//   - Jede Stufe ~3× schwerer als die vorherige (Fibonacci-Progression)
//   - Nur Stats verwenden die getGridStats() tatsächlich liefert:
//     playerPlaced, questsDone, blueprintsDone, recipesFound, uniqueMats, percent, total
//   - Stufe 1: Erste 5 Minuten. Stufe 4: Wochen.

window.INSEL_ACHIEVEMENTS = {

    // ═══════════════════════════════════════════
    // 🔨 BAUEN — playerPlaced (Spieler-gesetzte Blöcke)
    // ═══════════════════════════════════════════
    bau1: { emoji: '🔨', title: 'Grundstein',      desc: 'Deinen allerersten Block gebaut!',                    check: (s) => s.playerPlaced >= 1 },
    bau2: { emoji: '🛖', title: 'Hüttenbauer',      desc: '25 Blöcke gebaut — das wird was!',                   check: (s) => s.playerPlaced >= 25 },
    bau3: { emoji: '🏗️', title: 'Architekt',        desc: '100 Blöcke! Eine richtige Siedlung!',                check: (s) => s.playerPlaced >= 100 },
    bau4: { emoji: '🏰', title: 'Burgherr',          desc: '500 Blöcke — deine Insel ist legendär!',            check: (s) => s.playerPlaced >= 500 },

    // ═══════════════════════════════════════════
    // ⚗️ CRAFTEN — recipesFound (entdeckte Rezepte)
    // ═══════════════════════════════════════════
    mix1: { emoji: '⚗️', title: 'Erster Mix',       desc: 'Dein erstes Rezept entdeckt!',                       check: (s) => s.recipesFound >= 1 },
    mix2: { emoji: '🧪', title: 'Tüftler',           desc: '5 Rezepte — du experimentierst gerne!',             check: (s) => s.recipesFound >= 5 },
    mix3: { emoji: '🔮', title: 'Alchemist',          desc: '15 Rezepte! Du kennst die Geheimnisse!',           check: (s) => s.recipesFound >= 15 },
    mix4: { emoji: '🌟', title: 'Meister-Mixer',     desc: '30 Rezepte — nichts ist dir fremd!',                check: (s) => s.recipesFound >= 30 },

    // ═══════════════════════════════════════════
    // 📜 QUESTS — questsDone (abgeschlossene Quests)
    // ═══════════════════════════════════════════
    quest1: { emoji: '📜', title: 'Guter Freund',    desc: 'Deine erste Quest geschafft!',                      check: (s) => s.questsDone >= 1 },
    quest2: { emoji: '🤝', title: 'Helfer',           desc: '3 Quests — die Bewohner mögen dich!',              check: (s) => s.questsDone >= 3 },
    quest3: { emoji: '🦸', title: 'Insel-Held',       desc: '10 Quests! Alle kennen deinen Namen!',             check: (s) => s.questsDone >= 10 },
    quest4: { emoji: '👑', title: 'Legende',           desc: '25 Quests — du bist die Legende der Insel!',      check: (s) => s.questsDone >= 25 },

    // ═══════════════════════════════════════════
    // 📐 BAUPLÄNE — blueprintsDone (fertige Gebäude)
    // ═══════════════════════════════════════════
    plan1: { emoji: '📐', title: 'Bauplan-Finder',   desc: 'Deinen ersten Bauplan gebaut!',                     check: (s) => s.blueprintsDone >= 1 },
    plan2: { emoji: '🏠', title: 'Häuslebauer',       desc: '3 Gebäude — ein kleines Dorf!',                    check: (s) => s.blueprintsDone >= 3 },
    plan3: { emoji: '🏘️', title: 'Stadtplaner',      desc: '5 Gebäude stehen — eine Siedlung!',                check: (s) => s.blueprintsDone >= 5 },
    plan4: { emoji: '🏙️', title: 'Großstadt',         desc: 'Alle 8 Baupläne gebaut — Insel komplett!',        check: (s) => s.blueprintsDone >= 8 },

    // ═══════════════════════════════════════════
    // 🧭 ENTDECKEN — uniqueMats (verschiedene Materialien auf dem Grid)
    // ═══════════════════════════════════════════
    mat1: { emoji: '🧭', title: 'Neugierig',         desc: '5 verschiedene Materialien benutzt!',               check: (s) => s.uniqueMats >= 5 },
    mat2: { emoji: '🗺️', title: 'Entdecker',         desc: '15 verschiedene Materialien — bunt!',              check: (s) => s.uniqueMats >= 15 },
    mat3: { emoji: '🌈', title: 'Sammler',            desc: '30 verschiedene Materialien entdeckt!',            check: (s) => s.uniqueMats >= 30 },
    mat4: { emoji: '🐋', title: 'Orca-Großmutter',    desc: '50 Materialien — Weisheit der Tiefe!',            check: (s) => s.uniqueMats >= 50 },
};
