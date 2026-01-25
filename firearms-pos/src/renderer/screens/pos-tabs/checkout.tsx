import React, { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Receipt,
  Banknote,
  CreditCard,
  Smartphone,
  Package,
  AlertCircle,
  CheckCircle2,
  X,
  Plus,
  Trash2,
  Split,
  Truck,
  MapPin,
  Phone,
  User,
  DollarSign,
  Building2,
  Percent,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useTabs } from '@/contexts/tabs-context'
import { useAuth } from '@/contexts/auth-context'
import type { PaymentMethod, SplitPaymentMethod, PaymentBreakdownItem } from '@shared/types'
import { formatCurrency } from '@/lib/utils'

const paymentMethods: Array<{
  value: PaymentMethod
  label: string
  icon: React.ReactNode
}> = [
  { value: 'cash', label: 'Cash', icon: <Banknote className="h-4 w-4" /> },
  {
    value: 'card',
    label: 'Credit Card',
    icon: <CreditCard className="h-4 w-4" />,
  },
  {
    value: 'debit_card',
    label: 'Debit Card',
    icon: <CreditCard className="h-4 w-4" />,
  },
  {
    value: 'mobile',
    label: 'Mobile Payment',
    icon: <Smartphone className="h-4 w-4" />,
  },
  { value: 'cod', label: 'COD', icon: <Package className="h-4 w-4" /> },
  {
    value: 'receivable',
    label: 'Pay Later / Receivable',
    icon: <Receipt className="h-4 w-4" />,
  },
]

