'use client'

import { useState } from 'react'
import {
  Receipt,
  Plus,
  Filter,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle,
  Trash2,
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

const categories = ['rent', 'utilities', 'salaries', 'supplies', 'maintenance', 'marketing', 'other']
const paymentMethods = ['cash', 'card', 'check', 'transfer']

const mockExpenses = [
  { id: 1, category: 'rent', amount: '45000', description: 'Shop rent - February', paymentMethod: 'transfer', paymentStatus: 'paid', expenseDate: '2026-02-01', reference: 'TRF-001' },
  { id: 2, category: 'utilities', amount: '8500', description: 'Electricity bill', paymentMethod: 'cash', paymentStatus: 'paid', expenseDate: '2026-02-03', reference: '' },
  { id: 3, category: 'salaries', amount: '120000', description: 'Staff salaries - January', paymentMethod: 'transfer', paymentStatus: 'unpaid', expenseDate: '2026-02-05', reference: '' },
  { id: 4, category: 'supplies', amount: '3200', description: 'Cleaning supplies', paymentMethod: 'cash', paymentStatus: 'paid', expenseDate: '2026-02-04', reference: 'CSH-044' },
  { id: 5, category: 'maintenance', amount: '15000', description: 'AC repair', paymentMethod: 'cash', paymentStatus: 'paid', expenseDate: '2026-02-02', reference: '' },
]

const summaryCards = [
  { title: 'Total Expenses', value: 'Rs. 191,700', icon: DollarSign, accent: 'text-primary' },
  { title: 'Paid', value: 'Rs. 71,700', icon: CheckCircle2, accent: 'text-success' },
  { title: 'Unpaid', value: 'Rs. 120,000', icon: AlertCircle, accent: 'text-warning' },
  { title: 'This Month', value: '5 entries', icon: Clock, accent: 'text-muted-foreground' },
]

export default function ExpensesPage() {
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')

  const filtered = mockExpenses.filter((e) => {
    if (filterCategory !== 'all' && e.category !== filterCategory) return false
    if (filterStatus !== 'all' && e.paymentStatus !== filterStatus) return false
    return true
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Expenses</h1>
          <p className="text-sm text-muted-foreground mt-1">Track and manage business expenses</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="brass-glow">
              <Plus className="w-4 h-4 mr-2" />
              Add Expense
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Record New Expense</DialogTitle>
            </DialogHeader>
            <form className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Amount (Rs.)</Label>
                  <Input type="number" placeholder="0.00" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input placeholder="What was this expense for?" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map((m) => (
                        <SelectItem key={m} value={m} className="capitalize">{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="unpaid">Unpaid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Input type="date" />
                </div>
                <div className="space-y-2">
                  <Label>Reference</Label>
                  <Input placeholder="Optional reference" />
                </div>
              </div>
              <Button type="submit" className="w-full brass-glow">Save Expense</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card) => (
          <Card key={card.title} className="card-tactical">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{card.title}</p>
                  <p className="text-2xl font-bold tracking-tight">{card.value}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <card.icon className={`w-5 h-5 ${card.accent}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="unpaid">Unpaid</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Method</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[60px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell className="text-sm text-muted-foreground">{expense.expenseDate}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize text-[10px]">{expense.category}</Badge>
                  </TableCell>
                  <TableCell className="text-sm font-medium">{expense.description}</TableCell>
                  <TableCell className="text-sm capitalize text-muted-foreground">{expense.paymentMethod}</TableCell>
                  <TableCell className="text-right text-sm font-semibold">Rs. {Number(expense.amount).toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge
                      className={`text-[10px] ${
                        expense.paymentStatus === 'paid'
                          ? 'bg-success/10 text-success border-success/20'
                          : 'bg-warning/10 text-warning border-warning/20'
                      }`}
                      variant="outline"
                    >
                      {expense.paymentStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No expenses found
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
