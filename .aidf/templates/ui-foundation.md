---
type: ui-foundation
track: B
required_when: "the first `ui`-tagged change in a project; updated by later changes, never re-invented"
status: draft
owner: ""
updated: YYYY-MM-DD
spec: ""
tokens_source: ""
tailwind_config: ""
---

# UI foundation: <product name>

The first feature that renders a screen decides the product's visual language whether or not anyone intends it to. Every later feature either follows that accident or fights it. This document turns the accident into a decision, once, at the only moment it is cheap.

It is **durable and shared**, not per-feature. One per project (or per design system, if the project genuinely has several surfaces). Later `ui` changes read it, extend it, and update it — they do not write a competing one, and they do not introduce a colour, a font size, or a spacing value that is not in it.

**Tailwind is this framework's default CSS framework** — see [../standards/ui-and-preview.md](../standards/ui-and-preview.md). The token tables below are the single source those Tailwind utilities resolve to, and the same tables the design mockup consumes, which is what makes the prototype and the real application look like the same product.

## Brand basics

| | Value |
|---|---|
| Product name (as displayed) | <name> |
| One-line positioning | <what it is, to whom> |
| Voice and tone | <e.g. plain, calm, no exclamation marks; "you", not "the user"> |
| Logo assets | `<path(s)>` — <light, dark, mark-only variants> |
| Favicon / app icon | `<path>` |
| Existing brand constraints | <corporate palette, accessibility policy, or "none — this document sets them"> |

If the project has no brand yet, say so explicitly and treat the palette below as a deliberate proposal for the approver, not a placeholder to be replaced later by whatever the next agent likes.

## Colour

Define semantic roles first, raw values second. A component references `--color-surface`, never `#ffffff`; a utility class references `bg-surface`, never `bg-[#fff]`. The indirection is the entire point: it is what lets the palette change in one place, and what makes a dark theme possible without touching a component.

### Semantic roles

| Role | Token | Light | Dark | Used for |
|---|---|---|---|---|
| Page background | `--color-bg` | `<hex>` | `<hex>` | <the canvas> |
| Surface | `--color-surface` | `<hex>` | `<hex>` | <cards, panels, table rows> |
| Surface (raised) | `--color-surface-raised` | `<hex>` | `<hex>` | <menus, dialogs, popovers> |
| Border / divider | `--color-border` | `<hex>` | `<hex>` | <hairlines, input borders> |
| Text (primary) | `--color-text` | `<hex>` | `<hex>` | <body copy, values> |
| Text (muted) | `--color-text-muted` | `<hex>` | `<hex>` | <labels, secondary metadata> |
| Brand / primary action | `--color-primary` | `<hex>` | `<hex>` | <primary buttons, active nav> |
| On-primary | `--color-primary-fg` | `<hex>` | `<hex>` | <text on a primary fill> |
| Focus ring | `--color-focus` | `<hex>` | `<hex>` | <keyboard focus — never removed> |
| Success | `--color-success` | `<hex>` | `<hex>` | <confirmations> |
| Warning | `--color-warning` | `<hex>` | `<hex>` | <recoverable problems> |
| Danger | `--color-danger` | `<hex>` | `<hex>` | <destructive actions, validation errors> |
| <domain role> | `--color-<role>` | `<hex>` | `<hex>` | <e.g. income vs expense; positive vs negative delta> |

Domain colours deserve their own rows. A financial product that renders income green by reaching for `--color-success` has quietly merged "this went well" with "this is money coming in", and the two will need to diverge.

### Contrast

Fill this in with measured values, not intentions. Every pair a user actually reads must appear here.

| Foreground on background | Ratio | Required | Pass |
|---|---|---|---|
| text on bg | `<n.n:1>` | 4.5:1 | <yes/no> |
| text-muted on surface | `<n.n:1>` | 4.5:1 | <yes/no> |
| primary-fg on primary | `<n.n:1>` | 4.5:1 | <yes/no> |
| danger on surface | `<n.n:1>` | 4.5:1 | <yes/no> |
| border on surface | `<n.n:1>` | 3:1 (non-text) | <yes/no> |
| focus ring on bg and on surface | `<n.n:1>` | 3:1 | <yes/no> |

Muted text is where this fails in practice — a grey that looks tasteful at 3:1 is unreadable to a meaningful share of users. Fix the token, not the individual screen.

**Colour is never the only signal.** State a second cue for every meaning carried by colour: <icon, sign, weight, label>.

## Typography

