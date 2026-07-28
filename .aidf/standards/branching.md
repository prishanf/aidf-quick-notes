# Branching

The default model is **GitFlow**: two protected long-lived branches (`main`, `develop`) plus short-lived feature, fix, release, and hotfix branches. This is a deliberate choice for teams that need a persistent, continuously-deployed QA environment ahead of production — not just an ephemeral per-PR Preview. A Preview environment answers "does this one PR work?"; a QA environment on `develop`/`release` answers "does the integrated set of approved changes work together, and is it ready to cut a release?" Projects that only need the former may still disable `develop` and run trunk-based — see [Opting out of `develop`](#opting-out-of-develop-trunk-based-mode) below — but GitFlow is what a fresh `project.yaml` configures out of the box.

## Branches

| Branch | Meaning | Protection | Source | Merges to |
|---|---|---|---|---|
| `main` | Production-ready history; every commit is a released or releasable revision | Protected; PR, checks, release approval | — | — |
| `develop` | Integration branch; continuously deployed to the QA environment | Protected; PR, checks | `main` (once, at setup) | — |
| `feat/<issue>-<slug>` | Feature or bounded change | Short-lived; linked to issue | `develop` | `develop` |
| `fix/<issue>-<slug>` | Non-emergency defect fix | Short-lived; linked to issue | `develop` | `develop` |
| `release/<version>` | Release-candidate hardening and QA sign-off | Short-lived; only fixes, no new scope | `develop` | `main` and back to `develop` |
| `hotfix/<issue>-<slug>` | Production emergency | Short-lived; maintainer approval | `main` | `main` and back to `develop` |

`repository.integration_branch` is `develop`; `repository.production_branch` is `main`; `repository.qa_branch` names the branch whose deployment serves as the QA environment (`develop` by default — see [standards/environments.md](environments.md)).

## Commit guidance

Commits should be coherent and reversible. Use imperative subjects and include the issue key when the host supports it. Do not use commits to disguise unrelated changes.

## Pull request rules

- **Feature/fix → `develop`**: link the approved spec and issue (Track B and C). Link verification evidence — the CI run and its check identifiers; do not restate results in prose, see [evidence.md](evidence.md). Require the configured human review.
- **`develop` → `release/<version>`**: cut when the set of merged features targeted for the release is complete. No new scope enters a release branch — only fixes found during QA hardening. Deploys automatically to the QA environment.
- **`release/<version>` → `main`**: requires production approval (every release, see [quality-gates.md](quality-gates.md)) plus the QA sign-off gathered on the release branch's QA deployment. On merge, back-merge `main` into `develop` (or re-merge the release branch into `develop`) so hotfix-free history stays consistent.
- **`hotfix/<issue>-<slug>` → `main`**: maintainer approval and, for anything beyond a trivial fix, the same checks a normal release requires. Back-merge to `develop` immediately after.
- Require an approval for every PR, plus UI QA sign-off when a `ui` tag applies, plus a named specialist for Track C.
- Keep scope within the issue or explain a necessary deviation.
- Respect the size budget in [quality-gates.md](quality-gates.md): past ~400 changed lines, split the PR or justify it.
- Squash or preserve commits according to project policy, but retain the PR as the primary change record. **The PR is the implementation record** — do not write a second narrative document describing the same change.

## Worktrees

GitFlow's long-lived branches are exactly the case [standards/worktrees.md](worktrees.md) describes as benefiting from isolation: `main` and `develop` each get a persistent worktree off a single bare clone, and every feature/release/hotfix branch gets its own sibling worktree so an agent (or a human) can have several branches checked out side by side without repeated clone/stash cycles. See that file for the bare-repo layout and commands.

## Emergency changes

Hotfixes may shorten the normal path, not remove accountability. Record the incident, verification, rollback path, and follow-up documentation before closing the work. A hotfix still needs its own worktree off `main`, not an ad hoc checkout on top of unrelated in-progress work.

## Opting out of `develop` (trunk-based mode)

A project with no need for a persistent pre-production QA environment — for example, a project relying entirely on per-PR Preview deployments — may run trunk-based instead: `main` only, short-lived `feat/*`/`fix/*` branches merging directly to `main`, no `develop` and no `release/*`. To opt out, set `repository.qa_branch: ""` and `repository.integration_branch: main` in `project.yaml`, and record why in the project's own documentation (its `docs/conventions.md` or equivalent) — this is the reverse of the framework's default, so the deviation should be visible, not implicit. When trunk-based, the `preview` command contract's per-PR environment carries the review weight that `develop`'s QA environment carries under GitFlow.
