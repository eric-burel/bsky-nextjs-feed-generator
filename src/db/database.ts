import { DatabaseSchema } from './schema'
import { Kysely } from 'kysely'

export type Database = Kysely<DatabaseSchema>