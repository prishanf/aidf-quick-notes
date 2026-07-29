---
type: implementation-plan
track: B
required_when: "every Track B and Track C change"
status: draft
owner: prishanf
created: 2026-07-28
updated: 2026-07-28
spec: docs/specs/004-markdown-note-body.md
issue: ""
branch: feat/004-markdown-note-body
---

# Implementation plan: Markdown-formatted note body

## Goal and boundaries

Render a note's `body` as a safe CommonMark subset everywhere it is shown (list, and a live Preview while creating or editing), with raw HTML always escaped to text and unsafe-scheme links never made clickable. Add one pinned rendering dependency. No schema, migration, or API contract change — `title`/`body` stay plain strings on the wire; `title` is never rendered as Markdown. Non-goals (per spec): images, GFM extensions beyond core CommonMark, code syntax highlighting, a stored format flag, raw-HTML passthrough.

## Repository findings

| Area | Finding | Evidence |
|---|---|---|
| Existing behavior | Body is stored and shown as plain text (`whitespace-pre-wrap`) in both the list and the Feature 3 inline edit form; no rendering library exists in the app | `app/pages/index.vue:571-576` (list), `:344-351` (create textarea), `:525-534` (edit textarea) |
| Integration point | All note UI lives in one Nuxt page, `app/pages/index.vue` (create form, list, Feature 3 inline edit, Feature 2 delete confirm) | `app/pages/index.vue` |
| API / contract | `PATCH /api/notes/:id` (Feature 3) is already merged to `develop` (`9f3cc97`); partial `{ title?, body? }`, `body` remains an unconstrained string beyond the 5000-char cap | `server/api/notes/[id].patch.ts`, `server/utils/notes.ts:77-137` |
| Data model | `notes.body` is `text`, app-validated ≤5000 chars; no format/flag column exists or is planned | `docs/architecture/data-model.md:58` |
| Test coverage | HTTP tests only (`tests/notes.test.ts`), via `@nuxt/test-utils`; no existing unit-test file for a plain TS/Vue utility — this will be the first one | `tests/notes.test.ts`, `package.json` |
| Design authority | Approved mockup renderer config: `markdown-it({ html: false, linkify: true, breaks: true })`; unsafe-scheme links (`javascript:`) fail to parse as links entirely (verified interactively, stronger than "neutralized") | `docs/design/004-markdown-note-body.md`, `docs/design/mockups/notes/js/notes.js` |
| Dependency inventory | No Markdown/rendering package in `package.json` yet; stack is Nuxt 4 + Vue 3 + TypeScript (`vue-tsc`) + `@nuxt/eslint` (extends `eslint-plugin-vue`) | `package.json`, `eslint.config.mjs` |
| Lint constraint | `@nuxt/eslint`'s Vue rule set includes `vue/no-v-html`; rendering trusted-but-dynamic HTML via `v-html` will need an explicit, justified inline disable | `eslint.config.mjs` (extends `.nuxt/eslint.config.mjs`) |
| Size budget | Soft cap 400 changed lines (`project.yaml`); `index.vue` is already ~650 lines — adding two toggles + rendering risks approaching the cap in one file | `project.yaml: gates.pr_size_soft_cap_lines` |

Classification unchanged: Track B · tags `ui`, `dependency` (no `database`, no `api` — the PATCH/POST/GET/DELETE contract is untouched and already shipped). Repository does not contradict that: no schema or endpoint change is required to implement this feature.

## Change map

