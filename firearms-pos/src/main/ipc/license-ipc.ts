import { ipcMain } from 'electron'
import {
  getMachineId,
  getLicenseStatus,
  activateLicense,
  deactivateLicense,
} from '../utils/license'
import { createAuditLog } from '../utils/audit'
import { getCurrentSession } from './auth-ipc'

export function registerLicenseHandlers(): void {
  ipcMain.handle('license:get-machine-id', async () => {
    try {
      const machineId = getMachineId()
      return { success: true, data: machineId }
    } catch (error) {
      console.error('Get machine ID error:', error)
      return { success: false, message: 'Failed to get machine ID' }
    }
  })

  ipcMain.handle('license:get-status', async () => {
    try {
      const status = getLicenseStatus()
      return { success: true, data: status }
    } catch (error) {
      console.error('Get license status error:', error)
      return { success: false, message: 'Failed to get license status' }
    }
  })

  ipcMain.handle('license:activate', async (_, licenseKey: string) => {
    try {
      const session = getCurrentSession()
      const result = activateLicense(licenseKey)

      if (result.success) {
        await createAuditLog({
          userId: session?.userId,
          branchId: session?.branchId,
          action: 'create',
          entityType: 'setting',
          description: 'License activated',
        })
      }

      return result
    } catch (error) {
      console.error('Activate license error:', error)
      return { success: false, message: 'Failed to activate license' }
    }
  })

  ipcMain.handle('license:deactivate', async () => {
    try {
      const session = getCurrentSession()
      const result = deactivateLicense()

      if (result.success) {
        await createAuditLog({
          userId: session?.userId,
          branchId: session?.branchId,
          action: 'delete',
          entityType: 'setting',
          description: 'License deactivated',
        })
      }

      return result
    } catch (error) {
      console.error('Deactivate license error:', error)
      return { success: false, message: 'Failed to deactivate license' }
    }
  })
}
