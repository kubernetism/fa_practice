'use server'

import { db } from '@/lib/db'
import { inventory, products } from '@/lib/db/schema'
import { eq, and, lte } from 'drizzle-orm'
import { auth } from '@/lib/auth/config'

export async function getInventory(params?: { branchId?: number }) {
  const session = await auth()
  if (!session) return { success: false, message: 'Unauthorized' }

  const tenantId = (session as any).tenantId
  const branchId = params?.branchId ?? (session as any).branchId

  const conditions = [eq(inventory.tenantId, tenantId)]
  if (branchId) {
    conditions.push(eq(inventory.branchId, branchId))
  }

  const data = await db
    .select()
    .from(inventory)
    .innerJoin(products, eq(inventory.productId, products.id))
    .where(and(...conditions))

  return { success: true, data }
}

export async function getLowStockItems(branchId?: number) {
  const session = await auth()
  if (!session) return { success: false, message: 'Unauthorized' }

  const tenantId = (session as any).tenantId

  const conditions = [
    eq(inventory.tenantId, tenantId),
    lte(inventory.quantity, inventory.minQuantity),
  ]
  if (branchId) {
    conditions.push(eq(inventory.branchId, branchId))
  }

  const data = await db
    .select()
    .from(inventory)
    .innerJoin(products, eq(inventory.productId, products.id))
    .where(and(...conditions))

  return { success: true, data }
}
