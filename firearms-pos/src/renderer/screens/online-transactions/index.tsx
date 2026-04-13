import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Search, Plus, RefreshCw, ChevronLeft, ChevronRight,
  Check, X, Landmark, Smartphone, CreditCard, Truck, FileText,
  MoreHorizontal, ArrowUpRight, ArrowDownLeft, CheckCircle2, Clock,
  AlertTriangle, Filter, Download,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip'
import { useBranch } from '@/contexts/branch-context'
import { useCurrency } from '@/contexts/settings-context'
import { useAuth } from '@/contexts/auth-context'
import { cn } from '@/lib/utils'

// ── Types ──
interface OnlineTransaction {
  id: number
  branchId: number
  transactionDate: string
  amount: number
  paymentChannel: string
  direction: string
  referenceNumber: string | null
  customerName: string | null
  customerId: number | null
  invoiceNumber: string | null
  bankAccountName: string | null
  status: string
  notes: string | null
  sourceType: string
  sourceId: number | null
  saleId: number | null
  receivableId: number | null
  payableId: number | null
  confirmedAt: string | null
  createdAt: string
  createdByName: string | null
}

interface ChannelStat {
  paymentChannel: string
  direction: string
  total: number
  count: number
  confirmed: number
  pending: number
}

interface StatusStat {
  status: string
  total: number
  count: number
}

interface DashboardData {
  todayByChannel: ChannelStat[]
  periodByChannel: ChannelStat[]
  statusSummary: StatusStat[]
  recentPending: OnlineTransaction[]
  dateRange: { startDate: string; endDate: string }
}

const CHANNELS = [
  { value: 'all', label: 'All Channels', icon: MoreHorizontal },
  { value: 'bank_transfer', label: 'Bank', icon: Landmark },
  { value: 'mobile', label: 'Mobile', icon: Smartphone },
  { value: 'card', label: 'Card', icon: CreditCard },
  { value: 'cod', label: 'COD', icon: Truck },
  { value: 'cheque', label: 'Cheque', icon: FileText },
  { value: 'other', label: 'Other', icon: MoreHorizontal },
] as const

const PERIOD_OPTIONS = [
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
  { value: 'year', label: 'This Year' },
] as const

function channelLabel(ch: string): string {
  return CHANNELS.find((c) => c.value === ch)?.label || ch
}

function channelIcon(ch: string) {
  const found = CHANNELS.find((c) => c.value === ch)
  return found?.icon || MoreHorizontal
}

function statusBadge(status: string) {
  switch (status) {
    case 'confirmed':
      return <Badge variant="default" className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 text-[11px]"><CheckCircle2 className="h-3 w-3 mr-1" />Confirmed</Badge>
    case 'pending':
      return <Badge variant="secondary" className="bg-amber-500/15 text-amber-400 border-amber-500/30 text-[11px]"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
    case 'failed':
      return <Badge variant="destructive" className="bg-red-500/15 text-red-400 border-red-500/30 text-[11px]"><AlertTriangle className="h-3 w-3 mr-1" />Failed</Badge>
    default:
      return <Badge variant="outline" className="text-[11px]">{status}</Badge>
  }
}

function directionBadge(dir: string) {
  if (dir === 'inflow') {
    return <span className="flex items-center gap-1 text-emerald-400 text-xs"><ArrowDownLeft className="h-3 w-3" />In</span>
  }
  return <span className="flex items-center gap-1 text-red-400 text-xs"><ArrowUpRight className="h-3 w-3" />Out</span>
}

function sourceLabel(sourceType: string): string {
  switch (sourceType) {
    case 'sale': return 'Sale'
    case 'receivable_payment': return 'AR Payment'
    case 'payable_payment': return 'AP Payment'
    case 'manual': return 'Manual'
    default: return sourceType
  }
}

