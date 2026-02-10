'use client'

import { useState, useEffect } from 'react'
import {
  RotateCcw,
  Search,
  Package,
  Trash2,
  Eye,
  TrendingDown,
  Banknote,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { getReturns, getReturnSummary, createReturn, deleteReturn, approveReturn, rejectReturn } from '@/actions/returns'
import { getSaleById } from '@/actions/sales'
import { toast } from 'sonner'
import { PageLoader } from '@/components/ui/page-loader'

type ReturnType = 'refund' | 'exchange' | 'store_credit'
type ReturnCondition = 'new' | 'good' | 'fair' | 'damaged'
type RefundMethod = 'cash' | 'card' | 'store_credit'

interface Return {
  return: {
    id: number
    returnNumber: string
    originalSaleId: number
    returnType: string
    refundMethod: string | null
    refundAmount: string
    returnDate: Date
  }
  customerName: string | null
}

interface SaleItem {
  item: {
    id: number
    saleId: number
    productId: number
    serialNumber: string | null
    quantity: number
    unitPrice: string
    costPrice: string
    discountPercent: string
    discountAmount: string
    taxAmount: string
    totalPrice: string
    createdAt: Date
  }
  productName: string | null
  productCode: string | null
}

interface ReturnItem extends SaleItem {
  selected: boolean
  returnQuantity: number
  condition: ReturnCondition
  restockable: boolean
}

interface Summary {
  totalReturns: number
  totalRefunded: string
  refundCount: number
  exchangeCount: number
  storeCreditCount: number
}

export default function ReturnsPage() {
  const [filterType, setFilterType] = useState<string>('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogStep, setDialogStep] = useState<'lookup' | 'items' | 'details' | 'confirm'>('lookup')
  const [loading, setLoading] = useState(true)
  const [returns, setReturns] = useState<Return[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)

  // Dialog state
  const [invoiceNumber, setInvoiceNumber] = useState('')
  const [lookingSale, setLookingSale] = useState(false)
  const [saleFound, setSaleFound] = useState(false)
  const [saleId, setSaleId] = useState<number | null>(null)
  const [customerId, setCustomerId] = useState<number | null>(null)
  const [branchId, setBranchId] = useState<number>(1)
  const [returnItems, setReturnItems] = useState<ReturnItem[]>([])
  const [returnType, setReturnType] = useState<ReturnType>('refund')
  const [refundMethod, setRefundMethod] = useState<RefundMethod>('cash')
  const [returnReason, setReturnReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
  const [rejectingReturnId, setRejectingReturnId] = useState<number | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')

  useEffect(() => {
    loadData()
  }, [filterType])

  async function loadData() {
    setLoading(true)
    try {
      const [returnsRes, summaryRes] = await Promise.all([
        getReturns({
          returnType: filterType !== 'all' ? filterType : undefined,
        }),
        getReturnSummary(),
      ])

      if (returnsRes.success) {
        setReturns(returnsRes.data)
      }
      if (summaryRes.success) {
        setSummary(summaryRes.data)
      }
    } catch (error) {
      console.error('Failed to load returns:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredReturns = returns

  // Calculate summary stats
  const totalReturns = summary?.totalReturns || 0
  const totalRefunded = Number(summary?.totalRefunded || 0)
  const refundsCount = summary?.refundCount || 0
  const exchangesCount = summary?.exchangeCount || 0

  const getReturnTypeBadge = (type: string) => {
    switch (type) {
      case 'refund':
        return <Badge variant="outline" className="text-[10px] border-blue-500/30 bg-blue-500/10 text-blue-400">Refund</Badge>
      case 'exchange':
        return <Badge variant="outline" className="text-[10px] border-purple-500/30 bg-purple-500/10 text-purple-400">Exchange</Badge>
      case 'store_credit':
        return <Badge variant="outline" className="text-[10px] border-amber-500/30 bg-amber-500/10 text-amber-400">Store Credit</Badge>
    }
  }

  const getConditionBadge = (condition: ReturnCondition) => {
    switch (condition) {
      case 'new':
        return <Badge variant="outline" className="text-[10px] border-green-500/30 bg-green-500/10 text-green-400">New</Badge>
      case 'good':
        return <Badge variant="outline" className="text-[10px] border-blue-500/30 bg-blue-500/10 text-blue-400">Good</Badge>
      case 'fair':
        return <Badge variant="outline" className="text-[10px] border-yellow-500/30 bg-yellow-500/10 text-yellow-400">Fair</Badge>
      case 'damaged':
        return <Badge variant="outline" className="text-[10px] border-red-500/30 bg-red-500/10 text-red-400">Damaged</Badge>
    }
  }

  const getRefundMethodLabel = (method: string | null) => {
    if (!method) return '-'
    switch (method) {
      case 'cash':
        return 'Cash'
      case 'card':
        return 'Card'
      case 'store_credit':
        return 'Store Credit'
      default:
        return method
    }
  }

  const handleLookupSale = async () => {
    if (!invoiceNumber.trim()) return

    setLookingSale(true)
    try {
      // First, search for the sale by invoice number
      // We'll use getSales with search parameter - need to get sale ID from returned data
      // For now, let's assume the invoice is like "INV-2026-02-05-001" and we extract the ID
      // In production, you'd want getSaleByInvoiceNumber in actions

      // Mock implementation: try to find sale by searching
      // You may need to add a getSaleByInvoiceNumber action
      const saleIdMatch = invoiceNumber.match(/\d+$/)
      if (!saleIdMatch) {
        alert('Sale not found')
        return
      }

      const possibleSaleId = parseInt(saleIdMatch[0])
      const saleRes = await getSaleById(possibleSaleId)

      if (saleRes.success && saleRes.data) {
        setSaleFound(true)
        setSaleId(saleRes.data.sale.id)
        setCustomerId(saleRes.data.sale.customerId || null)
        setBranchId(saleRes.data.sale.branchId)

        // Map items for return
        setReturnItems(
          saleRes.data.items.map((item: SaleItem) => ({
            ...item,
            selected: false,
            returnQuantity: 1,
            condition: 'good' as ReturnCondition,
            restockable: true,
          }))
        )
        setDialogStep('items')
      } else {
        alert('Sale not found. Please check the invoice number.')
      }
    } catch (error) {
      console.error('Failed to lookup sale:', error)
      alert('Failed to lookup sale')
    } finally {
      setLookingSale(false)
    }
  }

  const handleItemSelection = (itemId: number, checked: boolean) => {
    setReturnItems((prev) =>
      prev.map((item) =>
        item.item.id === itemId ? { ...item, selected: checked } : item
      )
    )
  }

  const handleReturnQuantityChange = (itemId: number, quantity: number) => {
    setReturnItems((prev) =>
      prev.map((item) =>
        item.item.id === itemId
          ? { ...item, returnQuantity: Math.min(quantity, item.item.quantity) }
          : item
      )
    )
  }

  const handleConditionChange = (itemId: number, condition: ReturnCondition) => {
    setReturnItems((prev) =>
      prev.map((item) =>
        item.item.id === itemId ? { ...item, condition } : item
      )
    )
  }

  const handleRestockableChange = (itemId: number, restockable: boolean) => {
    setReturnItems((prev) =>
      prev.map((item) =>
        item.item.id === itemId ? { ...item, restockable } : item
      )
    )
  }

  const calculateRefundAmount = () => {
    return returnItems
      .filter((item) => item.selected)
      .reduce((sum, item) => sum + Number(item.item.unitPrice) * item.returnQuantity, 0)
  }

  const handleProceedToDetails = () => {
    const hasSelectedItems = returnItems.some((item) => item.selected)
    if (hasSelectedItems) {
      setDialogStep('details')
    }
  }

  const handleProceedToConfirm = () => {
    if (returnReason.trim()) {
      setDialogStep('confirm')
    }
  }

  const handleProcessReturn = async () => {
    if (!saleId) return

    setSubmitting(true)
    try {
      const selectedItems = returnItems.filter((item) => item.selected)

      const result = await createReturn({
        originalSaleId: saleId,
        customerId: customerId || undefined,
        branchId,
        returnType,
        refundMethod: returnType === 'refund' ? refundMethod : undefined,
        reason: returnReason,
        items: selectedItems.map((item) => ({
          saleItemId: item.item.id,
          productId: item.item.productId,
          quantity: item.returnQuantity,
          unitPrice: Number(item.item.unitPrice),
          condition: item.condition,
          restockable: item.restockable,
        })),
      })

      if (result.success) {
        toast.success('Return processed successfully')
        setDialogOpen(false)
        resetDialog()
        loadData()
      } else {
        toast.error((result as any).message || 'Failed to process return')
      }
    } catch (error) {
      console.error('Failed to process return:', error)
      toast.error('Failed to process return')
    } finally {
      setSubmitting(false)
    }
  }

  const resetDialog = () => {
    setDialogStep('lookup')
    setInvoiceNumber('')
    setSaleFound(false)
    setSaleId(null)
    setCustomerId(null)
    setReturnItems([])
    setReturnType('refund')
    setRefundMethod('cash')
    setReturnReason('')
  }

  const handleDialogClose = () => {
    setDialogOpen(false)
    resetDialog()
  }

  async function handleDelete(id: number) {
    if (!confirm('Are you sure you want to delete this return?')) return

    try {
      const res = await deleteReturn(id)
      if (res.success) {
        toast.success('Return deleted successfully')
        loadData()
      } else {
        toast.error((res as any).message || 'Failed to delete return')
      }
    } catch (error) {
      console.error('Failed to delete return:', error)
      toast.error('Failed to delete return')
    }
  }

  async function handleApprove(id: number) {
    if (!confirm('Approve this return and process refund?')) return

    try {
      const res = await approveReturn(id)
      if (res.success) {
        toast.success('Return approved successfully')
        loadData()
      } else {
        toast.error(res.message || 'Failed to approve return')
      }
    } catch (error) {
      console.error('Failed to approve return:', error)
      toast.error('Failed to approve return')
    }
  }

  function handleRejectClick(id: number) {
    setRejectingReturnId(id)
    setRejectionReason('')
    setRejectDialogOpen(true)
  }

  async function handleRejectConfirm() {
    if (!rejectingReturnId) return

    try {
      const res = await rejectReturn(rejectingReturnId, rejectionReason || undefined)
      if (res.success) {
        toast.success('Return rejected')
        setRejectDialogOpen(false)
        setRejectingReturnId(null)
        setRejectionReason('')
        loadData()
      } else {
        toast.error(res.message || 'Failed to reject return')
      }
    } catch (error) {
      console.error('Failed to reject return:', error)
      toast.error('Failed to reject return')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Returns</h1>
          <p className="text-sm text-neutral-400 mt-1">
            Process customer returns and refunds
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="brass-glow">
              <RotateCcw className="mr-2 h-4 w-4" />
              Process Return
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Process Return</DialogTitle>
              <DialogDescription>
                {dialogStep === 'lookup' && 'Enter the original invoice number to lookup the sale'}
                {dialogStep === 'items' && 'Select items being returned and specify details'}
                {dialogStep === 'details' && 'Specify return type and details'}
                {dialogStep === 'confirm' && 'Review and confirm the return'}
              </DialogDescription>
            </DialogHeader>

            {/* Step 1: Sale Lookup */}
            {dialogStep === 'lookup' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="invoice">Original Invoice Number</Label>
                  <div className="flex gap-2">
                    <Input
                      id="invoice"
                      placeholder="e.g., INV-1245"
                      value={invoiceNumber}
                      onChange={(e) => setInvoiceNumber(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleLookupSale()
                      }}
                    />
                    <Button onClick={handleLookupSale} disabled={lookingSale}>
                      {lookingSale ? '...' : <Search className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Select Items */}
            {dialogStep === 'items' && (
              <div className="space-y-4">
                <div className="rounded-lg border border-neutral-800 bg-neutral-950/50 p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm font-medium">Invoice: {invoiceNumber}</p>
                      <p className="text-xs text-neutral-400">Select items to return</p>
                    </div>
                    <Badge variant="outline" className="text-[10px]">
                      {returnItems.filter((item) => item.selected).length} selected
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    {returnItems.map((item) => (
                      <div
                        key={item.item.id}
                        className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-3 space-y-3"
                      >
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={item.selected}
                            onCheckedChange={(checked) =>
                              handleItemSelection(item.item.id, checked as boolean)
                            }
                            className="mt-1"
                          />
                          <div className="flex-1 space-y-2">
                            <div>
                              <p className="font-medium text-sm">{item.productName}</p>
                              <p className="text-xs text-neutral-400">
                                Original Qty: {item.item.quantity} × Rs. {Number(item.item.unitPrice).toLocaleString()}
                              </p>
                            </div>

                            {item.selected && (
                              <div className="grid grid-cols-3 gap-3 pt-2">
                                <div className="space-y-1">
                                  <Label className="text-xs">Return Qty</Label>
                                  <Input
                                    type="number"
                                    min="1"
                                    max={item.item.quantity}
                                    value={item.returnQuantity}
                                    onChange={(e) =>
                                      handleReturnQuantityChange(
                                        item.item.id,
                                        parseInt(e.target.value) || 1
                                      )
                                    }
                                    className="h-8"
                                  />
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-xs">Condition</Label>
                                  <Select
                                    value={item.condition}
                                    onValueChange={(value) =>
                                      handleConditionChange(item.item.id, value as ReturnCondition)
                                    }
                                  >
                                    <SelectTrigger className="h-8">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="new">New</SelectItem>
                                      <SelectItem value="good">Good</SelectItem>
                                      <SelectItem value="fair">Fair</SelectItem>
                                      <SelectItem value="damaged">Damaged</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-1">
                                  <Label className="text-xs">Restockable</Label>
                                  <div className="flex items-center h-8 px-3 rounded-md border border-neutral-800 bg-neutral-950">
                                    <Checkbox
                                      checked={item.restockable}
                                      onCheckedChange={(checked) =>
                                        handleRestockableChange(item.item.id, checked as boolean)
                                      }
                                    />
                                    <span className="ml-2 text-xs">Yes</span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogStep('lookup')}>
                    Back
                  </Button>
                  <Button
                    onClick={handleProceedToDetails}
                    disabled={!returnItems.some((item) => item.selected)}
                  >
                    Continue
                  </Button>
                </DialogFooter>
              </div>
            )}

            {/* Step 3: Return Details */}
            {dialogStep === 'details' && (
              <div className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Return Type</Label>
                    <RadioGroup value={returnType} onValueChange={(value) => setReturnType(value as ReturnType)}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="refund" id="refund" />
                        <Label htmlFor="refund" className="font-normal cursor-pointer">
                          Refund - Return money to customer
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="exchange" id="exchange" />
                        <Label htmlFor="exchange" className="font-normal cursor-pointer">
                          Exchange - Replace with different items
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="store_credit" id="store_credit" />
                        <Label htmlFor="store_credit" className="font-normal cursor-pointer">
                          Store Credit - Issue credit for future purchase
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {returnType === 'refund' && (
                    <div className="space-y-2">
                      <Label>Refund Method</Label>
                      <Select value={refundMethod} onValueChange={(value) => setRefundMethod(value as RefundMethod)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="card">Card</SelectItem>
                          <SelectItem value="store_credit">Store Credit</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="reason">Return Reason</Label>
                    <Textarea
                      id="reason"
                      placeholder="Enter reason for return..."
                      value={returnReason}
                      onChange={(e) => setReturnReason(e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogStep('items')}>
                    Back
                  </Button>
                  <Button onClick={handleProceedToConfirm} disabled={!returnReason.trim()}>
                    Review Return
                  </Button>
                </DialogFooter>
              </div>
            )}

            {/* Step 4: Confirm */}
            {dialogStep === 'confirm' && (
              <div className="space-y-4">
                <div className="rounded-lg border border-neutral-800 bg-neutral-950/50 p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Return Summary</h3>
                    {getReturnTypeBadge(returnType)}
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Original Invoice:</span>
                      <span className="font-medium">{invoiceNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Return Type:</span>
                      <span className="font-medium capitalize">{returnType.replace('_', ' ')}</span>
                    </div>
                    {returnType === 'refund' && (
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Refund Method:</span>
                        <span className="font-medium">{getRefundMethodLabel(refundMethod)}</span>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-neutral-800 pt-4">
                    <p className="text-xs text-neutral-400 mb-3">Returned Items:</p>
                    <div className="space-y-2">
                      {returnItems
                        .filter((item) => item.selected)
                        .map((item) => (
                          <div
                            key={item.item.id}
                            className="flex items-start justify-between text-sm py-2"
                          >
                            <div className="flex-1">
                              <p className="font-medium">{item.productName}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-neutral-400">
                                  Qty: {item.returnQuantity}
                                </span>
                                {getConditionBadge(item.condition)}
                                {item.restockable && (
                                  <Badge variant="outline" className="text-[10px] border-green-500/30 bg-green-500/10 text-green-400">
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                    Restockable
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <span className="font-medium">
                              Rs. {(Number(item.item.unitPrice) * item.returnQuantity).toLocaleString()}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>

                  <div className="border-t border-neutral-800 pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-lg font-medium">Total Refund Amount:</span>
                      <span className="text-2xl font-bold text-amber-500">
                        Rs. {calculateRefundAmount().toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-lg bg-amber-500/10 border border-amber-500/30 p-3">
                    <div className="flex gap-2">
                      <AlertCircle className="h-5 w-5 text-amber-500 flex-shrink-0" />
                      <div className="text-xs text-amber-200">
                        <p className="font-medium mb-1">Reason for Return:</p>
                        <p>{returnReason}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogStep('details')}>
                    Back
                  </Button>
                  <Button onClick={handleProcessReturn} className="brass-glow" disabled={submitting}>
                    {submitting ? 'Processing...' : 'Process Return'}
                  </Button>
                </DialogFooter>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-tactical p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-400">Total Returns</p>
              <p className="text-3xl font-bold text-white mt-2">{totalReturns}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-500/10">
              <RotateCcw className="h-6 w-6 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="card-tactical p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-400">Total Refunded</p>
              <p className="text-3xl font-bold text-white mt-2">
                Rs. {totalRefunded.toLocaleString()}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-amber-500/10">
              <Banknote className="h-6 w-6 text-amber-400" />
            </div>
          </div>
        </div>

        <div className="card-tactical p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-400">Refunds</p>
              <p className="text-3xl font-bold text-white mt-2">{refundsCount}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-500/10">
              <TrendingDown className="h-6 w-6 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="card-tactical p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-neutral-400">Exchanges</p>
              <p className="text-3xl font-bold text-white mt-2">{exchangesCount}</p>
            </div>
            <div className="p-3 rounded-lg bg-purple-500/10">
              <RefreshCw className="h-6 w-6 text-purple-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card-tactical p-4">
        <div className="flex items-center gap-4">
          <Label className="text-sm text-neutral-400">Filter by Type:</Label>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Returns</SelectItem>
              <SelectItem value="refund">Refunds</SelectItem>
              <SelectItem value="exchange">Exchanges</SelectItem>
              <SelectItem value="store_credit">Store Credit</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Returns Table */}
      <div className="card-tactical overflow-hidden">
        {loading ? (
          <PageLoader />
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-neutral-800">
                <TableHead className="text-neutral-400">Return #</TableHead>
                <TableHead className="text-neutral-400">Date</TableHead>
                <TableHead className="text-neutral-400">Original Invoice</TableHead>
                <TableHead className="text-neutral-400">Customer</TableHead>
                <TableHead className="text-neutral-400">Type</TableHead>
                <TableHead className="text-neutral-400">Refund Method</TableHead>
                <TableHead className="text-neutral-400 text-right">Refund Amount</TableHead>
                <TableHead className="text-neutral-400 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReturns.map((ret) => (
                <TableRow key={ret.return.id} className="border-neutral-800">
                  <TableCell className="font-medium">{ret.return.returnNumber}</TableCell>
                  <TableCell className="text-neutral-400">
                    {new Date(ret.return.returnDate).toLocaleDateString('en-PK', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px] font-mono">
                      Sale #{ret.return.originalSaleId}
                    </Badge>
                  </TableCell>
                  <TableCell>{ret.customerName || '-'}</TableCell>
                  <TableCell>{getReturnTypeBadge(ret.return.returnType)}</TableCell>
                  <TableCell className="text-neutral-400">
                    {getRefundMethodLabel(ret.return.refundMethod)}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {Number(ret.return.refundAmount) > 0 ? `Rs. ${Number(ret.return.refundAmount).toLocaleString()}` : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-success hover:text-success/80"
                        onClick={() => handleApprove(ret.return.id)}
                        title="Approve return"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive/80"
                        onClick={() => handleRejectClick(ret.return.id)}
                        title="Reject return"
                      >
                        <XCircle className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" title="View details">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-400 hover:text-red-300"
                        onClick={() => handleDelete(ret.return.id)}
                        title="Delete return"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredReturns.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No returns found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>

      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Reject Return</DialogTitle>
            <DialogDescription>
              Provide a reason for rejecting this return request.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="rejection-reason">Rejection Reason</Label>
              <Textarea
                id="rejection-reason"
                placeholder="Enter reason for rejection (optional)..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRejectConfirm}>
              Reject Return
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
