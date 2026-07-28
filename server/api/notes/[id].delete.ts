import { eq } from 'drizzle-orm'
import { useDb } from '../../database/client'
import { notes } from '../../database/schema'
import { validateNoteId } from '../../utils/notes'

export default defineEventHandler(async (event) => {
  const id = validateNoteId(getRouterParam(event, 'id'))
  const db = useDb()
  const removed = await db.delete(notes).where(eq(notes.id, id)).returning({ id: notes.id })

  if (removed.length === 0) {
    throw createError({
      statusCode: 404,
      statusMessage: 'That note was not found. It may already have been deleted.',
    })
  }

  setResponseStatus(event, 204)
  return null
})
