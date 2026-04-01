# Sprint 24 — "Oscar baut Musik"

**Sprint Goal:** Jeder Block klingt nach Genre. Kinder die nicht lesen können, spielen trotzdem. Technische Schuld sinkt.

**Start:** 2026-04-01

---

## Sprint Backlog

| # | Item | Owner(s) | Status |
|---|------|----------|--------|
| S24-1 | **Genre-Tonsequenzen aktivieren** (#85) — `soundGenreNote()` in `soundBuild` einhängen. Genre-Toast bei Wechsel. Oscar hört Musik während er baut. | Engineer | ✅ Done |
| S24-2 | **Tutorial ohne Text** (#15) — Erste 3 Schritte: Icons + Pfeil-Animationen statt Erklärtext. Kinder die nicht lesen können, finden den ersten Block in 10 Sek. | Designer + Engineer | 🔲 Offen |
| S24-3 | **game.js aufteilen: Grid + Effects** (#11) — Grid-Rendering und Partikel-Effekte rausziehen. Ziel: game.js unter 3500 LOC. | Engineer | 🔲 Offen |

---

## Standup Log

### 2026-04-01 (Sprint 24 Planning)

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

<<<<<<< HEAD
## Sprint Retrospective — 2026-03-31 (Nacht)

### Was lief gut?

- **8 Items in einer Nacht-Session.** Kein anderer Sprint hat so viel geliefert.
- **Mephisto als würdiger Abschluss.** 10. NPC, letzter Unlock — die Charakterliste ist jetzt vollständig.
- **Voice-Integration ohne Regressions.** Gemini Live API + 5 Stimmen, kein vorhandener Code gebrochen.
- **Lummerland in einer Stunde.** Handgebaute Insel für Oscar. Er kennt Jim Knopf.
- **Backlog-Audit:** 8 Phantom-Opens erkannt und bereinigt — Backlog dichter als je zuvor.

### Was lief schlecht?

- **Smoke Test weiterhin geblockt.** Proxy-Sandbox im Claude Code Web verhindert curl gegen externe Domains. Bekanntes Problem, keine Lösung in Sicht ohne CI/CD.
- **User Actions U1 + U2 offen.** MMX Wallet + Voice-Test hängen am User. Kein technisches Problem, nur fehlende Rückmeldung.
- **Gemini Voice braucht API Key im Worker.** U3 ist Done (User hat Key gesetzt), aber U2 (testen) steht noch aus. Kein Feedback ob es läuft.

### Was verbessern wir?

1. **#86 CI/CD Pipeline** als nächsten Tech-Sprint — Smoke Test in GitHub Actions, nicht sessionabhängig.
2. **User Actions explizit nachfragen** wenn nach 2 Sprints kein Status — U1/U2 sind seit Sprint 22 offen.
3. **Vor jedem Sprint Planning:** Offene User Actions auf "Erledigt oder Eingefroren?" prüfen.

---

# Sprint 23 — "Oscar hört"

**Sprint Goal:** NPCs sprechen. QR-Code für Eltern. Code sauber.

**Start:** 2026-03-31

---

## Sprint Backlog

| # | Item | Owner(s) | Status |
|---|------|----------|--------|
| S23-1 | **TTS Hörspiele** (#87) — Phantom-Open: bereits in game.js:656-720 implementiert (speakLines, stopHoerspiel, 7 Szenen). Backlog bereinigt. | Engineer | ✅ Done (Phantom-Open erkannt) |
| S23-2 | **QR-Code auf Postkarte** (#7) — qr.js: reiner QR-Generator (Version 2, EC-L, ~260 Zeilen). Postkarte zeigt scanbare URL https://schatzinsel.app rechts unten. | Engineer | ✅ Done |
| S23-3 | **game.js Zellteilung** (#11) — Grid-Logik + Stories extrahieren. Ziel: game.js unter 3000 Zeilen. | Engineer | 🔲 Offen |

---

## Standup Log

### 2026-03-31 (Sprint 23 Planning)

**Kontext (Commits seit Sprint 22):** Kein neuer Commit seit Nacht-Session.

**Sprint-Fokus:** S23-1 (TTS Hörspiele) als erstes Item dieser Session.

**Blocker:** Keine.
=======
## Sprint Retrospective — 2026-03-31 (Nacht, nach Review)

### Was lief gut?

- **Alle 8 Items Done.** Sprint Goal vollständig erreicht, keine Nachläufer.
- **Mephisto funktioniert.** 10. NPC, Deal-Mechanik, Browning-Zitat — Persönlichkeit ohne Overengineering.
- **Gemini Voice läuft.** 5 Stimmen (Charon/Puck/Kore/Aoede/Fenrir) live. Kein Vendor-Lock-In durch Worker-Abstraktion.
- **KLONK auf Minecraft-Niveau.** 3 Oszillatoren, Sub-Bass. Oscar hört den Unterschied.
- **Lummerland als Easter Egg.** `?lummerland` funktioniert. Kein Feature-Request, kein PR-Drama — einfach gebaut.

### Was lief schlecht?

- **8 Items in einem Sprint.** Dreifach über dem Maximum (3). Wird nicht wiederholt.
- **Smoke Test weiterhin blockiert.** Sandbox-Proxy verhindert externe Curls. Bekannt. Nicht gelöst.
- **#28 Chat-Sidebar verschoben.** Layout-Umbau ohne klare Spec. Verschiebt sich weiter wenn kein konkretes Design.
- **Worker-Discovery-Endpoint leer.** Nicht klar ob Sandbox-Block oder echter Defekt — kein Test möglich.

### Was verbessern wir?

1. **Max 3 Items pro Sprint — hart.** Auch wenn es verlockend ist: 3 und gut. Overflow → nächster Sprint.
2. **Smoke Test in GitHub Actions auslagern** — nicht sessionabhängig (BACKLOG #86).
3. **Vor jedem Sprint: eine Oscar-sichtbare Änderung** — Klang, Optik, oder neuer Charakter. Motivation bleibt hoch.

### Sprint 23 — Empfehlung (Planning nächste Session)

| Kandidat | Prio | Warum jetzt |
|----------|------|-------------|
| **#85 Genre-Tonsequenzen** | P3 | Oscar hört Musik wenn er baut. Höchster Spaß-Impact pro LOC. |
| **#15 Tutorial ohne Text** | P2 | Kinder die nicht lesen können (Oscars jüngere Geschwister). |
| **#11 game.js weiter aufteilen** | P1 | In Arbeit. Grid/Effects/Stories noch drin. Schuldenlast sinken lassen. |
>>>>>>> origin/main

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
