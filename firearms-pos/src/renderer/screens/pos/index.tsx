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
  Smartphone,
  Percent,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
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
import { useCurrency } from '@/contexts/settings-context'
import { useCurrentBranchSettings } from '@/contexts/settings-context'
import { debounce } from '@/lib/utils'
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
  const { formatCurrency } = useCurrency()
  const { settings } = useCurrentBranchSettings()
  const [searchQuery, setSearchQuery] = useState('')
  const [allProducts, setAllProducts] = useState<AvailableProduct[]>([])
  const [isLoadingProducts, setIsLoadingProducts] = useState(true)
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [customerSearch, setCustomerSearch] = useState('')
  const [customers, setCustomers] = useState<Customer[]>([])
  const [allCustomers, setAllCustomers] = useState<Customer[]>([])
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false)
  const [showCustomerDialog, setShowCustomerDialog] = useState(false)
  const [showPaymentDialog, setShowPaymentDialog] = useState(false)
  const [showSerialDialog, setShowSerialDialog] = useState(false)
  const [pendingSerialProduct, setPendingSerialProduct] = useState<Product | null>(null)
  const [serialNumber, setSerialNumber] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'cod' | 'mobile' | 'receivable'>('cash')
  const [amountPaid, setAmountPaid] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState('')
  const [addToReceivable, setAddToReceivable] = useState(false)

  // COD fields
  const [codName, setCodName] = useState('')
  const [codPhone, setCodPhone] = useState('')
  const [codAddress, setCodAddress] = useState('')
  const [codCity, setCodCity] = useState('')

  // Discount field
  const [discountAmount, setDiscountAmount] = useState('')

  // Get tax rate from settings (default to 0 if not set)
  const taxRate = settings?.taxRate ?? 0

  // Calculate totals
  const subtotal = cart.reduce((sum, item) => sum + item.product.sellingPrice * item.quantity, 0)
  const discount = parseFloat(discountAmount) || 0
  const taxableAmount = subtotal - discount
  const taxAmount = taxableAmount > 0 ? taxableAmount * (taxRate / 100) : 0
  const total = taxableAmount + taxAmount

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

  // Load all customers when dialog opens
  const loadAllCustomers = useCallback(async () => {
    setIsLoadingCustomers(true)
    try {
      // Pass high limit to fetch all customers (default is 20)
      const result = await window.api.customers.getAll({ limit: 1000, isActive: true })
      if (result.success && result.data) {
        setAllCustomers(result.data)
        setCustomers(result.data)
      }
    } catch (error) {
      console.error('Failed to load customers:', error)
    } finally {
      setIsLoadingCustomers(false)
    }
  }, [])

  // Filter customers based on search
  useEffect(() => {
    if (!customerSearch.trim()) {
      setCustomers(allCustomers)
      return
    }

    const query = customerSearch.toLowerCase()
    const filtered = allCustomers.filter(
      (customer) =>
        customer.firstName?.toLowerCase().includes(query) ||
        customer.lastName?.toLowerCase().includes(query) ||
        customer.phone?.toLowerCase().includes(query) ||
        customer.email?.toLowerCase().includes(query) ||
        customer.firearmLicenseNumber?.toLowerCase().includes(query)
    )
    setCustomers(filtered)
  }, [customerSearch, allCustomers])

  // Load customers when dialog opens
  useEffect(() => {
    if (showCustomerDialog && allCustomers.length === 0) {
      loadAllCustomers()
    }
  }, [showCustomerDialog, allCustomers.length, loadAllCustomers])

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
  }

  // Update quantity with inventory cap
  const updateQuantity = (productId: number, delta: number) => {
    // Get available stock for this product
    const productStock = allProducts.find((p) => p.product.id === productId)
    const availableStock = productStock?.quantity ?? 0

    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta
            // Cap at 0 minimum, and at available stock maximum
            const clampedQty = Math.min(Math.max(0, newQty), availableStock)
            if (delta > 0 && clampedQty === item.quantity) {
              // Tried to increment but hit stock limit
              setError(`Only ${availableStock} units available in stock`)
            }
            return { ...item, quantity: clampedQty }
          }
          return item
        })
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

    // Add to receivable requires customer
    if (addToReceivable && !selectedCustomer) {
      setError('Customer selection is required when adding to Account Receivables')
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

      // Calculate payment status based on amount paid and receivable option
      let actualAmountPaid: number
      let paymentStatus: 'paid' | 'partial' | 'pending' = 'paid'

      if (paymentMethod === 'receivable' || addToReceivable) {
        // Full amount goes to receivable
        actualAmountPaid = 0
        paymentStatus = 'pending'
      } else if (paymentMethod === 'cash') {
        actualAmountPaid = parseFloat(amountPaid) || 0
        if (actualAmountPaid < total) {
          paymentStatus = actualAmountPaid > 0 ? 'partial' : 'pending'
        }
      } else {
        // Card, COD, Mobile - full payment
        actualAmountPaid = total
      }

      const remainingAmount = total - actualAmountPaid

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
        paymentMethod: addToReceivable ? 'receivable' : paymentMethod,
        paymentStatus,
        amountPaid: actualAmountPaid,
        discountAmount: discount,
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
        setDiscountAmount('')
        setCodName('')
        setCodPhone('')
        setCodAddress('')
        setCodCity('')
        setAddToReceivable(false)

        // Reload products to update stock quantities
        loadAvailableProducts()

        let message = `Sale completed! Invoice: ${result.data.invoiceNumber}`
        if (paymentMethod === 'receivable' || addToReceivable) {
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
      <Card className="w-96 flex flex-col overflow-hidden">
        <CardHeader className="pb-2 flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle>Cart ({cart.length})</CardTitle>
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
                <div className="flex items-center gap-2 min-w-0">
                  <User className="h-4 w-4 flex-shrink-0" />
                  <span className="text-sm truncate">
                    {selectedCustomer.firstName} {selectedCustomer.lastName}
                  </span>
                </div>
                <Button variant="ghost" size="icon" className="flex-shrink-0" onClick={() => setSelectedCustomer(null)}>
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

        <CardContent className="flex flex-1 flex-col p-4 pt-0 min-h-0">
          {error && (
            <div className="mb-2 flex items-center gap-2 rounded-lg bg-destructive/10 p-2 text-sm text-destructive flex-shrink-0">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span className="break-words">{error}</span>
            </div>
          )}

          <div className="flex-1 min-h-0 overflow-hidden">
            <ScrollArea className="h-full">
              {cart.length === 0 ? (
                <div className="flex h-40 items-center justify-center text-muted-foreground">
                  Cart is empty
                </div>
              ) : (
                <div className="space-y-2 pr-2">
                  {cart.map((item, index) => (
                    <div
                      key={`${item.product.id}-${item.serialNumber || index}`}
                      className="flex items-center gap-2 rounded-lg border p-2"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm leading-tight break-words">{item.product.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {formatCurrency(item.product.sellingPrice)}
                          {item.serialNumber && (
                            <span className="ml-2">SN: {item.serialNumber}</span>
                          )}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {!item.serialNumber && (
                          <>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => updateQuantity(item.product.id, -1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-6 text-center text-xs font-medium">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => updateQuantity(item.product.id, 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-destructive"
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
          </div>

          <div className="mt-4 space-y-2 border-t pt-4 flex-shrink-0">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Discount</span>
                <span>-{formatCurrency(discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span>{settings?.taxName || 'Tax'} ({taxRate}%)</span>
              <span>{formatCurrency(taxAmount)}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>{formatCurrency(total)}</span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2">
              <Button
                size="lg"
                variant="outline"
                disabled={cart.length === 0}
                onClick={() => {
                  setPaymentMethod('cash')
                  setAddToReceivable(false)
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
                  setAddToReceivable(false)
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
                  setPaymentMethod('mobile')
                  setAmountPaid(total.toString())
                  setAddToReceivable(false)
                  setShowPaymentDialog(true)
                }}
              >
                <Smartphone className="mr-2 h-4 w-4" />
                Mobile
              </Button>
              <Button
                size="lg"
                variant="outline"
                disabled={cart.length === 0}
                onClick={() => {
                  setPaymentMethod('cod')
                  setAmountPaid(total.toString())
                  setAddToReceivable(false)
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
                  setAddToReceivable(false)
                  setShowPaymentDialog(true)
                }}
                className="col-span-2"
              >
                <Clock className="mr-2 h-4 w-4" />
                Pay Later (Full Receivable)
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customer Selection Dialog */}
      <Dialog open={showCustomerDialog} onOpenChange={setShowCustomerDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Select Customer</DialogTitle>
            <DialogDescription>
              Search from {allCustomers.length} customers or continue without one
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, phone, email, or license..."
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <ScrollArea className="h-72 border rounded-lg">
              {isLoadingCustomers ? (
                <div className="flex h-full items-center justify-center p-8">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
              ) : customers.length > 0 ? (
                <div className="p-2 space-y-1">
                  {customers.map((customer) => (
                    <button
                      key={customer.id}
                      onClick={() => {
                        setSelectedCustomer(customer)
                        setShowCustomerDialog(false)
                        setCustomerSearch('')
                      }}
                      className="w-full rounded-lg border p-3 text-left hover:bg-accent transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">
                            {customer.firstName} {customer.lastName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {customer.phone} {customer.email && `| ${customer.email}`}
                          </p>
                        </div>
                        {customer.firearmLicenseNumber && (
                          <Badge variant="outline" className="text-xs flex-shrink-0">
                            License: {customer.firearmLicenseNumber}
                          </Badge>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              ) : customerSearch ? (
                <div className="flex h-full items-center justify-center p-8">
                  <p className="text-center text-muted-foreground">No customers found for "{customerSearch}"</p>
                </div>
              ) : (
                <div className="flex h-full items-center justify-center p-8">
                  <p className="text-center text-muted-foreground">No customers available</p>
                </div>
              )}
            </ScrollArea>
            <p className="text-xs text-muted-foreground text-center">
              Showing {customers.length} of {allCustomers.length} customers
            </p>
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
            {/* Discount Input - shown for all payment methods */}
            <div className="rounded-lg border p-3 bg-green-50">
              <div className="flex items-center gap-2 mb-2">
                <Percent className="h-4 w-4 text-green-600" />
                <Label htmlFor="discount" className="font-medium text-green-800">Apply Discount</Label>
              </div>
              <Input
                id="discount"
                type="number"
                step="0.01"
                min="0"
                max={subtotal}
                value={discountAmount}
                onChange={(e) => {
                  const value = parseFloat(e.target.value) || 0
                  if (value <= subtotal) {
                    setDiscountAmount(e.target.value)
                  }
                }}
                placeholder="Enter discount amount"
                className="bg-white"
              />
              {discount > 0 && (
                <p className="text-sm text-green-700 mt-2">
                  Discount: {formatCurrency(discount)} | New Total: {formatCurrency(total)}
                </p>
              )}
            </div>

            {paymentMethod === 'cash' && !addToReceivable && (
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
            {paymentMethod === 'card' && !addToReceivable && (
              <p className="text-center text-muted-foreground">
                Process card payment on terminal
              </p>
            )}
            {paymentMethod === 'mobile' && !addToReceivable && (
              <p className="text-center text-muted-foreground">
                Process mobile payment (JazzCash, Easypaisa, etc.)
              </p>
            )}
            {paymentMethod === 'cod' && !addToReceivable && (
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
            {(paymentMethod === 'receivable' || addToReceivable) && (
              <div className="rounded-lg bg-muted p-4">
                <div className="flex items-start gap-2 text-sm">
                  <AlertCircle className="h-4 w-4 mt-0.5 text-yellow-600" />
                  <div>
                    <p className="font-medium">Payment will be recorded as receivable</p>
                    <p className="text-muted-foreground">
                      The full amount ({formatCurrency(total)}) will be added to the customer's balance. Payment is expected later.
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

            {/* Add to Receivable Option - shown for all methods except 'receivable' */}
            {paymentMethod !== 'receivable' && (
              <div className="rounded-lg border p-4 mt-4">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="add-to-receivable"
                    checked={addToReceivable}
                    onCheckedChange={(checked) => setAddToReceivable(checked === true)}
                  />
                  <div className="flex-1">
                    <Label htmlFor="add-to-receivable" className="font-medium cursor-pointer">
                      Add to Account Receivables
                    </Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      Check this to record the full amount as a receivable instead of processing payment now.
                      Useful for credit sales or delayed payments.
                    </p>
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
                (paymentMethod === 'cash' && !addToReceivable && (parseFloat(amountPaid) <= 0 || (parseFloat(amountPaid) < total && !selectedCustomer))) ||
                ((paymentMethod === 'receivable' || addToReceivable) && !selectedCustomer) ||
                (paymentMethod === 'cod' && !addToReceivable && (!codName.trim() || !codPhone.trim() || !codAddress.trim() || !codCity.trim()))
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
                  {addToReceivable ? 'Add to Receivables' : 'Complete Sale'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
