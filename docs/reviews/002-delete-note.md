---
type: code-review
track: C
status: ready-for-human
owner: ai-review
created: 2026-07-28
updated: 2026-07-28
pr: https://github.com/prishanf/aidf-quick-notes/pull/2
spec: docs/specs/002-delete-note.md
plan: docs/plans/002-delete-note.md
---

# Code review: Delete a note

## Scope checked

- Diff `develop...feat/002-delete-note`
- Spec acceptance criteria (confirm + 204 hard delete; no migration)
- Approved design/mockup states vs `app/pages/index.vue`
- API contract vs `server/api/notes/[id].delete.ts` and `tests/notes.test.ts`
- Evidence artifact + CI corroboration (`gates` / `project-checks` green on PR #2)

## Findings

### P2 — Confirm dialog has no full focus trap

- Location: `app/pages/index.vue` (confirm dialog)
- Evidence: Cancel receives initial focus and Escape dismisses when idle, but Tab is not constrained to the dialog.
- Impact: Keyboard users can tab behind the modal while it is open.
- Suggested direction: Optional follow-up — trap Tab within dialog or use a small accessible dialog helper.
- Host comment: pending (accepted follow-up)

### P3 — Large diff mostly throwaway mockup + AIDF docs

- Location: `docs/design/mockups/delete-note/` (~majority of +1818 lines)
- Evidence: Soft cap is 400 lines; product/API/test surface is small.
- Impact: Review noise; justified by `ui` tag requiring a clickable mockup.
- Suggested direction: Accept for this track; keep mockups out of product review focus.
- Host comment: pending (accepted follow-up)

## What looks solid

- `DELETE` hard-deletes by primary key; `returning` drives 404 vs 204; `return null` → h3 `sendNoContent`
- HTTP tests cover 204 (absent from GET), 404 unknown id, 400 blank id (`%20`) — would fail pre-change
- UI requires confirm before DELETE; deleting state disables Cancel/Delete; delete-error alert leaves other notes
- Empty state after last delete reuses Feature 1 panel
- No schema/migration (`database` tag correctly absent)
- `check-api-coverage` 4/4; CI `gates` and `project-checks` passed

## Decision

`ready-for-human` — no open P0/P1. AI review does **not** satisfy human PR approval.

## Next action

Human review may begin on https://github.com/prishanf/aidf-quick-notes/pull/2
