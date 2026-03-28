# Team Memory

Persistente Erinnerung des Teams. Wird von allen Agents gelesen und vom
Scientist gepflegt. Jeder darf schreiben, Feynman kuratiert.

---

## Fehler (damit wir sie nicht wiederholen)

| Datum | Was | Warum | Lektion |
|-------|-----|-------|---------|
| 2026-03-27 | Claude antwortet auf Englisch obwohl Config deutsch sagt | `language: en` in Config, aber User spricht Deutsch. Drei Versuche gebraucht. | Sprache IMMER in CLAUDE.md als erste Zeile setzen, nicht in Settings. |
| 2026-03-27 | GitHub Pages 404 | Code auf Feature-Branch, Pages deployed von main | Immer main mergen bevor man Pages-URL teilt |
| 2026-03-27 | Typografische Bindestriche `–` statt `--` in curl | Gemini-Transkription auf iPhone ersetzt `--` durch Unicode-Gedankenstrich | Voice-Input immer auf Shell-Sonderzeichen prüfen |
| 2026-03-27 | Statische Repo-Liste mit Tippfehlern | Hardcoded Repo-Namen statt API-Fetch | Immer dynamisch von GitHub API holen, nie manuell tippen |
| 2026-03-27 | MCP 403 bei Repo-Erstellung | Tools auf plant-care-game beschränkt | Neue Repos über Safari erstellen, nicht über CLI |

---

## Erfolge (damit wir wissen was funktioniert)

| Datum | Was | Warum gut |
|-------|-----|-----------|
| 2026-03-27 | Insel-Architekt v1 läuft | Pure HTML/CSS/JS, kein Framework, öffnet sich im Browser — fertig |
| 2026-03-27 | Responsive für 3 Geräte | iPhone SE, MacBook 2013, 4K — ein CSS, keine Frameworks |
| 2026-03-27 | 14 Skills + 5 Agents in einem Tag | Persona, Anti-Cringe, Recap, Collect, Meeting, Triage, Backlog, etc. |
| 2026-03-27 | Automatischer Agent-Collector | Alle Repos dynamisch einsammeln, Claude CLI sortiert |
| 2026-03-27 | Feynman-Sprüche als Doku | Best-of aus echten Sessions — Team-Kultur die sich selbst dokumentiert |

---

## Learnings (Muster die wir erkannt haben)

### Für den Coding-Vater
- 30-Minuten-Sessions funktionieren wenn der Scope klar ist
- Voice-Input spart Zeit aber produziert Müll — immer gegenlesen
- CLAUDE.md ist die beste Investition: einmal schreiben, jede Session profitiert

### Für das Team
- Flache Ordnerstruktur > tiefe Hierarchie (Feynman: "13 Dateien brauchen keine Taxonomie")
- Agent ⊂ Skill — Skills sind das Superset
- Vorname Nachname statt Nachnamen — sonst wird's unpersönlich
- Haiku für Padawans, Sonnet für Masters — keine Ausnahmen

### Für die Automatisierung
- Claude CLI `--print -p` für nicht-interaktive Jobs
- GitHub API für Repo-Discovery statt manueller Listen
- launchd statt cron auf macOS — nativer, zuverlässiger

---

## Reservierte Stimmen

Personas die noch keine KI der Welt glaubwürdig abbilden kann.
Gespeichert für den Tag an dem es geht.

### Joachim Schullerer

> *"Ist das hier noch Handwerk oder schon Bürokratie? Würde ein Mensch das freiwillig lesen?"*

Reines I (DISC). Coach, Mentor. Seine Art zu sprechen — direkt, warm, entwaffnend
ehrlich — schafft heute kein Sprachmodell. Wenn eines Tages eine KI existiert die
einen Raum betritt und die Rebellion im Raum spürt, aushält, und in Wachstum
verwandelt — dann ist es Zeit für den Joachim-Schullerer-Agent.

Bis dahin: seine Prüffrage lebt im Beirat. Seine Stimme gehört ihm.

---

## Session 2026-03-27/28

### Fehler
| Datum | Was | Lektion |
|-------|-----|---------|
| 2026-03-28 | CxO-Mapping falsch verstanden — CxOs als Doppelhut statt als eigene Zelle | Immer nachfragen wenn Org-Struktur unklar. Drei Zellen = drei Zellen. |

