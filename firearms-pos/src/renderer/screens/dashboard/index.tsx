import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
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
  Users,
  ArrowDownCircle,
  ArrowUpCircle,
  Camera,
  Check,
  Loader2,
  Percent,
  BarChart3,
} from 'lucide-react'
import { toPng } from 'html-to-image'
import {
  AreaChart,
  Area,
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
import { useBranch } from '@/contexts/branch-context'
import { useCurrency } from '@/contexts/settings-context'
import { formatNumber } from '@/lib/utils'
import { ReportCard } from './report-card'

type TimePeriod = 'daily' | 'weekly' | 'monthly' | 'yearly'

interface DashboardStats {
  totalProfit: number
  totalRevenue: number
  grossRevenue: number
  totalCost: number
  totalTaxCollected: number
  totalCommission: number
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
}

/* ------------------------------------------------------------------ */
/*  Compact inline metric row used inside grouped panels               */
/* ------------------------------------------------------------------ */
function MetricRow({
  icon: Icon,
  iconColor,
  label,
  value,
  sub,
  valueColor,
}: {
  icon: React.ElementType
  iconColor: string
  label: string
  value: string
  sub?: string
  valueColor?: string
}) {
  return (
    <div className="flex items-center justify-between gap-2 py-1.5">
      <div className="flex items-center gap-2 min-w-0">
        <Icon className={`h-3.5 w-3.5 shrink-0 ${iconColor}`} />
        <span className="text-xs text-muted-foreground truncate">{label}</span>
      </div>
      <div className="text-right shrink-0">
        <span className={`text-sm font-semibold tabular-nums ${valueColor || ''}`}>{value}</span>
        {sub && <p className="text-[10px] text-muted-foreground leading-tight">{sub}</p>}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Small panel wrapper                                                */
/* ------------------------------------------------------------------ */
function Panel({
  title,
  children,
  className = '',
}: {
  title: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <Card className={`${className}`}>
      <CardContent className="p-3">
        <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
          {title}
        </h3>
        <div className="divide-y divide-border/50">{children}</div>
      </CardContent>
    </Card>
  )
}

export function DashboardScreen() {
  const { currentBranch } = useBranch()
  const { formatCurrency } = useCurrency()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([])
  const [trendChart, setTrendChart] = useState<TrendChartData | null>(null)
  const [chartFilter, setChartFilter] = useState<ChartFilter>('revenue_profit')
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('daily')
  const [isLoading, setIsLoading] = useState(true)
  const [isCopied, setIsCopied] = useState(false)
  const [isCopying, setIsCopying] = useState(false)
  const [businessName, setBusinessName] = useState('')
  const reportRef = useRef<HTMLDivElement>(null)

  // Fetch business name for the report header
  useEffect(() => {
    const fetchBizName = async () => {
      try {
        const result = await window.api.businessSettings.getGlobal()
        if (result.success && result.data?.businessName) {
          setBusinessName(result.data.businessName)
        }
      } catch {
        // ignore — will fall back to default
      }
    }
    fetchBizName()
  }, [])

  const handleCopyDashboard = useCallback(async () => {
    if (!stats || !currentBranch || !reportRef.current || isCopying) return

    setIsCopying(true)
    try {
      // Temporarily make the off-screen report card visible for rendering
      const node = reportRef.current
      const prevPos = node.style.position
      const prevLeft = node.style.left
      const prevTop = node.style.top
      node.style.position = 'fixed'
      node.style.left = '0px'
      node.style.top = '0px'
      node.style.zIndex = '-1'

      const dataUrl = await toPng(node, {
        pixelRatio: 2,
        backgroundColor: '#0f172a',
      })

      // Restore off-screen positioning
      node.style.position = prevPos
      node.style.left = prevLeft
      node.style.top = prevTop
      node.style.zIndex = ''

      // Copy via Electron native clipboard
      await window.api.clipboard.copyImage(dataUrl)

      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2500)
    } catch (error) {
      console.error('Failed to capture dashboard:', error)
    } finally {
      setIsCopying(false)
    }
  }, [stats, currentBranch, isCopying])

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!currentBranch) return

      setIsLoading(true)
      try {
        const statsResult = await window.api.dashboard.getStats({
          branchId: currentBranch.id,
          timePeriod,
        })

        if (statsResult.success && statsResult.data) {
          setStats(statsResult.data)
        }

        const lowStockResult = await window.api.inventory.getLowStock(currentBranch.id)
        if (lowStockResult.success && lowStockResult.data) {
          const items = lowStockResult.data.map((item: any) => ({
            productId: item.product.id,
            productName: item.product.name,
            productCode: item.product.code,
            quantity: item.inventory.quantity,
            minQuantity: item.inventory.minQuantity,
          }))
          setLowStockItems(items)
        }

        const trendResult = await window.api.dashboard.getTrendData({
          branchId: currentBranch.id,
          timePeriod,
          chartFilter,
        })
        if (trendResult.success && trendResult.data) {
          setTrendChart(trendResult.data)
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [currentBranch, timePeriod, chartFilter])

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  const profit = stats?.totalProfit || 0
  const profitPositive = profit >= 0

  return (
    <div className="flex h-full flex-col gap-3 overflow-hidden">
      {/* Setup Checklist - shown until dismissed */}
      <SetupChecklist />

      {/* ── Header ─────────────────────────────────────── */}
      <div className="flex items-center justify-between shrink-0">
        <div className="min-w-0">
          <h1 className="text-xl font-bold leading-tight truncate">
            {currentBranch?.name || 'Dashboard'}
          </h1>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopyDashboard}
            disabled={!stats || isCopying}
            className="h-7 px-2 gap-1.5 text-xs"
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
            <TabsList className="h-7">
              {(Object.keys(TIME_PERIOD_LABELS) as TimePeriod[]).map((period) => (
                <TabsTrigger key={period} value={period} className="text-xs px-2.5 h-5">
                  {TIME_PERIOD_LABELS[period]}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* ── Hero KPIs ──────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-3 shrink-0">
        {/* Revenue */}
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Revenue</span>
              <DollarSign className="h-3.5 w-3.5 text-blue-500" />
            </div>
            <div className="text-2xl font-bold tabular-nums text-blue-600">
              {formatCurrency(stats?.grossRevenue || 0)}
            </div>
            {(stats?.returnDeductions || 0) > 0 ? (
              <p className="text-[10px] text-orange-500 mt-0.5">
                Returns: -{formatCurrency(stats?.returnDeductions || 0)} &middot; Net: {formatCurrency(stats?.totalRevenue || 0)}
              </p>
            ) : (
              <p className="text-[10px] text-muted-foreground mt-0.5">Gross sales revenue</p>
            )}
          </CardContent>
        </Card>

        {/* Profit */}
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Profit</span>
              {profitPositive ? (
                <TrendingUp className="h-3.5 w-3.5 text-green-500" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5 text-red-500" />
              )}
            </div>
            <div className={`text-2xl font-bold tabular-nums ${profitPositive ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(profit)}
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5">Revenue - Cost - Comm - Tax</p>
          </CardContent>
        </Card>

        {/* Cash In Hand */}
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Cash In Hand</span>
              <Banknote className="h-3.5 w-3.5 text-emerald-500" />
            </div>
            <div className="text-2xl font-bold tabular-nums">
              {formatCurrency(stats?.cashInHand || 0)}
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5">Register balance</p>
          </CardContent>
        </Card>

        {/* Sales Count */}
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Sales</span>
              <ShoppingCart className="h-3.5 w-3.5 text-indigo-500" />
            </div>
            <div className="text-2xl font-bold tabular-nums">
              {formatNumber(stats?.totalSalesCount || 0)}
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {formatNumber(stats?.totalProductsSold || 0)} units sold
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ── Detail Grid ────────────────────────────────── */}
      <div className="grid grid-cols-12 gap-3 flex-1 min-h-0">
        {/* Left column — Financials + Purchases/Expenses */}
        <div className="col-span-3 flex flex-col gap-3">
          <Panel title="Cost & Margins">
            <MetricRow
              icon={Receipt}
              iconColor="text-purple-500"
              label="Total Cost"
              value={formatCurrency(stats?.totalCost || 0)}
            />
            <MetricRow
              icon={Receipt}
              iconColor="text-purple-500"
              label="Purchases"
              value={formatCurrency(stats?.totalPurchases || 0)}
            />
            <MetricRow
              icon={Wallet}
              iconColor="text-red-500"
              label="Expenses"
              value={formatCurrency(stats?.totalExpense || 0)}
            />
            <MetricRow
              icon={RotateCcw}
              iconColor="text-orange-500"
              label="Returns"
              value={formatCurrency(stats?.totalReturns || 0)}
            />
          </Panel>

          <Panel title="Tax & Commission">
            <MetricRow
              icon={Percent}
              iconColor="text-blue-500"
              label="Tax Collected"
              value={formatCurrency(stats?.totalTaxCollected || 0)}
            />
            <MetricRow
              icon={DollarSign}
              iconColor="text-amber-500"
              label="Commission"
              value={formatCurrency(stats?.totalCommission || 0)}
            />
          </Panel>
        </div>

        {/* Center column — AR / AP */}
        <div className="col-span-3 flex flex-col gap-3">
          <Panel title="Accounts Receivable">
            <MetricRow
              icon={ArrowDownCircle}
              iconColor="text-yellow-500"
              label="Pending"
              value={formatCurrency(stats?.receivablesPending || 0)}
              valueColor="text-yellow-600"
            />
            <MetricRow
              icon={ArrowDownCircle}
              iconColor="text-green-500"
              label="Received"
              value={formatCurrency(stats?.receivablesReceived || 0)}
              valueColor="text-green-600"
            />
          </Panel>

          <Panel title="Accounts Payable">
            <MetricRow
              icon={ArrowUpCircle}
              iconColor="text-red-500"
              label="Pending"
              value={formatCurrency(stats?.payablesPending || 0)}
              valueColor="text-red-600"
            />
            <MetricRow
              icon={ArrowUpCircle}
              iconColor="text-green-500"
              label="Paid"
              value={formatCurrency(stats?.payablesPaid || 0)}
              valueColor="text-green-600"
            />
          </Panel>

          <Panel title="Inventory">
            <MetricRow
              icon={Package}
              iconColor="text-emerald-500"
              label="Active Products"
              value={formatNumber(stats?.totalProducts || 0)}
            />
            <MetricRow
              icon={AlertTriangle}
              iconColor="text-warning"
              label="Low Stock"
              value={formatNumber(stats?.lowStockCount || 0)}
              valueColor={
                (stats?.lowStockCount || 0) > 0 ? 'text-destructive' : ''
              }
            />
          </Panel>
        </div>

        {/* Right column — Business Progress Chart + Quick Actions */}
        <div className="col-span-6 flex flex-col gap-3 min-h-0">
          {/* Business Progress Chart */}
          <Card className="flex-1 min-h-0 flex flex-col">
            <CardContent className="p-3 flex flex-col flex-1 min-h-0">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <BarChart3 className="h-3 w-3 text-blue-500" />
                  Business Progress
                </h3>
                <div className="flex items-center gap-2">
                  {trendChart && trendChart.points.length > 0 && (
                    <span className="text-[10px] bg-blue-500/10 text-blue-500 px-1.5 py-0.5 rounded-full font-medium">
                      {trendChart.badge}
                    </span>
                  )}
                  <Select value={chartFilter} onValueChange={(v) => setChartFilter(v as ChartFilter)}>
                    <SelectTrigger className="h-6 w-[140px] text-[10px] px-2">
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
                    <p className="text-xs text-muted-foreground text-center">
                      No data for this period
                    </p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={trendChart.points} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                      <defs>
                        {trendChart.series.map((key) => (
                          <linearGradient key={key} id={`gradient_${key}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={trendChart.seriesColors[key]} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={trendChart.seriesColors[key]} stopOpacity={0} />
                          </linearGradient>
                        ))}
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                      <XAxis
                        dataKey="label"
                        tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                        axisLine={{ stroke: 'hsl(var(--border))' }}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v) => {
                          if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`
                          if (v >= 1000) return `${(v / 1000).toFixed(0)}K`
                          return v.toString()
                        }}
                      />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          fontSize: '11px',
                          padding: '8px 12px',
                        }}
                        labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600, marginBottom: 4 }}
                        formatter={(value: number, name: string) => [
                          formatCurrency(value),
                          trendChart.seriesLabels[name] || name,
                        ]}
                      />
                      <Legend
                        iconType="circle"
                        iconSize={6}
                        wrapperStyle={{ fontSize: '10px', paddingTop: '4px' }}
                        formatter={(value) => trendChart.seriesLabels[value] || value}
                      />
                      {trendChart.series.map((key) => (
                        <Area
                          key={key}
                          type="monotone"
                          dataKey={key}
                          stroke={trendChart.seriesColors[key]}
                          strokeWidth={2}
                          fill={`url(#gradient_${key})`}
                        />
                      ))}
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions — compact row */}
          <div className="grid grid-cols-4 gap-2 shrink-0">
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" asChild>
              <Link to="/pos">
                <ShoppingCart className="h-3 w-3" />
                New Sale
              </Link>
            </Button>
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" asChild>
              <Link to="/products">
                <Package className="h-3 w-3" />
                Add Product
              </Link>
            </Button>
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" asChild>
              <Link to="/customers">
                <Users className="h-3 w-3" />
                Add Customer
              </Link>
            </Button>
            <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5" asChild>
              <Link to="/inventory">
                <Package className="h-3 w-3" />
                Stock Adjust
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Off-screen report card for screenshot capture */}
      {stats && (
        <ReportCard
          ref={reportRef}
          businessName={businessName}
          branchName={currentBranch?.name || 'Branch'}
          periodLabel={TIME_PERIOD_LABELS[timePeriod]}
          generatedAt={new Date().toLocaleString()}
          formatCurrency={formatCurrency}
          formatNumber={formatNumber}
          stats={stats}
        />
      )}
    </div>
  )
}
