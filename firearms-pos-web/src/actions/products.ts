'use server'

import { db } from '@/lib/db'
import { products } from '@/lib/db/schema'
import { eq, and, ilike } from 'drizzle-orm'
import { auth } from '@/lib/auth/config'

export async function getProducts(params?: {
  search?: string
  categoryId?: number
  isActive?: boolean
}) {
  const session = await auth()
  if (!session) return { success: false, message: 'Unauthorized' }

  const tenantId = (session as any).tenantId

  const conditions = [eq(products.tenantId, tenantId)]

  if (params?.search) {
    conditions.push(ilike(products.name, `%${params.search}%`))
  }
  if (params?.categoryId) {
    conditions.push(eq(products.categoryId, params.categoryId))
  }
  if (params?.isActive !== undefined) {
    conditions.push(eq(products.isActive, params.isActive))
  }

  const data = await db
    .select()
    .from(products)
    .where(and(...conditions))
    .orderBy(products.name)

  return { success: true, data }
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
  const session = await auth()
  if (!session) return { success: false, message: 'Unauthorized' }

  const tenantId = (session as any).tenantId

  const [product] = await db
    .insert(products)
    .values({
      tenantId,
      code: input.code,
      name: input.name,
      description: input.description,
      categoryId: input.categoryId,
      brand: input.brand,
      costPrice: String(input.costPrice),
      sellingPrice: String(input.sellingPrice),
      reorderLevel: input.reorderLevel ?? 10,
      unit: input.unit ?? 'pcs',
      isSerialTracked: input.isSerialTracked ?? false,
      isTaxable: input.isTaxable ?? true,
      taxRate: String(input.taxRate ?? 0),
      barcode: input.barcode,
    })
    .returning()

  return { success: true, data: product }
}
