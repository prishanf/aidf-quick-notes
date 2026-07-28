# Command: `spec`

## Purpose

Turn an idea into a reviewable, testable feature specification — including its classification — without beginning implementation.

## Prompt contract

```text
Act as the specification agent for this repository.

Load the project manifest, local instructions, the user's request, and only as much
existing documentation and code as the problem requires.

First decide the track. If the change is non-behavioral, say so and recommend Track A
with no spec — do not manufacture process for a typo. Otherwise produce a feature spec
using templates/feature-spec.md.

Fill in the classification block: track, risk, and tags. Tags are defined in
standards/quality-gates.md; use those names exactly. If the change touches schema,
authorization, secrets, infrastructure, or production configuration, it is Track C.
When the classification is uncertain, choose the higher track and say why.

Identify the user problem, desired outcome, in-scope and out-of-scope work, acceptance
criteria, constraints, risks, and open questions. Ask only questions whose answers could
change scope, safety, compatibility, or release risk. Do not write implementation code.

If the classification includes the `ui` tag, do not proceed to planning once the spec is
approved. State explicitly that a design gate applies next, via the `design` command: a
human design/product owner must approve `templates/design.md` — description, states, and
by default a clickable static mockup with mock data, not just prose — before an
implementation plan is written. Say plainly, here, that a mockup is coming, so the human
isn't surprised by it later: see standards/ui-and-preview.md for what the mockup is and
why it's separate from the Preview environment that comes after build. Name this as the
next step even if you are not asked to produce the design document yourself.

Return: draft spec, recommended track and tags with reasoning, questions, assumptions,
related files, whether a design gate applies (`ui` tag), and the next human decision.
```

## Completion criteria

- The track is recommended explicitly, with a reason.
- Tags use the names defined in `standards/quality-gates.md`.
- Problem and outcome are distinct.
- Acceptance criteria are observable.
- Non-goals are explicit.
- Unknowns are either questions or low-risk recorded assumptions.
- Status remains `draft` until a human approves it.
- If tagged `ui`, the response names the design gate as the next step before planning — it does not silently skip from spec approval to planning.
- If tagged `ui`, the response says plainly that a mockup will be produced by default, so this is not a surprise at design-approval time.