const splitPaymentMethods: Array<{
  value: SplitPaymentMethod
  label: string
}> = [
  { value: 'cash', label: 'Cash' },
  { value: 'card', label: 'Credit Card' },
  { value: 'debit_card', label: 'Debit Card' },
  { value: 'mobile', label: 'Mobile Payment' },
  { value: 'cheque', label: 'Cheque' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
]

export function TabCheckoutScreen() {
  const { tabId } = useParams<{ tabId: string }>()
  const navigate = useNavigate()
  const { activeTab, checkoutTab } = useTabs()
  const { user } = useAuth()

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash')
  const [amountPaid, setAmountPaid] = useState<string>('')
  const [discount, setDiscount] = useState(0)
  const [notes, setNotes] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [checkoutResult, setCheckoutResult] = useState<{
    invoiceNumber: string
    totalAmount: number
    changeReturned: number
  } | null>(null)

  // Split payment state
  const [isSplitPayment, setIsSplitPayment] = useState(false)
  const [splitPayments, setSplitPayments] = useState<Array<{
    id: number
    method: SplitPaymentMethod
    amount: string
    referenceNumber: string
  }>>([
    { id: 1, method: 'cash', amount: '', referenceNumber: '' },
  ])

  // COD fields
  const [codName, setCodName] = useState('')
  const [codPhone, setCodPhone] = useState('')
  const [codAddress, setCodAddress] = useState('')
  const [codCity, setCodCity] = useState('')
  const [codCharges, setCodCharges] = useState<string>('0')
  const [showCodDialog, setShowCodDialog] = useState(false)

  // Tax settings state
  const [taxSettings, setTaxSettings] = useState<{
    taxRate: number
    taxName: string
    taxNumber: string
  } | null>(null)

  // Load tax settings
  useEffect(() => {
    const loadTaxSettings = async () => {
      try {
        const settings = await window.api.settings.get()
        if (settings) {
          setTaxSettings({
            taxRate: settings.taxRate ?? 0,
            taxName: settings.taxName ?? 'GST',
            taxNumber: settings.taxNumber ?? '',
          })
        }
      } catch (error) {
        console.error('Failed to load tax settings:', error)
      }
    }
    loadTaxSettings()
  }, [])

  const tab = activeTab
  const tabItems = tab?.items ?? []

  // Initialize discount from tab
  useEffect(() => {
    if (tab) {
      setDiscount(tab.discount ?? 0)
    }
  }, [tab])

  // Calculate totals
  const subtotal = useMemo(() => tab?.subtotal ?? 0, [tab])
  const tax = useMemo(() => tab?.tax ?? 0, [tab])
  const codChargesNum = codCharges === '' ? 0 : parseFloat(codCharges)
  const totalAmount = useMemo(() => {
    const base = subtotal + tax - discount
    // Add COD charges only for COD payment method
    if (paymentMethod === 'cod') {
      return Math.max(0, base + codChargesNum)
    }
    return Math.max(0, base)
  }, [subtotal, tax, discount, paymentMethod, codChargesNum])

  // Calculate split payment total
  const splitPaymentTotal = useMemo(() => {
    return splitPayments.reduce((sum, p) => {
      const amount = p.amount === '' ? 0 : parseFloat(p.amount)
      return sum + (isNaN(amount) ? 0 : amount)
    }, 0)
  }, [splitPayments])

  const splitPaymentRemaining = totalAmount - splitPaymentTotal
  const splitPaymentChange = splitPaymentTotal > totalAmount ? splitPaymentTotal - totalAmount : 0

  const amountPaidNum = amountPaid === '' ? 0 : parseFloat(amountPaid)
  const changeReturned = Math.max(0, amountPaidNum - totalAmount)

  // Handle payment method selection
  const handlePaymentMethodChange = (method: PaymentMethod) => {
    setPaymentMethod(method)
    setIsSplitPayment(false)
    // Set default amount based on method
    if (method === 'cash') {
      setAmountPaid('')
    } else if (method === 'receivable') {
      setAmountPaid('0')
    } else {
      setAmountPaid(totalAmount.toString())
    }
    // Open COD dialog when COD is selected
    if (method === 'cod') {
      setShowCodDialog(true)
    }
  }

  // COD form validation
  const isCodFormValid = useMemo(() => {
    return (
      codName.trim() !== '' &&
      codPhone.trim() !== '' &&
      codAddress.trim() !== '' &&
      codCity.trim() !== ''
    )
  }, [codName, codPhone, codAddress, codCity])

  // Handle COD dialog save
  const handleCodSave = () => {
    if (isCodFormValid) {
      setShowCodDialog(false)
    }
  }

  // Handle COD dialog cancel
  const handleCodCancel = () => {
    setShowCodDialog(false)
    // Reset to cash if COD details not filled
    if (!isCodFormValid) {
      setPaymentMethod('cash')
      setCodName('')
      setCodPhone('')
      setCodAddress('')
      setCodCity('')
      setCodCharges('0')
    }
  }

  // Handle split payment toggle
  const handleSplitPaymentToggle = (enabled: boolean) => {
    setIsSplitPayment(enabled)
    if (enabled) {
      setPaymentMethod('mixed')
      setSplitPayments([{ id: 1, method: 'cash', amount: '', referenceNumber: '' }])
    } else {
      setPaymentMethod('cash')
      setAmountPaid('')
    }
  }

  // Add split payment entry
  const addSplitPayment = () => {
    const newId = Math.max(...splitPayments.map(p => p.id)) + 1
    setSplitPayments([...splitPayments, { id: newId, method: 'card', amount: '', referenceNumber: '' }])
  }

  // Remove split payment entry
  const removeSplitPayment = (id: number) => {
    if (splitPayments.length > 1) {
      setSplitPayments(splitPayments.filter(p => p.id !== id))
    }
  }

  // Update split payment entry
  const updateSplitPayment = (id: number, field: 'method' | 'amount' | 'referenceNumber', value: string) => {
    setSplitPayments(splitPayments.map(p =>
      p.id === id ? { ...p, [field]: value } : p
    ))
  }

  // Set remaining amount to a split payment
  const setRemainingToPayment = (id: number) => {
    const otherTotal = splitPayments
      .filter(p => p.id !== id)
      .reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0)
    const remaining = Math.max(0, totalAmount - otherTotal)
    updateSplitPayment(id, 'amount', remaining.toFixed(2))
  }

  // Validate form
  const isValid = useMemo(() => {
    // Must have items
    if (tabItems.length === 0) return false

    // COD requires all fields
    if (paymentMethod === 'cod') {
      return (
        codName.trim() !== '' &&
        codPhone.trim() !== '' &&
        codAddress.trim() !== '' &&
        codCity.trim() !== ''
      )
    }

    // Receivable requires a customer
    if (paymentMethod === 'receivable' && !tab?.customerId) {
      return false
    }

    // Split payment validation
    if (isSplitPayment) {
      // Must have at least one payment with amount
      const hasValidPayment = splitPayments.some(p => parseFloat(p.amount) > 0)
      if (!hasValidPayment) return false
      // Total must cover the sale amount
      if (splitPaymentTotal < totalAmount) return false
    }

    return true
  }, [tabItems.length, paymentMethod, codName, codPhone, codAddress, codCity, tab?.customerId, isSplitPayment, splitPayments, splitPaymentTotal, totalAmount])

  // Process checkout
  const handleCheckout = async () => {
    if (!tab || !user) return

    setIsProcessing(true)

    const checkoutData: any = {
      paymentMethod: isSplitPayment ? 'mixed' : paymentMethod,
      discount,
      amountPaid: isSplitPayment
        ? splitPaymentTotal
        : (paymentMethod === 'receivable' ? 0 : amountPaidNum),
    }

    // Add split payment breakdown if applicable
    if (isSplitPayment) {
      checkoutData.payments = splitPayments
        .filter(p => parseFloat(p.amount) > 0)
        .map(p => ({
          method: p.method,
          amount: parseFloat(p.amount),
          referenceNumber: p.referenceNumber || undefined,
        }))
    }

    // Add COD details if applicable
    if (paymentMethod === 'cod') {
      checkoutData.codName = codName.trim()
      checkoutData.codPhone = codPhone.trim()
      checkoutData.codAddress = codAddress.trim()
      checkoutData.codCity = codCity.trim()
      checkoutData.codCharges = codChargesNum
    }

    // Add notes if provided
    if (notes.trim()) {
      checkoutData.notes = notes.trim()
    }

    const result = await checkoutTab(tab.id, checkoutData)

    setIsProcessing(false)

    if (result && result.invoiceNumber) {
      setCheckoutResult({
        invoiceNumber: result.invoiceNumber,
        totalAmount: result.sale?.totalAmount ?? totalAmount,
        changeReturned: isSplitPayment ? splitPaymentChange : (result.sale?.changeGiven ?? changeReturned),
      })
      setShowSuccess(true)
    }
  }

  // Close success dialog and navigate
  const handleComplete = () => {
    setShowSuccess(false)
    navigate('/pos-tabs')
  }

  const handleBack = () => {
    navigate(`/pos-tabs/${tabId}`)
  }

  if (!tab) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (showSuccess && checkoutResult) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-12 pb-8">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
            <h2 className="mb-2 text-2xl font-bold">Checkout Complete!</h2>
            <p className="mb-6 text-muted-foreground">
              Sale {checkoutResult.invoiceNumber} has been processed successfully.
            </p>

            <div className="mb-8 space-y-2 rounded-lg bg-muted p-4 text-left">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Invoice:</span>
                <span className="font-semibold">{checkoutResult.invoiceNumber}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total:</span>
                <span className="font-semibold">
                  {formatCurrency(checkoutResult.totalAmount)}
                </span>
              </div>
              {checkoutResult.changeReturned > 0 && (
                <>
                  <Separator />
                  <div className="flex justify-between text-green-600">
                    <span>Change Returned:</span>
                    <span className="font-semibold">
                      {formatCurrency(checkoutResult.changeReturned)}
                    </span>
                  </div>
                </>
              )}
            </div>

            <Button size="lg" className="w-full" onClick={handleComplete}>
              Done
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto flex h-[calc(100vh-8rem)] gap-6 p-6">
      {/* Left Side - Order Summary */}
      <div className="flex-1">
        <Card className="h-full">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={handleBack}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <CardTitle className="text-xl">Checkout {tab.tabNumber}</CardTitle>
                <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                  {tab.customer ? (
                    <span>
                      {tab.customer.firstName} {tab.customer.lastName}
                    </span>
                  ) : (
                    <span>Guest</span>
                  )}
                  <span>•</span>
                  <span>{tab.branch?.name ?? 'N/A'}</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <Separator />
          <CardContent className="flex flex-1 flex-col p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-muted-foreground">
                {tabItems.length} {tabItems.length === 1 ? 'Item' : 'Items'}
              </span>
            </div>

            <ScrollArea className="flex-1">
              <div className="space-y-3">
                {tabItems.map((item) => (
                  <div key={item.id} className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium">{item.productName}</p>
                      {item.serialNumber && (
                        <p className="text-sm text-muted-foreground">
                          SN: {item.serialNumber}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {formatCurrency(item.sellingPrice)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Qty: {item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="mt-4 space-y-2 pt-4">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex justify-between text-sm cursor-help group">
                      <span className="flex items-center gap-1.5">
                        <Percent className="h-3.5 w-3.5 text-emerald-600" />
                        <span>{taxSettings?.taxName ?? 'Tax'}</span>
                        {taxSettings?.taxRate !== undefined && taxSettings.taxRate > 0 && (
                          <span className="text-xs text-muted-foreground">
                            ({taxSettings.taxRate}%)
                          </span>
                        )}
                      </span>
                      <span className="font-medium text-emerald-600 group-hover:text-emerald-700">
                        {formatCurrency(tax)}
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="left" className="max-w-xs">
                    <div className="space-y-1.5 text-xs">
                      <p className="font-semibold">{taxSettings?.taxName ?? 'Tax'} Details</p>
                      <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground">Rate:</span>
                        <span>{taxSettings?.taxRate ?? 0}%</span>
                      </div>
                      <div className="flex justify-between gap-4">
                        <span className="text-muted-foreground">On Subtotal:</span>
                        <span>{formatCurrency(subtotal)}</span>
                      </div>
                      {taxSettings?.taxNumber && (
                        <div className="flex justify-between gap-4">
                          <span className="text-muted-foreground">Tax ID:</span>
                          <span className="font-mono">{taxSettings.taxNumber}</span>
                        </div>
                      )}
                      <Separator className="my-1" />
                      <div className="flex justify-between gap-4 font-medium">
                        <span>Tax Amount:</span>
                        <span>{formatCurrency(tax)}</span>
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <div className="flex items-center justify-between text-sm">
                <span>Discount</span>
                <Input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(Number(e.target.value))}
                  className="h-7 w-24 text-right"
                  min={0}
                />
              </div>
              {paymentMethod === 'cod' && codChargesNum > 0 && (
                <div className="flex justify-between text-sm text-blue-600">
                  <span>COD Charges</span>
                  <span>+{formatCurrency(codChargesNum)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-xl font-bold">
                <span>TOTAL</span>
                <span>{formatCurrency(totalAmount)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Side - Payment */}
      <Card className="w-[420px]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Payment</CardTitle>
            <div className="flex items-center gap-2">
              <Label htmlFor="split-payment" className="text-sm font-normal cursor-pointer">
                Split Payment
              </Label>
              <Switch
                id="split-payment"
                checked={isSplitPayment}
                onCheckedChange={handleSplitPaymentToggle}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {!isSplitPayment ? (
            <>
              {/* Single Payment Method Selection */}
              <div>
                <Label className="mb-3 block">Payment Method</Label>
                <div className="grid grid-cols-2 gap-2">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.value}
                      onClick={() => handlePaymentMethodChange(method.value)}
                      className={`flex items-center gap-2 rounded-lg border p-3 text-left transition-all ${
                        paymentMethod === method.value
                          ? 'border-primary bg-primary/5'
                          : 'border-input hover:border-primary'
                      }`}
                    >
                      {method.icon}
                      <span className="text-sm font-medium">{method.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* COD Summary Card */}
              {paymentMethod === 'cod' && (
                <div className="rounded-xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 dark:border-amber-800 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-white">
                        <Truck className="h-4 w-4" />
                      </div>
                      <span className="font-semibold text-amber-900 dark:text-amber-100">
                        Cash on Delivery
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowCodDialog(true)}
                      className="border-amber-300 hover:bg-amber-100 dark:border-amber-700 dark:hover:bg-amber-900/50"
                    >
                      {isCodFormValid ? 'Edit Details' : 'Add Details'}
                    </Button>
                  </div>

                  {isCodFormValid ? (
                    <div className="space-y-2 text-sm">
                      <div className="flex items-start gap-2">
                        <User className="h-4 w-4 text-amber-600 mt-0.5" />
                        <span className="text-amber-900 dark:text-amber-100">{codName}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <Phone className="h-4 w-4 text-amber-600 mt-0.5" />
                        <span className="text-amber-900 dark:text-amber-100">{codPhone}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-amber-600 mt-0.5" />
                        <span className="text-amber-900 dark:text-amber-100">
                          {codAddress}, {codCity}
                        </span>
                      </div>
                      {codChargesNum > 0 && (
                        <div className="flex items-start gap-2 pt-1 border-t border-amber-200 dark:border-amber-800">
                          <DollarSign className="h-4 w-4 text-amber-600 mt-0.5" />
                          <span className="text-amber-900 dark:text-amber-100 font-medium">
                            Delivery: {formatCurrency(codChargesNum)}
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-300">
                      <AlertCircle className="h-4 w-4" />
                      <span>Please add delivery details to continue</span>
                    </div>
                  )}
                </div>
              )}

              {/* Receivable Warning - Customer Required */}
              {paymentMethod === 'receivable' && !tab?.customerId && (
                <div className="flex items-center gap-2 rounded-lg border border-yellow-500 bg-yellow-500/10 p-3 text-yellow-600 dark:text-yellow-400">
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  <span className="text-sm">
                    A customer must be assigned to the tab for Pay Later / Receivable payments. Please go back and assign a customer first.
                  </span>
                </div>
              )}

              {/* Amount Paid */}
              {paymentMethod === 'cash' && (
                <div>
                  <Label htmlFor="amount-paid">Amount Received</Label>
                  <Input
                    id="amount-paid"
                    type="number"
                    step="0.01"
                    min="0"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value)}
                    placeholder="Enter amount"
                    className="text-lg"
                  />
                  {amountPaidNum >= totalAmount && (
                    <p className="mt-2 flex items-center justify-center gap-1 text-sm text-green-600">
                      <CheckCircle2 className="h-4 w-4" />
                      Change: {formatCurrency(changeReturned)}
                    </p>
                  )}
                  {amountPaidNum > 0 && amountPaidNum < totalAmount && (
                    <p className="mt-2 flex items-center gap-1 text-sm text-destructive">
                      <AlertCircle className="h-4 w-4" />
                      Remaining: {formatCurrency(totalAmount - amountPaidNum)}
                    </p>
                  )}
                </div>
              )}

              {/* Pay Later / Receivable info */}
              {paymentMethod === 'receivable' && (
                <div className="rounded-lg bg-muted p-4">
                  <div className="flex items-start gap-2 text-sm">
                    <AlertCircle className="h-4 w-4 mt-0.5 text-yellow-600" />
                    <div>
                      <p className="font-medium">Payment will be recorded as receivable</p>
                      <p className="text-muted-foreground">
                        The customer balance will be updated. Full payment is expected later.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Split Payment UI */
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Split className="h-4 w-4" />
                <span>Add multiple payment methods</span>
              </div>

              <div className="space-y-3">
                {splitPayments.map((payment, index) => (
                  <div key={payment.id} className="rounded-lg border p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-muted-foreground">
                        Payment {index + 1}
                      </span>
                      {splitPayments.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 ml-auto"
                          onClick={() => removeSplitPayment(payment.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Select
                        value={payment.method}
                        onValueChange={(value) => updateSplitPayment(payment.id, 'method', value)}
                      >
                        <SelectTrigger className="w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {splitPaymentMethods.map((m) => (
                            <SelectItem key={m.value} value={m.value}>
                              {m.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="flex-1 relative">
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="Amount"
                          value={payment.amount}
                          onChange={(e) => updateSplitPayment(payment.id, 'amount', e.target.value)}
                        />
                        {splitPaymentRemaining > 0 && (
                          <Button
                            variant="link"
                            size="sm"
                            className="absolute right-1 top-1/2 -translate-y-1/2 h-auto py-0 px-1 text-xs"
                            onClick={() => setRemainingToPayment(payment.id)}
                          >
                            Fill
                          </Button>
                        )}
                      </div>
                    </div>
                    {['card', 'debit_card', 'cheque', 'bank_transfer'].includes(payment.method) && (
                      <Input
                        placeholder="Reference # (optional)"
                        value={payment.referenceNumber}
                        onChange={(e) => updateSplitPayment(payment.id, 'referenceNumber', e.target.value)}
                        className="text-sm"
                      />
                    )}
                  </div>
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={addSplitPayment}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Payment Method
              </Button>

              {/* Split Payment Summary */}
              <div className="rounded-lg bg-muted p-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Total Paid:</span>
                  <span className="font-medium">{formatCurrency(splitPaymentTotal)}</span>
                </div>
                {splitPaymentRemaining > 0 && (
                  <div className="flex justify-between text-sm text-destructive">
                    <span>Remaining:</span>
                    <span className="font-medium">{formatCurrency(splitPaymentRemaining)}</span>
                  </div>
                )}
                {splitPaymentChange > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Change:</span>
                    <span className="font-medium">{formatCurrency(splitPaymentChange)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes for this sale..."
              className="min-h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleBack}
              disabled={isProcessing}
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleCheckout}
              disabled={!isValid || isProcessing}
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
          </div>

          {/* Total at bottom */}
          <div className="rounded-lg bg-muted p-4 text-center">
            <span className="text-sm text-muted-foreground">Total Amount</span>
            <p className="text-3xl font-bold">
              {formatCurrency(totalAmount)}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* COD Details Dialog */}
      <Dialog open={showCodDialog} onOpenChange={setShowCodDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="pb-4 border-b">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg">
                <Truck className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-xl">Cash on Delivery</DialogTitle>
                <DialogDescription>
                  Enter delivery details for COD payment
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Delivery Charges Section */}
            <div className="rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 p-4 border border-blue-100 dark:border-blue-900">
              <Label htmlFor="cod-charges" className="flex items-center gap-2 text-blue-700 dark:text-blue-300 font-medium mb-2">
                <DollarSign className="h-4 w-4" />
                Delivery Charges (Optional)
              </Label>
              <Input
                id="cod-charges"
                type="number"
                step="0.01"
                min="0"
                value={codCharges}
                onChange={(e) => setCodCharges(e.target.value)}
                placeholder="0.00"
                className="text-lg font-semibold bg-white dark:bg-gray-950 border-blue-200 dark:border-blue-800 focus:ring-blue-500"
              />
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-2 flex items-start gap-1">
                <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                This amount will be added to the total and recorded as delivery expense
              </p>
            </div>

            <Separator />

            {/* Customer Details Section */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                Customer Information
              </h4>

              <div className="space-y-1">
                <Label htmlFor="cod-name" className="flex items-center gap-2">
                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                  Full Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="cod-name"
                  value={codName}
                  onChange={(e) => setCodName(e.target.value)}
                  placeholder="Enter customer's full name"
                  className={!codName.trim() && showCodDialog ? 'border-red-200 focus:ring-red-500' : ''}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="cod-phone" className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                  Phone Number <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="cod-phone"
                  value={codPhone}
                  onChange={(e) => setCodPhone(e.target.value)}
                  placeholder="Enter contact number"
                  className={!codPhone.trim() && showCodDialog ? 'border-red-200 focus:ring-red-500' : ''}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="cod-address" className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                  Delivery Address <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="cod-address"
                  value={codAddress}
                  onChange={(e) => setCodAddress(e.target.value)}
                  placeholder="Enter complete delivery address"
                  className={!codAddress.trim() && showCodDialog ? 'border-red-200 focus:ring-red-500' : ''}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="cod-city" className="flex items-center gap-2">
                  <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                  City <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="cod-city"
                  value={codCity}
                  onChange={(e) => setCodCity(e.target.value)}
                  placeholder="Enter city name"
                  className={!codCity.trim() && showCodDialog ? 'border-red-200 focus:ring-red-500' : ''}
                />
              </div>
            </div>

            {/* Order Summary in Dialog */}
            {codChargesNum > 0 && (
              <>
                <Separator />
                <div className="rounded-lg bg-muted/50 p-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Order Amount</span>
                    <span>{formatCurrency(subtotal + tax - discount)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-amber-600 dark:text-amber-400">
                    <span>+ Delivery Charges</span>
                    <span>{formatCurrency(codChargesNum)}</span>
                  </div>
                  <Separator className="my-1" />
                  <div className="flex justify-between font-bold">
                    <span>Total to Collect</span>
                    <span className="text-lg">{formatCurrency(totalAmount)}</span>
                  </div>
                </div>
              </>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={handleCodCancel}>
              Cancel
            </Button>
            <Button
              onClick={handleCodSave}
              disabled={!isCodFormValid}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Confirm Details
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
