'use server'

import { db } from '@/lib/db'
import { products, categories, inventory } from '@/lib/db/schema'
import { eq, and, ilike, or, desc, sql, count } from 'drizzle-orm'
import { auth } from '@/lib/auth/config'

async function getTenantId() {
  const session = await auth()
  const tenantId = (session as any)?.tenantId
  if (!tenantId) throw new Error('No tenant context')
  return tenantId as number
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

  const existing = await db
    .select({ id: products.id })
    .from(products)
    .where(and(eq(products.tenantId, tenantId), eq(products.code, input.code)))

  if (existing.length > 0) {
    return { success: false, message: 'Product code already exists' }
  }

  const [product] = await db
    .insert(products)
    .values({
      tenantId,
      code: input.code,
      name: input.name,
      description: input.description || null,
      categoryId: input.categoryId || null,
      brand: input.brand || null,
      costPrice: String(input.costPrice),
      sellingPrice: String(input.sellingPrice),
      reorderLevel: input.reorderLevel ?? 10,
      unit: input.unit ?? 'pcs',
      isSerialTracked: input.isSerialTracked ?? false,
      isTaxable: input.isTaxable ?? true,
      taxRate: String(input.taxRate ?? 0),
      barcode: input.barcode || null,
    })
    .returning()

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
  return { success: true, data: product }
}

export async function deleteProduct(id: number) {
  const tenantId = await getTenantId()

  await db
    .update(products)
    .set({ isActive: false, updatedAt: new Date() })
    .where(and(eq(products.id, id), eq(products.tenantId, tenantId)))

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

export async function getCategories() {
  const tenantId = await getTenantId()

  const data = await db
    .select()
    .from(categories)
    .where(eq(categories.tenantId, tenantId))
    .orderBy(categories.name)

  return { success: true, data }
}
