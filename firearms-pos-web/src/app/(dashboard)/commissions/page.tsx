'use client'

import { useState, useEffect } from 'react'
import { PageLoader } from '@/components/ui/page-loader'
import {
  Percent,
  Filter,
  DollarSign,
  Clock,
  CheckCircle2,
  Check,
  Banknote,
  Plus,
  Trash2,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  getCommissions,
  getCommissionSummary,
  approveCommission,
  payCommission,
  createCommission,
  deleteCommission,
} from '@/actions/commissions'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

type Commission = {
  commission: {
    id: number
    saleId: number
    commissionType: string
    baseAmount: string
    rate: string
    commissionAmount: string
    status: string
    createdAt: Date
  }
  userName: string | null
  referralName: string | null
}

type Summary = {
  totalEarned: string
  totalPending: string
  totalPaid: string
  totalCount: number
}

const statusColors: Record<string, string> = {
  pending: 'bg-warning/10 text-warning border-warning/20',
  approved: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  paid: 'bg-success/10 text-success border-success/20',
  cancelled: 'bg-muted text-muted-foreground border-border',
}

const typeColors: Record<string, string> = {
  sale: 'bg-primary/10 text-primary border-primary/20',
  referral: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  bonus: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
}

export default function CommissionsPage() {
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const [commissions, setCommissions] = useState<Commission[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    saleId: '',
    commissionType: 'sale',
    baseAmount: '',
    rate: '',
    referralPersonId: '',
    notes: '',
  })

  useEffect(() => {
    loadData()
  }, [filterStatus, filterType])

  async function loadData() {
    setLoading(true)
    try {
      const [commissionsRes, summaryRes] = await Promise.all([
        getCommissions({
          status: filterStatus !== 'all' ? filterStatus : undefined,
          type: filterType !== 'all' ? filterType : undefined,
        }),
        getCommissionSummary(),
      ])

      if (commissionsRes.success) {
        setCommissions(commissionsRes.data)
      }
      if (summaryRes.success) {
        setSummary(summaryRes.data)
      }
    } catch (error) {
      console.error('Failed to load commissions:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleApprove(id: number) {
    try {
      const res = await approveCommission(id)
      if (res.success) {
        toast.success('Commission approved')
        loadData()
      } else {
        toast.error('Failed to approve commission')
      }
    } catch (error) {
      console.error('Failed to approve commission:', error)
      toast.error('Failed to approve commission')
    }
  }

  async function handlePay(id: number) {
    try {
      const res = await payCommission(id)
      if (res.success) {
        toast.success('Commission paid')
        loadData()
      } else {
        toast.error('Failed to pay commission')
      }
    } catch (error) {
      console.error('Failed to pay commission:', error)
      toast.error('Failed to pay commission')
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Are you sure you want to delete this commission?')) return

    try {
      const res = await deleteCommission(id)
      if (res.success) {
        toast.success('Commission deleted')
        loadData()
      } else {
        toast.error(res.message || 'Failed to delete commission')
      }
    } catch (error) {
      console.error('Failed to delete commission:', error)
      toast.error('Failed to delete commission')
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)

    try {
      const res = await createCommission({
        saleId: parseInt(formData.saleId),
        branchId: 1, // TODO: Get from context
        commissionType: formData.commissionType,
        baseAmount: formData.baseAmount,
        rate: formData.rate,
        referralPersonId: formData.referralPersonId ? parseInt(formData.referralPersonId) : undefined,
        notes: formData.notes || undefined,
      })

      if (res.success) {
        toast.success('Commission created successfully')
        setDialogOpen(false)
        setFormData({
          saleId: '',
          commissionType: 'sale',
          baseAmount: '',
          rate: '',
          referralPersonId: '',
          notes: '',
        })
        loadData()
      } else {
        toast.error('Failed to create commission')
      }
    } catch (error) {
      console.error('Failed to create commission:', error)
      toast.error('Failed to create commission')
    } finally {
      setSubmitting(false)
    }
  }

  const avgRate =
    commissions.length > 0
      ? (
          commissions.reduce((sum, c) => sum + Number(c.commission.rate), 0) /
          commissions.length
        ).toFixed(2)
      : '0.00'

  const summaryCards = [
    {
      title: 'Total Earned',
      value: `Rs. ${Number(summary?.totalEarned || 0).toLocaleString()}`,
      icon: DollarSign,
      accent: 'text-primary',
    },
    {
      title: 'Pending',
      value: `Rs. ${Number(summary?.totalPending || 0).toLocaleString()}`,
      icon: Clock,
      accent: 'text-warning',
    },
    {
      title: 'Paid Out',
      value: `Rs. ${Number(summary?.totalPaid || 0).toLocaleString()}`,
      icon: Banknote,
      accent: 'text-success',
    },
    {
      title: 'Avg Rate',
      value: `${avgRate}%`,
      icon: Percent,
      accent: 'text-muted-foreground',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Commissions</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track employee and referral commissions
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="brass-glow">
              <Plus className="w-4 h-4 mr-2" />
              Create Commission
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create Commission</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Sale ID</Label>
                  <Input
                    type="number"
                    placeholder="Enter sale ID"
                    value={formData.saleId}
                    onChange={(e) => setFormData({ ...formData, saleId: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select
                    value={formData.commissionType}
                    onValueChange={(value) => setFormData({ ...formData, commissionType: value })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sale">Sale</SelectItem>
                      <SelectItem value="referral">Referral</SelectItem>
                      <SelectItem value="bonus">Bonus</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Base Amount (Rs.)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={formData.baseAmount}
                    onChange={(e) => setFormData({ ...formData, baseAmount: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Rate (%)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="5.00"
                    value={formData.rate}
                    onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Referral Person ID (Optional)</Label>
                <Input
                  type="number"
                  placeholder="Leave empty for employee commission"
                  value={formData.referralPersonId}
                  onChange={(e) => setFormData({ ...formData, referralPersonId: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Notes (Optional)</Label>
                <Textarea
                  placeholder="Additional notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                />
              </div>
              <Button type="submit" className="w-full brass-glow" disabled={submitting}>
                {submitting ? 'Creating...' : 'Create Commission'}
              </Button>
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
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {card.title}
                  </p>
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
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="sale">Sale</SelectItem>
                <SelectItem value="referral">Referral</SelectItem>
                <SelectItem value="bonus">Bonus</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <PageLoader />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Sale #</TableHead>
                  <TableHead>Earned By</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Base Amount</TableHead>
                  <TableHead className="text-right">Rate</TableHead>
                  <TableHead className="text-right">Commission</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[100px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {commissions.map((c) => (
                  <TableRow key={c.commission.id}>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(c.commission.createdAt).toLocaleDateString('en-PK')}
                    </TableCell>
                    <TableCell className="text-sm font-mono">
                      #{c.commission.saleId}
                    </TableCell>
                    <TableCell className="text-sm font-medium">
                      {c.userName || c.referralName}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-[10px] capitalize ${
                          typeColors[c.commission.commissionType]
                        }`}
                      >
                        {c.commission.commissionType}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">
                      Rs. {Number(c.commission.baseAmount).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      {c.commission.rate}%
                    </TableCell>
                    <TableCell className="text-right text-sm font-semibold">
                      Rs. {Number(c.commission.commissionAmount).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${statusColors[c.commission.status]}`}
                      >
                        {c.commission.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 justify-end">
                        {c.commission.status === 'pending' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() => handleApprove(c.commission.id)}
                            >
                              <Check className="w-3 h-3 mr-1" />
                              Approve
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-destructive"
                              onClick={() => handleDelete(c.commission.id)}
                              title="Delete commission"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </>
                        )}
                        {c.commission.status === 'approved' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() => handlePay(c.commission.id)}
                            >
                              <Banknote className="w-3 h-3 mr-1" />
                              Pay
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-destructive"
                              onClick={() => handleDelete(c.commission.id)}
                              title="Delete commission"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </>
                        )}
                        {c.commission.status === 'paid' && (
                          <CheckCircle2 className="w-4 h-4 text-success" />
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {commissions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      No commissions found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
