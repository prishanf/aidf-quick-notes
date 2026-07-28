import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { migrate } from 'drizzle-orm/better-sqlite3/migrator'
import { mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import * as schema from './schema'

let sqlite: Database.Database | undefined
let db: ReturnType<typeof drizzle<typeof schema>> | undefined

export function useDb() {
  if (db) {
    return db
  }

  const config = useRuntimeConfig()
  const path = (config.sqlitePath as string) || process.env.SQLITE_PATH || './data/notes.sqlite'
  mkdirSync(dirname(path), { recursive: true })

  sqlite = new Database(path)
  sqlite.pragma('journal_mode = WAL')
  db = drizzle(sqlite, { schema })
  migrate(db, {
    migrationsFolder: join(process.cwd(), 'server/database/migrations'),
  })
  return db
}

export function closeDb() {
  sqlite?.close()
  sqlite = undefined
  db = undefined
}
