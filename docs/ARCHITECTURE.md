# Architektur

## Stack

- **HTML5 + CSS3 + Vanilla JavaScript**
- Kein Framework, kein Build-Tool
- Canvas-basiertes Grid für das Bauen
- localStorage für Speichern/Laden

## Dateien

| Datei | Zweck |
|-------|-------|
| `index.html` | HTML-Struktur |
| `style.css` | Styling |
| `game.js` | Spiellogik |
| `healthcheck.js` | DNA-Autoreparatur: localStorage-LRU, Grid-Integrität, Speicher-Monitoring |

## Starten

`index.html` im Browser öffnen -- fertig.

## Entscheidungen

1. **Vanilla JS** -- Kein Framework nötig, einfach `index.html` öffnen
2. **2D Grid** -- Einfach genug für ein Kind, komplex genug um Spaß zu machen
3. **Deutsch** -- Schnipsels Muttersprache
4. **Canvas** -- Performant für Grid-Rendering mit Animationen
5. **localStorage** -- Speichern ohne Backend
