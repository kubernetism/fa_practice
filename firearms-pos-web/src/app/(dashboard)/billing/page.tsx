'use client'

import { useState, useEffect } from 'react'
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
  BarChart3,
  Package,
  TrendingUp,
  ShoppingCart,
  UserCheck,
  Clock,
  Shield,
  Rocket,
  Target,
  ArrowRight,
  Sparkles,
  Loader2,
  Send,
  FileText,
  XCircle,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { PageLoader } from '@/components/ui/page-loader'
import { getBillingData, submitPayment, getMySubmissions } from '@/actions/billing'
import { toast } from 'sonner'

type BillingData = {
  tenant: {
    name: string
    subscriptionStatus: string
    subscriptionPlan: string
    trialEndsAt: string | null
    subscriptionEndsAt: string | null
    createdAt: string
  }
  plans: {
    id: number
    name: string
    slug: string
    priceMonthly: string
    priceYearly: string | null
    maxBranches: number
    maxUsers: number
    maxProducts: number | null
    features: unknown
    isActive: boolean
  }[]
  invoices: {
    id: number
    amount: string
    status: string
    billingPeriodStart: Date
    billingPeriodEnd: Date
    paidAt: Date | null
    createdAt: Date
    planName: string | null
  }[]
  stats: {
    branches: { total: number; active: number }
    users: { total: number; active: number }
    products: { total: number; active: number }
    customers: number
    totalSales: number
    totalRevenue: string
    monthRevenue: string
    totalExpenses: string
    totalPaid: number
  }
}

type PaymentSubmission = {
  id: number
  planSlug: string
  amount: string
  transactionId: string
  paymentType: string
  paymentDate: Date
  senderAccount: string
  receiverAccount: string
  notes: string | null
  status: string
  adminNotes: string | null
  createdAt: Date
}

// Hardcoded plan details for display when DB plans are empty
const fallbackPlans = [
  {
    slug: 'basic',
    name: 'Starter',
    priceMonthly: 4999,
    icon: Zap,
    features: ['1 Branch', '3 Users', '500 Products', 'Basic POS', 'Email Support'],
    maxBranches: 1,
    maxUsers: 3,
    maxProducts: 500,
  },
  {
    slug: 'pro',
    name: 'Professional',
    priceMonthly: 14999,
    icon: Crown,
    popular: true,
    features: ['5 Branches', '15 Users', '5,000 Products', 'Full POS + Inventory', 'Reports & Analytics', 'Priority Support'],
    maxBranches: 5,
    maxUsers: 15,
    maxProducts: 5000,
  },
  {
    slug: 'enterprise',
    name: 'Enterprise',
    priceMonthly: 39999,
    icon: Building2,
    features: ['Unlimited Branches', 'Unlimited Users', 'Unlimited Products', 'Full Suite + API', 'Custom Integrations', 'Dedicated Support'],
    maxBranches: -1,
    maxUsers: -1,
    maxProducts: -1,
  },
]

const benefitsData = [
  {
    icon: ShoppingCart,
    title: 'Complete POS System',
    description: 'Process sales, manage cash registers, handle returns, and track every transaction with detailed receipts.',
  },
  {
    icon: Package,
    title: 'Inventory Management',
    description: 'Real-time stock tracking, low-stock alerts, inter-branch transfers, and automated reorder notifications.',
  },
  {
    icon: BarChart3,
    title: 'Reports & Analytics',
    description: 'Profit & loss, sales reports, tax summaries, inventory valuation, and daily sales breakdowns.',
  },
  {
    icon: Building2,
    title: 'Multi-Branch Support',
    description: 'Manage multiple locations from a single dashboard with branch-level inventory and user permissions.',
  },
  {
    icon: Users,
    title: 'Team Management',
    description: 'Role-based access control, activity audit logs, and per-user performance tracking.',
  },
  {
    icon: Shield,
    title: 'Compliance & Records',
    description: 'License tracking, customer records, referral commissions, and complete audit trails for regulatory compliance.',
  },
]

