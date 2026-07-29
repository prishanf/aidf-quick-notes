---
type: ui-foundation
track: C
required_when: "the first `ui`-tagged change in a project; updated by later changes, never re-invented"
status: approved
owner: prishanf
updated: 2026-07-28
spec: docs/specs/002-delete-note.md
tokens_source: app/assets/css/tokens.css
tailwind_config: ""
---

# UI foundation: AIDF Quick Notes

Approved with Feature 1. Feature 2 extends the component inventory only (confirm dialog + danger button); no new colour or type tokens.

## Brand basics

| | Value |
|---|---|
| Product name (as displayed) | AIDF Quick Notes |
| One-line positioning | A tiny local notes app for exercising the AI Development Framework |
| Voice and tone | Plain, calm, second person ("you"); no exclamation marks |
| Logo assets | None — wordmark text only |
| Favicon / app icon | `public/favicon.ico` (Nuxt default until replaced) |
| Existing brand constraints | none — this document sets them |

## Colour

### Semantic roles

| Role | Token | Light | Dark | Used for |
|---|---|---|---|---|
| Page background | `--color-bg` | `#f4f4f5` | `#18181b` | Canvas |
| Surface | `--color-surface` | `#ffffff` | `#27272a` | Panels, list |
| Surface (raised) | `--color-surface-raised` | `#ffffff` | `#3f3f46` | Dialogs (later) |
| Surface (sunken) | `--color-surface-sunken` | `#e4e4e7` | `#09090b` | Active nav chrome |
| Border / divider | `--color-border` | `#78716c` | `#a8a29e` | Hairlines, inputs |
| Border strong | `--color-border-strong` | `#57534e` | `#d6d3d1` | Emphasized edges |
| Text (primary) | `--color-text` | `#1c1917` | `#fafaf9` | Body copy |
| Text (muted) | `--color-text-muted` | `#57534e` | `#a8a29e` | Hints, timestamps |
| Brand / primary action | `--color-primary` | `#0f766e` | `#2dd4bf` | Primary buttons |
| Primary hover | `--color-primary-hover` | `#0d9488` | `#5eead4` | Hover fill |
| On-primary | `--color-primary-fg` | `#ffffff` | `#042f2e` | Text on primary |
| Focus ring | `--color-focus` | `#0f766e` | `#2dd4bf` | Keyboard focus |
| Success | `--color-success` | `#166534` | `#4ade80` | Confirmations |
| Warning | `--color-warning` | `#92400e` | `#fbbf24` | Recoverable issues |
| Danger | `--color-danger` | `#b91c1c` | `#f87171` | Validation errors |
| On-danger | `--color-danger-fg` | `#ffffff` | `#450a0a` | Text on danger fill |

### Contrast

| Foreground on background | Ratio | Required | Pass |
|---|---|---|---|
| text on bg (`#1c1917` / `#f4f4f5`) | 15.91:1 | 4.5:1 | yes |
| text-muted on surface (`#57534e` / `#ffffff`) | 7.63:1 | 4.5:1 | yes |
| primary-fg on primary (`#ffffff` / `#0f766e`) | 5.47:1 | 4.5:1 | yes |
| danger on surface (`#b91c1c` / `#ffffff`) | 6.47:1 | 4.5:1 | yes |
| border on surface (`#78716c` / `#ffffff`) | 4.80:1 | 3:1 | yes |
| focus ring on bg (`#0f766e` / `#f4f4f5`) | 4.98:1 | 3:1 | yes |

**Colour is never the only signal.** Validation uses text + `aria-invalid` + field association, not red alone. Empty body shows an em dash, not muted colour alone.

## Typography

| | Value |
|---|---|
| Display / heading family | Source Sans 3, fallback Segoe UI / system-ui |
| Body family | Same as display (one family keeps this example simple) |
| Monospace / numeric family | ui-monospace / SF Mono / Menlo |
| Loading strategy | System stack first; optional CDN for Source Sans 3 with `font-display: swap` if we add webfonts later |
| Numerals in data views | Default proportional; no financial columns in this product |

### Type scale

| Token | Size | Line height | Weight | Used for |
|---|---|---|---|---|
| `--text-xs` | 0.75rem | 1.4 | 400 | Timestamps, hints |
| `--text-sm` | 0.875rem | 1.45 | 400 | Secondary copy |
| `--text-base` | 1rem | 1.55 | 400 | Body, inputs |
| `--text-lg` | 1.125rem | 1.4 | 600 | Section headings |
| `--text-xl` | 1.5rem | 1.3 | 600 | Page titles |
| `--text-2xl` | 1.875rem | 1.2 | 600 | Rare hero (scaffold only) |

## Space, shape, elevation, motion

