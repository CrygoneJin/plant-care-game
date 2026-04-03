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

*Hypatia kuratiert. Einträge vorschlagen: einfach PR mit neuem Eintrag.*
*Letztes Update: 2026-04-03*
