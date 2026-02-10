'use server'

import { db } from '@/lib/db'
import { products, categories, inventory } from '@/lib/db/schema'
import { eq, and, ilike, or, desc, sql, count } from 'drizzle-orm'
import { auth } from '@/lib/auth/config'
import { sanitizeInput } from '@/lib/validation/sanitize'
import { logCreate, logUpdate, logDelete } from '@/lib/audit/logger'

async function getSessionContext() {
  const session = await auth()
  const tenantId = (session as any)?.tenantId
  if (!tenantId) throw new Error('No tenant context')
  return {
    tenantId: tenantId as number,
    branchId: (session as any)?.branchId as number | null,
  }
}

async function getTenantId() {
  const { tenantId } = await getSessionContext()
  return tenantId
}

export async function getProducts(params?: {
  search?: string
  categoryId?: number
  isActive?: boolean
}) {
  const tenantId = await getTenantId()

  const conditions = [eq(products.tenantId, tenantId)]

  if (params?.search) {
    conditions.push(
      or(
        ilike(products.name, `%${params.search}%`),
        ilike(products.code, `%${params.search}%`),
        ilike(products.barcode, `%${params.search}%`)
      )!
    )
  }
  if (params?.categoryId) {
    conditions.push(eq(products.categoryId, params.categoryId))
  }
  if (params?.isActive !== undefined) {
    conditions.push(eq(products.isActive, params.isActive))
  }

  const data = await db
    .select({
      product: products,
      categoryName: categories.name,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(and(...conditions))
    .orderBy(products.name)

  return { success: true, data }
}

export async function getProductsWithStock(params?: {
  search?: string
  categoryId?: number
  isActive?: boolean
  branchId?: number
}) {
  const { tenantId, branchId: sessionBranchId } = await getSessionContext()
  const branchId = params?.branchId ?? sessionBranchId

  const conditions = [eq(products.tenantId, tenantId)]

  if (params?.search) {
    conditions.push(
      or(
        ilike(products.name, `%${params.search}%`),
        ilike(products.code, `%${params.search}%`),
        ilike(products.barcode, `%${params.search}%`)
      )!
    )
  }
  if (params?.categoryId) {
    conditions.push(eq(products.categoryId, params.categoryId))
  }
  if (params?.isActive !== undefined) {
    conditions.push(eq(products.isActive, params.isActive))
  }

  const data = await db
    .select({
      product: products,
      categoryName: categories.name,
      stockQuantity: sql<number>`COALESCE(${inventory.quantity}, 0)`,
    })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .leftJoin(
      inventory,
      and(
        eq(inventory.productId, products.id),
        ...(branchId ? [eq(inventory.branchId, branchId)] : [])
      )
    )
    .where(and(...conditions))
    .orderBy(products.name)

  return { success: true, data }
}

export async function getProductSummary() {
  const tenantId = await getTenantId()

  const result = await db
    .select({
      totalProducts: count(),
      activeCount: sql<number>`COUNT(*) FILTER (WHERE ${products.isActive} = true)`,
      serialTrackedCount: sql<number>`COUNT(*) FILTER (WHERE ${products.isSerialTracked} = true)`,
    })
    .from(products)
    .where(eq(products.tenantId, tenantId))

  return { success: true, data: result[0] }
}

export async function getProductById(id: number) {
  const tenantId = await getTenantId()

  const [product] = await db
    .select()
    .from(products)
    .where(and(eq(products.id, id), eq(products.tenantId, tenantId)))

  if (!product) return { success: false, message: 'Product not found' }
  return { success: true, data: product }
}

export async function getProductByBarcode(barcode: string) {
  const tenantId = await getTenantId()

  const [product] = await db
    .select()
    .from(products)
    .where(and(eq(products.barcode, barcode), eq(products.tenantId, tenantId)))

  if (!product) return { success: false, message: 'Product not found' }
  return { success: true, data: product }
}

export async function createProduct(input: {
  code: string
  name: string
  description?: string
  categoryId?: number
  brand?: string
  costPrice: number
  sellingPrice: number
  reorderLevel?: number
  unit?: string
  isSerialTracked?: boolean
  isTaxable?: boolean
  taxRate?: number
  barcode?: string
}) {
  const tenantId = await getTenantId()

  const clean = sanitizeInput(input)

  const existing = await db
    .select({ id: products.id })
    .from(products)
    .where(and(eq(products.tenantId, tenantId), eq(products.code, clean.code)))

  if (existing.length > 0) {
    return { success: false, message: 'Product code already exists' }
  }

  const [product] = await db
    .insert(products)
    .values({
      tenantId,
      code: clean.code,
      name: clean.name,
      description: clean.description || null,
      categoryId: clean.categoryId || null,
      brand: clean.brand || null,
      costPrice: String(clean.costPrice),
      sellingPrice: String(clean.sellingPrice),
      reorderLevel: clean.reorderLevel ?? 10,
      unit: clean.unit ?? 'pcs',
      isSerialTracked: clean.isSerialTracked ?? false,
      isTaxable: clean.isTaxable ?? true,
      taxRate: String(clean.taxRate ?? 0),
      barcode: clean.barcode || null,
    })
    .returning()

  logCreate('product', product.id, { code: clean.code, name: clean.name })

  // Auto-create inventory record for the user's branch
  const { branchId } = await getSessionContext()
  if (branchId) {
    try {
      await db.insert(inventory).values({
        tenantId,
        productId: product.id,
        branchId,
        quantity: 0,
        minQuantity: clean.reorderLevel ?? 10,
      })
    } catch {
      // Inventory record may already exist — safe to ignore
    }
  }

  return { success: true, data: product }
}

export async function updateProduct(
  id: number,
  input: {
    name?: string
    description?: string
    categoryId?: number
    brand?: string
    costPrice?: number
    sellingPrice?: number
    reorderLevel?: number
    unit?: string
    isSerialTracked?: boolean
    isTaxable?: boolean
    taxRate?: number
    barcode?: string
    isActive?: boolean
  }
) {
  const tenantId = await getTenantId()

  const updateData: any = { updatedAt: new Date() }
  if (input.name !== undefined) updateData.name = input.name
  if (input.description !== undefined) updateData.description = input.description
  if (input.categoryId !== undefined) updateData.categoryId = input.categoryId
  if (input.brand !== undefined) updateData.brand = input.brand
  if (input.costPrice !== undefined) updateData.costPrice = String(input.costPrice)
  if (input.sellingPrice !== undefined) updateData.sellingPrice = String(input.sellingPrice)
  if (input.reorderLevel !== undefined) updateData.reorderLevel = input.reorderLevel
  if (input.unit !== undefined) updateData.unit = input.unit
  if (input.isSerialTracked !== undefined) updateData.isSerialTracked = input.isSerialTracked
  if (input.isTaxable !== undefined) updateData.isTaxable = input.isTaxable
  if (input.taxRate !== undefined) updateData.taxRate = String(input.taxRate)
  if (input.barcode !== undefined) updateData.barcode = input.barcode
  if (input.isActive !== undefined) updateData.isActive = input.isActive

  const [product] = await db
    .update(products)
    .set(updateData)
    .where(and(eq(products.id, id), eq(products.tenantId, tenantId)))
    .returning()

  if (!product) return { success: false, message: 'Product not found' }
  logUpdate('product', id, undefined, input)
  return { success: true, data: product }
}

export async function deleteProduct(id: number) {
  const tenantId = await getTenantId()

  await db
    .update(products)
    .set({ isActive: false, updatedAt: new Date() })
    .where(and(eq(products.id, id), eq(products.tenantId, tenantId)))

  logDelete('product', id)
  return { success: true }
}

export async function searchProducts(query: string) {
  const tenantId = await getTenantId()

  const data = await db
    .select()
    .from(products)
    .where(
      and(
        eq(products.tenantId, tenantId),
        eq(products.isActive, true),
        or(
          ilike(products.name, `%${query}%`),
          ilike(products.code, `%${query}%`),
          ilike(products.barcode, `%${query}%`)
        )
      )
    )
    .limit(20)

  return { success: true, data }
}

export async function importProducts(
  items: {
    code: string
    name: string
    description?: string
    categoryId?: number
    brand?: string
    costPrice: number
    sellingPrice: number
    reorderLevel?: number
    unit?: string
    isSerialTracked?: boolean
    isTaxable?: boolean
    taxRate?: number
    barcode?: string
  }[]
) {
  const { tenantId, branchId } = await getSessionContext()

  let importedCount = 0
  let skippedCount = 0
  const errors: { code: string; message: string }[] = []

  for (const item of items) {
    try {
      const existing = await db
        .select({ id: products.id })
        .from(products)
        .where(and(eq(products.tenantId, tenantId), eq(products.code, item.code)))

      if (existing.length > 0) {
        skippedCount++
        errors.push({ code: item.code, message: 'Product code already exists' })
        continue
      }

      const [inserted] = await db.insert(products).values({
        tenantId,
        code: item.code,
        name: item.name,
        description: item.description || null,
        categoryId: item.categoryId || null,
        brand: item.brand || null,
        costPrice: String(item.costPrice),
        sellingPrice: String(item.sellingPrice),
        reorderLevel: item.reorderLevel ?? 10,
        unit: item.unit ?? 'pcs',
        isSerialTracked: item.isSerialTracked ?? false,
        isTaxable: item.isTaxable ?? true,
        taxRate: String(item.taxRate ?? 0),
        barcode: item.barcode || null,
      }).returning()

      // Auto-create inventory record
      if (inserted && branchId) {
        try {
          await db.insert(inventory).values({
            tenantId,
            productId: inserted.id,
            branchId,
            quantity: 0,
            minQuantity: item.reorderLevel ?? 10,
          })
        } catch {
          // Inventory record may already exist
        }
      }
      importedCount++
    } catch (e: any) {
      skippedCount++
      errors.push({ code: item.code, message: e.message || 'Unknown error' })
    }
  }

  return { success: true, data: { importedCount, skippedCount, errors } }
}

export async function getCategories() {
  const tenantId = await getTenantId()

  const data = await db
    .select()
    .from(categories)
    .where(eq(categories.tenantId, tenantId))
    .orderBy(categories.name)

  return { success: true, data }
}
