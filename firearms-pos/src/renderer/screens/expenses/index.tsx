import React, { useState, useEffect, useMemo, useCallback } from 'react'
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  RotateCcw,
  X,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Calendar,
  RefreshCw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip'
import { useBranch } from '@/contexts/branch-context'
import { ReversalRequestModal } from '@/components/reversal-request-modal'
import { ReversalStatusBadge } from '@/components/reversal-status-badge'
import { formatDate, cn } from '@/lib/utils'

// ─── Constants ───────────────────────────────────────────────────────────────

const ITEMS_PER_PAGE = 10

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

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface Category {
  id: number
  name: string
  description: string | null
  isActive: boolean
}

interface Expense {
  id: number
  branchId: number
  userId: number
  categoryId: number
  amount: number
  description: string | null
  paymentMethod: string
  reference: string | null
  expenseDate: string
  paymentStatus: 'paid' | 'unpaid'
  isVoided: boolean
  supplierId: number | null
  payableId: number | null
  dueDate: string | null
  paymentTerms: string | null
  createdAt: string
  updatedAt: string
  category?: Category
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
  categoryId: string
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

// ─── Initial State ────────────────────────────────────────────────────────────

const initialFormData: ExpenseFormData = {
  categoryId: '',
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Capitalise first letter of a string */
function capitalize(str: string): string {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ExpensesScreen() {
  const { currentBranch } = useBranch()

  // Data
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [suppliers, setSuppliers] = useState<Array<{ id: number; name: string }>>([])

  // UI state
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  // Dialog — add expense
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState<ExpenseFormData>(initialFormData)

  // Reversal modal
  const [isReversalModalOpen, setIsReversalModalOpen] = useState(false)
  const [reversalTargetExpense, setReversalTargetExpense] = useState<Expense | null>(null)

  // ─── Data fetching ────────────────────────────────────────────────────────

  const fetchExpenses = useCallback(async () => {
    if (!currentBranch) return
    try {
      setIsLoading(true)
      const response = await window.api.expenses.getAll({
        page: 1,
        limit: 1000,
        branchId: currentBranch.id,
      })
      setExpenses(response?.success && response?.data ? response.data : [])
    } catch (error) {
      console.error('Failed to fetch expenses:', error)
      setExpenses([])
    } finally {
      setIsLoading(false)
    }
  }, [currentBranch])

  const fetchSuppliers = useCallback(async () => {
    try {
      const response = await window.api.suppliers.getAll({ isActive: true, limit: 1000 })
      if (response?.success && response?.data) setSuppliers(response.data)
    } catch (error) {
      console.error('Failed to fetch suppliers:', error)
    }
  }, [])

  const fetchCategories = useCallback(async () => {
    try {
      const response = await window.api.categories.getAll()
      if (response?.success && response?.data) setCategories(response.data)
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }, [])

  useEffect(() => {
    if (currentBranch) fetchExpenses()
  }, [currentBranch, fetchExpenses])

  useEffect(() => {
    fetchSuppliers()
    fetchCategories()
  }, [fetchSuppliers, fetchCategories])

  // ─── Derived / computed data ──────────────────────────────────────────────

  /** Filtered + sorted list */
  const filteredExpenses = useMemo(() => {
    const term = searchTerm.toLowerCase().trim()
    const sorted = [...expenses].sort(
      (a, b) => new Date(b.expenseDate).getTime() - new Date(a.expenseDate).getTime()
    )
    if (!term) return sorted
    return sorted.filter((exp) => {
      return (
        exp.category?.name.toLowerCase().includes(term) ||
        exp.description?.toLowerCase().includes(term) ||
        exp.supplier?.name.toLowerCase().includes(term) ||
        exp.reference?.toLowerCase().includes(term) ||
        exp.paymentMethod?.toLowerCase().includes(term)
      )
    })
  }, [expenses, searchTerm])

  /** Stat pills */
  const stats = useMemo(() => {
    const total = expenses.length
    const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0)
    const paid = expenses.filter((e) => e.paymentStatus === 'paid').length
    const unpaid = expenses.filter((e) => e.paymentStatus === 'unpaid').length
    return { total, totalAmount, paid, unpaid }
  }, [expenses])

  /** Pagination — derived entirely from memoised inputs, no effect needed */
  const { totalPages, safePage, pageStart, pageExpenses } = useMemo(() => {
    const totalPages = Math.max(1, Math.ceil(filteredExpenses.length / ITEMS_PER_PAGE))
    // Clamp currentPage to valid range so stale page values after a search never cause an empty view
    const safePage = Math.min(currentPage, totalPages)
    const pageStart = (safePage - 1) * ITEMS_PER_PAGE
    const pageExpenses = filteredExpenses.slice(pageStart, pageStart + ITEMS_PER_PAGE)
    return { totalPages, safePage, pageStart, pageExpenses }
  }, [filteredExpenses, currentPage])

  // ─── Handlers ─────────────────────────────────────────────────────────────

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

    if (!formData.categoryId) {
      alert('Please select a category')
      return
    }

    try {
      const expenseData: Record<string, unknown> = {
        branchId: currentBranch.id,
        categoryId: parseInt(formData.categoryId),
        amount: parseFloat(formData.amount),
        description: formData.description || undefined,
        expenseDate: formData.expenseDate,
        paymentStatus: formData.paymentStatus,
      }

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
        alert(
          response.payableCreated
            ? 'Expense created and account payable generated successfully!'
            : 'Expense created successfully!'
        )
      } else {
        alert(response.message || 'Failed to create expense')
      }
    } catch (error) {
      console.error('Failed to save expense:', error)
      alert('Failed to save expense. Please try again.')
    }
  }

  const handleDelete = async (expenseId: number) => {
    if (!confirm('Are you sure you want to delete this expense?')) return
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

  // ─── Loading state ────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading expenses…</p>
      </div>
    )
  }

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-xl font-semibold leading-tight">Expense Management</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {currentBranch?.name || 'Select a branch'}
            </p>
            {/* Stat pills */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium">
                <DollarSign className="h-3 w-3" />
                {stats.total} {stats.total === 1 ? 'expense' : 'expenses'}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium">
                Total: Rs.&nbsp;
                {stats.totalAmount.toLocaleString('en-PK', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                {stats.paid} paid
              </span>
              {stats.unpaid > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-warning">
                  <span className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
                  {stats.unpaid} unpaid
                </span>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex shrink-0 items-center gap-2">
            <Button onClick={handleOpenDialog} size="sm">
              <Plus className="h-4 w-4 mr-1.5" />
              Add Expense
            </Button>
          </div>
        </div>

        {/* ── Search bar ── */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search by category, description, supplier, reference, payment method…"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className="h-8 pl-8 pr-8 text-sm"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => { setSearchTerm(''); setCurrentPage(1) }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={fetchExpenses}
                aria-label="Refresh expenses"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Refresh</TooltipContent>
          </Tooltip>
        </div>

        {/* ── Table ── */}
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="text-[10px] font-semibold tracking-wider uppercase h-8 py-0">
                  Date
                </TableHead>
                <TableHead className="text-[10px] font-semibold tracking-wider uppercase h-8 py-0">
                  Category
                </TableHead>
                <TableHead className="text-[10px] font-semibold tracking-wider uppercase h-8 py-0 max-w-[180px]">
                  Description
                </TableHead>
                <TableHead className="text-[10px] font-semibold tracking-wider uppercase h-8 py-0 text-right">
                  Amount
                </TableHead>
                <TableHead className="text-[10px] font-semibold tracking-wider uppercase h-8 py-0">
                  Payment
                </TableHead>
                <TableHead className="text-[10px] font-semibold tracking-wider uppercase h-8 py-0">
                  Method
                </TableHead>
                <TableHead className="text-[10px] font-semibold tracking-wider uppercase h-8 py-0">
                  Supplier
                </TableHead>
                <TableHead className="text-[10px] font-semibold tracking-wider uppercase h-8 py-0">
                  Payable
                </TableHead>
                <TableHead className="text-[10px] font-semibold tracking-wider uppercase h-8 py-0 w-[100px]">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageExpenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-24 text-center text-sm text-muted-foreground">
                    {searchTerm
                      ? 'No expenses match your search.'
                      : 'No expenses yet. Click "Add Expense" to get started.'}
                  </TableCell>
                </TableRow>
              ) : (
                pageExpenses.map((expense) => (
                  <TableRow key={expense.id} className="h-9 group">
                    {/* Date */}
                    <TableCell className="py-1.5 text-xs whitespace-nowrap">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="h-3 w-3 shrink-0" />
                        {formatDate(expense.expenseDate)}
                      </span>
                    </TableCell>

                    {/* Category */}
                    <TableCell className="py-1.5 text-xs font-medium">
                      {expense.category?.name || (
                        <span className="text-muted-foreground">Uncategorized</span>
                      )}
                    </TableCell>

                    {/* Description */}
                    <TableCell className="py-1.5 text-xs max-w-[180px]">
                      {expense.description ? (
                        <span
                          className="block truncate text-muted-foreground"
                          title={expense.description}
                        >
                          {expense.description}
                        </span>
                      ) : (
                        <span className="text-muted-foreground/40">—</span>
                      )}
                    </TableCell>

                    {/* Amount */}
                    <TableCell className="py-1.5 text-xs text-right font-medium tabular-nums">
                      Rs.&nbsp;
                      {expense.amount.toLocaleString('en-PK', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </TableCell>

                    {/* Payment status badge */}
                    <TableCell className="py-1.5">
                      <div className="flex items-center gap-1.5">
                        <Badge
                          variant={expense.paymentStatus === 'paid' ? 'default' : 'secondary'}
                          className={cn(
                            'text-[10px] px-1.5 py-0 h-4 font-medium',
                            expense.paymentStatus === 'paid'
                              ? 'bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/20'
                              : 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border-yellow-500/20'
                          )}
                        >
                          {expense.paymentStatus === 'paid' ? 'Paid' : 'Unpaid'}
                        </Badge>
                        <ReversalStatusBadge entityType="expense" entityId={expense.id} />
                      </div>
                    </TableCell>

                    {/* Payment method */}
                    <TableCell className="py-1.5 text-xs text-muted-foreground">
                      {expense.paymentStatus === 'paid' ? (
                        <span>
                          {capitalize(expense.paymentMethod)}
                          {expense.reference && (
                            <span className="text-muted-foreground/60">
                              {' '}· {expense.reference}
                            </span>
                          )}
                        </span>
                      ) : (
                        <span className="text-muted-foreground/40">—</span>
                      )}
                    </TableCell>

                    {/* Supplier (unpaid only) */}
                    <TableCell className="py-1.5 text-xs text-muted-foreground">
                      {expense.paymentStatus === 'unpaid' && expense.supplier ? (
                        <span>
                          {expense.supplier.name}
                          {expense.dueDate && (
                            <span className="block text-[10px] text-muted-foreground/60">
                              Due: {formatDate(expense.dueDate)}
                            </span>
                          )}
                        </span>
                      ) : (
                        <span className="text-muted-foreground/40">—</span>
                      )}
                    </TableCell>

                    {/* Payable status */}
                    <TableCell className="py-1.5 text-xs">
                      {expense.payableId && expense.payable ? (
                        <div>
                          <Badge
                            variant="outline"
                            className="text-[10px] px-1.5 py-0 h-4 font-medium"
                          >
                            {capitalize(expense.payable.status)}
                          </Badge>
                          <span className="block text-[10px] text-muted-foreground/60 mt-0.5">
                            Rs.&nbsp;
                            {expense.payable.remainingAmount.toLocaleString('en-PK', {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                            &nbsp;rem.
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground/40">—</span>
                      )}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="py-1.5">
                      <div className="flex items-center gap-0.5">
                        {/* Edit */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                              aria-label="Edit expense"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Edit</TooltipContent>
                        </Tooltip>

                        {/* Delete */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => handleDelete(expense.id)}
                              aria-label="Delete expense"
                            >
                              <Trash2 className="h-3.5 w-3.5 text-destructive" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Delete</TooltipContent>
                        </Tooltip>

                        {/* Request Reversal */}
                        {!expense.isVoided && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => {
                                  setReversalTargetExpense(expense)
                                  setIsReversalModalOpen(true)
                                }}
                                aria-label="Request reversal"
                              >
                                <RotateCcw className="h-3.5 w-3.5 text-amber-500" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Request Reversal</TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* ── Pagination ── */}
        {filteredExpenses.length > ITEMS_PER_PAGE && (
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {pageStart + 1}–{Math.min(pageStart + ITEMS_PER_PAGE, filteredExpenses.length)} of{' '}
              {filteredExpenses.length}
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                disabled={safePage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                aria-label="Previous page"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              <span className="px-1 tabular-nums">
                {safePage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                disabled={safePage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                aria-label="Next page"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}

        {/* ── Reversal Request Modal ── */}
        {reversalTargetExpense && (
          <ReversalRequestModal
            open={isReversalModalOpen}
            onClose={() => {
              setIsReversalModalOpen(false)
              setReversalTargetExpense(null)
            }}
            entityType="expense"
            entityId={reversalTargetExpense.id}
            entityLabel={`Expense #${reversalTargetExpense.id} — ${reversalTargetExpense.category?.name || 'Uncategorized'}`}
            branchId={reversalTargetExpense.branchId}
            onSuccess={fetchExpenses}
          />
        )}

        {/* ── Add Expense Dialog ── */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent
            className="max-w-md max-h-[85vh] flex flex-col"
            onOpenAutoFocus={(e) => {
              e.preventDefault()
              const amountInput = document.getElementById('amount') as HTMLInputElement
              amountInput?.focus()
            }}
          >
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
                    value={formData.categoryId}
                    onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories
                        .filter((cat) => cat.isActive)
                        .map((cat) => (
                          <SelectItem key={cat.id} value={cat.id.toString()}>
                            {cat.name}
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

                {/* Supplier (unpaid only) */}
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

                {/* Due Date (unpaid only) */}
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

                {/* Payment Terms (unpaid only) */}
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

                {/* Payment Method (paid only) */}
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

                {/* Reference (paid only) */}
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

                {/* Description — always shown */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Enter expense details…"
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
    </TooltipProvider>
  )
}
