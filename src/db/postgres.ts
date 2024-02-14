// Vercel provides a good example of postgres + kysely
// @see https://github.com/vercel/examples/tree/main/storage/postgres-kysely
import { Kysely, PostgresDialect } from 'kysely'
import { Pool, PoolConfig } from 'pg'
import { DatabaseSchema } from './schema'
import { Database } from './database'

export const createDb = (config: Partial<PoolConfig>/** 
TODO: asses whether we should get config from args or directly env
config: PoolConfig */): Database => {
    // @see https://kysely.dev/docs/getting-started
    return new Kysely<DatabaseSchema>({
        // TODO: currently running only locally
        dialect: new PostgresDialect({
            pool: new Pool({
                database: "postgres",
                host: "localhost",
                user: "postgres",
                password: process.env.FEEDGEN_POSTGRES_PASSWORD,
                port: 5432,
                // client pool size
                max: 10,
                ...config,
            })
        }),
    })
}

