# 01 — Overview

## The operating model

AIDF treats AI-assisted development as a controlled flow of intent, context, change, and evidence. The agent is an implementation partner with broad reading and narrow, reviewable mutation authority. The human is accountable for product intent, trade-offs, risk acceptance, and irreversible actions. CI is the repeatable verifier, the deployer, and — critically — the only source of evidence that satisfies a gate.

## The four layers

### Intent

Captured in the feature spec: the user problem, outcomes, non-goals, constraints, acceptance criteria, and the change's classification. If intent is ambiguous, the agent asks before proposing implementation details.

### Execution

Captured in the issue, implementation plan, branch/worktree, commits, and pull request. Each artifact narrows the next action and makes the work resumable by another person or agent.

### Evidence

Tests, static checks, screenshots, logs, benchmarks, review findings, and explicit unresolved risks. "It works" is not evidence. Neither is an agent's own report that a check passed — evidence is what a runner produced, and [standards/evidence.md](../standards/evidence.md) defines the difference precisely.

### Memory

Architecture documentation, ADRs, wiki pages, project state, and release notes. Durable knowledge is updated when a change affects future work, not merely because a file changed.

## Proportional process

Not every change deserves the same ceremony. AIDF runs every change on one of three tracks — trivial, standard, high-risk — and a change carries only the documents and gates its track demands. A Track A change has one artifact: its pull request. See [02-tracks.md](02-tracks.md).

A framework that is too heavy for small changes does not get followed for large ones either.

## Roles at a glance

| Role | Accountable for | May do autonomously |
|---|---|---|
| Human product owner | Intent, priority, acceptance, risk acceptance | Answer questions, approve scope |
| Human maintainer | Repository standards, merge, release policy | Review and merge authorized changes |
| Spec agent | Clarifying and structuring intent | Inspect context, draft spec/questions |
| Planning agent | Mapping intent onto the repository | Inspect, propose a bounded plan |
| Build agent | Bounded implementation and tests | Edit within approved scope, run checks |
| Review agent | Defect and risk discovery on the open PR | Inspect diff, publish findings, drive remediation handoff, mark ready for human |
| CI | Repeatable verification and deployment | Run configured automation, corroborate evidence |

## The rule of handoff

Every handoff answers: what is known, what changed, what was checked, what remains uncertain, and what decision is needed next. The templates make those fields explicit so that the answer does not depend on who is asking.

## Non-goals

AIDF does not prescribe a programming language, hosting provider, issue tracker, model, editor, or test framework. Projects bind those choices in `project.yaml` and keep the lifecycle stable. The GitHub Actions implementation in [reference/](../reference/) is an example of binding those choices, not part of the contract.
