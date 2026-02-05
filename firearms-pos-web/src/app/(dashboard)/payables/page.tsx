'use client'

import { useState } from 'react'
import {
  ArrowUpFromLine,
  Plus,
  Filter,
  DollarSign,
  Clock,
  AlertTriangle,
  CreditCard,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Progress } from '@/components/ui/progress'

const mockPayables = [
  { id: 1, supplierName: 'Arms Corp International', invoiceNumber: 'ACI-2026-018', totalAmount: '350000', paidAmount: '150000', remainingAmount: '200000', status: 'partial', dueDate: '2026-02-28' },
  { id: 2, supplierName: 'Tactical Gear Supply', invoiceNumber: 'TGS-1105', totalAmount: '85000', paidAmount: '0', remainingAmount: '85000', status: 'pending', dueDate: '2026-02-15' },
  { id: 3, supplierName: 'Ammo Distributors PK', invoiceNumber: 'ADP-0442', totalAmount: '125000', paidAmount: '125000', remainingAmount: '0', status: 'paid', dueDate: '2026-02-10' },
  { id: 4, supplierName: 'Precision Optics Ltd', invoiceNumber: 'POL-890', totalAmount: '67000', paidAmount: '0', remainingAmount: '67000', status: 'overdue', dueDate: '2026-01-25' },
]

const summaryCards = [
  { title: 'Total Outstanding', value: 'Rs. 352,000', icon: DollarSign, accent: 'text-destructive' },
  { title: 'Total Paid', value: 'Rs. 275,000', icon: CreditCard, accent: 'text-success' },
  { title: 'Pending', value: '2', icon: Clock, accent: 'text-warning' },
  { title: 'Overdue', value: '1', icon: AlertTriangle, accent: 'text-destructive' },
]

const statusColors: Record<string, string> = {
  pending: 'bg-warning/10 text-warning border-warning/20',
  partial: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  paid: 'bg-success/10 text-success border-success/20',
  overdue: 'bg-destructive/10 text-destructive border-destructive/20',
  cancelled: 'bg-muted text-muted-foreground border-border',
}

export default function PayablesPage() {
  const [filterStatus, setFilterStatus] = useState('all')

  const filtered = mockPayables.filter((p) => {
    if (filterStatus !== 'all' && p.status !== filterStatus) return false
    return true
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Account Payables</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage supplier payments and outstanding balances</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="brass-glow">
              <Plus className="w-4 h-4 mr-2" />
              New Payable
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create Account Payable</DialogTitle>
            </DialogHeader>
            <form className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Supplier</Label>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Select supplier" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Arms Corp International</SelectItem>
                    <SelectItem value="2">Tactical Gear Supply</SelectItem>
                    <SelectItem value="3">Ammo Distributors PK</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Invoice Number</Label>
                  <Input placeholder="INV-XXX" />
                </div>
                <div className="space-y-2">
                  <Label>Total Amount (Rs.)</Label>
                  <Input type="number" placeholder="0.00" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Due Date</Label>
                  <Input type="date" />
                </div>
                <div className="space-y-2">
                  <Label>Payment Terms</Label>
                  <Input placeholder="e.g., Net 30" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Input placeholder="Optional notes" />
              </div>
              <Button type="submit" className="w-full brass-glow">Create Payable</Button>
            </form>
          </DialogContent>
        </Dialog>
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
          <div className="flex items-center gap-3">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Supplier</TableHead>
                <TableHead>Invoice</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead className="text-right">Remaining</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p) => {
                const progress = (Number(p.paidAmount) / Number(p.totalAmount)) * 100
                return (
                  <TableRow key={p.id}>
                    <TableCell className="text-sm font-medium">{p.supplierName}</TableCell>
                    <TableCell className="text-sm font-mono text-muted-foreground">{p.invoiceNumber}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{p.dueDate}</TableCell>
                    <TableCell className="text-right text-sm">Rs. {Number(p.totalAmount).toLocaleString()}</TableCell>
                    <TableCell className="w-[120px]">
                      <div className="space-y-1">
                        <Progress value={progress} className="h-1.5" />
                        <p className="text-[10px] text-muted-foreground">{Math.round(progress)}% paid</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-sm font-semibold">Rs. {Number(p.remainingAmount).toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[10px] ${statusColors[p.status]}`}>
                        {p.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {p.status !== 'paid' && (
                        <Button variant="outline" size="sm" className="h-7 text-xs">
                          <ArrowUpFromLine className="w-3 h-3 mr-1" />
                          Pay
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
