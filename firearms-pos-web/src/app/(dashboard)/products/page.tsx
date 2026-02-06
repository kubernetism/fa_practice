'use client'

import { useState } from 'react'
import {
  Package,
  Plus,
  Filter,
  Search,
  Edit2,
  Trash2,
  Barcode,
  Tag,
  ToggleLeft,
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

const mockCategories = [
  { id: 1, name: 'Pistols' },
  { id: 2, name: 'Rifles' },
  { id: 3, name: 'Shotguns' },
  { id: 4, name: 'Ammunition' },
  { id: 5, name: 'Accessories' },
]

const mockProducts = [
  { id: 1, code: 'P-001', name: 'Glock 19 Gen5', categoryName: 'Pistols', brand: 'Glock', costPrice: '85000', sellingPrice: '120000', reorderLevel: 5, unit: 'pcs', isSerialTracked: true, isTaxable: true, taxRate: '16', barcode: '8901234567890', isActive: true },
  { id: 2, code: 'P-002', name: 'Beretta 92FS', categoryName: 'Pistols', brand: 'Beretta', costPrice: '78000', sellingPrice: '110000', reorderLevel: 3, unit: 'pcs', isSerialTracked: true, isTaxable: true, taxRate: '16', barcode: '8901234567891', isActive: true },
  { id: 3, code: 'R-001', name: 'AR-15 Standard', categoryName: 'Rifles', brand: 'Colt', costPrice: '145000', sellingPrice: '195000', reorderLevel: 2, unit: 'pcs', isSerialTracked: true, isTaxable: true, taxRate: '16', barcode: '', isActive: true },
  { id: 4, code: 'A-001', name: '9mm FMJ Box (50rds)', categoryName: 'Ammunition', brand: 'Federal', costPrice: '2500', sellingPrice: '3500', reorderLevel: 100, unit: 'box', isSerialTracked: false, isTaxable: true, taxRate: '16', barcode: '8901234567892', isActive: true },
  { id: 5, code: 'A-002', name: '.45 ACP Hollow Point (25rds)', categoryName: 'Ammunition', brand: 'Hornady', costPrice: '3800', sellingPrice: '5200', reorderLevel: 50, unit: 'box', isSerialTracked: false, isTaxable: true, taxRate: '16', barcode: '', isActive: true },
  { id: 6, code: 'ACC-001', name: 'Red Dot Sight', categoryName: 'Accessories', brand: 'Vortex', costPrice: '25000', sellingPrice: '35000', reorderLevel: 10, unit: 'pcs', isSerialTracked: false, isTaxable: true, taxRate: '16', barcode: '', isActive: false },
]

const summaryCards = [
  { title: 'Total Products', value: '6', icon: Package, accent: 'text-primary' },
  { title: 'Active', value: '5', icon: ToggleRight, accent: 'text-success' },
  { title: 'Serial Tracked', value: '3', icon: ShieldCheck, accent: 'text-blue-400' },
  { title: 'Categories', value: '5', icon: Tag, accent: 'text-muted-foreground' },
]

export default function ProductsPage() {
  const [search, setSearch] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [dialogOpen, setDialogOpen] = useState(false)

  const filtered = mockProducts.filter((p) => {
    if (filterCategory !== 'all' && p.categoryName !== filterCategory) return false
    if (filterStatus === 'active' && !p.isActive) return false
    if (filterStatus === 'inactive' && p.isActive) return false
    if (search) {
      const q = search.toLowerCase()
      if (!p.name.toLowerCase().includes(q) && !p.code.toLowerCase().includes(q) && !p.barcode.includes(q)) return false
    }
    return true
  })

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
            <form className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Product Code *</Label>
                  <Input placeholder="e.g. P-001" />
                </div>
                <div className="space-y-2">
                  <Label>Barcode</Label>
                  <Input placeholder="Scan or enter barcode" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Product Name *</Label>
                <Input placeholder="Product name" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                    <SelectContent>
                      {mockCategories.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Brand</Label>
                  <Input placeholder="Brand name" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Cost Price (Rs.) *</Label>
                  <Input type="number" placeholder="0.00" />
                </div>
                <div className="space-y-2">
                  <Label>Selling Price (Rs.) *</Label>
                  <Input type="number" placeholder="0.00" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Reorder Level</Label>
                  <Input type="number" placeholder="10" />
                </div>
                <div className="space-y-2">
                  <Label>Unit</Label>
                  <Select>
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
                  <Input type="number" placeholder="16" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea placeholder="Optional description" rows={2} />
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Switch id="serial-tracked" />
                  <Label htmlFor="serial-tracked" className="text-sm">Serial Tracked</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch id="taxable" defaultChecked />
                  <Label htmlFor="taxable" className="text-sm">Taxable</Label>
                </div>
              </div>
              <Button type="submit" className="w-full brass-glow">Save Product</Button>
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
                {mockCategories.map((c) => (
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
              {filtered.map((product) => (
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
                    <Badge variant="outline" className="text-[10px]">{product.categoryName}</Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{product.brand}</TableCell>
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
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                    No products found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