| Scale | Tokens | Values | Notes |
|---|---|---|---|
| Spacing | `--spacing` base | 0.25rem | Tailwind spacing multiples |
| Radius | `--radius-sm/md/lg` | 4 / 8 / 12 px | Inputs sm/md; panels md/lg |
| Border width | 1px | — | Default hairline |
| Elevation | `--shadow-sm/md/lg` | soft stone-tinted | Form card uses sm |
| Motion duration | fast/base/slow | 120 / 200 / 320 ms | Prefer opacity/transform only |
| Motion easing | `--ease-out` | cubic-bezier(0.22, 1, 0.36, 1) | — |
| Z-index | dropdown/sticky/overlay/modal/toast | 10 / 20 / 30 / 40 / 50 | No ad-hoc z-index |

## Breakpoints and layout

| Name | Min width | Layout behaviour at this size |
|---|---|---|
| base (mobile) | `0` | Single column; form above list; full-width inputs |
| `sm` | 40rem | Same column; slightly wider content |
| `md` | 48rem | Content max ~42rem centered |
| `lg` | 64rem | Unchanged — notes stay narrow by design |
| `xl` | 80rem | Unchanged |

- **Design order:** mobile-first
- **Content max width:** `42rem` (`max-w-2xl`) for the notes page
- **Application shell:** product name + page title; no sidebar
- **Data-dense views:** vertical list of notes; page body does not scroll sideways

## Tailwind mapping

| | Value |
|---|---|
| Tailwind version | 4.x (`@tailwindcss/vite` in Nuxt; `@tailwindcss/browser` in mockup) |
| Token layer | `app/assets/css/tokens.css` |
| Theme wiring | v4 `@theme static` inside the token layer |
| Global stylesheet | `app/assets/css/main.css` imports tokens then base body rules |
| Component classes / library | Utilities only for Feature 1; no component library yet |
| Dark mode strategy | `class` on `<html>`; mockup toggle for review |

### The rules that keep it consistent

1. Every design value comes from a token.
2. Arbitrary values only for one-off layout maths — never colour, type size, or spacing.
3. Token layer is framework-agnostic CSS custom properties via `@theme`.
4. One place declares base element styles (`main.css`).
5. `!important` and arbitrary `z-index` are review findings.

## Component inventory

| Component | Purpose | States | Implementation | Status |
|---|---|---|---|---|
| Button (primary) | Save note | default, hover, focus-visible, disabled, loading | Feature 1 page | shipped |
| Button (danger) | Confirm destructive delete | default, hover, focus-visible, disabled, loading | Feature 2 | planned |
| Button (secondary / border) | Cancel in dialog; dismiss alert | default, hover, focus-visible, disabled | Feature 1 + 2 | shipped / planned |
| Input / textarea | Title and body | default, focus, invalid + message | Feature 1 page | shipped |
| Form row / label | Label, hint, error | — | Feature 1 page | shipped |
| Note list | Vertical list of notes | empty, loading, success | Feature 1 page | shipped |
| Delete row control | Per-note delete affordance | default, focus-visible | Feature 2 | planned |
| Confirm dialog | Hard-delete confirmation | open, deleting | Feature 2 | planned |
| Empty state | First-run zero notes | — | Feature 1 page | shipped |
| Loading / skeleton | Initial fetch | — | Feature 1 page | shipped |
| Inline alert | Server / permission / delete error | error | Feature 1 + 2 | shipped / planned |
| Toast | Deferred — form status line for Feature 1 | — | — | deferred |
| Rendered Markdown content | Safe CommonMark subset display of a note body | plain text (unchanged), formatted, raw-HTML-escaped, unsafe-link-neutralized | Feature 4 | planned |
| Body Write/Preview toggle | Switch a body field between raw textarea and rendered preview | write (default), preview, preview-empty, disabled while saving | Feature 4 | planned |

## Accessibility baseline

- Contrast: WCAG AA — measured above.
- Focus: `:focus-visible` ring using `--color-focus`.
- Keyboard: all actions reachable; logical tab order.
- Targets: ≥44×44 px on primary button and inputs on touch.
- Semantics: native `form`, `label`, `button`, `ul`/`li`/`article`.
- Forms: programmatic labels; errors associated and announced.
- Motion: honour `prefers-reduced-motion`.
- Zoom: usable at 200% and at base breakpoint without horizontal page scroll.
- Language: `en`; RTL not supported in this example.

## Content and formatting conventions

| Kind | Convention | Example |
|---|---|---|
| Dates | en-US short date + time, local timezone | `28 Jul 2026, 09:12 AM` |
| Empty value | Em dash | — |
| Sentence case vs title case | Sentence case for headings and buttons | `Save note` |
| Error message voice | What went wrong + what to do | `Enter a title between 1 and 120 characters.` |
| Destructive confirmation | Modal: name the object; Cancel (safe) left/secondary; danger action right; no undo copy | `Delete this note?` / `Delete note` |

## Do not

- Do not introduce a second palette or serif display face for “personality.”
- Do not hardcode hex or off-scale spacing in components.
- Do not copy mockup HTML into the Nuxt app.
- Do not use colour as the only validation signal.

## Approval

- Decision: `approved`
- Approver: prishanf
- Date: 2026-07-28
- Notes: Approved together with Feature 1 design and mockup.
