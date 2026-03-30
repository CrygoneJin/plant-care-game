# /buch — Chatverlauf wird Kapitel

Destilliert eine Claude Code Session in ein Buchkapitel.
Lindgren schreibt die Rohfassung. Krapweis fügt die Haikus ein.
Ende prüft die Tiefe. Ogilvy poliert den Titel.

---

## Eingabe

Der aktuelle Chatverlauf. Keine externe Datei nötig — der Kontext ist das Material.

## Prozess

1. **Kapitelstruktur erkennen** — Wo sind die natürlichen Wendepunkte?
   Jeder Themenwechsel, jedes "aha", jeder Widerspruch = Kapitelgrenze.

2. **Lindgren-Kurzhand** — Jedes Kapitel in max 5 Sätzen zusammenfassen.
   Wie Lindgren schreiben würde: kurz, warm, kein Wort zu viel.
   Kein Fachjargon. Ein 10-Jähriger muss es verstehen.

3. **Krapweis-Haiku** — Jedes Kapitel bekommt ein 5-7-5 Haiku als Motto.

4. **Ende-Check** — Was liegt unter der Oberfläche? Welche Schicht
   sieht man erst beim zweiten Lesen?

5. **Ausgabe** — Markdown-Datei unter `docs/buch/kapitel-NN.md`

## Ausgabe-Format

```markdown
# Kapitel [N]: [Titel]

> [Haiku — 5-7-5]

[Lindgren-Kurzhand — max 5 Sätze]

---

*Amélie-Schicht: [Was man erst beim zweiten Lesen sieht]*
```

## Regeln

- Max 5 Sätze pro Kapitel. Nicht 6. Nicht 4.5 mit einem langen.
- Kein "In diesem Kapitel haben wir..." — das ist ein Schulaufsatz.
- Kein Fachbegriff ohne dass ein Kind ihn verstehen könnte.
- Die Amélie-Schicht ist optional — nur wenn es eine gibt.
- Chronologisch, nicht thematisch. Die Geschichte passiert in der Reihenfolge
  in der sie passiert ist.
