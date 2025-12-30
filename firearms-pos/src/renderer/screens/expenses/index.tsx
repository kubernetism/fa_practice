import React, { useState, useEffect } from 'react'
import { Plus, Search, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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

interface Expense {
  id: number
  branchId: number
  userId: number
  category: string
  amount: number
  description: string | null
  paymentMethod: string
  reference: string | null
  expenseDate: string
  createdAt: string
  updatedAt: string
}

interface ExpenseFormData {
  category: string
  amount: string
  description: string
  paymentMethod: string
  reference: string
  expenseDate: string
}

const EXPENSE_CATEGORIES = [
  { value: 'rent', label: 'Rent' },
  { value: 'utilities', label: 'Utilities' },
  { value: 'salaries', label: 'Salaries' },
  { value: 'supplies', label: 'Supplies' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'other', label: 'Other' },
]

const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Card' },
  { value: 'check', label: 'Check' },
  { value: 'transfer', label: 'Bank Transfer' },
]

const initialFormData: ExpenseFormData = {
  category: 'other',
  amount: '',
  description: '',
  paymentMethod: 'cash',
  reference: '',
  expenseDate: new Date().toISOString().split('T')[0],
}

export default function ExpensesScreen() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState<ExpenseFormData>(initialFormData)

  useEffect(() => {
    fetchExpenses()
  }, [])

  const fetchExpenses = async () => {
    try {
      setIsLoading(true)
      const response = await window.api.expenses.getAll({
        page: 1,
        limit: 20,
      })

      if (response?.success && response?.data) {
        setExpenses(response.data)
      } else {
        setExpenses([])
      }
    } catch (error) {
      console.error('Failed to fetch expenses:', error)
      setExpenses([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenDialog = () => {
    setFormData(initialFormData)
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setFormData(initialFormData)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      alert('Please enter a valid amount')
      return
    }

    try {
      const expenseData = {
        category: formData.category,
        amount: parseFloat(formData.amount),
        description: formData.description || undefined,
        paymentMethod: formData.paymentMethod,
        reference: formData.reference || undefined,
        expenseDate: formData.expenseDate,
      }

      const response = await window.api.expenses.create(expenseData)
      if (response.success) {
        await fetchExpenses()
        handleCloseDialog()
      } else {
        alert(response.message || 'Failed to create expense')
      }
    } catch (error) {
      console.error('Failed to save expense:', error)
      alert('Failed to save expense. Please try again.')
    }
  }

  const handleDelete = async (expenseId: number) => {
    if (!confirm('Are you sure you want to delete this expense?')) {
      return
    }

    try {
      const response = await window.api.expenses.delete(expenseId)
      if (response.success) {
        await fetchExpenses()
      } else {
        alert(response.message || 'Failed to delete expense')
      }
    } catch (error) {
      console.error('Failed to delete expense:', error)
      alert('Failed to delete expense. Please try again.')
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-lg">Loading expenses...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Expense Management</h1>
        <p className="text-muted-foreground">Track and manage all business expenses</p>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search expenses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={handleOpenDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Add Expense
        </Button>
      </div>

      <div className="border rounded-lg p-6 bg-card">
        {expenses.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No expenses yet. Click "Add Expense" to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Found {expenses.length} expense(s)
            </p>
            <div className="space-y-2">
              {expenses.map((expense) => (
                <div key={expense.id} className="flex items-center justify-between p-4 border rounded">
                  <div>
                    <p className="font-medium">{expense.category}</p>
                    <p className="text-sm text-muted-foreground">
                      Rs. {expense.amount.toFixed(2)} - {new Date(expense.expenseDate).toLocaleDateString()}
                    </p>
                    {expense.description && (
                      <p className="text-sm text-muted-foreground">{expense.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(expense.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add Expense Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Expense</DialogTitle>
            <DialogDescription>Enter the details for the new expense.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPENSE_CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount (Rs.) *</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0.00"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="expenseDate">Date</Label>
                <Input
                  id="expenseDate"
                  type="date"
                  value={formData.expenseDate}
                  onChange={(e) => setFormData({ ...formData, expenseDate: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Select
                  value={formData.paymentMethod}
                  onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_METHODS.map((method) => (
                      <SelectItem key={method.value} value={method.value}>
                        {method.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reference">Reference Number</Label>
                <Input
                  id="reference"
                  value={formData.reference}
                  onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                  placeholder="Invoice #, Receipt #, etc."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter expense details..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button type="submit">Create Expense</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
