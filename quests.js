// === QUESTS — Quest-Templates ===
// Exportiert als window.INSEL_QUEST_TEMPLATES (Vanilla JS, kein Build-Tool)

window.INSEL_QUEST_TEMPLATES = [
    { npc: 'spongebob', title: 'Burger-Stand', desc: 'ICH BIN BEREIT einen Burger-Stand zu bauen! Der Professor will wiederkommen!', needs: { wood: 4, roof: 2, door: 1 }, reward: '⭐⭐' },
    { npc: 'spongebob', title: 'Krabbenburger-Küche', desc: 'Die Küche muss GLÄNZEN! Glas für die Fenster damit man die Burger sieht!', needs: { stone: 6, lamp: 2, glass: 2 }, reward: '⭐⭐⭐' },
    { npc: 'krabs', title: 'Handelshafen', desc: 'Boote = Kunden = GELD! Darwin sagt: wer keinen Hafen hat, stirbt aus!', needs: { wood: 6, water: 4, boat: 2 }, reward: '💰💰' },
    { npc: 'krabs', title: 'Schatzkammer', desc: 'Meine Tokens brauchen ein ZUHAUSE! Stein! Dick! Sicher!', needs: { stone: 8, door: 2, lamp: 1 }, reward: '💰💰💰' },
    { npc: 'elefant', title: 'Musik-Garten', desc: 'Törööö! Blumen die man hört! Also... die man SIEHT. Aber ich höre sie trotzdem!', needs: { flower: 5, tree: 3, path: 4 }, reward: '🎵🎵' },
    { npc: 'elefant', title: 'Musik-Turm', desc: 'Ein Turm so hoch dass mein Törööö die ganze Insel erreicht! Der Weber hätte Baupläne gemacht. Ich mach einfach!', needs: { stone: 8, glass: 4, lamp: 3 }, reward: '🎵🎵🎵' },
    { npc: 'tommy', title: 'Boot-Parkplatz', desc: 'Klick-klack! DREI Boote! MINDESTENS! Das ist WISSENSCHAFT! Der lockige Mann hat gesagt!', needs: { water: 6, boat: 3, bridge: 1 }, reward: '⚓⚓' },
    { npc: 'neinhorn', title: 'Geheimversteck', desc: 'NEIN ich will kein Versteck! ...ok doch. Aber mit Pilzen! Die sind gruselig-schön!', needs: { fence: 4, tree: 4, mushroom: 2 }, reward: '🌈🌈' },
    { npc: 'neinhorn', title: 'Regenbogen-Turm', desc: 'NEIN kein Turm! ...gut EINEN Turm. Aber mit Flaggen! Der Nein-Sager-Chef wäre neidisch!', needs: { glass: 6, flower: 4, flag: 2, lamp: 2 }, reward: '🌈🌈🌈' },
    { npc: 'maus', title: 'Blumen-Wiese', desc: '*pieps* Die Maus will Blumen! *quak* Die Ente will einen Brunnen! Weniger ist mehr! Das hat DIE ENTE erfunden!', needs: { flower: 8, plant: 4, fountain: 1 }, reward: '🌻🌻' },
    { npc: 'maus', title: 'Enten-Teich', desc: '*quak quak!* WASSER! FISCHE! *pieps* Und eine Brücke damit die Maus trockene Füße behält!', needs: { water: 8, fish: 3, bridge: 1, plant: 3 }, reward: '🦆🦆🦆' },
    // Runde 2: Schwerer, mehr Material, kreativere Kombos
    { npc: 'spongebob', title: 'Strandpromenade', desc: 'Suchergebnis: 0 Promenaden gefunden! Das muss sich SOFORT ändern!', needs: { path: 8, lamp: 4, flower: 3, fence: 2 }, reward: '⭐⭐⭐⭐' },
    { npc: 'krabs', title: 'Fischmarkt', desc: 'Fische fangen sich nicht von allein, Junge! Das sind mindestens 500 Krabben-Taler Umsatz!', needs: { fish: 5, wood: 4, roof: 2, water: 4 }, reward: '💰💰💰💰' },
    { npc: 'elefant', title: 'Botanischer Garten', desc: 'Törööö... stell dir vor: jede Pflanze hat ihre eigene Melodie... Törööö!', needs: { plant: 6, flower: 6, tree: 4, path: 6, fountain: 1 }, reward: '🎵🎵🎵🎵' },
    { npc: 'tommy', title: 'Leuchtturm', desc: 'Klick-klack! Ein — klick-klack! — RIESIGER Turm! Damit die Boote uns — klick-klack! — FINDEN!', needs: { stone: 6, glass: 4, lamp: 4, flag: 1 }, reward: '⚓⚓⚓' },
    { npc: 'neinhorn', title: 'Labyrinth', desc: 'NEIN kein Labyrinth! ...ok aber eins wo man sich WIRKLICH verläuft! Mon Dieu!', needs: { fence: 12, mushroom: 3, lamp: 2 }, reward: '🌈🌈🌈🌈' },
    { npc: 'maus', title: 'Spielplatz', desc: '*pieps* Sand zum Buddeln! *quak* Und Wasser zum Plantschen! *pieps* Weniger ist — *quak* MEHR WASSER!', needs: { sand: 6, water: 4, fence: 4, tree: 2 }, reward: '🌻🌻🌻' },
    // Runde 3: Gemeinschafts-Quests (beliebiger NPC)
    { npc: 'spongebob', title: 'Insel-Fest', desc: 'PARTY! Suchergebnis: Noch keine Party gefunden! Flaggen, Lampen, ALLES!', needs: { flag: 4, lamp: 6, flower: 4, path: 4 }, reward: '🎉🎉🎉' },
    { npc: 'tommy', title: 'Hafen-Erweiterung', desc: 'Klick-klack! FÜNF Boote! Der lockige Mann hat — klick-klack! — gesagt mehr ist besser!', needs: { boat: 5, water: 8, bridge: 2, wood: 4 }, reward: '⚓⚓⚓⚓' },
    { npc: 'krabs', title: 'Luxus-Resort', desc: 'Glasdächer! Springbrunnen! Das kostet... [RECHNET LAUT] ...2000 Krabben-Taler Bau, 10000 Taler Gewinn!', needs: { glass: 8, fountain: 2, flower: 6, lamp: 4, door: 3 }, reward: '💎💎💎' },
    // Runde 4: Magie & Abenteuer
    { npc: 'neinhorn', title: 'Einhorn-Schrein', desc: 'NEIN ich glaube nicht an Einhörner! ...ich glaube VOLL daran. Bau mir einen Schrein! MIT Regenbogen!', needs: { rainbow: 1, unicorn: 1, flower: 4, crystal: 1 }, reward: '🌈🌈🌈🌈🌈' },
    { npc: 'elefant', title: 'Drachen-Nester', desc: 'Törööö! Stell dir vor der Drache singt in D-Moll! Ich muss ein Nest bauen bevor er sich ein Haus kauft!', needs: { dragon: 1, egg: 2, fire: 3, nest: 2 }, reward: '🎵🎵🎵🎵🎵' },
    { npc: 'tommy', title: 'Ritter-Festung', desc: 'Klick-klack! SCHWERT! SCHILD! KRONE! Der lockige Mann sagt Ritter brauchen — klick-klack! — FESTUNGEN!', needs: { sword: 1, shield: 1, crown: 1, stone: 6 }, reward: '⚓⚓⚓⚓⚓' },
    { npc: 'maus', title: 'Schatzkammer', desc: '*pieps* Schlüssel gefunden! *quak* Schatz auch! *pieps* Aber wo soll der Schatz HIN?! *quak* KAMMER!', needs: { key: 2, treasure: 2, stone: 8, door: 2 }, reward: '🌻🌻🌻🌻' },
    // Runde 5: Wetter & Naturphänomene
    { npc: 'spongebob', title: 'Sternwarte', desc: 'Suchergebnis: SONNE! MOND! STERNE! Alles davon! Eine Sternwarte bitte! Sofort! Suchergebnis: kein Warten!', needs: { sun: 1, moon: 1, star: 2, glass: 4, stone: 6 }, reward: '⭐⭐⭐⭐⭐' },
    { npc: 'krabs', title: 'Regenbogen-Brücke', desc: 'Darwin hat bewiesen: Regenbogen-Brücken bringen MEHR Kunden! Das ist Evolution UND Geschäft!', needs: { rainbow: 2, bridge: 2, crystal: 1, glass: 3 }, reward: '💰💰💰💰💰' },
    { npc: 'tommy', title: 'Vulkan-Observatorium', desc: 'Klick-klack! VULKAN! Der lockige Mann — klick-klack! — sagt Vulkane sind — klick-klack! — COOL! BEOBACHTEN!', needs: { volcano: 1, mountain: 2, stone: 8, glass: 3 }, reward: '⚓⚓⚓⚓' },
    { npc: 'tommy', title: 'Wetterstation', desc: 'Klick-klack! Der lockige Mann sagt — klick-klack! — Blitz macht STROM! Ich brauche eine Messstation!', needs: { cloud: 3, lightning: 2, glass: 4, lamp: 2 }, reward: '⚓⚓⚓⚓⚓' },
    { npc: 'neinhorn', title: 'Eishöhle', desc: 'NEIN kein Winter! ...ok aber EINE Eishöhle. Nur eine. Und ein Kristall darin. Bitte.', needs: { ice: 4, snow: 3, crystal: 1 }, reward: '🌈🌈🌈' },
    { npc: 'spongebob', title: 'Regenwald', desc: 'Suchergebnis: Kein Regenwald gefunden! Das ist INAKZEPTABEL! Regen + Bäume = REGENWALD!', needs: { rain: 2, tree: 5, mushroom: 4, plant: 6 }, reward: '⭐⭐⭐⭐' },
    { npc: 'maus', title: 'Schmetterlingswiese', desc: '*pieps* Schmetterlinge! *quak* Bienen! *pieps* Und HONIG! *quak* WENIGER HONIG! *pieps* Mehr Honig bitte!', needs: { butterfly: 3, flower: 6, bee: 2, honey: 2 }, reward: '🌻🌻🌻🌻' },
    // Runde 6: Absurdes Endgame
    { npc: 'neinhorn', title: 'Geisterhaus', desc: 'NEIN ich fürchte keine Geister! ...ich fürchte ALLE Geister. Bau eins damit sie DRINBLEIBEN!', needs: { ghost: 2, skull: 1, moon: 1, fence: 6 }, reward: '🌈🌈🌈🌈' },
    { npc: 'elefant', title: 'Roboter-Kapelle', desc: 'Törööö! Der Roboter hat geweint als er Musik hörte! Ein Roboter mit Gefühlen braucht eine Kapelle!', needs: { robot: 1, music: 2, lamp: 4, stone: 4 }, reward: '🎵🎵🎵🎵' },
    { npc: 'spongebob', title: 'Raumfahrt-Zentrum', desc: 'SUCHERGEBNIS: Rakete! UFO! ALIEN! Diese Insel braucht SOFORT ein Raumfahrt-Zentrum! JETZT!', needs: { rocket: 1, ufo: 1, alien: 1, metal: 6 }, reward: '⭐⭐⭐⭐⭐⭐' },
    { npc: 'maus', title: 'Phönix-Tempel', desc: '*pieps* Der Phönix ist aus Feuer geboren! *quak* Er braucht einen TEMPEL! *pieps* Und Honig! *quak* WARUM AUCH NICHT!', needs: { phoenix: 1, fire: 4, honey: 2, stone: 6 }, reward: '🌻🌻🌻🌻🌻' },
    { npc: 'krabs', title: 'Herz-Monument', desc: 'Ein HERZ-Monument! Darwin sagt Liebe ist evolutionär! Und Kunden kommen FÜR LIEBE! Krabben-Taler für Romantik!', needs: { heart: 3, flower: 6, crystal: 2, fountain: 1 }, reward: '💎💎💎💎' },
    { npc: 'elefant', title: 'Honiggarten', desc: 'Törööö... Honig riecht wie eine Melodie! Bienen sind Musiker! Die Blumen sind das Konzerthaus!', needs: { honey: 4, bee: 4, flower: 8, apple: 3 }, reward: '🎵🎵🎵🎵🎵' },
    { npc: 'maus', title: 'Kuchenland', desc: '*pieps* KUCHEN! *quak* Nein wir brauchen keinen — *pieps* DOCH! *quak* Ein Kuchen reicht! *pieps* DREI!', needs: { cake: 3, apple: 4, honey: 3, flower: 4 }, reward: '🌻🌻🌻🌻🌻🌻' },
    { npc: 'spongebob', title: 'Trank-Labor', desc: 'Suchergebnis: 1 Trank-Labor gefunden! ...in BIKINI BOTTOM! Ich mache meins hier! Pilze! Kristalle! MAGIE!', needs: { potion: 3, crystal: 2, mushroom: 4, diamond: 1 }, reward: '⭐⭐⭐⭐⭐⭐⭐' },
    // === HAIKU-BAUANLEITUNGEN (Backlog #14 — Krapweis-Idee: 5-7-5 Silben) ===
    // Jede Beschreibung ist ein Haiku. Japanische Ästhetik trifft Insel-Architektur.
    { npc: 'elefant', title: '俳句 Mondgarten', desc: 'Mond scheint auf den Stein —\nBlumen wachsen in der Nacht —\nStille singt ein Lied.', needs: { moon: 1, stone: 4, flower: 6 }, reward: '🎵🌙' },
    { npc: 'maus', title: '俳句 Regenweg', desc: 'Regen fällt auf Sand —\nWege werden Spiegelgrund —\nEnte quakt vor Glück.', needs: { rain: 1, path: 6, sand: 3 }, reward: '🌻🌧️' },
    { npc: 'neinhorn', title: '俳句 Eispalast', desc: 'Eis und Schnee und Glas —\nein Palast aus kaltem Licht —\nNEIN ich frier hier nicht.', needs: { ice: 3, snow: 2, glass: 4 }, reward: '🌈❄️' },
    { npc: 'spongebob', title: '俳句 Feuerturm', desc: 'Flammen steigen hoch —\nLampen tanzen auf dem Stein —\ndie Nacht wird zum Tag.', needs: { fire: 3, lamp: 4, stone: 6 }, reward: '⭐🔥' },
    { npc: 'krabs', title: '俳句 Goldhafen', desc: 'Boote tragen Gold —\nMetall glänzt im Morgenrot —\nProfit, süß wie Honig.', needs: { boat: 3, metal: 4, honey: 1 }, reward: '💰⛵' },
    { npc: 'tommy', title: '俳句 Brückenland', desc: 'Brücke über Blau —\nWasser trägt die Holzbalken —\nklick-klack sagt der Fuß.', needs: { bridge: 2, water: 6, planks: 4 }, reward: '⚓🌉' },
    { npc: 'elefant', title: '俳句 Blütenregen', desc: 'Wolken weinen Blü- —\nten die als Regen fallen —\nTörööö flüstert er.', needs: { cloud: 2, flower: 8, rain: 1 }, reward: '🎵🌸' },
    { npc: 'maus', title: '俳句 Pilzwald', desc: 'Pilze im Moos-grün —\nBäume stehen Kopf im Teich —\nder Wald atmet tief.', needs: { mushroom: 4, tree: 5, water: 3 }, reward: '🌻🍄' },
    { npc: 'neinhorn', title: '俳句 Sternennacht', desc: 'Sterne fallen leis —\nich sag NEIN zu Dunkelheit —\nund dann wird es hell.', needs: { star: 3, moon: 1, lamp: 3 }, reward: '🌈⭐' },
    { npc: 'krabs', title: '俳句 Kristallmine', desc: 'Tief im Stein ein Glanz —\nDiamanten warten still —\nPure Rendite, Junge!', needs: { diamond: 2, stone: 6, lamp: 2 }, reward: '💰💎' },
    { npc: 'spongebob', title: '俳句 Wolkenhaus', desc: 'Hoch in Wolken bau —\nGlas und Licht und nichts sonst mehr —\ndas Haus schwebt und lacht.', needs: { cloud: 3, glass: 4, lamp: 2 }, reward: '⭐☁️' },
    { npc: 'tommy', title: '俳句 Fischerdorf', desc: 'Netze im Wind wehn —\nFische springen silberhell —\nklick-klack singt das Meer.', needs: { fish: 4, boat: 2, fence: 4 }, reward: '⚓🐟' },
];
