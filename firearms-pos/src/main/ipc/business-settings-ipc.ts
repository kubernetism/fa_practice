import { ipcMain } from 'electron'
import { eq, and, isNull, desc } from 'drizzle-orm'
import { getDatabase } from '../db'
import { businessSettings, branches, users } from '../db/schema'
import { createAuditLog } from '../utils/audit'
import { getCurrentSession } from './auth-ipc'

interface SessionData {
  userId: number
  username: string
  role: string
  branchId: number | null
}

// Verify admin role
async function verifyAdmin(userId: number): Promise<boolean> {
  try {
    const db = getDatabase()
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    })
    const isAdmin = user?.role?.toLowerCase() === 'admin'
    console.log('[verifyAdmin] User:', userId, 'Role:', user?.role, 'IsAdmin:', isAdmin)
    return isAdmin
  } catch (err) {
    console.error('[verifyAdmin] Error:', err)
    return false
  }
}

// Get current session helper
function getSession(): SessionData | null {
  const session = getCurrentSession()
  if (!session) return null
  return {
    userId: session.userId,
    username: session.username,
    role: session.role,
    branchId: session.branchId,
  }
}

export function registerBusinessSettingsHandlers(): void {
  const db = getDatabase()

  // Get global (default) settings
  ipcMain.handle('business-settings:get-global', async () => {
    try {
      const result = await db.query.businessSettings.findFirst({
        where: isNull(businessSettings.branchId),
        orderBy: [desc(businessSettings.settingId)],
      })

      console.log('[get-global] Result:', result ? `found - ${result.businessName}` : 'not found')

      if (!result) {
        // Create default global settings if not exists
        const defaultSettings = {
          branchId: null,
          businessName: 'Firearms Retail POS',
          businessAddress: '',
          businessCity: '',
          businessState: '',
          businessCountry: 'Pakistan',
          businessPostalCode: '',
          businessPhone: '',
          businessEmail: '',
          businessWebsite: '',
          taxRate: 0,
          taxName: 'GST',
          isTaxInclusive: false,
          secondaryTaxRate: 0,
          currencySymbol: 'Rs.',
          currencyCode: 'PKR',
          currencyPosition: 'prefix',
          decimalPlaces: 2,
          thousandSeparator: ',',
          decimalSeparator: '.',
          invoicePrefix: 'INV',
          invoiceNumberFormat: 'sequential',
          invoiceStartingNumber: 1,
          showTaxOnReceipt: true,
          showQRCodeOnReceipt: false,
          lowStockThreshold: 10,
          enableStockTracking: true,
          allowNegativeStock: false,
          stockValuationMethod: 'FIFO',
          autoReorderEnabled: false,
          autoReorderQuantity: 50,
          defaultPaymentMethod: 'Cash',
          allowedPaymentMethods: 'Cash,Card,Bank Transfer,COD',
          enableCashDrawer: true,
          openingCashBalance: 0,
          enableDiscounts: true,
          maxDiscountPercentage: 50,
          requireCustomerForSale: false,
          enableCustomerLoyalty: false,
          loyaltyPointsRatio: 1,
          expenseCategories: 'Utilities,Rent,Salaries,Supplies,Maintenance,Other',
          expenseApprovalRequired: false,
          expenseApprovalLimit: 10000,
          enableReturns: true,
          returnWindowDays: 30,
          requireReceiptForReturn: true,
          refundMethod: 'Original Payment Method',
          enableEmailNotifications: false,
          lowStockNotifications: true,
          dailySalesReport: false,
          workingDaysStart: 'Monday',
          workingDaysEnd: 'Saturday',
          openingTime: '09:00',
          closingTime: '18:00',
          autoBackupEnabled: true,
          autoBackupFrequency: 'daily',
          backupRetentionDays: 30,
          dateFormat: 'DD/MM/YYYY',
          timeFormat: '24-hour',
          language: 'en',
          timezone: 'UTC',
          sessionTimeoutMinutes: 60,
          requirePasswordChange: false,
          passwordChangeIntervalDays: 90,
          enableAuditLogs: true,
          isActive: true,
          isDefault: true,
        }

        const [inserted] = await db
          .insert(businessSettings)
          .values(defaultSettings)
          .returning()

        console.log('[get-global] Created default settings:', inserted.businessName)
        return inserted
      }

      return result
    } catch (err) {
      console.error('Error fetching global settings:', err)
      throw err
    }
  })

  // Get settings for specific branch (with fallback to global)
  ipcMain.handle('business-settings:get-by-branch', async (_, branchId: number) => {
    try {
      // Get branch-specific settings
      const branchSettings = await db.query.businessSettings.findFirst({
        where: eq(businessSettings.branchId, branchId),
      })

      if (branchSettings) {
        return branchSettings
      }

      // Fallback to global settings
      const globalSettings = await db.query.businessSettings.findFirst({
        where: isNull(businessSettings.branchId),
        orderBy: [desc(businessSettings.settingId)],
      })

      return globalSettings
    } catch (err) {
      console.error('Error fetching branch settings:', err)
      throw err
    }
  })

  // Get all branch-specific settings (Admin Only)
  ipcMain.handle('business-settings:get-all', async (_, userId: number) => {
    try {
      console.log('[get-all] Requested by user:', userId)
      const isAdmin = await verifyAdmin(userId)
      console.log('[get-all] Is admin:', isAdmin)
      if (!isAdmin) {
        throw new Error('Unauthorized: Admin access required')
      }

      const allSettings = await db.query.businessSettings.findMany({
        orderBy: [desc(businessSettings.settingId)],
      })
      console.log('[get-all] Settings count:', allSettings.length)

      const branchesData = await db.query.branches.findMany({
        where: eq(branches.isActive, true),
      })

      // Map settings with branch details
      const result = allSettings.map((setting) => ({
        ...setting,
        branch: setting.branchId
          ? branchesData.find((b) => b.id === setting.branchId)
          : null,
      }))
      console.log('[get-all] Result:', result.length, 'settings')
      return result
    } catch (err) {
      console.error('Error fetching all settings:', err)
      throw err
    }
  })

  // Create new business settings (Admin Only)
  ipcMain.handle(
    'business-settings:create',
    async (_, { userId, settingsData }: { userId: number; settingsData: Partial<typeof businessSettings.$inferInsert> }) => {
      try {
        const isAdmin = await verifyAdmin(userId)
        if (!isAdmin) {
          throw new Error('Unauthorized: Admin access required')
        }

        const session = getSession()

        const [result] = await db
          .insert(businessSettings)
          .values({
            ...settingsData,
            createdBy: userId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          } as typeof businessSettings.$inferInsert)
          .returning()

        await createAuditLog({
          userId: session?.userId ?? userId,
          branchId: session?.branchId ?? null,
          action: 'create',
          entityType: 'business_settings',
          entityId: result.settingId,
          newValues: {
            businessName: settingsData.businessName,
            branchId: settingsData.branchId,
          },
          description: `Created business settings for ${settingsData.branchId ? `Branch ID: ${settingsData.branchId}` : 'Global'}`,
        })

        return result
      } catch (err) {
        console.error('Error creating business settings:', err)
        throw err
      }
    }
  )

  // Update business settings (Admin Only)
  ipcMain.handle(
    'business-settings:update',
    async (
      _,
      { userId, settingId, settingsData }: { userId: number; settingId: number; settingsData: Partial<typeof businessSettings.$inferInsert> }
    ) => {
      try {
        const isAdmin = await verifyAdmin(userId)
        if (!isAdmin) {
          throw new Error('Unauthorized: Admin access required')
        }

        const session = getSession()

        // Get old values for audit
        const oldSetting = await db.query.businessSettings.findFirst({
          where: eq(businessSettings.settingId, settingId),
        })

        const [result] = await db
          .update(businessSettings)
          .set({
            ...settingsData,
            updatedAt: new Date().toISOString(),
          } as typeof businessSettings.$inferInsert)
          .where(eq(businessSettings.settingId, settingId))
          .returning()

        await createAuditLog({
          userId: session?.userId ?? userId,
          branchId: session?.branchId ?? null,
          action: 'update',
          entityType: 'business_settings',
          entityId: settingId,
          oldValues: oldSetting ? { businessName: oldSetting.businessName } : null,
          newValues: { businessName: result.businessName },
          description: `Updated business settings for ${result.branchId ? `Branch ID: ${result.branchId}` : 'Global'}`,
        })

        return result
      } catch (err) {
        console.error('Error updating business settings:', err)
        throw err
      }
    }
  )

  // Delete business settings (Admin Only)
  ipcMain.handle('business-settings:delete', async (_, { userId, settingId }: { userId: number; settingId: number }) => {
    try {
      const isAdmin = await verifyAdmin(userId)
      if (!isAdmin) {
        throw new Error('Unauthorized: Admin access required')
      }

      const session = getSession()

      // Get setting before deletion
      const setting = await db.query.businessSettings.findFirst({
        where: eq(businessSettings.settingId, settingId),
      })

      // Prevent deleting global settings
      if (!setting?.branchId) {
        throw new Error('Cannot delete global settings')
      }

      const [result] = await db
        .delete(businessSettings)
        .where(eq(businessSettings.settingId, settingId))
        .returning()

      await createAuditLog({
        userId: session?.userId ?? userId,
        branchId: session?.branchId ?? null,
        action: 'delete',
        entityType: 'business_settings',
        entityId: settingId,
        oldValues: { businessName: setting?.businessName, branchId: setting?.branchId },
        description: `Deleted business settings for Branch ID: ${setting?.branchId}`,
      })

      return result
    } catch (err) {
      console.error('Error deleting business settings:', err)
      throw err
    }
  })

  // Clone settings from one branch to another (Admin Only)
  ipcMain.handle(
    'business-settings:clone',
    async (
      _,
      { userId, sourceBranchId, targetBranchId }: { userId: number; sourceBranchId: number | null; targetBranchId: number }
    ) => {
      try {
        const isAdmin = await verifyAdmin(userId)
        if (!isAdmin) {
          throw new Error('Unauthorized: Admin access required')
        }

        const session = getSession()

        // Get source settings
        const sourceSettings = await db.query.businessSettings.findFirst({
          where: sourceBranchId
            ? eq(businessSettings.branchId, sourceBranchId)
            : isNull(businessSettings.branchId),
          orderBy: [desc(businessSettings.settingId)],
        })

        if (!sourceSettings) {
          throw new Error('Source settings not found')
        }

        // Check if target already has settings
        const existingTarget = await db.query.businessSettings.findFirst({
          where: eq(businessSettings.branchId, targetBranchId),
        })

        if (existingTarget) {
          throw new Error('Target branch already has settings. Delete them first or update instead.')
        }

        // Remove internal fields
        const { settingId, branchId: sbId, createdBy, createdAt, updatedAt, ...clonedData } = sourceSettings

        const [result] = await db
          .insert(businessSettings)
          .values({
            ...clonedData,
            branchId: targetBranchId,
            createdBy: userId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          } as typeof businessSettings.$inferInsert)
          .returning()

        await createAuditLog({
          userId: session?.userId ?? userId,
          branchId: session?.branchId ?? null,
          action: 'create',
          entityType: 'business_settings',
          entityId: result.settingId,
          newValues: {
            businessName: result.businessName,
            sourceBranchId,
            targetBranchId,
          },
          description: `Cloned settings from ${sourceBranchId ? `Branch ${sourceBranchId}` : 'Global'} to Branch ${targetBranchId}`,
        })

        return result
      } catch (err) {
        console.error('Error cloning business settings:', err)
        throw err
      }
    }
  )

  // Export settings as JSON (Admin Only)
  ipcMain.handle('business-settings:export', async (_, userId: number) => {
    try {
      const isAdmin = await verifyAdmin(userId)
      if (!isAdmin) {
        throw new Error('Unauthorized: Admin access required')
      }

      const allSettings = await db.query.businessSettings.findMany({
        orderBy: [desc(businessSettings.settingId)],
      })

      return {
        exportDate: new Date().toISOString(),
        version: '1.0',
        settings: allSettings,
      }
    } catch (err) {
      console.error('Error exporting settings:', err)
      throw err
    }
  })

  // Import settings from JSON (Admin Only)
  ipcMain.handle('business-settings:import', async (_, { userId, data }: { userId: number; data: unknown }) => {
    try {
      const isAdmin = await verifyAdmin(userId)
      if (!isAdmin) {
        throw new Error('Unauthorized: Admin access required')
      }

      const session = getSession()
      const importData = data as { settings: Array<typeof businessSettings.$inferSelect> }

      if (!importData.settings || !Array.isArray(importData.settings)) {
        throw new Error('Invalid import data format')
      }

      const results = []

      for (const setting of importData.settings) {
        // Remove internal fields and add new metadata
        const { settingId, ...cleanData } = setting

        const [result] = await db
          .insert(businessSettings)
          .values({
            ...cleanData,
            createdBy: userId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          } as typeof businessSettings.$inferInsert)
          .returning()

        results.push(result)
      }

      await createAuditLog({
        userId: session?.userId ?? userId,
        branchId: session?.branchId ?? null,
        action: 'create',
        entityType: 'business_settings',
        newValues: { importedCount: results.length },
        description: `Imported ${results.length} business settings`,
      })

      return results
    } catch (err) {
      console.error('Error importing settings:', err)
      throw err
    }
  })
}
