# Design, Preview, and UI Approval

UI work passes through **two** distinct visual gates, not one. Confusing them is a real failure mode — it happened in practice, not hypothetically — so this file names them separately and says explicitly what each is not.

| | **Design mockup** | **Preview** |
|---|---|---|
| When | Design gate, before planning | After build, before merge |
| Proves | The proposed layout, information density, and flow are right | The real implementation matches the approved design |
| Built from | Static HTML/CSS/JS and fabricated mock data | The actual application, deployed to isolated state |
| Code fate | **Throwaway.** Never merged, never becomes the implementation | Is the implementation |
| Approved by | Design/product owner, gating the plan | QA reviewer, gating the merge |
| Template | `templates/design.md` | `templates/ui-qa-signoff.md` |

Get these backwards and the framework fails at exactly the moment it exists to help: either the plan gets approved against prose nobody can actually picture, or the first real look at the UI arrives after the implementation is already written — too late to change layout cheaply.

## Design gate

Before implementation, and before the plan is written, the spec's linked design must define:

- user goal and primary flow;
- desktop and narrow-screen behavior;
- empty, loading, success, validation-error, and permission-error states;
- content, accessibility, and localization notes where relevant;
- acceptance criteria that a reviewer can observe.

**A static mockup is required by default** for any `ui`-tagged Track B or Track C change — not only for changes that look complex going in. A change that looks simple in prose (a details section, a summary panel) can still turn out to need real layout judgment once you see it, which is precisely what a mockup is for; deciding that from the spec alone reintroduces the guessing this gate exists to remove.

Markdown wireframes and a flow diagram remain part of `templates/design.md` regardless — they're cheap and they carry information a mockup doesn't (state transitions, error copy). The mockup is additional, not a replacement.

**Skipping the mockup** is allowed only with a stated reason recorded in the design doc — the same pattern the PR template already uses for "no docs needed, because": a one-line justification the approver can see and challenge, not a silent omission. Legitimate reasons look like "single microcopy change to an existing, already-mocked screen" or "visual change is purely a color-token swap with no layout impact." "It seemed small" is not a reason; if it turns out to matter, the plan gate is where that gets caught expensively, not cheaply.

The human product/design owner approves the design **and its mockup together** as one decision, during the spec-to-plan transition, before an implementation plan is written. Implementation — and planning — should not proceed against a design that has not cleared this gate, and should not invent a competing UX once it has.

## The first UI feature also builds the foundation

The first `ui`-tagged change in a project is doing two jobs, and only one of them is visible in its spec. It delivers a feature, and it silently fixes the product's palette, typeface, spacing rhythm, component vocabulary, and responsive behaviour for every feature after it. Left implicit, that second job gets done by whichever agent happened to write the first component — and the third feature then spends its budget reconciling two accidental design systems.

So the first `ui` change **must also produce [templates/ui-foundation.md](../templates/ui-foundation.md)**, approved together with its design:

- brand basics, and semantic colour roles with **measured** contrast ratios;
- a type scale with a stated font-loading strategy;
- spacing, radius, elevation, motion, and z-index scales;
- named breakpoints and the layout behaviour at each;
- the component inventory later features are expected to reuse — including empty, loading, and error states;
- the accessibility baseline every component inherits;
- date, currency, and number formatting conventions.

This document is **durable and shared**: one per project, extended by later `ui` changes, never re-derived. A later feature that needs a value the scales do not contain adds it there and says so in the plan. A later feature that contradicts it has a design-gate question, not a build-time judgement call.

**Order matters within the build, too.** The token layer lands before the first component. Components written before the tokens exist will contain hardcoded values, and nobody goes back to remove them.

## Tailwind is the default CSS framework

AIDF's default is **Tailwind**, declared in the manifest as `ui.css_framework`. A project may choose otherwise, but it records the choice and the reason in its UI foundation document rather than letting each feature pick.

The reason for a default at all is consistency across the two visual gates: the mockup and the real application must resolve the same colours, type sizes, and spacing, or the design approval means nothing by the time Preview arrives.

The mechanism that makes that true is a **token layer**, and it matters more than the framework choice:

1. Design values live once, as CSS custom properties, in a token file the project names in `ui.tokens` — plain CSS, no build step required to read it.
2. Tailwind is wired to that file (`@theme` in v4, `theme.extend` in v3), so `bg-surface` and `text-muted` resolve to the same values the raw properties hold.
3. **The application imports the token layer. The mockup imports the same file.** That single shared artifact is what keeps the prototype visually truthful.
4. No component, in the app or the mockup, contains a raw hex, a raw font size, or an off-scale spacing value. If a value is missing from a scale, it gets added to the scale.

Note precisely what is shared and what is not: **tokens are shared, markup is not.** The token layer is a real, reviewed, permanent part of the application that the mockup happens to read. The mockup's HTML remains throwaway — see below.

## What the mockup covers

Enough to actually validate layout, colors, usability, and flow — not a polished, production-grade build:

- every screen or view the design introduces, navigable between each other as static links or JS-toggled panels;
- every state listed in the design doc (empty, loading, success, error, permission-error) reachable by a click, not just described;
- real layout structure for anything data-dense — tables, grids, multi-level groupings — built with fabricated data at realistic volume, not three placeholder rows;
- the project's token layer and Tailwind classes, so colors, type, and spacing read like the real product rather than an unrelated sketch;
- the declared responsive breakpoints, at least at a rough level.

