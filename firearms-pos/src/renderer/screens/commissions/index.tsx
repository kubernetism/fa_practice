import React, { useState, useEffect, useMemo } from 'react'
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  DollarSign,
  TrendingUp,
  UserPlus,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  X,
  CheckCircle2,
  Clock,
  Ban,
  ArrowUpRight,
  Receipt,
  Users,
  Wallet,
  BadgePercent,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useBranch } from '@/contexts/branch-context'
import { useCurrency } from '@/contexts/settings-context'
import { ReversalRequestModal } from '@/components/reversal-request-modal'
import { ReversalStatusBadge } from '@/components/reversal-status-badge'

interface Commission {
  id: number
  saleId: number
  userId: number | null
  referralPersonId: number | null
  branchId: number
  commissionType: string
  baseAmount: number
  rate: number
  commissionAmount: number
  status: string
  paidDate: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
  user?: {
    id: number
    username: string
    fullName: string
  }
  referralPerson?: {
    id: number
    name: string
    contact: string | null
  }
  sale?: {
    id: number
    invoiceNumber: string
    totalAmount: number
    saleDate: string
  }
}

interface ReferralPerson {
  id: number
  name: string
  contact: string | null
  commissionRate: number | null
}

interface Sale {
  id: number
  invoiceNumber: string
  totalAmount: number
  saleDate: string
}

interface CommissionFormData {
  saleId: string
  commissionType: string
  baseAmount: string
  rate: string
  flatAmount: string
  rateMode: 'percent' | 'flat'
  referralPersonId: string
  userId: string
  notes: string
}

const initialFormData: CommissionFormData = {
  saleId: '',
  commissionType: 'referral',
  baseAmount: '',
  rate: '',
  flatAmount: '',
  rateMode: 'percent',
  referralPersonId: '',
  userId: '',
  notes: '',
}

const ITEMS_PER_PAGE = 12

