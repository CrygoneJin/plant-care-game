---
experiment: CxO/Master Opus Elevation
hypothesis: "Opus-Modelle für CxOs (Einstein/Darwin/Weber) und Masters (Leader/Artist/Designer/Scientist/Engineer) liefern messbar bessere Outputs als Sonnet — gemessen an Reframing-Rate, Drift-Rate und Process-Attrition."
start: 2026-04-19
owner: Scientist (Feynman)
status: active
---

# CxO + Master Opus Experiment

## Setup

**Vorher**: Alle Agenten Sonnet default.
**Ab 2026-04-19**: CxOs (Einstein/Darwin/Weber) + alle 5 Masters (team-dev) + alle 5 team-sales = **Opus**.
**Padawans**: Override für Nacht 2026-04-19/20 — Opus statt Haiku erlaubt.

Falsifizierungs-Auftrag an Feynman: Hypothese aktiv falsifizieren wenn möglich.

## 5 Falsifier (Popper)

### F1: Blind-Diff
**Frage**: Wenn Opus-Output und Sonnet-Output anonymisiert vorgelegt werden — kann Till
das Opus-Output unter den ersten 3 Picks identifizieren?
**Falsifiziert wenn**: Trefferquote < 40% (≈ Zufall bei 3-aus-N).
**Methode**: Pro Master-Output A/B parallel ziehen, Till blind raten lassen.

### F2: Cost/Value
**Frage**: Token-Cost pro abgeschlossenem Task. Opus = N× Sonnet. Liefert Opus auch N×
mehr Wert (gemessen an Stories abgeschlossen, Bugs vermieden, Reframings gefangen)?
**Falsifiziert wenn**: Cost-Multiplikator > 1.5× Value-Multiplikator über 7 Tage.
**Methode**: `docs/metrics/session-cost.md` + Story-Throughput, Vergleich zur Vorwoche.

### F3: Reframing-Rate
**Frage**: Wie oft erkennt der Agent, dass die User-Frage falsch gestellt ist und reframed
sie? (Steve-Jobs-Style: "Ist das die richtige Frage?")
**Hypothese**: Opus reframed öfter und treffsicherer.
**Falsifiziert wenn**: Reframing-Rate gleich oder geringer als bei Sonnet.
**Methode**: Pro Session zählen — 1 Punkt pro Reframe, manuelles Logging im Session-Recap.

### F4: Drift
**Frage**: Wie weit driften Opus-Padawans vom 80/20 Behaviour-Baseline (80% deterministisch, 20% chaotisch) ab?
**Hypothese**: Opus-Padawans halten 80/20 stabiler als Haiku-Padawans (mehr Kapazität für Selbstreflexion).
**Falsifiziert wenn**: Drift-Range bei Opus > Drift-Range bei Haiku über 14 Tage.
**Methode**: Pro Padawan-Output messen ob "deterministisch" (Pattern-konform) oder "chaotisch" (Pattern-brechend).

### F5: Process-Attrition
**Frage**: Wie viele Process-Regeln (CLAUDE.md, AGENTS.md) werden pro Session ignoriert oder gebrochen?
**Hypothese**: Opus hält Regeln treuer (höhere Kontextkapazität).
**Falsifiziert wenn**: Regelbrüche gleich oder höher als Sonnet-Baseline.
**Methode**: Pre-commit Hook + manuelles Logging der Regelverletzungen.

## Baselines (vor Experiment)

| Metric | Sonnet-Baseline (vor 2026-04-19) | Quelle |
|--------|----------------------------------|--------|
| Reframing-Rate | TBD — keine systematische Messung vorher | — |
| Drift (80/20) | Anekdotisch: ~75/25, leicht chaos-lastig | Codex-Notes |
| Process-Attrition | ~3-5 Regelbrüche/Session beobachtet | MEMORY.md |
| Cost/Session | ~$0.50-2.00 (Sonnet-Mix) | docs/metrics/2026-04-05-session-cost.md |
| Story-Throughput | ~5-15 Tasks/Session | SPRINT.md history |

## Measurement Schedule

- **Daily**: Session-Recap mit Reframing-Count, Cost, Tasks-completed
- **Weekly** (Sonntag): Aggregat F2 (Cost/Value), Drift-Update F4
- **2026-05-03** (14 Tage): Erste Falsifizierungsentscheidung. Wenn 3+ Falsifier
  positiv → zurück zu Sonnet für betroffene Rolle.

## Decision Log

| Datum | Falsifier | Beobachtung | Aktion |
|-------|-----------|-------------|--------|
| 2026-04-19 | — | Experiment gestartet | Setup |

## Notes

Padawan-Override für Nacht 2026-04-19/20 ist isoliert — wird separat bewertet
und nicht mit dem 14-Tage-CxO-Experiment vermischt.
