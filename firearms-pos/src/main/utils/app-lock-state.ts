// Centralized application lock state.
// Extracted to avoid circular dependencies between ipc/index.ts and license-ipc.ts.

let applicationLocked = false

export function isApplicationLocked(): boolean {
  return applicationLocked
}

export function setApplicationLocked(locked: boolean): void {
  applicationLocked = locked
}

// Channels that are exempt from the lock guard (always allowed)
const EXEMPT_CHANNELS = new Set([
  'license:get-machine-id',
  'license:get-status',
  'license:get-application-info',
  'license:activate',
  'license:validate-key',
  'license:generate-license-request',
  'license:get-history',
  'license:check-lock-status',
  'license:unlock-application',
])

export function checkLockGuard(channel: string): { success: false; message: string } | null {
  if (!applicationLocked) return null
  if (EXEMPT_CHANNELS.has(channel)) return null
  return {
    success: false,
    message: 'Application is locked. Trial/License has expired. Please enter a valid license key to unlock.',
  }
}
