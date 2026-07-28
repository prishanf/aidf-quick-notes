---
type: feature-spec
track: C
required_when: "every Track B and Track C change"
status: approved
owner: prishanf
created: 2026-07-28
updated: 2026-07-28
issue: ""

classification:
  track: C
  risk: high
  tags: [ui, api]
---

# Feature: Delete a note

## Problem

After Feature 1, a visitor can create and list notes but cannot remove a mistaken or unwanted note. Without delete, the list only grows, and later edit work has no cleanup path to practice AIDF’s destructive-mutation gates.

## Desired outcome

A visitor can remove one note from the home-page list; that note is gone from the UI and from SQLite, with clear feedback for success and failure.

## Users and scenarios

- **Primary user:** Local developer exercising AIDF (single user, no login).
- **Scenario:** Given the notes list shows at least one note, when they delete that note and confirm the action, then the note disappears from the list without a full-page reload failure and is no longer returned by `GET /api/notes`.
- **Scenario:** Given they attempt to delete a note id that does not exist, when the API runs, then they get a 404 with a clear message and the UI surfaces an error without removing other notes.
- **Scenario:** Given the API or database fails mid-delete, when they try again, then they see an error state and can retry; notes that were not deleted remain listed.

## In scope

- Hard-delete one note by id (row removed from `notes`; no soft-delete column).
- `DELETE /api/notes/:id` (Nuxt file route matching existing `server/api/notes/` patterns).
- Delete control on each note in the home-page list (`app/pages/index.vue`), reusing Feature 1 tokens/states.
- Explicit confirmation before the destructive request.
- Empty state after the last note is deleted (same empty panel as Feature 1).
- Loading / in-progress delete, success (note gone), and server-error / not-found feedback.
- Clickable static mockup extending the Feature 1 notes screen (required by `ui` tag).
- API contract update for the new endpoint (required by `api` tag); success response is `204 No Content`.
- HTTP tests for delete success, missing id (404), and any validation of the id path param.

## Out of scope

- Edit / update note content (Feature 3).
- Authentication, multi-user ownership, object-level authorization beyond “no auth” documentation.
- Soft-delete, trash, undo, or archive.
- Bulk delete, multi-select, or delete-all.
- Schema migration or new columns (unless an open question forces re-classification).
- Markdown, attachments, tags, search, folders.
- Production hosting or cloud database.

## Acceptance criteria

- [ ] From the home page list, a user can delete one existing note after confirming; after success, that note is absent from the list and from `GET /api/notes`.
- [ ] `DELETE /api/notes/:id` removes the matching row and returns `204 No Content`; unknown ids return 404 with a clear message.
- [ ] Deleting the last remaining note leaves the Feature 1 empty state visible (create form still available).
- [ ] Delete in progress, server-error, and not-found/error feedback are defined in the design mockup and implemented in the app.
- [ ] Invalid or missing path id is rejected with an appropriate 4xx response; UI does not silently drop unrelated notes.
- [ ] No Drizzle migration is required for hard delete of existing rows; if a schema change is introduced later, stop and add the `database` tag / re-classify.
- [ ] HTTP tests in `tests/notes.test.ts` (or sibling) cover delete success and 404; API contract `docs/api/notes.md` lists the new endpoint.

## Why this classification

Track **C** and risk **high** because hard delete is an irreversible persistence mutation: once the row is gone, there is no in-product recovery. Tags are `ui` (delete control and list/empty-state behavior on the home page) and `api` (new `DELETE` endpoint and contract). The `database` tag is **not** applied: there is no migration, no new columns, and no change to the `notes` table shape — Feature 1’s data model already records hard delete as the Feature 2 mechanism. If soft-delete or other schema work is approved instead, re-classify with `database` before planning.

## Constraints and risks

- Compatibility: Nuxt 4 local Node runtime; same SQLite file and Feature 1 note DTO (`id`, `title`, `body`, `createdAt`, `updatedAt`).
- Data/security: No auth — any local process that can reach the server can delete any note by id. Acceptable for this example; document in the API contract. Hard delete cannot be rolled back via the app.
- Performance: Single-row delete by primary key; negligible at example scale (≤100 notes).
- Rollback: Revert the feature branch; deleted rows are not restored (local/synthetic data only). Disable by not shipping the delete UI/route.

## Open questions

- [x] Should delete require an explicit confirmation step before calling the API? — **Yes**, confirm to avoid accidental deletion.
- [x] Prefer `204 No Content` vs a small JSON success body? — **`204 No Content`** on success.

## Assumptions (low risk if wrong)

- Hard delete only (matches data model and out-of-scope soft-delete).
- Same single page `/`; no new routes beyond the API.
- Delete control lives on each list row; no separate detail page.

## Approval

- Decision: `approved`
- Approver: prishanf
- Date: 2026-07-28
- Notes: Design gate next (`ui` tag) — clickable static mockup with mock data, then plan, then build.

## Agent instruction

Do not implement from this document until `Approval.decision` is `approved`. If an open question changes scope or safety, stop and ask it. If implementation reveals that the change touches schema, authorization, secrets, or production configuration beyond what is already classified, stop and re-classify before continuing.

**Design gate applies next** (`ui` tag): after this spec is approved, produce `docs/design/` materials including a clickable static mockup with mock data (extending the Feature 1 notes screen), served over HTTP via `npm run mockup:serve`. A mockup is the default deliverable — not prose alone — so layout, delete control placement, confirmation, and error states can be judged before planning. Do not write an implementation plan until the design and mockup are approved. UI foundation already exists from Feature 1 (`docs/design/ui-foundation.md`); extend it only if new tokens or components are required.
