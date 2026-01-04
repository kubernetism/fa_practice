#!/usr/bin/env node

/**
 * License Key Generator Script
 * Usage: node generate-license.js <machine_id>
 *
 * This script generates a license key for a given machine ID.
 * The machine ID can be obtained from the Application Licence Settings screen.
 */

const crypto = require('node:crypto')

const LICENSE_SECRET = 'FIREARMS_POS_LICENSE_2024'

function generateLicenseKey(machineId) {
  const hash = crypto.createHash('sha256')
  hash.update(`${machineId}|${LICENSE_SECRET}`)
  return hash.digest('hex').toUpperCase()
}

function main() {
  const args = process.argv.slice(2)

  if (args.length === 0) {
    console.log('\n🔑 License Key Generator\n')
    console.log('Usage: node generate-license.js <machine_id>\n')
    console.log('Arguments:')
    console.log('  machine_id    The machine ID from Application Licence Settings\n')
    console.log('Example:')
    console.log('  node generate-license.js ABCD1234EFGH5678IJKL9012MNOP3456\n')
    process.exit(0)
  }

  const machineId = args[0].trim().toUpperCase()

  // Validate machine ID format (should be 64 character hex string)
  if (!/^[A-F0-9]{64}$/.test(machineId)) {
    console.error('❌ Invalid machine ID format. Expected 64 character hex string.')
    console.error('   Make sure you copied the full machine ID from the application.')
    process.exit(1)
  }

  const licenseKey = generateLicenseKey(machineId)

  console.log('\n✅ Generated License Key:\n')
  console.log(`   Machine ID: ${machineId}`)
  console.log(`   License Key: ${licenseKey}\n`)
  console.log('   Copy the License Key and paste it in the Activate License dialog.\n')
}

main()
