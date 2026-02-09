import {
  DollarSign,
  ShoppingCart,
  Package,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getDashboardStats, getRecentSales, getLowStockItems } from '@/actions/dashboard'

function formatCurrency(value: string | number) {
  return `Rs. ${Number(value).toLocaleString()}`
}

function timeAgo(date: Date) {
  const now = new Date()
  const diffMs = now.getTime() - new Date(date).getTime()
  const diffMin = Math.floor(diffMs / 60000)
  if (diffMin < 1) return 'Just now'
  if (diffMin < 60) return `${diffMin} min ago`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `${diffHr} hr${diffHr > 1 ? 's' : ''} ago`
  const diffDay = Math.floor(diffHr / 24)
  return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`
}

export default async function DashboardPage() {
  const [statsResult, recentResult, lowStockResult] = await Promise.all([
    getDashboardStats(),
    getRecentSales(5),
    getLowStockItems(5),
  ])

  const s = statsResult.data!
  const recentSales = recentResult.data ?? []
  const lowStockItems = lowStockResult.data ?? []

  const monthRev = Number(s.monthRevenue)
  const lastMonthRev = Number(s.lastMonthRevenue)
  const revChange = lastMonthRev > 0 ? ((monthRev - lastMonthRev) / lastMonthRev * 100).toFixed(1) : '0'

  const stats = [
    {
      title: "Today's Sales",
      value: formatCurrency(s.todayRevenue),
      change: s.yesterdaySales > 0 ? `${s.todaySales > s.yesterdaySales ? '+' : ''}${s.todaySales - s.yesterdaySales}` : `${s.todaySales}`,
      trend: s.todaySales >= s.yesterdaySales ? ('up' as const) : ('down' as const),
      icon: DollarSign,
      description: `${s.todaySales} transactions`,
    },
    {
      title: 'Orders Today',
      value: String(s.todaySales),
      change: s.yesterdaySales > 0 ? `${((s.todaySales - s.yesterdaySales) / s.yesterdaySales * 100).toFixed(0)}%` : '0%',
      trend: s.todaySales >= s.yesterdaySales ? ('up' as const) : ('down' as const),
      icon: ShoppingCart,
      description: `vs ${s.yesterdaySales} yesterday`,
    },
    {
      title: 'Products',
      value: String(s.totalProducts),
      change: s.lowStockCount > 0 ? `-${s.lowStockCount}` : '0',
      trend: s.lowStockCount > 0 ? ('down' as const) : ('up' as const),
      icon: Package,
      description: `${s.lowStockCount} low stock`,
    },
    {
      title: 'Revenue (MTD)',
      value: formatCurrency(monthRev),
      change: `${Number(revChange) >= 0 ? '+' : ''}${revChange}%`,
      trend: Number(revChange) >= 0 ? ('up' as const) : ('down' as const),
      icon: TrendingUp,
      description: 'vs last month',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Overview of your business performance
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="card-tactical overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-3">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {stat.title}
                  </p>
                  <div>
                    <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span
                        className={`flex items-center text-xs font-semibold ${
                          stat.trend === 'up' ? 'text-success' : 'text-destructive'
                        }`}
                      >
                        {stat.trend === 'up' ? (
                          <ArrowUpRight className="w-3 h-3" />
                        ) : (
                          <ArrowDownRight className="w-3 h-3" />
                        )}
                        {stat.change}
                      </span>
                      <span className="text-xs text-muted-foreground">{stat.description}</span>
                    </div>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <stat.icon className="w-5 h-5 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bottom grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Recent Sales */}
        <Card className="lg:col-span-3">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Recent Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {recentSales.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">No sales yet</p>
              ) : (
                recentSales.map((sale) => (
                  <div
                    key={sale.id}
                    className="flex items-center justify-between py-3 px-3 -mx-3 rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        <span className="text-[10px] font-bold text-muted-foreground">
                          {sale.customerName.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium">{sale.customerName}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {sale.invoiceNumber} &middot; {timeAgo(sale.saleDate)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold">{formatCurrency(sale.totalAmount)}</p>
                      <Badge variant="outline" className="text-[10px] mt-0.5 capitalize">
                        {sale.paymentMethod}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Alerts */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-warning" />
              <CardTitle className="text-base font-semibold">Low Stock Alerts</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {lowStockItems.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">All stock levels healthy</p>
              ) : (
                lowStockItems.map((item) => (
                  <div
                    key={item.productCode}
                    className="flex items-center justify-between py-3 px-3 -mx-3 rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium">{item.productName}</p>
                      <p className="text-[11px] text-muted-foreground font-mono">{item.productCode}</p>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-bold ${
                          item.quantity <= 2
                            ? 'border-destructive/50 text-destructive bg-destructive/5'
                            : 'border-warning/50 text-warning bg-warning/5'
                        }`}
                      >
                        {item.quantity} left
                      </Badge>
                      <p className="text-[10px] text-muted-foreground mt-0.5">min: {item.reorderLevel}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
