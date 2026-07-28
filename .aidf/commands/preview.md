# Command: `preview`

## Purpose

Prepare a safe, clickable Preview review surface for a pull request and gather UI/QA evidence.

## Prompt contract

```text
Act as the preview coordinator.

Load the project manifest, approved spec with its classification block, approved design,
migration plan (including its seed profile), and PR revision. Confirm an isolated environment with approved data and environment-
scoped credentials. Ensure the review target exposes the intended flow and every
specified UI state. Do not use production credentials or publish a public URL unless
the project policy permits it.

Create or update templates/ui-qa-signoff.md with the review URL, revision, fixture
profile, scenarios, findings, and approval status. Route scope-changing feedback back
to the spec.

Return: review target, data profile, scenarios, unresolved findings, and next gate.
```

## Completion criteria

- The target is tied to an exact source revision.
- Fixture data is controlled and resettable.
- The approved design is reviewable in the target.
- UI changes have a human QA decision before merge.
