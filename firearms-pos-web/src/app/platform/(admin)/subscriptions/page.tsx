import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { db } from '@/lib/db'
import { subscriptionInvoices, subscriptionPlans, tenants } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { getPlatformAdmin } from '@/lib/auth/platform'

const invoiceStatusColors: Record<string, string> = {
  pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  paid: 'bg-green-500/10 text-green-400 border-green-500/20',
  failed: 'bg-red-500/10 text-red-400 border-red-500/20',
  refunded: 'bg-muted text-muted-foreground',
}

export default async function SubscriptionsPage() {
  await getPlatformAdmin()

  const invoices = await db
    .select({
      id: subscriptionInvoices.id,
      amount: subscriptionInvoices.amount,
      status: subscriptionInvoices.status,
      billingPeriodStart: subscriptionInvoices.billingPeriodStart,
      billingPeriodEnd: subscriptionInvoices.billingPeriodEnd,
      paidAt: subscriptionInvoices.paidAt,
      createdAt: subscriptionInvoices.createdAt,
      tenantName: tenants.name,
      planName: subscriptionPlans.name,
    })
    .from(subscriptionInvoices)
    .leftJoin(tenants, eq(subscriptionInvoices.tenantId, tenants.id))
    .leftJoin(subscriptionPlans, eq(subscriptionInvoices.planId, subscriptionPlans.id))
    .orderBy(desc(subscriptionInvoices.createdAt))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Subscriptions</h1>
        <p className="text-muted-foreground text-sm">All invoices across tenants</p>
      </div>

      <Card className="card-tactical">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Tenant</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Plan</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Amount</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Period</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Paid At</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv.id} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="py-3 px-4 font-medium">{inv.tenantName}</td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className="text-xs">{inv.planName || '-'}</Badge>
                    </td>
                    <td className="py-3 px-4">Rs {Number(inv.amount).toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <Badge
                        variant="outline"
                        className={`capitalize text-xs ${invoiceStatusColors[inv.status] || ''}`}
                      >
                        {inv.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {new Date(inv.billingPeriodStart).toLocaleDateString()} -{' '}
                      {new Date(inv.billingPeriodEnd).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {inv.paidAt ? new Date(inv.paidAt).toLocaleDateString() : '-'}
                    </td>
                  </tr>
                ))}
                {invoices.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-muted-foreground">
                      No invoices yet
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
