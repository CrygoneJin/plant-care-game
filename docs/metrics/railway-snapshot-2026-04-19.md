---
type: read-only-snapshot
date: 2026-04-19
owner: Engineer
no-deploy: true
---

# Railway Status Snapshot — 2026-04-19

## CLI-Status
- Railway CLI v4.35.0 installiert
- Login: hoffmeyer.zlotnik@gmail.com (CrygoneJin)
- Workspace: "crygonejin's Projects"

## Sichtbare Projekte
| Projekt | Bemerkung |
|---------|-----------|
| Sally Sales | nicht Schatzinsel — wahrscheinlich team-sales-Sandbox |

## Schatzinsel-spezifisch
- **Kein verlinktes Projekt** in `/Users/till/projects/schatzinsel`
- **Keine `railway.json` / `railway.toml`** im Repo
- **Keine Schatzinsel-Deployments** in der CLI sichtbar

## Fazit
Schatzinsel **läuft nicht auf Railway**. Aktuelles Hosting (Stand laut DECISIONS.md prüfen):
- Cloudflare Workers für `/metrics`-Endpoint (#27 noch open für CORS-Deploy)
- Statisches Hosting wahrscheinlich GitHub Pages oder lokales Dev (Vite)
- D1 (Cloudflare) für Sessions-Persistence
- Airtable für CRM/Logs

## Open Questions (Triage morgen)
1. Sollte Schatzinsel überhaupt auf Railway? (Konflikt mit Cloudflare-Stack)
2. Falls ja: welches Subset (Worker? statisches Frontend? Eval-Service?)
3. Falls nein: kann der "Railway"-Eintrag im Backlog geschlossen werden?

## Nicht ausgeführt (per Vorgabe "no-deploy")
- Keine `railway init` / `railway up` / `railway link` durchgeführt
- Keine Konfigurationen erzeugt
- Reine Inspection
