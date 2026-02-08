'use client'

import { useState } from 'react'
import {
  CreditCard,
  Check,
  Crown,
  Zap,
  Building2,
  Download,
  ArrowUpRight,
  Calendar,
  Users,
  HardDrive,
  BarChart3,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

type Plan = {
  id: string
  name: string
  price: number
  period: string
  icon: typeof Zap
  features: string[]
  limits: { branches: number; users: number; storage: string; products: number }
  popular?: boolean
}

const plans: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 4999,
    period: '/mo',
    icon: Zap,
    features: ['1 Branch', '3 Users', 'Basic POS', 'Email Support', '500 Products'],
    limits: { branches: 1, users: 3, storage: '1 GB', products: 500 },
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 14999,
    period: '/mo',
    icon: Crown,
    popular: true,
    features: ['5 Branches', '15 Users', 'Full POS + Inventory', 'Priority Support', '5,000 Products', 'Reports & Analytics'],
    limits: { branches: 5, users: 15, storage: '10 GB', products: 5000 },
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 39999,
    period: '/mo',
    icon: Building2,
    features: ['Unlimited Branches', 'Unlimited Users', 'Full Suite + API', 'Dedicated Support', 'Unlimited Products', 'Custom Integrations'],
    limits: { branches: -1, users: -1, storage: '100 GB', products: -1 },
  },
]

const invoices = [
  { id: 'INV-2026-002', date: '2026-02-01', amount: 14999, status: 'paid', method: 'JazzCash' },
  { id: 'INV-2026-001', date: '2026-01-01', amount: 14999, status: 'paid', method: 'JazzCash' },
  { id: 'INV-2025-012', date: '2025-12-01', amount: 14999, status: 'paid', method: 'Bank Transfer' },
  { id: 'INV-2025-011', date: '2025-11-01', amount: 14999, status: 'paid', method: 'JazzCash' },
  { id: 'INV-2025-010', date: '2025-10-01', amount: 4999, status: 'paid', method: 'EasyPaisa' },
  { id: 'INV-2025-009', date: '2025-09-01', amount: 4999, status: 'paid', method: 'EasyPaisa' },
]

const currentPlan = plans[1] // Professional

export default function BillingPage() {
  const [upgradeOpen, setUpgradeOpen] = useState(false)

  const usageItems = [
    { label: 'Branches', used: 3, limit: currentPlan.limits.branches, icon: Building2 },
    { label: 'Users', used: 6, limit: currentPlan.limits.users, icon: Users },
    { label: 'Products', used: 847, limit: currentPlan.limits.products, icon: BarChart3 },
    { label: 'Storage', used: '2.3 GB', limit: currentPlan.limits.storage, icon: HardDrive },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Billing</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your subscription and payments</p>
        </div>
      </div>

      {/* Current Plan */}
      <Card className="card-tactical border-primary/30">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Crown className="w-6 h-6 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold">Professional Plan</h2>
                  <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/20">Active</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Rs. 14,999/month &middot; Renews on March 1, 2026
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">Cancel Plan</Button>
              <Button size="sm" className="brass-glow" onClick={() => setUpgradeOpen(true)}>
                <ArrowUpRight className="w-4 h-4 mr-1" />
                Upgrade
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Usage */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {usageItems.map((item) => {
          const isUnlimited = typeof item.limit === 'number' && item.limit === -1
          const usedNum = typeof item.used === 'number' ? item.used : 0
          const limitNum = typeof item.limit === 'number' ? item.limit : 0
          const pct = isUnlimited ? 0 : typeof item.used === 'number' && typeof item.limit === 'number' ? Math.round((usedNum / limitNum) * 100) : 0
          const isHigh = pct > 75

          return (
            <Card key={item.label} className="card-tactical">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="space-y-1">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{item.label}</p>
                    <p className="text-lg font-bold">
                      {typeof item.used === 'string' ? item.used : item.used.toLocaleString()}
                      <span className="text-sm font-normal text-muted-foreground">
                        {' / '}
                        {isUnlimited ? 'Unlimited' : typeof item.limit === 'string' ? item.limit : item.limit.toLocaleString()}
                      </span>
                    </p>
                  </div>
                  <item.icon className="w-4 h-4 text-muted-foreground" />
                </div>
                {!isUnlimited && typeof item.used === 'number' && (
                  <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${isHigh ? 'bg-amber-500' : 'bg-primary'}`}
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Payment Method */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="card-tactical">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-primary" />
              Payment Method
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-lg border border-primary/20 bg-primary/5">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">JazzCash Mobile Wallet</p>
                <p className="text-xs text-muted-foreground">+92-300-***-2233</p>
              </div>
              <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/20">Default</Badge>
            </div>
            <Button variant="outline" size="sm" className="w-full">
              <CreditCard className="w-4 h-4 mr-2" />
              Add Payment Method
            </Button>
          </CardContent>
        </Card>

        <Card className="card-tactical">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              Billing Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Current Period</span>
                <span>Feb 1 - Feb 28, 2026</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Next Billing Date</span>
                <span>March 1, 2026</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Monthly Cost</span>
                <span className="font-semibold">Rs. 14,999</span>
              </div>
              <div className="border-t border-border/50 pt-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Paid (Last 6 months)</span>
                  <span className="font-semibold text-primary">Rs. 64,993</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invoice History */}
      <Card className="card-tactical">
        <CardHeader>
          <CardTitle className="text-base">Invoice History</CardTitle>
          <CardDescription>Download past invoices for your records</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[60px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell className="font-mono text-sm">{inv.id}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{inv.date}</TableCell>
                  <TableCell className="text-sm font-medium">Rs. {inv.amount.toLocaleString()}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{inv.method}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px] bg-success/10 text-success border-success/20">
                      <Check className="w-3 h-3 mr-0.5" />
                      Paid
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                      <Download className="w-3.5 h-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Upgrade Dialog */}
      <Dialog open={upgradeOpen} onOpenChange={setUpgradeOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Choose a Plan</DialogTitle>
            <DialogDescription>Select the plan that fits your business needs</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-4 mt-4">
            {plans.map((plan) => {
              const isCurrent = plan.id === currentPlan.id
              return (
                <div
                  key={plan.id}
                  className={`relative rounded-xl border p-4 space-y-4 ${
                    plan.popular
                      ? 'border-primary/50 bg-primary/5'
                      : 'border-border/50'
                  }`}
                >
                  {plan.popular && (
                    <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px]">
                      Most Popular
                    </Badge>
                  )}
                  <div className="text-center space-y-1">
                    <plan.icon className={`w-6 h-6 mx-auto ${plan.popular ? 'text-primary' : 'text-muted-foreground'}`} />
                    <h3 className="font-semibold">{plan.name}</h3>
                    <div>
                      <span className="text-2xl font-bold">Rs. {plan.price.toLocaleString()}</span>
                      <span className="text-xs text-muted-foreground">{plan.period}</span>
                    </div>
                  </div>
                  <ul className="space-y-2">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-xs">
                        <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                        <span className="text-muted-foreground">{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`w-full ${plan.popular && !isCurrent ? 'brass-glow' : ''}`}
                    variant={isCurrent ? 'outline' : plan.popular ? 'default' : 'outline'}
                    size="sm"
                    disabled={isCurrent}
                  >
                    {isCurrent ? 'Current Plan' : plan.id === 'enterprise' ? 'Contact Sales' : 'Upgrade'}
                  </Button>
                </div>
              )
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
