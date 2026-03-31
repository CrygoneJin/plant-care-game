// === ACHIEVEMENTS — Achievement-Definitionen ===
// Exportiert als window.INSEL_ACHIEVEMENTS (Vanilla JS, kein Build-Tool)
// Achtung: check-Funktionen referenzieren Stats-Objekt aus game.js

window.INSEL_ACHIEVEMENTS = {
    firstBlock:    { emoji: '⭐', title: 'Los geht\'s!', desc: 'Du hast deinen allerersten Block gebaut!', check: (s) => s.total >= 1 },
    builder10:     { emoji: '🏗️', title: 'Fleißige Hände', desc: 'Schon 10 Blöcke — weiter so!', check: (s) => s.total >= 10 },
    builder50:     { emoji: '🏘️', title: 'Dorf in Sicht!', desc: '50 Blöcke! Hier entsteht was Großes.', check: (s) => s.total >= 50 },
    builder100:    { emoji: '🏙️', title: 'Insel-Profi', desc: '100 Blöcke! Schnipsel ist beeindruckt!', check: (s) => s.total >= 100 },
    halfIsland:    { emoji: '🌍', title: 'Halb fertig!', desc: 'Die halbe Insel ist schon bebaut!', check: (s) => s.percent >= 50 },
    fullIsland:    { emoji: '🌟', title: 'Insel voll!', desc: 'Jedes Feld bebaut — wow!', check: (s) => s.percent >= 100 },
    allMaterials:  { emoji: '🎨', title: 'Alles ausprobiert!', desc: '12 verschiedene Sachen benutzt!', check: (s) => s.uniqueMats >= 12 },
    gardenLover:   { emoji: '🌺', title: 'Grüner Daumen', desc: '10 Pflanzen und Bäume gepflanzt!', check: (s) => (s.counts.plant || 0) + (s.counts.tree || 0) + (s.counts.flower || 0) >= 10 },
    waterWorld:    { emoji: '🏊', title: 'Plitsch Platsch!', desc: '15 mal Wasser gebaut — Schnipsel kann schwimmen!', check: (s) => (s.counts.water || 0) >= 15 },
    architect:     { emoji: '👷', title: 'Echtes Haus!', desc: 'Ein Haus mit Holz, Tür, Dach und Fenster!', check: (s) => (s.counts.wood || 0) >= 4 && (s.counts.door || 0) >= 1 && (s.counts.roof || 0) >= 2 && (s.counts.glass || 0) >= 1 },
    fisherman:     { emoji: '🎣', title: 'Petri Heil!', desc: '5 Fische gefangen — lecker!', check: (s) => (s.counts.fish || 0) >= 5 },
    explorer:      { emoji: '🧭', title: 'Entdeckergeist!', desc: '15 verschiedene Sachen benutzt — du kennst dich aus!', check: (s) => s.uniqueMats >= 15 },
};
