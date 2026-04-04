# Stripe MCP — Vorbereitung

Stand: 2026-04-04 · Wartet auf User-Setup

---

## Was das Team vorbereitet hat

1. **DISTRIBUTION.md** — Strategie dokumentiert
2. **SumUp POS** — Hardware gekauft (User)
3. **PWYW-Konzept** — Anchor-Pricing definiert

## Was der User tun muss

### 1. Stripe Account

- https://dashboard.stripe.com/register
- Geschäftstyp: Einzelunternehmen oder Privatperson
- Land: Deutschland
- Währung: EUR

### 2. Stripe MCP Server einrichten

```json
// In Claude Code MCP Settings:
{
  "mcpServers": {
    "stripe": {
      "command": "npx",
      "args": ["-y", "@anthropic-ai/mcp-server-stripe"],
      "env": {
        "STRIPE_SECRET_KEY": "sk_live_..."
      }
    }
  }
}
```

### 3. Stripe Payment Link erstellen (kein Code nötig)

Dashboard → Payment Links → Neu:
- Produkt: "Schatzinsel — Pay What You Want"
- Preis: "Kunde entscheidet" (Custom Amount)
- Minimum: 0€ (oder 1€)
- Währung: EUR
- Erfolgsseite: `https://schatzinsel.app/?danke=1`

### 4. Button in schatzinsel.app

Sobald Stripe MCP steht, baut das Team:
```html
<a href="https://buy.stripe.com/DEIN_LINK" target="_blank" 
   class="pwyw-button">
   Was ist dir das wert?
</a>
```

---

## SumUp + Stripe Kombination

| Kanal | Tool | Zweck |
|-------|------|-------|
| Online (Browser) | Stripe Payment Link | PWYW im Spiel |
| Offline (Events) | SumUp POS Terminal | Spielplatz, Messen |
| Reporting | Stripe Dashboard | Beide Kanäle zusammen |

SumUp kann mit Stripe verbunden werden → einheitliches Reporting.

---

## Nächste Schritte nach User-Setup

1. Team baut PWYW-Button (Designer + Engineer)
2. `?danke=1` Parameter triggert Danke-Toast im Spiel
3. Feynman trackt PWYW-Beträge als Metrik
4. Ogilvy schreibt Copy: "Was ist dir das wert?" (nicht "Spende")
