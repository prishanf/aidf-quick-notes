---
type: feature-spec
track: B
required_when: "every Track B and Track C change"
status: draft
owner: ""
created: YYYY-MM-DD
updated: YYYY-MM-DD
issue: ""

# Classification lives here, not in a separate document.
# Gates and CI read this block. See standards/quality-gates.md for tag definitions.
classification:
  track: B              # A | B | C
  risk: standard        # low | standard | high
  tags: []              # ui, api, database, security, mcp-write, infra, dependency, release, docs
---

# Feature: <short name>

## Problem

Who has the problem, what happens today, and why does it matter?

## Desired outcome

Describe the observable improvement in one or two sentences.

## Users and scenarios

- **Primary user:** <who>
- **Scenario:** Given <context>, when <action>, then <result>.

## In scope

- <bounded outcome>

## Out of scope

- <explicit non-goal>

## Acceptance criteria

- [ ] <testable criterion>
- [ ] <testable criterion>
- [ ] Error, permission, and empty states are defined.

## Why this classification

<Which users, data, trust boundaries, or operational behavior the change touches, and how reversible it is. One paragraph. If the tags list is empty, say why.>

## Constraints and risks

- Compatibility: <supported versions or clients>
- Data/security: <sensitive data, permissions, migration>
- Performance: <latency, volume, or cost expectation>
- Rollback: <how to disable or undo>

## Open questions

- [ ] <question that could change scope>

## Approval

- Decision: `pending | approved | rejected`
- Approver: <name or role>
- Date: YYYY-MM-DD
- Notes: <trade-offs or conditions>

## Agent instruction

Do not implement from this document until `Approval.decision` is `approved`. If an open question changes scope or safety, stop and ask it. If implementation reveals that the change touches schema, authorization, secrets, or production configuration, stop and re-classify upward before continuing.
