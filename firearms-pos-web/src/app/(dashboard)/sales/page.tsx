'use client'

import { useState } from 'react'
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
  X,
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

type Sale = {
  id: number
  invoiceNumber: string
  saleDate: string
  customerName: string | null
  itemCount: number
  subtotal: number
  taxAmount: number
  discountAmount: number
  totalAmount: number
  paymentMethod: string
  paymentStatus: string
  isVoided: boolean
  voidReason: string | null
  items: {
    productName: string
    productCode: string
    quantity: number
    unitPrice: number
    totalPrice: number
  }[]
  payments: {
    method: string
    amount: number
    reference: string | null
  }[]
}

const mockSales: Sale[] = [
  {
    id: 1, invoiceNumber: 'INV-20260201-001', saleDate: '2026-02-01 10:30', customerName: 'Ahmed Khan',
    itemCount: 2, subtotal: 123500, taxAmount: 19760, discountAmount: 0, totalAmount: 143260,
    paymentMethod: 'cash', paymentStatus: 'paid', isVoided: false, voidReason: null,
    items: [
      { productName: 'Glock 19 Gen5', productCode: 'P-001', quantity: 1, unitPrice: 120000, totalPrice: 120000 },
      { productName: '9mm FMJ Box (50rds)', productCode: 'A-001', quantity: 1, unitPrice: 3500, totalPrice: 3500 },
    ],
    payments: [{ method: 'cash', amount: 150000, reference: null }],
  },
  {
    id: 2, invoiceNumber: 'INV-20260201-002', saleDate: '2026-02-01 14:15', customerName: 'Fatima Malik',
    itemCount: 1, subtotal: 110000, taxAmount: 17600, discountAmount: 5000, totalAmount: 122600,
    paymentMethod: 'card', paymentStatus: 'paid', isVoided: false, voidReason: null,
    items: [
      { productName: 'Beretta 92FS', productCode: 'P-002', quantity: 1, unitPrice: 110000, totalPrice: 110000 },
    ],
    payments: [{ method: 'card', amount: 122600, reference: 'TXN-88432' }],
  },
  {
    id: 3, invoiceNumber: 'INV-20260202-001', saleDate: '2026-02-02 09:45', customerName: 'Bilal Ahmed',
    itemCount: 3, subtotal: 14700, taxAmount: 2352, discountAmount: 0, totalAmount: 17052,
    paymentMethod: 'cash', paymentStatus: 'paid', isVoided: false, voidReason: null,
    items: [
      { productName: '9mm FMJ Box (50rds)', productCode: 'A-001', quantity: 2, unitPrice: 3500, totalPrice: 7000 },
      { productName: '.45 ACP Hollow Point (25rds)', productCode: 'A-002', quantity: 1, unitPrice: 5200, totalPrice: 5200 },
      { productName: 'Gun Cleaning Kit', productCode: 'ACC-003', quantity: 1, unitPrice: 2500, totalPrice: 2500 },
    ],
    payments: [{ method: 'cash', amount: 20000, reference: null }],
  },
  {
    id: 4, invoiceNumber: 'INV-20260203-001', saleDate: '2026-02-03 11:00', customerName: 'Hassan Raza',
    itemCount: 1, subtotal: 195000, taxAmount: 31200, discountAmount: 10000, totalAmount: 216200,
    paymentMethod: 'mixed', paymentStatus: 'paid', isVoided: false, voidReason: null,
    items: [
      { productName: 'AR-15 Standard', productCode: 'R-001', quantity: 1, unitPrice: 195000, totalPrice: 195000 },
    ],
    payments: [
      { method: 'cash', amount: 100000, reference: null },
      { method: 'card', amount: 116200, reference: 'TXN-88501' },
    ],
  },
  {
    id: 5, invoiceNumber: 'INV-20260203-002', saleDate: '2026-02-03 16:30', customerName: null,
    itemCount: 2, subtotal: 7000, taxAmount: 1120, discountAmount: 0, totalAmount: 8120,
    paymentMethod: 'cash', paymentStatus: 'paid', isVoided: true, voidReason: 'Customer changed mind after purchase',
    items: [
      { productName: '9mm FMJ Box (50rds)', productCode: 'A-001', quantity: 2, unitPrice: 3500, totalPrice: 7000 },
    ],
    payments: [{ method: 'cash', amount: 10000, reference: null }],
  },
  {
    id: 6, invoiceNumber: 'INV-20260204-001', saleDate: '2026-02-04 10:15', customerName: 'Zainab Ali',
    itemCount: 1, subtotal: 35000, taxAmount: 5600, discountAmount: 0, totalAmount: 40600,
    paymentMethod: 'credit', paymentStatus: 'pending', isVoided: false, voidReason: null,
    items: [
      { productName: 'Red Dot Sight', productCode: 'ACC-001', quantity: 1, unitPrice: 35000, totalPrice: 35000 },
    ],
    payments: [],
  },
  {
    id: 7, invoiceNumber: 'INV-20260205-001', saleDate: '2026-02-05 13:45', customerName: 'Ayesha Hussain',
    itemCount: 2, subtotal: 125200, taxAmount: 20032, discountAmount: 2000, totalAmount: 143232,
    paymentMethod: 'card', paymentStatus: 'paid', isVoided: false, voidReason: null,
    items: [
      { productName: 'Glock 19 Gen5', productCode: 'P-001', quantity: 1, unitPrice: 120000, totalPrice: 120000 },
      { productName: '.45 ACP Hollow Point (25rds)', productCode: 'A-002', quantity: 1, unitPrice: 5200, totalPrice: 5200 },
    ],
    payments: [{ method: 'card', amount: 143232, reference: 'TXN-88599' }],
  },
  {
    id: 8, invoiceNumber: 'INV-20260206-001', saleDate: '2026-02-06 15:00', customerName: 'Imran Sheikh',
    itemCount: 4, subtotal: 19200, taxAmount: 3072, discountAmount: 1000, totalAmount: 21272,
    paymentMethod: 'mobile', paymentStatus: 'paid', isVoided: false, voidReason: null,
    items: [
      { productName: '9mm FMJ Box (50rds)', productCode: 'A-001', quantity: 3, unitPrice: 3500, totalPrice: 10500 },
      { productName: '.45 ACP Hollow Point (25rds)', productCode: 'A-002', quantity: 1, unitPrice: 5200, totalPrice: 5200 },
      { productName: 'Gun Cleaning Kit', productCode: 'ACC-003', quantity: 1, unitPrice: 2500, totalPrice: 2500 },
      { productName: 'Ear Protection', productCode: 'ACC-004', quantity: 1, unitPrice: 1000, totalPrice: 1000 },
    ],
    payments: [{ method: 'mobile', amount: 21272, reference: 'JZC-7721' }],
  },
]

