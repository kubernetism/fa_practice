import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Plus,
  Search,
  Eye,
  X,
  Package,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  Truck,
  Calendar,
  FileText,
  Clock,
  PackageCheck,
  RefreshCw,
  CreditCard,
  Banknote,
  Filter,
  RotateCcw,
} from 'lucide-react'
import { ReverseDialog } from './reverse-dialog'
import { useAuth } from '@/contexts/auth-context'
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
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useBranch } from '@/contexts/branch-context'
import { formatCurrency, formatDateTime, cn } from '@/lib/utils'

interface Purchase {
  id: number
  purchaseOrderNumber: string
  supplierId: number
  branchId: number
  userId: number
  subtotal: number
  taxAmount: number
  shippingCost: number
  totalAmount: number
  paymentMethod: 'cash' | 'cheque' | 'pay_later'
  paymentStatus: 'paid' | 'partial' | 'pending'
  paidAmount: number
  remainingAmount: number
  status: 'draft' | 'ordered' | 'partial' | 'received' | 'cancelled' | 'reversed'
  expectedDeliveryDate: string | null
  receivedDate: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
  paymentHistory?: Array<{
    id: number
    amount: number
    paymentMethod: string
    referenceNumber: string | null
    notes: string | null
    paymentDate: string
  }>
}

interface PurchaseItem {
  id: number
  purchaseId: number
  productId: number
  quantity: number
  unitCost: number
  receivedQuantity: number
  totalCost: number
  product?: Product
}

interface Product {
  id: number
  code: string
  name: string
  costPrice: number
}

interface Supplier {
  id: number
  name: string
  contactPerson: string | null
  phone: string | null
  email: string | null
}

interface PurchaseItemInput {
  productId: number
  quantity: number
  unitCost: number
}

interface PurchaseSummary {
  totalPurchases: number
  totalSpent: number
  thisMonthCount: number
  thisMonthSpent: number
  pendingCount: number
  pendingAmount: number
}

const ORDER_STATUSES = [
  { value: 'draft', label: 'Draft' },
  { value: 'ordered', label: 'Ordered' },
  { value: 'partial', label: 'Partial' },
  { value: 'received', label: 'Received' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'reversed', label: 'Reversed' },
]

const PAYMENT_STATUSES = [
  { value: 'pending', label: 'Pending' },
  { value: 'partial', label: 'Partial' },
  { value: 'paid', label: 'Paid' },
]

const PAYMENT_METHODS = [
  { value: 'cash', label: 'Cash' },
  { value: 'cheque', label: 'Cheque' },
  { value: 'pay_later', label: 'Pay Later' },
]

const ITEMS_PER_PAGE = 10

