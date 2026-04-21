# Geräte-Kompatibilität — schatzinsel.app

Stand: 2026-04-04

## Zusammenfassung

schatzinsel.app ist ein Canvas-2D-Browserspiel ohne Build-Dependencies (Vanilla JS).
Minimale Anforderungen: ES6-fähiger Browser, Canvas 2D, Touch- oder Maus-Events.
Minimum Android: **Android 10+** (Chrome 80+). Entscheidung: Jobs, 2026-04-04.
Minimum iOS: **iOS 16+** (Safari 16+). Entscheidung: Einstein/Feynman/Torvalds, 2026-04-04.

---

## Geräte-Matrix

| Gerät | Display | Chip | Browser | Grid | Kompatibel | Anmerkungen |
|-------|---------|------|---------|------|------------|-------------|
| **iPhone 17 Pro** | 6.3" 2796×1290 @120Hz | A19 Pro | Safari 20 | 18×28 (Portrait) | ✅ Perfekt | ProMotion 120Hz, beste Performance. Dynamic Island — kein Einfluss auf Canvas. |
| **iPhone 16** | 6.1" 2556×1179 @60Hz | A18 | Safari 19 | 18×28 (Portrait) | ✅ Perfekt | Sehr gut. 60Hz reicht für Canvas 2D locker. Kein ProMotion. |
| **iPhone 7 / SE 1. Gen** | 4.0-4.7" 1334×750 @60Hz | A9/A10 | Safari 15 (max iOS 15) | 18×28 (Portrait) | ❌ Nein | iOS 16+ Regel. Kein Support für iOS 15. iPhone 7 (2016), SE 1. Gen (2016) sind raus. |
| **iPhone SE** (Oscar) | 4.7" 1334×750 @60Hz | A15 | Safari 18 | 18×28 (Portrait) | ✅ Gut | Gleiche Displaygröße wie iPhone 7, aber moderner Chip + aktuelles iOS. Referenzgerät. |
| **iPad** (Oscar) | 10.2" 2160×1620 @60Hz | A13+ | Safari 18 | 28×21 (Landscape) | ✅ Perfekt | Tablet-Grid, großer Canvas, Touch-Targets komfortabel. |
| **Android < 10** | variiert | variiert | Chrome <80 | — | ❌ Nein | Minimum: Android 10+ / Chrome 80+. Entscheidung Jobs. Android 4.4 hat kein ES6. Android 7-9 technisch möglich aber nicht supported. |
| **Windows Desktop** (Farming Rig) | 27"+ variabel | Intel i3 Gen10+ | Chrome/Edge/Firefox | 32×18 (Landscape) | ✅ Perfekt | Desktop-Grid, Maus+Tastatur, maximaler Canvas. Keinerlei Einschränkungen. |
| **Tesla Screen** (Oscar) | 15.4" 1920×1200 | Intel Atom | Tesla Browser (Chromium) | 32×18 (Landscape) | ⚠️ Eingeschränkt | Tesla-Browser ist ein alter Chromium-Fork. Funktioniert grundsätzlich, aber Performance und Touch-Verhalten variieren. |
| **Steam Deck** | 7" 1280×800 @60Hz | AMD Zen 2 | Firefox/Chrome (SteamOS) | 32×18 (Landscape) | ✅ Perfekt | Desktop-Grid auf 7 Zoll + Touchscreen. Als Non-Steam-Game einbindbar: `firefox --kiosk https://schatzinsel.app`. Besser als iPhone — volles Desktop-Grid. |
| **Nintendo Switch** | 6.2" 1280×720 @60Hz | Tegra X1 | Kein offizieller Browser | — | ❌ Nein | Kein Browser-Zugang ohne Homebrew. Nintendo sperrt aktiv. Mit Homebrew-Chromium theoretisch möglich (⚠️ auf eigenes Risiko), aber nicht supported. |

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
- **iPhone 7 / SE 1. Gen**: Nicht unterstützt. Minimum iOS 16+ (Einstein/Feynman/Torvalds-Entscheidung 2026-04-04).
- **Android < 10**: Nicht unterstützt. Minimum Android 10+ (Jobs-Entscheidung 2026-04-04).
- **Desktop (Farming Rig)**: Perfekt. Bester Modus mit 32×18 Grid und voller Tastatur.
- **iPhone 16 vs 17 Pro**: Egal. Beide überdimensioniert für Canvas 2D. Geld sparen → iPhone 16.
