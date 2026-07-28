---
type: implementation-plan
track: C
required_when: "every Track B and Track C change"
status: approved
owner: prishanf
created: 2026-07-28
updated: 2026-07-28
spec: docs/specs/002-delete-note.md
issue: ""
branch: feat/002-delete-note
---

# Implementation plan: Delete a note

## Goal and boundaries

Deliver hard-delete of one note from the home-page list: confirm dialog, `DELETE /api/notes/:id` → `204` / `404`, list/empty-state refresh, and HTTP coverage. Non-goals: soft-delete, undo, auth, edit (Feature 3), bulk delete, schema/migration.

## Repository findings

| Area | Finding | Evidence |
|---|---|---|
| Existing behavior | Create + list on one page; `GET`/`POST` `/api/notes`; no delete route or UI | `app/pages/index.vue`, `server/api/notes/index.get.ts`, `index.post.ts` |
| Integration point | Nuxt dynamic file route under `server/api/notes/`; shared DTO helpers; page-local UI | `server/utils/notes.ts`, `docs/conventions.md` reference table |
| Test coverage | HTTP tests for list/create/400 via `@nuxt/test-utils` | `tests/notes.test.ts` |
| Data model | Hard delete already recorded as Feature 2 mechanism; no new columns | `docs/architecture/data-model.md` |
| Design authority | Approved mockup: Delete per row, confirm, deleting, delete-error, delete-missing, empty | `docs/design/mockups/delete-note/` |
| Size budget | Soft cap 400 changed lines (`project.yaml`); keep PR focused | `gates.pr_size_soft_cap_lines: 400` |

Classification unchanged: Track C · tags `ui`, `api` (no `database`).

## Change map

| File or area | Change | Why |
|---|---|---|
| `server/api/notes/[id].delete.ts` | Add delete handler | `DELETE /api/notes/:id` → 204 / 404 / 4xx id |
| `server/utils/notes.ts` | Optional id-parse helper (or inline in route) | Reject missing/invalid path id |
| `app/pages/index.vue` | Delete control, confirm dialog, delete pending/error/success states | Match approved design |
| `docs/api/notes.md` | Add `DELETE` endpoint + tests row; note no-auth + irreversible | `api` tag contract |
| `tests/notes.test.ts` | HTTP: 204 success, 404 missing, invalid id 4xx | Endpoint coverage |
| `CHANGELOG.md` | Unreleased entry for delete | Track C requirement |
| `docs/conventions.md` | Point delete route at `[id].delete.ts` in reference table | Orientation for Feature 3+ |
| `docs/design/mockups/delete-note/` | Leave in place; `npm run mockup:serve` already points here | Design/QA reference during build; not product code |

**UI structure (from approved mockup — not re-decided here):** Notes screen with Delete on each row → confirm modal (“Delete this note?” + quoted title) → Deleting… → remove from list / empty state; delete-error and delete-missing alerts leave other notes intact.

**No schema / migration files.** Soft-delete or new columns would stop build and force re-classification with `database`.

## Sequence

1. Confirm token layer unchanged (`app/assets/css/tokens.css`); implement UI with existing danger / surface-raised / modal tokens only — **no new tokens**.
2. Add `server/api/notes/[id].delete.ts`: parse/validate `id`; `DELETE FROM notes WHERE id = ?`; `204` if a row was removed; `404` if zero rows; clear message via `createError`.
3. Extend `tests/notes.test.ts` with create-then-delete (204 + absent from GET), delete unknown id (404), and invalid/missing id (4xx). New cases must fail against pre-change code.
4. Update `docs/api/notes.md` inventory and per-endpoint docs for `DELETE` (204 empty body; 404; no auth).
5. Extend `app/pages/index.vue`: per-row Delete → confirm dialog (Cancel / Delete note) → call `DELETE` → remove note locally on 204; show delete-error / delete-missing alerts; empty state when list becomes empty. Do **not** copy mockup markup.
6. Changelog + conventions reference row; run manifest verification; open PR to `develop` when build is approved later.

## Data and migration

Hard delete of existing `notes` rows only — **no** `database` tag, **no** migration.

