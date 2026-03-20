import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { useBranch } from '@/contexts/branch-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
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
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Search,
  Filter,
  Download,
  RefreshCw,
  Eye,
  Calendar,
  User,
  Clock,
  Activity,
  AlertTriangle,
  FileText,
  XCircle,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react'

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface AuditLogEntry {
  auditLog: {
    id: number
    userId: number | null
    branchId: number | null
    action: string
    entityType: string
    entityId: number | null
    oldValues: Record<string, unknown> | null
    newValues: Record<string, unknown> | null
    description: string | null
    createdAt: string
  }
  user: {
    id: number
    fullName: string | null
    username: string
    role: string | null
  } | null
}

interface AuditStats {
  totalLogs: number
  todayLogs: number
  actionStats: Array<{ action: string; count: number }>
  categoryStats: Array<{ entityType: string; count: number }>
  activeUsers: Array<{ userId: number; fullName: string | null; username: string | null; count: number }>
  criticalEvents: AuditLogEntry[]
  dailyActivity: Array<{ date: string; count: number }>
}

// ─── Module-level constants ───────────────────────────────────────────────────

const ACTIONS = [
  { value: 'create', label: 'Create', color: 'bg-green-100 text-green-800' },
  { value: 'update', label: 'Update', color: 'bg-blue-100 text-blue-800' },
  { value: 'delete', label: 'Delete', color: 'bg-red-100 text-red-800' },
  { value: 'login', label: 'Login', color: 'bg-purple-100 text-purple-800' },
  { value: 'logout', label: 'Logout', color: 'bg-gray-100 text-gray-800' },
  { value: 'void', label: 'Void', color: 'bg-orange-100 text-orange-800' },
  { value: 'refund', label: 'Refund', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'adjustment', label: 'Adjustment', color: 'bg-indigo-100 text-indigo-800' },
  { value: 'transfer', label: 'Transfer', color: 'bg-cyan-100 text-cyan-800' },
  { value: 'export', label: 'Export', color: 'bg-teal-100 text-teal-800' },
  { value: 'view', label: 'View', color: 'bg-slate-100 text-slate-800' },
] as const

const ENTITY_TYPES = [
  'user',
  'branch',
  'category',
  'product',
  'inventory',
  'customer',
  'supplier',
  'sale',
  'purchase',
  'return',
  'expense',
  'commission',
  'setting',
  'auth',
] as const

const CRITICAL_ACTIONS = ['delete', 'void', 'refund'] as const

