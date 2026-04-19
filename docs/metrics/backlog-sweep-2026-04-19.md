---
type: backlog-sweep
date: 2026-04-19
owner: Leader
---

# Backlog Sweep — 2026-04-19 (Nacht-Sprint)

## P0 Status

| # | Item | Status | Aktion morgen |
|---|------|--------|---------------|
| 103 | Live Launch (Playwright + Stripe + itch.io) | 🔄 In Progress | **Dry-Run-Checkliste erstellt** (`live-launch-dry-run-2026-04-19.md`). Nächster Schritt: Stripe-Account + Hosting-Entscheidung. |
| 78 | Tesla-Nutzertest auswerten | 🔲 Human Input | Till muss Video bereitstellen |
| 27 | Cloudflare Worker CORS | 🔲 Human Input | Till muss Worker im CF-Dashboard deployen |
| 92 | Requesty Key rotieren | 🔲 Human Input | Till muss Key rotieren — Sicherheitsrisiko bleibt |
| 108 | Native Speaker Review FR/ES/IT | 🔲 Human Input | Sprecher organisieren oder ausarchivieren |

**Befund**: Alle nicht-Human-Input P0 sind erledigt oder dokumentiert. P0 ist **clean**.

## P1 Status
**100% Done** — alle 9 Items mit ✅ markiert.

## P2 Status
**100% Done** — alle 12 Items mit ✅ markiert.

## Sprint-Backlog (S88) Status

| # | Item | Status |
|---|------|--------|
| S88-1 | Quests Runde 48 (Lokführer/Krämerin/Elefant) PR #375 | ⏳ wartet auf Merge |
| S88-2 | Carry-Over Merges PRs #314–#375 | 🔄 **In Progress diese Nacht** (Merge-Marathon) |

## Empfehlung für morgen früh

### Sofort (5 min)
- [ ] Merge-Marathon-Log lesen (`merge-marathon-2026-04-19.md`)
- [ ] DIRTY/CONFLICT PRs entscheiden: rebasen oder schließen?
- [ ] Phantom-Branches (Runde 62-67) bewerten

### Kurz (30 min)
- [ ] Hosting-Entscheidung treffen (Cloudflare Pages? GitHub Pages? Vercel?)
- [ ] Stripe vs. Itch.io für Monetarisierung entscheiden

### Mittel
- [ ] Backlog-Pflege: Erledigtes nach `ARCHIVE.md`
- [ ] Tesla-Video bereitstellen für Tesla-Nutzertest #78
- [ ] Requesty Key rotieren #92

## Sweet Spot

Backlog ist erstaunlich leer. Die einzigen offenen P0 sind alles **Human Input** Items.
Die Maschine kann nicht weiter — Till muss real-world Schritte machen
(Account anlegen, Key rotieren, Video bereitstellen, Hosting wählen).

Die echte Frage: was ist nach dem Live-Launch das nächste Produktziel? Das gehört
in eine Sprint-Planung, nicht in einen Backlog-Sweep.
