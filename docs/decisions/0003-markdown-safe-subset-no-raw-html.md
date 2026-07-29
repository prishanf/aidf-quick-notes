---
type: adr
track: C
required_when: "a decision is consequential, hard to reverse, or worth explaining later"
status: accepted
number: "0003"
date: 2026-07-29
decision-makers: [prishanf]
related:
  - docs/specs/004-markdown-note-body.md
  - docs/design/004-markdown-note-body.md
  - docs/architecture/data-model.md
  - docs/releases/v1.0.0.md
---

# ADR 0003: Note bodies render a safe Markdown subset, never raw HTML

## Context

Feature 4 lets a note body be written as plain text or Markdown, rendered as HTML wherever it's shown. Rendering untrusted user text as HTML is a classic XSS trust boundary. The app has no auth (ADR 0001), so any local caller can already read/write any note — but rendering that content as live HTML in a browser is a materially different risk than storing/returning it as a string.

## Decision

Render bodies with `markdown-it` configured `html: false` (`app/utils/markdown.ts`). Raw HTML or script tags typed into a body are always escaped to visible text, never inserted as live DOM. Unsafe-scheme links (`javascript:`, `data:`) either fail to parse as links entirely or are never made clickable — this is `markdown-it`'s default `validateLink`/`linkify` behavior, verified directly (not just assumed) during both build and independent review. No HTML sanitizer (e.g. DOMPurify) is added, because none is needed while raw HTML stays disabled. `title` is never passed through the renderer.

## Options considered

| Option | Benefits | Costs / risks | Why not / why chosen |
|---|---|---|---|
| Safe subset, `html: false` | No added sanitizer dependency; keeps this off Track C; verified safe against script tags and unsafe-scheme links (including bare-URL `linkify` autodetection) | Users cannot embed custom HTML/styling | **Chosen** — matches the approved spec/design; lowest risk for the capability delivered |
| Raw HTML passthrough + sanitizer | More expressive notes | Second dependency (DOMPurify); Track C reclassification with a security review and threat model; larger attack surface to keep correct over time | Deferred — no product need identified |
| No Markdown at all | Zero new risk | Doesn't deliver the requested feature | Rejected by the approved spec |

## Consequences

- Positive: Feature 4 ships without a `security` tag or Track C escalation; the safety property (no live HTML/script execution, no clickable unsafe-scheme links) is unit-tested, not just asserted.
- Negative: Existing notes containing incidental Markdown-significant characters (`#`, `*`, backticks, etc.) may render differently after this ships. No migration rewrites old bodies — this is the accepted trade-off of interpreting all bodies as Markdown without a stored format flag.
- Follow-up: If a future change wants raw HTML or richer embeds, it must re-open this ADR, add the `security` tag, and add a real sanitizer — not loosen `html: false` quietly.

## Revisit trigger

A product need for embedded HTML, images, or rich embeds in note bodies; or evidence that the safe-subset renderer itself has a parsing vulnerability (would require a dependency patch, not a config change).
