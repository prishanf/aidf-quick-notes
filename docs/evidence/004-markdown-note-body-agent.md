---
type: evidence
runner: agent
commit: b45490f
change: feat/004-markdown-note-body
recorded: 2026-07-28
ci_corroboration: https://github.com/prishanf/aidf-quick-notes/actions/runs/30428846804
---

# Agent-run verification (claimed — CI corroborated on PR #4)

`gates` job on PR #4 concluded success (run 30428846804); `project-checks` also passed (run 30428846797); `specialist-review` correctly skipped (no Track C tag).

Commands executed locally by the build agent on the tip of `feat/004-markdown-note-body` (`b45490f`).

| Command | Exit |
|---|---|
| `npm test` | 0 (3 files, 18 tests: 6 new in `tests/markdown.test.ts`, 12 unchanged in `tests/notes.test.ts`, 1 unchanged in `tests/health.test.ts`) |
| `npm run lint` | 0 |
| `npm run typecheck` | 0 |
| `npm run build` | 0 |
| `sh .aidf/reference/scripts/check-changelog.sh --track B --manifest ./project.yaml` | 0 |
| `sh .aidf/reference/scripts/validate-manifest.sh project.yaml` | 0 |

No `api` or `database` tag on this change, so `check-api-coverage.sh` and a migration check do not apply.

## New-test-fails-first check

`tests/markdown.test.ts` was run against pre-change code (with `app/utils/markdown.ts` temporarily removed) and failed with `Cannot find module '../app/utils/markdown'`. Restored, it passes (6/6).

## Manual verification (not covered by automation)

Run in the actual app (`npm run dev`), not just the design mockup:

- Created a note with headings, bold, italic, a link, a list, and a literal `<script>alert('unsafe')</script>` in the body → list shows it rendered as formatted HTML; the script tag appears as visible escaped text and did not execute (confirmed via console — no alert, no errors)
- Toggled Preview on the create form before saving → rendered output matched what the list showed after Save
- Opened Edit on the saved note, toggled Preview, clicked Save while Preview was showing → save succeeded ("Note updated.", timestamp advanced) — this specifically exercises reading from the reactive `editBody`/`editTitle` refs rather than a hidden DOM textarea
- Title never rendered as Markdown, in the list or either form

Not checked by a human yet: cross-browser rendering beyond the one browser used here; screen-reader announcement of the `aria-pressed` toggle state (implemented per the design, not independently verified with an assistive-technology tool).

CI corroboration: `gates` + `project-checks` passed on https://github.com/prishanf/aidf-quick-notes/pull/4 (run 30428846804).
