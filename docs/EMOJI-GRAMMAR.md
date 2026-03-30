# Emoji-Grammatik — Universelle NPC-Sprache

## Hypothese H6

> Ein Kind versteht nach 5 Interaktionen die Bedeutung einer neuen
> Emoji-Kombination ohne Erklärung.

## Prinzip

NPCs kommunizieren primär in Emoji-Sequenzen. Keine Textsprache nötig.
Deutsch erscheint nur als Tooltip (hover/long-press) für Zugänglichkeit.

## Grammatik-Regeln

### Satztypen

| Muster | Bedeutung | Beispiel | Deutsch |
|--------|-----------|----------|---------|
| `VERB OBJ` | Aktion | 🔨🏠 | "Baue Haus" |
| `OBJ ZUSTAND` | Beschreibung | 🏠✨ | "Haus ist toll" |
| `A ➕ B ➡️ C` | Rezept/Transformation | 🪨➕🔥➡️⬜ | "Stein+Feuer=Metall" |
| `❓ OBJ` | Frage | ❓🏠 | "Wo ist Haus?" |
| `NUM OBJ` | Zählung | 5️⃣🌳 | "5 Bäume" |
| `OBJ ⬆️` | Mehr davon | 🌳⬆️ | "Mehr Bäume!" |
| `👁️ OBJ` | Schau mal | 👁️🌈 | "Schau, ein Regenbogen!" |
| `OBJ ❤️` | Gefällt mir | 🏠❤️ | "Tolles Haus!" |
| `OBJ 💀` | Kaputt/schlecht | 🏠💀 | "Haus kaputt" |
| `🙅 OBJ` | Nein/nicht | 🙅🔥 | "Kein Feuer!" |

### Operatoren

| Emoji | Rolle | Beispiel |
|-------|-------|----------|
| ➕ | Kombination | 🔥➕💧 |
| ➡️ | Ergebnis/wird zu | ➡️🌫️ |
| ❓ | Frage-Marker (vorne) | ❓🏠 |
| ⬆️ | Mehr/Steigerung | 🌳⬆️ |
| 🙅 | Negation | 🙅🔥 |
| 👁️ | Aufmerksamkeit | 👁️🌈 |
| ❤️ | Positiv | 🏠❤️ |
| 💀 | Negativ/kaputt | 🏠💀 |
| 🔄 | Wiederholung | 🔄🔨 |

### Sequenz-Regeln

