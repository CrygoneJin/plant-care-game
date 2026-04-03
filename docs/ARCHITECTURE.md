# Architecture

## Stack

```
Browser (Vanilla JS + Canvas 2D)
  ├── localStorage (grid, inventory, unlocks, quests)
  ├── Cloudflare Worker /chat (LLM proxy → Requesty → Claude/GPT)
  ├── Cloudflare Worker /craft (Infinite Craft → LLM + KV cache)
  ├── Cloudflare Worker /voice (WebSocket → Gemini Live API)
  └── Open-Meteo API (real-time weather, optional)
```

No framework. No build tool. No npm for frontend.

## Files

### Frontend

| File | LOC | Purpose |
|------|-----|---------|
| `game.js` | ~4400 | Core: grid, rendering, NPCs, player, events |
| `chat.js` | ~1150 | NPC chat, LLM integration, token budget |
| `voice.js` | ~470 | Gemini voice (WebSocket, mic, playback) |
| `sound.js` | ~700 | Web Audio, pentatonic tones, drums |
| `iso-renderer.js` | ~350 | Isometric projection, cube rendering |
| `fractal-trees.js` | ~200 | L-system procedural trees |
| `materials.js` | — | Material definitions (emoji, color, label) |
| `recipes.js` | — | Deterministic crafting recipes |
| `quests.js` | — | 60+ quest templates per NPC |
| `achievements.js` | — | Achievement tracking |
| `automerge.js` | — | 2048-style merge rules |
| `blueprints.js` | ~330 | Blueprint pattern matching |
| `screensaver.js` | — | Conway's Game of Life overlay |
| `effects.js` | — | Weather, day/night, particles |
| `nature.js` | — | Tree growth, world consequences |
| `marketplace.js` | — | P2P rare item trading |
| `eliza.js` | ~350 | ELIZA pattern matching (LLM fallback) |
| `eliza-scripts.js` | ~300 | ELIZA scripts per NPC |
| `healthcheck.js` | — | localStorage LRU, grid integrity |
| `analytics.js` | ~230 | Session metrics, engagement score |
| `storage.js` | ~70 | Storage abstraction |
| `stories.js` | — | Audio drama data |
| `sw.js` | ~80 | Service Worker for offline play |

### Backend (Cloudflare Workers)

| File | Purpose |
|------|---------|
| `worker.js` | LLM proxy, craft endpoint (KV), analytics, D1 |
| `gemini-voice-worker.js` | WebSocket proxy for Gemini Live API |

## Grid

- Responsive: 32×18 (16:9), 28×21 (4:3), 18×28 (portrait)
- `WATER_BORDER = 2` cells around island
- `CELL_SIZE` dynamic per viewport
- Dirty-flag rendering: `needsRedraw` flag, no rAF loop
- Isometric mode: 2:1 diamond tiles, painter's algorithm

## NPC system

- 10 NPCs: 7 on-grid + 3 chat-only
- Unlock order: 5 starters → Tommy → Neinhorn → Krabs → Elefant → Mephisto
- Dual dialogue: template-based (offline) + LLM (with API key)
- Gemini voice: 5 voices mapped to NPCs

## Known debt

- `game.js` monolith — grid rendering, draw(), events still coupled
- Smoke test blocked by sandbox proxy in CI
