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
import { ReversalStatusBadge } from '@/components/reversal-status-badge'

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

  // Build receipt HTML string
  const buildReceiptHtml = (sale: Sale, items?: SaleItem[]): string => {
    const saleItems = items || viewingSaleItems
    const customerName = getCustomerName(sale.customerId)
    const branchName = getBranchName(sale.branchId)
    const cashierName = getUserName(sale.userId)
    const paymentLabel = getPaymentMethodLabel(sale.paymentMethod)

    const itemRows = saleItems.map((item) => {
      const name = item.product?.name || getProductName(item.productId)
      const shortName = name.length > 22 ? name.substring(0, 22) + '..' : name
      const serialHtml = item.serialNumber ? `<br><span class="serial">S/N: ${item.serialNumber}</span>` : ''
      return `<tr><td colspan="4" class="item-name">${shortName}${serialHtml}</td></tr>
<tr class="item-detail"><td class="qty">${item.quantity}x</td><td class="rate">${formatCurrency(item.unitPrice)}</td><td class="disc">${item.discountAmount > 0 ? '-' + formatCurrency(item.discountAmount) : '-'}</td><td class="amt">${formatCurrency(item.totalPrice)}</td></tr>`
    }).join('\n')

    const discountRow = sale.discountAmount > 0
      ? `<div class="total-row discount"><span class="label">Discount</span><span class="value">-${formatCurrency(sale.discountAmount)}</span></div>`
      : ''
    const changeRow = sale.changeGiven > 0
      ? `<div class="payment-info"><span class="label">Change</span><span class="value">${formatCurrency(sale.changeGiven)}</span></div>`
      : ''
    const voidedStamp = sale.isVoided ? `<div class="voided-stamp">Voided</div>` : ''
    const notesBlock = sale.notes
      ? `<div style="font-size:9px;color:#777;padding:6px 0;border-top:1px dotted #ddd;margin-top:4px"><strong>Note:</strong> ${sale.notes}</div>`
      : ''

    return `<!DOCTYPE html>
<html><head><title>Receipt - ${sale.invoiceNumber}</title>
<style>
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'DM Sans',-apple-system,sans-serif;width:320px;margin:0 auto;padding:16px 12px;color:#1a1a1a;background:#fff;-webkit-font-smoothing:antialiased}
.receipt-header{text-align:center;padding:8px 0 12px;border-bottom:2px solid #1a1a1a}
.biz-name{font-size:20px;font-weight:700;letter-spacing:2px;text-transform:uppercase;margin-bottom:2px}
.branch-name{font-size:11px;font-weight:500;color:#555;letter-spacing:1px;text-transform:uppercase}
.invoice-block{display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px dashed #ccc}
.invoice-num{font-family:'JetBrains Mono',monospace;font-size:13px;font-weight:600;color:#1a1a1a}
.invoice-date{font-size:10px;color:#777;text-align:right;line-height:1.4}
.info-grid{display:grid;grid-template-columns:1fr 1fr;gap:2px 12px;padding:8px 0;font-size:10px;border-bottom:1px dashed #ccc}
.info-label{color:#999;text-transform:uppercase;letter-spacing:.5px;font-size:8px;font-weight:600}
.info-value{font-weight:500;color:#333;margin-bottom:4px}
.items-header{display:flex;justify-content:space-between;align-items:center;padding:8px 0 4px;border-bottom:1px solid #e5e5e5}
.items-title{font-size:9px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:#555}
.items-count{font-size:9px;color:#999}
table{width:100%;border-collapse:collapse;margin:4px 0}
.col-headers td{font-size:8px;font-weight:600;text-transform:uppercase;letter-spacing:.5px;color:#aaa;padding:4px 0 2px;border-bottom:1px dotted #ddd}
.item-name{font-size:11px;font-weight:500;padding:6px 0 0;color:#1a1a1a}
.serial{font-size:8px;color:#999;font-family:'JetBrains Mono',monospace}
.item-detail td{font-family:'JetBrains Mono',monospace;font-size:10px;padding:0 0 6px;color:#555;border-bottom:1px dotted #f0f0f0}
.qty{width:15%}.rate{width:30%}.disc{width:20%;color:#c0392b!important}.amt{width:35%;text-align:right;font-weight:600;color:#1a1a1a!important}
.totals-section{padding:8px 0;border-top:1px dashed #ccc}
.total-row{display:flex;justify-content:space-between;align-items:center;padding:2px 0;font-size:11px}
.total-row .label{color:#777}.total-row .value{font-family:'JetBrains Mono',monospace;font-weight:500;color:#333}
.total-row.discount .value{color:#c0392b}
.grand-total{display:flex;justify-content:space-between;align-items:center;padding:8px 0;margin:6px 0 2px;border-top:2px solid #1a1a1a;border-bottom:2px solid #1a1a1a}
.grand-total .label{font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:1px}
.grand-total .value{font-family:'JetBrains Mono',monospace;font-size:16px;font-weight:700}
.payment-info{display:flex;justify-content:space-between;padding:3px 0;font-size:10px}
.payment-info .label{color:#999}.payment-info .value{font-family:'JetBrains Mono',monospace;font-weight:500}
.receipt-footer{text-align:center;padding:12px 0 4px;border-top:1px dashed #ccc;margin-top:8px}
.thank-you{font-size:11px;font-weight:600;letter-spacing:.5px;margin-bottom:4px}
.footer-sub{font-size:8px;color:#aaa;line-height:1.5}
.voided-stamp{text-align:center;padding:6px;margin:8px 0;border:2px solid #c0392b;color:#c0392b;font-size:14px;font-weight:700;letter-spacing:3px;text-transform:uppercase;transform:rotate(-3deg)}
@media print{body{width:100%;padding:8px}@page{margin:0;size:80mm auto}}
</style></head>
<body>
<div class="receipt-header"><div class="biz-name">Firearms POS</div><div class="branch-name">${branchName}</div></div>
<div class="invoice-block"><div class="invoice-num">#${sale.invoiceNumber}</div><div class="invoice-date">${formatDateTime(sale.saleDate)}</div></div>
<div class="info-grid">
<div><div class="info-label">Customer</div><div class="info-value">${customerName}</div></div>
<div><div class="info-label">Cashier</div><div class="info-value">${cashierName}</div></div>
<div><div class="info-label">Payment</div><div class="info-value">${paymentLabel}</div></div>
<div><div class="info-label">Status</div><div class="info-value">${sale.isVoided ? 'VOIDED' : sale.paymentStatus.toUpperCase()}</div></div>
</div>
<div class="items-header"><span class="items-title">Items</span><span class="items-count">${saleItems.length} item${saleItems.length !== 1 ? 's' : ''}</span></div>
<table>
<tr class="col-headers"><td>Qty</td><td>Rate</td><td>Disc</td><td style="text-align:right">Amount</td></tr>
${itemRows}
</table>
<div class="totals-section">
<div class="total-row"><span class="label">Subtotal</span><span class="value">${formatCurrency(sale.subtotal)}</span></div>
<div class="total-row"><span class="label">Tax</span><span class="value">${formatCurrency(sale.taxAmount)}</span></div>
${discountRow}
</div>
<div class="grand-total"><span class="label">Total</span><span class="value">${formatCurrency(sale.totalAmount)}</span></div>
<div class="payment-info"><span class="label">Amount Paid</span><span class="value">${formatCurrency(sale.amountPaid)}</span></div>
${changeRow}${voidedStamp}${notesBlock}
<div class="receipt-footer"><div class="thank-you">Thank you for your business!</div><div class="footer-sub">Printed: ${new Date().toLocaleString()}<br>Powered by Firearms POS</div></div>
</body></html>`
  }

  // Print receipt
  const handlePrintReceipt = (sale: Sale, items?: SaleItem[]) => {
    const html = buildReceiptHtml(sale, items)
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.open()
      printWindow.document.write(html)
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
            <CardTitle className="text-sm font-medium">Gross Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">All time gross sales</p>
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
            <CardTitle className="text-sm font-medium">Today's Gross Sales</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.todayRevenue)}</div>
            <p className="text-xs text-muted-foreground">Gross sales today</p>
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
                        <ReversalStatusBadge entityType="sale" entityId={sale.id} />
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
        <DialogContent className="max-w-[520px] max-h-[90vh] overflow-y-auto p-0 gap-0 border-border/50">
          {/* Suppress default header — we build our own */}
          <DialogHeader className="sr-only">
            <DialogTitle>Sale Details</DialogTitle>
            <DialogDescription>Invoice: {viewingSale?.invoiceNumber}</DialogDescription>
          </DialogHeader>

          {viewingSale && (
            <div className="relative">
              {/* ── Invoice Header Band ── */}
              <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-6 pt-5 pb-4 text-white">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-bold tracking-widest uppercase">Firearms POS</h2>
                    <p className="text-[10px] text-slate-400 tracking-wider uppercase mt-0.5">
                      {getBranchName(viewingSale.branchId)}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 justify-end">
                      <span className="font-mono text-sm font-semibold tracking-wide">#{viewingSale.invoiceNumber}</span>
                      <ReversalStatusBadge entityType="sale" entityId={viewingSale.id} />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">{formatDateTime(viewingSale.saleDate)}</p>
                  </div>
                </div>

                {/* Status Pill */}
                <div className="flex items-center gap-2 mt-3">
                  {viewingSale.isVoided ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30">
                      <Ban className="h-2.5 w-2.5" /> Voided
                    </span>
                  ) : (
                    <span className={cn(
                      "inline-flex items-center text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border",
                      viewingSale.paymentStatus === 'paid' && "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
                      viewingSale.paymentStatus === 'partial' && "bg-amber-500/20 text-amber-300 border-amber-500/30",
                      viewingSale.paymentStatus === 'pending' && "bg-slate-500/20 text-slate-300 border-slate-500/30"
                    )}>
                      {viewingSale.paymentStatus}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 uppercase tracking-wider">
                    {getPaymentMethodIcon(viewingSale.paymentMethod)}
                    {getPaymentMethodLabel(viewingSale.paymentMethod)}
                  </span>
                </div>
              </div>

              {/* ── Customer / Cashier Info Strip ── */}
              <div className="grid grid-cols-2 gap-px bg-border/30">
                <div className="bg-background px-6 py-3">
                  <p className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground/60">Customer</p>
                  <p className="text-sm font-medium mt-0.5 truncate">
                    {viewingCustomer ? `${viewingCustomer.firstName} ${viewingCustomer.lastName}`.trim() : getCustomerName(viewingSale.customerId)}
                  </p>
                  <p className="text-[11px] text-muted-foreground font-mono">
                    {viewingCustomer?.phone || getCustomerPhone(viewingSale.customerId)}
                  </p>
                </div>
                <div className="bg-background px-6 py-3">
                  <p className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground/60">Cashier</p>
                  <p className="text-sm font-medium mt-0.5 truncate">{getUserName(viewingSale.userId)}</p>
                  <p className="text-[11px] text-muted-foreground">{getBranchName(viewingSale.branchId)}</p>
                </div>
              </div>

              {/* ── Items Section ── */}
              <div className="px-6 pt-4 pb-2">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                    Items
                  </h4>
                  <span className="text-[10px] text-muted-foreground">
                    {viewingSaleItems.length} item{viewingSaleItems.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {isLoadingSaleDetails ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  </div>
                ) : viewingSaleItems.length === 0 ? (
                  <p className="text-muted-foreground text-center py-6 text-xs">No items found</p>
                ) : (
                  <div className="space-y-0">
                    {/* Column headers */}
                    <div className="grid grid-cols-[1fr_50px_80px_80px] gap-2 pb-1.5 border-b border-border/50">
                      <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/50">Product</span>
                      <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/50 text-center">Qty</span>
                      <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/50 text-right">Price</span>
                      <span className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/50 text-right">Amount</span>
                    </div>
                    {viewingSaleItems.map((item, idx) => (
                      <div
                        key={item.id}
                        className={cn(
                          "grid grid-cols-[1fr_50px_80px_80px] gap-2 py-2 items-center",
                          idx < viewingSaleItems.length - 1 && "border-b border-border/20"
                        )}
                      >
                        <div className="min-w-0">
                          <p className="text-xs font-medium truncate">
                            {item.product?.name || getProductName(item.productId)}
                          </p>
                          {item.serialNumber && (
                            <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                              S/N: {item.serialNumber}
                            </p>
                          )}
                          {item.discountAmount > 0 && (
                            <p className="text-[10px] text-red-400 mt-0.5">
                              -{formatCurrency(item.discountAmount)} disc.
                            </p>
                          )}
                        </div>
                        <span className="text-xs text-center font-mono tabular-nums text-muted-foreground">{item.quantity}</span>
                        <span className="text-xs text-right font-mono tabular-nums text-muted-foreground">{formatCurrency(item.unitPrice)}</span>
                        <span className="text-xs text-right font-mono tabular-nums font-semibold">{formatCurrency(item.totalPrice)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ── Totals Block ── */}
              <div className="px-6 pb-4">
                <div className="bg-muted/30 rounded-lg p-4 space-y-1.5 border border-border/30">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-mono tabular-nums">{formatCurrency(viewingSale.subtotal)}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-muted-foreground">Tax</span>
                    <span className="font-mono tabular-nums">{formatCurrency(viewingSale.taxAmount)}</span>
                  </div>
                  {viewingSale.discountAmount > 0 && (
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">Discount</span>
                      <span className="font-mono tabular-nums text-red-400">-{formatCurrency(viewingSale.discountAmount)}</span>
                    </div>
                  )}

                  <Separator className="my-2 !bg-border/50" />

                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold uppercase tracking-wider">Total</span>
                    <span className={cn(
                      "text-lg font-bold font-mono tabular-nums",
                      viewingSale.isVoided && "line-through text-muted-foreground"
                    )}>
                      {formatCurrency(viewingSale.totalAmount)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-xs pt-1">
                    <span className="text-muted-foreground">Paid</span>
                    <span className="font-mono tabular-nums font-medium text-emerald-500">{formatCurrency(viewingSale.amountPaid)}</span>
                  </div>
                  {viewingSale.changeGiven > 0 && (
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">Change</span>
                      <span className="font-mono tabular-nums">{formatCurrency(viewingSale.changeGiven)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* ── Void Banner ── */}
              {viewingSale.isVoided && (
                <div className="mx-6 mb-3 rounded-lg bg-red-500/10 border border-red-500/20 p-3">
                  <div className="flex items-center gap-2 text-red-400">
                    <Ban className="h-3.5 w-3.5" />
                    <span className="text-xs font-semibold uppercase tracking-wider">Sale Voided</span>
                  </div>
                  {viewingSale.voidReason && (
                    <p className="text-xs text-red-400/80 mt-1 ml-5">{viewingSale.voidReason}</p>
                  )}
                </div>
              )}

              {/* ── Notes ── */}
              {viewingSale.notes && (
                <div className="mx-6 mb-3 rounded-lg bg-muted/20 border border-border/30 p-3">
                  <p className="text-[9px] font-semibold uppercase tracking-widest text-muted-foreground/60 mb-1">Notes</p>
                  <p className="text-xs text-muted-foreground">{viewingSale.notes}</p>
                </div>
              )}

              {/* ── Footer Actions ── */}
              <div className="flex items-center justify-end gap-2 px-6 py-3 border-t border-border/30 bg-muted/10">
                <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => setIsViewDialogOpen(false)}>
                  Close
                </Button>
                <Button size="sm" className="h-8 text-xs gap-1.5" onClick={() => handlePrintReceipt(viewingSale, viewingSaleItems)}>
                  <Printer className="h-3 w-3" />
                  Print Receipt
                </Button>
              </div>
            </div>
          )}
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
