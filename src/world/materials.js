// === MATERIALS — alle Material-Definitionen ===
// Exportiert als window.INSEL_MATERIALS (Vanilla JS, kein Build-Tool)
//
// Farbphysik (Lesch/Oppenheimer/Heisenberg, Beirats-Session 2026-03-30):
//
//   Quark-Farben     Wu Xing        Physik
//   ─────────────    ──────────     ──────────────────
//   Rot              火 Feuer       Farbladung Rot
//   Grün             木 Holz        Farbladung Grün
//   Blau             水 Wasser      Farbladung Blau
//   Weiß (r+g+b)     金 Metall      Gebundenes Atom (farbneutral)
//   Gelb (Strahlung)  土 Erde        Bindungsenergie → erstes Licht
//
//   Tao = Singularität. Yin = Down-Quark. Yang = Up-Quark.
//   Qi = Starke Kernkraft (hält zusammen).
//
//   3×3×3 = 27 Fermionen:
//
//   Achse 1 — Generation:  1 (leicht) → 2 (schwer) → 3 (schwerst)
//   Achse 2 — Typ:         Up-Quark / Down-Quark / Lepton
//   Achse 3 — Farbe:       Rot (Feuer) / Grün (Holz) / Blau (Wasser)
//
//              Gen 1          Gen 2          Gen 3
//   Up:       Yang ⚪        Charm 💫       Berg 🏔️  (Top)
//   Down:     Yin ⚫         Strange 🌀     Höhle 🕳️ (Bottom)
//   Lepton:   Elektron 🔹    Myon 🔸        Tau 🔻
//
//   × 3 Farben (Rot/Grün/Blau = Feuer/Holz/Wasser) = 27 Zustände
//
//   Vier Kräfte = Vier Spielmechaniken:
//
//   Kraft              Mechanik               Ebene
//   ─────────────      ──────────────         ──────────────
//   Starke Kernkraft   Automerge (A+B, A×A)   AUF dem Grid
//   Elektroschwach     Craft / Mephisto-Deal   AUF dem Grid
//   Gravitation        Das Grid selbst         IST das Grid
//
//   Die ersten drei: quantisiert (Klick, Craft, Merge = diskret).
//   Gravitation: kontinuierlich (Canvas, Pixel, Fläche).
//   Quantengravitation: wenn das Grid selbst reagiert (Isometric Mode).
//
//   Ist das exakt? Nein. Ist es falsch? Auch nicht.
//   Eine brauchbare Lüge die zur Wahrheit führt. — Amélie-Prinzip.

