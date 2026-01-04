import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  Building2,
  Clock,
  Activity,
  AlertTriangle,
  FileText,
  Trash2,
  XCircle,
  RotateCcw,
  ExternalLink,
} from 'lucide-react'

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
]

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
]

const CRITICAL_ACTIONS = ['delete', 'void', 'refund']

export function AuditLogsScreen() {
  const { user } = useAuth()

  // Admin access check
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
              You do not have permission to access the audit logs. Only administrators can view system activity logs.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // State
  const [logs, setLogs] = useState<AuditLogEntry[]>([])
  const [stats, setStats] = useState<AuditStats | null>(null)
  const [branches, setBranches] = useState<Array<{ id: number; name: string; code: string }>>([])
  const [users, setUsers] = useState<Array<{ id: number; fullName: string; username: string }>>([])

  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedBranch, setSelectedBranch] = useState<string>('all')
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

  // Fetch branches and users
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

  // Fetch logs
  const fetchLogs = useCallback(async () => {
    setIsLoading(true)
    try {
      const params: any = {
        page,
        limit,
        sortOrder: 'desc',
      }

      if (searchQuery) params.searchQuery = searchQuery
      if (selectedBranch !== 'all') params.branchId = parseInt(selectedBranch)
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
  }, [page, limit, searchQuery, selectedBranch, selectedUser, selectedAction, selectedEntityType, startDate, endDate])

  // Fetch statistics
  const fetchStats = useCallback(async () => {
    try {
      const params: any = {}
      if (selectedBranch !== 'all') params.branchId = parseInt(selectedBranch)
      if (startDate) params.startDate = startDate
      if (endDate) params.endDate = endDate

      const result = await window.api.audit.getStats(params)

      if (result.success && result.data) {
        setStats(result.data)
      }
    } catch (error) {
      console.error('Failed to fetch audit stats:', error)
    }
  }, [selectedBranch, startDate, endDate])

  // Initial load
  useEffect(() => {
    fetchMetadata()
  }, [fetchMetadata])

  // Fetch data when filters change
  useEffect(() => {
    fetchLogs()
    fetchStats()
  }, [fetchLogs, fetchStats])

  // Apply filters
  const handleApplyFilters = () => {
    setPage(1)
    fetchLogs()
    fetchStats()
  }

  // Reset filters
  const handleResetFilters = () => {
    setSearchQuery('')
    setSelectedBranch('all')
    setSelectedUser('all')
    setSelectedAction('all')
    setSelectedEntityType('all')
    setStartDate('')
    setEndDate('')
    setPage(1)
    fetchLogs()
    fetchStats()
  }

  // Export logs
  const handleExport = async (format: 'csv' | 'json') => {
    setIsExporting(true)
    try {
      const params: any = {
        startDate: startDate || '2000-01-01',
        endDate: endDate || new Date().toISOString().split('T')[0],
        format,
      }

      if (selectedBranch !== 'all') params.branchId = parseInt(selectedBranch)
      if (selectedAction !== 'all') params.action = selectedAction
      if (selectedEntityType !== 'all') params.entityType = selectedEntityType
      if (searchQuery) params.searchQuery = searchQuery

      const result = await window.api.audit.export(params)

      if (result.success) {
        if (format === 'csv') {
          // Download CSV
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
          // Download JSON
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

  // View log details
  const handleViewDetails = (log: AuditLogEntry) => {
    setSelectedLog(log)
    setIsDetailOpen(true)
  }

  // Get action badge
  const getActionBadge = (action: string) => {
    const actionInfo = ACTIONS.find((a) => a.value === action)
    return (
      <Badge className={actionInfo?.color || 'bg-gray-100'}>
        {actionInfo?.label || action}
      </Badge>
    )
  }

  // Get entity type badge
  const getEntityBadge = (entityType: string) => {
    return (
      <Badge variant="outline" className="font-mono text-xs">
        {entityType}
      </Badge>
    )
  }

  // Get user display name
  const getUserDisplay = (log: AuditLogEntry) => {
    if (!log.user) return 'System'
    return log.user.fullName || log.user.username || 'Unknown'
  }

  const totalPages = Math.ceil(total / limit)

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileText className="w-8 h-8" />
            Activity Logs
          </h1>
          <p className="text-muted-foreground">
            Comprehensive audit trail of all system operations
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => { fetchLogs(); fetchStats() }}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" onClick={() => handleExport('csv')} disabled={isExporting}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={() => handleExport('json')} disabled={isExporting}>
            <FileText className="w-4 h-4 mr-2" />
            Export JSON
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Total Logs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalLogs.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Today's Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.todayLogs.toLocaleString()}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <User className="w-4 h-4" />
                Active Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeUsers.length}</div>
            </CardContent>
          </Card>

          <Card className={stats.criticalEvents.length > 0 ? 'border-red-200' : ''}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Critical Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stats.criticalEvents.length > 0 ? 'text-red-600' : ''}`}>
                {stats.criticalEvents.length}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
          <CardDescription>Filter audit logs by various criteria</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Row */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search logs by user, action, entity, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Filter Rows */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Branch */}
            <div className="space-y-2">
              <Label>Branch</Label>
              <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                <SelectTrigger>
                  <SelectValue placeholder="All Branches" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Branches</SelectItem>
                  {branches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id.toString()}>
                      {branch.name} ({branch.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* User */}
            <div className="space-y-2">
              <Label>User</Label>
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger>
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
            </div>

            {/* Action */}
            <div className="space-y-2">
              <Label>Action</Label>
              <Select value={selectedAction} onValueChange={setSelectedAction}>
                <SelectTrigger>
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
            </div>

            {/* Entity Type */}
            <div className="space-y-2">
              <Label>Entity Type</Label>
              <Select value={selectedEntityType} onValueChange={setSelectedEntityType}>
                <SelectTrigger>
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
            </div>
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button onClick={handleApplyFilters}>
              <Filter className="w-4 h-4 mr-2" />
              Apply Filters
            </Button>
            <Button variant="outline" onClick={handleResetFilters}>
              <XCircle className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Audit Logs</span>
            <span className="text-sm font-normal text-muted-foreground">
              Showing {logs.length > 0 ? (page - 1) * limit + 1 : 0} - {Math.min(page * limit, total)} of {total.toLocaleString()}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <FileText className="w-12 h-12 mb-4 opacity-50" />
              <p>No audit logs found</p>
              <p className="text-sm">Try adjusting your filters</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-48">Date & Time</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead className="hidden lg:table-cell">Description</TableHead>
                  <TableHead className="text-right w-24">View</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log) => (
                  <TableRow
                    key={log.auditLog.id}
                    className={CRITICAL_ACTIONS.includes(log.auditLog.action) ? 'bg-red-50/50' : ''}
                  >
                    <TableCell className="font-mono text-xs">
                      {new Date(log.auditLog.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-sm">{getUserDisplay(log)}</p>
                          {log.user?.role && (
                            <p className="text-xs text-muted-foreground capitalize">{log.user.role}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{getActionBadge(log.auditLog.action)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getEntityBadge(log.auditLog.entityType)}
                        {log.auditLog.entityId && (
                          <span className="text-xs text-muted-foreground">#{log.auditLog.entityId}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell max-w-xs truncate">
                      {log.auditLog.description || '-'}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(log)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {logs.length > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages || 1}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Active Users Stats */}
      {stats && stats.activeUsers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="w-5 h-5" />
              Most Active Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {stats.activeUsers.slice(0, 5).map((u, idx) => (
                <div key={u.userId} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-sm">
                    {idx + 1}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{u.fullName || u.username || 'Unknown'}</p>
                    <p className="text-xs text-muted-foreground">{u.count} actions</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Audit Log Details - #{selectedLog?.auditLog.id}</DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-6">
              {/* Header Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground text-xs">Date & Time</Label>
                  <p className="font-mono text-sm">{new Date(selectedLog.auditLog.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Action</Label>
                  <div className="mt-1">{getActionBadge(selectedLog.auditLog.action)}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">User</Label>
                  <p className="font-medium">{getUserDisplay(selectedLog)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Role</Label>
                  <p className="capitalize">{selectedLog.user?.role || 'System'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Entity Type</Label>
                  <div className="mt-1">{getEntityBadge(selectedLog.auditLog.entityType)}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground text-xs">Entity ID</Label>
                  <p className="font-mono">{selectedLog.auditLog.entityId || 'N/A'}</p>
                </div>
              </div>

              {/* Description */}
              {selectedLog.auditLog.description && (
                <div>
                  <Label className="text-muted-foreground text-xs">Description</Label>
                  <p className="mt-1">{selectedLog.auditLog.description}</p>
                </div>
              )}

              {/* Old Values */}
              {selectedLog.auditLog.oldValues && (
                <div>
                  <Label className="text-muted-foreground text-xs">Old Values</Label>
                  <pre className="mt-1 p-3 bg-muted rounded-lg text-xs overflow-x-auto">
                    {JSON.stringify(selectedLog.auditLog.oldValues, null, 2)}
                  </pre>
                </div>
              )}

              {/* New Values */}
              {selectedLog.auditLog.newValues && (
                <div>
                  <Label className="text-muted-foreground text-xs">New Values</Label>
                  <pre className="mt-1 p-3 bg-muted rounded-lg text-xs overflow-x-auto">
                    {JSON.stringify(selectedLog.auditLog.newValues, null, 2)}
                  </pre>
                </div>
              )}

              {/* Change Diff */}
              {selectedLog.auditLog.oldValues && selectedLog.auditLog.newValues && (
                <div>
                  <Label className="text-muted-foreground text-xs">Changes</Label>
                  <div className="mt-2 space-y-1">
                    {Object.keys(selectedLog.auditLog.newValues).map((key) => {
                      const oldVal = (selectedLog.auditLog.oldValues as Record<string, unknown>)?.[key]
                      const newVal = (selectedLog.auditLog.newValues as Record<string, unknown>)?.[key]
                      if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
                        return (
                          <div key={key} className="flex items-center gap-2 text-sm">
                            <span className="font-mono text-muted-foreground w-32 truncate">{key}:</span>
                            <span className="line-through text-red-500">{String(oldVal ?? '')}</span>
                            <span className="mx-1">→</span>
                            <span className="text-green-600">{String(newVal ?? '')}</span>
                          </div>
                        )
                      }
                      return null
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
