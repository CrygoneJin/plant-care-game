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
