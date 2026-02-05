'use client'

import { useAuth } from './use-auth'

export function useTenant() {
  const { tenantId } = useAuth()

  return {
    tenantId,
    isReady: tenantId != null,
  }
}
