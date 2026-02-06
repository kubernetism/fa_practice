'use server'

import { db } from '@/lib/db'
import { suppliers } from '@/lib/db/schema'
import { eq, and, ilike, or, desc, count, sql } from 'drizzle-orm'
import { auth } from '@/lib/auth/config'

async function getTenantId() {
  const session = await auth()
  const tenantId = (session as any)?.tenantId
  if (!tenantId) throw new Error('No tenant context')
  return tenantId as number
}

export async function getSuppliers(params?: {
  search?: string
  isActive?: boolean
}) {
  const tenantId = await getTenantId()
  const conditions = [eq(suppliers.tenantId, tenantId)]

  if (params?.search) {
    conditions.push(
      or(
        ilike(suppliers.name, `%${params.search}%`),
        ilike(suppliers.contactPerson, `%${params.search}%`),
        ilike(suppliers.phone, `%${params.search}%`),
        ilike(suppliers.email, `%${params.search}%`)
      )!
    )
  }
  if (params?.isActive !== undefined) {
    conditions.push(eq(suppliers.isActive, params.isActive))
  }

  const data = await db
    .select()
    .from(suppliers)
    .where(and(...conditions))
    .orderBy(suppliers.name)

  return { success: true, data }
}

export async function getSupplierSummary() {
  const tenantId = await getTenantId()

  const result = await db
    .select({
      totalSuppliers: count(),
      activeCount: sql<number>`COUNT(*) FILTER (WHERE ${suppliers.isActive} = true)`,
      inactiveCount: sql<number>`COUNT(*) FILTER (WHERE ${suppliers.isActive} = false)`,
    })
    .from(suppliers)
    .where(eq(suppliers.tenantId, tenantId))

  return { success: true, data: result[0] }
}

export async function getSupplierById(id: number) {
  const tenantId = await getTenantId()

  const [supplier] = await db
    .select()
    .from(suppliers)
    .where(and(eq(suppliers.id, id), eq(suppliers.tenantId, tenantId)))

  if (!supplier) return { success: false, message: 'Supplier not found' }
  return { success: true, data: supplier }
}

export async function createSupplier(input: {
  name: string
  contactPerson?: string
  email?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  taxId?: string
  paymentTerms?: string
  notes?: string
}) {
  const tenantId = await getTenantId()

  const [supplier] = await db
    .insert(suppliers)
    .values({
      tenantId,
      name: input.name,
      contactPerson: input.contactPerson || null,
      email: input.email || null,
      phone: input.phone || null,
      address: input.address || null,
      city: input.city || null,
      state: input.state || null,
      zipCode: input.zipCode || null,
      taxId: input.taxId || null,
      paymentTerms: input.paymentTerms || null,
      notes: input.notes || null,
    })
    .returning()

  return { success: true, data: supplier }
}

export async function updateSupplier(
  id: number,
  input: {
    name?: string
    contactPerson?: string
    email?: string
    phone?: string
    address?: string
    city?: string
    state?: string
    zipCode?: string
    taxId?: string
    paymentTerms?: string
    notes?: string
    isActive?: boolean
  }
) {
  const tenantId = await getTenantId()

  const [supplier] = await db
    .update(suppliers)
    .set({
      ...input,
      updatedAt: new Date(),
    })
    .where(and(eq(suppliers.id, id), eq(suppliers.tenantId, tenantId)))
    .returning()

  if (!supplier) return { success: false, message: 'Supplier not found' }
  return { success: true, data: supplier }
}

export async function deleteSupplier(id: number) {
  const tenantId = await getTenantId()

  await db
    .update(suppliers)
    .set({ isActive: false, updatedAt: new Date() })
    .where(and(eq(suppliers.id, id), eq(suppliers.tenantId, tenantId)))

  return { success: true }
}

export async function searchSuppliers(query: string) {
  const tenantId = await getTenantId()

  const data = await db
    .select()
    .from(suppliers)
    .where(
      and(
        eq(suppliers.tenantId, tenantId),
        eq(suppliers.isActive, true),
        or(
          ilike(suppliers.name, `%${query}%`),
          ilike(suppliers.contactPerson, `%${query}%`),
          ilike(suppliers.phone, `%${query}%`)
        )
      )
    )
    .limit(20)

  return { success: true, data }
}
