import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Search,
  Eye,
  Trash2,
  RotateCcw,
  DollarSign,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  AlertCircle,
  RefreshCw,
  Pencil,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip'
import { Separator } from '@/components/ui/separator'
import { ReversalRequestModal } from '@/components/reversal-request-modal'
import { useBranch } from '@/contexts/branch-context'
import { formatCurrency, formatDateTime, truncate } from '@/lib/utils'

interface Return {
  id: number
  returnNumber: string
  originalSaleId: number
  customerId: number | null
  branchId: number
  userId: number
  returnType: 'refund' | 'exchange' | 'store_credit'
  subtotal: number
  taxAmount: number
  totalAmount: number
  refundMethod: 'cash' | 'card' | 'store_credit' | null
  refundAmount: number
  reason: string | null
  notes: string | null
  returnDate: string
  createdAt: string
  updatedAt: string
}

interface ReturnItem {
  id: number
  returnId: number
  saleItemId: number
  productId: number
  serialNumber: string | null
  quantity: number
  unitPrice: number
  totalPrice: number
  condition: 'new' | 'good' | 'fair' | 'damaged'
  restockable: boolean
  product?: Product
}

interface Sale {
  id: number
  invoiceNumber: string
  customerId: number | null
  branchId: number
  userId: number
  subtotal: number
  taxAmount: number
  discountAmount: number
  totalAmount: number
  paymentMethod: string
  saleDate: string
  isVoided: boolean
}

interface SaleItem {
  id: number
  saleId: number
  productId: number
  serialNumber: string | null
  quantity: number
  unitPrice: number
  totalPrice: number
  product?: Product
}

interface Product {
  id: number
  code: string
  name: string
}

interface Customer {
  id: number
  firstName: string
  lastName: string
  phone: string | null
  email: string | null
}

interface UserType {
  id: number
  fullName: string
  username: string
}

interface ReturnItemEntry {
  saleItem: SaleItem
  returnQty: number
  refundAmount: number
  condition: 'new' | 'good' | 'fair' | 'damaged'
  restockable: boolean
}

interface ReturnsSummary {
  totalReturns: number
  totalRefunded: number
  todayReturns: number
  todayRefunded: number
}

const RETURN_TYPES = [
  { value: 'refund', label: 'Refund' },
  { value: 'exchange', label: 'Exchange' },
  { value: 'store_credit', label: 'Store Credit' },
]

const REFUND_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Card' },
  { value: 'store_credit', label: 'Store Credit' },
]

const ITEM_CONDITIONS = [
  { value: 'new', label: 'New' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'damaged', label: 'Damaged' },
]

const COMMON_REASONS = [
  'Defective product',
  'Customer request',
  'Wrong item delivered',
  'Quality issue',
  'Changed mind',
  'Does not match description',
]

const ITEMS_PER_PAGE = 10

