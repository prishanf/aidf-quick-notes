---
type: ui-qa-signoff
track: C
required_when: "the change carries the `ui` tag"
status: approved
owner: prishanf
created: 2026-07-28
updated: 2026-07-28
spec: docs/specs/001-create-and-list-notes.md
pull-request: https://github.com/prishanf/aidf-quick-notes/pull/1
---

# UI QA sign-off: Create and list notes

## Review target

- Preview URL: http://127.0.0.1:3000/ (local isolated Preview — not a public URL)
- Source revision: `23d419b` (`feat/001-create-and-list-notes`)
- Data/fixture profile: `preview-notes-v1` — synthetic local SQLite at `./data/preview-notes.sqlite` (no production data; no production credentials)
- Approved design: [docs/design/001-create-and-list-notes.md](../design/001-create-and-list-notes.md) · mockup reference: `docs/design/mockups/create-and-list-notes/` (`npm run mockup:serve`)

### How this Preview was started

```bash
export SQLITE_PATH=./data/preview-notes.sqlite
export NUXT_SQLITE_PATH=./data/preview-notes.sqlite
rm -f "$SQLITE_PATH" "$SQLITE_PATH"-*
npm run db:migrate
npm run dev -- --port 3000 --host 127.0.0.1
```

### Reset

Delete `./data/preview-notes.sqlite` (and `-wal`/`-shm` if present), re-run migrate, restart `npm run dev`. Starts empty again.

## Scenarios reviewed

- [x] Primary user flow — create a note with title + optional body; it appears at the top of the list
- [x] Empty state — fresh DB shows “No notes yet” with the create form available
- [x] Loading state — visible on first load (skeleton); hard to hold open on localhost (acceptable if briefly seen)
- [x] Success state — list shows title, body or —, timestamp
- [x] Validation error — submit empty title; field error appears; note is not created
- [x] Server error — stop the API/DB path or break `SQLITE_PATH` and confirm alert + “Try again” (optional if hard to force; otherwise mark gap)
- [x] Permission error — **N/A in live app** (no auth; illustrative only in design mockup per approved plan)
- [x] Responsive — narrow viewport (~base / &lt;40rem) and ~md; no sideways page scroll
- [x] Keyboard — tab through title, body, Save; focus ring visible
- [x] Matches approved design — composition, tokens, copy tone

## Findings

| Finding | Severity | Resolution / linked issue |
|---|---|---|
| none | — | — |

## Decision

- Result: `approved`
- Reviewer: Prishan Fernando
- Date: 2026-07-27
- Conditions / waiver expiry: none

## Agent instruction

Preview is the real implementation (this local app), not the throwaway design mockup. Scope-changing feedback returns to the spec. This sign-off is approved; merge to `develop` remains the host/maintainer action.
