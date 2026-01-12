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
import { useBranch } from '@/contexts/branch-context'

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
  paymentStatus: 'paid' | 'unpaid'
  supplierId: number | null
  payableId: number | null
  dueDate: string | null
  paymentTerms: string | null
  createdAt: string
  updatedAt: string
  supplier?: {
    id: number
    name: string
  }
  payable?: {
    id: number
    status: string
    remainingAmount: number
  }
}

interface ExpenseFormData {
  category: string
  amount: string
  description: string
  paymentMethod: string
  reference: string
  expenseDate: string
  paymentStatus: 'paid' | 'unpaid'
  supplierId: string
  dueDate: string
  paymentTerms: string
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

const PAYMENT_TERMS = [
  { value: 'Net 15', label: 'Net 15' },
  { value: 'Net 30', label: 'Net 30' },
  { value: 'Net 45', label: 'Net 45' },
  { value: 'Net 60', label: 'Net 60' },
  { value: 'Due on Receipt', label: 'Due on Receipt' },
]

const initialFormData: ExpenseFormData = {
  category: 'other',
  amount: '',
  description: '',
  paymentMethod: 'cash',
  reference: '',
  expenseDate: new Date().toISOString().split('T')[0],
  paymentStatus: 'paid',
  supplierId: '',
  dueDate: '',
  paymentTerms: '',
}

export default function ExpensesScreen() {
  const { currentBranch } = useBranch()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [suppliers, setSuppliers] = useState<Array<{ id: number; name: string }>>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState<ExpenseFormData>(initialFormData)

  useEffect(() => {
    if (currentBranch) {
      fetchExpenses()
    }
  }, [currentBranch])

  useEffect(() => {
    fetchSuppliers()
  }, [])

  const fetchExpenses = async () => {
    if (!currentBranch) return

    try {
      setIsLoading(true)
      const response = await window.api.expenses.getAll({
        page: 1,
        limit: 1000,
        branchId: currentBranch.id,
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

  const fetchSuppliers = async () => {
    try {
      const response = await window.api.suppliers.getAll({
        isActive: true,
        limit: 1000,
      })
      if (response?.success && response?.data) {
        setSuppliers(response.data)
      }
    } catch (error) {
      console.error('Failed to fetch suppliers:', error)
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

    // Validation for unpaid expenses
    if (formData.paymentStatus === 'unpaid') {
      if (!formData.supplierId) {
        alert('Please select a supplier for unpaid expenses')
        return
      }
      if (!formData.dueDate) {
        alert('Please enter a due date for unpaid expenses')
        return
      }
    }

    if (!currentBranch) {
      alert('No branch selected')
      return
    }

    try {
      const expenseData: any = {
        branchId: currentBranch.id,
        category: formData.category,
        amount: parseFloat(formData.amount),
        description: formData.description || undefined,
        expenseDate: formData.expenseDate,
        paymentStatus: formData.paymentStatus,
      }

      // Conditional fields based on payment status
      if (formData.paymentStatus === 'paid') {
        expenseData.paymentMethod = formData.paymentMethod
        expenseData.reference = formData.reference || undefined
      } else {
        expenseData.supplierId = parseInt(formData.supplierId)
        expenseData.dueDate = formData.dueDate
        expenseData.paymentTerms = formData.paymentTerms || undefined
      }

      const response = await window.api.expenses.create(expenseData)
      if (response.success) {
        await fetchExpenses()
        handleCloseDialog()

        // Show success message
        if (response.payableCreated) {
          alert('Expense created and account payable generated successfully!')
        } else {
          alert('Expense created successfully!')
        }
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
        <p className="text-muted-foreground">
          Track and manage all business expenses • {currentBranch?.name || 'Select a branch'}
        </p>
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
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium capitalize">{expense.category}</p>
                      {/* Payment Status Badge */}
                      <span
                        className={`px-2 py-0.5 text-xs rounded font-medium ${
                          expense.paymentStatus === 'paid'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {expense.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'}
                      </span>
                    </div>

                    <p className="text-sm text-muted-foreground">
                      Rs. {expense.amount.toFixed(2)} - {new Date(expense.expenseDate).toLocaleDateString()}
                    </p>

                    {/* Show supplier for unpaid expenses */}
                    {expense.paymentStatus === 'unpaid' && expense.supplier && (
                      <p className="text-sm text-muted-foreground">
                        Supplier: {expense.supplier.name}
                        {expense.dueDate && (
                          <> | Due: {new Date(expense.dueDate).toLocaleDateString()}</>
                        )}
                      </p>
                    )}

                    {/* Show payment method for paid expenses */}
                    {expense.paymentStatus === 'paid' && expense.paymentMethod && (
                      <p className="text-sm text-muted-foreground">
                        Payment: {expense.paymentMethod}
                        {expense.reference && <> | Ref: {expense.reference}</>}
                      </p>
                    )}

                    {expense.description && (
                      <p className="text-sm text-muted-foreground">{expense.description}</p>
                    )}

                    {/* Show link to payable */}
                    {expense.payableId && expense.payable && (
                      <p className="text-xs text-blue-600 mt-1">
                        Linked Payable #{expense.payableId} - Status: {expense.payable.status} -
                        Remaining: Rs. {expense.payable.remainingAmount.toFixed(2)}
                      </p>
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
        <DialogContent className="max-w-md max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Add New Expense</DialogTitle>
            <DialogDescription>Enter the details for the new expense.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
            <div className="space-y-3 py-3 overflow-y-auto px-1">
              {/* Payment Status */}
              <div className="space-y-2">
                <Label htmlFor="paymentStatus">Payment Status *</Label>
                <Select
                  value={formData.paymentStatus}
                  onValueChange={(value) =>
                    setFormData({ ...formData, paymentStatus: value as 'paid' | 'unpaid' })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="unpaid">Unpaid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
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

              {/* Amount */}
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

              {/* Expense Date */}
              <div className="space-y-2">
                <Label htmlFor="expenseDate">Expense Date *</Label>
                <Input
                  id="expenseDate"
                  type="date"
                  value={formData.expenseDate}
                  onChange={(e) => setFormData({ ...formData, expenseDate: e.target.value })}
                  required
                />
              </div>

              {/* Supplier (shown only for unpaid) */}
              {formData.paymentStatus === 'unpaid' && (
                <div className="space-y-2">
                  <Label htmlFor="supplier">Supplier *</Label>
                  <Select
                    value={formData.supplierId}
                    onValueChange={(value) => setFormData({ ...formData, supplierId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map((supplier) => (
                        <SelectItem key={supplier.id} value={supplier.id.toString()}>
                          {supplier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Due Date (shown only for unpaid) */}
              {formData.paymentStatus === 'unpaid' && (
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date *</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
              )}

              {/* Payment Terms (shown only for unpaid) */}
              {formData.paymentStatus === 'unpaid' && (
                <div className="space-y-2">
                  <Label htmlFor="paymentTerms">Payment Terms</Label>
                  <Select
                    value={formData.paymentTerms}
                    onValueChange={(value) => setFormData({ ...formData, paymentTerms: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select terms" />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYMENT_TERMS.map((term) => (
                        <SelectItem key={term.value} value={term.value}>
                          {term.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Payment Method (shown only for paid) */}
              {formData.paymentStatus === 'paid' && (
                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">Payment Method *</Label>
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
              )}

              {/* Reference (shown only for paid) */}
              {formData.paymentStatus === 'paid' && (
                <div className="space-y-2">
                  <Label htmlFor="reference">Reference Number</Label>
                  <Input
                    id="reference"
                    value={formData.reference}
                    onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                    placeholder="Invoice #, Receipt #, etc."
                  />
                </div>
              )}

              {/* Description - always shown */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter expense details..."
                  rows={2}
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
