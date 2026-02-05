'use server'

import { db } from '@/lib/db'
import { vouchers } from '@/lib/db/schema'
import { eq, and, desc, sql, count } from 'drizzle-orm'
import { auth } from '@/lib/auth/config'

async function getTenantId() {
  const session = await auth()
  const tenantId = (session as any)?.tenantId
  if (!tenantId) throw new Error('No tenant context')
  return tenantId as number
}

export async function getVouchers(filters?: { status?: string }) {
  const tenantId = await getTenantId()

  const conditions = [eq(vouchers.tenantId, tenantId)]
  if (filters?.status === 'active') {
    conditions.push(eq(vouchers.isActive, true))
    conditions.push(eq(vouchers.isUsed, false))
  } else if (filters?.status === 'used') {
    conditions.push(eq(vouchers.isUsed, true))
  } else if (filters?.status === 'inactive') {
    conditions.push(eq(vouchers.isActive, false))
  }

  const data = await db
    .select()
    .from(vouchers)
    .where(and(...conditions))
    .orderBy(desc(vouchers.createdAt))

  return { success: true, data }
}

export async function getVoucherSummary() {
  const tenantId = await getTenantId()

  const result = await db
    .select({
      totalVouchers: count(),
      activeCount: sql<number>`COUNT(*) FILTER (WHERE ${vouchers.isActive} = true AND ${vouchers.isUsed} = false)`,
      usedCount: sql<number>`COUNT(*) FILTER (WHERE ${vouchers.isUsed} = true)`,
      totalDiscount: sql<string>`COALESCE(SUM(${vouchers.discountAmount}), 0)`,
      usedDiscount: sql<string>`COALESCE(SUM(${vouchers.discountAmount}) FILTER (WHERE ${vouchers.isUsed} = true), 0)`,
    })
    .from(vouchers)
    .where(eq(vouchers.tenantId, tenantId))

  return { success: true, data: result[0] }
}

export async function createVoucher(data: {
  code: string
  description?: string
  discountAmount: string
  expiresAt?: string
}) {
  const tenantId = await getTenantId()
  const session = await auth()
  const userId = Number(session?.user?.id)

  // Check duplicate code
  const existing = await db
    .select()
    .from(vouchers)
    .where(and(eq(vouchers.tenantId, tenantId), eq(vouchers.code, data.code.toUpperCase())))

  if (existing.length > 0) {
    return { success: false, message: 'Voucher code already exists' }
  }

  const [voucher] = await db
    .insert(vouchers)
    .values({
      tenantId,
      code: data.code.toUpperCase(),
      description: data.description || null,
      discountAmount: data.discountAmount,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
      createdBy: userId,
    })
    .returning()

  return { success: true, data: voucher }
}

export async function toggleVoucher(id: number) {
  const tenantId = await getTenantId()

  const [voucher] = await db
    .select()
    .from(vouchers)
    .where(and(eq(vouchers.id, id), eq(vouchers.tenantId, tenantId)))

  if (!voucher) return { success: false, message: 'Voucher not found' }

  await db
    .update(vouchers)
    .set({ isActive: !voucher.isActive, updatedAt: new Date() })
    .where(eq(vouchers.id, id))

  return { success: true }
}

export async function deleteVoucher(id: number) {
  const tenantId = await getTenantId()

  await db
    .delete(vouchers)
    .where(and(eq(vouchers.id, id), eq(vouchers.tenantId, tenantId)))

  return { success: true }
}
