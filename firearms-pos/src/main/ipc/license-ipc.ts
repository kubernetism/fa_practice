import { ipcMain, BrowserWindow } from 'electron'
import {
  getMachineId,
  getMachineIdForDisplay,
  generateLicenseKey,
  validateLicenseKey,
  getLicenseStatus,
  activateLicense,
  deactivateLicense,
  getLicenseInfo,
  LicenseStatus,
} from '../utils/license'
import { encryptDatabase, decryptDatabase, isDbEncrypted } from '../utils/db-cipher'
import { createAuditLog } from '../utils/audit'
import { getCurrentSession } from './auth-ipc'
import { getDatabase, getDbPath, closeDatabase as closeDatabaseFn, reinitializeDatabase, isDatabaseLocked, setDatabaseLocked } from '../db'
import { applicationInfo } from '../db/schemas/application-info'
import { eq, and } from 'drizzle-orm'
import { writeFileSync, existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { app } from 'electron'
import { isApplicationLocked, setApplicationLocked } from '../utils/app-lock-state'
import { registerAllHandlers } from './index'
import { runMigrations, seedInitialData } from '../db/migrate'

interface ExtendedLicenseStatus {
  status: LicenseStatus
  isValid: boolean
  isActivated: boolean
  isTrial: boolean
  machineId: string
  expiresAt: string | null
  daysRemaining: number
  message: string
  installationDate: string | null
  trialStartDate: string | null
  trialEndDate: string | null
  licenseStartDate: string | null
  licenseEndDate: string | null
}

function getLicenseFilePath(): string {
  return join(app.getPath('userData'), 'license.json')
}

function getApplicationInfoFromDb() {
  const db = getDatabase()
  return db.select().from(applicationInfo).limit(1).get()
}

function initializeApplicationInfo() {
  const db = getDatabase()
  const existingInfo = getApplicationInfoFromDb()

  if (existingInfo) {
    return existingInfo
  }

  const now = new Date().toISOString()
  const trialEndDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  const machineId = getMachineIdForDisplay()

  const newInfo = {
    installationDate: now,
    firstRunDate: now,
    trialStartDate: now,
    trialEndDate,
    isLicensed: false,
    machineId,
  }

  const result = db.insert(applicationInfo).values(newInfo).returning().get()
  return result
}

/**
 * Check if the trial or license has expired and lock the application if so.
 * This is called on app startup after DB init.
 * Returns true if the app should be locked.
 */
export function checkAndLockIfExpired(): boolean {
  try {
    const appInfo = initializeApplicationInfo()
    const licenseInfo = getLicenseInfo()
    const now = new Date()

    // Check if licensed
    if (appInfo.isLicensed && licenseInfo) {
      const licenseEnd = new Date(licenseInfo.licenseEndDate)
      if (licenseEnd < now) {
        // License expired - lock the app
        console.log('License expired - locking application and encrypting database')
        return true
      }
      // License is valid
      return false
    }

    // Check trial
    const trialEnd = new Date(appInfo.trialEndDate)
    if (trialEnd < now) {
      // Trial expired - lock the app
      console.log('Trial expired - locking application and encrypting database')
      return true
    }

    // Trial is still active
    return false
  } catch (error) {
    console.error('Error checking license status:', error)
    return false
  }
}

/**
 * Lock the application: encrypt the DB and set the locked flag.
 */
export function lockApplication(): { success: boolean; message: string } {
  const dbPath = getDbPath()

  // Close the database before encrypting
  closeDatabaseFn()

  // Encrypt the database
  const result = encryptDatabase(dbPath)
  if (!result.success) {
    return result
  }

  // Set locked flags
  setApplicationLocked(true)
  setDatabaseLocked(true)

  return { success: true, message: 'Application locked and database encrypted.' }
}

export function registerLicenseHandlers(): void {
  // Get machine ID
  ipcMain.handle('license:get-machine-id', async () => {
    try {
      const machineId = getMachineIdForDisplay()
      return { success: true, data: machineId }
    } catch (error) {
      console.error('Get machine ID error:', error)
      return { success: false, message: 'Failed to get machine ID' }
    }
  })

  // Generate license request key (for admin to copy)
  ipcMain.handle('license:generate-license-request', async () => {
    try {
      const machineId = getMachineIdForDisplay()
      const expectedLicenseKey = generateLicenseKey(machineId)
      return {
        success: true,
        data: {
          machineId,
          expectedLicenseKey,
          instructions: 'Run: node generate-license.js <machine_id>',
        },
      }
    } catch (error) {
      console.error('Generate license request error:', error)
      return { success: false, message: 'Failed to generate license request' }
    }
  })

  // Get extended application info with trial/license status
  ipcMain.handle('license:get-application-info', async () => {
    try {
      // If application is locked, return locked status without DB access
      if (isApplicationLocked()) {
        const machineId = getMachineIdForDisplay()
        const licenseInfo = getLicenseInfo()
        return {
          success: true,
          data: {
            status: licenseInfo ? 'LICENSE_EXPIRED' : 'TRIAL_EXPIRED',
            isValid: false,
            isActivated: !!licenseInfo,
            isTrial: !licenseInfo,
            machineId,
            expiresAt: null,
            daysRemaining: 0,
            message: 'Application is locked. Please enter a valid license key to unlock.',
            installationDate: null,
            trialStartDate: null,
            trialEndDate: null,
            licenseStartDate: licenseInfo?.licenseStartDate || null,
            licenseEndDate: licenseInfo?.licenseEndDate || null,
          } as ExtendedLicenseStatus,
        }
      }

      // Initialize application info if not exists
      const appInfo = initializeApplicationInfo()
      const machineId = getMachineIdForDisplay()
      const licenseInfo = getLicenseInfo()

      const now = new Date()
      const trialEnd = new Date(appInfo.trialEndDate)
      const trialDaysRemaining = Math.max(0, Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))

      // Determine status
      let status: LicenseStatus = 'TRIAL_ACTIVE'
      let isValid = true
      let isActivated = false
      let isTrial = true
      let daysRemaining = trialDaysRemaining
      let expiresAt: string | null = appInfo.trialEndDate
      let message = `Trial period: ${trialDaysRemaining} days remaining`

      if (appInfo.isLicensed && licenseInfo) {
        isActivated = true
        isTrial = false
        expiresAt = licenseInfo.licenseEndDate

        if (licenseInfo.licenseEndDate && new Date(licenseInfo.licenseEndDate) < now) {
          status = 'LICENSE_EXPIRED'
          isValid = false
          daysRemaining = 0
          message = 'License has expired. Please renew.'
        } else {
          status = 'LICENSE_ACTIVE'
          daysRemaining = Math.max(0, Math.ceil((new Date(licenseInfo.licenseEndDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
          message = `License active: ${daysRemaining} days remaining`
        }
      } else if (trialEnd < now) {
        status = 'TRIAL_EXPIRED'
        isValid = false
        daysRemaining = 0
        message = 'Trial period has expired. Please activate license.'
      }

      const extendedStatus: ExtendedLicenseStatus = {
        status,
        isValid,
        isActivated,
        isTrial,
        machineId,
        expiresAt,
        daysRemaining,
        message,
        installationDate: appInfo.installationDate,
        trialStartDate: appInfo.trialStartDate,
        trialEndDate: appInfo.trialEndDate,
        licenseStartDate: licenseInfo?.licenseStartDate || null,
        licenseEndDate: licenseInfo?.licenseEndDate || null,
      }

      return { success: true, data: extendedStatus }
    } catch (error) {
      console.error('Get application info error:', error)
      return { success: false, message: 'Failed to get application info' }
    }
  })

  // Get license status (simplified)
  ipcMain.handle('license:get-status', async () => {
    try {
      if (isApplicationLocked()) {
        return {
          success: true,
          data: {
            status: 'TRIAL_EXPIRED',
            isValid: false,
            isLocked: true,
            message: 'Application is locked.',
          },
        }
      }
      const status = getLicenseStatus()
      return { success: true, data: { ...status, isLocked: false } }
    } catch (error) {
      console.error('Get license status error:', error)
      return { success: false, message: 'Failed to get license status' }
    }
  })

  // Check lock status (always available, even when locked)
  ipcMain.handle('license:check-lock-status', async () => {
    try {
      const locked = isApplicationLocked()
      const machineId = getMachineIdForDisplay()
      const dbEncrypted = isDbEncrypted()
      return {
        success: true,
        data: {
          isLocked: locked,
          isDbEncrypted: dbEncrypted,
          machineId,
          message: locked
            ? 'Application is locked. Enter a valid license key to unlock.'
            : 'Application is unlocked.',
        },
      }
    } catch (error) {
      console.error('Check lock status error:', error)
      return { success: false, message: 'Failed to check lock status' }
    }
  })

  // Unlock application (decrypt DB, activate license, restore full functionality)
  ipcMain.handle('license:unlock-application', async (_, licenseKey: string) => {
    try {
      if (!isApplicationLocked()) {
        return { success: false, message: 'Application is not locked.' }
      }

      const machineId = getMachineIdForDisplay()

      // Validate the license key
      if (!validateLicenseKey(licenseKey, machineId)) {
        return { success: false, message: 'Invalid license key for this machine.' }
      }

      // Decrypt the database
      const dbPath = getDbPath()
      const decryptResult = decryptDatabase(dbPath)
      if (!decryptResult.success) {
        return { success: false, message: `Failed to decrypt database: ${decryptResult.message}` }
      }

      // Re-initialize the database
      reinitializeDatabase()

      // Run migrations and seed data in case any are pending
      await runMigrations()
      await seedInitialData()

      // Activate the license in the DB and file
      const activateResult = activateLicense(licenseKey)
      if (!activateResult.success) {
        return { success: false, message: `Database decrypted but license activation failed: ${activateResult.message}` }
      }

      // Update the application_info table
      const db = getDatabase()
      const now = new Date().toISOString()
      const licenseEndDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()

      db.update(applicationInfo)
        .set({
          isLicensed: true,
          licenseStartDate: now,
          licenseEndDate,
          licenseKey: licenseKey.toUpperCase(),
          updatedAt: now,
        })
        .where(eq(applicationInfo.infoId, 1))
        .run()

      // Register all IPC handlers now that the DB is available
      // (Only register the non-license handlers that weren't registered before)
      try {
        registerAllHandlers()
      } catch {
        // Handlers may already be registered if app started unlocked then locked
        console.log('Some handlers may already be registered')
      }

      // Unlock the application
      setApplicationLocked(false)
      setDatabaseLocked(false)

      // Notify the renderer to refresh
      const windows = BrowserWindow.getAllWindows()
      for (const win of windows) {
        win.webContents.send('license:application-unlocked')
      }

      console.log('Application unlocked successfully')
      return { success: true, message: 'Application unlocked successfully. License activated for 1 year.' }
    } catch (error) {
      console.error('Unlock application error:', error)
      return {
        success: false,
        message: `Failed to unlock application: ${error instanceof Error ? error.message : String(error)}`,
      }
    }
  })

  // Activate license
  ipcMain.handle('license:activate', async (_, licenseKey: string) => {
    try {
      // If locked, redirect to unlock flow
      if (isApplicationLocked()) {
        return ipcMain.emit('license:unlock-application', licenseKey)
      }

      const session = getCurrentSession()
      if (!session || session.role?.toLowerCase() !== 'admin') {
        return { success: false, message: 'Only administrators can activate licenses.' }
      }

      const result = activateLicense(licenseKey)

      if (result.success) {
        // Update database
        const db = getDatabase()
        const now = new Date().toISOString()
        const licenseEndDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()

        db.update(applicationInfo)
          .set({
            isLicensed: true,
            licenseStartDate: now,
            licenseEndDate,
            licenseKey: licenseKey.toUpperCase(),
            updatedAt: now,
          })
          .where(eq(applicationInfo.infoId, 1))
          .run()

        // Audit log
        await createAuditLog({
          userId: session.userId,
          branchId: session.branchId,
          action: 'create',
          entityType: 'license',
          description: `License activated. Key: ${licenseKey.substring(0, 8)}...`,
        })
      }

      return result
    } catch (error) {
      console.error('Activate license error:', error)
      return { success: false, message: 'Failed to activate license' }
    }
  })

  // Deactivate license
  ipcMain.handle('license:deactivate', async () => {
    try {
      const session = getCurrentSession()
      if (!session || session.role?.toLowerCase() !== 'admin') {
        return { success: false, message: 'Only administrators can deactivate licenses.' }
      }

      const result = deactivateLicense()

      if (result.success) {
        // Update database
        const db = getDatabase()
        const now = new Date().toISOString()

        db.update(applicationInfo)
          .set({
            isLicensed: false,
            licenseStartDate: null,
            licenseEndDate: null,
            licenseKey: null,
            updatedAt: now,
          })
          .where(eq(applicationInfo.infoId, 1))
          .run()

        // Audit log
        await createAuditLog({
          userId: session.userId,
          branchId: session.branchId,
          action: 'delete',
          entityType: 'license',
          description: 'License deactivated',
        })
      }

      return result
    } catch (error) {
      console.error('Deactivate license error:', error)
      return { success: false, message: 'Failed to deactivate license' }
    }
  })

  // Validate license key format without activating
  ipcMain.handle('license:validate-key', async (_, licenseKey: string) => {
    try {
      const machineId = getMachineIdForDisplay()
      const isValid = validateLicenseKey(licenseKey, machineId)
      // Accept both 32 and 64 character keys
      const isValidFormat = /^[A-F0-9]{32}$/.test(licenseKey.toUpperCase()) ||
                           /^[A-F0-9]{64}$/.test(licenseKey.toUpperCase())

      return {
        success: true,
        data: {
          isValid,
          isValidFormat,
          message: isValid
            ? 'License key is valid for this machine.'
            : isValidFormat
            ? 'License key format is valid but not for this machine.'
            : 'Invalid license key format.',
        },
      }
    } catch (error) {
      console.error('Validate license key error:', error)
      return { success: false, message: 'Failed to validate license key' }
    }
  })

  // Get license history (from license.json file)
  ipcMain.handle('license:get-history', async () => {
    try {
      const licenseInfo = getLicenseInfo()
      if (!licenseInfo) {
        return { success: true, data: [] }
      }

      const history = [
        {
          id: 1,
          type: 'FULL',
          status: licenseInfo.licenseEndDate && new Date(licenseInfo.licenseEndDate) > new Date() ? 'ACTIVE' : 'EXPIRED',
          activatedBy: 'Administrator',
          activatedAt: licenseInfo.licenseStartDate,
          expiresAt: licenseInfo.licenseEndDate,
        },
      ]

      return { success: true, data: history }
    } catch (error) {
      console.error('Get license history error:', error)
      return { success: false, message: 'Failed to get license history' }
    }
  })
}
