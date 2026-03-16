#!/usr/bin/env node
/**
 * License Key Generator for Firearms POS
 *
 * Usage: node key.js <machine-id> <months>
 *
 * Generates a unique license key every time, even with the same inputs.
 * The key encodes the duration (months) and a random nonce, signed with HMAC.
 *
 * Key format (100 hex chars):
 *   nonce (32 hex) + months (4 hex) + hmac (64 hex)
 */

const crypto = require('node:crypto')

const LICENSE_SECRET = 'FIREARMS_POS_LICENSE_2024'

function generateLicenseKey(machineId, months) {
  // Validate inputs
  if (!machineId || typeof machineId !== 'string' || machineId.length < 8) {
    throw new Error('Invalid machine ID')
  }
  if (!Number.isInteger(months) || months < 1 || months > 9999) {
    throw new Error('Months must be an integer between 1 and 9999')
  }

  // Generate a random 16-byte nonce (32 hex chars) for uniqueness
  const nonce = crypto.randomBytes(16).toString('hex').toUpperCase()

  // Encode months as 4 hex characters (zero-padded)
  const monthsHex = months.toString(16).padStart(4, '0').toUpperCase()

  // Compute HMAC-SHA256 over the payload: machineId | months | nonce
  const payload = `${machineId}|${months}|${nonce}`
  const hmac = crypto.createHmac('sha256', LICENSE_SECRET).update(payload).digest('hex').toUpperCase()

  // Assemble key: nonce(32) + months(4) + hmac(64) = 100 hex chars
  return `${nonce}${monthsHex}${hmac}`
}

// --- CLI ---
const args = process.argv.slice(2)

if (args.length < 2) {
  console.log('Usage: node key.js <machine-id> <months>')
  console.log('')
  console.log('Arguments:')
  console.log('  machine-id   The machine ID from the application')
  console.log('  months       Subscription duration in months (e.g., 12 for 1 year)')
  console.log('')
  console.log('Example:')
  console.log('  node key.js ABC123DEF456 12')
  process.exit(1)
}

const machineId = args[0]
const months = parseInt(args[1], 10)

if (isNaN(months) || months < 1) {
  console.error('Error: months must be a positive integer')
  process.exit(1)
}

try {
  const key = generateLicenseKey(machineId, months)
  console.log('')
  console.log('=== Firearms POS License Key ===')
  console.log(`Machine ID: ${machineId.substring(0, 16)}...`)
  console.log(`Duration:   ${months} month(s)`)
  console.log(`Key:        ${key}`)
  console.log(`Key Length: ${key.length} characters`)
  console.log('')
} catch (err) {
  console.error(`Error: ${err.message}`)
  process.exit(1)
}
