// === ACHIEVEMENTS — Meilensteine die sich verdient anfühlen ===
// Exportiert als window.INSEL_ACHIEVEMENTS (Vanilla JS, kein Build-Tool)
//
// Design-Prinzip (Molyneux/RCT):
//   - Wenige Achievements, jedes ein echter Meilenstein
//   - Gebunden an Spieler-Aktionen, nicht Generator-Blöcke
//   - stats.playerPlaced = nur vom Spieler gesetzte Blöcke
//   - Blueprints, Quests, Rezepte = echte Leistungen

window.INSEL_ACHIEVEMENTS = {
    // --- Erste Schritte ---
    firstBuild:     { emoji: '🔨', title: 'Grundstein!', desc: 'Deinen allerersten Block selbst gebaut!', check: (s) => s.playerPlaced >= 1 },
    homeBuilder:    { emoji: '🛖', title: 'Eigene Hütte!', desc: 'Einen Bauplan fertig gebaut — dein erstes Gebäude!', check: (s) => s.blueprintsDone >= 1 },

    // --- Crafting & Entdecken ---
    firstRecipe:    { emoji: '⚗️', title: 'Erster Mix!', desc: 'Dein erstes Crafting-Rezept entdeckt!', check: (s) => s.recipesFound >= 1 },
    alchemist:      { emoji: '🧪', title: 'Alchemist!', desc: '10 verschiedene Rezepte entdeckt — du kennst die Geheimnisse!', check: (s) => s.recipesFound >= 10 },
    masterCrafter:  { emoji: '🔮', title: 'Meister-Mixer!', desc: '25 Rezepte! Die Insel hat keine Geheimnisse mehr vor dir!', check: (s) => s.recipesFound >= 25 },

    // --- Quests ---
    questHelper:    { emoji: '📜', title: 'Guter Freund!', desc: 'Deine erste Quest für einen Insel-Bewohner geschafft!', check: (s) => s.questsDone >= 1 },
    questHero:      { emoji: '🦸', title: 'Insel-Held!', desc: '5 Quests erledigt — alle Bewohner lieben dich!', check: (s) => s.questsDone >= 5 },
    questLegend:    { emoji: '👑', title: 'Legende!', desc: '10 Quests geschafft — Schnipsel ist stolz auf dich!', check: (s) => s.questsDone >= 10 },

    // --- Bauen ---
    fleissig:       { emoji: '🏗️', title: 'Fleißige Hände!', desc: '50 Blöcke selbst gebaut — das sieht man!', check: (s) => s.playerPlaced >= 50 },
    architect:      { emoji: '🏛️', title: 'Architekt!', desc: '3 verschiedene Gebäude per Bauplan gebaut!', check: (s) => s.blueprintsDone >= 3 },
    stadtplaner:    { emoji: '🏙️', title: 'Stadtplaner!', desc: '200 Blöcke selbst platziert — eine richtige Stadt!', check: (s) => s.playerPlaced >= 200 },
    burgherr:       { emoji: '🏰', title: 'Burgherr!', desc: 'Alle 8 Baupläne gebaut — die Insel ist komplett!', check: (s) => s.blueprintsDone >= 8 },
};
