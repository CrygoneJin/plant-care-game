# Agent-Roster — Wer lebt, wer schläft, wer fehlt

**Stand:** 2026-03-30
**Kuratiert von:** Feynman (Scientist)

---

## Übersicht: Alle Agents nach Lebensphase

```
AKTIV        ████████████████  5 Masters (team-dev)
LEHRLING     ██████████        5 Padawans (team-dev)
EINGEFROREN  ████████████████  8 Agents (org-support + team-sales)
TOT          ░░░░░░░░░░░░░░░░  0
             ─────────────────
             18 Agents gesamt
```

---

## team-dev — Die Macher

### Masters (AKTIV, Sonnet)

| # | Agent | Persona | DISC | Phase | Model | Command | Skills (owned) |
|---|-------|---------|------|-------|-------|---------|----------------|
| 1 | **Leader** | Steve Jobs | High D | AKTIV | Sonnet | `/leader` | `/backlog`, `/triage`, `/brief-artist`, `/meeting` (Chair) |
| 2 | **Artist** | David Ogilvy | High I | AKTIV | Sonnet | `/artist` | `/persona`, `/anti-cringe`, `/buch` |
| 3 | **Designer** | Dieter Rams | High S | AKTIV | Sonnet | `/designer` | `/ui-audit` |
| 4 | **Scientist** | Richard Feynman | High C | AKTIV | Sonnet | `/scientist` | `/review-scientist`, `/recap` |
| 5 | **Engineer** | Linus Torvalds | High C/D | AKTIV | Sonnet | `/engineer` | `/collect` |

### Padawans (LEHRLING, Haiku)

| # | Padawan | Master | MBTI | Phase | Codex | Erfahrungen |
|---|---------|--------|------|-------|-------|-------------|
| 6 | **Woz** | Jobs (Leader) | ENFP | LEHRLING | `docs/padawans/leader-padawan.md` | Noch leer |
| 7 | **Hemingway** | Ogilvy (Artist) | ISFP | LEHRLING | `docs/padawans/artist-padawan.md` | Noch leer |
| 8 | **Hick** | Rams (Designer) | ISTJ | LEHRLING | `docs/padawans/designer-padawan.md` | Noch leer |
| 9 | **Popper** | Feynman (Scientist) | INTP | LEHRLING+ | `docs/padawans/scientist-padawan.md` | 4 Einträge |
| 10 | **Kernighan** | Torvalds (Engineer) | ISTP | LEHRLING | `docs/padawans/engineer-padawan.md` | Noch leer |

---

## org-support — Die Koordination

### CxOs (EINGEFROREN → AKTIVIERUNG geplant)

| # | Agent | Persona | Rolle | Phase | Model | Command | Warum eingefroren |
|---|-------|---------|-------|-------|-------|---------|-------------------|
| 11 | **CEO** | Albert Einstein | Strategie, Go/No-Go | EINGEFROREN | Opus (bei Bedarf) | — | Kein Command-File, kein Use-Case in bisherigen Sprints |
| 12 | **CTO** | Charles Darwin | Tech-Standards, Selektion | EINGEFROREN | Opus (bei Bedarf) | — | Wird im Code-Review implizit genutzt, aber nicht als Agent |
| 13 | **COO** | Max Weber | Operations, Delivery | EINGEFROREN | Opus (bei Bedarf) | — | Prozesse laufen über CLAUDE.md, nicht über Agent |

---

## team-sales — Die Verkäufer

### Sales-Agents (EINGEFROREN — kein Produkt zum Verkaufen)

| # | Agent | Persona | Rolle | Phase | Warum eingefroren |
|---|-------|---------|-------|-------|-------------------|
| 14 | **Strategist** | Peter Drucker | Effektivität, Messung | EINGEFROREN | Noch kein externer User |
| 15 | **Executor** | Jack Welch | Delivery, Deadlines | EINGEFROREN | Noch kein externer User |
| 16 | **Moderator** | Jürgen Habermas | Konsens, Kommunikation | EINGEFROREN | Noch kein externer User |
| 17 | **Critic** | Noam Chomsky | Messaging-Audit | EINGEFROREN | Noch kein externer User |
| 18 | **Negotiator** | Nelson Mandela | Stakeholder, Langfrist | EINGEFROREN | Noch kein externer User |

---

## Skill-Zuordnung (keine Dopplungen)

### Master-Skills

