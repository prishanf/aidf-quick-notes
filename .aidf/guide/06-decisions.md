# 06 — Decision Guide

Use this page to choose the lightest process that still protects the project. When it and [02-tracks.md](02-tracks.md) disagree, the tracks table wins — this page is guidance, that one is the contract.

## Which track is this?

- **No behavior change** — docs, comments, formatting, a rename with no semantic effect: **Track A**. No spec.
- **Behavior change, user-facing work, or a bug fix with product impact:** **Track B**. Spec required.
- **Schema, security, permissions, secrets, agent writes, infrastructure, dependencies across a trust boundary, or production configuration:** **Track C**. Spec plus explicit risk review.

Unsure? Track B. The cost of an unnecessary spec is twenty minutes; the cost of an unclassified migration is a production incident.

## Should I use a worktree?

- **One person, one short change:** a normal branch is enough.
- **Parallel agents, long-running work, or risky experiments:** use a worktree.
- **Shared environment or generated state:** use isolation unless the project documents why not.

## Should I create an ADR?

Create one when the decision is consequential, hard to reverse, likely to be revisited, or useful to explain to a future maintainer. Do not create ADRs for routine implementation details. A good test: would someone six months from now ask "why on earth is it like this?"

## Should the agent ask a question?

Ask when the answer changes scope, safety, user-visible behavior, data handling, compatibility, or release risk. Make a reasonable assumption when the answer is low-risk and reversible, and record it — a recorded assumption becomes a stop condition if it later proves wrong.

## The agent's checks keep failing. What now?

Stop after three attempts on the same failure and hand back to a human with evidence. Do not disable the check, skip the test, or loosen the assertion. See "Stop conditions" in [03-workflow.md](03-workflow.md). Persistence past the third attempt is almost always an agent solving the wrong problem.

## Can the agent merge or deploy?

Only if the project manifest explicitly grants that authority and the action is covered by auditable controls. The default is: agents prepare, humans approve, CI executes.

## How much documentation is enough?

Document the knowledge that will prevent a future person from repeating the same investigation. Keep transient implementation detail in the PR; promote stable decisions and operating knowledge to architecture, ADR, wiki, or state.

If you find yourself writing a document because the framework seems to want one, check the Track column in [05-documents.md](05-documents.md). It probably does not.
