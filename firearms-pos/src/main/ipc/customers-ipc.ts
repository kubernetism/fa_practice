import { ipcMain } from 'electron'
import { eq, like, and, or, desc, asc, sql } from 'drizzle-orm'
import { getDatabase } from '../db'
import { customers, type NewCustomer } from '../db/schema'
import { createAuditLog, sanitizeForAudit } from '../utils/audit'
import { getCurrentSession } from './auth-ipc'
import { isLicenseExpired, isLicenseExpiringSoon, type PaginationParams, type PaginatedResult } from '../utils/helpers'

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

      return { success: true, data: customer }
    } catch (error) {
      console.error('Get customer error:', error)
      return { success: false, message: 'Failed to fetch customer' }
    }
  })

  ipcMain.handle('customers:create', async (_, data: NewCustomer) => {
    try {
      const session = getCurrentSession()

      const result = await db.insert(customers).values(data).returning()
      const newCustomer = result[0]

      await createAuditLog({
        userId: session?.userId,
        branchId: session?.branchId,
        action: 'create',
        entityType: 'customer',
        entityId: newCustomer.id,
        newValues: sanitizeForAudit(data as Record<string, unknown>),
        description: `Created customer: ${data.firstName} ${data.lastName}`,
      })

      return { success: true, data: newCustomer }
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

      const result = await db
        .update(customers)
        .set({ ...data, updatedAt: new Date().toISOString() })
        .where(eq(customers.id, id))
        .returning()

      await createAuditLog({
        userId: session?.userId,
        branchId: session?.branchId,
        action: 'update',
        entityType: 'customer',
        entityId: id,
        oldValues: sanitizeForAudit(existing as unknown as Record<string, unknown>),
        newValues: sanitizeForAudit(data as Record<string, unknown>),
        description: `Updated customer: ${existing.firstName} ${existing.lastName}`,
      })

      return { success: true, data: result[0] }
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
