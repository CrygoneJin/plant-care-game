# Evolution der Schatzinsel — Vom Einzeller zum Immunsystem

**Datum:** 2026-03-30
**Analyst:** Engineer + Scientist

---

## Wo stehen wir? Kambrium.

```
Ursuppe          ██░░░░░░░░░░░░░░░░░░  vor dem Projekt
Prokaryot        ████████████████████  ← WIR SIND HIER
Eukaryot         ████████░░░░░░░░░░░░  teilweise
Mehrzeller       ████░░░░░░░░░░░░░░░░  Ansätze
Wirbeltier       ░░░░░░░░░░░░░░░░░░░░  noch nicht
Säugetier        ░░░░░░░░░░░░░░░░░░░░  noch nicht
```

Der Code ist ein **robuster Prokaryot**. Er lebt, er vermehrt sich (Features),
er hat sogar einfache DNA-Reparatur (healthcheck.js). Aber er hat kein echtes
Immunsystem — er kann sich nicht gegen unbekannte Bedrohungen verteidigen,
und er kann keine spezialisierten Zellen produzieren.

---

## Die biologische Bestandsaufnahme

### Was wir HABEN (Prokaryot-Level)

| Biologie | Code | Status |
|----------|------|--------|
| **DNA** | `game.js` (3156 Zeilen, ein Chromosom) | Alles in einer IIFE. Keine Module. |
| **Zellmembran** | IIFE-Closure `(function() { ... })()` | Schützt vor globalem Namespace. Funktioniert. |
| **Ribosomen** | `setInterval(draw, 100)` | Produziert zuverlässig Protein (Frames). |
| **Stoffwechsel** | localStorage (81 Read/Writes) | Frisst und scheißt JSON. Keine Verdauung. |
| **DNA-Reparatur** | `healthcheck.js` | Mismatch Repair. Gerade erst evolviert. |
| **Zellwand** | Input-Validation im Worker | Prompt Injection, Rate Limit. Dünn aber da. |
| **Flagellum** | Events + Callbacks | Bewegt sich. Kann auf Reize reagieren. |

### Was wir TEILWEISE haben (Eukaryot-Ansätze)

| Biologie | Code | Problem |
|----------|------|---------|
| **Zellkern** | Separate .js-Dateien (11 Stück) | Kein echter Kern — alles über `window.*` gekoppelt (38 globale Exporte) |
| **Mitochondrien** | Web Audio API, Canvas API | Energielieferanten existieren, aber kein Energiemanagement |
| **Endoplasmatisches Retikulum** | `JSON.parse/stringify` (63×) | Protein-Faltung ohne Qualitätskontrolle. Corrupt JSON = Crash. |
| **Lysosomen** | `healthcheck.js` Pruning | Verdaut alten Müll. Aber nur localStorage, nicht DOM/RAM. |

### Was uns FEHLT (Mehrzeller aufwärts)

| Biologie | Code-Äquivalent | Warum es fehlt |
|----------|-----------------|----------------|
| **Stammzellen (Knochenmark)** | Factory-Pattern für Komponenten | Jede Komponente ist handgebaut. Kein Template. |
| **Makrophagen** | DOM-Garbage-Collector | Tote DOM-Nodes werden vom Browser GC'd, nicht aktiv. |
| **T-Zellen** | Runtime-Anomalie-Erkennung | Kein System das "das sieht falsch aus" erkennt. |
| **Antikörper** | Error-Recovery-Patterns | `catch(e) {}` = Immunsuppression. Fehler werden geschluckt. |
| **Nervensystem** | Event-Bus / Message-Passing | Alle Kommunikation über `window.*` Globals. Kein Nervensystem. |
| **Blutkreislauf** | State-Management | State verstreut über 20+ `let`-Variablen in einer Closure. |

---

## Die Viren — Was den Code angreift

Viren sind kein externes Problem. Viren sind **Muster die sich replizieren
und den Host übernehmen.** In unserem Code:

