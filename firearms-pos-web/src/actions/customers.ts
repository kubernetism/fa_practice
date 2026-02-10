'use server'

import { db } from '@/lib/db'
import { customers } from '@/lib/db/schema'
import { eq, and, ilike, or, desc, sql, count } from 'drizzle-orm'
import { auth } from '@/lib/auth/config'
import { sanitizeInput } from '@/lib/validation/sanitize'
import { encryptCustomerData, decryptCustomerData } from '@/lib/security/encryption'
import { logCreate, logUpdate, logDelete } from '@/lib/audit/logger'

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
  return { success: true, data: decryptCustomerData(customer) }
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

  const clean = encryptCustomerData(sanitizeInput(input))

  const [customer] = await db
    .insert(customers)
    .values({
      tenantId,
      firstName: clean.firstName,
      lastName: clean.lastName,
      email: clean.email || null,
      phone: clean.phone || null,
      address: clean.address || null,
      city: clean.city || null,
      state: clean.state || null,
      zipCode: clean.zipCode || null,
      governmentIdType: clean.governmentIdType as any || null,
      governmentIdNumber: clean.governmentIdNumber || null,
      firearmLicenseNumber: clean.firearmLicenseNumber || null,
      licenseExpiryDate: clean.licenseExpiryDate || null,
      dateOfBirth: clean.dateOfBirth || null,
      notes: clean.notes || null,
    })
    .returning()

  logCreate('customer', customer.id, { firstName: clean.firstName, lastName: clean.lastName })

  return { success: true, data: decryptCustomerData(customer) }
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

  const clean = encryptCustomerData(sanitizeInput(input))

  const [customer] = await db
    .update(customers)
    .set({
      ...clean,
      governmentIdType: clean.governmentIdType as any,
      updatedAt: new Date(),
    })
    .where(and(eq(customers.id, id), eq(customers.tenantId, tenantId)))
    .returning()

  if (!customer) return { success: false, message: 'Customer not found' }
  logUpdate('customer', id, undefined, clean)
  return { success: true, data: decryptCustomerData(customer) }
}

export async function deleteCustomer(id: number) {
  const tenantId = await getTenantId()

  await db
    .update(customers)
    .set({ isActive: false, updatedAt: new Date() })
    .where(and(eq(customers.id, id), eq(customers.tenantId, tenantId)))

  logDelete('customer', id)
  return { success: true }
}

export async function checkCustomerLicense(id: number) {
  const tenantId = await getTenantId()

  const [customer] = await db
    .select()
    .from(customers)
    .where(and(eq(customers.id, id), eq(customers.tenantId, tenantId)))

  if (!customer) return { success: false, message: 'Customer not found' }

  const decrypted = decryptCustomerData(customer)
  const hasLicense = !!decrypted.firearmLicenseNumber
  const isExpired = customer.licenseExpiryDate
    ? new Date(customer.licenseExpiryDate) < new Date()
    : false
  const daysUntilExpiry = customer.licenseExpiryDate
    ? Math.ceil((new Date(customer.licenseExpiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null

  return {
    success: true,
    data: {
      customerId: decrypted.id,
      customerName: `${decrypted.firstName} ${decrypted.lastName}`,
      hasLicense,
      licenseNumber: decrypted.firearmLicenseNumber,
      expiryDate: decrypted.licenseExpiryDate,
      isExpired,
      daysUntilExpiry,
      isValid: hasLicense && !isExpired,
    },
  }
}

export async function getExpiringLicenses(daysAhead: number = 30) {
  const tenantId = await getTenantId()

  const data = await db
    .select()
    .from(customers)
    .where(
      and(
        eq(customers.tenantId, tenantId),
        eq(customers.isActive, true),
        sql`${customers.firearmLicenseNumber} IS NOT NULL AND ${customers.firearmLicenseNumber} != ''`,
        sql`${customers.licenseExpiryDate}::date <= CURRENT_DATE + INTERVAL '${sql.raw(String(daysAhead))} days'`,
        sql`${customers.licenseExpiryDate}::date >= CURRENT_DATE`
      )
    )
    .orderBy(sql`${customers.licenseExpiryDate}::date ASC`)

  return { success: true, data }
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
