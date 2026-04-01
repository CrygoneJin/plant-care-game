# Lehrerlosung

Jeden Morgen um 06:30 eine pädagogische Tageslosung via Telegram.

30 Losungen. Rotiert nach Tag des Jahres. Jede hat eine Zeile + einen Impuls für den Unterricht.

## Setup

```bash
cd workers/lehrerlosung
wrangler secret put TELEGRAM_BOT_TOKEN   # von @BotFather
wrangler secret put TELEGRAM_CHAT_ID     # deine Chat-ID
wrangler deploy
```

## Endpoints

| Route | Was |
|-------|-----|
| `/heute` | Heutige Losung als Text |
| `/alle` | Alle 30 Losungen |
| `/send` | Jetzt senden (zum Testen) |

## Quellen

Pestalozzi, Schiller, Sokrates, Feynman, Montessori, Douglas Adams, Bug die Raupe.
