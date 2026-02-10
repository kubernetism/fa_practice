'use client'

import { useState, useEffect, useCallback } from 'react'
import { TableLoader } from '@/components/ui/page-loader'
import {
  Receipt,
  Search,
  Filter,
  Eye,
  Ban,
  DollarSign,
  TrendingUp,
  ShoppingCart,
  Clock,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getSales, getSalesSummary, getSaleById, voidSale, updatePaymentStatus } from '@/actions/sales'
import { toast } from 'sonner'

type SaleRow = {
  sale: any
  customerName: string | null
}

const paymentMethods = ['all', 'cash', 'card', 'credit', 'mixed', 'mobile', 'cod', 'receivable']
const paymentStatuses = ['all', 'paid', 'partial', 'pending']

export default function SalesPage() {
  const [search, setSearch] = useState('')
  const [filterMethod, setFilterMethod] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showVoided, setShowVoided] = useState(true)
  const [salesData, setSalesData] = useState<SaleRow[]>([])
  const [summary, setSummary] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedSale, setSelectedSale] = useState<any>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [voidOpen, setVoidOpen] = useState(false)
  const [voidTarget, setVoidTarget] = useState<any>(null)
  const [voidReason, setVoidReason] = useState('')
  const [voiding, setVoiding] = useState(false)

  const loadData = useCallback(async () => {
    setLoading(true)
    const [salesResult, summaryResult] = await Promise.all([
      getSales({
        search: search || undefined,
        paymentStatus: filterStatus !== 'all' ? filterStatus : undefined,
        paymentMethod: filterMethod !== 'all' ? filterMethod : undefined,
        showVoided,
      }),
      getSalesSummary(),
    ])
    if (salesResult.success) setSalesData(salesResult.data as any)
    if (summaryResult.success) setSummary(summaryResult.data)
    setLoading(false)
  }, [search, filterStatus, filterMethod, showVoided])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleViewSale = async (saleId: number) => {
    const result = await getSaleById(saleId)
    if (result.success) {
      setSelectedSale(result.data)
      setDetailOpen(true)
    }
  }

  const handleVoidSale = async () => {
    if (!voidTarget || !voidReason.trim()) return
    setVoiding(true)
    const result = await voidSale(voidTarget.id, voidReason)
    setVoiding(false)
    if (result.success) {
      toast.success('Sale voided successfully')
      setVoidOpen(false)
      setVoidTarget(null)
      setVoidReason('')
      loadData()
    } else {
      toast.error((result as any).message || 'Failed to void sale')
    }
  }

  const handlePaymentStatusChange = async (saleId: number, newStatus: 'paid' | 'partial' | 'pending') => {
    try {
      const result = await updatePaymentStatus(saleId, newStatus)
      if (result.success) {
        toast.success(`Payment status updated to ${newStatus}`)
        loadData()
      } else {
        toast.error((result as any).message || 'Failed to update payment status')
      }
    } catch (error) {
      console.error('Failed to update payment status:', error)
      toast.error('Failed to update payment status')
    }
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      paid: 'bg-success/10 text-success border-success/20',
      partial: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
      pending: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    }
    return (
      <Badge variant="outline" className={`text-[10px] ${styles[status] || ''}`}>
        {status}
      </Badge>
    )
  }

  const summaryCards = summary ? [
    { title: 'Total Sales', value: String(summary.totalSales), icon: ShoppingCart, accent: 'text-primary' },
    { title: 'Total Revenue', value: `Rs. ${Number(summary.totalRevenue).toLocaleString()}`, icon: DollarSign, accent: 'text-success' },
    { title: "Today's Sales", value: String(summary.todaySales), icon: Clock, accent: 'text-blue-400' },
    { title: "Today's Revenue", value: `Rs. ${Number(summary.todayRevenue).toLocaleString()}`, icon: TrendingUp, accent: 'text-muted-foreground' },
  ] : []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Sales History</h1>
        <p className="text-sm text-muted-foreground mt-1">View and manage past transactions</p>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {summaryCards.map((card) => (
            <Card key={card.title} className="card-tactical">
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{card.title}</p>
                    <p className="text-2xl font-bold tracking-tight">{card.value}</p>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <card.icon className={`w-5 h-5 ${card.accent}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by invoice or customer..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                {paymentStatuses.map((s) => (
                  <SelectItem key={s} value={s} className="capitalize">{s === 'all' ? 'All Status' : s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterMethod} onValueChange={setFilterMethod}>
              <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                {paymentMethods.map((m) => (
                  <SelectItem key={m} value={m} className="capitalize">{m === 'all' ? 'All Methods' : m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant={showVoided ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setShowVoided(!showVoided)}
              className="text-xs"
            >
              {showVoided ? 'Hide Voided' : 'Show Voided'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sales Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="text-right">Subtotal</TableHead>
                <TableHead className="text-right">Tax</TableHead>
                <TableHead className="text-right">Discount</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableLoader colSpan={10} />
              ) : salesData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">No sales found</TableCell>
                </TableRow>
              ) : (
                salesData.map((row) => {
                  const s = row.sale
                  return (
                    <TableRow key={s.id} className={s.isVoided ? 'opacity-50' : ''}>
                      <TableCell className="font-mono text-xs">
                        <div className="flex items-center gap-2">
                          {s.isVoided && (
                            <Badge variant="outline" className="text-[10px] bg-destructive/10 text-destructive border-destructive/20">VOID</Badge>
                          )}
                          <span className={s.isVoided ? 'line-through' : ''}>{s.invoiceNumber}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(s.saleDate).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-sm">
                        {row.customerName || <span className="text-muted-foreground italic">Walk-in</span>}
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">Rs. {Number(s.subtotal).toLocaleString()}</TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">Rs. {Number(s.taxAmount).toLocaleString()}</TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">
                        {Number(s.discountAmount) > 0 ? `Rs. ${Number(s.discountAmount).toLocaleString()}` : '-'}
                      </TableCell>
                      <TableCell className="text-right text-sm font-semibold">Rs. {Number(s.totalAmount).toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px] capitalize">{s.paymentMethod}</Badge>
                      </TableCell>
                      <TableCell>
                        {!s.isVoided ? (
                          <Select
                            value={s.paymentStatus}
                            onValueChange={(value) => handlePaymentStatusChange(s.id, value as any)}
                          >
                            <SelectTrigger className="h-7 w-[100px] text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="paid">Paid</SelectItem>
                              <SelectItem value="partial">Partial</SelectItem>
                              <SelectItem value="pending">Pending</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          getStatusBadge(s.paymentStatus)
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary"
                            onClick={() => handleViewSale(s.id)}
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                          {!s.isVoided && (
                            <Button
                              variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive"
                              onClick={() => { setVoidTarget(s); setVoidReason(''); setVoidOpen(true) }}
                            >
                              <Ban className="w-3.5 h-3.5" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Sale Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Receipt className="w-5 h-5" />
              {selectedSale?.sale?.invoiceNumber}
              {selectedSale?.sale?.isVoided && (
                <Badge variant="outline" className="text-[10px] bg-destructive/10 text-destructive border-destructive/20">VOIDED</Badge>
              )}
            </DialogTitle>
            <DialogDescription>
              {selectedSale?.sale?.saleDate && new Date(selectedSale.sale.saleDate).toLocaleString()} &middot; {selectedSale?.customerName || 'Walk-in Customer'}
            </DialogDescription>
          </DialogHeader>

          {selectedSale && (
            <div className="space-y-4 mt-2">
              {/* Items */}
              <div>
                <h4 className="text-sm font-semibold mb-2">Items</h4>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead className="text-center">Qty</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(selectedSale.items || []).map((item: any, i: number) => (
                        <TableRow key={i}>
                          <TableCell>
                            <div>
                              <p className="text-sm font-medium">{item.productName}</p>
                              <p className="text-[10px] font-mono text-muted-foreground">{item.productCode}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-center text-sm">{item.item.quantity}</TableCell>
                          <TableCell className="text-right text-sm">Rs. {Number(item.item.unitPrice).toLocaleString()}</TableCell>
                          <TableCell className="text-right text-sm font-medium">Rs. {Number(item.item.totalPrice).toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Summary */}
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>Rs. {Number(selectedSale.sale.subtotal).toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Tax</span><span>Rs. {Number(selectedSale.sale.taxAmount).toLocaleString()}</span></div>
                {Number(selectedSale.sale.discountAmount) > 0 && (
                  <div className="flex justify-between"><span className="text-muted-foreground">Discount</span><span className="text-success">-Rs. {Number(selectedSale.sale.discountAmount).toLocaleString()}</span></div>
                )}
                <div className="flex justify-between border-t pt-1.5 font-semibold text-base">
                  <span>Total</span><span>Rs. {Number(selectedSale.sale.totalAmount).toLocaleString()}</span>
                </div>
              </div>

              {/* Payments */}
              {(selectedSale.payments || []).length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-2">Payments</h4>
                  <div className="space-y-1.5">
                    {selectedSale.payments.map((p: any, i: number) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px] capitalize">{p.paymentMethod}</Badge>
                          {p.referenceNumber && <span className="font-mono text-xs text-muted-foreground">{p.referenceNumber}</span>}
                        </div>
                        <span>Rs. {Number(p.amount).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedSale.sale.isVoided && selectedSale.sale.voidReason && (
                <div className="p-3 rounded-md bg-destructive/5 border border-destructive/20">
                  <p className="text-sm font-medium text-destructive">Void Reason</p>
                  <p className="text-sm text-muted-foreground mt-1">{selectedSale.sale.voidReason}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Void Confirmation Dialog */}
      <Dialog open={voidOpen} onOpenChange={setVoidOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="text-destructive">Void Sale</DialogTitle>
            <DialogDescription>
              This will void invoice {voidTarget?.invoiceNumber}. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div className="space-y-2">
              <Label>Reason *</Label>
              <Textarea
                placeholder="Why is this sale being voided?"
                value={voidReason}
                onChange={(e) => setVoidReason(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setVoidOpen(false)}>Cancel</Button>
            <Button variant="destructive" disabled={!voidReason.trim() || voiding} onClick={handleVoidSale}>
              <Ban className="w-4 h-4 mr-2" />
              {voiding ? 'Voiding...' : 'Void Sale'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
