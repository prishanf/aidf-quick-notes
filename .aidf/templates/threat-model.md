---
type: threat-model
track: C
required_when: "the change carries a `security`, `mcp-write`, or `infra` tag"
status: draft
owner: ""
created: YYYY-MM-DD
updated: YYYY-MM-DD
related-change: ""
---

# Threat model: <change or system>

## Scope and assets

<What changes, sensitive data, identities, money, or operations are in scope.>

## Trust boundaries

| Boundary | Data / action crossing | Controls |
|---|---|---|
| <boundary> | <what crosses> | <auth, validation, logging> |

## Abuse cases

| Threat | Impact | Mitigation | Verification |
|---|---|---|---|
| <case> | <impact> | <control> | <test/review> |

## Residual risk

<Known accepted risk, owner, expiry, and follow-up.>

## Approval

- Reviewer: <name or role>
- Decision: `approved | changes-requested | accepted-risk`
- Date: YYYY-MM-DD
