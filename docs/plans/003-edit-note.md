---
type: implementation-plan
track: B
required_when: "every Track B and Track C change"
status: approved
owner: prishanf
created: 2026-07-28
updated: 2026-07-28
spec: docs/specs/003-edit-note.md
issue: ""
branch: feat/003-edit-note
---

# Implementation plan: Edit a note

## Goal and boundaries

Deliver inline edit of one note from the home-page list: row becomes a title/body form, `PATCH /api/notes/:id` with partial updates → `200` updated note / `400` / `404`, list refresh of that row’s content and `updatedAt`, and HTTP coverage. Non-goals: migration, soft-delete/undo, auth, changing list sort order, bulk edit, new app routes.

## Repository findings

| Area | Finding | Evidence |
|---|---|---|
| Existing behavior | Create, list, delete on one page; `GET`/`POST` `/api/notes`; `DELETE /api/notes/:id`; no update route or Edit UI | `app/pages/index.vue`, `server/api/notes/` |
| Integration point | Nuxt dynamic file route under `server/api/notes/`; shared validators/DTO; page-local UI | `server/utils/notes.ts`, `[id].delete.ts`, `docs/conventions.md` |
| Test coverage | HTTP tests for list/create/delete via `@nuxt/test-utils` | `tests/notes.test.ts` |
| Data model | `updated_at` already on `notes`; Feature 3 anticipated without schema change | `docs/architecture/data-model.md` |
| Design authority | Approved mockup: Edit per row → inline form → Saving… → updated row; validation / save-error / not-found | `docs/design/003-edit-note.md`, `docs/design/mockups/edit-note/` |
| UI timestamp | Product list currently shows `createdAt` only; mockup shows `updated_at` | `app/pages/index.vue` vs mockup `notes.js` |
| Size budget | Soft cap 400 changed lines (`project.yaml`); keep PR focused | `gates.pr_size_soft_cap_lines: 400` |

Classification unchanged: Track B · tags `ui`, `api` (no `database`). Repository does not contradict that (no migration needed).

**Design doc note:** Mermaid edge for 500 says “row reverts to view”; States table + mockup README say stay in edit with input preserved. **Build follows States table + mockup** (save error → stay in edit).

## Change map

| File or area | Change | Why |
|---|---|---|
| `server/utils/notes.ts` | Add `validatePatchNote` (at least one of `title`/`body`; same length rules as create when present) | Partial PATCH validation shared by route |
| `server/api/notes/[id].patch.ts` | Add patch handler | `PATCH /api/notes/:id` → 200 / 400 / 404 |
| `app/pages/index.vue` | Edit control, inline row form, save/cancel, edit error alerts; show `updatedAt` on rows (per mockup); keep Delete | Match approved design |
| `docs/api/notes.md` | Add `PATCH` endpoint + tests row; document partial body + no-auth | `api` tag contract |
| `tests/notes.test.ts` | HTTP: 200 title-only, body-only, both; `updatedAt` advances / `createdAt` stable; 400 empty/invalid; 404; blank id 400 | Endpoint coverage |
| `CHANGELOG.md` | Unreleased entry for edit | Track B requirement |
| `docs/conventions.md` | Point patch route at `[id].patch.ts`; note edit states on home page | Orientation |
| `docs/architecture/data-model.md` | Light touch: `updated_at` now maintained on edit; auth mapping includes update | Reflect Feature 3 writes (no migration) |
| `docs/design/mockups/edit-note/` | Leave in place | Design/QA reference; not product code |

**UI structure (from approved mockup — not re-decided here):** Notes list with **Edit** + Delete on each row → click Edit → row becomes inline form (pre-filled title + body, Save + Cancel) → Saving… → view mode with new content and updated timestamp; validation errors stay inline; save-error alert keeps row in edit; 404 alert reverts that row to view; Escape cancels when not saving.

**No schema / migration files.** New columns would stop build and force re-classification with `database`.

## Sequence

1. Confirm token layer unchanged (`app/assets/css/tokens.css`); implement UI with existing primary / danger / focus tokens only — **no new tokens**.
2. Add `validatePatchNote` in `server/utils/notes.ts`: reject non-object; require at least one of `title` or `body`; when `title` present apply create title rules; when `body` present apply create body rules; omit means leave column unchanged.
3. Add `server/api/notes/[id].patch.ts`: `validateNoteId`; load/update with Drizzle; set only provided fields + `updatedAt = now`; `404` if zero rows; return `200` + `toNoteDto`.
4. Extend `tests/notes.test.ts` with create-then-patch cases (both fields, title-only, body-only), assert `createdAt` unchanged and `updatedAt` newer, validation 400s (neither field, empty title, oversized body), unknown id 404, blank id 400. New cases must fail against pre-change code.
5. Update `docs/api/notes.md` for `PATCH` (partial JSON; 200 note; 400; 404; no auth).
6. Extend `app/pages/index.vue`: per-row Edit → inline form (page-local, do **not** copy mockup markup) → `PATCH` with changed fields (UI may send both form values when both edited; sending only changed keys is also fine); cancel / Escape; save-error stays in edit; 404 dismisses edit mode; display `updatedAt` in the row timestamp; only one row in edit at a time.
7. Changelog + conventions + data-model light update; run manifest verification; open PR to `develop` after build (when this plan is approved).

## Data and migration

Update of existing `notes` columns only — **no** `database` tag, **no** migration.

