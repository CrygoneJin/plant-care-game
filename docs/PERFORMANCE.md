# Performance-Analyse: Wo kollabiert die Insel?

**Datum:** 2026-03-30
**Analyst:** Engineer (Linus Torvalds Mode)
**Scope:** CPU, Speicher, DOM, Canvas — alle Engpässe

---

## TL;DR

Das Spiel kollabiert **nicht** bei normalem Spielverlauf (1 Kind, 1 Session, 1 Tab).
Die echten Risiken sind:

1. **localStorage-Overflow** bei >200 LLM-Crafts (~5MB Limit)
2. **DOM-Leak** durch Achievement-Popups + Toast-Spam bei schnellem Bauen
3. **Canvas-Redraw** ist bereits optimiert (dirty-flag), aber Wetter + Wellen iterieren über ALLE Zellen pro Frame

---

## 1. Render-Loop (game.js:3063)

```js
setInterval(draw, 100);  // 10 FPS
```

**Status:** Gut. Dirty-flag (`needsRedraw`) verhindert unnötige Redraws.

**Aber:** Wenn `needsRedraw = true`, zeichnet `draw()` ALLES:

| Phase | Iteration | Zellen bei 32×18 | Zellen bei 32×18 + Border |
|-------|-----------|-------------------|--------------------------|
| Wasser-Wellen | `totalCols × totalRows` | 36 × 22 = **792** | Jede mit `Math.sin()` + RGB-String |
| Insel-Sand | `COLS × ROWS` | 32 × 18 = **576** | + Variation-Berechnung |
| Material-Emojis | Nur belegte Zellen | Max 576 | `fillText()` pro Emoji |
| Wetter-Regen | 80 Regentropfen | 80 | Jeder mit `beginPath()` + `stroke()` |
| Sterne (Nacht) | 20 Sterne | 20 | Mit `Math.sin()` Twinkle |
| Code-View | Alle belegten Zellen | Max 576 | Extra `fillText()` pro Zelle |
| Animationen | Aktive Platzier-Anim. | 0-10 | Mit `save()/restore()` |

**Worst Case pro Frame:** ~2000 Canvas-Operationen bei vollem Grid + Regen + Nacht + Code-View.

**Kollaps-Grenze:** Kein Kollaps bei 10 FPS. Würde bei 60 FPS auf älteren iPads stottern.

---

## 2. Timer / Intervals

| Timer | Intervall | Was er tut | Risiko |
|-------|-----------|------------|--------|
| `draw` | 100ms | Haupt-Render | Sicher (dirty-flag) |
| `updateTreeGrowth` | 5000ms | Grid-Scan nach Setzlingen | O(ROWS×COLS) = 576 Checks, harmlos |
| `tickTaoDecay` | 1000ms | Grid-Scan nach Tao | O(ROWS×COLS), harmlos |
| `_taoFlickerInterval` | 200ms | `requestRedraw()` | Nur aktiv wenn Tao auf Grid, OK |
| `autoSave` | 30000ms | localStorage-Write | Könnte bei >5MB hängen |
| `updateWeather` | In draw() | Wetter-Würfeln | Nur alle 60s, harmlos |
| Screensaver (Game of Life) | 500ms | Neues Grid berechnen + Redraw | **O(ROWS×COLS) Nachbar-Check = 576 × 8 = 4608 Checks, alle 500ms** |

**Screensaver ist der teuerste Timer.** Conway's Game of Life alle 500ms = 9216 Array-Zugriffe pro Sekunde. Auf alten Geräten spürbar.

---

## 3. Speicher (RAM + localStorage)

### RAM

| Struktur | Größe | Wächst? |
|----------|-------|---------|
| `grid[18][32]` | 576 Zellen (Strings/null) | Nein, fix |
| `treeGrowth {}` | Max 576 Einträge | Nein, bereinigt sich |
| `animations []` | Kurze Lebensdauer (300ms) | Nein |
| `raindrops []` | Fix 80 | Nein |
| `inventory {}` | ~20-50 Keys | Nein |
| `MATERIALS {}` | Basis ~70 + LLM-Crafts | **JA — wächst unbegrenzt** |
| `discoveredEggs []` | Max ~50 | Nein |
| `NPC_VOICES`, `REACTIONS`, etc. | Statisch | Nein |
| `CODE_EASTER_EGGS` | Statisch, ~2KB | Nein |
| `HOERSPIELE` | Statisch, ~5KB | Nein |

