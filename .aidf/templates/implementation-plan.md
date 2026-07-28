---
type: implementation-plan
track: B
required_when: "every Track B and Track C change"
status: draft
owner: ""
created: YYYY-MM-DD
updated: YYYY-MM-DD
spec: ""
issue: ""
branch: ""
---

# Implementation plan: <short name>

## Goal and boundaries

<Restate the approved outcome and non-goals.>

## Repository findings

| Area | Finding | Evidence |
|---|---|---|
| Existing behavior | <what exists> | `<file>:<line>` |
| Integration point | <where change belongs> | `<file>:<line>` |
| Test coverage | <current coverage> | `<test file>` |

## Change map

| File or area | Change | Why |
|---|---|---|
| `<path>` | <add/edit/remove> | <reason> |

## Sequence

1. <small reversible step>
2. <implementation step>
3. <test and verification step>

## Data and migration

Answer all of these, or write `none` with a reason. Omit the section entirely only for a change that touches no persistent state.

- Data model document: `<path to data-model.md>` — <new / updated / unchanged>
- Entities and columns added, altered, or removed: <list>
- Migration files and order: `<paths>`
- Expand/contract phase: <expand · backfill · contract>
- Backfill: <strategy, volume, runtime, restartability — or "none">
- Backward compatibility: <how the previous application version keeps working during rollout>
- Rollback: <forward-fix plan; an application rollback does not reverse a data migration>
- Seed profile for Preview: `<named, versioned profile>`
- Classification and retention effects: <new PII/regulated columns, or "none">
- Migration plan: `<link, required for the `database` tag>`

## UI foundation

Required when the change carries the `ui` tag. See [../standards/ui-and-preview.md](../standards/ui-and-preview.md).

- Is this the project's **first** `ui` change? `<yes / no>`
- UI foundation document: `<path to ui-foundation.md>` — <created by this change / already exists and is unchanged / extended by this change>
- Foundation approval: `<approved on YYYY-MM-DD / pending — implementation must wait>`
- Token layer: `<path>` — <created / extended / unchanged>
- CSS framework: `<tailwind, per the manifest>`; theme wiring: `<path>`
- Approved design and mockup: `<paths>` — the authority for layout and flow
- Components: <which existing components are reused, which are new and land in the shared component directory>
- New tokens this change adds to a scale: <list, or "none"> — <a one-off value in a component is a review finding>
- Breakpoints and states to verify: <from the design doc>

**If this is the first `ui` change, the sequence below must land the token layer before the first component.** Components written first will carry hardcoded values, and they will not be cleaned up afterwards.

## API surface

Required when the change carries the `api` tag. See [../standards/testing.md](../standards/testing.md).

- API contract document: `<path>` — <new / updated>
- Endpoints added or changed: <list method + path>
- Per endpoint, the test file that will cover it **at the HTTP boundary**: <endpoint → test path>
- Authorization rules to be tested on the denied path: <role and object rules>
- Cross-tenant isolation test: `<test path, or n/a because single-tenant>`

Helper-function unit tests do not satisfy this section. If an endpoint appears here with no test file named, the plan is not ready.

## Verification plan

- Unit: `<command or test>`
- Integration: `<command or test>`
- Static: `<command>`
- API endpoints (`api` tag): `<command>` — every endpoint in the API surface section covered through the router, plus `reference/scripts/check-api-coverage.sh`
- Authorization, denied paths (`api`/`security`): `<command or test>`
- Migration (`database` tag): `<migrate command against a fresh and a populated database>`
- Accessibility and responsive (`ui` tag): <breakpoints checked, keyboard path, contrast>
- Manual: <steps and expected result>

## Risks and assumptions

- Assumption: <assumption>
- Risk: <risk>; mitigation: <mitigation>

## Completion checklist

- [ ] Scope matches approved spec.
- [ ] Tests added or updated.
- [ ] Verification commands recorded.
- [ ] Documentation decision made.
- [ ] PR evidence prepared.
- [ ] `database` tag: data model document current, with ERD and data dictionary.
- [ ] `api` tag: every changed endpoint has a named HTTP-level test, including a denied path.
- [ ] `ui` tag: design and mockup approved; UI foundation exists and is approved; token layer precedes components.

## Approval

- Decision: `pending | approved | rejected`
- Approver: <name or role>
- Date: YYYY-MM-DD
- Notes: <scope trade-offs, sequencing concerns, or conditions>

## Agent instruction

For Track B and Track C changes, do not begin implementation until `Approval.decision` is `approved`. Track A has no plan document and skips this gate. If repository inspection during planning contradicts the approved spec, or reveals the change needs a higher track, stop and return to the spec before requesting plan approval.
