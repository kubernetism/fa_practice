import React, { useState, useEffect } from 'react'
import {
  DollarSign,
  ShoppingCart,
  Package,
  AlertTriangle,
  TrendingUp,
  Receipt,
  RotateCcw,
  Wallet,
  Banknote,
  Users,
  ArrowDownCircle,
  ArrowUpCircle,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useBranch } from '@/contexts/branch-context'
import { formatCurrency, formatNumber } from '@/lib/utils'

type TimePeriod = 'daily' | 'weekly' | 'monthly' | 'yearly'

interface DashboardStats {
  totalProfit: number
  totalProducts: number
  totalProductsSold: number
  totalPurchases: number
  totalExpense: number
  totalReturns: number
  receivablesPending: number
  receivablesReceived: number
  payablesPending: number
  payablesPaid: number
  cashInHand: number
  lowStockCount: number
}

interface LowStockItem {
  productId: number
  productName: string
  productCode: string
  quantity: number
  minQuantity: number
}

const TIME_PERIOD_LABELS: Record<TimePeriod, string> = {
  daily: 'Today',
  weekly: 'This Week',
  monthly: 'This Month',
  yearly: 'This Year',
}

export function DashboardScreen() {
  const { currentBranch } = useBranch()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([])
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('daily')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!currentBranch) return

      setIsLoading(true)
      try {
        // Fetch dashboard stats with time period
        const statsResult = await window.api.dashboard.getStats({
          branchId: currentBranch.id,
          timePeriod,
        })

        if (statsResult.success && statsResult.data) {
          setStats(statsResult.data)
        }

        // Fetch low stock items
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
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [currentBranch, timePeriod])

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Time Period Selector */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here's what's happening at {currentBranch?.name || 'your store'}.
          </p>
        </div>
        <Tabs value={timePeriod} onValueChange={(v) => setTimePeriod(v as TimePeriod)}>
          <TabsList>
            {(Object.keys(TIME_PERIOD_LABELS) as TimePeriod[]).map((period) => (
              <TabsTrigger key={period} value={period}>
                {TIME_PERIOD_LABELS[period]}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Financial Metrics */}
      <div>
        <h2 className="mb-3 text-lg font-semibold text-muted-foreground">Financial Overview</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Profit</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${(stats?.totalProfit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(stats?.totalProfit || 0)}
              </div>
              <p className="text-xs text-muted-foreground">Revenue - Cost - Commission - Tax</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Purchases</CardTitle>
              <Receipt className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats?.totalPurchases || 0)}</div>
              <p className="text-xs text-muted-foreground">Purchase orders value</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Expense</CardTitle>
              <Wallet className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats?.totalExpense || 0)}</div>
              <p className="text-xs text-muted-foreground">Operating expenses</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Sales Metrics */}
      <div>
        <h2 className="mb-3 text-lg font-semibold text-muted-foreground">Sales & Inventory</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <Package className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(stats?.totalProducts || 0)}</div>
              <p className="text-xs text-muted-foreground">Active products in catalog</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Products Sold</CardTitle>
              <ShoppingCart className="h-4 w-4 text-indigo-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(stats?.totalProductsSold || 0)}</div>
              <p className="text-xs text-muted-foreground">Units sold in period</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Returns</CardTitle>
              <RotateCcw className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats?.totalReturns || 0)}</div>
              <p className="text-xs text-muted-foreground">Returned goods value</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Receivables & Payables */}
      <div>
        <h2 className="mb-3 text-lg font-semibold text-muted-foreground">Receivables & Payables</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">AR Pending</CardTitle>
              <ArrowDownCircle className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats?.receivablesPending || 0)}</div>
              <p className="text-xs text-muted-foreground">Outstanding customer dues</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">AR Received</CardTitle>
              <ArrowDownCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats?.receivablesReceived || 0)}</div>
              <p className="text-xs text-muted-foreground">Collected in period</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">AP Pending</CardTitle>
              <ArrowUpCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats?.payablesPending || 0)}</div>
              <p className="text-xs text-muted-foreground">Outstanding supplier dues</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">AP Paid</CardTitle>
              <ArrowUpCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats?.payablesPaid || 0)}</div>
              <p className="text-xs text-muted-foreground">Paid in period</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Cash & Alerts */}
      <div>
        <h2 className="mb-3 text-lg font-semibold text-muted-foreground">Cash & Alerts</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cash In Hand</CardTitle>
              <Banknote className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats?.cashInHand || 0)}</div>
              <p className="text-xs text-muted-foreground">Current cash register balance</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-warning" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(stats?.lowStockCount || 0)}</div>
              <p className="text-xs text-muted-foreground">Items need restock</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Bottom Section: Low Stock Items & Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Low Stock Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Low Stock Items
            </CardTitle>
            <CardDescription>Products that need to be restocked</CardDescription>
          </CardHeader>
          <CardContent>
            {lowStockItems.length === 0 ? (
              <p className="py-8 text-center text-muted-foreground">All stock levels are healthy</p>
            ) : (
              <div className="space-y-4">
                {lowStockItems.slice(0, 5).map((item) => (
                  <div key={item.productId} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-sm text-muted-foreground">{item.productCode}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-destructive">{item.quantity} left</p>
                      <p className="text-sm text-muted-foreground">Min: {item.minQuantity}</p>
                    </div>
                  </div>
                ))}
                {lowStockItems.length > 5 && (
                  <Button variant="outline" className="w-full">
                    View All ({lowStockItems.length} items)
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks you can do right now</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            <Button variant="outline" className="justify-start" asChild>
              <a href="/pos">
                <ShoppingCart className="mr-2 h-4 w-4" />
                New Sale
              </a>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <a href="/products">
                <Package className="mr-2 h-4 w-4" />
                Add Product
              </a>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <a href="/customers">
                <Users className="mr-2 h-4 w-4" />
                Add Customer
              </a>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <a href="/inventory">
                <Package className="mr-2 h-4 w-4" />
                Stock Adjustment
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
