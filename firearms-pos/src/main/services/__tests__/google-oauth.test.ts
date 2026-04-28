// Tests focus on the pure helpers; we skip the full loopback E2E test because
// faking the browser redirect cleanly inside a unit test adds more complexity
// than it gains. The helpers cover the load-bearing logic.

import { createHash } from 'node:crypto'
import { describe, expect, it, vi } from 'vitest'
import { buildAuthorizeUrl, exchangeCode, fetchUserinfo, generatePkce } from '../google-oauth'

interface MockResponseSpec {
  ok?: boolean
  status?: number
  json: () => unknown
  text?: () => Promise<string>
}

function mockFetch(responses: MockResponseSpec[]): typeof fetch {
  let i = 0
  // biome-ignore lint/suspicious/noExplicitAny: test mock needs a permissive signature
  return ((..._args: any[]) => {
    const r = responses[i++]
    if (!r) throw new Error('mockFetch: no more responses queued')
    return Promise.resolve({
      ok: r.ok ?? true,
      status: r.status ?? 200,
      json: async () => r.json(),
      text: r.text ?? (async () => JSON.stringify(r.json())),
      // biome-ignore lint/suspicious/noExplicitAny: minimal Response shape for our callers
    } as any)
  }) as typeof fetch
}

describe('generatePkce', () => {
  it('returns a verifier of at least 43 chars and a matching SHA-256 challenge', () => {
    const { verifier, challenge } = generatePkce()
    expect(verifier.length).toBeGreaterThanOrEqual(43)
    // verifier is base64url — only [A-Za-z0-9_-]
    expect(verifier).toMatch(/^[A-Za-z0-9_-]+$/)

    const expected = createHash('sha256').update(verifier).digest('base64url')
    expect(challenge).toBe(expected)
  })

  it('produces unique verifiers across calls', () => {
    const a = generatePkce()
    const b = generatePkce()
    expect(a.verifier).not.toBe(b.verifier)
  })
})

describe('buildAuthorizeUrl', () => {
  it('includes all required PKCE + offline-access params', () => {
    const url = buildAuthorizeUrl({
      clientId: 'cid.apps.googleusercontent.com',
      redirectUri: 'http://127.0.0.1:54321/callback',
      scopes: ['https://example.com/a', 'https://example.com/b'],
      state: 'abc123',
      codeChallenge: 'challenge-xyz',
    })

    const parsed = new URL(url)
    expect(parsed.origin + parsed.pathname).toBe('https://accounts.google.com/o/oauth2/v2/auth')

    const q = parsed.searchParams
    expect(q.get('client_id')).toBe('cid.apps.googleusercontent.com')
    expect(q.get('redirect_uri')).toBe('http://127.0.0.1:54321/callback')
    expect(q.get('response_type')).toBe('code')
    expect(q.get('scope')).toBe('https://example.com/a https://example.com/b')
    expect(q.get('state')).toBe('abc123')
    expect(q.get('code_challenge')).toBe('challenge-xyz')
    expect(q.get('code_challenge_method')).toBe('S256')
    expect(q.get('access_type')).toBe('offline')
    expect(q.get('prompt')).toBe('consent')
    expect(q.get('include_granted_scopes')).toBe('true')
  })
})

describe('exchangeCode', () => {
  it('POSTs form-encoded params to the token endpoint and returns parsed JSON', async () => {
    const captured: { url?: string; init?: RequestInit } = {}
    const fakeJson = {
      access_token: 'AT',
      refresh_token: 'RT',
      expires_in: 3600,
      token_type: 'Bearer',
    }
    // biome-ignore lint/suspicious/noExplicitAny: capture-and-forward fetch shim
    const fetchImpl = ((url: any, init: any) => {
      captured.url = String(url)
      captured.init = init
      return Promise.resolve({
        ok: true,
        status: 200,
        json: async () => fakeJson,
        text: async () => JSON.stringify(fakeJson),
        // biome-ignore lint/suspicious/noExplicitAny: minimal Response shape
      } as any)
    }) as typeof fetch

    const result = await exchangeCode({
      code: 'CODE',
      codeVerifier: 'VER',
      clientId: 'CID',
      redirectUri: 'http://127.0.0.1:1234/callback',
      fetchImpl,
    })

    expect(captured.url).toBe('https://oauth2.googleapis.com/token')
    expect(captured.init?.method).toBe('POST')
    const headers = captured.init?.headers as Record<string, string>
    expect(headers['Content-Type']).toBe('application/x-www-form-urlencoded')

    const body = new URLSearchParams(String(captured.init?.body))
    expect(body.get('code')).toBe('CODE')
    expect(body.get('code_verifier')).toBe('VER')
    expect(body.get('client_id')).toBe('CID')
    expect(body.get('grant_type')).toBe('authorization_code')
    expect(body.get('redirect_uri')).toBe('http://127.0.0.1:1234/callback')

    expect(result).toEqual(fakeJson)
  })

  it('rejects when the token endpoint responds non-2xx', async () => {
    const fetchImpl = mockFetch([
      {
        ok: false,
        status: 400,
        json: () => ({ error: 'invalid_grant' }),
        text: async () => '{"error":"invalid_grant"}',
      },
    ])

    await expect(
      exchangeCode({
        code: 'BAD',
        codeVerifier: 'V',
        clientId: 'CID',
        redirectUri: 'http://127.0.0.1:1234/callback',
        fetchImpl,
      }),
    ).rejects.toThrow(/Token exchange failed/)
  })
})

describe('fetchUserinfo', () => {
  it('returns the email parsed from the userinfo response', async () => {
    const fetchImpl = mockFetch([
      { json: () => ({ email: 'user@example.com', verified_email: true }) },
    ])

    const result = await fetchUserinfo({
      accessToken: 'AT',
      fetchImpl,
    })

    expect(result).toEqual({ email: 'user@example.com' })
  })

  it('sends the access token as a Bearer Authorization header', async () => {
    const seen = vi.fn()
    // biome-ignore lint/suspicious/noExplicitAny: capture fetch
    const fetchImpl = ((url: any, init: any) => {
      seen(url, init)
      return Promise.resolve({
        ok: true,
        status: 200,
        json: async () => ({ email: 'a@b.c' }),
        text: async () => '{"email":"a@b.c"}',
        // biome-ignore lint/suspicious/noExplicitAny: minimal Response shape
      } as any)
    }) as typeof fetch

    await fetchUserinfo({ accessToken: 'TOKEN-123', fetchImpl })

    const [, init] = seen.mock.calls[0]
    const headers = init.headers as Record<string, string>
    expect(headers.Authorization).toBe('Bearer TOKEN-123')
  })

  it('rejects when the response omits an email', async () => {
    const fetchImpl = mockFetch([{ json: () => ({}) }])
    await expect(fetchUserinfo({ accessToken: 'AT', fetchImpl })).rejects.toThrow(/missing email/)
  })
})
