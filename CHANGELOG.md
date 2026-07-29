# Changelog

All notable changes to this project are recorded here, most recent first.
Track B/C changes are required to add an entry under `[Unreleased]`; Track A
is optional. See `.aidf/standards/quality-gates.md`.

## [Unreleased]

## [1.0.0] - 2026-07-29

Release notes: `docs/releases/v1.0.0.md`.

### Added

- Markdown-formatted note body: body renders as a safe CommonMark subset (headings, bold/italic, links, lists, code, blockquotes) everywhere it is shown; a Write/Preview toggle on the create and edit forms shows the same rendering before saving. Raw HTML/script in a body is always escaped to visible text, never executed; unsafe-scheme links (e.g. `javascript:`) never become clickable. No schema, migration, or API contract change — `body` stays a plain string; existing notes with incidental Markdown-significant characters may render differently.
- Edit a note: inline row edit on the home page, `PATCH /api/notes/:id` with partial title/body updates, `updatedAt` advanced on save.

### Changed

- Upgrade vendored AIDF to 5.1.1 (design agents extend shared mockup packages instead of copying per feature).
- Design mockups: consolidate create/list/edit/delete into one shared `docs/design/mockups/notes/` package (tokens symlink to the app); retire per-feature scaffold copies that duplicated HTML/CSS/JS.

### Fixed

- Concurrent-delete during edit now surfaces a not-found alert instead of silently failing (`371a7ba`).

## [0.1.0] - 2026-07-28

Release notes: `docs/releases/v0.1.0.md`.

### Added

- Delete a note: per-row Delete with confirm dialog, `DELETE /api/notes/:id` (204 / 404), hard delete in SQLite.
- Create and list notes: SQLite `notes` table, `GET/POST /api/notes`, home UI with empty/loading/error/validation states.
- Feature 1 AIDF artifacts: approved spec, design, UI foundation, mockup, plan, data model, API contract, migration.
- Project bootstrap: Nuxt 4, Tailwind v4, Drizzle/SQLite plumbing, AIDF 5.0.0, health endpoint.
