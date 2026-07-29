---
type: code-review
track: B
status: request-changes
owner: ai-review
created: 2026-07-28
updated: 2026-07-28
pr: https://github.com/prishanf/aidf-quick-notes/pull/4
spec: docs/specs/004-markdown-note-body.md
plan: docs/plans/004-markdown-note-body.md
---

# Code review: Markdown-formatted note body

## Scope checked

- Diff `develop...feat/004-markdown-note-body` (tip `48a4606`) — read via `gh pr diff 4`, not the PR description
- Spec acceptance criteria (safe CommonMark subset; raw HTML escaped; unsafe-scheme links never clickable; no schema/API change)
- Approved design/mockup states vs `app/pages/index.vue` (list rendering, create-form and edit-form Write/Preview toggle)
- `app/utils/markdown.ts` renderer configuration vs the security claim in "Why this classification" (spec) that keeps this off Track C
- `tests/markdown.test.ts` — read the assertions, not just the pass/fail count
- Evidence artifact + CI corroboration (`gates` / `project-checks` green on PR #4, run 30428846804)
- Independent verification beyond the committed tests (see Findings)

## Findings

### P1 — Safety guarantee is verified manually but not regression-tested for two vectors the test suite doesn't cover

- Location: `tests/markdown.test.ts` (existing coverage), `app/utils/markdown.ts:5-9` (`linkify: true`)
- Evidence: The entire justification for keeping this change off Track C (spec's "Why this classification") rests on unsafe content never becoming live HTML or a clickable link. The committed tests cover raw HTML escaping and a `javascript:` URL written as `[text](url)` Markdown syntax. They do **not** cover:
  1. `linkify: true` auto-detecting a *bare* unsafe-scheme string (no Markdown link syntax) and turning it into a clickable anchor.
  2. A `data:` URI written as `[text](data:...)`, which is a distinct scheme from `javascript:` and not implied by the existing test.
  I ran both independently against the actual installed `markdown-it@14.3.0` (not the committed test file):
  ```
  md.render('Visit javascript:alert(1) now, or plain http://evil.com/x')
  → <p>Visit javascript:alert(1) now, or plain <a href="http://evil.com/x">http://evil.com/x</a></p>
  md.render('[x](data:text/html,<script>alert(1)</script>)')
  → <p>[x](data:text/html,&lt;script&gt;alert(1)&lt;/script&gt;)</p>
  ```
  Current behavior is safe on both counts — but nothing in the committed test suite would catch a regression if a future `markdown-it` upgrade or option change silently altered `linkify`'s scheme whitelist or `validateLink`'s data:-URI handling.
- Impact: The specific claim this PR uses to justify staying off Track C is currently under-protected by automated tests. Not exploitable today, but a real regression-coverage gap for a security-relevant guarantee.
- Suggested direction: Add two cases to `tests/markdown.test.ts`: (a) a bare unsafe-scheme string relying on `linkify` autodetection is not rendered as an anchor; (b) a `data:` URI via Markdown link syntax is not rendered as an anchor. Mirror the assertion style already used for the `javascript:` case.
- Host comment: pending

## What looks solid

- `html: false` verified to escape a real `<script>` tag both in a unit test and manually in the running app (no execution, no console error)
- `renderMarkdown` is a pure function, SSR-safe, correctly Nuxt-auto-imported from `app/utils/`
- `title` is never passed through the renderer anywhere in the diff
- No schema, migration, or API contract change; `tests/notes.test.ts` (12 cases) passes unmodified, confirming the contract is untouched
- Write/Preview toggle correctly implemented with Vue's reactive refs — simpler and more robust than the mockup's manual draft-capture, and Save correctly reads from the reactive ref rather than a DOM node that may not exist while Preview is showing (verified manually: save-while-previewing succeeds in both create and edit forms)
- `v-html` usages are the minimum necessary, each with a properly scoped `eslint-disable-next-line` (verified the directive actually suppresses — an earlier attempt with a `:`-separated description broke HTML-comment parsing and the plan's evidence doc reflects the corrected form)
- Scoped CSS uses only existing tokens (`--color-text`, `--color-text-muted`, `--color-primary`, `--color-border-strong`, `--color-surface-sunken`, `--radius-sm`, `--font-mono`, `--text-*`); no new tokens, no raw hex
- `markdown-it@14.3.0` (MIT, last published 2026-07-02) introduces no new `npm audit` findings; `@types/markdown-it` correctly added after a real `vue-tsc` failure demonstrated it was needed
- Changelog documents the accepted compatibility trade-off (existing notes may render differently); no migration is claimed or needed
- Size: 275 changed lines (excl. lockfile), within the 400-line soft cap
- CI `gates` + `project-checks` passed (run 30428846804); `specialist-review` correctly skipped (no Track C tag)

## Decision

`request-changes` — one P1. No P0.

## Host publication

- PR review: pending
- Inline comments: pending
- Ready-for-human comment: `pending` — will post once the P1 is remediated and re-reviewed

## Next action

`build` — add the two missing regression-test cases named above, re-run verification, update evidence, then re-review.
