import React, { useState, useEffect, useCallback } from 'react'
import {
  Search,
  Filter,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Eye,
  CreditCard,
  RefreshCw,
  Building2,
  Calendar,
  FileText,
  TrendingDown,
  Plus,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useBranch } from '@/contexts/branch-context'

type PayableStatus = 'pending' | 'partial' | 'paid' | 'overdue' | 'cancelled'
type PaymentMethod = 'cash' | 'card' | 'bank_transfer' | 'cheque' | 'mobile'

interface PayablePayment {
  id: number
  amount: number
  paymentMethod: PaymentMethod
  referenceNumber?: string
  notes?: string
  paymentDate: string
  paidByUser?: {
    id: number
    fullName: string
  }
}

interface Payable {
  id: number
  supplierId: number
  purchaseId?: number
  branchId: number
  invoiceNumber: string
  totalAmount: number
  paidAmount: number
  remainingAmount: number
  status: PayableStatus
  dueDate?: string
  paymentTerms?: string
  notes?: string
  createdAt: string
  supplier?: {
    id: number
    name: string
    phone?: string
    email?: string
  }
  branch?: {
    id: number
    name: string
  }
  payments?: PayablePayment[]
}

interface AgingData {
  totalOutstanding: number
  dpo: number
  aging: {
    current: { amount: number; count: number }
    days1to30: { amount: number; count: number }
    days31to60: { amount: number; count: number }
    days61to90: { amount: number; count: number }
    days90plus: { amount: number; count: number }
  }
  upcomingPayments: Array<{
    supplier: string
    amount: number
    dueDate: string
    daysUntilDue: number
  }>
  topOverdue: Array<{
    supplier: string
    amount: number
    oldestDueDate: string
    daysOverdue: number
  }>
}

const statusConfig: Record<PayableStatus, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: <Clock className="h-3 w-3" /> },
  partial: { label: 'Partial', color: 'bg-blue-100 text-blue-800', icon: <DollarSign className="h-3 w-3" /> },
  paid: { label: 'Paid', color: 'bg-green-100 text-green-800', icon: <CheckCircle2 className="h-3 w-3" /> },
  overdue: { label: 'Overdue', color: 'bg-red-100 text-red-800', icon: <AlertTriangle className="h-3 w-3" /> },
  cancelled: { label: 'Cancelled', color: 'bg-gray-100 text-gray-800', icon: <XCircle className="h-3 w-3" /> },
}

