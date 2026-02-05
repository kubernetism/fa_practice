'use server'

import { db } from '@/lib/db'
import { customers } from '@/lib/db/schema'
import { eq, and, ilike, or } from 'drizzle-orm'
import { auth } from '@/lib/auth/config'

export async function getCustomers(params?: { search?: string }) {
  const session = await auth()
  if (!session) return { success: false, message: 'Unauthorized' }

  const tenantId = (session as any).tenantId
  const conditions = [eq(customers.tenantId, tenantId)]

  if (params?.search) {
    conditions.push(
      or(
        ilike(customers.firstName, `%${params.search}%`),
        ilike(customers.lastName, `%${params.search}%`),
        ilike(customers.phone, `%${params.search}%`)
      )!
    )
  }

  const data = await db
    .select()
    .from(customers)
    .where(and(...conditions))
    .orderBy(customers.firstName)

  return { success: true, data }
}
