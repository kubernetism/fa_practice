import { Building2, Users, DollarSign, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getPlatformStats, getRecentSignups } from '@/actions/platform/stats'

export default async function PlatformDashboardPage() {
  const [statsResult, signupsResult] = await Promise.all([
    getPlatformStats(),
    getRecentSignups(),
  ])

  const stats = statsResult.data
  const signups = signupsResult.data

  const kpiCards = [
    {
      title: 'Total Tenants',
      value: stats?.totalTenants ?? 0,
      icon: Building2,
      description: `${stats?.trialTenants ?? 0} trial, ${stats?.suspendedTenants ?? 0} suspended`,
    },
    {
      title: 'Active Subscriptions',
      value: stats?.activeTenants ?? 0,
      icon: TrendingUp,
      description: `${stats?.cancelledTenants ?? 0} cancelled`,
    },
    {
      title: 'MRR',
      value: `Rs ${Number(stats?.mrr ?? 0).toLocaleString()}`,
      icon: DollarSign,
      description: 'Monthly recurring revenue',
    },
    {
      title: 'New Signups (30d)',
      value: stats?.newSignups ?? 0,
      icon: Users,
      description: `${stats?.totalUsers ?? 0} total users`,
    },
  ]

  const statusColors: Record<string, string> = {
    trial: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    active: 'bg-green-500/10 text-green-400 border-green-500/20',
    suspended: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Platform Dashboard</h1>
        <p className="text-muted-foreground text-sm">
          Overview of all tenants and platform metrics
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map((card) => (
          <Card key={card.title} className="card-tactical">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <card.icon className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Signups */}
      <Card className="card-tactical">
        <CardHeader>
          <CardTitle className="text-lg">Recent Signups</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 text-muted-foreground font-medium">Name</th>
                  <th className="text-left py-3 px-2 text-muted-foreground font-medium">Plan</th>
                  <th className="text-left py-3 px-2 text-muted-foreground font-medium">Status</th>
                  <th className="text-left py-3 px-2 text-muted-foreground font-medium">Created</th>
                </tr>
              </thead>
              <tbody>
                {signups?.map((tenant) => (
                  <tr key={tenant.id} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="py-3 px-2 font-medium">{tenant.name}</td>
                    <td className="py-3 px-2">
                      <Badge variant="outline" className="capitalize text-xs">
                        {tenant.subscriptionPlan}
                      </Badge>
                    </td>
                    <td className="py-3 px-2">
                      <Badge
                        variant="outline"
                        className={`capitalize text-xs ${statusColors[tenant.subscriptionStatus] || ''}`}
                      >
                        {tenant.subscriptionStatus}
                      </Badge>
                    </td>
                    <td className="py-3 px-2 text-muted-foreground">
                      {new Date(tenant.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
                {(!signups || signups.length === 0) && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-muted-foreground">
                      No tenants yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
