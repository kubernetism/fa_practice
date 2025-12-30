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
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAuth } from '@/contexts/auth-context'

interface NavItem {
  title: string
  href: string
  icon: React.ElementType
  permission?: string
}

const mainNavItems: NavItem[] = [
  { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { title: 'Point of Sale', href: '/pos', icon: ShoppingCart },
  { title: 'Sales History', href: '/sales', icon: Receipt },
]

const inventoryNavItems: NavItem[] = [
  { title: 'Products', href: '/products', icon: Package, permission: 'products:view' },
  { title: 'Inventory', href: '/inventory', icon: Warehouse, permission: 'inventory:view' },
  { title: 'Purchases', href: '/purchases', icon: Truck, permission: 'purchases:view' },
  { title: 'Returns', href: '/returns', icon: ArrowLeftRight },
]

const managementNavItems: NavItem[] = [
  { title: 'Customers', href: '/customers', icon: Users, permission: 'customers:view' },
  { title: 'Suppliers', href: '/suppliers', icon: Store, permission: 'suppliers:view' },
  { title: 'Expenses', href: '/expenses', icon: DollarSign, permission: 'expenses:view' },
  { title: 'Commissions', href: '/commissions', icon: BadgePercent, permission: 'commissions:view' },
]

const adminNavItems: NavItem[] = [
  { title: 'Users', href: '/users', icon: UserCog, permission: 'users:view' },
  { title: 'Branches', href: '/branches', icon: Building2, permission: 'branches:view' },
  { title: 'Reports', href: '/reports', icon: FileText, permission: 'reports:view' },
  { title: 'Audit Logs', href: '/audit', icon: History, permission: 'audit:view' },
  { title: 'Settings', href: '/settings', icon: Settings, permission: 'settings:view' },
]

function NavSection({ title, items }: { title: string; items: NavItem[] }) {
  const { checkPermission } = useAuth()

  const visibleItems = items.filter((item) => !item.permission || checkPermission(item.permission))

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
        <NavSection title="Administration" items={adminNavItems} />
      </ScrollArea>
      <div className="border-t p-4">
        <p className="text-xs text-muted-foreground">Version 1.0.0</p>
      </div>
    </aside>
  )
}
