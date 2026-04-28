/**
 * Google OAuth 2.0 with PKCE over a loopback redirect.
 *
 * Designed for an Electron main process: we spin up a short-lived HTTP server
 * on 127.0.0.1, open the system browser to Google's consent screen, and wait
 * for Google to redirect back with an authorization code. The code is then
 * exchanged for tokens via a direct fetch — no SDK dependency, which keeps
 * the surface easy to mock in tests.
 *
 * The internal helpers (generatePkce, buildAuthorizeUrl, exchangeCode,
 * fetchUserinfo) are exported so tests can drive them directly without
 * having to fake the full loopback dance.
 */

import { createHash, randomBytes } from 'node:crypto'
import { type IncomingMessage, type Server, type ServerResponse, createServer } from 'node:http'
import { URL, URLSearchParams } from 'node:url'
import {
  AUTHORIZE_ENDPOINT,
  GOOGLE_CLIENT_ID,
  OAUTH_SCOPES,
  OAUTH_TIMEOUT_MS,
  TOKEN_ENDPOINT,
  USERINFO_ENDPOINT,
} from '../utils/oauth-config'

export interface OAuthResult {
  refreshToken: string
  accessToken: string
  email: string
  expiresAt: number // unix ms
}

export interface OAuthDeps {
  openExternal?: (url: string) => Promise<void>
  fetchImpl?: typeof fetch
  timeoutMs?: number
  port?: number // override port (test only)
}

interface TokenResponse {
  access_token: string
  refresh_token?: string
  expires_in: number
  token_type?: string
  scope?: string
  id_token?: string
}

interface UserinfoResponse {
  email: string
}

interface AuthorizeUrlParams {
  clientId: string
  redirectUri: string
  scopes: readonly string[]
  state: string
  codeChallenge: string
}

interface ExchangeCodeParams {
  code: string
  codeVerifier: string
  clientId: string
  redirectUri: string
  fetchImpl?: typeof fetch
}

interface FetchUserinfoParams {
  accessToken: string
  fetchImpl?: typeof fetch
}

/**
 * Generate a PKCE verifier (43+ char base64url-random) and the matching
 * SHA-256 challenge.
 */
export function generatePkce(): { verifier: string; challenge: string } {
  const verifier = randomBytes(32).toString('base64url')
  const challenge = createHash('sha256').update(verifier).digest('base64url')
  return { verifier, challenge }
}

/**
 * Compose the authorize URL including all PKCE + offline-access parameters.
 * `prompt=consent` is forced so we always receive a refresh_token, even on
 * re-auth.
 */
export function buildAuthorizeUrl(params: AuthorizeUrlParams): string {
  const url = new URL(AUTHORIZE_ENDPOINT)
  url.searchParams.set('client_id', params.clientId)
  url.searchParams.set('redirect_uri', params.redirectUri)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('scope', params.scopes.join(' '))
  url.searchParams.set('state', params.state)
  url.searchParams.set('code_challenge', params.codeChallenge)
  url.searchParams.set('code_challenge_method', 'S256')
  url.searchParams.set('access_type', 'offline')
  url.searchParams.set('prompt', 'consent')
  url.searchParams.set('include_granted_scopes', 'true')
  return url.toString()
}

/**
 * Exchange an authorization code for tokens. Throws if the response is
 * non-2xx so the caller can reject the outer flow.
 */
export async function exchangeCode(params: ExchangeCodeParams): Promise<TokenResponse> {
  const fetchImpl = params.fetchImpl ?? fetch
  const body = new URLSearchParams({
    code: params.code,
    code_verifier: params.codeVerifier,
    client_id: params.clientId,
    grant_type: 'authorization_code',
    redirect_uri: params.redirectUri,
  })

  const res = await fetchImpl(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Token exchange failed: HTTP ${res.status} ${text}`)
  }

  return (await res.json()) as TokenResponse
}

/**
 * Fetch the authenticated user's email via the userinfo endpoint.
 */
export async function fetchUserinfo(params: FetchUserinfoParams): Promise<UserinfoResponse> {
  const fetchImpl = params.fetchImpl ?? fetch
  const res = await fetchImpl(USERINFO_ENDPOINT, {
    headers: { Authorization: `Bearer ${params.accessToken}` },
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Userinfo fetch failed: HTTP ${res.status} ${text}`)
  }

  const data = (await res.json()) as { email?: string }
  if (!data.email) {
    throw new Error('Userinfo response missing email')
  }
  return { email: data.email }
}

/**
 * Default external-URL opener uses Electron's shell. Imported lazily so the
 * module can be loaded under plain Node (e.g. vitest) without dragging in
 * Electron.
 */
async function defaultOpenExternal(url: string): Promise<void> {
  const electron = await import('electron')
  await electron.shell.openExternal(url)
}

