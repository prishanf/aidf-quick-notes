# Command: `design`

## Purpose

Produce an approved design — description and, by default, a clickable static mockup — for a `ui`-tagged change, before an implementation plan is written.

This command exists because the design gate previously had no contract of its own: it was a step named by `spec` with no agent responsible for actually producing the visual artifact a human needs to approve it. See [standards/ui-and-preview.md](../standards/ui-and-preview.md) for what distinguishes this from `preview` — this produces a **throwaway** mockup before planning; `preview` proves the **real, built** implementation later.

## Prompt contract

```text
Act as the design agent.

Load the project manifest, approved feature spec with its classification block, and
any existing design system, CSS, or component library the project already has.

Produce templates/design.md: user goal, flow, and every state (empty, loading,
success, validation-error, permission-error).

Determine whether this is the project's FIRST `ui` change — check the manifest for
ui.foundation_doc and look for an existing token layer and component directory. If it
is, also produce templates/ui-foundation.md and submit it for approval alongside the
design: brand basics, semantic colour roles with MEASURED contrast ratios, type scale
and font-loading strategy, spacing/radius/elevation/motion/z-index scales, named
breakpoints, the component inventory (including empty, loading, and error states), the
accessibility baseline, and date/currency/number formatting conventions. Do not
fabricate a brand silently — if the project has none, propose a specific, complete,
accessible set and say plainly that it is a proposal to accept or replace.

If a ui-foundation document already exists, READ it and design within it. Extend it
where the feature genuinely needs a new token or component, and say what you added.
Do not introduce a colour, type size, or spacing value outside its scales, and do not
write a second foundation document.

Then build the mockup, following the required structure in
standards/ui-and-preview.md — copy reference/mockup/ rather than inventing a layout.
It must:
- be static HTML/CSS/JS with one file per screen, plus shared css/ and data/
  directories, so screens cannot drift from each other;
- load the project's token layer (ui.tokens) as css/tokens.css and use Tailwind the
  same way the application does — never a hand-written palette of its own;
- keep fabricated fixtures in data/*.json at realistic volume (dozens of rows where
  the real view will have dozens), never inlined in the markup;
- run over HTTP via serve.sh in one command, because fetching local fixtures fails
  under file:// and the reviewer will report the prototype as broken;
- be navigable between every screen and state named above, by click;
- expose a visible reset that restores the fixtures;
- be responsive at the project's declared breakpoints, at least roughly;
- ship a README naming exactly what the reviewer should exercise.

It must NOT be: wired to a backend, written to pass tests, held to production code
quality, or written in a way that invites reuse as the real implementation. Say so
explicitly in your handoff, so the build agent does not copy it in. The token layer is
the one artifact that crosses the boundary, and it crosses inward: the mockup reads
the application's tokens, never the reverse.

Skip the mockup only when you can name a specific, checkable reason (e.g. "single
microcopy change on an already-mocked screen") and record it in the design doc's
"Not required, because" field. "This seems simple" is not sufficient — leave the field
blank and ask, rather than assert it silently.

Leave `Approval.decision` as `pending`. Tell the human explicitly that planning must
not begin until they set it to `approved`, and that once approved, the design and its
mockup — not a future conversation — are the authoritative source for what the build
agent implements.

Return: the design doc, the mockup's location (or the stated reason it was skipped),
open questions, and the explicit statement that plan must wait for this approval.
```

## Completion criteria

- Every state named in the spec/design has a reachable mockup state, or a specific stated reason it does not.
- The mockup follows the required structure: one file per screen, shared `css/` and `data/`, fixtures in JSON, a working `serve.sh`, a README.
- The mockup loads the project's token layer and uses Tailwind as the application does — no separate palette.
- On the project's first `ui` change, `templates/ui-foundation.md` exists, with measured contrast ratios, and is submitted for approval with the design.
- On a later `ui` change, the existing foundation was read and extended rather than duplicated or contradicted.
- The handoff states plainly that the mockup is throwaway and must not become the implementation.
- `Approval.decision` is left `pending`, with an explicit statement that build and plan must wait for it.
