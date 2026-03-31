# Architektur

## Stack

- **HTML5 + CSS3 + Vanilla JavaScript** — kein Framework, kein Build-Tool
- **Canvas-basiertes Grid** fuer das Bauen (2D, responsive)
- **localStorage** fuer Speichern/Laden (Auto-Save alle 30s)
- **Cloudflare Workers** fuer LLM-Proxy, Craft-Cache (KV), Voice-Proxy
- **JSDoc + checkJs** fuer Typsicherheit ohne Build-Schritt

## Dateien

### Frontend (Browser)

| Datei | LOC | Zweck |
|-------|-----|-------|
| `index.html` | — | HTML-Struktur, UI-Layout, Dialoge |
| `style.css` | — | Styling, Themes, Responsive, Animationen |
| `game.js` | ~4400 | Spiellogik, Grid, Rendering, NPCs, Player, Events |
| `chat.js` | ~1150 | NPC-Chat, LLM-Integration, Token-Budget, Unlock-System |
| `voice.js` | ~470 | Gemini Voice Chat (WebSocket, Mikrofon, Audio-Playback) |
| `sound.js` | ~700 | Web Audio API, pentatonische Toene, Bau-Sounds |
| `materials.js` | — | Material-Definitionen (Emoji, Farbe, Label) |
| `recipes.js` | — | Deterministische Crafting-Rezepte (Wu Xing Basis) |
| `quests.js` | — | 60+ Quest-Templates pro NPC |
| `achievements.js` | — | Achievement-Definitionen und Tracking |
| `automerge.js` | — | 2048-artige Merge-Regeln (starke Kernkraft) |
| `blueprints.js` | ~330 | Bauplan-System |
| `screensaver.js` | — | Conway's Game of Life Overlay bei Idle |
| `eliza.js` | ~350 | ELIZA Pattern-Matching (LLM-Fallback offline) |
| `eliza-scripts.js` | ~300 | ELIZA-Dialogskripte pro NPC |
| `healthcheck.js` | — | localStorage-LRU, Grid-Integritaet, Speicher-Monitoring |
| `analytics.js` | ~230 | Session-Metriken, Engagement-Score |
| `storage.js` | ~70 | Storage-Abstraktion |
| `insel.js` | — | Bootstrapping, Config-Loading |
| `config.example.js` | — | Beispiel-Konfiguration (API-Keys, Proxy-URL) |
| `sw.js` | ~80 | Service Worker fuer Offline-Spiel |

### Backend (Cloudflare Workers)

| Datei | Zweck |
|-------|-------|
| `worker.js` | LLM-Proxy (Requesty), Craft-Endpoint (KV-Cache), Analytics, Bugs |
| `gemini-voice-worker.js` | WebSocket-Proxy fuer Gemini Live API (Durable Object) |

## Datenfluss

```
Browser (Vanilla JS)
  |
  |-- localStorage (Grid, Inventar, Unlocks, Quests)
  |
  |-- Cloudflare Worker /chat (LLM-Proxy → Requesty → Claude/GPT)
  |-- Cloudflare Worker /craft (Infinite Craft → LLM + KV-Cache)
  |-- Cloudflare Worker /voice (WebSocket → Gemini Live API)
  |-- Open-Meteo API (Echtzeit-Wetter, optional)
```

## Grid-System

- Responsive: 32x18 (Desktop 16:9), 28x21 (iPad 4:3), 18x28 (iPhone Portrait)
- `WATER_BORDER = 2` Zellen Wasser um die Insel
- `CELL_SIZE` dynamisch berechnet nach Viewport
- Dirty-Flag Rendering: `needsRedraw` statt rAF-Loop (CPU 20% → <5%)

## NPC-System

- 10 NPCs: 7 Grid-NPCs (sichtbar auf Insel) + 3 Chat-only (Bernd, Floriane, Bug)
- Unlock-Reihenfolge: 5 Starter → Tommy → Neinhorn → Krabs → Elefant → Mephisto
- Dual-Dialogue: Template-basiert (offline) + LLM-Chat (mit API-Key)
- Gemini Voice: WebSocket-basiert, 5 Stimmen gemappt auf NPCs

## Starten

`index.html` im Browser oeffnen — fertig. Kein npm, kein Build.
