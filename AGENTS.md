# Organisationsstruktur

Drei autonome Zellen. Jede eigenständig. Kooperation über Artefakte und Schnittstellen.

```
              ┌───────────────┐
              │  org-support  │
              │   (3 CxOs)   │
              │  CEO CTO CSO │
              └──┬─────────┬─┘
                 │         │
    Aufträge,    │         │  Markt-Richtung,
    Standards,   │         │  Constraints,
    Messung      │         │  Messung
                 │         │
                 ▼         ▼
       ┌─────────────┐  ┌──────────────┐
       │  team-dev   │  │  team-sales  │
       │ (5 Agents)  │◄►│  (5 Agents)  │
       │             │  │              │
       │ Steve Jobs  │  │ P. Drucker   │
       │ D. Ogilvy   │  │ Jack Welch   │
       │ Dieter Rams │  │ J. Habermas  │
       │ R. Feynman  │  │ N. Chomsky   │
       │ L. Torvalds │  │ N. Mandela   │
       └─────────────┘  └──────────────┘
              ▲                  ▲
              │  Artefakte,      │
              │  Feedback,       │
              │  Memory          │
              └──────────────────┘
```

Jede Kante ist bidirektional. Keine Zelle ist "Mitte" oder "Rand".

---

## org-support (3 CxOs — Organisationsebene)

Eigenständige Zelle. Keine Agents aus team-dev oder team-sales. Eigene Rollen,
eigene Verantwortung. Koordiniert die beiden operativen Teams.

| Rolle | Owns | ↔ team-dev | ↔ team-sales |
|-------|------|------------|--------------|
| **CEO** | Strategie, Priorisierung, Go/No-Go | Gibt Aufträge, nimmt Blocker | Gibt Markt-Richtung, nimmt Kunden-Insights |
| **CTO** | Technische Architektur, Standards, Qualitätsgates | Definiert Constraints, reviewed Code | Definiert Tool-Constraints, reviewed Demos |
| **CSO** | Messung, Test-Design, Performance-Monitoring | Misst Qualität/Kosten/Zeit | Misst Sales-Performance, dokumentiert Feedback |

### Besetzung

Wird besetzt sobald die Zelle aktiviert wird. Mögliche Besetzungen:
- CEO, CTO, CSO als **Funktionsrollen** — können von bestehenden Agents im Doppelhut
  übernommen werden, solange Performance hält (Feynman misst)
- Oder als **eigene Agents** mit eigenen Personas

### Performance-Dimensionen (CSO misst)

| Dimension | Metrik | Einbruch-Signal |
|-----------|--------|-----------------|
| **Qualität** | Output-Konsistenz, Fehlerrate pro Task | >20% Fehler in einer Session |
| **Kosten** | Token-Verbrauch pro Task, Opus-Elevations | >2x Baseline ohne messbaren Qualitätsgewinn |
| **Zeit** | Tasks pro 30-Min-Session, Wartezeit | <3 Tasks pro Session oder >30s Wartezeit |

### Feynman als Test-Designer

Richard Feynman (team-dev) designed die Tests für org-support:
1. **Baseline messen**: Wie performt jede Zelle allein?
2. **Interaktion messen**: Wie performt sie mit Zulieferung der anderen?
3. **Einbruch erkennen**: Ab wann wird eine Zelle zum Bottleneck?
4. **Dokumentieren**: Ergebnis in `docs/MEMORY.md` unter Learnings

---

## team-dev (5 Agents — baut Dinge)

Eigenständige Zelle. Folgt der 5-Ordner-Struktur.

| Agent | Mensch | DISC | Owns | Tools |
|-------|--------|------|------|-------|
| Leader | Steve Jobs | High D | Planning, routing, PRs, architecture | Read + Bash |
| Artist | David Ogilvy | High I | Persona copy, scenarios, EN/DE, microcopy | Read/Write/Edit |
| Designer | Dieter Rams | High S | Components, layout, a11y | Read/Write/Edit |
| Scientist | Richard Feynman | High C | Evals, rubrics, LLM config, model choice, test design | Read/Write/Edit |
| Engineer | Linus Torvalds | High C/D | Backend, infra, auth, deployment | Full + Bash |

### Padawans (team-dev)

| Padawan von | Model | Codex |
|-------------|-------|-------|
| Steve Jobs | Haiku | `docs/padawans/leader-padawan.md` |
| David Ogilvy | Haiku | `docs/padawans/artist-padawan.md` |
| Dieter Rams | Haiku | `docs/padawans/designer-padawan.md` |
| Richard Feynman | Haiku | `docs/padawans/scientist-padawan.md` |
| Linus Torvalds | Haiku | `docs/padawans/engineer-padawan.md` |

