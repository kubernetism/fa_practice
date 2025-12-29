import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  AlertTriangle,
  Boxes,
  ChevronLeft,
  ChevronRight,
  Package,
  Building2,
  RefreshCw,
  BarChart3,
  List,
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
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useBranch } from '@/contexts/branch-context'
import { formatCurrency, formatDateTime, cn } from '@/lib/utils'
import type { Product, Branch, Inventory } from '@shared/types'

interface InventoryItem extends Inventory {
  product?: Product
  branch?: Branch
}

interface SummaryRow {
  productId: number
  productName: string
  productCode: string
  totalAvailability: number
  totalMinAlert: number
  branchesCount: number
  isSerialTracked: boolean
  costPrice: number
  sellingPrice: number
}

interface FormData {
  branchId: string
  productId: string
  stockType: string
  unit: string
  availability: string
  minStockAlert: string
  costPricePerBatch: string
}

const ITEMS_PER_PAGE = 10

const initialFormData: FormData = {
  branchId: '',
  productId: '',
  stockType: 'Retail',
  unit: 'pcs',
  availability: '0',
  minStockAlert: '5',
  costPricePerBatch: '',
}

export function InventoryScreen() {
  const { currentBranch, branches } = useBranch()

  // State
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [editingInventory, setEditingInventory] = useState<InventoryItem | null>(null)
  const [viewingInventory, setViewingInventory] = useState<InventoryItem | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [activeView, setActiveView] = useState<'summary' | 'transactions'>('summary')
  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [isSaving, setIsSaving] = useState(false)
  const [selectedBranchFilter, setSelectedBranchFilter] = useState<string>('all')

  // Fetch data
  const fetchInventory = useCallback(async () => {
    try {
      let result
      if (selectedBranchFilter === 'all') {
        result = await window.api.inventory.getAll()
      } else {
        const branchId = parseInt(selectedBranchFilter) || currentBranch?.id
        result = await window.api.inventory.getByBranch(branchId)
      }

      if (result.success && result.data) {
        // Map the data to include product and branch info
        const inventoryItems = result.data.map((item: any) => ({
          ...item.inventory,
          product: item.product,
          branch: item.branch,
        }))
        setInventory(inventoryItems)
      }
    } catch (error) {
      console.error('Failed to fetch inventory:', error)
    }
  }, [currentBranch?.id, selectedBranchFilter])

  const fetchProducts = useCallback(async () => {
    try {
      const result = await window.api.products.getAll({ limit: 1000, isActive: true })
      if (result.success && result.data) {
        setProducts(result.data)
      }
    } catch (error) {
      console.error('Failed to fetch products:', error)
    }
  }, [])

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      await Promise.all([fetchInventory(), fetchProducts()])
      setIsLoading(false)
    }
    loadData()
  }, [fetchInventory, fetchProducts])

  // Helper functions
  const getProductName = (productId: number): string => {
    const product = products.find(p => p.id === productId)
    return product?.name || 'Unknown Product'
  }

  const getProductCode = (productId: number): string => {
    const product = products.find(p => p.id === productId)
    return product?.code || 'N/A'
  }

  const getBranchName = (branchId: number): string => {
    const branch = branches.find(b => b.id === branchId)
    return branch?.name || 'Unknown Branch'
  }

  const getProduct = (productId: number): Product | undefined => {
    return products.find(p => p.id === productId)
  }

  // Stock status helpers
  const getStockStatus = (availability: number, minAlert: number) => {
    if (availability <= minAlert) return 'low'
    if (availability > minAlert * 2) return 'good'
    return 'normal'
  }

  const getStockStatusBadge = (status: string) => {
    switch (status) {
      case 'low':
        return <Badge variant="destructive">Low Stock</Badge>
      case 'good':
        return <Badge variant="success">In Stock</Badge>
      default:
        return <Badge variant="warning">Normal</Badge>
    }
  }

  const getStockStatusColor = (status: string) => {
    switch (status) {
      case 'low':
        return 'bg-red-500/5 border-red-500/20 hover:bg-red-500/10'
      case 'good':
        return 'bg-green-500/5 border-green-500/20 hover:bg-green-500/10'
      default:
        return 'bg-yellow-500/5 border-yellow-500/20 hover:bg-yellow-500/10'
    }
  }

  // Filtered inventory
  const filteredInventory = useMemo(() => {
    return inventory.filter(item => {
      const productName = getProductName(item.productId).toLowerCase()
      const productCode = getProductCode(item.productId).toLowerCase()
      const branchName = getBranchName(item.branchId).toLowerCase()
      const search = searchTerm.toLowerCase()

      return productName.includes(search) ||
             productCode.includes(search) ||
             branchName.includes(search)
    })
  }, [inventory, searchTerm, products, branches])

  // Summary rows - aggregate by product
  const summaryRows = useMemo((): SummaryRow[] => {
    const productMap = new Map<number, SummaryRow>()

    filteredInventory.forEach(item => {
      const product = getProduct(item.productId)
      const existing = productMap.get(item.productId)

      if (existing) {
        existing.totalAvailability += item.quantity
        existing.totalMinAlert += item.minQuantity
        existing.branchesCount += 1
      } else {
        productMap.set(item.productId, {
          productId: item.productId,
          productName: product?.name || 'Unknown',
          productCode: product?.code || 'N/A',
          totalAvailability: item.quantity,
          totalMinAlert: item.minQuantity,
          branchesCount: 1,
          isSerialTracked: product?.isSerialTracked || false,
          costPrice: product?.costPrice || 0,
          sellingPrice: product?.sellingPrice || 0,
        })
      }
    })

    return Array.from(productMap.values()).sort((a, b) => {
      // Sort by low stock first
      const aIsLow = a.totalAvailability <= a.totalMinAlert
      const bIsLow = b.totalAvailability <= b.totalMinAlert
      if (aIsLow && !bIsLow) return -1
      if (!aIsLow && bIsLow) return 1
      return a.productName.localeCompare(b.productName)
    })
  }, [filteredInventory, products])

  // Pagination
  const totalPages = Math.ceil(
    (activeView === 'summary' ? summaryRows.length : filteredInventory.length) / ITEMS_PER_PAGE
  )
  const paginatedSummary = summaryRows.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )
  const paginatedInventory = filteredInventory.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  // Low stock count
  const lowStockCount = summaryRows.filter(
    row => row.totalAvailability <= row.totalMinAlert
  ).length

  // Dialog handlers
  const handleOpenAddDialog = () => {
    setEditingInventory(null)
    setFormData({
      ...initialFormData,
      branchId: currentBranch?.id?.toString() || '',
    })
    setIsDialogOpen(true)
  }

  const handleOpenEditDialog = (item: InventoryItem) => {
    setEditingInventory(item)
    setFormData({
      branchId: item.branchId.toString(),
      productId: item.productId.toString(),
      stockType: 'Retail',
      unit: 'pcs',
      availability: item.quantity.toString(),
      minStockAlert: item.minQuantity.toString(),
      costPricePerBatch: '',
    })
    setIsDialogOpen(true)
  }

  const handleOpenViewDialog = (item: InventoryItem) => {
    setViewingInventory(item)
    setIsViewDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingInventory(null)
    setFormData(initialFormData)
  }

  // Save inventory
  const handleSave = async () => {
    if (!formData.branchId || !formData.productId) {
      alert('Please select a branch and product')
      return
    }

    setIsSaving(true)
    try {
      if (editingInventory) {
        // Update existing
        const result = await window.api.inventory.adjust({
          productId: parseInt(formData.productId),
          branchId: parseInt(formData.branchId),
          adjustmentType: 'correction',
          quantityChange: parseInt(formData.availability) - editingInventory.quantity,
          reason: 'Manual inventory adjustment',
        })

        if (!result.success) {
          alert(result.message || 'Failed to update inventory')
          return
        }
      } else {
        // Add new inventory or add to existing
        const result = await window.api.inventory.adjust({
          productId: parseInt(formData.productId),
          branchId: parseInt(formData.branchId),
          adjustmentType: 'add',
          quantityChange: parseInt(formData.availability),
          reason: 'Initial stock entry',
        })

        if (!result.success) {
          alert(result.message || 'Failed to add inventory')
          return
        }
      }

      handleCloseDialog()
      fetchInventory()
    } catch (error) {
      console.error('Save error:', error)
      alert('An error occurred while saving')
    } finally {
      setIsSaving(false)
    }
  }

  // Delete inventory
  const handleDelete = async (item: InventoryItem) => {
    if (!confirm(`Are you sure you want to remove this inventory record for ${getProductName(item.productId)}?`)) {
      return
    }

    try {
      // Remove all stock
      const result = await window.api.inventory.adjust({
        productId: item.productId,
        branchId: item.branchId,
        adjustmentType: 'remove',
        quantityChange: item.quantity,
        reason: 'Inventory record removed',
      })

      if (result.success) {
        fetchInventory()
      } else {
        alert(result.message || 'Failed to delete inventory')
      }
    } catch (error) {
      console.error('Delete error:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Loading inventory...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Inventory Management</h1>
          <p className="text-muted-foreground">
            Track stock levels across branches with low stock alerts
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => fetchInventory()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button onClick={handleOpenAddDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Add Stock
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summaryRows.length}</div>
            <p className="text-xs text-muted-foreground">In inventory</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Stock</CardTitle>
            <Boxes className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summaryRows.reduce((sum, row) => sum + row.totalAvailability, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Units available</p>
          </CardContent>
        </Card>

        <Card className={lowStockCount > 0 ? 'border-destructive' : ''}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
            <AlertTriangle className={cn('h-4 w-4', lowStockCount > 0 ? 'text-destructive' : 'text-muted-foreground')} />
          </CardHeader>
          <CardContent>
            <div className={cn('text-2xl font-bold', lowStockCount > 0 && 'text-destructive')}>
              {lowStockCount}
            </div>
            <p className="text-xs text-muted-foreground">Products need restock</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Value</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                summaryRows.reduce((sum, row) => sum + row.totalAvailability * row.costPrice, 0)
              )}
            </div>
            <p className="text-xs text-muted-foreground">At cost price</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and View Toggle */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-1 gap-4">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by product, code, or branch..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                    setCurrentPage(1)
                  }}
                  className="pl-9"
                />
              </div>

              {/* Branch Filter */}
              <Select value={selectedBranchFilter} onValueChange={(value) => {
                setSelectedBranchFilter(value)
                setCurrentPage(1)
              }}>
                <SelectTrigger className="w-48">
                  <Building2 className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="All Branches" />
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
            </div>

            {/* View Toggle */}
            <div className="flex gap-2">
              <Button
                variant={activeView === 'summary' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setActiveView('summary')
                  setCurrentPage(1)
                }}
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                Summary
              </Button>
              <Button
                variant={activeView === 'transactions' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setActiveView('transactions')
                  setCurrentPage(1)
                }}
              >
                <List className="mr-2 h-4 w-4" />
                Details
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary View */}
      {activeView === 'summary' && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {paginatedSummary.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="flex h-40 items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Boxes className="mx-auto mb-2 h-12 w-12" />
                  <p>No inventory records found</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            paginatedSummary.map((row) => {
              const status = getStockStatus(row.totalAvailability, row.totalMinAlert)
              return (
                <Card
                  key={row.productId}
                  className={cn('cursor-pointer transition-colors', getStockStatusColor(status))}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {status === 'low' ? (
                          <AlertTriangle className="h-5 w-5 text-destructive" />
                        ) : (
                          <Boxes className="h-5 w-5 text-muted-foreground" />
                        )}
                        <div>
                          <CardTitle className="text-base">{row.productName}</CardTitle>
                          <p className="text-sm text-muted-foreground font-mono">{row.productCode}</p>
                        </div>
                      </div>
                      {row.isSerialTracked && (
                        <Badge variant="outline" className="text-xs">Serial Tracked</Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Stock Level</p>
                        <p className={cn(
                          'text-2xl font-bold',
                          status === 'low' && 'text-destructive',
                          status === 'good' && 'text-success'
                        )}>
                          {row.totalAvailability}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Min Alert</p>
                        <p className="text-2xl font-bold text-muted-foreground">{row.totalMinAlert}</p>
                      </div>
                    </div>
                    <Separator className="my-3" />
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {row.branchesCount} {row.branchesCount === 1 ? 'branch' : 'branches'}
                      </span>
                      <span className="text-muted-foreground">
                        Value: {formatCurrency(row.totalAvailability * row.costPrice)}
                      </span>
                    </div>
                    {status === 'low' && (
                      <div className="mt-3 flex items-center gap-2 rounded-md bg-destructive/10 p-2 text-sm text-destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <span>Below minimum stock level</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )
            })
          )}
        </div>
      )}

      {/* Transactions View */}
      {activeView === 'transactions' && (
        <Card>
          <CardContent className="p-0">
            {paginatedInventory.length === 0 ? (
              <div className="flex h-40 items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <Boxes className="mx-auto mb-2 h-12 w-12" />
                  <p>No inventory records found</p>
                </div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Branch</TableHead>
                    <TableHead className="text-right">Availability</TableHead>
                    <TableHead className="text-right">Min Alert</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedInventory.map((item) => {
                    const status = getStockStatus(item.quantity, item.minQuantity)
                    const product = getProduct(item.productId)
                    return (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{getProductName(item.productId)}</p>
                            <p className="text-sm text-muted-foreground font-mono">
                              {getProductCode(item.productId)}
                            </p>
                            {product?.isSerialTracked && (
                              <Badge variant="outline" className="mt-1 text-xs">Serial Tracked</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{getBranchName(item.branchId)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {status === 'low' && (
                              <AlertTriangle className="h-4 w-4 text-destructive" />
                            )}
                            <span className={cn(
                              'font-medium',
                              status === 'low' && 'text-destructive',
                              status === 'good' && 'text-success'
                            )}>
                              {item.quantity}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">{item.minQuantity}</TableCell>
                        <TableCell>{getStockStatusBadge(status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenViewDialog(item)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenEditDialog(item)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(item)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
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

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingInventory ? 'Edit Inventory' : 'Add Stock'}
            </DialogTitle>
            <DialogDescription>
              {editingInventory
                ? 'Update the stock level for this item'
                : 'Add new stock to inventory. If the product already exists at this branch, the quantity will be added to existing stock.'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Branch Selection */}
            <div className="space-y-2">
              <Label htmlFor="branch">Branch *</Label>
              <Select
                value={formData.branchId}
                onValueChange={(value) => setFormData({ ...formData, branchId: value })}
                disabled={!!editingInventory}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select branch" />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id.toString()}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Product Selection */}
            <div className="space-y-2">
              <Label htmlFor="product">Product *</Label>
              <Select
                value={formData.productId}
                onValueChange={(value) => setFormData({ ...formData, productId: value })}
                disabled={!!editingInventory}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select product" />
                </SelectTrigger>
                <SelectContent>
                  <ScrollArea className="h-60">
                    {products.map((product) => (
                      <SelectItem key={product.id} value={product.id.toString()}>
                        <span className="font-mono text-muted-foreground mr-2">{product.code}</span>
                        {product.name}
                      </SelectItem>
                    ))}
                  </ScrollArea>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Stock Type */}
              <div className="space-y-2">
                <Label htmlFor="stockType">Stock Type</Label>
                <Select
                  value={formData.stockType}
                  onValueChange={(value) => setFormData({ ...formData, stockType: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Retail">Retail</SelectItem>
                    <SelectItem value="Wholesale">Wholesale</SelectItem>
                    <SelectItem value="Reserve">Reserve</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Unit */}
              <div className="space-y-2">
                <Label htmlFor="unit">Unit</Label>
                <Select
                  value={formData.unit}
                  onValueChange={(value) => setFormData({ ...formData, unit: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pcs">Pieces</SelectItem>
                    <SelectItem value="box">Box</SelectItem>
                    <SelectItem value="case">Case</SelectItem>
                    <SelectItem value="pack">Pack</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Availability */}
              <div className="space-y-2">
                <Label htmlFor="availability">
                  {editingInventory ? 'New Quantity' : 'Quantity to Add'} *
                </Label>
                <Input
                  id="availability"
                  type="number"
                  min="0"
                  value={formData.availability}
                  onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                />
              </div>

              {/* Min Stock Alert */}
              <div className="space-y-2">
                <Label htmlFor="minStockAlert">Min Stock Alert</Label>
                <Input
                  id="minStockAlert"
                  type="number"
                  min="0"
                  value={formData.minStockAlert}
                  onChange={(e) => setFormData({ ...formData, minStockAlert: e.target.value })}
                />
              </div>
            </div>

            {/* Cost Price Per Batch */}
            <div className="space-y-2">
              <Label htmlFor="costPricePerBatch">Cost Price Per Batch (Optional)</Label>
              <Input
                id="costPricePerBatch"
                type="number"
                step="0.01"
                min="0"
                value={formData.costPricePerBatch}
                onChange={(e) => setFormData({ ...formData, costPricePerBatch: e.target.value })}
                placeholder="0.00"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : editingInventory ? 'Update' : 'Add Stock'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Inventory Details
            </DialogTitle>
          </DialogHeader>

          {viewingInventory && (
            <div className="space-y-4">
              {/* Status Badge */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Status</span>
                {getStockStatusBadge(
                  getStockStatus(viewingInventory.quantity, viewingInventory.minQuantity)
                )}
              </div>

              <Separator />

              {/* Product Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Product Code</p>
                  <p className="font-mono font-medium">{getProductCode(viewingInventory.productId)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Product Name</p>
                  <p className="font-medium">{getProductName(viewingInventory.productId)}</p>
                </div>
              </div>

              {/* Branch Info */}
              <div>
                <p className="text-sm text-muted-foreground">Branch</p>
                <p className="font-medium">{getBranchName(viewingInventory.branchId)}</p>
              </div>

              <Separator />

              {/* Stock Levels */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg bg-muted p-4 text-center">
                  <p className="text-sm text-muted-foreground">Current Availability</p>
                  <p className={cn(
                    'text-3xl font-bold',
                    getStockStatus(viewingInventory.quantity, viewingInventory.minQuantity) === 'low' && 'text-destructive',
                    getStockStatus(viewingInventory.quantity, viewingInventory.minQuantity) === 'good' && 'text-success'
                  )}>
                    {viewingInventory.quantity}
                  </p>
                </div>
                <div className="rounded-lg bg-muted p-4 text-center">
                  <p className="text-sm text-muted-foreground">Min Stock Alert</p>
                  <p className="text-3xl font-bold text-muted-foreground">
                    {viewingInventory.minQuantity}
                  </p>
                </div>
              </div>

              {/* Additional Info */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Max Quantity</p>
                  <p>{viewingInventory.maxQuantity}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Last Restock</p>
                  <p>{viewingInventory.lastRestockDate ? formatDateTime(viewingInventory.lastRestockDate) : 'N/A'}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Last Updated</p>
                <p className="text-sm">{formatDateTime(viewingInventory.updatedAt)}</p>
              </div>

              {/* Low Stock Alert */}
              {viewingInventory.quantity <= viewingInventory.minQuantity && (
                <div className="flex items-center gap-3 rounded-lg bg-destructive/10 p-4 text-destructive">
                  <AlertTriangle className="h-5 w-5" />
                  <div>
                    <p className="font-medium">Low Stock Alert</p>
                    <p className="text-sm">
                      Current stock ({viewingInventory.quantity}) is at or below the minimum alert level ({viewingInventory.minQuantity}).
                      Consider restocking this item.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
            {viewingInventory && (
              <Button onClick={() => {
                setIsViewDialogOpen(false)
                handleOpenEditDialog(viewingInventory)
              }}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
