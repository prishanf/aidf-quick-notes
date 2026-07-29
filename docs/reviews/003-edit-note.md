---
type: code-review
track: B
status: ready-for-human
owner: ai-review
created: 2026-07-28
updated: 2026-07-28
pr: https://github.com/prishanf/aidf-quick-notes/pull/3
spec: docs/specs/003-edit-note.md
plan: docs/plans/003-edit-note.md
---

# Code review: Edit a note

## Scope checked

- Diff `origin/develop...feat/003-edit-note` (tip `90af53e`)
- Spec acceptance criteria (inline edit + partial `PATCH`; no migration)
- Approved design/mockup states vs `app/pages/index.vue`
- API contract vs `server/api/notes/[id].patch.ts`, `validatePatchNote`, `tests/notes.test.ts`
- Preview finding (concurrent delete → silent Save) and fix `371a7ba`
- UI QA sign-off approved (`docs/qa/003-edit-note-ui-signoff.md`)
- Evidence artifact + CI corroboration (`gates` / `project-checks` green on PR #3)

## Findings

### P2 — Cancel disabled while save is in progress

- Location: `app/pages/index.vue` (inline edit Save/Cancel; `cancelEdit` early-return when `savingEdit`)
- Evidence: Approved design States table says Cancel remains enabled during “Saving…”. Implementation disables Cancel and blocks Escape/cancel while `savingEdit` is true.
- Impact: Minor design fidelity gap; user cannot abandon an in-flight save (rare on localhost).
- Suggested direction: Accept as follow-up, or align Cancel/Escape with design if product wants abort-during-save.
- Host comment: pending (accepted follow-up)

### P3 — Soft-cap exceeded mainly by throwaway mockup + AIDF docs

- Location: `docs/design/mockups/edit-note/` (majority of PR lines)
- Evidence: Soft cap ~400; product/API/test surface is bounded.
- Impact: Review noise; justified by `ui` tag requiring a clickable mockup.
- Suggested direction: Accept for this track; keep mockups out of product review focus.
- Host comment: pending (accepted follow-up)

### P3 — Agent evidence front matter still said `ci_corroboration: pending`

- Location: `docs/evidence/003-edit-note-agent.md`
- Evidence: CI `gates` succeeded on tip `90af53e` (run 30423466968) while the durable evidence file had not yet recorded the URL.
- Impact: Documentation lag only; gates were already green. Updated in this review commit.
- Suggested direction: Keep evidence tip current after each push that CI re-runs.
- Host comment: pending (accepted / fixed in review docs commit)

## What looks solid

- `PATCH` updates only provided columns + `updatedAt`; `createdAt` unchanged; 404 when zero rows returned
- `validatePatchNote` requires ≥1 field; enforces title/body rules; empty `{}` → 400
- HTTP tests cover both fields, title-only, body-only, empty/invalid 400, 404, blank id 400 — would fail pre-change
- UI: inline row edit, Escape cancel, Edit+Delete coexistence, always PATCH both form fields so concurrent delete surfaces not-found (`371a7ba`)
- List still ordered by create-time; row timestamp shows `updatedAt`
- No schema/migration (`database` tag correctly absent)
- Changelog under `[Unreleased]`; API contract lists `PATCH`
- CI `gates` + `project-checks` passed; UI QA approved

## Decision

`ready-for-human` — no open P0/P1. AI review does **not** satisfy human PR approval.

## Next action

Human review may begin on https://github.com/prishanf/aidf-quick-notes/pull/3
