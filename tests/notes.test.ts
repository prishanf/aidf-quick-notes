import { fileURLToPath } from 'node:url'
import { mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterAll, describe, expect, it } from 'vitest'
import { $fetch, setup } from '@nuxt/test-utils/e2e'

const dbDir = mkdtempSync(join(tmpdir(), 'aidf-notes-'))
const sqlitePath = join(dbDir, 'test.sqlite')
process.env.SQLITE_PATH = sqlitePath
process.env.NUXT_SQLITE_PATH = sqlitePath

describe('notes API', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('..', import.meta.url)),
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
    const created = await $fetch<{
      id: string
      title: string
      body: string
      createdAt: string
      updatedAt: string
    }>('/api/notes', {
      method: 'POST',
      body: { title: ' First note ', body: 'Hello' },
    })

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
})
