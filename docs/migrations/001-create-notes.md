---
type: migration-plan
track: C
required_when: "the change carries the `database` tag"
status: draft
owner: prishanf
created: 2026-07-28
updated: 2026-07-28
issue: ""
spec: docs/specs/001-create-and-list-notes.md
---

# Migration plan: Create notes table

## Change summary

Add the first persistent table `notes` with columns `id`, `title`, `body`, `created_at`, `updated_at`, and an index on `created_at` for newest-first listing.

## Migration artifacts

| Order | Path | Type | Forward-compatible? |
|---|---|---|---|
| 1 | `server/database/migrations/0000_parched_leo.sql` | Drizzle SQL | yes (additive) |

## Compatibility sequence

1. Expand: create `notes` table + index (no existing writers)
2. Deploy: Feature 1 API/UI begins using the table
3. Backfill: none
4. Contract: none

## Seed profile

- Profile name: `preview-notes-v1`
- Baseline: `synthetic`
- Data owner: prishanf · Retention: local only · Access: developer
- Seed command: optional script or manual inserts for Preview; `npm run db:migrate` for schema
- Teardown/reset: delete `data/notes.sqlite` and re-run migrate

| Persona / entity | Scenario | Identifiers / credentials | Reset behavior |
|---|---|---|---|
| local developer | empty DB then create notes via UI | none | delete sqlite file |

Guardrails:

- [x] No production credentials are seeded.
- [x] Synthetic identities are visibly distinguishable from real ones.
- [x] Production execution is blocked (local example only).

## Preview validation

- Baseline/state source: fresh SQLite file
- Apply command: `npm run db:migrate`
- Verification: table exists; `GET/POST /api/notes` succeed; HTTP tests green

## Production execution

- Recovery point: none required for first local ship; retain prior sqlite file copy if any
- Forward-only: do not edit released migration SQL; add a new migration to change shape

## Approval

Tied to Feature 1 implementation plan approval.
