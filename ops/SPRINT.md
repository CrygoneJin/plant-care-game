# Sprint 92 — "Stack abbauen + 805 Quests"

**Sprint Goal:** Alle offenen PRs auf main (Till), Quests R76 geschrieben, NPC-Dialog Playwright Tests.
**Start:** 2026-04-21

---

## Sprint Backlog

| # | Item | Owner(s) | Status |
|---|------|----------|--------|
| S92-1 | **Merge-Stack** — #394, #395, #396, #397, #399, #401 alle auf main | Leader | 🔲 Human Input (Till mergt) |
| S92-2 | **Quests Runde 76** — Floriane+4, Mephisto+3, Kraemerin+3 (775→785) | Artist | ✅ PR #401 |
| S92-3 | **Playwright: NPC-Dialog Tests** — Coverage für NPC-Gespräche (#103 Live Launch) | Engineer | 🔲 Noch nicht begonnen |

---

## Sprint Review S91 (2026-04-21 Session 101)

**Sprint Goal:** Playwright Tests + Quests R73/R74 bereit für main.
**Ergebnis:** ✅ Code fertig, PRs offen — warten auf Till.

| Item | Ergebnis |
|------|---------|
| S91-1 | ✅ Playwright Craft-Flow Tests (PR #394, 7 Tests) + Sailing/Archipel (PR #395, 7 Tests) |
| S91-2 | ✅ Quests R73 (Krabs+4, Bug+3, Tommy+3) PR #396 + R74 (Maus+4, Neinhorn+3, Spongebob+3) PR #397 |

**Counts nach Merge aller offenen PRs:** 775 → 795 (R73+R74) → 805 (R75)

---

## Sprint Retrospective S91

**Gut:**
- Quest-Pace (10 pro Session) ist stabil und conflict-free wenn man NPCs aufteilt
- Playwright Tests sind wertvolle Investition — Coverage für Craft + Sailing
- R75 wurde conflict-free auf R74-Branch gebaut (Alien/Elefant/Lokführer — keine Überlappung)

**Problem:**
- PR-Stack wächst schneller als Till mergt: aktuell 6 offene PRs (#394–#399)
- SPRINT.md auf main war 2 Sprints hinter der Realität

**Learning:**
- Nächster Sprint: max 3 neue PRs bevor Till merged. Stack-Limit einhalten.
- PR #398 (docs-only SPRINT.md) ist obsolet — dieser Commit macht es überflüssig

---

## Standup Log

### 2026-04-21 — Daily Scrum S92 Session 102

**Smoke Tests:** 403 — bekannte Sandbox-Einschränkung, kein App-Problem.

**S92-2 erledigt:** Quests Runde 76 — Floriane (60→64, +4), Mephisto (61→64, +3), Kraemerin (62→65, +3). 775→785 Quests. PR #401 erstellt, conflict-free mit #394–#399.

**PR #398 geschlossen** (obsolet, durch PR #400 ersetzt).

**Merge-Reihenfolge für Till (aktualisiert):**

| PR | Inhalt | Aktion |
|----|--------|--------|
| #394 | Playwright Craft-Flow Tests | ✅ Mergen |
| #395 | Playwright Sailing/Archipel Tests | ✅ Nach #394 |
| #396 | Quests Runde 73 (Krabs/Bug/Tommy +10) | ✅ Nach #395 |
| #397 | Quests Runde 74 (Maus/Neinhorn/Spongebob +10) | ✅ Nach #396 |
| #399 | Quests Runde 75 (Alien/Elefant/Lokführer +10) | ✅ Nach #397 |
| #401 | Quests Runde 76 (Floriane/Mephisto/Kraemerin +10) | ✅ Nach #399 |
| #400 | SPRINT.md Sprint 92 + Daily Scrum | ✅ Jederzeit (docs-only) |

Nach allen 6 Quest-Merges: **835 Quests** auf main.

**S92-3:** Playwright NPC-Dialog Tests — nächste Session.

---

### 2026-04-21 — Daily Scrum S92 Session 101

**Smoke Tests:** 403 — bekannte Sandbox-Einschränkung, kein App-Problem.

**Ceremony:** Sprint Review S91 + Retro + Planning S92 durchgeführt. SPRINT.md auf main aktualisiert.

**Neues:** PR #399 — Quests Runde 75 (Alien+4, Elefant+3, Lokführer+3, 785→795).

**Merge-Reihenfolge für Till:**

| PR | Inhalt | Aktion |
|----|--------|--------|
| #394 | Playwright Craft-Flow Tests | ✅ Mergen |
| #395 | Playwright Sailing/Archipel Tests | ✅ Nach #394 |
| #396 | Quests Runde 73 (Krabs/Bug/Tommy +10) | ✅ Nach #395 |
| #397 | Quests Runde 74 (Maus/Neinhorn/Spongebob +10) | ✅ Nach #396 |
| #398 | SPRINT.md docs (obsolet nach diesem Commit) | ❌ Schließen |
| #399 | Quests Runde 75 (Alien/Elefant/Lokführer +10) | ✅ Nach #397 |

Nach allen 5 Merges: **805 Quests** auf main.

**S92-2:** Runde 76 wird nach R75-Merge oder auf R75-Branch geplant.
**S92-3:** Playwright NPC-Dialog Tests — nächste Session.

---

## Sprint Review S90 + Retro (2026-04-20 Session 98)

**Sprint Goal:** Tests + Quests R70 auf main.
**Ergebnis:** ✅ via PR #387.

| Item | Ergebnis |
|------|---------|
| S90-1 | ✅ Quests Runde 70 (Spongebob/Lokführer/Alien) — 706 Quests |
| S90-2 | ✅ Sprint 89 Review + Retro in SPRINT.md |

**Retro S90:** Konsolidierungs-PR #393 hat 39 Quests auf einmal gelandet (736→775). Effizienz gut, aber große PRs sind schwerer zu reviewen.

---

## Sprint Review S89 + Retro (2026-04-20 Session 92)

**Sprint Goal:** PR #382 (Tesla-Fix) und PR #383 (R69) auf main. PR-Chaos sortiert.
**Ergebnis:** ✅ Alle Items erledigt via Session 97.

| Item | Ergebnis |
|------|---------|
| S89-1 | ✅ ISO-Renderer Fix (PR #382) — Insel verschwindet nicht mehr im Tesla |
| S89-2 | ✅ Quests Runde 69 (PR #383) — Tommy/Neinhorn/Elefant/Bernd/Maus |
| S89-3 | ✅ PR-Triage — #384/#385/#386/#388/#389 geschlossen, Merge-Reihenfolge dokumentiert |

**Retro S89:** Merge-Marathon hat funktioniert. PR-Chaos entsteht wenn mehrere Nacht-Sessions parallel laufen. Lösung: Stack-Limit 3 PRs max.
