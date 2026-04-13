import { ipcMain } from 'electron'
import { eq, like, and, or, desc, asc, sql } from 'drizzle-orm'
import { getDatabase } from '../db'
import { suppliers, type NewSupplier } from '../db/schema'
import { createAuditLog, sanitizeForAudit } from '../utils/audit'
import { getCurrentSession } from './auth-ipc'
import type { PaginationParams, PaginatedResult } from '../utils/helpers'
import {
  sanitizeName,
  sanitizeEmail,
  sanitizePhone,
  sanitizeForStorage,
  isValidEmail,
  isValidPhone,
} from '../utils/validation'
import { encryptSupplierData, decryptSupplierData } from '../utils/encryption'

/**
 * Sanitize and validate supplier input data
 * Section 5.2 - Input sanitization for text fields
 */
function sanitizeSupplierInput(data: Partial<NewSupplier>): Partial<NewSupplier> {
  const sanitized = { ...data }

  // Sanitize name fields
  if (sanitized.name) sanitized.name = sanitizeForStorage(sanitized.name)
  if (sanitized.contactPerson) sanitized.contactPerson = sanitizeName(sanitized.contactPerson)

  // Sanitize contact info
  if (sanitized.email) sanitized.email = sanitizeEmail(sanitized.email)
  if (sanitized.phone) sanitized.phone = sanitizePhone(sanitized.phone)

  // Sanitize address fields
  if (sanitized.address) sanitized.address = sanitizeForStorage(sanitized.address)
  if (sanitized.city) sanitized.city = sanitizeName(sanitized.city)
  if (sanitized.state) sanitized.state = sanitizeName(sanitized.state)
  if (sanitized.zipCode) sanitized.zipCode = sanitizeForStorage(sanitized.zipCode)

  // Sanitize business fields
  if (sanitized.taxId) sanitized.taxId = sanitizeForStorage(sanitized.taxId)
  if (sanitized.paymentTerms) sanitized.paymentTerms = sanitizeForStorage(sanitized.paymentTerms)
  if (sanitized.notes) sanitized.notes = sanitizeForStorage(sanitized.notes)

  return sanitized
}

/**
 * Validate supplier data
 */
