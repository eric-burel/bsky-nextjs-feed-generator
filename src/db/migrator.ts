import { Migrator } from 'kysely'
import { migrationProvider } from './migrations'
import { Database } from './database'

export const migrateToLatest = async (db: Database) => {
    const migrator = new Migrator({ db, provider: migrationProvider })
    const { error } = await migrator.migrateToLatest()
    if (error) throw error
}
