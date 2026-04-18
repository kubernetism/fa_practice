import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'

// Screens whose state must be preserved across tab switches.
// These receive a `screen-activated` event (see POS) and are responsible
// for refetching their own data without remounting.
export const NO_REMOUNT_PATHS: Set<string> = new Set(['/pos'])

type ScreenRefreshContextValue = {
  getVersion: (path: string) => number
  refresh: (path: string) => void
  refreshCurrent: () => void
  isRefreshing: boolean
}

const ScreenRefreshContext = createContext<ScreenRefreshContextValue | null>(null)

export function ScreenRefreshProvider({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const [versions, setVersions] = useState<Record<string, number>>({})
  const [isRefreshing, setIsRefreshing] = useState(false)
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const getVersion = useCallback((path: string) => versions[path] || 0, [versions])

  const refresh = useCallback((path: string) => {
    if (NO_REMOUNT_PATHS.has(path)) {
      // Keep-state screens: ask them to refetch via event instead of remount.
      window.dispatchEvent(new CustomEvent('screen-activated', { detail: { path } }))
    } else {
      setVersions((prev) => ({ ...prev, [path]: (prev[path] || 0) + 1 }))
    }
    setIsRefreshing(true)
    if (refreshTimer.current) clearTimeout(refreshTimer.current)
    refreshTimer.current = setTimeout(() => setIsRefreshing(false), 600)
  }, [])

  const refreshCurrent = useCallback(() => {
    refresh(location.pathname)
  }, [location.pathname, refresh])

  const value = useMemo(
    () => ({ getVersion, refresh, refreshCurrent, isRefreshing }),
    [getVersion, refresh, refreshCurrent, isRefreshing],
  )

  return <ScreenRefreshContext.Provider value={value}>{children}</ScreenRefreshContext.Provider>
}

export function useScreenRefresh() {
  const ctx = useContext(ScreenRefreshContext)
  if (!ctx) throw new Error('useScreenRefresh must be used within ScreenRefreshProvider')
  return ctx
}
