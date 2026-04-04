# Sprint 27 — "Krabbs wird Kaufmann"

**Sprint Goal:** Wirtschaft wird sichtbar — Krabbs-Vorrat endlich + Currencies klar getrennt + MMX ehrlich gelabelt.
**Start:** 2026-04-04

---

## Sprint Backlog

| # | Item | Owner(s) | Status |
|---|------|----------|--------|
| S27-1 | **#100 Muschel-Counter im Inventar** — Permanenter 🐚-Badge oben im Inventar-Panel. Klick → Krabbs-Kontor. Muscheln nie im Chat-Header. Energie (Burger/Noten/Glut) nur im Chat. | Designer + Engineer | 🔲 Offen |
| S27-2 | **Backlog-Audit** — #101, #102, weitere Phantom-Dones in ops/BACKLOG.md als ✅ Done markieren. Backlog zeigt Realität. | Scientist | 🔲 Offen |
| S27-3 | **#33 Titel** — `<title>Schatzinsel 🏝️</title>` kürzer und erkennbarer. Browser-Tab klar. | Designer | 🔲 Offen |

---

## Standup Log

### 2026-04-04 (Sprint 27 Planning)

**Kontext:** Sprint 26 vollständig (PRs #218-220, Doku PR #221). Retro: 25+ offene PRs — PR-Stau. Sprint 27 fokussiert auf kleine, sichhere Items ohne Merge-Konflikt-Risiko.

**Sprint 27 Fokus:** Klares UI für Wirtschaft. #101 und #102 sind Phantom-Dones (bereits in game.js). S27-1 macht Muscheln sichtbar wo sie hingehören: ins Inventar. Alle 3 Items ≤ 30 LOC.

**Blocker:** Keine.

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
| S26-3 | **#54 Jim Knopfs Welt** — Boot craften (Planks + Seil + Mast) → neue Insel-Auswahl. Mindestens 1 neue erreichbare Insel. Oscar segelt. | Engineer | ✅ Done (PR #220) |

---

## Standup Log

### 2026-04-04 (Sprint 26 Planning)

**Kontext:** Sprint 25 vollständig (alle 3 Items Done, PR #212 gemergt). Retro: Duplikat-PR-Problem identifiziert und gelöst.

**Sprint 26 Fokus:** Oscar-sichtbare Änderungen. NPCs werden lebendig (#96 Session-Gedächtnis). Welt reagiert (#95 Wu-Xing). Dann Expansion (#54 Boot/Insel).

**Blocker:** Keine.

### 2026-04-04 (Daily Scrum)

**Heute:** Sprint 26 vollständig durch parallele Sessions. PR #218 (S26-1 NPC-Gedächtnis), PR #219 (S26-2 Wu-Xing-Limit), PR #220 (S26-3 Segelboot), PR #221 (Doku). Alle offen, noch nicht in main. Sprint 26 Review + Retro durchgeführt. Sprint 27 geplant.

**Blocker:** 25+ offene PRs gesamt — PR-Stau.

---

## Sprint Review — 2026-04-04

**Sprint Goal erreicht:** ✅ Ja — alle 3 Items Done.

**Was geliefert wurde:**
- S26-1: NPC-Session-Gedächtnis — `_sessionGreeted` Set, `buildSessionGreeting()` liest `insel-session-snapshot` (>60s = neue Session). 11 NPC-Stimmen. SpongeBob: "ICH BIN BEREIT! Letzte Runde 23 Blöcke Holz — REKORD!" (PR #218 + #213)
- S26-2: Wu-Xing Events — `sessionReactionCount` Counter + `SESSION_MAX = 3`. Bestehende Throttle (15s) + 30% Chance bleiben. (PR #219)
- S26-3: Segelboot craften → Insel-Auswahl-Dialog. Seil + Segel + Segelboot als neue Materialien + Rezepte. Lummerland + Wüsteninsel erreichbar. `island:arrived` Event auf INSEL_BUS. (PR #220 + #214)

**Nicht geliefert:** Nichts.

**Oscar-Check:** SpongeBob erinnert sich an Oscar. Oscar segelt. Welt lebt.

---

## Sprint Retrospective — 2026-04-04

### Was lief gut?

- **Sprint 26 vollständig.** Alle 3 Items Done, alle als PRs vorhanden.
- **NPC-Gedächtnis ist emotional stark.** "Hey Oscar! Letzte Runde 23 Blöcke Holz." Kind fühlt sich erkannt.
- **Segelboot sauber implementiert.** Neue Materialien, neue Rezepte, neues Event — alles in Muster eingepasst.

### Was lief schlecht?

- **25+ offene PRs.** PR-Stau. Neue Features werden gebaut, aber mergen liegt beim User. Duplikat-Risiko bleibt.
- **feat/sprint-27 Branch ohne merge base.** Parallele Session hat Sprint 27 auf veraltetem Stand gestartet. Weggeworfen.

### Was verbessern wir?

1. **Sprint 27: nur kleine Items** — max 50 LOC pro Item. Kein Merge-Risiko.
2. **PR-Stau ansprechen.** User soll Sprint 26 PRs mergen: #218, #219, #220, #221.
3. **Krabbs-Wirtschaft sichtbar machen** — Oscar versteht Angebot/Nachfrage durch Spielen, nicht durch Erklären.

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
| S26-1 | **#96 NPC-Session-Gedächtnis** — NPCs erinnern sich via localStorage. Beim ersten Chat-Klick nach Pause: "Hey Oscar, gestern hast du viel [Material] gebaut!" `_sessionGreeted` Set verhindert Wiederholung. | Engineer + Artist | 🔲 Offen |
| S26-2 | **#95 Wu-Xing→NPC-Events** — `INSEL_BUS.on('element:fire')` etc. NPCs kommentieren wenn Oscar Feuer/Wasser/Holz/Metall/Erde platziert. 15s Throttle, max 3x/Session. | Engineer + Artist | 🔲 Offen |
| S26-3 | **#54 Jim Knopfs Welt** — Boot craften (Planks + Seil + Mast) → neue Insel-Auswahl. Mindestens 1 neue erreichbare Insel. Oscar segelt. | Engineer | 🔲 Offen |

---

## Standup Log

### 2026-04-04 (Sprint 26 Planning)

**Kontext:** Sprint 25 vollständig (alle 3 Items Done, PR #212 gemergt). Retro: Duplikat-PR-Problem identifiziert und gelöst.

**Sprint 26 Fokus:** Oscar-sichtbare Änderungen. NPCs werden lebendig (#96 Session-Gedächtnis). Welt reagiert (#95 Wu-Xing). Dann Expansion (#54 Boot/Insel).

**Blocker:** Keine.

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
- Sprint 23 "Oscar hört das Meer" (PR #106): Chat-Sidebar, Stille-Momente, QR-Code — offen, nicht gemergt
- Retro S22-Empfehlung: #85 Genre-Töne, #15 Tutorial ohne Text, #11 game.js aufteilen
- S24-1 bereits implementiert: `soundGenreNote()` in `soundBuild` eingehängt, Genre-Toast bei Wechsel

---

# Sprint 23 — "Oscar hört das Meer" (PR #106, offen)

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
| U1 | **MMX Wallet erstellen** — mmx.network Wallet für Donation-Adresse im Code View | User | 🔲 Offen |
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
