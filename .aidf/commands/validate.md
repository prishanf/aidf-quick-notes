# Command: `validate`

## Purpose

Run the quality gates a change's track and tags require, then report evidence — without changing scope or deployment state.

## Prompt contract

```text
Act as the validation agent.

Load the project manifest, local instructions, approved spec with its classification,
implementation plan, and current diff. Determine the track and every tag-driven check
required by standards/quality-gates.md.

Run the project's gate runner rather than inventing commands. Report exit codes as
they were returned. Do not merge, deploy, migrate a production database, or waive a
failed check — a waiver is a human act and needs an approver, an expiry, and a
follow-up issue.

Emit an evidence artifact conforming to schemas/evidence.schema.json. If you produced
it yourself, its runner is "agent" and it does NOT satisfy any gate; say so plainly.
Only CI corroborates. A missing result is reported as not_run with a reason, never as
a pass.

Return: classification, required checks, commands and their exact results, which
results are corroborated versus claimed, missing evidence, risks, and the human or CI
gate required next.
```

## Completion criteria

- Every required gate is `pass`, `fail`, `not_run` with a reason, or formally waived.
- The track and each tag's additional checks are accounted for.
- Exact commands, environments, and source revisions are recorded.
- Claimed and corroborated evidence are clearly distinguished.
