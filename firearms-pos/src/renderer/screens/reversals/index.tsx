import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
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
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  RefreshCw,
  AlertTriangle,
  XCircle,
  RotateCcw,
  CheckCircle2,
  Clock,
  Ban,
  ThumbsUp,
  ThumbsDown,
  FileX,
  ArrowLeftRight,
  ChevronLeft,
  ChevronRight,
  Info,
  Zap,
  ShieldAlert,
  User,
  Calendar,
} from 'lucide-react'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ReversalUser {
  id: number
  fullName: string | null
  username: string
}

interface ReversalRequest {
  id: number
  requestNumber: string
  entityType: string
  entityId: number
  reason: string
  priority: 'urgent' | 'high' | 'medium' | 'low'
  status: 'pending' | 'approved' | 'completed' | 'failed' | 'rejected'
  rejectionReason: string | null
  requestedBy: number
  reviewedBy: number | null
  requestedByUser: ReversalUser | null
  reviewedByUser: ReversalUser | null
  createdAt: string
  updatedAt: string
}

interface ReversalStats {
  byStatus: Record<string, number>
  pendingByType: Record<string, number>
  pendingByPriority: Record<string, number>
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ENTITY_TYPE_LABELS: Record<string, string> = {
  sale: 'Sale',
  purchase: 'Purchase',
  expense: 'Expense',
  journal_entry: 'Journal Entry',
  ar_payment: 'AR Payment',
  ap_payment: 'AP Payment',
  stock_adjustment: 'Stock Adj.',
  stock_transfer: 'Stock Transfer',
  commission: 'Commission',
  return: 'Return',
  receivable: 'Receivable',
  payable: 'Payable',
}

const ENTITY_TYPES = Object.keys(ENTITY_TYPE_LABELS)

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'completed', label: 'Completed' },
  { value: 'failed', label: 'Failed' },
  { value: 'rejected', label: 'Rejected' },
]

const PRIORITY_OPTIONS = [
  { value: 'urgent', label: 'Urgent' },
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
]

// ---------------------------------------------------------------------------
// Badge helpers
// ---------------------------------------------------------------------------

function getPriorityBadge(priority: ReversalRequest['priority']) {
  const map: Record<typeof priority, { label: string; className: string; icon: React.ElementType }> = {
    urgent: { label: 'Urgent', className: 'bg-red-600/15 text-red-600 dark:text-red-400 border-red-600/20', icon: Zap },
    high: { label: 'High', className: 'bg-orange-500/15 text-orange-600 dark:text-orange-400 border-orange-500/20', icon: ShieldAlert },
    medium: { label: 'Medium', className: 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border-yellow-500/20', icon: Info },
    low: { label: 'Low', className: 'bg-zinc-500/15 text-zinc-600 dark:text-zinc-400 border-zinc-500/20', icon: Info },
  }
  const cfg = map[priority] ?? { label: priority, className: 'bg-zinc-500/15 text-zinc-500 border-zinc-500/20', icon: Info }
  const Icon = cfg.icon
  return (
    <Badge variant="outline" className={`${cfg.className} text-[11px] font-medium gap-1 px-1.5 py-0`}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </Badge>
  )
}

function getStatusBadge(status: ReversalRequest['status']) {
  const map: Record<typeof status, { label: string; className: string; icon: React.ElementType }> = {
    pending: { label: 'Pending', className: 'bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border-yellow-500/20', icon: Clock },
    approved: { label: 'Approved', className: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20', icon: ThumbsUp },
    completed: { label: 'Completed', className: 'bg-green-600/15 text-green-600 dark:text-green-400 border-green-600/20', icon: CheckCircle2 },
    failed: { label: 'Failed', className: 'bg-red-600/15 text-red-600 dark:text-red-400 border-red-600/20', icon: FileX },
    rejected: { label: 'Rejected', className: 'bg-zinc-500/15 text-zinc-600 dark:text-zinc-400 border-zinc-500/20', icon: Ban },
  }
  const cfg = map[status] ?? { label: status, className: 'bg-zinc-500/15 text-zinc-500 border-zinc-500/20', icon: Info }
  const Icon = cfg.icon
  return (
    <Badge variant="outline" className={`${cfg.className} text-[11px] font-medium gap-1 px-1.5 py-0`}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </Badge>
  )
}

// ---------------------------------------------------------------------------
// Sub-components: confirmation dialogs
// ---------------------------------------------------------------------------

interface ApproveDialogProps {
  open: boolean
  isSubmitting: boolean
  onConfirm: () => void
  onCancel: () => void
  requestNumber: string
}

function ApproveDialog({ open, isSubmitting, onConfirm, onCancel, requestNumber }: ApproveDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onCancel() }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ThumbsUp className="w-5 h-5 text-green-500" />
            Approve Reversal
          </DialogTitle>
          <DialogDescription>
            Approve reversal request <span className="font-semibold text-foreground">{requestNumber}</span>?
            This will queue it for execution.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            className="bg-green-600 hover:bg-green-700 text-white"
            onClick={onConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4 mr-2" />
            )}
            Approve
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface RejectDialogProps {
  open: boolean
  isSubmitting: boolean
  rejectionReason: string
  onReasonChange: (v: string) => void
  onConfirm: () => void
  onCancel: () => void
  requestNumber: string
}

function RejectDialog({
  open,
  isSubmitting,
  rejectionReason,
  onReasonChange,
  onConfirm,
  onCancel,
  requestNumber,
}: RejectDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onCancel() }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ThumbsDown className="w-5 h-5 text-red-500" />
            Reject Reversal
          </DialogTitle>
          <DialogDescription>
            Reject reversal request <span className="font-semibold text-foreground">{requestNumber}</span>.
            Please provide a reason.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="rejection-reason">Rejection Reason *</Label>
          <Textarea
            id="rejection-reason"
            value={rejectionReason}
            onChange={(e) => onReasonChange(e.target.value)}
            placeholder="Enter the reason for rejection..."
            rows={3}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isSubmitting || rejectionReason.trim().length === 0}
          >
            {isSubmitting ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Ban className="w-4 h-4 mr-2" />
            )}
            Reject
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface RetryDialogProps {
  open: boolean
  isSubmitting: boolean
  onConfirm: () => void
  onCancel: () => void
  requestNumber: string
}

