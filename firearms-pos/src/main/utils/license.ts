import { createHash, createHmac } from 'node:crypto'
import { networkInterfaces, cpus, hostname, platform } from 'node:os'
import { app } from 'electron'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

// Must match the secret in key.js
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
  durationMonths: number
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

export { getMachineId }

export function getMachineIdForDisplay(): string {
  return getMachineId()
}

/**
 * Parse a license key to extract its components.
 * Key format (100 hex chars): nonce(32) + months(4) + hmac(64)
 *
 * Also supports legacy 64-char keys for backward compatibility.
 */
function parseLicenseKey(licenseKey: string): { nonce: string; months: number; hmac: string } | null {
  const key = licenseKey.toUpperCase().replace(/\s/g, '')
  if (key.length !== 100) return null
  if (!/^[A-F0-9]{100}$/.test(key)) return null

  const nonce = key.substring(0, 32)
  const monthsHex = key.substring(32, 36)
  const hmac = key.substring(36, 100)

  const months = parseInt(monthsHex, 16)
  if (months < 1 || months > 9999) return null

  return { nonce, months, hmac }
}

/**
 * Validate a new-format license key (100 hex chars with HMAC).
 * Returns the duration in months if valid, or null if invalid.
 */
function validateNewFormatKey(licenseKey: string, machineId: string): number | null {
  const parsed = parseLicenseKey(licenseKey)
  if (!parsed) return null

  // Recompute the HMAC
  const payload = `${machineId}|${parsed.months}|${parsed.nonce}`
  const expectedHmac = createHmac('sha256', LICENSE_SECRET).update(payload).digest('hex').toUpperCase()

  if (parsed.hmac !== expectedHmac) return null

  return parsed.months
}

/**
 * Validate a legacy license key (64-char SHA256 hash).
 * Returns 12 months if valid (legacy keys were always annual).
 */
function validateLegacyKey(licenseKey: string, machineId: string): number | null {
  const key = licenseKey.toUpperCase().replace(/\s/g, '')
  if (key.length !== 64) return null

  const hash = createHash('sha256')
  hash.update(`${machineId}|${LICENSE_SECRET}`)
  const validKey = hash.digest('hex').toUpperCase()

  if (key !== validKey) return null

  return 12 // Legacy keys are always 12 months
}

/**
 * Validate a license key and extract its duration.
 * Supports both new-format (100 hex) and legacy (64 hex) keys.
 * Returns the duration in months if valid, or null if invalid.
 */
export function validateLicenseKeyWithDuration(licenseKey: string, machineId: string): number | null {
  // Try new format first
  const newResult = validateNewFormatKey(licenseKey, machineId)
  if (newResult !== null) return newResult

  // Fall back to legacy format
  return validateLegacyKey(licenseKey, machineId)
}

/**
 * Boolean validation for backward compatibility.
 */
export function validateLicenseKey(licenseKey: string, machineId: string): boolean {
  return validateLicenseKeyWithDuration(licenseKey, machineId) !== null
}

/**
 * Legacy key generation (kept for backward compatibility).
 * New keys should be generated with key.js instead.
 */
export function generateLicenseKey(machineId: string): string {
  const hash = createHash('sha256')
  hash.update(`${machineId}|${LICENSE_SECRET}`)
  return hash.digest('hex').toUpperCase()
}

// ── Used Keys Tracking ──────────────────────────────────────────────────────

function getUsedKeysFilePath(): string {
  return join(app.getPath('userData'), 'used-keys.json')
}

function getUsedKeys(): string[] {
  const filePath = getUsedKeysFilePath()
  if (!existsSync(filePath)) return []
  try {
    const data = JSON.parse(readFileSync(filePath, 'utf-8'))
    return Array.isArray(data) ? data : []
  } catch {
    return []
  }
}

function addUsedKey(licenseKey: string): void {
  const keys = getUsedKeys()
  const normalizedKey = licenseKey.toUpperCase().replace(/\s/g, '')
  if (!keys.includes(normalizedKey)) {
    keys.push(normalizedKey)
    writeFileSync(getUsedKeysFilePath(), JSON.stringify(keys, null, 2))
  }
}

export function isKeyAlreadyUsed(licenseKey: string): boolean {
  const keys = getUsedKeys()
  return keys.includes(licenseKey.toUpperCase().replace(/\s/g, ''))
}

// ── License File Operations ─────────────────────────────────────────────────

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

export function activateLicense(licenseKey: string): { success: boolean; message: string; durationMonths?: number } {
  const machineId = getMachineId()
  const licensePath = getLicenseFilePath()

  // Check if key has already been used
  if (isKeyAlreadyUsed(licenseKey)) {
    return { success: false, message: 'This license key has already been used. Each key can only be used once.' }
  }

  // Validate and extract duration
  const durationMonths = validateLicenseKeyWithDuration(licenseKey, machineId)
  if (durationMonths === null) {
    return { success: false, message: 'License key is not valid for this machine.' }
  }

  const now = new Date()
  const endDate = new Date(now)
  endDate.setMonth(endDate.getMonth() + durationMonths)

  const licenseData: LicenseData = {
    machineId,
    licenseKey: licenseKey.toUpperCase(),
    licenseStartDate: now.toISOString(),
    licenseEndDate: endDate.toISOString(),
    durationMonths,
    isPermanent: false,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  }

  try {
    writeFileSync(licensePath, JSON.stringify(licenseData, null, 2))
    // Mark this key as used so it cannot be reused
    addUsedKey(licenseKey)
    return {
      success: true,
      message: `License activated successfully for ${durationMonths} month(s).`,
      durationMonths,
    }
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
