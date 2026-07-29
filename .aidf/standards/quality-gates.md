# Quality Gates

Quality gates are selected by change risk, not by a provider or a fixed pipeline product. Each project implements them through its own CI, deployment, and repository tools. A working GitHub Actions implementation lives in [reference/github/](../reference/github/).

**This file is the sole definition of the risk-tag taxonomy.** The project manifest and `schemas/project.schema.json` reference these tag names; they do not redefine them or their required evidence. `reference/scripts/check-consistency.sh` fails the build if they drift.

## Risk tags

| Tag | Applies to | Additional required evidence | Forces |
|---|---|---|---|
| `ui` | Screens, interaction, content flow | Approved design and mockup, UI foundation on the first `ui` change, Preview UI QA sign-off | Preview |
| `api` | Endpoint, schema, or contract change | API contract with a per-endpoint test matrix; HTTP-level endpoint tests incl. denied paths | Preview |
| `database` | Migration, persistence, or query shape | Data model (ERD + data dictionary), migration plan (incl. seed profile), schema review | Track C, Preview |
| `security` | Auth, permissions, secrets, crypto | Threat model and named security review | Track C |
| `mcp-write` | Agent-initiated mutation | Capability review, audit plan, threat model | Track C |
| `infra` | IaC, runtime config, networking, CI permissions | Change plan, blast-radius statement, rollback | Track C |
| `dependency` | Added, removed, or upgraded dependency | Provenance check, changelog review, vulnerability scan diff | Track C when it crosses a trust boundary, else Track B |
| `release` | Production behavior or configuration | Rollback plan and production approval | Track C |
| `docs` | Documentation, comments, non-executable content | None beyond baseline | Track A |

A change may carry several tags; evidence is cumulative. Tags never lower a track — see [guide/02-tracks.md](../guide/02-tracks.md).

`dependency` deserves the attention it is given here: dependency upgrades are among the highest-impact changes in a real project and are the ones most often waved through as routine.

## PR-time gates

These run before merge. This table governs pull requests only.

| Check | Track A | Track B | Track C |
|---|---|---|---|
| Format, lint, typecheck, build | Required | Required | Required |
| Unit tests | Required | Required | Required |
| New test fails against pre-change code | — | Required | Required |
| Secret scan | Required | Required | Required |
| AI review complete (findings published; P0/P1 fixed or accepted; ready-for-human comment on the PR) | Required | Required | Required |
| Human PR approval | Required (1) | Required (1) | Required (1) + named specialist |
| Preview deploy and smoke test | — | Required if `ui`/`api`/`database` | Required |
| UI QA sign-off | — | Required if `ui` | Required if `ui` |
| Endpoint tests: contract, validation, authorization (allowed **and** denied) | — | Required if `api` | Required |
| Every changed endpoint covered at the HTTP boundary | — | Required if `api` | Required |
| Data model (ERD + data dictionary) current | — | Required if `database` | Required if state changes |
| Migration validation and schema review | — | Required if `database` | Required if state changes |
| UI foundation approved (first `ui` change only) | — | Required if `ui` | Required if `ui` |
| Changelog entry under `[Unreleased]` | Optional | Required | Required |
| Threat model / specialist review | — | — | Required for `security`, `mcp-write`, `infra` |
| Dependency provenance and vulnerability diff | — | Required if `dependency` | Required if `dependency` |

AI review is a **process gate**, evidenced by the PR review thread and the ready-for-human comment — not by `runner: ci`. It never replaces human PR approval. See [guide/03-workflow.md](../guide/03-workflow.md) and [commands/review.md](../commands/review.md).

## Release-time gates

These run at deployment and are **not** pull-request gates. Applying them per PR is a misreading that makes the framework unusable.

| Check | When |
|---|---|
| Production approval | Every production deployment |
| Recovery point captured | Before any schema- or data-mutating release |
| Annotated version tag on production tip | Every production release (name = release notes `version`) |
| Post-release health and smoke verification | Every production deployment |
| Observation window with a named owner | Every production deployment |
| Deployment record | Every production deployment |

The version tag is an **annotated** git tag on the production tip whose name equals the release notes front-matter `version` (for example `v0.1.0`). Do not move or force-update an existing tag that points elsewhere. See [commands/ship.md](../commands/ship.md) and [branching.md](branching.md).

## Pull request size budget

Human review capacity is the binding constraint in AI-assisted development. An agent can produce a diff faster than any reviewer can read it, and an unreviewed approval is a gate that has already failed.

- **Soft cap: 400 changed lines**, excluding lockfiles, generated code, snapshots, and vendored directories.
- Over the cap, the PR must either be split or carry a one-line justification in its description.
- This is enforced as a **commenting, non-blocking** check. It is a prompt for judgment, not a rule to game — and a blocking version would simply be evaded by inflating the exclusion list.

## Gate behavior

- **Gates fail closed.** A missing result is not a passing result. An unset command in the manifest is a failure, not a skip.
- **Only corroborated evidence satisfies a gate.** Agent-authored claims do not. See [evidence.md](evidence.md).
- A waiver must name the skipped check, the reason, the approver, an expiry date, and a follow-up issue. A waiver without an expiry is not a waiver.
- Only one production deployment may run for the same service at a time.
- CI has authority to execute approved automation. It does not have authority to redefine scope or approve its own risk.
- The PR records the commit, environment URL, check run identifiers, approvals, and rollback plan.
