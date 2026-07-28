# Delete a note — design mockup

Throwaway static prototype for the Feature 2 design gate. **Do not copy this markup into the Nuxt app.** Only `css/tokens.css` (a copy of `app/assets/css/tokens.css`) is shared with the product.

## Run

```bash
npm run mockup:serve
# or: sh docs/design/mockups/delete-note/serve.sh
```

Open http://127.0.0.1:5500/ — do **not** open the HTML via `file://`.

## What to exercise

1. Per-row **Delete** on the 32-note list
2. Confirm dialog: Cancel vs Delete note; note title in the copy
3. Successful delete and empty state after the last note
4. `delete-error` and `delete-missing` via the state selector (confirm a delete)
5. Feature 1 carry-over: empty / loading / error / forbidden / validation
6. Narrow viewport and keyboard focus
7. **Reset fixtures** after deletes

## Screens

| File | Purpose |
|---|---|
| `index.html` | Reviewer overview |
| `notes.html` | Create form + list + delete confirm |
