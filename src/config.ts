import { Database } from './db'
import { DidResolver } from '@atproto/identity'
import { PoolConfig } from 'pg'

export type AppContext = {
  db: Database
  didResolver: DidResolver
  cfg: Config
}

export type Config = {
  port: number
  listenhost: string
  hostname: string
  subscriptionEndpoint: string
  serviceDid: string
  publisherDid: string
  subscriptionReconnectDelay: number
  // sqlite
  // sqliteLocation: string
  postgres: Partial<PoolConfig>
}
