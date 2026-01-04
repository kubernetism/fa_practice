import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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
} from 'lucide-react'
import { format } from 'date-fns'
import { useBranch } from '@/contexts/branch-context'

interface CashSession {
  id: number
  branch_id: number
  session_date: string
  opening_balance: number
  closing_balance: number | null
  expected_balance: number | null
  actual_balance: number | null
  variance: number | null
  status: 'open' | 'closed' | 'reconciled'
  opened_by: number
  closed_by: number | null
  reconciled_by: number | null
  opened_at: string
  closed_at: string | null
  reconciled_at: string | null
  notes: string | null
  created_at: string
  updated_at: string
  openedByUser?: { id: number; full_name: string }
  closedByUser?: { id: number; full_name: string }
}

interface CashTransaction {
  id: number
  session_id: number
  branch_id: number
  transaction_type: 'cash_in' | 'cash_out' | 'sale' | 'refund' | 'adjustment' | 'expense' | 'deposit' | 'withdrawal'
  amount: number
  reference_type: string | null
  reference_id: number | null
  description: string | null
  recorded_by: number
  transaction_date: string
  created_at: string
  recordedByUser?: { id: number; full_name: string }
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

  const branchId = currentBranch?.id || 1

  useEffect(() => {
    loadData()
  }, [branchId])

  const loadData = async () => {
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
  }

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
        return <Badge className="bg-green-500">Open</Badge>
      case 'closed':
        return <Badge className="bg-blue-500">Closed</Badge>
      case 'reconciled':
        return <Badge className="bg-purple-500">Reconciled</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Cash Register</h1>
          <p className="text-muted-foreground">Manage daily cash sessions and transactions</p>
        </div>
        <div className="flex gap-2">
          {!currentSession && (
            <Button onClick={() => setOpenSessionDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Open Session
            </Button>
          )}
          {currentSession && currentSession.status === 'open' && (
            <>
              <Button variant="outline" onClick={() => setTransactionDialog(true)}>
                <CircleDollarSign className="h-4 w-4 mr-2" />
                Record Transaction
              </Button>
              <Button variant="outline" onClick={() => setAdjustmentDialog(true)}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Adjustment
              </Button>
              <Button variant="destructive" onClick={() => setCloseSessionDialog(true)}>
                <Clock className="h-4 w-4 mr-2" />
                Close Session
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Current Session Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Session Status</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {currentSession ? (
              <>
                {getStatusBadge(currentSession.status)}
                <p className="text-xs text-muted-foreground mt-2">
                  Opened: {format(new Date(currentSession.opened_at), 'MMM d, h:mm a')}
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No active session</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Opening Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currentSession ? formatCurrency(currentSession.opening_balance) : '-'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Cash In</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {cashFlowSummary ? formatCurrency(cashFlowSummary.totalCashIn) : '-'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Cash Out</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {cashFlowSummary ? formatCurrency(cashFlowSummary.totalCashOut) : '-'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Expected Balance Card */}
      {currentSession && cashFlowSummary && (
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Expected Balance</p>
                <p className="text-3xl font-bold">{formatCurrency(cashFlowSummary.expectedBalance)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-muted-foreground">Net Cash Flow</p>
                <p className={`text-2xl font-bold ${cashFlowSummary.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {cashFlowSummary.netCashFlow >= 0 ? '+' : ''}{formatCurrency(cashFlowSummary.netCashFlow)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="current">Today's Transactions</TabsTrigger>
          <TabsTrigger value="history">Session History</TabsTrigger>
          <TabsTrigger value="summary">Cash Flow Summary</TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Today's Transactions</CardTitle>
              <CardDescription>
                All cash movements for the current session
              </CardDescription>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CircleDollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No transactions recorded yet</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Reference</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((tx) => (
                      <TableRow key={tx.id}>
                        <TableCell>
                          {format(new Date(tx.transaction_date), 'h:mm a')}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getTransactionIcon(tx.transaction_type)}
                            <span className="capitalize">{tx.transaction_type.replace('_', ' ')}</span>
                          </div>
                        </TableCell>
                        <TableCell>{tx.description || '-'}</TableCell>
                        <TableCell>
                          {tx.reference_type ? `${tx.reference_type} #${tx.reference_id}` : '-'}
                        </TableCell>
                        <TableCell className={`text-right font-medium ${
                          ['cash_in', 'sale', 'deposit'].includes(tx.transaction_type)
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}>
                          {['cash_in', 'sale', 'deposit'].includes(tx.transaction_type) ? '+' : '-'}
                          {formatCurrency(tx.amount)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Session History</CardTitle>
              <CardDescription>
                Past 30 days of cash register sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sessionHistory.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No session history found</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Opened By</TableHead>
                      <TableHead className="text-right">Opening</TableHead>
                      <TableHead className="text-right">Closing</TableHead>
                      <TableHead className="text-right">Variance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sessionHistory.map((session) => (
                      <TableRow key={session.id}>
                        <TableCell>
                          {format(new Date(session.session_date), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell>{getStatusBadge(session.status)}</TableCell>
                        <TableCell>{session.openedByUser?.full_name || '-'}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(session.opening_balance)}
                        </TableCell>
                        <TableCell className="text-right">
                          {session.closing_balance !== null
                            ? formatCurrency(session.closing_balance)
                            : '-'}
                        </TableCell>
                        <TableCell className={`text-right font-medium ${
                          session.variance === null
                            ? ''
                            : session.variance === 0
                              ? 'text-green-600'
                              : session.variance > 0
                                ? 'text-blue-600'
                                : 'text-red-600'
                        }`}>
                          {session.variance !== null ? (
                            <>
                              {session.variance === 0 ? (
                                <span className="flex items-center justify-end gap-1">
                                  <CheckCircle className="h-4 w-4" />
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
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="summary" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cash Flow by Type</CardTitle>
              <CardDescription>
                Breakdown of cash movements by transaction type
              </CardDescription>
            </CardHeader>
            <CardContent>
              {cashFlowSummary && cashFlowSummary.byType ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(cashFlowSummary.byType).map(([type, amount]) => (
                    <Card key={type}>
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-2 mb-2">
                          {getTransactionIcon(type)}
                          <span className="text-sm font-medium capitalize">
                            {type.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-xl font-bold">{formatCurrency(amount)}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No cash flow data available</p>
                </div>
              )}
            </CardContent>
          </Card>
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
                  ? 'bg-green-100 dark:bg-green-900'
                  : 'bg-yellow-100 dark:bg-yellow-900'
              }`}>
                <div className="flex items-center gap-2">
                  {parseFloat(actualBalance) === cashFlowSummary.expectedBalance ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-yellow-600" />
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
  )
}
