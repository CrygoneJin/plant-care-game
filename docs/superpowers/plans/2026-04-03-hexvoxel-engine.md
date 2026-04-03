# Hexvoxel-Engine Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Alternative Hex-Rendering-Engine mit Polytopia-Ästhetik, Gravitrax-Höhenphysik und A/B-Test-Infrastruktur.

**Architecture:** Neues Modul `hex-engine.js` (IIFE, window.INSEL_HEX) mit Hex-Grid-Datenstruktur, Canvas-Renderer und Murmel-Physik. Koexistiert mit der Quadrat-Engine in `game.js`. A/B-Test togglet den Renderer, nicht die Daten. Red Blob Games Hex-Grid-Algorithmen als Referenz.

**Tech Stack:** Vanilla JS, Canvas 2D, IIFE-Pattern, axiale Koordinaten (q,r)

---

### File Structure

| File | Verantwortung | Neu/Änderung |
|------|---------------|--------------|
| `hex-grid.js` | Hex-Datenstruktur, Koordinaten, Nachbarn, Konvertierung | Neu |
| `hex-renderer.js` | Canvas-Rendering: Flat-Top Hexagone, isometrische Höhe, Trixel-Overlay | Neu |
| `hex-marble.js` | Murmel-Physik: Gradient Descent, Terrain-Effekte, Animation | Neu |
| `game.js` | A/B-Test-Switch, Engine-Toggle, Integration | Änderung |
| `index.html` | Script-Tags für neue Module | Änderung |
| `analytics.js` | `engine_type` Feld in Session-Daten | Änderung |
| `worker.js` | `engine_type` in D1 sessions-Tabelle | Änderung |
| `types.d.ts` | Typen für HexCell, HexGrid, Marble | Änderung |
| `tests/hex-grid.test.js` | Unit-Tests für Hex-Koordinaten und Nachbarn | Neu |
| `tests/hex-renderer.test.js` | Smoke-Tests für Rendering | Neu |

---

### Task 1: Hex-Grid Datenstruktur + Koordinaten

**Files:**
- Create: `hex-grid.js`
- Create: `tests/hex-grid.test.js`
- Modify: `types.d.ts`

- [ ] **Step 1: Types definieren**

In `types.d.ts` hinzufügen:

```typescript
interface HexCell {
    surface: string | null;
    height: number;
    dark: number;
    trixels: null | Array<{ material: string | null; depth: number; dark: number }>;
}

interface HexGrid {
    cells: Map<string, HexCell>;
    radius: number;
    get(q: number, r: number): HexCell | undefined;
    set(q: number, r: number, cell: HexCell): void;
    neighbors(q: number, r: number): Array<[number, number]>;
    hexToPixel(q: number, r: number, size: number): { x: number; y: number };
    pixelToHex(x: number, y: number, size: number): { q: number; r: number };
}

interface InselHex {
    createGrid(radius: number): HexGrid;
    DIRECTIONS: Array<[number, number]>;
}

declare var INSEL_HEX: InselHex;
```

- [ ] **Step 2: Failing Tests schreiben**

Datei `tests/hex-grid.test.js`:

