---
type: feature-spec
track: B
required_when: "every Track B and Track C change"
status: approved
owner: prishanf
created: 2026-07-28
updated: 2026-07-28
issue: ""

classification:
  track: B
  risk: standard
  tags: [ui, api]
---

# Feature: Edit a note

## Problem

After Features 1–2, a visitor can create, list, and delete notes but cannot correct a typo or revise content without deleting and recreating. Mistakes force destructive cleanup, and `updatedAt` on the note DTO is never refreshed after insert.

## Desired outcome

A visitor can change the title and/or body of an existing note from the home-page list; the saved values appear in the UI and from `GET /api/notes`, with `updatedAt` advanced and clear feedback for success and failure.

## Users and scenarios

- **Primary user:** Local developer exercising AIDF (single user, no login).
- **Scenario:** Given the notes list shows at least one note, when they edit that note’s title and/or body and save, then the list shows the new content without a full-page reload failure and `GET /api/notes` returns the updated fields with a newer `updatedAt`.
- **Scenario:** Given they submit an invalid title (empty or >120 chars) or a body >5000 chars, when the API runs, then they get a 400 with a clear message and the UI surfaces the validation error without clearing unrelated notes.
- **Scenario:** Given they attempt to update a note id that does not exist, when the API runs, then they get a 404 with a clear message and the UI surfaces an error without mutating other notes.
- **Scenario:** Given the API or database fails mid-update, when they try again, then they see an error state and can retry; notes that were not updated remain as before.

## In scope

- Update one note’s `title` and/or `body` by id; bump `updated_at` on success; leave `created_at` unchanged.
- `PATCH /api/notes/:id` (Nuxt file route matching existing `server/api/notes/` patterns) accepting `{ title?: string, body?: string }` (both optional, at least one required) with the same validation rules as create (title 1–120 after trim; body optional, max 5000). Users can update title only, body only, or both.
- Edit control on each note in the home-page list (`app/pages/index.vue`), reusing Feature 1–2 tokens/states.
- Inline row edit UI on the same `/` page (no new app routes) — selected pattern: inline row edit, not modal.
- Loading / in-progress save, success (row shows new content), validation-error, server-error, and not-found feedback.
- Clickable static mockup extending the notes screen (required by `ui` tag).
- API contract update for the new endpoint (required by `api` tag); success response is `200` with the updated note object.
- HTTP tests for update success, validation 400, missing id 404, and path-id validation.

## Out of scope

- Schema migration or new columns (`updated_at` already exists).
- Soft-delete, undo, version history, or conflict detection (last write wins).
- Changing list sort order (remains `created_at` descending per Feature 1).
- Authentication, multi-user ownership, object-level authorization beyond “no auth” documentation.
- Markdown, attachments, tags, search, folders, bulk edit.
- Production hosting or cloud database.

## Acceptance criteria

- [ ] From the home page list, a user can edit one existing note’s title and/or body and save; after success, that note shows the new content in the list and in `GET /api/notes`, with `updatedAt` strictly later than before the save and `createdAt` unchanged.
- [ ] `PATCH /api/notes/:id` updates the matching row and returns `200` with the note object; unknown ids return 404 with a clear message.
- [ ] Invalid payloads (empty/oversized title, oversized body) return 400 with a clear message; UI surfaces the validation error.
- [ ] Edit in progress, validation-error, server-error, and not-found feedback are defined in the design mockup and implemented in the app.
- [ ] Invalid or missing path id is rejected with an appropriate 4xx response; UI does not silently alter unrelated notes.
- [ ] No Drizzle migration is required; if a schema change is introduced later, stop and add the `database` tag / re-classify to Track C.
- [ ] HTTP tests in `tests/notes.test.ts` (or sibling) cover update success, 400, and 404; API contract `docs/api/notes.md` lists the new endpoint.

## Why this classification

Track **B** and risk **standard**: observable create/update behavior with no migration, no auth/secrets/infra change, and reversible product outcome (user can edit again). Tags are `ui` (edit control and list feedback on the home page) and `api` (new `PATCH` endpoint and contract). The `database` tag is **not** applied: the `notes` table already has `title`, `body`, and `updated_at`; Feature 3 only writes existing columns. If a migration or query-shape change is approved instead, re-classify with `database` / Track C before planning.

## Constraints and risks

- Compatibility: Nuxt 4 local Node runtime; same SQLite file and Feature 1 note DTO (`id`, `title`, `body`, `createdAt`, `updatedAt`).
- Data/security: No auth — any local process that can reach the server can update any note by id. Acceptable for this example; document in the API contract. Last write wins; no optimistic locking.
- Performance: Single-row update by primary key; negligible at example scale (≤100 notes).
- Rollback: Revert the feature branch; previously edited rows keep their last written values (local/synthetic data only). Disable by not shipping the edit UI/route.

## Decisions made

- **Edit UI pattern:** Inline row edit (not modal). Fields replace the row during edit.
- **Partial updates:** PATCH accepts optional `title` and `body` (at least one required). Users can update title only, body only, or both — more flexible UX.

## Assumptions (low risk if wrong)

- Single page `/`; no new client routes beyond the API.
- List order stays newest-created-first; editing does not move a note to the top.
- Same title/body length rules as create.
- Hard delete (Feature 2) remains unchanged.

## Approval

- Decision: `approved`
- Approver: prishanf
- Date: 2026-07-28
- Notes: Open questions resolved; inline row edit with partial update support (title, body, or both)

## Agent instruction

Do not implement from this document until `Approval.decision` is `approved`. If an open question changes scope or safety, stop and ask it. If implementation reveals that the change touches schema, authorization, secrets, or production configuration beyond what is already classified, stop and re-classify before continuing.

**Design gate applies next** (`ui` tag): after this spec is approved, produce `docs/design/` materials including a clickable static mockup with mock data (extending the notes screen), served over HTTP via `npm run mockup:serve`. A mockup is the default deliverable — not prose alone — so layout, edit control placement, and error states can be judged before planning. Do not write an implementation plan until the design and mockup are approved. UI foundation already exists (`docs/design/ui-foundation.md`); extend it only if new tokens or components are required.
