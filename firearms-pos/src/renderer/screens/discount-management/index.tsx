import React, { useState, useEffect, useCallback } from 'react'
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
  BarChart3,
  PieChart,
  Clock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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
import { ScrollArea } from '@/components/ui/scroll-area'
import { useBranch } from '@/contexts/branch-context'
import { useCurrentBranchSettings } from '@/contexts/settings-context'
import { formatCurrency, formatDateTime, cn } from '@/lib/utils'

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
  const filteredRecords = discountRecords.filter((record) => {
    const matchesSearch =
      record.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (record.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
    const matchesMinDiscount =
      !minDiscountFilter || record.discountAmount >= parseFloat(minDiscountFilter)
    return matchesSearch && matchesMinDiscount
  })

  // Max discount from settings
  const maxDiscountAllowed = settings?.maxDiscountPercentage ?? 50

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-lg">Loading discount data...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Discount Management</h1>
          <p className="text-muted-foreground">
            Track and analyze all sales discounts • {currentBranch?.name || 'Select a branch'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchDiscountData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Settings Info Bar */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Percent className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Discount Settings</p>
                <p className="text-lg font-semibold">
                  {settings?.enableDiscounts ? 'Discounts Enabled' : 'Discounts Disabled'}
                </p>
              </div>
            </div>
            <div className="flex gap-6 text-sm">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{maxDiscountAllowed}%</p>
                <p className="text-xs text-muted-foreground">Max Allowed</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{discountSummary?.discountRate.toFixed(1) || 0}%</p>
                <p className="text-xs text-muted-foreground">Sales with Discount</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Discounts Given</CardTitle>
            <DollarSign className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(discountSummary?.totalDiscountAmount || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Across {discountSummary?.totalDiscounts || 0} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sales with Discounts</CardTitle>
            <Receipt className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {discountSummary?.salesWithDiscount || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Out of {discountSummary?.totalSales || 0} total sales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Discount</CardTitle>
            <Percent className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(discountSummary?.averageDiscountPercent || 0).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">Per discounted sale</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Discount Rate</CardTitle>
            <BarChart3 className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(discountSummary?.discountRate || 0).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">Of all sales have discounts</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="records">Discount Records</TabsTrigger>
          <TabsTrigger value="products">Top Products</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Discounts */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Discounts</CardTitle>
                <CardDescription>Last 10 sales with discounts</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-3">
                    {discountRecords.slice(0, 10).map((record) => (
                      <div
                        key={record.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer"
                        onClick={() => handleViewDetails(record)}
                      >
                        <div>
                          <p className="font-medium">{record.invoiceNumber}</p>
                          <p className="text-sm text-muted-foreground">
                            {record.customerName || 'Walk-in'} • {formatDateTime(record.saleDate)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-red-600">
                            -{formatCurrency(record.discountAmount)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {record.discountPercent.toFixed(1)}% off
                          </p>
                        </div>
                      </div>
                    ))}
                    {discountRecords.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">
                        No discounts found for the selected period
                      </p>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Top Discounted Products */}
            <Card>
              <CardHeader>
                <CardTitle>Most Discounted Products</CardTitle>
                <CardDescription>Products with highest discount amounts</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-3">
                    {discountSummary?.topDiscountedProducts?.map((product, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium">{product.productName}</p>
                            <p className="text-sm text-muted-foreground">
                              {product.count} times discounted
                            </p>
                          </div>
                        </div>
                        <p className="font-bold text-red-600">
                          -{formatCurrency(product.discountAmount)}
                        </p>
                      </div>
                    ))}
                    {(!discountSummary?.topDiscountedProducts ||
                      discountSummary.topDiscountedProducts.length === 0) && (
                      <p className="text-center text-muted-foreground py-8">
                        No product discount data available
                      </p>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Records Tab */}
        <TabsContent value="records" className="flex-1">
          <Card className="h-full flex flex-col">
            <CardHeader>
              <div className="flex flex-wrap gap-4 items-end">
                <div className="flex-1 min-w-[200px]">
                  <Label htmlFor="search">Search</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search by invoice or customer..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="w-[150px]">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) => setDateRange((prev) => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>
                <div className="w-[150px]">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) => setDateRange((prev) => ({ ...prev, endDate: e.target.value }))}
                  />
                </div>
                <div className="w-[150px]">
                  <Label htmlFor="minDiscount">Min Discount</Label>
                  <Input
                    id="minDiscount"
                    type="number"
                    placeholder="0.00"
                    value={minDiscountFilter}
                    onChange={(e) => setMinDiscountFilter(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                    <TableHead className="text-right">Discount</TableHead>
                    <TableHead className="text-right">%</TableHead>
                    <TableHead className="text-right">Final</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                        No discount records found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">{record.invoiceNumber}</TableCell>
                        <TableCell>{formatDateTime(record.saleDate)}</TableCell>
                        <TableCell>{record.customerName || 'Walk-in'}</TableCell>
                        <TableCell className="text-right">{formatCurrency(record.subtotal)}</TableCell>
                        <TableCell className="text-right font-medium text-red-600">
                          -{formatCurrency(record.discountAmount)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge
                            variant={record.discountPercent > maxDiscountAllowed ? 'destructive' : 'secondary'}
                          >
                            {record.discountPercent.toFixed(1)}%
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(record.totalAmount)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              record.paymentStatus === 'paid'
                                ? 'default'
                                : record.paymentStatus === 'partial'
                                ? 'secondary'
                                : 'destructive'
                            }
                          >
                            {record.paymentStatus}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => handleViewDetails(record)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products" className="flex-1">
          <Card>
            <CardHeader>
              <CardTitle>Products Discount Analysis</CardTitle>
              <CardDescription>See which products are discounted most often</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-right">Times Discounted</TableHead>
                    <TableHead className="text-right">Total Discount Given</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {discountSummary?.topDiscountedProducts?.map((product, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{product.productName}</TableCell>
                      <TableCell className="text-right">{product.count}</TableCell>
                      <TableCell className="text-right font-medium text-red-600">
                        -{formatCurrency(product.discountAmount)}
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!discountSummary?.topDiscountedProducts ||
                    discountSummary.topDiscountedProducts.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                        No product discount data available
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Discount Details - {selectedRecord?.invoiceNumber}</DialogTitle>
            <DialogDescription>
              {selectedRecord?.customerName || 'Walk-in'} • {selectedRecord && formatDateTime(selectedRecord.saleDate)}
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
                  <p className="text-lg font-bold text-red-600">
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
                        <TableCell className="text-right text-red-600">
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
  )
}

export default DiscountManagementScreen