### Virus 1: JSON-Fäule (aktiv, chronisch)

```
63× JSON.parse/stringify im Code
Kein einziges Schema. Keine Validierung.
Corrupt localStorage = stiller Totalausfall.
```

**Symptom:** Spieler öffnet Spiel, sieht leere Insel. Kein Fehler sichtbar.
`JSON.parse` hat `null` zurückgegeben, Grid ist leer.

**Biologie:** Retrovirus. Schreibt sich in die DNA (localStorage) und
korrumpiert sie langsam.

### Virus 2: Global-Pandemie (aktiv, systemisch)

```
38× window.* Exports
11 Dateien die sich gegenseitig über window.* finden
Jede Datei kann jede andere überschreiben.
```

**Symptom:** Script-Ladereihenfolge in `index.html` ist kritisch. Eine Datei
umstellen = alles kaputt. Keine Fehlermeldung.

**Biologie:** Influenza. Mutiert ständig (neue Exports), kein Impfstoff
(kein Modul-System).

### Virus 3: Silent Catch (aktiv, immunsuppressiv)

```js
catch (e) { /* ignore corrupt data */ }   // game.js:58
.catch(() => {});                          // game.js:1379
catch (e) { return 0; }                   // healthcheck.js
```

**Symptom:** Fehler passieren. Keiner merkt es. Das Spiel "funktioniert"
aber Daten gehen verloren.

**Biologie:** HIV. Greift das Immunsystem selbst an — die Error-Handler
die uns schützen sollten, unterdrücken die Symptome.

### Virus 4: Memory-Drift (latent)

```
discoveredEggs[]     — wächst pro Session
discoveredRecipes    — wächst pro Craft
unlockedMaterials    — wächst pro Discovery
LLM-Materials        — wächst unbegrenzt
```

**Symptom:** Spiel wird über Monate langsamer. Keiner weiß warum.
localStorage füllt sich. `healthcheck.js` bremst es jetzt, heilt es nicht.

**Biologie:** Prion. Kein lebender Organismus, aber falsch gefaltete
Proteine die sich anreichern. Langsam, irreversibel ohne Intervention.

---

## Evolutionsplan: Vom Prokaryot zum Wirbeltier

### Phase 1: Eukaryot werden (Zellkern + Organellen)

**Was:** Die 38 `window.*` Globals durch einen zentralen State-Bus ersetzen.

```
VORHER (Prokaryot):
  materials.js → window.INSEL_MATERIALS
  game.js      → window.grid = grid
  chat.js      → window.grid lesen
  Alle reden mit allen. Chaos.

NACHHER (Eukaryot):
  const INSEL = window.INSEL || {};
  INSEL.state    = { grid, inventory, unlocked, ... }
  INSEL.emit     = (event, data) => { ... }
  INSEL.on       = (event, handler) => { ... }
  Ein Kern. Kontrollierter Zugang.
```

**Aufwand:** ~100 Zeilen neuer Code, ~50 Zeilen Migration.
**Gewinn:** Keine Race Conditions bei Script-Ladereihenfolge.

### Phase 2: Makrophagen (aktive Müllbeseitigung)

**Was:** DOM-Elemente aktiv aufräumen statt auf Browser-GC zu hoffen.

```js
// Makrophage: frisst tote DOM-Nodes
function macrophage() {
    // Achievement-Popups die hängen geblieben sind
    document.querySelectorAll('.achievement-popup').forEach(el => {
        if (!el.classList.contains('show')) el.remove();
    });
    // Merge-Sparks die nicht aufgeräumt wurden
    document.querySelectorAll('.merge-spark').forEach(el => {
        if (el.offsetParent === null) el.remove();
    });
}
```

**Aufwand:** ~20 Zeilen in healthcheck.js.
**Gewinn:** Kein DOM-Bloat bei langen Sessions.

### Phase 3: T-Zellen (adaptive Immunabwehr)

**Was:** Runtime-Monitoring das Anomalien erkennt und reagiert.