const paymentTypeLabels: Record<string, string> = {
  jazzcash: 'JazzCash',
  easypaisa: 'EasyPaisa',
  bank_transfer: 'Bank Transfer',
  nayapay: 'NayaPay',
}

const submissionStatusConfig: Record<string, { label: string; className: string; icon: any }> = {
  pending: { label: 'Pending', className: 'bg-amber-500/10 text-amber-400 border-amber-500/20', icon: AlertCircle },
  approved: { label: 'Approved', className: 'bg-green-500/10 text-green-400 border-green-500/20', icon: CheckCircle2 },
  rejected: { label: 'Rejected', className: 'bg-red-500/10 text-red-400 border-red-500/20', icon: XCircle },
}

function formatRs(amount: number | string) {
  return `Rs. ${Number(amount).toLocaleString('en-PK')}`
}

function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString('en-PK', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export default function BillingPage() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<BillingData | null>(null)
  const [upgradeOpen, setUpgradeOpen] = useState(false)
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<typeof fallbackPlans[0] | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submissions, setSubmissions] = useState<PaymentSubmission[]>([])

  // Payment form state
  const [paymentForm, setPaymentForm] = useState({
    transactionId: '',
    paymentType: '' as string,
    paymentDate: '',
    senderAccount: '',
    receiverAccount: '',
    notes: '',
  })

  useEffect(() => {
    loadBillingData()
  }, [])

  const loadBillingData = async () => {
    try {
      setLoading(true)
      const [billingResult, submissionsResult] = await Promise.all([
        getBillingData(),
        getMySubmissions(),
      ])
      if (billingResult.success) {
        setData(billingResult.data as BillingData)
      }
      if (submissionsResult.success) {
        setSubmissions(submissionsResult.data as PaymentSubmission[])
      }
    } catch (error) {
      console.error('Failed to load billing data:', error)
      toast.error('Failed to load billing data')
    } finally {
      setLoading(false)
    }
  }

  const openPaymentDialog = (plan: typeof fallbackPlans[0]) => {
    setSelectedPlan(plan)
    setPaymentForm({
      transactionId: '',
      paymentType: '',
      paymentDate: '',
      senderAccount: '',
      receiverAccount: '',
      notes: '',
    })
    setPaymentDialogOpen(true)
    setUpgradeOpen(false)
  }

  const handleSubmitPayment = async () => {
    if (!selectedPlan) return
    if (!paymentForm.transactionId || !paymentForm.paymentType || !paymentForm.paymentDate || !paymentForm.senderAccount || !paymentForm.receiverAccount) {
      toast.error('Please fill in all required fields')
      return
    }

    setSubmitting(true)
    try {
      const result = await submitPayment({
        planSlug: selectedPlan.slug as 'basic' | 'pro' | 'enterprise',
        amount: String(selectedPlan.priceMonthly),
        transactionId: paymentForm.transactionId,
        paymentType: paymentForm.paymentType as 'jazzcash' | 'easypaisa' | 'bank_transfer' | 'nayapay',
        paymentDate: paymentForm.paymentDate,
        senderAccount: paymentForm.senderAccount,
        receiverAccount: paymentForm.receiverAccount,
        notes: paymentForm.notes || undefined,
      })

      if (result.success) {
        toast.success('Payment submitted successfully! We will verify and activate your subscription shortly.')
        setPaymentDialogOpen(false)
        loadBillingData()
      }
    } catch (error) {
      console.error('Failed to submit payment:', error)
      toast.error('Failed to submit payment. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <PageLoader />
  if (!data) return null

  const { tenant, invoices, stats } = data
  const isTrial = tenant.subscriptionStatus === 'trial'
  const isActive = tenant.subscriptionStatus === 'active'
  const isSuspended = tenant.subscriptionStatus === 'suspended'

  const trialDaysRemaining = tenant.trialEndsAt
    ? Math.max(0, Math.ceil((new Date(tenant.trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 0

  const netProfit = Number(stats.totalRevenue) - Number(stats.totalExpenses)
  const profitMargin = Number(stats.totalRevenue) > 0
    ? ((netProfit / Number(stats.totalRevenue)) * 100).toFixed(1)
    : '0.0'

  // Resolve current plan display
  const currentPlanSlug = tenant.subscriptionPlan
  const currentFallback = fallbackPlans.find(p => p.slug === currentPlanSlug) || fallbackPlans[0]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white font-display">Billing & Subscription</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your plan, view payment history, and see your business overview
        </p>
      </div>

      {/* Trial Hero Banner */}
      {isTrial && (
        <Card className="card-tactical border-amber-500/30 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/5 via-amber-500/10 to-amber-500/5" />
          <CardContent className="p-6 relative">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                  <Clock className="w-7 h-7 text-amber-500" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-lg font-bold text-white">Free Trial</h2>
                    <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-400 border-amber-500/20">
                      {trialDaysRemaining} day{trialDaysRemaining !== 1 ? 's' : ''} left
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground max-w-lg">
                    You&apos;re exploring {tenant.name} on a free trial
                    {tenant.trialEndsAt && (
                      <> ending <span className="text-amber-400 font-medium">{formatDate(tenant.trialEndsAt)}</span></>
                    )}.
                    Upgrade to keep all your data and unlock the full potential of your business management.
                  </p>
                </div>
              </div>
              <Button className="brass-glow shrink-0" onClick={() => setUpgradeOpen(true)}>
                <Rocket className="w-4 h-4 mr-2" />
                Upgrade Now
              </Button>
            </div>

            {/* Trial progress bar */}
            {tenant.trialEndsAt && (
              <div className="mt-4">
                <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                  <span>Started {formatDate(tenant.createdAt)}</span>
                  <span>Expires {formatDate(tenant.trialEndsAt)}</span>
                </div>
                <div className="w-full h-2 bg-muted/50 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      trialDaysRemaining <= 3 ? 'bg-red-500' : trialDaysRemaining <= 7 ? 'bg-amber-500' : 'bg-primary'
                    }`}
                    style={{
                      width: `${Math.min(100, Math.max(5, ((14 - trialDaysRemaining) / 14) * 100))}%`,
                    }}
                  />
                </div>
              </div>
            )}

            {/* Steps to upgrade */}
            <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-card/50 border border-border/50">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">1</div>
                <div>
                  <p className="text-sm font-medium text-white">Choose a Plan</p>
                  <p className="text-xs text-muted-foreground">Pick the right plan for your business size</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-card/50 border border-border/50">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">2</div>
                <div>
                  <p className="text-sm font-medium text-white">Submit Payment Details</p>
                  <p className="text-xs text-muted-foreground">Pay via JazzCash, EasyPaisa, or bank transfer</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-card/50 border border-border/50">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">3</div>
                <div>
                  <p className="text-sm font-medium text-white">Verified & Activated</p>
                  <p className="text-xs text-muted-foreground">Admin verifies payment, subscription activates</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Subscription Card */}
      {isActive && (
        <Card className="card-tactical border-primary/30">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Crown className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-white">{currentFallback.name} Plan</h2>
                    <Badge variant="outline" className="text-[10px] bg-green-500/10 text-green-400 border-green-500/20">Active</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {formatRs(currentFallback.priceMonthly)}/month
                    {tenant.subscriptionEndsAt && (
                      <> &middot; Renews on {formatDate(tenant.subscriptionEndsAt)}</>
                    )}
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
      )}

      {/* Suspended Banner */}
      {isSuspended && (
        <Card className="card-tactical border-destructive/30">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-destructive" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-white">Subscription Suspended</h2>
                    <Badge variant="outline" className="text-[10px] bg-destructive/10 text-destructive border-destructive/20">Suspended</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Your subscription is currently suspended. Please renew to restore access to all features.
                  </p>
                </div>
              </div>
              <Button size="sm" className="brass-glow" onClick={() => setUpgradeOpen(true)}>
                <Rocket className="w-4 h-4 mr-1" />
                Reactivate
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Your Business at a Glance */}
      <div>
        <h2 className="text-base font-semibold text-white mb-3">Your Business at a Glance</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <Card className="card-tactical">
            <CardContent className="p-4 text-center">
              <Building2 className="w-5 h-5 text-primary mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{stats.branches.active}</p>
              <p className="text-xs text-muted-foreground">Active Branches</p>
            </CardContent>
          </Card>
          <Card className="card-tactical">
            <CardContent className="p-4 text-center">
              <Users className="w-5 h-5 text-blue-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{stats.users.active}</p>
              <p className="text-xs text-muted-foreground">Active Users</p>
            </CardContent>
          </Card>
          <Card className="card-tactical">
            <CardContent className="p-4 text-center">
              <Package className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{stats.products.active.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Products</p>
            </CardContent>
          </Card>
          <Card className="card-tactical">
            <CardContent className="p-4 text-center">
              <UserCheck className="w-5 h-5 text-violet-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{stats.customers.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Customers</p>
            </CardContent>
          </Card>
          <Card className="card-tactical">
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-5 h-5 text-green-400 mx-auto mb-2" />
              <p className="text-2xl font-bold text-white">{formatRs(stats.totalRevenue)}</p>
              <p className="text-xs text-muted-foreground">Total Revenue</p>
            </CardContent>
          </Card>
          <Card className="card-tactical">
            <CardContent className="p-4 text-center">
              <Target className={`w-5 h-5 mx-auto mb-2 ${netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`} />
              <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {formatRs(Math.abs(netProfit))}
              </p>
              <p className="text-xs text-muted-foreground">
                Net {netProfit >= 0 ? 'Profit' : 'Loss'} ({profitMargin}%)
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Financial Summary + Payment Method */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="card-tactical">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              Financial Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Sales</span>
                <span className="font-medium">{stats.totalSales.toLocaleString()} transactions</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Revenue</span>
                <span className="font-medium text-green-400">{formatRs(stats.totalRevenue)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">This Month Revenue</span>
                <span className="font-medium">{formatRs(stats.monthRevenue)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Expenses</span>
                <span className="font-medium text-red-400">{formatRs(stats.totalExpenses)}</span>
              </div>
              <div className="border-t border-border/50 pt-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground font-medium">Net Profit / Loss</span>
                  <span className={`font-bold ${netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {netProfit >= 0 ? '' : '-'}{formatRs(Math.abs(netProfit))}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-tactical">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              Subscription Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <Badge
                  variant="outline"
                  className={`text-[10px] ${
                    isTrial ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      : isActive ? 'bg-green-500/10 text-green-400 border-green-500/20'
                        : 'bg-red-500/10 text-red-400 border-red-500/20'
                  }`}
                >
                  {tenant.subscriptionStatus.charAt(0).toUpperCase() + tenant.subscriptionStatus.slice(1)}
                </Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Current Plan</span>
                <span className="font-medium capitalize">{currentFallback.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Account Created</span>
                <span>{formatDate(tenant.createdAt)}</span>
              </div>
              {isTrial && tenant.trialEndsAt && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Trial Ends</span>
                  <span className="text-amber-400 font-medium">{formatDate(tenant.trialEndsAt)}</span>
                </div>
              )}
              {isActive && tenant.subscriptionEndsAt && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Next Billing Date</span>
                  <span>{formatDate(tenant.subscriptionEndsAt)}</span>
                </div>
              )}
              {stats.totalPaid > 0 && (
                <div className="border-t border-border/50 pt-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Paid to Date</span>
                    <span className="font-bold text-primary">{formatRs(stats.totalPaid)}</span>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invoice History */}
      {invoices.length > 0 && (
        <Card className="card-tactical">
          <CardHeader>
            <CardTitle className="text-base">Payment History</CardTitle>
            <CardDescription>Your subscription payment records</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Period</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Paid On</TableHead>
                  <TableHead className="w-[60px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((inv) => (
                  <TableRow key={inv.id}>
                    <TableCell className="font-mono text-sm">INV-{String(inv.id).padStart(5, '0')}</TableCell>
                    <TableCell className="text-sm">{inv.planName || '\u2014'}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(inv.billingPeriodStart)} - {formatDate(inv.billingPeriodEnd)}
                    </TableCell>
                    <TableCell className="text-sm font-medium">{formatRs(inv.amount)}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${
                          inv.status === 'paid'
                            ? 'bg-green-500/10 text-green-400 border-green-500/20'
                            : inv.status === 'pending'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                              : 'bg-red-500/10 text-red-400 border-red-500/20'
                        }`}
                      >
                        {inv.status === 'paid' && <Check className="w-3 h-3 mr-0.5" />}
                        {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {inv.paidAt ? formatDate(inv.paidAt) : '\u2014'}
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
      )}

      {/* No invoices — new user message */}
      {invoices.length === 0 && !isTrial && (
        <Card className="card-tactical">
          <CardContent className="p-8 text-center">
            <CreditCard className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-base font-semibold text-white mb-1">No Payment History</h3>
            <p className="text-sm text-muted-foreground">
              You don&apos;t have any payment records yet. Your payment history will appear here once you subscribe.
            </p>
          </CardContent>
        </Card>
      )}

      {/* My Payment Requests */}
      {submissions.length > 0 && (
        <Card className="card-tactical">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              My Payment Requests
            </CardTitle>
            <CardDescription>Track the status of your payment submissions</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Transaction ID</TableHead>
                  <TableHead>Payment Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {submissions.map((sub) => {
                  const statusCfg = submissionStatusConfig[sub.status] || submissionStatusConfig.pending
                  const StatusIcon = statusCfg.icon
                  return (
                    <TableRow key={sub.id}>
                      <TableCell className="font-mono text-sm">PAY-{String(sub.id).padStart(5, '0')}</TableCell>
                      <TableCell className="text-sm capitalize">{fallbackPlans.find(p => p.slug === sub.planSlug)?.name || sub.planSlug}</TableCell>
                      <TableCell className="text-sm font-medium">{formatRs(sub.amount)}</TableCell>
                      <TableCell className="text-sm font-mono text-muted-foreground">{sub.transactionId}</TableCell>
                      <TableCell className="text-sm">{paymentTypeLabels[sub.paymentType] || sub.paymentType}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-[10px] ${statusCfg.className}`}>
                          <StatusIcon className="w-3 h-3 mr-0.5" />
                          {statusCfg.label}
                        </Badge>
                        {sub.status === 'rejected' && sub.adminNotes && (
                          <p className="text-xs text-red-400 mt-1">{sub.adminNotes}</p>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">{formatDate(sub.createdAt)}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Why Upgrade / Feature Benefits */}
      {(isTrial || isSuspended) && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-primary" />
            <h2 className="text-base font-semibold text-white">Why Upgrade?</h2>
          </div>
          <p className="text-sm text-muted-foreground mb-4 max-w-2xl">
            Firearms POS is a complete business management solution built specifically for firearms dealers.
            From point of sale to accounting, inventory to compliance — manage your entire operation from one place.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {benefitsData.map((benefit) => (
              <Card key={benefit.title} className="card-tactical group hover:border-primary/30 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                      <benefit.icon className="w-4.5 h-4.5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white mb-0.5">{benefit.title}</h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">{benefit.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Choose Plan Section (inline for trial users) */}
      {isTrial && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Crown className="w-4 h-4 text-primary" />
            <h2 className="text-base font-semibold text-white">Choose Your Plan</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {fallbackPlans.map((plan) => {
              const isCurrent = plan.slug === currentPlanSlug
              return (
                <Card
                  key={plan.slug}
                  className={`card-tactical relative overflow-hidden transition-all ${
                    plan.popular
                      ? 'border-primary/50 ring-1 ring-primary/20'
                      : 'hover:border-border/80'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute top-0 right-0 px-3 py-1 bg-primary text-primary-foreground text-[10px] font-semibold rounded-bl-lg">
                      Most Popular
                    </div>
                  )}
                  <CardContent className="p-5 space-y-4">
                    <div className="text-center space-y-2">
                      <plan.icon className={`w-8 h-8 mx-auto ${plan.popular ? 'text-primary' : 'text-muted-foreground'}`} />
                      <h3 className="font-bold text-white text-lg">{plan.name}</h3>
                      <div>
                        <span className="text-3xl font-bold text-white">{formatRs(plan.priceMonthly)}</span>
                        <span className="text-sm text-muted-foreground">/month</span>
                      </div>
                    </div>
                    <ul className="space-y-2.5">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-center gap-2 text-sm">
                          <Check className="w-4 h-4 text-primary shrink-0" />
                          <span className="text-muted-foreground">{f}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      className={`w-full ${plan.popular && !isCurrent ? 'brass-glow' : ''}`}
                      variant={isCurrent ? 'outline' : plan.popular ? 'default' : 'outline'}
                      disabled={isCurrent}
                      onClick={() => !isCurrent && openPaymentDialog(plan)}
                    >
                      {isCurrent ? 'Current Plan' : 'Get Started'}
                      {!isCurrent && <ArrowRight className="w-4 h-4 ml-2" />}
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* Upgrade Dialog (for active users wanting to upgrade) */}
      <Dialog open={upgradeOpen} onOpenChange={setUpgradeOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Choose a Plan</DialogTitle>
            <DialogDescription>Select the plan that fits your business needs</DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-4 mt-4">
            {fallbackPlans.map((plan) => {
              const isCurrent = plan.slug === currentPlanSlug
              return (
                <div
                  key={plan.slug}
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
                      <span className="text-2xl font-bold">{formatRs(plan.priceMonthly)}</span>
                      <span className="text-xs text-muted-foreground">/mo</span>
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
                    onClick={() => !isCurrent && openPaymentDialog(plan)}
                  >
                    {isCurrent ? 'Current Plan' : 'Select Plan'}
                  </Button>
                </div>
              )
            })}
          </div>
        </DialogContent>
      </Dialog>

      {/* Submit Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="w-5 h-5 text-primary" />
              Submit Payment
            </DialogTitle>
            <DialogDescription>
              Enter your payment transaction details for verification
            </DialogDescription>
          </DialogHeader>

          {selectedPlan && (
            <div className="space-y-4 mt-2">
              {/* Plan & Amount (read-only) */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/50">
                <selectedPlan.icon className="w-5 h-5 text-primary shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{selectedPlan.name} Plan</p>
                  <p className="text-xs text-muted-foreground">Monthly subscription</p>
                </div>
                <p className="text-lg font-bold text-primary">{formatRs(selectedPlan.priceMonthly)}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="transactionId">Transaction ID *</Label>
                  <Input
                    id="transactionId"
                    placeholder="e.g. TXN123456789"
                    value={paymentForm.transactionId}
                    onChange={(e) => setPaymentForm(prev => ({ ...prev, transactionId: e.target.value }))}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="paymentType">Payment Method *</Label>
                  <Select
                    value={paymentForm.paymentType}
                    onValueChange={(val) => setPaymentForm(prev => ({ ...prev, paymentType: val }))}
                  >
                    <SelectTrigger id="paymentType">
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="jazzcash">JazzCash</SelectItem>
                      <SelectItem value="easypaisa">EasyPaisa</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                      <SelectItem value="nayapay">NayaPay</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="paymentDate">Payment Date & Time *</Label>
                <Input
                  id="paymentDate"
                  type="datetime-local"
                  value={paymentForm.paymentDate}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, paymentDate: e.target.value }))}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="senderAccount">Sender Account Details *</Label>
                <Input
                  id="senderAccount"
                  placeholder="Your name, phone or account number"
                  value={paymentForm.senderAccount}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, senderAccount: e.target.value }))}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="receiverAccount">Receiver Account Details *</Label>
                <Input
                  id="receiverAccount"
                  placeholder="Account you paid to"
                  value={paymentForm.receiverAccount}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, receiverAccount: e.target.value }))}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Any additional details..."
                  rows={2}
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>
            </div>
          )}

          <DialogFooter className="mt-2">
            <Button variant="outline" onClick={() => setPaymentDialogOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmitPayment} disabled={submitting} className="brass-glow">
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit Payment
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
