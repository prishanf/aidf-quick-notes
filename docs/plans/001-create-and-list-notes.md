---
type: implementation-plan
track: C
required_when: "every Track B and Track C change"
status: approved
owner: prishanf
created: 2026-07-28
updated: 2026-07-28
spec: docs/specs/001-create-and-list-notes.md
issue: ""
branch: feat/001-create-and-list-notes
---

# Implementation plan: Create and list notes

## Goal and boundaries

Deliver create + list for notes on one page, backed by SQLite, matching the approved design mockup states. Non-goals: auth, edit, delete, Markdown, search, cloud hosting.

## Repository findings

| Area | Finding | Evidence |
|---|---|---|
| Existing behavior | Health API only; placeholder home UI; empty Drizzle schema | `server/api/health.get.ts`, `app/app.vue`, `server/database/schema.ts` |
| Integration point | Drizzle client ready; Nitro API under `server/api/`; tokens already landed | `server/database/client.ts`, `app/assets/css/tokens.css` |
| Test coverage | Health HTTP test via `@nuxt/test-utils` | `tests/health.test.ts` |
| Design authority | Approved mockup: form + list, 32-row density, all states | `docs/design/mockups/create-and-list-notes/` |

Classification unchanged: Track C · tags `ui`, `api`, `database`.

## Change map

| File or area | Change | Why |
|---|---|---|
| `server/database/schema.ts` | Add `notes` table | Schema source of truth |
| `server/database/migrations/*` | Generate 0001 migration | Versioned forward-only |
| `server/api/notes/index.get.ts` | Add list endpoint | `GET /api/notes` |
| `server/api/notes/index.post.ts` | Add create endpoint | `POST /api/notes` |
| `server/utils/notes.ts` (or inline) | Shared validation helpers | Trim/length rules |
| `app/pages/index.vue` (replace `app.vue` content) | Notes UI: form + list + states | Match approved design |
| `app/app.vue` | Minimal shell / `NuxtPage` | Enable pages routing |
| `docs/architecture/data-model.md` | Already drafted; keep in sync if schema tweaks | `database` tag |
| `docs/api/notes.md` | Already drafted; finalize with shapes | `api` tag |
| `docs/migrations/001-create-notes.md` | Already drafted | `database` tag |
| `tests/notes.test.ts` | HTTP tests for GET/POST + 400 | Endpoint coverage |
| `CHANGELOG.md` | Unreleased entry | Track C requirement |
| `docs/conventions.md` | Point reference impls at notes routes | Orientation for later features |

**UI structure (from approved mockup — not re-decided here):** single Notes screen with create form above list; empty/loading/error/validation states as in design doc.

## Sequence

1. Confirm token layer already present (`app/assets/css/tokens.css`) — **no new tokens**; wire UI with existing utilities only.
2. Implement Drizzle `notes` schema matching data model; `npm run db:generate` then review SQL; `npm run db:migrate` on fresh `data/`.
3. Add `GET`/`POST` `/api/notes` with server-side validation; return stable JSON field names (`createdAt` camelCase in JSON).
4. Add `tests/notes.test.ts` covering list, create success, and validation 400s (must fail against pre-change code).
5. Replace home UI with notes page implementing design states (empty, loading, success, validation-error, server-error). Permission-error state from mockup: show only if we keep a demo toggle — **default: omit live permission UI** because there is no auth; document as mockup-only illustrative state (matches spec’s real error states: empty/loading/validation/server).
6. Run manifest verification commands; update changelog and conventions; open PR to `develop`.

## Data and migration

- Data model document: `docs/architecture/data-model.md` — new (drafted with this plan)
- Entities and columns added: `notes(id, title, body, created_at, updated_at)` + `notes_created_at_idx`
- Migration files and order: `server/database/migrations/0001_*.sql` (generated at build)
- Expand/contract phase: expand only
- Backfill: none
- Backward compatibility: no prior readers of `notes`
- Rollback: revert app deploy; leave table inert or delete local sqlite file
- Seed profile for Preview: `preview-notes-v1` (optional synthetic)
- Classification and retention effects: internal developer notes; no PII class claimed
- Migration plan: `docs/migrations/001-create-notes.md`

## UI foundation

- Is this the project's **first** `ui` change? `yes`
- UI foundation document: `docs/design/ui-foundation.md` — created by design gate
- Foundation approval: approved on 2026-07-28
- Token layer: `app/assets/css/tokens.css` — already created during design; **must precede components** (already true)
- CSS framework: tailwind v4; theme wiring in token layer
- Approved design and mockup: `docs/design/001-create-and-list-notes.md`, `docs/design/mockups/create-and-list-notes/`
- Components: page-local only for Feature 1 (no shared component directory yet)
- New tokens this change adds to a scale: none
- Breakpoints and states to verify: base + `sm`; empty, loading, success, validation-error, server-error

## API surface

- API contract document: `docs/api/notes.md` — new
- Endpoints added: `GET /api/notes`, `POST /api/notes`
- Per endpoint HTTP tests: both → `tests/notes.test.ts`
- Authorization rules / denied path: n/a — no auth (documented in data model + contract)
- Cross-tenant isolation test: n/a — single-tenant local file

## Verification plan

- Unit/Integration: `npm test` (includes `tests/notes.test.ts` + health)
- Static: `npm run lint` · `npm run typecheck`
- Build: `npm run build`
- API coverage: `npm test` + `sh .aidf/reference/scripts/check-api-coverage.sh`
- Migration: `rm -f data/notes.sqlite && npm run db:migrate` then tests
- Accessibility/responsive: keyboard through form; narrow viewport; token contrast already measured
- Manual: `npm run dev` → create note → appears at top; empty DB shows empty state; force API error and confirm alert + retry

## Risks and assumptions

- Assumption: Nuxt file routing `server/api/notes/index.get.ts` maps to `GET /api/notes`
- Assumption: better-sqlite3 remains externalized in Nitro as configured
- Assumption: JSON uses camelCase timestamps; DB columns stay snake_case
- Assumption: Permission-error mockup state is illustrative only and is not a shipped UI path without auth
- Risk: empty Drizzle migrate with no journal edge cases; mitigation: generate migration in-repo and commit SQL
- Risk: `@nuxt/test-utils` DB file contention; mitigation: use temp `SQLITE_PATH` in tests

## Completion checklist

- [x] Scope matches approved spec.
- [x] Tests added (`tests/notes.test.ts`).
- [x] Verification commands recorded.
- [x] Documentation: data model, API contract, migration plan, changelog.
- [x] PR evidence prepared (agent-claimed; CI to corroborate).
- [x] `database` tag: data model + migration committed.
- [x] `api` tag: HTTP tests for both endpoints.
- [x] `ui` tag: implements approved design states; tokens already precede components.

## Approval

- Decision: `approved`
- Approver: prishanf
- Date: 2026-07-28
- Notes: Implementation may proceed on `feat/001-create-and-list-notes`.

## Agent instruction

Do not begin implementation until `Approval.decision` is `approved`. If build discovers the schema or UX must diverge from the approved design/data model, stop and return to the appropriate gate.