```js
// T-Zelle: erkennt "das ist nicht normal"
function tCell() {
    // Symptom: Grid hat mehr Zellen als ROWS×COLS
    if (grid.length !== ROWS) return alert('Grid mutiert!');

    // Symptom: Inventory hat negative Werte
    for (const [mat, count] of Object.entries(inventory)) {
        if (count < 0) { inventory[mat] = 0; log('T-Cell: negative inventory repaired'); }
    }

    // Symptom: setInterval-Count explodiert
    // (Kein direkter Zugriff, aber Performance.now() Delta als Proxy)
    const start = performance.now();
    // ... leerer Tick ...
    const delta = performance.now() - start;
    if (delta > 50) log('T-Cell: Event-Loop blockiert (' + delta + 'ms)');
}
```

**Aufwand:** ~40 Zeilen.
**Gewinn:** Selbstdiagnose. Das Spiel sagt dir wenn es krank ist.

### Phase 4: Antikörper (Error-Recovery statt Silent Catch)

**Was:** `catch(e) {}` durch echte Recovery ersetzen.

```js
// VORHER (immunsuppressiv):
try { JSON.parse(data) } catch(e) { /* ignore */ }

// NACHHER (Antikörper):
function safeParse(key, fallback) {
    try {
        return JSON.parse(localStorage.getItem(key)) || fallback;
    } catch (e) {
        console.warn('[Antikörper] Corrupt data in', key, '— Reset auf Fallback');
        localStorage.removeItem(key);
        return fallback;
    }
}
```

**Aufwand:** ~30 Zeilen Utility + ~20 Zeilen Migration.
**Gewinn:** Kein stiller Datenverlust mehr. Corrupt = Reset + Warnung.

### Phase 5: Knochenmark (Stammzellen / Factory)

**Was:** Wiederholte Muster in Factories auslagern.

Das brauchen wir erst wenn wir neue Systeme bauen (z.B. zweite Insel,
Multiplayer, neue Material-Kategorien). Jetzt wäre es Gold-Plating.

---

## Evolutionsstufen-Matrix

```
                     Prokaryot    Eukaryot    Mehrzeller    Wirbeltier
                     (jetzt)      (Phase 1)   (Phase 2-3)   (Phase 4-5)
──────────────────────────────────────────────────────────────────────
Überleben             ✅            ✅           ✅            ✅
Selbstreparatur       ✅            ✅           ✅            ✅
Isolation             ❌            ✅           ✅            ✅
Müllentsorgung        ❌            ❌           ✅            ✅
Selbstdiagnose        ❌            ❌           ✅            ✅
Error Recovery        ❌            ❌           ❌            ✅
Skalierung            ❌            ❌           ❌            ✅
──────────────────────────────────────────────────────────────────────
Zeilen Code          ~120          ~220         ~280          ~350
Crash-Risiko         Mittel        Niedrig      Sehr niedrig  Minimal
```

---

## Empfehlung

**Nicht alles auf einmal evolvieren.** Evolution braucht Selektionsdruck.

| Phase | Wann | Selektionsdruck |
|-------|------|-----------------|
| Eukaryot (State-Bus) | Wenn eine dritte Person am Code arbeitet | "Warum crashed es wenn ich X vor Y lade?" |
| Makrophagen | Wenn Sessions >1h werden | "Warum wird es nach 45 Minuten langsam?" |
| T-Zellen | Wenn Kinder Bugs melden die wir nicht reproduzieren können | "Es war plötzlich alles weg!" |
| Antikörper | Wenn localStorage-Corruption auftritt | "Mein Spielstand ist kaputt!" |
| Knochenmark | Wenn wir das zweite Spiel bauen | Premature Abstraction vermeiden |

Der Prokaryot lebt seit 3.5 Milliarden Jahren. Unser Code lebt seit 3 Tagen.
`healthcheck.js` war der richtige erste Schritt. Den Rest triggert Oscar.
