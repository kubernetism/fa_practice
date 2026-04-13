import React, { useState, useEffect, useCallback } from 'react'
import { Plus, Search, Edit, Trash2, Package, ChevronLeft, ChevronRight, X, Filter, ArrowUpDown, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { Label } from '@/components/ui/label'
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
import { formatCurrency, debounce } from '@/lib/utils'
import type { Product, Category } from '@shared/types'
import { useBranch } from '@/contexts/branch-context'

interface ProductWithInventory extends Product {
  stock?: number
}

export function ProductsScreen() {
  const { currentBranch } = useBranch()
  const [products, setProducts] = useState<ProductWithInventory[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [showDialog, setShowDialog] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    categoryId: '',
    brand: '',
    costPrice: '',
    sellingPrice: '',
    reorderLevel: '10',
    unit: 'pcs',
    isSerialTracked: false,
    isTaxable: true,
    taxRate: '8.5',
    barcode: '',
  })
  const [isSaving, setIsSaving] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Fetch products with inventory for current branch
  const fetchProducts = useCallback(async () => {
    if (!currentBranch) return

    setIsLoading(true)
    try {
      // Fetch products and inventory in parallel
      const [productsResult, inventoryResult] = await Promise.all([
        window.api.products.getAll({
          page,
          limit: 20,
          search: searchQuery,
          categoryId: selectedCategory ? parseInt(selectedCategory) : undefined,
          isActive: true,
        }),
        window.api.inventory.getByBranch(currentBranch.id)
      ])

      if (productsResult.success && productsResult.data) {
        // Create a map of productId -> quantity for quick lookup
        const inventoryMap = new Map<number, number>()
        if (inventoryResult.success && inventoryResult.data) {
          inventoryResult.data.forEach((item: any) => {
            inventoryMap.set(item.inventory.productId, item.inventory.quantity)
          })
        }

        // Merge products with inventory data
        const productsWithInventory = productsResult.data.map((product: Product) => ({
          ...product,
          stock: inventoryMap.get(product.id) || 0
        }))

        setProducts(productsWithInventory)
        setTotalPages(productsResult.totalPages || 1)
      }
    } catch (error) {
      console.error('Failed to fetch products:', error)
    } finally {
      setIsLoading(false)
    }
  }, [page, searchQuery, selectedCategory, currentBranch])

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const result = await window.api.categories.getAll()
      if (result.success && result.data) {
        setCategories(result.data)
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }, [])

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [fetchProducts, fetchCategories])

  // Handle search with debounce
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      setSearchQuery(query)
      setPage(1)
    }, 300),
    []
  )

  // Open dialog for new product
  const handleNewProduct = () => {
    setEditingProduct(null)
    setFormData({
      code: '',
      name: '',
      description: '',
      categoryId: '',
      brand: '',
      costPrice: '',
      sellingPrice: '',
      reorderLevel: '10',
      unit: 'pcs',
      isSerialTracked: false,
      isTaxable: true,
      taxRate: '8.5',
      barcode: '',
    })
    fetchCategories()
    setShowDialog(true)
  }

  // Open dialog for editing
  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
    fetchCategories()
    setFormData({
      code: product.code,
      name: product.name,
      description: product.description || '',
      categoryId: product.categoryId?.toString() || '',
      brand: product.brand || '',
      costPrice: product.costPrice.toString(),
      sellingPrice: product.sellingPrice.toString(),
      reorderLevel: product.reorderLevel.toString(),
      unit: product.unit,
      isSerialTracked: product.isSerialTracked,
      isTaxable: product.isTaxable,
      taxRate: product.taxRate.toString(),
      barcode: product.barcode || '',
    })
    setShowDialog(true)
  }

  // Save product
  const handleSaveProduct = async () => {
    setIsSaving(true)
    try {
      const productData = {
        code: formData.code,
        name: formData.name,
        description: formData.description || null,
        categoryId: formData.categoryId ? parseInt(formData.categoryId) : null,
        brand: formData.brand || null,
        costPrice: parseFloat(formData.costPrice),
        sellingPrice: parseFloat(formData.sellingPrice),
        reorderLevel: parseInt(formData.reorderLevel),
        unit: formData.unit,
        isSerialTracked: formData.isSerialTracked,
        isTaxable: formData.isTaxable,
        taxRate: parseFloat(formData.taxRate),
        barcode: formData.barcode || null,
      }

      let result
      if (editingProduct) {
        result = await window.api.products.update(editingProduct.id, productData)
      } else {
        result = await window.api.products.create(productData)
      }

      if (result.success) {
        setShowDialog(false)
        fetchProducts()
      } else {
        alert(result.message || 'Failed to save product')
      }
    } catch (error) {
      console.error('Save product error:', error)
      alert('An error occurred while saving')
    } finally {
      setIsSaving(false)
    }
  }

  // Delete product
  const handleDeleteProduct = async (product: Product) => {
    if (!confirm(`Are you sure you want to deactivate "${product.name}"?`)) return

    try {
      const result = await window.api.products.delete(product.id)
      if (result.success) {
        fetchProducts()
      } else {
        alert(result.message || 'Failed to delete product')
      }
    } catch (error) {
      console.error('Delete product error:', error)
    }
  }

  // Computed stats
  const totalProducts = products.length
  const lowStockCount = products.filter(p => p.stock !== undefined && p.stock > 0 && p.stock < p.reorderLevel).length
  const outOfStockCount = products.filter(p => p.stock === 0).length

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* ── Header: Title + Stats + Action ── */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Products</h1>
            <p className="text-xs text-muted-foreground/70">
              {currentBranch?.name || 'All branches'} inventory
            </p>
          </div>
          {/* Inline stats pills */}
          {!isLoading && totalProducts > 0 && (
            <div className="flex items-center gap-1.5 ml-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-muted/60 px-2.5 py-0.5 text-[10px] font-medium tabular-nums text-muted-foreground">
                {totalProducts} total
              </span>
              {lowStockCount > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-warning/10 px-2.5 py-0.5 text-[10px] font-medium tabular-nums text-warning">
                  <AlertTriangle className="h-2.5 w-2.5" />
                  {lowStockCount} low
                </span>
              )}
              {outOfStockCount > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2.5 py-0.5 text-[10px] font-medium tabular-nums text-destructive">
                  {outOfStockCount} out
                </span>
              )}
            </div>
          )}
        </div>
        <Button size="sm" onClick={handleNewProduct} className="h-8 px-3 text-xs font-semibold gap-1.5">
          <Plus className="h-3.5 w-3.5" />
          Add Product
        </Button>
      </div>

      {/* ── Toolbar: Search + Category Filter ── */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50" />
          <Input
            placeholder="Search by name, code, barcode..."
            className="h-8 pl-8 pr-8 text-xs bg-card border-border/50 focus:border-primary/40 focus:ring-1 focus:ring-primary/20 placeholder:text-muted-foreground/40"
            onChange={(e) => debouncedSearch(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => { setSearchQuery(''); setPage(1) }}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-muted-foreground/40 hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
        <Select value={selectedCategory} onValueChange={(value) => {
          setSelectedCategory(value === 'all' ? '' : value)
          setPage(1)
        }}>
          <SelectTrigger className="h-8 w-44 text-xs border-border/50 bg-card">
            <Filter className="h-3 w-3 mr-1.5 text-muted-foreground/50" />
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.filter(c => c.isActive).map((category) => (
              <SelectItem key={category.id} value={category.id.toString()}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* ── Table ── */}
      <div className="flex-1 min-h-0 rounded-lg border border-border/50 bg-card/40 overflow-hidden">
        {isLoading ? (
          <div className="flex h-full items-center justify-center gap-2">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary/50 border-t-transparent" />
            <span className="text-xs text-muted-foreground/50">Loading products...</span>
          </div>
        ) : products.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-muted-foreground/50 gap-2">
            <Package className="h-8 w-8 opacity-20" />
            <p className="text-xs">{searchQuery ? `No results for "${searchQuery}"` : 'No products found'}</p>
            {!searchQuery && (
              <Button variant="link" size="sm" onClick={handleNewProduct} className="text-xs h-auto p-0 text-primary/70">
                Add your first product
              </Button>
            )}
          </div>
        ) : (
          <div className="h-full overflow-auto">
            <TooltipProvider delayDuration={300}>
              <Table>
                <TableHeader>
                  <TableRow className="border-border/40 bg-muted/30 hover:bg-muted/30">
                    <TableHead className="h-8 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 w-[100px]">Code</TableHead>
                    <TableHead className="h-8 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">Product</TableHead>
                    <TableHead className="h-8 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 w-[120px]">Category</TableHead>
                    <TableHead className="h-8 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 text-right w-[70px]">Stock</TableHead>
                    <TableHead className="h-8 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 text-right w-[90px]">Cost</TableHead>
                    <TableHead className="h-8 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 text-right w-[90px]">Price</TableHead>
                    <TableHead className="h-8 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 w-[80px]">Flags</TableHead>
                    <TableHead className="h-8 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 text-right w-[70px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => {
                    const isOutOfStock = product.stock === 0
                    const isLowStock = !isOutOfStock && product.stock !== undefined && product.stock < product.reorderLevel

                    return (
                      <TableRow
                        key={product.id}
                        className="group border-border/30 hover:bg-muted/20 transition-colors h-9 cursor-pointer"
                        onClick={() => handleEditProduct(product)}
                      >
                        <TableCell className="py-1.5 px-3">
                          <span className="font-mono text-[11px] text-muted-foreground/70">{product.code}</span>
                        </TableCell>
                        <TableCell className="py-1.5 px-3">
                          <div className="flex flex-col">
                            <span className="text-xs font-medium leading-tight truncate max-w-[240px]">{product.name}</span>
                            {product.brand && (
                              <span className="text-[10px] text-muted-foreground/40 leading-tight">{product.brand}</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="py-1.5 px-3">
                          <span className="text-[11px] text-muted-foreground/60 truncate">
                            {categories.find((c) => c.id === product.categoryId)?.name || '—'}
                          </span>
                        </TableCell>
                        <TableCell className="py-1.5 px-3 text-right">
                          <span className={`text-xs font-medium tabular-nums ${
                            isOutOfStock ? 'text-destructive' : isLowStock ? 'text-warning' : 'text-foreground/80'
                          }`}>
                            {product.stock ?? 0}
                          </span>
                          {isLowStock && (
                            <AlertTriangle className="inline-block ml-1 h-2.5 w-2.5 text-warning/70" />
                          )}
                        </TableCell>
                        <TableCell className="py-1.5 px-3 text-right">
                          <span className="text-[11px] tabular-nums text-muted-foreground/50">{formatCurrency(product.costPrice)}</span>
                        </TableCell>
                        <TableCell className="py-1.5 px-3 text-right">
                          <span className="text-xs font-semibold tabular-nums">{formatCurrency(product.sellingPrice)}</span>
                        </TableCell>
                        <TableCell className="py-1.5 px-3">
                          <div className="flex items-center gap-1">
                            {product.isSerialTracked && (
                              <Badge variant="outline" className="h-4 px-1 text-[9px] font-semibold border-info/30 text-info bg-info/5">
                                SN
                              </Badge>
                            )}
                            {product.isTaxable && (
                              <Badge variant="outline" className="h-4 px-1 text-[9px] font-medium border-border/40 text-muted-foreground/50 bg-transparent">
                                TAX
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="py-1.5 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => handleEditProduct(product)}
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="bottom" className="text-[10px]">Edit</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 hover:bg-destructive/10 hover:text-destructive"
                                  onClick={() => handleDeleteProduct(product)}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="bottom" className="text-[10px]">Deactivate</TooltipContent>
                            </Tooltip>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </TooltipProvider>
          </div>
        )}
      </div>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between shrink-0 px-1">
          <span className="text-[10px] text-muted-foreground/50 tabular-nums">
            Page {page} of {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 border-border/40"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 border-border/40"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Product Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Edit Product' : 'New Product'}</DialogTitle>
            <DialogDescription>
              {editingProduct ? 'Update product information' : 'Add a new product to your catalog'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">Product Code *</Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="SKU-001"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="barcode">Barcode</Label>
                <Input
                  id="barcode"
                  value={formData.barcode}
                  onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                  placeholder="123456789"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter product name"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) => setFormData({ ...formData, categoryId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.filter(c => c.isActive).map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="brand">Brand</Label>
                <Input
                  id="brand"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  placeholder="Brand name"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="costPrice">Cost Price *</Label>
                <Input
                  id="costPrice"
                  type="number"
                  step="0.01"
                  value={formData.costPrice}
                  onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sellingPrice">Selling Price *</Label>
                <Input
                  id="sellingPrice"
                  type="number"
                  step="0.01"
                  value={formData.sellingPrice}
                  onChange={(e) => setFormData({ ...formData, sellingPrice: e.target.value })}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="reorderLevel">Reorder Level</Label>
                <Input
                  id="reorderLevel"
                  type="number"
                  value={formData.reorderLevel}
                  onChange={(e) => setFormData({ ...formData, reorderLevel: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Unit</Label>
                <Input
                  id="unit"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  placeholder="pcs"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="taxRate">Tax Rate (%)</Label>
                <Input
                  id="taxRate"
                  type="number"
                  step="0.01"
                  value={formData.taxRate}
                  onChange={(e) => setFormData({ ...formData, taxRate: e.target.value })}
                />
              </div>
            </div>

            <div className="flex gap-6">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isSerialTracked}
                  onChange={(e) => setFormData({ ...formData, isSerialTracked: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <span className="text-sm">Serial Number Tracking (for firearms)</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isTaxable}
                  onChange={(e) => setFormData({ ...formData, isTaxable: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <span className="text-sm">Taxable</span>
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveProduct}
              disabled={isSaving || !formData.code || !formData.name || !formData.costPrice || !formData.sellingPrice}
            >
              {isSaving ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Product'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
