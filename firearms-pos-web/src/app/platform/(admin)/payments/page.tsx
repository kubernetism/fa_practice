'use client'

import { useState, useEffect, Fragment } from 'react'
import {
  Banknote,
  Building2,
  Users,
  Package,
  UserCheck,
  TrendingUp,
  Target,
  ShoppingCart,
  BarChart3,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  CreditCard,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
  getPendingPayments,
  approvePayment,
  rejectPayment,
} from '@/actions/platform/tenants'
import { toast } from 'sonner'

type PaymentRow = {
  id: number
  tenantId: number
  tenantName: string | null
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
  statsBranches: number
  statsUsers: number
  statsProducts: number
  statsCustomers: number
  statsRevenue: string
  statsExpenses: string
  statsNetProfit: string
  statsTotalSales: number
  statsMonthRevenue: string
  createdAt: Date
  updatedAt: Date
}

const paymentTypeLabels: Record<string, string> = {
  jazzcash: 'JazzCash',
  easypaisa: 'EasyPaisa',
  bank_transfer: 'Bank Transfer',
  nayapay: 'NayaPay',
}

const planLabels: Record<string, string> = {
  basic: 'Starter',
  pro: 'Professional',
  enterprise: 'Enterprise',
}

const statusConfig: Record<string, { label: string; className: string; icon: any }> = {
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

function formatDateTime(date: string | Date) {
  return new Date(date).toLocaleString('en-PK', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<PaymentRow[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('pending')
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [rejectingId, setRejectingId] = useState<number | null>(null)
  const [rejectReason, setRejectReason] = useState('')
  const [actionLoading, setActionLoading] = useState<number | null>(null)

  async function loadPayments() {
    setLoading(true)
    const result = await getPendingPayments(statusFilter)
    if (result.success) {
      setPayments(result.data as PaymentRow[])
    }
    setLoading(false)
  }

  useEffect(() => {
    loadPayments()
  }, [statusFilter])

  async function handleApprove(id: number) {
    setActionLoading(id)
    const result = await approvePayment(id)
    if (result.success) {
      toast.success('Payment approved and subscription activated')
      loadPayments()
    } else {
      toast.error(result.message || 'Failed to approve payment')
    }
    setActionLoading(null)
  }

  function openRejectDialog(id: number) {
    setRejectingId(id)
    setRejectReason('')
    setRejectDialogOpen(true)
  }

  async function handleReject() {
    if (!rejectingId || !rejectReason.trim()) {
      toast.error('Please provide a reason for rejection')
      return
    }
    setActionLoading(rejectingId)
    const result = await rejectPayment(rejectingId, rejectReason.trim())
    if (result.success) {
      toast.success('Payment rejected')
      setRejectDialogOpen(false)
      loadPayments()
    } else {
      toast.error(result.message || 'Failed to reject payment')
    }
    setActionLoading(null)
  }

  const pendingCount = payments.filter(p => p.status === 'pending').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Payment Requests</h1>
          <p className="text-muted-foreground text-sm">Review and verify tenant payment submissions</p>
        </div>
        {statusFilter === 'pending' && pendingCount > 0 && (
          <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-sm px-3 py-1">
            {pendingCount} pending
          </Badge>
        )}
      </div>

      {/* Filter */}
      <div className="flex gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
            <SelectItem value="all">All</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Payments Table */}
      <Card className="card-tactical">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium w-8"></th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Tenant</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Plan</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Amount</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Transaction ID</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Payment Type</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Payment Date</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Status</th>
                  <th className="text-left py-3 px-4 text-muted-foreground font-medium">Submitted</th>
                  <th className="text-right py-3 px-4 text-muted-foreground font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => {
                  const isExpanded = expandedId === payment.id
                  const cfg = statusConfig[payment.status] || statusConfig.pending
                  const StatusIcon = cfg.icon
                  const netProfit = Number(payment.statsNetProfit)

                  return (
                    <Fragment key={payment.id}>
                      <tr
                        className={`border-b border-border/50 hover:bg-muted/30 cursor-pointer ${isExpanded ? 'bg-muted/20' : ''}`}
                        onClick={() => setExpandedId(isExpanded ? null : payment.id)}
                      >
                        <td className="py-3 px-4">
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-muted-foreground" />
                          )}
                        </td>
                        <td className="py-3 px-4 font-medium">{payment.tenantName || `Tenant #${payment.tenantId}`}</td>
                        <td className="py-3 px-4">
                          <Badge variant="outline" className="capitalize text-xs">
                            {planLabels[payment.planSlug] || payment.planSlug}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 font-medium">{formatRs(payment.amount)}</td>
                        <td className="py-3 px-4 font-mono text-muted-foreground">{payment.transactionId}</td>
                        <td className="py-3 px-4">{paymentTypeLabels[payment.paymentType] || payment.paymentType}</td>
                        <td className="py-3 px-4 text-muted-foreground">{formatDateTime(payment.paymentDate)}</td>
                        <td className="py-3 px-4">
                          <Badge variant="outline" className={`text-xs ${cfg.className}`}>
                            <StatusIcon className="w-3 h-3 mr-0.5" />
                            {cfg.label}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">{formatDate(payment.createdAt)}</td>
                        <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          {payment.status === 'pending' && (
                            <div className="flex items-center gap-1 justify-end">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 px-2 text-green-400 border-green-400/30 hover:bg-green-400/10"
                                onClick={() => handleApprove(payment.id)}
                                disabled={actionLoading === payment.id}
                              >
                                {actionLoading === payment.id ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <Check className="w-3 h-3 mr-1" />
                                )}
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 px-2 text-red-400 border-red-400/30 hover:bg-red-400/10"
                                onClick={() => openRejectDialog(payment.id)}
                                disabled={actionLoading === payment.id}
                              >
                                <X className="w-3 h-3 mr-1" />
                                Reject
                              </Button>
                            </div>
                          )}
                          {payment.status === 'approved' && (
                            <span className="text-xs text-green-400">Verified</span>
                          )}
                          {payment.status === 'rejected' && (
                            <span className="text-xs text-red-400">Declined</span>
                          )}
                        </td>
                      </tr>

                      {/* Expanded Detail Row */}
                      {isExpanded && (
                        <tr className="border-b border-border/50">
                          <td colSpan={10} className="p-4 bg-muted/10">
                            <div className="space-y-4">
                              {/* Payment Details */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Card className="card-tactical">
                                  <CardHeader className="pb-2">
                                    <CardTitle className="text-sm flex items-center gap-2">
                                      <CreditCard className="w-4 h-4 text-primary" />
                                      Payment Details
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                      <span className="text-muted-foreground">Sender Account</span>
                                      <span className="font-medium">{payment.senderAccount}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                      <span className="text-muted-foreground">Receiver Account</span>
                                      <span className="font-medium">{payment.receiverAccount}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                      <span className="text-muted-foreground">Transaction ID</span>
                                      <span className="font-mono">{payment.transactionId}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                      <span className="text-muted-foreground">Payment Date</span>
                                      <span>{formatDateTime(payment.paymentDate)}</span>
                                    </div>
                                    {payment.notes && (
                                      <div className="pt-2 border-t border-border/50">
                                        <p className="text-xs text-muted-foreground mb-1">Notes:</p>
                                        <p className="text-sm">{payment.notes}</p>
                                      </div>
                                    )}
                                    {payment.adminNotes && (
                                      <div className="pt-2 border-t border-border/50">
                                        <p className="text-xs text-muted-foreground mb-1">Admin Notes:</p>
                                        <p className="text-sm text-amber-400">{payment.adminNotes}</p>
                                      </div>
                                    )}
                                  </CardContent>
                                </Card>

                                {/* Financial Summary */}
                                <Card className="card-tactical">
                                  <CardHeader className="pb-2">
                                    <CardTitle className="text-sm flex items-center gap-2">
                                      <BarChart3 className="w-4 h-4 text-primary" />
                                      Financial Summary
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                      <span className="text-muted-foreground">Total Sales</span>
                                      <span className="font-medium">{payment.statsTotalSales.toLocaleString()} transactions</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                      <span className="text-muted-foreground">Total Revenue</span>
                                      <span className="font-medium text-green-400">{formatRs(payment.statsRevenue)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                      <span className="text-muted-foreground">This Month Revenue</span>
                                      <span className="font-medium">{formatRs(payment.statsMonthRevenue)}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                      <span className="text-muted-foreground">Total Expenses</span>
                                      <span className="font-medium text-red-400">{formatRs(payment.statsExpenses)}</span>
                                    </div>
                                    <div className="border-t border-border/50 pt-2">
                                      <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground font-medium">Net Profit / Loss</span>
                                        <span className={`font-bold ${netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                          {netProfit >= 0 ? '' : '-'}{formatRs(Math.abs(netProfit))}
                                        </span>
                                      </div>
                                    </div>
                                  </CardContent>
                                </Card>
                              </div>

                              {/* Business Stats Snapshot */}
                              <div>
                                <h4 className="text-sm font-medium text-muted-foreground mb-2">Business Snapshot at Submission</h4>
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                                  <Card className="card-tactical">
                                    <CardContent className="p-3 text-center">
                                      <Building2 className="w-4 h-4 text-primary mx-auto mb-1" />
                                      <p className="text-xl font-bold text-white">{payment.statsBranches}</p>
                                      <p className="text-[10px] text-muted-foreground">Branches</p>
                                    </CardContent>
                                  </Card>
                                  <Card className="card-tactical">
                                    <CardContent className="p-3 text-center">
                                      <Users className="w-4 h-4 text-blue-400 mx-auto mb-1" />
                                      <p className="text-xl font-bold text-white">{payment.statsUsers}</p>
                                      <p className="text-[10px] text-muted-foreground">Users</p>
                                    </CardContent>
                                  </Card>
                                  <Card className="card-tactical">
                                    <CardContent className="p-3 text-center">
                                      <Package className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                                      <p className="text-xl font-bold text-white">{payment.statsProducts.toLocaleString()}</p>
                                      <p className="text-[10px] text-muted-foreground">Products</p>
                                    </CardContent>
                                  </Card>
                                  <Card className="card-tactical">
                                    <CardContent className="p-3 text-center">
                                      <UserCheck className="w-4 h-4 text-violet-400 mx-auto mb-1" />
                                      <p className="text-xl font-bold text-white">{payment.statsCustomers.toLocaleString()}</p>
                                      <p className="text-[10px] text-muted-foreground">Customers</p>
                                    </CardContent>
                                  </Card>
                                  <Card className="card-tactical">
                                    <CardContent className="p-3 text-center">
                                      <TrendingUp className="w-4 h-4 text-green-400 mx-auto mb-1" />
                                      <p className="text-xl font-bold text-white">{formatRs(payment.statsRevenue)}</p>
                                      <p className="text-[10px] text-muted-foreground">Revenue</p>
                                    </CardContent>
                                  </Card>
                                  <Card className="card-tactical">
                                    <CardContent className="p-3 text-center">
                                      <Target className={`w-4 h-4 mx-auto mb-1 ${netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`} />
                                      <p className={`text-xl font-bold ${netProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {formatRs(Math.abs(netProfit))}
                                      </p>
                                      <p className="text-[10px] text-muted-foreground">
                                        Net {netProfit >= 0 ? 'Profit' : 'Loss'}
                                      </p>
                                    </CardContent>
                                  </Card>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  )
                })}
                {!loading && payments.length === 0 && (
                  <tr>
                    <td colSpan={10} className="py-12 text-center text-muted-foreground">
                      <Banknote className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      {statusFilter === 'pending' ? 'No pending payment requests' : 'No payment requests found'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="text-red-400">Reject Payment</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this payment submission. The tenant will see this reason.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <Textarea
              placeholder="Reason for rejection (required)..."
              rows={3}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!rejectReason.trim() || actionLoading !== null}
            >
              {actionLoading !== null ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <X className="w-4 h-4 mr-2" />
              )}
              Reject Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
