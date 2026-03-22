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
  ClipboardList,
  X,
} from 'lucide-react'
import { CycleCountManager } from '@/components/cycle-count-manager'
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
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
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
  fundingSource: 'owner_capital' | 'accounts_payable' | 'surplus'
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
  fundingSource: 'owner_capital',
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
  const [activeView, setActiveView] = useState<'summary' | 'transactions' | 'cycle-counts'>('summary')
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

  // O(1) lookup maps — rebuilt only when source arrays change
  const productMap = useMemo(
    () => new Map(products.map(p => [p.id, p])),
    [products]
  )
  const branchMap = useMemo(
    () => new Map(branches.map(b => [b.id, b])),
    [branches]
  )

  // Helper functions backed by maps
  const getProductName = useCallback(
    (productId: number): string => productMap.get(productId)?.name ?? 'Unknown Product',
    [productMap]
  )
  const getProductCode = useCallback(
    (productId: number): string => productMap.get(productId)?.code ?? 'N/A',
    [productMap]
  )
  const getBranchName = useCallback(
    (branchId: number): string => branchMap.get(branchId)?.name ?? 'Unknown Branch',
    [branchMap]
  )
  const getProduct = useCallback(
    (productId: number): Product | undefined => productMap.get(productId),
    [productMap]
  )

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

  // Filtered inventory — deps use stable memoized helpers, not raw arrays
  const filteredInventory = useMemo(() => {
    const search = searchTerm.toLowerCase()
    if (!search) return inventory
    return inventory.filter(item => {
      return getProductName(item.productId).toLowerCase().includes(search) ||
             getProductCode(item.productId).toLowerCase().includes(search) ||
             getBranchName(item.branchId).toLowerCase().includes(search)
    })
  }, [inventory, searchTerm, getProductName, getProductCode, getBranchName])

  // Summary rows - aggregate by product
  const summaryRows = useMemo((): SummaryRow[] => {
    const aggregateMap = new Map<number, SummaryRow>()

    filteredInventory.forEach(item => {
      const product = getProduct(item.productId)
      const existing = aggregateMap.get(item.productId)

      if (existing) {
        existing.totalAvailability += item.quantity
        existing.totalMinAlert += item.minQuantity
        existing.branchesCount += 1
      } else {
        aggregateMap.set(item.productId, {
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

    return Array.from(aggregateMap.values()).sort((a, b) => {
      // Sort by low stock first
      const aIsLow = a.totalAvailability <= a.totalMinAlert
      const bIsLow = b.totalAvailability <= b.totalMinAlert
      if (aIsLow && !bIsLow) return -1
      if (!aIsLow && bIsLow) return 1
      return a.productName.localeCompare(b.productName)
    })
  }, [filteredInventory, getProduct])

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

  // Computed stats
  const lowStockCount = summaryRows.filter(
    row => row.totalAvailability <= row.totalMinAlert
  ).length
  const totalUnits = summaryRows.reduce((sum, row) => sum + row.totalAvailability, 0)
  const totalStockValue = summaryRows.reduce((sum, row) => sum + row.totalAvailability * row.costPrice, 0)

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
          fundingSource: formData.fundingSource,
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
    <TooltipProvider>
      <div className="flex flex-col gap-3 h-full">

        {/* ── Header: Title + Stats pills + Actions ── */}
        <div className="flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-xl font-semibold tracking-tight">Inventory</h1>
              <p className="text-xs text-muted-foreground/70">Stock levels across all branches</p>
            </div>

            {/* Inline stat pills */}
            {summaryRows.length > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1 rounded-full bg-muted/60 px-2.5 py-0.5 text-[10px] font-medium tabular-nums text-muted-foreground">
                  <Package className="h-2.5 w-2.5" />
                  {summaryRows.length} products
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-muted/60 px-2.5 py-0.5 text-[10px] font-medium tabular-nums text-muted-foreground">
                  <Boxes className="h-2.5 w-2.5" />
                  {totalUnits.toLocaleString()} units
                </span>
                {lowStockCount > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2.5 py-0.5 text-[10px] font-medium tabular-nums text-destructive">
                    <AlertTriangle className="h-2.5 w-2.5" />
                    {lowStockCount} low stock
                  </span>
                )}
                <span className="inline-flex items-center gap-1 rounded-full bg-muted/60 px-2.5 py-0.5 text-[10px] font-medium tabular-nums text-muted-foreground">
                  <BarChart3 className="h-2.5 w-2.5" />
                  {formatCurrency(totalStockValue)}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" className="h-8" onClick={() => fetchInventory()}>
                  <RefreshCw className="h-3.5 w-3.5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Refresh inventory</TooltipContent>
            </Tooltip>
            <Button size="sm" className="h-8" onClick={handleOpenAddDialog}>
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Add Stock
            </Button>
          </div>
        </div>

        {/* ── Filter bar ── */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search product, code, branch..."
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
                aria-label="Clear search"
                onClick={() => { setSearchTerm(''); setCurrentPage(1) }}
                className="absolute right-2 top-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Branch filter */}
          <Select
            value={selectedBranchFilter}
            onValueChange={(value) => {
              setSelectedBranchFilter(value)
              setCurrentPage(1)
            }}
          >
            <SelectTrigger className="h-8 w-44 text-sm">
              <Building2 className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
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

          {/* Spacer */}
          <div className="flex-1" />

          {/* View toggle */}
          <div className="flex items-center gap-1 rounded-md border bg-muted/30 p-0.5">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={activeView === 'summary' ? 'secondary' : 'ghost'}
                  size="sm"
                  className="h-7 px-2.5 text-xs"
                  onClick={() => { setActiveView('summary'); setCurrentPage(1) }}
                >
                  <BarChart3 className="mr-1 h-3.5 w-3.5" />
                  Summary
                </Button>
              </TooltipTrigger>
              <TooltipContent>Product-level summary</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={activeView === 'transactions' ? 'secondary' : 'ghost'}
                  size="sm"
                  className="h-7 px-2.5 text-xs"
                  onClick={() => { setActiveView('transactions'); setCurrentPage(1) }}
                >
                  <List className="mr-1 h-3.5 w-3.5" />
                  Details
                </Button>
              </TooltipTrigger>
              <TooltipContent>Per-branch stock detail</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant={activeView === 'cycle-counts' ? 'secondary' : 'ghost'}
                  size="sm"
                  className="h-7 px-2.5 text-xs"
                  onClick={() => { setActiveView('cycle-counts'); setCurrentPage(1) }}
                >
                  <ClipboardList className="mr-1 h-3.5 w-3.5" />
                  Cycle Counts
                </Button>
              </TooltipTrigger>
              <TooltipContent>Physical count sessions</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* ── Cycle Counts View ── */}
        {activeView === 'cycle-counts' && <CycleCountManager />}

        {/* ── Summary View ── */}
        {activeView === 'summary' && (
          <div className="rounded-md border overflow-hidden flex-1 min-h-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground h-8 py-0">
                    Product
                  </TableHead>
                  <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground h-8 py-0">
                    Code
                  </TableHead>
                  <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground h-8 py-0 text-right">
                    Stock
                  </TableHead>
                  <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground h-8 py-0 text-right">
                    Min Alert
                  </TableHead>
                  <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground h-8 py-0 text-right">
                    Cost Price
                  </TableHead>
                  <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground h-8 py-0 text-right">
                    Sell Price
                  </TableHead>
                  <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground h-8 py-0 text-right">
                    Stock Value
                  </TableHead>
                  <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground h-8 py-0">
                    Branches
                  </TableHead>
                  <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground h-8 py-0 w-[60px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedSummary.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="h-32 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Boxes className="h-8 w-8 opacity-40" />
                        <p className="text-sm">No inventory records found</p>
                        {searchTerm && (
                          <button
                            onClick={() => setSearchTerm('')}
                            className="text-xs text-primary hover:underline"
                          >
                            Clear search
                          </button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedSummary.map((row) => {
                    const status = getStockStatus(row.totalAvailability, row.totalMinAlert)
                    return (
                      <TableRow key={row.productId} className="group h-9 py-0">
                        <TableCell className="py-1.5 font-medium text-sm max-w-[200px]">
                          <div className="flex items-center gap-1.5 truncate">
                            {status === 'low' && (
                              <AlertTriangle className="h-3.5 w-3.5 text-destructive flex-shrink-0" />
                            )}
                            <span className="truncate">{row.productName}</span>
                            {row.isSerialTracked && (
                              <Badge
                                variant="outline"
                                className="text-[9px] px-1 py-0 h-4 font-normal flex-shrink-0"
                              >
                                S/N
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="py-1.5">
                          <span className="font-mono text-xs text-muted-foreground">
                            {row.productCode}
                          </span>
                        </TableCell>
                        <TableCell className="py-1.5 text-right">
                          <span
                            className={cn(
                              'text-sm font-semibold tabular-nums',
                              status === 'low' && 'text-destructive',
                              status === 'good' && 'text-success',
                              status === 'normal' && 'text-warning'
                            )}
                          >
                            {row.totalAvailability.toLocaleString()}
                          </span>
                        </TableCell>
                        <TableCell className="py-1.5 text-right text-sm text-muted-foreground tabular-nums">
                          {row.totalMinAlert}
                        </TableCell>
                        <TableCell className="py-1.5 text-right text-sm tabular-nums">
                          {formatCurrency(row.costPrice)}
                        </TableCell>
                        <TableCell className="py-1.5 text-right text-sm tabular-nums">
                          {formatCurrency(row.sellingPrice)}
                        </TableCell>
                        <TableCell className="py-1.5 text-right text-sm font-medium tabular-nums">
                          {formatCurrency(row.totalAvailability * row.costPrice)}
                        </TableCell>
                        <TableCell className="py-1.5">
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                            <Building2 className="h-3 w-3" />
                            {row.branchesCount}
                          </span>
                        </TableCell>
                        {/* Hover-reveal actions */}
                        <TableCell className="py-1.5 text-right w-[60px]">
                          <div className="flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => {
                                    // Find the first matching inventory item for this product
                                    const item = filteredInventory.find(
                                      i => i.productId === row.productId
                                    )
                                    if (item) handleOpenViewDialog(item)
                                  }}
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>View details</TooltipContent>
                            </Tooltip>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {/* ── Transactions (Details) View ── */}
        {activeView === 'transactions' && (
          <div className="rounded-md border overflow-hidden flex-1 min-h-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground h-8 py-0">
                    Product
                  </TableHead>
                  <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground h-8 py-0">
                    Branch
                  </TableHead>
                  <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground h-8 py-0 text-right">
                    Stock
                  </TableHead>
                  <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground h-8 py-0 text-right">
                    Min Alert
                  </TableHead>
                  <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground h-8 py-0 text-right">
                    Cost Price
                  </TableHead>
                  <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground h-8 py-0 text-right">
                    Sell Price
                  </TableHead>
                  <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground h-8 py-0 text-right">
                    Cost Value
                  </TableHead>
                  <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground h-8 py-0">
                    Status
                  </TableHead>
                  <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground h-8 py-0 w-[80px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedInventory.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="h-32 text-center">
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Boxes className="h-8 w-8 opacity-40" />
                        <p className="text-sm">No inventory records found</p>
                        {searchTerm && (
                          <button
                            onClick={() => setSearchTerm('')}
                            className="text-xs text-primary hover:underline"
                          >
                            Clear search
                          </button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedInventory.map((item) => {
                    const status = getStockStatus(item.quantity, item.minQuantity)
                    const product = getProduct(item.productId)
                    const costValue = item.quantity * (product?.costPrice || 0)
                    return (
                      <TableRow key={item.id} className="group h-9 py-0">
                        <TableCell className="py-1.5 max-w-[180px]">
                          <div className="flex items-center gap-1.5 truncate">
                            {status === 'low' && (
                              <AlertTriangle className="h-3.5 w-3.5 text-destructive flex-shrink-0" />
                            )}
                            <div className="min-w-0">
                              <p className="font-medium text-sm truncate leading-none">
                                {getProductName(item.productId)}
                              </p>
                              <p className="font-mono text-[10px] text-muted-foreground leading-none mt-0.5">
                                {getProductCode(item.productId)}
                              </p>
                            </div>
                            {product?.isSerialTracked && (
                              <Badge
                                variant="outline"
                                className="text-[9px] px-1 py-0 h-4 font-normal flex-shrink-0"
                              >
                                S/N
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="py-1.5 text-sm text-muted-foreground">
                          {getBranchName(item.branchId)}
                        </TableCell>
                        <TableCell className="py-1.5 text-right">
                          <span
                            className={cn(
                              'text-sm font-semibold tabular-nums',
                              status === 'low' && 'text-destructive',
                              status === 'good' && 'text-success',
                              status === 'normal' && 'text-warning'
                            )}
                          >
                            {item.quantity.toLocaleString()}
                          </span>
                        </TableCell>
                        <TableCell className="py-1.5 text-right text-sm text-muted-foreground tabular-nums">
                          {item.minQuantity}
                        </TableCell>
                        <TableCell className="py-1.5 text-right text-sm tabular-nums">
                          {formatCurrency(product?.costPrice || 0)}
                        </TableCell>
                        <TableCell className="py-1.5 text-right text-sm tabular-nums">
                          {formatCurrency(product?.sellingPrice || 0)}
                        </TableCell>
                        <TableCell className="py-1.5 text-right text-sm font-medium tabular-nums">
                          {formatCurrency(costValue)}
                        </TableCell>
                        <TableCell className="py-1.5">
                          {getStockStatusBadge(status)}
                        </TableCell>
                        {/* Hover-reveal actions */}
                        <TableCell className="py-1.5 text-right w-[80px]">
                          <div className="flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => handleOpenViewDialog(item)}
                                >
                                  <Eye className="h-3.5 w-3.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>View details</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => handleOpenEditDialog(item)}
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Edit stock</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => handleDelete(item)}
                                >
                                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Remove record</TooltipContent>
                            </Tooltip>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {/* ── Pagination ── */}
        {totalPages > 1 && activeView !== 'cycle-counts' && (
          <div className="flex items-center justify-center gap-2 shrink-0 py-1">
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <span className="text-xs text-muted-foreground tabular-nums">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}

        {/* ── Add/Edit Dialog ── */}
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

              {/* Funding Source — shown only when adding new stock */}
              {!editingInventory && (
                <div className="space-y-2">
                  <Label htmlFor="fundingSource">Funding Source</Label>
                  <select
                    id="fundingSource"
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    value={formData.fundingSource}
                    onChange={(e) => setFormData({ ...formData, fundingSource: e.target.value as FormData['fundingSource'] })}
                  >
                    <option value="owner_capital">Owner Capital</option>
                    <option value="accounts_payable">Supplier Credit (Payable)</option>
                    <option value="surplus">Surplus Found (Count Adjustment)</option>
                  </select>
                  <p className="text-xs text-muted-foreground">
                    Determines how this stock addition is recorded in accounting
                  </p>
                </div>
              )}
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

        {/* ── View Details Dialog ── */}
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
    </TooltipProvider>
  )
}
