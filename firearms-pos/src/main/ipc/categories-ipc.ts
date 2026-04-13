import { ipcMain } from 'electron'
import { eq, isNull, desc, and } from 'drizzle-orm'
import { getDatabase } from '../db'
import { categories, type NewCategory } from '../db/schema'
import { createAuditLog, sanitizeForAudit } from '../utils/audit'
import { getCurrentSession } from './auth-ipc'

interface CategoryWithChildren {
  id: number
  name: string
  description: string | null
  parentId: number | null
  isActive: boolean
  children: CategoryWithChildren[]
}

export function registerCategoryHandlers(): void {
  const db = getDatabase()

  ipcMain.handle('categories:get-all', async () => {
    try {
      const data = await db.query.categories.findMany({
        orderBy: categories.name,
      })

      // Deduplicate by name+parentId, keeping the first (oldest) entry
      const seen = new Map<string, boolean>()
      const uniqueData = data.filter((cat) => {
        const key = `${cat.name}::${cat.parentId ?? 'root'}`
        if (seen.has(key)) return false
        seen.set(key, true)
        return true
      })

      return { success: true, data: uniqueData }
    } catch (error) {
      console.error('Get categories error:', error)
      return { success: false, message: 'Failed to fetch categories' }
    }
  })

  ipcMain.handle('categories:get-tree', async () => {
    try {
      const allCategories = await db.query.categories.findMany({
        where: eq(categories.isActive, true),
      })

      // Deduplicate by name+parentId, keeping the first entry
      const seen = new Map<string, boolean>()
      const uniqueCategories = allCategories.filter((cat) => {
        const key = `${cat.name}::${cat.parentId ?? 'root'}`
        if (seen.has(key)) return false
        seen.set(key, true)
        return true
      })

      // Build tree structure
      const buildTree = (parentId: number | null): CategoryWithChildren[] => {
        return uniqueCategories
          .filter((cat) => cat.parentId === parentId)
          .map((cat) => ({
            ...cat,
            children: buildTree(cat.id),
          }))
      }

      const tree = buildTree(null)
      return { success: true, data: tree }
    } catch (error) {
      console.error('Get category tree error:', error)
      return { success: false, message: 'Failed to fetch category tree' }
    }
  })

  ipcMain.handle('categories:get-by-id', async (_, id: number) => {
    try {
      const category = await db.query.categories.findFirst({
        where: eq(categories.id, id),
      })

      if (!category) {
        return { success: false, message: 'Category not found' }
      }

      return { success: true, data: category }
    } catch (error) {
      console.error('Get category error:', error)
      return { success: false, message: 'Failed to fetch category' }
    }
  })

  ipcMain.handle('categories:create', async (_, data: NewCategory) => {
    try {
      const session = getCurrentSession()

      // Check for duplicate category name under the same parent
      const existing = await db.query.categories.findFirst({
        where: and(
          eq(categories.name, data.name),
          data.parentId ? eq(categories.parentId, data.parentId) : isNull(categories.parentId),
          eq(categories.isActive, true)
        ),
      })

      if (existing) {
        return { success: false, message: `Category "${data.name}" already exists${data.parentId ? ' under this parent' : ''}` }
      }

      const result = await db.insert(categories).values(data).returning()
      const newCategory = result[0]

      await createAuditLog({
        userId: session?.userId,
        branchId: session?.branchId,
        action: 'create',
        entityType: 'category',
        entityId: newCategory.id,
        newValues: sanitizeForAudit(data as Record<string, unknown>),
        description: `Created category: ${data.name}`,
      })

      return { success: true, data: newCategory }
    } catch (error) {
      console.error('Create category error:', error)
      return { success: false, message: 'Failed to create category' }
    }
  })

  ipcMain.handle('categories:update', async (_, id: number, data: Partial<NewCategory>) => {
    try {
      const session = getCurrentSession()

      const existing = await db.query.categories.findFirst({
        where: eq(categories.id, id),
      })

      if (!existing) {
        return { success: false, message: 'Category not found' }
      }

      // Prevent circular reference
      if (data.parentId === id) {
        return { success: false, message: 'Category cannot be its own parent' }
      }

      const result = await db
        .update(categories)
        .set({ ...data, updatedAt: new Date().toISOString() })
        .where(eq(categories.id, id))
        .returning()

      await createAuditLog({
        userId: session?.userId,
        branchId: session?.branchId,
        action: 'update',
        entityType: 'category',
        entityId: id,
        oldValues: sanitizeForAudit(existing as unknown as Record<string, unknown>),
        newValues: sanitizeForAudit(data as Record<string, unknown>),
        description: `Updated category: ${existing.name}`,
      })

      return { success: true, data: result[0] }
    } catch (error) {
      console.error('Update category error:', error)
      return { success: false, message: 'Failed to update category' }
    }
  })

  ipcMain.handle('categories:delete', async (_, id: number) => {
    try {
      const session = getCurrentSession()

      const existing = await db.query.categories.findFirst({
        where: eq(categories.id, id),
      })

      if (!existing) {
        return { success: false, message: 'Category not found' }
      }

      // Check for child categories
      const children = await db.query.categories.findFirst({
        where: eq(categories.parentId, id),
      })

      if (children) {
        return { success: false, message: 'Cannot delete category with subcategories' }
      }

      // Soft delete
      await db
        .update(categories)
        .set({ isActive: false, updatedAt: new Date().toISOString() })
        .where(eq(categories.id, id))

      await createAuditLog({
        userId: session?.userId,
        branchId: session?.branchId,
        action: 'delete',
        entityType: 'category',
        entityId: id,
        oldValues: sanitizeForAudit(existing as unknown as Record<string, unknown>),
        description: `Deactivated category: ${existing.name}`,
      })

      return { success: true, message: 'Category deactivated successfully' }
    } catch (error) {
      console.error('Delete category error:', error)
      return { success: false, message: 'Failed to delete category' }
    }
  })
}
