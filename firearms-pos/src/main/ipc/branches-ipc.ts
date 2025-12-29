import { ipcMain } from 'electron'
import { eq, desc } from 'drizzle-orm'
import { getDatabase } from '../db'
import { branches, type NewBranch } from '../db/schema'
import { createAuditLog, sanitizeForAudit } from '../utils/audit'
import { getCurrentSession } from './auth-ipc'

export function registerBranchHandlers(): void {
  const db = getDatabase()

  ipcMain.handle('branches:get-all', async () => {
    try {
      const data = await db.query.branches.findMany({
        orderBy: desc(branches.isMain),
      })

      return { success: true, data }
    } catch (error) {
      console.error('Get branches error:', error)
      return { success: false, message: 'Failed to fetch branches' }
    }
  })

  ipcMain.handle('branches:get-active', async () => {
    try {
      const data = await db.query.branches.findMany({
        where: eq(branches.isActive, true),
        orderBy: desc(branches.isMain),
      })

      return { success: true, data }
    } catch (error) {
      console.error('Get active branches error:', error)
      return { success: false, message: 'Failed to fetch active branches' }
    }
  })

  ipcMain.handle('branches:get-by-id', async (_, id: number) => {
    try {
      const branch = await db.query.branches.findFirst({
        where: eq(branches.id, id),
      })

      if (!branch) {
        return { success: false, message: 'Branch not found' }
      }

      return { success: true, data: branch }
    } catch (error) {
      console.error('Get branch error:', error)
      return { success: false, message: 'Failed to fetch branch' }
    }
  })

  ipcMain.handle('branches:create', async (_, data: NewBranch) => {
    try {
      const session = getCurrentSession()

      // Check for duplicate code
      const existing = await db.query.branches.findFirst({
        where: eq(branches.code, data.code),
      })

      if (existing) {
        return { success: false, message: 'Branch code already exists' }
      }

      const result = await db.insert(branches).values(data).returning()
      const newBranch = result[0]

      await createAuditLog({
        userId: session?.userId,
        branchId: session?.branchId,
        action: 'create',
        entityType: 'branch',
        entityId: newBranch.id,
        newValues: sanitizeForAudit(data as Record<string, unknown>),
        description: `Created branch: ${data.name}`,
      })

      return { success: true, data: newBranch }
    } catch (error) {
      console.error('Create branch error:', error)
      return { success: false, message: 'Failed to create branch' }
    }
  })

  ipcMain.handle('branches:update', async (_, id: number, data: Partial<NewBranch>) => {
    try {
      const session = getCurrentSession()

      const existing = await db.query.branches.findFirst({
        where: eq(branches.id, id),
      })

      if (!existing) {
        return { success: false, message: 'Branch not found' }
      }

      // Check for duplicate code if code is being changed
      if (data.code && data.code !== existing.code) {
        const duplicate = await db.query.branches.findFirst({
          where: eq(branches.code, data.code),
        })
        if (duplicate) {
          return { success: false, message: 'Branch code already exists' }
        }
      }

      const result = await db
        .update(branches)
        .set({ ...data, updatedAt: new Date().toISOString() })
        .where(eq(branches.id, id))
        .returning()

      await createAuditLog({
        userId: session?.userId,
        branchId: session?.branchId,
        action: 'update',
        entityType: 'branch',
        entityId: id,
        oldValues: sanitizeForAudit(existing as unknown as Record<string, unknown>),
        newValues: sanitizeForAudit(data as Record<string, unknown>),
        description: `Updated branch: ${existing.name}`,
      })

      return { success: true, data: result[0] }
    } catch (error) {
      console.error('Update branch error:', error)
      return { success: false, message: 'Failed to update branch' }
    }
  })

  ipcMain.handle('branches:delete', async (_, id: number) => {
    try {
      const session = getCurrentSession()

      const existing = await db.query.branches.findFirst({
        where: eq(branches.id, id),
      })

      if (!existing) {
        return { success: false, message: 'Branch not found' }
      }

      if (existing.isMain) {
        return { success: false, message: 'Cannot deactivate main branch' }
      }

      await db
        .update(branches)
        .set({ isActive: false, updatedAt: new Date().toISOString() })
        .where(eq(branches.id, id))

      await createAuditLog({
        userId: session?.userId,
        branchId: session?.branchId,
        action: 'delete',
        entityType: 'branch',
        entityId: id,
        oldValues: sanitizeForAudit(existing as unknown as Record<string, unknown>),
        description: `Deactivated branch: ${existing.name}`,
      })

      return { success: true, message: 'Branch deactivated successfully' }
    } catch (error) {
      console.error('Delete branch error:', error)
      return { success: false, message: 'Failed to delete branch' }
    }
  })
}
