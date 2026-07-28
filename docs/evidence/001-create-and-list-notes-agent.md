---
type: evidence
runner: agent
commit: pending
change: feat/001-create-and-list-notes
recorded: 2026-07-28
ci_corroboration: https://github.com/prishanf/aidf-quick-notes/actions/runs/30323629115
---

# Agent-run verification (claimed — CI corroborated on PR #1)

Commands executed locally by the build agent. CI must corroborate.

| Command | Exit |
|---|---|
| `npm run lint` | 0 |
| `npm run typecheck` | 0 |
| `npm test` | 0 (4 tests) |
| `npm run build` | 0 |
| `sh .aidf/reference/scripts/check-api-coverage.sh --manifest project.yaml` | 0 (3/3 covered) |
| `sh .aidf/reference/scripts/validate-manifest.sh project.yaml` | 0 |

This artifact does not satisfy AIDF gates by itself. Corroboration: CI `evidence.json` with `runner: ci` from [run 30323629115](https://github.com/prishanf/aidf-quick-notes/actions/runs/30323629115) (artifact `aidf-evidence`).
