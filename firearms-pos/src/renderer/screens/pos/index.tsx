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
  Package,
  Clock,
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

interface AvailableProduct {
  product: Product
  quantity: number
}

export function POSScreen() {
  const { currentBranch } = useBranch()
  const [searchQuery, setSearchQuery] = useState('')
  const [allProducts, setAllProducts] = useState<AvailableProduct[]>([])
  const [isLoadingProducts, setIsLoadingProducts] = useState(true)
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [customerSearch, setCustomerSearch] = useState('')
  const [customers, setCustomers] = useState<Customer[]>([])
  const [showCustomerDialog, setShowCustomerDialog] = useState(false)
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [showSerialDialog, setShowSerialDialog] = useState(false)
  const [pendingSerialProduct, setPendingSerialProduct] = useState<Product | null>(null)
  const [serialNumber, setSerialNumber] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'cod' | 'receivable'>('cash')
  const [amountPaid, setAmountPaid] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')

  // COD fields
  const [codName, setCodName] = useState('')
  const [codPhone, setCodPhone] = useState('')
  const [codAddress, setCodAddress] = useState('')
  const [codCity, setCodCity] = useState('')

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + item.product.sellingPrice * item.quantity, 0)
  const taxRate = 8.5 // Default tax rate
  const taxAmount = subtotal * (taxRate / 100)
  const total = subtotal + taxAmount

  // Load all available products on mount and when branch changes
  const loadAvailableProducts = useCallback(async () => {
    if (!currentBranch) return

    setIsLoadingProducts(true)
    try {
      const result = await window.api.salesTabs.getAvailableProducts({
        branchId: currentBranch.id,
        limit: 500,
      })
      if (result.success && result.data) {
        setAllProducts(result.data)
      }
    } catch (error) {
      console.error('Failed to load products:', error)
    } finally {
      setIsLoadingProducts(false)
    }
  }, [currentBranch])

  useEffect(() => {
    loadAvailableProducts()
  }, [loadAvailableProducts])

  // Filter products based on search query
  const filteredProducts = searchQuery.trim()
    ? allProducts.filter(
        (item) =>
          item.product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.product.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.product.barcode?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allProducts

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
  const addToCart = (product: Product, availableQty: number) => {
    if (product.isSerialTracked) {
      setPendingSerialProduct(product)
      setShowSerialDialog(true)
      return
    }

    // Check if we have enough stock
    const existingInCart = cart.find((item) => item.product.id === product.id)
    const currentCartQty = existingInCart?.quantity ?? 0

    if (currentCartQty >= availableQty) {
      setError(`Only ${availableQty} units available in stock`)
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
    setError('')
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

    // Receivable requires customer
    if (paymentMethod === 'receivable' && !selectedCustomer) {
      setError('Customer selection is required for Pay Later / Receivable')
      return
    }

    // Partial payment requires customer (for creating receivable)
    const paidAmount = paymentMethod === 'cash' ? parseFloat(amountPaid) || 0 : total
    const isPartialPayment = paymentMethod === 'cash' && paidAmount > 0 && paidAmount < total
    if (isPartialPayment && !selectedCustomer) {
      setError('Customer selection is required for partial payments. The remaining amount will be added to Account Receivables.')
      return
    }

    // COD validation
    if (paymentMethod === 'cod') {
      if (!codName.trim() || !codPhone.trim() || !codAddress.trim() || !codCity.trim()) {
        setError('All COD fields are required')
        return
      }
    }

    setIsProcessing(true)
    setError('')

    try {
      // Build notes for COD
      let notes = ''
      if (paymentMethod === 'cod') {
        notes = `COD Details:\nName: ${codName}\nPhone: ${codPhone}\nAddress: ${codAddress}, ${codCity}`
      }

      // Calculate payment status based on amount paid
      const actualAmountPaid = paymentMethod === 'receivable' ? 0 : paymentMethod === 'cash' ? parseFloat(amountPaid) || 0 : total
      const remainingAmount = total - actualAmountPaid

      let paymentStatus: 'paid' | 'partial' | 'pending' = 'paid'
      if (paymentMethod === 'receivable') {
        paymentStatus = 'pending'
      } else if (actualAmountPaid < total) {
        paymentStatus = actualAmountPaid > 0 ? 'partial' : 'pending'
      }

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
        paymentStatus,
        amountPaid: actualAmountPaid,
        notes: notes || undefined,
      }

      const result = await window.api.sales.create(saleData)

      if (result.success) {
        // NOTE: Receivable is automatically created by the backend (sales-ipc.ts)
        // when there's an outstanding balance and customer exists.
        // Do NOT create receivable here to avoid duplicates.

        // Generate receipt automatically
        try {
          const receiptResult = await window.api.receipt.generate(result.data.id)
          if (receiptResult.success) {
            console.log('Receipt generated:', receiptResult.data.filePath)
          } else {
            console.error('Receipt generation failed:', receiptResult.message)
          }
        } catch (receiptError) {
          console.error('Receipt generation error:', receiptError)
          // Don't block the sale completion on receipt error
        }

        // Clear cart and show success
        clearCart()
        setShowPaymentDialog(false)
        setAmountPaid('')
        setCodName('')
        setCodPhone('')
        setCodAddress('')
        setCodCity('')

        // Reload products to update stock quantities
        loadAvailableProducts()

        let message = `Sale completed! Invoice: ${result.data.invoiceNumber}`
        if (paymentMethod === 'receivable') {
          message += `\n\nFull amount (${formatCurrency(total)}) added to customer's receivables.`
        } else if (paymentStatus === 'partial') {
          message += `\n\nPaid: ${formatCurrency(actualAmountPaid)}\nRemaining: ${formatCurrency(remainingAmount)} added to customer's receivables.`
        }
        alert(message)
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

        <Card className="flex-1 overflow-hidden">
          <CardContent className="p-4 h-full">
            {isLoadingProducts ? (
              <div className="flex h-full items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : filteredProducts.length > 0 ? (
              <ScrollArea className="h-[calc(100vh-20rem)]">
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {filteredProducts.map((item) => {
                    const cartItem = cart.find((c) => c.product.id === item.product.id)
                    const inCartQty = cartItem?.quantity ?? 0
                    const remainingStock = item.quantity - inCartQty

                    return (
                      <button
                        key={item.product.id}
                        onClick={() => addToCart(item.product, item.quantity)}
                        disabled={remainingStock <= 0 && !item.product.isSerialTracked}
                        className="relative flex flex-col rounded-lg border p-3 text-left transition-all hover:bg-accent hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed h-full group"
                      >
                        {/* Plus Icon - appears on hover */}
                        <div className="absolute inset-0 flex items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                          <Plus className="h-12 w-12 text-green-600" strokeWidth={3} />
                        </div>

                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium break-words whitespace-normal leading-tight text-sm">
                              {item.product.name}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">{item.product.code}</p>
                          </div>
                          <div className="flex flex-col items-end gap-1 flex-shrink-0">
                            {item.product.isSerialTracked && (
                              <Badge variant="outline" className="text-xs">
                                Serial
                              </Badge>
                            )}
                            <Badge
                              variant={remainingStock <= 5 ? "destructive" : "secondary"}
                              className="text-xs whitespace-nowrap"
                            >
                              {remainingStock} left
                            </Badge>
                          </div>
                        </div>
                        <div className="mt-auto flex items-center justify-between pt-2 border-t">
                          <p className="text-lg font-bold">{formatCurrency(item.product.sellingPrice)}</p>
                          {inCartQty > 0 && (
                            <Badge variant="default" className="text-xs">
                              {inCartQty} in cart
                            </Badge>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </ScrollArea>
            ) : searchQuery ? (
              <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
                <Package className="h-12 w-12 mb-4" />
                <p>No products found for "{searchQuery}"</p>
              </div>
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
                <Package className="h-12 w-12 mb-4" />
                <p>No products available in inventory</p>
                <p className="text-sm">Add products to inventory first</p>
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
              <Button
                size="lg"
                variant="outline"
                disabled={cart.length === 0}
                onClick={() => {
                  setPaymentMethod('cod')
                  setAmountPaid(total.toString())
                  setShowPaymentDialog(true)
                }}
              >
                <Package className="mr-2 h-4 w-4" />
                COD
              </Button>
              <Button
                size="lg"
                variant="outline"
                disabled={cart.length === 0}
                onClick={() => {
                  setPaymentMethod('receivable')
                  setAmountPaid('0')
                  setShowPaymentDialog(true)
                }}
              >
                <Clock className="mr-2 h-4 w-4" />
                Pay Later
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Complete Payment</DialogTitle>
            <DialogDescription>
              Total: {formatCurrency(total)} | Method: {paymentMethod === 'receivable' ? 'Pay Later' : paymentMethod.toUpperCase()}
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
                {parseFloat(amountPaid) > 0 && parseFloat(amountPaid) >= total && (
                  <p className="mt-2 text-sm text-green-600">
                    Change: {formatCurrency(parseFloat(amountPaid) - total)}
                  </p>
                )}
                {parseFloat(amountPaid) > 0 && parseFloat(amountPaid) < total && (
                  <div className="mt-3 rounded-lg bg-amber-50 border border-amber-200 p-3">
                    <div className="flex items-start gap-2 text-sm">
                      <AlertCircle className="h-4 w-4 mt-0.5 text-amber-600 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-amber-800">Partial Payment</p>
                        <p className="text-amber-700">
                          Remaining: <strong>{formatCurrency(total - parseFloat(amountPaid))}</strong> will be added to Account Receivables.
                        </p>
                        {!selectedCustomer && (
                          <p className="mt-2 text-red-600 font-medium">
                            Please select a customer for partial payment!
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            {paymentMethod === 'card' && (
              <p className="text-center text-muted-foreground">
                Process card payment on terminal
              </p>
            )}
            {paymentMethod === 'cod' && (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">Enter delivery details for COD</p>
                <div>
                  <Label htmlFor="cod-name">Name *</Label>
                  <Input
                    id="cod-name"
                    value={codName}
                    onChange={(e) => setCodName(e.target.value)}
                    placeholder="Customer name"
                  />
                </div>
                <div>
                  <Label htmlFor="cod-phone">Phone *</Label>
                  <Input
                    id="cod-phone"
                    value={codPhone}
                    onChange={(e) => setCodPhone(e.target.value)}
                    placeholder="Phone number"
                  />
                </div>
                <div>
                  <Label htmlFor="cod-address">Address *</Label>
                  <Input
                    id="cod-address"
                    value={codAddress}
                    onChange={(e) => setCodAddress(e.target.value)}
                    placeholder="Delivery address"
                  />
                </div>
                <div>
                  <Label htmlFor="cod-city">City *</Label>
                  <Input
                    id="cod-city"
                    value={codCity}
                    onChange={(e) => setCodCity(e.target.value)}
                    placeholder="City"
                  />
                </div>
              </div>
            )}
            {paymentMethod === 'receivable' && (
              <div className="rounded-lg bg-muted p-4">
                <div className="flex items-start gap-2 text-sm">
                  <AlertCircle className="h-4 w-4 mt-0.5 text-yellow-600" />
                  <div>
                    <p className="font-medium">Payment will be recorded as receivable</p>
                    <p className="text-muted-foreground">
                      The amount will be added to the customer's balance. Full payment is expected later.
                    </p>
                    {!selectedCustomer && (
                      <p className="mt-2 text-destructive font-medium">
                        Please select a customer first!
                      </p>
                    )}
                  </div>
                </div>
              </div>
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
                (paymentMethod === 'cash' && (parseFloat(amountPaid) <= 0 || (parseFloat(amountPaid) < total && !selectedCustomer))) ||
                (paymentMethod === 'receivable' && !selectedCustomer) ||
                (paymentMethod === 'cod' && (!codName.trim() || !codPhone.trim() || !codAddress.trim() || !codCity.trim()))
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