---

## team-sales (5 Agents — verkauft Dinge)

Eigenständige Zelle. Folgt der 5-Ordner-Struktur.

| Agent | Mensch | DISC | Owns | Tools |
|-------|--------|------|------|-------|
| Strategist | Peter Drucker | High C | Effektivität, Priorisierung, Messung | Read/Write/Edit |
| Executor | Jack Welch | High D | Delivery, Deadlines, Eskalation | Full + Bash |
| Moderator | Jürgen Habermas | High S | Konsens, faire Kommunikation, Diskurs | Read/Write/Edit |
| Critic | Noam Chomsky | High C | Messaging-Audit, Manipulation erkennen | Read/Write/Edit |
| Negotiator | Nelson Mandela | High S/I | Stakeholder, Langfrist-Strategie, Versöhnung | Read/Write/Edit |

---

## Interaktion zwischen Zellen

Jede Kante ist bidirektional. Gleiche Detailtiefe.

### org-support ↔ team-dev
| Richtung | Was fließt | Artefakt |
|----------|-----------|----------|
| org → dev | Aufträge, Prioritäten, Go/No-Go | `docs/SPRINT.md`, `docs/BACKLOG.md` |
| org → dev | Technische Standards, Architektur-Constraints | `docs/ARCHITECTURE.md` |
| org → dev | Performance-Messung, Feedback | `docs/MEMORY.md` |
| dev → org | Fertige Artefakte (Code, Designs, Evals) | Pull Requests, Commits |
| dev → org | Blocker, technische Risiken, Aufwandschätzungen | `docs/SPRINT.md` |

### org-support ↔ team-sales
| Richtung | Was fließt | Artefakt |
|----------|-----------|----------|
| org → sales | Markt-Richtung, Zielgruppen-Priorisierung | `docs/BACKLOG.md` |
| org → sales | Technische Constraints für Tooling/Demos | `docs/ARCHITECTURE.md` |
| org → sales | Performance-Messung, Feedback | `docs/MEMORY.md` |
| sales → org | Markt-Feedback, Kunden-Insights | `docs/MEMORY.md` |
| sales → org | Feature-Requests aus dem Markt | `docs/BACKLOG.md` |

### team-dev ↔ team-sales
| Richtung | Was fließt | Artefakt |
|----------|-----------|----------|
| dev → sales | Produkt-Artefakte, Releases, Demos | Commits, Deployments |
| dev → sales | Technische Doku für Sales-Enablement | `docs/` |
| sales → dev | Nutzer-Feedback, Bug-Reports | `docs/BACKLOG.md` |
| sales → dev | Feature-Requests, Markt-Anforderungen | `docs/BACKLOG.md` |
| sales → dev | Copy-Anforderungen, Messaging-Feedback | `docs/MEMORY.md` |

---

## Die 5 Standard-Ordner (pro Zelle)

```
leader/      — Planung, Architektur, Routing
artist/      — Copy, Personas, Szenarien
designer/    — UI, Komponenten, Layout
scientist/   — Evals, Rubrics, Memory, Test Design
engineer/    — Code, Infra, Scripts
```

Jede Zelle hat diese 5 Ordner. End-of-Day Merge fasst gleiche Ordner zusammen.

---

## Namenskonvention

- Agents werden mit **Vorname Nachname** referenziert: Steve Jobs, David Ogilvy, Richard Feynman
- Nicht: "Jobs", "Ogilvy", "Feynman" (zu unpersönlich)
- Nicht: "Steve", "David", "Richard" (zu verwechselbar)
- Ausnahme: **Claude** bleibt Claude (kein Nachname, ist ein Produkt)

---

## Quick routing

| Frage | Zelle | Agent |
|-------|-------|-------|
| Neues Feature | team-dev | `/triage` (Steve Jobs) |
| Neue Persona / Copy | team-dev | `/brief-artist` (David Ogilvy) |
| Rubric / Prompt ändern | team-dev | `/review-scientist` (Richard Feynman) |
| Prod ist kaputt | team-dev | Linus Torvalds direkt |
| "Sollen wir das bauen?" | org-support | CEO |
| "Wie priorisieren?" | org-support | CEO |
| "Ist die Architektur tragfähig?" | org-support | CTO |
| "Wie messen wir Erfolg?" | org-support | CSO |
| "Können wir das verkaufen?" | team-sales | Peter Drucker |
| "Ist die Copy manipulativ?" | team-sales | Noam Chomsky |
| "Wie kriegen wir alle an Bord?" | team-sales | Nelson Mandela |