| | Value |
|---|---|
| Display / heading family | `<family>`, fallback `<stack>` |
| Body family | `<family>`, fallback `<stack>` |
| Monospace / numeric family | `<family>` — <used for identifiers, code, aligned figures> |
| Loading strategy | <self-hosted `woff2` + `font-display: swap` / system stack / CDN — and why> |
| Numerals in data views | <`font-variant-numeric: tabular-nums` where columns of figures must align> |

Self-host if the product must work offline, in a restricted network, or without a third-party request per page load. If a CDN is used, say so here — it is a dependency and a privacy decision, not a detail.

### Type scale

| Token | Size | Line height | Weight | Letter spacing | Used for |
|---|---|---|---|---|---|
| `--text-xs` | `<rem>` | `<n>` | `<n>` | `<em>` | <legal, table meta> |
| `--text-sm` | `<rem>` | `<n>` | `<n>` | — | <labels, dense tables> |
| `--text-base` | `<rem>` | `<n>` | `<n>` | — | <body> |
| `--text-lg` | `<rem>` | `<n>` | `<n>` | — | <section headings> |
| `--text-xl` | `<rem>` | `<n>` | `<n>` | `<em>` | <page titles> |
| `--text-2xl` | `<rem>` | `<n>` | `<n>` | `<em>` | <hero figures, key metrics> |

Sizes in `rem` so browser text-size settings work. A scale with more than about six steps stops being a scale and becomes a menu.

## Space, shape, elevation, motion

| Scale | Tokens | Values | Notes |
|---|---|---|---|
| Spacing | `--space-1 … --space-N` | `<e.g. 4 8 12 16 24 32 48 64 px>` | <base unit; nothing off-scale> |
| Radius | `--radius-sm/md/lg/full` | `<values>` | <which components use which> |
| Border width | `--border` | `<value>` | <hairline strategy> |
| Elevation | `--shadow-sm/md/lg` | `<values>` | <what each level means, not just how it looks> |
| Motion duration | `--duration-fast/base/slow` | `<ms>` | <what may animate> |
| Motion easing | `--ease` | `<cubic-bezier>` | — |
| Z-index layers | `--z-dropdown/sticky/overlay/modal/toast` | `<numbers>` | <the stacking contract; ad-hoc z-index values are a bug> |

Elevation levels must mean something ("raised above the page", "floating over content", "modal") or components will pick shadows by eye and the hierarchy will be noise.

## Breakpoints and layout

| Name | Min width | Layout behaviour at this size |
|---|---|---|
| base (mobile) | `0` | <single column; what collapses, what hides, what becomes a sheet> |
| `sm` | `<px>` | <…> |
| `md` | `<px>` | <…> |
| `lg` | `<px>` | <…> |
| `xl` | `<px>` | <…> |

- **Design order:** <mobile-first / desktop-first> — <state it once so components are written consistently>
- **Content max width:** `<value>` — <and which views deliberately go full-bleed>
- **Application shell:** <header, sidebar, content region; where navigation lives at each breakpoint>
- **Data-dense views:** <how wide tables behave — horizontal scroll in their own container, column priority, or stacked cards; never a horizontally scrolling page body>

These are the breakpoints the design mockup and the UI QA sign-off both check against. If they are not written here, "responsive at the declared breakpoints" has nothing to declare.

## Tailwind mapping

| | Value |
|---|---|
| Tailwind version | `<e.g. 4.x>` |
| Token layer (the source of truth) | `<path, e.g. app/assets/css/tokens.css>` |
| Theme wiring | <v4: `@theme` in the token layer · v3: `theme.extend` in `<tailwind.config.ts>`> |
| Global stylesheet | `<path>` — <imports the token layer, then Tailwind, then the few base rules> |
| Component classes / library | <e.g. a small set of `@apply`-composed classes, or a component directory — say which and why> |
| Dark mode strategy | <`media` / `class` on `<html>` / both, with the toggle's storage key> |

### The rules that keep it consistent

1. **Every design value comes from a token.** No raw hex, no `text-[13px]`, no `p-[7px]` in a component. If a value is missing from a scale, add it to the scale.
2. **Arbitrary values are allowed only** for <one-off layout maths, e.g. `grid-template-columns`> — and they may never carry colour, type size, or spacing.
3. **The token layer is framework-agnostic CSS custom properties.** Tailwind consumes it; so does the design mockup, which is exactly how the prototype stays visually truthful without sharing a line of markup.
4. **One place declares base element styles.** Everything else composes utilities.
5. **`!important` and arbitrary `z-index` are review findings**, not techniques.

## Component inventory

The vocabulary later features are expected to reuse. The first `ui` feature builds only what it needs — but it names the set here so the second feature extends rather than reinvents.

