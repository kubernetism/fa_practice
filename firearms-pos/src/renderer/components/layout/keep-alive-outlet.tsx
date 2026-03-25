import React, { Suspense, lazy, useRef, useEffect, useMemo, useState, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import { PageLoader } from '@/components/ui/page-loader'
import { RefreshCw } from 'lucide-react'

// Lazy load all page components
const routeComponents: Record<string, React.LazyExoticComponent<React.ComponentType>> = {
  '/dashboard': lazy(() => import('@/screens/dashboard').then((m) => ({ default: m.DashboardScreen }))),
  '/pos': lazy(() => import('@/screens/pos').then((m) => ({ default: m.POSScreen }))),
  '/products': lazy(() => import('@/screens/products').then((m) => ({ default: m.ProductsScreen }))),
  '/services': lazy(() => import('@/screens/services').then((m) => ({ default: m.ServicesScreen }))),
  '/inventory': lazy(() => import('@/screens/inventory').then((m) => ({ default: m.InventoryScreen }))),
  '/sales': lazy(() => import('@/screens/sales').then((m) => ({ default: m.SalesHistoryScreen }))),
  '/online-transactions': lazy(() => import('@/screens/online-transactions').then((m) => ({ default: m.OnlineTransactionsScreen }))),
  '/purchases': lazy(() => import('@/screens/purchases').then((m) => ({ default: m.PurchasesScreen }))),
  '/returns': lazy(() => import('@/screens/returns').then((m) => ({ default: m.ReturnsScreen }))),
  '/customers': lazy(() => import('@/screens/customers').then((m) => ({ default: m.CustomersScreen }))),
  '/suppliers': lazy(() => import('@/screens/suppliers')),
  '/expenses': lazy(() => import('@/screens/expenses')),
  '/commissions': lazy(() => import('@/screens/commissions')),
  '/users': lazy(() => import('@/screens/users')),
  '/branches': lazy(() => import('@/screens/branches')),
  '/reports': lazy(() => import('@/screens/reports')),
  '/audit-reports': lazy(() => import('@/screens/reports/audit-reports')),
  '/referral-persons': lazy(() => import('@/screens/referral-persons')),
  '/receivables': lazy(() => import('@/screens/account-receivables').then((m) => ({ default: m.AccountReceivablesScreen }))),
  '/payables': lazy(() => import('@/screens/account-payables').then((m) => ({ default: m.AccountPayablesScreen }))),
  '/cash-register': lazy(() => import('@/screens/cash-register')),
  '/chart-of-accounts': lazy(() => import('@/screens/chart-of-accounts')),
  '/audit': lazy(() => import('@/screens/audit-logs').then((m) => ({ default: m.AuditLogsScreen }))),
  '/settings': lazy(() => import('@/screens/business-settings').then((m) => ({ default: m.BusinessSettingsScreen }))),
  '/database': lazy(() => import('@/screens/database-viewer').then((m) => ({ default: m.DatabaseViewerScreen }))),
  '/settings/license': lazy(() => import('@/screens/license-settings').then((m) => ({ default: m.LicenseSettingsScreen }))),
  '/settings/theme': lazy(() => import('@/screens/theme-settings').then((m) => ({ default: m.ThemeSettingsScreen }))),
  '/tax-collections': lazy(() => import('@/screens/tax-collections').then((m) => ({ default: m.TaxCollectionsScreen }))),
  '/categories-management': lazy(() => import('@/screens/categories-management').then((m) => ({ default: m.CategoriesManagementScreen }))),
  '/discount-management': lazy(() => import('@/screens/discount-management').then((m) => ({ default: m.DiscountManagementScreen }))),
  '/journals': lazy(() => import('@/screens/journals').then((m) => ({ default: m.JournalsScreen }))),
  '/vouchers': lazy(() => import('@/screens/vouchers').then((m) => ({ default: m.VouchersScreen }))),
  '/reversals': lazy(() => import('@/screens/reversals').then((m) => ({ default: m.ReversalsScreen }))),
  '/developer': lazy(() => import('@/screens/developer-info').then((m) => ({ default: m.DeveloperInfoScreen }))),
  '/guide': lazy(() => import('@/screens/guide').then((m) => ({ default: m.GuideScreen }))),
}

// Screens that should NOT auto-refresh (they have important in-progress state)
const NO_AUTO_REFRESH: Set<string> = new Set(['/pos', '/setup', '/dashboard'])

// Seconds before a screen's data is considered stale
const STALE_AFTER_SECONDS = 30

// Preload frequently used screens so they're ready before user clicks
const preloadImports = [
  () => import('@/screens/dashboard'),
  () => import('@/screens/pos'),
  () => import('@/screens/sales'),
]

function preloadRoutes() {
  preloadImports.forEach((load) => load().catch(() => {}))
}

/**
 * Staleness banner shown at the top of a screen when its data is stale.
 * Clicking "Refresh now" remounts the component to trigger fresh data fetching.
 */
function StalenessBanner({
  countdown,
  isStale,
  onRefresh,
}: {
  countdown: number | null
  isStale: boolean
  onRefresh: () => void
}) {
  if (countdown === null) return null

  if (isStale) {
    return (
      <div className="flex items-center justify-between rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 mb-3 mx-0">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-3.5 w-3.5 text-amber-400" />
          <span className="text-xs text-amber-400">
            Data may be outdated. Refresh to see latest changes.
          </span>
        </div>
        <button
          onClick={onRefresh}
          className="text-xs font-medium text-amber-400 hover:text-amber-300 underline underline-offset-2"
        >
          Refresh now
        </button>
      </div>
    )
  }

  // Show subtle countdown when less than 10 seconds remain
  if (countdown <= 10) {
    return (
      <div className="flex items-center gap-2 rounded-md border border-muted-foreground/20 bg-muted/50 px-3 py-1 mb-3 mx-0">
        <RefreshCw className="h-3 w-3 text-muted-foreground animate-spin" />
        <span className="text-[10px] text-muted-foreground">
          Auto-refresh in {countdown}s
        </span>
      </div>
    )
  }

  return null
}

/**
 * KeepAliveOutlet keeps visited route components mounted in the DOM
 * using display:none instead of unmounting them. This preserves component
 * state and fetched data so switching tabs is instant.
 *
 * When a user navigates back to a previously visited screen:
 * - A staleness countdown starts (30s default)
 * - When stale, an amber banner appears with "Refresh now"
 * - Refreshing remounts the component, triggering its useEffect data fetches
 *
 * Screens in NO_AUTO_REFRESH (e.g. POS) are excluded to protect in-progress state.
 */
export function KeepAliveOutlet() {
  const location = useLocation()
  const currentPath = location.pathname
  const visitedRoutes = useRef<Set<string>>(new Set())
  const hasPreloaded = useRef(false)

  // Track when each route was last mounted (activated)
  const lastActivatedAt = useRef<Record<string, number>>({})
  // Version keys to force remount
  const [routeVersions, setRouteVersions] = useState<Record<string, number>>({})
  // Staleness tracking
  const [countdowns, setCountdowns] = useState<Record<string, number | null>>({})
  const [staleRoutes, setStaleRoutes] = useState<Set<string>>(new Set())
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const prevPath = useRef<string>('')

  // Preload common routes once on mount
  useEffect(() => {
    if (!hasPreloaded.current) {
      hasPreloaded.current = true
      const timer = setTimeout(preloadRoutes, 500)
      return () => clearTimeout(timer)
    }
  }, [])

  // Track visited routes
  if (routeComponents[currentPath]) {
    visitedRoutes.current.add(currentPath)
  }

  // When navigating to a route, record activation time and start countdown
  useEffect(() => {
    if (!routeComponents[currentPath]) return
    if (currentPath === prevPath.current) return

    prevPath.current = currentPath
    lastActivatedAt.current[currentPath] = Date.now()

    // Notify screens that they've become active (used by POS and other keep-alive screens)
    window.dispatchEvent(new CustomEvent('screen-activated', { detail: { path: currentPath } }))

    // Clear stale state for the current route
    setStaleRoutes((prev) => {
      const next = new Set(prev)
      next.delete(currentPath)
      return next
    })
    setCountdowns((prev) => ({ ...prev, [currentPath]: null }))
  }, [currentPath])

  // Countdown timer for the active screen
  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    if (!routeComponents[currentPath] || NO_AUTO_REFRESH.has(currentPath)) {
      return
    }

    const activatedAt = lastActivatedAt.current[currentPath]
    if (!activatedAt) return

    const tick = () => {
      const elapsed = Math.floor((Date.now() - activatedAt) / 1000)
      const remaining = STALE_AFTER_SECONDS - elapsed

      if (remaining <= 0) {
        setCountdowns((prev) => ({ ...prev, [currentPath]: 0 }))
        setStaleRoutes((prev) => new Set(prev).add(currentPath))
        if (timerRef.current) {
          clearInterval(timerRef.current)
          timerRef.current = null
        }
      } else {
        setCountdowns((prev) => ({ ...prev, [currentPath]: remaining }))
      }
    }

    tick()
    timerRef.current = setInterval(tick, 1000)

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
  }, [currentPath])

  const handleRefresh = useCallback((path: string) => {
    // Increment version key to force remount
    setRouteVersions((prev) => ({ ...prev, [path]: (prev[path] || 0) + 1 }))
    // Reset staleness
    lastActivatedAt.current[path] = Date.now()
    setStaleRoutes((prev) => {
      const next = new Set(prev)
      next.delete(path)
      return next
    })
    setCountdowns((prev) => ({ ...prev, [path]: null }))
  }, [])

  // Get the list of routes to render (all previously visited)
  const routesToRender = useMemo(() => {
    return Array.from(visitedRoutes.current)
  }, [currentPath]) // eslint-disable-line react-hooks/exhaustive-deps

  // If current path doesn't match any known route, show nothing
  if (!routeComponents[currentPath]) {
    return null
  }

  return (
    <>
      {routesToRender.map((path) => {
        const Component = routeComponents[path]
        const isActive = path === currentPath
        const version = routeVersions[path] || 0
        const showBanner = isActive && !NO_AUTO_REFRESH.has(path)

        return (
          <div
            key={path}
            style={{ display: isActive ? 'contents' : 'none' }}
          >
            {showBanner && (
              <StalenessBanner
                countdown={countdowns[path] ?? null}
                isStale={staleRoutes.has(path)}
                onRefresh={() => handleRefresh(path)}
              />
            )}
            <Suspense fallback={<PageLoader />}>
              <Component key={`${path}-v${version}`} />
            </Suspense>
          </div>
        )
      })}
    </>
  )
}
