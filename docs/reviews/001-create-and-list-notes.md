---
type: code-review
track: C
status: ready-for-human
owner: ai-review
created: 2026-07-28
updated: 2026-07-28
pr: https://github.com/prishanf/aidf-quick-notes/pull/1
spec: docs/specs/001-create-and-list-notes.md
plan: docs/plans/001-create-and-list-notes.md
---

# Code review: Create and list notes

## Scope checked

- Diff `develop...feat/001-create-and-list-notes` (including remediation commits)
- Spec acceptance criteria, plan sequence, data model vs schema
- API contract vs routes/tests
- Evidence artifact corroboration status
- `project.yaml` database policy

## Findings

### P1 — Application role runs migrations — **fixed**

- Was: `migrate()` inside `useDb()`
- Fix: removed runtime migrate; tests bootstrap schema explicitly; README/conventions require `npm run db:migrate`

### P2 — Evidence not CI-corroborated — **accepted follow-up**

- Agent evidence remains claimed until GitHub Actions corroborates on the PR.

### P2 — POST 201 not asserted — **fixed**

- Create test now uses `fetch` and expects status `201`.

### P3 — Validation constants duplicated in UI — **accepted follow-up**

- Acceptable for client/server split in this example.

## What looks solid

- Schema matches data model; migration SQL matches schema
- HTTP tests cover GET empty, POST create + ordering + 201, POST 400 empty title
- UI implements empty / loading / success / validation / server-error
- Token layer precedes components
- API coverage script: 3/3 covered (agent-run)

## Decision

`ready-for-human` — no open P0/P1. AI review does **not** satisfy human PR approval.

## Next action

Human review may begin on https://github.com/prishanf/aidf-quick-notes/pull/1
