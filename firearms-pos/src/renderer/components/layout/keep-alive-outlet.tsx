import React, { Suspense, lazy, useRef, useEffect, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { PageLoader } from '@/components/ui/page-loader'

// Lazy load all page components
const routeComponents: Record<string, React.LazyExoticComponent<React.ComponentType>> = {
  '/dashboard': lazy(() => import('@/screens/dashboard').then((m) => ({ default: m.DashboardScreen }))),
  '/pos': lazy(() => import('@/screens/pos').then((m) => ({ default: m.POSScreen }))),
  '/products': lazy(() => import('@/screens/products').then((m) => ({ default: m.ProductsScreen }))),
  '/services': lazy(() => import('@/screens/services').then((m) => ({ default: m.ServicesScreen }))),
  '/inventory': lazy(() => import('@/screens/inventory').then((m) => ({ default: m.InventoryScreen }))),
  '/sales': lazy(() => import('@/screens/sales').then((m) => ({ default: m.SalesHistoryScreen }))),
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
}

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
 * KeepAliveOutlet keeps visited route components mounted in the DOM
 * using display:none instead of unmounting them. This preserves component
 * state and fetched data so switching tabs is instant.
 */
export function KeepAliveOutlet() {
  const location = useLocation()
  const currentPath = location.pathname
  const visitedRoutes = useRef<Set<string>>(new Set())
  const hasPreloaded = useRef(false)

  // Preload common routes once on mount
  useEffect(() => {
    if (!hasPreloaded.current) {
      hasPreloaded.current = true
      // Delay preloading slightly so current route loads first
      const timer = setTimeout(preloadRoutes, 500)
      return () => clearTimeout(timer)
    }
  }, [])

  // Track visited routes
  if (routeComponents[currentPath]) {
    visitedRoutes.current.add(currentPath)
  }

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
        return (
          <div
            key={path}
            style={{ display: isActive ? 'contents' : 'none' }}
          >
            <Suspense fallback={<PageLoader />}>
              <Component />
            </Suspense>
          </div>
        )
      })}
    </>
  )
}
