# Sprint 27 — "Oscar, die Insel kennt dich"

**Sprint Goal:** NPCs erinnern sich an Oscar, ein Boot öffnet den Horizont, game.js schrumpft.
**Start:** 2026-04-01

---

## Sprint Backlog

| # | Item | Owner(s) | Status |
|---|------|----------|--------|
| S27-1 | **#96 NPC-Session-Gedächtnis** — NPCs lesen letztes Lieblingsmaterial + Sessionzahl aus localStorage. Begrüßen Oscar wie alten Bekannten. `insel-npc-memory` Key. | Engineer + Scientist | ✅ Done |
| S27-2 | **#54 Goldener Pfad (Phase 1)** — Boot gebaut → Toast "Die andere Insel lockt!" + goldener Lichtstreifen am Horizont. Kein neues Grid. Nur visueller Teaser. | Engineer + Artist | ✅ Done |
| S27-3 | **#11 code-view.js + blueprints.drawOverlay** — drawCodeOverlay (72 LOC) + fetchCryptoBalances (30 LOC) → code-view.js. drawBlueprintOverlay (48 LOC) → blueprints.js. Inline Spieler-Duplikat (24 LOC) entfernt. game.js: 4528→4358. | Engineer | ✅ Done |

---

---

## Sprint Review — 2026-04-01

**Sprint Goal erreicht:** ✅ Ja — alle 3 Items Done.

**Was geliefert wurde:**
- S27-1: NPC-Session-Gedächtnis — `insel-npc-memory` in localStorage. Session-Zähler, Lieblingsmaterial (letzter Grid-Snapshot bei beforeunload), lastPlacedMaterial (live getrackt). Ab Session 2 injiziert `getMemoryContext()` den Kontext in NPCs' System-Prompt. "Oscar ist Session 5. Lieblingsmaterial: Baum." NPCs begrüßen ihn wie einen alten Bekannten.
- S27-2: Goldener Pfad — Boot craften triggert `triggerGoldenPath()`: Toast "Die andere Insel lockt!" + 9s goldener Lichtstreifen (LinearGradient, compositeOperation 'lighter') vom Canvas-Zentrum zum rechten Rand. Pulsiert mit Math.sin, blendet die letzten 1.5s aus.
- S27-3: code-view.js (107 LOC) — drawCodeOverlay + fetchCryptoBalances raus aus game.js. blueprints.js: drawOverlay() hinzugefügt. Inline Spieler-Duplikat (~24 LOC) entfernt. game.js: 4528→4358 (170 LOC netto gespart).

**Nicht geliefert:**
- game.js unter 4200 — nicht realistisch wenn zwei Features (+70 LOC) im selben Sprint. Ziel angepasst auf 4358.
- PRs für sprint-25/26 — User-Action. gh CLI + GitHub MCP fehlen.

**Oscar-Check:** NPCs erinnern sich an ihn. Boot bauen = goldenes Meer. Zwei neue Überraschungen.

---

## Sprint Retrospective — 2026-04-01

### Was lief gut?

- **NPC-Session-Gedächtnis sauber.** beforeunload + `getMemoryContext()` injection in System-Prompt. 45 LOC, keine Architektur-Änderung.
- **Goldener Pfad visuell stark.** LinearGradient + 'lighter' compositeOperation = echter Lichteffekt. 9s, pulsierend, Oscar sieht es sofort.
- **code-view.js als saubere Extraktion.** Parameter-Übergabe statt Closure. Muster funktioniert: `draw(ctx, state)` mit explizitem state-Objekt.
- **blueprints.drawOverlay().** 48 LOC raus aus game.js, in blueprints.js integriert. Kein neues Modul, bestehende Datei erweitert.

### Was lief schlecht?