export function PurchasesScreen() {
  const { currentBranch, branches } = useBranch()
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'

  // Data
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])

  // View state
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  // Filter state
  const [filterSupplierId, setFilterSupplierId] = useState<string>('all')
  const [filterBranchId, setFilterBranchId] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterPaymentStatus, setFilterPaymentStatus] = useState<string>('all')
  const [filterDateFrom, setFilterDateFrom] = useState<string>('')
  const [filterDateTo, setFilterDateTo] = useState<string>('')

  // Create dialog state
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('')
  const [selectedBranchId, setSelectedBranchId] = useState<string>('')
  const [shippingCost, setShippingCost] = useState<string>('0')
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState<string>('')
  const [notes, setNotes] = useState<string>('')
  const [purchaseItems, setPurchaseItems] = useState<PurchaseItemInput[]>([])
  const [paymentMethod, setPaymentMethod] = useState<string>('cash')
  const [isSaving, setIsSaving] = useState(false)

  // Pay off dialog state
  const [isPayOffDialogOpen, setIsPayOffDialogOpen] = useState(false)
  const [payingOffPurchase, setPayingOffPurchase] = useState<Purchase | null>(null)
  const [payOffMethod, setPayOffMethod] = useState<string>('cash')
  const [payOffReference, setPayOffReference] = useState<string>('')
  const [payOffNotes, setPayOffNotes] = useState<string>('')
  const [isPayingOff, setIsPayingOff] = useState(false)
  const [payMode, setPayMode] = useState<'full' | 'partial'>('full')
  const [partialAmount, setPartialAmount] = useState<string>('')

  // Add item state
  const [selectedProductId, setSelectedProductId] = useState<string>('')
  const [itemQuantity, setItemQuantity] = useState<string>('1')
  const [itemUnitCost, setItemUnitCost] = useState<string>('')

  // View dialog state
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [viewingPurchase, setViewingPurchase] = useState<Purchase | null>(null)
  const [viewingItems, setViewingItems] = useState<PurchaseItem[]>([])
  const [viewingSupplier, setViewingSupplier] = useState<Supplier | null>(null)
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)

  // Reverse dialog state
  const [reversingPurchase, setReversingPurchase] = useState<Purchase | null>(null)
  const [isReentry, setIsReentry] = useState(false)
  const [reentrySourcePO, setReentrySourcePO] = useState<string>('')

  // Receive dialog state
  const [isReceiveDialogOpen, setIsReceiveDialogOpen] = useState(false)
  const [receivingPurchase, setReceivingPurchase] = useState<Purchase | null>(null)
  const [receivingItems, setReceivingItems] = useState<PurchaseItem[]>([])
  const [receiveQuantities, setReceiveQuantities] = useState<Record<number, string>>({})
  const [isReceiving, setIsReceiving] = useState(false)

  // Summary
  const [summary, setSummary] = useState<PurchaseSummary>({
    totalPurchases: 0,
    totalSpent: 0,
    thisMonthCount: 0,
    thisMonthSpent: 0,
    pendingCount: 0,
    pendingAmount: 0,
  })

  // Fetch data
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true)
      const [purchasesResult, productsResult, suppliersResult] = await Promise.all([
        window.api.purchases.getAll({ limit: 1000 }),
        window.api.products.getAll({ limit: 1000, isActive: true }),
        window.api.suppliers.getAll({ limit: 1000 }),
      ])

      if (purchasesResult.success && purchasesResult.data) {
        setPurchases(purchasesResult.data)
        calculateSummary(purchasesResult.data)
      }
      if (productsResult.success && productsResult.data) {
        setProducts(productsResult.data)
      }
      if (suppliersResult.success && suppliersResult.data) {
        setSuppliers(suppliersResult.data)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Calculate summary
  const calculateSummary = (purchasesData: Purchase[]) => {
    const currentMonth = new Date().toISOString().slice(0, 7)
    const nonCancelled = purchasesData.filter(p => p.status !== 'cancelled')
    const thisMonthPurchases = nonCancelled.filter(p => p.createdAt?.startsWith(currentMonth))
    const pendingPurchases = nonCancelled.filter(p => p.status !== 'received')

    setSummary({
      totalPurchases: nonCancelled.length,
      totalSpent: nonCancelled.reduce((sum, p) => sum + (p.totalAmount || 0), 0),
      thisMonthCount: thisMonthPurchases.length,
      thisMonthSpent: thisMonthPurchases.reduce((sum, p) => sum + (p.totalAmount || 0), 0),
      pendingCount: pendingPurchases.length,
      pendingAmount: pendingPurchases.reduce((sum, p) => sum + (p.totalAmount || 0), 0),
    })
  }

  // Helper functions
  const getSupplierName = (supplierId: number): string => {
    const supplier = suppliers.find(s => s.id === supplierId)
    return supplier?.name || 'Unknown'
  }

  const getBranchName = (branchId: number): string => {
    const branch = branches.find(b => b.id === branchId)
    return branch?.name || 'Unknown'
  }

  const getProductName = (productId: number): string => {
    const product = products.find(p => p.id === productId)
    return product ? `${product.name} (${product.code})` : 'Unknown'
  }

  const getProduct = (productId: number): Product | undefined => {
    return products.find(p => p.id === productId)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline">Draft</Badge>
      case 'ordered':
        return <Badge variant="info">Ordered</Badge>
      case 'partial':
        return <Badge variant="warning">Partial</Badge>
      case 'received':
        return <Badge variant="success">Received</Badge>
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>
      case 'reversed':
        return <Badge variant="destructive">Reversed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge variant="success">Paid</Badge>
      case 'partial':
        return <Badge variant="warning">Partial</Badge>
      case 'pending':
        return <Badge variant="destructive">Pending</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Filtering
  const filteredPurchases = useMemo(() => {
    return purchases.filter(purchase => {
      const search = searchTerm.toLowerCase()
      const matchesSearch =
        purchase.purchaseOrderNumber.toLowerCase().includes(search) ||
        getSupplierName(purchase.supplierId).toLowerCase().includes(search) ||
        getBranchName(purchase.branchId).toLowerCase().includes(search)

      if (!matchesSearch) return false
      if (filterSupplierId !== 'all' && purchase.supplierId !== parseInt(filterSupplierId)) return false
      if (filterBranchId !== 'all' && purchase.branchId !== parseInt(filterBranchId)) return false
      if (filterStatus !== 'all' && purchase.status !== filterStatus) return false
      if (filterPaymentStatus !== 'all' && purchase.paymentStatus !== filterPaymentStatus) return false

      if (filterDateFrom) {
        const purchaseDate = new Date(purchase.createdAt).toISOString().split('T')[0]
        if (purchaseDate < filterDateFrom) return false
      }
      if (filterDateTo) {
        const purchaseDate = new Date(purchase.createdAt).toISOString().split('T')[0]
        if (purchaseDate > filterDateTo) return false
      }

      return true
    })
  }, [purchases, searchTerm, filterSupplierId, filterBranchId, filterStatus, filterPaymentStatus, filterDateFrom, filterDateTo, suppliers, branches])

  // Sort and paginate
  const sortedPurchases = useMemo(() => {
    return [...filteredPurchases].sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  }, [filteredPurchases])

  const totalPages = Math.ceil(sortedPurchases.length / ITEMS_PER_PAGE) || 1
  const paginatedPurchases = sortedPurchases.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const filteredTotalAmount = filteredPurchases.reduce((sum, p) => sum + (p.totalAmount || 0), 0)

  // Calculate purchase total
  const calculateTotal = (): number => {
    const itemsTotal = purchaseItems.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0)
    return itemsTotal + (parseFloat(shippingCost) || 0)
  }

  // Add item to purchase
  const handleAddItem = () => {
    if (!selectedProductId || !itemQuantity || !itemUnitCost) {
      return
    }

    const productId = parseInt(selectedProductId)
    const exists = purchaseItems.find(item => item.productId === productId)
    if (exists) {
      alert('Product already added. Remove it first to change quantity.')
      return
    }

    setPurchaseItems([...purchaseItems, {
      productId,
      quantity: parseInt(itemQuantity),
      unitCost: parseFloat(itemUnitCost),
    }])

    setSelectedProductId('')
    setItemQuantity('1')
    setItemUnitCost('')
  }

  // Remove item from purchase
  const handleRemoveItem = (productId: number) => {
    setPurchaseItems(purchaseItems.filter(item => item.productId !== productId))
  }

  // Auto-fill cost price when product selected
  const handleProductSelect = (productId: string) => {
    setSelectedProductId(productId)
    const product = products.find(p => p.id === parseInt(productId))
    if (product) {
      setItemUnitCost(product.costPrice.toString())
    }
  }

  // Reset form
  const resetForm = () => {
    setSelectedSupplierId('')
    setSelectedBranchId(currentBranch?.id?.toString() || '')
    setShippingCost('0')
    setExpectedDeliveryDate('')
    setNotes('')
    setPurchaseItems([])
    setSelectedProductId('')
    setItemQuantity('1')
    setItemUnitCost('')
    setPaymentMethod('cash')
  }

  // Open create dialog
  const handleOpenCreateDialog = () => {
    resetForm()
    setIsReentry(false)
    setReentrySourcePO('')
    setSelectedBranchId(currentBranch?.id?.toString() || '')
    setIsCreateDialogOpen(true)
  }

  // Submit purchase
  const handleCreatePurchase = async () => {
    if (!selectedSupplierId || !selectedBranchId) {
      alert('Please select supplier and branch')
      return
    }
    if (purchaseItems.length === 0) {
      alert('Please add at least one item')
      return
    }

    setIsSaving(true)
    try {
      const result = await window.api.purchases.create({
        supplierId: parseInt(selectedSupplierId),
        branchId: parseInt(selectedBranchId),
        items: purchaseItems,
        shippingCost: parseFloat(shippingCost) || 0,
        expectedDeliveryDate: expectedDeliveryDate || undefined,
        notes: notes || undefined,
        paymentMethod: paymentMethod as 'cash' | 'cheque' | 'pay_later',
      })

      if (result.success) {
        setIsCreateDialogOpen(false)
        setIsReentry(false)
        setReentrySourcePO('')
        resetForm()
        fetchData()
      } else {
        alert(result.message || 'Failed to create purchase')
      }
    } catch (error) {
      console.error('Create purchase error:', error)
      alert('An error occurred while creating purchase')
    } finally {
      setIsSaving(false)
    }
  }

  // View purchase details
  const handleViewPurchase = async (purchase: Purchase) => {
    try {
      setIsLoadingDetails(true)
      setViewingPurchase(purchase)
      setIsViewDialogOpen(true)

      const result = await window.api.purchases.getById(purchase.id)
      if (result.success && result.data) {
        setViewingItems(result.data.items || [])
        setViewingSupplier(result.data.supplier || null)
      }

      let paymentHistory: Array<{
        id: number
        amount: number
        paymentMethod: string
        referenceNumber: string | null
        notes: string | null
        paymentDate: string
      }> = []
      try {
        const payablesRes = await window.api.payables.getAll({ limit: 1000 } as Record<string, unknown>)
        const linkedPayable = (payablesRes?.data ?? []).find(
          (p: { purchaseId: number | null }) => p.purchaseId === purchase.id
        )
        if (linkedPayable) {
          const paymentsRes = await window.api.payables.getPayments(linkedPayable.id)
          if (paymentsRes?.success) paymentHistory = paymentsRes.data ?? []
        }
      } catch {
        paymentHistory = []
      }

      setViewingPurchase({ ...purchase, paymentHistory })
    } catch (error) {
      console.error('Error fetching purchase details:', error)
    } finally {
      setIsLoadingDetails(false)
    }
  }

  // Open receive dialog
  const handleOpenReceiveDialog = async (purchase: Purchase) => {
    try {
      setIsLoadingDetails(true)
      const result = await window.api.purchases.getById(purchase.id)
      if (result.success && result.data) {
        setReceivingPurchase(purchase)
        setReceivingItems(result.data.items || [])
        // Initialize receive quantities
        const quantities: Record<number, string> = {}
        result.data.items?.forEach((item: PurchaseItem) => {
          const remaining = item.quantity - item.receivedQuantity
          quantities[item.id] = remaining > 0 ? remaining.toString() : '0'
        })
        setReceiveQuantities(quantities)
        setIsReceiveDialogOpen(true)
      }
    } catch (error) {
      console.error('Error fetching purchase details:', error)
    } finally {
      setIsLoadingDetails(false)
    }
  }

  // Receive items
  const handleReceiveItems = async () => {
    if (!receivingPurchase) return

    const itemsToReceive = Object.entries(receiveQuantities)
      .map(([itemId, qty]) => ({
        itemId: parseInt(itemId),
        receivedQuantity: parseInt(qty) || 0,
      }))
      .filter(item => item.receivedQuantity > 0)

    if (itemsToReceive.length === 0) {
      alert('Please enter quantities to receive')
      return
    }

    setIsReceiving(true)
    try {
      const result = await window.api.purchases.receive(receivingPurchase.id, itemsToReceive)
      if (result.success) {
        setIsReceiveDialogOpen(false)
        setReceivingPurchase(null)
        setReceivingItems([])
        setReceiveQuantities({})
        fetchData()
      } else {
        alert(result.message || 'Failed to receive items')
      }
    } catch (error) {
      console.error('Receive error:', error)
      alert('An error occurred while receiving items')
    } finally {
      setIsReceiving(false)
    }
  }

  // Update status
  const handleUpdateStatus = async (purchaseId: number, newStatus: string) => {
    try {
      const result = await window.api.purchases.updateStatus(purchaseId, newStatus)
      if (result.success) {
        fetchData()
      } else {
        alert(result.message || 'Failed to update status')
      }
    } catch (error) {
      console.error('Update status error:', error)
    }
  }

  // Open pay off dialog
  const handleOpenPayOffDialog = (purchase: Purchase) => {
    setPayingOffPurchase(purchase)
    setPayOffMethod('cash')
    setPayOffReference('')
    setPayOffNotes('')
    setPayMode('full')
    setPartialAmount('')
    setIsPayOffDialogOpen(true)
  }

  // Pay off purchase
  const handlePayOffPurchase = async () => {
    if (!payingOffPurchase) return

    setIsPayingOff(true)
    try {
      if (payMode === 'partial') {
        const amt = Number.parseFloat(partialAmount)
        const max = payingOffPurchase?.remainingAmount ?? payingOffPurchase?.totalAmount ?? 0
        if (!Number.isFinite(amt) || amt <= 0) {
          alert('Enter a valid amount greater than 0')
          return
        }
        if (amt > max) {
          alert(`Amount cannot exceed ${formatCurrency(max)}`)
          return
        }
        const result = await window.api.purchases.recordPartialPayment(payingOffPurchase.id, {
          amount: amt,
          paymentMethod: payOffMethod,
          referenceNumber: payOffReference || undefined,
          notes: payOffNotes || undefined,
        })
        if (result.success) {
          setIsPayOffDialogOpen(false)
          setPayingOffPurchase(null)
          fetchData()
        } else {
          alert(result.message || 'Failed to record partial payment')
        }
      } else {
        const result = await window.api.purchases.payOff(payingOffPurchase.id, {
          paymentMethod: payOffMethod,
          referenceNumber: payOffReference || undefined,
          notes: payOffNotes || undefined,
        })

        if (result.success) {
          setIsPayOffDialogOpen(false)
          setPayingOffPurchase(null)
          fetchData()
        } else {
          alert(result.message || 'Failed to pay off purchase')
        }
      }
    } catch (error) {
      console.error('Pay off error:', error)
      alert('An error occurred while paying off purchase')
    } finally {
      setIsPayingOff(false)
    }
  }

  // Reverse purchase
  const handleOpenReverseDialog = (purchase: Purchase) => {
    setReversingPurchase(purchase)
  }

  const handleReversalConfirmed = (prefillDraft: Record<string, unknown>) => {
    const draft = prefillDraft as {
      supplierId: number
      branchId: number
      items: { productId: number; quantity: number; unitCost: number }[]
      shippingCost: number
      paymentMethod: 'cash' | 'cheque' | 'pay_later'
      notes: string
    }
    const sourcePO = reversingPurchase?.purchaseOrderNumber ?? ''
    setReversingPurchase(null)
    resetForm()
    setSelectedSupplierId(draft.supplierId.toString())
    setSelectedBranchId(draft.branchId.toString())
    setShippingCost(draft.shippingCost.toString())
    setPaymentMethod(draft.paymentMethod)
    setNotes(draft.notes)
    setPurchaseItems(draft.items)
    setIsReentry(true)
    setReentrySourcePO(sourcePO)
    setIsCreateDialogOpen(true)
    fetchData()
  }

  // Clear filters
  const clearFilters = () => {
    setSearchTerm('')
    setFilterSupplierId('all')
    setFilterBranchId('all')
    setFilterStatus('all')
    setFilterPaymentStatus('all')
    setFilterDateFrom('')
    setFilterDateTo('')
    setCurrentPage(1)
  }

  const hasActiveFilters = searchTerm || filterSupplierId !== 'all' || filterBranchId !== 'all' ||
    filterStatus !== 'all' || filterPaymentStatus !== 'all' || filterDateFrom || filterDateTo

  // Payment method icon helper
  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'cash':
        return <Banknote className="h-3.5 w-3.5 text-muted-foreground" />
      case 'cheque':
        return <FileText className="h-3.5 w-3.5 text-muted-foreground" />
      case 'pay_later':
        return <Clock className="h-3.5 w-3.5 text-muted-foreground" />
      default:
        return <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Loading purchases...</p>
        </div>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="space-y-4">

        {/* ── Header ── */}
        <div className="flex items-center justify-between gap-4">
          {/* Title + stat pills */}
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-semibold">Purchase Orders</h1>

            {/* Total purchases */}
            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium">
              <Package className="h-3 w-3 text-muted-foreground" />
              {summary.totalPurchases.toLocaleString()} orders
            </span>

            {/* Total spent */}
            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium">
              <DollarSign className="h-3 w-3 text-muted-foreground" />
              {formatCurrency(summary.totalSpent)}
            </span>

            {/* This month */}
            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium">
              <Calendar className="h-3 w-3 text-muted-foreground" />
              {summary.thisMonthCount} this month
              <span className="text-muted-foreground">·</span>
              {formatCurrency(summary.thisMonthSpent)}
            </span>

            {/* Pending delivery */}
            <span className={cn(
              'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
              summary.pendingCount > 0
                ? 'bg-warning/10 text-warning'
                : 'bg-muted text-muted-foreground'
            )}>
              <Truck className="h-3 w-3" />
              {summary.pendingCount} pending
            </span>
          </div>

          {/* Actions */}
          <div className="flex shrink-0 items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 w-8 p-0" onClick={fetchData}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Refresh</TooltipContent>
            </Tooltip>
            <Button size="sm" className="h-8" onClick={handleOpenCreateDialog}>
              <Plus className="mr-1.5 h-4 w-4" />
              New Purchase
            </Button>
          </div>
        </div>

        {/* ── Filter bar ── */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative min-w-[220px] flex-1">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search PO number, supplier, branch..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className="h-8 pl-8 pr-8 text-sm"
            />
            {searchTerm && (
              <button
                onClick={() => { setSearchTerm(''); setCurrentPage(1) }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Supplier filter */}
          <Select value={filterSupplierId} onValueChange={(value) => {
            setFilterSupplierId(value)
            setCurrentPage(1)
          }}>
            <SelectTrigger className="h-8 w-40 text-sm">
              <SelectValue placeholder="Supplier" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Suppliers</SelectItem>
              {suppliers.map((supplier) => (
                <SelectItem key={supplier.id} value={supplier.id.toString()}>
                  {supplier.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Branch filter */}
          <Select value={filterBranchId} onValueChange={(value) => {
            setFilterBranchId(value)
            setCurrentPage(1)
          }}>
            <SelectTrigger className="h-8 w-36 text-sm">
              <Filter className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
              <SelectValue placeholder="Branch" />
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

          {/* Order status filter */}
          <Select value={filterStatus} onValueChange={(value) => {
            setFilterStatus(value)
            setCurrentPage(1)
          }}>
            <SelectTrigger className="h-8 w-32 text-sm">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              {ORDER_STATUSES.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Payment status filter */}
          <Select value={filterPaymentStatus} onValueChange={(value) => {
            setFilterPaymentStatus(value)
            setCurrentPage(1)
          }}>
            <SelectTrigger className="h-8 w-32 text-sm">
              <SelectValue placeholder="Payment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Payment</SelectItem>
              {PAYMENT_STATUSES.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Date from */}
          <div className="flex items-center gap-1.5">
            <Label className="shrink-0 text-xs text-muted-foreground">From</Label>
            <Input
              type="date"
              value={filterDateFrom}
              onChange={(e) => {
                setFilterDateFrom(e.target.value)
                setCurrentPage(1)
              }}
              className="h-8 w-36 text-sm"
            />
          </div>

          {/* Date to */}
          <div className="flex items-center gap-1.5">
            <Label className="shrink-0 text-xs text-muted-foreground">To</Label>
            <Input
              type="date"
              value={filterDateTo}
              onChange={(e) => {
                setFilterDateTo(e.target.value)
                setCurrentPage(1)
              }}
              className="h-8 w-36 text-sm"
            />
          </div>

          {/* Clear filters */}
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" className="h-8 px-2 text-xs" onClick={clearFilters}>
              <X className="mr-1 h-3.5 w-3.5" />
              Clear
            </Button>
          )}
        </div>

        {/* ── Table ── */}
        {paginatedPurchases.length === 0 ? (
          <div className="flex h-40 items-center justify-center rounded-lg border border-dashed text-muted-foreground">
            <div className="text-center">
              <Package className="mx-auto mb-2 h-10 w-10 opacity-40" />
              <p className="text-sm">No purchases found</p>
              {hasActiveFilters && (
                <Button variant="link" size="sm" className="mt-1 text-xs" onClick={clearFilters}>
                  Clear filters to see all purchases
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    PO Number
                  </TableHead>
                  <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Date
                  </TableHead>
                  <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Supplier
                  </TableHead>
                  <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Branch
                  </TableHead>
                  <TableHead className="text-right text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Amount
                  </TableHead>
                  <TableHead className="w-[90px] text-right text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Paid
                  </TableHead>
                  <TableHead className="w-[90px] text-right text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Remaining
                  </TableHead>
                  <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Method
                  </TableHead>
                  <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Order
                  </TableHead>
                  <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Payment
                  </TableHead>
                  <TableHead className="w-[88px] text-right text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedPurchases.map((purchase) => (
                  <TableRow key={purchase.id} className="group h-9">
                    <TableCell className="py-1.5">
                      <div className="flex items-center gap-1.5">
                        <FileText className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                        <span className="font-mono text-xs">{purchase.purchaseOrderNumber}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-1.5">
                      <span className="text-xs text-muted-foreground">
                        {formatDateTime(purchase.createdAt)}
                      </span>
                    </TableCell>
                    <TableCell className="py-1.5">
                      <span className="text-sm">{getSupplierName(purchase.supplierId)}</span>
                    </TableCell>
                    <TableCell className="py-1.5">
                      <span className="text-sm">{getBranchName(purchase.branchId)}</span>
                    </TableCell>
                    <TableCell className="py-1.5 text-right">
                      <div className="flex flex-col items-end">
                        <span className="text-sm font-medium">
                          {formatCurrency(purchase.totalAmount)}
                        </span>
                        {purchase.shippingCost > 0 && (
                          <span className="text-[10px] text-muted-foreground">
                            +{formatCurrency(purchase.shippingCost)} ship
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-1.5 text-right text-sm tabular-nums text-green-600">
                      {formatCurrency(purchase.paidAmount ?? 0)}
                    </TableCell>
                    <TableCell
                      className={`py-1.5 text-right text-sm tabular-nums font-medium ${
                        (purchase.remainingAmount ?? 0) > 0 ? 'text-red-600' : 'text-muted-foreground'
                      }`}
                    >
                      {formatCurrency(purchase.remainingAmount ?? 0)}
                    </TableCell>
                    <TableCell className="py-1.5">
                      <div className="flex items-center gap-1">
                        {getPaymentMethodIcon(purchase.paymentMethod)}
                        <span className="text-xs capitalize">
                          {purchase.paymentMethod?.replace('_', ' ') || 'N/A'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-1.5">
                      {getStatusBadge(purchase.status)}
                    </TableCell>
                    <TableCell className="py-1.5">
                      {getPaymentStatusBadge(purchase.paymentStatus)}
                    </TableCell>
                    <TableCell className="py-1.5 text-right">
                      <div className="flex justify-end gap-0.5">
                        {/* View */}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 opacity-0 group-hover:opacity-100"
                              onClick={() => handleViewPurchase(purchase)}
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>View Details</TooltipContent>
                        </Tooltip>

                        {/* Receive */}
                        {purchase.status !== 'received' && purchase.status !== 'cancelled' && purchase.status !== 'reversed' && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 opacity-0 group-hover:opacity-100"
                                onClick={() => handleOpenReceiveDialog(purchase)}
                              >
                                <PackageCheck className="h-3.5 w-3.5 text-success" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Receive Items</TooltipContent>
                          </Tooltip>
                        )}

                        {/* Pay off */}
                        {purchase.paymentStatus === 'pending' && purchase.status !== 'cancelled' && purchase.status !== 'reversed' && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 opacity-0 group-hover:opacity-100"
                                onClick={() => handleOpenPayOffDialog(purchase)}
                              >
                                <Banknote className="h-3.5 w-3.5 text-primary" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Pay Off</TooltipContent>
                          </Tooltip>
                        )}

                        {/* Reverse (admin only) */}
                        {isAdmin && purchase.status !== 'cancelled' && purchase.status !== 'reversed' && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 opacity-0 group-hover:opacity-100"
                                onClick={() => handleOpenReverseDialog(purchase)}
                              >
                                <RotateCcw className="h-3.5 w-3.5 text-destructive" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Reverse &amp; Re-enter</TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* ── Pagination ── */}
        {sortedPurchases.length > 0 && (
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
              {Math.min(currentPage * ITEMS_PER_PAGE, sortedPurchases.length)} of{' '}
              {sortedPurchases.length} purchases
              <span className="ml-3 font-medium text-foreground">
                Total: {formatCurrency(filteredTotalAmount)}
              </span>
            </p>

            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="min-w-[80px] text-center text-xs text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        )}

        {/* ── Create Purchase Dialog ── */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Create Purchase Order
              </DialogTitle>
              <DialogDescription>
                Add a new purchase order from a supplier
              </DialogDescription>
            </DialogHeader>

            {isReentry && (
              <div className="flex items-start gap-2 rounded border border-amber-500/30 bg-amber-500/5 p-2 text-xs text-amber-700 dark:text-amber-400">
                <RotateCcw className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                <div>
                  Re-entry of reversed{' '}
                  <span className="font-mono font-medium">{reentrySourcePO}</span>. Edit any
                  fields before saving — a fresh purchase order will be created.
                </div>
              </div>
            )}

            <div className="space-y-6">
              {/* Supplier and Branch */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Supplier *</Label>
                  <Select value={selectedSupplierId} onValueChange={setSelectedSupplierId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map((supplier) => (
                        <SelectItem key={supplier.id} value={supplier.id.toString()}>
                          {supplier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Branch *</Label>
                  <Select value={selectedBranchId} onValueChange={setSelectedBranchId}>
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
              </div>

              {/* Shipping and Delivery */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Shipping Cost</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={shippingCost}
                    onChange={(e) => setShippingCost(e.target.value)}
                    placeholder="0.00"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Expected Delivery</Label>
                  <Input
                    type="date"
                    value={expectedDeliveryDate}
                    onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label>Notes</Label>
                <Input
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Optional notes..."
                />
              </div>

              {/* Payment Method */}
              <div className="space-y-2">
                <Label>Payment Method *</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_METHODS.map((method) => (
                      <SelectItem key={method.value} value={method.value}>
                        {method.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {paymentMethod === 'pay_later' && (
                  <p className="text-xs text-muted-foreground">
                    This will create an account payable entry for tracking
                  </p>
                )}
              </div>

              <Separator />

              {/* Add Items Section */}
              <div className="space-y-4">
                <h4 className="font-medium">Add Items</h4>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <Select value={selectedProductId} onValueChange={handleProductSelect}>
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
                  <div className="w-24">
                    <Input
                      type="number"
                      min="1"
                      value={itemQuantity}
                      onChange={(e) => setItemQuantity(e.target.value)}
                      placeholder="Qty"
                    />
                  </div>
                  <div className="w-32">
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={itemUnitCost}
                      onChange={(e) => setItemUnitCost(e.target.value)}
                      placeholder="Unit Cost"
                    />
                  </div>
                  <Button onClick={handleAddItem} disabled={!selectedProductId || !itemQuantity || !itemUnitCost}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {/* Items Table */}
                {purchaseItems.length > 0 && (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead className="text-center">Qty</TableHead>
                          <TableHead className="text-right">Unit Cost</TableHead>
                          <TableHead className="text-right">Subtotal</TableHead>
                          <TableHead className="w-10"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {purchaseItems.map((item) => (
                          <TableRow key={item.productId}>
                            <TableCell>{getProductName(item.productId)}</TableCell>
                            <TableCell className="text-center">{item.quantity}</TableCell>
                            <TableCell className="text-right">{formatCurrency(item.unitCost)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(item.quantity * item.unitCost)}</TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleRemoveItem(item.productId)}
                              >
                                <X className="h-4 w-4 text-destructive" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}

                {/* Total */}
                <div className="flex justify-end">
                  <div className="w-64 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Items Subtotal:</span>
                      <span>{formatCurrency(purchaseItems.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0))}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Shipping:</span>
                      <span>{formatCurrency(parseFloat(shippingCost) || 0)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold">
                      <span>Total:</span>
                      <span>{formatCurrency(calculateTotal())}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreatePurchase} disabled={isSaving || purchaseItems.length === 0}>
                {isSaving ? 'Creating...' : 'Create Purchase'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ── View Purchase Dialog ── */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Purchase Order Details
              </DialogTitle>
              <DialogDescription>
                {viewingPurchase?.purchaseOrderNumber}
              </DialogDescription>
            </DialogHeader>

            {viewingPurchase && (
              <div className="space-y-6">
                {/* Purchase Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">PO Number</p>
                    <p className="font-mono font-medium">{viewingPurchase.purchaseOrderNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="font-medium">{formatDateTime(viewingPurchase.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Supplier</p>
                    <p className="font-medium">{viewingSupplier?.name || getSupplierName(viewingPurchase.supplierId)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Branch</p>
                    <p className="font-medium">{getBranchName(viewingPurchase.branchId)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Order Status</p>
                    {getStatusBadge(viewingPurchase.status)}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Payment Method</p>
                    <p className="font-medium capitalize">
                      {viewingPurchase.paymentMethod?.replace('_', ' ') || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Payment Status</p>
                    {getPaymentStatusBadge(viewingPurchase.paymentStatus)}
                  </div>
                  {viewingPurchase.expectedDeliveryDate && (
                    <div>
                      <p className="text-sm text-muted-foreground">Expected Delivery</p>
                      <p className="font-medium">{viewingPurchase.expectedDeliveryDate}</p>
                    </div>
                  )}
                  {viewingPurchase.receivedDate && (
                    <div>
                      <p className="text-sm text-muted-foreground">Received Date</p>
                      <p className="font-medium">{formatDateTime(viewingPurchase.receivedDate)}</p>
                    </div>
                  )}
                </div>

                <Separator />

                {/* Items */}
                <div>
                  <h4 className="font-medium mb-3">Items</h4>
                  {isLoadingDetails ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    </div>
                  ) : viewingItems.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">No items found</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead className="text-center">Ordered</TableHead>
                          <TableHead className="text-center">Received</TableHead>
                          <TableHead className="text-right">Unit Cost</TableHead>
                          <TableHead className="text-right">Total</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {viewingItems.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>
                              {item.product?.name || getProductName(item.productId)}
                            </TableCell>
                            <TableCell className="text-center">{item.quantity}</TableCell>
                            <TableCell className="text-center">
                              <span className={cn(
                                item.receivedQuantity >= item.quantity ? 'text-success' : 'text-warning'
                              )}>
                                {item.receivedQuantity}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">{formatCurrency(item.unitCost)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(item.totalCost)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>

                <Separator />

                {/* Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(viewingPurchase.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping:</span>
                    <span>{formatCurrency(viewingPurchase.shippingCost)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold">
                    <span>Total:</span>
                    <span>{formatCurrency(viewingPurchase.totalAmount)}</span>
                  </div>
                </div>

                {/* Notes */}
                {viewingPurchase.notes && (
                  <>
                    <Separator />
                    <div>
                      <p className="text-sm text-muted-foreground">Notes</p>
                      <p className="mt-1">{viewingPurchase.notes}</p>
                    </div>
                  </>
                )}

                {viewingPurchase?.paymentHistory && viewingPurchase.paymentHistory.length > 0 && (
                  <div className="mt-4 rounded-md border bg-card">
                    <div className="border-b px-3 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Payment History
                    </div>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                          <TableHead>Method</TableHead>
                          <TableHead>Reference</TableHead>
                          <TableHead>Notes</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {viewingPurchase.paymentHistory.map((p) => (
                          <TableRow key={p.id}>
                            <TableCell className="text-xs">{formatDateTime(p.paymentDate)}</TableCell>
                            <TableCell className="text-right text-xs tabular-nums">
                              {formatCurrency(p.amount)}
                            </TableCell>
                            <TableCell className="text-xs capitalize">
                              {p.paymentMethod.replace('_', ' ')}
                            </TableCell>
                            <TableCell className="text-xs">{p.referenceNumber ?? '—'}</TableCell>
                            <TableCell className="text-xs">{p.notes ?? '—'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                Close
              </Button>
              {viewingPurchase && viewingPurchase.paymentStatus === 'pending' && viewingPurchase.status !== 'cancelled' && (
                <Button
                  variant="secondary"
                  onClick={() => {
                    setIsViewDialogOpen(false)
                    handleOpenPayOffDialog(viewingPurchase)
                  }}
                >
                  <Banknote className="mr-2 h-4 w-4" />
                  Pay Off
                </Button>
              )}
              {viewingPurchase && viewingPurchase.status !== 'received' && viewingPurchase.status !== 'cancelled' && (
                <Button onClick={() => {
                  setIsViewDialogOpen(false)
                  handleOpenReceiveDialog(viewingPurchase)
                }}>
                  <PackageCheck className="mr-2 h-4 w-4" />
                  Receive Items
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ── Receive Items Dialog ── */}
        <Dialog open={isReceiveDialogOpen} onOpenChange={setIsReceiveDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <PackageCheck className="h-5 w-5 text-success" />
                Receive Items
              </DialogTitle>
              <DialogDescription>
                Enter quantities received for {receivingPurchase?.purchaseOrderNumber}
              </DialogDescription>
            </DialogHeader>

            {receivingPurchase && (
              <div className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead className="text-center">Ordered</TableHead>
                      <TableHead className="text-center">Already Received</TableHead>
                      <TableHead className="text-center">Receive Now</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {receivingItems.map((item) => {
                      const remaining = item.quantity - item.receivedQuantity
                      return (
                        <TableRow key={item.id}>
                          <TableCell>{item.product?.name || getProductName(item.productId)}</TableCell>
                          <TableCell className="text-center">{item.quantity}</TableCell>
                          <TableCell className="text-center">{item.receivedQuantity}</TableCell>
                          <TableCell className="text-center">
                            <Input
                              type="number"
                              min="0"
                              max={remaining}
                              value={receiveQuantities[item.id] || '0'}
                              onChange={(e) => setReceiveQuantities({
                                ...receiveQuantities,
                                [item.id]: e.target.value,
                              })}
                              className="w-20 mx-auto text-center"
                              disabled={remaining <= 0}
                            />
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>

                <div className="rounded-lg bg-muted p-4 text-sm">
                  <p className="text-muted-foreground">
                    Received items will be automatically added to inventory at the selected branch.
                  </p>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsReceiveDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleReceiveItems} disabled={isReceiving}>
                {isReceiving ? 'Receiving...' : 'Confirm Receipt'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ── Pay Off Purchase Dialog ── */}
        <Dialog open={isPayOffDialogOpen} onOpenChange={setIsPayOffDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Banknote className="h-5 w-5 text-primary" />
                Pay Off Purchase
              </DialogTitle>
              <DialogDescription>
                Record payment for {payingOffPurchase?.purchaseOrderNumber}
              </DialogDescription>
            </DialogHeader>

            {payingOffPurchase && (
              <div className="space-y-4">
                {/* Amount Display */}
                <div className="rounded-lg bg-muted p-4 text-center">
                  <p className="text-sm text-muted-foreground">Amount to Pay</p>
                  <p className="text-2xl font-bold text-primary">
                    {formatCurrency(payingOffPurchase.totalAmount)}
                  </p>
                </div>

                {/* Payment Method */}
                <div className="space-y-2">
                  <Label>Payment Method *</Label>
                  <Select value={payOffMethod} onValueChange={setPayOffMethod}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="cheque">Cheque</SelectItem>
                      <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Reference Number */}
                <div className="space-y-2">
                  <Label>Reference Number</Label>
                  <Input
                    value={payOffReference}
                    onChange={(e) => setPayOffReference(e.target.value)}
                    placeholder={payOffMethod === 'cheque' ? 'Cheque number' : 'Transaction reference'}
                  />
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Input
                    value={payOffNotes}
                    onChange={(e) => setPayOffNotes(e.target.value)}
                    placeholder="Optional notes..."
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant={payMode === 'full' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPayMode('full')}
                    >
                      Pay in Full
                    </Button>
                    <Button
                      type="button"
                      variant={payMode === 'partial' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setPayMode('partial')}
                    >
                      Partial Payment
                    </Button>
                  </div>

                  {payMode === 'partial' ? (
                    <div>
                      <Label htmlFor="partial-amount" className="text-xs">
                        Amount (max {formatCurrency(payingOffPurchase?.remainingAmount ?? payingOffPurchase?.totalAmount ?? 0)})
                      </Label>
                      <Input
                        id="partial-amount"
                        type="number"
                        min={0}
                        step="0.01"
                        max={payingOffPurchase?.remainingAmount ?? payingOffPurchase?.totalAmount}
                        value={partialAmount}
                        onChange={(e) => setPartialAmount(e.target.value)}
                      />
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      This will mark the purchase as paid and update the associated payable record.
                    </p>
                  )}
                </div>
              </div>
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsPayOffDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handlePayOffPurchase} disabled={isPayingOff}>
                {isPayingOff ? 'Processing...' : 'Confirm Payment'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reverse Dialog */}
        <ReverseDialog
          purchase={
            reversingPurchase
              ? {
                  id: reversingPurchase.id,
                  purchaseOrderNumber: reversingPurchase.purchaseOrderNumber,
                  supplierName: getSupplierName(reversingPurchase.supplierId),
                  totalAmount: reversingPurchase.totalAmount,
                  createdAt: reversingPurchase.createdAt,
                }
              : null
          }
          open={!!reversingPurchase}
          onClose={() => setReversingPurchase(null)}
          onConfirmed={handleReversalConfirmed}
        />

      </div>
    </TooltipProvider>
  )
}
