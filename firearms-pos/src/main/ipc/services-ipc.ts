import { ipcMain } from 'electron'
import { eq, like, and, or, desc, asc, sql } from 'drizzle-orm'
import { getDatabase } from '../db'
import {
  services,
  type NewService,
} from '../db/schema'
import { createAuditLog, sanitizeForAudit } from '../utils/audit'
import { getCurrentSession } from './auth-ipc'
import type { PaginationParams, PaginatedResult } from '../utils/helpers'
import {
  sanitizeForStorage,
  sanitizeAlphanumeric,
  validatePrice,
  validateTaxRate,
} from '../utils/validation'

/**
 * Sanitize and validate service input data
 */
function sanitizeServiceInput(data: Partial<NewService>): Partial<NewService> {
  const sanitized = { ...data }

  if (sanitized.name) sanitized.name = sanitizeForStorage(sanitized.name)
  if (sanitized.code) sanitized.code = sanitizeAlphanumeric(sanitized.code)
  if (sanitized.description) sanitized.description = sanitizeForStorage(sanitized.description)

  return sanitized
}

/**
 * Validate service numeric fields
 */
function validateServiceInput(data: Partial<NewService>): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (data.price !== undefined) {
    const validatedPrice = validatePrice(data.price)
    if (validatedPrice === null) {
      errors.push('Price must be a non-negative number')
    }
  }

  if (data.taxRate !== undefined) {
    const validatedTax = validateTaxRate(data.taxRate)
    if (validatedTax === null) {
      errors.push('Tax rate must be between 0 and 100')
    }
  }

  if (data.estimatedDuration !== undefined && data.estimatedDuration < 0) {
    errors.push('Estimated duration must be a non-negative number')
  }

  return { valid: errors.length === 0, errors }
}