export function ReturnsScreen() {
  const { currentBranch, branches } = useBranch()

  // Data lists
  const [returns, setReturns] = useState<Return[]>([])
  const [sales, setSales] = useState<Sale[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [users, setUsers] = useState<UserType[]>([])

  // View state
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  // Process Return Dialog
  const [isProcessDialogOpen, setIsProcessDialogOpen] = useState(false)
  const [selectedSaleId, setSelectedSaleId] = useState<string>('')
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null)
  const [saleItems, setSaleItems] = useState<SaleItem[]>([])
  const [returnItems, setReturnItems] = useState<ReturnItemEntry[]>([])
  const [returnType, setReturnType] = useState<'refund' | 'exchange' | 'store_credit'>('refund')
  const [refundMethod, setRefundMethod] = useState<'cash' | 'card' | 'store_credit'>('cash')
  const [reason, setReason] = useState('')
  const [notes, setNotes] = useState('')
  const [isLoadingSaleDetails, setIsLoadingSaleDetails] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // View Return Dialog
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [viewingReturn, setViewingReturn] = useState<Return | null>(null)
  const [viewingItems, setViewingItems] = useState<ReturnItem[]>([])
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null)
  const [viewingSale, setViewingSale] = useState<Sale | null>(null)
  const [isLoadingReturnDetails, setIsLoadingReturnDetails] = useState(false)

  // Delete Dialog
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deletingReturn, setDeletingReturn] = useState<Return | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Edit Dialog
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingReturn, setEditingReturn] = useState<Return | null>(null)
  const [editRefundAmount, setEditRefundAmount] = useState('')
  const [editReason, setEditReason] = useState('')
  const [editNotes, setEditNotes] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)
  const [reversalTarget, setReversalTarget] = useState<Return | null>(null)

  // Summary stats
  const [summary, setSummary] = useState<ReturnsSummary>({
    totalReturns: 0,
    totalRefunded: 0,
    todayReturns: 0,
    todayRefunded: 0,
  })

  // Fetch all data
  const fetchData = useCallback(async () => {
    if (!currentBranch) return

    try {
      setIsLoading(true)
      const [returnsResult, salesResult, productsResult, customersResult, usersResult] = await Promise.all([
        window.api.returns.getAll({ limit: 1000, branchId: currentBranch.id }),
        window.api.sales.getAll({ limit: 1000, branchId: currentBranch.id }),
        window.api.products.getAll({ limit: 1000 }),
        window.api.customers.getAll({ limit: 1000 }),
        window.api.users.getAll({ limit: 1000 }),
      ])

      if (returnsResult.success && returnsResult.data) {
        setReturns(returnsResult.data)
        calculateSummary(returnsResult.data)
      }
      if (salesResult.success && salesResult.data) {
        // Filter out voided sales and filter by branch
        setSales(salesResult.data.filter((s: Sale) => !s.isVoided && s.branchId === currentBranch.id))
      }
      if (productsResult.success && productsResult.data) {
        setProducts(productsResult.data)
      }
      if (customersResult.success && customersResult.data) {
        setCustomers(customersResult.data)
      }
      if (usersResult.success && usersResult.data) {
        setUsers(usersResult.data)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [currentBranch])

  useEffect(() => {
    if (currentBranch) {
      fetchData()
    }
  }, [fetchData, currentBranch])

  // Calculate summary statistics
  const calculateSummary = (returnsData: Return[]) => {
    const today = new Date().toISOString().split('T')[0]
    const todayReturnsData = returnsData.filter(r => r.returnDate?.startsWith(today))

    setSummary({
      totalReturns: returnsData.length,
      totalRefunded: returnsData.reduce((sum, r) => sum + (r.refundAmount || 0), 0),
      todayReturns: todayReturnsData.length,
      todayRefunded: todayReturnsData.reduce((sum, r) => sum + (r.refundAmount || 0), 0),
    })
  }

  // Helper functions
  const getCustomerName = (customerId: number | null): string => {
    if (!customerId) return 'Walk-in Customer'
    const customer = customers.find(c => c.id === customerId)
    if (!customer) return 'Unknown'
    return `${customer.firstName} ${customer.lastName}`.trim()
  }

  const getBranchName = (branchId: number): string => {
    const branch = branches.find(b => b.id === branchId)
    return branch?.name || 'Unknown'
  }

  const getUserName = (userId: number): string => {
    const user = users.find(u => u.id === userId)
    return user?.fullName || user?.username || 'Unknown'
  }

  const getProductName = (productId: number): string => {
    const product = products.find(p => p.id === productId)
    return product ? `${product.name} (${product.code})` : 'Unknown'
  }

  const getSaleInvoice = (saleId: number): string => {
    const sale = sales.find(s => s.id === saleId)
    return sale?.invoiceNumber || 'Unknown'
  }

  const getReturnTypeBadge = (type: string) => {
    switch (type) {
      case 'refund':
        return <Badge variant="default">Refund</Badge>
      case 'exchange':
        return <Badge variant="secondary">Exchange</Badge>
      case 'store_credit':
        return <Badge variant="outline">Store Credit</Badge>
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  const getReturnTypeLabel = (type: string): string => {
    switch (type) {
      case 'refund': return 'Refund'
      case 'exchange': return 'Exchange'
      case 'store_credit': return 'Store Credit'
      default: return type
    }
  }

  const getRefundMethodLabel = (method: string | null): string => {
    if (!method) return '-'
    switch (method) {
      case 'cash': return 'Cash'
      case 'card': return 'Card'
      case 'store_credit': return 'Store Credit'
      default: return method
    }
  }

  const getConditionBadge = (condition: string) => {
    switch (condition) {
      case 'new':
        return <Badge variant="success">New</Badge>
      case 'good':
        return <Badge variant="default">Good</Badge>
      case 'fair':
        return <Badge variant="warning">Fair</Badge>
      case 'damaged':
        return <Badge variant="destructive">Damaged</Badge>
      default:
        return <Badge variant="outline">{condition}</Badge>
    }
  }

  // Filtering logic
  const filteredReturns = useMemo(() => {
    return returns.filter(ret => {
      const search = searchTerm.toLowerCase()
      const matchesSearch =
        ret.returnNumber.toLowerCase().includes(search) ||
        getSaleInvoice(ret.originalSaleId).toLowerCase().includes(search) ||
        getCustomerName(ret.customerId).toLowerCase().includes(search) ||
        getUserName(ret.userId).toLowerCase().includes(search) ||
        (ret.reason || '').toLowerCase().includes(search)

      return matchesSearch
    })
  }, [returns, searchTerm, sales, customers, users])

  // Sort by date descending
  const sortedReturns = useMemo(() => {
    return [...filteredReturns].sort((a, b) =>
      new Date(b.returnDate).getTime() - new Date(a.returnDate).getTime()
    )
  }, [filteredReturns])

  // Pagination
  const totalPages = Math.ceil(sortedReturns.length / ITEMS_PER_PAGE) || 1
  const paginatedReturns = sortedReturns.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  // Handle selecting a sale
  const handleSelectSale = async (saleId: string) => {
    setSelectedSaleId(saleId)
    if (!saleId) {
      setSelectedSale(null)
      setSaleItems([])
      setReturnItems([])
      return
    }

    try {
      setIsLoadingSaleDetails(true)
      const result = await window.api.sales.getById(parseInt(saleId))
      if (result.success && result.data) {
        setSelectedSale(result.data)
        setSaleItems(result.data.items || [])
        setReturnItems([])
      }
    } catch (error) {
      console.error('Error fetching sale details:', error)
    } finally {
      setIsLoadingSaleDetails(false)
    }
  }

  // Add item to return list
  const addItemToReturn = (saleItem: SaleItem) => {
    // Check if already added
    if (returnItems.some(ri => ri.saleItem.id === saleItem.id)) {
      return
    }

    // Calculate effective unit price after sale-level discount
    const discountRatio = selectedSale ? (selectedSale.discountAmount || 0) / (selectedSale.subtotal || 1) : 0
    const effectiveUnitPrice = saleItem.unitPrice * (1 - discountRatio)

    setReturnItems(prev => [
      ...prev,
      {
        saleItem,
        returnQty: saleItem.quantity,
        refundAmount: Math.round(effectiveUnitPrice * saleItem.quantity * 100) / 100,
        condition: 'good',
        restockable: true,
      },
    ])
  }

  // Update return item
  const updateReturnItem = (saleItemId: number, field: keyof ReturnItemEntry, value: unknown) => {
    setReturnItems(prev =>
      prev.map(item => {
        if (item.saleItem.id === saleItemId) {
          const updated = { ...item, [field]: value }
          // Recalculate refund amount if quantity changes (using discounted price)
          if (field === 'returnQty') {
            const discountRatio = selectedSale ? (selectedSale.discountAmount || 0) / (selectedSale.subtotal || 1) : 0
            const effectiveUnitPrice = item.saleItem.unitPrice * (1 - discountRatio)
            updated.refundAmount = Math.round(effectiveUnitPrice * (value as number) * 100) / 100
          }
          return updated
        }
        return item
      })
    )
  }

  // Remove item from return list
  const removeReturnItem = (saleItemId: number) => {
    setReturnItems(prev => prev.filter(item => item.saleItem.id !== saleItemId))
  }

  // Calculate total refund
  const calculateTotalRefund = (): number => {
    return returnItems.reduce((sum, item) => sum + item.refundAmount, 0)
  }

  // Reset process dialog
  const resetProcessDialog = () => {
    setSelectedSaleId('')
    setSelectedSale(null)
    setSaleItems([])
    setReturnItems([])
    setReturnType('refund')
    setRefundMethod('cash')
    setReason('')
    setNotes('')
  }

  // Handle submit return
  const handleSubmitReturn = async () => {
    if (!selectedSale || returnItems.length === 0) {
      return
    }

    try {
      setIsSubmitting(true)

      const returnData = {
        originalSaleId: selectedSale.id,
        customerId: selectedSale.customerId,
        branchId: currentBranch?.id || selectedSale.branchId,
        returnType,
        refundMethod: returnType === 'refund' ? refundMethod : undefined,
        reason: reason || undefined,
        notes: notes || undefined,
        items: returnItems.map(item => ({
          saleItemId: item.saleItem.id,
          productId: item.saleItem.productId,
          quantity: item.returnQty,
          unitPrice: Math.round((item.refundAmount / item.returnQty) * 100) / 100,
          serialNumber: item.saleItem.serialNumber,
          condition: item.condition,
          restockable: item.restockable,
        })),
      }

      const result = await window.api.returns.create(returnData)

      if (result.success) {
        setIsProcessDialogOpen(false)
        resetProcessDialog()
        fetchData()
      } else {
        alert(result.message || 'Failed to process return')
      }
    } catch (error) {
      console.error('Error processing return:', error)
      alert('An error occurred while processing the return')
    } finally {
      setIsSubmitting(false)
    }
  }

  // View return details
  const handleViewReturn = async (ret: Return) => {
    try {
      setViewingReturn(ret)
      setIsViewDialogOpen(true)
      setIsLoadingReturnDetails(true)

      const result = await window.api.returns.getById(ret.id)
      if (result.success && result.data) {
        setViewingItems(result.data.items || [])
        setViewingCustomer(result.data.customer || null)
        setViewingSale(result.data.originalSale || null)
      }
    } catch (error) {
      console.error('Error fetching return details:', error)
    } finally {
      setIsLoadingReturnDetails(false)
    }
  }

  // Delete return
  const handleOpenDeleteDialog = (ret: Return) => {
    setDeletingReturn(ret)
    setIsDeleteDialogOpen(true)
  }

  const openEditDialog = (ret: Return) => {
    setEditingReturn(ret)
    setEditRefundAmount(ret.refundAmount.toString())
    setEditReason(ret.reason || '')
    setEditNotes(ret.notes || '')
    setIsEditDialogOpen(true)
  }

  const handleUpdateReturn = async () => {
    if (!editingReturn) return

    const newAmount = parseFloat(editRefundAmount)
    if (isNaN(newAmount) || newAmount < 0) {
      alert('Please enter a valid refund amount')
      return
    }

    try {
      setIsUpdating(true)
      const result = await window.api.returns.update({
        id: editingReturn.id,
        refundAmount: newAmount,
        reason: editReason || undefined,
        notes: editNotes || undefined,
      })

      if (result.success) {
        setIsEditDialogOpen(false)
        setEditingReturn(null)
        fetchData()
      } else {
        alert(result.message || 'Failed to update return')
      }
    } catch (error) {
      console.error('Error updating return:', error)
      alert('An error occurred while updating the return')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDeleteReturn = async () => {
    if (!deletingReturn) return

    try {
      setIsDeleting(true)
      const result = await window.api.returns.delete(deletingReturn.id)

      if (result.success) {
        setIsDeleteDialogOpen(false)
        setDeletingReturn(null)
        fetchData()
      } else {
        alert(result.message || 'Failed to delete return')
      }
    } catch (error) {
      console.error('Error deleting return:', error)
      alert('An error occurred while deleting the return')
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Loading returns...</p>
        </div>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="space-y-3">
        {/* Header — title + stat pills on left, actions on right */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            <div>
              <h1 className="text-xl font-semibold leading-none">Returns</h1>
              {currentBranch && (
                <p className="text-[11px] text-muted-foreground mt-0.5">{currentBranch.name}</p>
              )}
            </div>

            {/* Stat pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="inline-flex items-center gap-1.5 rounded-full border bg-muted/40 px-2.5 py-0.5 text-xs font-medium">
                <RotateCcw className="h-3 w-3 text-muted-foreground" />
                {summary.totalReturns.toLocaleString()} total
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border bg-muted/40 px-2.5 py-0.5 text-xs font-medium">
                <DollarSign className="h-3 w-3 text-muted-foreground" />
                {formatCurrency(summary.totalRefunded)} refunded
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border bg-primary/10 text-primary px-2.5 py-0.5 text-xs font-medium">
                <Calendar className="h-3 w-3" />
                {summary.todayReturns} today
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border bg-primary/10 text-primary px-2.5 py-0.5 text-xs font-medium">
                <DollarSign className="h-3 w-3" />
                {formatCurrency(summary.todayRefunded)} today
              </span>
            </div>
          </div>

          {/* Right-side action buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={fetchData}>
                  <RefreshCw className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Refresh</TooltipContent>
            </Tooltip>
            <Button size="sm" className="h-8" onClick={() => setIsProcessDialogOpen(true)}>
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Process Return
            </Button>
          </div>
        </div>

        {/* Search bar — no Card wrapper */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search by return #, invoice, customer, or reason..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className="h-8 pl-8 pr-8 text-sm"
            />
            {searchTerm && (
              <button
                onClick={() => { setSearchTerm(''); setCurrentPage(1) }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Returns Table — no Card wrapper */}
        <div className="rounded-md border overflow-hidden">
          {paginatedReturns.length === 0 ? (
            <div className="flex h-40 items-center justify-center text-muted-foreground">
              <div className="text-center">
                <RotateCcw className="mx-auto mb-2 h-10 w-10 opacity-30" />
                <p className="text-sm">No returns found</p>
                {searchTerm && (
                  <Button variant="link" size="sm" onClick={() => setSearchTerm('')}>
                    Clear search to see all returns
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="text-[10px] uppercase tracking-wider font-semibold h-8 py-0">
                    Date
                  </TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider font-semibold h-8 py-0">
                    Return #
                  </TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider font-semibold h-8 py-0">
                    Invoice #
                  </TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider font-semibold h-8 py-0">
                    Customer
                  </TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider font-semibold h-8 py-0">
                    Type / Method
                  </TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider font-semibold h-8 py-0 text-right">
                    Refund
                  </TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider font-semibold h-8 py-0">
                    Reason
                  </TableHead>
                  <TableHead className="text-[10px] uppercase tracking-wider font-semibold h-8 py-0 text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedReturns.map((ret) => (
                  <TableRow key={ret.id} className="group h-9">
                    {/* Date — processed by shown as subtitle */}
                    <TableCell className="py-1.5">
                      <div className="flex flex-col">
                        <span className="text-xs tabular-nums">{formatDateTime(ret.returnDate)}</span>
                        <span className="text-[10px] text-muted-foreground leading-tight">
                          by {getUserName(ret.userId)}
                        </span>
                      </div>
                    </TableCell>

                    {/* Return number */}
                    <TableCell className="py-1.5">
                      <span className="font-mono text-xs">{ret.returnNumber}</span>
                    </TableCell>

                    {/* Invoice number */}
                    <TableCell className="py-1.5">
                      <span className="font-mono text-xs">{getSaleInvoice(ret.originalSaleId)}</span>
                    </TableCell>

                    {/* Customer */}
                    <TableCell className="py-1.5">
                      <span className="text-xs">{getCustomerName(ret.customerId)}</span>
                    </TableCell>

                    {/* Return type + refund method badge on same line */}
                    <TableCell className="py-1.5">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        {getReturnTypeBadge(ret.returnType)}
                        {ret.refundMethod && (
                          <Badge
                            variant="outline"
                            className="text-[10px] px-1.5 py-0 h-4 font-normal text-muted-foreground"
                          >
                            {getRefundMethodLabel(ret.refundMethod)}
                          </Badge>
                        )}
                      </div>
                    </TableCell>

                    {/* Refund amount */}
                    <TableCell className="py-1.5 text-right">
                      <span className="text-xs font-semibold tabular-nums">
                        {formatCurrency(ret.refundAmount)}
                      </span>
                    </TableCell>

                    {/* Reason — wider, more text shown */}
                    <TableCell className="py-1.5 max-w-[200px]">
                      <span className="text-xs text-muted-foreground line-clamp-2 leading-tight">
                        {ret.reason ? truncate(ret.reason, 60) : '-'}
                      </span>
                    </TableCell>

                    {/* Hover-reveal actions */}
                    <TableCell className="py-1.5 text-right">
                      <div className="flex justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => handleViewReturn(ret)}
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>View Details</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => openEditDialog(ret)}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Edit Return</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive hover:text-destructive"
                              onClick={() => handleOpenDeleteDialog(ret)}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Delete Return</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-amber-500 hover:text-amber-400"
                              onClick={() => setReversalTarget(ret)}
                            >
                              <RotateCcw className="h-3.5 w-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Request Reversal</TooltipContent>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Pagination */}
        {sortedReturns.length > 0 && (
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
              {Math.min(currentPage * ITEMS_PER_PAGE, sortedReturns.length)} of{' '}
              {sortedReturns.length} returns
            </p>
            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => p - 1)}
                    >
                      <ChevronLeft className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Previous page</TooltipContent>
                </Tooltip>
                <span className="text-xs text-muted-foreground px-2 tabular-nums">
                  {currentPage} / {totalPages}
                </span>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((p) => p + 1)}
                    >
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Next page</TooltipContent>
                </Tooltip>
              </div>
            )}
          </div>
        )}

        {/* Process Return Dialog */}
        <Dialog open={isProcessDialogOpen} onOpenChange={(open) => {
          setIsProcessDialogOpen(open)
          if (!open) resetProcessDialog()
        }}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <RotateCcw className="h-5 w-5" />
                Process Return
              </DialogTitle>
              <DialogDescription>
                Select a sale and the items to return
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Step 1: Select Sale */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">Step 1: Select Sale/Invoice</Label>
                <Select value={selectedSaleId} onValueChange={handleSelectSale}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a sale to process return..." />
                  </SelectTrigger>
                  <SelectContent>
                    {sales.map((sale) => (
                      <SelectItem key={sale.id} value={sale.id.toString()}>
                        {sale.invoiceNumber} - {formatDateTime(sale.saleDate)} - {formatCurrency(sale.totalAmount)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Step 2: Sale Items */}
              {selectedSale && (
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Step 2: Select Items to Return</Label>
                  {isLoadingSaleDetails ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    </div>
                  ) : saleItems.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">No items found in this sale</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead className="text-center">Qty Sold</TableHead>
                          <TableHead className="text-right">Price</TableHead>
                          <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {saleItems.map((item) => {
                          const isAdded = returnItems.some(ri => ri.saleItem.id === item.id)
                          return (
                            <TableRow key={item.id}>
                              <TableCell>
                                <div>
                                  <p className="font-medium">
                                    {item.product?.name || getProductName(item.productId)}
                                  </p>
                                  {item.serialNumber && (
                                    <p className="text-xs text-muted-foreground">S/N: {item.serialNumber}</p>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="text-center">{item.quantity}</TableCell>
                              <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                              <TableCell className="text-right">
                                <Button
                                  size="sm"
                                  variant={isAdded ? 'secondary' : 'default'}
                                  disabled={isAdded}
                                  onClick={() => addItemToReturn(item)}
                                >
                                  {isAdded ? 'Added' : 'Add to Return'}
                                </Button>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  )}
                </div>
              )}

              {/* Step 3: Return Items Configuration */}
              {returnItems.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-base font-semibold">Step 3: Configure Return Items</Label>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead className="text-center">Return Qty</TableHead>
                        <TableHead>Condition</TableHead>
                        <TableHead className="text-center">Restock</TableHead>
                        <TableHead className="text-right">Refund Amount</TableHead>
                        <TableHead className="text-right">Remove</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {returnItems.map((item) => (
                        <TableRow key={item.saleItem.id}>
                          <TableCell>
                            <p className="font-medium">
                              {item.saleItem.product?.name || getProductName(item.saleItem.productId)}
                            </p>
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min={1}
                              max={item.saleItem.quantity}
                              value={item.returnQty}
                              onChange={(e) => updateReturnItem(item.saleItem.id, 'returnQty', parseInt(e.target.value) || 1)}
                              className="w-20 text-center"
                            />
                          </TableCell>
                          <TableCell>
                            <Select
                              value={item.condition}
                              onValueChange={(value) => updateReturnItem(item.saleItem.id, 'condition', value)}
                            >
                              <SelectTrigger className="w-28">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {ITEM_CONDITIONS.map((cond) => (
                                  <SelectItem key={cond.value} value={cond.value}>
                                    {cond.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="text-center">
                            <input
                              type="checkbox"
                              checked={item.restockable}
                              onChange={(e) => updateReturnItem(item.saleItem.id, 'restockable', e.target.checked)}
                              className="h-4 w-4"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              type="number"
                              min={0}
                              step={0.01}
                              value={item.refundAmount}
                              onChange={(e) => updateReturnItem(item.saleItem.id, 'refundAmount', parseFloat(e.target.value) || 0)}
                              className="w-28 text-right"
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeReturnItem(item.saleItem.id)}
                            >
                              <X className="h-4 w-4 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="bg-muted/50">
                        <TableCell colSpan={4} className="text-right font-semibold">
                          Total Refund:
                        </TableCell>
                        <TableCell className="text-right font-bold text-lg">
                          {formatCurrency(calculateTotalRefund())}
                        </TableCell>
                        <TableCell />
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* Step 4: Return Details */}
              {returnItems.length > 0 && (
                <div className="space-y-4">
                  <Label className="text-base font-semibold">Step 4: Return Details</Label>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Return Type</Label>
                      <Select value={returnType} onValueChange={(value: typeof returnType) => setReturnType(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {RETURN_TYPES.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {returnType === 'refund' && (
                      <div className="space-y-2">
                        <Label>Refund Method</Label>
                        <Select value={refundMethod} onValueChange={(value: typeof refundMethod) => setRefundMethod(value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {REFUND_METHODS.map((method) => (
                              <SelectItem key={method.value} value={method.value}>
                                {method.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Reason for Return</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {COMMON_REASONS.map((r) => (
                        <Button
                          key={r}
                          type="button"
                          variant={reason === r ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setReason(r)}
                        >
                          {r}
                        </Button>
                      ))}
                    </div>
                    <Textarea
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Enter reason for return..."
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Additional Notes (optional)</Label>
                    <Textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Any additional notes..."
                      rows={2}
                    />
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setIsProcessDialogOpen(false)
                resetProcessDialog()
              }}>
                Cancel
              </Button>
              <Button
                onClick={handleSubmitReturn}
                disabled={!selectedSale || returnItems.length === 0 || isSubmitting}
              >
                {isSubmitting ? 'Processing...' : 'Process Return'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* View Return Details Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <RotateCcw className="h-5 w-5" />
                Return Details
              </DialogTitle>
              <DialogDescription>
                Return #: {viewingReturn?.returnNumber}
              </DialogDescription>
            </DialogHeader>

            {viewingReturn && (
              <div className="space-y-6">
                {/* Return Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Return Number</p>
                    <p className="font-mono font-medium">{viewingReturn.returnNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="font-medium">{formatDateTime(viewingReturn.returnDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Original Invoice</p>
                    <p className="font-mono font-medium">
                      {viewingSale?.invoiceNumber || getSaleInvoice(viewingReturn.originalSaleId)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Customer</p>
                    <p className="font-medium">
                      {viewingCustomer ? `${viewingCustomer.firstName} ${viewingCustomer.lastName}`.trim() : getCustomerName(viewingReturn.customerId)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Processed By</p>
                    <p className="font-medium">{getUserName(viewingReturn.userId)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Branch</p>
                    <p className="font-medium">{getBranchName(viewingReturn.branchId)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Return Type</p>
                    {getReturnTypeBadge(viewingReturn.returnType)}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Refund Method</p>
                    <p className="font-medium capitalize">{viewingReturn.refundMethod || '-'}</p>
                  </div>
                </div>

                <Separator />

                {/* Returned Items */}
                <div>
                  <h4 className="font-medium mb-3">Returned Items</h4>
                  {isLoadingReturnDetails ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    </div>
                  ) : viewingItems.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">No items found</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead className="text-center">Qty</TableHead>
                          <TableHead>Condition</TableHead>
                          <TableHead className="text-center">Restocked</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {viewingItems.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium">
                                  {item.product?.name || getProductName(item.productId)}
                                </p>
                                {item.serialNumber && (
                                  <p className="text-xs text-muted-foreground">S/N: {item.serialNumber}</p>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-center">{item.quantity}</TableCell>
                            <TableCell>{getConditionBadge(item.condition)}</TableCell>
                            <TableCell className="text-center">
                              {item.restockable ? (
                                <Badge variant="success">Yes</Badge>
                              ) : (
                                <Badge variant="outline">No</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">{formatCurrency(item.totalPrice)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>

                <Separator />

                {/* Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(viewingReturn.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax:</span>
                    <span>{formatCurrency(viewingReturn.taxAmount)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold">
                    <span>Total Refund:</span>
                    <span>{formatCurrency(viewingReturn.refundAmount)}</span>
                  </div>
                </div>

                {/* Reason */}
                {viewingReturn.reason && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm text-muted-foreground">Reason</p>
                      <p className="mt-1">{viewingReturn.reason}</p>
                    </div>
                  </>
                )}

                {/* Notes */}
                {viewingReturn.notes && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm text-muted-foreground">Notes</p>
                      <p className="mt-1">{viewingReturn.notes}</p>
                    </div>
                  </>
                )}
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-destructive">
                <AlertCircle className="h-5 w-5" />
                Delete Return
              </DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this return? This will reverse the inventory changes.
              </DialogDescription>
            </DialogHeader>

            {deletingReturn && (
              <div className="rounded-lg bg-muted p-4">
                <p className="font-mono font-medium">{deletingReturn.returnNumber}</p>
                <p className="text-sm text-muted-foreground">
                  {formatDateTime(deletingReturn.returnDate)} - {formatCurrency(deletingReturn.refundAmount)}
                </p>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteReturn}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete Return'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Return Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Pencil className="h-5 w-5" />
                Edit Return
              </DialogTitle>
              <DialogDescription>
                Update the refund amount for this return. This will recalculate all related accounting entries.
              </DialogDescription>
            </DialogHeader>

            {editingReturn && (
              <div className="space-y-4">
                <div className="rounded-lg bg-muted p-4">
                  <p className="font-mono font-medium">{editingReturn.returnNumber}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDateTime(editingReturn.returnDate)} — Original: {formatCurrency(editingReturn.refundAmount)}
                  </p>
                </div>

                <div>
                  <Label>Refund Amount *</Label>
                  <Input
                    type="number"
                    min={0}
                    step={0.01}
                    value={editRefundAmount}
                    onChange={(e) => setEditRefundAmount(e.target.value)}
                    placeholder="Enter corrected refund amount"
                  />
                  {editRefundAmount && !isNaN(parseFloat(editRefundAmount)) && (
                    <p className={`text-xs mt-1 ${
                      parseFloat(editRefundAmount) !== editingReturn.refundAmount
                        ? 'text-amber-500'
                        : 'text-muted-foreground'
                    }`}>
                      {parseFloat(editRefundAmount) !== editingReturn.refundAmount
                        ? `Change: ${formatCurrency(editingReturn.refundAmount)} → ${formatCurrency(parseFloat(editRefundAmount))} (difference: ${formatCurrency(parseFloat(editRefundAmount) - editingReturn.refundAmount)})`
                        : 'No change'}
                    </p>
                  )}
                </div>

                <div>
                  <Label>Reason</Label>
                  <Input
                    value={editReason}
                    onChange={(e) => setEditReason(e.target.value)}
                    placeholder="Reason for return"
                  />
                </div>

                <div>
                  <Label>Notes</Label>
                  <Textarea
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    placeholder="Additional notes..."
                  />
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => { setIsEditDialogOpen(false); setEditingReturn(null) }}>
                Cancel
              </Button>
              <Button
                onClick={handleUpdateReturn}
                disabled={isUpdating}
              >
                {isUpdating ? 'Updating...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reversal Request Modal */}
        <ReversalRequestModal
          open={!!reversalTarget}
          onClose={() => setReversalTarget(null)}
          entityType="return"
          entityId={reversalTarget?.id || 0}
          entityLabel={reversalTarget?.returnNumber || ''}
          branchId={currentBranch?.id || 0}
          onSuccess={() => {
            setReversalTarget(null)
            fetchReturns()
          }}
        />
      </div>
    </TooltipProvider>
  )
}