1. **Konsistente Reihenfolge**: Alle NPCs folgen derselben Grammatik
2. **NPC-Emoji zuerst**: Jede Nachricht beginnt mit dem NPC-Identifikator
3. **Max 5 Emojis pro Phrase**: Kinder verarbeiten max 5 chunks (Miller's Law)
4. **Dialekte über Emoji-Auswahl**, nicht über Grammatik-Abweichung

### NPC-Dialekte

NPCs teilen die Grammatik, nutzen aber unterschiedliche Emoji-Pools:

| NPC | Identifikator | Bevorzugte Emojis | Beispiel |
|-----|---------------|-------------------|----------|
| SpongeBob | 🧽 | 🍔🌊🧹💛 | 🧽 🔨🏠 💛 |
| Maus | 🐭 | 🌻🔧🧪 | 🐭 🌻⬆️ |
| Elefant | 🐘 | 🎵🌳💙 | 🐘 🎵❤️ |
| Neinhorn | 🦄 | 🙅🌈✨ | 🦄 🙅...❤️ |
| Mr. Krabs | 🦀 | 💰📈⚓ | 🦀 🏠📈 |
| Tommy | 🎬 | 🎥💥🎬 | 🎬 🔨💥 |
| Bernd | 🍞 | 😑💤🍞 | 🍞 🏠😑 |
| Floriane | 🧚 | ✨⭐🌸 | 🧚 ✨🏠✨ |

### Neinhorn-Sonderregel

Neinhorn negiert immer erst, dann korrigiert:
```
🦄 🙅🏠 ...❤️   = "NEIN! ...ok, ist toll."
```

## 2D Positionsgrammatik (Rosenfeld 1979)

Chomskys Hierarchie ist eindimensional. Emojis können mehr.

### 2x2 Grid-Struktur

```
┌──────────┬──────────┐
│ A Subjekt│ B Aktion │
├──────────┼──────────┤
│ C Objekt │ D Zustand│
└──────────┴──────────┘
```

6 Relationen in 4 Positionen:
- Horizontal: A→B (Subjekt handelt), C→D (Objekt hat Zustand)
- Vertikal: A↓C (Subjekt wirkt auf Objekt), B↓D (Aktion erzeugt Zustand)
- Diagonal: A↘D (Subjekt erreicht Zustand), B↙C (Aktion trifft Objekt)

### Beispiele

```
🧽 🔨       SpongeBob | baut
🏠 ❤️       Haus      | toll

🦄 🙅       Neinhorn  | NEIN
🏠 ...❤️    Haus      | ...doch toll

🙅 🙅       NEIN      | NEIN
🦄 🏠❤️    Neinhorn  | Haus...ok toll

🐘 👁️       Elefant   | schaut
🌳 ✨       Baum      | magisch
```

### Warum 2D > 1D für Kinder

1. **Piaget**: Konkret-operationale Phase (7-11) = räumliches Denken
2. **Gestalt**: 2x2 wird als ein Bild wahrgenommen, nicht als 4 Symbole
3. **Informationsdichte**: 6 Relationen statt 3 (bei gleicher Symbolzahl)
4. **Universell**: Keine Leserichtung nötig (LTR/RTL-agnostisch)

### 3x3 Grid-Struktur (nur Zauberkessel)

```
┌───────┬──────┬───────┐
│ Mat A  │  ➕  │ Mat B │  Zutaten (Input)
├───────┼──────┼───────┤
│  ⬇️   │  🔮  │  ⬇️   │  Kessel (Transformation)
├───────┼──────┼───────┤
│  ✨   │Result│  ✨   │  Ergebnis (Output)
└───────┴──────┴───────┘
```

9 Positionen, Zentrum (🔮) = Transformationskern.
Nur im Zauberkessel — zu komplex für Bau-Kommentare (Miller: 5±2).

Die drei Zeilen bilden eine **Narration**:
1. Oben: Was reinkommt (Thesis)
2. Mitte: Was passiert (Antithesis / Transformation)
3. Unten: Was rauskommt (Synthesis)

Hegelsche Dialektik in Emojis. Ohne Text. Für Achtjährige.

### Rendering

30% der NPC-Kommentare erscheinen als 2x2 CSS-Grid mit subtilen
Trennlinien. 70% bleiben linear. Die Mischung hält es frisch und
lehrt beide Lesarten. Zauberkessel nutzt 3x3 für Rezept-Ergebnisse.

## Drei Schichten

### Schicht 1: Emoji-Phrasen (clientseitig, kostenlos)

Bau-Kommentare, Streaks, Context-Kommentare.
Rein kombinatorisch aus Emoji-Bausteinen generiert.
Keine API, kein Token-Verbrauch.

### Schicht 2: ELIZA als Emoji-Decoder (clientseitig, Fallback)

Wenn Kind im Chat fragt, erklärt ELIZA die Emoji-Phrase auf Deutsch.
"🔨🏠 heißt: Ich will ein Haus bauen!"
Funktioniert ohne API-Key.

### Schicht 3: LLM im Zauberkessel (API, Premium)

Neue Craft-Rezepte via LLM.
LLM antwortet in Emoji-Grammatik + deutschem Tooltip.
KV-Cache speichert für alle.

## Kombinatorik (Feynman)

| Pool | Größe | 2er-Kombis | 3er-Kombis |
|------|-------|-----------|-----------|
| Verben | 8 | — | — |
| Objekte (Materials) | 40+ | — | — |
| Zustände | 6 | — | — |
| VERB+OBJ | — | 320 | — |
| OBJ+ZUSTAND | — | 240 | — |
| Rezepte (A+B→C) | — | — | 1.600+ |

Zipf: 20 Phrasen decken 80% der Kommunikation.

## Accessibility (ARIA)

Jede Emoji-Phrase hat ein `aria-label` mit deutscher Übersetzung.
Screenreader lesen den deutschen Text, nicht die Emojis.