// ── Main Component ──
export function OnlineTransactionsScreen() {
  const { currentBranch } = useBranch()
  const { formatCurrency } = useCurrency()
  const { user } = useAuth()
  const branchId = currentBranch?.id || 1

  // Data state
  const [transactions, setTransactions] = useState<OnlineTransaction[]>([])
  const [dashboard, setDashboard] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Filters
  const [activeChannel, setActiveChannel] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [timePeriod, setTimePeriod] = useState('today')
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  // Dialog state
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<OnlineTransaction | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())

  // Form state
  const [form, setForm] = useState({
    transactionDate: new Date().toISOString().split('T')[0],
    amount: '',
    paymentChannel: 'bank_transfer',
    direction: 'inflow',
    referenceNumber: '',
    customerName: '',
    invoiceNumber: '',
    bankAccountName: '',
    status: 'pending',
    notes: '',
  })
  const [isSaving, setIsSaving] = useState(false)

  // ── Fetch Dashboard ──
  const fetchDashboard = useCallback(async () => {
    try {
      const result = await window.api.onlineTransactions.getDashboard({
        branchId,
        timePeriod,
      })
      if (result.success && result.data) {
        setDashboard(result.data)
      }
    } catch (error) {
      console.error('Failed to fetch dashboard:', error)
    }
  }, [branchId, timePeriod])

  // ── Fetch Transactions ──
  const fetchTransactions = useCallback(async () => {
    setIsLoading(true)
    try {
      const today = new Date().toISOString().split('T')[0]
      let startDate = today
      let endDate = today
      if (timePeriod === 'week') {
        const d = new Date()
        d.setDate(d.getDate() - 7)
        startDate = d.toISOString().split('T')[0]
      } else if (timePeriod === 'month') {
        const d = new Date()
        d.setDate(1)
        startDate = d.toISOString().split('T')[0]
      } else if (timePeriod === 'year') {
        startDate = `${new Date().getFullYear()}-01-01`
      }

      const result = await window.api.onlineTransactions.getAll({
        branchId,
        paymentChannel: activeChannel,
        status: statusFilter,
        startDate,
        endDate,
        search: searchQuery,
        page,
        limit: 25,
      })
      if (result.success) {
        setTransactions(result.data || [])
        setTotalPages(result.totalPages || 1)
        setTotal(result.total || 0)
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error)
    } finally {
      setIsLoading(false)
    }
  }, [branchId, activeChannel, statusFilter, timePeriod, searchQuery, page])

  useEffect(() => {
    fetchDashboard()
    fetchTransactions()
  }, [fetchDashboard, fetchTransactions])

  // Auto-refresh every 30s
  useEffect(() => {
    const interval = setInterval(() => {
      fetchDashboard()
      fetchTransactions()
    }, 30000)
    return () => clearInterval(interval)
  }, [fetchDashboard, fetchTransactions])

  // ── Computed dashboard aggregations ──
  const dashboardAggregates = useMemo(() => {
    if (!dashboard) return { totalInflow: 0, totalOutflow: 0, pendingCount: 0, pendingAmount: 0, confirmedAmount: 0 }

    let totalInflow = 0
    let totalOutflow = 0
    for (const ch of dashboard.periodByChannel) {
      if (ch.direction === 'inflow') totalInflow += ch.total
      else totalOutflow += ch.total
    }

    let pendingCount = 0
    let pendingAmount = 0
    let confirmedAmount = 0
    for (const s of dashboard.statusSummary) {
      if (s.status === 'pending') { pendingCount = s.count; pendingAmount = s.total }
      if (s.status === 'confirmed') confirmedAmount = s.total
    }

    return { totalInflow, totalOutflow, pendingCount, pendingAmount, confirmedAmount }
  }, [dashboard])

  // ── Channel summary for cards ──
  const channelCards = useMemo(() => {
    if (!dashboard) return []
    const map: Record<string, { inflow: number; outflow: number; pending: number; confirmed: number; count: number }> = {}
    for (const ch of dashboard.todayByChannel) {
      if (!map[ch.paymentChannel]) map[ch.paymentChannel] = { inflow: 0, outflow: 0, pending: 0, confirmed: 0, count: 0 }
      const entry = map[ch.paymentChannel]
      if (ch.direction === 'inflow') entry.inflow += ch.total
      else entry.outflow += ch.total
      entry.pending += ch.pending
      entry.confirmed += ch.confirmed
      entry.count += ch.count
    }
    return Object.entries(map).map(([channel, data]) => ({ channel, ...data }))
  }, [dashboard])

  // ── Actions ──
  const handleConfirm = async (id: number) => {
    const result = await window.api.onlineTransactions.confirm(id)
    if (result.success) {
      fetchDashboard()
      fetchTransactions()
    }
  }

  const handleBulkConfirm = async () => {
    if (selectedIds.size === 0) return
    const result = await window.api.onlineTransactions.bulkConfirm(Array.from(selectedIds))
    if (result.success) {
      setSelectedIds(new Set())
      fetchDashboard()
      fetchTransactions()
    }
  }

  const handleMarkFailed = async (id: number) => {
    const result = await window.api.onlineTransactions.markFailed(id)
    if (result.success) {
      fetchDashboard()
      fetchTransactions()
    }
  }

  const handleDelete = async (id: number) => {
    const result = await window.api.onlineTransactions.delete(id)
    if (result.success) {
      fetchDashboard()
      fetchTransactions()
    }
  }

  const resetForm = () => {
    setForm({
      transactionDate: new Date().toISOString().split('T')[0],
      amount: '',
      paymentChannel: 'bank_transfer',
      direction: 'inflow',
      referenceNumber: '',
      customerName: '',
      invoiceNumber: '',
      bankAccountName: '',
      status: 'pending',
      notes: '',
    })
  }

  const openCreate = () => {
    resetForm()
    setEditingTransaction(null)
    setShowCreateDialog(true)
  }

  const openEdit = (txn: OnlineTransaction) => {
    setEditingTransaction(txn)
    setForm({
      transactionDate: txn.transactionDate,
      amount: String(txn.amount),
      paymentChannel: txn.paymentChannel,
      direction: txn.direction,
      referenceNumber: txn.referenceNumber || '',
      customerName: txn.customerName || '',
      invoiceNumber: txn.invoiceNumber || '',
      bankAccountName: txn.bankAccountName || '',
      status: txn.status,
      notes: txn.notes || '',
    })
    setShowCreateDialog(true)
  }

  const handleSave = async () => {
    if (!form.amount || Number(form.amount) <= 0) return
    setIsSaving(true)
    try {
      const payload = {
        branchId,
        transactionDate: form.transactionDate,
        amount: Number(form.amount),
        paymentChannel: form.paymentChannel,
        direction: form.direction,
        referenceNumber: form.referenceNumber || undefined,
        customerName: form.customerName || undefined,
        invoiceNumber: form.invoiceNumber || undefined,
        bankAccountName: form.bankAccountName || undefined,
        status: form.status,
        notes: form.notes || undefined,
      }

      let result
      if (editingTransaction) {
        result = await window.api.onlineTransactions.update(editingTransaction.id, payload)
      } else {
        result = await window.api.onlineTransactions.create(payload)
      }

      if (result.success) {
        setShowCreateDialog(false)
        resetForm()
        fetchDashboard()
        fetchTransactions()
      }
    } catch (error) {
      console.error('Save error:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleSelectAll = () => {
    const pendingIds = transactions.filter((t) => t.status === 'pending').map((t) => t.id)
    if (pendingIds.every((id) => selectedIds.has(id))) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(pendingIds))
    }
  }

  const pendingInView = transactions.filter((t) => t.status === 'pending')
  const allPendingSelected = pendingInView.length > 0 && pendingInView.every((t) => selectedIds.has(t.id))

  return (
    <TooltipProvider delayDuration={0}>
      <div className="space-y-4">
        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Online Transactions</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Track all non-cash transactions across payment channels
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => { fetchDashboard(); fetchTransactions() }}>
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" />Refresh
            </Button>
            <Button size="sm" onClick={openCreate}>
              <Plus className="h-3.5 w-3.5 mr-1.5" />Add Transaction
            </Button>
          </div>
        </div>

        {/* ── Mini Dashboard ── */}
        <div className="grid grid-cols-5 gap-3">
          {/* Total Inflow */}
          <Card className="border-border/50">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Inflow</p>
                <ArrowDownLeft className="h-3.5 w-3.5 text-emerald-400" />
              </div>
              <p className="text-lg font-bold text-emerald-400 mt-1">{formatCurrency(dashboardAggregates.totalInflow)}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {PERIOD_OPTIONS.find((p) => p.value === timePeriod)?.label}
              </p>
            </CardContent>
          </Card>
          {/* Total Outflow */}
          <Card className="border-border/50">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Outflow</p>
                <ArrowUpRight className="h-3.5 w-3.5 text-red-400" />
              </div>
              <p className="text-lg font-bold text-red-400 mt-1">{formatCurrency(dashboardAggregates.totalOutflow)}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {PERIOD_OPTIONS.find((p) => p.value === timePeriod)?.label}
              </p>
            </CardContent>
          </Card>
          {/* Net */}
          <Card className="border-border/50">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Net</p>
                <Landmark className="h-3.5 w-3.5 text-primary" />
              </div>
              <p className={cn('text-lg font-bold mt-1',
                (dashboardAggregates.totalInflow - dashboardAggregates.totalOutflow) >= 0
                  ? 'text-emerald-400' : 'text-red-400'
              )}>
                {formatCurrency(dashboardAggregates.totalInflow - dashboardAggregates.totalOutflow)}
              </p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Balance</p>
            </CardContent>
          </Card>
          {/* Pending */}
          <Card className="border-amber-500/20">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Pending</p>
                <Clock className="h-3.5 w-3.5 text-amber-400" />
              </div>
              <p className="text-lg font-bold text-amber-400 mt-1">{formatCurrency(dashboardAggregates.pendingAmount)}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {dashboardAggregates.pendingCount} transactions
              </p>
            </CardContent>
          </Card>
          {/* Confirmed */}
          <Card className="border-emerald-500/20">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">Confirmed</p>
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              </div>
              <p className="text-lg font-bold text-emerald-400 mt-1">{formatCurrency(dashboardAggregates.confirmedAmount)}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {PERIOD_OPTIONS.find((p) => p.value === timePeriod)?.label}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* ── Channel Cards (Today) ── */}
        {channelCards.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {channelCards.map((ch) => {
              const Icon = channelIcon(ch.channel)
              return (
                <button
                  key={ch.channel}
                  onClick={() => setActiveChannel(ch.channel)}
                  className={cn(
                    'flex items-center gap-2 rounded-lg border px-3 py-2 text-left transition-colors min-w-[140px]',
                    activeChannel === ch.channel
                      ? 'border-primary bg-primary/10'
                      : 'border-border/50 hover:border-border'
                  )}
                >
                  <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-xs font-semibold">{channelLabel(ch.channel)}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {ch.count} txns &middot; {formatCurrency(ch.inflow)}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        )}

        {/* ── Filters Row ── */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Channel Tabs */}
          <Tabs value={activeChannel} onValueChange={(v) => { setActiveChannel(v); setPage(1) }}>
            <TabsList className="h-8">
              {CHANNELS.map((ch) => (
                <TabsTrigger key={ch.value} value={ch.value} className="text-xs px-2.5 h-6">
                  <ch.icon className="h-3 w-3 mr-1" />
                  {ch.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className="flex-1" />

          {/* Period Filter */}
          <Select value={timePeriod} onValueChange={(v) => { setTimePeriod(v); setPage(1) }}>
            <SelectTrigger className="w-[130px] h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PERIOD_OPTIONS.map((p) => (
                <SelectItem key={p.value} value={p.value} className="text-xs">{p.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1) }}>
            <SelectTrigger className="w-[120px] h-8 text-xs">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">All Status</SelectItem>
              <SelectItem value="pending" className="text-xs">Pending</SelectItem>
              <SelectItem value="confirmed" className="text-xs">Confirmed</SelectItem>
              <SelectItem value="failed" className="text-xs">Failed</SelectItem>
            </SelectContent>
          </Select>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(1) }}
              className="pl-8 h-8 w-[180px] text-xs"
            />
          </div>
        </div>

        {/* ── Bulk Actions ── */}
        {selectedIds.size > 0 && (
          <div className="flex items-center gap-2 rounded-md border border-primary/30 bg-primary/5 px-3 py-1.5">
            <span className="text-xs font-medium">{selectedIds.size} selected</span>
            <Button size="sm" variant="default" className="h-6 text-xs" onClick={handleBulkConfirm}>
              <Check className="h-3 w-3 mr-1" />Confirm All
            </Button>
            <Button size="sm" variant="ghost" className="h-6 text-xs" onClick={() => setSelectedIds(new Set())}>
              Clear
            </Button>
          </div>
        )}

        {/* ── Table ── */}
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-8">
                  <input
                    type="checkbox"
                    checked={allPendingSelected}
                    onChange={toggleSelectAll}
                    className="h-3.5 w-3.5 rounded border-border"
                  />
                </TableHead>
                <TableHead className="text-xs">Date</TableHead>
                <TableHead className="text-xs">Channel</TableHead>
                <TableHead className="text-xs">Direction</TableHead>
                <TableHead className="text-xs text-right">Amount</TableHead>
                <TableHead className="text-xs">Reference</TableHead>
                <TableHead className="text-xs">Customer / Payee</TableHead>
                <TableHead className="text-xs">Invoice</TableHead>
                <TableHead className="text-xs">Account</TableHead>
                <TableHead className="text-xs">Source</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="text-xs text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={12} className="h-24 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="h-4 w-4 animate-spin text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Loading...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={12} className="h-24 text-center">
                    <p className="text-sm text-muted-foreground">No transactions found</p>
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((txn) => {
                  const Icon = channelIcon(txn.paymentChannel)
                  return (
                    <TableRow key={txn.id} className={cn(
                      selectedIds.has(txn.id) && 'bg-primary/5'
                    )}>
                      <TableCell>
                        {txn.status === 'pending' && (
                          <input
                            type="checkbox"
                            checked={selectedIds.has(txn.id)}
                            onChange={() => toggleSelect(txn.id)}
                            className="h-3.5 w-3.5 rounded border-border"
                          />
                        )}
                      </TableCell>
                      <TableCell className="text-xs whitespace-nowrap">
                        {new Date(txn.transactionDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="text-xs">{channelLabel(txn.paymentChannel)}</span>
                        </div>
                      </TableCell>
                      <TableCell>{directionBadge(txn.direction)}</TableCell>
                      <TableCell className={cn(
                        'text-xs font-medium text-right tabular-nums',
                        txn.direction === 'inflow' ? 'text-emerald-400' : 'text-red-400'
                      )}>
                        {txn.direction === 'outflow' ? '-' : '+'}{formatCurrency(txn.amount)}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[100px] truncate">
                        {txn.referenceNumber || '-'}
                      </TableCell>
                      <TableCell className="text-xs max-w-[120px] truncate">
                        {txn.customerName || '-'}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {txn.invoiceNumber || '-'}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[100px] truncate">
                        {txn.bankAccountName || '-'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px] font-normal">
                          {sourceLabel(txn.sourceType)}
                        </Badge>
                      </TableCell>
                      <TableCell>{statusBadge(txn.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {txn.status === 'pending' && (
                            <>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-6 w-6"
                                    onClick={() => handleConfirm(txn.id)}
                                  >
                                    <Check className="h-3 w-3 text-emerald-400" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent className="text-xs">Confirm</TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-6 w-6"
                                    onClick={() => handleMarkFailed(txn.id)}
                                  >
                                    <X className="h-3 w-3 text-red-400" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent className="text-xs">Mark Failed</TooltipContent>
                              </Tooltip>
                            </>
                          )}
                          {(txn.sourceType === 'manual' && txn.status !== 'confirmed') && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  className="h-6 w-6"
                                  onClick={() => openEdit(txn)}
                                >
                                  <MoreHorizontal className="h-3 w-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent className="text-xs">Edit</TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* ── Pagination ── */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{total} transaction{total !== 1 ? 's' : ''}</span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="h-3 w-3 mr-1" />Prev
            </Button>
            <span>Page {page} of {totalPages}</span>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next<ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
        </div>

        {/* ── Create / Edit Dialog ── */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingTransaction ? 'Edit Transaction' : 'New Online Transaction'}</DialogTitle>
              <DialogDescription>
                {editingTransaction ? 'Update transaction details' : 'Manually record a non-cash transaction'}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-3 py-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Date</Label>
                  <Input
                    type="date"
                    value={form.transactionDate}
                    onChange={(e) => setForm({ ...form, transactionDate: e.target.value })}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Amount</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    className="h-8 text-xs"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Payment Channel</Label>
                  <Select
                    value={form.paymentChannel}
                    onValueChange={(v) => setForm({ ...form, paymentChannel: v })}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CHANNELS.filter((c) => c.value !== 'all').map((ch) => (
                        <SelectItem key={ch.value} value={ch.value} className="text-xs">
                          {ch.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Direction</Label>
                  <Select
                    value={form.direction}
                    onValueChange={(v) => setForm({ ...form, direction: v })}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inflow" className="text-xs">Inflow (Received)</SelectItem>
                      <SelectItem value="outflow" className="text-xs">Outflow (Paid)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Reference / Transaction ID</Label>
                  <Input
                    placeholder="e.g., TXN-12345"
                    value={form.referenceNumber}
                    onChange={(e) => setForm({ ...form, referenceNumber: e.target.value })}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Invoice Number</Label>
                  <Input
                    placeholder="e.g., INV-001"
                    value={form.invoiceNumber}
                    onChange={(e) => setForm({ ...form, invoiceNumber: e.target.value })}
                    className="h-8 text-xs"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Customer / Payee Name</Label>
                  <Input
                    placeholder="Name"
                    value={form.customerName}
                    onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Bank / Account Name</Label>
                  <Input
                    placeholder="e.g., HBL Main Account"
                    value={form.bankAccountName}
                    onChange={(e) => setForm({ ...form, bankAccountName: e.target.value })}
                    className="h-8 text-xs"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Notes</Label>
                <Textarea
                  placeholder="Additional details..."
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="text-xs min-h-[60px]"
                  rows={2}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave} disabled={isSaving || !form.amount}>
                {isSaving ? 'Saving...' : editingTransaction ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  )
}

export default OnlineTransactionsScreen
