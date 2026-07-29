export const TITLE_MIN = 1
export const TITLE_MAX = 120
export const BODY_MAX = 5000

export type NoteDto = {
  id: string
  title: string
  body: string
  createdAt: string
  updatedAt: string
}

export type NoteRow = {
  id: string
  title: string
  body: string
  createdAt: string
  updatedAt: string
}

export function toNoteDto(row: NoteRow): NoteDto {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  }
}

export function validateNoteId(id: unknown): string {
  if (typeof id !== 'string' || !id.trim()) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Note id is required.',
    })
  }
  return id.trim()
}

export function validateCreateNote(input: unknown): { title: string; body: string } {
  if (!input || typeof input !== 'object') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Request body must be a JSON object.',
    })
  }

  const raw = input as Record<string, unknown>
  const title = typeof raw.title === 'string' ? raw.title.trim() : ''
  const body = typeof raw.body === 'string' ? raw.body : raw.body === undefined || raw.body === null ? '' : null

  if (body === null) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Body must be a string when provided.',
    })
  }

  if (title.length < TITLE_MIN || title.length > TITLE_MAX) {
    throw createError({
      statusCode: 400,
      statusMessage: `Enter a title between ${TITLE_MIN} and ${TITLE_MAX} characters.`,
    })
  }

  if (body.length > BODY_MAX) {
    throw createError({
      statusCode: 400,
      statusMessage: `Body must be ${BODY_MAX} characters or fewer.`,
    })
  }

  return { title, body }
}

export type PatchNoteInput = {
  title?: string
  body?: string
}

export function validatePatchNote(input: unknown): PatchNoteInput {
  if (!input || typeof input !== 'object') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Request body must be a JSON object.',
    })
  }

  const raw = input as Record<string, unknown>
  const hasTitle = Object.prototype.hasOwnProperty.call(raw, 'title')
  const hasBody = Object.prototype.hasOwnProperty.call(raw, 'body')

  if (!hasTitle && !hasBody) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Provide at least one of title or body.',
    })
  }

  const patch: PatchNoteInput = {}

  if (hasTitle) {
    if (typeof raw.title !== 'string') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Title must be a string when provided.',
      })
    }
    const title = raw.title.trim()
    if (title.length < TITLE_MIN || title.length > TITLE_MAX) {
      throw createError({
        statusCode: 400,
        statusMessage: `Enter a title between ${TITLE_MIN} and ${TITLE_MAX} characters.`,
      })
    }
    patch.title = title
  }

  if (hasBody) {
    if (typeof raw.body !== 'string') {
      throw createError({
        statusCode: 400,
        statusMessage: 'Body must be a string when provided.',
      })
    }
    if (raw.body.length > BODY_MAX) {
      throw createError({
        statusCode: 400,
        statusMessage: `Body must be ${BODY_MAX} characters or fewer.`,
      })
    }
    patch.body = raw.body
  }

  return patch
}
