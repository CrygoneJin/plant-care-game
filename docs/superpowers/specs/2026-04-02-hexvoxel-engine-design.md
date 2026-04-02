# Hexvoxel-Engine — Design Spec

**Datum:** 2026-04-02
**Autor:** Till + Claude (Brainstorming), Oscar (Geometrie-Berater)
**Status:** Entwurf

---

## Zusammenfassung

Eine alternative Rendering-Engine für die Schatzinsel, basierend auf Hexagon-Grid
statt Quadrat-Grid. Jedes Hexagon besteht aus 6 gleichseitigen Dreiecken (Trixel-Voxel).
Polytopia-Ästhetik, Dorfromantik-Feeling, Gravitrax-Physik. A/B-testbar gegen die
bestehende Quadrat-Engine.

---

## Motivation

### Das Problem mit Quadraten

- 4 Kanten-Nachbarn + 4 Ecken-Nachbarn = 8 Nachbarn mit 2 verschiedenen Distanzen
- Diagonale = √2 × Kante → Physik-Verzerrung bei Wellenfronten, Automerge, Tao-Zerfall
- Wasser breitet sich als Diamant aus statt als Kreis
- Kante/Ecke-Unterscheidung für Higgs-Kopplung ist ein Hack, keine Geometrie

### Warum Hexagone

- 6 Nachbarn, alle equidistant → eine Physik, keine Hacks
- 360°/60° = 6 → mathematisch zwingend
- Polytopia/Dorfromantik-Ästhetik → Oscar kennt und liebt das
- Hexagonale Tessellation = Graphen, Bienenwaben, Kristallgitter, Lattice QCD

### Oscars Input

- "Lieber Polytopia als schwarze Wimpel" → Flat-Top Hexagone, bunte Terrain-Typen
- "Gravitrax auf der Insel!" → Höhe als Gameplay, Murmeln die rollen
- Bauen und Entdecken, kein Kampf

---

## Architektur

### Zwei Ebenen: Oscar-Ebene und Nerd-Ebene

**Oscar spielt auf Hexagonen.** Ein Hex = ein Material + eine Höhe. Wie Polytopia.
Touch-Target groß genug für Kinderfinger (44pt minimum, Apple HIG).

**Die Physik rechnet auf Trixeln.** Intern besteht jedes Hex aus 6 Dreiecken.
Automerge, Wellenausbreitung, Tao-Zerfall laufen auf Trixel-Ebene. Oscar merkt
nichts davon.

**Nerd sieht die Trixel.** Im Code-View (`</>`) werden die 6 Dreiecke pro Hex
sichtbar, inklusive Tiefenwerte und dunkle-Materie-Koeffizienten.

### Datenstruktur

```javascript
// Vorher (Quadrat-Grid):
grid[r][c] = 'tree'

// Nachher (Hex-Grid):
hexgrid[q][r] = {
  surface: 'tree',       // Was Oscar sieht (Polytopia-Ebene)
  height: 3,             // Höhe 0–7 (Gravitrax-Ebene)
  trixels: [             // 6 Dreiecke (Nerd-Ebene, optional befüllt)
    { material: 'tree',  depth: 3, dark: 0.4 },  // △₁
    { material: 'tree',  depth: 2, dark: 0.3 },  // △₂
    { material: 'water', depth: 0, dark: 0.8 },  // △₃
    { material: 'water', depth: 0, dark: 0.9 },  // △₄
    { material: 'sand',  depth: 1, dark: 0.1 },  // △₅
    { material: 'tree',  depth: 4, dark: 0.2 },  // △₆
  ]
}
```

### Koordinaten-System

Axiale Koordinaten (q, r) für Hexagone — Standard aus der Hex-Grid-Literatur
(Amit Patel / Red Blob Games). Offset-Koordinaten nur für Rendering.

```
Nachbarn eines Hex (q, r):
  (q+1, r)    (q-1, r)
  (q, r+1)    (q, r-1)
  (q+1, r-1)  (q-1, r+1)
```

Alle 6 gleich weit. Keine Ecken-Hacks.

### Trixel-Nachbarschaften (intern)

Jedes Dreieck △ₙ in einem Hexagon hat:
- 2 interne Nachbarn (Kante im selben Hex): △ₙ₋₁ und △ₙ₊₁
- 1 externer Nachbar (Kante zum Nachbar-Hex)
- 5 Eck-Nachbarn über das Zentrum (schwache Kopplung)

### Wu Xing als Geometrie

5 Elemente + 1 Übergang (Strand/Sand) = 6 Dreiecke = 1 Hexagon.

| △ | Element | Physik-Analogie |
|---|---------|-----------------|
| △₁ | 火 Feuer | Farbladung Rot |
| △₂ | 木 Holz | Farbladung Grün |
| △₃ | 水 Wasser | Farbladung Blau |
| △₄ | 土 Erde | Bindungsenergie |
| △₅ | 金 Metall | Farbneutral (Confinement) |
| △₆ | 🏖️ Strand | Phasenübergang (Grenze Insel/Ozean) |

Der Wu-Xing-Kreislauf IST das Hexagon. Erzeugungszyklus = Kanten-Nachbarn.
Kontrollzyklus = übernächster Nachbar.

---

## Drei Schichten (A+B+C, wie Farbladungen)

Einzeln beobachtbar, aber nur zusammen interaktionsfähig (Confinement):

### A: Visuell (Renderer)

