'use server'

import { db } from '@/lib/db'
import { customers } from '@/lib/db/schema'
import { eq, and, ilike, or, desc, sql, count } from 'drizzle-orm'
import { auth } from '@/lib/auth/config'

async function getTenantId() {
  const session = await auth()
  const tenantId = (session as any)?.tenantId
  if (!tenantId) throw new Error('No tenant context')
  return tenantId as number
}

export async function getCustomers(params?: {
  search?: string
  isActive?: boolean
}) {
  const tenantId = await getTenantId()
  const conditions = [eq(customers.tenantId, tenantId)]

  if (params?.search) {
    conditions.push(
      or(
        ilike(customers.firstName, `%${params.search}%`),
        ilike(customers.lastName, `%${params.search}%`),
        ilike(customers.phone, `%${params.search}%`),
        ilike(customers.email, `%${params.search}%`),
        ilike(customers.firearmLicenseNumber, `%${params.search}%`)
      )!
    )
  }
  if (params?.isActive !== undefined) {
    conditions.push(eq(customers.isActive, params.isActive))
  }

  const data = await db
    .select()
    .from(customers)
    .where(and(...conditions))
    .orderBy(customers.firstName)

  return { success: true, data }
}

export async function getCustomerSummary() {
  const tenantId = await getTenantId()

  const result = await db
    .select({
      totalCustomers: count(),
      activeCount: sql<number>`COUNT(*) FILTER (WHERE ${customers.isActive} = true)`,
      withLicense: sql<number>`COUNT(*) FILTER (WHERE ${customers.firearmLicenseNumber} IS NOT NULL AND ${customers.firearmLicenseNumber} != '')`,
      expiredLicense: sql<number>`COUNT(*) FILTER (WHERE ${customers.licenseExpiryDate} IS NOT NULL AND ${customers.licenseExpiryDate}::date < CURRENT_DATE)`,
    })
    .from(customers)
    .where(eq(customers.tenantId, tenantId))

  return { success: true, data: result[0] }
}

export async function getCustomerById(id: number) {
  const tenantId = await getTenantId()

  const [customer] = await db
    .select()
    .from(customers)
    .where(and(eq(customers.id, id), eq(customers.tenantId, tenantId)))

  if (!customer) return { success: false, message: 'Customer not found' }
  return { success: true, data: customer }
}

export async function createCustomer(input: {
  firstName: string
  lastName: string
  email?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  governmentIdType?: string
  governmentIdNumber?: string
  firearmLicenseNumber?: string
  licenseExpiryDate?: string
  dateOfBirth?: string
  notes?: string
}) {
  const tenantId = await getTenantId()

  const [customer] = await db
    .insert(customers)
    .values({
      tenantId,
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email || null,
      phone: input.phone || null,
      address: input.address || null,
      city: input.city || null,
      state: input.state || null,
      zipCode: input.zipCode || null,
      governmentIdType: input.governmentIdType as any || null,
      governmentIdNumber: input.governmentIdNumber || null,
      firearmLicenseNumber: input.firearmLicenseNumber || null,
      licenseExpiryDate: input.licenseExpiryDate || null,
      dateOfBirth: input.dateOfBirth || null,
      notes: input.notes || null,
    })
    .returning()

  return { success: true, data: customer }
}

export async function updateCustomer(
  id: number,
  input: {
    firstName?: string
    lastName?: string
    email?: string
    phone?: string
    address?: string
    city?: string
    state?: string
    zipCode?: string
    governmentIdType?: string
    governmentIdNumber?: string
    firearmLicenseNumber?: string
    licenseExpiryDate?: string
    dateOfBirth?: string
    notes?: string
    isActive?: boolean
  }
) {
  const tenantId = await getTenantId()

  const [customer] = await db
    .update(customers)
    .set({
      ...input,
      governmentIdType: input.governmentIdType as any,
      updatedAt: new Date(),
    })
    .where(and(eq(customers.id, id), eq(customers.tenantId, tenantId)))
    .returning()

  if (!customer) return { success: false, message: 'Customer not found' }
  return { success: true, data: customer }
}

export async function deleteCustomer(id: number) {
  const tenantId = await getTenantId()

  await db
    .update(customers)
    .set({ isActive: false, updatedAt: new Date() })
    .where(and(eq(customers.id, id), eq(customers.tenantId, tenantId)))

  return { success: true }
}

export async function searchCustomers(query: string) {
  const tenantId = await getTenantId()

  const data = await db
    .select()
    .from(customers)
    .where(
      and(
        eq(customers.tenantId, tenantId),
        eq(customers.isActive, true),
        or(
          ilike(customers.firstName, `%${query}%`),
          ilike(customers.lastName, `%${query}%`),
          ilike(customers.phone, `%${query}%`)
        )
      )
    )
    .limit(20)

  return { success: true, data }
}
