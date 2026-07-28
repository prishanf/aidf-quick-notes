# 03 — Development Workflow

**This file is the canonical definition of the AIDF lifecycle.** The README diagram and every file in `diagrams/` are derived from it. Where any other document appears to describe a different sequence, this one is correct and the other is a defect.

The lifecycle below is the full Track C path. Track B skips the tag-driven artifacts; Track A skips to step 10. See [02-tracks.md](02-tracks.md).

## Lifecycle

1. **Discover** — capture the problem and the relevant repository context.
2. **Specify** — draft a feature spec; ask questions where facts or intent are missing.
3. **Classify** — assign track, risk level, and tags in the spec front matter. This happens **once**, here, as part of the spec. Nothing downstream re-classifies.
4. **Approve** — a human accepts the problem, outcome, scope, classification, and risk posture.
5. **Design** *(ui tag only)* — produce `templates/design.md`: flow, every required state, and — by default — a clickable static mockup built with mock data, distinct from and earlier than the Preview environment in step 12. A human design/product owner approves the design and mockup together before planning begins. Skipped when the `ui` tag is absent. See [standards/ui-and-preview.md](../standards/ui-and-preview.md).
6. **Track** — create or update the issue with a link to the approved spec (and design, if produced).
7. **Plan** — inspect the repository, identify files and dependencies, write an implementation plan.
8. **Approve plan** — for Track B and C, a human approves the implementation plan before any code is written. Track A has no plan document and skips this step.
9. **Isolate** — create a branch off `develop` (`main` for a hotfix), and a worktree — see [standards/worktrees.md](../standards/worktrees.md). Under the default GitFlow model this is not optional busywork: `develop` and `main` are long-lived worktrees off a shared bare clone, and every feature/fix/release/hotfix branch gets its own sibling worktree.
10. **Build** — implement in small increments, adding tests and updating the plan as facts change.
11. **Verify** — run the track's required checks and emit evidence.
12. **Preview** — deploy isolated state and complete UI QA. Required only for `ui`, `api`, and `database` tags.
13. **Open PR** — open the pull request to `develop` with linked evidence. The build agent's next action is `review`, not a human handoff.
14. **AI review** — the review agent inspects the diff, publishes findings on the PR, and — when P0/P1 findings exist — hands remediation to `build`. The loop repeats until blocking findings are fixed or explicitly accepted. The review agent then posts a final PR comment that AI review is complete and human review may begin. AI review never satisfies the human approval gate. See [`commands/review.md`](../commands/review.md).
15. **Human review** — every PR receives an authorized human approval; remaining findings are resolved or accepted with evidence. Merges to `develop`.
16. **Release** — when the release scope on `develop` is complete, cut `release/<version>`, harden and sign off in the QA environment, obtain production approval, merge to `main` under protected-branch policy, deploy through CI, observe, back-merge to `develop`, and update durable documents.

Classification (step 3) precedes planning deliberately: the plan cannot know which gates apply until the track is fixed. Design (step 5) precedes planning for the same reason applied to UX: a plan built against an unapproved screen is a plan for the wrong feature.

## State transitions

| State | Entry requirement | Exit evidence | Owner |
|---|---|---|---|
| `idea` | Problem statement exists | Draft spec | Requester / spec agent |
| `specified` | Spec complete and classified | Human approval | Human product owner |
| `designed` *(ui tag only)* | Spec approved, `ui` tag present | Human approval of design **and mockup** together (or a stated reason the mockup was skipped) | Human design/product owner |
| `planned` | Approved spec (and design, if `ui`) and repository inspection | Implementation plan | Planning agent |
| `plan_approved` *(Track B/C)* | Implementation plan drafted | Human plan approval | Human product/tech owner |
| `in_progress` | Branch and worktree exist off `develop` (or `main` for a hotfix) | Code + tests | Build agent |
| `verified` | Implementation complete | Corroborated check results | Build agent + CI |
| `previewed` | Preview validation completed *(tagged changes only)* | UI QA sign-off when `ui` applies | QA reviewer |
| `ready_for_review` | Verification complete | PR with linked evidence | Build agent |
| `ai_reviewing` | PR is open | AI findings published on the PR; P0/P1 fixed or accepted; ready-for-human comment posted | Review agent (+ build for remediation) |
| `reviewing` | AI review marked ready for human | Human findings resolved or accepted; authorized approval recorded | Human reviewers |
| `merged_to_develop` | PR approved | Deployed to the QA environment | Maintainer / CI |
| `staged` | `release/<version>` cut from `develop` | QA hardening sign-off | Release owner |
| `released` | Merged to `main` and production-approved | Release notes and state update | Maintainer / CI |

The `staged` state and a release branch **are** part of the default model — see [standards/branching.md](../standards/branching.md). A project that opts out of `develop` (trunk-based mode) collapses `merged_to_develop`, `staged`, and `released` into a single `released` state after merge to `main`, and records that deviation in its own documentation.

## Core operating rule

When new information invalidates the approved scope, stop implementation and return to the spec or plan. Do not silently expand the change.

## Stop conditions

An agent must stop and hand back to a human when any of these occur. Stopping is a successful outcome; a silent retry loop is not.

- **The same check fails three times.** Three attempts at one failing test, build, or lint error is the limit. Report the failure, what was tried, and the current hypothesis. Do not disable the check, mark the test skipped, or loosen the assertion to proceed.
- **A plan assumption is proved wrong.** The plan named an assumption; the repository contradicts it. Return to the plan.
- **The change would need a higher track.** Schema, authorization, secrets, or production configuration turn out to be in scope. Re-classify before continuing.
- **A required input is missing.** No approved spec, no manifest, an unreadable dependency, an environment that will not provision.
- **The next step is destructive, external, or irreversible** and is not covered by explicit project authorization.
- **Scope has grown past the acceptance criteria** and the extra work is not incidental.

On stopping, report: what was completed, what is in a partial state, exactly what failed with evidence, what was tried, and the specific decision needed to proceed.

## Working in an existing codebase

Most AI-assisted work is not greenfield. Before the first edit in an unfamiliar area:

- Read the project's conventions document ([templates/conventions.md](../templates/conventions.md)) if one exists. If it does not, writing it is a legitimate first contribution.
- Identify the nearest existing implementation of the same kind of thing and follow it, including its test style.
- Prefer the codebase's actual patterns over the patterns you would choose. A consistent codebase is worth more than a locally optimal file.
- If existing patterns conflict with each other, name the conflict in the plan rather than picking silently.

## Verification minimum

Every PR reports:

- changed files and why;
- checks run, with **corroborated** pass/fail status — see [standards/evidence.md](../standards/evidence.md);
- behavior not covered by automation;
- security, data, performance, and compatibility considerations;
- remaining risks and rollback approach.

Self-reported check results do not satisfy a gate. The agent's job is to produce artifacts a runner can corroborate, not to assert outcomes.
