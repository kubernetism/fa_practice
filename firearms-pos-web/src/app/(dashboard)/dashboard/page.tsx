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

const stats = [
  {
    title: "Today's Sales",
    value: 'Rs. 145,200',
    change: '+12.5%',
    trend: 'up' as const,
    icon: DollarSign,
    description: '24 transactions',
  },
  {
    title: 'Orders',
    value: '24',
    change: '+8.2%',
    trend: 'up' as const,
    icon: ShoppingCart,
    description: 'vs 22 yesterday',
  },
  {
    title: 'Products',
    value: '342',
    change: '-2',
    trend: 'down' as const,
    icon: Package,
    description: '5 low stock',
  },
  {
    title: 'Revenue (MTD)',
    value: 'Rs. 2.4M',
    change: '+18.3%',
    trend: 'up' as const,
    icon: TrendingUp,
    description: 'vs last month',
  },
]

const lowStockItems = [
  { name: 'Glock 19 Gen5', code: 'FIR-G19G5', stock: 2, min: 5 },
  { name: '9mm Ammo Box (50)', code: 'AMM-9MM50', stock: 8, min: 20 },
  { name: 'AR-15 Magazine 30rd', code: 'ACC-AR15M30', stock: 3, min: 10 },
  { name: 'Cleaning Kit Universal', code: 'CLN-UNIV', stock: 1, min: 5 },
]

const recentSales = [
  { invoice: 'INV-0024', customer: 'Ahmad Khan', amount: 'Rs. 85,000', time: '10 min ago', method: 'Cash' },
  { invoice: 'INV-0023', customer: 'Walk-in', amount: 'Rs. 12,500', time: '25 min ago', method: 'Card' },
  { invoice: 'INV-0022', customer: 'Ali Raza', amount: 'Rs. 35,000', time: '1 hr ago', method: 'Cash' },
  { invoice: 'INV-0021', customer: 'Fahad Ahmed', amount: 'Rs. 8,200', time: '2 hrs ago', method: 'Mobile' },
  { invoice: 'INV-0020', customer: 'Walk-in', amount: 'Rs. 4,500', time: '3 hrs ago', method: 'Cash' },
]

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page header */}
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
              {recentSales.map((sale) => (
                <div
                  key={sale.invoice}
                  className="flex items-center justify-between py-3 px-3 -mx-3 rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      <span className="text-[10px] font-bold text-muted-foreground">
                        {sale.customer.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{sale.customer}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {sale.invoice} &middot; {sale.time}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{sale.amount}</p>
                    <Badge variant="outline" className="text-[10px] mt-0.5">
                      {sale.method}
                    </Badge>
                  </div>
                </div>
              ))}
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
              {lowStockItems.map((item) => (
                <div
                  key={item.code}
                  className="flex items-center justify-between py-3 px-3 -mx-3 rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium">{item.name}</p>
                    <p className="text-[11px] text-muted-foreground font-mono">{item.code}</p>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-bold ${
                        item.stock <= 2
                          ? 'border-destructive/50 text-destructive bg-destructive/5'
                          : 'border-warning/50 text-warning bg-warning/5'
                      }`}
                    >
                      {item.stock} left
                    </Badge>
                    <p className="text-[10px] text-muted-foreground mt-0.5">min: {item.min}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
