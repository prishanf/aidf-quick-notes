---
type: ui-qa-signoff
track: B
required_when: "the change carries the `ui` tag"
status: pending
owner: prishanf
created: 2026-07-28
updated: 2026-07-28
spec: docs/specs/003-edit-note.md
pull-request: https://github.com/prishanf/aidf-quick-notes/pull/3
---

# UI QA sign-off: Edit a note

## Review target

- Preview URL: http://127.0.0.1:3001/ (local isolated Preview — not a public URL; port 3001 avoids the existing develop server on 3000)
- Source revision: `371a7ba` (`feat/003-edit-note`) — includes concurrent-delete Save fix
- Data/fixture profile: `preview-edit-notes-v1` — synthetic local SQLite at `./data/preview-edit-notes.sqlite` (no production data; no production credentials)
- Approved design: [docs/design/003-edit-note.md](../design/003-edit-note.md) · mockup reference: `docs/design/mockups/edit-note/` (`npm run mockup:serve`)
- Migration: none for Feature 3; Feature 1 `notes` schema via `npm run db:migrate`

### How this Preview was started

```bash
# From worktree: aidf-quick-notes-feat-003-edit @ 371a7ba
export SQLITE_PATH=./data/preview-edit-notes.sqlite
export NUXT_SQLITE_PATH=./data/preview-edit-notes.sqlite
rm -f "$SQLITE_PATH" "$SQLITE_PATH"-*
npm run db:migrate
npm run dev -- --port 3001 --host 127.0.0.1
```

### Reset

Delete `./data/preview-edit-notes.sqlite` (and `-wal`/`-shm` if present), re-run migrate, restart `npm run dev`. Starts empty again.

## Scenarios reviewed

Agent smoke (not a substitute for human QA decision):

- [x] Empty state — fresh DB shows “No notes yet” with create form
- [x] Primary edit flow — create note → Edit → change title/body → Save → “Note updated.”; row shows new content + `updatedAt`
- [x] Inline edit form — row transforms; title/body pre-filled; Save + Cancel visible; focus on title
- [x] Validation error — empty/whitespace title → inline alert “Enter a title between 1 and 120 characters.”; form stays open
- [x] Not-found (404) after concurrent delete — Edit open → delete in other window/API → Save → “Could not update” / not-found alert (fixed in `371a7ba`)
- [ ] Cancel / Escape discards edit without saving — **human to confirm**
- [ ] Save in progress (“Saving…”) — brief on localhost; **human to confirm if seen**
- [ ] Save server error (stay in edit) — **human optional** (hard to force)
- [ ] Loading / list-error states — **human optional**
- [ ] Delete still works with confirm after edit controls — **human to confirm**
- [ ] Responsive — narrow viewport (~base) and `sm`+; no sideways scroll — **human to confirm**
- [ ] Keyboard — tab Edit → fields → Save/Cancel; Escape cancels; focus ring visible — **human to confirm**
- [ ] Matches approved design — composition, tokens, copy tone — **human to confirm** (compare mockup)

## Findings

| Finding | Severity | Resolution / linked issue |
|---|---|---|
| Saving an inline edit after the note was deleted in another window showed no error (unchanged form skipped PATCH) | P1 | Fixed in `371a7ba`: always PATCH both form fields on Save; show not-found alert on 404 |

## Decision

- Result: `pending`
- Reviewer:
- Date:
- Conditions / waiver expiry: Re-verify concurrent-delete-then-Save shows “Could not update” / not-found before approving

## Agent instruction

Preview is the real implementation (this local app), not the throwaway design mockup. Scope-changing feedback returns to the spec. **Human QA must set Decision to `approved` (or `changes-requested`) before merge.** AI review (`review`) remains a separate gate on the PR.
