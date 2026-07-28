import { desc } from 'drizzle-orm'
import { useDb } from '../../database/client'
import { notes } from '../../database/schema'
import { toNoteDto } from '../../utils/notes'

export default defineEventHandler(async () => {
  const db = useDb()
  const rows = await db.select().from(notes).orderBy(desc(notes.createdAt))
  return {
    notes: rows.map(toNoteDto),
  }
})