window.INSEL_MATERIALS = {
    // === 0 — NICHTS (Vakuum, Quantenfluktuationen) ===
    void:     { emoji: '⬛', label: 'Nichts',    color: '#000000', border: '#000000' },
    // === 1 — TAO (Singularität, alles in einem Punkt) ===
    tao:      { emoji: '☯️', label: 'Tao',       color: '#808080', border: '#606060' },
    // === 3 — Drei Quarks = ein Proton (Up-Up-Down) ===
    yin:      { emoji: '⚫', label: 'Yin',       color: '#1A1A1A', border: '#000000' },  // Down-Quark
    yang:     { emoji: '⚪', label: 'Yang',      color: '#F0F0F0', border: '#D0D0D0' },  // Up-Quark
    qi:       { emoji: '✨', label: 'Qi',        color: '#FFD700', border: '#DAA520' },  // Starke Kernkraft
    // === GENERATION 2 — Charm & Strange (schwere Quarks, brauchen Beschleuniger) ===
    charm:    { emoji: '💫', label: 'Charm',     color: '#E8B4F8', border: '#C77DDB' },  // Charm-Quark: schweres Yang (Generation 2)
    strange:  { emoji: '🌀', label: 'Strange',   color: '#7B2FBE', border: '#5B1F8E' },  // Strange-Quark: schweres Yin (Generation 2)
    antimatter:{ emoji: '⚛️', label: 'Antimaterie', color: '#1A0033', border: '#0D001A' },  // Charm + Strange = gebundene Gegensätze
    // === LEPTONEN — die leichten Teilchen (spüren keine starke Kraft / kein Qi!) ===
    electron: { emoji: '🔹', label: 'Elektron',  color: '#0080FF', border: '#0060CC' },  // Gen 1: leichtestes geladenes Lepton
    muon:     { emoji: '🔸', label: 'Myon',      color: '#9B59B6', border: '#7D3C98' },  // Gen 2: schweres Elektron, kosmisch
    tau:      { emoji: '🔻', label: 'Tau',       color: '#FF4500', border: '#CC3700' },  // Gen 3: schwerstes Lepton
    // === NEUTRINOS — Geister-Teilchen (durchdringen alles, fast masselos) ===
    neutrino:    { emoji: '👻', label: 'Neutrino',       color: '#E8E8FF', border: '#C8C8E8' },  // Gen 1: Elektron-Neutrino
    neutrino_mu: { emoji: '👻', label: 'Myon-Neutrino',  color: '#D0D0FF', border: '#B0B0E8' },  // Gen 2
    neutrino_tau:{ emoji: '👻', label: 'Tau-Neutrino',   color: '#B8B8FF', border: '#9898E8' },  // Gen 3
    // === BOSONEN — Kraftteilchen (Oscar liebt Bosonen) ===
    // Qi ✨ = Gluon (starke Kraft) — oben definiert
    // Tao ☯️ = Higgs (gibt Masse) — oben definiert
    // Grid = Graviton (Raumzeit) — kein Material, IST das Spielfeld
    photon:  { emoji: '💛', label: 'Photon',  color: '#FFFF44', border: '#E8E800' },  // Elektromagnetisch
    w_boson: { emoji: '🔀', label: 'W-Boson', color: '#FF69B4', border: '#DB5090' },  // Schwache Kraft (geladen)
    z_boson: { emoji: '⚖️', label: 'Z-Boson', color: '#DDA0DD', border: '#BA55D3' },  // Schwache Kraft (neutral)
    // === 5 — DIE 5 ELEMENTE (五行 Wu Xing = Quark-Farben + Bindung + Strahlung) ===
    metal:    { emoji: '⬜', label: 'Metall',   color: '#C0C0C0', border: '#A0A0A0' },  // Weiß = r+g+b = gebundenes Atom
    wood:     { emoji: '🟩', label: 'Holz',     color: '#2E7D32', border: '#1B5E20' },  // Grün = Farbladung Grün
    fire:     { emoji: '🟥', label: 'Feuer',    color: '#D32F2F', border: '#B71C1C' },  // Rot = Farbladung Rot
    water:    { emoji: '🟦', label: 'Wasser',   color: '#0D1B4A', border: '#060E2A' },  // Blau = Farbladung Blau (Goethe: dunkel)
    earth:    { emoji: '🟨', label: 'Erde',     color: '#F5C800', border: '#C8A300' },  // Gelb = Bindungsenergie → erstes Licht des Universums
    // === ABGELEITETE MATERIALIEN ===
    stone:    { emoji: '🧱', label: 'Stein',    color: '#95A5A6', border: '#7F8C8D' },
    glass:    { emoji: '🪟', label: 'Glas',     color: '#AED6F1', border: '#85C1E9' },
    plant:    { emoji: '🌿', label: 'Pflanze',  color: '#52BE80', border: '#27AE60' },
    sapling:  { emoji: '🌱', label: 'Setzling', color: '#7DCEA0', border: '#52BE80' },
    small_tree: { emoji: '🌲', label: 'Kleiner Baum', color: '#229954', border: '#1E8449' },
    tree:     { emoji: '🌳', label: 'Baum',     color: '#1E8449', border: '#196F3D' },
    flower:   { emoji: '🌸', label: 'Blume',    color: '#F1948A', border: '#E74C3C' },
    door:     { emoji: '🚪', label: 'Tür',      color: '#6E3B1A', border: '#4A2510' },
    roof:     { emoji: '🏠', label: 'Dach',     color: '#E74C3C', border: '#C0392B' },
    lamp:     { emoji: '💡', label: 'Lampe',    color: '#F9E79F', border: '#F1C40F' },
    sand:     { emoji: '⬜', label: 'Sand',     color: '#F5DEB3', border: '#DCC89E' },
    path:     { emoji: '🟫', label: 'Weg',      color: '#A0522D', border: '#8B4513' },
    fence:    { emoji: '🏗️', label: 'Zaun',     color: '#C4A265', border: '#A08040' },
    boat:     { emoji: '⛵', label: 'Boot',     color: '#5DADE2', border: '#2E86C1' },
    rope:     { emoji: '🪢', label: 'Seil',     color: '#8B7355', border: '#6B5345' },
    sail:     { emoji: '🪁', label: 'Segel',    color: '#FDFEFE', border: '#D5D8DC' },
    sailboat: { emoji: '⛵', label: 'Segelboot', color: '#2E86C1', border: '#1A5276' },
    fish:     { emoji: '🐟', label: 'Fisch',    color: '#48C9B0', border: '#1ABC9C' },
    fountain: { emoji: '⛲', label: 'Brunnen',  color: '#7FB3D8', border: '#5499C7' },
    flag:     { emoji: '🚩', label: 'Flagge',   color: '#E74C3C', border: '#B03A2E' },
    bridge:   { emoji: '🌉', label: 'Brücke',   color: '#B7950B', border: '#9A7D0A' },
    cactus:   { emoji: '🌵', label: 'Kaktus',   color: '#28B463', border: '#1D8348' },
    mushroom: { emoji: '🍄', label: 'Pilz',     color: '#E59866', border: '#CA6F1E' },
    planks:   { emoji: '🪵', label: 'Bretter',  color: '#C19A6B', border: '#A0784A' },
    window_pane: { emoji: '🪟', label: 'Fenster', color: '#D4EFFC', border: '#AED6F1' },
    // === MAGISCHE ARTEFAKTE ===
    steam:    { emoji: '💨', label: 'Dampf',    color: '#D5D8DC', border: '#AEB6BF' },
    ice:      { emoji: '🧊', label: 'Eis',      color: '#D6EAF8', border: '#AED6F1' },
    snow:     { emoji: '❄️', label: 'Schnee',   color: '#EBF5FB', border: '#D6EAF8' },
    cloud:    { emoji: '☁️', label: 'Wolke',    color: '#F2F4F4', border: '#D5D8DC' },
    rain:     { emoji: '🌧️', label: 'Regen',   color: '#85C1E9', border: '#5DADE2' },
    rainbow:  { emoji: '🌈', label: 'Regenbogen', color: '#F9E79F', border: '#F4D03F' },
    sun:      { emoji: '☀️', label: 'Sonne',    color: '#F9E79F', border: '#F1C40F' },
    star:     { emoji: '⭐', label: 'Stern',    color: '#F9E79F', border: '#F4D03F' },
    moon:     { emoji: '🌙', label: 'Mond',     color: '#F7DC6F', border: '#F1C40F' },
    lightning:{ emoji: '⚡', label: 'Blitz',    color: '#F7DC6F', border: '#F4D03F' },
    volcano:  { emoji: '🌋', label: 'Vulkan',   color: '#E74C3C', border: '#C0392B' },
    mountain: { emoji: '🏔️', label: 'Berg',    color: '#95A5A6', border: '#7F8C8D', charge: 0, mass: 20 },
    diamond:  { emoji: '💎', label: 'Diamant',  color: '#AED6F1', border: '#85C1E9' },
    sword:    { emoji: '⚔️', label: 'Schwert',  color: '#BDC3C7', border: '#95A5A6' },
    shield:   { emoji: '🛡️', label: 'Schild',  color: '#F0B27A', border: '#E59866' },
    crown:    { emoji: '👑', label: 'Krone',    color: '#F9E79F', border: '#F4D03F' },
    key:      { emoji: '🔑', label: 'Schlüssel', color: '#F9E79F', border: '#F4D03F' },
    treasure: { emoji: '💰', label: 'Schatz',   color: '#F9E79F', border: '#F4D03F' },
    dragon:   { emoji: '🐉', label: 'Drache',   color: '#27AE60', border: '#1E8449' },
    unicorn:  { emoji: '🦄', label: 'Einhorn',  color: '#D2B4DE', border: '#BB8FCE' },
    ghost:    { emoji: '👻', label: 'Geist',    color: '#F2F4F4', border: '#D5D8DC' },
    alien:    { emoji: '👽', label: 'Alien',    color: '#82E0AA', border: '#58D68D' },
    robot:    { emoji: '🤖', label: 'Roboter',  color: '#AEB6BF', border: '#85929E' },
    potion:   { emoji: '🧪', label: 'Trank',    color: '#AF7AC5', border: '#8E44AD' },
    crystal:  { emoji: '🔮', label: 'Kristall', color: '#D2B4DE', border: '#BB8FCE' },
    egg:      { emoji: '🥚', label: 'Ei',       color: '#FDEBD0', border: '#FAD7A0' },
    nest:     { emoji: '🪺', label: 'Nest',     color: '#D4AC0D', border: '#B7950B' },
    butterfly:{ emoji: '🦋', label: 'Schmetterling', color: '#85C1E9', border: '#5DADE2' },
    bee:      { emoji: '🐝', label: 'Biene',    color: '#F9E79F', border: '#F4D03F' },
    honey:    { emoji: '🍯', label: 'Honig',    color: '#F0B27A', border: '#E59866' },
    apple:    { emoji: '🍎', label: 'Apfel',    color: '#E74C3C', border: '#C0392B' },
    cake:     { emoji: '🎂', label: 'Kuchen',   color: '#F1948A', border: '#E74C3C' },
    music:    { emoji: '🎵', label: 'Musik',    color: '#AF7AC5', border: '#8E44AD' },
    heart:    { emoji: '❤️', label: 'Herz',     color: '#E74C3C', border: '#C0392B' },
    skull:    { emoji: '💀', label: 'Skelett',  color: '#F2F4F4', border: '#D5D8DC' },
    poop:     { emoji: '💩', label: 'Haufen',   color: '#8B6914', border: '#6B4F0A' },
    rocket:   { emoji: '🚀', label: 'Rakete',   color: '#E74C3C', border: '#C0392B' },
    ufo:      { emoji: '🛸', label: 'UFO',      color: '#82E0AA', border: '#58D68D' },
    tornado:  { emoji: '🌪️', label: 'Tornado', color: '#AEB6BF', border: '#85929E' },
    wave:     { emoji: '🌊', label: 'Tsunami',  color: '#2980B9', border: '#1F618D' },
    phoenix:  { emoji: '🔥', label: 'Phönix',   color: '#F39C12', border: '#E67E22' },
    ash:      { emoji: '🪨', label: 'Asche',    color: '#808080', border: '#606060' },
    // === HANDEL (Mr. Krabs — Muschelwährung) ===
    shell:    { emoji: '🐚', label: 'Muschel',  color: '#FADADD', border: '#E8B4B8' },
    // === UNSINN (Lindgren-approved) ===
    worm:     { emoji: '🪱', label: 'Regenwurm', color: '#CD853F', border: '#A0522D' },
    flyfish:  { emoji: '🐟', label: 'Flugfisch', color: '#87CEEB', border: '#5DADE2' },
    catgold:  { emoji: '✨', label: 'Katzengold', color: '#FFD700', border: '#DAA520' },
    pancake:  { emoji: '🥞', label: 'Eierkuchen', color: '#F5DEB3', border: '#DCC89E' },
    aircastle:{ emoji: '🏰', label: 'Luftschloss', color: '#D6EAF8', border: '#AED6F1' },
    // === NOCH MEHR UNSINN (Backlog #58 — Lindgren-approved) ===
    firecake:       { emoji: '🔥', label: 'Feuerkuchen',    color: '#FF6347', border: '#DC143C' },
    dragoncake:     { emoji: '🐉', label: 'Drachentorte',   color: '#8B0000', border: '#660000' },
    ghostship:      { emoji: '👻', label: 'Geisterschiff',  color: '#B0C4DE', border: '#8B9DC3' },
    mooncheese:     { emoji: '🧀', label: 'Mondkäse',       color: '#FFE4B5', border: '#FFDAB9' },
    snowdragon:     { emoji: '❄️', label: 'Schneedrache',   color: '#B0E0E6', border: '#87CEEB' },
    wormhole:       { emoji: '🌀', label: 'Wurmloch',       color: '#4B0082', border: '#2E0054' },
    beesting:       { emoji: '🍰', label: 'Bienenstich',    color: '#F0E68C', border: '#DAA520' },
    fishstick:      { emoji: '🐟', label: 'Fischstäbchen',  color: '#F5DEB3', border: '#DEB887' },
    shootingstar:   { emoji: '🌠', label: 'Sternschnuppe',  color: '#FFD700', border: '#FFA500' },
    thunderweather: { emoji: '⛈️', label: 'Donnerwetter',  color: '#696969', border: '#4A4A4A' },
    // === GEBÄUDE (4×4 Bauplan-Ergebnisse) ===
    hut:      { emoji: '🛖', label: 'Hütte',       color: '#A0522D', border: '#8B4513' },
    tower:    { emoji: '🗼', label: 'Turm',         color: '#C0C0C0', border: '#A0A0A0' },
    well:     { emoji: '⛲', label: 'Brunnenhaus',   color: '#7FB3D8', border: '#5499C7' },
    garden:   { emoji: '🏡', label: 'Garten',       color: '#52BE80', border: '#27AE60' },
    forge:    { emoji: '⚒️', label: 'Schmiede',     color: '#E74C3C', border: '#C0392B' },
    dock:     { emoji: '⚓', label: 'Hafen',         color: '#5DADE2', border: '#2E86C1' },
    castle:   { emoji: '🏰', label: 'Schloss',      color: '#95A5A6', border: '#7F8C8D', charge: 0, mass: 25 },
    // === HÖHLEN & EDELSTEINE ===
    cave:     { emoji: '🕳️', label: 'Höhle',       color: '#4A4A4A', border: '#2C2C2C' },
    stalactite:{ emoji: '🪨', label: 'Tropfstein',  color: '#8B8589', border: '#696364' },
    gem:      { emoji: '💎', label: 'Edelstein',    color: '#E040FB', border: '#AB00D9' },
    // === BIBLIOTHEK VON ALEXANDRIA ===
    library:  { emoji: '🏛️', label: 'Bibliothek', color: '#F5E6CA', border: '#D4C5A9' },
    scroll:   { emoji: '📜', label: 'Schriftrolle', color: '#FDEBD0', border: '#FAD7A0' },
    // === DINOSAURIER-PFAD (S30-3 — Oscar entdeckt die Urzeit) ===
    fossil:   { emoji: '🦴', label: 'Fossil',        color: '#D2B48C', border: '#A0896A' },
    dino:     { emoji: '🦕', label: 'Dinosaurier',   color: '#4CAF50', border: '#388E3C' },
    trex:     { emoji: '🦖', label: 'T-Rex',         color: '#E65100', border: '#BF360C' },
    meteor:   { emoji: '☄️', label: 'Meteorit',      color: '#5D4037', border: '#3E2723' },
    // === WELTRAUM-PFAD (S32-2 — Oscar erkundet den Weltraum) ===
    // rocket, moon, alien existieren bereits — nur Mars ist neu
    mars:     { emoji: '🪐', label: 'Mars',            color: '#FFCCBC', border: '#E64A19' },
    // === LUMMERLAND — Jim-Knopf-Kanon ===
    rail:    { emoji: '🛤️', label: 'Gleis',   color: '#8B6914', border: '#6B5310', charge: 0, mass: 8 },
    station: { emoji: '🏚️', label: 'Bahnhof', color: '#A0522D', border: '#8B4513', charge: 0, mass: 15 },
    shop:    { emoji: '🏪', label: 'Laden',   color: '#E8A020', border: '#C07010', charge: 0, mass: 10 },
    ocean:   { emoji: '🌊', label: 'Meer',    color: '#0D2B6E', border: '#071848', charge: 0, mass: 0, unbaubar: true },
    train:   { emoji: '🚂', label: 'Emma',    color: '#8B0000', border: '#660000', charge: 0, mass: 30 },
    // === BARYONEN — gebundene Quark-Tripletts (Farbneutral: R+G+B) ===
    // Proton  = uud (Yang+Yang+Yin), Ladung +1, stabil — Kern der Materie
    // Neutron = udd (Yang+Yin+Yin),  Ladung  0, frei instabil (~15min β⁻)
    proton:  { emoji: '🔴', label: 'Proton',  color: '#E74C3C', border: '#C0392B', charge: 1, mass: 20 },
    neutron: { emoji: '⭕', label: 'Neutron', color: '#ECF0F1', border: '#BDC3C7', charge: 0, mass: 20 },
};

