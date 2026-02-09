'use server'

import { db } from '@/lib/db'
import { categories, products } from '@/lib/db/schema'
import { eq, and, isNull, count } from 'drizzle-orm'
import { auth } from '@/lib/auth/config'

async function getTenantId() {
  const session = await auth()
  const tenantId = (session as any)?.tenantId
  if (!tenantId) throw new Error('No tenant context')
  return tenantId as number
}

export async function getCategories(params?: { activeOnly?: boolean }) {
  const tenantId = await getTenantId()

  const conditions = [eq(categories.tenantId, tenantId)]
  if (params?.activeOnly) {
    conditions.push(eq(categories.isActive, true))
  }

  const data = await db
    .select()
    .from(categories)
    .where(and(...conditions))
    .orderBy(categories.name)

  return { success: true, data }
}

export async function getCategoryTree() {
  const tenantId = await getTenantId()

  const allCategories = await db
    .select()
    .from(categories)
    .where(and(eq(categories.tenantId, tenantId), eq(categories.isActive, true)))
    .orderBy(categories.name)

  // Build tree structure
  type CategoryNode = (typeof allCategories)[0] & { children: CategoryNode[] }
  const map = new Map<number, CategoryNode>()
  const roots: CategoryNode[] = []

  for (const cat of allCategories) {
    map.set(cat.id, { ...cat, children: [] })
  }

  for (const cat of allCategories) {
    const node = map.get(cat.id)!
    if (cat.parentId && map.has(cat.parentId)) {
      map.get(cat.parentId)!.children.push(node)
    } else {
      roots.push(node)
    }
  }

  return { success: true, data: roots }
}

export async function getCategoryById(id: number) {
  const tenantId = await getTenantId()

  const [category] = await db
    .select()
    .from(categories)
    .where(and(eq(categories.id, id), eq(categories.tenantId, tenantId)))

  if (!category) return { success: false, message: 'Category not found' }

  return { success: true, data: category }
}

export async function createCategory(data: {
  name: string
  description?: string
  parentId?: number | null
}) {
  const tenantId = await getTenantId()

  const [category] = await db
    .insert(categories)
    .values({
      tenantId,
      name: data.name,
      description: data.description || null,
      parentId: data.parentId || null,
    })
    .returning()

  return { success: true, data: category }
}

export async function updateCategory(
  id: number,
  data: { name?: string; description?: string; parentId?: number | null; isActive?: boolean }
) {
  const tenantId = await getTenantId()

  const updateData: any = { updatedAt: new Date() }
  if (data.name !== undefined) updateData.name = data.name
  if (data.description !== undefined) updateData.description = data.description
  if (data.parentId !== undefined) updateData.parentId = data.parentId
  if (data.isActive !== undefined) updateData.isActive = data.isActive

  const [category] = await db
    .update(categories)
    .set(updateData)
    .where(and(eq(categories.id, id), eq(categories.tenantId, tenantId)))
    .returning()

  if (!category) return { success: false, message: 'Category not found' }

  return { success: true, data: category }
}

export async function deleteCategory(id: number) {
  const tenantId = await getTenantId()

  // Check if category has products
  const [productCount] = await db
    .select({ c: count() })
    .from(products)
    .where(eq(products.categoryId, id))

  if (productCount.c > 0) {
    return { success: false, message: 'Cannot delete category with products. Deactivate instead.' }
  }

  // Check if category has children
  const [childCount] = await db
    .select({ c: count() })
    .from(categories)
    .where(and(eq(categories.parentId, id), eq(categories.tenantId, tenantId)))

  if (childCount.c > 0) {
    return { success: false, message: 'Cannot delete category with sub-categories.' }
  }

  // Soft delete
  const [category] = await db
    .update(categories)
    .set({ isActive: false, updatedAt: new Date() })
    .where(and(eq(categories.id, id), eq(categories.tenantId, tenantId)))
    .returning()

  if (!category) return { success: false, message: 'Category not found' }

  return { success: true, data: category }
}
