---
type: conventions
track: project-setup
required_when: "recommended for any repository an agent will work in"
status: current
owner: ""
updated: YYYY-MM-DD
---

# Codebase conventions

Agents are told to "follow existing patterns". This document is what that sentence points at. Without it, every agent re-derives the project's style from whichever files it happened to read, and the codebase drifts one plausible-looking file at a time.

Keep it short and true. A convention nobody follows is worse than an undocumented one, because it teaches the agent a pattern the codebase will contradict.

## Orientation

- **What this system does:** <one paragraph>
- **Entry points:** `<path>` — <what starts here>
- **Where the domain logic lives:** `<path>`
- **Where the tests live:** `<path>` — <naming pattern>
- **Generated code — never edit by hand:** `<paths>`

## Reference implementations

The fastest way to convey a pattern is to name a file that does it correctly.

| To add a... | Copy the shape of | Notes |
|---|---|---|
| API endpoint | `<path>` | <what makes it exemplary> |
| Database query / repository | `<path>` | |
| UI component | `<path>` | |
| Background job | `<path>` | |
| Test | `<path>` | |

## Established patterns

- **Error handling:** <approach — exceptions, result types, error boundaries>
- **Validation:** <where it happens and with what>
- **Logging:** <structured? correlation fields? what must never be logged>
- **Configuration:** <how config and secrets are read>
- **State management:** <approach>
- **Naming:** <casing, file naming, module layout>

## Deliberate deviations

Places where the codebase knowingly does something unusual, and why. This section prevents an agent from "fixing" a decision.

| Where | What looks wrong | Why it is that way |
|---|---|---|
| `<path>` | <apparent smell> | <reason> |

## Known inconsistencies

Where the codebase contradicts itself, and which side is correct going forward. Agents will find these; better they find the answer here than pick one at random.

| Pattern | Old form | Current form | Migrating? |
|---|---|---|---|
| <e.g. data fetching> | `<old>` | `<new>` | <yes/no, and whether to convert files you touch> |

## Do not

- <thing that looks reasonable but breaks something non-obvious>
- <dependency or API that is being removed>
