# Backlog-Evaluation — 5+1 Dimensionen

Jedes Backlog-Item durchläuft 5 Agenten. Vier Fragen sind bekannt, eine ist die Nullhypothese. Die Priorisierung emergiert — sie wird nicht gesetzt.

## Die 5 Dimensionen

| # | Dimension | Agent | Frage | Command |
|---|-----------|-------|-------|---------|
| 1 | **Was?** | Leader (Jobs) | Scope, Abgrenzung, Liefergegenstand. Was genau liefern wir? | `/meeting` |
| 2 | **Wer?** | Artist (Ogilvy) | Für wen? Ownership? Stimme? Wer spürt den Unterschied? | `/review` |
| 3 | **Wie?** | Engineer (Torvalds) | Implementierung, Stack, Aufwand. Wie bauen wir es? | `/build` |
| 4 | **Warum?** | Designer (Rams) | Nutzen, Notwendigkeit, Weniger-ist-mehr. Warum existiert das? | `/test` |
| 5 | **Ohne?** | Scientist (Feynman) | Nullhypothese. Was passiert wenn wir es NICHT bauen? | `/think` |

## Regel

```
Wenn "Ohne?" → "nichts ändert sich" → Item stirbt.
Egal wie gut die anderen 4 Dimensionen aussehen.
```

## Priorisierung (6. Dimension, orthogonal)

- Metrik: undefiniert
- Ausprägung: unbekannt
- Notwendigkeit: unbelegt

Die Priorisierung emergiert aus dem Schnittpunkt der 5 Bewertungen:

```
Prio = f(Was ∩ Wer ∩ Wie ∩ Warum ∩ ¬Ohne)
```

Feynman misst erst NACHDEM etwas existiert, nicht vorher. Prognosen sind Wünsche. Messungen sind Fakten.

## Ablauf

1. `/meeting` — Leader stellt das Item vor. 5 Agenten am Tisch.
2. Jeder Agent beantwortet seine Dimension (1 Satz, nicht mehr).
3. Feynman stellt die Ohne-Frage zuletzt.
4. Wenn alle 5 bestehen → Item lebt.
5. Wenn Ohne? tötet → Item stirbt. Kein Appell.

## Beispiel

**Item: "Regenbogen-Button im Menü"**

| Dimension | Bewertung |
|-----------|-----------|
| Was? | Button der alle Themes durchschaltet |
| Wer? | Oscar, beim Rumspielen |
| Wie? | 5 Zeilen JS, Theme-Array rotieren |
| Warum? | Entdeckungsfreude, kein Lesen nötig |
| Ohne? | Oscar findet die Themes über Einstellungen. Dauert 3 Sekunden länger. |

**Ergebnis:** Ohne? ≈ "fast nichts ändert sich" → Item stirbt.
