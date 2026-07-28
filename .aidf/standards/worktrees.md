# Worktrees

A worktree gives each branch an isolated filesystem checkout while sharing the same Git history. Under the default [GitFlow branching model](branching.md), worktrees are the standard way of holding `main` and `develop` open at once, not an optional convenience — use one whenever work is parallel, long-running, likely to require a second agent session, **or is Track C** (database, security, mcp-write, infra, release: the change classes GitFlow's long-lived branches exist to isolate). Track A and low-risk Track B work may use a plain branch switch instead if the project prefers.

## Bare-repo layout

Set the project up once as a bare repository, then add a worktree per long-lived branch and per short-lived branch on top of it. This avoids the repeated clone/stash cycles that come from having only one working directory for several concurrently open branches.

```text
project.git/            # bare repository — no working files here
project-main/            # worktree: main
project-develop/         # worktree: develop
project-123-saved-searches/   # worktree: feat/123-saved-searches, off develop
project-release-1.4.0/        # worktree: release/1.4.0, off develop
```

```bash
git clone --bare https://github.com/org/project.git project.git
cd project.git
git worktree add ../project-main main
git worktree add ../project-develop develop
```

`project-main` and `project-develop` are persistent — leave them checked out for the life of the project. Everything else is short-lived.

## Naming

Use a stable issue key and short slug, matching `repository.feature_branch_pattern` / `release_branch_pattern` / `hotfix_branch_pattern` in the manifest:

```text
branch:   feat/123-saved-searches
worktree: ../project-123-saved-searches

branch:   release/1.4.0
worktree: ../project-release-1.4.0

branch:   hotfix/456-billing-crash
worktree: ../project-456-billing-crash
```

The branch and worktree name should be recoverable from the issue or PR. Avoid names based on a model, person, or temporary chat title.

## Example commands

Run these from inside the bare repository (`project.git`) or any existing worktree. Replace the paths and branch names with the project manifest values.

**Feature or fix** (branches from `develop`):

```bash
git fetch origin
git worktree add -b feat/123-saved-searches ../project-123-saved-searches origin/develop
```

**Release** (branches from `develop`, once its scope is complete):

```bash
git fetch origin
git worktree add -b release/1.4.0 ../project-release-1.4.0 origin/develop
```

**Hotfix** (branches from `main`):

```bash
git fetch origin
git worktree add -b hotfix/456-billing-crash ../project-456-billing-crash origin/main
```

After the pull request is merged:

```bash
git worktree remove ../project-123-saved-searches
git worktree prune
git branch -d feat/123-saved-searches
```

The commands are examples, not an authorization to delete unmerged work. Confirm the branch is merged and the path is exact before removal. Never remove the `main` or `develop` worktrees — they are persistent.

## Lifecycle

1. Confirm the spec is approved (and design is approved, if `ui`) and the issue exists.
2. Create the branch from the configured source: `develop` for `feat/*`/`fix/*`/`release/*`, `main` for `hotfix/*`.
3. Create a sibling worktree using the branch name.
4. Copy only approved local configuration; never copy secrets into a worktree.
5. Launch the agent with the manifest, spec, plan (and its approval), and repository rules in context.
6. Commit coherent increments; keep generated artifacts intentional.
7. Push the branch and open the PR against its target (`develop`, or `main` for a release/hotfix).
8. After merge, remove the worktree and prune stale references. For a release or hotfix, also back-merge into `develop` (see [branching.md](branching.md)) before removing its worktree.

## Parallel work rules

- Two agents must not edit the same worktree concurrently.
- Split parallel work by file ownership or independent deliverable.
- The coordinator owns integration and conflict resolution.
- Each parallel task has a written contract: objective, inputs, output files, and stop conditions.
- If two tasks need the same foundational API, finish the foundation first or designate one owner.

## Recovery

If an agent session ends, another agent can resume from `project-state.md`, the implementation plan (and its approval status), branch history, and the last verification report. Never rely on chat history as the only source of state.
