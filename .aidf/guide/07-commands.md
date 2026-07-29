# 07 — Command Reference

The core commands are intent-oriented contracts. An adapter can expose them as slash commands, chat prompts, tasks, scripts, or workflows. AIDF ships no vendor command files; see [adapters/README.md](../adapters/README.md) for how to wire them on your surface.

| Command | Purpose | Mutates files? | Human gate |
|---|---|---:|---|
| `spec` | Clarify and draft a feature spec, including its classification | Draft only | Approve scope and track |
| `design` | Produce a design and, by default, a throwaway mockup (`ui` tag) | Design doc + mockup files | Approve design and mockup before planning |
| `plan` | Convert approved scope into a repository plan | Optional plan file | Approve plan (Track B/C) before build |
| `build` | Implement the approved plan | Yes | Scope and external actions |
| `validate` | Run the track's required gates and emit evidence | No by default | Waiver for a failed gate |
| `preview` | Prepare a clickable review target of the real build and UI evidence | Scoped review artifacts | UI QA approval |
| `review` | Find defects after the PR is open, publish on the host, clear P0/P1 via build handoff, mark ready for human | Review artifact + PR comments; no product code while reviewing | Accept/reject findings; human PR approval |
| `ship` | Prepare release and durable docs; create/push version tag when production cut is authorized | Docs only by default; tag/push only when authorized | Merge/release approval |

`spec`, `plan`, `build`, `review`, and `ship` are the portable core; every AIDF-compatible surface must expose them. `design`, `validate`, and `preview` are operational extensions, gated by tag or by project adoption of the gate layer. Do not confuse `design`'s mockup with `preview`'s review target — one is throwaway and precedes the plan, the other is the real implementation and follows the build. See [standards/ui-and-preview.md](../standards/ui-and-preview.md).

## Common invocation shape

```text
<command> [artifact or issue] [constraints]
```

## Output contract

Every command returns:

1. **Result** — what was produced or discovered.
2. **Files** — created, modified, or intentionally unchanged.
3. **Evidence** — checks and their exact outcomes, marked claimed or corroborated.
4. **Risks** — unresolved issues, assumptions, and follow-ups.
5. **Next action** — the smallest safe next step and its owner.

## Context and cost

Context is a budget, not a resource to exhaust. Loading an entire repository degrades output quality as reliably as it raises cost — a model given fifty files reasons worse about the three that matter.

**Load in this order, and stop when the task is answerable:** project manifest → local instructions → linked spec → current state → implementation plan → the specific source files named in the plan.

- Prefer targeted search over bulk reading. Read the file you identified, not the directory it lives in.
- The plan's change map exists so that `build` knows which files to open. Use it.
- **Resume from artifacts, never from chat history.** `project-state.md`, the plan, and branch history are the durable session state. A session that can only be continued by replaying a conversation is not resumable.
- Escalate to a more capable model for ambiguous design work, subtle debugging, and security review. Routine mechanical edits do not need one.
- Track cost per feature if the project cares about it — it is a project metric, not a framework rule. See "Process observability" in [standards/observability.md](../standards/observability.md).

A long session is a signal, not an achievement. If a task has not converged, the stop conditions in [03-workflow.md](03-workflow.md) apply.