const paymentMethods = ['all', 'cash', 'card', 'credit', 'mixed', 'mobile', 'cod', 'receivable']
const paymentStatuses = ['all', 'paid', 'partial', 'pending']

const summaryCards = [
  { title: 'Total Sales', value: '8', icon: ShoppingCart, accent: 'text-primary' },
  { title: 'Total Revenue', value: 'Rs. 712,346', icon: DollarSign, accent: 'text-success' },
  { title: "Today's Sales", value: '2', icon: Clock, accent: 'text-blue-400' },
  { title: "Today's Revenue", value: 'Rs. 164,504', icon: TrendingUp, accent: 'text-muted-foreground' },
]

export default function SalesPage() {
  const [search, setSearch] = useState('')
  const [filterMethod, setFilterMethod] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showVoided, setShowVoided] = useState(true)
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null)
  const [detailOpen, setDetailOpen] = useState(false)
  const [voidOpen, setVoidOpen] = useState(false)
  const [voidTarget, setVoidTarget] = useState<Sale | null>(null)
  const [voidReason, setVoidReason] = useState('')

  const filtered = mockSales.filter((s) => {
    if (!showVoided && s.isVoided) return false
    if (filterMethod !== 'all' && s.paymentMethod !== filterMethod) return false
    if (filterStatus !== 'all' && s.paymentStatus !== filterStatus) return false
    if (search) {
      const q = search.toLowerCase()
      if (
        !s.invoiceNumber.toLowerCase().includes(q) &&
        !(s.customerName?.toLowerCase().includes(q))
      ) return false
    }
    return true
  })

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

  const getMethodBadge = (method: string) => {
    return (
      <Badge variant="outline" className="text-[10px] capitalize">
        {method}
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Sales History</h1>
        <p className="text-sm text-muted-foreground mt-1">View and manage past transactions</p>
      </div>

      {/* Summary Cards */}
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
                <TableHead className="text-center">Items</TableHead>
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
              {filtered.map((sale) => (
                <TableRow key={sale.id} className={sale.isVoided ? 'opacity-50' : ''}>
                  <TableCell className="font-mono text-xs">
                    <div className="flex items-center gap-2">
                      {sale.isVoided && (
                        <Badge variant="outline" className="text-[10px] bg-destructive/10 text-destructive border-destructive/20">VOID</Badge>
                      )}
                      <span className={sale.isVoided ? 'line-through' : ''}>{sale.invoiceNumber}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{sale.saleDate}</TableCell>
                  <TableCell className="text-sm">{sale.customerName || <span className="text-muted-foreground italic">Walk-in</span>}</TableCell>
                  <TableCell className="text-center text-sm">{sale.itemCount}</TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">Rs. {sale.subtotal.toLocaleString()}</TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">Rs. {sale.taxAmount.toLocaleString()}</TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">
                    {sale.discountAmount > 0 ? `Rs. ${sale.discountAmount.toLocaleString()}` : '-'}
                  </TableCell>
                  <TableCell className="text-right text-sm font-semibold">Rs. {sale.totalAmount.toLocaleString()}</TableCell>
                  <TableCell>{getMethodBadge(sale.paymentMethod)}</TableCell>
                  <TableCell>{getStatusBadge(sale.paymentStatus)}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary"
                        onClick={() => { setSelectedSale(sale); setDetailOpen(true) }}
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                      {!sale.isVoided && (
                        <Button
                          variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => { setVoidTarget(sale); setVoidReason(''); setVoidOpen(true) }}
                        >
                          <Ban className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-8 text-muted-foreground">No sales found</TableCell>
                </TableRow>
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
              {selectedSale?.invoiceNumber}
              {selectedSale?.isVoided && (
                <Badge variant="outline" className="text-[10px] bg-destructive/10 text-destructive border-destructive/20">VOIDED</Badge>
              )}
            </DialogTitle>
            <DialogDescription>
              {selectedSale?.saleDate} &middot; {selectedSale?.customerName || 'Walk-in Customer'}
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
                      {selectedSale.items.map((item, i) => (
                        <TableRow key={i}>
                          <TableCell>
                            <div>
                              <p className="text-sm font-medium">{item.productName}</p>
                              <p className="text-[10px] font-mono text-muted-foreground">{item.productCode}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-center text-sm">{item.quantity}</TableCell>
                          <TableCell className="text-right text-sm">Rs. {item.unitPrice.toLocaleString()}</TableCell>
                          <TableCell className="text-right text-sm font-medium">Rs. {item.totalPrice.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Summary */}
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>Rs. {selectedSale.subtotal.toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Tax</span><span>Rs. {selectedSale.taxAmount.toLocaleString()}</span></div>
                {selectedSale.discountAmount > 0 && (
                  <div className="flex justify-between"><span className="text-muted-foreground">Discount</span><span className="text-success">-Rs. {selectedSale.discountAmount.toLocaleString()}</span></div>
                )}
                <div className="flex justify-between border-t pt-1.5 font-semibold text-base">
                  <span>Total</span><span>Rs. {selectedSale.totalAmount.toLocaleString()}</span>
                </div>
              </div>

              {/* Payments */}
              {selectedSale.payments.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-2">Payments</h4>
                  <div className="space-y-1.5">
                    {selectedSale.payments.map((p, i) => (
                      <div key={i} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px] capitalize">{p.method}</Badge>
                          {p.reference && <span className="font-mono text-xs text-muted-foreground">{p.reference}</span>}
                        </div>
                        <span>Rs. {p.amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedSale.isVoided && selectedSale.voidReason && (
                <div className="p-3 rounded-md bg-destructive/5 border border-destructive/20">
                  <p className="text-sm font-medium text-destructive">Void Reason</p>
                  <p className="text-sm text-muted-foreground mt-1">{selectedSale.voidReason}</p>
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
            <Button variant="destructive" disabled={!voidReason.trim()}>
              <Ban className="w-4 h-4 mr-2" />
              Void Sale
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
