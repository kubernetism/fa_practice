import { useState, useEffect, useMemo, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip'
import {
  Wallet,
  DollarSign,
  ArrowUpCircle,
  ArrowDownCircle,
  Clock,
  CheckCircle,
  AlertTriangle,
  Plus,
  RefreshCw,
  Calendar,
  TrendingUp,
  TrendingDown,
  CircleDollarSign,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react'
import { format } from 'date-fns'
import { useBranch } from '@/contexts/branch-context'

interface CashSession {
  id: number
  branchId: number
  sessionDate: string
  openingBalance: number
  closingBalance: number | null
  expectedBalance: number | null
  actualBalance: number | null
  variance: number | null
  status: 'open' | 'closed' | 'reconciled'
  openedBy: number
  closedBy: number | null
  reconciledBy: number | null
  openedAt: string
  closedAt: string | null
  reconciledAt: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
  currentBalance?: number
  totalIn?: number
  totalOut?: number
  openedByUser?: { id: number; fullName: string }
  closedByUser?: { id: number; fullName: string }
}

interface CashTransaction {
  id: number
  sessionId: number
  branchId: number
  transactionType: 'cash_in' | 'cash_out' | 'sale' | 'refund' | 'adjustment' | 'expense' | 'deposit' | 'withdrawal' | 'ar_collection' | 'ap_payment' | 'petty_cash_in' | 'petty_cash_out'
  amount: number
  referenceType: string | null
  referenceId: number | null
  description: string | null
  recordedBy: number
  transactionDate: string
  createdAt: string
  recordedByUser?: { id: number; fullName: string }
}

interface CashFlowSummary {
  openingBalance: number
  totalCashIn: number
  totalCashOut: number
  netCashFlow: number
  expectedBalance: number
  byType: Record<string, number>
}

export default function CashRegisterScreen() {
  const { currentBranch } = useBranch()
  const [activeTab, setActiveTab] = useState('current')
  const [currentSession, setCurrentSession] = useState<CashSession | null>(null)
  const [sessionHistory, setSessionHistory] = useState<CashSession[]>([])
  const [transactions, setTransactions] = useState<CashTransaction[]>([])
  const [cashFlowSummary, setCashFlowSummary] = useState<CashFlowSummary | null>(null)
  const [loading, setLoading] = useState(true)

  // Dialog states
  const [openSessionDialog, setOpenSessionDialog] = useState(false)
  const [closeSessionDialog, setCloseSessionDialog] = useState(false)
  const [transactionDialog, setTransactionDialog] = useState(false)
  const [adjustmentDialog, setAdjustmentDialog] = useState(false)

  // Form states
  const [openingBalance, setOpeningBalance] = useState('')
  const [actualBalance, setActualBalance] = useState('')
  const [closingNotes, setClosingNotes] = useState('')
  const [transactionType, setTransactionType] = useState<string>('cash_in')
  const [transactionAmount, setTransactionAmount] = useState('')
  const [transactionDescription, setTransactionDescription] = useState('')
  const [adjustmentAmount, setAdjustmentAmount] = useState('')
  const [adjustmentReason, setAdjustmentReason] = useState('')

  // Pagination states
  const [txPage, setTxPage] = useState(1)
  const [historyPage, setHistoryPage] = useState(1)
  const txPerPage = 15
  const historyPerPage = 15

  const branchId = currentBranch?.id || 1

  useEffect(() => {
    if (currentBranch) {
      loadData()
    }
  }, [branchId, currentBranch])

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [sessionResult, historyResult, flowResult] = await Promise.all([
        window.api.cashRegister.getCurrentSession(branchId),
        window.api.cashRegister.getHistory({ branchId, limit: 30 }),
        window.api.cashRegister.getCashFlowSummary({ branchId }),
      ])

      const session = sessionResult?.success ? sessionResult.data : null
      const history = historyResult?.success ? historyResult.data : []
      const flow = flowResult?.success ? flowResult.data : null

      setCurrentSession(session)
      setSessionHistory(history || [])

      if (flow) {
        setCashFlowSummary({
          openingBalance: session?.openingBalance || 0,
          totalCashIn: flow.periodSummary?.totalInflows || 0,
          totalCashOut: flow.periodSummary?.totalOutflows || 0,
          netCashFlow: flow.periodSummary?.netCashFlow || 0,
          expectedBalance: session ? (session.openingBalance + (session.totalIn || 0) - (session.totalOut || 0)) : 0,
          byType: flow.transactionBreakdown?.reduce((acc: Record<string, number>, t: { transactionType: string; totalAmount: number }) => {
            acc[t.transactionType] = t.totalAmount || 0
            return acc
          }, {}) || {},
        })
      }

      if (session) {
        const txResult = await window.api.cashRegister.getTransactions(session.id)
        setTransactions(txResult?.success ? txResult.data : [])
      }
    } catch (error) {
      console.error('Failed to load cash register data:', error)
    } finally {
      setLoading(false)
    }
  }, [branchId])

  const handleOpenSession = async () => {
    try {
      const balance = parseFloat(openingBalance) || 0
      const result = await window.api.cashRegister.openSession({
        branchId,
        openingBalance: balance,
      })
      if (!result?.success) {
        alert(result?.message || 'Failed to open session')
        return
      }
      setOpenSessionDialog(false)
      setOpeningBalance('')
      await loadData()
    } catch (error) {
      console.error('Failed to open session:', error)
      alert('Failed to open session: ' + (error as Error).message)
    }
  }

  const handleCloseSession = async () => {
    if (!currentSession) return

    try {
      const actual = parseFloat(actualBalance) || 0
      const result = await window.api.cashRegister.closeSession({
        sessionId: currentSession.id,
        actualBalance: actual,
        notes: closingNotes || undefined,
      })
      if (!result?.success) {
        alert(result?.message || 'Failed to close session')
        return
      }
      setCloseSessionDialog(false)
      setActualBalance('')
      setClosingNotes('')
      await loadData()
    } catch (error) {
      console.error('Failed to close session:', error)
      alert('Failed to close session: ' + (error as Error).message)
    }
  }

  const handleRecordTransaction = async () => {
    if (!currentSession) return

    try {
      const amount = parseFloat(transactionAmount) || 0
      const result = await window.api.cashRegister.recordTransaction({
        sessionId: currentSession.id,
        branchId,
        transactionType: transactionType,
        amount,
        description: transactionDescription || undefined,
      })
      if (!result?.success) {
        alert(result?.message || 'Failed to record transaction')
        return
      }
      setTransactionDialog(false)
      setTransactionType('cash_in')
      setTransactionAmount('')
      setTransactionDescription('')
      await loadData()
    } catch (error) {
      console.error('Failed to record transaction:', error)
      alert('Failed to record transaction: ' + (error as Error).message)
    }
  }

  const handleAdjustment = async () => {
    if (!currentSession) return

    try {
      const amount = parseFloat(adjustmentAmount) || 0
      const result = await window.api.cashRegister.adjust({
        sessionId: currentSession.id,
        amount,
        reason: adjustmentReason,
      })
      if (!result?.success) {
        alert(result?.message || 'Failed to make adjustment')
        return
      }
      setAdjustmentDialog(false)
      setAdjustmentAmount('')
      setAdjustmentReason('')
      await loadData()
    } catch (error) {
      console.error('Failed to make adjustment:', error)
      alert('Failed to make adjustment: ' + (error as Error).message)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge className="text-[10px] px-1.5 py-0 bg-green-500/10 text-green-500 border-green-500/20">Open</Badge>
      case 'closed':
        return <Badge className="text-[10px] px-1.5 py-0 bg-blue-500/10 text-blue-500 border-blue-500/20">Closed</Badge>
      case 'reconciled':
        return <Badge className="text-[10px] px-1.5 py-0 bg-purple-500/10 text-purple-500 border-purple-500/20">Reconciled</Badge>
      default:
        return <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{status}</Badge>
    }
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'cash_in':
      case 'sale':
      case 'deposit':
        return <ArrowDownCircle className="h-4 w-4 text-green-500" />
      case 'cash_out':
      case 'refund':
      case 'expense':
      case 'withdrawal':
        return <ArrowUpCircle className="h-4 w-4 text-red-500" />
      case 'adjustment':
        return <RefreshCw className="h-4 w-4 text-yellow-500" />
      default:
        return <CircleDollarSign className="h-4 w-4" />
    }
  }

  // Pagination calculations for transactions
  const txPagination = useMemo(() => {
    const total = transactions.length
    const totalPages = Math.max(1, Math.ceil(total / txPerPage))
    const start = (txPage - 1) * txPerPage
    const paginated = transactions.slice(start, start + txPerPage)
    return { total, totalPages, paginated }
  }, [transactions, txPage])

  // Pagination calculations for session history
  const historyPagination = useMemo(() => {
    const total = sessionHistory.length
    const totalPages = Math.max(1, Math.ceil(total / historyPerPage))
    const start = (historyPage - 1) * historyPerPage
    const paginated = sessionHistory.slice(start, start + historyPerPage)
    return { total, totalPages, paginated }
  }, [sessionHistory, historyPage])

  // Cash flow by type entries
  const cashFlowEntries = useMemo(() => {
    if (!cashFlowSummary?.byType) return []
    return Object.entries(cashFlowSummary.byType)
  }, [cashFlowSummary])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold">Cash Register</h1>
            {currentBranch && (
              <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                {currentBranch.name}
              </span>
            )}
            {currentSession ? (
              <>
                {getStatusBadge(currentSession.status)}
                <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium">
                  Opening: {formatCurrency(currentSession.openingBalance)}
                </span>
                {cashFlowSummary && (
                  <>
                    <span className="rounded-full bg-green-500/10 text-green-500 px-2.5 py-0.5 text-xs font-medium">
                      In: {formatCurrency(cashFlowSummary.totalCashIn)}
                    </span>
                    <span className="rounded-full bg-red-500/10 text-red-500 px-2.5 py-0.5 text-xs font-medium">
                      Out: {formatCurrency(cashFlowSummary.totalCashOut)}
                    </span>
                  </>
                )}
              </>
            ) : (
              <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                No active session
              </span>
            )}
          </div>
          <div className="flex gap-2">
            {!currentSession && (
              <Button size="sm" onClick={() => setOpenSessionDialog(true)}>
                <Plus className="h-4 w-4 mr-1.5" />
                Open Session
              </Button>
            )}
            {currentSession && currentSession.status === 'open' && (
              <>
                <Button size="sm" variant="outline" onClick={() => setTransactionDialog(true)}>
                  <CircleDollarSign className="h-4 w-4 mr-1.5" />
                  Record Transaction
                </Button>
                <Button size="sm" variant="outline" onClick={() => setAdjustmentDialog(true)}>
                  <RefreshCw className="h-4 w-4 mr-1.5" />
                  Adjustment
                </Button>
                <Button size="sm" variant="destructive" onClick={() => setCloseSessionDialog(true)}>
                  <Clock className="h-4 w-4 mr-1.5" />
                  Close Session
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Expected Balance Banner */}
        {currentSession && cashFlowSummary && (
          <div className="rounded-md border border-blue-500/20 bg-blue-500/5 p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Expected Balance</p>
                <p className="text-lg font-semibold">{formatCurrency(cashFlowSummary.expectedBalance)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-muted-foreground">Net Cash Flow</p>
                <p className={`text-lg font-semibold ${cashFlowSummary.netCashFlow >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {cashFlowSummary.netCashFlow >= 0 ? '+' : ''}{formatCurrency(cashFlowSummary.netCashFlow)}
                </p>
              </div>
            </div>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="h-8">
            <TabsTrigger value="current" className="h-6 px-2 text-xs">Today's Transactions</TabsTrigger>
            <TabsTrigger value="history" className="h-6 px-2 text-xs">Session History</TabsTrigger>
            <TabsTrigger value="summary" className="h-6 px-2 text-xs">Cash Flow Summary</TabsTrigger>
          </TabsList>

          <TabsContent value="current" className="space-y-3 mt-3">
            <div className="rounded-md border overflow-hidden">
              {transactions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CircleDollarSign className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No transactions recorded yet</p>
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30">
                        <TableHead className="text-[10px] font-semibold tracking-wider uppercase">Time</TableHead>
                        <TableHead className="text-[10px] font-semibold tracking-wider uppercase">Type</TableHead>
                        <TableHead className="text-[10px] font-semibold tracking-wider uppercase">Description</TableHead>
                        <TableHead className="text-[10px] font-semibold tracking-wider uppercase">Reference</TableHead>
                        <TableHead className="text-[10px] font-semibold tracking-wider uppercase text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {txPagination.paginated.map((tx) => (
                        <TableRow key={tx.id} className="group h-9">
                          <TableCell className="py-1.5 text-xs">
                            {format(new Date(tx.transactionDate), 'h:mm a')}
                          </TableCell>
                          <TableCell className="py-1.5">
                            <div className="flex items-center gap-1.5">
                              {getTransactionIcon(tx.transactionType)}
                              <span className="capitalize text-xs">{tx.transactionType.replace('_', ' ')}</span>
                            </div>
                          </TableCell>
                          <TableCell className="py-1.5 text-xs">{tx.description || '-'}</TableCell>
                          <TableCell className="py-1.5 text-xs">
                            {tx.referenceType ? `${tx.referenceType} #${tx.referenceId}` : '-'}
                          </TableCell>
                          <TableCell className={`py-1.5 text-right text-xs font-medium ${
                            ['cash_in', 'sale', 'deposit', 'ar_collection', 'petty_cash_in'].includes(tx.transactionType)
                              ? 'text-green-500'
                              : 'text-red-500'
                          }`}>
                            {['cash_in', 'sale', 'deposit', 'ar_collection', 'petty_cash_in'].includes(tx.transactionType) ? '+' : '-'}
                            {formatCurrency(Math.abs(tx.amount))}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {txPagination.totalPages > 1 && (
                    <div className="flex items-center justify-between px-3 py-2 border-t">
                      <span className="text-xs text-muted-foreground">{txPagination.total} transactions</span>
                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="outline"
                          className="h-7 w-7 p-0"
                          disabled={txPage <= 1}
                          onClick={() => setTxPage((p) => Math.max(1, p - 1))}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-xs font-medium">{txPage} / {txPagination.totalPages}</span>
                        <Button
                          variant="outline"
                          className="h-7 w-7 p-0"
                          disabled={txPage >= txPagination.totalPages}
                          onClick={() => setTxPage((p) => Math.min(txPagination.totalPages, p + 1))}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-3 mt-3">
            <div className="rounded-md border overflow-hidden">
              {sessionHistory.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No session history found</p>
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30">
                        <TableHead className="text-[10px] font-semibold tracking-wider uppercase">Date</TableHead>
                        <TableHead className="text-[10px] font-semibold tracking-wider uppercase">Status</TableHead>
                        <TableHead className="text-[10px] font-semibold tracking-wider uppercase">Opened By</TableHead>
                        <TableHead className="text-[10px] font-semibold tracking-wider uppercase text-right">Opening</TableHead>
                        <TableHead className="text-[10px] font-semibold tracking-wider uppercase text-right">Closing</TableHead>
                        <TableHead className="text-[10px] font-semibold tracking-wider uppercase text-right">Variance</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {historyPagination.paginated.map((session) => (
                        <TableRow key={session.id} className="group h-9">
                          <TableCell className="py-1.5 text-xs">
                            {format(new Date(session.sessionDate), 'MMM d, yyyy')}
                          </TableCell>
                          <TableCell className="py-1.5">{getStatusBadge(session.status)}</TableCell>
                          <TableCell className="py-1.5 text-xs">{session.openedByUser?.fullName || '-'}</TableCell>
                          <TableCell className="py-1.5 text-right text-xs">
                            {formatCurrency(session.openingBalance)}
                          </TableCell>
                          <TableCell className="py-1.5 text-right text-xs">
                            {session.closingBalance !== null
                              ? formatCurrency(session.closingBalance)
                              : '-'}
                          </TableCell>
                          <TableCell className={`py-1.5 text-right text-xs font-medium ${
                            session.variance === null
                              ? ''
                              : session.variance === 0
                                ? 'text-green-500'
                                : session.variance > 0
                                  ? 'text-blue-500'
                                  : 'text-red-500'
                          }`}>
                            {session.variance !== null ? (
                              <>
                                {session.variance === 0 ? (
                                  <span className="flex items-center justify-end gap-1">
                                    <CheckCircle className="h-3.5 w-3.5" />
                                    Balanced
                                  </span>
                                ) : (
                                  <>
                                    {session.variance > 0 ? '+' : ''}
                                    {formatCurrency(session.variance)}
                                  </>
                                )}
                              </>
                            ) : '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {historyPagination.totalPages > 1 && (
                    <div className="flex items-center justify-between px-3 py-2 border-t">
                      <span className="text-xs text-muted-foreground">{historyPagination.total} sessions</span>
                      <div className="flex items-center gap-1.5">
                        <Button
                          variant="outline"
                          className="h-7 w-7 p-0"
                          disabled={historyPage <= 1}
                          onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-xs font-medium">{historyPage} / {historyPagination.totalPages}</span>
                        <Button
                          variant="outline"
                          className="h-7 w-7 p-0"
                          disabled={historyPage >= historyPagination.totalPages}
                          onClick={() => setHistoryPage((p) => Math.min(historyPagination.totalPages, p + 1))}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </TabsContent>

          <TabsContent value="summary" className="space-y-3 mt-3">
            <div className="rounded-md border overflow-hidden">
              {cashFlowEntries.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3">
                  {cashFlowEntries.map(([type, amount]) => (
                    <div key={type} className="rounded-md border p-3 bg-background">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        {getTransactionIcon(type)}
                        <span className="text-xs font-medium capitalize">
                          {type.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-sm font-semibold">{formatCurrency(amount)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No cash flow data available</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Open Session Dialog */}
        <Dialog open={openSessionDialog} onOpenChange={setOpenSessionDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Open Cash Session</DialogTitle>
              <DialogDescription>
                Start a new daily cash register session
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Opening Balance</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={openingBalance}
                  onChange={(e) => setOpeningBalance(e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Enter the cash amount currently in the register
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpenSessionDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleOpenSession}>
                Open Session
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Close Session Dialog */}
        <Dialog open={closeSessionDialog} onOpenChange={setCloseSessionDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Close Cash Session</DialogTitle>
              <DialogDescription>
                End the current session and count the cash
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {cashFlowSummary && (
                <div className="bg-muted p-4 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Expected Balance:</span>
                    <span className="font-bold">{formatCurrency(cashFlowSummary.expectedBalance)}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Based on opening balance and all transactions
                  </p>
                </div>
              )}
              <div>
                <Label>Actual Cash Count</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={actualBalance}
                  onChange={(e) => setActualBalance(e.target.value)}
                />
              </div>
              {actualBalance && cashFlowSummary && (
                <div className={`p-4 rounded-lg ${
                  parseFloat(actualBalance) === cashFlowSummary.expectedBalance
                    ? 'bg-green-500/10'
                    : 'bg-yellow-500/10'
                }`}>
                  <div className="flex items-center gap-2">
                    {parseFloat(actualBalance) === cashFlowSummary.expectedBalance ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-yellow-500" />
                    )}
                    <span className="font-medium">
                      Variance: {formatCurrency(parseFloat(actualBalance) - cashFlowSummary.expectedBalance)}
                    </span>
                  </div>
                </div>
              )}
              <div>
                <Label>Notes (Optional)</Label>
                <Textarea
                  placeholder="Any notes about the session..."
                  value={closingNotes}
                  onChange={(e) => setClosingNotes(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCloseSessionDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleCloseSession}>
                Close Session
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Record Transaction Dialog */}
        <Dialog open={transactionDialog} onOpenChange={setTransactionDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record Transaction</DialogTitle>
              <DialogDescription>
                Record a cash movement in the register
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Transaction Type</Label>
                <Select value={transactionType} onValueChange={setTransactionType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash_in">Cash In</SelectItem>
                    <SelectItem value="cash_out">Cash Out</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                    <SelectItem value="deposit">Deposit</SelectItem>
                    <SelectItem value="withdrawal">Withdrawal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Amount</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={transactionAmount}
                  onChange={(e) => setTransactionAmount(e.target.value)}
                />
              </div>
              <div>
                <Label>Description</Label>
                <Textarea
                  placeholder="Description of the transaction..."
                  value={transactionDescription}
                  onChange={(e) => setTransactionDescription(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setTransactionDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleRecordTransaction}>
                Record
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Adjustment Dialog */}
        <Dialog open={adjustmentDialog} onOpenChange={setAdjustmentDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Cash Adjustment</DialogTitle>
              <DialogDescription>
                Make an adjustment to the cash balance
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Adjustment Amount</Label>
                <Input
                  type="number"
                  placeholder="0.00 (positive or negative)"
                  value={adjustmentAmount}
                  onChange={(e) => setAdjustmentAmount(e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Use negative for reduction, positive for addition
                </p>
              </div>
              <div>
                <Label>Reason</Label>
                <Textarea
                  placeholder="Reason for the adjustment..."
                  value={adjustmentReason}
                  onChange={(e) => setAdjustmentReason(e.target.value)}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setAdjustmentDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleAdjustment} disabled={!adjustmentReason}>
                Apply Adjustment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  )
}
