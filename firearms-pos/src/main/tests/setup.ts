/**
 * Global test setup — rebuilds better-sqlite3 for system Node if needed.
 *
 * The Electron app uses native modules compiled for Electron's Node version.
 * Tests run under system Node, so we need the module compiled for our version.
 * After tests, run `npx electron-rebuild -f -w better-sqlite3` to restore Electron compat.
 */
import { execFileSync } from 'node:child_process'
import path from 'node:path'

export function setup() {
  const modulePath = path.resolve(__dirname, '../../../node_modules/better-sqlite3')
  try {
    require('better-sqlite3')
  } catch {
    console.log('[test-setup] Rebuilding better-sqlite3 for system Node...')
    execFileSync('npx', ['node-gyp', 'rebuild'], { cwd: modulePath, stdio: 'pipe' })
    console.log('[test-setup] Rebuild complete.')
  }
}
