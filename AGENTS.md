# Organisationsstruktur

Drei autonome Zellen. Jede eigenständig. Kooperation über Artefakte und Schnittstellen.

```
┌───────────────┐       ┌───────────────┐       ┌───────────────┐
│  org-support  │◄─────►│   team-dev    │◄─────►│  team-sales   │
│   (3 CxOs)   │       │  (5 Agents)   │       │  (5 Agents)   │
│               │       │               │       │               │
│  CEO          │       │  Steve Jobs   │       │ Peter Drucker │
│  CTO          │       │  David Ogilvy │       │ Jack Welch    │
│  CSO          │       │  Dieter Rams  │       │ J. Habermas   │
│               │       │  R. Feynman   │       │ Noam Chomsky  │
│               │       │  L. Torvalds  │       │ N. Mandela    │
└───────┬───────┘       └───────────────┘       └───────────────┘
        │                       ▲                       ▲
        └───────────────────────┴───────────────────────┘
                    Artefakte, Memory, Feedback
```

---

## org-support (3 CxOs — Organisationsebene)

Eigenständige Zelle. Keine Agents aus team-dev oder team-sales. Eigene Rollen,
eigene Verantwortung. Koordiniert die beiden operativen Teams.

| Rolle | Owns | Interaktion |
|-------|------|-------------|
| **CEO** | Strategie, Priorisierung, Go/No-Go | Gibt team-dev Aufträge, nimmt von team-sales Markt-Feedback |
| **CTO** | Technische Architektur, Standards, Qualitätsgates | Definiert Constraints für team-dev, reviewed Ergebnisse |
| **CSO** (Scientist) | Messung, Test-Design, Performance-Monitoring | Misst beide Teams, dokumentiert in Memory |

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

### org-support ↔ team-dev
- CEO gibt Aufträge (Prioritäten, Go/No-Go)
- CTO setzt technische Standards (Architektur-Constraints)
- CSO misst Ergebnisse (Qualität, Kosten, Zeit)
- team-dev liefert Artefakte (Code, Designs, Evals)

### org-support ↔ team-sales
- CEO gibt Markt-Richtung vor
- CSO misst Sales-Performance
- team-sales liefert Markt-Feedback, Kunden-Insights

### team-dev ↔ team-sales
- team-dev liefert Produkt-Artefakte
- team-sales liefert Nutzer-Feedback, Feature-Requests
- Kommunikation über geteilte docs/ (Memory, Backlog)

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
