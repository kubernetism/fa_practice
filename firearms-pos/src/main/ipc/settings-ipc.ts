import { ipcMain } from 'electron'
import { eq } from 'drizzle-orm'
import { getDatabase } from '../db'
import { settings, type NewSetting } from '../db/schema'
import { createAuditLog } from '../utils/audit'
import { getCurrentSession } from './auth-ipc'

export function registerSettingsHandlers(): void {
  const db = getDatabase()

  ipcMain.handle('settings:get-all', async () => {
    try {
      const data = await db.query.settings.findMany()

      // Convert to key-value object
      const settingsObject: Record<string, unknown> = {}
      for (const setting of data) {
        settingsObject[setting.key] = setting.value
      }

      return { success: true, data: settingsObject, raw: data }
    } catch (error) {
      console.error('Get settings error:', error)
      return { success: false, message: 'Failed to fetch settings' }
    }
  })

  ipcMain.handle('settings:get-by-key', async (_, key: string) => {
    try {
      const setting = await db.query.settings.findFirst({
        where: eq(settings.key, key),
      })

      if (!setting) {
        return { success: false, message: 'Setting not found' }
      }

      return { success: true, data: setting.value }
    } catch (error) {
      console.error('Get setting error:', error)
      return { success: false, message: 'Failed to fetch setting' }
    }
  })

  ipcMain.handle('settings:get-by-category', async (_, category: string) => {
    try {
      const data = await db.query.settings.findMany({
        where: eq(
          settings.category,
          category as 'general' | 'company' | 'tax' | 'receipt' | 'inventory' | 'sales' | 'notification' | 'backup'
        ),
      })

      const settingsObject: Record<string, unknown> = {}
      for (const setting of data) {
        settingsObject[setting.key] = setting.value
      }

      return { success: true, data: settingsObject, raw: data }
    } catch (error) {
      console.error('Get settings by category error:', error)
      return { success: false, message: 'Failed to fetch settings' }
    }
  })

  ipcMain.handle(
    'settings:update',
    async (_, key: string, value: unknown, category?: string, description?: string) => {
      try {
        const session = getCurrentSession()

        const existing = await db.query.settings.findFirst({
          where: eq(settings.key, key),
        })

        if (existing) {
          // Update existing
          await db
            .update(settings)
            .set({
              value: JSON.stringify(value),
              updatedBy: session?.userId,
              updatedAt: new Date().toISOString(),
            })
            .where(eq(settings.key, key))

          await createAuditLog({
            userId: session?.userId,
            branchId: session?.branchId,
            action: 'update',
            entityType: 'setting',
            entityId: existing.id,
            oldValues: { key, value: existing.value },
            newValues: { key, value },
            description: `Updated setting: ${key}`,
          })
        } else {
          // Create new
          const [newSetting] = await db
            .insert(settings)
            .values({
              key,
              value: JSON.stringify(value),
              category: (category as NewSetting['category']) ?? 'general',
              description,
              updatedBy: session?.userId,
            })
            .returning()

          await createAuditLog({
            userId: session?.userId,
            branchId: session?.branchId,
            action: 'create',
            entityType: 'setting',
            entityId: newSetting.id,
            newValues: { key, value },
            description: `Created setting: ${key}`,
          })
        }

        return { success: true, message: 'Setting updated successfully' }
      } catch (error) {
        console.error('Update setting error:', error)
        return { success: false, message: 'Failed to update setting' }
      }
    }
  )

  ipcMain.handle('settings:update-bulk', async (_, updates: { key: string; value: unknown }[]) => {
    try {
      const session = getCurrentSession()

      for (const { key, value } of updates) {
        const existing = await db.query.settings.findFirst({
          where: eq(settings.key, key),
        })

        if (existing) {
          await db
            .update(settings)
            .set({
              value: JSON.stringify(value),
              updatedBy: session?.userId,
              updatedAt: new Date().toISOString(),
            })
            .where(eq(settings.key, key))
        }
      }

      await createAuditLog({
        userId: session?.userId,
        branchId: session?.branchId,
        action: 'update',
        entityType: 'setting',
        newValues: { updatedKeys: updates.map((u) => u.key) },
        description: `Bulk updated ${updates.length} settings`,
      })

      return { success: true, message: 'Settings updated successfully' }
    } catch (error) {
      console.error('Bulk update settings error:', error)
      return { success: false, message: 'Failed to update settings' }
    }
  })
}
