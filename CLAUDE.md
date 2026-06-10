# loop-demo — Task API

Simple REST API for task management built with Node.js (no dependencies).

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
- Run `npm test && npm run lint` before considering work complete
