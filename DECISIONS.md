# Architecture Decision Records

## ADR-001: Vanilla JS, no framework

No React, no Vue, no build tool. `index.html` opens in browser — done.
30-minute dev windows. `npm install` after 3 weeks of pause is not an option.
Canvas + vanilla JS is enough for a single-player grid game.

## ADR-002: localStorage over IndexedDB

Synchronous. Simple. Sufficient for single-player with one grid.
Auto-save every 30s + beforeunload.

## ADR-003: ELIZA as LLM fallback

Offline play requires offline dialogue. ELIZA pattern matching:
zero API calls, zero cost, zero latency. Works always.

## ADR-004: Requesty as LLM proxy

Cloudflare Worker proxies to Requesty. Model routing per NPC character.
BYOK dialog for user's own API key.

## ADR-005: 5-element cycle over 4-element inventory

Cycle creates gameplay (generation + control relationships).
List creates spreadsheet. Cycle is mechanic, list is data.

## ADR-006: Infinite Craft with KV cache

First discovery: LLM generates recipe → stored in Cloudflare KV.
Same combination = same result, deterministic after first find.
First discoverer's name on the recipe.

## ADR-007: Automerge (2048 pattern)

Adjacent identical materials merge automatically.
Emergent patterns from building without planning.

## ADR-008: No user accounts

No login, no registration. Privacy first. GDPR/COPPA avoidance.
Player name stored locally only.

## ADR-009: JSDoc + checkJs

Type safety without TypeScript build step. `tsconfig.json` with
`checkJs`, `types.d.ts`, `npm run typecheck`. Zero-build preserved.

## ADR-010: Isometric renderer

Optional isometric projection (△ toggle). 2:1 diamond tiles,
painter's algorithm, 3-face cube rendering. Grid data unchanged —
rendering layer only.

## ADR-011: L-system fractal trees

Procedural tree generation via Lindenmayer grammars.
Three complexity levels (sapling, small_tree, tree).
Deterministic per-cell hash for variation.

## Known debt

- `game.js` monolith: grid rendering + game state still coupled
- Smoke test: sandbox proxy blocks external fetches in CI

## Open questions

- Requesty key rotation (old key in git history)
- Browser-LLM: SmolLM2 local as ELIZA upgrade?
