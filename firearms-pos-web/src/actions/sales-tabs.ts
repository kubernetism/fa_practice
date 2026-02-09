'use server'

import { db } from '@/lib/db'
import { salesTabs, salesTabItems, customers, products } from '@/lib/db/schema'
import { eq, and, desc, sql, count } from 'drizzle-orm'
import { auth } from '@/lib/auth/config'

async function getTenantId() {
  const session = await auth()
  const tenantId = (session as any)?.tenantId
  if (!tenantId) throw new Error('No tenant context')
  return tenantId as number
}

export async function getSalesTabs(params?: { status?: string; branchId?: number }) {
  const tenantId = await getTenantId()

  const conditions = [eq(salesTabs.tenantId, tenantId)]
  if (params?.status && params.status !== 'all') {
    conditions.push(eq(salesTabs.status, params.status as any))
  }
  if (params?.branchId) {
    conditions.push(eq(salesTabs.branchId, params.branchId))
  }

  const data = await db
    .select({
      tab: salesTabs,
      customerName: sql<string>`${customers.firstName} || ' ' || ${customers.lastName}`,
    })
    .from(salesTabs)
    .leftJoin(customers, eq(salesTabs.customerId, customers.id))
    .where(and(...conditions))
    .orderBy(desc(salesTabs.createdAt))

  return { success: true, data }
}

export async function getSalesTabById(tabId: number) {
  const tenantId = await getTenantId()

  const [tab] = await db
    .select({
      tab: salesTabs,
      customerName: sql<string>`${customers.firstName} || ' ' || ${customers.lastName}`,
    })
    .from(salesTabs)
    .leftJoin(customers, eq(salesTabs.customerId, customers.id))
    .where(and(eq(salesTabs.id, tabId), eq(salesTabs.tenantId, tenantId)))

  if (!tab) return { success: false, message: 'Tab not found' }

  const items = await db
    .select()
    .from(salesTabItems)
    .where(eq(salesTabItems.tabId, tabId))
    .orderBy(desc(salesTabItems.addedAt))

  return { success: true, data: { ...tab, items } }
}

export async function createSalesTab(data: {
  branchId: number
  customerId?: number | null
  notes?: string
}) {
  const tenantId = await getTenantId()
  const session = await auth()
  const userId = Number(session?.user?.id)

  const tabNumber = `TAB-${Date.now()}`

  const [tab] = await db
    .insert(salesTabs)
    .values({
      tenantId,
      tabNumber,
      branchId: data.branchId,
      customerId: data.customerId || null,
      userId,
      status: 'open',
      notes: data.notes || null,
    })
    .returning()

  return { success: true, data: tab }
}

export async function updateSalesTab(
  tabId: number,
  data: { customerId?: number | null; notes?: string }
) {
  const tenantId = await getTenantId()

  const updateData: any = { updatedAt: new Date() }
  if (data.customerId !== undefined) updateData.customerId = data.customerId
  if (data.notes !== undefined) updateData.notes = data.notes

  const [tab] = await db
    .update(salesTabs)
    .set(updateData)
    .where(and(eq(salesTabs.id, tabId), eq(salesTabs.tenantId, tenantId)))
    .returning()

  if (!tab) return { success: false, message: 'Tab not found' }

  return { success: true, data: tab }
}

export async function deleteSalesTab(tabId: number) {
  const tenantId = await getTenantId()

  const [tab] = await db
    .select()
    .from(salesTabs)
    .where(and(eq(salesTabs.id, tabId), eq(salesTabs.tenantId, tenantId)))

  if (!tab) return { success: false, message: 'Tab not found' }
  if (tab.status === 'closed') return { success: false, message: 'Cannot delete a closed tab' }

  // Delete items first (cascade should handle it but explicit is safer)
  await db.delete(salesTabItems).where(eq(salesTabItems.tabId, tabId))
  await db.delete(salesTabs).where(eq(salesTabs.id, tabId))

  return { success: true }
}

export async function addTabItem(
  tabId: number,
  item: {
    productId: number
    productName: string
    productCode?: string
    quantity: number
    sellingPrice: number
    costPrice: number
    taxPercent?: number
    serialNumber?: string
    batchNumber?: string
  }
) {
  const tenantId = await getTenantId()

  // Verify tab exists and is open
  const [tab] = await db
    .select()
    .from(salesTabs)
    .where(
      and(eq(salesTabs.id, tabId), eq(salesTabs.tenantId, tenantId), eq(salesTabs.status, 'open'))
    )

  if (!tab) return { success: false, message: 'Tab not found or not open' }

  const subtotal = item.quantity * item.sellingPrice

  const [tabItem] = await db
    .insert(salesTabItems)
    .values({
      tabId,
      productId: item.productId,
      productName: item.productName,
      productCode: item.productCode || null,
      quantity: item.quantity,
      sellingPrice: String(item.sellingPrice),
      costPrice: String(item.costPrice),
      taxPercent: String(item.taxPercent ?? 0),
      subtotal: String(subtotal),
      serialNumber: item.serialNumber || null,
      batchNumber: item.batchNumber || null,
    })
    .returning()

  // Update tab totals
  await recalculateTabTotals(tabId)

  return { success: true, data: tabItem }
}

