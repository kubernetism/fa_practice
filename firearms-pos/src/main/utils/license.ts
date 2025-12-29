import { createHash } from 'node:crypto'
import { networkInterfaces, cpus, hostname } from 'node:os'
import { app } from 'electron'
import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

interface LicenseData {
  key: string
  machineId: string
  activatedAt: string
  expiresAt: string | null
  features: string[]
}

interface LicenseStatus {
  isValid: boolean
  isActivated: boolean
  expiresAt: string | null
  features: string[]
  message: string
}

export function getMachineId(): string {
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

  // Get hostname
  components.push(hostname())

  // Create hash
  const hash = createHash('sha256')
  hash.update(components.join('|'))
  return hash.digest('hex').substring(0, 32)
}

function getLicenseFilePath(): string {
  return join(app.getPath('userData'), 'license.json')
}

export function getLicenseStatus(): LicenseStatus {
  const licensePath = getLicenseFilePath()

  if (!existsSync(licensePath)) {
    return {
      isValid: false,
      isActivated: false,
      expiresAt: null,
      features: [],
      message: 'No license found. Please activate your license.',
    }
  }

  try {
    const licenseData: LicenseData = JSON.parse(readFileSync(licensePath, 'utf-8'))

    // Verify machine ID
    if (licenseData.machineId !== getMachineId()) {
      return {
        isValid: false,
        isActivated: false,
        expiresAt: null,
        features: [],
        message: 'License is not valid for this machine.',
      }
    }

    // Check expiry
    if (licenseData.expiresAt && new Date(licenseData.expiresAt) < new Date()) {
      return {
        isValid: false,
        isActivated: true,
        expiresAt: licenseData.expiresAt,
        features: licenseData.features,
        message: 'License has expired. Please renew your license.',
      }
    }

    return {
      isValid: true,
      isActivated: true,
      expiresAt: licenseData.expiresAt,
      features: licenseData.features,
      message: 'License is valid.',
    }
  } catch {
    return {
      isValid: false,
      isActivated: false,
      expiresAt: null,
      features: [],
      message: 'Failed to read license file.',
    }
  }
}

export function activateLicense(licenseKey: string): { success: boolean; message: string } {
  // In a real application, this would validate with a license server
  // For this demo, we'll use a simple validation

  // Simple license key format: XXXX-XXXX-XXXX-XXXX
  const keyPattern = /^[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/
  if (!keyPattern.test(licenseKey)) {
    return { success: false, message: 'Invalid license key format.' }
  }

  // Demo: Accept any properly formatted key
  const licenseData: LicenseData = {
    key: licenseKey,
    machineId: getMachineId(),
    activatedAt: new Date().toISOString(),
    expiresAt: null, // Perpetual license for demo
    features: ['pos', 'inventory', 'reports', 'multi-branch'],
  }

  try {
    writeFileSync(getLicenseFilePath(), JSON.stringify(licenseData, null, 2))
    return { success: true, message: 'License activated successfully.' }
  } catch {
    return { success: false, message: 'Failed to save license.' }
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
