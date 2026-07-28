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

**v0.1.0** production-approved — merging Features 1–2 (create/list + delete) to `main`.

## Now

- Commit ship docs on `develop`, merge to `main`, push
- After push: Feature 3 (edit) via AIDF `spec` when ready

## Recently completed

- `ship` release docs + ADRs + operator wiki for v0.1.0
- Production approval by prishanf for push to `main`
- PR #1 and #2 merged to `develop`

## Next

- Post-release follow-ups: Feature 2 UI QA sign-off; Track C labels on future PRs
- Feature 3 (edit a note) via AIDF `spec`

## Risks and blockers

| Item | Impact | Owner | Next action |
|---|---|---|---|
| Feature 2 UI QA still missing | Accepted follow-up after prod cut | prishanf | Sign-off doc when convenient |
| Branch protection not configured | Gates remain advisory | prishanf | Protect `main`/`develop`, require CODEOWNERS |
| Hard delete irreversible | Data loss if no backup | — | ADR 0002; copy SQLite before risky cuts |

## Decisions and links

- Product: Quick Notes — create/list, delete, edit (edit not yet shipped)
- Repo: https://github.com/prishanf/aidf-quick-notes
- Release: `docs/releases/v0.1.0.md`
- ADRs: `docs/decisions/0001-local-sqlite-no-auth.md`, `docs/decisions/0002-hard-delete-notes.md`
- Operator wiki: `docs/wiki/local-operator-runbook.md`
