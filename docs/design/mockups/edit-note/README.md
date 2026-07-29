# Design mockup: Edit a note

Feature 3 — inline note editing with validation and error handling.

## Run it

```bash
npm run mockup:serve
# Then open http://localhost:3333/docs/design/mockups/edit-note/
```

## Prototype coverage

- **Notes screen** — create form + list with Edit and Delete on each row (new)
- **Edit in progress** — row transforms to inline form (title + body inputs, Save + Cancel buttons)
- **Validation error** — red border + inline error message if title is empty or too long
- **Save in progress** — Save button shows "Saving…" and is disabled; inputs remain editable
- **Save success** — row reverts to view mode; timestamp updates; optional success feedback
- **Save error** — alert above list; row remains in edit mode with input preserved
- **Not found** — alert if note was deleted; other notes unaffected; row reverts to view
- **List states** — loading skeleton, empty, server error (all reachable by URL params)

## State URL params

- `?state=edit` — first note in edit mode (pre-filled)
- `?state=saving` — first note saving
- `?state=validation-error` — empty title validation error shown
- `?state=save-error` — server error alert shown; row in edit mode
- `?state=not-found` — note-not-found alert shown; row reverted
- `?state=loading` — loading skeleton
- `?state=empty` — zero notes; create form only
- Default (no param) — success with 32 notes

## Not in scope for this mockup

- Backend server or API (all operations are simulated in the store)
- Markdown, rich text, or code editing
- Undo/version history
- Collaborative editing or conflict detection
- Multi-user ownership or permissions

## Key design decisions

1. **Inline edit** (not modal): row transforms in place; cleaner list experience for single edits
2. **Partial updates**: user can edit title, body, or both (more flexible than create)
3. **Last write wins**: no optimistic locking or conflict detection (acceptable for local, single-user example)
4. **Timestamp updates**: `updated_at` advances on save; `created_at` unchanged
5. **Validation inline**: same rules as create (title 1–120 chars, body ≤5000 chars)
6. **Error preservation**: validation/save errors leave the form intact; user input is not cleared

## Tokens and styles

- Uses shared `css/tokens.css` (primary, danger, success, text-muted, focus ring, etc.)
- CSS is throwaway; only the token layer is reused in the real app
- Tailwind 4 `@tailwindcss/browser` for rapid prototyping

## Note schema (fixture)

```typescript
interface Note {
  id: string;
  title: string;
  body: string;
  created_at: ISO8601;
  updated_at: ISO8601;
}
```

32 sample notes are in `data/seed.json` (same seed as Feature 1).
