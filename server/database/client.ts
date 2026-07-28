import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import * as schema from './schema'

let sqlite: Database.Database | undefined
let db: ReturnType<typeof drizzle<typeof schema>> | undefined

export function useDb() {
  if (db) {
    return db
  }

  const config = useRuntimeConfig()
  const path = config.sqlitePath as string
  mkdirSync(dirname(path), { recursive: true })

  sqlite = new Database(path)
  sqlite.pragma('journal_mode = WAL')
  db = drizzle(sqlite, { schema })
  return db
}

export function closeDb() {
  sqlite?.close()
  sqlite = undefined
  db = undefined
}
