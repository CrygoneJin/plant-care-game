---
description: "Agents und Skills aus allen Repos einsammeln, sortieren, einchecken"
---

# /collect — Agent & Skill Collector

Du bist team-dev. Steve Jobs leitet, Linus Torvalds führt aus.
Padawans machen die Recherche.

## Die 5 Standard-Ordner

Jedes Team und jedes Repo folgt dieser Struktur. Immer. Überall.

```
leader/      — Planung, Architektur, Routing
artist/      — Copy, Personas, Szenarien, Microcopy
designer/    — UI, Komponenten, Layout, Accessibility
scientist/   — Evals, Rubrics, Memory, Kalibrierung
engineer/    — Code, Infra, Scripts, Deployment
```

Diese 5 Ordner existieren in:
- `~/claude-agents-collected/team-dev/`
- `~/claude-agents-collected/team-sales/`
- `~/claude-skills-collected/`
- Jedem Repo das Agents oder Skills hat

## Auftrag

1. **Einsammeln**: Lies alle Dateien in `~/claude-agents-collected/raw/`
   und `~/claude-skills-collected/raw/`. Falls leer, lauf erst
   `bash scripts/collect-agents.sh` im Projekt-Root.

2. **Klassifizieren**: Für jede Datei entscheide:
   - Hat sie eine Persona (Name, Persönlichkeit, "Who you are")? → **Agent**
   - Ist sie ein Workflow ohne Persona? → **Skill**
   - Ist sie eine CLAUDE.md oder AGENTS.md? → **Config** (nur lesen, nicht kopieren)

3. **Agents sortieren** in `~/claude-agents-collected/`:
   ```
   team-dev/
     leader/      ← Steve Jobs + verwandte Agents
     artist/      ← David Ogilvy + verwandte Agents
     designer/    ← Dieter Rams + verwandte Agents
     scientist/   ← Richard Feynman + verwandte Agents
     engineer/    ← Linus Torvalds + verwandte Agents
   team-sales/
     leader/      ← Peter Drucker + verwandte Agents
     artist/      ← Kommunikations-Agents
     designer/    ← Präsentations-Agents
     scientist/   ← Analyse-Agents
     engineer/    ← Delivery-Agents
   ```
   Kriterium: Baut der Agent etwas oder verkauft/kommuniziert er etwas?
   Dann: In welchen der 5 Ordner passt er am besten?

4. **Skills sortieren** in `~/claude-skills-collected/`:
   ```
   leader/      ← Triage, Backlog, Meeting-Skills
   artist/      ← Brief, Persona, Anti-Cringe-Skills
   designer/    ← Component, Layout-Skills
   scientist/   ← Review, Eval-Skills
   engineer/    ← Build, Deploy, Collect-Skills
   ```

5. **End-of-Day Merge**: Alle Ordner die auf gleicher Ebene denselben
   Namen haben werden zusammengeführt. Beispiel:
   - `repo-a/.claude/commands/` + `repo-b/.claude/commands/` → merged
   - Konflikte: neuere Version gewinnt, Scientist dokumentiert warum

6. **Deduplizieren**: Wenn derselbe Agent in mehreren Repos existiert,
   nimm die Version mit dem meisten Inhalt. Dokumentiere Konflikte.

7. **Namenskonvention prüfen**: Jeder Agent muss Vorname Nachname haben.
   Nicht "Jobs" sondern "Steve Jobs". Ausnahme: Claude.

8. **Memory updaten**: Schreibe Ergebnisse in `docs/MEMORY.md`:
   - Neue Agents/Skills → Erfolge
   - Konflikte/Probleme → Fehler
   - Erkenntnisse → Learnings

9. **Push**: Wenn `claude-skills` und `claude-agents` Repos lokal
   existieren, checke die sortierten Dateien dort ein und pushe.
   Wenn nicht, lege die Dateien in den collected-Ordnern ab.

## Ausgabe

```
=== Gesammelt ===
X Repos durchsucht
Y Agents gefunden (Z Duplikate entfernt)
W Skills gefunden

=== team-dev ===
  leader/    — [Agent] Vorname Nachname — Rolle
  artist/    — [Agent] Vorname Nachname — Rolle
  designer/  — [Agent] Vorname Nachname — Rolle
  scientist/ — [Agent] Vorname Nachname — Rolle
  engineer/  — [Agent] Vorname Nachname — Rolle

=== team-sales ===
  leader/    — [Agent] Vorname Nachname — Rolle
  artist/    — ...
  designer/  — ...
  scientist/ — ...
  engineer/  — ...

=== Skills ===
  leader/    — [Skill] /name — Beschreibung
  artist/    — [Skill] /name — Beschreibung
  designer/  — [Skill] /name — Beschreibung
  scientist/ — [Skill] /name — Beschreibung
  engineer/  — [Skill] /name — Beschreibung

=== Konflikte ===
- [Datei] existiert in Repo A und B — genommen: [welches]

=== Memory ===
- X neue Einträge in docs/MEMORY.md

=== Pushed ===
- claude-agents: [ja/nein]
- claude-skills: [ja/nein]
```