/**
 * Drive the full PKCE + loopback flow:
 *   1. Pick a port and start a one-shot HTTP server on 127.0.0.1.
 *   2. Open the consent screen in the user's browser.
 *   3. Wait for the redirect back to /callback (or time out).
 *   4. Exchange the code for tokens, then fetch the user's email.
 *
 * The server is closed in a finally block so we never leak a listener
 * regardless of which arm of the race wins.
 */
export async function startOAuthFlow(deps: OAuthDeps = {}): Promise<OAuthResult> {
  const fetchImpl = deps.fetchImpl ?? fetch
  const openExternal = deps.openExternal ?? defaultOpenExternal
  const timeoutMs = deps.timeoutMs ?? OAUTH_TIMEOUT_MS

  const state = randomBytes(32).toString('hex')
  const { verifier, challenge } = generatePkce()

  const { server, port } = await listenLoopback(deps.port)
  const redirectUri = `http://127.0.0.1:${port}/callback`

  let timeoutHandle: NodeJS.Timeout | undefined

  try {
    const codePromise = new Promise<string>((resolve, reject) => {
      server.on('request', (req: IncomingMessage, res: ServerResponse) => {
        // Only handle the callback path; everything else is 404.
        const reqUrl = new URL(req.url ?? '/', `http://127.0.0.1:${port}`)
        if (reqUrl.pathname !== '/callback') {
          res.statusCode = 404
          res.end('Not found')
          return
        }

        const params = reqUrl.searchParams
        const errParam = params.get('error')
        const stateParam = params.get('state')
        const codeParam = params.get('code')

        if (errParam) {
          res.statusCode = 400
          res.end(`OAuth error: ${errParam}`)
          reject(new Error(`OAuth error: ${errParam}`))
          return
        }
        if (stateParam !== state) {
          res.statusCode = 400
          res.end('State mismatch')
          reject(new Error('OAuth state mismatch'))
          return
        }
        if (!codeParam) {
          res.statusCode = 400
          res.end('Missing code')
          reject(new Error('OAuth response missing code'))
          return
        }

        res.statusCode = 200
        res.setHeader('Content-Type', 'text/html; charset=utf-8')
        res.end(
          '<!doctype html><html><head><meta charset="utf-8"><title>Sign-in complete</title></head><body style="font-family:sans-serif;padding:2rem"><h2>Sign-in complete</h2><p>You can close this window and return to the application.</p></body></html>',
        )
        resolve(codeParam)
      })
    })

    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutHandle = setTimeout(() => {
        reject(new Error(`OAuth flow timed out after ${timeoutMs}ms`))
      }, timeoutMs)
    })

    const authorizeUrl = buildAuthorizeUrl({
      clientId: GOOGLE_CLIENT_ID,
      redirectUri,
      scopes: OAUTH_SCOPES,
      state,
      codeChallenge: challenge,
    })

    await openExternal(authorizeUrl)

    const code = await Promise.race([codePromise, timeoutPromise])

    const tokens = await exchangeCode({
      code,
      codeVerifier: verifier,
      clientId: GOOGLE_CLIENT_ID,
      redirectUri,
      fetchImpl,
    })

    if (!tokens.refresh_token) {
      // We force prompt=consent, so a missing refresh_token is unexpected.
      throw new Error('Token response missing refresh_token')
    }

    const { email } = await fetchUserinfo({
      accessToken: tokens.access_token,
      fetchImpl,
    })

    return {
      refreshToken: tokens.refresh_token,
      accessToken: tokens.access_token,
      email,
      expiresAt: Date.now() + tokens.expires_in * 1000,
    }
  } finally {
    if (timeoutHandle) clearTimeout(timeoutHandle)
    await closeServer(server)
  }
}

/**
 * Bind an http.Server to 127.0.0.1. If `port` is omitted we let the OS pick
 * a free ephemeral port (which sits in the high range anyway on Linux/macOS).
 */
function listenLoopback(port?: number): Promise<{ server: Server; port: number }> {
  return new Promise((resolve, reject) => {
    const server = createServer()
    const onError = (err: Error): void => {
      server.removeListener('error', onError)
      reject(err)
    }
    server.once('error', onError)
    server.listen(port ?? 0, '127.0.0.1', () => {
      server.removeListener('error', onError)
      const addr = server.address()
      if (!addr || typeof addr === 'string') {
        reject(new Error('Failed to bind loopback server'))
        return
      }
      resolve({ server, port: addr.port })
    })
  })
}

function closeServer(server: Server): Promise<void> {
  return new Promise((resolve) => {
    server.close(() => resolve())
    // server.close only stops accepting new connections; force-close any
    // lingering keep-alive sockets so the test process can exit promptly.
    server.closeAllConnections?.()
  })
}
