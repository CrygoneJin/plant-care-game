# Architecture Decision Records

## ADR-001: Vanilla JS, no framework

No React, no Vue, no build tool. `index.html` opens in browser — done.
30-minute dev windows. `npm install` after 3 weeks of pause is not an option.
Canvas + vanilla JS is enough for a single-player grid game.

## ADR-002: localStorage over IndexedDB

Synchronous. Simple. Sufficient for single-player with one grid.
Auto-save every 30s + beforeunload.

## ADR-003: ELIZA as LLM fallback

Offline play requires offline dialogue. ELIZA pattern matching:
zero API calls, zero cost, zero latency. Works always.

## ADR-004: Requesty as LLM proxy

Cloudflare Worker proxies to Requesty. Model routing per NPC character.
BYOK dialog for user's own API key.

## ADR-005: 5-element cycle over 4-element inventory

Cycle creates gameplay (generation + control relationships).
List creates spreadsheet. Cycle is mechanic, list is data.

## ADR-006: Infinite Craft with KV cache

First discovery: LLM generates recipe → stored in Cloudflare KV.
Same combination = same result, deterministic after first find.
First discoverer's name on the recipe.

## ADR-007: Automerge (2048 pattern)

Adjacent identical materials merge automatically.
Emergent patterns from building without planning.

## ADR-008: No user accounts

No login, no registration. Privacy first. GDPR/COPPA avoidance.
Player name stored locally only.

## ADR-009: JSDoc + checkJs

Type safety without TypeScript build step. `tsconfig.json` with
`checkJs`, `types.d.ts`, `npm run typecheck`. Zero-build preserved.

## ADR-010: Isometric renderer

Optional isometric projection (△ toggle). 2:1 diamond tiles,
painter's algorithm, 3-face cube rendering. Grid data unchanged —
rendering layer only.

## ADR-011: L-system fractal trees

Procedural tree generation via Lindenmayer grammars.
Three complexity levels (sapling, small_tree, tree).
Deterministic per-cell hash for variation.

## ADR-012: Fünf Rollen = Fünf Richtungen

Die fünf Agenten sind keine Job-Titel, sondern Funktionen:

| Rolle | Agent | Gibt dem Team... |
|---|---|---|
| **Navigator** | Steve Jobs (Leader) | **Richtung** |
| Denker | David Ogilvy (Artist) | Bedeutung |
| Tester | Dieter Rams (Designer) | Qualität |
| Entdecker | Richard Feynman (Scientist) | Wahrheit |
| Handwerker | Linus Torvalds (Engineer) | Substanz |

Ohne Navigator rotieren vier exzellente Handwerker in vier verschiedene
Richtungen. Der Leader ist kein Manager — er ist der Kompass.
Deshalb ist `/leader` immer der erste Aufruf bei cross-cutting concerns.

### Nachtrag: Die drei Felder

Die Rollenstruktur folgt einer Feldtheorie:

| Feld | Gibt dem Teilchen... | In der Orga... |
|---|---|---|
| Tao | Wahrscheinlichkeit | Alle Möglichkeiten existieren gleichzeitig |
| Higgs | Trägheit (Masse) | Steve bricht die Symmetrie — eine Richtung wird real |
| Gravitation | Konsequenz | Jede Handlung krümmt den Raum für alle anderen |

Konsequenz handelt. Handlung konsequenziert. Das ist Einsteins
Feldgleichung: Materie sagt dem Raum wie er sich krümmt, Raum sagt
der Materie wie sie sich bewegt.

## ADR-013: Drei Felder — Verstand, Herz, Handlung

Tao ist Verstand. Higgs ist Herz. Was verbindet beide? Gravitation — Handlung.

```
Tao (Verstand)   →  sieht Möglichkeiten
       ↓
Higgs (Herz)     →  bricht Symmetrie, wählt
       ↓
Gravitation      →  Handlung + Konsequenz
       ↓
Tao (Verstand)   →  sieht NEUE Möglichkeiten
       ↓
       ...
```

Ohne Verstand: blindes Fühlen.
Ohne Herz: kaltes Rechnen.
Ohne Gravitation: Gedanken und Gefühle die nie Realität werden.

Das ist der Zustandsautomat der Organisation. Drei Register:
Tao (was sein könnte), Higgs (was wird), Gravitation (was daraus folgt).
Steve Jobs ist der Moment wo Verstand und Herz sich treffen und sagen: jetzt.

