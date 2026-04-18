import React, { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  CheckCircle2,
  Download,
  Printer,
  X,
  FileText,
  Clock,
  User,
  CreditCard,
  Loader2,
  Wrench,
} from 'lucide-react'

interface ReceiptSale {
  id: number
  invoiceNumber: string
  saleDate: string
  subtotal: number
  taxAmount: number
  discountAmount: number
  totalAmount: number
  amountPaid: number
  changeGiven: number
  paymentMethod: string
  paymentStatus: string
  notes?: string
}

interface ReceiptItem {
  productName: string
  productCode: string
  quantity: number
  unitPrice: number
  serialNumber?: string
  discountAmount: number
  taxAmount: number
  totalPrice: number
  modelName?: string | null
  caliberName?: string | null
  make?: string | null
}

interface ReceiptService {
  serviceName: string
  serviceCode?: string
  quantity: number
  unitPrice: number
  hours?: number
  taxAmount: number
  totalAmount: number
  notes?: string
}

interface ReceiptCustomer {
  name: string
  phone?: string
  email?: string
  address?: string
}

interface ReceiptBusinessSettings {
  businessName: string
  businessLogo?: string
  currencySymbol: string
  currencyPosition: string
  decimalPlaces: number
  taxRate: number
  showTaxOnReceipt: boolean
  receiptFooter: string
  receiptTermsAndConditions: string
  receiptCustomField1Label: string
  receiptCustomField1Value: string
  receiptCustomField2Label: string
  receiptCustomField2Value: string
  receiptCustomField3Label: string
  receiptCustomField3Value: string
}

interface ReceiptPreviewData {
  sale: ReceiptSale
  items: ReceiptItem[]
  services: ReceiptService[]
  customer: ReceiptCustomer | null
  businessSettings: ReceiptBusinessSettings
}

interface ReceiptPreviewProps {
  open: boolean
  onClose: () => void
  saleId: number | null
  receiptPath?: string
}

function formatCurrency(amount: number, settings: ReceiptBusinessSettings): string {
  const symbol = settings.currencySymbol || 'Rs.'
  const position = settings.currencyPosition || 'prefix'
  const formatted = amount.toLocaleString('en-PK', {
    minimumFractionDigits: settings.decimalPlaces || 2,
    maximumFractionDigits: settings.decimalPlaces || 2,
  })
  return position === 'prefix' ? `${symbol} ${formatted}` : `${formatted} ${symbol}`
}

function getPaymentMethodLabel(method: string): string {
  const labels: Record<string, string> = {
    cash: 'Cash',
    card: 'Card',
    credit: 'Credit',
    mixed: 'Mixed',
    mobile: 'Mobile Payment',
    cod: 'Cash on Delivery',
    receivable: 'Pay Later',
    bank_transfer: 'Bank Transfer',
    cheque: 'Cheque',
  }
  return labels[method] || method
}

function getPaymentStatusColor(status: string) {
  switch (status) {
    case 'paid':
      return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
    case 'partial':
      return 'bg-amber-500/15 text-amber-400 border-amber-500/30'
    default:
      return 'bg-slate-500/15 text-slate-400 border-slate-500/30'
  }
}

