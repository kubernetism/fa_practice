import React, { useState, useEffect } from 'react'
import {
  DollarSign,
  ShoppingCart,
  Package,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Users,
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useBranch } from '@/contexts/branch-context'
import { formatCurrency, formatNumber } from '@/lib/utils'

interface DashboardStats {
  totalSales: number
  totalRevenue: number
  avgOrderValue: number
  lowStockCount: number
}

interface LowStockItem {
  productId: number
  productName: string
  productCode: string
  quantity: number
  minQuantity: number
}

export function DashboardScreen() {
  const { currentBranch } = useBranch()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!currentBranch) return

      setIsLoading(true)
      try {
        // Fetch daily summary
        const summaryResult = await window.api.sales.getDailySummary(currentBranch.id)
        if (summaryResult.success && summaryResult.data) {
          setStats({
            totalSales: summaryResult.data.totalSales || 0,
            totalRevenue: summaryResult.data.totalRevenue || 0,
            avgOrderValue: summaryResult.data.totalRevenue && summaryResult.data.totalSales
              ? summaryResult.data.totalRevenue / summaryResult.data.totalSales
              : 0,
            lowStockCount: 0,
          })
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
          setStats((prev) => prev ? { ...prev, lowStockCount: items.length } : null)
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [currentBranch])

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's what's happening at {currentBranch?.name || 'your store'} today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats?.totalRevenue || 0)}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="mr-1 inline h-3 w-3 text-success" />
              +12.5% from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats?.totalSales || 0)}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="mr-1 inline h-3 w-3 text-success" />
              +3 from yesterday
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Order Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats?.avgOrderValue || 0)}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingDown className="mr-1 inline h-3 w-3 text-destructive" />
              -2.1% from yesterday
            </p>
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
              <p className="text-center text-muted-foreground py-8">
                All stock levels are healthy
              </p>
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