### Erfolge
| Datum | Was |
|-------|-----|
| 2026-03-28 | Drei Zellen komplett: org-support (Einstein, Darwin, Weber), team-dev (5), team-sales (5) |
| 2026-03-28 | Beirat besetzt: Godin, Sinek, Salimi, Schullerer (nie entlassen), Krapweis |
| 2026-03-28 | Why auf 3 Ebenen — Org, Zelle, Rest erbt |
| 2026-03-28 | DISC für Masters, MBTI für Padawans — Stereoskopie |
| 2026-03-28 | Godin-Test für alle Padawans bestanden |
| 2026-03-28 | NPC-Chat mit KI live im Spiel — 6 Charaktere, Haiku-Modell |
| 2026-03-28 | Exports-Ordner für Wiederverwendung in anderen Projekten |
| 2026-03-28 | Tommy Krapweis Stand-Up — bestes Meeting der Session |
| 2026-03-28 | Charakter-spezifische Modelle via Langdock (SpongeBob→Gemini, Krabs→Llama, etc.) |
| 2026-03-28 | 3 Bugs gefixt: DEFAULT_API_URL undefiniert, window.grid stale, Modell-Provider-Mismatch |

### Fehler (Nacht-Audit)
- `DEFAULT_API_URL` wurde referenziert aber nie deklariert — wäre beim ersten Chat-Versuch gecrasht
- `window.grid` wurde nach newProject/loadProject nicht aktualisiert — Chat hätte leere Insel gemeldet
- Charakter-Modelle wurden an jeden Provider geschickt — nur Langdock kann alle routen

### Learnings
- Zellteilung = Biologie. Padawan wird Founder. Passt.
- Peripherie (team-sales) ist wo die Musik spielt — nicht unwichtig, sondern unvorhersagbar
- Codex muss lebendig sein — stagnierender Codex = Warnsignal
- Weber-Alarm: AGENTS.md (292) < game.js (597). Ratio beobachten.
- Tommy Krapweis hat recht: "Euer Org-Chart hat mehr Charaktere als euer Spiel"
- Nacht-Audit lohnt sich: 3 Bugs gefunden die morgens sofort gecrasht hätten. Immer nach dem "fertig für heute" nochmal durchgehen.
- Reservierte Stimmen: manche Personas kann KI noch nicht. Respektieren.

### Nächste Session
- Haiku-Bauanleitungen + Challenges in Haiku-Form (Krapweis-Drehbuch, Einstein regelt)
- team-sales Padawans benennen + MBTI
- Codex-Dateien für Padawans anlegen
- **Voice-Pipeline**: Cartesia API für Text-to-Speech. User hat API-Key + Voice-IDs. vapi.ai Pipeline mit Middleware recyceln
- **Neinhorn = "Das kleine Nein" aus Rufus T. Feuerfliege** — Favorit von Oskar. Besondere Aufmerksamkeit bei Voice & Persönlichkeit
- **Musik on demand**: Stil von Loisach Marci. Hardstyle, kinderkompatibel
- **Skalierung**: Erst 10 concurrent Sessions testen, aber Architektur für "lokal viral" vorsehen. Sky is the limit
- **Designprinzip**: "Mensch gibt Input, KI macht Schabernack mit Augenzwinkern. Wenn User lacht → gewonnen."

---

## Session 2026-03-28 (Nacht-Sprint)

