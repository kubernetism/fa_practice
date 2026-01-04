import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Search,
  Plus,
  Minus,
  Trash2,
  Package,
  ShoppingBag,
  Clock,
  Pause,
  User,
  AlertCircle,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useTabs } from '@/contexts/tabs-context'
import { useBranch } from '@/contexts/branch-context'
import { useAuth } from '@/contexts/auth-context'
import type { SalesTabWithItems, SalesTabItem, Customer, AvailableProduct } from '@shared/types'
import { formatCurrency, debounce } from '@/lib/utils'

export function TabDetailScreen() {
  const { tabId } = useParams<{ tabId: string }>()
  const navigate = useNavigate()
  const { activeTab, setActiveTab, updateTabItem, removeFromTab, clearTabItems } = useTabs()
  const { currentBranch, branches } = useBranch()
  const { user } = useAuth()

  const [searchQuery, setSearchQuery] = useState('')
  const [products, setProducts] = useState<AvailableProduct[]>([])
  const [isLoadingProducts, setIsLoadingProducts] = useState(false)
  const [showCustomerDialog, setShowCustomerDialog] = useState(false)
  const [customerSearch, setCustomerSearch] = useState('')
  const [customers, setCustomers] = useState<Customer[]>([])
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [showSerialDialog, setShowSerialDialog] = useState(false)
  const [pendingSerialProduct, setPendingSerialProduct] = useState<AvailableProduct | null>(null)
  const [serialNumber, setSerialNumber] = useState('')
  const [discount, setDiscount] = useState(0)
  const [notes, setNotes] = useState('')

  const tab = activeTab
  const tabItems = tab?.items ?? []

  // Refresh tab data from server
  const refreshTab = useCallback(async () => {
    if (tabId) {
      const result = await window.api.salesTabs.getById(Number(tabId))
      if (result.success && result.data) {
        setActiveTab(result.data as SalesTabWithItems)
        setDiscount((result.data as SalesTabWithItems).discount ?? 0)
        setNotes((result.data as SalesTabWithItems).notes ?? '')
      }
    }
  }, [tabId, setActiveTab])

  // Load tab data
  useEffect(() => {
    if (tabId) {
      const loadTab = async () => {
        const result = await window.api.salesTabs.getById(Number(tabId))
        if (result.success && result.data) {
          setActiveTab(result.data as SalesTabWithItems)
          setDiscount((result.data as SalesTabWithItems).discount ?? 0)
          setNotes((result.data as SalesTabWithItems).notes ?? '')
        }
      }
      loadTab()
    }
  }, [tabId, setActiveTab])

  // Search products with debounce
  const searchProducts = useCallback(
    debounce(async (query: string) => {
      if (!query.trim() || !currentBranch) {
        setProducts([])
        return
      }

      setIsLoadingProducts(true)
      try {
        const result = await window.api.salesTabs.getAvailableProducts({
          branchId: currentBranch.id,
          searchQuery: query,
        })
        if (result.success && result.data) {
          setProducts(result.data)
        }
      } catch (error) {
        console.error('Product search failed:', error)
      } finally {
        setIsLoadingProducts(false)
      }
    }, 300),
    [currentBranch]
  )

  useEffect(() => {
    searchProducts(searchQuery)
  }, [searchQuery, searchProducts])

  // Search customers with debounce
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

  // Add item to tab
  const addToTab = async (product: AvailableProduct, quantity = 1) => {
    if (!tab || product.quantity < 1) return

    // Check if serial tracked
    if (product.product.isSerialTracked) {
      setPendingSerialProduct(product)
      setShowSerialDialog(true)
      return
    }

    // Check if item already exists in tab (non-serial items)
    const existingItem = tabItems.find(
      (i) => i.productId === product.product.id && !i.serialNumber
    )
    const newQuantity = existingItem ? existingItem.quantity + quantity : quantity

    const result = await window.api.salesTabs.addItem(tab.id, {
      productId: product.product.id,
      quantity: newQuantity,
    })

    if (result.success) {
      await refreshTab()
      setSearchQuery('')
      setProducts([])
    }
  }

  // Add serial tracked item
  const addSerialTrackedItem = async () => {
    if (!tab || !pendingSerialProduct || !serialNumber.trim()) return

    const result = await window.api.salesTabs.addItem(tab.id, {
      productId: pendingSerialProduct.product.id,
      quantity: 1,
      serialNumber: serialNumber.trim(),
    })

    if (result.success) {
      await refreshTab()
      setShowSerialDialog(false)
      setPendingSerialProduct(null)
      setSerialNumber('')
      setSearchQuery('')
      setProducts([])
    }
  }

  // Update item quantity
  const updateQuantity = async (item: SalesTabItem, delta: number) => {
    if (!tab) return

    // Serial tracked items cannot change quantity
    if (item.serialNumber) return

    const newQuantity = item.quantity + delta
    if (newQuantity < 1) return

    // Check stock availability
    const product = products.find((p) => p.product.id === item.productId)
    if (product && newQuantity > product.quantity) {
      return
    }

    await updateTabItem(tab.id, item.id, newQuantity)
  }

  // Remove item from tab
  const handleRemoveItem = async (item: SalesTabItem) => {
    if (!tab) return
    await removeFromTab(tab.id, item.id)
    await refreshTab()
  }

  // Clear all items
  const handleClearItems = async () => {
    if (tab) {
      await clearTabItems(tab.id)
      await refreshTab()
      setShowClearConfirm(false)
    }
  }

  // Update customer
  const updateCustomer = async (customerId: number) => {
    if (tab) {
      await window.api.salesTabs.update(tab.id, { customerId })
      await refreshTab()
      setShowCustomerDialog(false)
    }
  }

  // Update notes
  const updateNotes = async () => {
    if (tab) {
      await window.api.salesTabs.update(tab.id, { notes })
      await refreshTab()
    }
  }

  // Hold tab
  const handleHold = async () => {
    if (tab && tab.status === 'open') {
      await window.api.salesTabs.update(tab.id, { status: 'on_hold' })
      await refreshTab()
    }
  }

  // Go back to tabs list
  const handleBack = () => {
    setActiveTab(null)
    navigate('/pos-tabs')
  }

  // Calculate totals
  const subtotal = useMemo(() => tab?.subtotal ?? 0, [tab])
  const tax = useMemo(() => tab?.tax ?? 0, [tab])
  const finalAmount = useMemo(
    () => Math.max(0, (subtotal + tax) - discount),
    [subtotal, tax, discount]
  )

  const statusBadge = useMemo(() => {
    if (!tab) return null
    const config: Record<string, { label: string; color: string }> = {
      open: { label: 'Open', color: 'bg-green-100 text-green-700' },
      on_hold: { label: 'On Hold', color: 'bg-yellow-100 text-yellow-700' },
      closed: { label: 'Closed', color: 'bg-gray-100 text-gray-700' },
    }
    const statusConfig = config[tab.status]
    return <Badge className={statusConfig.color}>{statusConfig.label}</Badge>
  }, [tab])

  if (!tab) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      {/* Left Side - Products and Tab Items */}
      <div className="flex flex-1 flex-col gap-4">
        {/* Tab Header */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={handleBack}>
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                  <h2 className="text-xl font-bold">{tab.tabNumber}</h2>
                  <div className="flex items-center gap-2">
                    {statusBadge}
                    <span className="text-sm text-muted-foreground">
                      {formatTimeAgo(tab.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
              {tab.status === 'open' && (
                <Button variant="outline" onClick={handleHold}>
                  <Pause className="mr-2 h-4 w-4" />
                  Hold
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Customer and Notes */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Customer</CardTitle>
            </CardHeader>
            <CardContent>
              {tab.customer ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {tab.customer.firstName} {tab.customer.lastName}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => updateCustomer(tab.customerId ?? 0)}
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ) : (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowCustomerDialog(true)}
                >
                  <User className="mr-2 h-4 w-4" />
                  Select Customer
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                onBlur={updateNotes}
                placeholder="Add notes..."
                disabled={tab.status !== 'open'}
              />
            </CardContent>
          </Card>
        </div>

        {/* Product Search */}
        <Card className="flex-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Add Products</CardTitle>
          </CardHeader>
          <CardContent className="h-full flex flex-col">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products by name, code, or barcode..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                disabled={tab.status !== 'open'}
              />
            </div>

            <ScrollArea className="flex-1">
              {isLoadingProducts ? (
                <div className="flex items-center justify-center py-8">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              ) : products.length > 0 ? (
                <div className="grid gap-2 sm:grid-cols-2">
                  {products.map((item) => (
                    <ProductCard
                      key={item.product.id}
                      product={item}
                      onAdd={() => addToTab(item)}
                      disabled={tab.status !== 'open' || item.quantity < 1}
                    />
                  ))}
                </div>
              ) : searchQuery ? (
                <div className="flex h-32 items-center justify-center text-muted-foreground">
                  No products found
                </div>
              ) : (
                <div className="flex h-32 items-center justify-center text-muted-foreground">
                  Search for products to add to tab
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Tab Items */}
        <Card className="flex-1">
          <CardHeader className="pb-3 flex-row items-center justify-between">
            <CardTitle className="text-base">Tab Items ({tabItems.length})</CardTitle>
            {tabItems.length > 0 && tab.status === 'open' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowClearConfirm(true)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              {tabItems.length === 0 ? (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  No items in tab
                </div>
              ) : (
                <div className="space-y-2">
                  {tabItems.map((item) => (
                    <TabItemCard
                      key={item.id}
                      item={item}
                      onQuantityChange={(delta) => updateQuantity(item, delta)}
                      onRemove={() => handleRemoveItem(item)}
                      disabled={tab.status !== 'open'}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Right Side - Totals and Checkout */}
      <Card className="w-96">
        <CardHeader className="pb-3">
          <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col">
          {/* Tab info */}
          <div className="mb-4 rounded-lg bg-muted p-3">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Branch:</span>
                <span className="ml-1 font-medium">
                  {tab.branch?.name ?? 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-muted-foreground">Created:</span>
                <span className="ml-1 font-medium">
                  {new Date(tab.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          {/* Items count */}
          <div className="mb-4 flex items-center justify-between">
            <span className="text-muted-foreground">Total Items</span>
            <span className="text-2xl font-bold">{tab.itemCount}</span>
          </div>

          <Separator className="my-4" />

          {/* Totals */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Tax</span>
              <span>{formatCurrency(tax)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span>Discount</span>
              <Input
                type="number"
                value={discount}
                onChange={(e) => setDiscount(Number(e.target.value))}
                className="h-7 w-24 text-right"
                disabled={tab.status !== 'open'}
              />
            </div>
            <Separator />
            <div className="flex justify-between text-lg font-bold">
              <span>Total</span>
              <span>{formatCurrency(finalAmount)}</span>
            </div>
          </div>

          <Separator className="my-4" />

          {/* Checkout button */}
          {tab.status === 'closed' ? (
            <div className="flex items-center justify-center gap-2 rounded-lg bg-muted p-4 text-muted-foreground">
              <Clock className="h-5 w-5" />
              <span>This tab has been closed</span>
            </div>
          ) : (
            <Button
              size="lg"
              className="w-full"
              disabled={tabItems.length === 0 || tab.status !== 'open'}
              onClick={() => navigate(`/pos-tabs/${tab.id}/checkout`)}
            >
              Proceed to Checkout
            </Button>
          )}

          {/* Back button */}
          <Button variant="outline" className="w-full mt-2" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Tabs
          </Button>
        </CardContent>
      </Card>

      {/* Customer Selection Dialog */}
      <Dialog open={showCustomerDialog} onOpenChange={setShowCustomerDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Customer</DialogTitle>
            <DialogDescription>Search for an existing customer</DialogDescription>
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
                      onClick={() => updateCustomer(customer.id)}
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
              This product requires a serial number: {pendingSerialProduct?.product.name}
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
              Add to Tab
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Clear Items Confirmation */}
      <AlertDialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear All Items?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to remove all items from {tab.tabNumber}? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClearItems}
              className="bg-destructive text-destructive-foreground"
            >
              Clear Items
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

interface ProductCardProps {
  product: AvailableProduct
  onAdd: () => void
  disabled: boolean
}

function ProductCard({ product, onAdd, disabled }: ProductCardProps) {
  const { product: p, quantity } = product

  return (
    <button
      onClick={onAdd}
      disabled={disabled}
      className="flex flex-col rounded-lg border p-3 text-left transition-all hover:border-primary hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{p.name}</p>
          <p className="text-sm text-muted-foreground">{p.code}</p>
        </div>
        {p.isSerialTracked && (
          <Badge variant="outline" className="text-xs shrink-0">
            Serial
          </Badge>
        )}
      </div>
      <div className="mt-2 flex items-center justify-between">
        <div className="flex items-center gap-1 text-sm">
          <Package className="h-3.5 w-3.5 text-muted-foreground" />
          <span>
            Stock: <span className="font-medium">{quantity}</span>
          </span>
        </div>
        <p className="font-bold">{formatCurrency(p.sellingPrice)}</p>
      </div>
      {quantity < 1 && (
        <div className="mt-2 flex items-center gap-1 text-xs text-destructive">
          <AlertCircle className="h-3 w-3" />
          Out of stock
        </div>
      )}
    </button>
  )
}

interface TabItemCardProps {
  item: SalesTabItem
  onQuantityChange: (delta: number) => void
  onRemove: () => void
  disabled: boolean
}

function TabItemCard({ item, onQuantityChange, onRemove, disabled }: TabItemCardProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border p-3">
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{item.productName}</p>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>{formatCurrency(item.sellingPrice)}</span>
          {item.serialNumber && (
            <Badge variant="outline" className="text-xs">
              SN: {item.serialNumber}
            </Badge>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1">
        {!item.serialNumber && (
          <>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={() => onQuantityChange(-1)}
              disabled={disabled || item.quantity <= 1}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="w-8 text-center text-sm">{item.quantity}</span>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={() => onQuantityChange(1)}
              disabled={disabled}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </>
        )}
        {item.serialNumber && (
          <span className="w-8 text-center text-sm">1</span>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-destructive hover:text-destructive"
          onClick={onRemove}
          disabled={disabled}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  )
}

function formatTimeAgo(dateString: string): string {
  const now = Date.now()
  const date = new Date(dateString).getTime()
  const seconds = Math.floor((now - date) / 1000)

  const intervals = [
    { label: 'y', seconds: 31536000 },
    { label: 'mo', seconds: 2592000 },
    { label: 'd', seconds: 86400 },
    { label: 'h', seconds: 3600 },
    { label: 'm', seconds: 60 },
  ]

  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds)
    if (count >= 1) {
      return `${count}${interval.label} ago`
    }
  }
  return 'Just now'
}
