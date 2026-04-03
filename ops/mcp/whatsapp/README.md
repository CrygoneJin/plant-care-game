# WhatsApp MCP Server

Sendet WhatsApp-Nachrichten direkt aus Claude Code.

## Setup

1. Meta Business Dashboard: https://developers.facebook.com
2. WhatsApp → API Setup → Access Token + Phone Number ID kopieren
3. In `~/.claude/settings.json` oder `.claude/settings.json` eintragen:

```json
{
  "mcpServers": {
    "whatsapp": {
      "command": "node",
      "args": ["mcp/whatsapp/index.js"],
      "env": {
        "WHATSAPP_TOKEN": "dein-token-hier",
        "WHATSAPP_PHONE_ID": "deine-phone-id-hier"
      }
    }
  }
}
```

## Tools

| Tool | Was es tut |
|------|-----------|
| `send_message` | Text-Nachricht senden |
| `send_link` | Link mit Vorschau senden |
| `send_template` | Template-Nachricht (für Erstkontakt) |

## Wichtig

- Erstkontakt muss ein genehmigtes Template sein (Meta-Regel)
- Nachdem der Empfänger geantwortet hat: 24h Fenster für freie Nachrichten
- Telefonnummern mit Ländervorwahl ohne + (z.B. `4917612345678`)
