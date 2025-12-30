import React, { useState, useEffect, useCallback } from 'react'
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Calendar,
  FileText,
  TrendingUp,
  Filter,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
import { Separator } from '@/components/ui/separator'
import { formatDateTime, cn } from '@/lib/utils'

interface Expense {
  id: number
  branchId: number
  userId: number
  category: 'rent' | 'utilities' | 'salaries' | 'supplies' | 'maintenance' | 'marketing' | 'other'
  amount: number
  description: string | null
  paymentMethod: 'cash' | 'card' | 'check' | 'transfer'
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

interface Branch {
  id: number
  name: string
  code: string
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
  console.log('ExpensesScreen rendering...')

  const [expenses, setExpenses] = useState<Expense[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalExpenses, setTotalExpenses] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [formData, setFormData] = useState<ExpenseFormData>(initialFormData)
  const [errors, setErrors] = useState<Partial<ExpenseFormData>>({})
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })

  const itemsPerPage = 20

  console.log('State initialized, expenses length:', expenses.length)

  const fetchExpenses = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await window.api.expenses.getAll({
        page: currentPage,
        limit: itemsPerPage,
        category: selectedCategory || undefined,
        startDate: dateRange.start || undefined,
        endDate: dateRange.end || undefined,
      })

      if (response.success && response.data) {
        setExpenses(response.data)
        setTotalPages(response.totalPages || 1)
        setTotalExpenses(response.total || 0)
      } else {
        console.error('Failed to fetch expenses:', response.message)
        setExpenses([])
      }
    } catch (error) {
      console.error('Failed to fetch expenses:', error)
      setExpenses([])
    } finally {
      setIsLoading(false)
    }
  }, [currentPage, selectedCategory, dateRange])

  const fetchBranches = async () => {
    try {
      const response = await window.api.branches.getAll()
      if (response && response.data) {
        setBranches(response.data)
      } else {
        console.error('Failed to fetch branches:', response)
        setBranches([])
      }
    } catch (error) {
      console.error('Failed to fetch branches:', error)
      setBranches([])
    }
  }

  useEffect(() => {
    fetchBranches()
  }, [])

  useEffect(() => {
    fetchExpenses()
  }, [fetchExpenses])

  const handleOpenDialog = (expense?: Expense) => {
    if (expense) {
      setEditingExpense(expense)
      setFormData({
        category: expense.category,
        amount: expense.amount.toString(),
        description: expense.description || '',
        paymentMethod: expense.paymentMethod,
        reference: expense.reference || '',
        expenseDate: expense.expenseDate.split('T')[0],
      })
    } else {
      setEditingExpense(null)
      setFormData(initialFormData)
    }
    setErrors({})
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingExpense(null)
    setFormData(initialFormData)
    setErrors({})
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<ExpenseFormData> = {}

    if (!formData.category) {
      newErrors.category = 'Category is required'
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0'
    }

    if (!formData.expenseDate) {
      newErrors.expenseDate = 'Date is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      const expenseData = {
        category: formData.category as any,
        amount: parseFloat(formData.amount),
        description: formData.description || undefined,
        paymentMethod: formData.paymentMethod as any,
        reference: formData.reference || undefined,
        expenseDate: formData.expenseDate,
      }

      if (editingExpense) {
        const response = await window.api.expenses.update(editingExpense.id, expenseData)
        if (!response.success) {
          alert(response.message || 'Failed to update expense')
          return
        }
      } else {
        const response = await window.api.expenses.create(expenseData)
        if (!response.success) {
          alert(response.message || 'Failed to create expense')
          return
        }
      }

      await fetchExpenses()
      handleCloseDialog()
    } catch (error) {
      console.error('Failed to save expense:', error)
      alert('Failed to save expense. Please try again.')
    }
  }

  const handleDelete = async (expenseId: number) => {
    if (!confirm('Are you sure you want to delete this expense? This action cannot be undone.')) {
      return
    }

    try {
      const response = await window.api.expenses.delete(expenseId)
      if (!response.success) {
        alert(response.message || 'Failed to delete expense')
        return
      }
      await fetchExpenses()
    } catch (error) {
      console.error('Failed to delete expense:', error)
      alert('Failed to delete expense. Please try again.')
    }
  }

  const handleInputChange = (field: keyof ExpenseFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const getBranchName = (branchId: number): string => {
    const branch = branches.find((b) => b.id === branchId)
    return branch ? branch.name : 'Unknown Branch'
  }

  const getCategoryLabel = (category: string): string => {
    const cat = EXPENSE_CATEGORIES.find((c) => c.value === category)
    return cat ? cat.label : category
  }

  const getPaymentMethodLabel = (method: string): string => {
    const pm = PAYMENT_METHODS.find((p) => p.value === method)
    return pm ? pm.label : method
  }

  // Calculate statistics
  const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0)
  const averageExpense = expenses.length > 0 ? totalAmount / expenses.length : 0

  // Filter expenses by search term
  const filteredExpenses = expenses.filter(
    (expense) =>
      getCategoryLabel(expense.category).toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getBranchName(expense.branchId).toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getCategoryBadgeColor = (category: string) => {
    const colors: Record<string, string> = {
      rent: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      utilities: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      salaries: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      supplies: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      maintenance: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      marketing: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
      other: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
    }
    return colors[category] || colors.other
  }

  return (
    <div className="flex flex-col h-full p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Expense Management</h1>
        <p className="text-muted-foreground">Track and manage all business expenses</p>
      </div>

      {/* Action Bar with Filters */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by category, description, reference, or branch..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="h-4 w-4 mr-2" />
            Add Expense
          </Button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {EXPENSE_CATEGORIES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange((prev) => ({ ...prev, start: e.target.value }))}
              className="w-[150px]"
              placeholder="Start date"
            />
            <span className="text-muted-foreground">to</span>
            <Input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange((prev) => ({ ...prev, end: e.target.value }))}
              className="w-[150px]"
              placeholder="End date"
            />
          </div>

          {(selectedCategory || dateRange.start || dateRange.end) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedCategory('')
                setDateRange({ start: '', end: '' })
                setCurrentPage(1)
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <p className="text-2xl font-bold">Rs. {totalAmount.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Records</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <p className="text-2xl font-bold">{totalExpenses}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Average Expense</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <p className="text-2xl font-bold">Rs. {averageExpense.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden flex-1 flex flex-col bg-card">
        <div className="overflow-x-auto flex-1">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Reference</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    Loading expenses...
                  </TableCell>
                </TableRow>
              ) : filteredExpenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    {searchTerm
                      ? 'No expenses found matching your search.'
                      : 'No expenses yet. Add your first expense to get started.'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredExpenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {new Date(expense.expenseDate).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getCategoryBadgeColor(expense.category)}>
                        {getCategoryLabel(expense.category)}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-semibold">Rs. {expense.amount.toFixed(2)}</TableCell>
                    <TableCell>{getPaymentMethodLabel(expense.paymentMethod)}</TableCell>
                    <TableCell>{getBranchName(expense.branchId)}</TableCell>
                    <TableCell>
                      {expense.description ? (
                        <span className="text-sm line-clamp-1" title={expense.description}>
                          {expense.description}
                        </span>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>{expense.reference || '-'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDialog(expense)}
                          title="Edit expense"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(expense.id)}
                          title="Delete expense"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between p-4 border-t">
          <p className="text-sm text-muted-foreground">
            Showing {filteredExpenses.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} to{' '}
            {Math.min(currentPage * itemsPerPage, totalExpenses)} of {totalExpenses} expenses
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <span className="text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingExpense ? 'Edit Expense' : 'Add New Expense'}</DialogTitle>
            <DialogDescription>
              {editingExpense
                ? 'Update the expense information below.'
                : 'Enter the details for the new expense.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              {/* Basic Information */}
              <div>
                <h3 className="text-sm font-semibold mb-3">Expense Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">
                      Category <span className="text-destructive">*</span>
                    </Label>
                    <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                      <SelectTrigger className={cn(errors.category && 'border-destructive')}>
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
                    {errors.category && <p className="text-xs text-destructive">{errors.category}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="amount">
                      Amount (Rs.) <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      min="0"
                      value={formData.amount}
                      onChange={(e) => handleInputChange('amount', e.target.value)}
                      placeholder="0.00"
                      className={cn(errors.amount && 'border-destructive')}
                    />
                    {errors.amount && <p className="text-xs text-destructive">{errors.amount}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="expenseDate">
                      Date <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="expenseDate"
                      type="date"
                      value={formData.expenseDate}
                      onChange={(e) => handleInputChange('expenseDate', e.target.value)}
                      className={cn(errors.expenseDate && 'border-destructive')}
                    />
                    {errors.expenseDate && <p className="text-xs text-destructive">{errors.expenseDate}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="paymentMethod">Payment Method</Label>
                    <Select
                      value={formData.paymentMethod}
                      onValueChange={(value) => handleInputChange('paymentMethod', value)}
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

                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="reference">Reference Number</Label>
                    <Input
                      id="reference"
                      value={formData.reference}
                      onChange={(e) => handleInputChange('reference', e.target.value)}
                      placeholder="Invoice #, Receipt #, etc."
                    />
                  </div>

                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Enter expense details..."
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button type="submit">{editingExpense ? 'Update' : 'Create'} Expense</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