export function registerServicesHandlers(): void {
  const db = getDatabase()

  // ========================
  // SERVICES
  // ========================

  ipcMain.handle(
    'services:get-all',
    async (
      _,
      params: PaginationParams & { search?: string; categoryId?: number; isActive?: boolean }
    ) => {
      try {
        const {
          page = 1,
          limit = 20,
          sortBy = 'createdAt',
          sortOrder = 'desc',
          search,
          categoryId,
          isActive,
        } = params

        const conditions = []

        if (search) {
          conditions.push(
            or(
              like(services.name, `%${search}%`),
              like(services.code, `%${search}%`),
              like(services.description, `%${search}%`)
            )
          )
        }

        if (categoryId) {
          conditions.push(eq(services.categoryId, categoryId))
        }

        if (isActive !== undefined) {
          conditions.push(eq(services.isActive, isActive))
        }

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined

        // Get total count
        const countResult = await db
          .select({ count: sql<number>`count(*)` })
          .from(services)
          .where(whereClause)

        const total = countResult[0].count

        // Get paginated data
        const orderColumn = services[sortBy as keyof typeof services] ?? services.createdAt
        const data = await db.query.services.findMany({
          where: whereClause,
          limit,
          offset: (page - 1) * limit,
          orderBy: sortOrder === 'desc' ? desc(orderColumn as any) : asc(orderColumn as any),
        })

        const result: PaginatedResult<(typeof data)[0]> = {
          data,
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        }

        return { success: true, ...result }
      } catch (error) {
        console.error('Get services error:', error)
        return { success: false, message: 'Failed to fetch services' }
      }
    }
  )

  ipcMain.handle('services:get-active', async () => {
    try {
      const data = await db.query.services.findMany({
        where: eq(services.isActive, true),
        orderBy: desc(services.name),
      })

      return { success: true, data }
    } catch (error) {
      console.error('Get active services error:', error)
      return { success: false, message: 'Failed to fetch active services' }
    }
  })

  ipcMain.handle('services:get-by-id', async (_, id: number) => {
    try {
      const service = await db.query.services.findFirst({
        where: eq(services.id, id),
      })

      if (!service) {
        return { success: false, message: 'Service not found' }
      }

      return { success: true, data: service }
    } catch (error) {
      console.error('Get service error:', error)
      return { success: false, message: 'Failed to fetch service' }
    }
  })

  ipcMain.handle('services:get-by-code', async (_, code: string) => {
    try {
      const service = await db.query.services.findFirst({
        where: eq(services.code, code),
      })

      if (!service) {
        return { success: false, message: 'Service not found' }
      }

      return { success: true, data: service }
    } catch (error) {
      console.error('Get service by code error:', error)
      return { success: false, message: 'Failed to fetch service' }
    }
  })

  ipcMain.handle('services:create', async (_, data: NewService) => {
    try {
      const session = getCurrentSession()

      // Sanitize input data
      const sanitizedData = sanitizeServiceInput(data) as NewService

      // Validate numeric ranges
      const validation = validateServiceInput(sanitizedData)
      if (!validation.valid) {
        return { success: false, message: validation.errors.join(', ') }
      }

      // Check for duplicate code
      const existing = await db.query.services.findFirst({
        where: eq(services.code, sanitizedData.code),
      })

      if (existing) {
        return { success: false, message: 'Service code already exists' }
      }

      const result = await db.insert(services).values(sanitizedData).returning()
      const newService = result[0]

      await createAuditLog({
        userId: session?.userId,
        branchId: session?.branchId,
        action: 'create',
        entityType: 'service',
        entityId: newService.id,
        newValues: sanitizeForAudit(sanitizedData as Record<string, unknown>),
        description: `Created service: ${sanitizedData.name}`,
      })

      return { success: true, data: newService }
    } catch (error) {
      console.error('Create service error:', error)
      return { success: false, message: 'Failed to create service' }
    }
  })

  ipcMain.handle('services:update', async (_, id: number, data: Partial<NewService>) => {
    try {
      const session = getCurrentSession()

      const existing = await db.query.services.findFirst({
        where: eq(services.id, id),
      })

      if (!existing) {
        return { success: false, message: 'Service not found' }
      }

      // Sanitize input data
      const sanitizedData = sanitizeServiceInput(data)

      // Validate numeric ranges
      const validation = validateServiceInput(sanitizedData)
      if (!validation.valid) {
        return { success: false, message: validation.errors.join(', ') }
      }

      // Check for duplicate code if code is being changed
      if (sanitizedData.code && sanitizedData.code !== existing.code) {
        const duplicate = await db.query.services.findFirst({
          where: eq(services.code, sanitizedData.code),
        })
        if (duplicate) {
          return { success: false, message: 'Service code already exists' }
        }
      }

      const result = await db
        .update(services)
        .set({ ...sanitizedData, updatedAt: new Date().toISOString() })
        .where(eq(services.id, id))
        .returning()

      await createAuditLog({
        userId: session?.userId,
        branchId: session?.branchId,
        action: 'update',
        entityType: 'service',
        entityId: id,
        oldValues: sanitizeForAudit(existing as unknown as Record<string, unknown>),
        newValues: sanitizeForAudit(sanitizedData as Record<string, unknown>),
        description: `Updated service: ${existing.name}`,
      })

      return { success: true, data: result[0] }
    } catch (error) {
      console.error('Update service error:', error)
      return { success: false, message: 'Failed to update service' }
    }
  })

  ipcMain.handle('services:delete', async (_, id: number) => {
    try {
      const session = getCurrentSession()

      const existing = await db.query.services.findFirst({
        where: eq(services.id, id),
      })

      if (!existing) {
        return { success: false, message: 'Service not found' }
      }

      // Soft delete
      await db
        .update(services)
        .set({ isActive: false, updatedAt: new Date().toISOString() })
        .where(eq(services.id, id))

      await createAuditLog({
        userId: session?.userId,
        branchId: session?.branchId,
        action: 'delete',
        entityType: 'service',
        entityId: id,
        oldValues: sanitizeForAudit(existing as unknown as Record<string, unknown>),
        description: `Deactivated service: ${existing.name}`,
      })

      return { success: true, message: 'Service deactivated successfully' }
    } catch (error) {
      console.error('Delete service error:', error)
      return { success: false, message: 'Failed to delete service' }
    }
  })

  ipcMain.handle('services:search', async (_, query: string) => {
    try {
      const results = await db.query.services.findMany({
        where: and(
          eq(services.isActive, true),
          or(
            like(services.name, `%${query}%`),
            like(services.code, `%${query}%`),
            like(services.description, `%${query}%`)
          )
        ),
        limit: 20,
      })

      return { success: true, data: results }
    } catch (error) {
      console.error('Search services error:', error)
      return { success: false, message: 'Failed to search services' }
    }
  })
}
