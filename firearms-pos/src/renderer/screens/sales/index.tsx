import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Search,
  Eye,
  Printer,
  Receipt,
  DollarSign,
  TrendingUp,
  Calendar,
  Filter,
  X,
  Package,
  ChevronLeft,
  ChevronRight,
  Building2,
  User,
  CreditCard,
  Banknote,
  Clock,
  FileText,
  Ban,
  RotateCcw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { useBranch } from '@/contexts/branch-context'
import { formatCurrency, formatDateTime, cn } from '@/lib/utils'
import { ReversalRequestModal } from '@/components/reversal-request-modal'

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
  paymentMethod: 'cash' | 'card' | 'credit' | 'mixed'
  paymentStatus: 'paid' | 'partial' | 'pending'
  amountPaid: number
  changeGiven: number
  notes: string | null
  isVoided: boolean
  voidReason: string | null
  saleDate: string
  createdAt: string
  updatedAt: string
}

interface SaleItem {
  id: number
  saleId: number
  productId: number
  serialNumber: string | null
  quantity: number
  unitPrice: number
  costPrice: number
  discountPercent: number
  discountAmount: number
  taxAmount: number
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

interface Branch {
  id: number
  name: string
}

interface UserType {
  id: number
  fullName: string
  username: string
}

interface SalesSummary {
  totalSales: number
  totalRevenue: number
  todaySales: number
  todayRevenue: number
}

const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Card' },
  { value: 'credit', label: 'Credit' },
  { value: 'mixed', label: 'Mixed' },
]

const ITEMS_PER_PAGE = 10

