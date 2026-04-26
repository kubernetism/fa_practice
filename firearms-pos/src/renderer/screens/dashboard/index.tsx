import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  DollarSign,
  ShoppingCart,
  Package,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Receipt,
  RotateCcw,
  Wallet,
  Banknote,
  ArrowDownCircle,
  ArrowUpCircle,
  Camera,
  Check,
  Loader2,
  Percent,
  BarChart3,
  CalendarDays,
  PackageX,
} from 'lucide-react'
import { toPng } from 'html-to-image'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { Card, CardContent } from '@/components/ui/card'
import { SetupChecklist } from '@/components/setup-checklist'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useBranch } from '@/contexts/branch-context'
import { useCurrency } from '@/contexts/settings-context'
import { formatNumber } from '@/lib/utils'
import { ReportCard } from './report-card'

type TimePeriod = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom'

interface DashboardStats {
  totalProfit: number
  totalRevenue: number
  grossRevenue: number
  totalCost: number
  totalTaxCollected: number
  totalCommission: number
  totalDiscount: number
  grossDiscount: number
  totalProducts: number
  totalProductsSold: number
  totalPurchases: number
  totalExpense: number
  totalReturns: number
  returnDeductions: number
  receivablesPending: number
  receivablesReceived: number
  payablesPending: number
  payablesPaid: number
  cashInHand: number
  lowStockCount: number
  totalSalesCount: number
}

interface LowStockItem {
  productId: number
  productName: string
  productCode: string
  quantity: number
  minQuantity: number
}

interface FundFlowData {
  openingCash: number
  cashFromSales: number
  arCollections: number
  deposits: number
  pettyCashIn: number
  cashIn: number
  totalCashIn: number
  apPayments: number
  expensesPaid: number
  refunds: number
  withdrawals: number
  pettyCashOut: number
  totalCashOut: number
  netCashFlow: number
  closingCash: number
}

type ChartFilter = 'revenue_profit' | 'products' | 'services' | 'expenses' | 'purchases' | 'returns'

interface TrendChartData {
  series: string[]
  seriesLabels: Record<string, string>
  seriesColors: Record<string, string>
  points: Record<string, any>[]
  badge: string
}

const CHART_FILTER_LABELS: Record<ChartFilter, string> = {
  revenue_profit: 'Revenue & Profit',
  products: 'Top Products',
  services: 'Services',
  expenses: 'Expenses',
  purchases: 'Purchases',
  returns: 'Returns',
}

const TIME_PERIOD_LABELS: Record<TimePeriod, string> = {
  daily: 'Today',
  weekly: 'This Week',
  monthly: 'This Month',
  yearly: 'This Year',
  custom: 'Custom',
}

/* ------------------------------------------------------------------ */
/*  KPI Cell — compact metric with period + all-time                   */
/* ------------------------------------------------------------------ */
function KpiCell({
  icon: Icon,
  iconColor,
  label,
  value,
  allTimeValue,
  allTimeLabel = 'All time',
  valueColor,
  sub,
}: {
  icon: React.ElementType
  iconColor: string
  label: string
  value: string
  allTimeValue?: string
  allTimeLabel?: string
  valueColor?: string
  sub?: string
}) {
  return (
    <Card className="min-w-0">
      <CardContent className="p-2.5">
        <div className="flex items-center gap-1.5 mb-0.5">
          <Icon className={`h-3 w-3 shrink-0 ${iconColor}`} />
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground truncate">
            {label}
          </span>
        </div>
        <div className={`text-lg font-bold tabular-nums leading-tight ${valueColor || ''}`}>
          {value}
        </div>
        {sub && (
          <p className="text-[9px] text-orange-500 leading-tight mt-0.5 truncate">{sub}</p>
        )}
        {allTimeValue && (
          <p className="text-[9px] text-muted-foreground mt-0.5 tabular-nums">
            {allTimeLabel}: <span className="font-medium text-foreground/70">{allTimeValue}</span>
          </p>
        )}
      </CardContent>
    </Card>
  )
}

