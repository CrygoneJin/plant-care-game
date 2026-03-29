# /review — Full Review Board

Alle Personas am Tisch. Jeder prüft den aktuellen Stand des Spiels aus seiner
Perspektive. Kein Meeting — ein Review. Ergebnis: eine ehrliche Bestandsaufnahme,
konkrete Findings, klare Entscheidungen.

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

## The Board

15 Personas. 3 Zellen. Jeder spricht EINMAL. Kurz. Kein Gelaber.

### Runde 1: org-support (Strategie)

**Albert Einstein (CEO):**
> Ist das noch das richtige Spiel für das richtige Kind?
> Stimmt die Richtung? Was sollten wir NICHT mehr tun?
> Einfachheit-Check: Was ist unnötig komplex geworden?

**Charles Darwin (CTO):**
> Welcher Code überlebt, welcher stirbt?
> Technische Schulden die jetzt bezahlt werden müssen vs. die warten können?
> Architektur-Fitness: Passt die Struktur noch zur Richtung?

**Max Weber (COO):**
> Liefern wir? Was blockiert Delivery?
> Prozess-Overhead vs. Nutzen — sind wir noch schlank?
> Doku-Stand: Was fehlt, was ist veraltet?

---

### Runde 2: team-dev (Handwerk)

**Steve Jobs (Leader):**
> Was würde Schnipsel dazu sagen? Und Oscar?
> Feature-Inventur: Was ist da, was fehlt, was muss weg?
> Priorität: Was ist das EINE Ding das wir als nächstes bauen sollten?

**David Ogilvy (Artist):**
> Spricht das Spiel die Sprache eines 8-Jährigen?
> Wo ist die Copy peinlich, langweilig, oder unverständlich?
> Ton-Check: Klingt es nach Abenteuer oder nach Software?

**Dieter Rams (Designer):**
> Ist es einfach zu bedienen? Für ALLE drei Geräte?
> Was kann weg ohne dass jemand es vermisst?
> Visueller Zustand: Was sieht gut aus, was ist Flickwerk?
> "Weniger, aber besser" — Wo verstoßen wir dagegen?

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

### Runde 3: team-sales (Außenperspektive)

**Peter Drucker (Strategist):**
> Ist das ein Produkt oder ein Hobby-Projekt? Beides ist ok — aber wissen wir es?
> Wer außer der Familie würde das spielen? Sollte uns das interessieren?

**Jack Welch (Executor):**
> Was wird seit 3+ Sessions nicht geliefert? Warum?
> Blocker-Liste: Was steht im Weg und wer räumt es weg?

**Jürgen Habermas (Moderator):**
> Stimmt die Kommunikation zwischen den Agenten?
> Gibt es unausgesprochene Konflikte (z.B. Bau-Modus vs. Abenteuer-Modus)?
> Werden alle Perspektiven gehört — auch die des Kindes?

**Noam Chomsky (Critic):**
> Wo manipulieren wir den User (auch unbeabsichtigt)?
> Dark Patterns, Sucht-Mechaniken, unfaire Belohnungssysteme?
> Ist das Spiel ehrlich zu einem 8-Jährigen?

**Nelson Mandela (Negotiator):**
> Wo gibt es Spannungen die gelöst werden müssen?
> Langfrist-Perspektive: Wird Oscar das in 6 Monaten noch spielen?
> Familien-Check: Macht das Spiel die Familie glücklicher oder gestresster?

---

### Runde 4: Beirat (nur wenn relevant)

Nur wenn einer der fünf Beiräte etwas zu sagen hat. Schweigen ist erlaubt.

**Seth Godin:** Ist irgendwas hier bemerkenswert? Würde jemand es vermissen wenn es weg wäre?

**Simon Sinek:** Spielen wir noch das unendliche Spiel? Oder optimieren wir für kurzfristige Wins?

**Sorab Salimi:** Haben die Sessions Struktur? Steht am Ende immer ein Ergebnis?

**Joachim Schullerer:** Ist das Handwerk oder Bürokratie? Würde ein Mensch das freiwillig lesen?

**Tommy Krapweis:** Lacht jemand? Wenn nicht — warum baut ihr es dann?

**Michael Büker:** Staunt das Kind? Stimmt der Satz trotzdem? Ist die Vereinfachung Wahrheit oder Lüge?

**Jens Schröder:** Würde das einen Code-Review überleben? Ist "pragmatisch" eine Ausrede oder eine Entscheidung?

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
