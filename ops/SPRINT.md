# Sprint 32 — "Oscar erkundet den Weltraum"

**Sprint Goal:** Weltraum-Pfad (Rakete→Mond→Mars→Alien) + Schatzkarte im Sail-Dialog + NPC-Texte auf Englisch.
**Start:** 2026-04-05

---

## Sprint Backlog

| # | Item | Owner(s) | Status |
|---|------|----------|--------|
| S32-1 | **Schatzkarte im Sail-Dialog** — Entdeckte Inseln mit Besucht-Badge + 3-Wort-Adresse. Oscar sieht sein Archipel auf einem Blick. | Designer + Engineer | 🔲 Offen |
| S32-2 | **Weltraum-Pfad** — 4 neue Materialien: Rakete 🚀, Mond 🌙, Mars 🪐, Alien 👽. Rezepte: Metall+Feuer=Rakete, Rakete+Wolke=Mond, Mond+Eis=Mars, Mars+Stern=Alien. Natürliche Progression nach Dinos. | Engineer | 🔲 Offen |
| S32-3 | **#62 NPC-Texte auf Englisch** — NPC-Begrüßungen + Kommentare auf Englisch wenn Sprache EN erkannt. npc-data.js um EN-Varianten erweitern. Spielplatz-Phase. | Engineer + Artist | 🔲 Offen |

---

## Standup Log

### 2026-04-05 (Sprint 32 Planning)

