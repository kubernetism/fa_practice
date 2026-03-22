import React, { useEffect, useMemo, useState } from 'react'
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
  BadgePercent,
  Store,
  FileBarChart,
  ClipboardList,
  Database,
  Shield,
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
  RotateCcw,
  Code2,
  Briefcase,
  ShieldCheck,
  Palette,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { useAuth } from '@/contexts/auth-context'
import { useSettings } from '@/contexts/settings-context'
import { ThemeToggle } from '@/components/theme'

type UserRole = 'admin' | 'manager' | 'cashier'

interface NavItem {
  title: string
  href: string
  icon: React.ElementType
  allowedRoles?: UserRole[]
}

interface NavSection {
  id: string
  title: string
  icon: React.ElementType
  items: NavItem[]
}

// Cashier: Main only
// Manager: Main + Inventory + Management
// Admin: Everything

const sections: NavSection[] = [
  {
    id: 'main',
    title: 'Main',
    icon: LayoutDashboard,
    items: [
      { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { title: 'Point of Sale', href: '/pos', icon: ShoppingCart },
      { title: 'Sales History', href: '/sales', icon: Receipt },
    ],
  },
  {
    id: 'inventory',
    title: 'Inventory',
    icon: Package,
    items: [
      { title: 'Products', href: '/products', icon: Package, allowedRoles: ['admin', 'manager'] },
      { title: 'Services', href: '/services', icon: Wrench, allowedRoles: ['admin', 'manager'] },
      { title: 'Categories', href: '/categories-management', icon: FolderTree, allowedRoles: ['admin', 'manager'] },
      { title: 'Stock', href: '/inventory', icon: Warehouse, allowedRoles: ['admin', 'manager'] },
      { title: 'Purchases', href: '/purchases', icon: Truck, allowedRoles: ['admin', 'manager'] },
      { title: 'Returns', href: '/returns', icon: ArrowLeftRight, allowedRoles: ['admin', 'manager'] },
    ],
  },
  {
    id: 'management',
    title: 'Management',
    icon: Briefcase,
    items: [
      { title: 'Customers', href: '/customers', icon: Users, allowedRoles: ['admin', 'manager'] },
      { title: 'Suppliers', href: '/suppliers', icon: Store, allowedRoles: ['admin', 'manager'] },
      { title: 'Expenses', href: '/expenses', icon: DollarSign, allowedRoles: ['admin', 'manager'] },
      { title: 'Commissions', href: '/commissions', icon: BadgePercent, allowedRoles: ['admin', 'manager'] },
      { title: 'Referrals', href: '/referral-persons', icon: UserPlus, allowedRoles: ['admin', 'manager'] },
      { title: 'Receivables', href: '/receivables', icon: Wallet, allowedRoles: ['admin', 'manager'] },
      { title: 'Payables', href: '/payables', icon: CreditCard, allowedRoles: ['admin', 'manager'] },
      { title: 'Vouchers', href: '/vouchers', icon: Ticket, allowedRoles: ['admin', 'manager'] },
    ],
  },
  {
    id: 'finance',
    title: 'Finance',
    icon: Landmark,
    items: [
      { title: 'Cash Register', href: '/cash-register', icon: Banknote, allowedRoles: ['admin'] },
      { title: 'Chart of Accounts', href: '/chart-of-accounts', icon: Landmark, allowedRoles: ['admin'] },
      { title: 'Journals', href: '/journals', icon: BookOpen, allowedRoles: ['admin'] },
      { title: 'Tax Collections', href: '/tax-collections', icon: Percent, allowedRoles: ['admin'] },
      { title: 'Discounts', href: '/discount-management', icon: Tags, allowedRoles: ['admin', 'manager'] },
    ],
  },
  {
    id: 'admin',
    title: 'Administration',
    icon: ShieldCheck,
    items: [
      { title: 'Reversal Requests', href: '/reversals', icon: RotateCcw, allowedRoles: ['admin'] },
      { title: 'Users', href: '/users', icon: UserCog, allowedRoles: ['admin'] },
      { title: 'Branches', href: '/branches', icon: Building2, allowedRoles: ['admin'] },
      { title: 'Reports', href: '/reports', icon: FileText, allowedRoles: ['admin'] },
      { title: 'Audit Reports', href: '/audit-reports', icon: FileBarChart, allowedRoles: ['admin'] },
      { title: 'Activity Logs', href: '/audit', icon: ClipboardList, allowedRoles: ['admin'] },
      { title: 'Settings', href: '/settings', icon: Settings, allowedRoles: ['admin'] },
      { title: 'Appearance', href: '/settings/theme', icon: Palette, allowedRoles: ['admin'] },
      { title: 'Database', href: '/database', icon: Database, allowedRoles: ['admin'] },
      { title: 'License', href: '/settings/license', icon: Shield, allowedRoles: ['admin'] },
      { title: 'Developer', href: '/developer', icon: Code2, allowedRoles: ['admin'] },
      { title: 'How-To Guide', href: '/guide', icon: BookOpen },
    ],
  },
]

export function Sidebar() {
  const { user } = useAuth()
  const { currentBranchSettings, globalSettings } = useSettings()
  const location = useLocation()
  const businessName = currentBranchSettings?.businessName || globalSettings?.businessName || 'POS System'

  useEffect(() => {
    document.title = businessName
  }, [businessName])

  const userRole = user?.role?.toLowerCase() as UserRole

  // Filter sections based on user role
  const visibleSections = useMemo(() => {
    return sections
      .map((section) => ({
        ...section,
        items: section.items.filter((item) => {
          if (!item.allowedRoles) return true
          return item.allowedRoles.includes(userRole)
        }),
      }))
      .filter((section) => section.items.length > 0)
  }, [userRole])

  // Determine which section contains the active route
  const activeSection = useMemo(() => {
    for (const section of visibleSections) {
      for (const item of section.items) {
        if (location.pathname === item.href || location.pathname.startsWith(item.href + '/')) {
          return section.id
        }
      }
    }
    return visibleSections[0]?.id || 'main'
  }, [location.pathname, visibleSections])

  const [openSection, setOpenSection] = useState<string>(activeSection)

  // Sync open section when route changes
  useEffect(() => {
    setOpenSection(activeSection)
  }, [activeSection])

  return (
    <aside className="flex h-full w-64 flex-col border-r bg-card">
      {/* Business Name Header */}
      <div className="flex h-14 items-center border-b border-border px-5">
        <h1
          className="text-lg font-bold tracking-wide bg-clip-text text-transparent animate-shimmer"
          style={{
            backgroundImage: 'linear-gradient(110deg, var(--color-foreground) 35%, var(--color-primary) 50%, var(--color-foreground) 65%)',
            backgroundSize: '200% 100%',
          }}
        >
          {businessName}
        </h1>
      </div>

      {/* Accordion Navigation */}
      <div className="flex-1 overflow-y-auto">
        <Accordion
          type="single"
          collapsible
          value={openSection}
          onValueChange={(val) => setOpenSection(val)}
          className="px-2 py-1"
        >
          {visibleSections.map((section) => {
            const SectionIcon = section.icon
            const isActiveSection = openSection === section.id

            return (
              <AccordionItem
                key={section.id}
                value={section.id}
                className={cn(
                  'border-b-0 rounded-lg mb-0.5',
                  isActiveSection && 'bg-accent/30'
                )}
              >
                <AccordionTrigger
                  className={cn(
                    'py-2 px-3 rounded-lg hover:no-underline hover:bg-accent/50 transition-colors',
                    '[&>svg]:h-3.5 [&>svg]:w-3.5',
                    isActiveSection && 'text-foreground font-semibold'
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <SectionIcon className={cn(
                      'h-4 w-4 shrink-0',
                      isActiveSection ? 'text-primary' : 'text-muted-foreground'
                    )} />
                    <span className="text-xs font-semibold uppercase tracking-wider">
                      {section.title}
                    </span>
                    <span className={cn(
                      'ml-auto text-[10px] font-medium leading-none px-1.5 py-0.5 rounded-full',
                      isActiveSection
                        ? 'bg-primary/15 text-primary'
                        : 'bg-muted text-muted-foreground'
                    )}>
                      {section.items.length}
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pb-1 pt-0">
                  <nav className="space-y-0.5 px-1">
                    {section.items.map((item) => (
                      <NavLink
                        key={item.href}
                        to={item.href}
                        end={item.href === '/settings'}
                        className={({ isActive }) =>
                          cn(
                            'flex items-center gap-2.5 rounded-md px-3 py-1.5 text-[13px] font-medium transition-colors',
                            isActive
                              ? 'bg-primary text-primary-foreground'
                              : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                          )
                        }
                      >
                        <item.icon className="h-3.5 w-3.5 shrink-0" />
                        {item.title}
                      </NavLink>
                    ))}
                  </nav>
                </AccordionContent>
              </AccordionItem>
            )
          })}
        </Accordion>
      </div>

      {/* Footer */}
      <div className="border-t p-4 flex items-center justify-between">
        <p className="text-xs text-muted-foreground">Version 1.0.0</p>
        <ThemeToggle />
      </div>
    </aside>
  )
}