export default function CommissionsScreen() {
  const { currentBranch } = useBranch()
  const { formatCurrency } = useCurrency()
  const [commissions, setCommissions] = useState<Commission[]>([])
  const [referralPersons, setReferralPersons] = useState<ReferralPerson[]>([])
  const [availableInvoices, setAvailableInvoices] = useState<Sale[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState<CommissionFormData>(initialFormData)
  const [editingCommission, setEditingCommission] = useState<Commission | null>(null)
  const [selectedTab, setSelectedTab] = useState<'referral' | 'employee'>('referral')
  const [isReversalModalOpen, setIsReversalModalOpen] = useState(false)
  const [reversalTarget, setReversalTarget] = useState<Commission | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    if (currentBranch) {
      fetchInitialData()
    }
  }, [currentBranch])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, statusFilter, typeFilter])

  const fetchInitialData = async () => {
    await Promise.all([fetchCommissions(), fetchReferralPersons()])
  }

  const fetchCommissions = async () => {
    if (!currentBranch) return

    try {
      setIsLoading(true)
      const response = await window.api.commissions.getAll({ page: 1, limit: 100, branchId: currentBranch.id })

      if (response?.success && response?.data) {
        const filteredData = response.data.filter((item: any) =>
          item.commission.branchId === currentBranch.id
        )
        setCommissions(filteredData.map((item: any) => ({
          ...item.commission,
          user: item.user,
          referralPerson: item.referralPerson,
          sale: item.sale,
        })))
      } else {
        setCommissions([])
      }
    } catch (error) {
      console.error('Failed to fetch commissions:', error)
      setCommissions([])
    } finally {
      setIsLoading(false)
    }
  }

  const fetchReferralPersons = async () => {
    try {
      const response = await window.api.referralPersons.getForSelect()
      if (response?.success && response?.data) {
        setReferralPersons(response.data)
      }
    } catch (error) {
      console.error('Failed to fetch referral persons:', error)
    }
  }

  const fetchAvailableInvoices = async (referralPersonId?: number) => {
    try {
      const response = await window.api.commissions.getAvailableInvoices(referralPersonId)
      if (response?.success && response?.data) {
        setAvailableInvoices(response.data)
      } else {
        setAvailableInvoices([])
      }
    } catch (error) {
      console.error('Failed to fetch available invoices:', error)
      setAvailableInvoices([])
    }
  }

  const handleOpenDialog = (commission?: Commission, mode: 'referral' | 'employee' = 'referral') => {
    setSelectedTab(mode)
    if (commission) {
      setEditingCommission(commission)
      setFormData({
        saleId: commission.saleId.toString(),
        commissionType: commission.commissionType,
        baseAmount: commission.baseAmount.toString(),
        rate: commission.rate.toString(),
        flatAmount: commission.commissionAmount.toString(),
        rateMode: 'percent',
        referralPersonId: commission.referralPersonId?.toString() || '',
        userId: commission.userId?.toString() || '',
        notes: commission.notes || '',
      })
    } else {
      setEditingCommission(null)
      setFormData({
        ...initialFormData,
        commissionType: mode === 'referral' ? 'referral' : 'sale',
      })
    }

    fetchAvailableInvoices()
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingCommission(null)
    setFormData(initialFormData)
    setAvailableInvoices([])
  }

  const handleReferralPersonChange = (referralPersonId: string) => {
    const person = referralPersons.find((rp) => rp.id === parseInt(referralPersonId))
    const defaultRate = person?.commissionRate
    setFormData((prev) => ({
      ...prev,
      referralPersonId,
      // Only pre-fill rate if empty (don't overwrite user edits)
      rate: prev.rate || (defaultRate != null ? String(defaultRate) : prev.rate),
    }))
  }

  const handleInvoiceChange = async (saleId: string) => {
    setFormData((prev) => ({ ...prev, saleId }))
    if (!saleId) return
    try {
      const response = await window.api.commissions.getSaleProfit(parseInt(saleId))
      if (response?.success && response?.data) {
        const profit = Number(response.data.profit ?? 0)
        setFormData((prev) => ({
          ...prev,
          baseAmount: prev.baseAmount || (profit > 0 ? profit.toFixed(2) : prev.baseAmount),
        }))
      }
    } catch (error) {
      console.error('Failed to fetch sale profit:', error)
    }
  }

  const handleRateModeChange = (mode: 'percent' | 'flat') => {
    setFormData((prev) => {
      const base = parseFloat(prev.baseAmount) || 0
      if (mode === 'flat') {
        const rate = parseFloat(prev.rate) || 0
        const flat = base > 0 && rate > 0 ? ((base * rate) / 100).toFixed(2) : prev.flatAmount
        return { ...prev, rateMode: mode, flatAmount: flat }
      }
      const flat = parseFloat(prev.flatAmount) || 0
      const rate = base > 0 && flat > 0 ? ((flat / base) * 100).toFixed(4) : prev.rate
      return { ...prev, rateMode: mode, rate }
    })
  }

  const handleFlatAmountChange = (flatAmount: string) => {
    setFormData((prev) => {
      const base = parseFloat(prev.baseAmount) || 0
      const flat = parseFloat(flatAmount) || 0
      const rate = base > 0 && flat > 0 ? ((flat / base) * 100).toFixed(4) : ''
      return { ...prev, flatAmount, rate }
    })
  }

  const handleRateChange = (rate: string) => {
    setFormData((prev) => {
      const base = parseFloat(prev.baseAmount) || 0
      const r = parseFloat(rate) || 0
      const flat = base > 0 && r > 0 ? ((base * r) / 100).toFixed(2) : ''
      return { ...prev, rate, flatAmount: flat }
    })
  }

  const handleBaseAmountChange = (baseAmount: string) => {
    setFormData((prev) => {
      const base = parseFloat(baseAmount) || 0
      if (prev.rateMode === 'flat') {
        const flat = parseFloat(prev.flatAmount) || 0
        const rate = base > 0 && flat > 0 ? ((flat / base) * 100).toFixed(4) : ''
        return { ...prev, baseAmount, rate }
      }
      const r = parseFloat(prev.rate) || 0
      const flat = base > 0 && r > 0 ? ((base * r) / 100).toFixed(2) : ''
      return { ...prev, baseAmount, flatAmount: flat }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!currentBranch) {
      alert('Please select a branch first')
      return
    }

    const isReferralCommission = formData.commissionType === 'referral'
    if (isReferralCommission && !formData.referralPersonId) {
      alert('Please select a referral person')
      return
    }
    if (!isReferralCommission && !formData.userId) {
      alert('Please select an employee')
      return
    }
    if (!formData.saleId) {
      alert('Please select a sale/invoice')
      return
    }
    if (!formData.baseAmount || !formData.rate) {
      alert('Please fill in base amount and rate')
      return
    }

    const baseAmount = parseFloat(formData.baseAmount)
    const rate = parseFloat(formData.rate)

    if (baseAmount <= 0 || rate <= 0) {
      alert('Base amount and rate must be greater than 0')
      return
    }

    try {
      const commissionData = {
        saleId: parseInt(formData.saleId),
        branchId: currentBranch.id,
        commissionType: formData.commissionType,
        baseAmount,
        rate,
        notes: formData.notes || undefined,
        referralPersonId: formData.referralPersonId ? parseInt(formData.referralPersonId) : undefined,
        userId: formData.userId ? parseInt(formData.userId) : undefined,
      }

      if (editingCommission) {
        const response = await window.api.commissions.update(editingCommission.id, commissionData)
        if (!response.success) {
          alert(response.message || 'Failed to update commission')
          return
        }
      } else {
        const response = await window.api.commissions.create(commissionData)
        if (!response.success) {
          alert(response.message || 'Failed to create commission')
          return
        }
      }

      await fetchCommissions()
      await fetchReferralPersons()
      handleCloseDialog()
    } catch (error) {
      console.error('Failed to save commission:', error)
      alert('Failed to save commission. Please try again.')
    }
  }

  const handleDelete = async (commissionId: number) => {
    if (!confirm('Are you sure you want to delete this commission?')) {
      return
    }

    try {
      const response = await window.api.commissions.delete(commissionId)
      if (response.success) {
        await fetchCommissions()
        await fetchReferralPersons()
      } else {
        alert(response.message || 'Failed to delete commission')
      }
    } catch (error) {
      console.error('Failed to delete commission:', error)
      alert('Failed to delete commission. Please try again.')
    }
  }

  const handleApprove = async (id: number) => {
    try {
      const response = await window.api.commissions.approve([id])
      if (response.success) {
        await fetchCommissions()
      } else {
        alert(response.message || 'Failed to approve commission')
      }
    } catch (error) {
      console.error('Failed to approve commission:', error)
    }
  }

  const handleMarkPaid = async (id: number) => {
    try {
      const response = await window.api.commissions.markPaid([id])
      if (response.success) {
        await fetchCommissions()
        await fetchReferralPersons()
      } else {
        alert(response.message || 'Failed to mark commission as paid')
      }
    } catch (error) {
      console.error('Failed to mark commission as paid:', error)
    }
  }

  const filteredCommissions = useMemo(() => commissions.filter((commission) => {
    const matchesSearch =
      commission.sale?.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      commission.referralPerson?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      commission.user?.fullName?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'all' || commission.status === statusFilter
    const matchesType = typeFilter === 'all' || commission.commissionType === typeFilter

    return matchesSearch && matchesStatus && matchesType
  }), [commissions, searchTerm, statusFilter, typeFilter])

  // Statistics
  const stats = useMemo(() => {
    const total = filteredCommissions.reduce((sum, c) => sum + c.commissionAmount, 0)
    const paid = filteredCommissions.filter((c) => c.status === 'paid')
    const paidAmt = paid.reduce((sum, c) => sum + c.commissionAmount, 0)
    const pending = filteredCommissions.filter((c) => c.status === 'pending')
    const pendingAmt = pending.reduce((sum, c) => sum + c.commissionAmount, 0)
    const approved = filteredCommissions.filter((c) => c.status === 'approved')
    const approvedAmt = approved.reduce((sum, c) => sum + c.commissionAmount, 0)
    const cancelled = filteredCommissions.filter((c) => c.status === 'cancelled')
    const referralCount = filteredCommissions.filter((c) => c.commissionType === 'referral').length
    const employeeCount = filteredCommissions.filter((c) => c.commissionType === 'sale').length
    const avgRate = filteredCommissions.length > 0
      ? filteredCommissions.reduce((sum, c) => sum + c.rate, 0) / filteredCommissions.length
      : 0
    return { total, paid, paidAmt, pending, pendingAmt, approved, approvedAmt, cancelled, referralCount, employeeCount, avgRate }
  }, [filteredCommissions])

  // Pagination
  const paginatedCommissions = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredCommissions.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredCommissions, currentPage])

  const totalPages = Math.ceil(filteredCommissions.length / ITEMS_PER_PAGE) || 1

  // Status config
  const statusConfig: Record<string, { icon: React.ElementType; color: string; bg: string; border: string }> = {
    pending: { icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
    approved: { icon: TrendingUp, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
    paid: { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
    cancelled: { icon: Ban, color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/30' },
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <BadgePercent className="w-6 h-6 animate-pulse text-primary mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Loading commissions...</p>
        </div>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="flex flex-col h-full">
        {/* Header Bar */}
        <div className="border-t-2 border-primary/30 bg-background border-b border-border px-5 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-1.5 rounded bg-primary/10 border border-primary/20 shrink-0">
              <BadgePercent className="w-4 h-4 text-primary" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base font-bold leading-tight tracking-wide">
                Commission Management
              </h1>
              <p className="text-[11px] text-muted-foreground leading-tight">
                Track referral &amp; employee commissions across sales
              </p>
            </div>
          </div>
          <Button size="sm" className="h-8 text-xs shrink-0" onClick={() => handleOpenDialog(undefined, 'referral')}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            New Commission
          </Button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-5 pt-4 pb-4 space-y-4">

          {/* Summary Cards Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Total Commissions */}
            <Card className="border-border">
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Total</span>
                  <div className="p-1 rounded bg-primary/10">
                    <DollarSign className="w-3 h-3 text-primary" />
                  </div>
                </div>
                <p className="text-lg font-bold tabular-nums tracking-tight">{formatCurrency(stats.total)}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-muted-foreground">{filteredCommissions.length} entries</span>
                  <span className="text-[10px] text-muted-foreground">·</span>
                  <span className="text-[10px] text-muted-foreground">Avg {stats.avgRate.toFixed(1)}%</span>
                </div>
              </CardContent>
            </Card>

            {/* Paid */}
            <Card className="border-border">
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Paid</span>
                  <div className="p-1 rounded bg-emerald-500/10">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                  </div>
                </div>
                <p className="text-lg font-bold tabular-nums tracking-tight text-emerald-600 dark:text-emerald-400">{formatCurrency(stats.paidAmt)}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400">{stats.paid.length} paid</span>
                  {stats.total > 0 && (
                    <>
                      <span className="text-[10px] text-muted-foreground">·</span>
                      <span className="text-[10px] text-muted-foreground">{((stats.paidAmt / stats.total) * 100).toFixed(0)}% of total</span>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Pending */}
            <Card className="border-border">
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Pending</span>
                  <div className="p-1 rounded bg-amber-500/10">
                    <Clock className="w-3 h-3 text-amber-500" />
                  </div>
                </div>
                <p className="text-lg font-bold tabular-nums tracking-tight text-amber-600 dark:text-amber-400">{formatCurrency(stats.pendingAmt)}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-amber-600 dark:text-amber-400">{stats.pending.length} awaiting</span>
                  {stats.approvedAmt > 0 && (
                    <>
                      <span className="text-[10px] text-muted-foreground">·</span>
                      <span className="text-[10px] text-blue-500">{formatCurrency(stats.approvedAmt)} approved</span>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Breakdown */}
            <Card className="border-border">
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Breakdown</span>
                  <div className="p-1 rounded bg-blue-500/10">
                    <Users className="w-3 h-3 text-blue-500" />
                  </div>
                </div>
                <div className="flex items-baseline gap-3">
                  <div>
                    <p className="text-lg font-bold tabular-nums tracking-tight">{stats.referralCount}</p>
                    <span className="text-[10px] text-muted-foreground">Referral</span>
                  </div>
                  <div className="h-6 w-px bg-border" />
                  <div>
                    <p className="text-lg font-bold tabular-nums tracking-tight">{stats.employeeCount}</p>
                    <span className="text-[10px] text-muted-foreground">Employee</span>
                  </div>
                  {stats.cancelled.length > 0 && (
                    <>
                      <div className="h-6 w-px bg-border" />
                      <div>
                        <p className="text-lg font-bold tabular-nums tracking-tight text-red-500">{stats.cancelled.length}</p>
                        <span className="text-[10px] text-muted-foreground">Cancelled</span>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search + Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by invoice, person, or employee..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-8 pl-8 text-sm"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-8 w-[130px] text-xs">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="h-8 w-[130px] text-xs">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="referral">Referral</SelectItem>
                <SelectItem value="sale">Employee</SelectItem>
                <SelectItem value="bonus">Bonus</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="rounded-lg border border-border overflow-hidden">
            {filteredCommissions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="p-3 rounded-full bg-muted mb-3">
                  <Receipt className="w-5 h-5 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground">No commissions found</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                    ? 'Try adjusting your filters'
                    : 'Create your first commission to get started'}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead className="text-[10px] font-semibold uppercase tracking-wider w-[40px]">#</TableHead>
                    <TableHead className="text-[10px] font-semibold uppercase tracking-wider">Invoice</TableHead>
                    <TableHead className="text-[10px] font-semibold uppercase tracking-wider">Person / Type</TableHead>
                    <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-right">Sale Amt</TableHead>
                    <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-center">Rate</TableHead>
                    <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-right">Commission</TableHead>
                    <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-center">Status</TableHead>
                    <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-center w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedCommissions.map((commission, idx) => {
                    const sc = statusConfig[commission.status] || statusConfig.pending
                    const StatusIcon = sc.icon
                    return (
                      <TableRow key={commission.id} className="group">
                        <TableCell className="py-2 text-[11px] text-muted-foreground tabular-nums">
                          {(currentPage - 1) * ITEMS_PER_PAGE + idx + 1}
                        </TableCell>
                        <TableCell className="py-2">
                          <div className="flex items-center gap-2">
                            <div className="p-1 rounded bg-muted shrink-0">
                              <Receipt className="w-3 h-3 text-muted-foreground" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium truncate">
                                {commission.sale?.invoiceNumber || `Sale #${commission.saleId}`}
                              </p>
                              {commission.sale?.saleDate && (
                                <p className="text-[10px] text-muted-foreground">
                                  {new Date(commission.sale.saleDate).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-2">
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">
                              {commission.commissionType === 'referral'
                                ? commission.referralPerson?.name || '—'
                                : commission.user?.fullName || '—'}
                            </p>
                            <Badge
                              variant="outline"
                              className={`text-[9px] px-1.5 py-0 mt-0.5 ${
                                commission.commissionType === 'referral'
                                  ? 'border-violet-500/30 text-violet-600 dark:text-violet-400'
                                  : commission.commissionType === 'bonus'
                                  ? 'border-amber-500/30 text-amber-600 dark:text-amber-400'
                                  : 'border-blue-500/30 text-blue-600 dark:text-blue-400'
                              }`}
                            >
                              {commission.commissionType}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="py-2 text-right">
                          <span className="text-sm tabular-nums text-muted-foreground">
                            {formatCurrency(commission.baseAmount)}
                          </span>
                        </TableCell>
                        <TableCell className="py-2 text-center">
                          <span className="inline-flex items-center gap-0.5 text-sm tabular-nums font-medium">
                            {commission.rate}
                            <span className="text-[10px] text-muted-foreground">%</span>
                          </span>
                        </TableCell>
                        <TableCell className="py-2 text-right">
                          <span className="text-sm font-semibold tabular-nums text-primary">
                            {formatCurrency(commission.commissionAmount)}
                          </span>
                        </TableCell>
                        <TableCell className="py-2 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <Badge
                              variant="outline"
                              className={`text-[10px] px-1.5 py-0 gap-1 ${sc.color} ${sc.bg} ${sc.border}`}
                            >
                              <StatusIcon className="w-2.5 h-2.5" />
                              {commission.status}
                            </Badge>
                            <ReversalStatusBadge entityType="commission" entityId={commission.id} />
                          </div>
                        </TableCell>
                        <TableCell className="py-2">
                          <div className="flex items-center justify-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            {commission.status === 'pending' && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => handleApprove(commission.id)}
                                  >
                                    <TrendingUp className="h-3.5 w-3.5 text-blue-500" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="bottom">Approve</TooltipContent>
                              </Tooltip>
                            )}
                            {commission.status === 'approved' && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => handleMarkPaid(commission.id)}
                                  >
                                    <DollarSign className="h-3.5 w-3.5 text-emerald-500" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="bottom">Mark Paid</TooltipContent>
                              </Tooltip>
                            )}
                            {commission.status !== 'cancelled' && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => {
                                      setReversalTarget(commission)
                                      setIsReversalModalOpen(true)
                                    }}
                                  >
                                    <RotateCcw className="h-3.5 w-3.5 text-amber-500" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent side="bottom">Reversal</TooltipContent>
                              </Tooltip>
                            )}
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => handleOpenDialog(commission)}
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="bottom">Edit</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => handleDelete(commission.id)}
                                >
                                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent side="bottom">Delete</TooltipContent>
                            </Tooltip>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}
          </div>

          {/* Pagination */}
          {filteredCommissions.length > ITEMS_PER_PAGE && (
            <div className="flex items-center justify-between text-xs text-muted-foreground pb-2">
              <span>
                Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredCommissions.length)} of {filteredCommissions.length}
              </span>
              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </Button>
                <span className="min-w-[3rem] text-center tabular-nums">{currentPage} / {totalPages}</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-7 w-7"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Add/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingCommission ? 'Edit Commission' : 'Create New Commission'}
              </DialogTitle>
              <DialogDescription>
                {editingCommission
                  ? 'Update commission information below.'
                  : 'Select an invoice and referral person/employee to create a commission.'}
              </DialogDescription>
            </DialogHeader>

            <Tabs value={selectedTab} onValueChange={(v: any) => setSelectedTab(v)}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="referral">
                  <UserPlus className="h-4 w-4 mr-2" />
                  Referral Commission
                </TabsTrigger>
                <TabsTrigger value="employee">
                  Employee Commission
                </TabsTrigger>
              </TabsList>

              {/* Referral Commission Tab */}
              <TabsContent value="referral" className="space-y-4 mt-4">
                <form onSubmit={handleSubmit}>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="referralPerson">Referral Person *</Label>
                      <Select
                        value={formData.referralPersonId}
                        onValueChange={handleReferralPersonChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select referral person" />
                        </SelectTrigger>
                        <SelectContent>
                          {referralPersons.map((rp) => (
                            <SelectItem key={rp.id} value={rp.id.toString()}>
                              <div>
                                <span className="font-medium">{rp.name}</span>
                                {rp.commissionRate && (
                                  <span className="text-xs text-muted-foreground ml-2">
                                    (Default: {rp.commissionRate}%)
                                  </span>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="saleId-referral">Select Invoice *</Label>
                      <Select
                        value={formData.saleId}
                        onValueChange={handleInvoiceChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select invoice" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableInvoices.map((sale) => (
                            <SelectItem key={sale.id} value={sale.id.toString()}>
                              <div className="flex justify-between w-full pr-2">
                                <span>{sale.invoiceNumber}</span>
                                <span className="text-muted-foreground">
                                  {formatCurrency(sale.totalAmount || 0)}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                          {availableInvoices.length === 0 && (
                            <div className="p-2 text-sm text-muted-foreground text-center">
                              No completed invoices available
                            </div>
                          )}
                        </SelectContent>
                      </Select>
                    </div>

                    {formData.saleId && (
                      <>
                        <div className="space-y-2">
                          <Label htmlFor="baseAmount-referral">Base Amount (profit) *</Label>
                          <Input
                            id="baseAmount-referral"
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.baseAmount}
                            onChange={(e) => handleBaseAmountChange(e.target.value)}
                            placeholder="0.00"
                            required
                          />
                          <p className="text-xs text-muted-foreground">
                            Auto-filled with profit from this sale. Edit if a different base is needed.
                          </p>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="rate-referral">
                              {formData.rateMode === 'percent' ? 'Commission Rate (%) *' : 'Commission Amount *'}
                            </Label>
                            <div className="inline-flex rounded-md border border-border overflow-hidden">
                              <button
                                type="button"
                                onClick={() => handleRateModeChange('percent')}
                                className={`px-2 py-0.5 text-[10px] font-medium ${
                                  formData.rateMode === 'percent'
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-background text-muted-foreground hover:bg-muted'
                                }`}
                              >
                                %
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRateModeChange('flat')}
                                className={`px-2 py-0.5 text-[10px] font-medium ${
                                  formData.rateMode === 'flat'
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-background text-muted-foreground hover:bg-muted'
                                }`}
                              >
                                Flat
                              </button>
                            </div>
                          </div>
                          {formData.rateMode === 'percent' ? (
                            <Input
                              id="rate-referral"
                              type="number"
                              step="0.01"
                              min="0"
                              max="100"
                              value={formData.rate}
                              onChange={(e) => handleRateChange(e.target.value)}
                              placeholder="0.00"
                              required
                            />
                          ) : (
                            <Input
                              id="rate-referral"
                              type="number"
                              step="0.01"
                              min="0"
                              value={formData.flatAmount}
                              onChange={(e) => handleFlatAmountChange(e.target.value)}
                              placeholder="0.00"
                              required
                            />
                          )}
                          {formData.referralPersonId && (() => {
                            const defaultRate = referralPersons.find(
                              (rp) => rp.id === parseInt(formData.referralPersonId)
                            )?.commissionRate
                            if (defaultRate == null) return null
                            return (
                              <p className="text-xs text-muted-foreground">
                                {formData.rateMode === 'percent'
                                  ? `Default for this person: ${defaultRate}%`
                                  : `Derived from ${formData.rate || '—'}% (default ${defaultRate}%)`}
                              </p>
                            )
                          })()}
                        </div>
                      </>
                    )}

                    {formData.baseAmount && formData.rate && (
                      <div className="col-span-2 p-4 bg-muted rounded-md">
                        <p className="text-sm text-muted-foreground">Commission Amount:</p>
                        <p className="text-2xl font-bold text-primary">
                          {formatCurrency((parseFloat(formData.baseAmount) * parseFloat(formData.rate)) / 100)}
                        </p>
                      </div>
                    )}

                    <div className="space-y-2 col-span-2">
                      <Label htmlFor="notes-referral">Notes</Label>
                      <Textarea
                        id="notes-referral"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Additional notes about this commission..."
                        rows={3}
                      />
                    </div>
                  </div>

                  <DialogFooter className="mt-4">
                    <Button type="button" variant="outline" onClick={handleCloseDialog}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingCommission ? 'Update' : 'Create'} Commission
                    </Button>
                  </DialogFooter>
                </form>
              </TabsContent>

              {/* Employee Commission Tab */}
              <TabsContent value="employee" className="space-y-4 mt-4">
                <form onSubmit={handleSubmit}>
                  <div className="space-y-4">
                    <div className="p-4 bg-muted/50 rounded-md border border-dashed">
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <UserPlus className="h-4 w-4" />
                        For referral commissions, use the "Referral Commission" tab above.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="userId">Employee</Label>
                      <Select
                        value={formData.userId || "none"}
                        onValueChange={(v) => setFormData({ ...formData, userId: v === "none" ? "" : v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select employee (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No employee selected</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="saleId-employee">Select Invoice *</Label>
                      <Input
                        id="saleId-employee"
                        type="number"
                        value={formData.saleId}
                        onChange={(e) => handleInvoiceChange(e.target.value)}
                        placeholder="Enter sale/invoice ID"
                        required
                      />
                      <p className="text-xs text-muted-foreground">
                        Enter the sale/invoice ID — base amount will auto-fill with profit.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="baseAmount-employee">Base Amount (profit) *</Label>
                        <Input
                          id="baseAmount-employee"
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.baseAmount}
                          onChange={(e) => handleBaseAmountChange(e.target.value)}
                          placeholder="0.00"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="rate-employee">
                            {formData.rateMode === 'percent' ? 'Commission Rate (%) *' : 'Commission Amount *'}
                          </Label>
                          <div className="inline-flex rounded-md border border-border overflow-hidden">
                            <button
                              type="button"
                              onClick={() => handleRateModeChange('percent')}
                              className={`px-2 py-0.5 text-[10px] font-medium ${
                                formData.rateMode === 'percent'
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-background text-muted-foreground hover:bg-muted'
                              }`}
                            >
                              %
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRateModeChange('flat')}
                              className={`px-2 py-0.5 text-[10px] font-medium ${
                                formData.rateMode === 'flat'
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-background text-muted-foreground hover:bg-muted'
                              }`}
                            >
                              Flat
                            </button>
                          </div>
                        </div>
                        {formData.rateMode === 'percent' ? (
                          <Input
                            id="rate-employee"
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            value={formData.rate}
                            onChange={(e) => handleRateChange(e.target.value)}
                            placeholder="0.00"
                            required
                          />
                        ) : (
                          <Input
                            id="rate-employee"
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.flatAmount}
                            onChange={(e) => handleFlatAmountChange(e.target.value)}
                            placeholder="0.00"
                            required
                          />
                        )}
                      </div>
                    </div>

                    {formData.baseAmount && formData.rate && (
                      <div className="p-4 bg-muted rounded-md">
                        <p className="text-sm text-muted-foreground">Commission Amount:</p>
                        <p className="text-2xl font-bold text-primary">
                          {formatCurrency((parseFloat(formData.baseAmount) * parseFloat(formData.rate)) / 100)}
                        </p>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="notes-employee">Notes</Label>
                      <Textarea
                        id="notes-employee"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Additional notes about this commission..."
                        rows={3}
                      />
                    </div>
                  </div>

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={handleCloseDialog}>
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingCommission ? 'Update' : 'Create'} Commission
                    </Button>
                  </DialogFooter>
                </form>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>

        {/* Reversal Request Modal */}
        {reversalTarget && (
          <ReversalRequestModal
            open={isReversalModalOpen}
            onClose={() => {
              setIsReversalModalOpen(false)
              setReversalTarget(null)
            }}
            entityType="commission"
            entityId={reversalTarget.id}
            entityLabel={`Commission #${reversalTarget.id} (${reversalTarget.sale?.invoiceNumber || `Sale #${reversalTarget.saleId}`})`}
            branchId={reversalTarget.branchId}
            onSuccess={fetchCommissions}
          />
        )}
      </div>
    </TooltipProvider>
  )
}