function validateSupplierInput(data: Partial<NewSupplier>): { valid: boolean; errors: string[] } {
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

export function registerSupplierHandlers(): void {
  const db = getDatabase()

  ipcMain.handle(
    'suppliers:get-all',
    async (_, params: PaginationParams & { search?: string; isActive?: boolean }) => {
      try {
        const { page = 1, limit = 20, sortBy = 'name', sortOrder = 'asc', search, isActive } = params || {}

        const conditions = []

        if (search) {
          conditions.push(
            or(
              like(suppliers.name, `%${search}%`),
              like(suppliers.contactPerson, `%${search}%`),
              like(suppliers.email, `%${search}%`)
            )
          )
        }

        if (isActive !== undefined) {
          conditions.push(eq(suppliers.isActive, isActive))
        }

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined

        const countResult = await db
          .select({ count: sql<number>`count(*)` })
          .from(suppliers)
          .where(whereClause)

        const total = countResult[0].count

        const orderColumn = suppliers[sortBy as keyof typeof suppliers] ?? suppliers.name
        const data = await db.query.suppliers.findMany({
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
        console.error('Get suppliers error:', error)
        return { success: false, message: 'Failed to fetch suppliers' }
      }
    }
  )

  ipcMain.handle('suppliers:get-by-id', async (_, id: number) => {
    try {
      const supplier = await db.query.suppliers.findFirst({
        where: eq(suppliers.id, id),
      })

      if (!supplier) {
        return { success: false, message: 'Supplier not found' }
      }

      // Decrypt sensitive fields before returning
      const decryptedSupplier = decryptSupplierData(supplier)

      return { success: true, data: decryptedSupplier }
    } catch (error) {
      console.error('Get supplier error:', error)
      return { success: false, message: 'Failed to fetch supplier' }
    }
  })

  ipcMain.handle('suppliers:create', async (_, data: NewSupplier) => {
    try {
      const session = getCurrentSession()

      // Section 5.2: Sanitize input data
      const sanitizedData = sanitizeSupplierInput(data) as NewSupplier

      // Validate input
      const validation = validateSupplierInput(sanitizedData)
      if (!validation.valid) {
        return { success: false, message: validation.errors.join(', ') }
      }

      // Section 5.3: Encrypt sensitive fields before storage
      const encryptedData = encryptSupplierData(sanitizedData)

      const result = await db.insert(suppliers).values(encryptedData).returning()
      const newSupplier = result[0]

      // Decrypt for audit log
      const decryptedForAudit = decryptSupplierData(newSupplier)

      await createAuditLog({
        userId: session?.userId,
        branchId: session?.branchId,
        action: 'create',
        entityType: 'supplier',
        entityId: newSupplier.id,
        newValues: sanitizeForAudit(decryptedForAudit as Record<string, unknown>),
        description: `Created supplier: ${sanitizedData.name}`,
      })

      // Return decrypted data to client
      return { success: true, data: decryptedForAudit }
    } catch (error) {
      console.error('Create supplier error:', error)
      return { success: false, message: 'Failed to create supplier' }
    }
  })

  ipcMain.handle('suppliers:update', async (_, id: number, data: Partial<NewSupplier>) => {
    try {
      const session = getCurrentSession()

      const existing = await db.query.suppliers.findFirst({
        where: eq(suppliers.id, id),
      })

      if (!existing) {
        return { success: false, message: 'Supplier not found' }
      }

      // Section 5.2: Sanitize input data
      const sanitizedData = sanitizeSupplierInput(data)

      // Validate input
      const validation = validateSupplierInput(sanitizedData)
      if (!validation.valid) {
        return { success: false, message: validation.errors.join(', ') }
      }

      // Section 5.3: Encrypt sensitive fields before storage
      const encryptedData = encryptSupplierData(sanitizedData)

      const result = await db
        .update(suppliers)
        .set({ ...encryptedData, updatedAt: new Date().toISOString() })
        .where(eq(suppliers.id, id))
        .returning()

      // Decrypt for audit log
      const decryptedOld = decryptSupplierData(existing)
      const decryptedNew = decryptSupplierData(result[0])

      await createAuditLog({
        userId: session?.userId,
        branchId: session?.branchId,
        action: 'update',
        entityType: 'supplier',
        entityId: id,
        oldValues: sanitizeForAudit(decryptedOld as unknown as Record<string, unknown>),
        newValues: sanitizeForAudit(decryptedNew as Record<string, unknown>),
        description: `Updated supplier: ${existing.name}`,
      })

      // Return decrypted data to client
      return { success: true, data: decryptedNew }
    } catch (error) {
      console.error('Update supplier error:', error)
      return { success: false, message: 'Failed to update supplier' }
    }
  })

  ipcMain.handle('suppliers:delete', async (_, id: number) => {
    try {
      const session = getCurrentSession()

      const existing = await db.query.suppliers.findFirst({
        where: eq(suppliers.id, id),
      })

      if (!existing) {
        return { success: false, message: 'Supplier not found' }
      }

      await db
        .update(suppliers)
        .set({ isActive: false, updatedAt: new Date().toISOString() })
        .where(eq(suppliers.id, id))

      await createAuditLog({
        userId: session?.userId,
        branchId: session?.branchId,
        action: 'delete',
        entityType: 'supplier',
        entityId: id,
        oldValues: sanitizeForAudit(existing as unknown as Record<string, unknown>),
        description: `Deactivated supplier: ${existing.name}`,
      })

      return { success: true, message: 'Supplier deactivated successfully' }
    } catch (error) {
      console.error('Delete supplier error:', error)
      return { success: false, message: 'Failed to delete supplier' }
    }
  })
}
