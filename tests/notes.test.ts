import { fileURLToPath } from 'node:url'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import { afterAll, describe, expect, it } from 'vitest'
import { $fetch, fetch, setup } from '@nuxt/test-utils/e2e'

const rootDir = fileURLToPath(new URL('..', import.meta.url))
const dbDir = mkdtempSync(join(tmpdir(), 'aidf-notes-'))
const sqlitePath = join(dbDir, 'test.sqlite')
process.env.SQLITE_PATH = sqlitePath
process.env.NUXT_SQLITE_PATH = sqlitePath

// Migrations are operator-owned (`npm run db:migrate`), not applied by the app.
const bootstrap = new Database(sqlitePath)
migrate(drizzle(bootstrap), {
  migrationsFolder: join(rootDir, 'server/database/migrations'),
})
bootstrap.close()

describe('notes API', async () => {
  await setup({
    rootDir,
    env: {
      SQLITE_PATH: sqlitePath,
      NUXT_SQLITE_PATH: sqlitePath,
    },
  })

  afterAll(async () => {
    // SQLite file is left in the temp dir for OS cleanup.
  })

  it('GET /api/notes returns an empty list initially', async () => {
    const body = await $fetch<{ notes: unknown[] }>('/api/notes')
    expect(body.notes).toEqual([])
  })

  it('POST /api/notes creates a note and GET returns it newest-first', async () => {
    const response = await fetch('/api/notes', {
      method: 'POST',
      body: JSON.stringify({ title: ' First note ', body: 'Hello' }),
      headers: { 'content-type': 'application/json' },
    })
    expect(response.status).toBe(201)

    const created = await response.json() as {
      id: string
      title: string
      body: string
      createdAt: string
      updatedAt: string
    }

    expect(created.id).toBeTruthy()
    expect(created.title).toBe('First note')
    expect(created.body).toBe('Hello')
    expect(created.createdAt).toBeTruthy()

    const second = await $fetch<{ id: string; title: string }>('/api/notes', {
      method: 'POST',
      body: { title: 'Second note' },
    })
    expect(second.title).toBe('Second note')

    const listed = await $fetch<{ notes: Array<{ id: string; title: string }> }>('/api/notes')
    expect(listed.notes.length).toBeGreaterThanOrEqual(2)
    expect(listed.notes[0]?.title).toBe('Second note')
    expect(listed.notes.some(n => n.id === created.id)).toBe(true)
  })

  it('POST /api/notes rejects an empty title with 400', async () => {
    await expect(
      $fetch('/api/notes', {
        method: 'POST',
        body: { title: '   ', body: 'x' },
      }),
    ).rejects.toMatchObject({
      statusCode: 400,
    })
  })

  it('DELETE /api/notes/:id removes a note and returns 204', async () => {
    const created = await $fetch<{ id: string; title: string }>('/api/notes', {
      method: 'POST',
      body: { title: 'Delete me', body: 'gone soon' },
    })

    const response = await fetch(`/api/notes/${created.id}`, { method: 'DELETE' })
    expect(response.status).toBe(204)

    const listed = await $fetch<{ notes: Array<{ id: string }> }>('/api/notes')
    expect(listed.notes.some(n => n.id === created.id)).toBe(false)
  })

  it('DELETE /api/notes/:id returns 404 for an unknown id', async () => {
    await expect(
      $fetch('/api/notes/00000000-0000-4000-8000-000000000000', {
        method: 'DELETE',
      }),
    ).rejects.toMatchObject({
      statusCode: 404,
    })
  })

  it('DELETE /api/notes/:id rejects a blank id with 400', async () => {
    const response = await fetch('/api/notes/%20', { method: 'DELETE' })
    expect(response.status).toBe(400)
  })
})