```javascript
const { describe, it } = require('node:test');
const assert = require('node:assert');

// hex-grid.js wird als IIFE geladen, wir simulieren window
globalThis.window = globalThis;
require('../hex-grid.js');

describe('HexGrid', () => {
    it('erstellt ein Grid mit korrektem Radius', () => {
        const grid = INSEL_HEX.createGrid(3);
        assert.strictEqual(grid.radius, 3);
        // Hex-Grid mit Radius 3: 1 + 6 + 12 + 18 = 37 Zellen
        // Formel: 3*r*(r+1) + 1
        assert.strictEqual(grid.cells.size, 37);
    });

    it('gibt 6 Nachbarn für Zentrum zurück', () => {
        const grid = INSEL_HEX.createGrid(3);
        const neighbors = grid.neighbors(0, 0);
        assert.strictEqual(neighbors.length, 6);
    });

    it('gibt weniger Nachbarn am Rand zurück', () => {
        const grid = INSEL_HEX.createGrid(2);
        // Ecke des Grids hat nur 3 Nachbarn innerhalb
        const neighbors = grid.neighbors(2, -2);
        assert.ok(neighbors.length >= 2 && neighbors.length <= 6);
    });

    it('Nachbarn sind alle equidistant', () => {
        const dirs = INSEL_HEX.DIRECTIONS;
        assert.strictEqual(dirs.length, 6);
        // Axiale Koordinaten: alle Nachbarn haben Distanz 1
        for (const [dq, dr] of dirs) {
            assert.strictEqual(Math.abs(dq) + Math.abs(dr) + Math.abs(-dq - dr), 2);
        }
    });

    it('hexToPixel und pixelToHex sind invers', () => {
        const grid = INSEL_HEX.createGrid(5);
        const size = 30;
        const { x, y } = grid.hexToPixel(2, -1, size);
        const { q, r } = grid.pixelToHex(x, y, size);
        assert.strictEqual(q, 2);
        assert.strictEqual(r, -1);
    });

    it('Zelle setzen und lesen', () => {
        const grid = INSEL_HEX.createGrid(2);
        grid.set(0, 0, { surface: 'tree', height: 3, dark: 0.2, trixels: null });
        const cell = grid.get(0, 0);
        assert.strictEqual(cell.surface, 'tree');
        assert.strictEqual(cell.height, 3);
    });

    it('Migration: String zu HexCell', () => {
        const cell = INSEL_HEX.migrateCell('tree');
        assert.strictEqual(cell.surface, 'tree');
        assert.strictEqual(cell.height, 0);
        assert.strictEqual(cell.dark, 0);
        assert.strictEqual(cell.trixels, null);
    });
});
```

- [ ] **Step 3: Tests ausführen — müssen feilen**

```bash
node --test tests/hex-grid.test.js
```

Expected: FAIL — `INSEL_HEX` ist undefined

- [ ] **Step 4: hex-grid.js implementieren**

Datei `hex-grid.js`:

```javascript
// hex-grid.js — Hexagonales Grid mit axialen Koordinaten
// Referenz: redblobgames.com/grids/hexagons/
(function () {
    'use strict';

    // Axiale Richtungen (flat-top): 6 Nachbarn, alle equidistant
    var DIRECTIONS = [
        [1, 0], [-1, 0],
        [0, 1], [0, -1],
        [1, -1], [-1, 1]
    ];

    function hexKey(q, r) { return q + ',' + r; }

    function createGrid(radius) {
        var cells = new Map();

        // Hexagonales Grid: alle (q,r) mit |q| <= radius, |r| <= radius, |q+r| <= radius
        for (var q = -radius; q <= radius; q++) {
            for (var r = -radius; r <= radius; r++) {
                if (Math.abs(q + r) <= radius) {
                    cells.set(hexKey(q, r), {
                        surface: null,
                        height: 0,
                        dark: 0,
                        trixels: null
                    });
                }
            }
        }

        return {
            cells: cells,
            radius: radius,

            get: function (q, r) {
                return cells.get(hexKey(q, r));
            },

            set: function (q, r, cell) {
                if (cells.has(hexKey(q, r))) {
                    cells.set(hexKey(q, r), cell);
                }
            },

            neighbors: function (q, r) {
                var result = [];
                for (var i = 0; i < DIRECTIONS.length; i++) {
                    var nq = q + DIRECTIONS[i][0];
                    var nr = r + DIRECTIONS[i][1];
                    if (cells.has(hexKey(nq, nr))) {
                        result.push([nq, nr]);
                    }
                }
                return result;
            },

            // Flat-top hex: q → x, r → y (mit Offset)
            hexToPixel: function (q, r, size) {
                var x = size * (3 / 2 * q);
                var y = size * (Math.sqrt(3) / 2 * q + Math.sqrt(3) * r);
                return { x: x, y: y };
            },

            pixelToHex: function (x, y, size) {
                var q = (2 / 3 * x) / size;
                var r = (-1 / 3 * x + Math.sqrt(3) / 3 * y) / size;
                // Runden auf nächstes Hex (cube round)
                var s = -q - r;
                var rq = Math.round(q);
                var rr = Math.round(r);
                var rs = Math.round(s);
                var dq = Math.abs(rq - q);
                var dr = Math.abs(rr - r);
                var ds = Math.abs(rs - s);
                if (dq > dr && dq > ds) {
                    rq = -rr - rs;
                } else if (dr > ds) {
                    rr = -rq - rs;
                }
                return { q: rq, r: rr };
            },

            forEach: function (fn) {
                cells.forEach(function (cell, key) {
                    var parts = key.split(',');
                    fn(cell, parseInt(parts[0]), parseInt(parts[1]));
                });
            }
        };
    }

    function migrateCell(value) {
        if (typeof value === 'string') {
            return { surface: value, height: 0, dark: 0, trixels: null };
        }
        if (value && typeof value === 'object' && 'surface' in value) {
            return value;
        }
        return { surface: null, height: 0, dark: 0, trixels: null };
    }

    window.INSEL_HEX = {
        createGrid: createGrid,
        migrateCell: migrateCell,
        DIRECTIONS: DIRECTIONS,
        hexKey: hexKey
    };
})();
```

