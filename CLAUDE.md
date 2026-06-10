# loop-demo — Task API

Simple REST API for task management built with Node.js (no dependencies).

## Behavioral Guidelines (Karpathy's Method)

### 1. Think Before Coding

Don't assume. Don't hide confusion. Surface tradeoffs.

- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them — don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

### 2. Simplicity First

Minimum code that solves the problem. Nothing speculative.

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

### 3. Surgical Changes

Touch only what you must. Clean up only your own mess.

- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it — don't delete it.
- Every changed line should trace directly to the task at hand.

### 4. Goal-Driven Execution

Define success criteria. Loop until verified.

Transform tasks into verifiable goals:
- "Add validation" → Write tests for invalid inputs, then make them pass
- "Fix the bug" → Write a test that reproduces it, then make it pass
- "Refactor X" → Ensure tests pass before and after

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
```

Strong success criteria let you loop independently.
Weak criteria ("make it work") require constant clarification.

## Quality Gates

These are RULES, not tasks. Every change must pass ALL of them before it can be considered done:

- `npm test` — all tests green
- `npm run coverage` — overall line coverage ≥ 95%
- `npm run lint` — 0 findings

## Commands

- `npm test` — run all tests (Node.js built-in test runner)
- `npm run lint` — run custom lint checks
- `npm start` — start the server on port 3456
- `npm run bench` — run performance benchmark (server must be running)
- `npm run coverage` — run tests with coverage, fail if < 95%

## Architecture

- `src/store.js` — in-memory task store (Map-based, all business logic)
- `src/server.js` — HTTP server with REST endpoints
- `src/store.test.js` — unit tests for the store
- `src/lint-check.js` — custom lint rules

## API endpoints

- `GET /health` — health check
- `GET /tasks` — list all (filter: `?done=true/false`)
- `GET /tasks/:id` — get one task
- `POST /tasks` — create task (`{title, priority?}`)
- `PATCH /tasks/:id/toggle` — toggle done status
- `DELETE /tasks/:id` — delete task

## Conventions

- No external dependencies — stdlib only
- Tests use `node:test` and `node:assert/strict`
- Each bug fix must include a regression test