| Component | Purpose | States it must support | Implementation | Status |
|---|---|---|---|---|
| Button | <primary, secondary, ghost, destructive> | default, hover, focus-visible, active, disabled, loading | `<path>` | <built / planned> |
| Input / field | <text, number, select, date> | default, focus, filled, invalid + message, disabled, readonly | `<path>` | <> |
| Form row / label | <label, hint, error association> | — | `<path>` | <> |
| Table / data grid | <the dense data surface> | empty, loading, sorted, row-selected, overflow | `<path>` | <> |
| Card / surface | <grouping> | — | `<path>` | <> |
| Metric / stat | <headline figures> | positive, negative, neutral, no-data | `<path>` | <> |
| Dialog / sheet | <confirmation, editing> | open, closing; focus trap; Escape | `<path>` | <> |
| Toast / inline alert | <feedback> | success, warning, error, info | `<path>` | <> |
| Empty state | <first-run and filtered-to-nothing are different> | — | `<path>` | <> |
| Loading / skeleton | <initial vs refresh> | — | `<path>` | <> |
| Navigation | <shell nav at each breakpoint> | current, hover, focus | `<path>` | <> |
| Pagination / paging | <> | first, last, disabled | `<path>` | <> |

Empty, loading, and error states belong in this inventory because they are the states agents skip. A component library with no loading state produces features with no loading state.

## Accessibility baseline

Not a phase. These are the defaults every component inherits.

- **Contrast:** WCAG AA (4.5:1 text, 3:1 non-text) — measured in the table above.
- **Focus:** `:focus-visible` ring on every interactive element, using `--color-focus`. Never `outline: none` without an equal-or-better replacement.
- **Keyboard:** every action reachable and operable; logical tab order; Escape closes overlays; no keyboard trap outside an intentional modal focus trap.
- **Targets:** minimum `<44×44 px>` for touch; dense desktop tables may go smaller — state where and why.
- **Semantics:** native elements first (`button`, `a`, `label`, `table`, `dialog`). ARIA supplements; it does not substitute.
- **Forms:** every input has a programmatic label; errors are associated with their field and announced, not only coloured red.
- **Motion:** honour `prefers-reduced-motion`; nothing essential is conveyed by animation alone.
- **Zoom / reflow:** usable at 200% zoom and at `<narrowest breakpoint>` without horizontal page scroll.
- **Language and direction:** `<lang>`; RTL <supported / not supported — state it, since retrofitting is expensive>.

## Content and formatting conventions

Shared formatting is part of the visual language — inconsistent dates and currencies read as two different products.

| Kind | Convention | Example |
|---|---|---|
| Dates | `<format, locale, timezone shown or implied>` | <> |
| Date ranges / periods | `<format>` | <> |
| Currency / amounts | `<symbol placement, decimals, thousands separator, how negatives render>` | <> |
| Large numbers | `<abbreviate or not>` | <> |
| Percentages and deltas | `<sign, precision>` | <> |
| Empty value | `<"—" vs "None" vs blank>` | <> |
| Sentence case vs title case | `<for headings, buttons, labels>` | <> |
| Error message voice | <what went wrong + what to do next; never a raw code> | <> |
| Destructive confirmation | <what the dialog must state before the action proceeds> | <> |

## Do not

- <e.g. do not introduce a second icon set>
- <e.g. do not use `--color-success` for income; use `--color-income`>
- <e.g. do not add a component to a page file; add it to the component directory or extend an existing one>
- <e.g. do not hardcode a breakpoint value in a media query; use the token>

## Approval

- Decision: `pending | approved | rejected`
- Approver: <name or role, human design/product owner>
- Date: YYYY-MM-DD
- Notes: <trade-offs or conditions>

## Agent instruction

Write this document during the **first** `ui`-tagged change, alongside `templates/design.md`, and submit both for approval together. Do not defer it: a foundation written after three features exist is a description of three features' worth of accidents.

Do not fabricate a brand. If the project has no palette, typeface, or existing product to match, propose a specific, complete, accessible set — with measured contrast ratios — and say plainly that it is a proposal for the approver to accept or replace. A palette invented silently becomes the brand by default.

Implement the token layer before any component: the tokens land in `<tokens_source>`, Tailwind is wired to them, and only then are components written. Components that ship before the tokens will contain hardcoded values, and nobody ever goes back.

On a later `ui` change, read this document and extend it. If the feature needs a value the scales do not contain, add it here and say so in the plan; do not introduce a one-off. If the feature contradicts this document, that is a design-gate question, not a build-time judgement call — return it to the design gate.

Keep this and the mockup honest with each other: the mockup consumes the same token layer this document defines. See [../standards/ui-and-preview.md](../standards/ui-and-preview.md) for the mockup contract.
