---
type: architecture
track: project-setup
status: current
owner: prishanf
updated: 2026-07-29
---

# Architecture overview

## Purpose

AIDF Quick Notes is a single-process Nuxt application: Vue UI in `app/`, Nitro API routes in `server/api/`, and a local SQLite file accessed through Drizzle.

## Runtime shape

```text
Browser → Nuxt UI (app/) → Nitro (server/api/) → Drizzle → SQLite file
```

## Boundaries

- No authentication; one local user assumed.
- No external services; no MCP.
- Schema changes require Track C (`database` tag), versioned Drizzle migrations, and an updated data model document.

## Durable docs

- Data model: `docs/architecture/data-model.md` (created with Feature 1)
- UI foundation: `docs/design/ui-foundation.md` (created with first `ui` feature)
- Conventions: `docs/conventions.md`
- ADRs: `docs/decisions/0001-local-sqlite-no-auth.md`, `docs/decisions/0002-hard-delete-notes.md`, `docs/decisions/0003-markdown-safe-subset-no-raw-html.md`
- Operator wiki: `docs/wiki/local-operator-runbook.md`
- Release: `docs/releases/v1.0.0.md` (prior: `docs/releases/v0.1.0.md`)
