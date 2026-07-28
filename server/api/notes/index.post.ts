import { randomUUID } from 'node:crypto'
import { useDb } from '../../database/client'
import { notes } from '../../database/schema'
import { toNoteDto, validateCreateNote } from '../../utils/notes'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { title, body: noteBody } = validateCreateNote(body)
  const now = new Date().toISOString()
  const row = {
    id: randomUUID(),
    title,
    body: noteBody,
    createdAt: now,
    updatedAt: now,
  }

  const db = useDb()
  await db.insert(notes).values(row)
  setResponseStatus(event, 201)
  return toNoteDto(row)
})