- [ ] **Step 5: Tests ausführen — müssen grün sein**

```bash
node --test tests/hex-grid.test.js
```

Expected: 7/7 PASS

- [ ] **Step 6: Syntax + Type Check**

```bash
node --check hex-grid.js && npx tsc --noEmit
```

- [ ] **Step 7: Commit**

```bash
git add hex-grid.js tests/hex-grid.test.js types.d.ts
git commit -m "feat: hex-grid.js — Hexagonales Grid mit axialen Koordinaten

Radius-basiert, 6 equidistante Nachbarn, hexToPixel/pixelToHex (Red Blob Games),
Migration von String-Cells zu HexCell-Objekten. 7 Unit-Tests grün."
git push
```

---

### Task 2: Hex-Renderer (Canvas, Flat-Top, isometrisch)

**Files:**
- Create: `hex-renderer.js`
- Modify: `index.html`

- [ ] **Step 1: hex-renderer.js implementieren**

```javascript
// hex-renderer.js — Flat-Top Hex-Rendering auf Canvas 2D
// Polytopia-Ästhetik: Terrain-Farben, isometrische Höhe, Emojis
(function () {
    'use strict';

    var ISO_FACTOR = 0.5; // Y-Stauchung für isometrischen Look
    var HEIGHT_PX = 4;    // Pixel pro Höhenstufe

    function drawHexGrid(ctx, grid, size, offsetX, offsetY, materials) {
        grid.forEach(function (cell, q, r) {
            if (!cell.surface) return;
            var pos = grid.hexToPixel(q, r, size);
            var x = pos.x + offsetX;
            var y = pos.y * ISO_FACTOR + offsetY;
            var heightOffset = cell.height * HEIGHT_PX;

            drawHex(ctx, x, y - heightOffset, size, cell, materials);

            // Seitenfläche (Höhe sichtbar machen)
            if (cell.height > 0) {
                drawHexSide(ctx, x, y - heightOffset, size, cell.height * HEIGHT_PX, cell, materials);
            }
        });
    }

    function drawHex(ctx, x, y, size, cell, materials) {
        var mat = materials[cell.surface];
        if (!mat) return;

        ctx.beginPath();
        for (var i = 0; i < 6; i++) {
            var angle = Math.PI / 180 * (60 * i);
            var hx = x + size * Math.cos(angle);
            var hy = y + size * Math.sin(angle) * ISO_FACTOR;
            if (i === 0) ctx.moveTo(hx, hy);
            else ctx.lineTo(hx, hy);
        }
        ctx.closePath();
        ctx.fillStyle = mat.color || '#333';
        ctx.fill();
        ctx.strokeStyle = mat.border || '#222';
        ctx.lineWidth = 1;
        ctx.stroke();

        // Emoji zentriert
        if (mat.emoji) {
            ctx.font = Math.round(size * 0.7) + 'px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(mat.emoji, x, y);
        }
    }

    function drawHexSide(ctx, x, y, size, h, cell, materials) {
        var mat = materials[cell.surface];
        if (!mat) return;

        // Untere 3 Ecken des Hex → Seitenfläche
        var points = [];
        for (var i = 1; i <= 3; i++) {
            var angle = Math.PI / 180 * (60 * i);
            points.push({
                x: x + size * Math.cos(angle),
                y: y + size * Math.sin(angle) * ISO_FACTOR
            });
        }

        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        ctx.lineTo(points[1].x, points[1].y);
        ctx.lineTo(points[2].x, points[2].y);
        ctx.lineTo(points[2].x, points[2].y + h);
        ctx.lineTo(points[1].x, points[1].y + h);
        ctx.lineTo(points[0].x, points[0].y + h);
        ctx.closePath();

        // Dunklere Version der Farbe
        ctx.fillStyle = mat.border || '#222';
        ctx.globalAlpha = 0.6;
        ctx.fill();
        ctx.globalAlpha = 1;
    }

    // Trixel-Overlay für Nerd-View
    function drawTrixelOverlay(ctx, x, y, size, cell) {
        if (!cell.trixels) return;
        for (var i = 0; i < 6; i++) {
            var a1 = Math.PI / 180 * (60 * i);
            var a2 = Math.PI / 180 * (60 * (i + 1));
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + size * Math.cos(a1), y + size * Math.sin(a1) * ISO_FACTOR);
            ctx.lineTo(x + size * Math.cos(a2), y + size * Math.sin(a2) * ISO_FACTOR);
            ctx.closePath();
            ctx.strokeStyle = '#FF6B00';
            ctx.lineWidth = 0.5;
            ctx.stroke();
            // Depth-Label
            ctx.fillStyle = '#FF6B00';
            ctx.font = '7px monospace';
            ctx.textAlign = 'center';
            var mx = x + size * 0.5 * (Math.cos(a1) + Math.cos(a2));
            var my = y + size * 0.5 * (Math.sin(a1) + Math.sin(a2)) * ISO_FACTOR;
            ctx.fillText('d:' + cell.trixels[i].depth, mx, my);
        }
    }

    // Hit-Test: welches Hex wurde geklickt?
    function hitTest(mouseX, mouseY, grid, size, offsetX, offsetY) {
        var adjX = mouseX - offsetX;
        var adjY = (mouseY - offsetY) / ISO_FACTOR;
        return grid.pixelToHex(adjX, adjY, size);
    }

    window.INSEL_HEX_RENDERER = {
        drawHexGrid: drawHexGrid,
        drawHex: drawHex,
        drawTrixelOverlay: drawTrixelOverlay,
        hitTest: hitTest,
        ISO_FACTOR: ISO_FACTOR,
        HEIGHT_PX: HEIGHT_PX
    };
})();
```

