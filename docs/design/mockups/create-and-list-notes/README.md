# Create and list notes — design mockup

Throwaway static prototype for the design gate. **Do not copy this markup into the Nuxt app.** Only `css/tokens.css` (a copy of `app/assets/css/tokens.css`) is shared with the product.

## Run

```bash
npm run mockup:serve
# or: sh docs/design/mockups/create-and-list-notes/serve.sh
```

Open http://127.0.0.1:5500/ — do **not** open the HTML via `file://`.

## What to exercise

1. Notes screen density with 32 fixture rows
2. Empty / loading / error / forbidden via the state selector or index links
3. Validation: submit with an empty title
4. Create a note, then **Reset fixtures**
5. Narrow viewport (&lt; 40rem) and keyboard focus

## Screens

| File | Purpose |
|---|---|
| `index.html` | Reviewer overview |
| `notes.html` | Create form + list |
