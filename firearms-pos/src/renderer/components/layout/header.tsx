import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Clock, ChevronRight } from 'lucide-react'
import { TodosPanel } from '@/components/todos/todos-panel'
import { MessagesPanel } from '@/components/messages/messages-panel'
import { useAuth } from '@/contexts/auth-context'
import { useBranch } from '@/contexts/branch-context'
import { UserDropdownMenu } from '@/components/user/user-dropdown-menu'

// Map route paths to readable page names
const getPageName = (pathname: string): string => {
  const path = pathname.split('/')[1] || 'dashboard'
  const pageMap: Record<string, string> = {
    dashboard: 'Dashboard',
    pos: 'Point of Sale',
    products: 'Products',
    inventory: 'Inventory',
    sales: 'Sales History',
    purchases: 'Purchases',
    returns: 'Returns',
    customers: 'Customers',
    suppliers: 'Suppliers',
    expenses: 'Expenses',
    commissions: 'Commissions',
    users: 'Users',
    branches: 'Branches',
    reports: 'Reports',
    'pos-tabs': 'POS Tabs',
    'audit-reports': 'Audit Reports',
    'referral-persons': 'Referral Persons',
    receivables: 'Account Receivables',
    payables: 'Account Payables',
    'cash-register': 'Cash Register',
    'chart-of-accounts': 'Chart of Accounts',
    audit: 'Audit Logs',
    settings: 'Settings',
    database: 'Database Viewer',
  }
  return pageMap[path] || 'Dashboard'
}

export function Header() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const { currentBranch } = useBranch()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  // Update time every second
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

  const formatDateTime = (date: Date): string => {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    })
  }

  const pageName = getPageName(location.pathname)

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-6">
      <div className="flex items-center gap-2 text-sm">
        <Clock className="h-4 w-4 text-muted-foreground" />
        <span className="text-muted-foreground">{formatDateTime(currentTime)}</span>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
        <span className="font-medium">{currentBranch?.name || 'MAIN BRANCH'}</span>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
        <span className="text-primary font-medium">{pageName}</span>
      </div>

      <div className="flex items-center gap-4">
        {/* Messages */}
        <MessagesPanel />

        <TodosPanel />

        <div className="border-l pl-4">
          <UserDropdownMenu onShowToast={showToast} />
        </div>
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