- [ ] **Step 2: Script-Tags in index.html**

Nach `bus.js`, vor `game.js`:

```html
<script src="hex-grid.js"></script>
<script src="hex-renderer.js"></script>
```

- [ ] **Step 3: Syntax-Check**

```bash
node --check hex-renderer.js
```

- [ ] **Step 4: Commit**

```bash
git add hex-renderer.js index.html
git commit -m "feat: hex-renderer.js — Flat-Top Canvas-Rendering mit isometrischer Höhe"
git push
```

---

### Task 3: Murmel-Physik (Gravitrax)

**Files:**
- Create: `hex-marble.js`

- [ ] **Step 1: hex-marble.js implementieren**

```javascript
// hex-marble.js — Murmel-Physik auf Hex-Grid (Gravitrax)
// Murmel folgt dem Gradienten zum niedrigsten Nachbar-Hex
(function () {
    'use strict';

    var TICK_MS = 300;      // Murmel bewegt sich alle 300ms
    var MAX_STEPS = 100;    // Endlos-Schutz

    function createMarble(q, r) {
        return {
            q: q, r: r,
            active: true,
            path: [{ q: q, r: r }],
            speed: 1,
            steps: 0
        };
    }

    function tickMarble(marble, grid) {
        if (!marble.active) return;
        marble.steps++;
        if (marble.steps > MAX_STEPS) {
            marble.active = false;
            return;
        }

        var current = grid.get(marble.q, marble.r);
        if (!current) { marble.active = false; return; }

        var neighbors = grid.neighbors(marble.q, marble.r);
        var lowest = null;
        var lowestHeight = current.height;

        for (var i = 0; i < neighbors.length; i++) {
            var nq = neighbors[i][0], nr = neighbors[i][1];
            var ncell = grid.get(nq, nr);
            if (ncell && ncell.height < lowestHeight) {
                lowestHeight = ncell.height;
                lowest = { q: nq, r: nr };
            }
        }

        // Flach oder aufwärts → Murmel bleibt liegen
        if (!lowest) {
            marble.active = false;
            return;
        }

        // Terrain-Effekte
        var target = grid.get(lowest.q, lowest.r);
        if (target.surface === 'water' || target.surface === 'wave') {
            marble.speed = Math.max(0.5, marble.speed * 0.7); // Wasser verlangsamt
        } else if (target.surface === 'fire' || target.surface === 'volcano') {
            marble.speed = Math.min(3, marble.speed * 1.5); // Feuer beschleunigt
        }

        // Höhle: teleportiert zur tiefsten erreichbaren Zelle
        if (target.surface === 'cave') {
            var deepest = findDeepest(grid);
            if (deepest) {
                lowest = deepest;
            }
        }

        marble.q = lowest.q;
        marble.r = lowest.r;
        marble.path.push({ q: lowest.q, r: lowest.r });

        // See (h:0 + Wasser) → Splash, Murmel stoppt
        if (target.height === 0 && (target.surface === 'water' || target.surface === 'wave')) {
            marble.active = false;
        }
    }

    function findDeepest(grid) {
        var minH = Infinity;
        var result = null;
        grid.forEach(function (cell, q, r) {
            if (cell.surface && cell.surface !== 'cave' && cell.height < minH) {
                minH = cell.height;
                result = { q: q, r: r };
            }
        });
        return result;
    }

    // Animation-Loop: ruft tickMarble wiederholt auf
    function animateMarble(marble, grid, onTick, onDone) {
        var interval = setInterval(function () {
            tickMarble(marble, grid);
            if (onTick) onTick(marble);
            if (!marble.active) {
                clearInterval(interval);
                if (onDone) onDone(marble);
            }
        }, TICK_MS / marble.speed);
        return interval;
    }

    window.INSEL_MARBLE = {
        createMarble: createMarble,
        tickMarble: tickMarble,
        animateMarble: animateMarble,
        TICK_MS: TICK_MS
    };
})();
```

