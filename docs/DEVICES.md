# Geräte-Kompatibilität — schatzinsel.app

Stand: 2026-04-04

## Zusammenfassung

schatzinsel.app ist ein Canvas-2D-Browserspiel ohne Build-Dependencies (Vanilla JS).
Minimale Anforderungen: ES6-fähiger Browser, Canvas 2D, Touch- oder Maus-Events.

---

## Geräte-Matrix

| Gerät | Display | Chip | Browser | Grid | Kompatibel | Anmerkungen |
|-------|---------|------|---------|------|------------|-------------|
| **iPhone 17 Pro** | 6.3" 2796×1290 @120Hz | A19 Pro | Safari 20 | 18×28 (Portrait) | ✅ Perfekt | ProMotion 120Hz, beste Performance. Dynamic Island — kein Einfluss auf Canvas. |
| **iPhone 16** | 6.1" 2556×1179 @60Hz | A18 | Safari 19 | 18×28 (Portrait) | ✅ Perfekt | Sehr gut. 60Hz reicht für Canvas 2D locker. Kein ProMotion. |
| **iPhone 7** | 4.7" 1334×750 @60Hz | A10 Fusion | Safari 15 (max iOS 15) | 18×28 (Portrait) | ⚠️ Eingeschränkt | Kleines Display — Touch-Targets (48px min) werden eng. A10 reicht für Canvas, aber iOS 15 = letztes Update. ES6 ✅, `env(safe-area-inset)` ✅ (kein Notch). localStorage ✅. |
| **iPhone SE** (Oscar) | 4.7" 1334×750 @60Hz | A15 | Safari 18 | 18×28 (Portrait) | ✅ Gut | Gleiche Displaygröße wie iPhone 7, aber moderner Chip + aktuelles iOS. Referenzgerät. |
| **iPad** (Oscar) | 10.2" 2160×1620 @60Hz | A13+ | Safari 18 | 28×21 (Landscape) | ✅ Perfekt | Tablet-Grid, großer Canvas, Touch-Targets komfortabel. |
| **Android 4.4 (KitKat)** | variiert | variiert | Chrome 37 | — | ❌ Nein | Kein ES6 (let/const, arrow functions, template literals). Kein `env()`. Kein Service Worker. Spiel startet nicht. Minimum: Android 7+ / Chrome 60+. |
| **Windows Desktop** (Farming Rig) | 27"+ variabel | Intel i3 Gen10+ | Chrome/Edge/Firefox | 32×18 (Landscape) | ✅ Perfekt | Desktop-Grid, Maus+Tastatur, maximaler Canvas. Keinerlei Einschränkungen. |
| **Tesla Screen** (Oscar) | 15.4" 1920×1200 | Intel Atom | Tesla Browser (Chromium) | 32×18 (Landscape) | ⚠️ Eingeschränkt | Tesla-Browser ist ein alter Chromium-Fork. Funktioniert grundsätzlich, aber Performance und Touch-Verhalten variieren. |

---

## Kritische Browser-Features

| Feature | Minimum | iPhone 7 | iPhone 16 | iPhone 17 Pro | Android 4.4 | Desktop |
|---------|---------|----------|-----------|---------------|-------------|---------|
| ES6 (let, const, arrow) | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ |
| Canvas 2D | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| localStorage | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Service Worker | Optional | ✅ | ✅ | ✅ | ❌ | ✅ |
| `env(safe-area-inset)` | Optional | ✅ | ✅ | ✅ | ❌ | N/A |
| `devicePixelRatio` | ✅ | ✅ (2x) | ✅ (3x) | ✅ (3x) | ✅ (variiert) | ✅ (1-2x) |
| Touch Events | Mobile | ✅ | ✅ | ✅ | ✅ | N/A |
| `prefers-color-scheme` | Optional | ✅ | ✅ | ✅ | ❌ | ✅ |

---

## iPhone 16 vs iPhone 17 Pro — für schatzinsel.app

| Aspekt | iPhone 16 | iPhone 17 Pro | Unterschied fürs Spiel |
|--------|-----------|---------------|----------------------|
| **Display** | 6.1" 60Hz | 6.3" 120Hz | Minimal. Canvas 2D profitiert kaum von 120Hz — kein Scrolling, kein 3D. |
| **Chip** | A18 | A19 Pro | Irrelevant. Canvas 2D ist CPU-trivial. Beide massiv überdimensioniert. |
| **RAM** | 8 GB | 8-12 GB | Irrelevant. Das Spiel braucht <50 MB. |
| **Grid** | 18×28 | 18×28 | Identisch. Beide Portrait-Modus, gleicher Aspect-Ratio-Bereich. |
| **Touch-Targets** | 48px+ ✅ | 48px+ ✅ | Identisch. Beide Displays groß genug. |
| **Fazit** | Reicht völlig | Overkill | **Kein spielrelevanter Unterschied.** Für schatzinsel.app sind beide identisch. |

---

## Empfehlung

- **Oscar (8)**: iPhone SE oder iPad bleiben die besten Geräte. iPad > iPhone wegen Displaygröße.
- **iPhone 7**: Geht noch, aber knapp. Display ist klein für 48px Touch-Targets. iOS 15 bekommt keine Updates mehr.
- **Android 4.4**: Nicht unterstützt. Minimum Android 7+.
- **Desktop (Farming Rig)**: Perfekt. Bester Modus mit 32×18 Grid und voller Tastatur.
- **iPhone 16 vs 17 Pro**: Egal. Beide überdimensioniert für Canvas 2D. Geld sparen → iPhone 16.