/** Dark-mode-compatible badge styles keyed by action value */
const ACTION_BADGE_STYLES: Record<string, string> = {
  create:     'bg-emerald-500/15 text-emerald-500 border border-emerald-500/20',
  update:     'bg-blue-500/15 text-blue-500 border border-blue-500/20',
  delete:     'bg-red-500/15 text-red-500 border border-red-500/20',
  login:      'bg-purple-500/15 text-purple-500 border border-purple-500/20',
  logout:     'bg-zinc-500/15 text-zinc-400 border border-zinc-500/20',
  void:       'bg-orange-500/15 text-orange-500 border border-orange-500/20',
  refund:     'bg-amber-500/15 text-amber-500 border border-amber-500/20',
  adjustment: 'bg-indigo-500/15 text-indigo-500 border border-indigo-500/20',
  transfer:   'bg-cyan-500/15 text-cyan-500 border border-cyan-500/20',
  export:     'bg-teal-500/15 text-teal-500 border border-teal-500/20',
  view:       'bg-slate-500/15 text-slate-400 border border-slate-500/20',
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AuditLogsScreen() {
  const { user } = useAuth()
  const { currentBranch } = useBranch()

  // ── State ──────────────────────────────────────────────────────────────────
  const [logs, setLogs] = useState<AuditLogEntry[]>([])
  const [stats, setStats] = useState<AuditStats | null>(null)
  const [branches, setBranches] = useState<Array<{ id: number; name: string; code: string }>>([])
  const [users, setUsers] = useState<Array<{ id: number; fullName: string; username: string }>>([])

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUser, setSelectedUser] = useState<string>('all')
  const [selectedAction, setSelectedAction] = useState<string>('all')
  const [selectedEntityType, setSelectedEntityType] = useState<string>('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  // Pagination
  const [page, setPage] = useState(1)
  const [limit] = useState(50)
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  // Detail dialog
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  // ── Data fetchers ─────────────────────────────────────────────────────────

  const fetchMetadata = useCallback(async () => {
    try {
      const [branchesResult, usersResult] = await Promise.all([
        window.api.branches.getAll(),
        window.api.users.getAll({ page: 1, limit: 100 }),
      ])

      if (branchesResult.success && branchesResult.data) {
        setBranches(branchesResult.data)
      }
      if (usersResult.success && usersResult.data) {
        setUsers(usersResult.data.map((u: any) => ({ id: u.user.id, fullName: u.user.fullName, username: u.user.username })))
      }
    } catch (error) {
      console.error('Failed to fetch metadata:', error)
    }
  }, [])

  const fetchLogs = useCallback(async () => {
    setIsLoading(true)
    try {
      const params: any = {
        page,
        limit,
        sortOrder: 'desc',
      }

      if (searchQuery) params.searchQuery = searchQuery
      // Always filter by current branch in single branch mode
      if (currentBranch) {
        params.branchId = currentBranch.id
      }
      if (selectedUser !== 'all') params.userId = parseInt(selectedUser)
      if (selectedAction !== 'all') params.action = selectedAction
      if (selectedEntityType !== 'all') params.entityType = selectedEntityType
      if (startDate) params.startDate = startDate
      if (endDate) params.endDate = endDate

      const result = await window.api.audit.getLogs(params)

      if (result.success) {
        setLogs(result.data || [])
        setTotal(result.total || 0)
      }
    } catch (error) {
      console.error('Failed to fetch audit logs:', error)
    } finally {
      setIsLoading(false)
    }
  }, [page, limit, searchQuery, currentBranch, selectedUser, selectedAction, selectedEntityType, startDate, endDate])

  const fetchStats = useCallback(async () => {
    try {
      const params: any = {}
      // Always filter by current branch in single branch mode
      if (currentBranch) {
        params.branchId = currentBranch.id
      }
      if (startDate) params.startDate = startDate
      if (endDate) params.endDate = endDate

      const result = await window.api.audit.getStats(params)

      if (result.success && result.data) {
        setStats(result.data)
      }
    } catch (error) {
      console.error('Failed to fetch audit stats:', error)
    }
  }, [currentBranch, startDate, endDate])

  // ── Effects ───────────────────────────────────────────────────────────────

  useEffect(() => {
    fetchMetadata()
  }, [fetchMetadata])

  useEffect(() => {
    fetchLogs()
    fetchStats()
  }, [fetchLogs, fetchStats])

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleRefresh = () => {
    fetchLogs()
    fetchStats()
  }

  const handleApplyFilters = () => {
    setPage(1)
    fetchLogs()
    fetchStats()
  }

  const handleResetFilters = () => {
    setSearchQuery('')
    setSelectedUser('all')
    setSelectedAction('all')
    setSelectedEntityType('all')
    setStartDate('')
    setEndDate('')
    setPage(1)
    fetchLogs()
    fetchStats()
  }

  const handleExport = async (format: 'csv' | 'json') => {
    setIsExporting(true)
    try {
      const params: any = {
        startDate: startDate || '2000-01-01',
        endDate: endDate || new Date().toISOString().split('T')[0],
        format,
      }

      // Always filter by current branch in single branch mode
      if (currentBranch) {
        params.branchId = currentBranch.id
      }
      if (selectedAction !== 'all') params.action = selectedAction
      if (selectedEntityType !== 'all') params.entityType = selectedEntityType
      if (searchQuery) params.searchQuery = searchQuery

      const result = await window.api.audit.export(params)

      if (result.success) {
        if (format === 'csv') {
          const blob = new Blob([result.data], { type: 'text/csv' })
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(url)
        } else {
          const blob = new Blob([JSON.stringify(result.data, null, 2)], { type: 'application/json' })
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.json`
          document.body.appendChild(a)
          a.click()
          document.body.removeChild(a)
          URL.revokeObjectURL(url)
        }
        alert(`${format.toUpperCase()} export completed successfully!`)
      }
    } catch (error) {
      console.error('Export failed:', error)
      alert('Export failed. Please try again.')
    } finally {
      setIsExporting(false)
    }
  }

  const handleViewDetails = (log: AuditLogEntry) => {
    setSelectedLog(log)
    setIsDetailOpen(true)
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  const getActionBadge = (action: string) => {
    const actionInfo = ACTIONS.find((a) => a.value === action)
    const styles = ACTION_BADGE_STYLES[action] ?? 'bg-zinc-500/15 text-zinc-400 border border-zinc-500/20'
    return (
      <Badge className={`${styles} font-medium text-[11px] px-2 py-0.5 rounded-md`}>
        {actionInfo?.label || action}
      </Badge>
    )
  }

  const getEntityBadge = (entityType: string) => (
    <Badge
      variant="outline"
      className="font-mono text-[11px] px-2 py-0.5 border-primary/20 text-primary/80 bg-primary/5"
    >
      {entityType}
    </Badge>
  )

  const getUserDisplay = (log: AuditLogEntry) => {
    if (!log.user) return 'System'
    return log.user.fullName || log.user.username || 'Unknown'
  }

  const totalPages = Math.ceil(total / limit)

  // ── Admin access guard ────────────────────────────────────────────────────
  // Rendered inside return so all hooks above are always called unconditionally.
  if (user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Card className="border-red-500/30 bg-red-500/5 max-w-md">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-red-500/10">
                <ShieldAlert className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <p className="text-foreground font-semibold text-base">Access Denied</p>
                <p className="text-red-500 text-xs font-mono uppercase tracking-wider">Admin Only</p>
              </div>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed">
              You do not have permission to access the audit logs. Only administrators can view system activity logs.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // ── Derived values for detail dialog diff view ────────────────────────────
  const diffKeys: string[] =
    selectedLog?.auditLog.oldValues && selectedLog?.auditLog.newValues
      ? Object.keys(selectedLog.auditLog.newValues).filter((key) => {
          const oldVal = (selectedLog.auditLog.oldValues as Record<string, unknown>)[key]
          const newVal = (selectedLog.auditLog.newValues as Record<string, unknown>)[key]
          return JSON.stringify(oldVal) !== JSON.stringify(newVal)
        })
      : []

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full max-w-7xl mx-auto">
      {/* Primary accent top-line */}
      <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

      <div className="p-5 space-y-4 flex-1 overflow-auto">

        {/* ── Header ──────────────────────────────────────────────── */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold leading-tight tracking-tight">
                Activity Logs
              </h1>
              <p className="text-xs text-muted-foreground leading-none mt-0.5">
                Audit trail · all system operations
                {currentBranch && (
                  <span className="text-primary font-medium"> — {currentBranch.name}</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-3 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
              onClick={handleRefresh}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-3 text-xs gap-1.5 border-primary/20 hover:border-primary/40 hover:bg-primary/5"
              onClick={() => handleExport('csv')}
              disabled={isExporting}
            >
              <Download className="w-3.5 h-3.5 text-primary" />
              CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 px-3 text-xs gap-1.5 border-primary/20 hover:border-primary/40 hover:bg-primary/5"
              onClick={() => handleExport('json')}
              disabled={isExporting}
            >
              <FileText className="w-3.5 h-3.5 text-primary" />
              JSON
            </Button>
          </div>
        </div>

        {/* ── Statistics Bar ───────────────────────────────────────── */}
        {stats && (
          <div className="grid grid-cols-4 gap-3">
            {/* Total Logs */}
            <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 border-l-2 border-l-primary/50">
              <div className="p-1.5 rounded-md bg-primary/10">
                <Activity className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Total Logs</p>
                <p className="text-xl font-bold leading-tight">{stats.totalLogs.toLocaleString()}</p>
              </div>
            </div>

            {/* Today's Activity */}
            <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 border-l-2 border-l-emerald-500/50">
              <div className="p-1.5 rounded-md bg-emerald-500/10">
                <Clock className="w-4 h-4 text-emerald-500" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Today</p>
                <p className="text-xl font-bold leading-tight text-emerald-500">{stats.todayLogs.toLocaleString()}</p>
              </div>
            </div>

            {/* Active Users */}
            <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3 border-l-2 border-l-blue-500/50">
              <div className="p-1.5 rounded-md bg-blue-500/10">
                <User className="w-4 h-4 text-blue-500" />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Active Users</p>
                <p className="text-xl font-bold leading-tight">{stats.activeUsers.length}</p>
              </div>
            </div>

            {/* Critical Events */}
            <div className={`flex items-center gap-3 rounded-lg border bg-card px-4 py-3 border-l-2 ${
              stats.criticalEvents.length > 0
                ? 'border-red-500/30 border-l-red-500/60'
                : 'border-border border-l-zinc-500/30'
            }`}>
              <div className={`p-1.5 rounded-md ${stats.criticalEvents.length > 0 ? 'bg-red-500/10' : 'bg-zinc-500/10'}`}>
                <AlertTriangle className={`w-4 h-4 ${stats.criticalEvents.length > 0 ? 'text-red-500' : 'text-zinc-500'}`} />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Critical Events</p>
                <p className={`text-xl font-bold leading-tight ${stats.criticalEvents.length > 0 ? 'text-red-500' : ''}`}>
                  {stats.criticalEvents.length}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ── Filter Bar ───────────────────────────────────────────── */}
        <div className="rounded-lg border border-border bg-card">
          {/* Filter header row */}
          <div className="flex items-center gap-3 px-4 py-2.5 border-b border-border">
            <Filter className="w-3.5 h-3.5 text-primary/70" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Filters</span>
          </div>

          {/* Filter controls */}
          <div className="px-4 py-3 flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-48">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                placeholder="Search user, action, description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-8 text-xs"
              />
            </div>

            {/* User select */}
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger className="h-8 w-36 text-xs">
                <SelectValue placeholder="All Users" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                {users.map((u) => (
                  <SelectItem key={u.id} value={u.id.toString()}>
                    {u.fullName || u.username}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Action select */}
            <Select value={selectedAction} onValueChange={setSelectedAction}>
              <SelectTrigger className="h-8 w-36 text-xs">
                <SelectValue placeholder="All Actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                {ACTIONS.map((action) => (
                  <SelectItem key={action.value} value={action.value}>
                    {action.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Entity type select */}
            <Select value={selectedEntityType} onValueChange={setSelectedEntityType}>
              <SelectTrigger className="h-8 w-36 text-xs">
                <SelectValue placeholder="All Entities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Entities</SelectItem>
                {ENTITY_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Date range */}
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-8 w-34 text-xs"
                aria-label="Start date"
              />
              <span className="text-muted-foreground text-xs">—</span>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-8 w-34 text-xs"
                aria-label="End date"
              />
            </div>

            {/* Action buttons */}
            <Button
              size="sm"
              className="h-8 px-3 text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
              onClick={handleApplyFilters}
            >
              Apply
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-3 text-xs text-muted-foreground"
              onClick={handleResetFilters}
            >
              <XCircle className="w-3.5 h-3.5 mr-1" />
              Reset
            </Button>
          </div>
        </div>

        {/* ── Logs Table Card ──────────────────────────────────────── */}
        <Card className="overflow-hidden">
          {/* Table header row */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-border">
            <div className="flex items-center gap-2">
              <Activity className="w-3.5 h-3.5 text-primary/70" />
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Audit Logs
              </span>
            </div>
            <span className="text-xs text-muted-foreground">
              {logs.length > 0
                ? `${(page - 1) * limit + 1}–${Math.min(page * limit, total)} of ${total.toLocaleString()}`
                : `0 of ${total.toLocaleString()}`}
            </span>
          </div>

          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <RefreshCw className="w-6 h-6 animate-spin text-primary/50" />
                <span className="ml-2 text-sm text-muted-foreground">Loading logs...</span>
              </div>
            ) : logs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <FileText className="w-10 h-10 mb-3 opacity-20" />
                <p className="text-sm font-medium">No audit logs found</p>
                <p className="text-xs opacity-60 mt-0.5">Try adjusting your filters</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-b border-border">
                    <TableHead className="w-40 text-[11px] uppercase tracking-wider text-muted-foreground font-semibold py-2">
                      Date & Time
                    </TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold py-2">
                      User
                    </TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold py-2">
                      Action
                    </TableHead>
                    <TableHead className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold py-2">
                      Entity
                    </TableHead>
                    <TableHead className="hidden lg:table-cell text-[11px] uppercase tracking-wider text-muted-foreground font-semibold py-2">
                      Description
                    </TableHead>
                    <TableHead className="text-right w-16 text-[11px] uppercase tracking-wider text-muted-foreground font-semibold py-2">
                      Details
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log, idx) => {
                    const isCritical = CRITICAL_ACTIONS.includes(log.auditLog.action as typeof CRITICAL_ACTIONS[number])
                    return (
                      <TableRow
                        key={log.auditLog.id}
                        className={[
                          'border-b border-border/50 transition-colors',
                          isCritical
                            ? 'bg-red-500/5 border-l-2 border-l-red-500/40 hover:bg-red-500/8'
                            : idx % 2 === 0
                              ? 'bg-transparent hover:bg-muted/40'
                              : 'bg-muted/20 hover:bg-muted/40',
                        ].join(' ')}
                      >
                        {/* Date & Time */}
                        <TableCell className="py-2 pr-4">
                          <span className="font-mono text-[11px] text-muted-foreground">
                            {new Date(log.auditLog.createdAt).toLocaleString(undefined, {
                              month: 'short',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit',
                            })}
                          </span>
                        </TableCell>

                        {/* User */}
                        <TableCell className="py-2">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                              <User className="w-3 h-3 text-primary/70" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-medium leading-tight truncate max-w-28">
                                {getUserDisplay(log)}
                              </p>
                              {log.user?.role && (
                                <p className="text-[10px] text-muted-foreground capitalize leading-none mt-0.5">
                                  {log.user.role}
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>

                        {/* Action badge */}
                        <TableCell className="py-2">
                          {getActionBadge(log.auditLog.action)}
                        </TableCell>

                        {/* Entity */}
                        <TableCell className="py-2">
                          <div className="flex items-center gap-1.5">
                            {getEntityBadge(log.auditLog.entityType)}
                            {log.auditLog.entityId && (
                              <span className="text-[10px] text-muted-foreground font-mono">
                                #{log.auditLog.entityId}
                              </span>
                            )}
                          </div>
                        </TableCell>

                        {/* Description */}
                        <TableCell className="hidden lg:table-cell py-2 max-w-xs">
                          <span
                            className="text-xs text-muted-foreground truncate block max-w-64"
                            title={log.auditLog.description ?? ''}
                          >
                            {log.auditLog.description || <span className="opacity-30">—</span>}
                          </span>
                        </TableCell>

                        {/* View */}
                        <TableCell className="text-right py-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 hover:bg-primary/10 hover:text-primary"
                            onClick={() => handleViewDetails(log)}
                            aria-label="View log details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            )}

            {/* Inline Pagination */}
            {logs.length > 0 && (
              <div className="flex items-center justify-between px-4 py-2.5 border-t border-border bg-muted/10">
                <p className="text-xs text-muted-foreground">
                  Page <span className="font-medium text-foreground">{page}</span> of{' '}
                  <span className="font-medium text-foreground">{totalPages || 1}</span>
                </p>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 w-7 p-0 border-border"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </Button>
                  {/* Page number chips — show at most 5 around current page */}
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    const startPage = Math.max(1, Math.min(page - 2, totalPages - 4))
                    return startPage + i
                  }).map((p) => (
                    <Button
                      key={p}
                      variant={p === page ? 'default' : 'ghost'}
                      size="sm"
                      className={`h-7 w-7 p-0 text-xs ${
                        p === page
                          ? 'bg-primary hover:bg-primary/90 text-primary-foreground font-bold'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                      onClick={() => setPage(p)}
                    >
                      {p}
                    </Button>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 w-7 p-0 border-border"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages}
                    aria-label="Next page"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Most Active Users Bar ────────────────────────────────── */}
        {stats && stats.activeUsers.length > 0 && (
          <div className="rounded-lg border border-border bg-card px-4 py-3">
            <div className="flex items-center gap-2 mb-3">
              <User className="w-3.5 h-3.5 text-primary/70" />
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Most Active Users
              </span>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {stats.activeUsers.slice(0, 5).map((u, idx) => (
                <div
                  key={u.userId}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted/40 border border-border/50"
                >
                  <div className="w-5 h-5 rounded-full bg-primary/15 border border-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
                    {idx + 1}
                  </div>
                  <div>
                    <p className="text-xs font-medium leading-tight">{u.fullName || u.username || 'Unknown'}</p>
                    <p className="text-[10px] text-muted-foreground leading-none mt-0.5">
                      {u.count.toLocaleString()} actions
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Detail Dialog ────────────────────────────────────────── */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <div className="p-1.5 rounded-md bg-primary/10">
                <FileText className="w-4 h-4 text-primary" />
              </div>
              Log Details
              <span className="font-mono text-xs text-muted-foreground font-normal ml-1">
                #{selectedLog?.auditLog.id}
              </span>
            </DialogTitle>
          </DialogHeader>

          {selectedLog && (
            <div className="space-y-4 mt-1">
              {/* Core metadata grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-3 sm:col-span-1 rounded-md bg-muted/30 border border-border px-3 py-2">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1">Date & Time</p>
                  <p className="font-mono text-xs leading-tight">
                    {new Date(selectedLog.auditLog.createdAt).toLocaleString()}
                  </p>
                </div>

                <div className="rounded-md bg-muted/30 border border-border px-3 py-2">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1.5">Action</p>
                  {getActionBadge(selectedLog.auditLog.action)}
                </div>

                <div className="rounded-md bg-muted/30 border border-border px-3 py-2">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1.5">Entity</p>
                  <div className="flex items-center gap-1.5">
                    {getEntityBadge(selectedLog.auditLog.entityType)}
                    {selectedLog.auditLog.entityId && (
                      <span className="text-[10px] text-muted-foreground font-mono">
                        #{selectedLog.auditLog.entityId}
                      </span>
                    )}
                  </div>
                </div>

                <div className="rounded-md bg-muted/30 border border-border px-3 py-2">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1">User</p>
                  <p className="text-xs font-medium">{getUserDisplay(selectedLog)}</p>
                </div>

                <div className="rounded-md bg-muted/30 border border-border px-3 py-2">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1">Role</p>
                  <p className="text-xs capitalize">{selectedLog.user?.role || 'System'}</p>
                </div>

                <div className="rounded-md bg-muted/30 border border-border px-3 py-2">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1">Username</p>
                  <p className="text-xs font-mono">{selectedLog.user?.username || '—'}</p>
                </div>
              </div>

              {/* Description */}
              {selectedLog.auditLog.description && (
                <div className="rounded-md bg-muted/30 border border-border px-3 py-2">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1">Description</p>
                  <p className="text-xs leading-relaxed">{selectedLog.auditLog.description}</p>
                </div>
              )}

              {/* Change Diff — derived outside JSX to avoid IIFE pattern */}
              {diffKeys.length > 0 && (
                <div className="rounded-md border border-border overflow-hidden">
                  <div className="px-3 py-2 bg-muted/40 border-b border-border">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                      Changes ({diffKeys.length} field{diffKeys.length !== 1 ? 's' : ''})
                    </p>
                  </div>
                  <div className="divide-y divide-border/50">
                    {diffKeys.map((key) => {
                      const oldVal = (selectedLog.auditLog.oldValues as Record<string, unknown>)[key]
                      const newVal = (selectedLog.auditLog.newValues as Record<string, unknown>)[key]
                      return (
                        <div key={key} className="flex items-start gap-3 px-3 py-2 text-xs">
                          <span className="font-mono text-muted-foreground w-28 shrink-0 truncate pt-0.5">{key}</span>
                          <div className="flex items-center gap-2 min-w-0 flex-wrap">
                            <span className="line-through text-red-500 bg-red-500/8 px-1.5 py-0.5 rounded text-[11px] max-w-32 truncate">
                              {String(oldVal ?? '')}
                            </span>
                            <span className="text-muted-foreground text-[10px]">→</span>
                            <span className="text-emerald-500 bg-emerald-500/8 px-1.5 py-0.5 rounded text-[11px] max-w-32 truncate">
                              {String(newVal ?? '')}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Raw values — side by side */}
              {(selectedLog.auditLog.oldValues || selectedLog.auditLog.newValues) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {selectedLog.auditLog.oldValues && (
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1.5 px-1">
                        Old Values
                      </p>
                      <pre className="p-3 bg-red-500/5 border border-red-500/15 rounded-md text-[11px] overflow-x-auto leading-relaxed max-h-48">
                        {JSON.stringify(selectedLog.auditLog.oldValues, null, 2)}
                      </pre>
                    </div>
                  )}
                  {selectedLog.auditLog.newValues && (
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1.5 px-1">
                        New Values
                      </p>
                      <pre className="p-3 bg-emerald-500/5 border border-emerald-500/15 rounded-md text-[11px] overflow-x-auto leading-relaxed max-h-48">
                        {JSON.stringify(selectedLog.auditLog.newValues, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
