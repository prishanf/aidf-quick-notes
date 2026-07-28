# Design mockup scaffold

A working, copy-ready static prototype for the **design gate** — the throwaway artifact a human clicks through to approve layout, density, and flow *before* an implementation plan is written. See [standards/ui-and-preview.md](../../standards/ui-and-preview.md) for what this gate is, and how it differs from Preview.

**This is a reference, not the contract.** Any structure that satisfies the required properties below is fine. The scaffold exists because the alternative — every design agent inventing a prototype layout from scratch — reliably produces a single enormous `index.html` with inlined data, three placeholder rows, no error state, and no way to run it.

## Run it

```bash
sh serve.sh
```

Then open <http://127.0.0.1:5500/>. Add a port to change it: `sh serve.sh 4400`.

**Opening the HTML files directly will not work**, and this is the single most common way a mockup gets reported as broken. The pages read their fixtures with `fetch('./data/seed.json')`, which the browser refuses under `file://`. The scaffold detects this and shows an explanatory message instead of an empty page — but the fix is always to serve the folder.

## Copy it into a project

```bash
cp -r reference/mockup <documents.designs>/mockups/<feature-slug>
cp <ui.tokens> <documents.designs>/mockups/<feature-slug>/css/tokens.css
```

Then, in order:

1. Replace `css/tokens.css` with the project's real token layer — the file named as `ui.tokens` in `project.yaml`. Do not edit the values in the copy; if a token is missing, add it to the application's file and re-copy. A forked palette means the design approval covers colours the product does not have.
2. Replace `data/seed.json` with fixtures for this feature, at **realistic volume**. Thirty rows expose the layout problems three rows hide; that is the whole reason the mockup exists.
3. Rename and rewrite the screens to match the design doc — one file per screen.
4. Rewrite `index.html`'s "What to exercise" list with the questions this design gate is actually asking.
5. Add `commands.mockup_serve` to `project.yaml` so the handoff can name one command.

## What is here

| Path | Purpose | Ships? |
|---|---|---|
| `index.html` | Entry point: screen index, every state as a link, reviewer notes | no |
| `list.html` + `js/list.js` | The data-dense screen — table, filters, totals, create dialog | no |
| `detail.html` + `js/detail.js` | The form screen — per-field validation, save confirmation | no |
| `css/tokens.css` | **The application's token layer**, copied verbatim | it already does |
| `css/mockup.css` | Prototype-only styling: banner, skeleton, focus ring | no |
| `data/seed.json` | Fabricated fixtures, shared by every screen | no |
| `js/store.js` | Loads fixtures, holds mutations in memory, resets, shared formatters | no |
| `js/shell.js` | Reviewer chrome: nav, state switcher, theme toggle, reset; empty/loading/error renderers | no |
| `js/tailwind-boot.js` | Loads the token layer into Tailwind's browser build | no |
| `serve.sh` | One command to serve over HTTP | no |

Only `css/tokens.css` crosses into the application, and it crosses **inward**: the mockup reads the app's tokens. Copying the other direction — lifting this markup into the real build — is prohibited, and is how a prototype's shortcuts (no error handling, no real data model, no auth, no server-side validation) end up shipping.

## Required properties

A mockup satisfies the design gate when:

- [ ] it runs over HTTP with one command;
- [ ] one file per screen, with shared `css/` and `data/` so screens cannot drift;
- [ ] it loads the project's token layer and uses Tailwind the way the application does;
- [ ] every state in the design doc — empty, loading, success, validation error, permission error — is reachable **by a click**, not described;
- [ ] fixtures live in `data/*.json` at realistic volume, never inlined in markup;
- [ ] a visible control resets the fixtures so a scenario can be re-run;
- [ ] data-dense content scrolls inside its own container and the page body never scrolls sideways;
- [ ] it is roughly correct at the project's declared breakpoints;
- [ ] focus is visible and the tab order is sensible;
- [ ] the README names what the reviewer should exercise.

## How Tailwind is wired, and why it looks odd

Every page loads two scripts, in this order, and the order is not negotiable:

```html
<script src="./js/tailwind-boot.js"></script>
<script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
```

The boot script synchronously inlines `css/tokens.css` as a `<style type="text/tailwindcss">` element, and Tailwind's browser build then compiles it. Three behaviours of `@tailwindcss/browser` forced this shape — each verified against the real bundle, each failing **silently** if you get it wrong:

1. **It resolves no `@import` URLs.** `@import "./css/tokens.css"` inside the style tag — the obvious approach — compiles to an empty stylesheet with no console error. Absolute URLs fail the same way.
2. **It must be loaded by a parser-blocking `<script src>`.** Injecting the theme from a module after load never triggers a rebuild, so nothing is styled.
3. **It does not add the framework layers implicitly once a page supplies its own theme content.** `tokens.css` therefore keeps its own `@import "tailwindcss";` at the top. Remove that line and the page compiles the `.dark` rule and nothing else.

Two further notes on the token file:

- It uses **`@theme static`**, not `@theme`. By default Tailwind v4 emits only the theme variables its utilities actually used, so a hand-written rule referencing `var(--color-bg)` resolves to nothing. `static` emits all of them, which is what lets `mockup.css` and the application's own CSS share the names.
- Watch for `/* … p-*/ … */` in comments: `*/` inside a utility name like `p-*` closes the comment early and silently invalidates the rest of the file. This cost real debugging time; it is written down so it costs none next time.

**Offline or air-gapped review:** replace the CDN script with a stylesheet compiled once —

```bash
npx @tailwindcss/cli -i css/tokens.css -o css/tailwind.css --content './**/*.{html,js}'
```

— commit it into `css/`, and link it instead. What must not happen is falling back to a hand-written palette.

## Feedback

Feedback on a mockup belongs in the **design document**, before planning. Nothing is built yet, so layout, flow, and scope can change freely and cheaply — that is the point of holding this gate first. Feedback on a pull request is a different, later, and more expensive conversation.

Once the plan is approved, delete or archive the mockup. It is a decision aid, not a deliverable.
