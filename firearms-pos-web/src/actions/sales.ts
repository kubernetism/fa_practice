'use server'

import { db } from '@/lib/db'
import { sales, saleItems } from '@/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'
import { auth } from '@/lib/auth/config'

export async function getSales(params?: {
  limit?: number
}) {
  const session = await auth()
  if (!session) return { success: false, message: 'Unauthorized' }

  const tenantId = (session as any).tenantId

  const data = await db
    .select()
    .from(sales)
    .where(eq(sales.tenantId, tenantId))
    .orderBy(desc(sales.createdAt))
    .limit(params?.limit ?? 50)

  return { success: true, data }
}

export async function getSaleById(saleId: number) {
  const session = await auth()
  if (!session) return { success: false, message: 'Unauthorized' }

  const tenantId = (session as any).tenantId

  const sale = await db.query.sales.findFirst({
    where: and(eq(sales.id, saleId), eq(sales.tenantId, tenantId)),
  })

  if (!sale) return { success: false, message: 'Sale not found' }

  const items = await db
    .select()
    .from(saleItems)
    .where(eq(saleItems.saleId, saleId))

  return { success: true, data: { ...sale, items } }
}