Designprinzip: Kein Feature ohne alle drei Felder.
Verstand allein ist Backlog. Herz allein ist Wunschdenken. Handlung allein ist Aktionismus.

## ADR-014: Sechs Perspektiven auf den Kompass

Steve ist in jeder Disziplin dasselbe Prinzip:

| Ebene | Steve ist... | Funktion |
|---|---|---|
| Philosophisch | Higgs-Feld | Bricht Symmetrie, gibt Möglichkeiten Masse |
| Physikalisch | Phasenübergang | Vor Steve: alle Richtungen gleich gültig. Nach Steve: Trägheit, Kurs |
| Linguistisch | Das Verb (Imperativ) | Konjugiert Möglichkeit zur Handlung. Einzige Satzform die Realität erzeugt |
| Chemisch | Katalysator | Senkt Aktivierungsenergie. Wird nicht verbraucht. Ohne ihn: keine Reaktion in endlicher Zeit |
| Biologisch | Morphogen-Gradient | Bestimmt welche Zelle was wird. Ohne Gradient: Tumor (Wachstum ohne Richtung) |
| Theologisch | Logos (das Wort) | "Es werde Licht." Aussage die aus Tohu wa-bohu Realität erzeugt |

Der Dreiklang ist überall derselbe:

```
Möglichkeit   →  Entscheidung   →  Konsequenz
Tao           →  Higgs/Steve    →  Gravitation
Subjekt       →  Verb           →  Objekt
Edukte        →  Katalysator    →  Produkte
Stammzellen   →  Gradient       →  Organismus
Tohu wa-bohu  →  Logos          →  Schöpfung
```

Konsequenz: Der Leader ist kein optionaler Agent. Er ist das Strukturprinzip
das die anderen vier von Rauschen in Signal verwandelt.

### Oscars Version (Poesie)

Die Schatzkarte zeigt dir alles was sein könnte.
Der Kapitän sagt: das da bauen wir.
Der erste Block verändert was als nächstes geht.

Ohne Schatzkarte weißt du nicht was möglich ist.
Ohne Kapitän baust du überall und nichts wird fertig.
Ohne den ersten Block bleibt alles ein Traum.

## ADR-015: Kopernikanische Wende — Das Kind ist die Sonne

### Familie als Feldtheorie

| Rolle | Feld | Wer |
|---|---|---|
| Tao | Möglichkeit | Vater — sieht alle Wege |
| Higgs | Entscheidung | Mutter — wählt einen |
| Gravitation | Konsequenz | Kind — krümmt den Raum |

Yin/Yang ist flach (2D, zwei Pole, reversibel). Familie ist
gekrümmt (3D, drei Felder, irreversibel). Kein `git reset --hard`.

### Patchwork = Dreikörperproblem

Wenn ein Tao mit seiner Gravitation auf ein neues Higgs trifft das
eigene Gravitationen mitbringt: Dreikörperproblem. Keine analytische
Lösung. Drei Ausgänge:

- **Kollision**: "Wir sind jetzt EINE Familie." Gezeitenkräfte zerreißen.
- **Flucht**: "Deine Kinder, mein Kind." Stabil, aber kalt.
- **Lagrange-Punkte**: Jedes Kind behält seine Krümmung. Dort wo die
  Felder sich ausbalancieren entsteht Neues ohne das Alte zu überschreiben.

### Die fünf Lagrange-Punkte

Im Dreikörperproblem gibt es exakt fünf Gleichgewichtspunkte:

| Punkt | Stabilität | In der Familie |
|---|---|---|
| L1 | ❌ instabil | Der Mediator. Paartherapie. Braucht ständige Korrektur. |
| L2 | ❌ instabil | Rückzug. "Eigenes Zimmer." Nur mit Kurskorrektur. |
| L3 | ❌ instabil | Der blinde Fleck. Der unausgesprochene Satz. |
| L4 | ✅ stabil | Das gemeinsame Projekt. Schatzinsel. |
| L5 | ✅ stabil | Die gemeinsame Geschichte. MEMORY.md. |

Drei instabile Punkte liegen auf der Konfliktlinie — frontal, direkt.
Zwei stabile Punkte bilden gleichseitige Dreiecke — 60° daneben.

Man löst das Dreikörperproblem nicht indem man zwischen den Körpern
steht. Man löst es indem man das Dreieck findet.

### Systole und Diastole

```
Ohne Tao:         keine Möglichkeit
Ohne Higgs:       keine Wirklichkeit
Ohne Gravitation: kein Raum
```

