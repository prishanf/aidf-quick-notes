---
type: design
track: C
required_when: "the change carries the `ui` tag"
status: approved
owner: prishanf
updated: 2026-07-28
spec: docs/specs/003-edit-note.md
---

# Design: Edit a note

## User goal

Correct a note's title and/or body directly in the list without deleting and recreating, and see the change saved immediately.

## Flow

```mermaid
flowchart TD
  list[Notes list with Edit on each row] --> click[Click Edit]
  click --> row[Row becomes inline edit form]
  row --> submit[Submit; Save or Cancel]
  submit -->|Cancel| list
  submit -->|Save| pending[Saving…]
  pending -->|200| updated[Row shows new content]
  pending -->|400| valErr[Validation error inline]
  pending -->|404| missing[Not-found alert; other notes unchanged]
  pending -->|500| saveErr[Save error alert; row reverts to view mode]
  updated --> list
  valErr --> row
  saveErr --> list
  missing --> list
```

## States

| State | User sees | Available actions |
|---|---|---|
| View (list) | Each note row: title, body or —, timestamp, **Edit** + Delete controls | Create note; click Edit; click Delete |
| Edit in progress | Row transforms to inline form: title input + body textarea, **Save** + **Cancel** buttons; focus moves to title input | Edit title/body; Submit or Cancel |
| Validation error | Inline edit form remains; red border + message under field(s); focus stays in form | Correct and resubmit; or Cancel |
| Save in progress | Save button shows "Saving…" and is disabled; Cancel remains enabled | Wait or Cancel (optional) |
| Save success | Row reverts to view mode; shows updated title/body/timestamp; optional success feedback | Continue editing; create another note |
| Save error | Alert above list; row remains in edit mode with user's unsaved input preserved | Fix and retry, or Cancel to discard |
| Not found (404) | Alert that the note was not found; other notes unchanged; row reverts to view mode | Dismiss |
| List load error | Alert with "Try again" | Reload / retry |

## UI foundation

- Is this the project's first `ui` change? `no`
- Foundation document: `docs/design/ui-foundation.md` — extended by this change
- Tokens added or changed: none (reuse existing danger for validation, success for save feedback, focus ring)
- Components added to inventory: Edit row control, Inline edit form (title + body inputs), Save/Cancel buttons in row context

## Mockup

Static HTML/CSS/JS with fabricated data. **Throwaway — do not reuse markup as the implementation.** Only the token layer is shared with the app.

- Location: `docs/design/mockups/edit-note/`
- Run it with: `npm run mockup:serve` (serves over HTTP; do not open as a file)
- Screens/states covered: Notes list with Edit control visible on each row; note in edit mode (inline form); validation error during edit; save in progress; save success; save error; not-found error; plus all list states (success, loading, empty, server error)
- Fixture volume: 32 notes in `data/seed.json` (same seed as Feature 1)
- Token layer used: `app/assets/css/tokens.css` (copied to mockup `css/tokens.css`)
- Not required, because: n/a

## Accessibility and compatibility

- Keyboard: tab through list row controls (Edit, Delete); Enter or Space to activate Edit; within edit form, tab through title, body, Save, Cancel; Escape cancels edit; visible focus ring on all controls
- Screen reader: Edit and Delete buttons have accessible names; inline form uses `<label>` + `aria-invalid` for validation; error messages associated with fields; save states announced via live region; list updates announced when edit completes
- Responsive behavior: single column; edit form takes full row width; inputs use token-based sizing; checked at base and `sm`+; no sideways scroll
- Localization: English copy; en-US date-time formatting

## Acceptance notes

- [ ] Reviewer can click Edit on a note and see the row transform to an inline form
- [ ] Title and body inputs are pre-filled with the current note content
- [ ] Reviewer can change title and/or body and click Save; the row updates with the new content and timestamp
- [ ] Validation errors (empty title, oversized inputs) appear inline with a red border and message
- [ ] Save error and not-found alerts are reachable and leave the row in edit mode (error) or reverted to view (404)
- [ ] Clicking Cancel reverts the row to view mode without saving
- [ ] List remains scannable; no sideways scroll; keyboard focus and single-column layout work on narrow viewports
- [ ] Empty, loading, and list-error states are reachable by click and unaffected by edit controls

## Approval

- Decision: `approved`
- Approver: prishanf
- Date: 2026-07-28
- Notes: Interactive mockup reviewed and approved. All states (edit form, validation error, save error, not found, loading, empty) reachable via URL params. Inline row edit pattern confirmed; partial updates (title, body, or both) UI working. Ready for implementation planning.

## Agent instruction

Do not implement from this document until `Approval.decision` is `approved`. The approved design and mockup — not later chat — are the source of truth for build. Do not copy mockup markup into the Nuxt application. UI foundation already exists; this design only extends the component inventory.
