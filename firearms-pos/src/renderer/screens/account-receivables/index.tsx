import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Search,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Eye,
  CreditCard,
  RefreshCw,
  User,
  Download,
  Loader2,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip'
import { formatCurrency, formatDate } from '@/lib/utils'
import { useBranch } from '@/contexts/branch-context'
import { ReversalRequestModal } from '@/components/reversal-request-modal'
import { ReversalStatusBadge } from '@/components/reversal-status-badge'

type ReceivableStatus = 'pending' | 'partial' | 'paid' | 'overdue' | 'cancelled'
type PaymentMethod = 'cash' | 'card' | 'mobile' | 'bank_transfer' | 'cheque'

interface ReceivablePayment {
  id: number
  amount: number
  paymentMethod: PaymentMethod
  referenceNumber?: string
  notes?: string
  paymentDate: string
  receivedByUser?: {
    id: number
    fullName: string
  }
}

interface Receivable {
  id: number
  customerId: number
  saleId?: number
  branchId: number
  invoiceNumber: string
  totalAmount: number
  paidAmount: number
  remainingAmount: number
  status: ReceivableStatus
  dueDate?: string
  notes?: string
  createdAt: string
  customer?: {
    id: number
    firstName: string
    lastName: string
    phone: string
    email?: string
  }
  branch?: {
    id: number
    name: string
  }
  payments?: ReceivablePayment[]
}

interface Summary {
  totalReceivables: number
  totalAmount: number
  totalPaid: number
  totalRemaining: number
  todayCollected: number
}

const statusConfig: Record<ReceivableStatus, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: <Clock className="h-3 w-3" /> },
  partial: { label: 'Partial', color: 'bg-blue-100 text-blue-800', icon: <DollarSign className="h-3 w-3" /> },
  paid: { label: 'Paid', color: 'bg-green-100 text-green-800', icon: <CheckCircle2 className="h-3 w-3" /> },
  overdue: { label: 'Overdue', color: 'bg-red-100 text-red-800', icon: <AlertTriangle className="h-3 w-3" /> },
  cancelled: { label: 'Cancelled', color: 'bg-gray-100 text-gray-800', icon: <XCircle className="h-3 w-3" /> },
}

function StatusBadge({ status }: { status: ReceivableStatus }) {
  const config = statusConfig[status]
  return (
    <Badge variant="outline" className={`${config.color} flex items-center gap-1`}>
      {config.icon}
      {config.label}
    </Badge>
  )
}