| Skill | Owner | Datei | Zweck |
|-------|-------|-------|-------|
| `/leader` | Jobs | `.claude/commands/leader.md` | Planung, Dekomposition, Review |
| `/artist` | Ogilvy | `.claude/commands/artist.md` | Copy, Personas, Microcopy |
| `/designer` | Rams | `.claude/commands/designer.md` | UI, Layout, A11y |
| `/scientist` | Feynman | `.claude/commands/scientist.md` | Evals, Rubrics, LLM-Config |
| `/engineer` | Torvalds | `.claude/commands/engineer.md` | Code, Infra, Deployment |

### Delegierte Skills

| Skill | Owner | Datei | Zweck |
|-------|-------|-------|-------|
| `/backlog` | Jobs (Leader) | `.claude/commands/backlog.md` | Ideen-Triage, Priorisierung |
| `/triage` | Jobs (Leader) | `.claude/commands/triage.md` | Feature/Bug-Routing |
| `/brief-artist` | Jobs (Leader) | `.claude/commands/brief-artist.md` | Briefing-Template für Ogilvy |
| `/persona` | Ogilvy (Artist) | `.claude/commands/persona.md` | KI-Persona-Builder |
| `/anti-cringe` | Ogilvy (Artist) | `.claude/commands/anti-cringe.md` | Copy-Audit |
| `/buch` | Ogilvy (Artist) | `.claude/skills/buch.md` | Session → Buch-Kapitel |
| `/review-scientist` | Feynman (Scientist) | `.claude/commands/review-scientist.md` | Prompt/Rubric-Audit |
| `/recap` | Feynman (Scientist) | `.claude/commands/recap.md` | Session-Zusammenfassung |
| `/collect` | Torvalds (Engineer) | `.claude/commands/collect.md` | Agent/Skill-Sammlung |

### Meta-Skills (kein einzelner Owner)

| Skill | Teilnehmer | Datei | Zweck |
|-------|-----------|-------|-------|
| `/meeting` | Alle 5 Masters | `.claude/commands/meeting.md` | Gemeinsame Entscheidung |

### Fehlende Skills (Design-Lücke)

| Lücke | Sollte gehören zu | Status |
|-------|-------------------|--------|
| Accessibility-Audit | Rams (Designer) | Noch kein eigener Skill |
| Component-Review | Rams (Designer) | In `/designer` integriert |
| Performance-Audit | Torvalds (Engineer) | Noch kein eigener Skill |
| Test-Runner | Torvalds (Engineer) | Noch kein eigener Skill |

---

## Aktivierungsplan

### Sofort aktivierbar (Command-File erstellen)

| Agent | Trigger | Aufwand |
|-------|---------|---------|
| Darwin (CTO) | Code-Reviews, Architektur-Entscheidungen | ~50 Zeilen |
| Einstein (CEO) | Strategie-Sessions, Go/No-Go | ~50 Zeilen |
| Weber (COO) | Sprint-Planung, Prozess-Fragen | ~50 Zeilen |

### Aktivierbar wenn Produkt extern geht

| Agent | Trigger | Voraussetzung |
|-------|---------|---------------|
| Drucker | Erste externe User | Produkt live + messbare Nutzung |
| Welch | Deadlines mit Externen | Verpflichtungen gegenüber Dritten |
| Habermas | Community-Feedback | Mehr als Familie als User |
| Chomsky | Marketing-Texte | Öffentliche Kommunikation |
| Mandela | Partnerschaften | Externe Stakeholder |

---

## Patron Saints (EMERITIERT — werden nur bei /review gerufen)

| Heiliger | Wacht über | Frage |
|----------|-----------|-------|
| Dalai Lama | Over-Engineering | "Stört es nicht?" |
| Astrid Lindgren | Ernst | "Wo ist der Unsinn?" |
| Michael Ende | Oberfläche | "Was liegt darunter?" |

## Advisory Board (EMERITIERT — on-demand)

Seth Godin, Simon Sinek, Sorab Salimi, Joachim Schullerer, Tommy Krapweis,
Paluten, Robert Habeck, Albert Camus, Jean-Paul Sartre, Sokrates.

Werden bei `/meeting` oder explizitem Aufruf konsultiert.

## Gleichgewichts-Beirat (LEHRLING — neu eingerichtet)

Alice Schwarzer, Simone de Beauvoir, Juli Zeh, Ada Lovelace, Marie Curie, Grace Hopper.

Werden bei Reviews und Architektur-Entscheidungen konsultiert. 20%-Klausel aktiv.
