---
type: architecture
track: project-setup
status: current
owner: prishanf
updated: 2026-07-28
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
