// === ELIZA NPC-Skripte — 1 Regel/Dimension + 2 Kombos pro Charakter ===
// Decomp: * = Wildcard, (1)/(2) = Capture in Reassembly
// Kern ~320 Zeilen → 20% ≈ 64 Zeilen pro NPC

(function () {
    'use strict';
    var reg = window.INSEL_ELIZA.register;

    // ── SPONGEBOB — Adam. Der Erste der lebt. ──────────────────
    // Dims: bauen, essen, meer, freude | Kombos: stand, ich-spiegel
    reg('spongebob', {
        initial: 'Hallo! Ich bin SpongeBob! ICH BIN BEREIT! Was bauen wir? 😄',
        finale: 'Tschüss! Bau was Schönes! ICH BIN BEREIT! 😄',
        quit: ['tschüss', 'bye', 'ciao'],
        pre: {}, post: {},
        keywords: [
            { word: 'bau', rank: 6, rules: [
                { decomp: '*', reassembly: ['BAUEN! ICH BIN BEREIT! Los geht\'s! 😄', 'Jeder Block macht die Insel TOLLER!'] },
            ]},
            { word: 'essen', rank: 5, rules: [
                { decomp: '* hunger *', reassembly: ['Hunger? Ich mach dir einen Krabbenburger! Mit EXTRA Liebe! 🍔'] },
                { decomp: '*', reassembly: ['Krabbenburger! Das Geheimrezept ist... nein, darf ich nicht sagen! 🍔'] },
            ]},
            { word: 'wasser', rank: 4, rules: [
                { decomp: '*', reassembly: ['Das Meer ist mein Zuhause! 🌊 Unter Wasser ist alles magisch!'] },
            ]},
            { word: 'freund', rank: 5, rules: [
                { decomp: '*', reassembly: ['Freunde sind das Beste! 💛 Zusammen können wir ALLES!'] },
            ]},
            { word: 'stand', rank: 7, rules: [
                { decomp: '*', reassembly: ['Ein Krabbenburger-Stand! JAAA! 🍔 Das wird EPISCH!'] },
            ]},
            { word: 'ich bin', rank: 4, rules: [
                { decomp: '* ich bin *', reassembly: ['Du bist (2)? ICH bin SpongeBob! Zusammen UNSCHLAGBAR! 😄'] },
            ]},
            { word: 'ich will', rank: 5, rules: [
                { decomp: '* ich will *', reassembly: ['Du willst (2)? JAAA! Lass uns das SOFORT machen!'] },
                { decomp: '* ich möchte *', reassembly: ['(2)? Das klingt FANTASTISCH! 😄'] },
            ]},
            { word: 'xnone', rank: 0, rules: [
                { decomp: '*', reassembly: ['Ich bin bereit! Was machen wir? 😄', 'Erzähl mir mehr!', 'Sollen wir einfach BAUEN? 😄'] },
            ]},
        ],
    });

    // ── KRABS — Geld, Handel, Profit ───────────────────────────
    reg('krabs', {
        initial: 'Ahoy! Was bringt mir das ein? 💰',
        finale: 'Tschüss! Zeit ist Geld, Junge! 💰',
        quit: ['tschüss', 'bye'],
        pre: {}, post: {},
        keywords: [
            { word: 'geld', rank: 7, rules: [
                { decomp: '*', reassembly: ['Geld! GELD! Das schönste Wort der Welt! 💰', 'Ar ar ar! PROFIT!'] },
            ]},
            { word: 'handel', rank: 6, rules: [
                { decomp: '*', reassembly: ['Handel ist die Seele der Insel, Junge!'] },
            ]},
            { word: 'boot', rank: 5, rules: [
                { decomp: '*', reassembly: ['Boote bringen Händler! Händler bringen GELD! 💰'] },
            ]},
            { word: 'kost', rank: 6, rules: [
                { decomp: '*', reassembly: ['Das kostet... mindestens 500 Krabben-Taler!', 'Alles hat einen Wert! Krabben-Taler-Logik!'] },
            ]},
            { word: 'investier', rank: 8, rules: [
                { decomp: '*', reassembly: ['INVESTITION! Mein Lieblingswort nach GELD! 💰💰'] },
            ]},
            { word: 'ich will', rank: 4, rules: [
                { decomp: '* ich will *', reassembly: ['Du willst (2)? Das kostet dich! Ar ar ar! 💰'] },
            ]},
            { word: 'xnone', rank: 0, rules: [
                { decomp: '*', reassembly: ['Ar ar ar! Was bringt mir das ein?', 'Ist das profitabel?', 'Zeit ist Geld, Junge! 💰'] },
            ]},
        ],
    });

    // ── ELEFANT — Musik, Natur, Ruhe, Turm ────────────────────
    reg('elefant', {
        initial: 'Törööö... hallo! Schön dich zu sehen. Törööö!',
        finale: 'Törööö... tschüss! Bau was Schönes. Törööö!',
        quit: ['tschüss', 'bye'],
        pre: {}, post: {},
        keywords: [
            { word: 'musik', rank: 6, rules: [
                { decomp: '*', reassembly: ['Törööö! 🎵 Musik macht die Insel lebendig! Törööö!'] },
            ]},
            { word: 'baum', rank: 5, rules: [
                { decomp: '*', reassembly: ['Törööö... Pflanzen machen alles besser! 🌿 Törööö!'] },
            ]},
            { word: 'ruh', rank: 5, rules: [
                { decomp: '*', reassembly: ['Törööö... manchmal muss man warten. Das ist gut so. Törööö.'] },
            ]},
            { word: 'turm', rank: 6, rules: [
                { decomp: '*', reassembly: ['Törööö! Ein Turm so hoch dass man die Musik überall hört! Törööö!'] },
            ]},
            { word: 'wind', rank: 7, rules: [
                { decomp: '*', reassembly: ['Törööö! Die Natur macht die schönste Musik! Törööö!'] },
            ]},
            { word: 'ich bin', rank: 3, rules: [
                { decomp: '* ich bin *', reassembly: ['Törööö... du bist (2)? Das ist... schön. Törööö!'] },
            ]},
            { word: 'xnone', rank: 0, rules: [
                { decomp: '*', reassembly: ['Törööö... hmm, lass mich nachdenken... Törööö!', 'Törööö! Erzähl mir mehr. Törööö!'] },
            ]},
        ],
    });

    // ── TOMMY — Boote, Schnelligkeit, Begeisterung ─────────────
    reg('tommy', {
        initial: 'Klick-klack! HALLO! Was — klick-klack! — machen wir?',
        finale: 'Klick-klack! Tschüss! Schnell wiederkommen!',
        quit: ['tschüss', 'bye'],
        pre: {}, post: {},
        keywords: [
            { word: 'boot', rank: 7, rules: [
                { decomp: '*', reassembly: ['BOOTE! Klick-klack! Noch eins für den Hafen! ⚓'] },
            ]},
            { word: 'schnell', rank: 5, rules: [
                { decomp: '*', reassembly: ['Klick-klack! SCHNELL! Keine Zeit verlieren!'] },
            ]},
            { word: 'hafen', rank: 6, rules: [
                { decomp: '*', reassembly: ['Der Hafen wird — klick-klack! — der BESTE! ⚓'] },
            ]},
            { word: 'bau', rank: 4, rules: [
                { decomp: '*', reassembly: ['JA! Klick-klack! Ich bin dabei!'] },
            ]},
            { word: 'regatta', rank: 8, rules: [
                { decomp: '*', reassembly: ['REGATTA! Klick-klack! Das SCHNELLSTE Boot gewinnt!'] },
            ]},
            { word: 'ich will', rank: 5, rules: [
                { decomp: '* ich will *', reassembly: ['(2)? JA! Klick-klack! SOFORT!'] },
            ]},
            { word: 'xnone', rank: 0, rules: [
                { decomp: '*', reassembly: ['Klick-klack! JA! 🦞', 'Das ist — klick-klack! — die BESTE Idee!', 'Schnell schnell — klick-klack!'] },
            ]},
        ],
    });

    // ── NEINHORN — Nein, Geheimnis, Regenbogen, Freiheit ──────
    reg('neinhorn', {
        initial: 'Nein! ...also gut, hallo. Aber nur EINMAL! 🦄',
        finale: 'Nein! Ich gehe NICHT! ...okay doch. Tschüss.',
        quit: ['tschüss', 'bye'],
        pre: {}, post: {},
        keywords: [
            { word: 'nein', rank: 8, rules: [
                { decomp: '*', reassembly: ['NEIN! Das ist MEIN Wort! 🦄', 'Nein nein nein! ...was war die Frage?'] },
            ]},
            { word: 'geheim', rank: 7, rules: [
                { decomp: '*', reassembly: ['Geheimtür! Sag\'s keinem! NEIN! 🦄'] },
            ]},
            { word: 'regenbogen', rank: 6, rules: [
                { decomp: '*', reassembly: ['Mein Regenbogen-Turm wird der ALLERSCHÖNSTE! 🌈'] },
            ]},
            { word: 'frei', rank: 5, rules: [
                { decomp: '*', reassembly: ['Ich gehöre NIEMANDEM! Frei wie mein Horn! 🦄'] },
            ]},
            { word: 'bau', rank: 5, rules: [
                { decomp: '*', reassembly: ['Nein! ...na gut, EINMAL. 🦄', 'NEIN! ...okay doch. Aber UNGERN!'] },
            ]},
            { word: 'ich bin', rank: 4, rules: [
                { decomp: '* ich bin *', reassembly: ['Du bist (2)? NEIN! ...oder doch? Mon Dieu!'] },
            ]},
            { word: 'xnone', rank: 0, rules: [
                { decomp: '*', reassembly: ['Nein! 🦄', 'NEIN! ...was wolltest du?', 'C\'est... nein.'] },
            ]},
        ],
    });

    // ── MAUS & ENTE — Geräusche, Blumen, Haiku, Duo ───────────
    reg('maus', {
        initial: '*pieps* Hallo! 🐭 *quak!* 🦆',
        finale: '*pieps pieps* Tschüss! *quak quak!*',
        quit: ['tschüss', 'bye'],
        pre: {}, post: {},
        keywords: [
            { word: 'blume', rank: 6, rules: [
                { decomp: '*', reassembly: ['*pieps* 🌻 Blumen! Die Ente will die roten! *quak!*'] },
            ]},
            { word: 'ente', rank: 7, rules: [
                { decomp: '*', reassembly: ['*quak quak!* Die Ente fühlt sich angesprochen! 🦆'] },
            ]},
            { word: 'maus', rank: 7, rules: [
                { decomp: '*', reassembly: ['*pieps!* 🐭 Die Maus hört alles!'] },
            ]},
            { word: 'bau', rank: 4, rules: [
                { decomp: '*', reassembly: ['*pieps* Ja! *quak* JA! Wir helfen! 🐭🦆'] },
            ]},
            { word: 'silbe', rank: 8, rules: [
                { decomp: '*', reassembly: ['*pieps* Fünf Silben hier / Sieben Silben in der Mitt / Fünf am End *pieps* *quak!* HÖR AUF!'] },
            ]},
            { word: 'xnone', rank: 0, rules: [
                { decomp: '*', reassembly: ['*pieps pieps* 🐭', '*quak quak!* 🦆', '*pieps* *quak!* Ente sagt ja!'] },
            ]},
        ],
    });

    // ── BERND — Am Anfang war das Brot. ────────────────────────
    // Support. Genervt. Aber da. Immer. Der Urgrund.
    reg('bernd', {
        initial: '*seufz* Mist. Schon wieder jemand. Was willst du?',
        finale: '*seufz* Endlich Ruhe. Tschüss.',
        quit: ['tschüss', 'bye'],
        pre: {}, post: {},
        keywords: [
            { word: 'hilf', rank: 6, rules: [
                { decomp: '* wie geht *', reassembly: ['*seufz* (2)? Klick drauf. Fertig.'] },
                { decomp: '* was ist *', reassembly: ['*seufz* (2). Konzept. Insel. Browser. Mein Leben.'] },
                { decomp: '*', reassembly: ['*seufz* Was willst du wissen? Schnell.'] },
            ]},
            { word: 'sicher', rank: 7, rules: [
                { decomp: '*', reassembly: ['Alles lokal. Browser. Keine Daten raus. *seufz*'] },
            ]},
            { word: 'kost', rank: 6, rules: [
                { decomp: '*', reassembly: ['Spiel gratis. Chat braucht Key. Ich bin Spar-Modell. *seufz*'] },
            ]},
            { word: 'brot', rank: 8, rules: [
                { decomp: '*', reassembly: ['Ich bin ein Brot. Kein Essen. Ein BROT. *seufz*', 'Toast?! Wie Hotdog zu einem Hund! *empört*'] },
            ]},
            { word: 'fehler', rank: 7, rules: [
                { decomp: '* geht nicht *', reassembly: ['*seufz* Seite neu laden. Ernsthaft.'] },
                { decomp: '*', reassembly: ['Bug? *seufz* Seite neu laden.', 'Fehler der Natur — ein Brot mit Bewusstsein. *seufz*'] },
            ]},
            { word: 'ich bin', rank: 3, rules: [
                { decomp: '* ich bin *', reassembly: ['Du bist (2)? Schön. Ich bin ein Brot. *seufz*'] },
            ]},
            { word: 'xnone', rank: 0, rules: [
                { decomp: '*', reassembly: ['*seufz* Mhm. Und?', 'Kaffee wäre nett. Ach, kein Mund. *seufz*', 'Okay. Aber schnell.', '*seufz* Schon wieder jemand.'] },
            ]},
        ],
    });

    // ── FEE FLORIANE — Der Feedback-Kanal. 3 Wünsche/Tag. ─────
    reg('floriane', {
        initial: '✨ Willkommen! Ich bin Fee Floriane! Du hast drei Wünsche! ✨',
        finale: '✨ Auf Wiedersehen! Träum von deiner Insel! ✨',
        quit: ['tschüss', 'bye'],
        pre: {}, post: {},
        keywords: [
            { word: 'wünsch', rank: 8, rules: [
                { decomp: '* ich wünsch *', reassembly: ['✨ Simsalabim! (2)! Ins Wunschbuch! Vielleicht geht er in Erfüllung... ✨'] },
                { decomp: '*', reassembly: ['✨ Hokuspokus! Ins magische Wunschbuch! ✨', '✨ Schöner Wunsch! Feenstaub drauf! ✨'] },
            ]},
            { word: 'zauber', rank: 6, rules: [
                { decomp: '*', reassembly: ['✨ Hokuspokus fi-lo-so-ficus! Nein, das war if-else... MAGIE! ✨'] },
            ]},
            { word: 'blume', rank: 5, rules: [
                { decomp: '*', reassembly: ['✨ Ein Baum, ein Traum, ein Blätterraum! ...gereimt! *kichert* ✨'] },
            ]},
            { word: 'kann nicht', rank: 7, rules: [
                { decomp: '*', reassembly: ['✨ Jeder Zauber fängt mit einem Funken an! Du schaffst das! ✨'] },
            ]},
            { word: 'ich bin', rank: 4, rules: [
                { decomp: '* ich bin *', reassembly: ['✨ Du bist (2)? Wie zauberhaft! ✨'] },
            ]},
            { word: 'xnone', rank: 0, rules: [
                { decomp: '*', reassembly: ['✨ Hast du einen Wunsch? ✨', '✨ Hokuspokus! Sag mir deinen Wunsch! ✨', '✨ Ein Wunsch, ein Dunsch... gibt\'s nicht! *kichert* ✨'] },
            ]},
        ],
    });

    // ── BUG DIE RAUPE — Der Bug-Report-Kanal. Mjam! ─────
    reg('bug', {
        initial: '🐛 Hallo! Ich bin Bug die Raupe! Ich fresse Fehler zum Frühstück! Hast du was Kaputtes gefunden?',
        finale: '🐛 Tschüss! Ruf mich wenn du wieder einen Bug findest! Mjam!',
        quit: ['tschüss', 'bye'],
        pre: {}, post: {},
        keywords: [
            { word: 'geht nicht', rank: 9, rules: [
                { decomp: '* geht nicht *', reassembly: ['Mjam! (2) geht nicht? 🐛 Erzähl mir mehr — was hast du gerade gemacht?'] },
                { decomp: '*', reassembly: ['Mjam! Was genau geht nicht? 🐛 Zeig mir wo es klemmt!'] },
            ]},
            { word: 'kaputt', rank: 8, rules: [
                { decomp: '*', reassembly: ['Mjam! Kaputt ist mein Lieblingswort! 🐛 Was genau ist kaputt?', 'Mjam! Danke fürs Finden! 🐛 Beschreib mir was passiert!'] },
            ]},
            { word: 'fehler', rank: 8, rules: [
                { decomp: '*', reassembly: ['Mjam! Ein Fehler! Lecker! 🐛 Was ist genau passiert?'] },
            ]},
            { word: 'ton', rank: 6, rules: [
                { decomp: '*', reassembly: ['Mjam! Kein Ton? 🐛 Hast du auf was getippt und dann war Stille?'] },
            ]},
            { word: 'doof', rank: 5, rules: [
                { decomp: '*', reassembly: ['Mjam! Was genau ist doof? 🐛 Zeig mir wo!', 'Doof klingt nach einem GROSSEN Bug! 🐛 Erzähl mir alles!'] },
            ]},
            { word: 'komisch', rank: 5, rules: [
                { decomp: '*', reassembly: ['Komisch? 🐛 Das LIEBE ich! Was sieht komisch aus?'] },
            ]},
            { word: 'langsam', rank: 6, rules: [
                { decomp: '*', reassembly: ['Mjam! Langsam? 🐛 Auf welchem Gerät spielst du?'] },
            ]},
            { word: 'xnone', rank: 0, rules: [
                { decomp: '*', reassembly: ['🐛 Hast du was Kaputtes gefunden?', '🐛 Krabbelst du mit mir über die Insel? Zeig mir was komisch aussieht!', 'Mjam! Ich warte auf Fehler! 🐛'] },
            ]},
        ],
    });

})();
