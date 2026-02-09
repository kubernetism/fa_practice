'use server'

import { db } from '@/lib/db'
import { returns, returnItems, sales, customers, products, inventory } from '@/lib/db/schema'
import { eq, and, desc, sql, count } from 'drizzle-orm'
import { auth } from '@/lib/auth/config'
import { restoreCostLayers } from '@/lib/accounting/cost-layers'
import { postReturnToGL } from '@/lib/accounting/gl-posting'

async function getTenantId() {
  const session = await auth()
  const tenantId = (session as any)?.tenantId
  if (!tenantId) throw new Error('No tenant context')
  return tenantId as number
}

export async function getReturns(params?: {
  returnType?: string
  limit?: number
}) {
  const tenantId = await getTenantId()

  const conditions = [eq(returns.tenantId, tenantId)]
  if (params?.returnType && params.returnType !== 'all') {
    conditions.push(eq(returns.returnType, params.returnType as any))
  }

  const data = await db
    .select({
      return: returns,
      customerName: sql<string>`${customers.firstName} || ' ' || ${customers.lastName}`,
    })
    .from(returns)
    .leftJoin(customers, eq(returns.customerId, customers.id))
    .where(and(...conditions))
    .orderBy(desc(returns.returnDate))
    .limit(params?.limit ?? 100)

  return { success: true, data }
}

export async function getReturnSummary() {
  const tenantId = await getTenantId()

  const result = await db
    .select({
      totalReturns: count(),
      totalRefunded: sql<string>`COALESCE(SUM(${returns.refundAmount}), 0)`,
      refundCount: sql<number>`COUNT(*) FILTER (WHERE ${returns.returnType} = 'refund')`,
      exchangeCount: sql<number>`COUNT(*) FILTER (WHERE ${returns.returnType} = 'exchange')`,
      storeCreditCount: sql<number>`COUNT(*) FILTER (WHERE ${returns.returnType} = 'store_credit')`,
    })
    .from(returns)
    .where(eq(returns.tenantId, tenantId))

  return { success: true, data: result[0] }
}

export async function getReturnById(id: number) {
  const tenantId = await getTenantId()

  const [ret] = await db
    .select({
      return: returns,
      customerName: sql<string>`${customers.firstName} || ' ' || ${customers.lastName}`,
    })
    .from(returns)
    .leftJoin(customers, eq(returns.customerId, customers.id))
    .where(and(eq(returns.id, id), eq(returns.tenantId, tenantId)))

  if (!ret) return { success: false, message: 'Return not found' }

  const items = await db
    .select({
      item: returnItems,
      productName: products.name,
      productCode: products.code,
    })
    .from(returnItems)
    .leftJoin(products, eq(returnItems.productId, products.id))
    .where(eq(returnItems.returnId, id))

  return { success: true, data: { ...ret, items } }
}

export async function createReturn(input: {
  originalSaleId: number
  customerId?: number
  branchId: number
  returnType: string
  refundMethod?: string
  reason?: string
  notes?: string
  items: {
    saleItemId: number
    productId: number
    serialNumber?: string
    quantity: number
    unitPrice: number
    condition: string
    restockable: boolean
  }[]
}) {
  const tenantId = await getTenantId()
  const session = await auth()
  const userId = Number(session?.user?.id)

  const subtotal = input.items.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  )

  const returnNumber = `RTN-${Date.now().toString(36).toUpperCase()}`

  const [ret] = await db
    .insert(returns)
    .values({
      tenantId,
      returnNumber,
      originalSaleId: input.originalSaleId,
      customerId: input.customerId || null,
      branchId: input.branchId,
      userId,
      returnType: input.returnType as any,
      subtotal: String(subtotal),
      totalAmount: String(subtotal),
      refundMethod: (input.refundMethod as any) || null,
      refundAmount: String(subtotal),
      reason: input.reason || null,
      notes: input.notes || null,
    })
    .returning()

  for (const item of input.items) {
    await db.insert(returnItems).values({
      returnId: ret.id,
      saleItemId: item.saleItemId,
      productId: item.productId,
      serialNumber: item.serialNumber || null,
      quantity: item.quantity,
      unitPrice: String(item.unitPrice),
      totalPrice: String(item.quantity * item.unitPrice),
      condition: item.condition as any,
      restockable: item.restockable,
    })

    if (item.restockable) {
      await db
        .update(inventory)
        .set({
          quantity: sql`${inventory.quantity} + ${item.quantity}`,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(inventory.tenantId, tenantId),
            eq(inventory.productId, item.productId),
            eq(inventory.branchId, input.branchId)
          )
        )

      // Restore cost layers for restocked items
      try {
        await restoreCostLayers({
          tenantId,
          productId: item.productId,
          branchId: input.branchId,
          quantity: item.quantity,
          unitCost: item.unitPrice,
        })
      } catch (e) {
        console.error('Cost layer restore failed:', e)
      }
    }
  }

  // Post return to GL
  try {
    // Calculate tax portion from original sale
    const [originalSale] = await db
      .select()
      .from(sales)
      .where(eq(sales.id, input.originalSaleId))

    const taxRatio = originalSale
      ? Number(originalSale.taxAmount) / Math.max(Number(originalSale.totalAmount), 1)
      : 0
    const returnTaxAmount = subtotal * taxRatio

    await postReturnToGL({
      tenantId,
      returnId: ret.id,
      originalSaleId: input.originalSaleId,
      branchId: input.branchId,
      userId,
      refundAmount: subtotal,
      taxAmount: returnTaxAmount,
      costOfGoods: input.items
        .filter((i) => i.restockable)
        .reduce((s, i) => s + i.quantity * i.unitPrice, 0),
      refundMethod: input.refundMethod || input.returnType,
    })
  } catch (e) {
    console.error('GL posting failed for return:', e)
  }

  return { success: true, data: ret }
}

