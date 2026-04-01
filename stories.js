// === STORIES — Hörspiel-Szenen ===
// Spontane Hörspiele bei Meilensteinen (firstBlock, tenBlocks, etc.)
// Exportiert als window.INSEL_STORIES

(function () {
    'use strict';

    // #11: Easter Eggs — Kinder entdecken Programmiersprachen beim Bauen
    // Extrahiert aus game.js
    /** @type {Object<string, string[]>} */
    var CODE_EASTER_EGGS = {
        stone: [
            '🪨 Im Stein ist geritzt: "C war hier. Erster!" Daneben, viel kleiner: "War ich nicht. Fortran."',
            '🪨 Jemand ist gegen den Stein gelaufen. Daneben steht "C++" geritzt.',
            '🪨 BASIC sitzt auf dem Stein und zählt: "10, 20, 30..." Warum? "Jeder fängt mit mir an!"',
            '🪨 Am Stein lehnt eine uralte Tafel: "Pythagoras war hier. 2500 Jahre vor euch." Alle schweigen.',
        ],
        tree: [
            '🐍 Hinter dem Baum raschelt es! Eine Schlange zwinkert: "Hallo, ich bin Python!"',
            '🐍 Python gähnt: "Ich bin zwar laaangsam, aber jeder versteht mich!"',
            '🐍 Python wickelt sich um den Baum: "Die anderen rennen. Ich denke nach."',
        ],
        flower: [
            '💎 Zwischen den Blumen glitzert ein roter Edelstein! "Ruby" steht drauf.',
            '📿 Im Blumenbeet liegt eine Perlenkette. Auf dem Verschluss steht "PERL".',
        ],
        boat: [
            '🦀 Unter dem Boot sitzt ein kleiner Krebs mit einem Zahnrad. "Ich bin Rust!"',
            '⚓ Am Anker steht "Rust" geritzt. Der Krebs nickt stolz: "Ich roste NIE."',
        ],
        fence: [
            '🐦 Ein Vogel schießt über den Zaun! "Ich bin Swift!" Zack, weg.',
            '🧮 Am Zaun zählt jemand Latten: "1, 10, 11, 100..." Das ist kein Quatsch, das ist Binär!',
        ],
        fish: [
            '🦈 Ein Fisch flüstert: "Pass auf Makro auf! Der Hai macht alles RIESIG!"',
            '🐟 Der Fisch schwimmt Kreise. Immer wieder. Das nennt man eine Schleife!',
        ],
        path: [
            '🧮 Am Wegrand zählt R Kieselsteine. In Binär. Niemand hat ihn darum gebeten.',
            '🌍 Geo die Geologin kniet am Weg: "Schicht 1, Schicht 2!" R daneben: "47 Steine. In Binär: 101111."',
        ],
        bridge: [
            '🎲 Unter der Brücke spielen zwei Krabben ein Brettspiel. Das heißt Go!',
            '🌉 Auf der Brücke streiten sich zwei: "ICH baue die Brücke!" "Nee, ICH!" Am Ende braucht man beide.',
        ],
        water: [
            '☕ Das Wasser dampft! "Auf der Insel Java trinkt man viel Kaffee", murmelt C.',
            '🦈 Makro der Hai taucht auf: "ICH MACHE ALLES GRÖSSER!" Python: "Deswegen mag dich keiner."',
            '🦈 "Vorsicht vor Makro!" warnt Rust. "Sieht klein aus, wird dann RIESIG!"',
        ],
        mushroom: [
            '🍄 Unter dem Pilz sitzt eine kleine Elfe. "Ich spreche Elixir!"',
            '🍄 Hinter dem Pilz murmelt jemand: "+++++[>++<-]>!" Das ist Hirnfitz. Keiner versteht ihn.',
            '🍄 "Was hat Hirnfitz gesagt?" fragt Python. C: "Hallo. Dafür braucht er 100 Zeichen."',
        ],
        lamp: [
            '💡 Die Lampe flackert. In der Birne steht winzig: "Powered by JavaScript".',
            '💡 JavaScript wurde in 10 Tagen erfunden. Auf einer Insel! Passt ja.',
            '💡 TypeScript korrigiert JavaScript: "Da fehlt ein Typ!" JavaScript: "Ich funktioniere AUCH SO!"',
        ],
        cactus: [
            '🦜 Auf dem Kaktus sitzt ein Papagei: "Ich bin FORTRAN! Fort ran ich, nie zurück!"',
            '🦜 Fortran krächzt: "Was macht ein Baum im Internet? Er LOGGT sich ein!"',
            '🦜 "Warum können Geister nicht lügen? Man DURCH-C-T sie!" Fortran lacht allein.',
            '🦜 "Warum sitze ich auf dem Kaktus? Der STACK ist übergelaufen!"',
        ],
    };

    var lastEasterEggTime = 0;
    var discoveredEggs = JSON.parse(localStorage.getItem('insel-easter-eggs') || '[]');

    /**
     * Prüft ob ein Easter Egg angezeigt werden soll (12% Chance, max alle 20s)
     * @param {string} material
     * @param {function} showToast
     * @param {function} [recordMilestone]
     * @param {function} [trackEvent]
     * @returns {boolean} true wenn ein Egg angezeigt wurde
     */
    function maybeCodeEasterEgg(material, showToast, recordMilestone, trackEvent) {
        var now = Date.now();
        if (now - lastEasterEggTime < 20000) return false;
        if (Math.random() > 0.12) return false;

        var eggs = CODE_EASTER_EGGS[material];
        if (!eggs) return false;

        var unseen = eggs.filter(function(e) { return discoveredEggs.indexOf(e) === -1; });
        var pool = unseen.length > 0 ? unseen : eggs;
        var egg = pool[Math.floor(Math.random() * pool.length)];

        lastEasterEggTime = now;
        if (discoveredEggs.indexOf(egg) === -1) {
            discoveredEggs.push(egg);
            localStorage.setItem('insel-easter-eggs', JSON.stringify(discoveredEggs));
        }
        if (showToast) showToast(egg, 5000);
        if (recordMilestone) recordMilestone('firstEasterEgg');
        if (trackEvent) trackEvent('easter_egg', { material: material, egg: egg.slice(0, 30) });
        return true;
    }

    window.INSEL_STORIES = {
        // Easter Eggs API
        CODE_EASTER_EGGS: CODE_EASTER_EGGS,
        maybeCodeEasterEgg: maybeCodeEasterEgg,
        getDiscoveredEggs: function() { return discoveredEggs; },
        // Hörspiel-Szenen
        firstBlock: [
            '🪨 C: "Da baut jemand! Zum ersten Mal seit ich hier bin!"',
            '🐍 Python: "Willkommen auf Java! Ich versteeeehe dich."',
            '🦜 Fortran: "Fort-ran die Langeweile! Jemand BAUT!"',
            '🧮 R: "Block Nummer 1. In Binär: 1. In Tertiär: 1. Immer noch 1."',
            '🌍 Geo: "Robert, NICHT jetzt!"',
        ],
        tenBlocks: [
            '💡 JavaScript: "10 Blöcke! Genau wie ich — in 10 Tagen geboren!"',
            '📝 TypeScript: "Korrekt wäre: blöcke: number = 10;"',
            '💡 JavaScript: "LASS MICH."',
            '🦈 Makro: *taucht kurz auf* "Zehn? Ich mache HUNDERT draus!" *taucht ab*',
            '🐍 Python: "Ignoriert den Hai. Zehn ist gut. Zehn ist... gemütlich."',
        ],
        fiftyBlocks: [
            '🧽 SpongeBob: "ICH BIN BEREIT zu sagen: DAS ist eine STADT!"',
            '🦀 Mr. Krabs: "Stadt = Kunden = <umsatz>VIEL GELD</umsatz>!"',
            '🐘 Elefant: "Hmm, ich möchte sicherstellen... ja. Törööö! Das ist schön."',
            '🪨 C: "50 Blöcke. Zu meiner Zeit haben wir mit EINEM Byte angefangen."',
            '🪨 C++: "Und dann bin ich gegen den Stein gelaufen und alles wurde besser!"',
            '🪨 C: "...definiere besser."',
        ],
        hundredBlocks: [
            '🦄 Neinhorn: "NEIN das sind nicht 100 Blöcke! ...doch? Mon Dieu!"',
            '🧮 R: "100 in Binär: 1100100. In Oktal: 144. In—"',
            '🌍 Geo: "ROBERT."',
            '🐭 Maus: "*pieps* Hundert Blöcke / Die Insel wird zur Stadt / Weniger war mehr *pieps*"',
            '🦆 Ente: "*quak* Was soll das mit den Silben SCHON WIEDER?!"',
            '🍄 Hirnfitz: "++++++[>++++++++++<-]>++++. !" (Das heißt: "d!" — er versucht "du bist toll" zu sagen)',
            '🍞 Bernd: "*seufz* 100 Blöcke. Und ich muss immer noch Support machen."',
        ],
        talkshow: [
            '— TALKSHOW: "Gebaut oder Geklickt?" — Live von der Insel Java —',
            '🐍 Python: "Willkommen bei Gebaut oder Geklickt — der einzigen Talkshow auf einer Insel die aus Code besteht."',
            '💡 JavaScript: "Gaming ist wenn jemand auf Dinge klickt und sich gut fühlt."',
            '📝 TypeScript: "Gaming ist wenn jemand auf Dinge klickt und sich gut fühlt, ABER typsicher."',
            '💡 JavaScript: "Ich HASSE dich."',
            '🧽 SpongeBob: "ICH BIN BEREIT zu sagen: DAS IST EIN SPIEL! Da sind Blöcke! Da sind Farben! Da ist SPASS!"',
            '🪨 C: "Zu meiner Zeit war ein Spiel ein Cursor der sich bewegt hat. Und wir waren DANKBAR."',
            '🦄 Neinhorn: "NEIN das ist kein Spiel. ...doch. ...NEIN. ...ach, es macht Spaß. Egal."',
            '🍞 Bernd: "*seufz* Ist Leiden Gaming? Dann bin ich Pro-Gamer."',
            '🦈 Makro: *taucht auf* "Ist INVESTIEREN Gaming? Ich habe aus einem Block HUNDERT gemacht!" *taucht ab*',
            '🐘 Elefant: "Hmm, Törööö. Gaming ist wenn man vergisst dass man spielt. Und hier vergisst man das."',
            '🦜 Fortran: "Fort-ran die Langeweile! Her-kam der Spaß! ALLES ist Gaming wenn man es mit Freude tut!"',
            '🪨 C: "Es ist aus Worten gebaut. Nicht aus einer Engine. Aus Worten."',
            '🧽 SpongeBob: "Und die Insel hat FREUNDE! Wir sind die Freunde! ICH BIN EIN FREUND!"',
            '🍞 Bernd: "*seufz* ...ich auch. Sag ich nur einmal."',
            '— Applaus. Jemand wirft eine Kokosnuss. Bernd seufzt. —',
        ],
        halfIsland: [
            '— HÖRSPIEL: Mensch, Maschine, KI — Live von der Insel Java —',
            '🐍 Python: "Die halbe Insel ist bebaut. Ein Mensch hat das gemacht. Mit Klicks."',
            '💡 JavaScript: "Aber WIR haben die Klicks VERARBEITET! Ohne mich wäre das nur Sand!"',
            '📝 TypeScript: "Ohne mich hättest DU drei Bugs. Mindestens."',
            '🪨 C: "Ohne MICH gäbe es euch alle nicht."',
            '🐍 Python: "Die Frage ist: Wer baut hier wirklich? Der Mensch? Die Maschine? Oder die KI im Chat?"',
            '🧽 SpongeBob: "ICH glaube der Baumeister baut! Und wir helfen! ICH BIN BEREIT ZU HELFEN!"',
            '🦄 Neinhorn: "NEIN! ...aber ja. Zusammen ists schöner."',
            '— Applaus von der Insel Java. Nächste Vorstellung bei 100%. —',
        ],
        fullIsland: [
            '— GROSSES FINALE: Mensch, Maschine, KI — Insel Java Uraufführung —',
            '🪨 C: "Ich erinnere mich an den Tag als hier NICHTS war."',
            '🐍 Python: "Ein leeres Grid. Null Blöcke. None."',
            '🧮 R: "Genau 0. In jedem Zahlensystem."',
            '💡 JavaScript: "Und dann hat jemand geklickt. Ein Mensch. Ein WORT wurde zu einem BLOCK."',
            '📝 TypeScript: "grid[0][0] = \'wood\' — der erste Zauberspruch."',
            '🦜 Fortran: "Fort-ran die Leere! Her-kam die Stadt!"',
            '🧽 SpongeBob: "Alles nur mit WORTEN! Kein Hammer, kein Bagger! Nur: Klick. Text. MAGIE!"',
            '🐘 Elefant: "Törööö! Und die ganze Insel hat zugehört."',
            '🦄 Neinhorn: "NEIN ich weine nicht! ...es regnet. Auf mein Gesicht. Nur da."',
            '🍞 Bernd: "*seufz* Gut, DAS war schön. Sag ich nur einmal. Nie wieder."',
            '🦈 Makro: *ganz leise aus dem Wasser* "...ich fand es auch schön."',
            '— Standing Ovation auf der Insel Java. Grüße ans ZKM Karlsruhe. —',
        ],
    };
})();