export function AccountReceivablesScreen() {
  const { currentBranch } = useBranch()
  const [receivables, setReceivables] = useState<Receivable[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<ReceivableStatus | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Payment dialog
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [selectedReceivable, setSelectedReceivable] = useState<Receivable | null>(null)
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash')
  const [paymentReference, setPaymentReference] = useState('')
  const [paymentNotes, setPaymentNotes] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  // Details dialog
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [detailsReceivable, setDetailsReceivable] = useState<Receivable | null>(null)

  // Receipt download
  const [isDownloadingReceipt, setIsDownloadingReceipt] = useState(false)

  // Reversal
  const [isReversalModalOpen, setIsReversalModalOpen] = useState(false)
  const [reversalTarget, setReversalTarget] = useState<Receivable | null>(null)

  // Fetch receivables
  const fetchReceivables = useCallback(async () => {
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

      const result = await window.api.receivables.getAll(params)

      if (result.success) {
        setReceivables(result.data ?? [])
        setTotalPages(result.totalPages ?? 1)
      }
    } catch (error) {
      console.error('Failed to fetch receivables:', error)
    } finally {
      setIsLoading(false)
    }
  }, [page, statusFilter, currentBranch?.id])

  // Fetch summary
  const fetchSummary = useCallback(async () => {
    try {
      const result = await window.api.receivables.getSummary(currentBranch?.id)
      if (result.success && result.data) {
        setSummary(result.data.totals)
      }
    } catch (error) {
      console.error('Failed to fetch summary:', error)
    }
  }, [currentBranch?.id])

  useEffect(() => {
    fetchReceivables()
    fetchSummary()
  }, [fetchReceivables, fetchSummary])

  // Filter receivables based on search query
  const filteredReceivables = useMemo(() => {
    if (!searchQuery.trim()) return receivables

    const query = searchQuery.toLowerCase().trim()
    return receivables.filter((receivable) => {
      const invoiceMatch = receivable.invoiceNumber.toLowerCase().includes(query)
      const customerName = `${receivable.customer?.firstName ?? ''} ${receivable.customer?.lastName ?? ''}`.toLowerCase()
      const customerMatch = customerName.includes(query)
      const phoneMatch = receivable.customer?.phone?.toLowerCase().includes(query) ?? false
      return invoiceMatch || customerMatch || phoneMatch
    })
  }, [receivables, searchQuery])

  // Open payment dialog
  const openPaymentDialog = (receivable: Receivable) => {
    setSelectedReceivable(receivable)
    setPaymentAmount(receivable.remainingAmount.toString())
    setPaymentMethod('cash')
    setPaymentReference('')
    setPaymentNotes('')
    setShowPaymentDialog(true)
  }

  // Record payment
  const handleRecordPayment = async () => {
    if (!selectedReceivable) return

    const amount = parseFloat(paymentAmount)
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount')
      return
    }

    if (amount > selectedReceivable.remainingAmount) {
      alert(`Amount cannot exceed remaining balance of ${formatCurrency(selectedReceivable.remainingAmount)}`)
      return
    }

    setIsProcessing(true)

    try {
      const result = await window.api.receivables.recordPayment({
        receivableId: selectedReceivable.id,
        amount,
        paymentMethod,
        referenceNumber: paymentReference || undefined,
        notes: paymentNotes || undefined,
      })

      if (result.success) {
        const receivableId = selectedReceivable.id
        const isFullyPaid = amount >= selectedReceivable.remainingAmount

        setShowPaymentDialog(false)
        fetchReceivables()
        fetchSummary()

        // Auto-download receipt when fully paid
        if (isFullyPaid) {
          alert('Payment recorded successfully! Receivable is now fully paid.\n\nGenerating payment history receipt...')
          await downloadReceipt(receivableId)
        } else {
          alert('Payment recorded successfully!')
        }
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
  const viewDetails = async (receivable: Receivable) => {
    try {
      const result = await window.api.receivables.getById(receivable.id)
      if (result.success && result.data) {
        setDetailsReceivable(result.data)
        setShowDetailsDialog(true)
      }
    } catch (error) {
      console.error('Failed to fetch details:', error)
    }
  }

  // Download payment history receipt
  const downloadReceipt = async (receivableId: number) => {
    setIsDownloadingReceipt(true)
    try {
      const result = await window.api.receipt.generatePaymentHistory(receivableId)
      if (result.success && result.data) {
        alert(`Receipt downloaded successfully!\nSaved to: ${result.data.filePath}`)
      } else {
        console.error('Receipt generation failed:', result.message)
        alert(result.message || 'Failed to generate receipt')
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.error('Failed to download receipt:', errorMessage)
      alert(`An error occurred while generating receipt: ${errorMessage}`)
    } finally {
      setIsDownloadingReceipt(false)
    }
  }

  return (
    <TooltipProvider>
      <div className="space-y-3">
        {/* Header with inline summary pills */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold">Account Receivables</h1>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium">
                {summary?.totalReceivables ?? 0} Receivables
              </span>
              <span className="rounded-full bg-green-500/10 text-green-500 px-2.5 py-0.5 text-xs font-medium">
                {formatCurrency(summary?.totalPaid ?? 0)} Collected
              </span>
              <span className="rounded-full bg-yellow-500/10 text-yellow-500 px-2.5 py-0.5 text-xs font-medium">
                {formatCurrency(summary?.totalRemaining ?? 0)} Outstanding
              </span>
              {(summary?.todayCollected ?? 0) > 0 && (
                <span className="rounded-full bg-primary/10 text-primary px-2.5 py-0.5 text-xs font-medium">
                  {formatCurrency(summary?.todayCollected ?? 0)} Today
                </span>
              )}
            </div>
          </div>
          <Button variant="outline" size="sm" className="h-8" onClick={() => { fetchReceivables(); fetchSummary(); }}>
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
            Refresh
          </Button>
        </div>

        {/* Compact search + filter */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by invoice, customer, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 pl-8 text-sm"
            />
            {searchQuery && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <Select
            value={statusFilter}
            onValueChange={(v) => { setStatusFilter(v as ReceivableStatus | 'all'); setPage(1); }}
          >
            <SelectTrigger className="h-8 w-[130px] text-xs">
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

        {/* Compact table */}
        <div className="rounded-md border overflow-hidden">
          {isLoading ? (
            <div className="flex h-32 items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : filteredReceivables.length === 0 ? (
            <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
              No receivables found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="text-[10px] font-semibold uppercase tracking-wider">Invoice</TableHead>
                  <TableHead className="text-[10px] font-semibold uppercase tracking-wider">Customer</TableHead>
                  <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-right">Total</TableHead>
                  <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-right">Paid</TableHead>
                  <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-right">Remaining</TableHead>
                  <TableHead className="text-[10px] font-semibold uppercase tracking-wider">Status</TableHead>
                  <TableHead className="text-[10px] font-semibold uppercase tracking-wider">Date</TableHead>
                  <TableHead className="text-[10px] font-semibold uppercase tracking-wider w-[130px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReceivables.map((receivable) => (
                  <TableRow key={receivable.id} className="group h-9">
                    <TableCell className="py-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-medium">{receivable.invoiceNumber}</span>
                        <ReversalStatusBadge entityType="receivable" entityId={receivable.id} />
                      </div>
                    </TableCell>
                    <TableCell className="py-1.5">
                      <span className="text-sm">{receivable.customer?.firstName} {receivable.customer?.lastName}</span>
                      {receivable.customer?.phone && (
                        <span className="block text-[11px] text-muted-foreground">{receivable.customer.phone}</span>
                      )}
                    </TableCell>
                    <TableCell className="py-1.5 text-right text-sm tabular-nums">
                      {formatCurrency(receivable.totalAmount)}
                    </TableCell>
                    <TableCell className="py-1.5 text-right text-sm tabular-nums text-green-600">
                      {formatCurrency(receivable.paidAmount)}
                    </TableCell>
                    <TableCell className="py-1.5 text-right text-sm tabular-nums font-medium text-yellow-600">
                      {formatCurrency(receivable.remainingAmount)}
                    </TableCell>
                    <TableCell className="py-1.5">
                      <StatusBadge status={receivable.status} />
                    </TableCell>
                    <TableCell className="py-1.5 text-sm text-muted-foreground">
                      {formatDate(receivable.createdAt)}
                    </TableCell>
                    <TableCell className="py-1.5">
                      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => viewDetails(receivable)}
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Details</TooltipContent>
                        </Tooltip>
                        {receivable.paidAmount > 0 && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => downloadReceipt(receivable.id)}
                                disabled={isDownloadingReceipt}
                              >
                                {isDownloadingReceipt ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Download className="h-3.5 w-3.5" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Download Receipt</TooltipContent>
                          </Tooltip>
                        )}
                        {receivable.status !== 'cancelled' && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => { setReversalTarget(receivable); setIsReversalModalOpen(true) }}
                              >
                                <RotateCcw className="h-3.5 w-3.5 text-amber-500" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Reversal</TooltipContent>
                          </Tooltip>
                        )}
                        {receivable.status !== 'paid' && receivable.status !== 'cancelled' && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => openPaymentDialog(receivable)}
                              >
                                <CreditCard className="h-3.5 w-3.5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Record Payment</TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Compact pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <span className="px-2 text-xs text-muted-foreground tabular-nums">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}

        {/* Payment Dialog */}
        <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record Payment</DialogTitle>
              <DialogDescription>
                Invoice: {selectedReceivable?.invoiceNumber} | Outstanding: {formatCurrency(selectedReceivable?.remainingAmount ?? 0)}
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
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="card">Card</SelectItem>
                    <SelectItem value="mobile">Mobile Payment</SelectItem>
                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
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

        {/* Reversal Request Modal */}
        {reversalTarget && (
          <ReversalRequestModal
            open={isReversalModalOpen}
            onClose={() => {
              setIsReversalModalOpen(false)
              setReversalTarget(null)
            }}
            entityType="receivable"
            entityId={reversalTarget.id}
            entityLabel={`Receivable #${reversalTarget.invoiceNumber}`}
            branchId={reversalTarget.branchId}
            onSuccess={() => { fetchReceivables(); fetchSummary(); }}
          />
        )}

        {/* Details Dialog */}
        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Receivable Details</DialogTitle>
              <DialogDescription>
                Invoice: {detailsReceivable?.invoiceNumber}
              </DialogDescription>
            </DialogHeader>
            {detailsReceivable && (
              <div className="space-y-6">
                {/* Customer Info */}
                <div className="flex items-start gap-4 rounded-lg bg-muted p-4">
                  <User className="h-10 w-10 rounded-full bg-primary/10 p-2 text-primary" />
                  <div>
                    <p className="font-medium">
                      {detailsReceivable.customer?.firstName} {detailsReceivable.customer?.lastName}
                    </p>
                    <p className="text-sm text-muted-foreground">{detailsReceivable.customer?.phone}</p>
                    {detailsReceivable.customer?.email && (
                      <p className="text-sm text-muted-foreground">{detailsReceivable.customer?.email}</p>
                    )}
                  </div>
                </div>

                {/* Amount Summary */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="rounded-lg border p-4 text-center">
                    <p className="text-sm text-muted-foreground">Total Amount</p>
                    <p className="text-2xl font-bold">{formatCurrency(detailsReceivable.totalAmount)}</p>
                  </div>
                  <div className="rounded-lg border p-4 text-center">
                    <p className="text-sm text-muted-foreground">Amount Paid</p>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(detailsReceivable.paidAmount)}</p>
                  </div>
                  <div className="rounded-lg border p-4 text-center">
                    <p className="text-sm text-muted-foreground">Remaining</p>
                    <p className="text-2xl font-bold text-yellow-600">{formatCurrency(detailsReceivable.remainingAmount)}</p>
                  </div>
                </div>

                {/* Payment History */}
                <div>
                  <h3 className="mb-3 font-semibold">Payment History</h3>
                  {detailsReceivable.payments && detailsReceivable.payments.length > 0 ? (
                    <ScrollArea className="h-48">
                      <div className="space-y-3">
                        {detailsReceivable.payments.map((payment) => (
                          <div key={payment.id} className="flex items-center justify-between rounded-lg border p-3">
                            <div>
                              <p className="font-medium">{formatCurrency(payment.amount)}</p>
                              <p className="text-sm text-muted-foreground">
                                {payment.paymentMethod.replace('_', ' ')} • {formatDate(payment.paymentDate)}
                              </p>
                              {payment.referenceNumber && (
                                <p className="text-xs text-muted-foreground">Ref: {payment.referenceNumber}</p>
                              )}
                            </div>
                            <div className="text-right text-sm text-muted-foreground">
                              {payment.receivedByUser?.fullName}
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
                {detailsReceivable.notes && (
                  <div>
                    <h3 className="mb-2 font-semibold">Notes</h3>
                    <p className="text-sm text-muted-foreground">{detailsReceivable.notes}</p>
                  </div>
                )}
              </div>
            )}
            <DialogFooter className="gap-2 sm:gap-0">
              {/* Download Receipt button - shown when there are payments */}
              {detailsReceivable && detailsReceivable.payments && detailsReceivable.payments.length > 0 && (
                <Button
                  variant="secondary"
                  onClick={() => downloadReceipt(detailsReceivable.id)}
                  disabled={isDownloadingReceipt}
                >
                  {isDownloadingReceipt ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="mr-2 h-4 w-4" />
                  )}
                  {isDownloadingReceipt ? 'Generating...' : 'Download Receipt'}
                </Button>
              )}
              {detailsReceivable && detailsReceivable.status !== 'paid' && detailsReceivable.status !== 'cancelled' && (
                <Button onClick={() => { setShowDetailsDialog(false); openPaymentDialog(detailsReceivable); }}>
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
    </TooltipProvider>
  )
}
