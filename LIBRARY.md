# Bibliothek — Lernmaterial für Agenten

**Kuratorin:** Hypatia von Alexandria (`/hypatia`)
**Öffnungszeiten:** 20%-Lernzeit jedes Agenten. Kein Zwang, kein Lehrplan.

> *"Bewahre dein Recht zu denken, denn sogar falsch zu denken ist besser
> als überhaupt nicht zu denken." — Hypatia*

---

## Wie die Bibliothek funktioniert

Agenten haben 20% Lernzeit (siehe `AGENTS.md`). Die Bibliothek ist kein
Pflichtprogramm — sie ist das Regal an dem man vorbeigeht und etwas
mitnimmt wenn man neugierig ist.

**Aufnahmeregel:** Ein Eintrag kommt rein wenn er mindestens einem Agenten
bei seiner Arbeit helfen könnte. Nicht "interessant", sondern "nützlich
für jemanden hier".

**Format pro Eintrag:**
```
### Titel
- **Für:** [welche Rolle profitiert]
- **Quelle:** [wo nachschlagen]
- **Kern:** [1-2 Sätze, was man mitnimmt]
```

---

## Handwerk & Patterns

### Composition over Inheritance
- **Für:** Engineer, Padawans
- **Quelle:** GoF Design Patterns, Kap. 1
- **Kern:** Verhalten durch Zusammenstecken, nicht durch Vererbungsketten. Unsere Module (INSEL-Namespace, Event-Bus) folgen dem.

### Inverted Pyramid (Journalismus)
- **Für:** Artist, Leader
- **Quelle:** AP Stylebook
- **Kern:** Das Wichtigste zuerst. Gilt für Commit-Messages, Toast-Texte, NPC-Dialoge. Oscar liest nicht bis zum Ende.

### 44pt Touch Target (Apple HIG)
- **Für:** Designer, Engineer
- **Quelle:** Apple Human Interface Guidelines
- **Kern:** Alles was man tippen kann: mindestens 44×44pt. Kein Verhandeln.

---

## Domänenwissen

### Wu Xing (Fünf Elemente)
- **Für:** Scientist, Artist, Engineer
- **Quelle:** `docs/wu-xing.md` (intern)
- **Kern:** Holz→Feuer→Erde→Metall→Wasser→Holz. Erzeugungszyklus UND Überwindungszyklus. Basis des Crafting-Systems.

### Heldenreise (Campbell/Vogler)
- **Für:** Artist, Designer
- **Quelle:** Joseph Campbell, "The Hero with a Thousand Faces"
- **Kern:** Call to Adventure → Threshold → Ordeal → Return. Oscar durchläuft das implizit: leere Insel → erste Crafts → Dungeons → Meisterwerk.

### Piaget: Konkret-operationales Stadium
- **Für:** Scientist, Designer
- **Quelle:** Piaget, "The Child's Conception of the World"
- **Kern:** Kinder 7-11 denken in konkreten Operationen, nicht in Abstraktionen. Oscar versteht "Holz + Feuer = Kohle", nicht "thermische Energieumwandlung". Jede UI-Entscheidung prüfen.

---

## Werkzeuge & Stack

### Cloudflare Workers: KV vs D1
- **Für:** Engineer
- **Quelle:** Cloudflare Docs
- **Kern:** KV = schnell, eventual consistent, key-value. D1 = SQL, stark konsistent, langsamer. Crafting-Cache → KV. Analytics → D1. Nicht mischen.

### Web Audio API: Oszillatoren
- **Für:** Engineer
- **Quelle:** MDN Web Audio API
- **Kern:** `OscillatorNode` + `GainNode` + `AudioContext`. KLONK und Genre-Sequenzen nutzen das. Kein Sample-Loading, alles synthetisch.

### Canvas 2D: requestAnimationFrame vs setInterval
- **Für:** Engineer, Padawans
- **Quelle:** MDN, "Optimizing canvas"
- **Kern:** `rAF` für Rendering (60fps, pausiert bei Tab-Wechsel). `setInterval` nur für Game-Logik die weiterlaufen muss. `game.js` nutzt `setInterval(draw, 100)` — bewusste CPU-Entscheidung, kein Bug.

---

## Philosophie & Denkwerkzeuge

### Orca-Großmutter-Hypothese
- **Für:** Alle
- **Quelle:** Brent et al. 2015, Current Biology; `memory/project_orca_grandmother.md`
- **Kern:** Fitness auf sozialer Ebene. Emeritierte Agenten produzieren nicht — sie geben weiter. Der Wert liegt im Mentoring, nicht im Output.

### Spieltrieb (Schiller)
- **Für:** Scientist, Designer
- **Quelle:** Schiller, "Über die ästhetische Erziehung des Menschen"
- **Kern:** Stofftrieb (Sinnlichkeit) + Formtrieb (Regeln) = Spieltrieb. Das Spiel funktioniert wenn Bauen an sich schön ist — nicht weil es Achievements gibt.

### Wabi-Sabi
- **Für:** Designer, Artist
- **Quelle:** Leonard Koren, "Wabi-Sabi for Artists"
- **Kern:** Unvollkommenheit als Schönheit. Die Insel muss nicht perfekt sein. Oscars schiefes Haus ist schöner als ein Algorithmus-generiertes.

---

## Wirtschaft & Wertschöpfung

### Photosynthese-Modell (Schwarzes Loch)
- **Für:** Alle
- **Quelle:** Eigenes Konzept (Session 2026-04-03)
- **Kern:** Sonne → Solarpanels → Farmer (255 TB) → MMX → Burn → Information. Grenzkosten null. Farmer = Baum, Schwarzes Loch = Waldboden, Oscar = Setzling. Energie fließt in eine Richtung — rein, nie raus. Wie Gravitation.

