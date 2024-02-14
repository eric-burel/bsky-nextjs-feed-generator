import { Kysely, Migration, MigrationProvider } from 'kysely'

const migrations: Record<string, Migration> = {}

export const migrationProvider: MigrationProvider = {
  async getMigrations() {
    return migrations
  },
}

// Add migrations manually here
migrations['001'] = {
  async up(db: Kysely<unknown>) {
    try {

      await db.schema
        .createTable('post')
        .addColumn('uri', 'varchar', (col) => col.primaryKey())
        .addColumn('cid', 'varchar', (col) => col.notNull())
        .addColumn('replyParent', 'varchar')
        .addColumn('replyRoot', 'varchar')
        .addColumn('indexedAt', 'varchar', (col) => col.notNull())
        .execute()
      // additionnal table to label posts during indexing,
      // allowing to handle multiple feeds efficiently
      await db.schema
        .createTable('label')
        .addColumn('uri', 'varchar', (col) => col.primaryKey())
        .addColumn('label', 'varchar', (col) => col.notNull())
        .execute()
      await db.schema
        .createTable('sub_state')
        .addColumn('service', 'varchar', (col) => col.primaryKey())
        .addColumn('cursor', 'integer', (col) => col.notNull())
        .execute()
    } catch (err) {
      console.error("Could not migrate tables", err)
      throw err
    }
  },
  async down(db: Kysely<unknown>) {
    await db.schema.dropTable('post').execute()
    await db.schema.dropTable('sub_state').execute()
  },
}