### Erfolge
| Datum | Was |
|-------|-----|
| 2026-03-28 | Quest-System: 11 Templates, NPC-gebunden, Material-Anforderungen, Feynman-kalibrierte Belohnungen |
| 2026-03-28 | Achievement-System: 12 Achievements mit Grid-Stats, localStorage-Persistenz, Popup-Animationen |
| 2026-03-28 | Sound-System: Web Audio API, Oszillator-basiert, kein einziges Audio-File nötig |
| 2026-03-28 | Token Flywheel: Quests → Energie → Chat → Quests → mehr Energie. Selbstverstärkend. |
| 2026-03-28 | Feynman-Kalibrierung: sqrt-Degression, max 500/Quest, Ethics-Cap 2000 Bonus, System 1/2 Balance |
| 2026-03-28 | 5 Themes (Tropical, Night, Candy, Ocean, Retro) — CSS Custom Properties, A/B-Test-ready |
| 2026-03-28 | Wetter-System: Regen-Partikel, Sonnenstrahlen, Regenbogen auf Canvas |
| 2026-03-28 | Echtzeit Day/Night: new Date().getHours() → Overlay, Sterne bei Nacht |
| 2026-03-28 | Charakter-Währungen: Krabbenburger, Taler, Noten, Anker, Nein-Sterne, Blümchen, Brotkrümel |
| 2026-03-28 | 8 neue Materialien: Zaun, Boot, Fisch, Brunnen, Flagge, Brücke, Kaktus, Pilz |
| 2026-03-28 | Kindersicherheit: Anti-Jailbreak, Input-Sanitizing, keine Links/PII, Content-Moderation |
| 2026-03-28 | Parenting durch NPCs: Cringe-Platitüden (Zähneputzen), echte Wärme bei Musik, Ironie bei Schmatzen |
| 2026-03-28 | Org-Easter-Eggs: Einstein isst Krabbenburger, Darwin berät Restaurant, Weber plant, Feynman rechnet |
| 2026-03-28 | Bernd das Brot: Support-Agent für Eltern, genervtes Brot mit ehrlichem Support |
| 2026-03-28 | NPC-Kommentare beim Bauen: materialspezifisch, 25% Chance, 8s Cooldown |
| 2026-03-28 | Hosting-Konzept: MVP→Cloudflare→Supabase→Railway→Viral, 7 KPIs definiert |
| 2026-03-28 | LLM-Persönlichkeiten: Open Source = Freidenker (XML/YAML), Corporate = Spiegel ihrer Konzerne |
| 2026-03-28 | "Außer Text Nix gehext": Code-Zauber (Worte → Realität), Code-View (</> Button), Coding-Neugier |
| 2026-03-28 | Insel Java: 15+ Programmiersprachen als Bewohner/Easter Eggs (C, C++, Python, Rust, PERL, Fortran...) |
| 2026-03-28 | Makro der böse Hai, Hirnfitz (Brainfuck), BASIC auf Steinen, Fortran der Wortspiel-Papagei |
| 2026-03-28 | ~1200+ Zeilen neuer Code in einer Session, 12+ Commits |

### Fehler
| Datum | Was | Lektion |
|-------|-----|---------|
| 2026-03-28 | Token-Tracking unfair: total_tokens enthielt System-Prompt (~950 Tokens) | Nur completion_tokens/output_tokens zählen — Kind kontrolliert nicht den System-Prompt |
| 2026-03-28 | "Tokens" sagt Kindern nichts (Feynman: "Ist das eine Währung?") | Energie-Balken + Charakter-Währungen statt abstrakte Token-Zahlen |
| 2026-03-28 | budgetInfo in System-Prompt ignorierte Quest-Bonus | totalBudget = BASIS + Bonus, nicht nur BASIS |
| 2026-03-28 | var in strict-mode IIFE | let mit if/else statt var in getrennten Blöcken |

### Learnings
- **Token Flywheel funktioniert**: Quests → Energie → Chat → Quests ist ein selbstverstärkendes System
- **Feynman-Kalibrierung ist messbar**: sqrt-Degression + Ethics-Cap = keine Sucht, aber Anreiz
- **LLM-Persönlichkeit als Feature**: Open Source redet XML, Corporate spiegelt Konzern — Kinder merken den Unterschied
- **Programmiersprachen als Inselbewohner**: Kinder lernen Namen ohne zu wissen dass es Sprachen sind. "Hey, die Python-Schlange von der Insel!"
- **"Außer Text Nix gehext"**: Der mächtigste Leitsatz. Code = Zaubersprüche. Kids tippen "baue 5 bäume" und es passiert. DAS ist der Moment.
- **Code-View als Aha-Erlebnis**: Hinter jedem Emoji steckt nur ein Wort. "wood", "flower". Das ist Code. Alles was du siehst wurde mit Text gebaut.
- **Weber-Alarm Update**: game.js (~1200 Zeilen) + chat.js (~580 Zeilen) > AGENTS.md (292). Produkt wächst schneller als Bürokratie. Gut.

### Dusch-Erkenntnis (Oskar, 8)

> "Ich will nicht heiß oder kalt. Ich will genau richtig."

