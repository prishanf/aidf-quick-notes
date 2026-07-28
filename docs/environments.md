---
type: environment-matrix
track: project-setup
required_when: "project setup; updated when environment or data policy changes"
status: current
owner: prishanf
updated: 2026-07-28
---

# Environment matrix

| Environment | URL/access | State source | Data class | Secret scope | Approval | Cleanup |
|---|---|---|---|---|---|---|
| Local | `http://localhost:3000` | `./data/notes.sqlite` | Synthetic developer notes | Developer `.env` | None | Delete `data/` |
| Preview | PR preview (when wired) | Isolated SQLite file per PR | Synthetic | PR secrets only | PR reviewer | On PR close |
| QA | Deploy from `develop` (when wired) | Resettable SQLite | Synthetic | QA only | QA owner | Reset per cycle |
| Production | Deploy from `main` (when wired) | Production SQLite/host | Real notes | Release job only | Release approver | Retention policy |

## Data policy

This example stores only developer-owned synthetic notes. No production-derived personal data. Preview and QA use fresh SQLite files. Do not copy real personal notes into shared environments.

## Provider adapters

- Hosting: local Nuxt/Nitro for now; cloud hosting deferred.
- Database: SQLite file via better-sqlite3 + Drizzle.
- CI: GitHub Actions workflows from AIDF (`.github/workflows/`).
- Secrets: `SQLITE_PATH` only for local/preview path override.