| File or area | Change | Why |
|---|---|---|
| `app/utils/markdown.ts` (new) | `renderMarkdown(body: string): string` — a module-level `markdown-it` instance configured `{ html: false, linkify: true, breaks: true }`; pure function, no DOM access | Single render implementation shared by the list and both Write/Preview toggles; works identically under Nuxt SSR and client hydration; matches the approved mockup's renderer config exactly |
| `package.json` | Add `markdown-it` as a runtime dependency, pinned; add `@types/markdown-it` as a devDependency if the package's bundled types don't satisfy `vue-tsc` | `dependency` tag requires a real, installed package — the mockup's CDN script does not ship |
| `app/pages/index.vue` | (a) List: replace the plain-text paragraph with rendered HTML via `renderMarkdown(note.body)`, keeping the existing empty-body em-dash branch unchanged. (b) Create form: add a `bodyMode` ref (`'write' \| 'preview'`), a two-button `aria-pressed` toggle, and a conditional textarea-vs-rendered-preview block with an empty-preview message. (c) Feature 3 inline edit form: add an `editBodyMode` ref and the same toggle, reset on open/cancel/save-success alongside the existing `editingId` lifecycle. (d) `title` inputs and display are untouched — never passed through the renderer | Implements the approved design's states exactly; Vue's existing `v-model` refs (`body`, `editBody`) already hold the live draft, so — unlike the vanilla-JS mockup — no manual value-capture-on-toggle is needed |
| `app/pages/index.vue` `<style>` (scoped) or `app/assets/css/main.css` | Add rendered-Markdown typography rules (headings, lists, code, blockquote, links) using only existing tokens — mirrors the mockup's `.rendered-md` rules | The approved "Rendered Markdown content" component needs real styling; no new tokens |
| `app/utils/markdown.ts` render call sites | Wrap each `v-html` usage with an inline `<!-- eslint-disable-next-line vue/no-v-html -->` and a one-line comment naming the guarantee (`html:false` escapes raw HTML upstream) | `@nuxt/eslint`'s Vue rules flag `v-html`; the disable must be justified, not blanket |
| `tests/markdown.test.ts` (new) | Unit tests for `renderMarkdown()`: heading/bold/italic/link/list/inline-code/fenced-code/blockquote render correctly; empty string renders empty; literal `<script>`/`<b>` are escaped to visible text, never executed; a `javascript:` link does not become a clickable anchor | New behavior needs its own coverage; Track B requires tests added even without an `api`/`database` tag. These must fail against pre-change code (the module doesn't exist yet) |
| `CHANGELOG.md` | Add an `[Unreleased]` entry | Track B requirement |
| `docs/conventions.md` | Add a line pointing at `app/utils/markdown.ts` as the render path for note bodies | Orientation for later agents |
| `docs/api/notes.md`, `docs/architecture/data-model.md` | No content change — confirmed unchanged, not silently skipped (see below) | Contract and schema are genuinely untouched by this feature |
| `docs/design/mockups/notes/` | Leave in place | Design/QA reference; not product code |

**No schema, migration, or endpoint files.** If build reveals a need for any of those, stop and re-classify with `database`/`api` before continuing.

## Sequence

1. Add `markdown-it` (+ `@types/markdown-it` if needed) to `package.json`; run `npm install`; record the resolved version, license, and last-publish/maintenance signal for the `dependency`-tag PR evidence.
2. Add `app/utils/markdown.ts` with the module-level renderer and `renderMarkdown()`. Keep it pure and framework-agnostic so it behaves identically during SSR and CSR.
3. Add `tests/markdown.test.ts` covering the safe-subset and escaping/neutralization behavior listed in the change map. Confirm these fail against pre-change code (the module doesn't exist), then make them pass.
4. Wire the list view in `app/pages/index.vue`: swap the plain-text body paragraph for `renderMarkdown(note.body)` via `v-html` (justified inline eslint-disable), guarded by the existing empty-body branch. Add scoped CSS for rendered content using existing tokens only.
5. Add the Write/Preview toggle to the create form: `bodyMode` ref, `aria-pressed` button pair, conditional textarea vs. rendered-preview block bound to the existing `body` ref; empty-preview message when blank.
6. Add the same toggle to the Feature 3 inline edit form via an `editBodyMode` ref, reset alongside `editingId`'s existing open/cancel/save-success transitions.
7. Manual smoke pass (`npm run dev`): paste both mockup demo bodies (the Markdown-formatting note and the raw-HTML/unsafe-link note) into a real note via create and via edit; confirm the running app matches the approved mockup's rendering exactly, including the `javascript:` link failing to parse as a link.
8. Update `CHANGELOG.md` and `docs/conventions.md`. Confirm — in the PR description, not silently — that `docs/api/notes.md` and `docs/architecture/data-model.md` need no edits.
9. Run the full verification suite below; open the PR to `develop` once this plan is approved and build completes.

## Data and migration

None — no persistent-state change.

- Data model document: `docs/architecture/data-model.md` — unchanged (confirmed, not silently skipped)
- Entities and columns added, altered, or removed: none — `notes.body` stays a plain-text column; this feature only changes how existing data is interpreted at render time
- Migration files and order: none
- Expand/contract phase: none
- Backfill: none — existing bodies are not rewritten; some may render differently once Markdown syntax is interpreted (accepted per spec, no migration)
- Backward compatibility: n/a — no schema or wire-format change; an older client and this one read/write the same `body` string
- Rollback: revert the feature branch/deploy to restore plain-text rendering; nothing in the database changes either way
- Seed profile for Preview: none required for schema; existing synthetic notes suffice
- Classification and retention effects: none
- Migration plan: none — not applicable without the `database` tag

## UI foundation

- Is this the project's **first** `ui` change? `no`
- UI foundation document: `docs/design/ui-foundation.md` — extended by the design gate (added "Rendered Markdown content" and "Body Write/Preview toggle" rows)
- Foundation approval: approved 2026-07-28 (Feature 1); Feature 2–4 inventory extensions recorded in their respective design docs
- Token layer: `app/assets/css/tokens.css` — unchanged
- CSS framework: Tailwind v4; theme wiring in the token layer
- Approved design and mockup: `docs/design/004-markdown-note-body.md`, `docs/design/mockups/notes/` — authoritative for layout and flow
- Components: page-local in `app/pages/index.vue` (Rendered Markdown content, Body Write/Preview toggle) — consistent with the existing pattern; no shared component directory yet
- New tokens this change adds to a scale: none
- Breakpoints and states to verify: base + `sm`; list rendering (plain text / Markdown / raw-HTML-escaped / unsafe-link-neutralized); create-form Write/Preview; edit-form Write/Preview; empty-preview message; toggle disabled while saving; title never rendered as Markdown in any state

## API surface

Not applicable — this change does not carry the `api` tag. `GET/POST /api/notes` and `PATCH/DELETE /api/notes/:id` (all already shipped) are unchanged: same request/response shapes, same validation rules, same status codes. No endpoint files are touched by this plan.

## Verification plan

- Unit: `npm test` — includes new `tests/markdown.test.ts` render/escaping cases
- Integration: `npm test` — existing `tests/notes.test.ts` HTTP suite continues to pass unmodified (proves the API layer is untouched)
- Static: `npm run lint` · `npm run typecheck` (confirms `markdown-it` types resolve and the `v-html` disable is properly scoped)
- Build: `npm run build`
- API endpoints: n/a — no `api` tag; no endpoint changes to cover
- Migration: none
- Accessibility and responsive: keyboard — tab reaches title → Write → Preview → body (when Write) → Save/Save note in that order; toggle exposes state via `aria-pressed` inside a labelled `role="group"`; rendered output uses semantic `h1`–`h6`/`p`/`ul`/`ol`/`li`/`blockquote`/`pre`/`code`/`a`; checked at base and `sm`; no horizontal scroll except inside code blocks
- Manual:
  - [ ] `npm run dev` → create a note with Markdown (heading, bold, italic, link, list, inline code, fenced code, blockquote) → list shows it rendered
  - [ ] Toggle Preview on the create form before saving → rendered output matches what the list will show after Save
  - [ ] Edit an existing note → toggle Preview → Save while Preview is showing → save succeeds and reflects the edited content
  - [ ] Paste a body containing `<script>alert(1)</script>` and `<b>text</b>` → both render as literal visible text, never executed
  - [ ] Paste a body containing `[link](javascript:alert(1))` → does not render as a clickable link
  - [ ] Title field never renders Markdown syntax, in the list or either form
  - [ ] Empty body in Preview shows the "nothing to preview yet" message, not a blank box
  - [ ] Delete and the Feature 3 error states (validation, save-error, not-found) still work unchanged
- Size: keep the diff near the 400-line soft cap; if `index.vue` alone pushes materially over, say so in the PR description rather than splitting prematurely

## Risks and assumptions

- Assumption: the pinned `markdown-it` version ships usable TypeScript types; if `vue-tsc` fails to resolve them, add `@types/markdown-it` as a devDependency
- Assumption: Vue's reactive `body`/`editBody` refs make the mockup's manual "capture the draft on tab click" pattern unnecessary — Preview only needs to change which element is shown, not synchronize a copy
- Assumption: `v-html` on `renderMarkdown()`'s output is safe specifically because `html: false` guarantees no raw tag survives parsing into the output string; this guarantee must not be loosened without re-classifying with the `security` tag and adding a real sanitizer
- Risk: `vue/no-v-html` lint rule blocks an unexplained `v-html`; mitigation: scoped, commented `eslint-disable-next-line` at each call site, not a blanket rule change
- Risk: existing notes with incidental Markdown-significant characters (`#`, `*`, backticks, leading `-`) render differently after ship; mitigation: none planned — accepted trade-off per the approved spec, called out in the CHANGELOG entry
- Risk: `index.vue`'s size grows past the soft cap in one PR; mitigation: keep new logic to the minimum described above; flag in the PR description if still over

## Completion checklist

- [ ] Scope matches approved spec (safe CommonMark subset only; no images, syntax highlighting, stored format flag, or raw-HTML passthrough; no schema/API change).
- [ ] Tests added: `tests/markdown.test.ts` (new, fails against pre-change code); `tests/notes.test.ts` continues to pass unmodified.
- [ ] Verification commands recorded.
- [ ] Documentation: `CHANGELOG.md` + `docs/conventions.md` updated; `docs/api/notes.md` and `docs/architecture/data-model.md` explicitly confirmed unchanged in the PR description.
- [ ] PR evidence prepared (agent-claimed; CI to corroborate).
- [ ] `database` tag: n/a — none applied; no migration.
- [ ] `api` tag: n/a — none applied; no endpoint changes.
- [ ] `ui` tag: implements the approved design/mockup states; UI foundation extended; no new tokens added ad hoc.
- [ ] `dependency` tag: `markdown-it` (+ types if needed) added with pinned version, license, and maintenance signal recorded in the PR.
- [ ] Size budget respected, or the overage is justified in the PR description.

## Approval

- Decision: `pending`
- Approver:
- Date:
- Notes:

## Agent instruction

For Track B and Track C changes, do not begin implementation until `Approval.decision` is `approved`. If repository inspection during planning contradicts the approved spec, or reveals the change needs a higher track, stop and return to the spec before requesting plan approval.
