# schatzinsel

Browser-based building game. No login, no account, no ads, no build step.
Open `index.html` — play.

**URL:** schatzinsel.app

## Stack

- Vanilla JS + Canvas 2D, zero dependencies
- Cloudflare Workers (LLM proxy, craft cache, voice relay)
- localStorage for persistence
- JSDoc + checkJs for type safety without build

## Run

```
open index.html
```

No npm. No build. No server.

## Architecture

See `ARCHITECTURE.md`.

## Game mechanics

5-element cycle (wood → fire → earth → metal → water → wood).
Each element generates the next, controls another.
Crafting via LLM + KV cache. Automerge on adjacency.
Isometric renderer available (△ toggle).
L-system fractal trees.

## Grid

Responsive: 32×18 (desktop), 28×21 (tablet), 18×28 (mobile).
Dirty-flag rendering. No rAF loop. CPU < 5%.

## NPCs

10 characters. Dual dialogue: ELIZA offline, LLM online.
Gemini voice via WebSocket.

## File map

See `ARCHITECTURE.md` for full table. Key files:

| File | Purpose |
|------|---------|
| `game.js` | Core engine (~4400 LOC) |
| `chat.js` | NPC dialogue + LLM |
| `iso-renderer.js` | Isometric projection |
| `fractal-trees.js` | L-system tree generation |
| `materials.js` | Material definitions |
| `worker.js` | Cloudflare Workers backend |

## Project docs

| File | What |
|------|------|
| `ARCHITECTURE.md` | Stack, files, data flow |
| `DECISIONS.md` | ADRs — why it's built this way |
| `DESIGN.md` | Visual system, themes, accessibility |
| `BACKLOG.md` | Product backlog |
| `SPRINT.md` | Current sprint |
| `DONE.md` | Definition of Done |
| `MEMORY.md` | Team learnings |

## Library

Essays, theory, stories → `docs/`

## License

See `LICENSE`.
