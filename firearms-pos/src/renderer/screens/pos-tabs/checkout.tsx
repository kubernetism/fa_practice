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
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { useTabs } from '@/contexts/tabs-context'
import { useAuth } from '@/contexts/auth-context'
import type { SalesTabWithItems, PaymentMethod } from '@shared/types'
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

  // COD fields
  const [codName, setCodName] = useState('')
  const [codPhone, setCodPhone] = useState('')
  const [codAddress, setCodAddress] = useState('')
  const [codCity, setCodCity] = useState('')
  const [codCharges, setCodCharges] = useState<string>('0')

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
  const amountPaidNum = amountPaid === '' ? 0 : parseFloat(amountPaid)
  const changeReturned = Math.max(0, amountPaidNum - totalAmount)

  // Handle payment method selection
  const handlePaymentMethodChange = (method: PaymentMethod) => {
    setPaymentMethod(method)
    // Set default amount based on method
    if (method === 'cash') {
      setAmountPaid('')
    } else if (method === 'receivable') {
      setAmountPaid('0')
    } else {
      setAmountPaid(totalAmount.toString())
    }
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

    return true
  }, [tabItems.length, paymentMethod, codName, codPhone, codAddress, codCity, tab?.customerId])

  // Process checkout
  const handleCheckout = async () => {
    if (!tab || !user) return

    setIsProcessing(true)

    const checkoutData: any = {
      paymentMethod,
      discount,
      amountPaid: paymentMethod === 'receivable' ? 0 : amountPaidNum,
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
        totalAmount: result.totalAmount ?? totalAmount,
        changeReturned: result.changeReturned ?? changeReturned,
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
      <Card className="w-96">
        <CardHeader>
          <CardTitle>Payment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Payment Method Selection */}
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

          {/* COD Details */}
          {paymentMethod === 'cod' && (
            <div className="space-y-3 rounded-lg border p-4">
              <Label className="block">COD Details</Label>
              <div>
                <Label htmlFor="cod-charges">COD Charges (Delivery Fee)</Label>
                <Input
                  id="cod-charges"
                  type="number"
                  step="0.01"
                  min="0"
                  value={codCharges}
                  onChange={(e) => setCodCharges(e.target.value)}
                  placeholder="0.00"
                  className="text-lg font-medium"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  This amount will be added to the customer's total and recorded as expense
                </p>
              </div>
              <Separator />
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
    </div>
  )
}
