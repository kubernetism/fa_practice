/**
 * OAuth configuration for Google Drive backup integration.
 *
 * Integrators must set GOOGLE_OAUTH_CLIENT_ID via the environment; we never
 * ship a real client ID in source. The fallback placeholder makes misuse
 * loudly visible instead of silently authenticating against a stale ID.
 */

export const GOOGLE_CLIENT_ID: string =
  process.env.GOOGLE_OAUTH_CLIENT_ID ?? '<set GOOGLE_OAUTH_CLIENT_ID>'

export const OAUTH_SCOPES: readonly string[] = [
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/userinfo.email',
]

export const LOOPBACK_PORT_MIN = 49152
export const LOOPBACK_PORT_MAX = 65535
export const OAUTH_TIMEOUT_MS = 5 * 60 * 1000

export const TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token'
export const USERINFO_ENDPOINT = 'https://www.googleapis.com/oauth2/v2/userinfo'
export const AUTHORIZE_ENDPOINT = 'https://accounts.google.com/o/oauth2/v2/auth'
