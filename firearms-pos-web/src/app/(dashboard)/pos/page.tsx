'use client'

import { useState, useEffect, useCallback } from 'react'
import { PageLoader } from '@/components/ui/page-loader'
import {
  ShoppingCart,
  Search,
  Barcode,
  Plus,
  Minus,
  X,
  CreditCard,
  Banknote,
  Smartphone,
  User,
  Pause,
  Check,
  Trash2,
  Hash,
  ChevronsUpDown,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { getProductsWithStock, getCategories } from '@/actions/products'
import { getCustomers } from '@/actions/customers'
import { createSale } from '@/actions/sales'
import { toast } from 'sonner'

type Product = {
  id: number
  code: string
  name: string
  categoryName: string | null
  sellingPrice: string
  costPrice: string
  isSerialTracked: boolean
  taxRate: string
  isActive: boolean
  stockQuantity: number
}

type CartItem = {
  productId: number
  name: string
  code: string
  costPrice: number
  qty: number
  unitPrice: number
  serialNumber?: string
  taxRate: number
}

type Customer = {
  id: number
  name: string
}

export default function POSPage() {
  const [search, setSearch] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [cart, setCart] = useState<CartItem[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<Customer>({ id: 0, name: 'Walk-in Customer' })
  const [discount, setDiscount] = useState(0)
  const [notes, setNotes] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null)
  const [amountTendered, setAmountTendered] = useState('')
  const [customerOpen, setCustomerOpen] = useState(false)
  const [serialDialogOpen, setSerialDialogOpen] = useState(false)
  const [pendingProduct, setPendingProduct] = useState<Product | null>(null)
  const [serialInput, setSerialInput] = useState('')
  const [allProducts, setAllProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<string[]>(['All'])
  const [loading, setLoading] = useState(true)
  const [completing, setCompleting] = useState(false)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      const [productsResult, categoriesResult, customersResult] = await Promise.all([
        getProductsWithStock({ isActive: true }),
        getCategories(),
        getCustomers({ isActive: true }),
      ])

      if (productsResult.success) {
        setAllProducts(
          productsResult.data.map((d: any) => ({
            ...d.product,
            categoryName: d.categoryName,
            stockQuantity: d.stockQuantity ?? 0,
          }))
        )
      }
      if (categoriesResult.success) {
        const catNames = (categoriesResult.data as any[]).map((c: any) => c.name)
        setCategories(['All', ...catNames])
      }
      if (customersResult.success) {
        const custs = (customersResult.data as any[]).map((c: any) => ({
          id: c.id,
          name: `${c.firstName} ${c.lastName}`.trim(),
        }))
        setCustomers([{ id: 0, name: 'Walk-in Customer' }, ...custs])
      }
      setLoading(false)
    }
    loadData()
  }, [])

  const filteredProducts = allProducts.filter((p) => {
    if (selectedCategory !== 'All' && p.categoryName !== selectedCategory) return false
    if (search) {
      const q = search.toLowerCase()
      if (!p.name.toLowerCase().includes(q) && !p.code.toLowerCase().includes(q)) return false
    }
    return true
  })

  const addToCart = (product: Product) => {
    if (product.stockQuantity <= 0) {
      toast.error(`${product.name} is out of stock`)
      return
    }
    if (product.isSerialTracked) {
      setPendingProduct(product)
      setSerialInput('')
      setSerialDialogOpen(true)
      return
    }
    const existing = cart.find((c) => c.productId === product.id && !c.serialNumber)
    const currentQty = existing?.qty ?? 0
    if (currentQty + 1 > product.stockQuantity) {
      toast.warning(`Only ${product.stockQuantity} in stock for ${product.name}`)
      return
    }
    if (existing) {
      setCart(cart.map((c) => c === existing ? { ...c, qty: c.qty + 1 } : c))
    } else {
      setCart([...cart, {
        productId: product.id, name: product.name, code: product.code,
        costPrice: Number(product.costPrice), qty: 1, unitPrice: Number(product.sellingPrice),
        taxRate: Number(product.taxRate),
      }])
    }
  }

  const addSerialItem = () => {
    if (!pendingProduct || !serialInput.trim()) return
    setCart([...cart, {
      productId: pendingProduct.id, name: pendingProduct.name, code: pendingProduct.code,
      costPrice: Number(pendingProduct.costPrice), qty: 1, unitPrice: Number(pendingProduct.sellingPrice),
      serialNumber: serialInput.trim(), taxRate: Number(pendingProduct.taxRate),
    }])
    setSerialDialogOpen(false)
    setPendingProduct(null)
    setSerialInput('')
  }

  const updateQty = (index: number, delta: number) => {
    const item = cart[index]
    if (delta > 0) {
      const product = allProducts.find((p) => p.id === item.productId)
      if (product && item.qty + delta > product.stockQuantity) {
        toast.warning(`Only ${product.stockQuantity} in stock for ${product.name}`)
        return
      }
    }
    setCart(cart.map((ci, i) => {
      if (i !== index) return ci
      const newQty = ci.qty + delta
      return newQty > 0 ? { ...ci, qty: newQty } : ci
    }))
  }

  const removeItem = (index: number) => {
    setCart(cart.filter((_, i) => i !== index))
  }

  const clearCart = () => {
    setCart([])
    setDiscount(0)
    setNotes('')
    setPaymentMethod(null)
    setAmountTendered('')
  }

  const subtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.qty, 0)
  const taxAmount = cart.reduce((sum, item) => sum + (item.unitPrice * item.qty * item.taxRate / 100), 0)
  const total = subtotal + taxAmount - discount
  const change = amountTendered ? Math.max(0, Number(amountTendered) - total) : 0

  const handleCompleteSale = async () => {
    if (cart.length === 0 || !paymentMethod) return
    setCompleting(true)

    const amountPaid = paymentMethod === 'cash'
      ? Number(amountTendered) || total
      : paymentMethod === 'credit'
        ? 0
        : total

    const result = await createSale({
      customerId: selectedCustomer.id || null,
      branchId: 1, // Default branch — will be replaced with session branch
      items: cart.map((item) => ({
        productId: item.productId,
        quantity: item.qty,
        unitPrice: item.unitPrice,
        costPrice: item.costPrice,
        serialNumber: item.serialNumber,
        taxAmount: item.unitPrice * item.qty * item.taxRate / 100,
      })),
      paymentMethod,
      payments: amountPaid > 0
        ? [{ paymentMethod, amount: amountPaid }]
        : [],
      subtotal,
      taxAmount: Math.round(taxAmount),
      discountAmount: discount,
      totalAmount: Math.round(total),
      amountPaid,
      changeGiven: Math.round(change),
      notes: notes || undefined,
    })

    setCompleting(false)
    if (result.success) {
      toast.success('Sale completed successfully')
      clearCart()
      setSelectedCustomer({ id: 0, name: 'Walk-in Customer' })
    } else {
      toast.error((result as any).message || 'Sale failed')
    }
  }

  return (
    <div className="flex gap-4 h-[calc(100vh-5rem)]">
      {/* Left: Product Selection */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Search */}
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search products by name, code, or barcode..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button variant="outline" size="icon" className="shrink-0">
            <Barcode className="w-4 h-4" />
          </Button>
        </div>

        {/* Category Chips */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2 shrink-0">
          {categories.map((cat) => (
            <Button
              key={cat}
              variant={selectedCategory === cat ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(cat)}
              className={`shrink-0 text-xs h-8 ${selectedCategory === cat ? 'brass-glow' : ''}`}
            >
              {cat}
            </Button>
          ))}
        </div>

        {/* Product Grid */}
        <ScrollArea className="flex-1">
          {loading ? (
            <PageLoader />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 p-1">
              {filteredProducts.map((product) => (
                <Card
                  key={product.id}
                  className={`cursor-pointer transition-all hover:ring-1 hover:ring-primary/50 ${product.stockQuantity <= 0 ? 'opacity-50' : ''}`}
                  onClick={() => addToCart(product)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between mb-2">
                      <Badge variant="outline" className="text-[9px]">{product.categoryName || 'N/A'}</Badge>
                      <div className="flex items-center gap-1">
                        {product.isSerialTracked && (
                          <Hash className="w-3 h-3 text-blue-400" />
                        )}
                        {product.stockQuantity <= 0 ? (
                          <Badge variant="destructive" className="text-[9px]">Out of Stock</Badge>
                        ) : product.stockQuantity <= 5 ? (
                          <Badge className="text-[9px] bg-amber-500/20 text-amber-400 border-amber-500/30">{product.stockQuantity} left</Badge>
                        ) : (
                          <Badge variant="outline" className="text-[9px] text-muted-foreground">{product.stockQuantity} in stock</Badge>
                        )}
                      </div>
                    </div>
                    <p className="text-sm font-medium leading-tight mb-1 line-clamp-2">{product.name}</p>
                    <p className="text-[10px] font-mono text-muted-foreground mb-2">{product.code}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-primary">Rs. {Number(product.sellingPrice).toLocaleString()}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {filteredProducts.length === 0 && (
                <div className="col-span-full text-center py-12 text-muted-foreground">No products found</div>
              )}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Right: Cart & Checkout */}
      <div className="w-[380px] flex flex-col border-l pl-4">
        {/* Cart Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-primary" />
            <h2 className="font-semibold">Cart</h2>
            {cart.length > 0 && (
              <Badge variant="secondary" className="text-[10px]">{cart.reduce((s, i) => s + i.qty, 0)} items</Badge>
            )}
          </div>
        </div>

        {/* Customer */}
        <Popover open={customerOpen} onOpenChange={setCustomerOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="mb-3 h-9 w-full justify-between font-normal">
              <div className="flex items-center gap-2 truncate">
                <User className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="truncate">{selectedCustomer.name}</span>
              </div>
              <ChevronsUpDown className="w-4 h-4 text-muted-foreground shrink-0" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[340px] p-0" align="start">
            <Command>
              <CommandInput placeholder="Search customers..." />
              <CommandList>
                <CommandEmpty>No customer found.</CommandEmpty>
                <CommandGroup>
                  {customers.map((c) => (
                    <CommandItem
                      key={c.id}
                      value={c.name}
                      onSelect={() => {
                        setSelectedCustomer(c)
                        setCustomerOpen(false)
                      }}
                    >
                      <Check className={`w-4 h-4 mr-2 ${selectedCustomer.id === c.id ? 'opacity-100' : 'opacity-0'}`} />
                      {c.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>

        {/* Cart Items */}
        <ScrollArea className="flex-1 mb-3">
          {cart.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">
              <ShoppingCart className="w-8 h-8 mx-auto mb-2 opacity-30" />
              Add products to begin
            </div>
          ) : (
            <div className="space-y-2 pr-2">
              {cart.map((item, index) => (
                <div key={index} className="flex items-start gap-2 p-2 rounded-md bg-muted/20 border">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    <p className="text-[10px] font-mono text-muted-foreground">{item.code}</p>
                    {item.serialNumber && (
                      <p className="text-[10px] text-blue-400 mt-0.5">SN: {item.serialNumber}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Rs. {item.unitPrice.toLocaleString()} x {item.qty}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <p className="text-sm font-semibold">Rs. {(item.unitPrice * item.qty).toLocaleString()}</p>
                    <div className="flex items-center gap-1">
                      {!item.serialNumber && (
                        <>
                          <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQty(index, -1)}>
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="text-xs w-6 text-center font-medium">{item.qty}</span>
                          <Button variant="outline" size="icon" className="h-6 w-6" onClick={() => updateQty(index, 1)}>
                            <Plus className="w-3 h-3" />
                          </Button>
                        </>
                      )}
                      <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={() => removeItem(index)}>
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <Separator className="mb-3" />

        {/* Order Summary */}
        <div className="space-y-1.5 text-sm mb-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>Rs. {subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tax</span>
            <span>Rs. {Math.round(taxAmount).toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Discount</span>
            <Input
              type="number"
              value={discount || ''}
              onChange={(e) => setDiscount(Number(e.target.value) || 0)}
              placeholder="0"
              className="w-24 h-7 text-right text-xs"
            />
          </div>
          <Separator />
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span className="text-primary">Rs. {Math.round(total).toLocaleString()}</span>
          </div>
        </div>

        {/* Payment Method */}
        <div className="grid grid-cols-4 gap-2 mb-3">
          {[
            { key: 'cash', label: 'Cash', icon: Banknote },
            { key: 'card', label: 'Card', icon: CreditCard },
            { key: 'credit', label: 'Credit', icon: User },
            { key: 'mobile', label: 'Mobile', icon: Smartphone },
          ].map((m) => (
            <Button
              key={m.key}
              variant={paymentMethod === m.key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPaymentMethod(m.key)}
              className={`flex-col h-auto py-2 text-[10px] ${paymentMethod === m.key ? 'brass-glow' : ''}`}
            >
              <m.icon className="w-4 h-4 mb-1" />
              {m.label}
            </Button>
          ))}
        </div>

        {/* Cash tendered */}
        {paymentMethod === 'cash' && (
          <div className="flex items-center gap-2 mb-3">
            <div className="flex-1 space-y-1">
              <Label className="text-xs">Amount Tendered</Label>
              <Input
                type="number"
                value={amountTendered}
                onChange={(e) => setAmountTendered(e.target.value)}
                placeholder="0"
                className="h-8"
              />
            </div>
            {Number(amountTendered) > 0 && (
              <div className="text-right">
                <p className="text-[10px] text-muted-foreground">Change</p>
                <p className="text-sm font-bold text-success">Rs. {Math.round(change).toLocaleString()}</p>
              </div>
            )}
          </div>
        )}

        {/* Notes */}
        <Textarea
          placeholder="Notes (optional)"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="mb-3 text-xs"
          rows={2}
        />

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={clearCart} disabled={cart.length === 0}>
            <Trash2 className="w-4 h-4 mr-1" />
            Clear
          </Button>
          <Button variant="secondary" className="flex-1" disabled={cart.length === 0}>
            <Pause className="w-4 h-4 mr-1" />
            Hold
          </Button>
          <Button
            className="flex-[2] brass-glow"
            disabled={cart.length === 0 || !paymentMethod || completing}
            onClick={handleCompleteSale}
          >
            <Check className="w-4 h-4 mr-1" />
            {completing ? 'Processing...' : 'Complete Sale'}
          </Button>
        </div>
      </div>

      {/* Serial Number Dialog */}
      <Dialog open={serialDialogOpen} onOpenChange={setSerialDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Enter Serial Number</DialogTitle>
            <DialogDescription>
              {pendingProduct?.name} requires a serial number for tracking.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div className="space-y-2">
              <Label>Serial Number *</Label>
              <Input
                placeholder="e.g. GLK19-2026-00123"
                value={serialInput}
                onChange={(e) => setSerialInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addSerialItem()}
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setSerialDialogOpen(false)}>Cancel</Button>
            <Button className="brass-glow" disabled={!serialInput.trim()} onClick={addSerialItem}>
              Add to Cart
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