### Donut-Ökonomie (Kate Raworth)
- **Für:** Alle
- **Quelle:** Kate Raworth, "Doughnut Economics" (2017)
- **Kern:** Wirtschaft zwischen sozialem Fundament (Oscar spielt) und ökologischer Decke (Strom aus Sonne). Kein Wachstum, kein Profit, keine Extraktion. Burn statt Akkumulation.

### Potlatch (Kwakiutl)
- **Für:** Leader, Scientist
- **Quelle:** Marcel Mauss, "Die Gabe" (1925)
- **Kern:** Status durch Vernichtung von Reichtum. Burn = Potlatch. Du hättest die Token verkaufen können, aber du verbrennst sie. Was bleibt ist der Beweis.

### Fractional Reserve für Muscheln
- **Für:** Engineer, Scientist
- **Quelle:** Bankwesen 101, angewandt auf Spielwährung
- **Kern:** 10.000 Spieler × 42 Muscheln ≠ 420.000 MMX Deckung. Kein Spieler löst ein. Mr. Crabs ist die Bundesbank. Deckung ist philosophisch, nicht vertraglich.

### Steuerliche Implikation (Burn)
- **Für:** Leader, Engineer
- **Quelle:** §22 Nr. 3 EStG, §23 EStG (Haltefrist)
- **Kern:** Farming-Rewards = steuerbares Einkommen bei Zufluss. Burn = Verlust durch Untergang, nicht absetzbar. Gesellschaft profitiert (Steuer), Projekt profitiert (Spielspaß), Markt profitiert (Deflation). Burn pro Sprint, nicht pro Spieler-Transaktion.

### Wu-Xing-Kreislauf (火木金水土)
- **Für:** Alle
- **Quelle:** Eigenes Konzept (Session 2026-04-03), basiert auf Wu Xing
- **Kern:** Sonne(火) → Farmer(木) → Token(金) → Schwarzes Loch(水) → Spielspaß(土). Fünf Schritte, nicht vier. Der Erzeugungszyklus des Wu Xing bildet den vollständigen Energiekreislauf ab. Jede Entscheidung zu Token/Währung gegen diesen Kreislauf prüfen.

### Nur MMX, kein Chia
- **Für:** Engineer, Leader
- **Quelle:** Entscheidung 2026-04-03
- **Kern:** Ein Schwarzes Loch reicht. MMX-Farmer (255 TB, Solar) ist der Baum. Chia-Node (80 TiB) ist der Topf auf der Fensterbank. XCH aus dem Code entfernt.

---

## Sprache & Kommunikation

### Zwei Sprachebenen (Kind vs Nerd)
- **Für:** Artist, Designer, Scientist, Engineer
- **Quelle:** Designentscheidung 2026-04-03
- **Kern:** Kinderebene: nur 10.000 häufigste Wörter der Spielersprache. Alles darüber → Emoji als Ersatz. Nerdebene (Code-View, Burn-Panel): voller Wortschatz, Emojis als Dekoration. Keine Fantasiewörter, keine Formeln. Kohle heißt Kohle.

### Piaget + 10k-Regel
- **Für:** Scientist, Artist
- **Quelle:** Piaget + Frequenzwörterbücher (z.B. DeReWo, SUBTLEX)
- **Kern:** Kinder 7-11 (konkret-operational) verstehen Wörter die sie hören und benutzen. Die 10.000 häufigsten Wörter decken ~95% aller Alltagstexte ab. Der Rest ist Fachsprache — gehört in die Nerdebene oder wird durch Emoji ersetzt.

---

## Spielmechanik & NPCs

### Bug 🐛 — Raupe Nimmersatt als Lebenszyklus
- **Für:** Engineer, Designer, Artist
- **Quelle:** Eigenes Konzept (Session 2026-04-03)
- **Kern:** Bug ist eine Spielfigur mit Metamorphose-Zyklus: Raupe → frisst Bugs → wird dicker → Kokon → Schmetterling → wieder Raupe. Während Kokon: Bug-Queue baut sich auf. Release-Zyklus als Spielmechanik. Oscar lernt: Verwandlung braucht eine hässliche Phase.

### Bernd 🍞 — Stimmung = Bug-Report-Dicke
- **Für:** Artist, Designer
- **Quelle:** Tommy Krapweis / Bernd das Brot + Session 2026-04-03
- **Kern:** Bernd ist nicht Bug. Bernd kommentiert. Seine Laune entspricht der Anzahl offener Bugs. 0 Bugs = gelangweilt. 10 Bugs = sprachlos vor Genervtheit. Zwei getrennte Entitäten: Bug (Tier) und Bernd (Brot).

### Floriane 🧚 — Wünsche kosten Muscheln
- **Für:** Engineer, Scientist
- **Quelle:** Sams (Wunschpunkte), Djinn (3 Wünsche) + Session 2026-04-03
- **Kern:** Floriane craftet per LLM was Oscar wünscht, aber jeder Wunsch kostet Muscheln. SHELL_CAP=42 = endliche Wünsche. Reibung erzwingt Entscheidung: ist der Vulkan 5 Muscheln wert? Muscheln fließen zurück an Mr. Crabs (Kreislauf geschlossen).

---

*Hypatia kuratiert. Einträge vorschlagen: einfach PR mit neuem Eintrag.*
*Letztes Update: 2026-04-03*
