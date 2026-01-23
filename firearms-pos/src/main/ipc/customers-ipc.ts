import { ipcMain } from 'electron'
import { eq, like, and, or, desc, asc, sql } from 'drizzle-orm'
import { getDatabase } from '../db'
import { customers, type NewCustomer } from '../db/schema'
import { createAuditLog, sanitizeForAudit } from '../utils/audit'
import { getCurrentSession } from './auth-ipc'
import { isLicenseExpired, isLicenseExpiringSoon, type PaginationParams, type PaginatedResult } from '../utils/helpers'
import {
  sanitizeName,
  sanitizeEmail,
  sanitizePhone,
  sanitizeForStorage,
  sanitizeText,
  isValidEmail,
  isValidPhone,
} from '../utils/validation'
import { encryptCustomerData, decryptCustomerData } from '../utils/encryption'

/**
 * Sanitize and validate customer input data
 * Section 5.2 - Input sanitization for text fields
 */
function sanitizeCustomerInput(data: Partial<NewCustomer>): Partial<NewCustomer> {
  const sanitized = { ...data }

  // Sanitize name fields
  if (sanitized.firstName) sanitized.firstName = sanitizeName(sanitized.firstName)
  if (sanitized.lastName) sanitized.lastName = sanitizeName(sanitized.lastName)

  // Sanitize contact info
  if (sanitized.email) sanitized.email = sanitizeEmail(sanitized.email)
  if (sanitized.phone) sanitized.phone = sanitizePhone(sanitized.phone)

  // Sanitize address fields
  if (sanitized.address) sanitized.address = sanitizeForStorage(sanitized.address)
  if (sanitized.city) sanitized.city = sanitizeName(sanitized.city)
  if (sanitized.state) sanitized.state = sanitizeName(sanitized.state)
  if (sanitized.zipCode) sanitized.zipCode = sanitizeText(sanitized.zipCode)

  // Sanitize ID fields (alphanumeric with some special chars)
  if (sanitized.governmentIdNumber) sanitized.governmentIdNumber = sanitizeForStorage(sanitized.governmentIdNumber)
  if (sanitized.firearmLicenseNumber) sanitized.firearmLicenseNumber = sanitizeForStorage(sanitized.firearmLicenseNumber)

  // Sanitize notes
  if (sanitized.notes) sanitized.notes = sanitizeForStorage(sanitized.notes)

  return sanitized
}

/**
 * Validate customer data
 */
function validateCustomerInput(data: Partial<NewCustomer>): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  // Validate email format if provided
  if (data.email && !isValidEmail(data.email)) {
    errors.push('Invalid email format')
  }

  // Validate phone format if provided
  if (data.phone && !isValidPhone(data.phone)) {
    errors.push('Invalid phone number format')
  }

  return { valid: errors.length === 0, errors }
}