function RetryDialog({ open, isSubmitting, onConfirm, onCancel, requestNumber }: RetryDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onCancel() }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-amber-500" />
            Retry Reversal
          </DialogTitle>
          <DialogDescription>
            Retry the failed reversal request{' '}
            <span className="font-semibold text-foreground">{requestNumber}</span>?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            className="bg-amber-500 hover:bg-amber-600 text-black"
            onClick={onConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RotateCcw className="w-4 h-4 mr-2" />
            )}
            Retry
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ---------------------------------------------------------------------------
// Stat helpers
// ---------------------------------------------------------------------------

function getStatusCount(stats: ReversalStats | null, status: string): number {
  if (!stats) return 0
  return stats.byStatus[status] ?? 0
}

function getTotalCount(stats: ReversalStats | null): number {
  if (!stats) return 0
  return Object.values(stats.byStatus).reduce((a, b) => a + b, 0)
}

// ---------------------------------------------------------------------------
// Main screen
// ---------------------------------------------------------------------------

export function ReversalsScreen() {
  const { user } = useAuth()

  const [requests, setRequests] = useState<ReversalRequest[]>([])
  const [stats, setStats] = useState<ReversalStats | null>(null)
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  })
  const [isLoading, setIsLoading] = useState(false)

  // Filters
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterEntityType, setFilterEntityType] = useState<string>('all')
  const [filterPriority, setFilterPriority] = useState<string>('all')

  // Dialog state
  type DialogKind = 'approve' | 'reject' | 'retry' | null
  const [activeDialog, setActiveDialog] = useState<DialogKind>(null)
  const [selectedRequest, setSelectedRequest] = useState<ReversalRequest | null>(null)
  const [rejectionReason, setRejectionReason] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Expanded row for details
  const [expandedRow, setExpandedRow] = useState<number | null>(null)

  // Data fetching
  const fetchStats = useCallback(async () => {
    try {
      const result = await window.api.reversals.stats()
      if (result?.success && result.data) {
        setStats(result.data)
      }
    } catch (error) {
      console.error('Failed to fetch reversal stats:', error)
    }
  }, [])

  const fetchRequests = useCallback(async (page = 1) => {
    setIsLoading(true)
    try {
      const params: Record<string, unknown> = { page, limit: pagination.limit }
      if (filterStatus !== 'all') params.status = filterStatus
      if (filterEntityType !== 'all') params.entityType = filterEntityType
      if (filterPriority !== 'all') params.priority = filterPriority

      const result = await window.api.reversals.list(params)
      if (result?.success) {
        setRequests(result.data ?? [])
        if (result.pagination) {
          setPagination(result.pagination)
        }
      }
    } catch (error) {
      console.error('Failed to fetch reversal requests:', error)
    } finally {
      setIsLoading(false)
    }
  }, [filterStatus, filterEntityType, filterPriority, pagination.limit])

  useEffect(() => {
    fetchStats()
    fetchRequests(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    fetchRequests(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus, filterEntityType, filterPriority])

  const handleRefresh = () => {
    fetchStats()
    fetchRequests(pagination.page)
  }

  const clearFilters = () => {
    setFilterStatus('all')
    setFilterEntityType('all')
    setFilterPriority('all')
  }

  // Dialog helpers
  const openDialog = (kind: DialogKind, req: ReversalRequest) => {
    setSelectedRequest(req)
    setRejectionReason('')
    setActiveDialog(kind)
  }

  const closeDialog = () => {
    setActiveDialog(null)
    setSelectedRequest(null)
    setRejectionReason('')
  }

  // Actions
  const handleApprove = async () => {
    if (!selectedRequest) return
    setIsSubmitting(true)
    try {
      const result = await window.api.reversals.approve(selectedRequest.id)
      if (result?.success) {
        closeDialog()
        handleRefresh()
      } else {
        alert(result?.message ?? 'Failed to approve reversal request.')
      }
    } catch (error) {
      console.error('Approve failed:', error)
      alert('Failed to approve reversal request. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReject = async () => {
    if (!selectedRequest || rejectionReason.trim().length === 0) return
    setIsSubmitting(true)
    try {
      const result = await window.api.reversals.reject({
        id: selectedRequest.id,
        rejectionReason: rejectionReason.trim(),
      })
      if (result?.success) {
        closeDialog()
        handleRefresh()
      } else {
        alert(result?.message ?? 'Failed to reject reversal request.')
      }
    } catch (error) {
      console.error('Reject failed:', error)
      alert('Failed to reject reversal request. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRetry = async () => {
    if (!selectedRequest) return
    setIsSubmitting(true)
    try {
      const result = await window.api.reversals.retry(selectedRequest.id)
      if (result?.success) {
        closeDialog()
        handleRefresh()
      } else {
        alert(result?.message ?? 'Failed to retry reversal request.')
      }
    } catch (error) {
      console.error('Retry failed:', error)
      alert('Failed to retry reversal request. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Formatters
  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso)
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    } catch {
      return iso
    }
  }

  const formatTime = (iso: string) => {
    try {
      return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    } catch {
      return ''
    }
  }

  const truncate = (str: string, maxLen: number) =>
    str.length <= maxLen ? str : `${str.slice(0, maxLen)}…`

  const getUserDisplay = (u: ReversalUser | null) => {
    if (!u) return '-'
    return u.fullName || u.username
  }

  const hasActiveFilters =
    filterStatus !== 'all' || filterEntityType !== 'all' || filterPriority !== 'all'

  // Admin guard
  if (user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Card className="border-destructive/30 max-w-md">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-destructive/10">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="font-semibold text-lg">Access Denied</p>
                <p className="text-muted-foreground text-sm">Admin privileges required</p>
              </div>
            </div>
            <p className="text-muted-foreground text-sm">
              Only administrators can review and action reversal requests.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const pendingCount = getStatusCount(stats, 'pending')
  const completedCount = getStatusCount(stats, 'completed')
  const failedCount = getStatusCount(stats, 'failed')
  const rejectedCount = getStatusCount(stats, 'rejected')
  const approvedCount = getStatusCount(stats, 'approved')
  const totalCount = getTotalCount(stats)

  return (
    <TooltipProvider>
      <div className="flex flex-col h-full p-4 space-y-4">
        {/* Header Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <ArrowLeftRight className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold leading-tight">Reversal Requests</h1>
              <p className="text-xs text-muted-foreground">Review and action transaction reversals</p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Stats Row - Compact inline */}
        <div className="grid grid-cols-6 gap-3">
          <Card className="border-border/50">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Total</span>
                <ArrowLeftRight className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
              <p className="text-xl font-bold mt-1">{totalCount.toLocaleString()}</p>
            </CardContent>
          </Card>

          <Card className="border-yellow-500/20">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Pending</span>
                <Clock className="w-3.5 h-3.5 text-yellow-500" />
              </div>
              <p className="text-xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">{pendingCount.toLocaleString()}</p>
            </CardContent>
          </Card>

          <Card className="border-blue-500/20">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Approved</span>
                <ThumbsUp className="w-3.5 h-3.5 text-blue-500" />
              </div>
              <p className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-1">{approvedCount.toLocaleString()}</p>
            </CardContent>
          </Card>

          <Card className="border-green-500/20">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Completed</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
              </div>
              <p className="text-xl font-bold text-green-600 dark:text-green-400 mt-1">{completedCount.toLocaleString()}</p>
            </CardContent>
          </Card>

          <Card className="border-red-500/20">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Failed</span>
                <FileX className="w-3.5 h-3.5 text-red-500" />
              </div>
              <p className="text-xl font-bold text-red-600 dark:text-red-400 mt-1">{failedCount.toLocaleString()}</p>
            </CardContent>
          </Card>

          <Card className="border-zinc-500/20">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Rejected</span>
                <Ban className="w-3.5 h-3.5 text-zinc-400" />
              </div>
              <p className="text-xl font-bold text-zinc-500 dark:text-zinc-400 mt-1">{rejectedCount.toLocaleString()}</p>
            </CardContent>
          </Card>
        </div>

        {/* Pending by Type & Priority - mini breakdown */}
        {stats && pendingCount > 0 && (
          <div className="grid grid-cols-2 gap-3">
            <Card className="border-border/50">
              <CardContent className="p-3">
                <p className="text-xs font-medium text-muted-foreground mb-2">Pending by Type</p>
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(stats.pendingByType)
                    .filter(([, count]) => count > 0)
                    .sort(([, a], [, b]) => b - a)
                    .map(([type, count]) => (
                      <Badge key={type} variant="secondary" className="text-[10px] px-1.5 py-0 font-mono">
                        {ENTITY_TYPE_LABELS[type] || type}: {count}
                      </Badge>
                    ))}
                </div>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-3">
                <p className="text-xs font-medium text-muted-foreground mb-2">Pending by Priority</p>
                <div className="flex flex-wrap gap-1.5">
                  {Object.entries(stats.pendingByPriority)
                    .filter(([, count]) => count > 0)
                    .map(([priority, count]) => (
                      <span key={priority} className="inline-flex items-center gap-1">
                        {getPriorityBadge(priority as ReversalRequest['priority'])}
                        <span className="text-[10px] font-mono text-muted-foreground">({count})</span>
                      </span>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filter Bar - Inline */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">Status:</span>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="h-8 w-[130px] text-xs">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">Type:</span>
            <Select value={filterEntityType} onValueChange={setFilterEntityType}>
              <SelectTrigger className="h-8 w-[140px] text-xs">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {ENTITY_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>{ENTITY_TYPE_LABELS[type]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">Priority:</span>
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="h-8 w-[120px] text-xs">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {PRIORITY_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 text-xs text-muted-foreground">
              <XCircle className="w-3.5 h-3.5 mr-1" />
              Clear
            </Button>
          )}

          <div className="ml-auto text-xs text-muted-foreground">
            {pagination.total > 0
              ? `${(pagination.page - 1) * pagination.limit + 1}–${Math.min(pagination.page * pagination.limit, pagination.total)} of ${pagination.total.toLocaleString()}`
              : '0 results'}
          </div>
        </div>

        {/* Table */}
        <Card className="flex-1 overflow-hidden">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : requests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <ArrowLeftRight className="w-10 h-10 mb-3 opacity-20" />
                <p className="font-medium text-sm">No reversal requests found</p>
                <p className="text-xs mt-1">Try adjusting your filters</p>
              </div>
            ) : (
              <div className="overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="w-32 text-xs">Request #</TableHead>
                      <TableHead className="text-xs w-24">Type</TableHead>
                      <TableHead className="text-xs w-16">ID</TableHead>
                      <TableHead className="text-xs">Reason</TableHead>
                      <TableHead className="text-xs w-24">Priority</TableHead>
                      <TableHead className="text-xs w-24">Status</TableHead>
                      <TableHead className="text-xs w-28">Requested By</TableHead>
                      <TableHead className="text-xs w-28">Reviewed By</TableHead>
                      <TableHead className="text-xs w-32">Date</TableHead>
                      <TableHead className="text-xs text-right w-32">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {requests.map((req) => (
                      <>
                        <TableRow
                          key={req.id}
                          className="cursor-pointer"
                          onClick={() => setExpandedRow(expandedRow === req.id ? null : req.id)}
                        >
                          <TableCell className="font-mono text-[11px] font-semibold py-2">
                            {req.requestNumber}
                          </TableCell>
                          <TableCell className="py-2">
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 font-normal">
                              {ENTITY_TYPE_LABELS[req.entityType] ?? req.entityType}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-[11px] text-muted-foreground py-2">
                            #{req.entityId}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground py-2 max-w-[200px]">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="cursor-default">{truncate(req.reason, 40)}</span>
                              </TooltipTrigger>
                              <TooltipContent side="bottom" className="max-w-sm">
                                <p className="text-xs">{req.reason}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TableCell>
                          <TableCell className="py-2">{getPriorityBadge(req.priority)}</TableCell>
                          <TableCell className="py-2">{getStatusBadge(req.status)}</TableCell>
                          <TableCell className="text-xs py-2">
                            <div className="flex items-center gap-1">
                              <User className="w-3 h-3 text-muted-foreground" />
                              {getUserDisplay(req.requestedByUser)}
                            </div>
                          </TableCell>
                          <TableCell className="text-xs py-2">
                            {req.reviewedByUser ? (
                              <div className="flex items-center gap-1">
                                <User className="w-3 h-3 text-muted-foreground" />
                                {getUserDisplay(req.reviewedByUser)}
                              </div>
                            ) : (
                              <span className="text-muted-foreground/50">—</span>
                            )}
                          </TableCell>
                          <TableCell className="py-2">
                            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                              <Calendar className="w-3 h-3" />
                              <span>{formatDate(req.createdAt)}</span>
                            </div>
                            <span className="text-[10px] text-muted-foreground/60 ml-4">{formatTime(req.createdAt)}</span>
                          </TableCell>
                          <TableCell className="text-right py-2" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1">
                              {req.status === 'pending' && (
                                <>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-7 w-7 p-0 text-green-600 hover:text-green-700 hover:bg-green-500/10"
                                        onClick={() => openDialog('approve', req)}
                                      >
                                        <ThumbsUp className="w-3.5 h-3.5" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Approve</TooltipContent>
                                  </Tooltip>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-500/10"
                                        onClick={() => openDialog('reject', req)}
                                      >
                                        <ThumbsDown className="w-3.5 h-3.5" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Reject</TooltipContent>
                                  </Tooltip>
                                </>
                              )}
                              {req.status === 'failed' && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-7 w-7 p-0 text-amber-600 hover:text-amber-700 hover:bg-amber-500/10"
                                      onClick={() => openDialog('retry', req)}
                                    >
                                      <RotateCcw className="w-3.5 h-3.5" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Retry</TooltipContent>
                                </Tooltip>
                              )}
                              {req.status !== 'pending' && req.status !== 'failed' && (
                                <span className="text-xs text-muted-foreground/40 px-1">—</span>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                        {/* Expanded detail row */}
                        {expandedRow === req.id && (
                          <TableRow key={`${req.id}-detail`} className="bg-muted/30 hover:bg-muted/30">
                            <TableCell colSpan={10} className="py-2 px-4">
                              <div className="grid grid-cols-3 gap-4 text-xs">
                                <div>
                                  <span className="text-muted-foreground font-medium">Full Reason:</span>
                                  <p className="mt-0.5">{req.reason}</p>
                                </div>
                                {req.rejectionReason && (
                                  <div>
                                    <span className="text-muted-foreground font-medium">Rejection Reason:</span>
                                    <p className="mt-0.5 text-red-600 dark:text-red-400">{req.rejectionReason}</p>
                                  </div>
                                )}
                                <div>
                                  <span className="text-muted-foreground font-medium">Last Updated:</span>
                                  <p className="mt-0.5">{formatDate(req.updatedAt)} at {formatTime(req.updatedAt)}</p>
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Page {pagination.page} of {pagination.totalPages}
            </p>
            <div className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => fetchRequests(pagination.page - 1)}
                disabled={pagination.page <= 1 || isLoading}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 w-7 p-0"
                onClick={() => fetchRequests(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages || isLoading}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Dialogs */}
        <ApproveDialog
          open={activeDialog === 'approve'}
          isSubmitting={isSubmitting}
          requestNumber={selectedRequest?.requestNumber ?? ''}
          onConfirm={handleApprove}
          onCancel={closeDialog}
        />
        <RejectDialog
          open={activeDialog === 'reject'}
          isSubmitting={isSubmitting}
          requestNumber={selectedRequest?.requestNumber ?? ''}
          rejectionReason={rejectionReason}
          onReasonChange={setRejectionReason}
          onConfirm={handleReject}
          onCancel={closeDialog}
        />
        <RetryDialog
          open={activeDialog === 'retry'}
          isSubmitting={isSubmitting}
          requestNumber={selectedRequest?.requestNumber ?? ''}
          onConfirm={handleRetry}
          onCancel={closeDialog}
        />
      </div>
    </TooltipProvider>
  )
}