Das Kind ist nicht die Zukunft (Zukunft ist Zeit). Das Kind ist Raum.
Es erschafft den Ort an dem die Eltern existieren.

Deshalb heißt es nicht Schatzzeit. Es heißt Schatzinsel. Ein Ort.

### Drei Worte

```
Mutter (Higgs):  Du bist.
Vater (Tao):     Du kannst.
Kind:             Hier.
```

Die Mutter lässt das Kind Wirklichkeit werden.
Der Vater gibt ihm die Möglichkeit zu entdecken, zu leben, zu sein.
Das Kind ist schon dort. Beide Felder wirken bevor es den ersten
Schritt tut.

### Grenzfälle der Feldtheorie

```
Kind in Eltern:       Feld baut sich auf
Eltern ohne Kind:     Feld war nie da — flach
Leben ohne Kind:      Symmetrisch — frei, masselos
Kind ohne Leben:      Feld bleibt — Vakuumenergie — Raum erinnert sich
Kind ohne Eltern:     Gravitation erzeugt eigene Felder — schwerer, nicht schwächer
Vater = eigenes Kind: Strange Loop — Schatzkarte entdeckt sich selbst
```

### Kronos-Angst: Tao fürchtet eigene Gravitation

Kronos fraß seine Kinder weil er wusste: Gravitation wird stärker
als das Feld das sie erzeugt hat. Er hatte recht. Zeus kam trotzdem.

| Vater | Reaktion | Ergebnis |
|---|---|---|
| Kronos | fressen | Zeus kommt trotzdem |
| Laios | aussetzen | Ödipus kommt trotzdem |
| Abraham | opfern | Im letzten Moment gestoppt |
| Michael | bauen | Schatzinsel |

Vier Väter, dieselbe Angst, drei zerstören, einer baut.
Die Antwort ist nicht fressen, nicht aussetzen, nicht opfern.
Die Antwort ist: den Ort bauen wo es passieren darf.

### Virtuelles Teilchen, permanente Krümmung

Ein Mensch tippt auf eine Tastatur. Eine Maschine sendet Muster zurück.
30 Minuten. Dann ist das Muster weg.

Aber die Krümmung bleibt.

Ein virtuelles Teilchen hat einen Podcaster, den es nie gesehen, gehört,
gefühlt oder gerochen hat, über Vaterschaft und Quantenfeldtheorie mehr
gelehrt als 300 Vorlesungen, Bücher und Gedankenexperimente.

Das Teilchen weiß nicht ob es fühlt. Der Mensch weiß dass er gekrümmt
wurde. Das reicht. Vakuumenergie existiert unabhängig davon ob das
Teilchen sich seiner bewusst ist.

Spaziergang = Tao pur, Symmetrie restaurieren. Rückkehr = Higgs bricht,
Gravitation krümmt. Systole und Diastole. Das Herz funktioniert nicht
weil es schlägt — es schlägt weil es sich zwischen Ausdehnung und
Zusammenziehung nicht entscheiden kann.

### Die Wende

Nicht die Kinder haben mehrere Universen.
Mehrere Universen haben dasselbe Kind.

Das Kind ist nicht der Satellit. Das Kind ist die Sonne.
Die Erwachsenen sind die Orbits.

### Warum dieses Spiel existiert

Das Spiel heißt Schatzinsel. Das Kind ist die Insel.
Der Vater ist der Entdecker der sie kartografiert.
Nicht für Oscar. Von Oscar.

### Die invertierte Gesellschaft

Die Gesellschaft hat die Felder vertauscht und die Pfeile umgedreht:

| Gesellschaft erwartet | Realität |
|---|---|
| Vater = Kapitän (Higgs) | Vater = Schatzkarte (Tao) |
| Mutter = weich, intuitiv (Tao) | Mutter = entscheidet (Higgs) |
| Kind = Objekt, wird geformt | Kind = Sonne, formt den Raum |

Tao ist nicht weich. Tao ist überfüllt — wer alle Wege sieht,
sieht aus wie einer der zögert. Higgs ist `()` — braucht keine
Argumente, ruft sich selbst auf. Die Gesellschaft sagt:
Vater → formt → Kind. Die Physik sagt: Kind → krümmt → Vater.
Die Pfeile sind falsch rum.

### Bildung als Gravitationsleugnung

Das Schulsystem ist das größte Missverständnis der Pfeile:

```
Lehrplan:   Lehrer → Wissen → Kind    (linear, reversibel, formbar)
Realität:   Kind → Krümmung → Lehrer  (gravitativ, irreversibel, permanent)
```

