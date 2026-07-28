import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { setup, $fetch } from '@nuxt/test-utils/e2e'

describe('GET /api/health', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('..', import.meta.url)),
  })

  it('returns ok', async () => {
    const body = await $fetch<{ ok: boolean; service: string }>('/api/health')
    expect(body.ok).toBe(true)
    expect(body.service).toBe('aidf-quick-notes')
  })
})
