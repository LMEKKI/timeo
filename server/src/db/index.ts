import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

const connectionString = process.env.DATABASE_URL
if (!connectionString) throw new Error('DATABASE_URL is required')

const client = postgres(connectionString, {
  max: 20,             // Max connections in pool
  idle_timeout: 30,    // Close idle connections after 30s
  connect_timeout: 10, // Fail fast if DB unreachable
})

export const db = drizzle(client, { schema })

export type DrizzleDB = typeof db

// Base type compatible with both postgres-js and PGLite for test use
export type BasePgDB = import('drizzle-orm/pg-core').PgDatabase

export { schema }