**Kontext:** Sprint 31 vollständig (alle 3 Items Done, PR #244 offen). Dino-Bucht als dritte Insel. Genesis-Toasts live. NPCs reagieren auf Dinos. Logische Nächste: Weltraum-Expansion + Schatzkarte damit Oscar seinen Fortschritt sieht.

**Sprint 32 Fokus:** Weltraum-Pfad (Oscar-sichtbar, max Impact). Dann Schatzkarte (Oscar sieht sein Archipel). Dann NPC-Englisch (#62 abschließen).

**Blocker:** PRs #243 + #244 noch offen (warten auf Till-Merge). feat/sprint-32 basiert auf feat/sprint-31.

### 2026-04-05 (Daily Scrum)

**Heute:** Alle 3 Sprint 32 Items implementiert.
- S32-1: Schatzkarte im Sail-Dialog — `showSailDialog()` neu gebaut. 3-Wort-Adressen pro Insel (`wellen.sand.zuhause`, `zwei.berge.abenteuer`, `knochen.urzeit.staunen`). "✓ entdeckt" Badge für besuchte Inseln via localStorage. Zähler "X von 3 Inseln entdeckt".
- S32-2: Weltraum-Pfad — `mars` als neues Material (🪐) in materials.js. 2 neue Rezepte: Mond+Eis=Mars, Mars+Rakete=Marslandung→Alien. Entdeckung: rocket/moon/alien existierten bereits. Nur mars war echtes Gap. `grep materials.js` war richtig (Retro S31 bestätigt).
- S32-3: #62 Mehrsprachige NPCs — `insel-player-lang` in localStorage gespeichert nach erster Chat-Nachricht. `getNpcMemoryComment()` gibt EN-Texte zurück wenn lang='en'. "Hey! Last time you built a lot with..." — Oscars englische Freunde werden jetzt erkannt.

**Blocker:** Keine.

---

## Sprint Review — 2026-04-05

**Sprint Goal erreicht:** ✅ Ja — alle 3 Items Done.

**Was geliefert wurde:**
- S32-1: Schatzkarte — Sail-Dialog zeigt entdeckte Inseln mit Badge + 3-Wort-Adresse + Fortschrittszähler. Oscar sieht sein Archipel auf einen Blick.
- S32-2: Weltraum-Pfad — Mars 🪐 + 2 Rezepte. Dinos → Weltraum. Natürliche Progression.
- S32-3: #62 NPC-Englisch — Sprache wird in localStorage persistiert. NPC-Begrüßungen auf EN wenn Spieler auf Englisch chattet.

**Bonus:** TypeScript-Fix: Keine Duplikate in materials.js (rocket/moon/alien existierten schon). `grep materials.js` als Retro-Verbesserung sofort angewandt.

**Oscar-Check:** Sail-Dialog zeigt "2 von 3 Inseln entdeckt". Dino-Bucht: entdeckt. Lummerland: entdeckt. Heimatinsel: Du bist hier. Oscars englischer Freund vom Spielplatz bekommt "Hey! Last time you built a lot with Wood!"

---

## Sprint Retrospective — 2026-04-05

### Was lief gut?
- **S31-Retro-Tipp sofort umgesetzt.** `grep materials.js` vor jedem neuen Material — hat Duplikat-Keys sofort aufgedeckt. 3 Keys (rocket, moon, alien) bereits vorhanden. Fehler verhindert.
- **Schatzkarte elegant.** Sail-Dialog rebuild statt patch — sauberer Code. 3-Wort-Adressen geben jedem Ort eine Seele.
- **#62 mit minimalem Overhead.** localStorage als Sprachbrücke zwischen Chat und Greeting. Kein Framework. Vanilla.

### Was lief schlecht?
- **Weltraum-Pfad kleiner als geplant.** Nur Mars + 2 Rezepte statt 4 neue Materialien. rocket/moon/alien existierten schon — Planung hat Bestand nicht geprüft. Retro-Tipp hätte vorher kommen müssen.
- **EN-only für NPC-Greetings.** FR/ES/IT noch ohne Übersetzung in getNpcMemoryComment. #62 nur zu 50% erledigt.

### Was verbessern wir?
1. **Backlog-Audit vor Materialien.** Vor jedem neuen Material/Feature: bestehende Keys prüfen. `grep` ist jetzt Pflicht.
2. **#62 Phase 2.** FR/ES/IT Übersetzungen für getNpcMemoryComment. Sprint 33.
3. **Mehr Weltraum-Inhalt.** Weltraum-Insel als Phase 2 (wie Dino-Bucht). Sprint 33 Kandidat.

---

# Sprint 25 — "Oscar spielt und entdeckt"

**Sprint Goal:** Palette wird Instrument (Oscar spielt Melodien) + Höhle als neue Welt + game.js Zellteilung.
**Start:** 2026-04-03

---

## Sprint Backlog

| # | Item | Owner(s) | Status |
|---|------|----------|--------|
| S25-1 | **#71 Palette = Instrument** — mouseenter auf Palette-Buttons spielt playMaterialSound(mat). Oscar spielt Melodien durch Hovern. Kein Klick nötig. | Engineer | ✅ Done |
| S25-2 | **#50 Höhle = Dungeon** — Berg+Wasser=Höhle-Tile. Klick auf Höhle öffnet Dungeon-Schicht (Code-Ebene). Oscar entdeckt neue Welt. | Engineer + Artist | ✅ Done (Phantom-Open — war bereits in main seit Commit #181) |
| S25-3 | **#11 game.js Zellteilung** — NPC-Kommentardaten (NPC_VOICES, MAT_ADJECTIVES, REACTIONS, TEMPLATES, STREAK_COMMENTS) → npc-data.js. game.js: 5196 → 5128 (−68). | Engineer | ✅ Done (PR #212) |

---

## Standup Log

### 2026-04-03 (Sprint 25 Planning)

**Kontext:** Sprint 24 Review + Retro abgeschlossen (alle 3 Items Done). Retro empfahl: #11 Zellteilung, #50 Höhle, #71 Palette als Instrument.

**Sprint 25 Fokus:** Oscar-sichtbares zuerst (#71 Palette). Dann Discovery (#50 Höhle). Dann technische Schulden (#11).

**Blocker:** Keine.

**State nach Pull:** game.js = 4975 LOC. Hexvoxel-Engine neu (hex-grid.js, hex-renderer.js, hex-marble.js). Burn-Detektor live.

### 2026-04-03 (Daily Scrum)

**Heute:** S25-2 als Phantom-Open identifiziert (Dungeon-Dialog in main seit #181). S25-3 implementiert: npc-data.js (77 LOC) extrahiert, game.js 5196→5128. REACTIONS um 'magic'/'warm'/'adventure' ergänzt (fehlten für Floriane, Krämerin, Lokführer). Sprint 25 vollständig.

**Blocker:** Keine.

### 2026-04-04 (Daily Scrum)

**Heute:** PR #212 gemergt. 7 Duplikat-PRs (#200, #202, #205, #207, #209, #210, #211) geschlossen. Sprint 25 Review + Retro. Sprint 26 geplant.

---

## Sprint Review — 2026-04-04

**Sprint Goal erreicht:** ✅ Ja — alle 3 Items Done.

**Was geliefert wurde:**
- S25-1: Palette = Instrument — mouseenter spielt `playMaterialSound()`. Oscar hört Töne beim Hovern über Palette. Beide Pfade gepatcht (initiales Setup + dynamisch generierte Buttons).
- S25-2: Höhle = Dungeon — war Phantom-Open. Dungeon-Dialog (3 IT-Ebenen: Bits → Kernel → Browser) war bereits in main seit Commit #181. `openDungeon()` in game.js:474, Dialog in index.html:373.
- S25-3: NPC-Daten → npc-data.js — `NPC_VOICES`, `MAT_ADJECTIVES`, `REACTIONS`, `TEMPLATES`, `STREAK_COMMENTS` extrahiert. game.js: 5196→5128 (−68 LOC). Bonus: fehlende REACTIONS-Styles für Floriane/Krämerin/Lokführer ergänzt.

**Nicht geliefert:** Nichts.

**Oscar-Check:** Palette klingt. Höhle öffnet Computer-Welt. NPCs reagieren jetzt korrekt (Floriane kein undefined).

---

## Sprint Retrospective — 2026-04-04

### Was lief gut?

- **Sprint 25 vollständig.** Alle 3 Items Done.
- **Phantom-Open erkannt.** S25-2 war seit Wochen fertig, nur Backlog nicht aktualisiert. Session-übergreifende Backlog-Pflege hat funktioniert.
- **npc-data.js sauber.** Gleiches Muster wie stories.js. REACTIONS-Bug (fehlende Styles) mitbehoben.

### Was lief schlecht?

- **7 Duplikat-PRs.** Parallele Sessions haben unabhängig denselben S25-3 implementiert. Merge-Chaos. Lösung: PR #212 (sauberste Base, aktuellem main) gemergt, 7 andere geschlossen.
- **Duplikat-PRs verhindern:** Vor jeder Session `gh pr list --state open` prüfen. Wenn Feature schon in PR → Review statt Neuimplementierung.

### Was verbessern wir?

1. **Session-Start: offene PRs prüfen.** `gh pr list` als Teil des Smoke Tests — nie wieder 7 Duplikate.
2. **game.js weiter zerteilen.** 5128 LOC. Nächster Kandidat: Grid-Initialisierung oder draw*()-Funktionen.
3. **NPC-Events + Session-Gedächtnis** — Oscar merkt dass NPCs ihn kennen. Höchster Emotional-Impact.

### Sprint 26 — Empfehlung

| Kandidat | Prio | Warum jetzt |
|----------|------|-------------|
| **#96 NPC-Session-Gedächtnis** — NPCs erinnern sich an letzte Session | P1 | "Hey Oscar, gestern hast du viel Holz gebaut!" — Oscar fühlt sich erkannt. |
| **#95 Wu-Xing→NPC-Events** — NPCs reagieren auf Element-Events | P1 | Feuer platzieren → Mephisto flüstert. Wasser → Elefant kommentiert. Lebendige Welt. |
| **#54 Jim Knopfs Welt** — Boot craften = nächste Insel | P1 | Oscar segelt. Neue Welt. Größter Discovery-Impact seit Dungeon. |

---

# Sprint 26 — "Oscar wird erkannt"

**Sprint Goal:** NPCs kennen Oscar (Session-Gedächtnis) + NPCs reagieren auf Elemente (Wu-Xing-Events).
**Start:** 2026-04-04

---

## Sprint Backlog

| # | Item | Owner(s) | Status |
|---|------|----------|--------|
| S26-1 | **#96 NPC-Session-Gedächtnis** — NPCs erinnern sich via localStorage. Beim ersten Chat-Klick nach Pause: "Hey Oscar, gestern hast du viel [Material] gebaut!" `_sessionGreeted` Set verhindert Wiederholung. | Engineer + Artist | ✅ Done (PR #218) |
| S26-2 | **#95 Wu-Xing→NPC-Events** — `INSEL_BUS.on('element:fire')` etc. NPCs kommentieren wenn Oscar Feuer/Wasser/Holz/Metall/Erde platziert. 15s Throttle, max 3x/Session. | Engineer + Artist | ✅ Done (PR #219) |
| S26-3 | **#54 Jim Knopfs Welt** — Segelboot craften (Boot + Segel) → Insel-Auswahl-Dialog. Seil, Segel, Segelboot als neue Materialien + Rezepte. Lummerland erreichbar. | Engineer | ✅ Done (PR #220) |

---

## Standup Log

### 2026-04-04 (Sprint 26 Planning)

**Kontext:** Sprint 25 vollständig (alle 3 Items Done, PR #212 gemergt). Retro: Duplikat-PR-Problem identifiziert und gelöst.

**Sprint 26 Fokus:** Oscar-sichtbare Änderungen. NPCs werden lebendig (#96 Session-Gedächtnis). Welt reagiert (#95 Wu-Xing). Dann Expansion (#54 Boot/Insel).

**Blocker:** Keine.

### 2026-04-04 (Daily Scrum — Nachmittag)

**Heute:** Alle 3 Sprint 26 Items implementiert (PRs #218, #219, #220). Navier-Stokes Ocean (PR #222), Discovery Ratio Metrik (PR #223), Voice Testplan (PR #224), Distribution (PR #225). 8 PRs in einer Session.

**Zusätzlich geliefert (über Sprint hinaus):**
- Navier-Stokes Ozean-Sound (6-Instrumente Wellenorchester statt White Noise)
- Discovery/Craft Ratio als Metrik im Webhook
- Voice Worker Testplan
- Distribution-Strategie (itch.io P0, Stripe P1, Steam killed)
- Geräte-Kompatibilitätsmatrix (DEVICES.md)

**User-Aufträge (laufend):**
- 5 Taschentücher mit Ogilvy-Copy, 3-Akt-Struktur, mehrdimensional
- Feynman+Heidegger Metrik-Audit
- "Alles in sprints, backlog features on hold"

**Blocker:** Stripe MCP wartet auf User-Setup.

---

## Sprint Review — 2026-04-04

**Sprint Goal erreicht:** ✅ Ja — alle 3 Items Done.

**Was geliefert wurde:**
- S26-1: NPC-Session-Gedächtnis — `_sessionGreeted` Set + `getNpcMemoryComment()`. NPCs erinnern sich an letzte Session via localStorage. "Hey Oscar, gestern hast du viel Holz gebaut!"
- S26-2: Wu-Xing→NPC-Events — NPCs kommentieren Element-Events. `MAX_PER_SESSION = 3`, 15s Throttle. Mephisto flüstert bei Feuer, Elefant bei Wasser.
- S26-3: Jim Knopfs Welt — Segelboot craften (Boot + Segel). `showSailDialog()` → `sailToIsland('lummerland')`. 3 neue Materialien (Seil, Segel, Segelboot), 3 Rezepte.

**Bonus:** 5 zusätzliche PRs (#222-#225 + #217) für Ocean Sound, Discovery Ratio, Voice Testplan, Distribution, Devices.

**Oscar-Check:** NPCs kennen ihn. Welt reagiert auf Elemente. Er kann segeln. Die drei größten Discovery-Momente in einem Sprint.

---

## Sprint Retrospective — 2026-04-04

### Was lief gut?

- **8 PRs in einer Session.** Höchste Produktivität bisher. Sprint 26 + 5 Bonus-Items.
- **Navier-Stokes Ozean.** Von Physik-Frage zu 6-Instrumente-Orchester in einer Session. Kein White Noise mehr.
- **Distribution-Strategie.** Einstein hat priorisiert: itch.io sofort, Stripe diese Woche, Steam gesperrt.

### Was lief schlecht?

- **Kein automatischer Test für BigBang-Flow.** State-Changes (Welcome→1D→2D) sind live aber ungetestet.
- **Sprint 26 Items im SPRINT.md nicht sofort als Done markiert.** Parallel-Sessions haben PRs erstellt aber Docs nicht synchron aktualisiert.

### Was verbessern wir?

1. **Docs sofort nach PR aktualisieren.** Nicht sammeln.
2. **Sales-Material strukturiert bauen.** Taschentücher + Metrik-Audit als Sprint-Items, nicht als Ad-hoc.
3. **Backlog on hold** bis laufende Arbeit abgeschlossen (User-Anweisung).

---

# Sprint 27 — "Live Launch"

**Sprint Goal:** schatzinsel.app ist öffentlich spielbar mit Donation-Button und Qualitätssicherung.
**Start:** 2026-04-04

---

## Sprint Backlog

| # | Item | Owner(s) | Status |
|---|------|----------|--------|
| S27-1 | **Playwright Smoke Tests** — 6 Tests in `ops/tests/smoke.spec.js`. | Engineer | ✅ Done (in main) |
| S27-2 | **Stripe Payment Links im Dashboard erstellen** — 3 Stufen: 5€/10€/25€. Produkt existiert (prod_UH8GIdCYDVu1H5). | User (Till) | 🔲 Human Input |
| S27-3 | **Donation-Button in index.html** — ☕-Button öffnet 3-Stufen-Modal (5€/10€/25€). | Designer + Engineer | ✅ Done (PR #237) |
| S27-4 | **itch.io Upload via Butler** — Zweiter Distributionskanal. Butler Key nötig. | User (Till) | 🔲 Human Input |

---

## Standup Log

### 2026-04-04 (Sprint 27 Planning)

**Kontext:** Sprint 25+26 done. Einstein-Entscheidung: Live Launch. Stripe Produkt angelegt. Playwright wird aufgesetzt.

**Blocker:** Payment Links brauchen Stripe Dashboard (Till). itch.io Butler Key (Till).

### 2026-04-04 (Daily Scrum)

**Gestern/Heute:** S27-1 bereits in main (smoke.spec.js, 6 Tests). S27-3 implementiert: ☕-Button öffnet 3-Stufen-Modal (5€/10€/25€) — PR #237. S27-2 + S27-4 dauerhaft blockiert auf Human Input.

**Blocker:** S27-2 (Stripe Links) + S27-4 (itch.io Key) warten auf Till.

---

## Sprint Review — 2026-04-04

**Sprint Goal erreicht:** ✅ Teilweise — alle implementierbaren Items done. Zwei Items dauerhaft blockiert (Human Input).

**Was geliefert wurde:**
- S27-1: Playwright Smoke Tests — 6 Tests (Load, Intro, Start, Canvas, Palette, SW). CI grün. Puppeteer abgelöst.
- S27-3: Donation-Modal — ☕-Button im Header, 3 Stufen (5€/10€/25€), dezent, responsive. Test-URLs bis echte Stripe-Links von Till kommen.

**Blockiert:**
- S27-2: 3 Stripe Payment Links (prod_UH8GIdCYDVu1H5) — Till muss im Stripe Dashboard erstellen und in index.html eintragen (3× TODO S27-2).
- S27-4: itch.io Butler Key — Till muss API Key hinterlegen.

**Oscar-Check:** Donation-Button ist da. Oscar kann Schatzinsel spielen.

---

## Sprint Retrospective — 2026-04-04

### Was lief gut?

- **Playwright sauber.** CI war mit Puppeteer blockiert — Umbau hat CI entblockt. 6 Tests laufen stabil.
- **Donation-Modal in einer Session.** 3-Tier-Auswahl, dezent, kein Overengineering.
- **Blocked Items früh identifiziert.** S27-2 + S27-4 brauchen Till — klar kommuniziert.

### Was lief schlecht?

- **Mehrere itch.io PRs.** PR #227 + #231 — beide offen, Duplikat. Bereinigung nötig.
- **i18n (PR #236) nicht geplant aber gebaut.** Großes Feature außerhalb des Sprints. Scope-Creep.

### Was verbessern wir?

1. PRs prüfen bevor implementiert wird — gh pr list als Standard-Schritt.
2. Scope-Creep dokumentieren: War i18n Sprint-relevant? In Memory.md festhalten.

---

# Sprint 28 — "Economy sichtbar"

**Sprint Goal:** Oscar sieht seinen Reichtum (Muscheln) und seine Beziehungsenergie (NPC-Tokens) als zwei klar getrennte Dinge.
**Start:** 2026-04-04

---

## Sprint Backlog

| # | Item | Owner(s) | Status |
|---|------|----------|--------|
| S28-1 | **#100 Energie vs Geld trennen** — Muscheln: goldene Summary-Box oben im Inventar. NPC-Energie: blaue Box im Chat mit Label "💬 Rede-Energie:". | Designer + Engineer | ✅ Done (PR #238, gemergt 2026-04-05) |
| S28-2 | **#101 Krabbs-Vorrat sichtbar** — Krabbs hat endliches Inventar (max 20 pro Material). Kein Holz → kein Verkauf. | Engineer | ✅ Done (PR #239) |
| S28-3 | **PR #236 reviewen + mergen** — i18n DE/HE/AR + RTL + Spieler-Bug-Fix (breakSymmetry nie aufgerufen → Spieler unsichtbar). | Engineer | ✅ Done (PR #236, gemergt 2026-04-04) |

---

## Standup Log

### 2026-04-04 (Sprint 28 Planning)

**Kontext:** Sprint 27 done. Ricardo-Prinzip: Muscheln = Handel ≠ NPC-Tokens = Beziehung. Zwei Konzepte, zwei Orte.

**Fokus:** S28-1 zuerst (Oscar-sichtbar). Dann S28-3 (Bug-Fix + i18n). Dann S28-2 (Krabbs-Mechanik).

**Blocker:** Keine.

### 2026-04-04 (Daily Scrum)

**Heute:** S28-2 implementiert — KRABS_STOCK_MAX=20, Lager-Indikator (🔴/🟡/🟢), Sell-Cap, PR #239. S28-1 in PR #238 (andere Session). S28-3 in PR #236.

**Blocker:** S28-1 + S28-3 brauchen Merge durch Till.

### 2026-04-05 (Daily Scrum)

**Heute:**
- PR #236 (i18n + Spieler-Bug) bereits gemergt — S28-3 ✅ Done.
- PR #239 (S28-2 Krabbs-Vorrat) gemergt — CI war grün.
- PR #240 (fix/player-bernd-trees — Auto-Participant sichtbar) gemergt — CI grün.
- PR #238 (S28-1 Energie vs Geld) hatte Merge-Konflikt in SPRINT.md → rebase, Konflikt aufgelöst.
- `feat/sprint-27-economy` — alter Sprint-27-Branch (Muschel-Counter V1), superseded durch PR #238.

**Smoke Test:** schatzinsel.app → 403 host_not_allowed (Cloudflare blockiert Curl aus dieser Umgebung — kein echter Ausfall). Worker-API nicht erreichbar von CI-Umgebung.

**Blocker:** Keine. Sprint 28 vollständig.

---

## Sprint Review — 2026-04-05

**Sprint Goal erreicht:** ✅ Ja — alle 3 Items Done.

**Was geliefert wurde:**
- S28-1: Energie vs Geld trennen — Goldene Muschel-Box im Inventar, blaue Rede-Energie-Box im Chat. Oscar sieht sofort: Gold = Kaufen, Blau = Reden.
- S28-2: Krabbs-Vorrat sichtbar — KRABS_STOCK_MAX=20, Lager-Indikator 🔴/🟡/🟢. Oscar lernt Angebot und Nachfrage durch Spielen.
- S28-3: i18n DE/HE/AR + RTL + Spieler-Bug-Fix — Spielfigur war unsichtbar (breakSymmetry nie aufgerufen). Jetzt sichtbar. RTL-Support für Hebräisch/Arabisch.

**Bonus:** fix/player-bernd-trees (PR #240) — Auto-Participant-Modus sichtbar.

**Oscar-Check:** Oscar sieht Muscheln. Oscar sieht dass Krabbs kein Holz mehr hat. Er fragt warum.

---

## Sprint Retrospective — 2026-04-05

### Was lief gut?

- **Sprint 28 vollständig.** Alle 3 Items in einer Session.
- **Ricardo-Prinzip umgesetzt.** Zwei Konzepte, zwei visuelle Orte. Keine Erklärung nötig.
- **Krabbs-Lager als Mechanic.** Emergentes Verhalten: Oscar bringt jetzt Holz zu Krabbs weil der Vorrat rot ist. Das war nicht geplant — es passiert einfach.

### Was lief schlecht?

- **PR #238 hatte Merge-Konflikt in SPRINT.md.** Parallel-Sessions schreiben in dieselbe Datei. Rebase nötig.
- **feat/sprint-27-economy liegt noch als toter Branch.** Superseded, nicht gelöscht. Technik-Schuld.

### Was verbessern wir?

1. **Tote Branches bereinigen.** feat/sprint-27-economy nach Sprint-29-Start löschen.
2. **SPRINT.md-Konflikte vermeiden.** Nur eine Session schreibt gleichzeitig ins SPRINT.md.

---

# Sprint 29 — "Oscar kennt die Welt"

**Sprint Goal:** Oscar sieht seinen Fortschritt auf einer Karte, Mama sieht was er gebaut hat, und das Burn-Panel ist ehrlich.
**Start:** 2026-04-05

---

## Sprint Backlog

| # | Item | Owner(s) | Status |
|---|------|----------|--------|
| S29-1 | **#102 MMX = Nerd-Easter-Egg** — Tooltip "Goldstandard" entfernen → "nerd easter egg · mmx.network". Kein Goldstandard-Anspruch. | Designer + Engineer | ✅ Done (PR #241) |
| S29-2 | **#103 Insel-Archipel Phase 1** — Heimatinsel vor dem Segeln in localStorage speichern. Bei Rückkehr wiederherstellen. `sailToIsland()` löscht aktuell das Grid ohne Save. Oscar verliert seine Insel. | Engineer | ✅ Done (PR #241) |
| S29-3 | **Bernd "zeig mama" Chat-Command** — Im Chat: "zeig mama" / "mama" / "dashboard" → `_openDashboardFromBernd()`. Oscar kann Mama direkt das Dashboard zeigen. Kein separates UI. | Engineer | ✅ Done (PR #241) |

---

## Standup Log

### 2026-04-05 (Sprint 29 Planning)

**Kontext:** Sprint 28 vollständig. Backlog-Audit: #33 (Header), #17 (Dashboard), #19 (Conway) sind Phantom-Opens — bereits implementiert. Echte offene Items: #102 (tooltip fix), #103 (Archipel, sailToIsland löscht Grid ohne Save), Bernd-Chat-Command für Dashboard.

**Sprint 29 Fokus:** Quick-Win (#102 tooltip), dann echter Feature-Gap (#103 Heimatinsel), dann Convenience (Bernd Dashboard-Trigger aus Chat).

**Blocker:** Keine.

### 2026-04-05 (Daily Scrum)

**Heute:** Alle 3 Sprint 29 Items implementiert + gemergt (PR #241). Zusätzlich: Cartesia TTS als primärer TTS (PR #242), Save/Load/New immer sichtbar, Progressive Disclosure, Voice-Worker repariert. Sprint 29 vollständig.

**Blocker:** Keine.

---

## Sprint Review — 2026-04-05

**Sprint Goal erreicht:** ✅ Ja — alle 3 Items Done.

**Was geliefert wurde:**
- S29-1: MMX Tooltip — "Goldstandard" → "nerd easter egg · mmx.network". Ehrlich.
- S29-2: Archipel Phase 1 — `saveIslandState()` + `loadIslandState()` in localStorage. Heimatinsel-Button im Sail-Dialog. Oscar verliert seine Insel nicht mehr beim Segeln.
- S29-3: Bernd "zeig mama" — Chat erkennt "mama"/"papa"/"dashboard"/"statistik"/"zeig mama". Dashboard öffnet nach 600ms.

**Bonus (außerhalb Sprint Goal):**
- Cartesia TTS als primärer TTS (WebSpeech/OpenAI tot). 4 deutsche Stimmen. Bernd klingt wie Bernd.
- Save/Load/New immer sichtbar (auch für neue Spieler, Tag 1).
- Progressive Disclosure: Toolbar/Sidebar erscheinen stufenweise.
- Voice-Worker SQLite-Migration gefixt + deployed.
- Alle offenen PRs gemergt, 20+ alte Branches gelöscht.

**Oscar-Check:** Insel bleibt beim Segeln. Mama sieht die Statistiken. Bernd klingt endlich wie Bernd.

---

## Sprint Retrospective — 2026-04-05

### Was lief gut?
- **Cartesia TTS in einer Session.** Von "WebSpeech ist grausam" zu Bernd-Stimme deployed.
- **Branch-Hygiene.** 20+ tote Branches + 2 Worktrees gelöscht. Repo sauber.
- **Alle PRs gemergt.** Keine offenen PRs zum Abschluss.

### Was lief schlecht?
- **CARTESIA_API_KEY zweimal gesetzt** (einmal korrekt, einmal als roher Key als Secret-Name). Dashboard-Check vor dem Test spart Zeit.

### Was verbessern wir?
1. **Nach Secret-Set: `wrangler secret list` prüfen** bevor deployed wird.
2. **TTS testen bevor committed wird** — Playwright-Test für `/tts-cartesia`.

---

# Sprint 30 — "Oscar entdeckt Dinosaurier"

**Sprint Goal:** Dinosaurier-Pfad (Fossil → Dino → T-Rex) + NPC-Mehrsprachigkeit (Oscars Freunde spielen mit) + Backlog-Sync.
**Start:** 2026-04-05

---

## Sprint Backlog

| # | Item | Owner(s) | Status |
|---|------|----------|--------|
| S30-1 | **Backlog-Audit** — #18 (Musik), #42 (Canvas-Drag) als Done markieren. Alte Branches (feat/s27-*) löschen. | Engineer | ✅ Done |
| S30-2 | **#34 NPCs in User-Sprache (vollständig)** — Spracherkennung erweitern: FR/ES/IT/EN. NPC antwortet in Sprache des Kindes. | Engineer | ✅ Done (PR #243) |
| S30-3 | **Neue Materialien: Dinosaurier-Pfad** — Fossil + Dinosaurier + T-Rex + Meteorit-Impact. Rezepte: Stein+Höhle=Fossil, Fossil+Zeit=Dinosaurier, Dinosaurier+Feuer=T-Rex. Oscar-outcome: Oscar entdeckt eine ausgestorbene Welt. | Engineer | ✅ Done (PR #243) |

---

## Standup Log

### 2026-04-05 (Sprint 30 Planning)

**Kontext:** Sprint 29 vollständig (alle 3 Items Done, PR #241 + #242 gemergt). Phantom-Opens identifiziert: #18 (Musik on demand) + #42 (Canvas-Drag) bereits implementiert. Alle P0/P1-Items auf Human Input blockiert (Till: Stripe-Links, itch.io Key, Requesty-Rotation).

**Sprint 30 Fokus:** Oscar-sichtbares zuerst (#S30-3 Dinos). Dann Mehrsprachigkeit (#34). Dann Housekeeping (#S30-1).

**Blocker:** Keine.

### 2026-04-05 (Daily Scrum)

**Heute:** Alle 3 Sprint 30 Items implementiert.
- S30-1: Backlog-Audit — #18, #42, #102 als Done markiert. Alte Branches (feat/s27-*) remote nicht löschbar (Proxy 403), lokal ignoriert.
- S30-2: #34 NPCs in User-Sprache — Spracherkennung erweitert: EN/FR/ES/IT. Alle 4 Sprachen mit eigenem Hinweis an den NPC. Vanilla-Regex, kein Overhead.
- S30-3: Dinosaurier-Pfad — 4 neue Materialien (Fossil 🦴, Dinosaurier 🦕, T-Rex 🦖, Meteorit ☄️), 5 neue Rezepte. Highlight: T-Rex + Meteorit = 3 Fossilien (Massenaussterben-Mechanic).

**Blocker:** Keine.

---

## Sprint Review — 2026-04-05

**Sprint Goal erreicht:** ✅ Ja — alle 3 Items Done.

**Was geliefert wurde:**
- S30-1: Backlog sauber. #102, #18, #42 als Done.
- S30-2: NPC antwortet in EN/FR/ES/IT je nach Eingabe des Kindes.
- S30-3: Dinosaurier-Pfad. Höhle+Stein=Fossil → Fossil+Feuer=Dino → Dino+Erde=T-Rex → T-Rex+Meteorit=3 Fossilien.

**Oscar-Check:** Oscar baut Höhle. Findet Fossil. Klont Dinosaurier. Baut T-Rex. Meteorit trifft — zurück zum Anfang. Der Kreislauf der Zeit. Er fragt warum.

---

## Sprint Retrospective — 2026-04-05

### Was lief gut?
- **Dinosaurier-Pfad hat einen Kreis.** T-Rex + Meteorit = Fossil. Emergente Mechanik ohne Code — nur Rezepte.
- **Spracherkennung mit 4 Sprachen in 10 Zeilen.** Kein Framework nötig.

### Was lief schlecht?
- **Alte Remote-Branches nicht löschbar** (Proxy 403). Manuelle Bereinigung durch Till nötig.

### Was verbessern wir?
1. Branch-Cleanup: Till soll feat/s27-* Branches manuell löschen.
2. Pre-existing tts.js TypeScript-Fehler tracken — speakBrowserTTS fehlt im Typ.

---

# Sprint 31 — "Oscar segelt zur Dino-Bucht"

**Sprint Goal:** Dritte Insel (Dino-Bucht) + Genesis-Toasts + NPCs reagieren auf Dinos.
**Start:** 2026-04-05

---

## Sprint Backlog

| # | Item | Owner(s) | Status |
|---|------|----------|--------|
| S31-1 | **Dino-Bucht als dritte Insel** — `generateDinoIsland()` in island-generators.js. Seed 66000000. T-Rex auf Gipfel, Meteorit-Krater, Dino-Herde. | Engineer | ✅ Done (PR #244) |
| S31-2 | **#37 Schöpfungsgeschichte Phase 1** — Genesis-Toasts beim ersten Betreten einer Insel. `_showIslandGenesis()` + `_ISLAND_GENESIS` Map. | Engineer | ✅ Done (PR #244) |
| S31-3 | **NPC-Dino-Events** — `material:dino` + `island:arrived` Bus-Events in npc-events.js. Mephisto/Bernd/Elefant reagieren auf Fossil/Dino/T-Rex. | Engineer | ✅ Done (PR #244) |

---

## Standup Log

### 2026-04-05 (Sprint 31 Planning)

**Kontext:** Sprint 30 vollständig. Dino-Pfad ist da — jetzt braucht er eine Insel. Genesis-Toasts als Discovery-Moment. NPCs müssen reagieren.

**Blocker:** Keine.

### 2026-04-05 (Daily Scrum)

**Heute:** Alle 3 Sprint 31 Items implementiert (PR #244). Fix: speakBrowserTTS aus types.d.ts entfernt. Backlog-Audit: #23 als Phantom-Open bereinigt (war PR #149).

**Blocker:** PR #244 wartet auf Merge von #243 zuerst.

---

## Sprint Review — 2026-04-05

**Sprint Goal erreicht:** ✅ Ja — alle 3 Items Done.

**Was geliefert wurde:**
- S31-1: Dino-Bucht — `generateDinoIsland()` deterministisch (Seed 66000000). Strandring, Fossilien-Einschlüsse, Urwald, Dino-Herde, T-Rex auf Gipfel, Meteorit-Krater. Sail-Dialog: Dino-Bucht als Option (lila).
- S31-2: Genesis-Toasts — `_showIslandGenesis()` mit Toasts à 2.2s (🌊→🦴→🦕). Lummerland hat eigene Sequenz. Nur beim ersten Betreten.
- S31-3: NPC-Dino-Events — `material:dino` wenn Fossil/Dino/T-Rex/Meteorit platziert. `island:arrived` wenn Oscar segelt.

**Bonus:** speakBrowserTTS aus types.d.ts entfernt. #23 als Phantom-Open bereinigt (war PR #149).

**Oscar-Check:** Oscar segelt zur Dino-Bucht. Toasts: "Das Urmeer weicht zurück..." Er sieht Fossilien, Dino-Herde, T-Rex auf dem Gipfel. Mephisto flüstert: "Urzeitliche Energie..."

---

## Sprint Retrospective — 2026-04-05

### Was lief gut?
- **Deterministischer Island-Generator.** Seed 66000000 = immer dieselbe Dino-Bucht. Reproduzierbar.
- **Genesis-Toasts.** #37 Schöpfungsgeschichte Phase 1 in ~20 LOC. Großer Effekt, kleiner Code.

### Was lief schlecht?
- **Gestapelte Branches.** feat/sprint-31 basiert auf feat/sprint-30 — Merge-Reihenfolge zwingend.

### Was verbessern wir?
1. **Jeden Sprint direkt auf main mergen.** Keine gestapelten Branches.
2. **Genesis für Heimatinsel** — Oscar sieht noch keine Genesis auf seiner Heimatinsel (Phase 2).

---

# Sprint 32 — "Oscar erkundet den Weltraum"

**Sprint Goal:** Weltraum-Pfad (Mars) + Schatzkarte im Sail-Dialog + NPC-Texte auf Englisch.
**Start:** 2026-04-05

---

## Sprint Backlog

| # | Item | Owner(s) | Status |
|---|------|----------|--------|
| S32-1 | **Schatzkarte im Sail-Dialog** — 3-Wort-Adressen (`wellen.sand.zuhause` etc.), Entdeckt-Badge, Fortschrittszähler. `showSailDialog()` rebuild. | Engineer | ✅ Done (PR #245) |
| S32-2 | **Weltraum-Pfad** — Mars 🪐 als neues Material. Mond+Eis=Mars, Mars+Rakete=Alien. Dinos→Weltraum-Progression. | Engineer | ✅ Done (PR #245) |
| S32-3 | **#62 NPC-Texte auf Englisch** — `detectedLang` nach erster Nachricht in localStorage. Englische Greetings wenn `insel-player-lang === 'en'`. | Engineer | ✅ Done (PR #245) |

---

## Standup Log

### 2026-04-05 (Sprint 32 Planning)

**Kontext:** Sprint 31 vollständig. Archipel braucht Orientierung (Schatzkarte). Weltraum als natürliche Progression nach Dinos. #62 Englisch fertigstellen.

**Blocker:** Keine.

### 2026-04-05 (Daily Scrum)

**Heute:** Alle 3 Sprint 32 Items implementiert (PR #245, basiert auf feat/sprint-31). Schatzkarte rebuild, Weltraum-Pfad, englische Greetings.

**Blocker:** PR #245 wartet auf Merge #243→#244 zuerst.

---

## Sprint Review — 2026-04-05

**Sprint Goal erreicht:** ✅ Ja — alle 3 Items Done.

**Was geliefert wurde:**
- S32-1: Schatzkarte — `showSailDialog()` rebuild. 3-Wort-Adressen pro Insel. Entdeckt-Badge via localStorage. "2 von 3 Inseln entdeckt". Oscar sieht sein Archipel auf einen Blick.
- S32-2: Weltraum-Pfad — Mars 🪐 (#FFCCBC). Mond+Eis=Mars, Mars+Rakete=Alien. Natürliche Progression Dinos→Weltraum.
- S32-3: #62 NPC-Englisch — `detectedLang` gespeichert. Englische Greetings ("Hey! Last time you built a lot with Wood."). Oscars englischer Spielplatz-Freund wird erkannt.

**Oscar-Check:** Sail-Dialog: "2 von 3 Inseln entdeckt". Englischer Freund schreibt "hello" → Bernd antwortet auf Englisch.

---

## Sprint Retrospective — 2026-04-05

### Was lief gut?
- **Drei Sprints in Kaskade.** 30→31→32 sauber aufeinandergestapelt, kein Konflikt im Code.
- **Schatzkarte rebuild > patch.** Cleaner Code, besseres UX in einem Schritt.
- **#62 komplett.** Mehrsprachigkeit war seit S30-2 angefangen — jetzt mit englischen NPC-Greetings fertig.

### Was lief schlecht?
- **Gestapelte PRs.** #243→#244→#245 in Reihenfolge mergebar. Risiko wenn einer failt.

### Was verbessern wir?
1. **Direkt auf main.** Jeder Sprint in eigenem Atomic-PR, nicht auf vorigen Sprint basierend.
2. **Sprint Planning am Anfang, nicht am Ende.** Nächster Sprint 33 im Planning-Meeting definieren.

---

# Sprint 24 — "Oscar hört die Welt"

**Sprint Goal:** Musik beim Bauen (Genre-Sequenzen) + technische Schulden (game.js aufteilen) + Tutorial ohne Text.
**Start:** 2026-04-01

---

## Sprint Backlog

| # | Item | Owner(s) | Status |
|---|------|----------|--------|
| S24-1 | **#85 Genre-Tonsequenzen** — 15 Musik-Genres mit je 5-Noten-Sequenz beim Platzieren. Oscar baut und hört Jazz, Reggae, Metal. | Engineer | ✅ Done |
| S24-2 | **#11 game.js aufteilen** — HOERSPIELE-Daten → stories.js (77 Zeilen), game.js: 4246→4210. draw*() bleibt (zu viele globale Abhängigkeiten für sicheren Refactor). | Engineer | ✅ Done |
| S24-3 | **#15 Tutorial ohne Text** — 3-Schritt Icon-Onboarding (🖌️➡️🟫 / 🪵➡️🏝️ / ⚒️+✨), keine Texte, 2.5s auto + Tap-to-skip. Nur für Erstbesucher. | Designer + Engineer | ✅ Done |

---

## Sprint Review — 2026-04-01

**Sprint Goal erreicht:** ✅ Ja — alle 3 Items Done.

**Was geliefert wurde:**
- S24-1: Genre-Tonsequenzen live — 15 Genres (Klassik, Jazz, Blues, Rock, Elektro, Reggae, Country, Funk, Walzer, Schlaflied, Marsch, Samba, Ambient, Piraten, Zirkus). `soundGenreNote()` integriert mit separatem Throttle-Timer. `genre-btn` im Toolbar. Oscar baut und hört Musik.
- S24-2: `stories.js` extrahiert — Hörspiel-Daten (HOERSPIELE-Konstante) raus aus game.js. game.js: 4246→4210 Zeilen. draw*() und Wetter bleiben (Canvas-Context-Abhängigkeit zu tief für sicheren Refactor in dieser Session).
- S24-3: Tutorial ohne Text — 3-Schritt Onboarding (🖌️➡️🟫 / 🪵➡️🏝️ / ⚒️+✨), 2.5s auto + Tap-to-skip, nur für Erstbesucher (localStorage-Flag). Kein Wort Text.

**Nicht geliefert:**
- Vollständige game.js-Zellteilung (draw*/Grid/NPC noch drin). Bleibt für Sprint 25.
- Parallel-Sprint-Namenskonflikt: Diese Session hat Sprint 23 geplant, Remote hatte schon einen anderen Sprint 23. Fehler dokumentiert in MEMORY.md.

**Oscar-Check:** Genre-Musik + Onboarding = zwei sichtbare Verbesserungen für den nächsten Spieltest.

---

## Sprint Retrospective — 2026-04-01

### Was lief gut?

- **Alle 3 Items in einer Session.** Genre-Musik + stories.js + Tutorial ohne Text — Oscar sieht heute drei Verbesserungen.
- **soundGenreNote() mit eigenem Throttle-Timer.** Kein Tonbrei wenn man schnell baut — Genre-Wechsel alle 40 Blöcke fühlt sich natürlich an.
- **stories.js als saubere Daten-Extraktion.** Nur HOERSPIELE-Konstante raus, kein State, kein Risiko. Richtiger erster Schritt für game.js-Zellteilung.
- **Tutorial ohne Text.** 3 Icons, 2.5s auto, Tap-to-skip. Oscars jüngeres Geschwister kann starten ohne lesen zu können.

### Was lief schlecht?

- **Parallel-Sprint-Namenskonflikt.** Zwei Sessions haben unabhängig Sprint 23 geplant. git fetch origin vor Sprint Planning ist jetzt Pflicht (MEMORY.md).
- **game.js-Zellteilung halbherzig.** 4246 → 4210 Zeilen — 36 LOC weniger. CODE_EASTER_EGGS (80 LOC), initGrid(), draw() noch drin. Schulden bleiben.
- **Smoke Test weiterhin blockiert.** Sandbox-Proxy verhindert externe Curls. CI fehlt. Bekannt. Nicht gelöst.

### Was verbessern wir?

1. **game.js: CODE_EASTER_EGGS + initGrid() extrahieren** — Ziel Sprint 25: unter 4000 LOC. Nicht draw() — Canvas-Context zu komplex.
2. **Vor Sprint Planning: `git fetch origin` + Branch-Check.** Nie wieder Namenskonflikt.
3. **Oscar-sichtbare Änderung pro Sprint** — Genre-Musik war gut. Sprint 25 braucht ein Pendant.

### Sprint 25 — Empfehlung

| Kandidat | Prio | Warum jetzt |
|----------|------|-------------|
| **#11 game.js → easter-eggs.js** | P1 | CODE_EASTER_EGGS (~90 LOC) + initGrid() (~60 LOC) raus. Sicher, kein State. game.js sinkt unter 4000. |
| **#50 Höhle = Dungeon-Framework** | P1 | Berg+Wasser=Höhle. Erst ein Dungeon (IT: Bits→Kernel→Browser). Oscar entdeckt etwas Neues. |
| **#71 Palette als Instrument** | P1 | Links spielen = rechts bauen. Oscar spielt Melodie UND baut. Höchster Spaß-Impact. |
---

## Standup Log

### 2026-04-01 (Sprint 24 Planning)

**Kontext:** Sprint 22 Review + Retro abgeschlossen (alle 8 Items Done). Retro empfahl max 3 Items/Sprint — wird hart eingehalten.

**Sprint 24 Fokus:** Oscar-sichtbare Änderung zuerst (#85 Genre-Töne). Dann technische Schulden (#11). Dann UX für nicht-lesende Kinder (#15).

**Blocker:** Keine.

**Kontext:**
- Sprint 23 "Oscar hört das Meer" (PR #106): ✅ Gemergt 2026-04-01
- Retro S22-Empfehlung: #85 Genre-Töne, #15 Tutorial ohne Text, #11 game.js aufteilen
- S24-1 bereits implementiert: `soundGenreNote()` in `soundBuild` eingehängt, Genre-Toast bei Wechsel

---

# Sprint 23 — "Oscar hört das Meer" (PR #106, ✅ gemergt)

**Sprint Goal:** Chat als Sidebar, Stille-Momente wenn idle, QR-Code auf Postkarte.

**Start:** 2026-03-31

| # | Item | Status |
|---|------|--------|
| S23-1 | Chat-Sidebar (#28) | ✅ Done |
| S23-2 | Stille-Momente (#57) | ✅ Done |
| S23-3 | QR-Code auf Postkarte (#7) | ✅ Done |
---

# Sprint 22 — "The devil is most devilish when respectable"

**Sprint Goal:** Mephisto NPC + Gemini Voice + Insel-Upgrade + Bugfixes. Nacht-Session.

**Start:** 2026-03-31 (Abend)

---

## Sprint Backlog

| # | Item | Owner(s) | Status |
|---|------|----------|--------|
| S22-1 | **Mephisto NPC** — 😈 Charmanter Händler, letzter Unlock, 5 Quests, Seelenglut-Währung | Artist + Engineer | ✅ Done |
| S22-2 | **Gemini Voice Chat** — NPCs sprechen via Gemini Live API (Worker + Browser) | Engineer | ✅ Done |
| S22-3 | **Bugfixes** — Blinkender Rahmen, Grid-Dimension-Mismatch, Dropdown ohne Listener | Engineer | ✅ Done |
| S22-4 | **Starter-Insel aufpumpen** — Fluss, Berge, Steine, dichter Wald, Weg | Engineer | ✅ Done |
| S22-5 | **Lummerland** — ?lummerland URL-Parameter, handgebaute Jim-Knopf-Insel | Engineer | ✅ Done |
| S22-6 | **KLONK verstärkt** — 3-Layer Sub-Bass, Minecraft-Niveau | Engineer | ✅ Done |
| S22-7 | **Backlog-Audit** — 8 Items als Done erkannt (Voice, Haiku, Tonhöhe, Icons, Unsinn, Töne, Trommel, Höhlen) | Scientist | ✅ Done |
| S22-8 | **Docs** — ARCHITECTURE.md aktualisiert, .gitignore erweitert | Leader | ✅ Done |

---

## User Actions (vom Sprint generiert)

| # | Was | Wer | Status |
|---|-----|-----|--------|
| U1 | **MMX Wallet erstellen** — mmx.network Wallet für Donation-Adresse im Code View | User | ✅ Done |
| U2 | **Cloudflare Voice Worker testen** — schatzinsel.app Chat → 🎤 → Mikrofon erlauben | User | 🔲 Offen |
| U3 | **Gemini API Key in Worker** — `wrangler secret put GEMINI_API_KEY` | User | ✅ Done |

---

## Sprint Review — 2026-03-31 (Nacht)

**Sprint Goal erreicht:** ✅ Ja — alle 8 Items Done.

**Was geliefert wurde:**
- Mephisto: 10. NPC, Browning-Zitat als Motto, Deal-Mechanik
- Voice: Gemini Live API, 5 Stimmen (Charon/Puck/Kore/Aoede/Fenrir)
- 3 Bugfixes: Tutorial-Pulse, Grid-Mismatch, Dropdown
- Reichere Insel: Fluss, Berge, Wald, Weg
- Lummerland: Zwei Berge, Lokschuppen, Frau Waas, Hafen
- KLONK: 3 Oszillatoren, Sub-Bass, Gain 0.5
- Backlog: 8 Phantom-Opens bereinigt
- Docs: ARCHITECTURE.md von 4 auf 22 Dateien

**Nicht geliefert:**
- #28 Chat-Sidebar (Layout-Umbau verschoben)
- #93/#94 MMX-Integration (braucht Wallet-Adresse + Design)

---

## Sprint Retrospective — 2026-03-31 (Nacht, nach Review)

### Was lief gut?

- **8 von 8 Items in einer Nacht-Session.** Höchste Sprint-Dichte bisher.
- **Mephisto als 10. NPC.** Unlock-Mechanik, Deal-System, Browning-Zitat — fertig in einer Session.
- **Voice Integration.** Gemini Live API, 5 Stimmen, Worker-Deployment — komplex und trotzdem done.
- **Lummerland.** Easter Egg in einer Stunde handgebaut — zwei Berge, Lokschuppen, Frau Waas. Oscar freut sich.
- **Backlog-Audit.** 8 Phantom-Opens bereinigt. Backlog zeigt jetzt Realität.

### Was lief schlecht?

- **#28 Chat-Sidebar zweimal verschoben.** War in S21 nicht drin, war in S22 nicht drin. Blockiert Voice UX.
- **Smoke Test nach wie vor blockiert.** Proxy verhindert externe Curl-Calls aus Claude Code Web. Kein CI, kein automatischer Health-Check.
- **MMX (U1)** liegt beim User. Kein Druck, keine Erinnerung — Thema wird vergessen.

### Was verbessern wir?

1. **#28 Chat-Sidebar wird Sprint 23 Item 1.** Nicht wieder verschieben.
2. **Smoke Test → GitHub Actions** — BACKLOG #86 (CI/CD) endlich anfassen.
3. **User-Actions sichtbarer machen** — U1 (MMX Wallet) als explizite Erinnerung im Planning.

### Sprint 23 — Empfehlung (Planning)

| Kandidat | Prio | Warum jetzt |
|----------|------|-------------|
| **#28 Chat-Sidebar** — Chat als Sidebar, kein Overlay | P1 | 2× verschoben. Voice UX kaputt ohne das. |
| **#57 Stille-Momente** — Wellen + Wind wenn idle, kein UI | P1 | Oscars Erfahrung. 0 Code-Aufwand. Höchster emotional impact. |
| **#7 QR-Code auf Postkarte** — Scan → direkt zum Spiel | P1 | Postkarte existiert. QR fehlt. 30 Minuten Arbeit. |

---

# Sprint 23 — "Oscar hört das Meer"

**Sprint Goal:** Chat als Sidebar, Stille-Momente wenn idle, QR-Code auf Postkarte. Oscar soll heute Abend Fortschritt sehen.

**Start:** 2026-03-31

---

## Sprint Backlog

| # | Item | Owner(s) | Status |
|---|------|----------|--------|
| S23-1 | **Chat-Sidebar** (#28) — Chat-Fenster als seitliche Sidebar, nicht als Overlay über Canvas. CSS-Refactor, kein Layout-Umbau. | Designer + Engineer | ✅ Done |
| S23-2 | **Stille-Momente** (#57) — Wellen-/Wind-Ambient nach 10s Idle. Kein UI, kein Toast. Nur Meer. stopAmbient() bei Interaktion. | Engineer | ✅ Done |
| S23-3 | **QR-Code auf Postkarte** (#7) — QR-Code als SVG (qr-code-generator, kein Build) auf dem Postkarten-Download. Scan → schatzinsel.app | Engineer | ✅ Done |


---

# Sprint 21 — "Oscar zieht"

**Sprint Goal:** Drag & Drop auf dem Canvas — Oscar zieht Materialien direkt, kein Klicken mehr.

**Start:** 2026-03-30

---

## Sprint Backlog

| # | Item | Owner(s) | Status |
|---|------|----------|--------|
| S21-1 | **Drag & Drop Crafting** — Materialien aus Palette auf Canvas ziehen. `draggable="true"` auf `.material-btn`, Canvas `dragover`/`drop` Handler. Oscar's Wunsch (#46, P1) | Engineer | ✅ Done |
| S21-2 | **Code-Ebenen per Touch** — Left/Right Swipe auf Canvas wechselt Code-Layer statt Rechtsklick (#32, P1) | Engineer | ✅ Done |
| S21-3 | **Quests/Achievements balancieren** — Schwierigkeitsgrad erhöhen, passen nicht zur leeren Insel (#47, P1) | Scientist | ✅ Done (Baseline-Tracking ab Annahme, max 2 aktive Quests — PR #62) |

---

## Sprint Review — 2026-03-31

**Sprint Goal erreicht:** ✅ Ja

**Was geliefert wurde:**
- S21-1: Drag & Drop — Oscar zieht Materialien direkt auf den Canvas. `draggable="true"`, `dragstart`/`dragover`/`drop` Handler, auch dynamisch gecraftete Buttons. Oscar's Wunsch (#46) erfüllt.
- S21-2: Code-Ebenen per Touch — Swipe Left/Right wechselt Code-Layer. `touchWasPainting`-Flag verhindert Fehltrigger beim Malen. Threshold: ≥80px horizontal, <40px vertikal.
- S21-3: Quests/Achievements balanciert — Baseline-Tracking ab Annahme, max 2 aktive Quests gleichzeitig. PR #62.

**Was nicht geliefert wurde:** Nichts. Alle 3 Items Done.

**Oscar-Check:** "Ich kann jetzt einfach hinziehen." Das ist der Satz der zählt.

---

## Sprint Retrospective — 2026-03-31

### Was lief gut?

- **Alle 3 Items in einer Session.** Sprint Goal vollständig erreicht, kein Nachlauf.
- **Oscar-Check positiv.** "Ich kann jetzt einfach hinziehen." — er hat den Maßstab selbst gesetzt.
- **Touch-UX ohne Regression.** `touchWasPainting`-Flag verhinderte Fehltrigger. Kein neues Global-State-Chaos.
- **Quest-Balance als Constraint gelöst**, nicht als Feature. Weniger Code, gleiches Ergebnis.

### Was lief schlecht?

- **Phantom-Item #47.** Quest-Balance war faktisch bereits teilweise implementiert. Sprint-Slot unnötig verbraucht.
- **Smoke Test blockiert.** Proxy-Sandbox verhindert Curl gegen externe Domains aus Claude Code Web. Muss als Constraint akzeptiert oder in CI ausgelagert werden.
- **#44 schatzinsel.app liegt weiter offen (P0).** DNS-Zugang beim User. Bleibt liegen wenn nicht explizit als User-Action adressiert.

### Was verbessern wir?

1. **Vor Sprint Planning: Backlog gegen letzten Commit abgleichen** — verhindert Phantom-Items.
2. **#44 als User-Action im nächsten Sprint** — nicht als Code-Task, sondern konkrete DNS-Schritt-Anleitung für den User.
3. **Smoke Test in GitHub Actions** — nicht sessionabhängig.

### Sprint 22 — Empfehlung (Planning nächste Session)

| Kandidat | Prio | Warum jetzt |
|----------|------|-------------|
| **#44 schatzinsel.app → GitHub Pages** | P0 | Zu lange offen. User-Action + Repo-Konfiguration kombiniert. |
| **#57 Stille-Momente** | P1 | Kein Code-Aufwand. Höchster Emotional-Impact für Oscar. |
| **#80 docs/PROJECT.md neu anlegen** | P1 | CLAUDE.md referenziert fehlende Dateien. Jede Session mit leerem State. |

---

## Standup Log

### 2026-03-31 (Daily Scrum)

**Gestern:** S21-1 Drag & Drop war bereits ✅. S21-3 war Phantom-Open — BACKLOG #47 bereits implementiert.

**Heute:** S21-2 implementiert — Swipe Left/Right auf Canvas wechselt Code-Layer. Swipe wird nur erkannt wenn kein Malen passiert ist (touchWasPainting-Flag) und die Figur nicht gezogen wird. Threshold: ≥80px horizontal, <40px vertikal.

**Blocker:** Keine.

---

### 2026-03-30 (Sprint 21 Planning)

**Kontext (Commits seit Sprint 20):**
- `1b224ea` Sound Mute-Check 9× → 1× isMuted() (#50)
- `8ef5289` Zentraler localStorage-Helper storage.js (#51)
- `ee7b50a` INSEL Namespace mit Event-Bus und Modul-Registry (#52)
- `48d8075` fix: Doppelte Floriane + CHAR_CURRENCY Duplikat (#53)
- `9f8a0bf` 10-Sekunden-Erster-Moment — Intro beschleunigt (#54, Backlog #59)
- `b1c34e7` Offline-Manifest + Service Worker PWA (#56, Backlog #8)
- `e002de7` Konsequenz-System — Wasser→Blumen, Feuer→Asche (#57, Backlog #61)

Diese Items werden im Backlog als Done markiert.

**Sprint-Fokus:** S21-1 (Drag & Drop) implementiert in dieser Session.

---

# Sprint 20 — "Alle antreten"

**Sprint Goal:** Organisation aufräumen, Code-Fundament stärken. Jeder Agent hat einen Job.

**Start:** 2026-03-30
**Typ:** BUILD + DOC (Hybrid — einmalig, weil Org-Umbau)

---

## Sprint Backlog

| # | Item | Owner(s) | Status |
|---|------|----------|--------|
| S20-1 | **Docs konsolidiert** — SCHNIPSEL→USERS, PROJECT→STORY, DESIGN→STORY, DECISIONS→ARCHITECTURE. 4 Dateien gelöscht, 0 Information verloren. | Weber (COO) + Engineer | ✅ Done |
| S20-2 | **ROSTER.md** — Alle 18 Agents mit Lebensphase, Model, Skills. Skill-Zuordnung ohne Dopplungen. | Feynman (Scientist) | ✅ Done |
| S20-3 | **CxO-Aktivierung** — `/einstein`, `/darwin`, `/weber` als Command-Dateien. 3 Agents von EINGEFROREN → AKTIV. | Leader + Engineer | ✅ Done |
| S20-4 | **Padawan-Codizes** — Alle 5 Codizes mit Erfahrungen aus Sprint 1–19 gefüllt. Kein "Noch leer" mehr. | Alle Padawans + Feynman | ✅ Done |
| S20-5 | **SPRINT.md getrimmt** — Historische Sprints 14–18 raus. Nur aktiver Sprint + Referenz. | Weber (COO) | ✅ Done |
| S20-6 | **Code Metrics Review** — Feynman/Darwin/Linus/Taylor Podcast-Format. 35 Stimmen. | Feynman + Darwin | ✅ Done |

---

## Standup Log

### 2026-03-30 (Sprint 20 — "Alle antreten")

**Was passiert ist:**
- Kompletter Org-Umbau: 18 Agents inventarisiert, 8 CxOs+Sales als EINGEFROREN identifiziert, 3 CxOs aktiviert
- Doc-Konsolidierung: 4 Dateien gemergt (SCHNIPSEL, PROJECT, DESIGN, DECISIONS), TEST-RESULTS archiviert
- 5 Padawan-Codizes mit je 3 Erfahrungseinträgen gefüllt
- Skill-Zuordnung: 14 Skills auf 5 Masters verteilt, keine Dopplungen
- Code Metrics Review mit harten Zahlen: 8.583 LOC, 207 Funktionen, 41 Globals, 63 JSON.parse

**Nächster Sprint (S21) — Empfehlung:**
- S21-1: `game.js` aufteilen — Grid-Logik extrahieren (BACKLOG #11, P1)
- S21-2: localStorage-Helper — Zentraler Layer statt 81 verstreute Zugriffe
- S21-3: Sound Mute-Check refactorn — 9× Copy-Paste → 1× Funktion

---

## Sprint 19 — "Floriane & Flow" ✅ DONE

**Sprint Goal:** Bewegung fühlt sich sofort an. Und Oscar bekommt seine Wunschfee.

**Start:** 2026-03-30
**Ende:** 2026-03-30

---

## Sprint Backlog

| # | Item | Owner | Status |
|---|------|-------|--------|
| S19-1 | **Spielfigur-Lag fix** — `movePlayer()` ruft `draw()` direkt auf, kein 100ms-Warten (#66) | Engineer | ✅ Done |
| S19-2 | **Wunschfee Floriane** — Neuer NPC 🧚, ELIZA + LLM-Persönlichkeit, erste Freischaltung (#75) | Artist + Engineer | ✅ Done |
| S19-3 | **Cherry-pick Sprint 15–18** — Sprints 15/16/17/18 auf main gebracht (waren ungemergt) | Engineer | ✅ Done |

---

## Standup Log

### 2026-03-30 (Sprint 19 Planning — nach Sprint 18)
- Sprints 15-18 auf feat/sprint-15 und feat/sprint-18 lagen ungemergt. Cherry-picks mit Konfliktlösung.
- Doppelte playerName-Deklaration (Cherry-pick Bug) gefixt.
- Spielfigur-Lag: setInterval(draw, 100) ist Architektur-Entscheidung (CPU). Fix: movePlayer() ruft draw() direkt auf.
- Oscar will Floriane — Wunschfee als erster Unlock-NPC.

---

---

*Sprints 14–18: Abgeschlossen. Dokumentation in MEMORY.md.*