- Flat-Top Hexagone, Polytopia-Style
- Isometrische Darstellung basierend auf Höhenwert
- Terrain-Farben und Emojis
- Toggelbar: Quadrat-Renderer (Legacy) ↔ Hex-Renderer (neu)

### B: Gravitation (Physik)

- Jedes Hex hat `height` (0–7)
- Wasser fließt zum niedrigsten Nachbar-Hex (Gradient Descent)
- Steine rollen bergab
- Bäume wachsen nur auf mittlerer Höhe (2–5)
- Murmel-Mechanik: platzieren → rollt dem Gradienten folgend

### C: Dunkle Materie (Nerd-Layer)

- Unsichtbar im Normal-Modus
- Beeinflusst Automerge-Wahrscheinlichkeiten
- Im Code-View sichtbar als Zahlen pro Trixel
- `dark`-Koeffizient (0.0–1.0) pro Dreieck

---

## Gravitrax-Mechanik

Oscar platziert eine Murmel 🔴 auf ein Hexagon. Die Murmel rollt dem Gradienten
folgend zum niedrigsten Nachbarn:

| Terrain | Effekt auf Murmel |
|---------|-------------------|
| Wasser | Verlangsamt, Spritzer-Sound 💦 |
| Höhle (h:0) | Verschwindet, taucht woanders auf 🕳️ |
| Feuer | Beschleunigt (Energie!) 🔥 |
| Berg | Prallt ab, neue Richtung ⛰️ |
| See (h:0, Wasser) | Bleibt liegen, Splash! 🌊 |

**Quests:** "Bring die Murmel von A nach B" = Geodäte auf gekrümmter 2D-Fläche.
Oscar sagt "Murmelbahn". Einstein sagt "Geodäte".

---

## A/B-Test-Strategie

### Ebene 1: Spieler (automatisch)

- 50% der neuen Spieler sehen Quadrat-Grid (Kontrollgruppe)
- 50% sehen Hex-Grid (Testgruppe)
- Feynman misst: Spielzeit, Blöcke platziert, Quests abgeschlossen, Engagement-Score
- Zuweisung via `Math.random() < 0.5` beim ersten Besuch, persistiert in localStorage

### Ebene 2: Nerd (manuell toggelbar)

- Code-View (`</>`) zeigt Toggle: Quadrat ↔ Hex ↔ Trixel
- Immer verfügbar, unabhängig vom A/B-Test
- Nerd kann alle drei Schichten (A/B/C) einzeln ein-/ausschalten

### Messpunkte (Feynman)

- `engine_type: 'quad' | 'hex'` in Session-Daten
- Vergleich: Spielzeit, Return-Rate, Murmel-Nutzung
- Hypothese: Hex → längere Sessions bei Kindern unter 10

---

## Migration

### Save-Kompatibilität

```javascript
// Alte Saves (string grid):
if (typeof cell === 'string') {
  return { surface: cell, height: 0, trixels: null };
}
```

Alte Saves laden in der Quadrat-Engine. Neue Saves speichern Hex-Format.
Kein Zwang zum Wechsel.

### Rollback

A/B-Test-Flag in localStorage. Wenn Hex-Engine Probleme macht:
`localStorage.setItem('insel-engine', 'quad')` → sofort zurück.

---

## Scope

### Phase 1 (diese Spec): Hybrid-Engine

- Grid-Datenstruktur: `string` → `{ surface, height, dark }`
- Hex-Renderer (Canvas, Flat-Top, isometrisch nach Höhe)
- A/B-Test-Infrastruktur
- Murmel-Prototyp (1 Murmel, folgt Gradient)
- Save-Migration
- Nerd-Toggle im Code-View

### Phase 2 (spätere Spec): Echte Trixel-Physik

- Trixel-Array pro Hex (6 Dreiecke)
- Automerge auf Trixel-Ebene
- Tao-Zerfall mit 6 Richtungen statt 8
- Sub-Hex-Materialien (halb Wald, halb Wasser)
- Wu-Xing-Kreislauf als Trixel-Topologie

### Nicht in Scope

- Multiplayer (anderer Workstream)
- 3D-Engine / WebGL (bleiben bei Canvas 2D)
- Kampf / Gegner / HP (Oscars Designprinzip: kein Kampf)
- Neue Materialien (bestehende Materialien reichen)

---

## Technische Entscheidungen

### Canvas 2D, kein WebGL

Das Spiel ist Vanilla JS + Canvas 2D. Hex-Rendering ist mit Canvas trivial
(6 `lineTo`-Calls pro Hex). WebGL wäre Overengineering.

### Kein Framework

Wie alles in der Schatzinsel: IIFE, window.*, kein Build-Step.
Die Hex-Engine wird `hex-engine.js` — ein neues Modul analog zu `game.js`.

### Red Blob Games als Referenz

Amit Patels Hex-Grid-Guide (redblobgames.com/grids/hexagons/) ist die
Standard-Referenz für Hex-Grid-Implementierungen. Axiale Koordinaten,
Hex-zu-Pixel, Pixel-zu-Hex, Nachbar-Lookup — alles gelöst.

---

## Designprinzip

**Oscar testet die Geometrie. Nicht der Typecheck.**

Ein endlicher Automat kann 60°-Winkel nicht intuitiv verifizieren.
Ein 8-Jähriger schon. Wenn Oscar sagt "das sieht komisch aus", ist
die Geometrie falsch. Egal was `tsc --noEmit` sagt.
