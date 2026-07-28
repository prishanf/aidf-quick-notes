# AIDF Quick Notes

Minimal Nuxt + SQLite example used to exercise the [AI Development Framework](https://github.com/prishanf/aidf-quick-notes) (AIDF) lifecycle.

## Stack

- Nuxt 4 + Tailwind
- SQLite via Drizzle ORM + better-sqlite3
- Vitest + `@nuxt/test-utils` for HTTP coverage
- AIDF 5.0.0 vendored in `.aidf/`

## Planned features (Track C each)

1. Create & list notes
2. Delete a note
3. Edit a note

## Local setup

```bash
cp .env.example .env
npm ci
npm run dev
```

App: http://localhost:3000 · Health: http://localhost:3000/api/health

## AIDF commands

Fill and validate the manifest, then follow `.aidf/guide/03-workflow.md`.

```bash
sh .aidf/reference/scripts/validate-manifest.sh project.yaml
```

Product work uses the contracts in `.aidf/commands/` (`spec`, `design`, `plan`, `build`, `review`, …). Do not edit `.aidf/` — upgrade with the framework install script.

## Branches

GitFlow default: `main` (production) + `develop` (QA integration). Features branch from `develop`.
