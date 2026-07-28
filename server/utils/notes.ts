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
