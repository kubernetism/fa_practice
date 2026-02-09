import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

const publicPaths = ['/login', '/signup', '/forgot-password', '/platform/login', '/api/auth', '/api/webhooks']

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow public paths
  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // Allow static assets
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Check authentication
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })

  // Platform routes — require isPlatformAdmin
  if (pathname.startsWith('/platform')) {
    if (!token || !token.isPlatformAdmin) {
      return NextResponse.redirect(new URL('/platform/login', request.url))
    }
    return NextResponse.next()
  }

  // Tenant routes — block platform admins (unless impersonating)
  if (!token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  if (token.isPlatformAdmin && !token.isImpersonating) {
    return NextResponse.redirect(new URL('/platform/dashboard', request.url))
  }

  // Pages allowed even when subscription is locked
  const billingAllowedPaths = ['/billing', '/support', '/api/auth', '/api/webhooks']
  const isOnBillingPath = billingAllowedPaths.some((p) => pathname.startsWith(p))

  const subscriptionStatus = token.subscriptionStatus as string | undefined

  // Check trial expiration — lock all operations after 15 days
  if (subscriptionStatus === 'trial' && token.trialEndsAt) {
    const trialEnd = new Date(token.trialEndsAt as string)
    if (new Date() > trialEnd && !isOnBillingPath) {
      return NextResponse.redirect(new URL('/billing?expired=trial', request.url))
    }
  }

  // Suspended / cancelled — lock all operations until payment
  if (
    (subscriptionStatus === 'suspended' || subscriptionStatus === 'cancelled') &&
    !isOnBillingPath
  ) {
    return NextResponse.redirect(new URL('/billing', request.url))
  }

  return NextResponse.next()
}