It does not need: a backend, real data, accessibility implementation (though visible focus order is worth faking), production code quality, or tests.

## Mockup structure and how it runs

A single 900-line `index.html` with inlined styles and data cannot be reviewed screen by screen, cannot share a stylesheet with the second screen, and cannot show a realistic data volume without becoming unreadable. So the mockup has a required shape, and `reference/mockup/` ships a working scaffold to copy rather than reinvent — **once per product surface**, not once per feature.

```text
<documents.designs>/mockups/<surface-slug>/
  index.html            # entry: links to every screen and state
  <screen>.html         # one file per screen
  css/tokens.css        # the project's token layer -- symlink (preferred) or copy from ui.tokens, NOT rewritten
  css/mockup.css        # prototype-only styling; nothing here ships
  data/*.json           # fabricated fixtures at realistic volume
  js/store.js           # loads fixtures, holds mutations in memory, resets
  js/<screen>.js        # per-screen rendering
  serve.sh              # one command that serves this folder over HTTP
  README.md             # how to run it, and what the reviewer should exercise
```

`<surface-slug>` names the product surface (for example `notes` or `settings`), not each successive feature ticket. The first `ui` change that needs a mockup for that surface copies the scaffold. Later features that extend the same screen **update that package** — add states, controls, and README entries — instead of creating `mockups/<feature-2>/`, `mockups/<feature-3>/`, … with duplicated tokens, shell, and seed data. Create a new sibling package only when the change introduces a genuinely new screen that cannot live in an existing package.

Required properties:

- **It runs as a local static server, not from `file://`.** A mockup that reads its fixtures with `fetch('./data/seed.json')` fails silently under `file://` because of the browser's origin rules — the reviewer sees an empty page and reports that the prototype is broken. `serve.sh` (and a matching `commands.mockup_serve` entry in the manifest) exists so the answer to "how do I look at this?" is one command, not a paragraph.
- **Shared `css/` and `data/` directories.** Every screen loads the same token layer and the same fixtures, so a colour or a fixture changes in one place and the screens stay consistent with each other. Per-screen copies of either drift within a single review cycle. Prefer a **symlink** from `css/tokens.css` to the path named as `ui.tokens` so the mockup cannot drift from the application palette.
- **One package per surface.** Do not re-copy `reference/mockup/` for each feature that touches the same screen; that produces duplicate trees agents and reviewers cannot keep aligned.
- **Tailwind, the same way the app uses it.** Either the browser build (`@tailwindcss/browser`) or a prebuilt stylesheet committed into `css/` — with `css/tokens.css` supplying the theme in both cases. What must not happen is the mockup inventing its own palette in hand-written CSS while the app uses Tailwind: that is two design systems, and the approval covers the wrong one.
- **Fixtures in `data/`, never inlined in the markup.** Realistic volume is the whole point of the fixture — thirty rows reveal the layout problems that three rows hide — and inlined data cannot be shared, edited, or reset.
- **A visible reset.** Prototype mutations live in memory; the reviewer needs one control that restores the fixture so a scenario can be re-run.
- **A README that names what to exercise.** The reviewer should not have to guess which interactions the design gate is actually asking about.

The mockup is deleted or archived once the plan is approved — it is a decision aid, not a deliverable, and must not be treated as a head start on the implementation. **Copying its markup into the real build is prohibited**, and it is exactly how a throwaway prototype's shortcuts — no error handling, no real data model, no auth, no server-side validation — end up shipping. The token layer is the one artifact that legitimately crosses the boundary, and it crosses in the other direction: the mockup reads the app's tokens, not the reverse.

## Preview contract

Each UI PR **separately** provides a clickable review of the actual, working implementation using mock or controlled data. Native HTML, Tailwind, and JavaScript are sufficient; choose additional UI tooling only if the project needs it.

The reviewer must be able to exercise:

- the intended happy path;
- all defined states and role/permission boundaries;
- keyboard navigation and visible focus;
- responsive layout at the project's declared breakpoints;
- form validation and recovery;
- a stable fixture reset path.

This is a fidelity check against the design, not the first time anyone sees the layout. If Preview is where layout problems get discovered, the design gate above did not do its job.

## Approval evidence

Design and its mockup are approved together in `templates/design.md`'s own `Approval` block — no separate sign-off document. On the **first** `ui` change, `templates/ui-foundation.md` carries its own `Approval` block and is approved in the same sitting: the reviewer is looking at the mockup anyway, and the mockup is rendered in the very tokens they are being asked to accept.

Preview is a distinct approval: use `templates/ui-qa-signoff.md` to record the preview URL, source revision, data profile, scenarios checked, reviewers, results, unresolved defects, and approval. Every UI PR requires this sign-off before merge, in addition to — not instead of — the design approval that already happened.

## Feedback handling

Feedback on the **mockup** belongs in the design doc, before planning: it can freely change layout, flow, or scope, because nothing has been built yet. Feedback on **Preview** belongs on the PR: a defect stays in the PR or becomes a bounded follow-up; a feedback item that changes approved scope or layout returns all the way to the spec and design, not just to the build agent.
