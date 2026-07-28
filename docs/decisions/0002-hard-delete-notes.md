---
type: adr
track: C
required_when: "a decision is consequential, hard to reverse, or worth explaining later"
status: accepted
number: "0002"
date: 2026-07-28
decision-makers: [prishanf]
related:
  - docs/specs/002-delete-note.md
  - docs/api/notes.md
  - docs/architecture/data-model.md
  - docs/releases/v0.1.0.md
---

# ADR 0002: Hard-delete notes (no soft-delete)

## Context

Feature 2 needs a way to remove unwanted notes. Soft-delete (deleted_at / trash / undo) would change the schema (`database` tag) and expand UI scope. The approved spec chose irreversible hard delete to practice destructive mutation without a new migration.

## Decision

`DELETE /api/notes/:id` removes the row from `notes`. Success is `204 No Content`. Missing ids return `404`. There is no soft-delete column, trash, or undo in v0.1.0. The UI requires an explicit confirm dialog before calling delete.

## Options considered

| Option | Benefits | Costs / risks | Why not / why chosen |
|---|---|---|---|
| Hard delete | No schema change; simple API; clear irreversibility | Accidental permanent loss | **Chosen** per approved Feature 2 spec |
| Soft delete + trash | Recoverable mistakes | Migration, list filters, restore UI | Out of scope; revisit if users need undo |
| Archive flag | Recoverable without full trash UX | Still a schema change | Deferred with soft delete |

## Consequences

- Positive: Feature 2 stays off the `database` tag; rollback of mistaken deletes requires a prior SQLite file backup.
- Negative: Operators and users must treat delete as final.
- Follow-up: Operator runbook and release notes call out irreversibility; capture a DB file copy before production cuts that retain data.

## Revisit trigger

User demand for undo/trash, compliance retention rules, or audit of deletions.
