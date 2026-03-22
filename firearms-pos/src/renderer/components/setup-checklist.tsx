import { useEffect, useState, useCallback } from 'react'
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
  CheckCircle2,
  X,
  ChevronRight,
  Crosshair,
  SkipForward,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'

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
    icon: Users,
  },
  {
    key: 'addProducts',
    title: 'Add Products',
    description: 'Register your initial product catalog',
    route: '/products',
    icon: Package,
  },
  {
    key: 'configureOperations',
    title: 'Configure Operations',
    description: 'Set working hours, payment methods, inventory settings',
    route: '/settings',
    icon: Settings,
  },
  {
    key: 'addSuppliers',
    title: 'Add Suppliers',
    description: 'Register your vendors and suppliers',
    route: '/suppliers',
    icon: Truck,
  },
  {
    key: 'addServices',
    title: 'Add Services',
    description: 'Register services you offer (repairs, transfers, etc.)',
    route: '/services',
    icon: Wrench,
  },
  {
    key: 'addAssets',
    title: 'Add Assets',
    description: 'Record business assets (equipment, vehicles, property)',
    route: '/chart-of-accounts',
    icon: Building,
  },
  {
    key: 'addPurchases',
    title: 'Add Opening Purchases',
    description: 'Record existing purchase orders or received goods',
    route: '/purchases',
    icon: ShoppingCart,
  },
  {
    key: 'addExpenses',
    title: 'Add Expenses',
    description: 'Record existing or recurring expenses',
    route: '/expenses',
    icon: Receipt,
  },
  {
    key: 'addReceivables',
    title: 'Add Receivables',
    description: 'Record outstanding balances owed to you',
    route: '/receivables',
    icon: ArrowDownToLine,
  },
  {
    key: 'addPayables',
    title: 'Add Payables',
    description: 'Record outstanding balances you owe',
    route: '/payables',
    icon: ArrowUpFromLine,
  },
  {
    key: 'registerCustomers',
    title: 'Register Customers',
    description: 'Add existing customer records',
    route: '/customers',
    icon: UserCheck,
  },
  {
    key: 'setCashInHand',
    title: 'Set Cash in Hand',
    description: 'Record your opening cash balance',
    route: '/journals',
    icon: Banknote,
  },
  {
    key: 'reviewBalanceSheet',
    title: 'Review Opening Balance Sheet',
    description: 'Verify all opening balances are correct',
    route: '/chart-of-accounts',
    icon: FileSpreadsheet,
  },
]