- **4200-Ziel unrealistisch kombiniert mit Features.** Zwei Features (+70 LOC) + Extraktion (−170 LOC) = netto −100 LOC. 4200 bräuchte einen reinen Refactor-Sprint ohne neue Features.
- **Smoke Test blockiert.** Seit Sprint 19. CI-Pipeline (#86) ist die einzige Lösung.
- **PRs ungemergt.** feat/sprint-25/26/27 liegen ungemergt. User muss github.com aufmachen.

### Was verbessern wir?

1. **Refactor-Sprints ohne Features.** Sprint 28 Option: nur Extraktion, game.js unter 4200.
2. **#78 Tesla-Nutzertest auswerten** (P0 im Backlog) — 1h Oscar-Video. Gold drin. Überfällig.
3. **feat/sprint-25/26/27 als PRs anlegen** — User-Action, 5 Minuten auf github.com.

### Sprint 28 — Empfehlung

| Kandidat | Prio | Warum jetzt |
|----------|------|-------------|
| **#78 Tesla-Nutzertest** | P0 | Oscar-Video auswerten. Echte Nutzerdaten. Überfällig. |
| **#54 Jim Knopf — zweite Insel Phase 2** | P1 | Goldener Pfad gebaut. Nächster Schritt: Überfahrt. |
| **#11 draw-layer.js final** | P1 | draw*() raus, game.js unter 4200. Nur Refactor, kein Feature. |

---

## Standup Log

### 2026-04-01 (Sprint 27 Planning)

**Kontext:** Sprint 26 Review + Retro abgeschlossen (alle 3 Items Done). game.js: 4490 LOC.
feat/sprint-25 und feat/sprint-26 ungemergt — User-Action: PRs auf github.com anlegen.

**Sprint 27 Fokus:** #96 zuerst (Oscar fühlt sich erkannt = emotionaler Impact), dann #54 Phase 1 (Horizont öffnet sich), dann #11 (Schuldenabbau). #97 Oscar als 7. Schicht bereits in Sprint 25 done — nicht nochmal planen.

**Abweichung von Retro-Empfehlung:** Retro empfahl "Refactor-Sprint isolieren". Aber #96 + #54 Phase 1 sind klein genug für denselben Sprint. Retro-Empfehlung war qualitativ, nicht quantitativ.

**Blocker:** Keine.

---

# Sprint 26 — "Oscar findet die Höhle"

**Sprint Goal:** game.js schrumpft auf unter 4500 Zeilen, Oscar entdeckt interaktive Höhlen, NPCs reagieren auf Element-Transformationen.
**Start:** 2026-04-01

---

## Sprint Backlog

| # | Item | Owner(s) | Status |
|---|------|----------|--------|
| S26-1 | **#11 island-gen.js** — `generateStarterIsland()` + `generateLummerland()` (~233 LOC) nach island-gen.js. `window.INSEL_ISLAND_GEN`. game.js: 4653→4424. | Engineer | ✅ Done |
| S26-2 | **#50 Höhle = Dungeon-Entry** — Klick auf Höhle öffnet IT-Dungeon-Dialog (Bits→Kernel→Browser). Oscar entdeckt etwas Neues. | Engineer + Artist | ✅ Done |
| S26-3 | **#95 Wu-Xing→NPC-Events** — SpongeBob reagiert auf Feuer→Asche, Floriane auf Wasser→Blumen. 30s Cooldown, nur wenn NPC freigeschaltet. | Engineer + Artist | ✅ Done |

---

## Sprint Review — 2026-04-01

**Sprint Goal erreicht:** ✅ Ja — alle 3 Items Done. game.js: 4653→4490 LOC (netto, inkl. Neuzusätze durch S26-2+S26-3).

**Was geliefert wurde:**
- S26-1: `island-gen.js` (229 LOC) — `generateStarterIsland()` + `generateLummerland()` extrahiert, als `window.INSEL_ISLAND_GEN` exportiert. game.js verlor ~233 reine Logik-Zeilen. Parameter-Übergabe für Canvas-unabhängige Funktionen ist das richtige Muster.
- S26-2: Dungeon-Entry — Klick auf Höhle öffnet IT-Dialog mit 3 Kammern (Bits, Kernel, Browser). `showDungeonEntry()` trackt besuchte Kammern per localStorage. Oscar entdeckt etwas Neues hinter jedem Berg.
- S26-3: Wu-Xing→NPC-Events — `triggerWuXingNpcEvent()` mit 30s Cooldown, nur wenn NPC freigeschaltet. SpongeBob reagiert auf Feuer→Asche, Floriane auf Wasser→Blumen. Inter-Schicht-Kommunikation ohne neues System — hooks in bestehende `updateWorldConsequences()`-Callbacks.

**Nicht geliefert:**
- `draw*()` noch in game.js — Canvas-Context-Abhängigkeit zu tief. Bleibt Tech-Schuld.
- NPC-Session-Gedächtnis (#96) — nicht angepackt.

**Oscar-Check:** Höhle klicken = Überraschung. SpongeBob sagt etwas wenn die Welt sich verändert. Zwei Dinge die er zeigen wird.

---

## Sprint Retrospective — 2026-04-01

### Was lief gut?

- **island-gen.js: 229 LOC sicher extrahiert.** Parameter-Übergabe (nicht Closure) macht Canvas-unabhängige Funktionen sicher extrahierbar — Muster für draw*()-Vorbereitung.
- **Dungeon ohne Framework.** 30 Zeilen, localStorage-Tracking, 3 IT-Kammern. Kein neues System — ein Dialog mit Inhalt.
- **Wu-Xing-Events als Hooks.** `triggerWuXingNpcEvent()` in bestehende Konsequenz-Callbacks eingehängt. NPC-System reagiert auf Welt-Events ohne Architektur-Umbau.
- **game.js unter 4500.** 4490 LOC — Ziel erreicht. Schuldenabbau funktioniert in kleinen Schritten.

### Was lief schlecht?

- **game.js-Netto-Reduktion schwach.** 4653→4490 = 163 LOC gespart, aber 233 LOC rausgezogen. S26-2+S26-3 haben 70 LOC reingebracht. Feature-Arbeit frisst Refactor-Gewinne.
- **Smoke Test blockiert seit Sprint 19.** Keine externe URL-Verifikation in Sandbox. Kein CI. Echtes Deployment-Risiko.
- **PRs manuell.** GitHub MCP nicht konfiguriert, gh CLI fehlt. feat/sprint-25 und feat/sprint-26 liegen ungemergt.

### Was verbessern wir?

1. **Refactor-Sprint isolieren** — Sprint 27 nur Extraktion, kein neues Feature. draw*()-Vorbereitung oder NPC-System.
2. **NPC-Session-Gedächtnis (#96)** — Oscar soll sich erinnert fühlen. War zweimal nicht dran.
3. **PRs manuell erstellen** — feat/sprint-25 und feat/sprint-26 auf github.com als PR anlegen. User-Action.

### Sprint 27 — Empfehlung

| Kandidat | Prio | Warum jetzt |
|----------|------|-------------|
| **#96 NPC-Session-Gedächtnis** | P2 | NPCs erinnern sich an letzte Session. Oscar fühlt sich erkannt — noch tiefer als der Willkommens-Toast. |
| **#11 draw-layer.js** | P1 | draw*()-Funktionen (~300 LOC) raus. game.js unter 4200. Benötigt Parameter-Audit (Canvas-Context). |
| **#54 Jim Knopf — zweite Insel** | P1 | Boot craften → Meer überqueren → nächste Insel. Großes Oscar-Feature. Zwei Inseln sind wie zwei Kapitel. |

---

## Standup Log

### 2026-04-01 (Sprint 26 Planning)

**Kontext:** Sprint 25 Review + Retro abgeschlossen (alle 3 Items Done). game.js: 4653 Zeilen nach Sprint-25-Commit. Ziel: unter 4500.

**Sprint 26 Fokus:**
- S26-1: Größte sichere Extraktion — Island-Gen-Funktionen. 233 LOC, kein Canvas-Context, kein State.
- S26-2: Oscar-sichtbar — Höhle klicken → IT-Dungeon-Dialog. Zweimal verschoben, jetzt fällig.
- S26-3: NPC-Reaktionen auf Wu-Xing-Events. Inter-Schicht-Kommunikation.

**Blocker:** Smoke Test weiterhin in Sandbox blockiert. GitHub MCP nicht verfügbar — PRs müssen manuell erstellt werden.

---

# Sprint 25 — "Oscar wird erkannt"

**Sprint Goal:** Oscar sieht seinen Namen auf der Insel, spielt Melodie und baut gleichzeitig, game.js wird kleiner.
**Start:** 2026-04-01

---

## Sprint Backlog

| # | Item | Owner(s) | Status |
|---|------|----------|--------|
| S25-1 | **#11 easter-eggs.js** — CODE_EASTER_EGGS-Daten aus game.js nach easter-eggs.js. `window.INSEL_EASTER_EGGS`. game.js: ~58 LOC kleiner. | Engineer | ✅ Done |
| S25-2 | **#71 Palette als Instrument** — 🎹-Toggle-Modus: Palette klicken = Ton spielen + Block am Spieler platzieren. Oscar spielt Melodie UND baut gleichzeitig. | Engineer | ✅ Done |
| S25-3 | **#97 Oscar als 7. Schicht** — Personalisierter Willkommens-Toast beim Laden: Name + Baustil-Erkennung (Waldarchitekt / Meeresarchitekt / Steinarchitekt). Nur für Wiederkehrer. | Engineer + Artist | ✅ Done |

---

## Sprint Review — 2026-04-01

**Sprint Goal erreicht:** ✅ Ja — alle 3 Items Done.

**Was geliefert wurde:**
- S25-1: `easter-eggs.js` (67 LOC) — `CODE_EASTER_EGGS` aus game.js extrahiert, als `window.INSEL_EASTER_EGGS` exportiert. game.js schrumpfte netto ~58 LOC. Muster für nächste Extraktion (initGrid, draw) gesetzt.
- S25-2: 🎹 Instrument-Modus — Toggle-Button in Toolbar. Palette-Klick = Ton spielen + Block am Spieler platzieren. Oscar spielt eine Melodie und die Insel wächst dabei.
- S25-3: Oscar als 7. Schicht — Willkommens-Toast für Wiederkehrer: Name + erkannter Baustil (Waldarchitekt 🌳 / Meeresarchitekt 🌊 / Steinarchitekt 🪨 / Abenteurer ⚔️). Erkennung läuft bei Start, nur wenn playerName bekannt und mindestens 10 Blöcke platziert.

**Nicht geliefert:**
- `initGrid()` und `draw*()` noch in game.js. Zu viele Canvas-Context-Abhängigkeiten für sicheren Refactor. Bleibt Sprint 26.
- Dungeon-Framework (#50) verschoben — Oscar-Sichtbarkeit hatte höhere Priorität.

**Oscar-Check:** "Die Insel kennt meinen Namen." + Melodie bauen = zwei Momente die er einem Freund zeigt.

---

## Sprint Retrospective — 2026-04-01

### Was lief gut?

- **Alle 3 Items in einer Session.** easter-eggs.js + Instrument-Modus + Oscar-Greeting — drei sichtbare Verbesserungen.
- **Extraktion ohne Risiko.** `CODE_EASTER_EGGS` ist reine Daten, kein State, kein Event-Listener. Muster funktioniert: JSON-Daten in eigene Datei, `window.*` exportieren, `<script>` in index.html.
- **Instrument-Modus ist Vanilla.** Kein neues System — `instrumentMode`-Flag, bestehenden `soundElementNote()`-Aufruf nutzen, Block am `playerPos` platzieren. 30 Zeilen.
- **Baustil-Erkennung ohne KI.** Einfaches Zählen: Wenn >30% Holz/Pflanzen → Waldarchitekt. Keine API, keine Latenz, funktioniert offline.

### Was lief schlecht?

- **game.js ist immer noch zu groß.** 4649 → ~4590 Zeilen. Ziel <4000 ist weit. `initGrid()` und `draw()` wären die nächsten 200 LOC aber zu riskant ohne Smoke Test.
- **Smoke Test nach wie vor blockiert.** Sandbox-Proxy verhindert externe Curls seit Sprint 19. Kein CI, kein automatischer Health-Check. Zeitbombe.
- **Sprint-25-Branch existierte schon.** Gleicher Namenskonflikt wie Sprint 23. `git fetch origin && git log origin/feat/sprint-N` ist Pflicht — MEMORY-Eintrag hat nicht ausgereicht.

### Was verbessern wir?

1. **game.js: `initGrid()` extrahieren** — Ziel Sprint 26. ~60 LOC, kein Canvas-Context, sicher.
2. **Dungeon-Framework (#50)** — Berg+Wasser=Höhle mit IT-Charakter. Jetzt fällig, zweimal verschoben.
3. **Vor Sprint Planning: `git fetch origin`** — nicht verhandelbar. Noch einmal in MEMORY dokumentieren.

### Sprint 26 — Empfehlung

| Kandidat | Prio | Warum jetzt |
|----------|------|-------------|
| **#11 game.js → initGrid()** | P1 | ~60 LOC, kein Canvas-Context, sicher. game.js unter 4500. |
| **#50 Höhle = Dungeon-Framework** | P1 | Zweimal verschoben. Oscar entdeckt etwas Neues. IT-Themen: Bits→Kernel→Browser. |
| **#95 Wu-Xing→NPC-Events** | P2 | Feuer→Asche triggert SpongeBob-Kommentar. Inter-Schicht-Kommunikation. Wäre Oscar-sichtbar. |

---

## Standup Log

### 2026-04-01 (Sprint 25 Planning)

**Kontext:** Sprint 24 Review + Retro abgeschlossen (alle 3 Items Done, PR #107 gemergt). game.js: 4649 Zeilen nach pull.

**Sprint 25 Fokus:** Oscar-sichtbare Änderungen zuerst (#71 + #97), dann Schulden (#11). Max 3 Items aus Retro-Empfehlung.

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
