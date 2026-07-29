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

- Feature 4 (Markdown note body): implementation plan drafted (`docs/plans/004-markdown-note-body.md`) — awaiting human approval before build starts
- Optional follow-ups: Feature 2 UI QA sign-off; branch protection; Cancel-during-save design fidelity (P2)

## Recently completed

- Feature 4 spec + design/mockup approved; implementation plan drafted (Track B, tags `ui`, `dependency`; no schema/API change)
- Feature 4 design + mockup approved: rendered Markdown in list, Write/Preview toggle on create + edit forms, raw-HTML/unsafe-link escaping demonstrated
- Feature 3 (edit a note) merged to `develop` via PR #3 (`9f3cc97`): `PATCH /api/notes/:id`, inline edit UI, HTTP tests, AI review + UI QA sign-off
- Feature 3 Preview + concurrent-delete Save fix (`371a7ba`)
- Production push: `main` and `develop` at `d62b6b1`
- Ship docs, ADRs, operator wiki for v0.1.0
- PR #1 and #2 merged to `develop`, then released to `main`

## Next

- Approve Feature 4 plan, then branch `feat/004-markdown-note-body` and build
- Close accepted follow-ups from v0.1.0 when convenient

## Risks and blockers

| Item | Impact | Owner | Next action |
|---|---|---|---|
| Feature 2 UI QA still missing | Accepted follow-up | prishanf | Sign-off doc when convenient |
| Branch protection not configured | Gates remain advisory | prishanf | Protect `main`/`develop`, require CODEOWNERS |
| Hard delete irreversible | Data loss if no backup | — | ADR 0002 |

## Decisions and links

- Product: Quick Notes — create/list, delete, edit (shipped); Markdown body rendering (in progress)
- Repo: https://github.com/prishanf/aidf-quick-notes
- Release: `docs/releases/v0.1.0.md`
- Deployment: `docs/deployments/v0.1.0.md`
- ADRs: `docs/decisions/0001-local-sqlite-no-auth.md`, `docs/decisions/0002-hard-delete-notes.md`
