---
type: environment-matrix
track: project-setup
required_when: "project setup; updated when environment or data policy changes"
status: current
owner: ""
updated: YYYY-MM-DD
---

# Environment matrix

| Environment | URL/access | State source | Data class | Secret scope | Approval | Cleanup |
|---|---|---|---|---|---|---|
| Local | <route> | <source> | Synthetic | Developer | None | Developer |
| Preview | <route> | <isolated state> | Controlled clone + synthetic | PR only | PR reviewer | On PR close |
| QA | <route> | <resettable state> | Approved non-prod | QA only | QA owner | Reset per cycle |
| Production | <route> | Production state | Real | Release job only | Release approver | Retention policy |

## Data policy

<What production-derived data may be used, how it is masked, who may access it, and how long it is retained.>

## Provider adapters

<Optional mapping from this capability matrix to hosting, database, CI, secrets, and observability providers.>
