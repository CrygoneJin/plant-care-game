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

## Communication Layer

```
┌──────────────────────────────────────────────────┐
│                   INSEL_BUS                      │
│                                                  │
│  Event Bus (pub/sub)     Token Ring (mutex)       │
│  ─────────────────────   ──────────────────────  │
│  emit('craft:success')   acquire('memory.md')    │
│  on('element:fire', fn)  → Promise<release>      │
│  off(event, fn)          release('memory.md')    │
│                                                  │
│  Session Lock (localStorage heartbeat)           │
│  ─────────────────────────────────────           │
│  acquireSessionLock() / releaseSessionLock()     │
│  30s heartbeat, 2min stale detection             │
└──────────────────────────────────────────────────┘

Events (9 Emitter → 3+ Subscriber):
  block:placed, craft:success, element:*, merge:result,
  consequence:*, tts:start/end, token:acquired/released/waiting,
  session:conflict/stale-lock

Threads (extern, Agent-Tool):
  User → Leader → Engineer/Artist/Designer/Scientist
  Max 2 Hops. Kontext pro Hop. Kein Multi-Hop-Routing.
```

### Speicher-Hierarchie (Harvard, Latenz ↔ Größe)

```
Level   Name              Latenz    Größe     Lebensdauer   Analogie
──────  ────────────────  ────────  ────────  ────────────  ──────────────
L0      Kontext-Fenster   0ms       ~200K tk  Session       CPU Register
L1i     Commands          lazy      208K      persistent    L1 Instr. Cache
L1d     Codizes           eager     52K       persistent    L1 Data Cache
L2      Team-Status       eager     84K       persistent    L2 Cache
L3      Org-Docs          on-demand 100K      persistent    RAM
L4      Codebase          grep/read 816K      persistent    SSD
L5      Archiv            git/grep  228K+     persistent    Magnetband
L∞      Git-History       git log   87 commits forever     Geologie
                                    150 branches
```

#### L0 — Kontext-Fenster (CPU Register)
Flüchtig. Stirbt am Session-Ende. Kein Persist.
Schnellster Zugriff, kleinster Speicher. Wird komprimiert wenn voll.

#### L1 — Persönlich (Harvard: Instructions | Data)
**L1i** `.claude/commands/*.md` — Was der Agent TUN kann (208K)
Lazy: geladen bei Skill-Aufruf, nicht bei Session-Start.

**L1d** `docs/masters/*.md` + `docs/padawans/*.md` — Wer der Agent IST (52K)
Eager: komplett geladen bei Session-Start.
ROM (Identität) + append-only Log (Erfahrungen pro Sprint).

#### L2 — Team-shared (L2 Cache)
`ops/MEMORY.md` (60K) + `ops/SPRINT.md` (24K)
Eager: gescannt bei Session-Start auf neue Einträge.
Cross-cutting: Bugs, Org-Learnings, Sprint-Status.
Token Ring schützt Schreibzugriff (INSEL_BUS.acquire).

#### L3 — Org-Docs (RAM)
`docs/PROJECT.md`, `ARCHITECTURE.md`, `DESIGN.md`, `USERS.md`,
`DECISIONS.md`, `DONE.md`, `AGENTS.md` (~100K)
On-demand: gelesen bei Session-Start oder bei Bedarf.
Ändert sich selten. Definiert Constraints für alle.

#### L4 — Codebase (SSD)
`src/` (816K) + `ops/tests/` + `index.html`
Grep/Read: nie komplett geladen, nur bei Bedarf durchsucht.
Integrität durch git (SHA-1 auf jedem Commit).

#### L5 — Archiv (Magnetband)
`docs/buch/` (112K), `docs/stories/` (60K), `docs/superpowers/` (56K),
Essays, Interviews, alte Branch-Docs.
Kalter Speicher. Selten gelesen, nie gelöscht.
Zugriff nur bei expliziter Anfrage.

#### L∞ — Git-History (Geologie)
87 Commits, 150 Branches. Jeder Commit ist eine Schicht.
`git log`, `git show`, `git diff`. Unwiderruflich (append-only).
Enthält alles was je existiert hat — auch gelöschte Dateien, alte Keys.

**Tradeoff:** Je tiefer das Level, desto größer der Speicher, desto
höher die Latenz. L0 ist sofort da aber klein. L∞ ist unendlich aber
braucht Minuten. Jeder Agent entscheidet selbst welches Level er braucht —
aber L1d (Codex) wird IMMER geladen.

**ECC (Error Correcting Code) pro Level:**
```
L0   Keine ECC — Komprimierung durch System, nicht kontrollierbar
L1   git-Integrität + Feynman prüft: "Hat jeder Codex einen Sprint-Eintrag?"
L2   Token Ring (Mutex) + safeParse auf MEMORY.md Reads
L3   Selten geschrieben → selten korrupt. git revert bei Bedarf.
L4   safeParse/safeSet (localStorage), tsc --noEmit (Typen), node --check (Syntax)
L5   Read-only. Kein ECC nötig.
L∞   SHA-1 Hashes auf jedem Commit. Unbestechlich.
```

**Branch Prediction (Zugriffsvorhersage):**
```
L0   Session-Snapshot → letzte Position, letztes Material vorselektieren
L1   Routing-Tabelle in CLAUDE.md → statisch, 80% Trefferquote
L2   Sprint Backlog → was heute gebaut wird bestimmt welche Module geladen werden
L3   Selten benötigt → kein Prefetch
L4   Grep-Pattern aus L0/L1 → gezielt statt Full Scan
```

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
