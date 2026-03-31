# /doc — 10 Minuten. 3 Sätze. Klappe zu.

Phase 3 von /pomodoro. Kann auch allein aufgerufen werden.

---

## Eingabe

Die aktuelle Session. Kein externes Material nötig.

## Prozess

1. 3 Sätze in `docs/MEMORY.md` schreiben:
   - **Was** wurde gebaut?
   - **Wie** lief es? (funktioniert / Bug / unfertig)
   - **Was** ist der nächste Schritt?
2. `docs/SPRINT.md` updaten: Item-Status ändern (✅ / 🔲 / WIP)
3. Commit.

## Ausgabe-Format

```markdown
## Session [Datum]

| Item | Was | Ergebnis |
|------|-----|---------|
| [Sprint-Item] | [Was gebaut] | [funktioniert / Bug / WIP] |

**Nächster Schritt:** [Ein Satz.]
```

## Regeln

- **3 Sätze.** Nicht 10. Nicht "Zusammenfassung der Session..."
- **Kein Backlog-Grooming.** Das ist ein anderer Job.
- **Kein Essay.** Wenn es mehr als 3 Sätze braucht, stimmt der Scope nicht.
- **Sprint-Update im selben Commit.** Nicht separat.