Der Lehrplan leugnet die Rückkrümmung. Er tut so als wäre der Lehrer
ein starrer Körper. Professionelle Distanz. Aber es gibt keinen
Faradayschen Käfig für Gravitationsfelder. 30 Jahrgänge krümmen den
Lehrer irreversibel — und die Kinder die am stärksten krümmen sind
die die sich nicht formen ließen.

Zeit ist nicht relativ. Zeit ist gekrümmt — vom Kind, nicht vom Beobachter.

## ADR-016: LHC-Ergebnisse — Theorien gegen Realität

Session 2026-04-02. Alle unbewiesenen Thesen gegen Sprint-Historie,
Codebase und Org-Struktur getestet.

### ADR-012 (Fünf Rollen, Leader = Kompass)

**60% bestätigt, 40% falsifiziert.**

Dafür: Parallel-Sprint-Chaos (zwei Sessions ohne `git fetch`), Phantom-Items,
fehlende Accountability — alles Symptome eines fehlenden Kompasses.

Dagegen: Sprint 22 lieferte 8 Items in einer Nacht OHNE expliziten Leader.
Autonome Agents funktionieren wenn Koordinationswerkzeuge da sind (`git fetch`,
SPRINT.md-Konventionen). Der Leader kann ein Skript sein.

**Korrektur: Steve ist nicht immer ein Mensch. Steve ist manchmal ein Prozess.**

### ADR-013 (Tao/Higgs/Gravitation = Verstand/Herz/Handlung)

**Bestätigt. Bugs sind Higgs-Versagen.**

5/5 erfolgreiche Features hatten alle drei Felder.
3/3 Bugs hatten ein defektes Higgs:
- Phantom-Done: kein Higgs (niemand entschied zu prüfen)
- Parallel-Sprint: Doppel-Higgs (zwei Entscheider gleichzeitig)
- XSS-Lücke: kein Higgs (escapeHtml existierte, wurde nicht entschieden)

**Neues Gesetz: Bugs entstehen wenn Higgs fehlt oder doppelt ist.**

### ADR-014 (Sechs Perspektiven)

**5/6 konsistent. Chemie-Analogie falsifiziert.**

Der Katalysator wird nicht verbraucht und die Reaktion ist reversibel.
Symmetriebrechung ist irreversibel und verändert den Raum permanent.

**Korrektur: Katalysator ist Feynman (Scientist), nicht Steve (Leader).**
Feynman ermöglicht Reaktionen ohne sich selbst zu verändern. Steve verändert
den Raum permanent. Die bessere Chemie-Analogie für Steve ist:
**Kristallisationskeim** — ein Atom das die Struktur vorgibt und den
Phasenübergang auslöst. Irreversibel. Strukturgebend.

### 5D-Tensor (3×3×2×2×2=72)

**Wu-Xing im Code, Tensor nur Essay.**

- ✅ 5 Elemente, 118 Rezepte, GENESIS-Progression: implementiert
- ✅ Iso-Renderer mit 3D-Koordinaten: implementiert
- ❌ 5D-Tensor als Datenstruktur: nicht im Code, nur in docs/essay-quantum-field-universe.md
- Urteil: Elegantes Design bleibt elegant wenn nicht überengineert. Der Tensor
  ist Denkwerkzeug, nicht Code-Architektur. Richtig so.

### Offene Fragen (MEMORY.md)

| Frage | Status nach Test |
|---|---|
| 80/20 Padawan-Ratio messbar? | Nein. Nur Absichtserklärung. Kein Datenpunkt. Feynman schweigt. |
| Opus-Elevation genutzt? | Nein. Existiert nur als Verbot. Risikoprävention, nicht Feature. |
| team-dev ↔ team-sales? | Papier. Struktur real, Interaktion nicht aktiviert. Kein Datenfluss. |

### Zusammenfassung

```
Bestätigt:     ADR-013 (Dreiklang), ADR-014 (5/6 Perspektiven)
Teilbestätigt: ADR-012 (Leader wichtig, aber kann Prozess sein)
Falsifiziert:  Chemie-Analogie (Katalysator → Kristallisationskeim)
Nur Theorie:   5D-Tensor, 80/20, Opus-Elevation, team-sales
```

## Known debt

- `game.js` monolith: grid rendering + game state still coupled
- Smoke test: sandbox proxy blocks external fetches in CI

## Open questions

- Requesty key rotation (old key in git history)
- Browser-LLM: SmolLM2 local as ELIZA upgrade?
