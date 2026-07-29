---
type: feature-spec
track: B
required_when: "every Track B and Track C change"
status: approved
owner: prishanf
created: 2026-07-28
updated: 2026-07-28
issue: ""

classification:
  track: B
  risk: standard
  tags: [ui, dependency]
---

# Feature: Markdown-formatted note body

## Problem

Today a note's `body` is stored and shown as plain text (`white-space: pre-wrap`), so a visitor cannot add structure — headings, emphasis, links, lists, code — without it appearing as literal punctuation in the list. `docs/conventions.md` explicitly calls out Markdown as a non-goal "without a new approved spec"; this is that spec.

## Desired outcome

A visitor can write a note body as plain text or Markdown, interchangeably (no mode switch, no stored flag), and see it rendered as formatted HTML everywhere the body is shown: the notes list, and a live preview while creating or editing.

## Users and scenarios

- **Primary user:** Local developer exercising AIDF (single user, no login).
- **Scenario:** Given a note body containing Markdown syntax (`# Heading`, `**bold**`, `_italic_`, `[text](url)`, `- item`, `` `code` ``, fenced code block, `> quote`), when it is shown in the list, then it renders as the corresponding formatted HTML.
- **Scenario:** Given a note body with no Markdown syntax, when it is shown, then it reads the same as today's plain text (aside from any incidental Markdown-significant characters it happens to contain — see Constraints).
- **Scenario:** Given a visitor is creating a note or editing one inline (Feature 3), when they toggle **Preview**, then they see the same rendered output the list will show, before saving.
- **Scenario:** Given a note body contains literal HTML or something that looks like a script tag, when it is rendered, then the tags appear as literal escaped text and are never executed or inserted as live DOM.
- **Scenario:** Given a note body contains a link with an unsafe URL scheme (e.g. `javascript:`), when rendered, then the link is neutralized — not clickable, not executed.

## In scope

- Render `body` as a **safe CommonMark subset** everywhere it is displayed: headings, bold/italic, links, ordered/unordered lists, fenced/inline code, blockquotes, paragraphs, line breaks.
- A rendering dependency with **raw HTML disabled by default** (e.g. `markdown-it` with `html: false`) so any HTML typed into a body is escaped to visible text, never executed — this is the mechanism that keeps this change off Track C (see Why this classification).
- Safe link handling: reject/neutralize unsafe URL schemes (`javascript:`, `data:`, etc.) in rendered `href`s; rely on the renderer's built-in link validation.
- Live **Preview** toggle in the create-note form (`app/pages/index.vue`) and in the Feature 3 inline edit form, both showing the same renderer output the list uses.
- `title` stays plain text only — Markdown syntax in a title is not interpreted.
- Mockup and design updates in the existing shared package `docs/design/mockups/notes/` (per `docs/conventions.md` — extend, do not fork a new mockup folder).
- Dependency provenance note (name, version, license, maintenance signal, no runtime network calls) for the `dependency` tag.

## Out of scope

- Raw HTML passthrough in note bodies (rejected option — would need an added sanitizer dependency and a Track C security review).
- Images (`![alt](url)`) — remote-resource loading and tracking-pixel concerns deferred to a future spec.
- GFM extensions beyond core CommonMark: tables, footnotes, strikethrough, task lists, autolinking beyond standard link syntax.
- Syntax highlighting inside code blocks (would add another dependency; code renders as plain monospace).
- A stored "format" flag or per-note plain/Markdown mode — one rendering rule applies to every body, old and new.
- Rewriting or migrating existing note bodies — no data changes, only render-time interpretation changes.
- Schema/migration changes, new API endpoints, or changes to the `POST`/`PATCH` request or response shape (`title`/`body` remain plain strings on the wire).

## Acceptance criteria

- [ ] A body with Markdown syntax (heading, bold, italic, link, list, inline code, fenced code block, blockquote) renders as the corresponding HTML in the notes list.
- [ ] A body with no Markdown syntax reads the same as today's plain-text rendering, aside from incidental Markdown-significant characters (documented, not fixed, per Constraints).
- [ ] Literal HTML or script-like text typed into a body is displayed as escaped literal text, never executed or inserted as live DOM.
- [ ] Links with unsafe URL schemes are neutralized; only safe schemes (`http:`, `https:`, `mailto:`) render as clickable.
- [ ] The create-note form has a Preview toggle showing the same rendered output as the list, before saving.
- [ ] The Feature 3 inline edit form has the same Preview toggle, pre-filled from the note's current body.
- [ ] Title remains plain text; Markdown syntax in a title is shown literally, not rendered.
- [ ] Body length validation (max 5000 characters) is unchanged and applies to the raw Markdown source text.
- [ ] No new database column, table, or migration; `POST /api/notes` and `PATCH /api/notes/:id` contracts are unchanged.
- [ ] The chosen Markdown dependency is named with version, license, and maintenance signal in the PR (`dependency` tag evidence).
- [ ] Empty, loading, validation-error, save-error, and not-found states from Features 1–3 are unaffected (regression check).
- [ ] Preview toggle is keyboard-operable and its state (showing source vs. showing preview) is exposed to assistive tech.

