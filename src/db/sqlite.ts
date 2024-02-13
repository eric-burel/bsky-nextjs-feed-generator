import SqliteDb from 'better-sqlite3'
import { Kysely, Migrator, SqliteDialect } from 'kysely'
import { DatabaseSchema } from './schema'
import { Database } from './database'

export const createDb = (location: string): Database => {
  return new Kysely<DatabaseSchema>({
    dialect: new SqliteDialect({
      database: new SqliteDb(location),
    }),
  })
}

