'use client'

import { useState, useEffect } from 'react'
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
import { getPayables, getPayableSummary, createPayable } from '@/actions/payables'
import { getSuppliers } from '@/actions/suppliers'
import { getBranches } from '@/actions/branches'

const statusColors: Record<string, string> = {
  pending: 'bg-warning/10 text-warning border-warning/20',
  partial: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  paid: 'bg-success/10 text-success border-success/20',
  overdue: 'bg-destructive/10 text-destructive border-destructive/20',
  cancelled: 'bg-muted text-muted-foreground border-border',
}

export default function PayablesPage() {
  const [filterStatus, setFilterStatus] = useState('all')
  const [payables, setPayables] = useState<any[]>([])
  const [summary, setSummary] = useState<any>(null)
  const [suppliers, setSuppliers] = useState<any[]>([])
  const [branches, setBranches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    supplierId: '',
    branchId: '',
    invoiceNumber: '',
    totalAmount: '',
    dueDate: '',
    paymentTerms: '',
    notes: '',
  })

  useEffect(() => {
    loadData()
  }, [filterStatus])

  async function loadData() {
    try {
      setLoading(true)
      const [payablesRes, summaryRes, suppliersRes, branchesRes] = await Promise.all([
        getPayables({ status: filterStatus }),
        getPayableSummary(),
        getSuppliers({ isActive: true }),
        getBranches({ isActive: true }),
      ])

      if (payablesRes.success) {
        setPayables(payablesRes.data)
      }
      if (summaryRes.success) {
        setSummary(summaryRes.data)
      }
      if (suppliersRes.success) {
        setSuppliers(suppliersRes.data)
      }
      if (branchesRes.success) {
        setBranches(branchesRes.data.map((b: any) => b.branch))
      }
    } catch (error) {
      console.error('Failed to load payables:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreatePayable(e: React.FormEvent) {
    e.preventDefault()
    try {
      const result = await createPayable({
        supplierId: Number(formData.supplierId),
        branchId: Number(formData.branchId),
        invoiceNumber: formData.invoiceNumber,
        totalAmount: formData.totalAmount,
        dueDate: formData.dueDate || undefined,
        paymentTerms: formData.paymentTerms || undefined,
        notes: formData.notes || undefined,
      })

      if (result.success) {
        setIsDialogOpen(false)
        setFormData({
          supplierId: '',
          branchId: '',
          invoiceNumber: '',
          totalAmount: '',
          dueDate: '',
          paymentTerms: '',
          notes: '',
        })
        loadData()
      }
    } catch (error) {
      console.error('Failed to create payable:', error)
    }
  }

  const summaryCards = [
    {
      title: 'Total Outstanding',
      value: `Rs. ${Number(summary?.totalOutstanding || 0).toLocaleString()}`,
      icon: DollarSign,
      accent: 'text-destructive'
    },
    {
      title: 'Total Paid',
      value: `Rs. ${Number(summary?.totalPaid || 0).toLocaleString()}`,
      icon: CreditCard,
      accent: 'text-success'
    },
    {
      title: 'Pending',
      value: String(summary?.pendingCount || 0),
      icon: Clock,
      accent: 'text-warning'
    },
    {
      title: 'Overdue',
      value: String(summary?.overdueCount || 0),
      icon: AlertTriangle,
      accent: 'text-destructive'
    },
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Account Payables</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage supplier payments and outstanding balances</p>
          </div>
        </div>
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Account Payables</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage supplier payments and outstanding balances</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
            <form className="space-y-4 mt-4" onSubmit={handleCreatePayable}>
              <div className="space-y-2">
                <Label>Supplier</Label>
                <Select
                  value={formData.supplierId}
                  onValueChange={(value) => setFormData({ ...formData, supplierId: value })}
                  required
                >
                  <SelectTrigger><SelectValue placeholder="Select supplier" /></SelectTrigger>
                  <SelectContent>
                    {suppliers.map((supplier) => (
                      <SelectItem key={supplier.id} value={String(supplier.id)}>
                        {supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Branch</Label>
                <Select
                  value={formData.branchId}
                  onValueChange={(value) => setFormData({ ...formData, branchId: value })}
                  required
                >
                  <SelectTrigger><SelectValue placeholder="Select branch" /></SelectTrigger>
                  <SelectContent>
                    {branches.map((branch) => (
                      <SelectItem key={branch.id} value={String(branch.id)}>
                        {branch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Invoice Number</Label>
                  <Input
                    placeholder="INV-XXX"
                    value={formData.invoiceNumber}
                    onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Total Amount (Rs.)</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={formData.totalAmount}
                    onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Due Date</Label>
                  <Input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Payment Terms</Label>
                  <Input
                    placeholder="e.g., Net 30"
                    value={formData.paymentTerms}
                    onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Input
                  placeholder="Optional notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
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
              {payables.map((item) => {
                const p = item.payable
                const progress = (Number(p.paidAmount) / Number(p.totalAmount)) * 100
                return (
                  <TableRow key={p.id}>
                    <TableCell className="text-sm font-medium">{item.supplierName || 'N/A'}</TableCell>
                    <TableCell className="text-sm font-mono text-muted-foreground">{p.invoiceNumber}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {p.dueDate ? new Date(p.dueDate).toLocaleDateString() : 'N/A'}
                    </TableCell>
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
              {payables.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No payables found
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
