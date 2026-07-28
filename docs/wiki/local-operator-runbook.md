---
type: wiki-page
track: B
required_when: "knowledge is reusable beyond this change"
status: current
owner: prishanf
updated: 2026-07-28
audience: developer
---

# Local operator runbook

## Summary

Run migrations before starting the app. Notes live in one SQLite file. Deletes are permanent.

## When to use this

Local development, Preview, and any first deploy of v0.1.0+ that uses the `notes` table.

## Procedure

1. `npm ci`
2. Optional: set `SQLITE_PATH` / `NUXT_SQLITE_PATH` to an isolated file (recommended for Preview).
3. `npm run db:migrate` — creates `notes` if missing. The app does **not** auto-migrate.
4. `npm run dev` (or `npm run build` then serve `.output`).
5. Create / list / delete notes on `/`. Confirm before delete; there is no undo.

### Recovery point (before production or risky experiments)

```bash
cp "$SQLITE_PATH" "$SQLITE_PATH.backup-$(date +%Y%m%d%H%M%S)"
```

Default path if unset: `./data/notes.sqlite`.

## Troubleshooting

| Symptom | Likely cause | Resolution |
|---|---|---|
| API/DB errors on first run | Migrations not applied | `npm run db:migrate` |
| Empty list after restart | Different `SQLITE_PATH` | Align env vars; check file path |
| Delete returns 404 | Id already removed or wrong id | Refresh list; do not retry blindly |
| Need to wipe all notes | — | Stop app; delete SQLite file (+ `-wal`/`-shm`); re-migrate |

## Related

- Architecture: `docs/architecture/overview.md`
- Data model: `docs/architecture/data-model.md`
- ADRs: `docs/decisions/0001-local-sqlite-no-auth.md`, `docs/decisions/0002-hard-delete-notes.md`
- Release: `docs/releases/v0.1.0.md`
- Migration plan: `docs/migrations/001-create-notes.md`
