---
type: evidence
runner: agent
commit: pending
change: feat/003-edit-note
recorded: 2026-07-28
ci_corroboration: pending
---

# Agent-run verification (claimed — awaiting CI corroboration)

Commands executed locally by the build agent on `feat/003-edit-note`. Results below are agent-claimed only until CI re-runs the same checks.

| Command | Exit |
|---|---|
| `npm test` | 0 (12 tests) |
| `npm run lint` | 0 |
| `npm run typecheck` | 0 |
| `npm run build` | 0 |
| `sh .aidf/reference/scripts/check-api-coverage.sh --manifest ./project.yaml` | 0 (5/5 covered) |
| `sh .aidf/reference/scripts/check-changelog.sh --track B --manifest ./project.yaml` | pending until CHANGELOG commit; expected 0 after commit |
| `sh .aidf/reference/scripts/run-gates.sh --track B --tags ui,api --manifest ./project.yaml` | changelog failed pre-commit (uncommitted CHANGELOG); other gates passed |

Next: CI on the PR must corroborate these checks.
