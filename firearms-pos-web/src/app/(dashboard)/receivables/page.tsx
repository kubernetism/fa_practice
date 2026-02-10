'use client'

import { useState, useEffect } from 'react'
import {
  ArrowDownToLine,
  Plus,
  Filter,
  DollarSign,
  Clock,
  AlertTriangle,
  Wallet,
  TrendingUp,
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
import { Progress } from '@/components/ui/progress'
import { getReceivables, getReceivableSummary, createReceivable, getReceivableAgingReport } from '@/actions/receivables'
import { getCustomers } from '@/actions/customers'
import { getBranches } from '@/actions/branches'
import { PageLoader } from '@/components/ui/page-loader'

const statusColors: Record<string, string> = {
  pending: 'bg-warning/10 text-warning border-warning/20',
  partial: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  paid: 'bg-success/10 text-success border-success/20',
  overdue: 'bg-destructive/10 text-destructive border-destructive/20',
}

export default function ReceivablesPage() {
  const [filterStatus, setFilterStatus] = useState('all')
  const [receivables, setReceivables] = useState<any[]>([])
  const [summary, setSummary] = useState<any>(null)
  const [customers, setCustomers] = useState<any[]>([])
  const [branches, setBranches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [showAging, setShowAging] = useState(false)
  const [agingReport, setAgingReport] = useState<any>(null)
  const [formData, setFormData] = useState({
    customerId: '',
    branchId: '',
    invoiceNumber: '',
    totalAmount: '',
    dueDate: '',
    notes: '',
  })

  useEffect(() => {
    loadData()
  }, [filterStatus])

  async function loadData() {
    try {
      setLoading(true)
      const [receivablesRes, summaryRes, customersRes, branchesRes, agingRes] = await Promise.all([
        getReceivables({ status: filterStatus }),
        getReceivableSummary(),
        getCustomers({ isActive: true }),
        getBranches({ isActive: true }),
        getReceivableAgingReport(),
      ])

      if (receivablesRes.success) {
        setReceivables(receivablesRes.data)
      }
      if (summaryRes.success) {
        setSummary(summaryRes.data)
      }
      if (customersRes.success) {
        setCustomers(customersRes.data)
      }
      if (branchesRes.success) {
        setBranches(branchesRes.data.map((b: any) => b.branch))
      }
      if (agingRes.success) {
        setAgingReport(agingRes.data)
      }
    } catch (error) {
      console.error('Failed to load receivables:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateReceivable(e: React.FormEvent) {
    e.preventDefault()
    try {
      const result = await createReceivable({
        customerId: Number(formData.customerId),
        branchId: Number(formData.branchId),
        invoiceNumber: formData.invoiceNumber,
        totalAmount: formData.totalAmount,
        dueDate: formData.dueDate || undefined,
        notes: formData.notes || undefined,
      })

      if (result.success) {
        setIsDialogOpen(false)
        setFormData({
          customerId: '',
          branchId: '',
          invoiceNumber: '',
          totalAmount: '',
          dueDate: '',
          notes: '',
        })
        loadData()
      }
    } catch (error) {
      console.error('Failed to create receivable:', error)
    }
  }

  const summaryCards = [
    {
      title: 'Total Outstanding',
      value: `Rs. ${Number(summary?.totalOutstanding || 0).toLocaleString()}`,
      icon: DollarSign,
      accent: 'text-primary'
    },
    {
      title: 'Total Collected',
      value: `Rs. ${Number(summary?.totalCollected || 0).toLocaleString()}`,
      icon: Wallet,
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
            <h1 className="text-2xl font-bold tracking-tight">Account Receivables</h1>
            <p className="text-sm text-muted-foreground mt-1">Track credit sales and customer collections</p>
          </div>
        </div>
        <PageLoader />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Account Receivables</h1>
          <p className="text-sm text-muted-foreground mt-1">Track credit sales and customer collections</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="brass-glow">
              <Plus className="w-4 h-4 mr-2" />
              New Receivable
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create Account Receivable</DialogTitle>
            </DialogHeader>
            <form className="space-y-4 mt-4" onSubmit={handleCreateReceivable}>
              <div className="space-y-2">
                <Label>Customer</Label>
                <Select
                  value={formData.customerId}
                  onValueChange={(value) => setFormData({ ...formData, customerId: value })}
                  required
                >
                  <SelectTrigger><SelectValue placeholder="Select customer" /></SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={String(customer.id)}>
                        {customer.firstName} {customer.lastName}
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
                  <Label>Notes</Label>
                  <Input
                    placeholder="Optional notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                </div>
              </div>
              <Button type="submit" className="w-full brass-glow">Create Receivable</Button>
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
          <div className="flex items-center justify-between">
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
            <Button variant="outline" onClick={() => setShowAging(!showAging)} className="gap-2">
              <TrendingUp className="w-4 h-4" />
              {showAging ? 'Hide' : 'Show'} Aging Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {showAging && (
        <Card className="card-tactical">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">Aging Report</h2>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead className="text-right">Total Outstanding</TableHead>
                  <TableHead className="text-right">Current</TableHead>
                  <TableHead className="text-right">1-30 Days</TableHead>
                  <TableHead className="text-right">31-60 Days</TableHead>
                  <TableHead className="text-right">61-90 Days</TableHead>
                  <TableHead className="text-right">90+ Days</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {(agingReport || []).map((item: any) => (
                  <TableRow key={item.customerId}>
                    <TableCell className="text-sm font-medium">{item.customerName}</TableCell>
                    <TableCell className="text-right text-sm font-semibold">
                      Rs. {Number(item.totalOutstanding).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right text-sm">Rs. {Number(item.current).toLocaleString()}</TableCell>
                    <TableCell className="text-right text-sm">Rs. {Number(item.days1to30).toLocaleString()}</TableCell>
                    <TableCell className="text-right text-sm">Rs. {Number(item.days31to60).toLocaleString()}</TableCell>
                    <TableCell className="text-right text-sm">Rs. {Number(item.days61to90).toLocaleString()}</TableCell>
                    <TableCell className="text-right text-sm text-destructive font-medium">
                      Rs. {Number(item.days90plus).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
                {(!agingReport || agingReport.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No aging data available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
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
              {receivables.map((item) => {
                const r = item.receivable
                const progress = (Number(r.paidAmount) / Number(r.totalAmount)) * 100
                return (
                  <TableRow key={r.id}>
                    <TableCell className="text-sm font-medium">{item.customerName || 'N/A'}</TableCell>
                    <TableCell className="text-sm font-mono text-muted-foreground">{r.invoiceNumber}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {r.dueDate ? new Date(r.dueDate).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right text-sm">Rs. {Number(r.totalAmount).toLocaleString()}</TableCell>
                    <TableCell className="w-[120px]">
                      <div className="space-y-1">
                        <Progress value={progress} className="h-1.5" />
                        <p className="text-[10px] text-muted-foreground">{Math.round(progress)}% collected</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right text-sm font-semibold">Rs. {Number(r.remainingAmount).toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[10px] ${statusColors[r.status]}`}>
                        {r.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {r.status !== 'paid' && (
                        <Button variant="outline" size="sm" className="h-7 text-xs">
                          <ArrowDownToLine className="w-3 h-3 mr-1" />
                          Collect
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
              {receivables.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No receivables found
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
