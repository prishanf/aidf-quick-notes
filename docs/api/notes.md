---
type: api-contract
track: C
required_when: "the change carries the `api` tag"
status: current
owner: prishanf
updated: 2026-07-28
service: aidf-quick-notes
release: docs/releases/v0.1.0.md
---

# API contract: Notes

## Purpose and consumers

Expose create, list, and delete for local notes. Consumer is the Nuxt UI on the same origin.

## Interface

- Contract source: this document + `server/api/notes/**/*.ts`
- Authentication: none
- Authorization: none (single local user) — any local caller can delete any note by id
- Request/response: JSON (except `DELETE` success: empty body)
- Errors: `{ statusCode, statusMessage, data? }` via h3 `createError`

## Behavior

- Pagination/limits: none; list returns all notes (expected ≤100)
- Idempotency/retries: `POST` creates a new row each call; `DELETE` of an already-removed id returns 404; clients should not retry blindly without user intent
- Rate limit: none (local)
- Versioning/deprecation: unversioned `/api`
- Audit/correlation: none
- Deletion: hard delete — irreversible; no soft-delete or undo

## NFR profile

| Concern | Target or explicit pending decision | Owner / review date |
|---|---|---|
| Latency | List p95 &lt; 200 ms for ≤100 notes locally | prishanf / 2026-07-28 |
| Availability | Local process only | prishanf |
| Capacity | ≤1000 notes | prishanf |
| Recovery | Recreate sqlite file | prishanf |
| Cost | n/a | — |

## Endpoint inventory

| Method | Path | Purpose | Auth required | Roles permitted | Object-level rule | Idempotent |
|---|---|---|---|---|---|---|
| `GET` | `/api/notes` | List notes newest-first | no | any local caller | all rows | yes |
| `POST` | `/api/notes` | Create a note | no | any local caller | n/a | no |
| `DELETE` | `/api/notes/:id` | Hard-delete one note by id | no | any local caller | any id | yes (repeat → 404) |

### `GET /api/notes`

**200** `{ notes: Array<{ id, title, body, createdAt, updatedAt }> }` ordered by `created_at` desc.

### `POST /api/notes`

**Request** `{ title: string, body?: string }`

**201** created note object.

**400** title missing/empty/too long, or body too long.

### `DELETE /api/notes/:id`

**204** empty body when a row was removed.

**400** missing or blank path id.

**404** no note with that id (may already have been deleted).

## Tests

| Endpoint | HTTP test file |
|---|---|
| `GET /api/notes` | `tests/notes.test.ts` |
| `POST /api/notes` | `tests/notes.test.ts` |
| `DELETE /api/notes/:id` | `tests/notes.test.ts` |

Authorization denied-path: n/a (no auth). Validation and not-found paths are required in the same file.
