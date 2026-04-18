import React, { Suspense, lazy, useRef, useEffect, useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import { PageLoader } from '@/components/ui/page-loader'
import { NO_REMOUNT_PATHS, useScreenRefresh } from '@/contexts/screen-refresh-context'

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
  '/payees': lazy(() => import('@/screens/payees')),
  '/expenses': lazy(() => import('@/screens/expenses')),
  '/commissions': lazy(() => import('@/screens/commissions')),
  '/users': lazy(() => import('@/screens/users')),
  '/branches': lazy(() => import('@/screens/branches')),
  '/reports': lazy(() => import('@/screens/reports')),
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
  '/firearm-attributes': lazy(() => import('@/screens/firearm-attributes')),
  '/reports/inventory-by-caliber': lazy(() => import('@/screens/reports/inventory-by-caliber')),
  '/reports/sales-by-make': lazy(() => import('@/screens/reports/sales-by-make')),
  '/reports/sales-by-model': lazy(() => import('@/screens/reports/sales-by-model')),
  '/reports/stock-by-supplier': lazy(() => import('@/screens/reports/stock-by-supplier')),
  '/discount-management': lazy(() => import('@/screens/discount-management').then((m) => ({ default: m.DiscountManagementScreen }))),
  '/journals': lazy(() => import('@/screens/journals').then((m) => ({ default: m.JournalsScreen }))),
  '/vouchers': lazy(() => import('@/screens/vouchers').then((m) => ({ default: m.VouchersScreen }))),
  '/reversals': lazy(() => import('@/screens/reversals').then((m) => ({ default: m.ReversalsScreen }))),
  '/developer': lazy(() => import('@/screens/developer-info').then((m) => ({ default: m.DeveloperInfoScreen }))),
  '/guide': lazy(() => import('@/screens/guide').then((m) => ({ default: m.GuideScreen }))),
}

const preloadImports = [
  () => import('@/screens/dashboard'),
  () => import('@/screens/pos'),
  () => import('@/screens/sales'),
]

function preloadRoutes() {
  preloadImports.forEach((load) => load().catch(() => {}))
}

/**
 * KeepAliveOutlet keeps visited route components mounted in the DOM using
 * display:none instead of unmounting. Switching back to a previously visited
 * tab is instant, and each tab activation forces a remount of remountable
 * screens (version bump) so their useEffect data fetches re-run — users
 * always see fresh data. Screens in NO_REMOUNT_PATHS (e.g. POS) preserve
 * state and refetch via the `screen-activated` event instead.
 */
export function KeepAliveOutlet() {
  const location = useLocation()
  const currentPath = location.pathname
  const visitedRoutes = useRef<Set<string>>(new Set())
  const hasPreloaded = useRef(false)
  const prevPath = useRef<string>('')
  const { getVersion, refresh } = useScreenRefresh()

  useEffect(() => {
    if (!hasPreloaded.current) {
      hasPreloaded.current = true
      const timer = setTimeout(preloadRoutes, 500)
      return () => clearTimeout(timer)
    }
  }, [])

  if (routeComponents[currentPath]) {
    visitedRoutes.current.add(currentPath)
  }

  // On every tab activation, trigger a fresh fetch:
  //   - remountable screens: bump version key → React unmounts/remounts → useEffect refetches
  //   - keep-state screens (POS): dispatch screen-activated → screen refetches in place
  useEffect(() => {
    if (!routeComponents[currentPath]) return
    if (currentPath === prevPath.current) return

    const isFirstVisit = prevPath.current === ''
    prevPath.current = currentPath

    if (isFirstVisit) {
      // First navigation after app load: the component is mounting for the
      // first time, so its own useEffect will fetch. Nothing to do here.
      return
    }

    refresh(currentPath)
  }, [currentPath, refresh])

  const routesToRender = useMemo(() => {
    return Array.from(visitedRoutes.current)
  }, [currentPath]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!routeComponents[currentPath]) {
    return null
  }

  return (
    <>
      {routesToRender.map((path) => {
        const Component = routeComponents[path]
        const isActive = path === currentPath
        const version = getVersion(path)
        const remountKey = NO_REMOUNT_PATHS.has(path) ? path : `${path}-v${version}`

        return (
          <div key={path} style={{ display: isActive ? 'contents' : 'none' }}>
            <Suspense fallback={<PageLoader />}>
              <Component key={remountKey} />
            </Suspense>
          </div>
        )
      })}
    </>
  )
}