export function AccountPayablesScreen() {
  const { currentBranch } = useBranch()
  const [activeTab, setActiveTab] = useState('list')
  const [payables, setPayables] = useState<Payable[]>([])
  const [agingData, setAgingData] = useState<AgingData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<PayableStatus | 'all'>('all')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [summary, setSummary] = useState<{ totalPayables: number; totalAmount: number; totalPaid: number; totalRemaining: number } | null>(null)

  // Payment dialog
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [selectedPayable, setSelectedPayable] = useState<Payable | null>(null)
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bank_transfer')
  const [paymentReference, setPaymentReference] = useState('')
  const [paymentNotes, setPaymentNotes] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  // Details dialog
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [detailsPayable, setDetailsPayable] = useState<Payable | null>(null)

  // Fetch payables
  const fetchPayables = useCallback(async () => {
    setIsLoading(true)
    try {
      const params: Record<string, unknown> = {
        page,
        limit: 20,
        branchId: currentBranch?.id,
      }

      if (statusFilter !== 'all') {
        params.status = statusFilter
      }

      const result = await window.api.payables.getAll(params)

      if (result.success) {
        setPayables(result.data ?? [])
        setTotalPages(result.totalPages ?? 1)
      }
    } catch (error) {
      console.error('Failed to fetch payables:', error)
    } finally {
      setIsLoading(false)
    }
  }, [page, statusFilter, currentBranch?.id])

  // Fetch summary
  const fetchSummary = useCallback(async () => {
    try {
      const result = await window.api.payables.getSummary(currentBranch?.id)
      if (result.success && result.data) {
        setSummary(result.data.totals)
      }
    } catch (error) {
      console.error('Failed to fetch summary:', error)
    }
  }, [currentBranch?.id])

  // Fetch aging report
  const fetchAgingReport = useCallback(async () => {
    try {
      const result = await window.api.payables.getAgingReport(currentBranch?.id)
      if (result.success && result.data) {
        setAgingData(result.data)
      }
    } catch (error) {
      console.error('Failed to fetch aging report:', error)
    }
  }, [currentBranch?.id])

  useEffect(() => {
    fetchPayables()
    fetchSummary()
    fetchAgingReport()
  }, [fetchPayables, fetchSummary, fetchAgingReport])

  // Open payment dialog
  const openPaymentDialog = (payable: Payable) => {
    setSelectedPayable(payable)
    setPaymentAmount(payable.remainingAmount.toString())
    setPaymentMethod('bank_transfer')
    setPaymentReference('')
    setPaymentNotes('')
    setShowPaymentDialog(true)
  }

  // Record payment
  const handleRecordPayment = async () => {
    if (!selectedPayable) return

    const amount = parseFloat(paymentAmount)
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount')
      return
    }

    if (amount > selectedPayable.remainingAmount) {
      alert(`Amount cannot exceed remaining balance of ${formatCurrency(selectedPayable.remainingAmount)}`)
      return
    }

    setIsProcessing(true)

    try {
      const result = await window.api.payables.recordPayment({
        payableId: selectedPayable.id,
        amount,
        paymentMethod,
        referenceNumber: paymentReference || undefined,
        notes: paymentNotes || undefined,
      })

      if (result.success) {
        setShowPaymentDialog(false)
        fetchPayables()
        fetchSummary()
        fetchAgingReport()
        alert('Payment recorded successfully!')
      } else {
        alert(result.message || 'Failed to record payment')
      }
    } catch (error) {
      console.error('Payment error:', error)
      alert('An error occurred while recording payment')
    } finally {
      setIsProcessing(false)
    }
  }

  // View details
  const viewDetails = async (payable: Payable) => {
    try {
      const result = await window.api.payables.getById(payable.id)
      if (result.success && result.data) {
        setDetailsPayable(result.data)
        setShowDetailsDialog(true)
      }
    } catch (error) {
      console.error('Failed to fetch details:', error)
    }
  }

  const StatusBadge = ({ status }: { status: PayableStatus }) => {
    const config = statusConfig[status]
    return (
      <Badge variant="outline" className={`${config.color} flex items-center gap-1`}>
        {config.icon}
        {config.label}
      </Badge>
    )
  }

  const AgingBar = ({ label, amount, total, count }: { label: string; amount: number; total: number; count: number }) => {
    const percentage = total > 0 ? (amount / total) * 100 : 0
    return (
      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span>{label}</span>
          <span className="font-medium">{formatCurrency(amount)} ({count})</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Account Payables</h1>
          <p className="text-muted-foreground">Manage supplier invoices and payments</p>
        </div>
        <Button variant="outline" onClick={() => { fetchPayables(); fetchSummary(); fetchAgingReport(); }}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Payables</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.totalPayables ?? 0}</div>
            <p className="text-xs text-muted-foreground">Active payables</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Owed</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(summary?.totalRemaining ?? 0)}</div>
            <p className="text-xs text-muted-foreground">Outstanding amount</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Amount Paid</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(summary?.totalPaid ?? 0)}</div>
            <p className="text-xs text-muted-foreground">Payments made</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">DPO</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agingData?.dpo ?? 0} days</div>
            <p className="text-xs text-muted-foreground">Days Payable Outstanding</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="list">All Payables</TabsTrigger>
          <TabsTrigger value="aging">Aging Report</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v as PayableStatus | 'all'); setPage(1); }}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="partial">Partial</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Table */}
          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex h-60 items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
              ) : payables.length === 0 ? (
                <div className="flex h-60 flex-col items-center justify-center text-muted-foreground">
                  <FileText className="mb-4 h-12 w-12" />
                  <p>No payables found</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Paid</TableHead>
                      <TableHead>Remaining</TableHead>
                      <TableHead>Due Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payables.map((payable) => (
                      <TableRow key={payable.id}>
                        <TableCell className="font-medium">{payable.invoiceNumber}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{payable.supplier?.name}</p>
                            <p className="text-sm text-muted-foreground">{payable.supplier?.phone}</p>
                          </div>
                        </TableCell>
                        <TableCell>{formatCurrency(payable.totalAmount)}</TableCell>
                        <TableCell className="text-green-600">{formatCurrency(payable.paidAmount)}</TableCell>
                        <TableCell className="font-medium text-red-600">
                          {formatCurrency(payable.remainingAmount)}
                        </TableCell>
                        <TableCell>
                          {payable.dueDate ? formatDate(payable.dueDate) : '-'}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={payable.status} />
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => viewDetails(payable)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                            {payable.status !== 'paid' && payable.status !== 'cancelled' && (
                              <Button variant="outline" size="sm" onClick={() => openPaymentDialog(payable)}>
                                <CreditCard className="mr-1 h-4 w-4" />
                                Pay
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="aging" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Aging Buckets */}
            <Card>
              <CardHeader>
                <CardTitle>Aging Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {agingData && (
                  <>
                    <AgingBar
                      label="Current (Not Due)"
                      amount={agingData.aging.current.amount}
                      total={agingData.totalOutstanding}
                      count={agingData.aging.current.count}
                    />
                    <AgingBar
                      label="1-30 Days Overdue"
                      amount={agingData.aging.days1to30.amount}
                      total={agingData.totalOutstanding}
                      count={agingData.aging.days1to30.count}
                    />
                    <AgingBar
                      label="31-60 Days Overdue"
                      amount={agingData.aging.days31to60.amount}
                      total={agingData.totalOutstanding}
                      count={agingData.aging.days31to60.count}
                    />
                    <AgingBar
                      label="61-90 Days Overdue"
                      amount={agingData.aging.days61to90.amount}
                      total={agingData.totalOutstanding}
                      count={agingData.aging.days61to90.count}
                    />
                    <AgingBar
                      label="90+ Days Overdue"
                      amount={agingData.aging.days90plus.amount}
                      total={agingData.totalOutstanding}
                      count={agingData.aging.days90plus.count}
                    />
                  </>
                )}
              </CardContent>
            </Card>

            {/* Upcoming Payments */}
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Payments (Next 7 Days)</CardTitle>
              </CardHeader>
              <CardContent>
                {agingData?.upcomingPayments && agingData.upcomingPayments.length > 0 ? (
                  <div className="space-y-3">
                    {agingData.upcomingPayments.map((payment, idx) => (
                      <div key={idx} className="flex items-center justify-between rounded-lg border p-3">
                        <div>
                          <p className="font-medium">{payment.supplier}</p>
                          <p className="text-sm text-muted-foreground">
                            Due: {formatDate(payment.dueDate)} ({payment.daysUntilDue} days)
                          </p>
                        </div>
                        <p className="font-bold">{formatCurrency(payment.amount)}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No upcoming payments</p>
                )}
              </CardContent>
            </Card>

            {/* Top Overdue Suppliers */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Top Overdue Suppliers</CardTitle>
              </CardHeader>
              <CardContent>
                {agingData?.topOverdue && agingData.topOverdue.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Supplier</TableHead>
                        <TableHead>Amount Overdue</TableHead>
                        <TableHead>Oldest Due Date</TableHead>
                        <TableHead>Days Overdue</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {agingData.topOverdue.map((item, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-medium">{item.supplier}</TableCell>
                          <TableCell className="text-red-600 font-bold">{formatCurrency(item.amount)}</TableCell>
                          <TableCell>{formatDate(item.oldestDueDate)}</TableCell>
                          <TableCell>
                            <Badge variant="destructive">{item.daysOverdue} days</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No overdue payables</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Record Payment</DialogTitle>
            <DialogDescription>
              Invoice: {selectedPayable?.invoiceNumber} | Outstanding: {formatCurrency(selectedPayable?.remainingAmount ?? 0)}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="payment-amount">Payment Amount *</Label>
              <Input
                id="payment-amount"
                type="number"
                step="0.01"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                placeholder="Enter amount"
              />
            </div>
            <div>
              <Label htmlFor="payment-method">Payment Method *</Label>
              <Select value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="cheque">Cheque</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="mobile">Mobile Payment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="payment-reference">Reference Number</Label>
              <Input
                id="payment-reference"
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
                placeholder="Transaction ID, cheque number, etc."
              />
            </div>
            <div>
              <Label htmlFor="payment-notes">Notes</Label>
              <Input
                id="payment-notes"
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                placeholder="Optional notes"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleRecordPayment} disabled={isProcessing}>
              {isProcessing ? 'Processing...' : 'Record Payment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Payable Details</DialogTitle>
            <DialogDescription>
              Invoice: {detailsPayable?.invoiceNumber}
            </DialogDescription>
          </DialogHeader>
          {detailsPayable && (
            <div className="space-y-6">
              {/* Supplier Info */}
              <div className="flex items-start gap-4 rounded-lg bg-muted p-4">
                <Building2 className="h-10 w-10 rounded-full bg-primary/10 p-2 text-primary" />
                <div>
                  <p className="font-medium">{detailsPayable.supplier?.name}</p>
                  <p className="text-sm text-muted-foreground">{detailsPayable.supplier?.phone}</p>
                  {detailsPayable.supplier?.email && (
                    <p className="text-sm text-muted-foreground">{detailsPayable.supplier?.email}</p>
                  )}
                </div>
              </div>

              {/* Amount Summary */}
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-lg border p-4 text-center">
                  <p className="text-sm text-muted-foreground">Total Amount</p>
                  <p className="text-2xl font-bold">{formatCurrency(detailsPayable.totalAmount)}</p>
                </div>
                <div className="rounded-lg border p-4 text-center">
                  <p className="text-sm text-muted-foreground">Amount Paid</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(detailsPayable.paidAmount)}</p>
                </div>
                <div className="rounded-lg border p-4 text-center">
                  <p className="text-sm text-muted-foreground">Remaining</p>
                  <p className="text-2xl font-bold text-red-600">{formatCurrency(detailsPayable.remainingAmount)}</p>
                </div>
              </div>

              {/* Payment History */}
              <div>
                <h3 className="mb-3 font-semibold">Payment History</h3>
                {detailsPayable.payments && detailsPayable.payments.length > 0 ? (
                  <ScrollArea className="h-48">
                    <div className="space-y-3">
                      {detailsPayable.payments.map((payment) => (
                        <div key={payment.id} className="flex items-center justify-between rounded-lg border p-3">
                          <div>
                            <p className="font-medium">{formatCurrency(payment.amount)}</p>
                            <p className="text-sm text-muted-foreground">
                              {payment.paymentMethod.replace('_', ' ')} - {formatDate(payment.paymentDate)}
                            </p>
                            {payment.referenceNumber && (
                              <p className="text-xs text-muted-foreground">Ref: {payment.referenceNumber}</p>
                            )}
                          </div>
                          <div className="text-right text-sm text-muted-foreground">
                            {payment.paidByUser?.fullName}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <p className="text-center text-muted-foreground">No payments recorded yet</p>
                )}
              </div>

              {/* Notes */}
              {detailsPayable.notes && (
                <div>
                  <h3 className="mb-2 font-semibold">Notes</h3>
                  <p className="text-sm text-muted-foreground">{detailsPayable.notes}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            {detailsPayable && detailsPayable.status !== 'paid' && detailsPayable.status !== 'cancelled' && (
              <Button onClick={() => { setShowDetailsDialog(false); openPaymentDialog(detailsPayable); }}>
                <CreditCard className="mr-2 h-4 w-4" />
                Record Payment
              </Button>
            )}
            <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
