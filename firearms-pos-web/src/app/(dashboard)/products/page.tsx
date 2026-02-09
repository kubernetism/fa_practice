'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Package,
  Plus,
  Filter,
  Search,
  Edit2,
  Trash2,
  Barcode,
  Tag,
  ToggleRight,
  ShieldCheck,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getProducts, getProductSummary, getCategories, createProduct } from '@/actions/products'

type Product = {
  id: number
  code: string
  name: string
  categoryName: string | null
  brand: string | null
  costPrice: string
  sellingPrice: string
  reorderLevel: number
  unit: string
  isSerialTracked: boolean
  isTaxable: boolean
  taxRate: string
  barcode: string | null
  isActive: boolean
}

type Category = {
  id: number
  name: string
}

export default function ProductsPage() {
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [summary, setSummary] = useState({ totalProducts: 0, activeCount: 0, serialTrackedCount: 0 })
  const [loading, setLoading] = useState(true)

  // Form state
  const [formCode, setFormCode] = useState('')
  const [formName, setFormName] = useState('')
  const [formBarcode, setFormBarcode] = useState('')
  const [formCategoryId, setFormCategoryId] = useState('')
  const [formBrand, setFormBrand] = useState('')
  const [formCostPrice, setFormCostPrice] = useState('')
  const [formSellingPrice, setFormSellingPrice] = useState('')
  const [formReorderLevel, setFormReorderLevel] = useState('10')
  const [formUnit, setFormUnit] = useState('pcs')
  const [formTaxRate, setFormTaxRate] = useState('16')
  const [formDescription, setFormDescription] = useState('')
  const [formSerialTracked, setFormSerialTracked] = useState(false)
  const [formTaxable, setFormTaxable] = useState(true)
  const [saving, setSaving] = useState(false)

  const loadData = useCallback(async () => {
    setLoading(true)
    const [productsResult, summaryResult, categoriesResult] = await Promise.all([
      getProducts({ search: search || undefined }),
      getProductSummary(),
      getCategories(),
    ])

    if (productsResult.success) {
      setProducts(
        productsResult.data.map((d: any) => ({
          ...d.product,
          categoryName: d.categoryName,
        }))
      )
    }
    if (summaryResult.success) setSummary(summaryResult.data as any)
    if (categoriesResult.success) setCategories(categoriesResult.data as any)
    setLoading(false)
  }, [search])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const result = await createProduct({
      code: formCode,
      name: formName,
      barcode: formBarcode || undefined,
      categoryId: formCategoryId ? Number(formCategoryId) : undefined,
      brand: formBrand || undefined,
      costPrice: Number(formCostPrice),
      sellingPrice: Number(formSellingPrice),
      reorderLevel: Number(formReorderLevel) || 10,
      unit: formUnit,
      taxRate: Number(formTaxRate) || 0,
      isSerialTracked: formSerialTracked,
      isTaxable: formTaxable,
    })
    setSaving(false)
    if (result.success) {
      setDialogOpen(false)
      setFormCode(''); setFormName(''); setFormBarcode(''); setFormCategoryId(''); setFormBrand('')
      setFormCostPrice(''); setFormSellingPrice(''); setFormReorderLevel('10'); setFormUnit('pcs')
      setFormTaxRate('16'); setFormDescription(''); setFormSerialTracked(false); setFormTaxable(true)
      loadData()
    }
  }

  const filtered = products.filter((p) => {
    if (filterCategory !== 'all' && p.categoryName !== filterCategory) return false
    if (filterStatus === 'active' && !p.isActive) return false
    if (filterStatus === 'inactive' && p.isActive) return false
    return true
  })

  const summaryCards = [
    { title: 'Total Products', value: String(summary.totalProducts), icon: Package, accent: 'text-primary' },
    { title: 'Active', value: String(summary.activeCount), icon: ToggleRight, accent: 'text-success' },
    { title: 'Serial Tracked', value: String(summary.serialTrackedCount), icon: ShieldCheck, accent: 'text-blue-400' },
    { title: 'Categories', value: String(categories.length), icon: Tag, accent: 'text-muted-foreground' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Products</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your product catalog, pricing, and serial tracking</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="brass-glow">
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
            </DialogHeader>
            <form className="space-y-4 mt-4" onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Product Code *</Label>
                  <Input placeholder="e.g. P-001" value={formCode} onChange={(e) => setFormCode(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Barcode</Label>
                  <Input placeholder="Scan or enter barcode" value={formBarcode} onChange={(e) => setFormBarcode(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Product Name *</Label>
                <Input placeholder="Product name" value={formName} onChange={(e) => setFormName(e.target.value)} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={formCategoryId} onValueChange={setFormCategoryId}>
                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Brand</Label>
                  <Input placeholder="Brand name" value={formBrand} onChange={(e) => setFormBrand(e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Cost Price (Rs.) *</Label>
                  <Input type="number" placeholder="0.00" value={formCostPrice} onChange={(e) => setFormCostPrice(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Selling Price (Rs.) *</Label>
                  <Input type="number" placeholder="0.00" value={formSellingPrice} onChange={(e) => setFormSellingPrice(e.target.value)} required />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Reorder Level</Label>
                  <Input type="number" placeholder="10" value={formReorderLevel} onChange={(e) => setFormReorderLevel(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Unit</Label>
                  <Select value={formUnit} onValueChange={setFormUnit}>
                    <SelectTrigger><SelectValue placeholder="pcs" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pcs">Pieces</SelectItem>
                      <SelectItem value="box">Box</SelectItem>
                      <SelectItem value="kg">Kg</SelectItem>
                      <SelectItem value="set">Set</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tax Rate (%)</Label>
                  <Input type="number" placeholder="16" value={formTaxRate} onChange={(e) => setFormTaxRate(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea placeholder="Optional description" rows={2} value={formDescription} onChange={(e) => setFormDescription(e.target.value)} />
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Switch id="serial-tracked" checked={formSerialTracked} onCheckedChange={setFormSerialTracked} />
                  <Label htmlFor="serial-tracked" className="text-sm">Serial Tracked</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch id="taxable" checked={formTaxable} onCheckedChange={setFormTaxable} />
                  <Label htmlFor="taxable" className="text-sm">Taxable</Label>
                </div>
              </div>
              <Button type="submit" className="w-full brass-glow" disabled={saving}>
                {saving ? 'Saving...' : 'Save Product'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card) => (
          <Card key={card.title} className="card-tactical">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{card.title}</p>
                  <p className="text-2xl font-bold tracking-tight">{card.value}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <card.icon className={`w-5 h-5 ${card.accent}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search & Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, code, or barcode..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead className="text-right">Cost</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Tracking</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">Loading...</TableCell>
                </TableRow>
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                    No products found
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-mono text-xs text-muted-foreground">{product.code}</TableCell>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium">{product.name}</p>
                        {product.barcode && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <Barcode className="w-3 h-3 text-muted-foreground" />
                            <span className="text-[10px] text-muted-foreground font-mono">{product.barcode}</span>
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px]">{product.categoryName || 'N/A'}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{product.brand || '-'}</TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">
                      Rs. {Number(product.costPrice).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right text-sm font-semibold">
                      Rs. {Number(product.sellingPrice).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground capitalize">{product.unit}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {product.isSerialTracked && (
                          <Badge variant="outline" className="text-[10px] bg-blue-500/10 text-blue-400 border-blue-500/20">Serial</Badge>
                        )}
                        {product.isTaxable && (
                          <Badge variant="outline" className="text-[10px] bg-purple-500/10 text-purple-400 border-purple-500/20">{product.taxRate}%</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${
                          product.isActive
                            ? 'bg-success/10 text-success border-success/20'
                            : 'bg-destructive/10 text-destructive border-destructive/20'
                        }`}
                      >
                        {product.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
