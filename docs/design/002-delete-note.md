---
type: design
track: C
required_when: "the change carries the `ui` tag"
status: approved
owner: prishanf
updated: 2026-07-28
spec: docs/specs/002-delete-note.md
---

# Design: Delete a note

## User goal

Remove one unwanted note from the home-page list, after an explicit confirmation, knowing it cannot be undone.

## Flow

```mermaid
flowchart TD
  list[Notes list with Delete on each row] --> click[Click Delete]
  click --> confirm[Confirm dialog]
  confirm -->|Cancel / backdrop| list
  confirm -->|Delete note| pending[Deleting…]
  pending -->|204| gone[Note removed from list]
  pending -->|500| delErr[Delete error alert; note remains]
  pending -->|404| missing[Not-found alert; other notes unchanged]
  gone -->|list empty| empty[Empty state + create form]
  gone -->|list remains| list
```

## States

| State | User sees | Available actions |
|---|---|---|
| Empty | Form + dashed empty panel: “No notes yet” | Create a note |
| Loading | Skeleton rows where the list will be | Wait |
| Success | Form + list; each row has a **Delete** control | Create; open delete confirm |
| Confirm | Modal: “Delete this note?” with title quoted; Cancel + danger **Delete note** | Cancel or confirm |
| Delete in progress | Same dialog; primary danger button shows “Deleting…” and is disabled | Wait |
| Delete success | Note gone; optional “Note deleted.” status line | Continue |
| Delete server error | Alert above list; all notes including the target still listed | Dismiss; retry delete |
| Delete not found (404) | Alert that the note was not found; other notes unchanged | Dismiss |
| Validation error | Red border + message under title (create form) | Correct and resubmit |
| Server error (load) | Alert with “Try again” | Reload / retry |
| Permission error | Alert without retry (illustrative; no real auth yet) | None in this example |

## UI foundation

- Is this the project's first `ui` change? `no`
- Foundation document: `docs/design/ui-foundation.md` — extended by this change
- Tokens added or changed: none (reuse existing danger, surface-raised, modal z-index, shadows)
- Components added to inventory: Button (danger), Confirm dialog, Delete row control

## Mockup

Static HTML/CSS/JS with fabricated data. **Throwaway — do not reuse markup as the implementation.** Only the token layer is shared with the app.

- Location: `docs/design/mockups/delete-note/`
- Run it with: `npm run mockup:serve` (serves over HTTP; do not open as a file)
- Screens/states covered: Notes screen; success, confirm, deleting, delete-error, delete-missing, empty, loading, server error, permission error, validation error
- Fixture volume: 32 notes in `data/seed.json`
- Token layer used: `app/assets/css/tokens.css` (copied to mockup `css/tokens.css`)
- Not required, because: n/a

## Accessibility and compatibility

- Keyboard: tab to Delete; focus moves into dialog (Cancel first); Escape/Cancel/backdrop dismiss when not deleting; visible focus ring
- Screen reader: Delete buttons have accessible names including note title; dialog uses `role="dialog"` + `aria-modal` + labelled title; delete errors use `role="alert"`; success announced via live region
- Responsive behavior: single column; confirm dialog full-width on narrow, centered card from `sm`; content max ~42rem
- Localization: English copy; en-US date-time formatting (unchanged)

## Acceptance notes

- [ ] Reviewer can delete a note after confirming and see it leave the list
- [ ] Confirm names the note and makes Cancel vs Delete obvious
- [ ] delete-error and delete-missing are reachable and leave other notes intact
- [ ] Empty state appears after the last note is deleted
- [ ] Narrow width and keyboard focus remain usable

## Approval

- Decision: `approved`
- Approver: prishanf
- Date: 2026-07-28
- Notes: Approved together with the clickable mockup. Plan may proceed.

## Agent instruction

Do not write an implementation plan until `Approval.decision` is `approved`. The approved design and mockup — not later chat — are the source of truth for build. Do not copy mockup markup into the Nuxt application. UI foundation already exists; this design only extends the component inventory.