## Why this classification

Track **B**, risk **standard**. No `database`, `security`, `mcp-write`, `infra`, or `release` tag applies: no schema change, no auth/secrets/production-config change, and the request/response contract for `POST`/`PATCH /api/notes` is unchanged, so `api` is **not** added either. `ui` applies because list rendering and both forms change observably. `dependency` applies because this introduces a new npm package to parse Markdown.

This is deliberately kept off Track C by a specific design constraint: the renderer runs with **raw HTML disabled** (`html: false`), so user-typed HTML/script is always escaped to text, not executed — this is what keeps rendering untrusted note bodies as HTML from being an XSS trust-boundary crossing. If a future change wants raw HTML passthrough, it must re-classify with the `security` tag and a threat model per `standards/quality-gates.md`, and add a real sanitizer (e.g. DOMPurify) as a second dependency.

## Constraints and risks

- Compatibility: Nuxt 4 renders both server-side and client-side; the chosen dependency must be a pure-JS, isomorphic renderer (no DOM-only APIs) so SSR output matches client hydration.
- Compatibility/behavior change: because there is no stored plain/Markdown flag, **existing notes may render differently after this ships** if their body happens to contain Markdown-significant characters (a line starting with `#`, `*item*`, a lone `_word_`, backticks, `- ` at line start, etc.). This is the direct, accepted consequence of supporting both plain text and Markdown through one rendering rule — no migration is planned to escape old bodies.
- Data/security: rendered HTML must never execute body content as script; enforced via `html: false` plus the renderer's default link-scheme validation. No new stored data — the `body` column and its 5000-character limit are unchanged.
- Performance: parsing is synchronous per note render; negligible at example scale (≤100 notes). Re-parsing on every reactive re-render is acceptable at this scale; memoizing per-note rendered HTML is a nice-to-have, not required.
- Rollback: revert the feature branch/deploy to restore today's `white-space: pre-wrap` plain-text rendering; no schema rollback needed since nothing in the database changes.

## Decisions made

- **Markdown scope:** Safe CommonMark subset only, confirmed.
- **Code blocks:** Plain monospace, no syntax highlighting, no added highlighting dependency — confirmed.
- **Images:** Excluded entirely from this feature's safe subset, deferred to a future spec — confirmed.
- **Sequencing:** Feature 3 (edit note) is already merged to `develop` (PR #3, `9f3cc97`). Feature 4 branches from current `develop` and extends the real inline edit form in `app/pages/index.vue` (`editingId`/`editTitle`/`editBody`) directly — no conditional ordering needed.

## Open questions

None outstanding.

## Approval

- Decision: `approved`
- Approver: prishanf
- Date: 2026-07-28
- Notes: Safe CommonMark subset confirmed; live preview toggle confirmed for both create and edit forms; Feature 3 merged to develop, so Feature 4 branches directly from current develop.

## Agent instruction

Do not implement from this document until `Approval.decision` is `approved`. If an open question changes scope or safety, stop and ask it. If implementation reveals that the change touches schema, authorization, secrets, or production configuration beyond what is already classified, stop and re-classify before continuing.

**Design gate applies next** (`ui` tag): after this spec is approved, produce `docs/design/` materials including a clickable static mockup with mock data, served over HTTP via `npm run mockup:serve`. A mockup is the default deliverable — not prose alone — so rendered Markdown examples, the Preview toggle, and the "raw HTML is escaped, not executed" behavior can be judged before planning. Per `docs/conventions.md`, extend the existing shared mockup package at `docs/design/mockups/notes/`; do not fork a new per-feature mockup folder. Do not write an implementation plan until the design and mockup are approved. UI foundation already exists (`docs/design/ui-foundation.md`); extend it only if new tokens or components are required (e.g. a Preview/Edit toggle control, rendered-content typography).
