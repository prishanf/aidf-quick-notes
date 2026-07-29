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

**v1.0.0 released** on `main` (`b6363c0`, tag `v1.0.0`) — create/list, delete, edit, and Markdown-formatted note bodies.

## Now

- v1.0.0 shipped: `main` and `develop` both at `b6363c0`; annotated tag `v1.0.0` pushed
- Optional follow-ups: Feature 2 UI QA sign-off; branch protection; Cancel-during-save design fidelity (P2)

## Recently completed

- v1.0.0 production cut: `develop` fast-forwarded onto `main`, smoke-tested (20/20 tests), tag `v1.0.0` pushed — `docs/deployments/v1.0.0.md`
- Feature 4 UI QA sign-off produced and approved: `docs/qa/004-markdown-note-body-ui-signoff.md`
- PR #3 (edit) and PR #4 (Markdown note body) both merged to `develop`; ship prep: `docs/releases/v1.0.0.md`, ADR 0003 (Markdown safe-subset, no raw HTML), CHANGELOG `[1.0.0]`
- Feature 4 AI review: one P1 found (missing regression tests for `linkify`-autolinked unsafe-scheme strings and `data:` URI links) and fixed (`cfc5604`); `docs/reviews/004-markdown-note-body.md` — ready-for-human
- Feature 3 (edit a note) merged to `develop` via PR #3 (`9f3cc97`): `PATCH /api/notes/:id`, inline edit UI, HTTP tests, AI review + UI QA sign-off
- Production push: `main` and `develop` at `d62b6b1` (v0.1.0)

## Next

- Plan the next feature (spec first, per the usual gate sequence)
- Close accepted follow-ups from v0.1.0 when convenient

## Risks and blockers

| Item | Impact | Owner | Next action |
|---|---|---|---|
| Feature 2 UI QA still missing | Accepted follow-up (carried from v0.1.0) | prishanf | Sign-off doc when convenient |
| Branch protection not configured | Gates remain advisory | prishanf | Protect `main`/`develop`, require CODEOWNERS |
| Hard delete irreversible | Data loss if no backup | — | ADR 0002 |
| Existing notes may render differently under Markdown | Accepted trade-off, no migration | — | ADR 0003 |

## Decisions and links

- Product: Quick Notes — create/list, delete, edit, Markdown body rendering — all released in v1.0.0
- Repo: https://github.com/prishanf/aidf-quick-notes
- Release: `docs/releases/v1.0.0.md` (prior: `docs/releases/v0.1.0.md`)
- Deployment: `docs/deployments/v1.0.0.md` (healthy; prior: `docs/deployments/v0.1.0.md`)
- ADRs: `docs/decisions/0001-local-sqlite-no-auth.md`, `docs/decisions/0002-hard-delete-notes.md`, `docs/decisions/0003-markdown-safe-subset-no-raw-html.md`
