'use client'

import { useState } from 'react'
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

const mockPurchases = [
  { id: 1, purchaseOrderNumber: 'PO-001', supplierName: 'Arms Corp', status: 'received', paymentStatus: 'paid', totalAmount: '250000', itemCount: 5, createdAt: '2026-02-01' },
  { id: 2, purchaseOrderNumber: 'PO-002', supplierName: 'Ammo Direct', status: 'ordered', paymentStatus: 'pending', totalAmount: '180000', itemCount: 3, createdAt: '2026-02-03' },
  { id: 3, purchaseOrderNumber: 'PO-003', supplierName: 'Tactical Gear Co', status: 'partial', paymentStatus: 'partial', totalAmount: '95000', itemCount: 8, createdAt: '2026-02-04' },
  { id: 4, purchaseOrderNumber: 'PO-004', supplierName: 'Arms Corp', status: 'draft', paymentStatus: 'pending', totalAmount: '320000', itemCount: 2, createdAt: '2026-02-05' },
  { id: 5, purchaseOrderNumber: 'PO-005', supplierName: 'Gun Parts Ltd', status: 'cancelled', paymentStatus: 'pending', totalAmount: '45000', itemCount: 1, createdAt: '2026-01-28' },
]

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

const summaryCards = [
  { title: 'Total Purchases', value: 'Rs. 890,000', icon: DollarSign, accent: 'text-primary' },
  { title: 'Total Orders', value: String(mockPurchases.length), icon: ShoppingBag, accent: 'text-blue-400' },
  { title: 'Pending', value: String(mockPurchases.filter((p) => p.status === 'ordered' || p.status === 'draft').length), icon: Clock, accent: 'text-yellow-400' },
  { title: 'Received', value: String(mockPurchases.filter((p) => p.status === 'received').length), icon: CheckCircle2, accent: 'text-success' },
]

export default function PurchasesPage() {
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterPayment, setFilterPayment] = useState('all')

  const filtered = mockPurchases.filter((p) => {
    if (filterStatus !== 'all' && p.status !== filterStatus) return false
    if (filterPayment !== 'all' && p.paymentStatus !== filterPayment) return false
    return true
  })

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
              {filtered.map((po) => (
                <TableRow key={po.id} className={po.status === 'cancelled' ? 'opacity-50' : ''}>
                  <TableCell>
                    <code className="text-sm font-bold font-mono bg-primary/10 text-primary px-2 py-0.5 rounded">
                      {po.purchaseOrderNumber}
                    </code>
                  </TableCell>
                  <TableCell className="text-sm font-medium">{po.supplierName}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Package className="w-3 h-3" />
                      {po.itemCount}
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-sm font-semibold">Rs. {Number(po.totalAmount).toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`text-[10px] capitalize ${statusColors[po.status]}`}>
                      {po.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`text-[10px] capitalize ${paymentColors[po.paymentStatus]}`}>
                      {po.paymentStatus}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{po.createdAt}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" title="View details">
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                      {po.status === 'ordered' && (
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-success" title="Mark received">
                          <Truck className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
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
    </div>
  )
}
