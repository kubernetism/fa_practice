import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Clock, ChevronRight, MapPin, Dot, RefreshCw } from 'lucide-react'
import { TodosPanel } from '@/components/todos/todos-panel'
import { MessagesPanel } from '@/components/messages/messages-panel'
import { useAuth } from '@/contexts/auth-context'
import { useBranch } from '@/contexts/branch-context'
import { useScreenRefresh } from '@/contexts/screen-refresh-context'
import { UserDropdownMenu } from '@/components/user/user-dropdown-menu'

// Map route paths to readable page names
const getPageName = (pathname: string): string => {
  const path = pathname.split('/')[1] || 'dashboard'
  const pageMap: Record<string, string> = {
    dashboard: 'Dashboard',
    pos: 'Point of Sale',
    products: 'Products',
    services: 'Services',
    'categories-management': 'Categories',
    'firearm-attributes': 'Firearm Attributes',
    inventory: 'Inventory',
    sales: 'Sales History',
    purchases: 'Purchases',
    returns: 'Returns',
    customers: 'Customers',
    suppliers: 'Suppliers',
    expenses: 'Expenses',
    commissions: 'Commissions',
    'referral-persons': 'Referral Persons',
    receivables: 'Account Receivables',
    payables: 'Account Payables',
    vouchers: 'Vouchers',
    'cash-register': 'Cash Register',
    'chart-of-accounts': 'Chart of Accounts',
    journals: 'Journals',
    'tax-collections': 'Tax Collections',
    'discount-management': 'Discounts',
    reversals: 'Reversal Requests',
    users: 'Users',
    branches: 'Branches',
    reports: 'Reports',
    audit: 'Activity Logs',
    settings: 'Settings',
    database: 'Database Viewer',
    developer: 'Developer Info',
  }
  return pageMap[path] || 'Dashboard'
}

// Sub-page name for nested routes like /settings/license
const getSubPageName = (pathname: string): string | null => {
  const parts = pathname.split('/').filter(Boolean)
  if (parts.length >= 2) {
    const subPageMap: Record<string, string> = {
      license: 'License Settings',
    }
    return subPageMap[parts[1]] || null
  }
  return null
}

export function Header() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const { currentBranch } = useBranch()
  const { refreshCurrent, isRefreshing } = useScreenRefresh()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    })
  }

  const pageName = getPageName(location.pathname)
  const subPageName = getSubPageName(location.pathname)

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card/80 backdrop-blur-sm px-5">
      {/* Left: Breadcrumb Navigation */}
      <div className="flex items-center gap-1.5 text-sm min-w-0">
        {/* Date/Time pill */}
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Clock className="h-3.5 w-3.5 shrink-0" />
          <span className="text-xs tabular-nums hidden lg:inline">{formatDate(currentTime)},</span>
          <span className="text-xs tabular-nums font-medium">{formatTime(currentTime)}</span>
        </div>

        {/* Breadcrumb separator */}
        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0 mx-0.5" />

        {/* Branch */}
        <div className="flex items-center gap-1 text-muted-foreground">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="text-xs font-medium truncate max-w-[140px]">
            {currentBranch?.name || 'Main Branch'}
          </span>
        </div>

        {/* Page name */}
        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0 mx-0.5" />
        <span className="text-xs font-semibold text-foreground truncate">
          {pageName}
        </span>

        {/* Sub-page */}
        {subPageName && (
          <>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0 mx-0.5" />
            <span className="text-xs font-semibold text-primary truncate">
              {subPageName}
            </span>
          </>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={refreshCurrent}
          disabled={isRefreshing}
          aria-label="Refresh current page"
          title="Refresh current page"
          className="inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-background/40 px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-60"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh</span>
        </button>

        <MessagesPanel />
        <TodosPanel />

        {/* Subtle divider */}
        <div className="h-6 w-px bg-border mx-1.5" />

        <UserDropdownMenu onShowToast={showToast} />
      </div>

      {/* Toast notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-top-2">
          <div
            className={`rounded-lg border px-4 py-3 shadow-lg ${
              toast.type === 'success'
                ? 'border-green-200 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-950 dark:text-green-100'
                : 'border-red-200 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100'
            }`}
          >
            <p className="text-sm font-medium">{toast.message}</p>
          </div>
        </div>
      )}
    </header>
  )
}
