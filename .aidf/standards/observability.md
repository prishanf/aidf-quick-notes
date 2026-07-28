# Observability and Rollback

Releases are complete only when the team can observe the new behavior and recover from failure.

## Minimum signals

Every production service declares a health check, structured error events, request correlation, key business outcome signal, and alert owner. API and MCP operations include a correlation ID in their audit and operational records.

## Release observation

The deployment record names:

- source revision and environment;
- checks and approvals;
- health and smoke results;
- observation window and owner;
- rollback trigger and authority;
- database compatibility and recovery action;
- follow-up items.

## Rollback

- Roll back application code to a known compatible revision when needed.
- Prefer feature switches or forward fixes for persistent-data changes.
- Do not automate irreversible data rollback without a tested, explicitly approved plan.
- Keep a recovery point for production changes that can mutate schema or data.
- Record incidents and lessons in project state or the project’s incident system.

## Process observability

Observe the delivery process the same way you observe the service. A framework nobody measures is a framework nobody can tune, and the first sign that AIDF is not fitting a team is a metric, not an opinion.

Track a small number of signals over time. All of them come from data the framework already produces.

| Signal | From | What a bad reading means |
|---|---|---|
| **Rework rate** — changes returning to spec or plan after build started | Stop-condition reports, spec revisions | Specs are approved before they are clear |
| **Gate pass rate on first run** | `evidence.json` history | Checks run too late; agents are not verifying before opening a PR |
| **Escaped defects** — bugs found after release, by track | Incident records vs. release notes | The track's gates are not catching what they exist to catch |
| **Waiver count and age** | Expired waivers in evidence | Gates are being routed around rather than fixed |
| **Cycle time by track** | Issue timestamps | Track B is too heavy, or Track A is being abused |
| **Review turnaround and PR size** | PR metadata | Review is the bottleneck; diffs are outrunning reviewers |
| **Cost per merged change** | Provider usage, if tracked | Sessions are not converging; check the stop conditions |

Two readings to act on immediately:

- **Escaped defects rising while gate pass rate is high** — the gates are passing things they should catch. The suite is probably measuring the wrong thing; start with [testing.md](testing.md).
- **Waivers accumulating** — a gate has become impractical. Fix the gate or remove it deliberately. A gate that is routinely waived is worse than no gate, because it produces a false sense of coverage.

Review these at whatever cadence the team already retrospects. Record the outcome in project state — including the decision to change the framework itself, which is a legitimate result.
