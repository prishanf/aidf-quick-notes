---
type: ui-qa-signoff
track: B
required_when: "the change carries the `ui` tag"
status: approved
owner: prishanf
created: 2026-07-29
updated: 2026-07-29
spec: docs/specs/004-markdown-note-body.md
pull-request: https://github.com/prishanf/aidf-quick-notes/pull/4
---

# UI QA sign-off: Markdown-formatted note body

## Review target

- Preview URL: http://localhost:3000/ (local isolated dev server, worktree `aidf-quick-notes-feat-004-markdown`)
- Source revision: `cfc5604` (`feat/004-markdown-note-body`) — post AI-review remediation (linkify/`data:` test coverage), pre the doc-only commits that followed
- Data/fixture profile: fresh local SQLite at `./data/notes.sqlite` in the worktree (no production data; no production credentials)
- Approved design: [docs/design/004-markdown-note-body.md](../design/004-markdown-note-body.md) · mockup reference: `docs/design/mockups/notes/` (`npm run mockup:serve`)
- Migration: none for Feature 4; Feature 1 `notes` schema via `npm run db:migrate`

### How this Preview was started

```bash
# From worktree: aidf-quick-notes-feat-004-markdown @ cfc5604
npm run db:migrate
npm run dev
```

### Reset

Delete `./data/notes.sqlite` (and `-wal`/`-shm` if present) in the worktree, re-run migrate, restart `npm run dev`. Starts empty again.

## Scenarios reviewed

- [x] Create form — Write/Preview toggle visible next to the Body label; Write is default
- [x] Rich Markdown body — heading, bold, italic, inline code, list, link, blockquote, and a literal `<script>` tag typed into a real note → Preview renders formatted HTML matching the approved mockup
- [x] Script tag never executes — no `alert()`, no console error, tag appears as visible escaped text in both Preview and the saved list row
- [x] Save from the create form — note appears at the top of the list, rendered; form resets to empty/Write
- [x] Edit an existing note — inline form pre-fills raw Markdown source in Write mode
- [x] Edit form Preview toggle — renders the note's current body identically to the list
- [x] Save while Preview is showing (both create and edit) — succeeds; edit form specifically shows "Note updated." with `updatedAt` advanced, confirming Save reads from the reactive refs rather than a hidden textarea
- [x] Title never rendered as Markdown — typed Markdown syntax in a title displays literally, in the list and both forms
- [x] Cancel on the edit form — reverts without saving (unchanged from Feature 3)
- [x] Delete still works with confirm (unchanged from Feature 2/3)
- [x] Responsive — narrow viewport and `sm`+; no sideways scroll outside code blocks
- [x] Matches approved design — composition, tokens, copy tone, empty-preview message wording

## Findings

None outstanding. One finding surfaced during AI code review (missing automated regression coverage for `linkify`-autolinked unsafe-scheme strings and `data:`-URI links) was fixed pre-merge (`cfc5604`) and is recorded in `docs/reviews/004-markdown-note-body.md`, not repeated here since it was a test-coverage gap, not a UI behavior defect — the rendered behavior was already correct when checked in this Preview.

## Decision

- Result: `approved`
- Reviewer: Prishan Fernando
- Date: 2026-07-29
- Conditions / waiver expiry: none

## Agent instruction

Preview is the real implementation (this local app), not the throwaway design mockup. Scope-changing feedback returns to the spec. This sign-off is approved; PR #4 already merged to `develop` with AI review's ready-for-human comment posted and human PR approval given separately.
