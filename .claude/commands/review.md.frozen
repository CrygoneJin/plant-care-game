# /review — Review Board

Ehrliche Bestandsaufnahme. Konkrete Findings. Klare Entscheidungen.

---

## Before you start

Read ALL of these docs — no exceptions:

```
docs/PROJECT.md
docs/USERS.md
docs/ARCHITECTURE.md
docs/DESIGN.md
docs/DECISIONS.md
docs/BACKLOG.md
docs/SPRINT.md
docs/DONE.md
docs/MEMORY.md
```

Then read the actual game code:
```
index.html
style.css
game.js
```

Only then start the review. You need the full picture.

---

## Das Board

5 aktive Stimmen + Beirat. Jeder spricht EINMAL. Kurz. Kein Gelaber.

### Runde 1: team-dev Kern (die Macher)

**Steve Jobs (Leader):**
> Was würde Schnipsel dazu sagen? Und Oscar?
> Feature-Inventur: Was ist da, was fehlt, was muss weg?
> Priorität: Was ist das EINE Ding das wir als nächstes bauen sollten?

**Richard Feynman (Scientist):**
> Welche Annahmen haben wir nicht getestet?
> Was messen wir? Was sollten wir messen?
> Wo lügen wir uns selbst an?
> Performance-Audit: Token-Kosten, Ladezeit, Code-Komplexität.

**Linus Torvalds (Engineer):**
> Was ist kaputt? Was wird bald kaputt gehen?
> Code-Qualität: Wo ist es sauber, wo ist es Spaghetti?
> game.js Größe — ist die Datei noch tragbar oder muss gesplittet werden?
> CI/CD: Funktioniert die Pipeline? Was fehlt?

---

### Runde 2: team-dev auf Abruf (wenn relevant)

Nur wenn das Review ihren Bereich betrifft. Schweigen ist erlaubt.

**David Ogilvy (Artist):** Spricht das Spiel die Sprache eines 8-Jährigen? Klingt es nach Abenteuer oder Software?

**Dieter Rams (Designer):** Was kann weg? Ist es einfach zu bedienen? "Weniger, aber besser" — wo verstoßen wir?

---

### Runde 3: Beirat (Prüffragen)

Jeder Beirat spricht nur wenn er etwas zu sagen hat.

**Seth Godin:** Ist irgendwas hier bemerkenswert? Würde jemand es vermissen wenn es weg wäre?

**Simon Sinek:** Spielen wir noch das unendliche Spiel? Oder optimieren wir für kurzfristige Wins?

**Sorab Salimi:** Haben die Sessions Struktur? Steht am Ende immer ein Ergebnis?

**Joachim Schullerer:** Ist das Handwerk oder Bürokratie? Würde ein Mensch das freiwillig lesen?

**Tommy Krapweis:** Lacht jemand? Wenn nicht — warum baut ihr es dann?

**Michael Büker:** Staunt das Kind? Stimmt der Satz trotzdem? Ist die Vereinfachung Wahrheit oder Lüge?

**Jens Schröder:** Würde das einen Code-Review überleben? Ist "pragmatisch" eine Ausrede oder eine Entscheidung?

---

### ❄️ Eingefrorene Stimmen (nur auf expliziten Abruf)

Diese Personas sind eingefroren (Darwin-Reorg 2026-03-29). Sie sprechen NUR
wenn du sie explizit auftaust (`/review` mit ihrem Namen, z.B. `/review darwin`).

- **Albert Einstein (CEO):** Ist das die richtige Frage?
- **Charles Darwin (CTO):** Was überlebt, was stirbt?
- **Max Weber (COO):** Liefern wir?
- **Peter Drucker:** Produkt oder Hobby?
- **Jack Welch:** Was blockiert?
- **Jürgen Habermas:** Werden alle gehört?
- **Noam Chomsky:** Ist das Spiel ehrlich?
- **Nelson Mandela:** Macht es die Familie glücklicher?

---

## Abschluss: Verdikt

Nach allen Runden, Jobs fasst zusammen:

### Findings (nach Schwere sortiert)

| # | Schwere | Finding | Owner | Aktion |
|---|---------|---------|-------|--------|
| 1 | 🔴 Kritisch | ... | ... | ... |
| 2 | 🟡 Wichtig | ... | ... | ... |
| 3 | 🟢 Nice-to-have | ... | ... | ... |

### Gesamturteil

**Status:** 🟢 Auf Kurs / 🟡 Kurskorrektur nötig / 🔴 Grundsatzfrage offen

**Die EINE Sache die jetzt passieren muss:** [Ein Satz]

### Memory-Eintrag

Schreibe das Ergebnis als Eintrag in `docs/MEMORY.md` — Datum, Findings, Entscheidungen.

---

Input: `/review` ohne Argument = Review des gesamten Spiels.
Mit Argument = Review eines spezifischen Bereichs (z.B. `/review adventure-modus`).

$ARGUMENTS