- [ ] **Step 2: Script-Tag in index.html**

Nach `hex-renderer.js`:

```html
<script src="hex-marble.js"></script>
```

- [ ] **Step 3: Syntax-Check**

```bash
node --check hex-marble.js
```

- [ ] **Step 4: Commit**

```bash
git add hex-marble.js index.html
git commit -m "feat: hex-marble.js — Gravitrax Murmel-Physik auf Hex-Grid

Gradient Descent, Terrain-Effekte (Wasser bremst, Feuer beschleunigt,
Höhle teleportiert, See stoppt), Animations-Loop."
git push
```

---

### Task 4: A/B-Test-Infrastruktur + Engine-Toggle

**Files:**
- Modify: `game.js`
- Modify: `analytics.js`
- Modify: `worker.js`
- Modify: `index.html`

- [ ] **Step 1: Engine-Typ in localStorage**

In `game.js`, am Anfang der Initialisierung:

```javascript
// A/B-Test: Hex vs Quad Engine
var engineType = localStorage.getItem('insel-engine');
if (!engineType) {
    // Neue Spieler: 50/50 Zuordnung
    engineType = Math.random() < 0.5 ? 'hex' : 'quad';
    localStorage.setItem('insel-engine', engineType);
}
window.INSEL_ENGINE_TYPE = engineType;
```

- [ ] **Step 2: Nerd-Toggle im Code-View**

In `game.js`, im Code-View-Rendering, Button zum Umschalten hinzufügen:

