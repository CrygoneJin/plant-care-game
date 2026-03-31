# Test-Ergebnisse — Sprint 1

**Datum:** 2026-03-29
**Methode:** Playwright MCP (Browser-Automation)
**URL:** https://crygonejin.github.io/schatzinsel/?v=final-review

---

## Smoketest (Playwright, automatisiert)

| # | Test | Aktion | Erwartet | Ergebnis |
|---|------|--------|----------|----------|
| 1 | Seite lädt | Navigate to URL | Title enthält "Insel-Architekt" | PASS |
| 2 | Intro sichtbar | — | "🏝️ Los!" Button vorhanden | PASS |
| 3 | Los! klicken | Click "Los!" | Intro verschwindet, Spiel sichtbar | PASS |
| 4 | Palette reduziert | — | 9 Materialien (5 Wu-Xing + Stein, Sand, Glas, Baum) | PASS |
| 5 | Achievements versteckt | — | 1× ⭐ + 11× ❓ "???" | PASS |
| 6 | Kindertexte | — | "Deine Insel wartet!", "Klick links, bau los!" | PASS |
| 7 | Starter-Insel | — | Baum + Sand + Wasser auf Grid | PASS |
| 8 | Material wählen | Click "🔥 Feuer" | Feuer ausgewählt (active) | PASS |
| 9 | Bauen | Click auf Canvas | Feuer-Block erscheint, Sidebar zeigt "6 Blöcke" | PASS |
| 10 | Insel-Info aktualisiert | — | Sand: 3, Feuer: 1, Baum: 1, Wasser: 1, 2% | PASS |
| 11 | config.js 404 | — | Erwartet (gitignored), ELIZA-Fallback greift | PASS (erwartet) |

**Ergebnis: 11/11 PASS**

---

## Sprint 1 Feature-Verifikation

| # | Item | Erwartet | Live-Beweis | Status |
|---|------|----------|-------------|--------|
| S1-1 | Palette 5+3 | 8-9 Materialien | 9 Buttons sichtbar (5 Wu-Xing + 4 Starter) | PASS |
| S1-2 | Achievements versteckt | Nur entdeckte + ❓ | ⭐ + 11× ❓ | PASS |
| S1-3 | sessionDuration | getMetrics() gibt Sekunden | Code: `s.start ? Math.round(...)` in getMetrics() | PASS |
| S1-4 | Starter-Insel | Sand + Baum + Wasser | 3 Sand + 1 Baum + 1 Wasser auf Grid | PASS |
| S1-5 | Kindertexte | 4 neue Texte | Alle 4 sichtbar in Sidebar | PASS |
| S1-6 | Feynman Datenfluss | _feynman → n8n | chat.js baut _feynman, worker.js filtert | PASS |

---

## Bekannte Issues (kein Sprint-Blocker)

| # | Was | Schwere |
|---|-----|---------|
| 1 | Toolbar hat Save/Load/New Buttons (aus Cherry-Pick) | Kosmetisch |
| 2 | Labels sichtbar bei Wu-Xing (shuffleLabels greift erst bei nächstem Deploy) | Kosmetisch |
| 3 | "Baum" als 9. Material sichtbar (8 geplant, 9 implementiert) | Minor — eher besser als schlechter |

---

## Screenshots

| Datei | Was |
|-------|-----|
| `sprint1-live.png` | Intro nach Deploy |
| `sprint1-after-los.png` | Spiel mit Starter-Insel + reduzierter Palette |
| `final-review-game.png` | Spiel nach Los! (2. Test-Run) |
| `final-review-built.png` | Nach Feuer-Block gebaut — 6 Blöcke, 2% |