export function SalesHistoryScreen() {
  const { currentBranch, branches } = useBranch()

  // Data lists
  const [sales, setSales] = useState<Sale[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [users, setUsers] = useState<UserType[]>([])

  // View state
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  // Filter state
  const [filterBranchId, setFilterBranchId] = useState<string>('all')
  const [filterPaymentMethod, setFilterPaymentMethod] = useState<string>('all')
  const [filterPaymentStatus, setFilterPaymentStatus] = useState<string>('all')
  const [filterDateFrom, setFilterDateFrom] = useState<string>('')
  const [filterDateTo, setFilterDateTo] = useState<string>('')
  const [showVoided, setShowVoided] = useState<boolean>(false)

  // Dialog state
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [viewingSale, setViewingSale] = useState<Sale | null>(null)
  const [viewingSaleItems, setViewingSaleItems] = useState<SaleItem[]>([])
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null)
  const [isLoadingSaleDetails, setIsLoadingSaleDetails] = useState(false)

  // Void dialog state
  const [isVoidDialogOpen, setIsVoidDialogOpen] = useState(false)
  const [voidingSale, setVoidingSale] = useState<Sale | null>(null)
  const [voidReason, setVoidReason] = useState('')
  const [isVoiding, setIsVoiding] = useState(false)

  // Reversal request modal state
  const [isReversalModalOpen, setIsReversalModalOpen] = useState(false)
  const [reversalTargetSale, setReversalTargetSale] = useState<Sale | null>(null)

  // Summary stats
  const [summary, setSummary] = useState<SalesSummary>({
    totalSales: 0,
    totalRevenue: 0,
    todaySales: 0,
    todayRevenue: 0,
  })

  // Fetch all data
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true)
      // NOTE: Removed fixPaymentStatus() call - root cause fixed by removing duplicate
      // receivable creation in POS. Use admin sync utility if needed for legacy data.
      const [salesResult, productsResult, customersResult, usersResult] = await Promise.all([
        window.api.sales.getAll({ limit: 1000 }),
        window.api.products.getAll({ limit: 1000 }),
        window.api.customers.getAll({ limit: 1000 }),
        window.api.users.getAll({ limit: 1000 }),
      ])

      if (salesResult.success && salesResult.data) {
        setSales(salesResult.data)
        calculateSummary(salesResult.data)
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
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Calculate summary statistics
  const calculateSummary = (salesData: Sale[]) => {
    const today = new Date().toISOString().split('T')[0]
    const nonVoidedSales = salesData.filter(s => !s.isVoided)
    const todaySalesData = nonVoidedSales.filter(s => s.saleDate?.startsWith(today))

    setSummary({
      totalSales: nonVoidedSales.length,
      totalRevenue: nonVoidedSales.reduce((sum, s) => sum + (s.totalAmount || 0), 0),
      todaySales: todaySalesData.length,
      todayRevenue: todaySalesData.reduce((sum, s) => sum + (s.totalAmount || 0), 0),
    })
  }

  // Helper functions
  const getCustomerName = (customerId: number | null): string => {
    if (!customerId) return 'Walk-in Customer'
    const customer = customers.find(c => c.id === customerId)
    if (!customer) return 'Unknown'
    return `${customer.firstName} ${customer.lastName}`.trim()
  }

  const getCustomerPhone = (customerId: number | null): string => {
    if (!customerId) return 'N/A'
    const customer = customers.find(c => c.id === customerId)
    return customer?.phone || 'N/A'
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

  const getPaymentMethodLabel = (method: string): string => {
    const found = PAYMENT_METHODS.find(m => m.value === method)
    return found?.label || method
  }

  const getPaymentStatusBadge = (status: string, isVoided: boolean) => {
    if (isVoided) {
      return <Badge variant="destructive">Voided</Badge>
    }
    switch (status) {
      case 'paid':
        return <Badge variant="success">Paid</Badge>
      case 'partial':
        return <Badge variant="warning">Partial</Badge>
      case 'pending':
        return <Badge variant="destructive">Pending</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'cash':
        return <Banknote className="h-4 w-4" />
      case 'card':
        return <CreditCard className="h-4 w-4" />
      default:
        return <DollarSign className="h-4 w-4" />
    }
  }

  // Filtering logic
  const filteredSales = useMemo(() => {
    return sales.filter(sale => {
      // Search filter
      const search = searchTerm.toLowerCase()
      const matchesSearch =
        sale.invoiceNumber.toLowerCase().includes(search) ||
        getCustomerName(sale.customerId).toLowerCase().includes(search) ||
        getCustomerPhone(sale.customerId).toLowerCase().includes(search) ||
        getBranchName(sale.branchId).toLowerCase().includes(search) ||
        getUserName(sale.userId).toLowerCase().includes(search) ||
        (sale.paymentMethod || '').toLowerCase().includes(search)

      if (!matchesSearch) return false

      // Branch filter
      if (filterBranchId !== 'all' && sale.branchId !== parseInt(filterBranchId)) return false

      // Payment method filter
      if (filterPaymentMethod !== 'all' && sale.paymentMethod !== filterPaymentMethod) return false

      // Payment status filter
      if (filterPaymentStatus !== 'all' && sale.paymentStatus !== filterPaymentStatus) return false

      // Voided filter
      if (!showVoided && sale.isVoided) return false

      // Date range filter
      if (filterDateFrom) {
        const saleDate = new Date(sale.saleDate).toISOString().split('T')[0]
        if (saleDate < filterDateFrom) return false
      }
      if (filterDateTo) {
        const saleDate = new Date(sale.saleDate).toISOString().split('T')[0]
        if (saleDate > filterDateTo) return false
      }

      return true
    })
  }, [sales, searchTerm, filterBranchId, filterPaymentMethod, filterPaymentStatus, filterDateFrom, filterDateTo, showVoided, customers, branches, users])

  // Sort by date descending (most recent first)
  const sortedSales = useMemo(() => {
    return [...filteredSales].sort((a, b) =>
      new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime()
    )
  }, [filteredSales])

  // Pagination
  const totalPages = Math.ceil(sortedSales.length / ITEMS_PER_PAGE) || 1
  const paginatedSales = sortedSales.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  // Filtered totals
  const filteredTotalRevenue = filteredSales
    .filter(s => !s.isVoided)
    .reduce((sum, s) => sum + (s.totalAmount || 0), 0)

  // View sale details
  const handleViewSale = async (sale: Sale) => {
    try {
      setIsLoadingSaleDetails(true)
      setViewingSale(sale)
      setIsViewDialogOpen(true)

      const result = await window.api.sales.getById(sale.id)
      if (result.success && result.data) {
        setViewingSaleItems(result.data.items || [])
        setViewingCustomer(result.data.customer || null)
      }
    } catch (error) {
      console.error('Error fetching sale details:', error)
    } finally {
      setIsLoadingSaleDetails(false)
    }
  }

  // Void sale
  const handleOpenVoidDialog = (sale: Sale) => {
    setVoidingSale(sale)
    setVoidReason('')
    setIsVoidDialogOpen(true)
  }

  const handleVoidSale = async () => {
    if (!voidingSale || !voidReason.trim()) {
      return
    }

    try {
      setIsVoiding(true)
      const result = await window.api.sales.void(voidingSale.id, voidReason)
      if (result.success) {
        setIsVoidDialogOpen(false)
        setVoidingSale(null)
        setVoidReason('')
        fetchData() // Refresh data
      } else {
        alert(result.message || 'Failed to void sale')
      }
    } catch (error) {
      console.error('Error voiding sale:', error)
      alert('An error occurred while voiding the sale')
    } finally {
      setIsVoiding(false)
    }
  }

  // Print receipt
  const handlePrintReceipt = (sale: Sale) => {
    const receiptHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt - ${sale.invoiceNumber}</title>
        <style>
          body { font-family: 'Courier New', monospace; width: 300px; margin: 0 auto; padding: 20px; }
          .header { text-align: center; margin-bottom: 20px; }
          .header h1 { margin: 0; font-size: 18px; }
          .header p { margin: 5px 0; font-size: 12px; }
          .divider { border-top: 1px dashed #000; margin: 10px 0; }
          .info { font-size: 12px; margin: 5px 0; }
          .items { margin: 15px 0; }
          .item { display: flex; justify-content: space-between; font-size: 12px; margin: 5px 0; }
          .totals { margin-top: 15px; }
          .totals .row { display: flex; justify-content: space-between; font-size: 12px; margin: 3px 0; }
          .totals .total { font-weight: bold; font-size: 14px; }
          .footer { text-align: center; margin-top: 20px; font-size: 11px; }
          @media print { body { width: 100%; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>FIREARMS POS</h1>
          <p>${getBranchName(sale.branchId)}</p>
          <p>Invoice: ${sale.invoiceNumber}</p>
          <p>${formatDateTime(sale.saleDate)}</p>
        </div>
        <div class="divider"></div>
        <div class="info">
          <p>Customer: ${getCustomerName(sale.customerId)}</p>
          <p>Cashier: ${getUserName(sale.userId)}</p>
          <p>Payment: ${getPaymentMethodLabel(sale.paymentMethod)}</p>
        </div>
        <div class="divider"></div>
        <div class="totals">
          <div class="row"><span>Subtotal:</span><span>${formatCurrency(sale.subtotal)}</span></div>
          <div class="row"><span>Tax:</span><span>${formatCurrency(sale.taxAmount)}</span></div>
          <div class="row"><span>Discount:</span><span>-${formatCurrency(sale.discountAmount)}</span></div>
          <div class="divider"></div>
          <div class="row total"><span>TOTAL:</span><span>${formatCurrency(sale.totalAmount)}</span></div>
          <div class="row"><span>Paid:</span><span>${formatCurrency(sale.amountPaid)}</span></div>
          <div class="row"><span>Change:</span><span>${formatCurrency(sale.changeGiven)}</span></div>
        </div>
        <div class="divider"></div>
        <div class="footer">
          <p>Thank you for your business!</p>
          <p>Printed: ${new Date().toLocaleString()}</p>
        </div>
      </body>
      </html>
    `

    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(receiptHtml)
      printWindow.document.close()
      printWindow.print()
    }
  }

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('')
    setFilterBranchId('all')
    setFilterPaymentMethod('all')
    setFilterPaymentStatus('all')
    setFilterDateFrom('')
    setFilterDateTo('')
    setShowVoided(false)
    setCurrentPage(1)
  }

  const hasActiveFilters = searchTerm || filterBranchId !== 'all' || filterPaymentMethod !== 'all' ||
    filterPaymentStatus !== 'all' || filterDateFrom || filterDateTo || showVoided

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Loading sales history...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Sales History</h1>
          <p className="text-muted-foreground">
            View and manage all past sales transactions
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalSales.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All time transactions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">All time revenue</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Sales</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.todaySales.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Transactions today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.todayRevenue)}</div>
            <p className="text-xs text-muted-foreground">Revenue today</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search invoice, customer, branch, cashier..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
                className="pl-9"
              />
            </div>

            {/* Filter Row */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Filters:</span>
              </div>

              {/* Branch Filter */}
              <Select value={filterBranchId} onValueChange={(value) => {
                setFilterBranchId(value)
                setCurrentPage(1)
              }}>
                <SelectTrigger className="w-40">
                  <Building2 className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Branch" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Branches</SelectItem>
                  {branches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id.toString()}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Payment Method Filter */}
              <Select value={filterPaymentMethod} onValueChange={(value) => {
                setFilterPaymentMethod(value)
                setCurrentPage(1)
              }}>
                <SelectTrigger className="w-40">
                  <CreditCard className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Payment" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Methods</SelectItem>
                  {PAYMENT_METHODS.map((method) => (
                    <SelectItem key={method.value} value={method.value}>
                      {method.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Status Filter */}
              <Select value={filterPaymentStatus} onValueChange={(value) => {
                setFilterPaymentStatus(value)
                setCurrentPage(1)
              }}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>

              {/* Date From */}
              <div className="flex items-center gap-2">
                <Label className="text-sm text-muted-foreground">From:</Label>
                <Input
                  type="date"
                  value={filterDateFrom}
                  onChange={(e) => {
                    setFilterDateFrom(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="w-40"
                />
              </div>

              {/* Date To */}
              <div className="flex items-center gap-2">
                <Label className="text-sm text-muted-foreground">To:</Label>
                <Input
                  type="date"
                  value={filterDateTo}
                  onChange={(e) => {
                    setFilterDateTo(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="w-40"
                />
              </div>

              {/* Show Voided */}
              <Button
                variant={showVoided ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setShowVoided(!showVoided)
                  setCurrentPage(1)
                }}
              >
                <Ban className="mr-2 h-4 w-4" />
                {showVoided ? 'Hiding Voided' : 'Show Voided'}
              </Button>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="mr-2 h-4 w-4" />
                  Clear
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sales Table */}
      <Card>
        <CardContent className="p-0">
          {paginatedSales.length === 0 ? (
            <div className="flex h-40 items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Receipt className="mx-auto mb-2 h-12 w-12" />
                <p>No sales found</p>
                {hasActiveFilters && (
                  <Button variant="link" size="sm" onClick={clearFilters}>
                    Clear filters to see all sales
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice</TableHead>
                  <TableHead>Date/Time</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Branch</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead className="text-right">Tax</TableHead>
                  <TableHead className="text-right">Discount</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Paid</TableHead>
                  <TableHead className="text-right">Outstanding</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedSales.map((sale) => (
                  <TableRow key={sale.id} className={cn(sale.isVoided && 'opacity-50 bg-muted/50')}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="font-mono text-sm">{sale.invoiceNumber}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{formatDateTime(sale.saleDate)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{getCustomerName(sale.customerId)}</p>
                        <p className="text-xs text-muted-foreground">{getCustomerPhone(sale.customerId)}</p>
                      </div>
                    </TableCell>
                    <TableCell>{getBranchName(sale.branchId)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getPaymentMethodIcon(sale.paymentMethod)}
                        <span>{getPaymentMethodLabel(sale.paymentMethod)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={cn('text-sm', sale.isVoided && 'line-through')}>
                        {formatCurrency(sale.taxAmount)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {sale.discountAmount > 0 ? (
                        <span className={cn('text-sm text-green-600', sale.isVoided && 'line-through')}>
                          -{formatCurrency(sale.discountAmount)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={cn('font-medium', sale.isVoided && 'line-through')}>
                        {formatCurrency(sale.totalAmount)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={cn('font-medium', sale.isVoided && 'line-through')}>
                        {formatCurrency(sale.amountPaid)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {sale.totalAmount - sale.amountPaid > 0 ? (
                        <span className={cn('font-medium text-destructive', sale.isVoided && 'line-through')}>
                          {formatCurrency(sale.totalAmount - sale.amountPaid)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>{getPaymentStatusBadge(sale.paymentStatus, sale.isVoided)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewSale(sale)}
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handlePrintReceipt(sale)}
                          title="Print Receipt"
                        >
                          <Printer className="h-4 w-4" />
                        </Button>
                        {!sale.isVoided && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenVoidDialog(sale)}
                            title="Void Sale"
                          >
                            <Ban className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                        {!sale.isVoided && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setReversalTargetSale(sale)
                              setIsReversalModalOpen(true)
                            }}
                            title="Request Reversal"
                          >
                            <RotateCcw className="h-4 w-4 text-amber-500" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination & Summary */}
      {sortedSales.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{' '}
            {Math.min(currentPage * ITEMS_PER_PAGE, sortedSales.length)} of {sortedSales.length} sales
            <span className="ml-4 font-medium">
              Filtered Total: {formatCurrency(filteredTotalRevenue)}
            </span>
          </div>
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                Next
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* View Sale Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Sale Details
            </DialogTitle>
            <DialogDescription>
              Invoice: {viewingSale?.invoiceNumber}
            </DialogDescription>
          </DialogHeader>

          {viewingSale && (
            <div className="space-y-6">
              {/* Sale Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Invoice Number</p>
                  <p className="font-mono font-medium">{viewingSale.invoiceNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date & Time</p>
                  <p className="font-medium">{formatDateTime(viewingSale.saleDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Branch</p>
                  <p className="font-medium">{getBranchName(viewingSale.branchId)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Cashier</p>
                  <p className="font-medium">{getUserName(viewingSale.userId)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Customer</p>
                  <p className="font-medium">{viewingCustomer ? `${viewingCustomer.firstName} ${viewingCustomer.lastName}`.trim() : getCustomerName(viewingSale.customerId)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Contact</p>
                  <p className="font-medium">{viewingCustomer?.phone || getCustomerPhone(viewingSale.customerId)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Payment Method</p>
                  <div className="flex items-center gap-2">
                    {getPaymentMethodIcon(viewingSale.paymentMethod)}
                    <span className="font-medium">{getPaymentMethodLabel(viewingSale.paymentMethod)}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  {getPaymentStatusBadge(viewingSale.paymentStatus, viewingSale.isVoided)}
                </div>
              </div>

              <Separator />

              {/* Sale Items */}
              <div>
                <h4 className="font-medium mb-3">Items</h4>
                {isLoadingSaleDetails ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  </div>
                ) : viewingSaleItems.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No items found</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead className="text-center">Qty</TableHead>
                        <TableHead className="text-right">Unit Price</TableHead>
                        <TableHead className="text-right">Subtotal</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {viewingSaleItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">
                                {item.product?.name || getProductName(item.productId)}
                              </p>
                              {item.serialNumber && (
                                <p className="text-xs text-muted-foreground">
                                  S/N: {item.serialNumber}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-center">{item.quantity}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
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
                  <span>{formatCurrency(viewingSale.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax:</span>
                  <span>{formatCurrency(viewingSale.taxAmount)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Discount:</span>
                  <span>-{formatCurrency(viewingSale.discountAmount)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>Total:</span>
                  <span className={cn(viewingSale.isVoided && 'line-through')}>
                    {formatCurrency(viewingSale.totalAmount)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Amount Paid:</span>
                  <span>{formatCurrency(viewingSale.amountPaid)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Change:</span>
                  <span>{formatCurrency(viewingSale.changeGiven)}</span>
                </div>
              </div>

              {/* Void Info */}
              {viewingSale.isVoided && (
                <>
                  <Separator />
                  <div className="rounded-lg bg-destructive/10 p-4 text-destructive">
                    <div className="flex items-center gap-2 font-medium">
                      <Ban className="h-4 w-4" />
                      This sale has been voided
                    </div>
                    {viewingSale.voidReason && (
                      <p className="mt-2 text-sm">Reason: {viewingSale.voidReason}</p>
                    )}
                  </div>
                </>
              )}

              {/* Notes */}
              {viewingSale.notes && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground">Notes</p>
                    <p className="mt-1">{viewingSale.notes}</p>
                  </div>
                </>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
            {viewingSale && (
              <Button onClick={() => handlePrintReceipt(viewingSale)}>
                <Printer className="mr-2 h-4 w-4" />
                Print Receipt
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reversal Request Modal */}
      {reversalTargetSale && (
        <ReversalRequestModal
          open={isReversalModalOpen}
          onClose={() => {
            setIsReversalModalOpen(false)
            setReversalTargetSale(null)
          }}
          entityType="sale"
          entityId={reversalTargetSale.id}
          entityLabel={`Sale #${reversalTargetSale.invoiceNumber}`}
          branchId={reversalTargetSale.branchId}
          onSuccess={fetchData}
        />
      )}

      {/* Void Sale Dialog */}
      <Dialog open={isVoidDialogOpen} onOpenChange={setIsVoidDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Ban className="h-5 w-5" />
              Void Sale
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to void this sale? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {voidingSale && (
            <div className="space-y-4">
              <div className="rounded-lg bg-muted p-4">
                <p className="font-mono font-medium">{voidingSale.invoiceNumber}</p>
                <p className="text-sm text-muted-foreground">
                  {formatDateTime(voidingSale.saleDate)} - {formatCurrency(voidingSale.totalAmount)}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="voidReason">Reason for voiding *</Label>
                <Input
                  id="voidReason"
                  value={voidReason}
                  onChange={(e) => setVoidReason(e.target.value)}
                  placeholder="Enter reason for voiding this sale"
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsVoidDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleVoidSale}
              disabled={!voidReason.trim() || isVoiding}
            >
              {isVoiding ? 'Voiding...' : 'Void Sale'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
