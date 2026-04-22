// === RECIPES — Crafting-Rezepte ===
// Exportiert als window.INSEL_CRAFTING_RECIPES (Vanilla JS, kein Build-Tool)

window.INSEL_CRAFTING_RECIPES = [
    // === GENESIS: 0 → 1 → 3 → 5 → 10.000 ===
    // Stufe 0→1: Tao spaltet sich
    { name: 'Yin',      result: 'yin',   resultCount: 1, ingredients: { tao: 1 },              desc: 'Tao → Yin (Dunkelheit)' },
    { name: 'Yang',     result: 'yang',  resultCount: 1, ingredients: { tao: 1 },              desc: 'Tao → Yang (Licht)' },
    { name: 'Qi',       result: 'qi',    resultCount: 1, ingredients: { yin: 1, yang: 1 },     desc: 'Dunkel + Hell = Energie!' },
    // Stufe 3→5: Qi wird zu den 5 Elementen
    { name: 'Metall',   result: 'metal', resultCount: 2, ingredients: { qi: 1, yin: 1 },       desc: 'Energie + Dunkelheit = 2 Metall' },
    { name: 'Holz',     result: 'wood',  resultCount: 2, ingredients: { qi: 1, yang: 1 },      desc: 'Energie + Licht = 2 Holz' },
    { name: 'Feuer',    result: 'fire',  resultCount: 2, ingredients: { yang: 2 },              desc: '2 Licht = 2 Feuer!' },
    { name: 'Wasser',   result: 'water', resultCount: 2, ingredients: { yin: 2 },               desc: '2 Dunkelheit = 2 Wasser' },
    { name: 'Erde',     result: 'earth', resultCount: 2, ingredients: { yin: 1, yang: 1, qi: 1 }, desc: 'Dunkel + Hell + Energie = 2 Erde' },
    // === GENERATION 2 — Charm & Strange (Blitz = Teilchenbeschleuniger) ===
    { name: 'Charm',       result: 'charm',      resultCount: 1, ingredients: { yang: 1, qi: 1, lightning: 1 },  desc: 'Yang + Qi + Blitz = Charm-Quark (schweres Licht, beschleunigt!)' },
    { name: 'Strange',     result: 'strange',     resultCount: 1, ingredients: { yin: 1, qi: 1, lightning: 1 },   desc: 'Yin + Qi + Blitz = Strange-Quark (schwere Dunkelheit, beschleunigt!)' },
    { name: 'Antimaterie', result: 'antimatter',  resultCount: 1, ingredients: { charm: 1, strange: 1 },         desc: 'Charm + Strange = Antimaterie (gebundene Gegensätze!)' },
    // === LEPTONEN — ohne Qi! (Leptonen spüren keine starke Kernkraft) ===
    { name: 'Elektron',    result: 'electron', resultCount: 1, ingredients: { lightning: 1, metal: 1 },      desc: 'Blitz + Metall = Elektron (Strom ist Elektronenfluss!)' },
    { name: 'Myon',        result: 'muon',     resultCount: 1, ingredients: { electron: 1, star: 1 },        desc: 'Elektron + Stern = Myon (kosmische Strahlung!)' },
    { name: 'Tau',         result: 'tau',      resultCount: 1, ingredients: { electron: 1, antimatter: 1 },  desc: 'Elektron + Antimaterie = Tau (schwerstes Lepton!)' },
    // Stufe 5→10.000: Der Kreislauf der 5 Elemente
    // Holz nährt Feuer (Holz brennt)
    { name: 'Glut',     result: 'fire',  resultCount: 3, ingredients: { wood: 2, fire: 1 }, desc: 'Holz brennt! 2 Holz + Feuer = 3 Feuer' },
    // Feuer erzeugt Erde (Asche wird Boden)
    { name: 'Asche',    result: 'earth', resultCount: 3, ingredients: { fire: 2, earth: 1 }, desc: 'Asche wird Erde! 2 Feuer + Erde = 3 Erde' },
    // Erde birgt Metall (Erz im Boden)
    { name: 'Erz',      result: 'metal', resultCount: 3, ingredients: { earth: 2, metal: 1 }, desc: 'Erz im Boden! 2 Erde + Metall = 3 Metall' },
    // Metall sammelt Wasser (Kondensation)
    { name: 'Tau',      result: 'water', resultCount: 3, ingredients: { metal: 2, water: 1 }, desc: 'Tropfen am Metall! 2 Metall + Wasser = 3 Wasser' },
    // Wasser nährt Holz (Baum trinkt)
    { name: 'Trieb',    result: 'wood',  resultCount: 3, ingredients: { water: 2, wood: 1 }, desc: 'Bäume trinken! 2 Wasser + Holz = 3 Holz' },
    { name: 'Stein',    result: 'stone',      resultCount: 2, ingredients: { earth: 2, fire: 1 },  desc: '2 Erde + Feuer = 2 Stein' },
    { name: 'Sand',     result: 'sand',       resultCount: 2, ingredients: { earth: 1, water: 1 }, desc: 'Erde + Wasser = 2 Sand' },
    { name: 'Bretter',  result: 'planks',     resultCount: 3, ingredients: { wood: 2 },            desc: '2 Holz = 3 Bretter' },
    { name: 'Setzling', result: 'sapling',    resultCount: 1, ingredients: { wood: 1, water: 1 },  desc: 'Holz + Wasser = Setzling' },
    { name: 'Pflanze',  result: 'plant',      resultCount: 2, ingredients: { earth: 1, wood: 1 },  desc: 'Erde + Holz = 2 Pflanzen' },
    { name: 'Blume',    result: 'flower',     resultCount: 2, ingredients: { plant: 1, fire: 1 },  desc: 'Pflanze + Feuer = 2 Blumen' },
    { name: 'Pilz',     result: 'mushroom',   resultCount: 2, ingredients: { earth: 1, water: 1, wood: 1 }, desc: 'Erde + Wasser + Holz = 2 Pilze' },
    // Stufe 2: Aus Stufe-1-Artefakten
    { name: 'Glas',     result: 'glass',      resultCount: 1, ingredients: { sand: 1, fire: 1 },   desc: 'Sand + Feuer = Glas' },
    { name: 'Lampe',    result: 'lamp',       resultCount: 1, ingredients: { glass: 1, fire: 1 },  desc: 'Glas + Feuer = Lampe' },
    { name: 'Fenster',  result: 'window_pane', resultCount: 1, ingredients: { glass: 1, wood: 1 }, desc: 'Glas + Holz = Fenster' },
    { name: 'Tür',      result: 'door',       resultCount: 1, ingredients: { planks: 2 },          desc: '2 Bretter = Tür' },
    { name: 'Zaun',     result: 'fence',      resultCount: 2, ingredients: { planks: 1, wood: 1 }, desc: 'Bretter + Holz = 2 Zäune' },
    { name: 'Weg',      result: 'path',       resultCount: 3, ingredients: { sand: 1, stone: 1 },  desc: 'Sand + Stein = 3 Wege' },
    { name: 'Dach',     result: 'roof',       resultCount: 2, ingredients: { planks: 1, stone: 1 },desc: 'Bretter + Stein = 2 Dächer' },
    { name: 'Flagge',   result: 'flag',       resultCount: 1, ingredients: { wood: 1, fire: 1 },   desc: 'Holz + Feuer = Flagge' },
    { name: 'Boot',     result: 'boat',       resultCount: 1, ingredients: { planks: 2, metal: 1 },desc: '2 Bretter + Metall = Boot' },
    { name: 'Seil',     result: 'rope',       resultCount: 2, ingredients: { plant: 2 },           desc: '2 Pflanzen = 2 Seil' },
    { name: 'Segel',    result: 'sail',       resultCount: 1, ingredients: { planks: 1, rope: 1 }, desc: 'Bretter + Seil = Segel' },
    { name: 'Segelboot',result: 'sailboat',   resultCount: 1, ingredients: { boat: 1, sail: 1 },   desc: 'Boot + Segel = Segelboot ⛵🏝️' },
    { name: 'Fisch',    result: 'fish',       resultCount: 2, ingredients: { water: 2, wood: 1 },  desc: '2 Wasser + Holz = 2 Fische' },
    { name: 'Brunnen',  result: 'fountain',   resultCount: 1, ingredients: { stone: 3, water: 1 }, desc: '3 Stein + Wasser = Brunnen' },
    { name: 'Brücke',   result: 'bridge',     resultCount: 1, ingredients: { planks: 2, metal: 1 },desc: '2 Bretter + Metall = Brücke' },
    // === NATUR & WETTER (Feynman-approved) ===
    { name: 'Dampf',       result: 'steam',     resultCount: 1, ingredients: { water: 1, fire: 1 },    desc: 'Wasser + Feuer = Dampf' },
    { name: 'Eis',         result: 'ice',       resultCount: 1, ingredients: { water: 2, metal: 1 },   desc: '2 Wasser + Metall = Eis' },
    { name: 'Schnee',      result: 'snow',      resultCount: 1, ingredients: { ice: 1, cloud: 1 },     desc: 'Eis + Wolke = Schnee' },
    { name: 'Wolke',       result: 'cloud',     resultCount: 1, ingredients: { steam: 2 },             desc: '2 Dampf = Wolke' },
    { name: 'Regen',       result: 'rain',      resultCount: 1, ingredients: { cloud: 1, water: 1 },   desc: 'Wolke + Wasser = Regen' },
    { name: 'Regenbogen',  result: 'rainbow',   resultCount: 1, ingredients: { rain: 1, fire: 1 },     desc: 'Regen + Feuer = Regenbogen' },
    { name: 'Blitz',       result: 'lightning',  resultCount: 1, ingredients: { cloud: 1, metal: 1 },  desc: 'Wolke + Metall = Blitz' },
    { name: 'Tornado',     result: 'tornado',   resultCount: 1, ingredients: { cloud: 2, fire: 1 },    desc: '2 Wolken + Feuer = Tornado' },
    { name: 'Vulkan',      result: 'volcano',   resultCount: 1, ingredients: { mountain: 1, fire: 2 }, desc: 'Berg + 2 Feuer = Vulkan' },
    { name: 'Berg',        result: 'mountain',  resultCount: 1, ingredients: { stone: 3, earth: 2 },   desc: '3 Stein + 2 Erde = Berg' },
    { name: 'Sonne',       result: 'sun',       resultCount: 1, ingredients: { fire: 3 },              desc: '3 Feuer = Sonne' },
    { name: 'Mond',        result: 'moon',      resultCount: 1, ingredients: { stone: 2, fire: 1 },    desc: '2 Stein + Feuer = Mond' },
    { name: 'Stern',       result: 'star',      resultCount: 1, ingredients: { sun: 1, metal: 1 },     desc: 'Sonne + Metall = Stern' },
    // === LEBEN (absurd aber logisch) ===
    { name: 'Ei',          result: 'egg',       resultCount: 1, ingredients: { earth: 1, fire: 1, water: 1 }, desc: 'Erde + Feuer + Wasser = Ei' },
    { name: 'Nest',        result: 'nest',      resultCount: 1, ingredients: { wood: 2, plant: 1 },    desc: '2 Holz + Pflanze = Nest' },
    { name: 'Schmetterling', result: 'butterfly', resultCount: 1, ingredients: { flower: 1, cloud: 1 },desc: 'Blume + Wolke = Schmetterling' },
    { name: 'Biene',       result: 'bee',       resultCount: 1, ingredients: { flower: 2, sun: 1 },    desc: '2 Blumen + Sonne = Biene' },
    { name: 'Honig',       result: 'honey',     resultCount: 1, ingredients: { bee: 1, flower: 1 },    desc: 'Biene + Blume = Honig' },
    { name: 'Apfel',       result: 'apple',     resultCount: 2, ingredients: { tree: 1, sun: 1 },      desc: 'Baum + Sonne = 2 Äpfel' },
    { name: 'Kuchen',      result: 'cake',      resultCount: 1, ingredients: { apple: 1, honey: 1, fire: 1 }, desc: 'Apfel + Honig + Feuer = Kuchen' },
    // === MAGIE (absurd und wunderbar) ===
    { name: 'Trank',       result: 'potion',    resultCount: 1, ingredients: { mushroom: 1, water: 1, fire: 1 }, desc: 'Pilz + Wasser + Feuer = Trank' },
    { name: 'Kristall',    result: 'crystal',   resultCount: 1, ingredients: { diamond: 1, potion: 1 },desc: 'Diamant + Trank = Kristall' },
    { name: 'Diamant',     result: 'diamond',   resultCount: 1, ingredients: { stone: 3, fire: 3 },    desc: '3 Stein + 3 Feuer = Diamant' },
    { name: 'Drache',      result: 'dragon',    resultCount: 1, ingredients: { fire: 3, egg: 1 },      desc: '3 Feuer + Ei = Drache' },
    { name: 'Einhorn',     result: 'unicorn',   resultCount: 1, ingredients: { rainbow: 1, potion: 1 },desc: 'Regenbogen + Trank = Einhorn' },
    { name: 'Phönix',      result: 'phoenix',   resultCount: 1, ingredients: { fire: 2, egg: 1, star: 1 }, desc: '2 Feuer + Ei + Stern = Phönix' },
    // === DINGE & ABENTEUER ===
    { name: 'Schwert',     result: 'sword',     resultCount: 1, ingredients: { metal: 2, fire: 1 },    desc: '2 Metall + Feuer = Schwert' },
    { name: 'Schild',      result: 'shield',    resultCount: 1, ingredients: { metal: 2, wood: 1 },    desc: '2 Metall + Holz = Schild' },
    { name: 'Krone',       result: 'crown',     resultCount: 1, ingredients: { metal: 1, diamond: 1 }, desc: 'Metall + Diamant = Krone' },
    { name: 'Schlüssel',   result: 'key',       resultCount: 1, ingredients: { metal: 1, fire: 1 },    desc: 'Metall + Feuer = Schlüssel' },
    { name: 'Schatz',      result: 'treasure',  resultCount: 1, ingredients: { key: 1, earth: 2 },     desc: 'Schlüssel + 2 Erde = Schatz' },
    // === HANDEL (Mr. Krabs — Muschelwährung) ===
    { name: 'Muschel',     result: 'shell',  resultCount: 2, ingredients: { sand: 2, water: 1 },  desc: '2 Sand + Wasser = 2 Muscheln (Strandgut!)' },
    // === ABSURD (💩🚀👻👽🤖) ===
    { name: 'Geist',       result: 'ghost',     resultCount: 1, ingredients: { cloud: 1, moon: 1 },    desc: 'Wolke + Mond = Geist' },
    { name: 'Skelett',     result: 'skull',     resultCount: 1, ingredients: { stone: 2, lightning: 1 },desc: '2 Stein + Blitz = Skelett' },
    { name: 'Haufen',      result: 'poop',      resultCount: 1, ingredients: { earth: 2, water: 2 },   desc: '2 Erde + 2 Wasser = ...du weißt schon' },
    { name: 'Rakete',      result: 'rocket',    resultCount: 1, ingredients: { metal: 2, fire: 2 },    desc: '2 Metall + 2 Feuer = Rakete' },
    { name: 'UFO',         result: 'ufo',       resultCount: 1, ingredients: { rocket: 1, star: 1 },   desc: 'Rakete + Stern = UFO' },
    { name: 'Alien',       result: 'alien',     resultCount: 1, ingredients: { ufo: 1, egg: 1 },       desc: 'UFO + Ei = Alien' },
    { name: 'Roboter',     result: 'robot',     resultCount: 1, ingredients: { metal: 3, lightning: 1 },desc: '3 Metall + Blitz = Roboter' },
    { name: 'Musik',       result: 'music',     resultCount: 1, ingredients: { wood: 1, metal: 1, wind: 1 }, desc: 'Holz + Metall + Wind = Musik' },
    { name: 'Herz',        result: 'heart',     resultCount: 1, ingredients: { fire: 1, water: 1, flower: 1 }, desc: 'Feuer + Wasser + Blume = Herz' },
    // === UNSINN (Lindgren: "Kinder sind nicht logisch. Sie sind besser als das.") ===
    { name: 'Regenwurm',   result: 'worm',      resultCount: 3, ingredients: { earth: 1, rain: 1 },       desc: 'Erde + Regen = 3 Regenwürmer' },
    { name: 'Flugfisch',   result: 'flyfish',   resultCount: 1, ingredients: { fish: 1, cloud: 1 },       desc: 'Fisch + Wolke = Flugfisch (klar!)' },
    { name: 'Katzengold',  result: 'catgold',   resultCount: 1, ingredients: { sand: 1, sun: 1, poop: 1 },desc: 'Sand + Sonne + 💩 = Katzengold' },
    { name: 'Eierkuchen',  result: 'pancake',   resultCount: 2, ingredients: { egg: 1, fire: 1, earth: 1 }, desc: 'Ei + Feuer + Erde = 2 Eierkuchen (Pippi würde 3 backen)' },
    { name: 'Luftschloss', result: 'aircastle', resultCount: 1, ingredients: { cloud: 2, crown: 1 },      desc: '2 Wolken + Krone = Luftschloss (natürlich!)' },
    // === HÖHLEN & EDELSTEINE ===
    { name: 'Höhle',       result: 'cave',       resultCount: 1, ingredients: { mountain: 1, water: 1 },    desc: 'Berg + Wasser = Höhle' },
    { name: 'Tropfstein',  result: 'stalactite',  resultCount: 1, ingredients: { cave: 1, water: 1 },       desc: 'Höhle + Wasser = Tropfstein' },
    { name: 'Edelstein',   result: 'gem',         resultCount: 1, ingredients: { stalactite: 1, fire: 1 },  desc: 'Tropfstein + Feuer = Edelstein' },
    // === NOCH MEHR UNSINN (Backlog #58 — Lindgren: "unlogisch aber wunderbar") ===
    { name: 'Feuerkuchen',    result: 'firecake',    resultCount: 1, ingredients: { fire: 1, pancake: 1 },     desc: 'Feuer + Eierkuchen = Feuerkuchen (schmeckt nach Abenteuer!)' },
    { name: 'Drachentorte',   result: 'dragoncake',  resultCount: 1, ingredients: { dragon: 1, cake: 1 },      desc: 'Drache + Kuchen = Drachentorte (vorsicht, heiß!)' },
    { name: 'Geisterschiff',  result: 'ghostship',   resultCount: 1, ingredients: { ghost: 1, boat: 1 },       desc: 'Geist + Boot = Geisterschiff (es fährt bei Vollmond!)' },
    { name: 'Mondkäse',       result: 'mooncheese',  resultCount: 2, ingredients: { moon: 1, fire: 1, earth: 1 }, desc: 'Mond + Feuer + Erde = 2 Mondkäse (natürlich ist der Mond aus Käse!)' },
    { name: 'Schneedrache',   result: 'snowdragon',  resultCount: 1, ingredients: { dragon: 1, snow: 1 },      desc: 'Drache + Schnee = Schneedrache (spuckt Schneeflocken statt Feuer!)' },
    { name: 'Wurmloch',       result: 'wormhole',    resultCount: 1, ingredients: { worm: 1, star: 1 },        desc: 'Regenwurm + Stern = Wurmloch (Einstein hätte gelacht!)' },
    { name: 'Bienenstich',    result: 'beesting',    resultCount: 2, ingredients: { bee: 1, cake: 1 },         desc: 'Biene + Kuchen = 2 Bienenstich (der Kuchen, nicht der Stich!)' },
    { name: 'Fischstäbchen',  result: 'fishstick',   resultCount: 3, ingredients: { fish: 1, planks: 1 },      desc: 'Fisch + Bretter = 3 Fischstäbchen (Käpt\'n Iglo nickt.)' },
    { name: 'Sternschnuppe',  result: 'shootingstar', resultCount: 1, ingredients: { star: 1, fire: 1 },       desc: 'Stern + Feuer = Sternschnuppe (schnell wünschen!)' },
    { name: 'Donnerwetter',   result: 'thunderweather', resultCount: 1, ingredients: { lightning: 1, rain: 1, poop: 1 }, desc: 'Blitz + Regen + 💩 = Donnerwetter (im wahrsten Sinne!)' },
    // === BIBLIOTHEK VON ALEXANDRIA ===
    { name: 'Schriftrolle', result: 'scroll',  resultCount: 1, ingredients: { wood: 1, water: 1, fire: 1 }, desc: 'Holz + Wasser + Feuer = Schriftrolle (Papyrus!)' },
    { name: 'Bibliothek', result: 'library',   resultCount: 1, ingredients: { stone: 3, scroll: 3, crown: 1 }, desc: '3 Stein + 3 Schriftrollen + Krone = Bibliothek von Alexandria' },
    // === DINOSAURIER-PFAD (S30-3 — Oscar entdeckt die Urzeit) ===
    { name: 'Fossil',       result: 'fossil',  resultCount: 1, ingredients: { cave: 1, stone: 1 },           desc: 'Höhle + Stein = Fossil (Knochenfund in der Höhle!)' },
    { name: 'Meteorit',     result: 'meteor',  resultCount: 1, ingredients: { star: 1, stone: 1 },           desc: 'Stern + Stein = Meteorit (Stein vom Himmel!)' },
    { name: 'Dinosaurier',  result: 'dino',    resultCount: 1, ingredients: { fossil: 1, fire: 1 },          desc: 'Fossil + Feuer = Dinosaurier (Jurassic Park lässt grüßen!)' },
    { name: 'T-Rex',        result: 'trex',    resultCount: 1, ingredients: { dino: 1, earth: 1 },           desc: 'Dinosaurier + Erde = T-Rex (König der Urzeit!)' },
    { name: 'Massenaussterben', result: 'fossil', resultCount: 3, ingredients: { trex: 1, meteor: 1 },       desc: 'T-Rex + Meteorit = 3 Fossilien (66 Millionen Jahre her — und doch hier!)' },
    // === WELTRAUM-PFAD (S32-2 — Oscar erkundet den Weltraum) ===
    // rocket/moon/alien hatten schon Rezepte — Mars ist das neue Glied im Weltraum-Pfad
    { name: 'Mars',  result: 'mars', resultCount: 1, ingredients: { moon: 1, ice: 1 }, desc: 'Mond + Eis = Mars (Der rote Planet ist eisig kalt — und der nächste Schritt nach dem Mond!)' },
    { name: 'Marslandung', result: 'alien', resultCount: 1, ingredients: { mars: 1, rocket: 1 }, desc: 'Mars + Rakete = Alien (Eine Rakete auf dem Mars — und plötzlich: Besuch!)' },

    // === HAUPTGRUPPEN-ELEMENTE — echte Chemie zum Anfassen ===
    // Direkte Rezepte für Z ≤ 20: Z·Proton + N·Neutron + Z·Elektron → Element
    // Ladungs-Summe immer 0. Massen-Summe = atomicMass = Z+N (Periodensystem).
    // Mendelejew würde nicken.
    { name: 'Wasserstoff', result: 'hydrogen',   resultCount: 1, ingredients: { proton: 1, electron: 1 },                   desc: '1 Proton + 1 Elektron = Wasserstoff (H, Z=1, A=1) — das leichteste Atom!' },
    { name: 'Helium',      result: 'helium',     resultCount: 1, ingredients: { proton: 2, neutron: 2, electron: 2 },       desc: '2p + 2n + 2e = Helium (He, Z=2, A=4) — Luftballon-Gas!' },
    { name: 'Lithium',     result: 'lithium',    resultCount: 1, ingredients: { proton: 3, neutron: 4, electron: 3 },       desc: '3p + 4n + 3e = Lithium (Li, Z=3, A=7) — Akku-Metall!' },
    { name: 'Beryllium',   result: 'beryllium',  resultCount: 1, ingredients: { proton: 4, neutron: 5, electron: 4 },       desc: '4p + 5n + 4e = Beryllium (Be, Z=4, A=9) — hart wie Stahl!' },
    { name: 'Bor',         result: 'boron',      resultCount: 1, ingredients: { proton: 5, neutron: 6, electron: 5 },       desc: '5p + 6n + 5e = Bor (B, Z=5, A=11) — steckt in Seife!' },
    { name: 'Kohlenstoff', result: 'carbon',     resultCount: 1, ingredients: { proton: 6, neutron: 6, electron: 6 },       desc: '6p + 6n + 6e = Kohlenstoff (C, Z=6, A=12) — das Element des Lebens!' },
    { name: 'Stickstoff',  result: 'nitrogen',   resultCount: 1, ingredients: { proton: 7, neutron: 7, electron: 7 },       desc: '7p + 7n + 7e = Stickstoff (N, Z=7, A=14) — 78% der Luft!' },
    { name: 'Sauerstoff',  result: 'oxygen',     resultCount: 1, ingredients: { proton: 8, neutron: 8, electron: 8 },       desc: '8p + 8n + 8e = Sauerstoff (O, Z=8, A=16) — zum Atmen!' },
    { name: 'Fluor',       result: 'fluorine',   resultCount: 1, ingredients: { proton: 9, neutron: 10, electron: 9 },      desc: '9p + 10n + 9e = Fluor (F, Z=9, A=19) — macht Zähne hart!' },
    { name: 'Neon',        result: 'neon',       resultCount: 1, ingredients: { proton: 10, neutron: 10, electron: 10 },    desc: '10p + 10n + 10e = Neon (Ne, Z=10, A=20) — leuchtet rot!' },
    { name: 'Natrium',     result: 'sodium',     resultCount: 1, ingredients: { proton: 11, neutron: 12, electron: 11 },    desc: '11p + 12n + 11e = Natrium (Na, Z=11, A=23) — im Kochsalz!' },
    { name: 'Magnesium',   result: 'magnesium',  resultCount: 1, ingredients: { proton: 12, neutron: 12, electron: 12 },    desc: '12p + 12n + 12e = Magnesium (Mg, Z=12, A=24) — brennt weiß und hell!' },
    { name: 'Aluminium',   result: 'aluminum',   resultCount: 1, ingredients: { proton: 13, neutron: 14, electron: 13 },    desc: '13p + 14n + 13e = Aluminium (Al, Z=13, A=27) — Dosen-Metall!' },
    { name: 'Silizium',    result: 'silicon',    resultCount: 1, ingredients: { proton: 14, neutron: 14, electron: 14 },    desc: '14p + 14n + 14e = Silizium (Si, Z=14, A=28) — in jedem Computer-Chip!' },
    { name: 'Phosphor',    result: 'phosphorus', resultCount: 1, ingredients: { proton: 15, neutron: 16, electron: 15 },    desc: '15p + 16n + 15e = Phosphor (P, Z=15, A=31) — leuchtet im Dunkeln!' },
    { name: 'Schwefel',    result: 'sulfur',     resultCount: 1, ingredients: { proton: 16, neutron: 16, electron: 16 },    desc: '16p + 16n + 16e = Schwefel (S, Z=16, A=32) — knallgelb und stinkig!' },
    { name: 'Chlor',       result: 'chlorine',   resultCount: 1, ingredients: { proton: 17, neutron: 18, electron: 17 },    desc: '17p + 18n + 17e = Chlor (Cl, Z=17, A=35) — im Schwimmbad!' },
    { name: 'Argon',       result: 'argon',      resultCount: 1, ingredients: { proton: 18, neutron: 22, electron: 18 },    desc: '18p + 22n + 18e = Argon (Ar, Z=18, A=40) — 1% der Luft, reagiert mit niemandem!' },
    { name: 'Kalium',      result: 'potassium',  resultCount: 1, ingredients: { proton: 19, neutron: 20, electron: 19 },    desc: '19p + 20n + 19e = Kalium (K, Z=19, A=39) — in Bananen!' },
    { name: 'Calcium',     result: 'calcium',    resultCount: 1, ingredients: { proton: 20, neutron: 20, electron: 20 },    desc: '20p + 20n + 20e = Calcium (Ca, Z=20, A=40) — macht Knochen stark!' },

    // Z > 20: Fusion-Kette — jedes Element braucht den Vorgänger als Basis.
    // Formel: neuesElement = vorherigesElement + Δp·proton + Δn·neutron + Δp·electron.
    // Ladungssumme: (Vorgänger=0) + Δp·1 + Δn·0 + Δp·(-1) = 0 ✓
    // Massensumme: (Vorgänger.A) + Δp·1 + Δn·1 + Δp·0 = A(neu) ✓
    { name: 'Gallium',    result: 'gallium',    resultCount: 1, ingredients: { calcium: 1,   proton: 11, neutron: 19, electron: 11 }, desc: 'Calcium + 11p + 19n + 11e = Gallium (Ga, Z=31, A=70) — schmilzt in der Hand!' },
    { name: 'Brom',       result: 'bromine',    resultCount: 1, ingredients: { gallium: 1,   proton: 4,  neutron: 6,  electron: 4  }, desc: 'Gallium + 4p + 6n + 4e = Brom (Br, Z=35, A=80) — eine der wenigen Flüssigkeiten unter den Elementen!' },
    { name: 'Krypton',    result: 'krypton',    resultCount: 1, ingredients: { bromine: 1,   proton: 1,  neutron: 3,  electron: 1  }, desc: 'Brom + 1p + 3n + 1e = Krypton (Kr, Z=36, A=84) — Supermans Schwäche!' },
    { name: 'Rubidium',   result: 'rubidium',   resultCount: 1, ingredients: { krypton: 1,   proton: 1,  neutron: 0,  electron: 1  }, desc: 'Krypton + 1p + 1e = Rubidium (Rb, Z=37, A=85) — reagiert heftig mit Wasser!' },
    { name: 'Strontium',  result: 'strontium',  resultCount: 1, ingredients: { rubidium: 1,  proton: 1,  neutron: 2,  electron: 1  }, desc: 'Rubidium + 1p + 2n + 1e = Strontium (Sr, Z=38, A=88) — rote Feuerwerksfarbe!' },
    { name: 'Zinn',       result: 'tin',        resultCount: 1, ingredients: { strontium: 1, proton: 12, neutron: 20, electron: 12 }, desc: 'Strontium + 12p + 20n + 12e = Zinn (Sn, Z=50, A=120) — Bronze-Zutat!' },
    { name: 'Jod',        result: 'iodine',     resultCount: 1, ingredients: { tin: 1,       proton: 3,  neutron: 4,  electron: 3  }, desc: 'Zinn + 3p + 4n + 3e = Jod (I, Z=53, A=127) — die lila Tinktur beim Arzt!' },
    { name: 'Xenon',      result: 'xenon',      resultCount: 1, ingredients: { iodine: 1,    proton: 1,  neutron: 4,  electron: 1  }, desc: 'Jod + 1p + 4n + 1e = Xenon (Xe, Z=54, A=132) — Auto-Scheinwerfer-Gas!' },
    { name: 'Caesium',    result: 'cesium',     resultCount: 1, ingredients: { xenon: 1,     proton: 1,  neutron: 0,  electron: 1  }, desc: 'Xenon + 1p + 1e = Caesium (Cs, Z=55, A=133) — tickt 9.192.631.770-mal pro Sekunde (Atomuhr)!' },
    { name: 'Barium',     result: 'barium',     resultCount: 1, ingredients: { cesium: 1,    proton: 1,  neutron: 4,  electron: 1  }, desc: 'Caesium + 1p + 4n + 1e = Barium (Ba, Z=56, A=138) — Röntgen-Kontrastmittel!' },
    { name: 'Radon',      result: 'radon',      resultCount: 1, ingredients: { barium: 1,    proton: 30, neutron: 54, electron: 30 }, desc: 'Barium + 30p + 54n + 30e = Radon (Rn, Z=86, A=222) — radioaktives Edelgas, legendär selten!' },
];
