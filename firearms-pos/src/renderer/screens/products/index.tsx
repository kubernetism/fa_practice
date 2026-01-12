import React, { useState, useEffect, useCallback } from 'react'
import { Plus, Search, Edit, Trash2, Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
    setShowDialog(true)
  }

  // Open dialog for editing
  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Products</h1>
          <p className="text-muted-foreground">
            Manage your product catalog • Stock levels for {currentBranch?.name || 'selected branch'}
          </p>
        </div>
        <Button onClick={handleNewProduct}>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                className="pl-9"
                onChange={(e) => debouncedSearch(e.target.value)}
              />
            </div>
            <Select value={selectedCategory} onValueChange={(value) => {
              setSelectedCategory(value === 'all' ? '' : value)
              setPage(1)
            }}>
              <SelectTrigger className="w-48">
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
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : products.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center text-muted-foreground">
              <Package className="mb-2 h-12 w-12" />
              <p>No products found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead className="text-right">Cost</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-mono">{product.code}</TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>
                      {categories.find((c) => c.id === product.categoryId)?.name || '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={product.stock === 0 ? 'text-destructive' : product.stock && product.stock < product.reorderLevel ? 'text-warning' : ''}>
                        {product.stock ?? 0}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(product.costPrice)}</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(product.sellingPrice)}
                    </TableCell>
                    <TableCell>
                      {product.isSerialTracked && (
                        <Badge variant="outline">Serial Tracked</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditProduct(product)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteProduct(product)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
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
