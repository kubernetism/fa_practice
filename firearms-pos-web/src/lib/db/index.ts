import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { sql } from 'drizzle-orm'
import * as schema from './schema'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export const db = drizzle(pool, { schema })

/**
 * Get a tenant-scoped database context.
 * Sets the RLS variable and returns the db + tenantId.
 */
export async function tenantDb(tenantId: number) {
  await db.execute(sql`SET LOCAL app.current_tenant_id = ${tenantId}`)
  return { db, tenantId }
}

export type Database = typeof db
