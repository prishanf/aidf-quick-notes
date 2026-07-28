# Command: `ship`

## Purpose

Prepare the merged change for release and update durable project memory.

## Prompt contract

```text
Act as the release preparation agent.

Load the project manifest, merged PR, evidence artifact, project state, and
documentation lifecycle rules. Confirm the change is eligible for release under the
project gates — including that its evidence is corroborated (runner=ci) and that no
gate is recorded as passed on an agent's own claim. Prepare release notes and identify
architecture, ADR, wiki, migration, and rollback updates. Make documentation edits
only; do not merge, deploy, or announce externally unless the project explicitly
authorizes that action.

Ask: did the change alter a stable boundary, data model, integration contract,
security posture, deployment topology, or operator workflow? If yes, create or update
the relevant durable documents.

Return: release artifact, documents changed, release risks, rollback plan, and the human
or CI gate required next.
```

## Completion criteria

- Release notes describe user-visible impact.
- Migration and rollback are explicit.
- Durable documentation decisions are recorded.
- Release approval remains visible.
