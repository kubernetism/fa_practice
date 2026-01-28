import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Users,
  Package,
  Settings,
  Truck,
  Wrench,
  Building,
  ShoppingCart,
  Receipt,
  ArrowDownToLine,
  ArrowUpFromLine,
  UserCheck,
  Banknote,
  FileSpreadsheet,
  ClipboardList,
  CheckCircle2,
  Circle,
  X
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface ChecklistStatus {
  registerStaff: string
  addProducts: string
  configureOperations: string
  addSuppliers: string
  addServices: string
  addAssets: string
  addPurchases: string
  addExpenses: string
  addReceivables: string
  addPayables: string
  registerCustomers: string
  setCashInHand: string
  reviewBalanceSheet: string
  dismissed: boolean
}

const CHECKLIST_ITEMS = [
  {
    key: 'registerStaff',
    title: 'Register Staff',
    description: 'Add manager and cashier accounts',
    route: '/users',
    icon: Users
  },
  {
    key: 'addProducts',
    title: 'Add Products',
    description: 'Register your initial product catalog',
    route: '/products',
    icon: Package
  },
  {
    key: 'configureOperations',
    title: 'Configure Operations',
    description: 'Set working hours, payment methods, inventory settings',
    route: '/settings',
    icon: Settings
  },
  {
    key: 'addSuppliers',
    title: 'Add Suppliers',
    description: 'Register your vendors and suppliers',
    route: '/suppliers',
    icon: Truck
  },
  {
    key: 'addServices',
    title: 'Add Services',
    description: 'Register services you offer (repairs, transfers, etc.)',
    route: '/services',
    icon: Wrench
  },
  {
    key: 'addAssets',
    title: 'Add Assets',
    description: 'Record business assets (equipment, vehicles, property)',
    route: '/chart-of-accounts',
    icon: Building
  },
  {
    key: 'addPurchases',
    title: 'Add Opening Purchases',
    description: 'Record existing purchase orders or received goods',
    route: '/purchases',
    icon: ShoppingCart
  },
  {
    key: 'addExpenses',
    title: 'Add Expenses',
    description: 'Record existing or recurring expenses',
    route: '/expenses',
    icon: Receipt
  },
  {
    key: 'addReceivables',
    title: 'Add Receivables',
    description: 'Record outstanding balances owed to you',
    route: '/receivables',
    icon: ArrowDownToLine
  },
  {
    key: 'addPayables',
    title: 'Add Payables',
    description: 'Record outstanding balances you owe',
    route: '/payables',
    icon: ArrowUpFromLine
  },
  {
    key: 'registerCustomers',
    title: 'Register Customers',
    description: 'Add existing customer records',
    route: '/customers',
    icon: UserCheck
  },
  {
    key: 'setCashInHand',
    title: 'Set Cash in Hand',
    description: 'Record your opening cash balance',
    route: '/journals',
    icon: Banknote
  },
  {
    key: 'reviewBalanceSheet',
    title: 'Review Opening Balance Sheet',
    description: 'Verify all opening balances are correct',
    route: '/chart-of-accounts',
    icon: FileSpreadsheet
  }
]

export function SetupChecklist() {
  const [checklist, setChecklist] = useState<ChecklistStatus | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    loadChecklist()
  }, [])

  const loadChecklist = async () => {
    const result = await window.api.setup.refreshChecklist()
    if (result.success && result.data) {
      setChecklist(result.data)
    }
  }

  const handleSkip = async (key: string) => {
    const result = await window.api.setup.updateChecklistItem(key, 'skipped')
    if (result.success && result.data) {
      setChecklist(result.data)
    }
  }

  const handleDismiss = async () => {
    const result = await window.api.setup.dismissChecklist()
    if (result.success) {
      setChecklist(null)
    }
  }

  const handleNavigate = (route: string) => {
    navigate(route)
  }

  if (!checklist || checklist.dismissed) {
    return null
  }

  const completedCount = CHECKLIST_ITEMS.filter(
    (item) =>
      checklist[item.key as keyof ChecklistStatus] === 'completed' ||
      checklist[item.key as keyof ChecklistStatus] === 'skipped'
  ).length

  const progressPercentage = (completedCount / CHECKLIST_ITEMS.length) * 100

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            Complete Your Setup
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={handleDismiss}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            {completedCount} of {CHECKLIST_ITEMS.length} completed
          </p>
          <div className="h-2 w-full rounded-full bg-muted">
            <div
              className="h-2 rounded-full bg-primary transition-all"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        <div className="space-y-2">
          {CHECKLIST_ITEMS.map((item) => {
            const status = checklist[item.key as keyof ChecklistStatus] as string
            const isCompleted = status === 'completed' || status === 'skipped'
            const Icon = item.icon

            return (
              <div
                key={item.key}
                className="flex items-center justify-between gap-4 rounded-lg border p-3"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {isCompleted ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  )}
                  <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{item.title}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {item.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {status === 'pending' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSkip(item.key)}
                      className="h-8 px-2 text-xs"
                    >
                      Skip
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleNavigate(item.route)}
                    className="h-8 px-3 text-xs"
                  >
                    Go
                  </Button>
                </div>
              </div>
            )
          })}
        </div>

        <Button variant="outline" className="w-full" onClick={handleDismiss}>
          I'm Done Setting Up
        </Button>
      </CardContent>
    </Card>
  )
}
