import React, { useState, useEffect, useCallback } from 'react'
import {
  Search,
  Plus,
  Minus,
  Trash2,
  User,
  CreditCard,
  Banknote,
  Receipt,
  X,
  AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
import { Label } from '@/components/ui/label'
import { useBranch } from '@/contexts/branch-context'
import { formatCurrency, debounce } from '@/lib/utils'
import type { Product, Customer } from '@shared/types'

interface CartItem {
  product: Product
  quantity: number
  serialNumber?: string
}

export function POSScreen() {
  const { currentBranch } = useBranch()
  const [searchQuery, setSearchQuery] = useState('')
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [customerSearch, setCustomerSearch] = useState('')
  const [customers, setCustomers] = useState<Customer[]>([])
  const [showCustomerDialog, setShowCustomerDialog] = useState(false)
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [showSerialDialog, setShowSerialDialog] = useState(false)
  const [pendingSerialProduct, setPendingSerialProduct] = useState<Product | null>(null)
  const [serialNumber, setSerialNumber] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash')
  const [amountPaid, setAmountPaid] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + item.product.sellingPrice * item.quantity, 0)
  const taxRate = 8.5 // Default tax rate
  const taxAmount = subtotal * (taxRate / 100)
  const total = subtotal + taxAmount

  // Search products
  const searchProducts = useCallback(
    debounce(async (query: string) => {
      if (!query.trim()) {
        setProducts([])
        return
      }

      try {
        const result = await window.api.products.search(query)
        if (result.success && result.data) {
          setProducts(result.data)
        }
      } catch (error) {
        console.error('Search failed:', error)
      }
    }, 300),
    []
  )

  useEffect(() => {
    searchProducts(searchQuery)
  }, [searchQuery, searchProducts])

  // Search customers
  const searchCustomers = useCallback(
    debounce(async (query: string) => {
      if (!query.trim()) {
        setCustomers([])
        return
      }

      try {
        const result = await window.api.customers.search(query)
        if (result.success && result.data) {
          setCustomers(result.data)
        }
      } catch (error) {
        console.error('Customer search failed:', error)
      }
    }, 300),
    []
  )

  useEffect(() => {
    searchCustomers(customerSearch)
  }, [customerSearch, searchCustomers])

  // Add to cart
  const addToCart = (product: Product) => {
    if (product.isSerialTracked) {
      setPendingSerialProduct(product)
      setShowSerialDialog(true)
      return
    }

    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.product.id === product.id)
      if (existing) {
        return prevCart.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        )
      }
      return [...prevCart, { product, quantity: 1 }]
    })
    setSearchQuery('')
    setProducts([])
  }

  // Add serial tracked item
  const addSerialTrackedItem = () => {
    if (!pendingSerialProduct || !serialNumber.trim()) return

    setCart((prevCart) => [
      ...prevCart,
      { product: pendingSerialProduct, quantity: 1, serialNumber: serialNumber.trim() },
    ])
    setShowSerialDialog(false)
    setPendingSerialProduct(null)
    setSerialNumber('')
    setSearchQuery('')
    setProducts([])
  }

  // Update quantity
  const updateQuantity = (productId: number, delta: number) => {
    setCart((prevCart) =>
      prevCart
        .map((item) =>
          item.product.id === productId
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item
        )
        .filter((item) => item.quantity > 0)
    )
  }

  // Remove from cart
  const removeFromCart = (productId: number, serialNumber?: string) => {
    setCart((prevCart) =>
      prevCart.filter(
        (item) => !(item.product.id === productId && item.serialNumber === serialNumber)
      )
    )
  }

  // Clear cart
  const clearCart = () => {
    setCart([])
    setSelectedCustomer(null)
    setError('')
  }

  // Process payment
  const processPayment = async () => {
    if (!currentBranch) return
    if (cart.length === 0) return

    // Check for firearms without customer
    const hasFirearms = cart.some((item) => item.product.isSerialTracked)
    if (hasFirearms && !selectedCustomer) {
      setError('Customer selection is required for firearm purchases')
      return
    }

    setIsProcessing(true)
    setError('')

    try {
      const saleData = {
        customerId: selectedCustomer?.id,
        branchId: currentBranch.id,
        items: cart.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
          unitPrice: item.product.sellingPrice,
          costPrice: item.product.costPrice,
          serialNumber: item.serialNumber,
          taxRate: item.product.isTaxable ? taxRate : 0,
        })),
        paymentMethod,
        amountPaid: paymentMethod === 'cash' ? parseFloat(amountPaid) : total,
      }

      const result = await window.api.sales.create(saleData)

      if (result.success) {
        // Clear cart and show success
        clearCart()
        setShowPaymentDialog(false)
        setAmountPaid('')
        // You could show a receipt dialog here
        alert(`Sale completed! Invoice: ${result.data.invoiceNumber}`)
      } else {
        setError(result.message || 'Failed to process sale')
      }
    } catch (error) {
      console.error('Payment processing error:', error)
      setError('An unexpected error occurred')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      {/* Product Search and List */}
      <div className="flex flex-1 flex-col">
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products by name, code, or barcode..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-lg"
            />
          </div>
        </div>

        <Card className="flex-1">
          <CardContent className="p-4">
            {products.length > 0 ? (
              <ScrollArea className="h-[calc(100vh-20rem)]">
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {products.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => addToCart(product)}
                      className="flex flex-col rounded-lg border p-4 text-left transition-colors hover:bg-accent"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-muted-foreground">{product.code}</p>
                        </div>
                        {product.isSerialTracked && (
                          <Badge variant="outline" className="text-xs">
                            Serial
                          </Badge>
                        )}
                      </div>
                      <p className="mt-2 text-lg font-bold">{formatCurrency(product.sellingPrice)}</p>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            ) : searchQuery ? (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                No products found
              </div>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                Search for products to add to cart
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Cart */}
      <Card className="w-96 flex flex-col">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle>Cart</CardTitle>
            {cart.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearCart}>
                Clear
              </Button>
            )}
          </div>
          {/* Customer Selection */}
          <div className="mt-2">
            {selectedCustomer ? (
              <div className="flex items-center justify-between rounded-lg bg-muted p-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="text-sm">
                    {selectedCustomer.firstName} {selectedCustomer.lastName}
                  </span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setSelectedCustomer(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => setShowCustomerDialog(true)}
              >
                <User className="mr-2 h-4 w-4" />
                Select Customer
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="flex flex-1 flex-col overflow-hidden p-4 pt-0">
          {error && (
            <div className="mb-2 flex items-center gap-2 rounded-lg bg-destructive/10 p-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}

          <ScrollArea className="flex-1 -mx-4 px-4">
            {cart.length === 0 ? (
              <div className="flex h-40 items-center justify-center text-muted-foreground">
                Cart is empty
              </div>
            ) : (
              <div className="space-y-2">
                {cart.map((item, index) => (
                  <div
                    key={`${item.product.id}-${item.serialNumber || index}`}
                    className="flex items-center gap-2 rounded-lg border p-2"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(item.product.sellingPrice)}
                        {item.serialNumber && (
                          <span className="ml-2 text-xs">SN: {item.serialNumber}</span>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {!item.serialNumber && (
                        <>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => updateQuantity(item.product.id, -1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-sm">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => updateQuantity(item.product.id, 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive"
                        onClick={() => removeFromCart(item.product.id, item.serialNumber)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          <div className="mt-4 space-y-2 border-t pt-4">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Tax ({taxRate}%)</span>
              <span>{formatCurrency(taxAmount)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <Button
                size="lg"
                variant="outline"
                disabled={cart.length === 0}
                onClick={() => {
                  setPaymentMethod('cash')
                  setShowPaymentDialog(true)
                }}
              >
                <Banknote className="mr-2 h-4 w-4" />
                Cash
              </Button>
              <Button
                size="lg"
                variant="outline"
                disabled={cart.length === 0}
                onClick={() => {
                  setPaymentMethod('card')
                  setAmountPaid(total.toString())
                  setShowPaymentDialog(true)
                }}
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Card
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customer Selection Dialog */}
      <Dialog open={showCustomerDialog} onOpenChange={setShowCustomerDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Customer</DialogTitle>
            <DialogDescription>Search for an existing customer or continue without one</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Search by name, phone, or email..."
              value={customerSearch}
              onChange={(e) => setCustomerSearch(e.target.value)}
            />
            <ScrollArea className="h-60">
              {customers.length > 0 ? (
                <div className="space-y-2">
                  {customers.map((customer) => (
                    <button
                      key={customer.id}
                      onClick={() => {
                        setSelectedCustomer(customer)
                        setShowCustomerDialog(false)
                        setCustomerSearch('')
                        setCustomers([])
                      }}
                      className="w-full rounded-lg border p-3 text-left hover:bg-accent"
                    >
                      <p className="font-medium">
                        {customer.firstName} {customer.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {customer.phone} {customer.email && `| ${customer.email}`}
                      </p>
                      {customer.firearmLicenseNumber && (
                        <Badge variant="outline" className="mt-1 text-xs">
                          License: {customer.firearmLicenseNumber}
                        </Badge>
                      )}
                    </button>
                  ))}
                </div>
              ) : customerSearch ? (
                <p className="text-center text-muted-foreground">No customers found</p>
              ) : (
                <p className="text-center text-muted-foreground">Start typing to search</p>
              )}
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>

      {/* Serial Number Dialog */}
      <Dialog open={showSerialDialog} onOpenChange={setShowSerialDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter Serial Number</DialogTitle>
            <DialogDescription>
              This product requires a serial number: {pendingSerialProduct?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="serial">Serial Number</Label>
              <Input
                id="serial"
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                placeholder="Enter serial number"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSerialDialog(false)}>
              Cancel
            </Button>
            <Button onClick={addSerialTrackedItem} disabled={!serialNumber.trim()}>
              Add to Cart
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Complete Payment</DialogTitle>
            <DialogDescription>
              Total: {formatCurrency(total)} | Method: {paymentMethod.toUpperCase()}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {paymentMethod === 'cash' && (
              <div>
                <Label htmlFor="amount">Amount Received</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  placeholder="Enter amount"
                />
                {parseFloat(amountPaid) >= total && (
                  <p className="mt-2 text-sm text-success">
                    Change: {formatCurrency(parseFloat(amountPaid) - total)}
                  </p>
                )}
              </div>
            )}
            {paymentMethod === 'card' && (
              <p className="text-center text-muted-foreground">
                Process card payment on terminal
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPaymentDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={processPayment}
              disabled={
                isProcessing ||
                (paymentMethod === 'cash' && parseFloat(amountPaid) < total)
              }
            >
              {isProcessing ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Processing...
                </>
              ) : (
                <>
                  <Receipt className="mr-2 h-4 w-4" />
                  Complete Sale
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
