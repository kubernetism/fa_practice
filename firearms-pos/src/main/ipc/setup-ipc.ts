import { ipcMain } from 'electron'
import { getDatabase } from '../db'
import { applicationInfo } from '../db/schemas/application-info'
import { branches, type NewBranch } from '../db/schemas/branches'
import { businessSettings, type InsertBusinessSettings } from '../db/schemas/business_settings'
import { getMachineIdForDisplay } from '../utils/license'

export interface SetupData {
  business: {
    businessName: string
    businessRegistrationNo?: string
    businessType?: string
    businessAddress?: string
    businessCity?: string
    businessState?: string
    businessCountry?: string
    businessPostalCode?: string
    businessPhone?: string
    businessEmail?: string
    businessWebsite?: string
    businessLogo?: string
  }
  branch: {
    name: string
    code: string
    address?: string
    phone?: string
    email?: string
    licenseNumber?: string
  }
  taxCurrency: {
    currencyCode: string
    currencySymbol: string
    currencyPosition: string
    decimalPlaces: number
    taxName: string
    taxRate: number
    taxId?: string
  }
  operations: {
    workingDaysStart: string
    workingDaysEnd: string
    openingTime: string
    closingTime: string
    defaultPaymentMethod: string
    allowedPaymentMethods: string
    lowStockThreshold: number
    stockValuationMethod: string
  }
}

export function registerSetupHandlers(): void {
  const db = getDatabase()

  // Check if setup is needed (first run)
  ipcMain.handle('setup:check-first-run', async () => {
    console.log('[Setup IPC] check-first-run called')
    try {
      // Check if application_info record exists and setupCompleted is true
      console.log('[Setup IPC] Querying application_info table...')
      const appInfo = db.select().from(applicationInfo).limit(1).get()
      console.log('[Setup IPC] Query result:', appInfo ? 'record found' : 'no record')

      if (!appInfo) {
        console.log('[Setup IPC] No app info, setup needed')
        return { success: true, data: { needsSetup: true } }
      }

      const result = {
        success: true,
        data: {
          needsSetup: !appInfo.setupCompleted,
          installationDate: appInfo.installationDate,
        },
      }
      console.log('[Setup IPC] Returning:', result)
      return result
    } catch (error) {
      console.error('[Setup IPC] Check first run error:', error)
      return { success: false, message: 'Failed to check setup status' }
    }
  })

  // Complete setup - creates branch, business settings, and marks setup as complete
  ipcMain.handle('setup:complete', async (_, data: SetupData) => {
    try {
      const now = new Date().toISOString()
      const trialEndDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      const machineId = getMachineIdForDisplay()

      // Start transaction
      // 1. Create or update application_info
      let appInfo = db.select().from(applicationInfo).limit(1).get()

      if (!appInfo) {
        // Create new application info
        appInfo = db
          .insert(applicationInfo)
          .values({
            installationDate: now,
            firstRunDate: now,
            trialStartDate: now,
            trialEndDate,
            isLicensed: false,
            machineId,
            setupCompleted: true,
          })
          .returning()
          .get()
      } else {
        // Update existing
        db.update(applicationInfo)
          .set({
            setupCompleted: true,
            updatedAt: now,
          })
          .run()
      }

      // 2. Create main branch
      const branchData: NewBranch = {
        name: data.branch.name,
        code: data.branch.code.toUpperCase(),
        address: data.branch.address || data.business.businessAddress,
        phone: data.branch.phone || data.business.businessPhone,
        email: data.branch.email || data.business.businessEmail,
        licenseNumber: data.branch.licenseNumber,
        isActive: true,
        isMain: true,
      }

      const newBranch = db.insert(branches).values(branchData).returning().get()

      // 3. Create business settings linked to the branch
      const settingsData: InsertBusinessSettings = {
        branchId: newBranch.id,
        // Business Info
        businessName: data.business.businessName,
        businessRegistrationNo: data.business.businessRegistrationNo,
        businessType: data.business.businessType,
        businessAddress: data.business.businessAddress,
        businessCity: data.business.businessCity,
        businessState: data.business.businessState,
        businessCountry: data.business.businessCountry,
        businessPostalCode: data.business.businessPostalCode,
        businessPhone: data.business.businessPhone,
        businessEmail: data.business.businessEmail,
        businessWebsite: data.business.businessWebsite,
        businessLogo: data.business.businessLogo,
        // Tax & Currency
        currencyCode: data.taxCurrency.currencyCode,
        currencySymbol: data.taxCurrency.currencySymbol,
        currencyPosition: data.taxCurrency.currencyPosition,
        decimalPlaces: data.taxCurrency.decimalPlaces,
        taxName: data.taxCurrency.taxName,
        taxRate: data.taxCurrency.taxRate,
        taxId: data.taxCurrency.taxId,
        // Operations
        workingDaysStart: data.operations.workingDaysStart,
        workingDaysEnd: data.operations.workingDaysEnd,
        openingTime: data.operations.openingTime,
        closingTime: data.operations.closingTime,
        defaultPaymentMethod: data.operations.defaultPaymentMethod,
        allowedPaymentMethods: data.operations.allowedPaymentMethods,
        lowStockThreshold: data.operations.lowStockThreshold,
        stockValuationMethod: data.operations.stockValuationMethod,
        // Status
        isActive: true,
        isDefault: true,
      }

      const newSettings = db.insert(businessSettings).values(settingsData).returning().get()

      // 4. Also create global settings (branchId = null) with same data
      const globalSettingsData: InsertBusinessSettings = {
        ...settingsData,
        branchId: null,
        isDefault: true,
      }

      db.insert(businessSettings).values(globalSettingsData).run()

      console.log('[Setup] Completed successfully:', {
        branchId: newBranch.id,
        settingsId: newSettings.settingId,
      })

      return {
        success: true,
        data: {
          branch: newBranch,
          settings: newSettings,
        },
      }
    } catch (error) {
      console.error('Setup complete error:', error)
      return { success: false, message: 'Failed to complete setup' }
    }
  })

  // Generate branch code from business name
  ipcMain.handle('setup:generate-branch-code', async (_, businessName: string) => {
    try {
      // Generate a code from business name (first 3-4 letters uppercase)
      const words = businessName.trim().split(/\s+/)
      let code = ''

      if (words.length === 1) {
        code = words[0].substring(0, 4).toUpperCase()
      } else {
        // Take first letter of each word (up to 4)
        code = words
          .slice(0, 4)
          .map((w) => w[0])
          .join('')
          .toUpperCase()
      }

      // Add "01" suffix for main branch
      code = code + '01'

      // Check if code already exists and make it unique
      let finalCode = code
      let counter = 1
      while (true) {
        const existing = db.query.branches.findFirst({
          where: (b, { eq }) => eq(b.code, finalCode),
        })
        if (!existing) break
        counter++
        finalCode = code.slice(0, -2) + String(counter).padStart(2, '0')
      }

      return { success: true, data: finalCode }
    } catch (error) {
      console.error('Generate branch code error:', error)
      return { success: false, message: 'Failed to generate branch code' }
    }
  })
}
