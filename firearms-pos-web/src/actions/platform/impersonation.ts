'use server'

import { cookies } from 'next/headers'
import { encode, decode } from 'next-auth/jwt'
import { db } from '@/lib/db'
import { tenants } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getPlatformAdmin } from '@/lib/auth/platform'

const secret = process.env.NEXTAUTH_SECRET!

function getSessionCookieName() {
  const isSecure = process.env.NODE_ENV === 'production'
  return isSecure ? '__Secure-authjs.session-token' : 'authjs.session-token'
}

export async function impersonateTenant(tenantId: number) {
  const session = await getPlatformAdmin()

  const [tenant] = await db
    .select()
    .from(tenants)
    .where(eq(tenants.id, tenantId))

  if (!tenant) return { success: false, message: 'Tenant not found' }

  const cookieStore = await cookies()
  const cookieName = getSessionCookieName()
  const sessionCookie = cookieStore.get(cookieName)?.value

  if (!sessionCookie) return { success: false, message: 'No active session' }

  // Backup the platform admin JWT
  cookieStore.set('platform-admin-backup', sessionCookie, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60, // 1 hour
  })

  // Decode current token — salt must match the cookie name
  const currentToken = await decode({ token: sessionCookie, secret, salt: cookieName })
  if (!currentToken) return { success: false, message: 'Invalid session' }

  const impersonationToken = await encode({
    token: {
      ...currentToken,
      tenantId: tenant.id,
      isPlatformAdmin: true,
      isImpersonating: true,
      impersonatedTenantName: tenant.name,
      role: 'admin',
      branchId: null,
      permissions: ['*'],
    },
    secret,
    salt: cookieName,
  })

  cookieStore.set(cookieName, impersonationToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  })

  return { success: true }
}

export async function exitImpersonation() {
  const cookieStore = await cookies()
  const backup = cookieStore.get('platform-admin-backup')?.value

  if (!backup) return { success: false, message: 'No backup session found' }

  const cookieName = getSessionCookieName()

  cookieStore.set(cookieName, backup, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  })

  cookieStore.delete('platform-admin-backup')

  return { success: true }
}
