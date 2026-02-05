'use client'

import { useState } from 'react'
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

const mockSession = {
  id: 1,
  sessionDate: '2026-02-05',
  openingBalance: '25000',
  status: 'open',
  openedBy: 'Admin',
  openedAt: '09:00 AM',
}

const mockTransactions = [
  { id: 1, type: 'sale', amount: '85000', description: 'INV-0024 - Ahmad Khan', time: '10:15 AM' },
  { id: 2, type: 'sale', amount: '12500', description: 'INV-0023 - Walk-in', time: '10:45 AM' },
  { id: 3, type: 'expense', amount: '-3200', description: 'Cleaning supplies', time: '11:30 AM' },
  { id: 4, type: 'petty_cash_out', amount: '-1500', description: 'Tea & refreshments', time: '12:00 PM' },
  { id: 5, type: 'sale', amount: '35000', description: 'INV-0022 - Ali Raza', time: '01:30 PM' },
  { id: 6, type: 'ar_collection', amount: '50000', description: 'Collection from Fazal Corp', time: '02:00 PM' },
  { id: 7, type: 'refund', amount: '-4500', description: 'Return - Walk-in customer', time: '03:15 PM' },
]

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
  const [sessionActive] = useState(true)

  const totalIn = mockTransactions
    .filter((t) => Number(t.amount) > 0)
    .reduce((sum, t) => sum + Number(t.amount), 0)
  const totalOut = mockTransactions
    .filter((t) => Number(t.amount) < 0)
    .reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0)
  const currentBalance = Number(mockSession.openingBalance) + totalIn - totalOut

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Cash Register</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage daily cash sessions and reconciliation</p>
        </div>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Add Transaction
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[420px]">
              <DialogHeader>
                <DialogTitle>Record Cash Transaction</DialogTitle>
              </DialogHeader>
              <form className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Transaction Type</Label>
                  <Select>
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
                  <Input type="number" placeholder="0.00" />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input placeholder="What is this transaction for?" />
                </div>
                <Button type="submit" className="w-full brass-glow">Record Transaction</Button>
              </form>
            </DialogContent>
          </Dialog>
          {sessionActive ? (
            <Dialog>
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
                <form className="space-y-4 mt-4">
                  <div className="p-4 rounded-lg bg-muted/50 border border-border space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Expected Balance:</span>
                      <span className="font-bold">Rs. {currentBalance.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Actual Cash Count (Rs.)</Label>
                    <Input type="number" placeholder="Count the actual cash" />
                  </div>
                  <div className="space-y-2">
                    <Label>Notes</Label>
                    <Input placeholder="Any discrepancies or notes" />
                  </div>
                  <Button type="submit" variant="destructive" className="w-full">Close & Reconcile</Button>
                </form>
              </DialogContent>
            </Dialog>
          ) : (
            <Button className="brass-glow">
              <Unlock className="w-4 h-4 mr-2" />
              Open Session
            </Button>
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
                <p className="text-2xl font-bold tracking-tight">Rs. {Number(mockSession.openingBalance).toLocaleString()}</p>
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
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="bg-success/10 text-success border-success/20 text-xs">
                <Activity className="w-3 h-3 mr-1" />
                Session Active
              </Badge>
              <span className="text-sm text-muted-foreground">
                Opened by <span className="font-medium text-foreground">{mockSession.openedBy}</span> at {mockSession.openedAt}
              </span>
            </div>
            <span className="text-sm text-muted-foreground">{mockSession.sessionDate}</span>
          </div>
        </CardContent>
      </Card>

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
              {mockTransactions.map((tx) => {
                const isNegative = Number(tx.amount) < 0
                const typeInfo = txTypeLabels[tx.type] || { label: tx.type, color: 'text-foreground' }
                return (
                  <TableRow key={tx.id}>
                    <TableCell className="text-sm text-muted-foreground">{tx.time}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px]">{typeInfo.label}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">{tx.description}</TableCell>
                    <TableCell className={`text-right text-sm font-semibold ${isNegative ? 'text-destructive' : 'text-success'}`}>
                      {isNegative ? '-' : '+'}Rs. {Math.abs(Number(tx.amount)).toLocaleString()}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