export function SetupChecklist() {
  const [checklist, setChecklist] = useState<ChecklistStatus | null>(null)
  const [mounted, setMounted] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    loadChecklist()
    requestAnimationFrame(() => setMounted(true))
  }, [])

  const loadChecklist = async () => {
    const result = await window.api.setup.refreshChecklist()
    if (result.success && result.data) {
      setChecklist(result.data)
    }
  }

  const handleSkip = useCallback(async (key: string) => {
    const result = await window.api.setup.updateChecklistItem(key, 'skipped')
    if (result.success && result.data) {
      setChecklist(result.data)
    }
  }, [])

  const handleDismiss = useCallback(async () => {
    const result = await window.api.setup.dismissChecklist()
    if (result.success) {
      setChecklist(null)
    }
  }, [])

  const handleNavigate = useCallback(
    (route: string) => {
      navigate(route)
    },
    [navigate]
  )

  if (!checklist || checklist.dismissed) {
    return null
  }

  const completedCount = CHECKLIST_ITEMS.filter(
    (item) =>
      checklist[item.key as keyof ChecklistStatus] === 'completed' ||
      checklist[item.key as keyof ChecklistStatus] === 'skipped'
  ).length

  const progressPercentage = (completedCount / CHECKLIST_ITEMS.length) * 100
  const allDone = completedCount === CHECKLIST_ITEMS.length

  return (
    <div
      className="relative shrink-0 rounded-lg border border-amber-900/30 bg-gradient-to-b from-amber-950/20 via-card to-card overflow-hidden"
      style={{
        transition: 'opacity 0.5s ease-out, transform 0.5s ease-out',
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(-8px)',
      }}
    >
      {/* Scan-line overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(217,170,75,0.015) 2px, rgba(217,170,75,0.015) 4px)',
        }}
      />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-4 py-2.5 border-b border-amber-900/20">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-amber-500/10 border border-amber-500/20">
            <Crosshair className="h-3.5 w-3.5 text-amber-500" />
          </div>
          <div>
            <h3 className="text-sm font-semibold tracking-tight text-foreground">
              Setup Operations
            </h3>
            <p className="text-[10px] text-amber-500/70 font-medium tracking-wide uppercase">
              {allDone
                ? 'All objectives complete'
                : `${completedCount} of ${CHECKLIST_ITEMS.length} objectives`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Progress indicator */}
          <div className="hidden sm:flex items-center gap-2.5">
            <div className="w-28 h-1.5 rounded-full bg-muted/50 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{
                  width: `${progressPercentage}%`,
                  background: allDone
                    ? 'linear-gradient(90deg, #22c55e, #16a34a)'
                    : 'linear-gradient(90deg, #d4a44b, #b8860b)',
                }}
              />
            </div>
            <span className="text-[10px] font-mono text-muted-foreground tabular-nums">
              {Math.round(progressPercentage)}%
            </span>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleDismiss}
            className="h-6 w-6 text-muted-foreground hover:text-foreground hover:bg-amber-500/10"
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Scrollable checklist items */}
      <ScrollArea className="max-h-[320px]">
        <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-border/30 p-px">
          {CHECKLIST_ITEMS.map((item, index) => {
            const status = checklist[item.key as keyof ChecklistStatus] as string
            const isCompleted = status === 'completed' || status === 'skipped'
            const isSkipped = status === 'skipped'
            const Icon = item.icon

            return (
              <div
                key={item.key}
                className={`group relative flex items-center gap-2.5 px-3 py-2.5 transition-colors duration-150 ${
                  isCompleted
                    ? 'bg-card/80'
                    : 'bg-card hover:bg-amber-500/[0.04]'
                }`}
                style={{
                  transition: 'opacity 0.4s ease-out, transform 0.4s ease-out',
                  transitionDelay: `${0.05 + index * 0.03}s`,
                  opacity: mounted ? 1 : 0,
                  transform: mounted ? 'translateY(0)' : 'translateY(6px)',
                }}
              >
                {/* Status indicator */}
                {isCompleted ? (
                  <CheckCircle2
                    className={`h-4 w-4 shrink-0 ${
                      isSkipped ? 'text-muted-foreground/50' : 'text-green-500'
                    }`}
                  />
                ) : (
                  <div className="relative h-4 w-4 shrink-0">
                    <div className="absolute inset-0 rounded-full border border-amber-500/30" />
                    <div className="absolute inset-[3px] rounded-full bg-amber-500/20" />
                  </div>
                )}

                {/* Icon + text */}
                <Icon
                  className={`h-3.5 w-3.5 shrink-0 ${
                    isCompleted ? 'text-muted-foreground/40' : 'text-amber-500/60'
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-xs font-medium leading-tight truncate ${
                      isCompleted
                        ? 'text-muted-foreground/50 line-through decoration-muted-foreground/30'
                        : 'text-foreground'
                    }`}
                  >
                    {item.title}
                  </p>
                  <p className="text-[10px] text-muted-foreground/60 truncate leading-tight mt-0.5">
                    {item.description}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  {status === 'pending' && (
                    <button
                      onClick={() => handleSkip(item.key)}
                      className="flex h-5 items-center gap-0.5 rounded px-1.5 text-[10px] font-medium text-muted-foreground/60 hover:text-muted-foreground hover:bg-muted/50 transition-colors"
                      title="Skip"
                    >
                      <SkipForward className="h-3 w-3" />
                      Skip
                    </button>
                  )}
                  {!isCompleted && (
                    <button
                      onClick={() => handleNavigate(item.route)}
                      className="flex h-5 items-center gap-0.5 rounded px-1.5 text-[10px] font-medium text-amber-500 hover:bg-amber-500/10 transition-colors"
                    >
                      Go
                      <ChevronRight className="h-2.5 w-2.5" />
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="relative z-10 flex items-center justify-between px-4 py-2 border-t border-amber-900/20 bg-card/50">
        <p className="text-[10px] text-muted-foreground/50">
          {allDone ? 'All set — you can dismiss this panel' : 'Skip items you don\'t need right now'}
        </p>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDismiss}
          className="h-6 px-2.5 text-[10px] text-muted-foreground hover:text-foreground hover:bg-amber-500/10"
        >
          {allDone ? 'Dismiss' : 'I\'m Done Setting Up'}
        </Button>
      </div>
    </div>
  )
}
