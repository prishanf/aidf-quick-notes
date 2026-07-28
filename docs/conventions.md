---
type: conventions
track: project-setup
required_when: "recommended for any repository an agent will work in"
status: current
owner: prishanf
updated: 2026-07-28
---

# Codebase conventions

## Orientation

- **What this system does:** AIDF Quick Notes is a single-user local notes app used to exercise the AI Development Framework. Users create, list, edit, and delete short notes stored in SQLite.
- **Entry points:** `nuxt.config.ts` — Nuxt app and Nitro server; `npm run dev` starts both.
- **Where the domain logic lives:** `server/api/` (HTTP), `server/database/` (Drizzle schema + client).
- **Where the tests live:** `tests/**/*.test.ts` — Vitest + `@nuxt/test-utils` HTTP coverage.
- **Generated code — never edit by hand:** `.nuxt/`, `.output/`, `server/database/migrations/meta/` (Drizzle kit output except reviewed SQL).

## Reference implementations

| To add a... | Copy the shape of | Notes |
|---|---|---|
| API endpoint | `server/api/notes/index.get.ts` / `index.post.ts` | Validate in route or `server/utils/notes.ts` |
| Database query / repository | `server/database/client.ts` + `schema.ts` | Use `useDb()`; migrations auto-apply on connect |
| UI page | `app/pages/index.vue` | Token utilities only; states: empty/loading/error |
| Test | `tests/notes.test.ts` | Hit real HTTP routes via `$fetch` |

## Established patterns

- **Error handling:** Use `createError` from h3 with appropriate status codes; return JSON bodies only.
- **Validation:** Validate request bodies on the server before writes; reject empty titles.
- **Logging:** Prefer structured console logging in server routes; never log note bodies in production logs for this example beyond debug.
- **Naming:** Nuxt file-based routes (`notes.get.ts`); camelCase for TS identifiers; kebab-case for docs filenames.
- **Auth:** None for this example — single local user. Authorization tests document that absence rather than inventing fake multi-tenant checks.
- **Database:** Drizzle + better-sqlite3; versioned migrations only; no app-role auto-migrate in production paths.
- **CSS:** Tailwind utilities resolving through `app/assets/css/tokens.css` semantic variables.

## Do not

- Do not add authentication, sharing, Markdown, or folders without a new approved spec.
- Do not edit `.aidf/` — upgrade the framework with the install script.
- Do not assert check results without a runner; write evidence for CI to corroborate.
- Do not skip Track C gates for schema changes.
