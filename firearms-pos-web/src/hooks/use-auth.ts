'use client'

import { useSession } from 'next-auth/react'
import { checkPermission, hasMinimumRole } from '@/lib/auth/permissions'

export function useAuth() {
  const { data: session, status } = useSession()

  const isAuthenticated = status === 'authenticated'
  const isLoading = status === 'loading'

  const user = session?.user
  const tenantId = (session as any)?.tenantId as number | undefined
  const role = (session as any)?.role as string | undefined
  const branchId = (session as any)?.branchId as number | undefined
  const permissions = ((session as any)?.permissions as string[]) || []

  const can = (permission: string) => {
    if (role === 'admin') return true
    return checkPermission(permissions, permission)
  }

  const isAtLeast = (minimumRole: 'admin' | 'manager' | 'cashier') => {
    if (!role) return false
    return hasMinimumRole(role, minimumRole)
  }

  return {
    user,
    tenantId,
    role,
    branchId,
    permissions,
    isAuthenticated,
    isLoading,
    can,
    isAtLeast,
    isAdmin: role === 'admin',
    isManager: role === 'manager',
    isCashier: role === 'cashier',
  }
}