```javascript
// Im Code-View Panel: Engine-Toggle
function toggleEngine() {
    var current = localStorage.getItem('insel-engine') || 'quad';
    var next = current === 'quad' ? 'hex' : 'quad';
    localStorage.setItem('insel-engine', next);
    location.reload(); // Sauberer Neustart mit neuer Engine
}
```

- [ ] **Step 3: Engine-Type in Analytics**

In `analytics.js`, im Session-Beacon `engine_type` mitsenden:

```javascript
engine_type: window.INSEL_ENGINE_TYPE || 'quad'
```

In `worker.js`, `engine_type` Spalte in sessions:

```javascript
try {
    await env.METRICS_DB.prepare(
        'ALTER TABLE sessions ADD COLUMN engine_type TEXT DEFAULT \'quad\''
    ).run();
} catch (e) { /* existiert bereits */ }
```

Und im INSERT:

```javascript
// engine_type zum INSERT hinzufügen
body.engine_type || 'quad'
```

- [ ] **Step 4: Syntax + Type Check**

```bash
node --check game.js && node --check analytics.js && node --check worker.js && npx tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add game.js analytics.js worker.js
git commit -m "feat: A/B-Test Infrastruktur — engine_type quad/hex

50/50 Zuordnung bei erstem Besuch, Nerd-Toggle im Code-View,
engine_type in Analytics + D1 Sessions."
git push
```

---

### Task 5: Starter-Insel als Hex-Grid generieren

**Files:**
- Modify: `game.js`

- [ ] **Step 1: generateHexStarterIsland() implementieren**

```javascript
function generateHexStarterIsland() {
    if (!window.INSEL_HEX) return;
    var radius = 8; // ~217 Hexagone
    var grid = INSEL_HEX.createGrid(radius);

    grid.forEach(function (cell, q, r) {
        var dist = Math.sqrt(q * q + r * r + q * r); // Hex-Distanz zum Zentrum
        var edge = radius * 0.85;

        if (dist > edge) {
            // Ozean (Rand)
            cell.surface = 'water';
            cell.height = 0;
        } else if (dist > edge - 1.5) {
            // Strand
            cell.surface = 'sand';
            cell.height = 1;
        } else {
            // Land: Höhe basierend auf Perlin-artiger Verteilung
            var h = Math.round(3 + 2 * Math.sin(q * 0.5) * Math.cos(r * 0.7));
            h = Math.max(1, Math.min(7, h));
            cell.height = h;

            // Materialien basierend auf Höhe
            if (h >= 5) {
                cell.surface = 'mountain';
            } else if (h >= 3) {
                cell.surface = Math.random() < 0.6 ? 'tree' : 'plant';
            } else {
                cell.surface = Math.random() < 0.3 ? 'flower' : 'plant';
            }
        }
    });

    // Zentrum: freier Platz für den Spieler
    var center = grid.get(0, 0);
    center.surface = 'earth';
    center.height = 3;

    return grid;
}
```

- [ ] **Step 2: Hex-Grid rendern wenn engine_type === 'hex'**

Im `draw()`-Loop von `game.js`:

```javascript
if (window.INSEL_ENGINE_TYPE === 'hex' && window.INSEL_HEX_RENDERER && window._hexGrid) {
    INSEL_HEX_RENDERER.drawHexGrid(
        ctx, window._hexGrid,
        Math.min(canvas.width, canvas.height) / (window._hexGrid.radius * 4),
        canvas.width / 2, canvas.height / 2,
        MATERIALS
    );
} else {
    // Bestehender Quadrat-Renderer
    // ... (unveränderter Code)
}
```

- [ ] **Step 3: Syntax-Check**

```bash
node --check game.js
```

- [ ] **Step 4: Commit**

```bash
git add game.js
git commit -m "feat: Hex-Starter-Insel — Ozean-Rand, Strand, Berge, Vegetation

generateHexStarterIsland() mit Höhenprofil. draw() dispatcht
an Hex-Renderer wenn engine_type='hex'."
git push
```

---

### Task 6: Touch/Klick-Handling für Hex-Grid

