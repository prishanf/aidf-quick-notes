import { eq } from 'drizzle-orm'
import { useDb } from '../../database/client'
import { notes } from '../../database/schema'
import { toNoteDto, validateNoteId, validatePatchNote } from '../../utils/notes'

export default defineEventHandler(async (event) => {
  const id = validateNoteId(getRouterParam(event, 'id'))
  const patch = validatePatchNote(await readBody(event))
  const now = new Date().toISOString()

  const db = useDb()
  const updated = await db
    .update(notes)
    .set({
      ...patch,
      updatedAt: now,
    })
    .where(eq(notes.id, id))
    .returning()

  if (updated.length === 0) {
    throw createError({
      statusCode: 404,
      statusMessage: 'That note was not found. It may already have been deleted.',
    })
  }

  return toNoteDto(updated[0]!)
})
