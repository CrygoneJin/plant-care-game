// === ACHIEVEMENTS — Achievement-Definitionen ===
// Exportiert als window.INSEL_ACHIEVEMENTS (Vanilla JS, kein Build-Tool)
// Achtung: check-Funktionen referenzieren Stats-Objekt aus game.js

window.INSEL_ACHIEVEMENTS = {
    firstBlock:    { emoji: '⭐', title: 'Erster Block!', desc: 'Platziere deinen ersten Block', check: (s) => s.total >= 1 },
    builder10:     { emoji: '🏗️', title: 'Kleiner Baumeister', desc: '10 Blöcke gebaut', check: (s) => s.total >= 10 },
    builder50:     { emoji: '🏘️', title: 'Siedlungsbauer', desc: '50 Blöcke gebaut', check: (s) => s.total >= 50 },
    builder100:    { emoji: '🏙️', title: 'Stadtplaner', desc: '100 Blöcke gebaut', check: (s) => s.total >= 100 },
    halfIsland:    { emoji: '🌍', title: 'Halbe Insel!', desc: '50% der Insel bebaut', check: (s) => s.percent >= 50 },
    fullIsland:    { emoji: '🌟', title: 'Insel-Meister!', desc: '100% der Insel bebaut', check: (s) => s.percent >= 100 },
    allMaterials:  { emoji: '🎨', title: 'Materialkenner', desc: 'Alle Original-Materialien benutzt', check: (s) => s.uniqueMats >= 12 },
    gardenLover:   { emoji: '🌺', title: 'Gärtner', desc: '10 Pflanzen, Bäume oder Blumen', check: (s) => (s.counts.plant || 0) + (s.counts.tree || 0) + (s.counts.flower || 0) >= 10 },
    waterWorld:    { emoji: '🏊', title: 'Wasserwelt', desc: '15 Wasserblöcke', check: (s) => (s.counts.water || 0) >= 15 },
    architect:     { emoji: '👷', title: 'Architekt', desc: 'Haus gebaut (Holz+Tür+Dach+Glas)', check: (s) => (s.counts.wood || 0) >= 4 && (s.counts.door || 0) >= 1 && (s.counts.roof || 0) >= 2 && (s.counts.glass || 0) >= 1 },
    fisherman:     { emoji: '🎣', title: 'Fischer', desc: '5 Fische im Wasser', check: (s) => (s.counts.fish || 0) >= 5 },
    explorer:      { emoji: '🧭', title: 'Entdecker', desc: '15 verschiedene Materialien benutzt', check: (s) => s.uniqueMats >= 15 },
};
