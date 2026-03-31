# /review — 10 Minuten. Lesen was da steht. Nicht was du denkst.

Phase 2 von /pomodoro. Kann auch allein aufgerufen werden.

---

## Eingabe

Der letzte Commit (oder ein spezifischer Commit/Branch).

## Prozess

1. `git diff` lesen — jede Zeile
2. Fragen stellen:
   - Tut der Code was er soll?
   - Gibt es einen offensichtlichen Bug?
   - Fehlt ein Edge Case?
   - Ist etwas drin was nicht reingehört? (Scope-Creep, Debug-Code)
3. Wenn Bug: fixen, committen.
4. Wenn kein Bug: kurz sagen warum.

## Regeln

- **Kein neues Feature.** Nur lesen und prüfen.
- **Ehrlich sein.** "Das ist ok" ist eine gültige Antwort.
- **Max 3 Findings.** Nicht 15. Die wichtigsten drei.
- **Kein Refactoring.** Das ist ein anderes Item.