// === SCHRIFTROLLEN DER BIBLIOTHEK — Easter Eggs für Neugierige ===
// Werden in der Bibliothek von Alexandria angezeigt wenn Oscar sie baut
window.INSEL_SCROLLS = [
    { title: 'Farben der Materie', text: 'Rot, Grün, Blau — die drei Farben der Quarks. Zusammen werden sie Weiß. Wie Metall. Und das Gelb? Das ist das erste Licht des Universums.' },
    { title: 'Drei Quarks', text: 'Up-Up-Down = Proton. Up-Down-Down = Neutron. Yin und Yang und Qi — die alten Chinesen wussten es schon.' },
    { title: 'Charm & Strange', text: 'Die schweren Geschwister von Up und Down. Charm ist elegant und symmetrisch — wie ein Rezept das beim ersten Versuch klappt. Strange ist rätselhaft und langlebig — wie eine Entdeckung die niemand erklären kann. Man braucht einen Beschleuniger um sie zu sehen.' },
    { title: 'Antimaterie', text: 'Wenn Charm und Strange sich verbinden, entsteht etwas das die normale Materie spiegelt. Berührt es Materie, wird beides zu reiner Energie. E=mc². Die gefährlichste Gleichung der Welt.' },
    { title: 'Leptonen', text: 'Die leichten Teilchen. Elektron, Myon, Tau — drei Generationen wie bei den Quarks, aber ohne starke Kraft. Kein Qi nötig. Das Elektron fließt durch jeden Blitz und jeden Bildschirm. Das Myon regnet aus dem Weltall. Das Tau existiert nur für einen Wimpernschlag.' },
    { title: 'Vier Kräfte', text: 'Starke Kraft: hält Quarks zusammen. Leg Yin neben Yang — sie verschmelzen zu Qi. Das ist Fusion. Elektroschwache Kraft: verwandelt Teilchen. Das Crafting-Grid und Mephistos Deals — dasselbe, nur aus verschiedener Perspektive. Gravitation: nicht AUF der Insel. Die Insel SELBST. Das Grid ist die Raumzeit. Wo du baust, krümmt sich die Welt.' },
    { title: 'Pauli-Druck', text: 'Zwei gleiche Teilchen können nicht am selben Ort sein. Zwing sie zusammen und sie werden schwerer — nächste Generation. Yang neben Yang wird Charm. Elektron neben Elektron wird Myon. In Neutronensternen passiert genau das. Auf der Insel auch.' },
    { title: 'Quantengravitation', text: 'Die drei Kräfte sind Klicks — diskret, quantisiert. Gravitation ist das Canvas — kontinuierlich, glatt. Niemand weiß wie man sie vereint. Einstein nicht. Hawking nicht. Du auch nicht. Aber deine Insel hat beides: Pixel UND Fläche. Vielleicht ist das die Antwort.' },
    { title: 'Neutrinos', text: 'Geister-Teilchen. Durchdringen alles. Jede Sekunde fliegen Milliarden durch deinen Körper. Kein einziges bleibt stecken. Sie sind fast masselos, fast unsichtbar, fast nichts. Und trotzdem halten sie das Universum zusammen.' },
    { title: 'Bosonen', text: 'Kraftteilchen. Sie tragen die Botschaft zwischen den Fermionen. Das Photon sagt: zieh dich an oder stoß dich ab. Das Gluon sagt: bleib zusammen. Das W-Boson sagt: verwandle dich. Das Z-Boson sagt: bleib neutral. Und das Higgs? Das Higgs sagt: du hast Gewicht.' },
    { title: 'Heisenbergs Geheimnis', text: 'Je genauer du hinschaust, desto unschärfer wird der Rest. Wasser ist schwarz UND blau — bis jemand hinschaut.' },
    { title: 'Oppenheimers Licht', text: 'Wenn Energie zu Materie wird, strahlt sie. E=mc². Das Gelb der Erde ist das Leuchten der Verwandlung.' },
    { title: 'Leschs Kaffee', text: '75% Wasserstoff, 25% Helium, Spuren von allem anderen. 75% JavaScript, 25% Rest. Zufall? Natürlich. Aber ein hübscher.' },
    { title: 'Lindgrens Regel', text: 'Kinder sind nicht logisch. Sie sind besser als das. — Deshalb gibt es Flugfische und Katzengold.' },
    { title: 'Endes Warnung', text: 'Lies das Buch bevor du die Welt baust. Was darunter liegt ist wichtiger als was oben drauf steht.' },
    { title: 'Dalai Lamas Frage', text: 'Für wen baust du? — Stille. — Dann baust du richtig.' },
    { title: 'Kants Inschrift', text: 'Sapere aude. Habe Mut, dich deines eigenen Verstandes zu bedienen. — Über dem Eingang der Bibliothek.' },
    { title: 'Goethes Farben', text: 'Farbe entsteht am Rand von Licht und Dunkel. Schwarz ist nicht Nichts — Schwarz ist Tiefe.' },
];