- Data model document: `docs/architecture/data-model.md` — **light update** (`updated_at` maintained on Feature 3 edit; write scope includes update)
- Entities and columns added, altered, or removed: none (writes to existing `title`, `body`, `updated_at`)
- Migration files and order: none
- Expand/contract phase: none
- Backfill: none
- Backward compatibility: older app without edit UI still reads/writes the same schema; new route is additive
- Rollback: revert the feature branch / deploy; previously edited rows keep last written values (local/synthetic data)
- Seed profile for Preview: none required for schema; existing synthetic notes suffice
- Classification and retention effects: none — same internal developer notes
- Migration plan: none — not applicable without `database` tag

## UI foundation

- Is this the project's **first** `ui` change? `no`
- UI foundation document: `docs/design/ui-foundation.md` — extended by design gate (inventory only)
- Foundation approval: approved on 2026-07-28 (Feature 1); Feature 2–3 inventory extensions already noted in design docs
- Token layer: `app/assets/css/tokens.css` — unchanged
- CSS framework: tailwind v4; theme wiring in token layer
- Approved design and mockup: `docs/design/003-edit-note.md`, `docs/design/mockups/edit-note/`
- Components: page-local in `app/pages/index.vue` (Edit control, inline edit form, Save/Cancel) — no shared component directory required; mockup is throwaway
- New tokens this change adds to a scale: none
- Breakpoints and states to verify: base + `sm`; view with Edit+Delete; inline edit; validation-error; saving; save success; save-error (stay in edit); not-found; empty/loading/list-error unchanged; keyboard Escape cancel; focus to title on enter edit

## API surface

- API contract document: `docs/api/notes.md` — updated
- Endpoints added: `PATCH /api/notes/:id`
- Endpoints unchanged: `GET /api/notes`, `POST /api/notes`, `DELETE /api/notes/:id`
- Per endpoint HTTP tests:
  - `PATCH /api/notes/:id` → `tests/notes.test.ts`
  - Existing GET/POST/DELETE remain in `tests/notes.test.ts`
- Authorization rules / denied path: n/a — no auth (document in contract; any local caller can update by id)
- Cross-tenant isolation test: n/a — single-tenant local file

## Verification plan

- Unit/Integration: `npm test` (includes new patch cases in `tests/notes.test.ts`)
- Static: `npm run lint` · `npm run typecheck`
- Build: `npm run build`
- Format: `npm run format` if touched files need it
- API coverage: `npm test` + `sh .aidf/reference/scripts/check-api-coverage.sh`
- Migration: none (no schema change)
- Accessibility/responsive: keyboard Edit → focus title; tab through fields/Save/Cancel; Escape cancel when idle; narrow viewport full-width row form; `aria-invalid` + alerts for errors; live region for “Note updated.”
- Manual: `npm run dev` then walk through:
  - [ ] Create a note
  - [ ] Click Edit on that note → row transforms to inline form (title and body pre-filled)
  - [ ] Change title and/or body → Save
  - [ ] Row reverts to view mode; timestamp shows new `updatedAt`; list order unchanged (still newest-first by `createdAt`)
  - [ ] Edit again → Change title → Save (title-only partial update)
  - [ ] Edit again → Change body only → Save (body-only partial update)
  - [ ] Click Edit → Clear title field → Save → Validation error appears inline (red border, message)
  - [ ] Correct title → Save → Row updates successfully
  - [ ] Edit → Cancel → Row reverts to view without saving
  - [ ] Test via mock: navigate to `docs/design/mockups/edit-note/notes.html?state=save-error` → confirm alert; edit row should be in edit mode with input preserved
  - [ ] Test via mock: `?state=not-found` → confirm alert reverts row to view
  - [ ] Verify Delete still works (no regression)
  - Optional: `npm run mockup:serve` and compare visual flow to design reference
- Size: keep diff near soft cap (~400 lines); stop and split if materially over without justification

## Risks and assumptions

- Assumption: Nuxt file routing `server/api/notes/[id].patch.ts` maps to `PATCH /api/notes/:id`
- Assumption: Partial body means omit = leave unchanged; empty object / neither field → 400; sending both form fields from the UI is valid
- Assumption: Path `id` reuses `validateNoteId`; blank → 400 without DB write
- Assumption: Optimistic local replace of the patched note on 200 is acceptable; list order stays `created_at` desc
- Assumption: Only one row editable at a time; opening Edit on another cancels the first without saving
- Assumption: Design States table + mockup override the mermaid 500→revert edge
- Risk: Accidental overwrite with no confirm; mitigation: Cancel/Escape + last-write-wins accepted for local single-user
- Risk: Race updating an id already deleted (404); mitigation: not-found alert; revert that row; leave others
- Risk: Schema creep during build; mitigation: stop and re-classify with `database` before continuing

## Completion checklist

- [x] Scope matches approved spec (inline edit + partial PATCH; no migration).
- [x] Tests added/updated in `tests/notes.test.ts` (200 partial paths, 400, 404, invalid id).
- [x] Verification commands recorded.
- [x] Documentation: API contract + changelog (+ conventions + data-model light touch).
- [x] PR evidence prepared (agent-claimed; CI to corroborate).
- [x] `database` tag: n/a — none applied; no migration.
- [x] `api` tag: HTTP tests for `PATCH /api/notes/:id`.
- [x] `ui` tag: implements approved design/mockup states; tokens already precede components.
- [x] Size budget respected or justified against soft cap.

## Approval

- Decision: `approved`
- Approver: prishanf
- Date: 2026-07-28
- Notes: Spec and design already approved (inline edit + partial PATCH). Build may proceed.

## Agent instruction

Do not begin implementation until `Approval.decision` is `approved`. If build discovers schema needs, or UX must diverge from the approved design/API contract, stop and return to the appropriate gate.
