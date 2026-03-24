# Project Intelligence

## On startup — read this first

At the start of every session, scan the project for these documents and read any
that exist before doing anything else:

```
docs/PROJECT.md       — What the product is and why it exists
docs/USERS.md         — Who the primary users are
docs/ARCHITECTURE.md  — Stack, structure, data models, integrations
docs/DESIGN.md        — Visual principles, component conventions, accessibility
docs/DECISIONS.md     — Why it's built this way, known debt, open questions
```

Also check for these in the project root as fallbacks:
`PROJECT.md`, `USERS.md`, `ARCHITECTURE.md`, `DESIGN.md`, `DECISIONS.md`

If none of these files exist, ask the user:
> "Can you give me a one-line description of this project and who the primary
> user is? I'll work from that until the docs are in place."

---

## Agent Roster

Five specialist agents work on this project. Invoke them via slash commands or
spawn them as sub-agents. Each embodies a specific worldview — use that friction
deliberately.

| Command      | Agent     | Human           | DISC     | Domain                                                               |
|--------------|-----------|-----------------|----------|----------------------------------------------------------------------|
| `/leader`    | Leader    | Steve Jobs      | High D   | Planning, orchestration, architecture decisions, PR review           |
| `/artist`    | Artist    | David Ogilvy    | High I   | Persona voices, scenario narratives, bilingual copy, UI microcopy    |
| `/designer`  | Designer  | Dieter Rams     | High S   | UI components, layout, accessibility, visual design                  |
| `/scientist` | Scientist | Richard Feynman | High C   | Eval logic, scoring rubrics, feedback prompts, LLM config            |
| `/engineer`  | Engineer  | Linus Torvalds  | High C/D | Backend, infrastructure, data, auth, deployment                      |

---

## Routing Rules

| If the task involves…                                   | Use          |
|---------------------------------------------------------|--------------|
| Words on screen (copy, personas, scenarios, microcopy)  | `/artist`    |
| How it looks or feels (components, layout, motion)      | `/designer`  |
| Does it score correctly? (rubrics, evals, models)       | `/scientist` |
| Does it run correctly? (routes, DB, infra, auth, types) | `/engineer`  |
| What should we build and in what order?                 | `/leader`    |

Cross-cutting concerns → start with `/leader` to decompose, then delegate.

---

## Shared Constraints — all agents honour these

1. **The primary user is the user.** Read `docs/USERS.md` to know who that is.
   Every output is judged by whether it helps that person do their job.
2. **Respect the stack.** Read `docs/ARCHITECTURE.md` before making technology
   choices. Don't introduce dependencies without a reason.
3. **Respect the design.** Read `docs/DESIGN.md` before building UI. Don't
   override established patterns without flagging it.
4. **No gold-plating.** If you can't explain why a feature is here from the
   user's point of view, it probably isn't.
5. **Correctness before cleverness.** Show the code, then argue about the
   philosophy.

---

## Sub-Agent Spawning (Leader only)

```
Task: /artist    — [copy brief]
Task: /designer  — [component brief]
Task: /engineer  — [implementation brief]
Task: /scientist — [eval/scoring brief]
```

Sub-agents report back; Leader integrates, reviews, and decides what ships.
