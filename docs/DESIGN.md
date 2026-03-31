# Design-Prinzipien

## Grundsatz

Insel, nicht Spreadsheet. Wasser-Rand sichtbar, Strand-Gradient, Palmen.
Grid-Linien nur auf belegten Zellen. Leere Zellen sind Wasser oder Sand,
nicht leere Kaestchen.

## Canvas & Grid

- **Grid-basiert**, Canvas-Rendering (performant, skaliert auf 4K)
- **Responsive Dimensionen:**
  - PC 27" 4K: 16:9, grosses Grid
  - iPad: natives Seitenverhaeltnis
  - iPhone SE: natives Ratio, Layout stackt (Palette oben, Canvas darunter)
- `WATER_BORDER` um die Insel, Strand-Gradient am Rand, 8 Palmen als Starter

## Wu Xing Farbsystem

| Element | Farbe | Hex-Bereich |
|---------|-------|-------------|
| Holz (木) | Qing (blaugruen) | Gruen-Toene |
| Feuer (火) | Rot | Rot-Toene |
| Erde (土) | Braun | Braun/Ocker |
| Metall (金) | Weiss/Silber | Helle Toene |
| Wasser (水) | Blau | Blau-Toene |

## Themes (5)

1. **Tropical** -- Standard, helle Insel-Farben
2. **Night** -- Dunkles Theme, Sterne, Mond
3. **Candy** -- Bonbon-Farben, verspielt
4. **Ocean** -- Tiefblau, Unterwasser-Feeling
5. **Retro** -- Pixel-Aesthetik, 8-Bit-Palette

## Day/Night Cycle & Wetter

- Echtzeit Tag/Nacht-Zyklus (Himmel, Beleuchtung)
- Wetter-System: Regen, Sonne, Regenbogen
- Echtes Atlantik-Wetter via Open-Meteo API (29N, 31W)

## Sidebar

Tabs statt Stapel -- immer nur eine Sektion sichtbar:
- **Inventar** -- verfuegbare Materialien
- **Quests** -- aktive Aufgaben (max 2 gleichzeitig)
- **Erfolge** -- freigeschaltete Achievements

## Mobile

- **Horizontal scrollbare Palette** (kein Dropdown, kein Klappmen)
- **Touch-Gesten:** Drag & Drop zum Bauen, Swipe fuer Navigation
- **Toolbar:** Overflow-sicher, Buttons umbrechen auf kleinen Screens
- **iPhone SE:** Layout stackt vertikal, Buttons min. 48px

## Accessibility

- **ARIA-Labels** auf allen interaktiven Elementen
- **Tab-Navigation** durch alle Dialoge und Controls
- **Escape-Key** schliesst jeden Dialog
- **Kontrast:** WCAG AA als Minimum
- **Kein Tippen noetig** zum Spielen -- Emojis statt Text wo moeglich

## Hick's Law

Max 7 Optionen gleichzeitig sichtbar. Palette zeigt freigeschaltete
Materialien progressiv -- nicht alles auf einmal. Weniger Auswahl,
schnellere Entscheidung, mehr Bauen.

## Typographie & Ton

- Deutsche Labels, kurze Woerter
- Grosse Klickflaechen (min. 48px)
- Paluten-Ton: ein bisschen lustig, ein bisschen uebertrieben, nie langweilig
- Nicht belehren, nicht ausfragen, feiern statt bewerten
