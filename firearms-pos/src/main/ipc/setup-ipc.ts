import { ipcMain } from 'electron'
import { getDatabase, getRawDatabase } from '../db'
import { applicationInfo } from '../db/schemas/application-info'
import { branches, type NewBranch } from '../db/schemas/branches'
import { businessSettings, type InsertBusinessSettings } from '../db/schemas/business_settings'
import { users } from '../db/schemas/users'
import { eq } from 'drizzle-orm'
import { getMachineIdForDisplay } from '../utils/license'
import bcrypt from 'bcryptjs'

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
  adminAccount: {
    fullName: string
    username: string
    email: string
    phone: string
    password: string
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

      // Initialize setup checklist
      const initialChecklist = JSON.stringify({
        registerStaff: 'pending',
        addProducts: 'pending',
        configureOperations: 'pending',
        addSuppliers: 'pending',
        addServices: 'pending',
        addAssets: 'pending',
        addPurchases: 'pending',
        addExpenses: 'pending',
        addReceivables: 'pending',
        addPayables: 'pending',
        registerCustomers: 'pending',
        setCashInHand: 'pending',
        reviewBalanceSheet: 'pending',
        dismissed: false,
      })

      const rawDb = getRawDatabase()
      if (rawDb) {
        try {
          rawDb.exec('ALTER TABLE application_info ADD COLUMN setup_checklist_status TEXT')
        } catch {
          /* column may already exist */
        }
        rawDb.prepare('UPDATE application_info SET setup_checklist_status = ?').run(initialChecklist)
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

      // 3. Create or update admin user for the branch
      const hashedPassword = await bcrypt.hash(data.adminAccount.password, 12)
      const existingAdmin = await db.query.users.findFirst({
        where: (u, { eq }) => eq(u.username, data.adminAccount.username),
      })

      if (existingAdmin) {
        // Update existing admin with wizard-provided credentials (e.g. after hard reset)
        db.update(users)
          .set({
            password: hashedPassword,
            email: data.adminAccount.email || data.business.businessEmail || existingAdmin.email,
            fullName: data.adminAccount.fullName || existingAdmin.fullName,
            phone: data.adminAccount.phone || existingAdmin.phone,
            branchId: newBranch.id,
          })
          .where(eq(users.id, existingAdmin.id))
          .run()
        console.log('[Setup] Admin user updated for branch:', newBranch.id, 'userId:', existingAdmin.id)
      } else {
        const newAdmin = db
          .insert(users)
          .values({
            username: data.adminAccount.username,
            password: hashedPassword,
            email: data.adminAccount.email || data.business.businessEmail || 'admin@store.com',
            fullName: data.adminAccount.fullName,
            phone: data.adminAccount.phone || '',
            role: 'admin',
            permissions: ['*'],
            isActive: true,
            branchId: newBranch.id,
          })
          .returning()
          .get()
        console.log('[Setup] Admin user created for branch:', newBranch.id, 'userId:', newAdmin.id)
      }

      // 4. Create business settings linked to the branch
      const settingsData: InsertBusinessSettings = {
        branchId: newBranch.id,
        // Business Info (from wizard)
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
        // Tax & Currency (from wizard)
        currencyCode: data.taxCurrency.currencyCode,
        currencySymbol: data.taxCurrency.currencySymbol,
        currencyPosition: data.taxCurrency.currencyPosition,
        decimalPlaces: data.taxCurrency.decimalPlaces,
        taxName: data.taxCurrency.taxName,
        taxRate: data.taxCurrency.taxRate,
        taxId: data.taxCurrency.taxId,
        // Operations (defaults - configured in Phase 2)
        workingDaysStart: 'Monday',
        workingDaysEnd: 'Saturday',
        openingTime: '09:00',
        closingTime: '18:00',
        defaultPaymentMethod: 'Cash',
        allowedPaymentMethods: 'Cash,Card,Bank Transfer',
        lowStockThreshold: 10,
        stockValuationMethod: 'FIFO',
        // Status
        isActive: true,
        isDefault: true,
      }

      const newSettings = db.insert(businessSettings).values(settingsData).returning().get()

      // 5. Also create global settings (branchId = null) with same data
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

  // Get checklist status
  ipcMain.handle('setup:get-checklist-status', async () => {
    try {
      const rawDb = getRawDatabase()
      const row = rawDb.prepare('SELECT setup_checklist_status FROM application_info LIMIT 1').get() as { setup_checklist_status?: string } | undefined
      if (!row || !row.setup_checklist_status) {
        return { success: true, data: null }
      }
      return { success: true, data: JSON.parse(row.setup_checklist_status) }
    } catch (error) {
      console.error('[Setup IPC] Get checklist status error:', error)
      return { success: false, message: 'Failed to get checklist status' }
    }
  })

  // Update a checklist item
  ipcMain.handle('setup:update-checklist-item', async (_, item: string, status: string) => {
    try {
      const rawDb = getRawDatabase()
      const row = rawDb.prepare('SELECT setup_checklist_status FROM application_info LIMIT 1').get() as { setup_checklist_status?: string } | undefined
      if (!row || !row.setup_checklist_status) {
        return { success: false, message: 'No checklist found' }
      }
      const checklist = JSON.parse(row.setup_checklist_status)
      checklist[item] = status
      rawDb.prepare('UPDATE application_info SET setup_checklist_status = ?, updated_at = ?').run(
        JSON.stringify(checklist),
        new Date().toISOString()
      )
      return { success: true, data: checklist }
    } catch (error) {
      console.error('[Setup IPC] Update checklist item error:', error)
      return { success: false, message: 'Failed to update checklist item' }
    }
  })

  // Dismiss checklist
  ipcMain.handle('setup:dismiss-checklist', async () => {
    try {
      const rawDb = getRawDatabase()
      const row = rawDb.prepare('SELECT setup_checklist_status FROM application_info LIMIT 1').get() as { setup_checklist_status?: string } | undefined
      if (!row || !row.setup_checklist_status) {
        return { success: false, message: 'No checklist found' }
      }
      const checklist = JSON.parse(row.setup_checklist_status)
      checklist.dismissed = true
      rawDb.prepare('UPDATE application_info SET setup_checklist_status = ?, updated_at = ?').run(
        JSON.stringify(checklist),
        new Date().toISOString()
      )
      return { success: true }
    } catch (error) {
      console.error('[Setup IPC] Dismiss checklist error:', error)
      return { success: false, message: 'Failed to dismiss checklist' }
    }
  })

  // Refresh checklist - auto-detect completed items from database
  ipcMain.handle('setup:refresh-checklist', async () => {
    try {
      const rawDb = getRawDatabase()
      const row = rawDb.prepare('SELECT setup_checklist_status FROM application_info LIMIT 1').get() as { setup_checklist_status?: string } | undefined
      if (!row || !row.setup_checklist_status) {
        return { success: true, data: null }
      }

      const checklist = JSON.parse(row.setup_checklist_status)
      if (checklist.dismissed) {
        return { success: true, data: checklist }
      }

      // Auto-detect completed items by checking DB tables
      const userCount = rawDb.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number }
      if (userCount && userCount.count > 1) checklist.registerStaff = 'completed'

      const productCount = rawDb.prepare('SELECT COUNT(*) as count FROM products').get() as { count: number }
      if (productCount && productCount.count > 0) checklist.addProducts = 'completed'

      const supplierCount = rawDb.prepare('SELECT COUNT(*) as count FROM suppliers').get() as { count: number }
      if (supplierCount && supplierCount.count > 0) checklist.addSuppliers = 'completed'

      const serviceCount = rawDb.prepare('SELECT COUNT(*) as count FROM services').get() as { count: number }
      if (serviceCount && serviceCount.count > 0) checklist.addServices = 'completed'

      const purchaseCount = rawDb.prepare('SELECT COUNT(*) as count FROM purchases').get() as { count: number }
      if (purchaseCount && purchaseCount.count > 0) checklist.addPurchases = 'completed'

      const expenseCount = rawDb.prepare('SELECT COUNT(*) as count FROM expenses').get() as { count: number }
      if (expenseCount && expenseCount.count > 0) checklist.addExpenses = 'completed'

      const receivableCount = rawDb.prepare('SELECT COUNT(*) as count FROM account_receivables').get() as { count: number }
      if (receivableCount && receivableCount.count > 0) checklist.addReceivables = 'completed'

      const payableCount = rawDb.prepare('SELECT COUNT(*) as count FROM account_payables').get() as { count: number }
      if (payableCount && payableCount.count > 0) checklist.addPayables = 'completed'

      const customerCount = rawDb.prepare('SELECT COUNT(*) as count FROM customers').get() as { count: number }
      if (customerCount && customerCount.count > 0) checklist.registerCustomers = 'completed'

      // Save updated checklist
      rawDb.prepare('UPDATE application_info SET setup_checklist_status = ?, updated_at = ?').run(
        JSON.stringify(checklist),
        new Date().toISOString()
      )

      return { success: true, data: checklist }
    } catch (error) {
      console.error('[Setup IPC] Refresh checklist error:', error)
      return { success: false, message: 'Failed to refresh checklist' }
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
