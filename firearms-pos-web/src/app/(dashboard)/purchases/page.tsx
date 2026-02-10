'use client'

import { useState, useEffect } from 'react'
import {
  ShoppingBag,
  Plus,
  Filter,
  DollarSign,
  Package,
  Clock,
  CheckCircle2,
  Eye,
  Truck,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  getPurchases,
  getPurchaseSummary,
  updatePurchaseStatus,
  receivePurchase,
  getPurchaseItems,
} from '@/actions/purchases'
import { toast } from 'sonner'
import { PageLoader } from '@/components/ui/page-loader'

const statusColors: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  ordered: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  partial: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  received: 'bg-success/10 text-success border-success/20',
  cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
}

const paymentColors: Record<string, string> = {
  paid: 'bg-success/10 text-success border-success/20',
  partial: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  pending: 'bg-muted text-muted-foreground',
}

export default function PurchasesPage() {
  const [loading, setLoading] = useState(true)
  const [purchases, setPurchases] = useState<any[]>([])
  const [summary, setSummary] = useState<any>(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterPayment, setFilterPayment] = useState('all')
  const [receivingDialogOpen, setReceivingDialogOpen] = useState(false)
  const [selectedPurchase, setSelectedPurchase] = useState<any>(null)
  const [receivingItems, setReceivingItems] = useState<any[]>([])
  const [submittingReceive, setSubmittingReceive] = useState(false)

  useEffect(() => {
    loadData()
  }, [filterStatus, filterPayment])

  async function loadData() {
    try {
      setLoading(true)
      const [purchasesRes, summaryRes] = await Promise.all([
        getPurchases({
          status: filterStatus !== 'all' ? filterStatus : undefined,
          paymentStatus: filterPayment !== 'all' ? filterPayment : undefined,
        }),
        getPurchaseSummary(),
      ])
      if (purchasesRes.success) {
        setPurchases(purchasesRes.data)
      }
      if (summaryRes.success) {
        setSummary(summaryRes.data)
      }
    } catch (error) {
      console.error('Failed to load purchases:', error)
      toast.error('Failed to load purchases')
    } finally {
      setLoading(false)
    }
  }

  async function handleMarkReceived(id: number) {
    if (!confirm('Mark this purchase as received?')) return
    try {
      const res = await updatePurchaseStatus(id, 'received')
      if (res.success) {
        toast.success('Purchase marked as received')
        loadData()
      }
    } catch (error) {
      console.error('Failed to update purchase:', error)
      toast.error('Failed to update purchase')
    }
  }

  async function handleOpenReceivingDialog(purchaseId: number) {
    try {
      const res = await getPurchaseItems(purchaseId)
      if (res.success && res.data) {
        setSelectedPurchase(res.data.purchase)
        setReceivingItems(
          res.data.items.map((item: any) => ({
            ...item,
            receivedQuantity: item.item.quantity - (item.item.receivedQuantity || 0),
          }))
        )
        setReceivingDialogOpen(true)
      } else {
        toast.error('Failed to load purchase items')
      }
    } catch (error) {
      console.error('Failed to load purchase items:', error)
      toast.error('Failed to load purchase items')
    }
  }

  function handleUpdateReceivedQty(itemId: number, qty: number) {
    setReceivingItems((prev) =>
      prev.map((item) =>
        item.item.id === itemId
          ? { ...item, receivedQuantity: Math.max(0, Math.min(qty, item.item.quantity - (item.item.receivedQuantity || 0))) }
          : item
      )
    )
  }

  async function handleProcessReceiving() {
    if (!selectedPurchase) return

    const itemsToReceive = receivingItems
      .filter((item) => item.receivedQuantity > 0)
      .map((item) => ({
        purchaseItemId: item.item.id,
        receivedQuantity: item.receivedQuantity,
      }))

    if (itemsToReceive.length === 0) {
      toast.error('Please enter quantities to receive')
      return
    }

    setSubmittingReceive(true)
    try {
      const res = await receivePurchase(selectedPurchase.id, itemsToReceive)
      if (res.success) {
        toast.success('Purchase items received successfully')
        setReceivingDialogOpen(false)
        setSelectedPurchase(null)
        setReceivingItems([])
        loadData()
      } else {
        toast.error(res.message || 'Failed to receive items')
      }
    } catch (error) {
      console.error('Failed to receive items:', error)
      toast.error('Failed to receive items')
    } finally {
      setSubmittingReceive(false)
    }
  }

  const summaryCards = [
    { title: 'Total Purchases', value: 'Rs. ' + Number(summary?.totalPurchases || 0).toLocaleString(), icon: DollarSign, accent: 'text-primary' },
    { title: 'Total Orders', value: String(summary?.totalCount || 0), icon: ShoppingBag, accent: 'text-blue-400' },
    { title: 'Pending', value: String(summary?.pendingCount || 0), icon: Clock, accent: 'text-yellow-400' },
    { title: 'Received', value: String(summary?.receivedCount || 0), icon: CheckCircle2, accent: 'text-success' },
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Purchases</h1>
            <PageLoader />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Purchases</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage purchase orders and receiving</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="brass-glow">
              <Plus className="w-4 h-4 mr-2" />
              New Purchase
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Create Purchase Order</DialogTitle>
            </DialogHeader>
            <form className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Supplier</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Select supplier" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Arms Corp</SelectItem>
                      <SelectItem value="2">Ammo Direct</SelectItem>
                      <SelectItem value="3">Tactical Gear Co</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Cash</SelectItem>
                      <SelectItem value="cheque">Cheque</SelectItem>
                      <SelectItem value="pay_later">Pay Later</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Expected Delivery Date</Label>
                <Input type="date" />
              </div>
              <div className="border rounded-lg p-4 space-y-3">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Items</p>
                <div className="grid grid-cols-12 gap-2">
                  <div className="col-span-5">
                    <Select>
                      <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Product" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">9mm Ammunition</SelectItem>
                        <SelectItem value="2">Cleaning Kit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-3"><Input type="number" placeholder="Qty" className="h-9 text-sm" /></div>
                  <div className="col-span-3"><Input type="number" placeholder="Unit Cost" className="h-9 text-sm" /></div>
                  <div className="col-span-1"></div>
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  <Plus className="w-3 h-3 mr-1" /> Add Item
                </Button>
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Input placeholder="Additional notes" />
              </div>
              <Button type="submit" className="w-full brass-glow">Create Purchase Order</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

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

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="ordered">Ordered</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
                <SelectItem value="received">Received</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterPayment} onValueChange={setFilterPayment}>
              <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payments</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>PO #</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Items</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchases.map((po) => (
                <TableRow key={po.purchase.id} className={po.purchase.status === 'cancelled' ? 'opacity-50' : ''}>
                  <TableCell>
                    <code className="text-sm font-bold font-mono bg-primary/10 text-primary px-2 py-0.5 rounded">
                      {po.purchase.purchaseOrderNumber}
                    </code>
                  </TableCell>
                  <TableCell className="text-sm font-medium">{po.supplierName || 'Unknown'}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Package className="w-3 h-3" />
                      Items
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-sm font-semibold">Rs. {Number(po.purchase.totalAmount).toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`text-[10px] capitalize ${statusColors[po.purchase.status]}`}>
                      {po.purchase.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`text-[10px] capitalize ${paymentColors[po.purchase.paymentStatus]}`}>
                      {po.purchase.paymentStatus}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(po.purchase.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" title="View details">
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                      {(po.purchase.status === 'ordered' || po.purchase.status === 'partial') && (
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-success" title="Receive items" onClick={() => handleOpenReceivingDialog(po.purchase.id)}>
                          <Truck className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {purchases.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No purchase orders found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={receivingDialogOpen} onOpenChange={setReceivingDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Receive Purchase Items</DialogTitle>
          </DialogHeader>
          {selectedPurchase && (
            <div className="space-y-4">
              <div className="rounded-lg bg-muted/50 p-3">
                <p className="text-sm font-medium">PO #: {selectedPurchase.purchaseOrderNumber}</p>
                <p className="text-xs text-muted-foreground mt-1">Enter quantities being received</p>
              </div>

              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {receivingItems.map((item) => (
                  <div key={item.item.id} className="rounded-lg border p-3 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-sm">{item.productName}</p>
                        <p className="text-xs text-muted-foreground">
                          Ordered: {item.item.quantity} | Already Received: {item.item.receivedQuantity || 0}
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground">Rs. {Number(item.item.unitCost).toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Label className="text-xs min-w-[100px]">Receive Qty:</Label>
                      <Input
                        type="number"
                        min="0"
                        max={item.item.quantity - (item.item.receivedQuantity || 0)}
                        value={item.receivedQuantity}
                        onChange={(e) => handleUpdateReceivedQty(item.item.id, parseInt(e.target.value) || 0)}
                        className="h-8"
                      />
                      <span className="text-xs text-muted-foreground">
                        / {item.item.quantity - (item.item.receivedQuantity || 0)} remaining
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 justify-end pt-4 border-t">
                <Button variant="outline" onClick={() => setReceivingDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleProcessReceiving} className="brass-glow" disabled={submittingReceive}>
                  {submittingReceive ? 'Processing...' : 'Receive Items'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