**MATERIALS wächst** durch LLM-Crafting (`llm_` Prefix). Jedes neue Material = ~100 Bytes. Nach 1000 LLM-Crafts = ~100KB. Kein Problem für RAM, aber:

### localStorage

| Key | Wächst? | Max-Größe |
|-----|---------|-----------|
| `insel-projekte` | Pro Save-Slot | 576 Zellen × ~10 Bytes = ~6KB pro Save |
| `insel-llm-materials` | **Unbegrenzt** | 100 Bytes × N Crafts |
| `insel-inventar` | Begrenzt | ~1KB |
| `llm-craft:*` | **Unbegrenzt, ein Key pro Paar** | ~200 Bytes × N Paare |
| `insel-easter-eggs` | Max ~50 Strings | ~5KB |
| `insel-discovered-recipes` | Max ~30 | ~1KB |
| `insel-achievements` | Max ~20 | ~500B |

**Kollaps-Grenze:** localStorage hat ein **5MB Limit** pro Origin. Bei ~200 LLM-Crafts × 200 Bytes = 40KB pro Schlüssel, plus die LLM-Materialien selbst. Realistischer Kollaps bei **500-1000 verschiedenen LLM-Craft-Paaren** (alles zusammen ~1-2MB). Wird nie erreicht bei normalem Spielen, aber ein Power-User der systematisch alles kombiniert könnte drankommen.

---

## 4. DOM-Leaks

### Achievement-Popups (game.js:113-123)

```js
const popup = document.createElement('div');
document.body.appendChild(popup);
setTimeout(() => popup.remove(), 3500);
```

**Sicher:** `popup.remove()` räumt auf. Aber wenn 5 Achievements gleichzeitig feuern (z.B. beim Laden eines Saves), sind kurzfristig 5 DOM-Elemente extra da.

### Toast (game.js:2245)

```js
toast._timeout = setTimeout(...)
```

**Sicher:** Nutzt ein einzelnes `#toast` Element, kein DOM-Leak.

### Hörspiel-Szenen

```js
lines.forEach((line, i) => {
    setTimeout(() => showToast(line, 4000), i * 4500);
});
```

Bei `fullIsland` (12 Zeilen): 12 Timeouts über 54 Sekunden. Kein Leak, aber **12 Toast-Animationen nacheinander auf langsamem Gerät sichtbar**.

### Crafting Inventory Rerender

```js
function updateInventoryDisplay() {
    container.innerHTML = items.map(...).join('');  // Jedes Mal alles neu
    container.querySelectorAll('.inv-item').forEach(item => {
        item.addEventListener('dragstart', ...);   // NEUE Listener jedes Mal
        item.addEventListener('dragend', ...);
        // ... 6 addEventListener pro Item
    });
}
```

**Potenzieller Leak:** Bei jedem `updateInventoryDisplay()` werden alle EventListener neu erzeugt. Da `innerHTML =` die alten Elemente zerstört, werden die alten Listener GC'd. **Kein echter Leak**, aber unnötige GC-Arbeit bei häufigem Aufruf.

### Merge-Spark DOM-Elemente (game.js:2135-2140)

```js
const spark = document.createElement('div');
wrapper.appendChild(spark);
setTimeout(() => spark.remove(), 1000);
```

**Sicher:** Räumt nach 1s auf. Bei schnellem Tao-Zerfall max 2-4 gleichzeitig.

---

## 5. Event-Listener

Alle Listener werden einmal beim Init gesetzt. Kein Accumulation-Bug.

Ausnahme: `updateInventoryDisplay()` und `unlockMaterial()` erzeugen Listener bei jedem Aufruf — aber da sie auf neu erzeugte DOM-Elemente gehen, kein Leak.

---

## 6. Netzwerk

| Call | Wann | Risiko |
|------|------|--------|
| Open-Meteo Wetter | Einmal beim Start | Harmlos |
| LLM-Craft (Worker) | Pro Craft-Versuch | Rate-Limited (60/h), kein Spam möglich |
| Chat (BYOK) | Pro Nachricht | Token-Budget begrenzt |

---

## 7. Audio (sound.js)

