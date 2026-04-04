# Distribution — schatzinsel.app

Stand: 2026-04-04 · Einstein-Entscheidung

---

## Strategie

**Reibung erzeugt Wärme.** Pay What You Want = maximale Information bei minimaler Hürde.
Zahlungsbereitschaft ist die einzige Metrik die nicht lügt.

---

## Kanäle — Priorisiert

### P0: itch.io (PWYW) — Heute

| Aspekt | Details |
|--------|---------|
| Modell | Pay What You Want (ab 0€) |
| Gebühr | 0-10% (wir wählen) |
| Format | HTML5 ZIP (216 KB) |
| Review | Keiner |
| Aufwand | 1 Stunde |
| Status | ZIP bereit (`/tmp/schatzinsel-itch.zip`) |

**Upload-Schritte (User):**
1. https://itch.io/game/new
2. Title: "Schatzinsel — Bau deine Insel"
3. Kind: HTML5
4. Pricing: "No payments" → "Donations" oder "Pay what you want"
5. Upload: `schatzinsel-itch.zip`
6. "This file will be played in the browser" ✅
7. Viewport: 1280×720
8. Fullscreen button ✅
9. SharedArrayBuffer support: nicht nötig

### P1: schatzinsel.app + Stripe PWYW — Diese Woche

| Aspekt | Details |
|--------|---------|
| Modell | "Unterstütze das Spiel" Button mit freiem Betrag |
| Gebühr | 2.9% + 0.25€ (Stripe) |
| Hardware | SumUp POS Terminal (gekauft) |
| MCP | Stripe MCP für Integration (User-Setup) |
| Aufwand | 1 Tag |

**Vorbereitung (Team):**
- Stripe MCP Config bereit (wartet auf User-Setup)
- PWYW-Button Design (Rams)
- Copy (Ogilvy): kein "Spende" — sondern "Was ist dir das wert?"

### Kill: Steam — Nicht vor Spielplatztest

| Aspekt | Details |
|--------|---------|
| Kosten | 100 USD + 30% Umsatz |
| Aufwand | 1 Woche + Electron Wrapper |
| Bedingung | 7/10 Kinder setzen Block in <10s |
| Status | ❌ Gesperrt bis Spielplatztest |

---

## SumUp POS

Terminal gekauft. Einsatz: Live-Events, Spielplatztest, Messen.
Kombination mit Stripe für einheitliches Payment-Backend.

---

## Metriken (Feynman trackt)

| Metrik | Kanal | Bedeutung |
|--------|-------|-----------|
| PWYW Durchschnitt | itch.io | Wahrgenommener Wert |
| PWYW > 0€ Anteil | itch.io | Conversion |
| Stripe Spenden/Monat | schatzinsel.app | Wiederkehrendes Commitment |
| Discovery/Craft Ratio | Alle | >3 = genug Entdeckung |

---

## Anchor-Pricing (Humble Bundle Modell)

| Tier | Betrag | Bonus |
|------|--------|-------|
| Frei | 0€ | Vollständiges Spiel |
| Über Durchschnitt | >Ø | Lummerland freigeschaltet (Easter Egg URL) |
| Supporter | >5€ | Name als NPC-Gruß ("Hey [Name]!") |

*Noch nicht implementiert. Erst wenn itch.io-Daten da sind.*
