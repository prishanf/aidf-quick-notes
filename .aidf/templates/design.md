---
type: design
track: B
required_when: "the change carries the `ui` tag"
status: draft
owner: ""
updated: YYYY-MM-DD
spec: ""
---

# Design: <experience>

## User goal

<What the user is trying to accomplish.>

## Flow

```mermaid
flowchart TD
    start[Entry] --> action[User action]
    action --> success[Success]
    action --> error[Recoverable error]
```

## States

| State | User sees | Available actions |
|---|---|---|
| Empty | <message> | <action> |
| Loading | <indicator> | <action or wait> |
| Success | <result> | <next actions> |
| Error | <plain-language explanation> | <recovery> |

## UI foundation

- Is this the project's first `ui` change? `<yes / no>`
- Foundation document: `<path to ui-foundation.md>` — <created by this change / already exists, unchanged / extended by this change>
- Tokens added or changed: <list, or "none">

If this is the first `ui` change, [ui-foundation.md](ui-foundation.md) is written now and approved together with this design. If one already exists, this design works within it — see [standards/ui-and-preview.md](../standards/ui-and-preview.md).

## Mockup

A static HTML/CSS/JS artifact, built with mock data, that a human can actually click through — not a description of one. Required by default for `ui`-tagged Track B/C changes; see [standards/ui-and-preview.md](../standards/ui-and-preview.md) for what "covers" means and when skipping it is legitimate. Copy [reference/mockup/](../reference/mockup/) rather than inventing a structure.

This is **not** the Preview environment. It is throwaway, built before planning, and gates the plan approval below — not the PR.

- Location: `<path, e.g. docs/design/mockups/<slug>/index.html>`
- Run it with: `<command, e.g. sh docs/design/mockups/<slug>/serve.sh>` — it must be served over HTTP, not opened as a file
- Screens/states covered: <list, or "all states above">
- Fixture volume: <e.g. "32 records across 5 categories" — realistic, not three placeholder rows>
- Token layer used: `<path>` — the same file the application reads
- Not required, because: `<n/a | one-line reason, visible to the approver>`

Structural requirements (from the standard): one file per screen; shared `css/` and `data/`; fixtures in JSON, never inlined; a visible fixture reset; Tailwind wired the way the application wires it; responsive at the declared breakpoints.

## Accessibility and compatibility

- Keyboard: <behavior>
- Screen reader: <labels and announcements>
- Responsive behavior: <breakpoints or adaptation>
- Localization: <text, dates, numbers>

## Acceptance notes

- [ ] <observable interaction>

## Approval

- Decision: `pending | approved | rejected`
- Approver: <name or role, human design/product owner>
- Date: YYYY-MM-DD
- Notes: <trade-offs or conditions>

## Agent instruction

Do not mark `Approval.decision` as `approved` while the Mockup section is blank and unexplained — either a location is filled in, or "Not required, because" states a specific, checkable reason. Do not write an implementation plan against this design until `Approval.decision` is `approved`. If review feedback changes the flow, states, or scope, update this document — and the mockup, if one exists — and return it for re-approval before planning.

If this is the project's first `ui` change, do not submit this design without [ui-foundation.md](ui-foundation.md) alongside it. The reviewer is looking at the mockup anyway, and the mockup is rendered in the very tokens they are being asked to accept — approving one without the other approves a palette nobody reviewed.
