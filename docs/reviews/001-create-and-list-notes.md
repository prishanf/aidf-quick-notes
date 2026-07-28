---
type: code-review
track: C
status: request-changes
owner: ai-review
created: 2026-07-28
updated: 2026-07-28
pr: https://github.com/prishanf/aidf-quick-notes/pull/1
spec: docs/specs/001-create-and-list-notes.md
plan: docs/plans/001-create-and-list-notes.md
---

# Code review: Create and list notes

## Scope checked

- Diff `develop...feat/001-create-and-list-notes`
- Spec acceptance criteria, plan sequence, data model vs schema
- API contract vs routes/tests
- Evidence artifact corroboration status
- `project.yaml` database policy

## Findings

### P1 — Application role runs migrations

- **Where:** `server/database/client.ts` (`migrate(...)` inside `useDb()`)
- **Why:** `project.yaml` sets `database.application_role_may_migrate: false`. Auto-migrate on connect makes the app the migrator and hides missing `npm run db:migrate` from operators.
- **Fix:** Remove runtime migrate from `useDb`. Apply migrations in tests explicitly (and via `npm run db:migrate` for local/dev). Update conventions accordingly.

### P2 — Evidence not CI-corroborated

- **Where:** `docs/evidence/001-create-and-list-notes-agent.md` (`runner: agent`)
- **Why:** Agent-claimed results cannot satisfy gates; expected until Actions run on the PR.
- **Fix:** Let CI corroborate; do not treat agent evidence as green.

### P2 — POST 201 not asserted in HTTP test

- **Where:** `tests/notes.test.ts` create case
- **Why:** Body shape is checked; status code 201 is not. Low risk with `setResponseStatus`, but contract says 201.
- **Fix:** Assert response status via `$fetch.raw` or equivalent.

### P3 — Validation constants duplicated in UI

- **Where:** `app/pages/index.vue` hardcodes 120 / 5000
- **Why:** Drift risk vs `server/utils/notes.ts`
- **Fix:** Optional shared constants module or document duplication as acceptable for client/server split.

## What looks solid

- Schema matches data model columns; migration SQL matches schema
- HTTP tests cover GET empty, POST create + ordering, POST 400 empty title
- UI implements empty / loading / success / validation / server-error; no mockup markup copied
- Token layer precedes components; utilities use semantic colors
- API coverage script: 3/3 covered

## Decision

`request-changes` — remediate P1 (and preferably P2 status assert) before ready-for-human.

## Next action

`build` remediation on P1 (+ optional P2 test assert).