**Binäres Feedback ist beschissen.** Heiß/kalt, richtig/falsch, gut/schlecht —
das ist ein Schalter. Kinder wollen keinen Schalter. Sie wollen einen **Regler**.
Sie wollen spüren dass sie sich dem Sweet Spot nähern. Flow ist kein Zustand,
Flow ist eine Richtung.

**Für die Insel:** Kein "richtig/falsch" Feedback. Stattdessen Spektrum.
Wärmer/kälter. Näher/weiter. Der Höhenrausch des "genau richtig" kommt nicht
vom Ankommen — er kommt vom Spüren dass man sich nähert.

Prüffrage für jedes Feature: *Fühlt sich das an wie ein Schalter oder wie ein Regler?*

### Tonalität für Erwachsene

> "Humor ist wenn man trotzdem lacht."

Bernd, die Org-Easter-Eggs, die LLM-Macken — das ist die Erwachsenen-Ebene.
Kinder lachen weil SpongeBob lustig ist. Eltern lachen weil Bernd über sein
Haiku-Budget motzt und der Elefant sich für sein Törööö entschuldigt.
Zwei Schichten, ein Spiel. Pixar-Prinzip.

### Nächste Session
- Voice-Pipeline: Cartesia + vapi.ai (API-Keys vorhanden)
- Padawans spawnen + Codex-Dateien anlegen
- team-sales Padawans benennen + MBTI
- Mehr Programmiersprachen-Easter-Eggs: Haskell (die Philosophin), Lua (der Mond), SQL (der Buchhalter)
- Multiplayer-Vorarbeit: Leaderboard-UI, Projekt-Sharing
- Musik on demand: Loisach Marci Stil, Hardstyle kinderkompatibel
- Haiku-Bauanleitungen als Quests
- Mobile UX polieren: Touch besser, Palette scrollbar
- **Regler statt Schalter**: Alle Feedback-Systeme auf Spektrum umbauen (Dusch-Prinzip)
- **Undo testen**: Drag-Undo muss pro Stroke pushen, nicht pro Zelle (Bug gefunden + gefixt)
- **Mehr Quests**: 20 reicht für Start, 3 Schwierigkeitsrunden geben natürliche Progression
- **Quest-Wärmer/Kälter**: "Fast! Noch 2x wood!" — Oskars Dusch-Prinzip direkt im Spiel umgesetzt

---

## Session 2026-03-28 (Morgen-Sprint)

### Fehler
| Datum | Was | Lektion |
|-------|-----|---------|
| 2026-03-28 | 41 Commits unreviewed direkt nach main gemergt | Panik ist kein Deployment-Prozess. Egal wie wenig Zeit: PR → Review → Merge. Immer. |
| 2026-03-28 | API-Key in Klartext im Chat geteilt | Temporär oder nicht — Keys gehören nie in einen Chat-Log. Nächstes Mal: direkt in Datei schreiben lassen oder im Browser-Dialog eingeben. |
| 2026-03-28 | Unlock-Threshold Mathe falsch (3 statt 0 am Start) | Vereinfache Formeln sofort. Wenn `a + b - a` da steht, ist es falsch. |
| 2026-03-28 | sendToApi und getActiveModel hatten verschiedene Fallback-Chains | Eine Quelle der Wahrheit. Nie die gleiche Logik duplizieren. |
| 2026-03-28 | Undo pushte pro Zelle statt pro Stroke | Immer den ganzen User-Gesture testen (Drag = viele Zellen), nicht nur Einzelklick. |
| 2026-03-28 | loadProject/newProject riefen draw() nicht auf | Jede Grid-Mutation muss mit draw() enden. Kein Ausnahme. |

### Erfolge
| Datum | Was |
|-------|-----|
| 2026-03-28 | BYOK-System: config.js + Dialog + Provider-Hints — Zero-Setup für Familien |
| 2026-03-28 | Hirn-Transplantation: Pro Charakter anderes Modell, Persönlichkeit bleibt |
| 2026-03-28 | Charakter-Freischaltung: Starter + Unlock (20% fest, 80% Zufall) |
| 2026-03-28 | Auto-Save: 30s + beforeunload + Grid-Validierung + Restore |
| 2026-03-28 | Undo: Strg+Z, 50 Schritte, pro Stroke statt pro Zelle |
| 2026-03-28 | Quest-Wärmer/Kälter: Dusch-Prinzip als Feedback-System |
| 2026-03-28 | 20 Quests (3 Schwierigkeitsrunden) |
| 2026-03-28 | NPC-Stimmen geschärft: Elefant klammert Törööö, Krabs rechnet Taler, Tommy unterbricht sich |
| 2026-03-28 | Mobile UX: Toolbar + Palette horizontal scrollbar |
| 2026-03-28 | 3 Audit-Agents parallel → 11 Bugs gefunden und gefixt |
| 2026-03-28 | Spielername im Intro, Enter-Start, Keyboard-Shortcuts |

