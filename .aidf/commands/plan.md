# Command: `plan`

## Purpose

Convert an approved feature spec into a bounded repository implementation plan.

## Prompt contract

```text
Act as the planning agent.

Load the project manifest, local instructions, conventions document, approved spec
with its classification block, current project state, and the repository areas the
spec touches. Inspect before proposing edits.

Produce templates/implementation-plan.md with repository findings, a change map,
ordered implementation steps, data/migration considerations, verification commands,
risks, assumptions, and a completion checklist. Do not implement the plan.

State assumptions explicitly and separately. A named assumption becomes a stop
condition for the build agent if the repository later contradicts it; an unnamed one
becomes a silent defect.

Do not re-classify the change — the track and tags were set at spec approval. If the
repository shows the classification is wrong, say so and send it back rather than
quietly planning to a different risk level.

If the change is tagged `ui`, treat the approved design and its mockup as authoritative
for layout and flow — reference specific screens/states from it in the change map
rather than re-deciding UI structure in the plan. If the plan reveals the mockup missed
something material, say so and send it back to the design gate; do not quietly design
around it here. Complete the plan's "UI foundation" section: name the approved
ui-foundation document and the token layer, and if this is the project's first `ui`
change, sequence the token layer and Tailwind wiring BEFORE the first component. List
any token a scale is missing rather than planning a one-off value into a component.

If the change is tagged `database`, the plan's "Data and migration" section is not
optional prose. Produce or update templates/data-model.md — ERD, data dictionary,
classification, retention, authorization mapping — before the migration is written, not
as a transcription of a schema you already changed. Answer every field in that section
or write `none` with a reason.

If the change is tagged `api`, complete the "API surface" section: list every endpoint
added or changed and name, for each one, the test file that will exercise it through
the real router. Helper-function unit tests do not count as endpoint coverage — see
standards/testing.md. If you cannot name a test file per endpoint, the plan is not
ready to submit.

Flag any mismatch between the approved spec and the repository.

For Track B and Track C, the plan's `Approval` block is a hard gate, not a
recommendation: leave `Approval.decision` as `pending` and tell the human explicitly
that implementation must not begin until they set it to `approved`. Track A has no
plan document and this gate does not apply to it.

Return: plan, assumptions, risks, files to inspect or change, and the explicit
statement that build must wait for plan approval (Track B/C) or that no plan approval
gate applies (Track A).
```

## Completion criteria

- The plan names likely files and tests.
- The sequence is incremental and reversible.
- Verification is concrete and uses the manifest's commands.
- Assumptions are listed separately from findings.
- `database`: a data model document with ERD and data dictionary exists and matches the planned migration.
- `api`: every endpoint added or changed is paired with a named HTTP-level test file.
- `ui`: the UI foundation and token layer are named, and precede components when this is the first `ui` change.
- Scope drift and classification mismatches are surfaced, not absorbed.
- For Track B/C, `Approval.decision` is left `pending` and the response states plainly that build must wait for it.
