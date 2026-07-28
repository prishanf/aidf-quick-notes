---
type: code-review
track: B
required_when: "every Track B and Track C pull request (Track A: host review only is enough)"
reviewer: ""
pr: ""
date: YYYY-MM-DD
---

# Review: <pull request>

## Summary

<One-paragraph assessment of correctness and risk.>

## Findings

### [P0] <blocking issue>

- Location: `<file>:<line>`
- Evidence: <what demonstrates the issue>
- Impact: <user, system, or security impact>
- Suggested direction: <fix or question>
- Host comment: <URL or `pending`>

### [P1] <important issue>

<Repeat as needed. Use P2 for normal, P3 for polish.>

## Host publication

- PR review: <URL of the published review on the host>
- Inline comments: <count or `none`>
- Ready-for-human comment: `pending | posted` — <URL when posted>

## Verification performed

- Commands: `<commands>`
- Tests: <what was covered>
- Not tested: <gaps>

## Decision

- Result: `request-changes | comment | ready-for-human`
- Conditions: <remediation required, accepted follow-ups, or none>
- Next action: `build` (remediate) | `review` (re-pass) | `human review`
