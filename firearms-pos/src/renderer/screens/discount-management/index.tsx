import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Search,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Filter,
  Download,
  Percent,
  Receipt,
  Eye,
  Clock,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip'
import { useBranch } from '@/contexts/branch-context'
import { useCurrentBranchSettings } from '@/contexts/settings-context'
import { formatCurrency, formatDateTime, cn } from '@/lib/utils'

const ITEMS_PER_PAGE = 15

interface DiscountSummary {
  totalDiscounts: number
  totalDiscountAmount: number
  averageDiscountPercent: number
  salesWithDiscount: number
  totalSales: number
  discountRate: number // percentage of sales with discounts
  topDiscountedProducts: { productName: string; discountAmount: number; count: number }[]
}

interface DiscountRecord {
  id: number
  invoiceNumber: string
  saleDate: string
  customerName: string | null
  subtotal: number
  discountAmount: number
  discountPercent: number
  totalAmount: number
  paymentStatus: 'paid' | 'partial' | 'pending'
  userId: number
  userName?: string
  items: DiscountedItem[]
  isFullyReturned?: boolean
  effectiveDiscount?: number
  returnRatio?: number
}

interface DiscountedItem {
  productName: string
  quantity: number
  unitPrice: number
  discountPercent: number
  discountAmount: number
  totalPrice: number
}

