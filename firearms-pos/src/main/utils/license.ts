import { createHash } from 'node:crypto'
import { networkInterfaces, cpus, hostname, platform } from 'node:os'
import { app } from 'electron'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

// Simple secret for license generation - change this for different license sets
const LICENSE_SECRET = 'FIREARMS_POS_LICENSE_2024'

export type LicenseStatus =
  | 'TRIAL_ACTIVE'
  | 'TRIAL_EXPIRED'
  | 'LICENSE_ACTIVE'
  | 'LICENSE_EXPIRED'
  | 'NO_MACHINE_ID'

interface LicenseData {
  machineId: string
  licenseKey: string
  licenseStartDate: string
  licenseEndDate: string
  isPermanent: boolean
  createdAt: string
  updatedAt: string
}

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
}

function getMachineId(): string {
  const components: string[] = []

  // Get MAC addresses
  const nets = networkInterfaces()
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      if (!net.internal && net.mac !== '00:00:00:00:00:00') {
        components.push(net.mac)
      }
    }
  }

  // Get CPU info
  const cpuInfo = cpus()
  if (cpuInfo.length > 0) {
    components.push(cpuInfo[0].model)
  }

  // Get hostname and platform
  components.push(hostname())
  components.push(platform())

  // Create hash
  const hash = createHash('sha256')
  hash.update(components.join('|'))
  return hash.digest('hex').toUpperCase()
}

// Generate license key from machine ID
export function generateLicenseKey(machineId: string): string {
  const hash = createHash('sha256')
  hash.update(`${machineId}|${LICENSE_SECRET}`)
  return hash.digest('hex').toUpperCase()
}

export { getMachineId }

export function getMachineIdForDisplay(): string {
  return getMachineId()
}

export function validateLicenseKey(licenseKey: string, machineId: string): boolean {
  const validKey = generateLicenseKey(machineId)
  return licenseKey.toUpperCase() === validKey.toUpperCase()
}

function getLicenseFilePath(): string {
  return join(app.getPath('userData'), 'license.json')
}

export function getLicenseStatus(): ExtendedLicenseStatus {
  const machineId = getMachineId()
  const licensePath = getLicenseFilePath()

  // Check if license file exists
  if (existsSync(licensePath)) {
    try {
      const licenseData: LicenseData = JSON.parse(readFileSync(licensePath, 'utf-8'))

      // Verify machine ID
      if (licenseData.machineId !== machineId) {
        return {
          status: 'NO_MACHINE_ID',
          isValid: false,
          isActivated: false,
          isTrial: false,
          machineId,
          expiresAt: null,
          daysRemaining: 0,
          message: 'License is not valid for this machine.',
          installationDate: null,
          trialStartDate: null,
          trialEndDate: null,
          licenseStartDate: null,
        }
      }

      // Check license expiry
      if (licenseData.licenseEndDate && new Date(licenseData.licenseEndDate) < new Date()) {
        return {
          status: 'LICENSE_EXPIRED',
          isValid: false,
          isActivated: true,
          isTrial: false,
          machineId,
          expiresAt: licenseData.licenseEndDate,
          daysRemaining: 0,
          message: 'License has expired. Please renew your license.',
          installationDate: null,
          trialStartDate: null,
          trialEndDate: null,
          licenseStartDate: licenseData.licenseStartDate,
        }
      }

      const daysRemaining = licenseData.licenseEndDate
        ? Math.max(0, Math.ceil((new Date(licenseData.licenseEndDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
        : 0

      return {
        status: 'LICENSE_ACTIVE',
        isValid: true,
        isActivated: true,
        isTrial: false,
        machineId,
        expiresAt: licenseData.licenseEndDate,
        daysRemaining,
        message: 'License is active and valid.',
        installationDate: null,
        trialStartDate: null,
        trialEndDate: null,
        licenseStartDate: licenseData.licenseStartDate,
      }
    } catch {
      // Continue to check application_info
    }
  }

  // Return trial status placeholder (actual status comes from application_info)
  return {
    status: 'TRIAL_ACTIVE',
    isValid: true,
    isActivated: false,
    isTrial: true,
    machineId,
    expiresAt: null,
    daysRemaining: 30,
    message: 'Trial period active.',
    installationDate: null,
    trialStartDate: null,
    trialEndDate: null,
    licenseStartDate: null,
  }
}

export function activateLicense(licenseKey: string): { success: boolean; message: string } {
  const machineId = getMachineId()
  const licensePath = getLicenseFilePath()

  // Validate license key matches this machine
  const validKey = generateLicenseKey(machineId)
  if (licenseKey.toUpperCase() !== validKey.toUpperCase()) {
    return { success: false, message: 'License key is not valid for this machine.' }
  }

  const licenseData: LicenseData = {
    machineId,
    licenseKey: licenseKey.toUpperCase(),
    licenseStartDate: new Date().toISOString(),
    licenseEndDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
    isPermanent: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  try {
    writeFileSync(licensePath, JSON.stringify(licenseData, null, 2))
    return { success: true, message: 'License activated successfully for 1 year.' }
  } catch {
    return { success: false, message: 'Failed to save license file.' }
  }
}

export function deactivateLicense(): { success: boolean; message: string } {
  const licensePath = getLicenseFilePath()

  if (!existsSync(licensePath)) {
    return { success: false, message: 'No license to deactivate.' }
  }

  try {
    const { unlinkSync } = require('node:fs')
    unlinkSync(licensePath)
    return { success: true, message: 'License deactivated successfully.' }
  } catch {
    return { success: false, message: 'Failed to deactivate license.' }
  }
}

export function getLicenseInfo(): LicenseData | null {
  const licensePath = getLicenseFilePath()

  if (!existsSync(licensePath)) {
    return null
  }

  try {
    return JSON.parse(readFileSync(licensePath, 'utf-8'))
  } catch {
    return null
  }
}