export function registerCustomerHandlers(): void {
  const db = getDatabase()

  ipcMain.handle(
    'customers:get-all',
    async (_, params: PaginationParams & { search?: string; isActive?: boolean }) => {
      try {
        const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc', search, isActive } = params

        const conditions = []

        if (search) {
          conditions.push(
            or(
              like(customers.firstName, `%${search}%`),
              like(customers.lastName, `%${search}%`),
              like(customers.email, `%${search}%`),
              like(customers.phone, `%${search}%`),
              like(customers.firearmLicenseNumber, `%${search}%`)
            )
          )
        }

        if (isActive !== undefined) {
          conditions.push(eq(customers.isActive, isActive))
        }

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined

        const countResult = await db
          .select({ count: sql<number>`count(*)` })
          .from(customers)
          .where(whereClause)

        const total = countResult[0].count

        const orderColumn = customers[sortBy as keyof typeof customers] ?? customers.createdAt
        const data = await db.query.customers.findMany({
          where: whereClause,
          limit,
          offset: (page - 1) * limit,
          orderBy: sortOrder === 'desc' ? desc(orderColumn as any) : asc(orderColumn as any),
        })

        const result: PaginatedResult<typeof data[0]> = {
          data,
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        }

        return { success: true, ...result }
      } catch (error) {
        console.error('Get customers error:', error)
        return { success: false, message: 'Failed to fetch customers' }
      }
    }
  )

  ipcMain.handle('customers:get-by-id', async (_, id: number) => {
    try {
      const customer = await db.query.customers.findFirst({
        where: eq(customers.id, id),
      })

      if (!customer) {
        return { success: false, message: 'Customer not found' }
      }

      // Decrypt sensitive fields before returning
      const decryptedCustomer = decryptCustomerData(customer)

      return { success: true, data: decryptedCustomer }
    } catch (error) {
      console.error('Get customer error:', error)
      return { success: false, message: 'Failed to fetch customer' }
    }
  })

  ipcMain.handle('customers:create', async (_, data: NewCustomer) => {
    try {
      const session = getCurrentSession()

      // Section 5.2: Sanitize input data
      const sanitizedData = sanitizeCustomerInput(data) as NewCustomer

      // Validate input
      const validation = validateCustomerInput(sanitizedData)
      if (!validation.valid) {
        return { success: false, message: validation.errors.join(', ') }
      }

      // Section 5.3: Encrypt sensitive fields before storage
      const encryptedData = encryptCustomerData(sanitizedData)

      const result = await db.insert(customers).values(encryptedData).returning()
      const newCustomer = result[0]

      // Decrypt for audit log (show original values, not encrypted)
      const decryptedForAudit = decryptCustomerData(newCustomer)

      await createAuditLog({
        userId: session?.userId,
        branchId: session?.branchId,
        action: 'create',
        entityType: 'customer',
        entityId: newCustomer.id,
        newValues: sanitizeForAudit(decryptedForAudit as Record<string, unknown>),
        description: `Created customer: ${sanitizedData.firstName} ${sanitizedData.lastName}`,
      })

      // Return decrypted data to the client
      return { success: true, data: decryptedForAudit }
    } catch (error) {
      console.error('Create customer error:', error)
      return { success: false, message: 'Failed to create customer' }
    }
  })

  ipcMain.handle('customers:update', async (_, id: number, data: Partial<NewCustomer>) => {
    try {
      const session = getCurrentSession()

      const existing = await db.query.customers.findFirst({
        where: eq(customers.id, id),
      })

      if (!existing) {
        return { success: false, message: 'Customer not found' }
      }

      // Section 5.2: Sanitize input data
      const sanitizedData = sanitizeCustomerInput(data)

      // Validate input
      const validation = validateCustomerInput(sanitizedData)
      if (!validation.valid) {
        return { success: false, message: validation.errors.join(', ') }
      }

      // Section 5.3: Encrypt sensitive fields before storage
      const encryptedData = encryptCustomerData(sanitizedData)

      const result = await db
        .update(customers)
        .set({ ...encryptedData, updatedAt: new Date().toISOString() })
        .where(eq(customers.id, id))
        .returning()

      // Decrypt for audit log
      const decryptedOld = decryptCustomerData(existing)
      const decryptedNew = decryptCustomerData(result[0])

      await createAuditLog({
        userId: session?.userId,
        branchId: session?.branchId,
        action: 'update',
        entityType: 'customer',
        entityId: id,
        oldValues: sanitizeForAudit(decryptedOld as unknown as Record<string, unknown>),
        newValues: sanitizeForAudit(decryptedNew as Record<string, unknown>),
        description: `Updated customer: ${existing.firstName} ${existing.lastName}`,
      })

      // Return decrypted data to client
      return { success: true, data: decryptedNew }
    } catch (error) {
      console.error('Update customer error:', error)
      return { success: false, message: 'Failed to update customer' }
    }
  })

  ipcMain.handle('customers:delete', async (_, id: number) => {
    try {
      const session = getCurrentSession()

      const existing = await db.query.customers.findFirst({
        where: eq(customers.id, id),
      })

      if (!existing) {
        return { success: false, message: 'Customer not found' }
      }

      await db
        .update(customers)
        .set({ isActive: false, updatedAt: new Date().toISOString() })
        .where(eq(customers.id, id))

      await createAuditLog({
        userId: session?.userId,
        branchId: session?.branchId,
        action: 'delete',
        entityType: 'customer',
        entityId: id,
        oldValues: sanitizeForAudit(existing as unknown as Record<string, unknown>),
        description: `Deactivated customer: ${existing.firstName} ${existing.lastName}`,
      })

      return { success: true, message: 'Customer deactivated successfully' }
    } catch (error) {
      console.error('Delete customer error:', error)
      return { success: false, message: 'Failed to delete customer' }
    }
  })

  ipcMain.handle('customers:check-license', async (_, customerId: number) => {
    try {
      const customer = await db.query.customers.findFirst({
        where: eq(customers.id, customerId),
      })

      if (!customer) {
        return { success: false, message: 'Customer not found' }
      }

      const hasLicense = !!customer.firearmLicenseNumber
      const expired = isLicenseExpired(customer.licenseExpiryDate)
      const expiringSoon = isLicenseExpiringSoon(customer.licenseExpiryDate, 30)

      return {
        success: true,
        data: {
          hasLicense,
          licenseNumber: customer.firearmLicenseNumber,
          expiryDate: customer.licenseExpiryDate,
          isExpired: expired,
          isExpiringSoon: expiringSoon,
          isValid: hasLicense && !expired,
        },
      }
    } catch (error) {
      console.error('Check license error:', error)
      return { success: false, message: 'Failed to check license' }
    }
  })

  ipcMain.handle('customers:search', async (_, query: string) => {
    try {
      const results = await db.query.customers.findMany({
        where: and(
          eq(customers.isActive, true),
          or(
            like(customers.firstName, `%${query}%`),
            like(customers.lastName, `%${query}%`),
            like(customers.phone, `%${query}%`),
            like(customers.email, `%${query}%`)
          )
        ),
        limit: 20,
      })

      return { success: true, data: results }
    } catch (error) {
      console.error('Search customers error:', error)
      return { success: false, message: 'Failed to search customers' }
    }
  })

  ipcMain.handle('customers:get-expiring-licenses', async (_, daysThreshold = 30) => {
    try {
      const thresholdDate = new Date()
      thresholdDate.setDate(thresholdDate.getDate() + daysThreshold)

      const data = await db.query.customers.findMany({
        where: and(
          eq(customers.isActive, true),
          sql`${customers.licenseExpiryDate} IS NOT NULL AND ${customers.licenseExpiryDate} <= ${thresholdDate.toISOString()}`
        ),
      })

      return { success: true, data }
    } catch (error) {
      console.error('Get expiring licenses error:', error)
      return { success: false, message: 'Failed to fetch expiring licenses' }
    }
  })
}