export function ReceiptPreview({ open, onClose, saleId, receiptPath }: ReceiptPreviewProps) {
  const [data, setData] = useState<ReceiptPreviewData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [downloading, setDownloading] = useState(false)
  const [downloaded, setDownloaded] = useState(false)

  useEffect(() => {
    if (!open || !saleId) return

    setLoading(true)
    setError('')
    setDownloaded(false)

    window.api.receipt
      .getData(saleId)
      .then((result: { success: boolean; data?: ReceiptPreviewData; message?: string }) => {
        if (result.success && result.data) {
          setData(result.data)
        } else {
          setError(result.message || 'Failed to load receipt data')
        }
      })
      .catch(() => setError('Failed to load receipt'))
      .finally(() => setLoading(false))
  }, [open, saleId])

  // Auto-download PDF after data loads
  useEffect(() => {
    if (!data || !saleId || downloaded) return

    setDownloading(true)
    window.api.receipt
      .generate(saleId)
      .then((result: { success: boolean; data?: { filePath: string } }) => {
        if (result.success) {
          setDownloaded(true)
        }
      })
      .catch(() => {
        // Silent fail — user can still manually download
      })
      .finally(() => setDownloading(false))
  }, [data, saleId, downloaded])

  const handlePrint = async () => {
    if (!saleId) return
    try {
      let filePath = receiptPath
      if (!filePath) {
        const result = await window.api.receipt.generate(saleId)
        if (result.success && result.data?.filePath) {
          filePath = result.data.filePath
        }
      }
      if (filePath) {
        await window.api.shell.openPath(filePath)
      }
    } catch (err) {
      console.error('Failed to print receipt:', err)
    }
  }

  const saleDate = data
    ? new Date(data.sale.saleDate).toLocaleDateString('en-PK', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      })
    : ''

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-[520px] p-0 gap-0 border-border/40 overflow-hidden bg-background">
        <DialogHeader className="sr-only">
          <DialogTitle>Receipt Preview</DialogTitle>
          <DialogDescription>Sale receipt preview</DialogDescription>
        </DialogHeader>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        )}

        {error && (
          <div className="p-6 text-center">
            <p className="text-destructive text-sm">{error}</p>
            <Button variant="outline" className="mt-4" onClick={onClose}>
              Close
            </Button>
          </div>
        )}

        {data && !loading && (
          <>
            {/* Success Header */}
            <div className="relative bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-500 px-6 py-4 text-white overflow-hidden">
              <div
                className="absolute inset-0 opacity-[0.07]"
                style={{
                  backgroundImage:
                    'radial-gradient(circle at 25% 50%, white 1px, transparent 1px), radial-gradient(circle at 75% 50%, white 1px, transparent 1px)',
                  backgroundSize: '24px 24px',
                }}
              />
              <div className="relative flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-base font-bold tracking-wide">Sale Complete</h2>
                  <p className="text-emerald-100 text-xs">
                    {downloading ? 'Downloading receipt...' : downloaded ? 'Receipt saved to downloads' : 'Processing receipt...'}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={`shrink-0 border text-[10px] font-bold uppercase tracking-wider ${getPaymentStatusColor(data.sale.paymentStatus)}`}
                >
                  {data.sale.paymentStatus}
                </Badge>
              </div>
            </div>

            <ScrollArea className="max-h-[65vh]">
              {/* Receipt Body */}
              <div className="px-6 py-4">
                {/* Business Header */}
                <div className="text-center mb-4">
                  <h3 className="text-sm font-bold tracking-wide uppercase text-foreground">
                    {data.businessSettings.businessName || 'Business Name'}
                  </h3>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Tax Invoice / Receipt</p>
                </div>

                {/* Invoice Meta */}
                <div className="flex justify-between items-start mb-3 text-xs">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <FileText className="h-3 w-3" />
                      <span className="font-mono font-bold text-foreground">#{data.sale.invoiceNumber}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{saleDate}</span>
                    </div>
                  </div>
                  <div className="text-right space-y-0.5">
                    <div className="flex items-center justify-end gap-1.5 text-muted-foreground">
                      <User className="h-3 w-3" />
                      <span className="font-medium text-foreground truncate max-w-[160px]">
                        {data.customer?.name || 'Walk-in Customer'}
                      </span>
                    </div>
                    {data.customer?.phone && (
                      <p className="text-muted-foreground">{data.customer.phone}</p>
                    )}
                  </div>
                </div>

                <Separator className="mb-3" />

                {/* Items Table */}
                <div className="space-y-0">
                  {/* Table Header */}
                  <div className="grid grid-cols-[1fr_70px_36px_76px] gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground pb-1.5 border-b border-border/60">
                    <span>Item</span>
                    <span className="text-right">Price</span>
                    <span className="text-center">Qty</span>
                    <span className="text-right">Total</span>
                  </div>

                  {/* Product Items */}
                  {data.items.map((item, i) => (
                    <div
                      key={`p-${i}`}
                      className="grid grid-cols-[1fr_70px_36px_76px] gap-1 py-2 border-b border-border/20 text-xs items-start"
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-foreground truncate">{item.productName}</p>
                        {(item.modelName || item.caliberName || item.make) && (
                          <p className="text-[10px] leading-tight text-muted-foreground truncate">
                            {[item.modelName, item.caliberName, item.make]
                              .filter(Boolean)
                              .join(' · ')}
                          </p>
                        )}
                        {item.serialNumber && (
                          <p className="text-[10px] text-muted-foreground font-mono">
                            S/N: {item.serialNumber}
                          </p>
                        )}
                      </div>
                      <span className="text-right font-mono text-muted-foreground tabular-nums">
                        {formatCurrency(item.unitPrice, data.businessSettings)}
                      </span>
                      <span className="text-center tabular-nums">{item.quantity}</span>
                      <span className="text-right font-mono font-medium tabular-nums">
                        {formatCurrency(item.totalPrice, data.businessSettings)}
                      </span>
                    </div>
                  ))}

                  {/* Service Items */}
                  {data.services.map((svc, i) => (
                    <div
                      key={`s-${i}`}
                      className="grid grid-cols-[1fr_70px_36px_76px] gap-1 py-2 border-b border-border/20 text-xs items-start bg-blue-500/[0.03]"
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-foreground truncate">
                          {svc.serviceName}
                          <span className="ml-1.5 text-[9px] font-semibold text-blue-400">
                            <Wrench className="inline h-2.5 w-2.5 mr-0.5 -mt-0.5" />SVC
                          </span>
                        </p>
                        {svc.hours && (
                          <p className="text-[10px] text-muted-foreground">
                            {svc.hours}hr × {formatCurrency(svc.unitPrice, data.businessSettings)}
                          </p>
                        )}
                      </div>
                      <span className="text-right font-mono text-muted-foreground tabular-nums">
                        {formatCurrency(svc.unitPrice, data.businessSettings)}
                      </span>
                      <span className="text-center tabular-nums">{svc.quantity}</span>
                      <span className="text-right font-mono font-medium tabular-nums">
                        {formatCurrency(svc.totalAmount, data.businessSettings)}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Totals */}
                <div className="mt-3 space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-mono tabular-nums">
                      {formatCurrency(data.sale.subtotal, data.businessSettings)}
                    </span>
                  </div>
                  {data.businessSettings.showTaxOnReceipt && data.sale.taxAmount > 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">
                        Tax {data.businessSettings.taxRate > 0 ? `(${data.businessSettings.taxRate}%)` : ''}
                      </span>
                      <span className="font-mono tabular-nums">
                        {formatCurrency(data.sale.taxAmount, data.businessSettings)}
                      </span>
                    </div>
                  )}
                  {data.sale.discountAmount > 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Discount</span>
                      <span className="font-mono tabular-nums text-emerald-400">
                        -{formatCurrency(data.sale.discountAmount, data.businessSettings)}
                      </span>
                    </div>
                  )}

                  <Separator />

                  <div className="flex justify-between items-center pt-1">
                    <span className="text-sm font-bold uppercase tracking-wider">Total</span>
                    <span className="text-xl font-bold font-mono tabular-nums">
                      {formatCurrency(data.sale.totalAmount, data.businessSettings)}
                    </span>
                  </div>
                </div>

                {/* Payment Details */}
                <div className="mt-4 rounded-lg border border-border/40 bg-muted/30 p-3 space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <CreditCard className="h-3 w-3" />
                      Payment Method
                    </span>
                    <span className="font-medium capitalize">
                      {getPaymentMethodLabel(data.sale.paymentMethod)}
                    </span>
                  </div>
                  {data.sale.amountPaid > 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Amount Paid</span>
                      <span className="font-mono tabular-nums font-medium text-emerald-400">
                        {formatCurrency(data.sale.amountPaid, data.businessSettings)}
                      </span>
                    </div>
                  )}
                  {data.sale.changeGiven > 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Change</span>
                      <span className="font-mono tabular-nums">
                        {formatCurrency(data.sale.changeGiven, data.businessSettings)}
                      </span>
                    </div>
                  )}
                  {data.sale.amountPaid < data.sale.totalAmount && data.sale.amountPaid > 0 && (
                    <div className="flex justify-between text-xs pt-1 border-t border-amber-500/20">
                      <span className="text-amber-400 font-medium">Balance Due</span>
                      <span className="font-mono tabular-nums font-bold text-amber-400">
                        {formatCurrency(data.sale.totalAmount - data.sale.amountPaid, data.businessSettings)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Custom Fields */}
                {(data.businessSettings.receiptCustomField1Label || data.businessSettings.receiptCustomField2Label || data.businessSettings.receiptCustomField3Label) && (
                  <div className="mt-3 space-y-1 text-[10px] text-muted-foreground">
                    {data.businessSettings.receiptCustomField1Label && data.businessSettings.receiptCustomField1Value && (
                      <div className="flex justify-between">
                        <span>{data.businessSettings.receiptCustomField1Label}</span>
                        <span className="text-foreground">{data.businessSettings.receiptCustomField1Value}</span>
                      </div>
                    )}
                    {data.businessSettings.receiptCustomField2Label && data.businessSettings.receiptCustomField2Value && (
                      <div className="flex justify-between">
                        <span>{data.businessSettings.receiptCustomField2Label}</span>
                        <span className="text-foreground">{data.businessSettings.receiptCustomField2Value}</span>
                      </div>
                    )}
                    {data.businessSettings.receiptCustomField3Label && data.businessSettings.receiptCustomField3Value && (
                      <div className="flex justify-between">
                        <span>{data.businessSettings.receiptCustomField3Label}</span>
                        <span className="text-foreground">{data.businessSettings.receiptCustomField3Value}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Terms */}
                {data.businessSettings.receiptTermsAndConditions && (
                  <p className="mt-3 text-[10px] text-muted-foreground/70 leading-relaxed">
                    {data.businessSettings.receiptTermsAndConditions}
                  </p>
                )}

                {/* Footer */}
                {data.businessSettings.receiptFooter && (
                  <p className="mt-2 text-[10px] text-center text-muted-foreground/50">
                    {data.businessSettings.receiptFooter}
                  </p>
                )}
              </div>
            </ScrollArea>

            {/* Actions */}
            <div className="px-6 pb-4 pt-2 flex gap-2 border-t border-border/30">
              <Button
                variant="outline"
                size="lg"
                className="flex-1 h-10 gap-2 text-xs"
                onClick={handlePrint}
              >
                <Printer className="h-3.5 w-3.5" />
                Open / Print
              </Button>
              <Button
                size="lg"
                className="flex-1 h-10 gap-2 text-xs font-semibold"
                onClick={onClose}
              >
                {downloaded && <Download className="h-3.5 w-3.5" />}
                {downloaded ? 'Done — Saved' : 'Done'}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
