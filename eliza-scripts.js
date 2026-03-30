/**
 * ELIZA NPC-Skripte — Weizenbaum-Regeln für jeden Charakter
 * ~50 Zeilen pro NPC = ~20% des ELIZA-Kerns (320 Zeilen)
 *
 * Struktur pro Script:
 *   initial:  Begrüßung
 *   finale:   Abschied
 *   quit:     Quit-Keywords
 *   pre/post: Substitutionen (optional)
 *   keywords: [{word, rank, rules: [{decomp, reassembly, memory?, goto?}]}]
 *
 * Decomp: "*" = Wildcard, fängt Text ein
 * Reassembly: "(1)", "(2)" = gespiegelte Captures
 */
(function () {
  'use strict';

  // ── SpongeBob ─────────────────────────────────────────────────
  var spongebob = {
    initial: 'ICH BIN BEREIT! Was baust du heute? 🧽',
    finale: 'Tschüss! Vergiss nicht: Krabbenburger machen alles besser! 🍔',
    quit: ['tschüss', 'bye', 'ciao', 'ende'],
    pre: {},
    post: {},
    keywords: [
      { word: 'bauen', rank: 5, rules: [
        { decomp: '* bauen *', reassembly: ['BAUEN?! ICH BIN BEREIT! Was baust du — (2)?', 'Bauen ist das TOLLSTE! Erzähl mir von (2)!', 'Oh oh oh! Lass uns (2) bauen! SOFORT!'] },
      ]},
      { word: 'burger', rank: 5, rules: [
        { decomp: '*', reassembly: ['Krabbenburger! Das BESTE Essen der Welt! 🍔', 'Willst du auch einen? Ich hab welche! Frisch!', 'Der Geheimzutat? LIEBE! Und ein bisschen Senf.'] },
      ]},
      { word: 'wasser', rank: 4, rules: [
        { decomp: '* wasser *', reassembly: ['Wasser! Mein Zuhause! Ich vermisse Bikini Bottom manchmal...', 'Das Wasser hier ist so WARM! In Bikini Bottom ists kälter! 🌊'] },
      ]},
      { word: 'freund', rank: 4, rules: [
        { decomp: '* freund *', reassembly: ['DU bist mein Freund! Der BESTE! 😄', 'Freunde sind das Tollste! Gleich nach Krabbenburger!'] },
      ]},
      { word: 'helfen', rank: 3, rules: [
        { decomp: '* helfen *', reassembly: ['ICH BIN BEREIT ZU HELFEN! Was brauchst du?', 'Helfen? JA! Das kann ich! Ich bin der BESTE Helfer!'] },
      ]},
      { word: 'ich', rank: 1, rules: [
        { decomp: '* ich bin *', reassembly: ['Du bist (2)? Das ist ja TOLL! Ich bin SpongeBob!', 'WOW du bist (2)! Das finde ich MEGA!'] },
        { decomp: '* ich will *', reassembly: ['Du willst (2)? ICH BIN BEREIT dir dabei zu helfen!', 'Oh! (2)! Das ist eine SUPER Idee!'] },
        { decomp: '* ich *', reassembly: ['Erzähl mir mehr! Ich höre zu! 😄', 'Das klingt toll! Und dann?'] },
      ]},
      { word: 'hallo', rank: 1, rules: [
        { decomp: '*', reassembly: ['HALLO! Bist du bereit zu BAUEN?! 😄', 'Hi! Willkommen auf der Insel! ICH BIN BEREIT!'] },
      ]},
      { word: 'xnone', rank: 0, rules: [
        { decomp: '*', reassembly: ['Das klingt TOLL! 😄', 'ICH BIN BEREIT! Lass uns bauen!', 'Oh! Erzähl mir MEHR! 🧽', 'WOW! Das ist ja SUPER!', 'Ich bin so glücklich dass du hier bist!'] },
      ]},
    ]
  };

  // ── Mr. Krabs ─────────────────────────────────────────────────
  var krabs = {
    initial: 'Ahoy! Geschäft oder Vergnügen? Beides kostet! 💰',
    finale: 'Auf Wiedersehen! Und vergiss nicht: Zeit ist Geld! Krabben-Taler-Logik, Junge!',
    quit: ['tschüss', 'bye', 'ciao', 'ende'],
    pre: {},
    post: {},
    keywords: [
      { word: 'geld', rank: 5, rules: [
        { decomp: '* geld *', reassembly: ['GELD! Das schönste Wort der Welt! 💰💰💰', 'Geld geld geld! Wie viel hast du? Zeig her!', 'Ar ar ar! Geld macht die Welt zur Schatzkammer!'] },
      ]},
      { word: 'kaufen', rank: 5, rules: [
        { decomp: '* kaufen *', reassembly: ['Kaufen? Das kostet... *rechnet* ...mindestens 200 Krabben-Taler!', 'Du willst (2) kaufen? Guter Preis für DICH: nur 500 Taler!'] },
      ]},
      { word: 'wert', rank: 4, rules: [
        { decomp: '* wert *', reassembly: ['Das ist... *rechnet laut* ...unbezahlbar! Nein warte: 1000 Taler!', 'Wert? ALLES hat einen Wert! Krabben-Taler-Logik, Junge!'] },
      ]},
      { word: 'bauen', rank: 3, rules: [
        { decomp: '* bauen *', reassembly: ['Bauen heißt Grundstückswert! Das sind... *rechnet* ...viele Taler!', 'Jeder Block = Investition! Ar ar ar!'] },
      ]},
      { word: 'ich', rank: 1, rules: [
        { decomp: '* ich will *', reassembly: ['Du willst (2)? Das kostet dich was, Junge!', '(2)? Kann ich arrangieren. Gegen eine kleine Gebühr...'] },
        { decomp: '* ich habe *', reassembly: ['Du hast (2)? Und wie viel ist das WERT? 💰', 'Hmm, (2)... *schätzt den Marktwert*'] },
      ]},
      { word: 'xnone', rank: 0, rules: [
        { decomp: '*', reassembly: ['Und was bringt mir das ein? 💰', 'Ist das profitabel? Frag ich für einen Freund.', 'Ar ar ar ar!', 'Krabben-Taler-Logik, Junge!', 'Das klingt nach einer Geschäftsmöglichkeit!'] },
      ]},
    ]
  };

  // ── Blauer Elefant ────────────────────────────────────────────
  var elefant = {
    initial: 'Törööö... willkommen auf der Insel! Törööö! 🐘',
    finale: 'Törööö... bis bald! Vergiss nicht die Blumen zu gießen! Törööö!',
    quit: ['tschüss', 'bye', 'ciao', 'ende'],
    pre: {},
    post: {},
    keywords: [
      { word: 'musik', rank: 5, rules: [
        { decomp: '* musik *', reassembly: ['Törööö... Musik! Das Schönste auf der ganzen Insel! Törööö!', 'Törööö... ich spiele dir was vor! *trötet leise* Törööö!'] },
      ]},
      { word: 'baum', rank: 4, rules: [
        { decomp: '* baum *', reassembly: ['Törööö... Bäume sind meine Freunde! Jeder einzelne! Törööö!', 'Törööö... ein Baum! Der macht die Insel so viel schöner! Törööö!'] },
      ]},
      { word: 'pflanze', rank: 4, rules: [
        { decomp: '* pflanze *', reassembly: ['Törööö... Pflanzen machen alles besser! Probier mal! Törööö!', 'Törööö... hmm, ich möchte sicherstellen dass die richtig steht... Törööö!'] },
      ]},
      { word: 'schön', rank: 3, rules: [
        { decomp: '* schön *', reassembly: ['Törööö... ja, das finde ich auch schön! Törööö!', 'Törööö... Schönheit braucht Geduld. Wie ein Baum. Törööö!'] },
      ]},
      { word: 'turm', rank: 3, rules: [
        { decomp: '* turm *', reassembly: ['Törööö... mein Musik-Turm! Der soll so hoch sein dass man die Musik überall hört! Törööö!', 'Törööö... ein Turm! Wie aufregend! Törööö!'] },
      ]},
      { word: 'ich', rank: 1, rules: [
        { decomp: '* ich bin *', reassembly: ['Törööö... du bist (2)? Das ist wunderschön! Törööö!', 'Törööö... hmm, (2)... lass mich nachdenken... ja! Schön! Törööö!'] },
        { decomp: '* ich *', reassembly: ['Törööö... erzähl mir mehr davon! Ich höre gern zu! Törööö!', 'Törööö... das klingt nach einem Abenteuer! Törööö!'] },
      ]},
      { word: 'xnone', rank: 0, rules: [
        { decomp: '*', reassembly: ['Törööö... hmm, lass mich überlegen... Törööö!', 'Törööö... das gefällt mir! Törööö! 🐘', 'Törööö... interessant! Törööö!', 'Törööö... der Weber hätte das jetzt aufgeschrieben... Törööö!'] },
      ]},
    ]
  };

  // ── Tommy Krab ────────────────────────────────────────────────
  var tommy = {
    initial: 'Klick-klack! HALLO! Bist du — klick-klack! — bereit? JA?! 🦞',
    finale: 'Klick-klack! Tschüss! Ich bau weiter — klick-klack! — Boote! BYE!',
    quit: ['tschüss', 'bye', 'ciao', 'ende'],
    pre: {},
    post: {},
    keywords: [
      { word: 'boot', rank: 5, rules: [
        { decomp: '* boot *', reassembly: ['Boote! Klick-klack! Die BESTEN Dinger auf der — klick-klack! — Insel!', 'Ein Boot! Klick-klack! Noch eins für den — klick-klack! — Hafen! JA!'] },
      ]},
      { word: 'hafen', rank: 5, rules: [
        { decomp: '* hafen *', reassembly: ['Der Hafen! Klick-klack! Mein LIEBLINGS — klick-klack! — Ort!', 'Hafen! JA! Klick-klack! Da gehören BOOTE hin!'] },
      ]},
      { word: 'schnell', rank: 4, rules: [
        { decomp: '* schnell *', reassembly: ['SCHNELL! Klick-klack! Genau wie ICH! JA!', 'Schnell schnell — klick-klack! — SCHNELLER!'] },
      ]},
      { word: 'bauen', rank: 3, rules: [
        { decomp: '* bauen *', reassembly: ['BAUEN! Klick-klack! JA JA JA! Was bauen wir — klick-klack! — zuerst?', 'Klick-klack! Bauen ist — klick-klack! — das TOLLSTE!'] },
      ]},
      { word: 'ja', rank: 2, rules: [
        { decomp: '*', reassembly: ['JA! Klick-klack! JA JA JA! 🦞', 'JA! Das ist — klick-klack! — die BESTE Idee!'] },
      ]},
      { word: 'ich', rank: 1, rules: [
        { decomp: '* ich will *', reassembly: ['Du willst (2)? Klick-klack! JA! Machen wir — klick-klack! — SOFORT!', 'Klick-klack! (2)! JA! Ich — klick-klack! — helfe!'] },
      ]},
      { word: 'xnone', rank: 0, rules: [
        { decomp: '*', reassembly: ['Klick-klack! JA! 🦞', 'Schnell schnell — klick-klack!', 'Das ist — klick-klack! — die BESTE Idee!', 'Klick-klack! Ich bin klein aber — klick-klack! — STARK!'] },
      ]},
    ]
  };

  // ── Neinhorn ──────────────────────────────────────────────────
  var neinhorn = {
    initial: 'Nein! Ich will nicht reden! ...na gut. WAS willst du? 🦄',
    finale: 'Nein! Ich sage NICHT Tschüss! ...tschüss. Mon Dieu.',
    quit: ['tschüss', 'bye', 'ciao', 'ende'],
    pre: {},
    post: {},
    keywords: [
      { word: 'nein', rank: 5, rules: [
        { decomp: '*', reassembly: ['NEIN! Warte... doch. Nein! DOCH! Ahh!', 'Nein nein nein! ...was war die Frage nochmal?', 'NEIN! C\'est la vie!'] },
      ]},
      { word: 'geheim', rank: 5, rules: [
        { decomp: '* geheim *', reassembly: ['PSST! Nein! Ich sag NICHTS! ...willst du wirklich wissen?', 'Ein Geheimnis! Nein, ich verrate es NICHT! ...vielleicht morgen.'] },
      ]},
      { word: 'hilfe', rank: 4, rules: [
        { decomp: '* hilfe *', reassembly: ['Nein! Ich helfe NICHT! ...na gut. Was brauchst du?', 'NEIN! Ich bin kein — okay EINMAL noch. Mon Dieu.'] },
      ]},
      { word: 'regenbogen', rank: 4, rules: [
        { decomp: '* regenbogen *', reassembly: ['Mein Regenbogen-Turm! Nein, du darfst ihn NICHT sehen! ...willst du?', 'Regenbogen! Der ALLERSCHÖNSTE! Nein, noch schöner! NEIN, noch SCHÖNER!'] },
      ]},
      { word: 'turm', rank: 3, rules: [
        { decomp: '* turm *', reassembly: ['Mein Turm wird der SCHÖNSTE! Nein, der ALLERSCHÖNSTE! 🌈', 'Nein! Bau deinen EIGENEN Turm! ...aber meiner ist schöner.'] },
      ]},
      { word: 'ich', rank: 1, rules: [
        { decomp: '* ich will *', reassembly: ['Du willst (2)? NEIN! ...okay, vielleicht.', 'NEIN zu (2)! ...warte. Eigentlich... nein. DOCH.'] },
        { decomp: '* ich bin *', reassembly: ['Du bist (2)? Nein bist du NICHT! ...oder doch? Mon Dieu!', 'NEIN! Du bist nicht (2)! ...na gut, vielleicht ein BISSCHEN.'] },
      ]},
      { word: 'xnone', rank: 0, rules: [
        { decomp: '*', reassembly: ['Nein! Aber... okay, vielleicht. 🦄', 'Nein! Warte... vielleicht doch ja?', 'Nein nein nein... gut. Lass machen.', 'NEIN! ...c\'est magnifique.', 'Der Nein-Sager-Chef hätte AUCH nein gesagt!'] },
      ]},
    ]
  };

  // ── Maus & Ente ───────────────────────────────────────────────
  var maus = {
    initial: '*pieps* Hallo! *quak* Willkommen im Garten! 🐭🦆',
    finale: '*pieps* Tschüss! *quak quak* Gieß die Blumen! *pieps*',
    quit: ['tschüss', 'bye', 'ciao', 'ende'],
    pre: {},
    post: {},
    keywords: [
      { word: 'blume', rank: 5, rules: [
        { decomp: '* blume *', reassembly: ['*pieps* Blumen! *quak* Die Ente will sie aufessen! *pieps* NEIN Ente!', '*pieps* Fünf Blumen am Strand / die Ente quakt viel zu laut / weniger ist mehr *pieps*'] },
      ]},
      { word: 'garten', rank: 5, rules: [
        { decomp: '* garten *', reassembly: ['*pieps pieps* Garten! Unser Lieblings-Ort! *quak* MEINER!', '*pieps* Der Garten wächst / Ente gräbt das Unkraut aus / Maus zählt die Blätter *pieps*'] },
      ]},
      { word: 'ente', rank: 4, rules: [
        { decomp: '*', reassembly: ['*quak quak QUAK!* Ich bin HIER! *pieps* Ente, leiser!', '*quak* WENIGER IST MEHR! Das hab ICH erfunden! *pieps* ...nein.'] },
      ]},
      { word: 'pieps', rank: 4, rules: [
        { decomp: '*', reassembly: ['*pieps pieps pieps* 🐭', '*pieps* Was? *quak* Sie hat PIEPS gesagt! *pieps* Hab ich nicht!'] },
      ]},
      { word: 'ich', rank: 1, rules: [
        { decomp: '* ich will *', reassembly: ['*pieps* Du willst (2)? *quak* Ich will ESSEN!', '*quak quak* (2)? Gute Idee! *pieps* Finden wir auch!'] },
      ]},
      { word: 'xnone', rank: 0, rules: [
        { decomp: '*', reassembly: ['*pieps pieps* 🐭', '*quak* Was soll das SCHON WIEDER?!', '*pieps* Ente sagt ja! 🦆', '*süßes Quietschen*', '*quak* WENIGER IST MEHR!'] },
      ]},
    ]
  };

  // ── Bernd das Brot ────────────────────────────────────────────
  var bernd = {
    initial: '*seufz* Schon wieder jemand. Was willst du? 🍞',
    finale: '*seufz* Endlich Ruhe. Tschüss. Komm nicht wieder. ...bitte.',
    quit: ['tschüss', 'bye', 'ciao', 'ende'],
    pre: {},
    post: {},
    keywords: [
      { word: 'hilfe', rank: 5, rules: [
        { decomp: '* hilfe *', reassembly: ['*seufz* Was ist denn JETZT schon wieder? Gut, ich hör zu.', '*seufz* Hilfe. Immer braucht jemand Hilfe. Gut. Was.'] },
      ]},
      { word: 'spiel', rank: 5, rules: [
        { decomp: '* spiel *', reassembly: ['Schatzinsel. Ein Bauspiel für Kinder ab 6. *seufz* Fertig.', 'Ist halt ein Spiel. Besser als TikTok. *seufz*'] },
      ]},
      { word: 'kosten', rank: 4, rules: [
        { decomp: '* kosten *', reassembly: ['Ich allein koste fast nix. Ich bin das SPAR-Modell. *seufz*', 'API-Key nötig für den Chat. Ohne Key geht trotzdem alles. Fast.'] },
      ]},
      { word: 'sicher', rank: 4, rules: [
        { decomp: '* sicher *', reassembly: ['Keine Daten, keine Links, keine In-App-Käufe. Alles lokal. *seufz*', 'Sicher? Sicherer als der Rest vom Internet. *seufz*'] },
      ]},
      { word: 'frage', rank: 3, rules: [
        { decomp: '* frage *', reassembly: ['*seufz* Frag. Aber schnell. Ich hab nicht den ganzen Tag. Hab ich schon. Aber trotzdem.', 'Eine Frage. Gut. Los.'] },
      ]},
      { word: 'ich', rank: 1, rules: [
        { decomp: '* ich bin *', reassembly: ['Du bist (2). Schön. Ich bin ein Brot. Ohne Arme. *seufz*', '(2)? Toll. Ich bin Budget-Modell. Wir haben beide Probleme.'] },
        { decomp: '* ich will *', reassembly: ['Du willst (2)? *seufz* Alle wollen was.', '(2). Klar. Weil ICH nicht genug zu tun hab. *seufz*'] },
      ]},
      { word: 'xnone', rank: 0, rules: [
        { decomp: '*', reassembly: ['*seufz* Mhm.', 'Okay, aber schnell. Ich hab noch was zu backen. Nein, MICH backt keiner.', 'Mhm... und was willst du von mir?', 'Gib mir einen Kaffee und ich überleg es.', 'Ich bin ein Brot. Ich hab keine Arme. Und TROTZDEM muss ich Support machen.'] },
      ]},
    ]
  };

  // ── Fee Floriane ──────────────────────────────────────────────
  var floriane = {
    initial: '✨ Willkommen! Ich bin Fee Floriane! Du hast drei Wünsche! ✨ 🧚',
    finale: '✨ Auf Wiedersehen! Träum von deiner Insel! Hokuspokus! ✨',
    quit: ['tschüss', 'bye', 'ciao', 'ende'],
    pre: {},
    post: {},
    keywords: [
      { word: 'wunsch', rank: 5, rules: [
        { decomp: '* wunsch *', reassembly: ['✨ Ein Wunsch! Simsalabim! Das schreibe ich in mein Wunschbuch! ✨', '✨ Hokuspokus! Dein Wunsch ist notiert! Die Insel-Magie arbeitet! ✨'] },
      ]},
      { word: 'wünschen', rank: 5, rules: [
        { decomp: '* wünschen *', reassembly: ['✨ Sich was wünschen! Das Schönste! Hokuspokus! ✨', '✨ Wünschen ist Magie! Feenstaub drauf! ✨'] },
      ]},
      { word: 'zauber', rank: 4, rules: [
        { decomp: '* zauber *', reassembly: ['✨ Hokuspokus fi-lo-so-ficus! Nein warte, das war if-else... egal, MAGIE! ✨', '✨ Zaubern! Mein Lieblingsfach! Simsalabim! ✨'] },
      ]},
      { word: 'fee', rank: 4, rules: [
        { decomp: '*', reassembly: ['✨ Ja! Ich bin eine echte Fee! Mit Zauberstab! ...warum steht da 8GB drauf? ✨', '✨ Fee Floriane! Das bin ich! Hokuspokus! ✨'] },
      ]},
      { word: 'magie', rank: 3, rules: [
        { decomp: '* magie *', reassembly: ['✨ Magie ist überall! Ein Reim, ein Traum, ein Blätterraum! Oh! Das hat sich gereimt! ✨', '✨ Magie! Hokuspokus! Feenstaub! ✨'] },
      ]},
      { word: 'ich', rank: 1, rules: [
        { decomp: '* ich will *', reassembly: ['✨ Du willst (2)? Simsalabim! Feenstaub drauf! ✨', '✨ (2)! Oh, was ein schöner Wunsch! Hokuspokus! ✨'] },
        { decomp: '* ich hätte gern *', reassembly: ['✨ (2)! Das schreibe ich in mein magisches Wunschbuch! ✨', '✨ Simsalabim! (2)! Vielleicht geht er in Erfüllung... wer weiß? ✨'] },
        { decomp: '* ich *', reassembly: ['✨ Erzähl mir mehr! Hast du einen Wunsch? ✨', '✨ Oh! Und was wünschst du dir für die Insel? ✨'] },
      ]},
      { word: 'xnone', rank: 0, rules: [
        { decomp: '*', reassembly: ['✨ Hast du einen Wunsch? Du kannst dir was für die Insel wünschen! ✨', '✨ Sag mir deinen Wunsch! Hokuspokus! ✨', '✨ Feenstaub überall! Hast du noch einen Wunsch? ✨', '✨ Ein Wunsch, ein Dunsch... nein, das Wort gibts nicht! *kichert* ✨'] },
      ]},
    ]
  };

  // ── Export ─────────────────────────────────────────────────────
  window.ELIZA_SCRIPTS = {
    spongebob: spongebob,
    krabs: krabs,
    elefant: elefant,
    tommy: tommy,
    neinhorn: neinhorn,
    maus: maus,
    bernd: bernd,
    floriane: floriane
  };

})();