**Files:**
- Modify: `game.js`

- [ ] **Step 1: Click-Handler für Hex-Modus**

```javascript
function handleHexClick(mouseX, mouseY) {
    var size = Math.min(canvas.width, canvas.height) / (window._hexGrid.radius * 4);
    var hex = INSEL_HEX_RENDERER.hitTest(
        mouseX, mouseY, window._hexGrid,
        size, canvas.width / 2, canvas.height / 2
    );
    var cell = window._hexGrid.get(hex.q, hex.r);
    if (!cell) return;

    if (currentTool === 'marble') {
        // Murmel platzieren
        var marble = INSEL_MARBLE.createMarble(hex.q, hex.r);
        INSEL_MARBLE.animateMarble(marble, window._hexGrid,
            function onTick() { requestRedraw(); },
            function onDone(m) {
                showToast('🔴 Murmel gestoppt nach ' + m.path.length + ' Schritten!');
                requestRedraw();
            }
        );
    } else {
        // Material platzieren
        cell.surface = selectedMaterial;
        requestRedraw();
    }
}
```

- [ ] **Step 2: Event-Dispatch im bestehenden Click-Handler**

Im Canvas click/touch-Handler:

```javascript
if (window.INSEL_ENGINE_TYPE === 'hex' && window._hexGrid) {
    handleHexClick(mouseX, mouseY);
    return;
}
// ... bestehender Quadrat-Click-Handler
```

- [ ] **Step 3: Murmel-Button in Toolbar**

In `index.html`, neuer Button (nur sichtbar bei hex engine):

```html
<button id="marble-btn" title="Murmel" style="display:none;">🔴</button>
```

In `game.js`:

```javascript
if (window.INSEL_ENGINE_TYPE === 'hex') {
    var marbleBtn = document.getElementById('marble-btn');
    if (marbleBtn) {
        marbleBtn.style.display = '';
        marbleBtn.addEventListener('click', function () {
            currentTool = currentTool === 'marble' ? 'build' : 'marble';
            marbleBtn.classList.toggle('active', currentTool === 'marble');
        });
    }
}
```

- [ ] **Step 4: Syntax-Check**

```bash
node --check game.js
```

- [ ] **Step 5: Commit**

```bash
git add game.js index.html
git commit -m "feat: Hex Click/Touch + Murmel-Tool

hitTest für Hex-Koordinaten, Material platzieren auf Hex,
Murmel-Button in Toolbar (nur hex engine)."
git push
```

---

### Task 7: Deploy + Smoke-Test

**Files:**
- Modify: `worker.js` (deploy)
- Create: `tests/hex-smoke.spec.js`

- [ ] **Step 1: Worker deployen**

```bash
wrangler deploy
```

- [ ] **Step 2: Smoke-Test schreiben**

```javascript
const { test, expect } = require('@playwright/test');

test('Hex-Engine lädt wenn engine=hex', async ({ page }) => {
    await page.goto('https://schatzinsel.app');
    await page.evaluate(() => {
        localStorage.setItem('insel-engine', 'hex');
    });
    await page.reload();
    await page.waitForTimeout(2000);

    const engineType = await page.evaluate(() => window.INSEL_ENGINE_TYPE);
    expect(engineType).toBe('hex');

    const hexGrid = await page.evaluate(() => !!window._hexGrid);
    expect(hexGrid).toBeTruthy();
});

test('Quad-Engine lädt als Default', async ({ page }) => {
    await page.goto('https://schatzinsel.app');
    await page.evaluate(() => {
        localStorage.setItem('insel-engine', 'quad');
    });
    await page.reload();
    await page.waitForTimeout(2000);

    const engineType = await page.evaluate(() => window.INSEL_ENGINE_TYPE);
    expect(engineType).toBe('quad');
});
```

- [ ] **Step 3: Tests ausführen**

```bash
npx playwright test tests/hex-smoke.spec.js --reporter=line
```

- [ ] **Step 4: Commit**

```bash
git add tests/hex-smoke.spec.js
git commit -m "test: Hex-Engine Smoke-Tests — A/B-Test Toggle verifiziert"
git push
```