export async function approveReturn(id: number) {
  const tenantId = await getTenantId()
  const session = await auth()
  const userId = Number(session?.user?.id)

  const [ret] = await db
    .select()
    .from(returns)
    .where(and(eq(returns.id, id), eq(returns.tenantId, tenantId)))

  if (!ret) return { success: false, message: 'Return not found' }

  // Mark as approved via notes
  const approvalNote = `[APPROVED by user ${userId} on ${new Date().toISOString()}]`
  const updatedNotes = ret.notes ? `${ret.notes}\n${approvalNote}` : approvalNote

  const [updated] = await db
    .update(returns)
    .set({ notes: updatedNotes, updatedAt: new Date() })
    .where(eq(returns.id, id))
    .returning()

  // Post to GL if not already posted
  try {
    const [originalSale] = await db
      .select()
      .from(sales)
      .where(eq(sales.id, ret.originalSaleId))

    const taxRatio = originalSale
      ? Number(originalSale.taxAmount) / Math.max(Number(originalSale.totalAmount), 1)
      : 0
    const returnTaxAmount = Number(ret.totalAmount) * taxRatio

    const items = await db
      .select()
      .from(returnItems)
      .where(eq(returnItems.returnId, id))

    const costOfGoods = items
      .filter((i) => i.restockable)
      .reduce((s, i) => s + Number(i.totalPrice), 0)

    await postReturnToGL({
      tenantId,
      returnId: id,
      originalSaleId: ret.originalSaleId,
      branchId: ret.branchId,
      userId,
      refundAmount: Number(ret.refundAmount),
      taxAmount: returnTaxAmount,
      costOfGoods,
      refundMethod: ret.refundMethod || ret.returnType,
    })
  } catch (e) {
    console.error('GL posting failed for approved return:', e)
  }

  return { success: true, data: updated }
}

export async function rejectReturn(id: number, reason?: string) {
  const tenantId = await getTenantId()
  const session = await auth()
  const userId = Number(session?.user?.id)

  const [ret] = await db
    .select()
    .from(returns)
    .where(and(eq(returns.id, id), eq(returns.tenantId, tenantId)))

  if (!ret) return { success: false, message: 'Return not found' }

  const rejectionNote = `[REJECTED by user ${userId} on ${new Date().toISOString()}]${reason ? ` Reason: ${reason}` : ''}`
  const updatedNotes = ret.notes ? `${ret.notes}\n${rejectionNote}` : rejectionNote

  const [updated] = await db
    .update(returns)
    .set({ notes: updatedNotes, updatedAt: new Date() })
    .where(eq(returns.id, id))
    .returning()

  return { success: true, data: updated }
}

export async function deleteReturn(id: number) {
  const tenantId = await getTenantId()

  await db
    .delete(returnItems)
    .where(eq(returnItems.returnId, id))

  await db
    .delete(returns)
    .where(and(eq(returns.id, id), eq(returns.tenantId, tenantId)))

  return { success: true }
}