/* ------------------------------------------------------------------ */
/*  Compact inline metric row                                          */
/* ------------------------------------------------------------------ */
function MetricRow({
  label,
  value,
  valueColor,
  bold,
}: {
  label: string
  value: string
  valueColor?: string
  bold?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-2 py-[3px]">
      <span className={`text-[11px] truncate ${bold ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
        {label}
      </span>
      <span className={`text-[11px] tabular-nums shrink-0 ${bold ? 'font-bold' : 'font-semibold'} ${valueColor || ''}`}>
        {value}
      </span>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Section header inside panels                                       */
/* ------------------------------------------------------------------ */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/70 mb-1 mt-2 first:mt-0">
      {children}
    </h3>
  )
}

/* ------------------------------------------------------------------ */
/*  Low Stock progress bar                                             */
/* ------------------------------------------------------------------ */
function StockBar({ current, min }: { current: number; min: number }) {
  const pct = min > 0 ? Math.min((current / min) * 100, 100) : 0
  const critical = pct <= 30
  const warn = pct <= 60 && !critical
  return (
    <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
      <div
        className={`h-full rounded-full transition-all ${
          critical ? 'bg-red-500' : warn ? 'bg-amber-500' : 'bg-emerald-500'
        }`}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}

/* ================================================================== */
/*  DASHBOARD SCREEN                                                   */
/* ================================================================== */
export function DashboardScreen() {
  const { currentBranch } = useBranch()
  const { formatCurrency } = useCurrency()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [allTimeStats, setAllTimeStats] = useState<DashboardStats | null>(null)
  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([])
  const [trendChart, setTrendChart] = useState<TrendChartData | null>(null)
  const [fundFlow, setFundFlow] = useState<FundFlowData | null>(null)
  const [chartFilter, setChartFilter] = useState<ChartFilter>('revenue_profit')
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('daily')
  const [customDate, setCustomDate] = useState(() => new Date().toISOString().split('T')[0])
  const [isLoading, setIsLoading] = useState(true)
  const [isCopied, setIsCopied] = useState(false)
  const [isCopying, setIsCopying] = useState(false)
  const [businessName, setBusinessName] = useState('')
  const reportRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchBizName = async () => {
      try {
        const result = await window.api.businessSettings.getGlobal()
        if (result.success && result.data?.businessName) {
          setBusinessName(result.data.businessName)
        }
      } catch {
        // ignore
      }
    }
    fetchBizName()
  }, [])

  const handleCopyDashboard = useCallback(async () => {
    if (!stats || !currentBranch || !reportRef.current || isCopying) return
    setIsCopying(true)
    try {
      const node = reportRef.current
      const prevPos = node.style.position
      const prevLeft = node.style.left
      const prevTop = node.style.top
      node.style.position = 'fixed'
      node.style.left = '0px'
      node.style.top = '0px'
      node.style.zIndex = '-1'

      const dataUrl = await toPng(node, { pixelRatio: 2, backgroundColor: '#0f172a' })

      node.style.position = prevPos
      node.style.left = prevLeft
      node.style.top = prevTop
      node.style.zIndex = ''

      await window.api.clipboard.copyImage(dataUrl)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2500)
    } catch (error) {
      console.error('Failed to capture dashboard:', error)
    } finally {
      setIsCopying(false)
    }
  }, [stats, currentBranch, isCopying])

  const fetchDashboardData = useCallback(async (silent = false) => {
    if (!currentBranch) return
    if (!silent) setIsLoading(true)
    try {
      const dateParams = timePeriod === 'custom' ? { customStart: customDate, customEnd: customDate } : {}

      const [statsResult, allTimeResult, lowStockResult, trendResult, fundFlowResult] =
        await Promise.all([
          window.api.dashboard.getStats({ branchId: currentBranch.id, timePeriod, ...dateParams }),
          window.api.dashboard.getStats({ branchId: currentBranch.id, timePeriod: 'all-time' as any }),
          window.api.inventory.getLowStock(currentBranch.id),
          window.api.dashboard.getTrendData({ branchId: currentBranch.id, timePeriod, chartFilter, ...dateParams }),
          window.api.dashboard.getFundFlow({ branchId: currentBranch.id, timePeriod, ...dateParams }),
        ])

      if (statsResult.success && statsResult.data) setStats(statsResult.data)
      if (allTimeResult.success && allTimeResult.data) setAllTimeStats(allTimeResult.data)
      if (lowStockResult.success && lowStockResult.data) {
        setLowStockItems(
          lowStockResult.data.map((item: any) => ({
            productId: item.product.id,
            productName: item.product.name,
            productCode: item.product.code,
            quantity: item.inventory.quantity,
            minQuantity: item.inventory.minQuantity,
          }))
        )
      }
      if (trendResult.success && trendResult.data) setTrendChart(trendResult.data)
      if (fundFlowResult.success && fundFlowResult.data) setFundFlow(fundFlowResult.data)
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      if (!silent) setIsLoading(false)
    }
  }, [currentBranch, timePeriod, chartFilter, customDate])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  if (isLoading) {
    return (
      <div className="theme-agentfactory flex h-full items-center justify-center bg-background text-foreground">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  const profit = stats?.totalProfit || 0
  const profitPositive = profit >= 0
  const hasDeductions = (stats?.returnDeductions || 0) > 0 || (stats?.totalDiscount || 0) > 0

  return (
    <TooltipProvider delayDuration={200}>
      <div className="theme-agentfactory flex h-full flex-col gap-1.5 overflow-hidden bg-background text-foreground">
        <SetupChecklist />

        {/* ── Header ─────────────────────────────────────── */}
        <div className="flex items-center justify-between shrink-0">
          <h1 className="text-lg font-bold leading-tight truncate min-w-0">
            {currentBranch?.name || 'Dashboard'}
          </h1>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyDashboard}
              disabled={!stats || isCopying}
              className="h-6 px-2 gap-1 text-[10px]"
            >
              {isCopying ? (
                <><Loader2 className="h-3 w-3 animate-spin" /> Capturing...</>
              ) : isCopied ? (
                <><Check className="h-3 w-3 text-green-500" /> Copied!</>
              ) : (
                <><Camera className="h-3 w-3" /> Screenshot</>
              )}
            </Button>
            <Tabs value={timePeriod} onValueChange={(v) => setTimePeriod(v as TimePeriod)}>
              <TabsList className="h-6">
                {(Object.keys(TIME_PERIOD_LABELS) as TimePeriod[]).map((period) => (
                  <TabsTrigger key={period} value={period} className="text-[10px] px-2 h-4">
                    {period === 'custom' ? <CalendarDays className="h-2.5 w-2.5 mr-0.5" /> : null}
                    {TIME_PERIOD_LABELS[period]}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            {timePeriod === 'custom' && (
              <input
                type="date"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                className="h-6 rounded-md border border-input bg-background px-2 text-[10px] focus:outline-none focus:ring-1 focus:ring-ring"
              />
            )}
          </div>
        </div>

        {/* ── KPI Strip ──────────────────────────────────── */}
        <div className="grid grid-cols-6 gap-1.5 shrink-0">
          <KpiCell
            icon={DollarSign}
            iconColor="text-blue-500"
            label="Revenue"
            value={formatCurrency(stats?.grossRevenue || 0)}
            allTimeValue={allTimeStats ? formatCurrency(allTimeStats.grossRevenue) : undefined}
            valueColor="text-blue-600"
            sub={hasDeductions ? `Net: ${formatCurrency(stats?.totalRevenue || 0)}` : undefined}
          />
          <KpiCell
            icon={profitPositive ? TrendingUp : TrendingDown}
            iconColor={profitPositive ? 'text-green-500' : 'text-red-500'}
            label="Profit"
            value={formatCurrency(profit)}
            allTimeValue={allTimeStats ? formatCurrency(allTimeStats.totalProfit) : undefined}
            valueColor={profitPositive ? 'text-green-600' : 'text-red-600'}
          />
          <KpiCell
            icon={Banknote}
            iconColor="text-emerald-500"
            label="Cash In Hand"
            value={formatCurrency(stats?.cashInHand || 0)}
          />
          <KpiCell
            icon={ShoppingCart}
            iconColor="text-indigo-500"
            label="Sales"
            value={formatNumber(stats?.totalSalesCount || 0)}
            allTimeValue={allTimeStats ? formatNumber(allTimeStats.totalSalesCount) : undefined}
            sub={`${formatNumber(stats?.totalProductsSold || 0)} units`}
          />
          <KpiCell
            icon={Package}
            iconColor="text-emerald-500"
            label="Products"
            value={formatNumber(stats?.totalProducts || 0)}
            allTimeValue={`${formatNumber(stats?.totalProductsSold || 0)} sold`}
            allTimeLabel="Period"
          />
          <KpiCell
            icon={AlertTriangle}
            iconColor={(stats?.lowStockCount || 0) > 0 ? 'text-red-500' : 'text-emerald-500'}
            label="Low Stock"
            value={formatNumber(stats?.lowStockCount || 0)}
            valueColor={(stats?.lowStockCount || 0) > 0 ? 'text-red-600' : ''}
          />
        </div>

        {/* ── Main Content Grid ──────────────────────────── */}
        <div className="grid grid-cols-12 gap-1.5 flex-1 min-h-0">

          {/* ── Column 1: Financials & Deductions ──────── */}
          <Card className="col-span-3 min-h-0">
            <CardContent className="p-2.5 h-full overflow-y-auto">
              <SectionLabel>Cost & Outflows</SectionLabel>
              <MetricRow label="Total Cost (COGS)" value={formatCurrency(stats?.totalCost || 0)} />
              <MetricRow label="Purchases" value={formatCurrency(stats?.totalPurchases || 0)} />
              <MetricRow label="Expenses" value={formatCurrency(stats?.totalExpense || 0)} />
              <MetricRow
                label="Returns"
                value={formatCurrency(stats?.totalReturns || 0)}
                valueColor={(stats?.totalReturns || 0) > 0 ? 'text-orange-500' : ''}
              />

              <SectionLabel>Deductions</SectionLabel>
              <MetricRow
                label="Discounts"
                value={formatCurrency(stats?.grossDiscount || 0)}
                valueColor={(stats?.grossDiscount || 0) > 0 ? 'text-pink-500' : ''}
              />
              <MetricRow label="Tax Collected" value={formatCurrency(stats?.totalTaxCollected || 0)} />
              <MetricRow label="Commission (Paid)" value={formatCurrency(stats?.totalCommission || 0)} />

              <SectionLabel>Accounts Receivable</SectionLabel>
              <MetricRow
                label="Pending"
                value={formatCurrency(stats?.receivablesPending || 0)}
                valueColor={(stats?.receivablesPending || 0) > 0 ? 'text-yellow-600' : ''}
              />
              <MetricRow
                label="Received"
                value={formatCurrency(stats?.receivablesReceived || 0)}
                valueColor="text-green-600"
              />

              <SectionLabel>Accounts Payable</SectionLabel>
              <MetricRow
                label="Pending"
                value={formatCurrency(stats?.payablesPending || 0)}
                valueColor={(stats?.payablesPending || 0) > 0 ? 'text-red-500' : ''}
              />
              <MetricRow
                label="Paid"
                value={formatCurrency(stats?.payablesPaid || 0)}
                valueColor="text-green-600"
              />
            </CardContent>
          </Card>

          {/* ── Column 2: Fund Flow ────────────────────── */}
          <Card className="col-span-2 min-h-0">
            <CardContent className="p-2.5 h-full overflow-y-auto">
              <SectionLabel>Fund Flow</SectionLabel>
              {fundFlow ? (
                <>
                  <MetricRow label="Opening Cash" value={formatCurrency(fundFlow.openingCash)} />
                  <div className="my-1 border-t border-border/40" />
                  <MetricRow label="+ Sales (Cash)" value={formatCurrency(fundFlow.cashFromSales)} valueColor="text-green-600" />
                  {fundFlow.arCollections > 0 && (
                    <MetricRow label="+ AR Collections" value={formatCurrency(fundFlow.arCollections)} valueColor="text-green-600" />
                  )}
                  {fundFlow.deposits > 0 && (
                    <MetricRow label="+ Deposits" value={formatCurrency(fundFlow.deposits)} valueColor="text-green-600" />
                  )}
                  {fundFlow.pettyCashIn > 0 && (
                    <MetricRow label="+ Petty Cash In" value={formatCurrency(fundFlow.pettyCashIn)} valueColor="text-green-600" />
                  )}
                  {fundFlow.cashIn > 0 && (
                    <MetricRow label="+ Cash In" value={formatCurrency(fundFlow.cashIn)} valueColor="text-green-600" />
                  )}
                  <div className="my-1 border-t border-border/40" />
                  <MetricRow
                    label="Total Available"
                    value={formatCurrency(fundFlow.openingCash + fundFlow.totalCashIn)}
                    valueColor="text-blue-500"
                    bold
                  />
                  <div className="my-1 border-t border-border/40" />
                  {fundFlow.apPayments > 0 && (
                    <MetricRow label="- AP Payments" value={`(${formatCurrency(fundFlow.apPayments)})`} valueColor="text-red-500" />
                  )}
                  {fundFlow.expensesPaid > 0 && (
                    <MetricRow label="- Expenses" value={`(${formatCurrency(fundFlow.expensesPaid)})`} valueColor="text-red-500" />
                  )}
                  {fundFlow.refunds > 0 && (
                    <MetricRow label="- Refunds" value={`(${formatCurrency(fundFlow.refunds)})`} valueColor="text-orange-500" />
                  )}
                  {fundFlow.withdrawals > 0 && (
                    <MetricRow label="- Withdrawals" value={`(${formatCurrency(fundFlow.withdrawals)})`} valueColor="text-red-500" />
                  )}
                  {fundFlow.pettyCashOut > 0 && (
                    <MetricRow label="- Petty Cash Out" value={`(${formatCurrency(fundFlow.pettyCashOut)})`} valueColor="text-red-500" />
                  )}
                  <div className="my-1 border-t border-border/40" />
                  <MetricRow
                    label="Closing Cash"
                    value={formatCurrency(fundFlow.closingCash)}
                    valueColor="text-emerald-500"
                    bold
                  />
                </>
              ) : (
                <p className="text-[10px] text-muted-foreground">No cash session data</p>
              )}
            </CardContent>
          </Card>

          {/* ── Column 3: Chart ────────────────────────── */}
          <Card className="col-span-4 min-h-0 flex flex-col">
            <CardContent className="p-2.5 flex flex-col flex-1 min-h-0">
              <div className="flex items-center justify-between mb-1.5">
                <h3 className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/70 flex items-center gap-1">
                  <BarChart3 className="h-2.5 w-2.5 text-blue-500" />
                  Business Progress
                </h3>
                <div className="flex items-center gap-1.5">
                  {trendChart && trendChart.points.length > 0 && (
                    <span className="text-[9px] bg-blue-500/10 text-blue-500 px-1.5 py-0.5 rounded-full font-medium">
                      {trendChart.badge}
                    </span>
                  )}
                  <Select value={chartFilter} onValueChange={(v) => setChartFilter(v as ChartFilter)}>
                    <SelectTrigger className="h-5 w-[120px] text-[9px] px-1.5">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(CHART_FILTER_LABELS) as ChartFilter[]).map((key) => (
                        <SelectItem key={key} value={key} className="text-xs">
                          {CHART_FILTER_LABELS[key]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex-1 min-h-0">
                {!trendChart || trendChart.points.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-[10px] text-muted-foreground">No data for this period</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={trendChart.points} margin={{ top: 5, right: 5, left: -15, bottom: 0 }} barCategoryGap="20%">
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                      <XAxis
                        dataKey="label"
                        tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }}
                        axisLine={{ stroke: 'hsl(var(--border))' }}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v) => {
                          if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`
                          if (v >= 1000) return `${(v / 1000).toFixed(0)}K`
                          return v.toString()
                        }}
                      />
                      <RechartsTooltip
                        cursor={{ fill: 'transparent' }}
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '6px',
                          fontSize: '10px',
                          padding: '6px 10px',
                        }}
                        labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600, marginBottom: 2 }}
                        formatter={(value: number, name: string) => [
                          formatCurrency(value),
                          trendChart.seriesLabels[name] || name,
                        ]}
                      />
                      <Legend
                        iconType="square"
                        iconSize={6}
                        wrapperStyle={{ fontSize: '9px', paddingTop: '2px' }}
                        formatter={(value) => trendChart.seriesLabels[value] || value}
                      />
                      {trendChart.series.map((key) => (
                        <Bar
                          key={key}
                          dataKey={key}
                          fill={trendChart.seriesColors[key]}
                          radius={[2, 2, 0, 0]}
                          maxBarSize={32}
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>

          {/* ── Column 4: Low Stock Items ──────────────── */}
          <Card className="col-span-3 min-h-0 flex flex-col">
            <CardContent className="p-2.5 flex flex-col flex-1 min-h-0">
              <div className="flex items-center justify-between mb-1.5">
                <h3 className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground/70 flex items-center gap-1">
                  <PackageX className="h-2.5 w-2.5 text-red-500" />
                  Low Stock Items
                </h3>
                {lowStockItems.length > 0 && (
                  <span className="text-[9px] bg-red-500/10 text-red-500 px-1.5 py-0.5 rounded-full font-medium">
                    {lowStockItems.length} items
                  </span>
                )}
              </div>
              {lowStockItems.length === 0 ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <Package className="h-6 w-6 text-emerald-500/40 mx-auto mb-1" />
                    <p className="text-[10px] text-muted-foreground">All stock levels OK</p>
                  </div>
                </div>
              ) : (
                <ScrollArea className="flex-1 min-h-0">
                  <div className="space-y-1.5 pr-2">
                    {lowStockItems.map((item) => (
                      <div key={item.productId} className="group">
                        <div className="flex items-center justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <p className="text-[11px] font-medium truncate cursor-default">
                                  {item.productName}
                                </p>
                              </TooltipTrigger>
                              <TooltipContent side="left" className="text-xs">
                                {item.productName} ({item.productCode})
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <span className={`text-[10px] font-bold tabular-nums shrink-0 ${
                            item.quantity <= 0 ? 'text-red-500' :
                            item.quantity <= item.minQuantity * 0.3 ? 'text-red-500' :
                            'text-amber-500'
                          }`}>
                            {item.quantity}/{item.minQuantity}
                          </span>
                        </div>
                        <StockBar current={item.quantity} min={item.minQuantity} />
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Off-screen report card for screenshot capture */}
        {stats && (
          <ReportCard
            ref={reportRef}
            businessName={businessName}
            branchName={currentBranch?.name || 'Branch'}
            periodLabel={timePeriod === 'custom' ? customDate : TIME_PERIOD_LABELS[timePeriod]}
            generatedAt={new Date().toLocaleString()}
            formatCurrency={formatCurrency}
            formatNumber={formatNumber}
            stats={stats}
            fundFlow={fundFlow}
          />
        )}
      </div>
    </TooltipProvider>
  )
}