```js
const SOUND_THROTTLE = 60; // Max ~16 Töne/Sekunde
```

**Gut.** Throttle verhindert Oszillator-Spam. `AudioContext` wird lazy erstellt.

**Aber:** Oszillatoren werden `disconnect()` aber nie explizit aufgeräumt. Browser GC't sie, aber bei schnellem Spammen (Maus über Grid ziehen) könnten kurzfristig viele Oszillator-Objekte leben. Kein Crash, aber unnötige GC-Pressure.

---

## Zusammenfassung: Wo liegt die Grenze?

| Szenario | Grenze | Was passiert |
|----------|--------|-------------|
| Normales Spielen (1h) | **Keine** | Alles stabil |
| Power-User 500+ LLM-Crafts | localStorage ~1MB | Noch OK |
| Power-User 2000+ LLM-Crafts | localStorage ~5MB | **QuotaExceededError** |
| iPad Mini 2 + Regen + Code-View | Canvas stottert | Kein Crash, aber <5 FPS |
| Screensaver auf altem Gerät | Conway 500ms-Tick | Merkbar, kein Crash |
| 50 Achievements gleichzeitig | DOM-Spam | Visueller Müll, kein Crash |

---

## DNA-Autoreparatur: Self-Healing Code

### Das Prinzip

DNA hat eingebaute Reparaturmechanismen:
- **Mismatch Repair:** Fehler erkennen und korrigieren
- **Excision Repair:** Beschädigte Segmente rausschneiden
- **Telomere:** Enden schützen vor Abbau

Übertragen auf Code:

### Vorschlag: `healthcheck.js` — die Zell-Reparatur

```
┌─────────────────────────────────────────────────┐
│  healthcheck.js — DNA-Reparatur für die Insel   │
│                                                   │
│  1. MISMATCH REPAIR (alle 60s)                   │
│     - localStorage-Keys zählen                   │
│     - Wenn > 500 llm-craft:* Keys → älteste 50% │
│       löschen (LRU)                              │
│     - Grid-Integrität: Material-ID existiert?    │
│       Sonst → null setzen                        │
│                                                   │
│  2. EXCISION REPAIR (bei jedem Save)             │
│     - treeGrowth{} auf ungültige Coords prüfen  │
│     - animations[] auf abgelaufene filtern       │
│     - Verwaiste DOM-Elemente entfernen           │
│                                                   │
│  3. TELOMERE (Budgets)                           │
│     - Max 500 LLM-Materials im MATERIALS{}       │
│     - Max 200 localStorage llm-craft:* Keys      │
│     - Max 3 gleichzeitige Achievement-Popups     │
│     - Max 100 discoveredEggs (FIFO)              │
│                                                   │
│  4. APOPTOSE (kontrollierter Zelltod)            │
│     - Screensaver: wenn FPS < 5 → Interval auf  │
│       1000ms hochsetzen                          │
│     - Regen: wenn >100ms pro Frame → Tropfen     │
│       auf 40 reduzieren                          │
│                                                   │
│  5. IMMUNSYSTEM (Anomalie-Erkennung)             │
│     - console.warn bei localStorage > 3MB        │
│     - console.warn bei >50 Timeouts aktiv        │
│     - Feynman-Log: Performance-Metriken pro      │
│       Session für spätere Analyse                │
│                                                   │
└─────────────────────────────────────────────────┘
```

### Implementierungsaufwand

| Modul | Zeilen | Komplexität | Priorität |
|-------|--------|-------------|-----------|
| localStorage-LRU | ~30 | Niedrig | **HOCH** (einziger echter Crash-Bug) |
| Grid-Integrität | ~15 | Niedrig | Mittel |
| Telomere-Budgets | ~20 | Niedrig | Mittel |
| Adaptive FPS | ~25 | Mittel | Niedrig (nur alte Geräte) |
| Feynman-Metrics | ~40 | Niedrig | Nice-to-have |

**Total: ~130 Zeilen für ein robustes Self-Healing-System.**

---

## Nächste Schritte

1. **Sofort:** localStorage-LRU für `llm-craft:*` Keys (verhindert den einzigen echten Crash)
2. **Sprint:** `healthcheck.js` mit Mismatch Repair + Telomere
3. **Später:** Adaptive FPS + Feynman-Metrics
