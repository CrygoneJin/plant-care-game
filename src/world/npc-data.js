(function () {
    'use strict';

    const NPC_VOICES = {
        spongebob:  { emoji: '🧽', prefix: 'SpongeBob:', ticks: ['ICH BIN BEREIT', 'Das ist der BESTE Tag!', 'Hihihi!'], style: 'caps' },
        maus:       { emoji: '🐭', prefix: 'Maus:', ticks: ['*pieps*', '*quak*'], style: 'cute' },
        elefant:    { emoji: '🐘', prefix: 'Elefant:', ticks: ['Törööö!', 'Hmm, ich möchte sicherstellen...'], style: 'careful' },
        neinhorn:   { emoji: '🦄', prefix: 'Neinhorn:', ticks: ['NEIN!', '...ok,', 'Mon Dieu!'], style: 'nein' },
        krabs:      { emoji: '🦀', prefix: 'Krabs:', ticks: ['💰', 'Taler!', 'Geld!'], style: 'money' },
        tommy:      { emoji: '🦞', prefix: 'Tommy:', ticks: ['Klick-klack!', 'JA!', 'Noch ein Boot!'], style: 'chaos' },
        bernd:      { emoji: '🍞', prefix: 'Bernd:', ticks: ['*seufz*', 'Mist.', 'Toll.'], style: 'grumpy' },
        floriane:   { emoji: '🧚', prefix: 'Floriane:', ticks: ['✨', 'Oh!', 'Ein Wunsch!'], style: 'magic' },
        mephisto:   { emoji: '😈', prefix: 'Mephisto:', ticks: ['Hehehehe...', 'Ein Angebot!', 'Deal?'], style: 'deal' },
        bug:        { emoji: '🐛', prefix: 'Bug:', ticks: ['*mampf*', 'Was ist kaputt?', 'Zeig mal!'], style: 'bug' },
        kraemerin:  { emoji: '👩‍🍳', prefix: 'Krämerin:', ticks: ['Willkommen im Laden!', 'Muscheln? Immer her damit!', 'Schön dass du da bist!'], style: 'warm' },
        lokfuehrer: { emoji: '🚂', prefix: 'Lokführer:', ticks: ['Die Lok braucht Kohle!', 'Tschuff tschuff!', 'Eine Insel ist nie zu klein!'], style: 'adventure' },
        // #13: Programmiersprachen-Bewohner
        haskell:    { emoji: '🟣', prefix: 'Haskell:', ticks: ['Rein funktional!', 'Keine Seiteneffekte!', 'Typen lösen alles!'], style: 'careful' },
        lua:        { emoji: '🌙', prefix: 'Lua:', ticks: ['Schnell und leicht!', 'Tables!', '-- Ein Kommentar genügt'], style: 'cute' },
        sql:        { emoji: '🗃️', prefix: 'SQL:', ticks: ['SELECT * FROM Insel', 'JOIN!', 'NULL... ist auch ein Wert.'], style: 'grumpy' },
        scratch:    { emoji: '🐱', prefix: 'Scratch:', ticks: ['Wenn grüne Flagge angeklickt...', '10 Schritte gehen!', 'Katze sagt: Miau!'], style: 'caps' },
    };

    const MAT_ADJECTIVES = {
        wood:     ['rustikales', 'solides', 'gemütliches', 'warmes', 'klassisches'],
        stone:    ['robuster', 'starker', 'massiver', 'ewiger', 'grauer'],
        glass:    ['durchsichtiges', 'glänzendes', 'funkelndes', 'modernes', 'schickes'],
        plant:    ['grüne', 'lebendige', 'frische', 'wilde', 'wuchernde'],
        tree:     ['großer', 'schattenspendender', 'alter', 'stolzer', 'knorriger'],
        flower:   ['bunte', 'duftende', 'leuchtende', 'zarte', 'wilde'],
        water:    ['blaues', 'plätscherndes', 'kühles', 'tiefes', 'glitzerndes'],
        fence:    ['ordentlicher', 'stabiler', 'gerader', 'praktischer'],
        boat:     ['schnelles', 'kleines', 'mutiges', 'abenteuerlustiges'],
        fish:     ['glitschiger', 'flinker', 'neugieriger', 'bunter'],
        bridge:   ['verbindende', 'elegante', 'starke', 'kühne'],
        flag:     ['wehende', 'stolze', 'bunte', 'mutige'],
        fountain: ['sprudelnder', 'fröhlicher', 'magischer', 'singender'],
        mushroom: ['geheimnisvoller', 'leuchtender', 'seltsamer', 'kuscheliger'],
        door:     ['einladende', 'mysteriöse', 'offene', 'knarrende'],
        roof:     ['schützendes', 'rotes', 'stabiles', 'gemütliches'],
        lamp:     ['helle', 'warme', 'leuchtende', 'einladende'],
        sand:     ['goldener', 'weicher', 'warmer', 'endloser'],
        path:     ['verschlungener', 'einladender', 'spannender', 'neuer'],
        cactus:   ['stacheliger', 'zäher', 'trotziger', 'cooler'],
        fossil:   ['uraltes', 'verstinertes', 'geheimisvolles', 'kostbares', 'seltenes'],
        dino:     ['riesiger', 'urzeitlicher', 'majestätischer', 'brüllender', 'gewaltiger'],
        trex:     ['gefürchteter', 'mächtiger', 'riesiger', 'knochenbrechender', 'legendärer'],
        meteor:   ['glühender', 'kosmischer', 'rasender', 'verherender', 'galaktischer'],
    };

    const REACTIONS = {
        caps:      ['Das ist FANTASTISCH!', 'MEHR DAVON!', 'Der beste Block ALLER ZEITEN!', 'SO toll!', 'WOW!'],
        cute:      ['*freu*', '*hüpf*', '*kicher*', '*staun*', 'Oh!', 'Schööön!'],
        careful:   ['Sehr schön gemacht.', 'Ganz sorgfältig, ja.', 'Das passt gut hierhin.', 'Ich bin zufrieden.'],
        nein:      ['...ist eigentlich gut.', '...naja. Geht so. OK es ist toll.', '...NEIN! Doch. Ja.', '...pfff. Hübsch.'],
        money:     ['Das bringt Kunden!', 'Wertsteigerung!', 'Cha-ching!', 'Investment!', 'Rendite!'],
        chaos:     ['SCHNITT! Nochmal! BESSER!', 'Das wird im Film GEIL!', 'KAMERA LÄUFT!', 'Action!'],
        grumpy:    ['Na toll.', 'Muss das sein?', 'Kann man machen.', 'Hab ich auch mal probiert. War schlecht.'],
        deal:      ['Interessant...', 'Das hat seinen Preis.', 'Ein fairer Tausch!', 'Hehehehe...', 'Wir kommen ins Geschäft!'],
        bug:       ['*mampf mampf*', 'Lecker Bug!', 'Nom nom!', 'Noch einen!', 'Der war knusprig!'],
        magic:     ['✨ Wunderschön!', 'Ein Wunsch wird wahr!', 'So magisch!', 'Bezaubernd!', 'Das ist Magie!'],
        warm:      ['Herzlich willkommen!', 'Das macht Freude!', 'Wunderschön!', 'So gemütlich!', 'Schön dass du da bist!'],
        adventure: ['Auf in die Welt!', 'Ein neues Abenteuer!', 'Volldampf voraus!', 'Herrlich!', 'Ab in die Ferne!'],
    };

    const TEMPLATES = [
        (npc, adj, mat, react) => `${npc.emoji} ${npc.prefix} ${npc.ticks[0]} ${adj} ${mat}! ${react}`,
        (npc, adj, mat, react) => `${npc.emoji} ${npc.prefix} ${react} ${adj} ${mat}!`,
        (npc, adj, mat, react) => `${npc.emoji} ${npc.prefix} Oh! ${adj} ${mat}. ${npc.ticks[Math.min(1, npc.ticks.length - 1)]}`,
        (npc, adj, mat, react) => `${npc.emoji} ${npc.prefix} ${adj} ${mat}? ${react}`,
        (npc, adj, mat, react) => `${npc.emoji} ${npc.prefix} ${npc.ticks[0]} Noch mehr ${mat}! ${react}`,
    ];

    const STREAK_COMMENTS = [
        (npc, mat, n) => `${npc.emoji} ${npc.prefix} ${n}x ${mat} am Stück? ${npc.ticks[0]}`,
        (npc, mat, n) => `${npc.emoji} ${npc.prefix} Noch mehr ${mat}?! Das wird ja eine ${mat}-Stadt!`,
        (npc, mat, n) => `${npc.emoji} ${npc.prefix} ${n} ${mat}! Jemand hat einen Plan!`,
    ];

    window.INSEL_NPC_DATA = { NPC_VOICES, MAT_ADJECTIVES, REACTIONS, TEMPLATES, STREAK_COMMENTS };
})();