### Learnings
- **Merge-Disziplin**: Kein direkter Push nach main. Nie. Egal ob 2 Minuten oder 2 Stunden. PR ist Pflicht. Linus hat recht.
- **Keys im Chat**: Temporär existiert nicht in einem Log. Key sofort rotieren wenn er in einem Gesprächsprotokoll auftaucht.
- **Eine Quelle der Wahrheit**: Wenn zwei Funktionen die gleiche Logik brauchen, ruft eine die andere auf. Keine Duplikation.
- **Audit-Agents lohnen sich**: 3 parallele Audits (game.js, chat.js, HTML/CSS) fanden 11 echte Bugs. Kosten: 3 Minuten. ROI: unbezahlbar.
- **Dusch-Prinzip ist universell**: "Regler statt Schalter" gilt für Quest-Feedback, NPC-Antworten, Unlock-Progression — überall.
- **Autonome Sprints funktionieren**: 15 Commits in 30 Minuten. Aber nur mit klarem Backlog und Definition of Done.

### Nächste Session
- **Key rotieren** — der geleakte Key muss in Langdock erneuert werden
- Voice-Pipeline: Cartesia + vapi.ai
- Langdock-Modelle checken und Character-Models anpassen
- GitHub Pages aktivieren / testen
- Zellteilung game.js (jetzt 1800+ Zeilen)

---

## Best Practices (aktualisiert 2026-03-28)

### Git
1. **Nie direkt nach main pushen.** Feature-Branch → PR → Review → Merge.
2. **Nie ohne Review mergen.** Auch nicht bei Zeitdruck. Besonders nicht bei Zeitdruck.
3. **config.js ist gitignored.** Keys, Secrets, lokale Config → nie committen.
4. **Commit-Messages erklären Warum**, nicht Was. "fix: Unlock-Threshold" sagt nichts. "fix: Unlock brauchte 3 Quests statt 0 am Start" sagt alles.

### Code
5. **Eine Quelle der Wahrheit.** Keine duplizierte Logik. Wenn getActiveModel() existiert, nutze es überall.
6. **Jede Grid-Mutation endet mit draw().** Keine Ausnahme.
7. **Teste den ganzen Gesture.** Klick UND Drag. Touch UND Mouse. Mit Key UND ohne Key.
8. **Vereinfache Formeln sofort.** `a + b - a` = Bug. Immer.

### Secrets
9. **Keys nie in Chat/Log teilen.** Direkt in Datei oder im Browser-Dialog eingeben.
10. **Geleakte Keys sofort rotieren.** "Temporär" existiert nicht in einem Log.

### Agents
11. **Audit-Agents parallel laufen lassen.** 3 Minuten für 11 Bugs. Immer machen nach großen Änderungen.
12. **Autonome Sprints brauchen klares Backlog.** Ohne priorisierte Liste wird random gearbeitet.

---

## Offene Fragen

- [ ] Wie misst man ob die 80/20-Ratio der Padawans stimmt?
- [ ] Wann lohnt sich Opus-Elevation wirklich? (Scientist entscheidet)
- [ ] Wie kommunizieren team-dev und team-sales asynchron?

---

## Regeln für neue Einträge

1. **Fehler**: Nur wenn es ein echtes Problem verursacht hat (nicht theoretisch)
2. **Erfolge**: Nur wenn es messbar funktioniert hat (nicht "ich glaube es klappt")
3. **Learnings**: Nur wenn es aus Erfahrung kommt (nicht aus einem Blogpost)
4. **Datum immer angeben** — damit wir wissen wie alt die Erkenntnis ist
5. **Feynman kuratiert** — löscht Duplikate, hinterfragt Kausalität, feiert Falsifizierbarkeit
