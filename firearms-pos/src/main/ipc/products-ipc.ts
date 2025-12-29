import { ipcMain } from 'electron'
import { eq, like, and, or, desc, asc, sql } from 'drizzle-orm'
import { getDatabase } from '../db'
import { products, categories, type NewProduct } from '../db/schema'
import { createAuditLog, sanitizeForAudit } from '../utils/audit'
import { getCurrentSession } from './auth-ipc'
import type { PaginationParams, PaginatedResult } from '../utils/helpers'

export function registerProductHandlers(): void {
  const db = getDatabase()

  ipcMain.handle(
    'products:get-all',
    async (
      _,
      params: PaginationParams & { search?: string; categoryId?: number; isActive?: boolean }
    ) => {
      try {
        const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc', search, categoryId, isActive } = params

        const conditions = []

        if (search) {
          conditions.push(
            or(
              like(products.name, `%${search}%`),
              like(products.code, `%${search}%`),
              like(products.barcode, `%${search}%`)
            )
          )
        }

        if (categoryId) {
          conditions.push(eq(products.categoryId, categoryId))
        }

        if (isActive !== undefined) {
          conditions.push(eq(products.isActive, isActive))
        }

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined

        // Get total count
        const countResult = await db
          .select({ count: sql<number>`count(*)` })
          .from(products)
          .where(whereClause)

        const total = countResult[0].count

        // Get paginated data
        const orderColumn = products[sortBy as keyof typeof products] ?? products.createdAt
        const data = await db.query.products.findMany({
          where: whereClause,
          limit,
          offset: (page - 1) * limit,
          orderBy: sortOrder === 'desc' ? desc(orderColumn as any) : asc(orderColumn as any),
          with: {
            // category: true, // Enable if you add relations
          },
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
        console.error('Get products error:', error)
        return { success: false, message: 'Failed to fetch products' }
      }
    }
  )

  ipcMain.handle('products:get-by-id', async (_, id: number) => {
    try {
      const product = await db.query.products.findFirst({
        where: eq(products.id, id),
      })

      if (!product) {
        return { success: false, message: 'Product not found' }
      }

      return { success: true, data: product }
    } catch (error) {
      console.error('Get product error:', error)
      return { success: false, message: 'Failed to fetch product' }
    }
  })

  ipcMain.handle('products:get-by-barcode', async (_, barcode: string) => {
    try {
      const product = await db.query.products.findFirst({
        where: eq(products.barcode, barcode),
      })

      if (!product) {
        return { success: false, message: 'Product not found' }
      }

      return { success: true, data: product }
    } catch (error) {
      console.error('Get product by barcode error:', error)
      return { success: false, message: 'Failed to fetch product' }
    }
  })

  ipcMain.handle('products:create', async (_, data: NewProduct) => {
    try {
      const session = getCurrentSession()

      // Check for duplicate code
      const existing = await db.query.products.findFirst({
        where: eq(products.code, data.code),
      })

      if (existing) {
        return { success: false, message: 'Product code already exists' }
      }

      const result = await db.insert(products).values(data).returning()
      const newProduct = result[0]

      await createAuditLog({
        userId: session?.userId,
        branchId: session?.branchId,
        action: 'create',
        entityType: 'product',
        entityId: newProduct.id,
        newValues: sanitizeForAudit(data as Record<string, unknown>),
        description: `Created product: ${data.name}`,
      })

      return { success: true, data: newProduct }
    } catch (error) {
      console.error('Create product error:', error)
      return { success: false, message: 'Failed to create product' }
    }
  })

  ipcMain.handle('products:update', async (_, id: number, data: Partial<NewProduct>) => {
    try {
      const session = getCurrentSession()

      const existing = await db.query.products.findFirst({
        where: eq(products.id, id),
      })

      if (!existing) {
        return { success: false, message: 'Product not found' }
      }

      // Check for duplicate code if code is being changed
      if (data.code && data.code !== existing.code) {
        const duplicate = await db.query.products.findFirst({
          where: eq(products.code, data.code),
        })
        if (duplicate) {
          return { success: false, message: 'Product code already exists' }
        }
      }

      const result = await db
        .update(products)
        .set({ ...data, updatedAt: new Date().toISOString() })
        .where(eq(products.id, id))
        .returning()

      await createAuditLog({
        userId: session?.userId,
        branchId: session?.branchId,
        action: 'update',
        entityType: 'product',
        entityId: id,
        oldValues: sanitizeForAudit(existing as unknown as Record<string, unknown>),
        newValues: sanitizeForAudit(data as Record<string, unknown>),
        description: `Updated product: ${existing.name}`,
      })

      return { success: true, data: result[0] }
    } catch (error) {
      console.error('Update product error:', error)
      return { success: false, message: 'Failed to update product' }
    }
  })

  ipcMain.handle('products:delete', async (_, id: number) => {
    try {
      const session = getCurrentSession()

      const existing = await db.query.products.findFirst({
        where: eq(products.id, id),
      })

      if (!existing) {
        return { success: false, message: 'Product not found' }
      }

      // Soft delete
      await db
        .update(products)
        .set({ isActive: false, updatedAt: new Date().toISOString() })
        .where(eq(products.id, id))

      await createAuditLog({
        userId: session?.userId,
        branchId: session?.branchId,
        action: 'delete',
        entityType: 'product',
        entityId: id,
        oldValues: sanitizeForAudit(existing as unknown as Record<string, unknown>),
        description: `Deactivated product: ${existing.name}`,
      })

      return { success: true, message: 'Product deactivated successfully' }
    } catch (error) {
      console.error('Delete product error:', error)
      return { success: false, message: 'Failed to delete product' }
    }
  })

  ipcMain.handle('products:search', async (_, query: string) => {
    try {
      const results = await db.query.products.findMany({
        where: and(
          eq(products.isActive, true),
          or(
            like(products.name, `%${query}%`),
            like(products.code, `%${query}%`),
            like(products.barcode, `%${query}%`)
          )
        ),
        limit: 20,
      })

      return { success: true, data: results }
    } catch (error) {
      console.error('Search products error:', error)
      return { success: false, message: 'Failed to search products' }
    }
  })
}
