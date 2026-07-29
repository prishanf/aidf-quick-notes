---
type: project-state
track: project-setup
required_when: "project setup; kept current for session resumption"
status: active
owner: prishanf
updated: 2026-07-28
manifest: project.yaml
---

# Project state

## Current milestone

**v0.1.0 released** on `main` (`d62b6b1`) — create/list + delete notes.

## Now

- v1.0.0 release prep: `docs/releases/v1.0.0.md` drafted (PR #3 edit + PR #4 Markdown, both merged to `develop` at `a0a5010`) — **production approval pending**; one open gap (Feature 4 UI QA sign-off missing) needs a maintainer decision before cut
- Optional follow-ups: Feature 2 UI QA sign-off; branch protection; Cancel-during-save design fidelity (P2)

## Recently completed

- PR #3 (edit) and PR #4 (Markdown note body) both merged to `develop`; ship prep drafted: `docs/releases/v1.0.0.md`, `docs/deployments/v1.0.0.md` (draft), ADR 0003 (Markdown safe-subset, no raw HTML), CHANGELOG `[1.0.0]`, architecture/wiki pointers updated
- Feature 4 AI review: one P1 found (missing regression tests for `linkify`-autolinked unsafe-scheme strings and `data:` URI links) and fixed (`cfc5604`); `docs/reviews/004-markdown-note-body.md` — ready-for-human
- Feature 4 built: `app/utils/markdown.ts` (markdown-it, html:false), rendered list body, Write/Preview toggle on create + Feature 3 edit forms
- Feature 3 (edit a note) merged to `develop` via PR #3 (`9f3cc97`): `PATCH /api/notes/:id`, inline edit UI, HTTP tests, AI review + UI QA sign-off
- Production push: `main` and `develop` at `d62b6b1` (v0.1.0)

## Next

- Decide the Feature 4 UI QA gap (produce a sign-off doc, or explicitly accept as follow-up like Feature 2's)
- Grant production approval for the `develop` → `main` cut at `a0a5010`; then tag `v1.0.0` and push
- Close accepted follow-ups from v0.1.0 when convenient

## Risks and blockers

| Item | Impact | Owner | Next action |
|---|---|---|---|
| Feature 4 UI QA sign-off missing | Blocks a clean v1.0.0 eligibility table unless explicitly accepted | prishanf | Decide before production cut |
| Feature 2 UI QA still missing | Accepted follow-up (carried from v0.1.0) | prishanf | Sign-off doc when convenient |
| Branch protection not configured | Gates remain advisory | prishanf | Protect `main`/`develop`, require CODEOWNERS |
| Hard delete irreversible | Data loss if no backup | — | ADR 0002 |

## Decisions and links

- Product: Quick Notes — create/list, delete, edit, Markdown body rendering (all shipped to `develop`; v1.0.0 cut to `main` pending approval)
- Repo: https://github.com/prishanf/aidf-quick-notes
- Release: `docs/releases/v1.0.0.md` (prior: `docs/releases/v0.1.0.md`)
- Deployment: `docs/deployments/v1.0.0.md` (draft; prior: `docs/deployments/v0.1.0.md`)
- ADRs: `docs/decisions/0001-local-sqlite-no-auth.md`, `docs/decisions/0002-hard-delete-notes.md`, `docs/decisions/0003-markdown-safe-subset-no-raw-html.md`