export function DiscountManagementScreen() {
  const { currentBranch } = useBranch()
  const { settings } = useCurrentBranchSettings()
  const [discountSummary, setDiscountSummary] = useState<DiscountSummary | null>(null)
  const [discountRecords, setDiscountRecords] = useState<DiscountRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  })
  const [minDiscountFilter, setMinDiscountFilter] = useState('')
  const [selectedRecord, setSelectedRecord] = useState<DiscountRecord | null>(null)
  const [showDetailsDialog, setShowDetailsDialog] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')
  const [currentPage, setCurrentPage] = useState(1)

  // Fetch discount data
  const fetchDiscountData = useCallback(async () => {
    if (!currentBranch) return

    try {
      setIsLoading(true)

      const response = await window.api.discountManagement.getSummary({
        branchId: currentBranch.id,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      })

      if (response?.success) {
        setDiscountSummary(response.data.summary)
        setDiscountRecords(response.data.records)
      }
    } catch (error) {
      console.error('Failed to fetch discount data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [currentBranch, dateRange])

  useEffect(() => {
    fetchDiscountData()
  }, [fetchDiscountData])

  // View record details
  const handleViewDetails = async (record: DiscountRecord) => {
    try {
      const response = await window.api.discountManagement.getDetails(record.id)
      if (response?.success) {
        setSelectedRecord(response.data)
        setShowDetailsDialog(true)
      }
    } catch (error) {
      console.error('Failed to fetch discount details:', error)
    }
  }

  // Filter records
  const filteredRecords = useMemo(() => {
    return discountRecords.filter((record) => {
      const matchesSearch =
        record.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (record.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
      const matchesMinDiscount =
        !minDiscountFilter || record.discountAmount >= parseFloat(minDiscountFilter)
      return matchesSearch && matchesMinDiscount
    })
  }, [discountRecords, searchTerm, minDiscountFilter])

  // Pagination
  const paginationInfo = useMemo(() => {
    const totalPages = Math.max(1, Math.ceil(filteredRecords.length / ITEMS_PER_PAGE))
    const safeCurrentPage = Math.min(currentPage, totalPages)
    const startIndex = (safeCurrentPage - 1) * ITEMS_PER_PAGE
    const paginatedRecords = filteredRecords.slice(startIndex, startIndex + ITEMS_PER_PAGE)
    return { totalPages, safeCurrentPage, paginatedRecords }
  }, [filteredRecords, currentPage])

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, minDiscountFilter])

  // Max discount from settings
  const maxDiscountAllowed = settings?.maxDiscountPercentage ?? 50

  // Stat pills data
  const stats = useMemo(() => ({
    totalAmount: formatCurrency(discountSummary?.totalDiscountAmount || 0),
    salesWithDiscount: discountSummary?.salesWithDiscount || 0,
    avgPercent: (discountSummary?.averageDiscountPercent || 0).toFixed(1),
    discountRate: (discountSummary?.discountRate || 0).toFixed(1),
  }), [discountSummary])

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-semibold">Discount Management</h1>
            <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-red-500">
              {stats.totalAmount}
            </span>
            <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-blue-500">
              {stats.salesWithDiscount} Sales
            </span>
            <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-orange-500">
              Avg {stats.avgPercent}%
            </span>
            <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-purple-500">
              Rate {stats.discountRate}%
            </span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="h-8" onClick={fetchDiscountData}>
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
              Refresh
            </Button>
            <Button variant="outline" size="sm" className="h-8">
              <Download className="h-3.5 w-3.5 mr-1.5" />
              Export
            </Button>
          </div>
        </div>

        {/* Settings Info Bar */}
        <div className="rounded-md border p-2.5 border-primary/20 bg-primary/5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Percent className="h-4 w-4 text-primary" />
            <span className="text-xs font-medium">
              {settings?.enableDiscounts ? 'Discounts Enabled' : 'Discounts Disabled'}
            </span>
            <span className="text-xs text-muted-foreground">|</span>
            <span className="text-xs text-muted-foreground">
              Max Allowed: <span className="font-semibold text-primary">{maxDiscountAllowed}%</span>
            </span>
            <span className="text-xs text-muted-foreground">|</span>
            <span className="text-xs text-muted-foreground">
              Sales with Discount: <span className="font-semibold">{discountSummary?.discountRate.toFixed(1) || 0}%</span>
            </span>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="h-8">
            <TabsTrigger value="overview" className="h-6 px-2 text-xs">Overview</TabsTrigger>
            <TabsTrigger value="records" className="h-6 px-2 text-xs">Discount Records</TabsTrigger>
            <TabsTrigger value="products" className="h-6 px-2 text-xs">Top Products</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="mt-3">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {/* Recent Discounts */}
              <div className="rounded-md border overflow-hidden">
                <div className="px-3 py-2 border-b bg-muted/30">
                  <h3 className="text-xs font-semibold tracking-wider uppercase">Recent Discounts</h3>
                </div>
                <div className="divide-y max-h-[320px] overflow-y-auto">
                  {discountRecords.slice(0, 10).map((record) => (
                    <div
                      key={record.id}
                      className="flex items-center justify-between px-3 py-2 hover:bg-muted/50 cursor-pointer transition-colors"
                      onClick={() => handleViewDetails(record)}
                    >
                      <div>
                        <p className="text-sm font-medium">{record.invoiceNumber}</p>
                        <p className="text-[11px] text-muted-foreground">
                          {record.customerName || 'Walk-in'} · {formatDateTime(record.saleDate)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-red-500">
                          -{formatCurrency(record.discountAmount)}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {record.discountPercent.toFixed(1)}% off
                        </p>
                      </div>
                    </div>
                  ))}
                  {discountRecords.length === 0 && (
                    <p className="text-center text-muted-foreground py-6 text-sm">
                      No discounts found for the selected period
                    </p>
                  )}
                </div>
              </div>

              {/* Top Discounted Products */}
              <div className="rounded-md border overflow-hidden">
                <div className="px-3 py-2 border-b bg-muted/30">
                  <h3 className="text-xs font-semibold tracking-wider uppercase">Most Discounted Products</h3>
                </div>
                <div className="divide-y max-h-[320px] overflow-y-auto">
                  {discountSummary?.topDiscountedProducts?.map((product, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between px-3 py-2"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{product.productName}</p>
                          <p className="text-[11px] text-muted-foreground">
                            {product.count} times discounted
                          </p>
                        </div>
                      </div>
                      <p className="text-sm font-bold text-red-500">
                        -{formatCurrency(product.discountAmount)}
                      </p>
                    </div>
                  ))}
                  {(!discountSummary?.topDiscountedProducts ||
                    discountSummary.topDiscountedProducts.length === 0) && (
                    <p className="text-center text-muted-foreground py-6 text-sm">
                      No product discount data available
                    </p>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Records Tab */}
          <TabsContent value="records" className="mt-3 space-y-3">
            {/* Inline Filters */}
            <div className="flex flex-wrap gap-2 items-center">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search by invoice or customer..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="h-8 pl-8 pr-8 text-sm"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <Input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange((prev) => ({ ...prev, startDate: e.target.value }))}
                className="h-8 w-[140px] text-sm"
              />
              <Input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange((prev) => ({ ...prev, endDate: e.target.value }))}
                className="h-8 w-[140px] text-sm"
              />
              <Input
                type="number"
                placeholder="Min discount"
                value={minDiscountFilter}
                onChange={(e) => setMinDiscountFilter(e.target.value)}
                className="h-8 w-[120px] text-sm"
              />
            </div>

            {/* Table */}
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="text-[10px] font-semibold tracking-wider uppercase">Invoice</TableHead>
                    <TableHead className="text-[10px] font-semibold tracking-wider uppercase">Date</TableHead>
                    <TableHead className="text-[10px] font-semibold tracking-wider uppercase">Customer</TableHead>
                    <TableHead className="text-[10px] font-semibold tracking-wider uppercase text-right">Subtotal</TableHead>
                    <TableHead className="text-[10px] font-semibold tracking-wider uppercase text-right">Discount</TableHead>
                    <TableHead className="text-[10px] font-semibold tracking-wider uppercase text-right">%</TableHead>
                    <TableHead className="text-[10px] font-semibold tracking-wider uppercase text-right">Final</TableHead>
                    <TableHead className="text-[10px] font-semibold tracking-wider uppercase">Status</TableHead>
                    <TableHead className="text-[10px] font-semibold tracking-wider uppercase w-[40px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginationInfo.paginatedRecords.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-6 text-sm text-muted-foreground">
                        No discount records found
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginationInfo.paginatedRecords.map((record) => (
                      <TableRow key={record.id} className="h-9 group">
                        <TableCell className="py-1.5 text-sm font-medium">
                          <span className={record.isFullyReturned ? 'line-through opacity-50' : ''}>{record.invoiceNumber}</span>
                          {record.isFullyReturned && (
                            <Badge variant="outline" className="ml-1.5 text-[9px] px-1 py-0 text-orange-500 border-orange-500/30">Returned</Badge>
                          )}
                        </TableCell>
                        <TableCell className="py-1.5 text-sm">{formatDateTime(record.saleDate)}</TableCell>
                        <TableCell className="py-1.5 text-sm">{record.customerName || 'Walk-in'}</TableCell>
                        <TableCell className="py-1.5 text-sm text-right">{formatCurrency(record.subtotal)}</TableCell>
                        <TableCell className="py-1.5 text-sm text-right font-medium text-red-500">
                          -{formatCurrency(record.discountAmount)}
                        </TableCell>
                        <TableCell className="py-1.5 text-right">
                          <Badge
                            variant={record.discountPercent > maxDiscountAllowed ? 'destructive' : 'secondary'}
                            className="text-[10px] px-1.5 py-0"
                          >
                            {record.discountPercent.toFixed(1)}%
                          </Badge>
                        </TableCell>
                        <TableCell className="py-1.5 text-sm text-right font-medium">
                          {formatCurrency(record.totalAmount)}
                        </TableCell>
                        <TableCell className="py-1.5">
                          <Badge
                            variant={
                              record.paymentStatus === 'paid'
                                ? 'default'
                                : record.paymentStatus === 'partial'
                                ? 'secondary'
                                : 'destructive'
                            }
                            className="text-[10px] px-1.5 py-0"
                          >
                            {record.paymentStatus}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-1.5">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => handleViewDetails(record)}
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>View Details</TooltipContent>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {filteredRecords.length > ITEMS_PER_PAGE && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {filteredRecords.length} record{filteredRecords.length !== 1 ? 's' : ''}
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    disabled={paginationInfo.safeCurrentPage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </Button>
                  <span className="text-xs font-medium">
                    {paginationInfo.safeCurrentPage} / {paginationInfo.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    disabled={paginationInfo.safeCurrentPage >= paginationInfo.totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(paginationInfo.totalPages, p + 1))}
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Products Tab */}
          <TabsContent value="products" className="mt-3">
            <div className="rounded-md border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead className="text-[10px] font-semibold tracking-wider uppercase w-[60px]">Rank</TableHead>
                    <TableHead className="text-[10px] font-semibold tracking-wider uppercase">Product</TableHead>
                    <TableHead className="text-[10px] font-semibold tracking-wider uppercase text-right">Times Discounted</TableHead>
                    <TableHead className="text-[10px] font-semibold tracking-wider uppercase text-right">Total Discount Given</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {discountSummary?.topDiscountedProducts?.map((product, index) => (
                    <TableRow key={index} className="h-9 group">
                      <TableCell className="py-1.5">
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold">
                          {index + 1}
                        </div>
                      </TableCell>
                      <TableCell className="py-1.5 text-sm font-medium">{product.productName}</TableCell>
                      <TableCell className="py-1.5 text-sm text-right">{product.count}</TableCell>
                      <TableCell className="py-1.5 text-sm text-right font-medium text-red-500">
                        -{formatCurrency(product.discountAmount)}
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!discountSummary?.topDiscountedProducts ||
                    discountSummary.topDiscountedProducts.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-6 text-sm text-muted-foreground">
                        No product discount data available
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>

        {/* Details Dialog */}
        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Discount Details - {selectedRecord?.invoiceNumber}</DialogTitle>
              <DialogDescription>
                {selectedRecord?.customerName || 'Walk-in'} · {selectedRecord && formatDateTime(selectedRecord.saleDate)}
              </DialogDescription>
            </DialogHeader>
            {selectedRecord && (
              <div className="space-y-4">
                {/* Summary */}
                <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground">Subtotal</p>
                    <p className="text-lg font-bold">{formatCurrency(selectedRecord.subtotal)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Discount</p>
                    <p className="text-lg font-bold text-red-500">
                      -{formatCurrency(selectedRecord.discountAmount)} ({selectedRecord.discountPercent.toFixed(1)}%)
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Final Amount</p>
                    <p className="text-lg font-bold">{formatCurrency(selectedRecord.totalAmount)}</p>
                  </div>
                </div>

                {/* Items */}
                <div>
                  <h4 className="font-medium mb-2">Discounted Items</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead className="text-right">Qty</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-right">Discount</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedRecord.items?.map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>{item.productName}</TableCell>
                          <TableCell className="text-right">{item.quantity}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.unitPrice)}</TableCell>
                          <TableCell className="text-right text-red-500">
                            {item.discountAmount > 0 && (
                              <>-{formatCurrency(item.discountAmount)} ({item.discountPercent}%)</>
                            )}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(item.totalPrice)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  )
}

export default DiscountManagementScreen
