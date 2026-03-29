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

## CI/CD

| Was | Wie |
|-----|-----|
| Trigger | Push/PR gegen `main` |
| Syntax-Check | `node -c` auf alle `.js` (außer `worker.js`) |
| Smoke-Test | Puppeteer lädt `index.html`, prüft auf Laufzeitfehler |
| Deploy | GitHub Pages via `actions/deploy-pages@v4` |
| Version | SemVer-Tags (`v0.1.0`), Fallback `v0.COMMITS.SHA` |

Workflow: `.github/workflows/deploy.yml`

## Versionierung

- SemVer via Git-Tags: `./scripts/release.sh [major|minor|patch]`
- Version wird beim Deploy in `index.html` gestempelt (`<!--VERSION-->`)
- Badge unten rechts im Game-UI zeigt aktuelle Version
- Kein Tag = Fallback auf Commit-Count + SHA

## Starten

`index.html` im Browser öffnen -- fertig.
