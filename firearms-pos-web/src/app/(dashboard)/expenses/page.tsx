'use client'

import { useState, useEffect } from 'react'
import {
  Receipt,
  Plus,
  Filter,
  DollarSign,
  Clock,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Pencil,
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
import { getExpenses, getExpenseSummary, createExpense, deleteExpense, updateExpense, getExpenseById } from '@/actions/expenses'
import { toast } from 'sonner'
import { PageLoader } from '@/components/ui/page-loader'

const categories = ['rent', 'utilities', 'salaries', 'supplies', 'maintenance', 'marketing', 'other']
const paymentMethods = ['cash', 'card', 'check', 'transfer']

type Expense = {
  id: number
  category: string
  amount: string
  description: string | null
  paymentMethod: string
  paymentStatus: string
  expenseDate: Date
  reference: string | null
}

type Summary = {
  totalExpenses: string
  paidCount: number
  unpaidCount: number
  totalCount: number
}

export default function ExpensesPage() {
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [editingExpenseId, setEditingExpenseId] = useState<number | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    description: '',
    paymentMethod: '',
    paymentStatus: '',
    expenseDate: '',
    reference: '',
  })

  useEffect(() => {
    loadData()
  }, [filterCategory, filterStatus])

  async function loadData() {
    setLoading(true)
    try {
      const [expensesRes, summaryRes] = await Promise.all([
        getExpenses({
          category: filterCategory !== 'all' ? filterCategory : undefined,
          paymentStatus: filterStatus !== 'all' ? filterStatus : undefined,
        }),
        getExpenseSummary(),
      ])

      if (expensesRes.success) {
        setExpenses(expensesRes.data)
      }
      if (summaryRes.success) {
        setSummary(summaryRes.data)
      }
    } catch (error) {
      console.error('Failed to load expenses:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)

    try {
      const result = await createExpense({
        branchId: 1, // TODO: Get from context
        category: formData.category,
        amount: formData.amount,
        description: formData.description || undefined,
        paymentMethod: formData.paymentMethod,
        reference: formData.reference || undefined,
        paymentStatus: formData.paymentStatus,
        expenseDate: formData.expenseDate || undefined,
      })

      if (result.success) {
        toast.success('Expense created successfully')
        setDialogOpen(false)
        setFormData({
          category: '',
          amount: '',
          description: '',
          paymentMethod: '',
          paymentStatus: '',
          expenseDate: '',
          reference: '',
        })
        loadData()
      } else {
        toast.error('Failed to create expense')
      }
    } catch (error) {
      console.error('Failed to create expense:', error)
      toast.error('Failed to create expense')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleEdit(id: number) {
    try {
      const res = await getExpenseById(id)
      if (res.success && res.data) {
        setEditingExpenseId(id)
        setFormData({
          category: res.data.category,
          amount: res.data.amount,
          description: res.data.description || '',
          paymentMethod: res.data.paymentMethod,
          paymentStatus: res.data.paymentStatus,
          expenseDate: res.data.expenseDate ? new Date(res.data.expenseDate).toISOString().split('T')[0] : '',
          reference: res.data.reference || '',
        })
        setEditDialogOpen(true)
      } else {
        toast.error('Failed to load expense')
      }
    } catch (error) {
      console.error('Failed to load expense:', error)
      toast.error('Failed to load expense')
    }
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault()
    if (!editingExpenseId) return

    setSubmitting(true)
    try {
      const result = await updateExpense(editingExpenseId, {
        category: formData.category,
        amount: formData.amount,
        description: formData.description || undefined,
        paymentMethod: formData.paymentMethod,
        reference: formData.reference || undefined,
        paymentStatus: formData.paymentStatus,
        expenseDate: formData.expenseDate || undefined,
      })

      if (result.success) {
        toast.success('Expense updated successfully')
        setEditDialogOpen(false)
        setEditingExpenseId(null)
        setFormData({
          category: '',
          amount: '',
          description: '',
          paymentMethod: '',
          paymentStatus: '',
          expenseDate: '',
          reference: '',
        })
        loadData()
      } else {
        toast.error(result.message || 'Failed to update expense')
      }
    } catch (error) {
      console.error('Failed to update expense:', error)
      toast.error('Failed to update expense')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Are you sure you want to delete this expense?')) return

    try {
      const res = await deleteExpense(id)
      if (res.success) {
        toast.success('Expense deleted successfully')
        loadData()
      } else {
        toast.error('Failed to delete expense')
      }
    } catch (error) {
      console.error('Failed to delete expense:', error)
      toast.error('Failed to delete expense')
    }
  }

  const paidAmount = expenses
    .filter((e) => e.paymentStatus === 'paid')
    .reduce((sum, e) => sum + Number(e.amount), 0)

  const unpaidAmount = expenses
    .filter((e) => e.paymentStatus === 'unpaid')
    .reduce((sum, e) => sum + Number(e.amount), 0)

  const summaryCards = [
    { title: 'Total Expenses', value: `Rs. ${Number(summary?.totalExpenses || 0).toLocaleString()}`, icon: DollarSign, accent: 'text-primary' },
    { title: 'Paid', value: `Rs. ${paidAmount.toLocaleString()}`, icon: CheckCircle2, accent: 'text-success' },
    { title: 'Unpaid', value: `Rs. ${unpaidAmount.toLocaleString()}`, icon: AlertCircle, accent: 'text-warning' },
    { title: 'This Month', value: `${summary?.totalCount || 0} entries`, icon: Clock, accent: 'text-muted-foreground' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Expenses</h1>
          <p className="text-sm text-muted-foreground mt-1">Track and manage business expenses</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
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
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
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
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  placeholder="What was this expense for?"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <Select
                    value={formData.paymentMethod}
                    onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}
                  >
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
                  <Select
                    value={formData.paymentStatus}
                    onValueChange={(value) => setFormData({ ...formData, paymentStatus: value })}
                  >
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
                  <Input
                    type="date"
                    value={formData.expenseDate}
                    onChange={(e) => setFormData({ ...formData, expenseDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Reference</Label>
                  <Input
                    placeholder="Optional reference"
                    value={formData.reference}
                    onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                  />
                </div>
              </div>
              <Button type="submit" className="w-full brass-glow" disabled={submitting}>
                {submitting ? 'Saving...' : 'Save Expense'}
              </Button>
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
          {loading ? (
            <PageLoader />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(expense.expenseDate).toLocaleDateString('en-PK')}
                    </TableCell>
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
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-primary"
                          onClick={() => handleEdit(expense.id)}
                          title="Edit expense"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDelete(expense.id)}
                          title="Delete expense"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {expenses.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No expenses found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Expense</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
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
                <Input
                  type="number"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                placeholder="What was this expense for?"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Payment Method</Label>
                <Select
                  value={formData.paymentMethod}
                  onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}
                >
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
                <Select
                  value={formData.paymentStatus}
                  onValueChange={(value) => setFormData({ ...formData, paymentStatus: value })}
                >
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
                <Input
                  type="date"
                  value={formData.expenseDate}
                  onChange={(e) => setFormData({ ...formData, expenseDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Reference</Label>
                <Input
                  placeholder="Optional reference"
                  value={formData.reference}
                  onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                />
              </div>
            </div>
            <Button type="submit" className="w-full brass-glow" disabled={submitting}>
              {submitting ? 'Updating...' : 'Update Expense'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
