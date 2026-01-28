import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Warehouse,
  Users,
  Truck,
  ArrowLeftRight,
  Receipt,
  DollarSign,
  UserCog,
  Building2,
  FileText,
  Settings,
  History,
  BadgePercent,
  Store,
  FileBarChart,
  ClipboardList,
  Database,
  Shield,
  Layers,
  Wallet,
  UserPlus,
  CreditCard,
  Landmark,
  Banknote,
  Percent,
  FolderTree,
  Tags,
  BookOpen,
  Wrench,
  Ticket,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAuth } from '@/contexts/auth-context'
import { ThemeToggle } from '@/components/theme'

type UserRole = 'admin' | 'manager' | 'cashier'

interface NavItem {
  title: string
  href: string
  icon: React.ElementType
  allowedRoles?: UserRole[]
}

// Cashier: Main only
// Manager: Main + Inventory + Management
// Admin: Everything

const mainNavItems: NavItem[] = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { title: 'Point of Sale', href: '/pos', icon: ShoppingCart },
  { title: 'POS Tabs', href: '/pos-tabs', icon: Layers },
  { title: 'Sales History', href: '/sales', icon: Receipt },
]

const inventoryNavItems: NavItem[] = [
  { title: 'Products', href: '/products', icon: Package, allowedRoles: ['admin', 'manager'] },
  { title: 'Services', href: '/services', icon: Wrench, allowedRoles: ['admin', 'manager'] },
  { title: 'Categories', href: '/categories-management', icon: FolderTree, allowedRoles: ['admin', 'manager'] },
  { title: 'Inventory', href: '/inventory', icon: Warehouse, allowedRoles: ['admin', 'manager'] },
  { title: 'Purchases', href: '/purchases', icon: Truck, allowedRoles: ['admin', 'manager'] },
  { title: 'Returns', href: '/returns', icon: ArrowLeftRight, allowedRoles: ['admin', 'manager'] },
]

const managementNavItems: NavItem[] = [
  { title: 'Customers', href: '/customers', icon: Users, allowedRoles: ['admin', 'manager'] },
  { title: 'Suppliers', href: '/suppliers', icon: Store, allowedRoles: ['admin', 'manager'] },
  { title: 'Expenses', href: '/expenses', icon: DollarSign, allowedRoles: ['admin', 'manager'] },
  { title: 'Commissions', href: '/commissions', icon: BadgePercent, allowedRoles: ['admin', 'manager'] },
  { title: 'Referral Persons', href: '/referral-persons', icon: UserPlus, allowedRoles: ['admin', 'manager'] },
  { title: 'Receivables', href: '/receivables', icon: Wallet, allowedRoles: ['admin', 'manager'] },
  { title: 'Payables', href: '/payables', icon: CreditCard, allowedRoles: ['admin', 'manager'] },
  { title: 'Vouchers', href: '/vouchers', icon: Ticket, allowedRoles: ['admin', 'manager'] },
]

const financeNavItems: NavItem[] = [
  { title: 'Cash Register', href: '/cash-register', icon: Banknote, allowedRoles: ['admin'] },
  { title: 'Chart of Accounts', href: '/chart-of-accounts', icon: Landmark, allowedRoles: ['admin'] },
  { title: 'Journals', href: '/journals', icon: BookOpen, allowedRoles: ['admin'] },
  { title: 'Tax Collections', href: '/tax-collections', icon: Percent, allowedRoles: ['admin'] },
  { title: 'Discounts', href: '/discount-management', icon: Tags, allowedRoles: ['admin', 'manager'] },
]

const adminNavItems: NavItem[] = [
  { title: 'Users', href: '/users', icon: UserCog, allowedRoles: ['admin'] },
  { title: 'Branches', href: '/branches', icon: Building2, allowedRoles: ['admin'] },
  { title: 'Reports', href: '/reports', icon: FileText, allowedRoles: ['admin'] },
  { title: 'Audit Reports', href: '/audit-reports', icon: FileBarChart, allowedRoles: ['admin'] },
  { title: 'Activity Logs', href: '/audit', icon: ClipboardList, allowedRoles: ['admin'] },
  { title: 'Settings', href: '/settings', icon: Settings, allowedRoles: ['admin'] },
  { title: 'Database Viewer', href: '/database', icon: Database, allowedRoles: ['admin'] },
  { title: 'License Settings', href: '/settings/license', icon: Shield, allowedRoles: ['admin'] },
]

function NavSection({ title, items }: { title: string; items: NavItem[] }) {
  const { user } = useAuth()

  const visibleItems = items.filter((item) => {
    // If no role restriction, everyone can see it
    if (!item.allowedRoles) return true
    // Check if user's role is in the allowed roles
    const userRole = user?.role?.toLowerCase() as UserRole
    return item.allowedRoles.includes(userRole)
  })

  if (visibleItems.length === 0) return null

  return (
    <div className="mb-4">
      <h3 className="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</h3>
      <nav className="space-y-1 px-2">
        {visibleItems.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )
            }
          >
            <item.icon className="h-4 w-4" />
            {item.title}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}

export function Sidebar() {
  return (
    <aside className="flex h-full w-64 flex-col border-r bg-card">
      <div className="flex h-16 items-center border-b px-6">
        <h1 className="text-xl font-bold">Firearms POS</h1>
      </div>
      <ScrollArea className="flex-1 py-4">
        <NavSection title="Main" items={mainNavItems} />
        <NavSection title="Inventory" items={inventoryNavItems} />
        <NavSection title="Management" items={managementNavItems} />
        <NavSection title="Finance" items={financeNavItems} />
        <NavSection title="Administration" items={adminNavItems} />
      </ScrollArea>
      <div className="border-t p-4 flex items-center justify-between">
        <p className="text-xs text-muted-foreground">Version 1.0.0</p>
        <ThemeToggle />
      </div>
    </aside>
  )
}
