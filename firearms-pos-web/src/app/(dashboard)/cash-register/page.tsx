'use client'

import { useState, useEffect } from 'react'
import {
  Landmark,
  Plus,
  Lock,
  Unlock,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Activity,
  Calculator,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  getActiveSession,
  openSession,
  closeSession,
  getSessionTransactions,
  addCashTransaction,
} from '@/actions/cash-register'
import { toast } from 'sonner'
import { PageLoader } from '@/components/ui/page-loader'

const txTypeLabels: Record<string, { label: string; color: string }> = {
  sale: { label: 'Sale', color: 'text-success' },
  refund: { label: 'Refund', color: 'text-destructive' },
  expense: { label: 'Expense', color: 'text-destructive' },
  ar_collection: { label: 'Collection', color: 'text-success' },
  ap_payment: { label: 'AP Payment', color: 'text-destructive' },
  deposit: { label: 'Deposit', color: 'text-success' },
  withdrawal: { label: 'Withdrawal', color: 'text-destructive' },
  petty_cash_in: { label: 'Cash In', color: 'text-success' },
  petty_cash_out: { label: 'Cash Out', color: 'text-destructive' },
  adjustment: { label: 'Adjustment', color: 'text-warning' },
}

export default function CashRegisterPage() {
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState<any>(null)
  const [transactions, setTransactions] = useState<any[]>([])
  const [openDialogOpen, setOpenDialogOpen] = useState(false)
  const [closeDialogOpen, setCloseDialogOpen] = useState(false)
  const [txDialogOpen, setTxDialogOpen] = useState(false)
  const [openingBalance, setOpeningBalance] = useState('')
  const [actualBalance, setActualBalance] = useState('')
  const [closeNotes, setCloseNotes] = useState('')
  const [txType, setTxType] = useState('')
  const [txAmount, setTxAmount] = useState('')
  const [txDescription, setTxDescription] = useState('')

  const branchId = 1 // TODO: Get from session/context

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    try {
      setLoading(true)
      const sessionRes = await getActiveSession(branchId)
      if (sessionRes.success && sessionRes.data) {
        setSession(sessionRes.data)
        const txRes = await getSessionTransactions(sessionRes.data.id)
        if (txRes.success) {
          setTransactions(txRes.data)
        }
      }
    } catch (error) {
      console.error('Failed to load cash register data:', error)
      toast.error('Failed to load cash register data')
    } finally {
      setLoading(false)
    }
  }

  async function handleOpenSession(e: React.FormEvent) {
    e.preventDefault()
    try {
      const res = await openSession({ branchId, openingBalance })
      if (res.success) {
        toast.success('Cash register session opened')
        setOpenDialogOpen(false)
        setOpeningBalance('')
        loadData()
      }
    } catch (error) {
      console.error('Failed to open session:', error)
      toast.error('Failed to open session')
    }
  }

  async function handleCloseSession(e: React.FormEvent) {
    e.preventDefault()
    if (!session) return
    try {
      const res = await closeSession({
        sessionId: session.id,
        actualBalance,
        notes: closeNotes,
      })
      if (res.success) {
        toast.success('Cash register session closed')
        setCloseDialogOpen(false)
        setActualBalance('')
        setCloseNotes('')
        loadData()
      }
    } catch (error) {
      console.error('Failed to close session:', error)
      toast.error('Failed to close session')
    }
  }

  async function handleAddTransaction(e: React.FormEvent) {
    e.preventDefault()
    if (!session) return
    try {
      const res = await addCashTransaction({
        sessionId: session.id,
        branchId,
        transactionType: txType,
        amount: txAmount,
        description: txDescription,
      })
      if (res.success) {
        toast.success('Transaction recorded')
        setTxDialogOpen(false)
        setTxType('')
        setTxAmount('')
        setTxDescription('')
        loadData()
      }
    } catch (error) {
      console.error('Failed to add transaction:', error)
      toast.error('Failed to add transaction')
    }
  }

  const sessionActive = session?.status === 'open'
  const totalIn = transactions
    .filter((t) => Number(t.amount) > 0)
    .reduce((sum, t) => sum + Number(t.amount), 0)
  const totalOut = transactions
    .filter((t) => Number(t.amount) < 0)
    .reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0)
  const currentBalance = Number(session?.openingBalance || 0) + totalIn - totalOut

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Cash Register</h1>
            <PageLoader />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Cash Register</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage daily cash sessions and reconciliation</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={txDialogOpen} onOpenChange={setTxDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" disabled={!sessionActive}>
                <Plus className="w-4 h-4 mr-2" />
                Add Transaction
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[420px]">
              <DialogHeader>
                <DialogTitle>Record Cash Transaction</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddTransaction} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Transaction Type</Label>
                  <Select value={txType} onValueChange={setTxType} required>
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="petty_cash_in">Cash In</SelectItem>
                      <SelectItem value="petty_cash_out">Cash Out</SelectItem>
                      <SelectItem value="deposit">Deposit</SelectItem>
                      <SelectItem value="withdrawal">Withdrawal</SelectItem>
                      <SelectItem value="adjustment">Adjustment</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Amount (Rs.)</Label>
                  <Input type="number" placeholder="0.00" value={txAmount} onChange={(e) => setTxAmount(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input placeholder="What is this transaction for?" value={txDescription} onChange={(e) => setTxDescription(e.target.value)} />
                </div>
                <Button type="submit" className="w-full brass-glow">Record Transaction</Button>
              </form>
            </DialogContent>
          </Dialog>
          {sessionActive ? (
            <Dialog open={closeDialogOpen} onOpenChange={setCloseDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="destructive">
                  <Lock className="w-4 h-4 mr-2" />
                  Close Session
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Close Cash Register Session</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCloseSession} className="space-y-4 mt-4">
                  <div className="p-4 rounded-lg bg-muted/50 border border-border space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Expected Balance:</span>
                      <span className="font-bold">Rs. {currentBalance.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Actual Cash Count (Rs.)</Label>
                    <Input type="number" placeholder="Count the actual cash" value={actualBalance} onChange={(e) => setActualBalance(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label>Notes</Label>
                    <Input placeholder="Any discrepancies or notes" value={closeNotes} onChange={(e) => setCloseNotes(e.target.value)} />
                  </div>
                  <Button type="submit" variant="destructive" className="w-full">Close & Reconcile</Button>
                </form>
              </DialogContent>
            </Dialog>
          ) : (
            <Dialog open={openDialogOpen} onOpenChange={setOpenDialogOpen}>
              <DialogTrigger asChild>
                <Button className="brass-glow">
                  <Unlock className="w-4 h-4 mr-2" />
                  Open Session
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[420px]">
                <DialogHeader>
                  <DialogTitle>Open Cash Register Session</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleOpenSession} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label>Opening Balance (Rs.)</Label>
                    <Input type="number" placeholder="0.00" value={openingBalance} onChange={(e) => setOpeningBalance(e.target.value)} required />
                  </div>
                  <Button type="submit" className="w-full brass-glow">Open Session</Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Session Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="card-tactical">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Opening Balance</p>
                <p className="text-2xl font-bold tracking-tight">Rs. {Number(session?.openingBalance || 0).toLocaleString()}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Landmark className="w-5 h-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-tactical">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Cash In</p>
                <p className="text-2xl font-bold tracking-tight text-success">Rs. {totalIn.toLocaleString()}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <ArrowDownRight className="w-5 h-5 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-tactical">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Cash Out</p>
                <p className="text-2xl font-bold tracking-tight text-destructive">Rs. {totalOut.toLocaleString()}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                <ArrowUpRight className="w-5 h-5 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="card-tactical border-primary/30">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Current Balance</p>
                <p className="text-2xl font-bold tracking-tight">Rs. {currentBalance.toLocaleString()}</p>
              </div>
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Calculator className="w-5 h-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Session Info */}
      {session && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Badge variant="outline" className={`text-xs ${sessionActive ? 'bg-success/10 text-success border-success/20' : 'bg-muted text-muted-foreground'}`}>
                  <Activity className="w-3 h-3 mr-1" />
                  {sessionActive ? 'Session Active' : 'Session Closed'}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Opened at {new Date(session.openedAt).toLocaleTimeString()}
                </span>
              </div>
              <span className="text-sm text-muted-foreground">{session.sessionDate}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transactions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Today&apos;s Transactions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx) => {
                const isNegative = Number(tx.amount) < 0
                const typeInfo = txTypeLabels[tx.transactionType] || { label: tx.transactionType, color: 'text-foreground' }
                return (
                  <TableRow key={tx.id}>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(tx.transactionDate).toLocaleTimeString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px]">{typeInfo.label}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">{tx.description || '-'}</TableCell>
                    <TableCell className={`text-right text-sm font-semibold ${isNegative ? 'text-destructive' : 'text-success'}`}>
                      {isNegative ? '-' : '+'}Rs. {Math.abs(Number(tx.amount)).toLocaleString()}
                    </TableCell>
                  </TableRow>
                )
              })}
              {transactions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    No transactions recorded
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
