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
  CardDescription,
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
  RefreshCw,
  Filter,
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
  requestedBy: ReversalUser | null
  reviewedBy: ReversalUser | null
  createdAt: string
  updatedAt: string
}

interface ReversalStats {
  byStatus: Array<{ status: string; count: number }>
  pendingByType: Array<{ entityType: string; count: number }>
  pendingByPriority: Array<{ priority: string; count: number }>
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
  stock_adjustment: 'Stock Adjustment',
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
  const map: Record<typeof priority, { label: string; className: string }> = {
    urgent: { label: 'Urgent', className: 'bg-red-600 text-white border-transparent' },
    high: { label: 'High', className: 'bg-orange-500 text-white border-transparent' },
    medium: { label: 'Medium', className: 'bg-yellow-500 text-black border-transparent' },
    low: { label: 'Low', className: 'bg-zinc-500 text-white border-transparent' },
  }
  const cfg = map[priority] ?? { label: priority, className: 'bg-zinc-500 text-white border-transparent' }
  return (
    <Badge className={cfg.className}>
      {cfg.label}
    </Badge>
  )
}

function getStatusBadge(status: ReversalRequest['status']) {
  const map: Record<typeof status, { label: string; className: string }> = {
    pending: { label: 'Pending', className: 'bg-yellow-500 text-black border-transparent' },
    approved: { label: 'Approved', className: 'bg-blue-500 text-white border-transparent' },
    completed: { label: 'Completed', className: 'bg-green-600 text-white border-transparent' },
    failed: { label: 'Failed', className: 'bg-red-600 text-white border-transparent' },
    rejected: { label: 'Rejected', className: 'bg-zinc-500 text-white border-transparent' },
  }
  const cfg = map[status] ?? { label: status, className: 'bg-zinc-500 text-white border-transparent' }
  return (
    <Badge className={cfg.className}>
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
            Please provide a reason so the requester understands.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <Label htmlFor="rejection-reason">Rejection Reason *</Label>
          <Textarea
            id="rejection-reason"
            value={rejectionReason}
            onChange={(e) => onReasonChange(e.target.value)}
            placeholder="Enter the reason for rejection..."
            rows={4}
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
            This will re-attempt the reversal execution.
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
// Stats summary counts
// ---------------------------------------------------------------------------

function getStatusCount(stats: ReversalStats | null, status: string): number {
  if (!stats) return 0
  return stats.byStatus.find((s) => s.status === status)?.count ?? 0
}

// ---------------------------------------------------------------------------
// Main screen
// ---------------------------------------------------------------------------

export function ReversalsScreen() {
  const { user } = useAuth()

  // Admin access guard
  if (user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Card className="border-red-200 bg-red-50 max-w-md">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-red-700 font-semibold text-lg">Access Denied</p>
                <p className="text-red-600 text-sm">Admin Only Access</p>
              </div>
            </div>
            <p className="text-red-600 text-sm">
              You do not have permission to access the reversal dashboard. Only administrators can
              review and action reversal requests.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // -------------------------------------------------------------------
  // State
  // -------------------------------------------------------------------

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

  // -------------------------------------------------------------------
  // Data fetching
  // -------------------------------------------------------------------

  const fetchStats = useCallback(async () => {
    try {
      const result = await window.api.invoke('reversal:stats')
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

      const result = await window.api.invoke('reversal:list', params)
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

  // Initial load
  useEffect(() => {
    fetchStats()
    fetchRequests(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Re-fetch when filters change, always reset to page 1
  const applyFilters = () => {
    fetchRequests(1)
    fetchStats()
  }

  const clearFilters = () => {
    setFilterStatus('all')
    setFilterEntityType('all')
    setFilterPriority('all')
  }

  // When filter state resets we need to re-fetch. Use a dedicated effect
  // keyed to the filter values so clearing re-fetches automatically.
  useEffect(() => {
    fetchRequests(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus, filterEntityType, filterPriority])

  const handleRefresh = () => {
    fetchStats()
    fetchRequests(pagination.page)
  }

  // -------------------------------------------------------------------
  // Dialog helpers
  // -------------------------------------------------------------------

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

  // -------------------------------------------------------------------
  // Actions
  // -------------------------------------------------------------------

  const handleApprove = async () => {
    if (!selectedRequest) return
    setIsSubmitting(true)
    try {
      const result = await window.api.invoke('reversal:approve', selectedRequest.id)
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
      const result = await window.api.invoke('reversal:reject', {
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
      const result = await window.api.invoke('reversal:retry', selectedRequest.id)
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

  // -------------------------------------------------------------------
  // Formatters
  // -------------------------------------------------------------------

  const formatDate = (iso: string) => {
    try {
      return new Date(iso).toLocaleString()
    } catch {
      return iso
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

  // -------------------------------------------------------------------
  // Render
  // -------------------------------------------------------------------

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* ------------------------------------------------------------------ */}
      {/* Header                                                               */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <ArrowLeftRight className="w-8 h-8" />
            Reversal Requests
          </h1>
          <p className="text-muted-foreground">
            Review and action transaction reversal requests
          </p>
        </div>
        <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Stats Cards                                                          */}
      {/* ------------------------------------------------------------------ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-yellow-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="w-4 h-4 text-yellow-500" />
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">
              {getStatusCount(stats, 'pending').toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              {getStatusCount(stats, 'completed').toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <FileX className="w-4 h-4 text-red-500" />
              Failed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {getStatusCount(stats, 'failed').toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-500/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Ban className="w-4 h-4 text-zinc-400" />
              Rejected
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-400">
              {getStatusCount(stats, 'rejected').toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Filter Bar                                                           */}
      {/* ------------------------------------------------------------------ */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
          <CardDescription>Narrow the list by status, entity type, or priority</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 items-end">
            {/* Status */}
            <div className="space-y-2 min-w-[160px]">
              <Label>Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Entity Type */}
            <div className="space-y-2 min-w-[180px]">
              <Label>Entity Type</Label>
              <Select value={filterEntityType} onValueChange={setFilterEntityType}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {ENTITY_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {ENTITY_TYPE_LABELS[type]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Priority */}
            <div className="space-y-2 min-w-[160px]">
              <Label>Priority</Label>
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger>
                  <SelectValue placeholder="All Priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  {PRIORITY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-[1.625rem]">
              <Button onClick={applyFilters} disabled={isLoading}>
                <Filter className="w-4 h-4 mr-2" />
                Apply
              </Button>
              {hasActiveFilters && (
                <Button variant="outline" onClick={clearFilters} disabled={isLoading}>
                  <XCircle className="w-4 h-4 mr-2" />
                  Clear
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ------------------------------------------------------------------ */}
      {/* Table                                                                */}
      {/* ------------------------------------------------------------------ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Requests</span>
            <span className="text-sm font-normal text-muted-foreground">
              {pagination.total > 0
                ? `${(pagination.page - 1) * pagination.limit + 1}–${Math.min(
                    pagination.page * pagination.limit,
                    pagination.total
                  )} of ${pagination.total.toLocaleString()}`
                : '0 results'}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : requests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <ArrowLeftRight className="w-12 h-12 mb-4 opacity-30" />
              <p className="font-medium">No reversal requests found</p>
              <p className="text-sm mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-40">Request #</TableHead>
                  <TableHead>Entity Type</TableHead>
                  <TableHead className="max-w-xs">Reason</TableHead>
                  <TableHead className="w-28">Priority</TableHead>
                  <TableHead className="w-28">Status</TableHead>
                  <TableHead>Requested By</TableHead>
                  <TableHead className="w-44">Date</TableHead>
                  <TableHead className="text-right w-36">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((req) => (
                  <TableRow key={req.id}>
                    {/* Request # */}
                    <TableCell className="font-mono text-xs font-semibold">
                      {req.requestNumber}
                    </TableCell>

                    {/* Entity Type */}
                    <TableCell>
                      {ENTITY_TYPE_LABELS[req.entityType] ?? req.entityType}
                    </TableCell>

                    {/* Reason */}
                    <TableCell className="text-sm text-muted-foreground max-w-xs">
                      <span title={req.reason}>{truncate(req.reason, 50)}</span>
                    </TableCell>

                    {/* Priority */}
                    <TableCell>{getPriorityBadge(req.priority)}</TableCell>

                    {/* Status */}
                    <TableCell>{getStatusBadge(req.status)}</TableCell>

                    {/* Requested By */}
                    <TableCell className="text-sm">
                      {getUserDisplay(req.requestedBy)}
                    </TableCell>

                    {/* Date */}
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {formatDate(req.createdAt)}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {req.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              className="h-7 px-2 text-xs bg-green-600 hover:bg-green-700 text-white"
                              onClick={() => openDialog('approve', req)}
                            >
                              <ThumbsUp className="w-3 h-3 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="h-7 px-2 text-xs"
                              onClick={() => openDialog('reject', req)}
                            >
                              <ThumbsDown className="w-3 h-3 mr-1" />
                              Reject
                            </Button>
                          </>
                        )}
                        {req.status === 'failed' && (
                          <Button
                            size="sm"
                            className="h-7 px-2 text-xs bg-amber-500 hover:bg-amber-600 text-black"
                            onClick={() => openDialog('retry', req)}
                          >
                            <RotateCcw className="w-3 h-3 mr-1" />
                            Retry
                          </Button>
                        )}
                        {req.status !== 'pending' && req.status !== 'failed' && (
                          <span className="text-xs text-muted-foreground px-1">—</span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* ------------------------------------------------------------------ */}
      {/* Pagination                                                           */}
      {/* ------------------------------------------------------------------ */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchRequests(pagination.page - 1)}
              disabled={pagination.page <= 1 || isLoading}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchRequests(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages || isLoading}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Dialogs                                                              */}
      {/* ------------------------------------------------------------------ */}
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
  )
}
