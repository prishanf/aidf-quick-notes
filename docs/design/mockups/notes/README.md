# Shared design mockup: Quick Notes

One throwaway static prototype for the notes home screen (create, list, edit, delete).

## Why this folder exists

AIDF’s `design` command defaults to copying `.aidf/reference/mockup/` into a **new** `mockups/<slug>/` per feature. Agents followed that literally for Features 1–3, which duplicated `css/tokens.css`, `js/shell.js`, `js/tailwind-boot.js`, seed data, and most of the notes screen.

This project’s convention: **extend this package** for later `ui` work on the same screen. Do not copy the scaffold again.

## Run it

```bash
npm run mockup:serve
# → http://127.0.0.1:3333/
```

## Layout

```text
notes/
  index.html          # hub: all screens + states
  notes.html          # the notes screen
  css/tokens.css      # symlink → app/assets/css/tokens.css
  css/mockup.css      # prototype-only styles
  data/seed.json      # shared fixtures (~32 notes)
  js/shell.js         # shared chrome / state picker / reset
  js/store.js         # in-memory fixtures + simulated API
  js/notes.js         # notes screen behaviour
  js/tailwind-boot.js
  serve.sh
  README.md
```

## Adding a future UI feature

1. Add states to `js/store.js` `STATES` and any simulated API helpers.
2. Extend `js/notes.js` (or add another `*.html` + `js/*.js` if a new screen appears).
3. Link the new states from `index.html` and this README.
4. Point the feature’s `docs/design/00N-*.md` Mockup location here — not a new sibling folder.

## Token layer

`css/tokens.css` is a symlink to `app/assets/css/tokens.css`. Do not hand-copy the file.
