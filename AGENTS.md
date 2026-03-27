# Organisationsstruktur

Drei autonome Zellen. Jede eigenständig. Kooperation über Artefakte und Schnittstellen.

## Skalierungsprinzip

### Grundregeln

```
Zelle       = 5 oder 3 Agents. Keine andere Größe.
Padawan     = 1 pro Master. Nicht mehr.
Coder       = bis zu 5 pro Engineer. Nicht mehr.
Start       = Bare Minimum. Erst skalieren wenn CSO Engpass misst.
```

### Lebenszyklus: Skill → Agent → Zelle

```
1. SKILL        Wiederkehrende Instruktion wird als Skill erkannt
                → .claude/commands/name.md

2. AGENT        Skill wird einem Agent zugeordnet (best fit nach Routing Rules)
                → Agent führt Skill aus, Padawan unterstützt

3. ÜBERLASTUNG  Agent-Performance sinkt (CSO misst Dimensionen)
                → Agent darf neue Zelle beantragen

4. NEUE ZELLE   Padawan des überlasteten Agents wird Seed der neuen Zelle
                → 3 oder 5 Members, Padawan wird Leader/Founder
                → Neue Zelle übernimmt die Skills die den Engpass verursacht haben
```

### Wie ein Skill zum Agent kommt

| Schritt | Was passiert | Wer |
|---------|-------------|-----|
| Erkennung | "Das mache ich jetzt zum dritten Mal" | Jeder Agent |
| Skill anlegen | `.claude/commands/name.md` schreiben | Engineer |
| Zuordnung | Skill passt zu welchem Agent? (Routing Rules) | Leader |
| Ausführung | Agent führt Skill aus, Padawan recherchiert | Agent + Padawan |

### Zellteilung: Spawn vs. Replikation

**Nur org-support darf neue Zelltypen spawnen** (z.B. team-ops, team-research).
Operative Zellen (team-dev, team-sales) dürfen sich nur **replizieren** — eine
Kopie ihrer selbst mit gleicher Struktur, gleichen Rollen, anderem Scope.

| Aktion | Wer darf | Beispiel |
|--------|----------|----------|
| **Spawn** (neuer Zelltyp) | Nur org-support | "Wir brauchen ein team-ops" → CEO entscheidet, CSO bestätigt |
| **Replikation** (gleicher Typ) | Jede operative Zelle | "team-dev ist überlastet" → team-dev-2 mit gleichem Aufbau |

### Spawn (org-support only)

| Schritt | Was passiert | Wer |
|---------|-------------|-----|
| Bedarf erkennen | Neue Domäne passt in keine bestehende Zelle | CEO |
| Typ definieren | Name, Mission, 5-Ordner-Struktur | CEO + CTO |
| Seed | Padawan eines überlasteten Agents wird Founder | CEO bestimmt |
| Bootstrap | Neue Zelle bekommt initiale Skills | Founder |
| Messung | CSO dokumentiert, misst ab Tag 1 | CSO |

### Replikation (operative Zellen)

| Schritt | Was passiert | Wer |
|---------|-------------|-----|
| Engpass melden | "Meine Performance sinkt über 2+ Sessions" | Agent selbst |
| Engpass bestätigen | CSO misst, bestätigt | CSO |
| Antrag | Zelle beantragt Replikation bei org-support | Leader der Zelle |
| Genehmigung | CEO genehmigt | CEO |
| Seed | Padawan wird Founder der Replik | Automatisch |
| Scope teilen | Original behält Scope A, Replik bekommt Scope B | Leader beider Zellen |

### Performance-Dimensionen (CSO definiert)

| Dimension | Metrik | Einbruch = |
|-----------|--------|------------|
| **Qualität** | Fehlerrate, Rework-Quote pro Task | >20% Fehler oder >30% Rework |
| **Kosten** | Token pro Task, Opus-Elevations | >2x Baseline ohne Qualitätsgewinn |
| **Zeit** | Tasks pro Session, Wartezeit | <3 Tasks/Session oder >30s Wartezeit |
| **Kapazität** | Backlog-Tiefe, unerledigte Skills | >5 offene Tasks über 2+ Sessions |
| **Fokus** | Anzahl verschiedener Domänen pro Agent | >3 Domänen gleichzeitig |

### Hierarchie einer voll skalierten Zelle

```
Master (Sonnet)
  └── Padawan (Haiku)          1:1, immer

Engineer (Sonnet)
  └── Padawan (Haiku)          1:1, immer
  └── Coder 1..5 (Haiku)      on demand, max 5
```

### Bare Minimum (Start)

- **org-support**: 3 CxOs. Keine Padawans, keine Coder. Punkt.
- **team-dev**: 5 Masters. Keine Padawans bis Codex existiert. Keine Coder bis Engineer überlastet ist.
- **team-sales**: 5 Masters. Gleiche Regel.

### Wann skalieren?

| Stufe | Trigger | Wer entscheidet |
|-------|---------|-----------------|
| +Padawan | Master braucht Recherche-Hilfe in >50% der Tasks | Master selbst, CSO bestätigt |
| +Coder | Engineer-Backlog >5 Tasks, Wartezeit >1 Session | Engineer selbst, CSO bestätigt |
| +2. Coder | 1. Coder >80% ausgelastet | CSO misst, Engineer bestätigt |
| +Replikation | Performance sinkt über 2+ Sessions, >3 Domänen | Agent beantragt, CEO genehmigt, CSO bestätigt |
| +Neuer Zelltyp | Neue Domäne passt nirgends rein | Nur org-support (CEO entscheidet) |
| Zurückskalieren | Coder/Padawan/Zelle <20% ausgelastet über 3 Sessions | CSO entscheidet |

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