export async function updateTabItem(
  itemId: number,
  data: { quantity?: number; sellingPrice?: number }
) {
  const [existing] = await db.select().from(salesTabItems).where(eq(salesTabItems.id, itemId))

  if (!existing) return { success: false, message: 'Item not found' }

  const quantity = data.quantity ?? existing.quantity
  const sellingPrice = data.sellingPrice ?? Number(existing.sellingPrice)
  const subtotal = quantity * sellingPrice

  const [item] = await db
    .update(salesTabItems)
    .set({
      quantity,
      sellingPrice: String(sellingPrice),
      subtotal: String(subtotal),
    })
    .where(eq(salesTabItems.id, itemId))
    .returning()

  await recalculateTabTotals(existing.tabId)

  return { success: true, data: item }
}

export async function removeTabItem(itemId: number) {
  const [existing] = await db.select().from(salesTabItems).where(eq(salesTabItems.id, itemId))

  if (!existing) return { success: false, message: 'Item not found' }

  await db.delete(salesTabItems).where(eq(salesTabItems.id, itemId))
  await recalculateTabTotals(existing.tabId)

  return { success: true }
}

export async function holdTab(tabId: number) {
  const tenantId = await getTenantId()

  const [tab] = await db
    .update(salesTabs)
    .set({ status: 'on_hold', updatedAt: new Date() })
    .where(
      and(eq(salesTabs.id, tabId), eq(salesTabs.tenantId, tenantId), eq(salesTabs.status, 'open'))
    )
    .returning()

  if (!tab) return { success: false, message: 'Tab not found or not open' }
  return { success: true, data: tab }
}

export async function reopenTab(tabId: number) {
  const tenantId = await getTenantId()

  const [tab] = await db
    .update(salesTabs)
    .set({ status: 'open', updatedAt: new Date() })
    .where(
      and(
        eq(salesTabs.id, tabId),
        eq(salesTabs.tenantId, tenantId),
        eq(salesTabs.status, 'on_hold')
      )
    )
    .returning()

  if (!tab) return { success: false, message: 'Tab not found or not on hold' }
  return { success: true, data: tab }
}

export async function closeTab(tabId: number) {
  const tenantId = await getTenantId()
  const session = await auth()
  const userId = Number(session?.user?.id)

  const [tab] = await db
    .update(salesTabs)
    .set({
      status: 'closed',
      closedAt: new Date(),
      closedBy: userId,
      updatedAt: new Date(),
    })
    .where(and(eq(salesTabs.id, tabId), eq(salesTabs.tenantId, tenantId)))
    .returning()

  if (!tab) return { success: false, message: 'Tab not found' }
  return { success: true, data: tab }
}

/**
 * Get tab items for checkout — returns items needed to create a sale
 */
export async function getTabItemsForCheckout(tabId: number) {
  const tenantId = await getTenantId()

  const [tab] = await db
    .select()
    .from(salesTabs)
    .where(and(eq(salesTabs.id, tabId), eq(salesTabs.tenantId, tenantId)))

  if (!tab) return { success: false, message: 'Tab not found' }

  const items = await db.select().from(salesTabItems).where(eq(salesTabItems.tabId, tabId))

  return {
    success: true,
    data: {
      tab,
      items: items.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        productCode: item.productCode,
        quantity: item.quantity,
        sellingPrice: Number(item.sellingPrice),
        costPrice: Number(item.costPrice),
        taxPercent: Number(item.taxPercent),
        serialNumber: item.serialNumber,
        subtotal: Number(item.subtotal),
      })),
    },
  }
}

async function recalculateTabTotals(tabId: number) {
  const items = await db.select().from(salesTabItems).where(eq(salesTabItems.tabId, tabId))

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0)
  const subtotal = items.reduce((sum, i) => sum + Number(i.subtotal), 0)
  const tax = items.reduce((sum, i) => {
    const itemTax = Number(i.subtotal) * (Number(i.taxPercent) / 100)
    return sum + itemTax
  }, 0)
  const finalAmount = subtotal + tax

  await db
    .update(salesTabs)
    .set({
      itemCount,
      subtotal: String(subtotal),
      tax: String(tax),
      finalAmount: String(finalAmount),
      updatedAt: new Date(),
    })
    .where(eq(salesTabs.id, tabId))
}
