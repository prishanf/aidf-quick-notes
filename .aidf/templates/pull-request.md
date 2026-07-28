---
type: pull-request
track: A
required_when: "every change, on every track"
status: draft
issue: ""
spec: ""
plan: ""
---

# <short title>

## Summary

<What changed and why?>

## Classification

`track: <A|B|C>` · `tags: <list>`

*Track A only:* classification is recorded here because there is no spec. State in one line why this is non-behavioral.

## Scope check

- In scope: <items>
- Out of scope: <items>
- Deviation from plan: `none | described below`

## Evidence

**Link results. Do not restate them.** A reviewer must be one click from the run, not reading your summary of it.

- CI run: <url>
- Evidence artifact: <url to `evidence.json`, `runner: ci`>
- Preview environment: <url and revision, or `not required — no ui/api/database tag`>

Not covered by automation:

- <behavior a human checked, and how> — this is claimed evidence, correctly labelled
- <behavior nobody checked> — say so; a silent omission is worse than a known gap

## Risks and rollout

- Risk: <risk>
- Rollback: <rollback>
- Migration/feature flag: <details or none>

## Size

<Changed lines, excluding lockfiles and generated code. If over ~400, either split this PR or justify it here in one line.>

## Documentation

- [ ] Architecture updated
- [ ] ADR added or linked
- [ ] Wiki updated
- [ ] Release notes prepared
- [ ] None needed, because: <reason>

## Reviewer guidance

Please focus on <behavior, boundary, security, or performance concern>.

Human review begins only after AI review has posted the ready-for-human comment on this PR (see [commands/review.md](../commands/review.md)). AI review does not replace required human approval.
