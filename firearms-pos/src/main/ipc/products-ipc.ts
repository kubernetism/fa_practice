import { ipcMain } from 'electron'
import { eq, like, and, or, desc, asc, sql } from 'drizzle-orm'
import { getDatabase } from '../db'
import { products, categories, inventory, type NewProduct } from '../db/schema'
import { createAuditLog, sanitizeForAudit } from '../utils/audit'
import { getCurrentSession } from './auth-ipc'
import type { PaginationParams, PaginatedResult } from '../utils/helpers'
import {
  sanitizeForStorage,
  sanitizeAlphanumeric,
  validatePrice,
  validateCostPrice,
  validateQuantity,
  validateTaxRate,
  validatePercentage,
} from '../utils/validation'

/**
 * Sanitize and validate product input data
 * Section 5.2 - Input sanitization and range validation
 */
function sanitizeProductInput(data: Partial<NewProduct>): Partial<NewProduct> {
  const sanitized = { ...data }

  // Sanitize text fields
  if (sanitized.name) sanitized.name = sanitizeForStorage(sanitized.name)
  if (sanitized.code) sanitized.code = sanitizeAlphanumeric(sanitized.code)
  if (sanitized.barcode) sanitized.barcode = sanitizeAlphanumeric(sanitized.barcode)
  if (sanitized.description) sanitized.description = sanitizeForStorage(sanitized.description)
  if (sanitized.manufacturer) sanitized.manufacturer = sanitizeForStorage(sanitized.manufacturer)
  if (sanitized.model) sanitized.model = sanitizeForStorage(sanitized.model)
  if (sanitized.caliber) sanitized.caliber = sanitizeForStorage(sanitized.caliber)
  if (sanitized.sku) sanitized.sku = sanitizeAlphanumeric(sanitized.sku)

  return sanitized
}

/**
 * Validate product numeric fields
 */
function validateProductInput(data: Partial<NewProduct>): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  // Validate prices
  if (data.sellingPrice !== undefined) {
    const validatedPrice = validatePrice(data.sellingPrice)
    if (validatedPrice === null) {
      errors.push('Selling price must be a positive number')
    }
  }

  if (data.costPrice !== undefined) {
    const validatedCost = validateCostPrice(data.costPrice)
    if (validatedCost === null && data.costPrice !== 0) {
      errors.push('Cost price must be a non-negative number')
    }
  }

  // Validate quantities
  if (data.minStockLevel !== undefined) {
    const validatedMin = validateQuantity(data.minStockLevel)
    if (validatedMin === null) {
      errors.push('Minimum stock level must be a non-negative integer')
    }
  }

  if (data.maxStockLevel !== undefined) {
    const validatedMax = validateQuantity(data.maxStockLevel)
    if (validatedMax === null) {
      errors.push('Maximum stock level must be a non-negative integer')
    }
  }

  if (data.reorderLevel !== undefined) {
    const validatedReorder = validateQuantity(data.reorderLevel)
    if (validatedReorder === null) {
      errors.push('Reorder level must be a non-negative integer')
    }
  }

  // Validate tax rate
  if (data.taxRate !== undefined) {
    const validatedTax = validateTaxRate(data.taxRate)
    if (validatedTax === null) {
      errors.push('Tax rate must be between 0 and 100')
    }
  }

  // Validate discount percentage
  if (data.maxDiscountPercent !== undefined) {
    const validatedDiscount = validatePercentage(data.maxDiscountPercent)
    if (validatedDiscount === null) {
      errors.push('Max discount percent must be between 0 and 100')
    }
  }

  return { valid: errors.length === 0, errors }
}

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

      // Section 5.2: Sanitize input data
      const sanitizedData = sanitizeProductInput(data) as NewProduct

      // Section 5.2: Validate numeric ranges
      const validation = validateProductInput(sanitizedData)
      if (!validation.valid) {
        return { success: false, message: validation.errors.join(', ') }
      }

      // Check for duplicate code
      const existing = await db.query.products.findFirst({
        where: eq(products.code, sanitizedData.code),
      })

      if (existing) {
        return { success: false, message: 'Product code already exists' }
      }

      const result = await db.insert(products).values(sanitizedData).returning()
      const newProduct = result[0]

      await createAuditLog({
        userId: session?.userId,
        branchId: session?.branchId,
        action: 'create',
        entityType: 'product',
        entityId: newProduct.id,
        newValues: sanitizeForAudit(sanitizedData as Record<string, unknown>),
        description: `Created product: ${sanitizedData.name}`,
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

      // Section 5.2: Sanitize input data
      const sanitizedData = sanitizeProductInput(data)

      // Section 5.2: Validate numeric ranges
      const validation = validateProductInput(sanitizedData)
      if (!validation.valid) {
        return { success: false, message: validation.errors.join(', ') }
      }

      // Check for duplicate code if code is being changed
      if (sanitizedData.code && sanitizedData.code !== existing.code) {
        const duplicate = await db.query.products.findFirst({
          where: eq(products.code, sanitizedData.code),
        })
        if (duplicate) {
          return { success: false, message: 'Product code already exists' }
        }
      }

      const result = await db
        .update(products)
        .set({ ...sanitizedData, updatedAt: new Date().toISOString() })
        .where(eq(products.id, id))
        .returning()

      await createAuditLog({
        userId: session?.userId,
        branchId: session?.branchId,
        action: 'update',
        entityType: 'product',
        entityId: id,
        oldValues: sanitizeForAudit(existing as unknown as Record<string, unknown>),
        newValues: sanitizeForAudit(sanitizedData as Record<string, unknown>),
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

  // Get products with available stock for a branch
  ipcMain.handle(
    'products:get-available',
    async (
      _,
      params: {
        branchId: number
        categoryId?: number
        searchQuery?: string
        limit?: number
      }
    ) => {
      try {
        const db = getDatabase()
        const { branchId, categoryId, searchQuery, limit = 100 } = params

        const conditions = [eq(products.isActive, true)]
        if (categoryId) {
          conditions.push(eq(products.categoryId, categoryId))
        }
        if (searchQuery) {
          conditions.push(
            sql`(${products.name} LIKE ${`%${searchQuery}%`} OR ${products.code} LIKE ${`%${searchQuery}%`} OR ${products.barcode} LIKE ${`%${searchQuery}%`})`
          )
        }

        const results = await db
          .select({
            product: products,
            quantity: inventory.quantity,
          })
          .from(products)
          .leftJoin(inventory, and(eq(inventory.productId, products.id), eq(inventory.branchId, branchId)))
          .where(and(...conditions))
          .limit(limit)
          .orderBy(products.name)

        // Filter to only show products with available stock
        const availableProducts = results.filter((r) => (r.quantity ?? 0) > 0)

        return { success: true, data: availableProducts }
      } catch (error) {
        console.error('Get available products error:', error)
        return { success: false, message: 'Failed to fetch available products' }
      }
    }
  )
}
