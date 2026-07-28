import { index, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const notes = sqliteTable(
  'notes',
  {
    id: text('id').primaryKey(),
    title: text('title').notNull(),
    body: text('body').notNull().default(''),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [
    index('notes_created_at_idx').on(table.createdAt),
  ],
)

export type Note = typeof notes.$inferSelect
export type NewNote = typeof notes.$inferInsert