- Data model document: `docs/architecture/data-model.md` — unchanged (already documents Feature 2 hard delete)
- Entities and columns added, altered, or removed: none
- Migration files and order: none
- Expand/contract phase: none
- Backfill: none
- Backward compatibility: older app without delete UI still reads/writes the same schema; new route is additive
- Rollback: revert the feature branch / deploy; deleted rows are not restored (local/synthetic data)
- Seed profile for Preview: none required for schema; existing synthetic notes suffice
- Classification and retention effects: none — same internal developer notes; hard delete shortens retention for that row
- Migration plan: none — not applicable without `database` tag

## UI foundation

- Is this the project's **first** `ui` change? `no`
- UI foundation document: `docs/design/ui-foundation.md` — extended by design gate (inventory only)
- Foundation approval: approved on 2026-07-28 (Feature 1); Feature 2 inventory extensions already noted
- Token layer: `app/assets/css/tokens.css` — unchanged
- CSS framework: tailwind v4; theme wiring in token layer
- Approved design and mockup: `docs/design/002-delete-note.md`, `docs/design/mockups/delete-note/`
- Components: page-local in `app/pages/index.vue` for Feature 2 (danger button, confirm dialog, delete row control) — no shared component directory required unless build prefers extracting; mockup is throwaway
- New tokens this change adds to a scale: none
- Breakpoints and states to verify: base + `sm`; success (with Delete), confirm, deleting, delete success, delete-error, delete-missing, empty after last delete; keyboard Escape/Cancel/backdrop when not deleting

## API surface

- API contract document: `docs/api/notes.md` — updated
- Endpoints added: `DELETE /api/notes/:id`
- Endpoints unchanged: `GET /api/notes`, `POST /api/notes`
- Per endpoint HTTP tests:
  - `DELETE /api/notes/:id` → `tests/notes.test.ts`
  - Existing GET/POST remain in `tests/notes.test.ts`
- Authorization rules / denied path: n/a — no auth (document in contract; any local caller can delete by id)
- Cross-tenant isolation test: n/a — single-tenant local file

## Verification plan

- Unit/Integration: `npm test` (includes new delete cases in `tests/notes.test.ts`)
- Static: `npm run lint` · `npm run typecheck`
- Build: `npm run build`
- API coverage: `npm test` + `sh .aidf/reference/scripts/check-api-coverage.sh`
- Migration: none (no schema change)
- Accessibility/responsive: keyboard Delete → dialog focus trap/order; Escape dismiss when idle; narrow viewport dialog full-width; live region / `role="alert"` for delete errors
- Manual: `npm run dev` → create note → Delete → confirm → gone; cancel leaves note; force 404/500 paths and confirm alerts; delete last note → Feature 1 empty state; optional `npm run mockup:serve` for visual reference only
- Size: keep diff near soft cap (~400 lines); stop and split if materially over without justification

## Risks and assumptions

- Assumption: Nuxt file routing `server/api/notes/[id].delete.ts` maps to `DELETE /api/notes/:id`
- Assumption: Success response is empty `204 No Content` (spec open question resolved); clients must not expect a JSON body
- Assumption: Path `id` is the Feature 1 UUID string; empty/malformed id → 4xx without touching the DB
- Assumption: Optimistic list update on 204 is acceptable; optional silent re-fetch not required if local remove matches GET
- Assumption: Confirm dialog is page-local markup matching design states; no new design dependency library
- Risk: Accidental delete without confirm; mitigation: UI blocks API until confirm (spec + design)
- Risk: Race deleting an id already removed (404); mitigation: show delete-missing alert; leave other notes
- Risk: Soft-delete or schema creep during build; mitigation: stop and re-classify with `database` before continuing

## Completion checklist

- [x] Scope matches approved spec (confirm + 204; hard delete; no migration).
- [x] Tests added/updated in `tests/notes.test.ts` (204, 404, invalid id).
- [x] Verification commands recorded.
- [x] Documentation: API contract + changelog (+ conventions reference).
- [ ] PR evidence prepared (agent-claimed; CI to corroborate).
- [x] `database` tag: n/a — none applied; no migration.
- [x] `api` tag: HTTP tests for `DELETE /api/notes/:id`.
- [x] `ui` tag: implements approved design/mockup states; tokens already precede components.
- [x] Size budget respected or justified against soft cap.

## Approval

- Decision: `approved`
- Approver: prishanf
- Date: 2026-07-28
- Notes: Spec and design already approved (confirm dialog + 204). Build may proceed.

## Agent instruction

Do not begin implementation until `Approval.decision` is `approved`. If build discovers schema, soft-delete, or UX must diverge from the approved design/API contract, stop and return to the appropriate gate.
