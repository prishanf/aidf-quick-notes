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
  tags: [ui, api, database]
---

# Feature: Create and list notes

## Problem

Someone trying AIDF with this example needs a first real behavior change: persist a short note and see it again. Without create + list, there is nothing to hang later delete/edit features on, and no schema/API/UI path to exercise Track C gates.

## Desired outcome

A visitor can add a note with a title and body, then see all notes on one page newest-first, backed by SQLite.

## Users and scenarios

- **Primary user:** Local developer exercising AIDF (single user, no login).
- **Scenario:** Given the notes page is open, when they submit a valid title and optional body, then the note appears at the top of the list without a full-page reload failure.
- **Scenario:** Given no notes exist, when they open the page, then they see an empty state and a create form.
- **Scenario:** Given the API or database fails, when they load or submit, then they see an error state and can retry.

## In scope

- SQLite `notes` table via Drizzle migration (`id`, `title`, `body`, `created_at`, `updated_at`).
- `POST /api/notes` to create; `GET /api/notes` to list newest-first.
- One UI page: create form + list.
- Empty, loading, validation-error, and server-error states.
- UI foundation document + throwaway clickable mockup (required by `ui` tag).
- Data model document (required by `database` tag).
- HTTP tests covering both endpoints.

## Out of scope

- Authentication, multi-user ownership, sharing.
- Edit or delete (separate features).
- Markdown, attachments, tags, search, folders.
- Production hosting or cloud database.

## Acceptance criteria

- [ ] A note with a title of 1–120 characters can be created; body may be empty (max 5000 characters).
- [ ] `GET /api/notes` returns notes ordered by `created_at` descending.
- [ ] The home page shows the create form and the list; empty state appears when there are zero notes.
- [ ] Invalid create payloads return 400 with a clear message; UI surfaces the validation error.
- [ ] Loading and server-error states are defined in the design mockup and implemented in the app.
- [ ] Schema change is a versioned Drizzle migration; `docs/architecture/data-model.md` describes the table.
- [ ] HTTP tests exercise `POST /api/notes` and `GET /api/notes`.

## Why this classification

Track C because the change introduces a database schema (`database` tag). Tags `ui` and `api` apply because a user-facing page and HTTP endpoints are added. Risk is high under AIDF rules for schema changes even though the product itself is a toy notes app.

## Constraints and risks

- Compatibility: Nuxt 4 local Node runtime; SQLite file at `SQLITE_PATH`.
- Data/security: No auth — any local process that can reach the server can read/write notes. Acceptable for this example; document in data model.
- Performance: List should remain snappy for ≤100 notes (example scale).
- Rollback: Revert the feature branch; drop or leave the `notes` table inert. No production data expected at first ship.

## Open questions

- [x] Confirm single-page app (no separate routes beyond `/`) — assumed yes.
- [x] Title required, body optional — assumed yes.

## Approval

- Decision: `approved`
- Approver: prishanf
- Date: 2026-07-28
- Notes: Design gate next (UI foundation + clickable mockup), then plan, then build.

## Agent instruction

Do not implement from this document until `Approval.decision` is `approved`. If an open question changes scope or safety, stop and ask it. If implementation reveals that the change touches schema, authorization, secrets, or production configuration beyond what is already classified, stop and re-classify before continuing.

**Design gate applies next** (`ui` tag): after this spec is approved, produce `docs/design/` materials including a clickable static mockup with mock data, served over HTTP via `npm run mockup:serve`. Do not write an implementation plan until the design and mockup are approved.
