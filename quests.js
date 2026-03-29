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
];
