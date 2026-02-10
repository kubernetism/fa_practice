'use client'

import { useState, useEffect } from 'react'
import {
  Shield,
  Filter,
  Activity,
  AlertTriangle,
  Plus,
  Eye,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
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
import { getAuditLogs, getAuditLogSummary } from '@/actions/audit-logs'
import { toast } from 'sonner'
import { PageLoader } from '@/components/ui/page-loader'

const actions = ['create', 'update', 'delete', 'login', 'logout', 'void', 'refund', 'adjustment', 'transfer', 'export', 'view']
const entityTypes = ['user', 'branch', 'category', 'product', 'inventory', 'customer', 'supplier', 'sale', 'purchase', 'return', 'expense', 'commission', 'setting', 'auth']

const actionColors: Record<string, string> = {
  create: 'bg-green-500/10 text-green-400 border-green-500/20',
  update: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  delete: 'bg-red-500/10 text-red-400 border-red-500/20',
  login: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  logout: 'bg-muted text-muted-foreground',
  void: 'bg-red-500/10 text-red-400 border-red-500/20',
  refund: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  adjustment: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  transfer: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  export: 'bg-muted text-muted-foreground',
  view: 'bg-muted text-muted-foreground',
}

export default function AuditLogsPage() {
  const [loading, setLoading] = useState(true)
  const [logs, setLogs] = useState<any[]>([])
  const [summary, setSummary] = useState<any>(null)
  const [filterAction, setFilterAction] = useState('all')
  const [filterEntity, setFilterEntity] = useState('all')

  useEffect(() => {
    loadData()
  }, [filterAction, filterEntity])

  async function loadData() {
    try {
      setLoading(true)
      const [logsRes, summaryRes] = await Promise.all([
        getAuditLogs({
          action: filterAction !== 'all' ? filterAction : undefined,
          entityType: filterEntity !== 'all' ? filterEntity : undefined,
        }),
        getAuditLogSummary(),
      ])
      if (logsRes.success) {
        setLogs(logsRes.data)
      }
      if (summaryRes.success) {
        setSummary(summaryRes.data)
      }
    } catch (error) {
      console.error('Failed to load audit logs:', error)
      toast.error('Failed to load audit logs')
    } finally {
      setLoading(false)
    }
  }

  const summaryCards = [
    { title: 'Total Logs', value: String(summary?.totalLogs || 0), icon: Shield, accent: 'text-primary' },
    { title: 'Today', value: String(summary?.todayCount || 0), icon: Activity, accent: 'text-blue-400' },
    { title: 'Creates', value: String(summary?.createCount || 0), icon: Plus, accent: 'text-green-400' },
    { title: 'Destructive', value: String(summary?.deleteCount || 0), icon: AlertTriangle, accent: 'text-red-400' },
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Audit Logs</h1>
          <PageLoader />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Audit Logs</h1>
        <p className="text-sm text-muted-foreground mt-1">Full activity trail for compliance and security</p>
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
          <div className="flex items-center gap-3">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={filterAction} onValueChange={setFilterAction}>
              <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                {actions.map((a) => (
                  <SelectItem key={a} value={a} className="capitalize">{a}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterEntity} onValueChange={setFilterEntity}>
              <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Entities</SelectItem>
                {entityTypes.map((e) => (
                  <SelectItem key={e} value={e} className="capitalize">{e}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>IP Address</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.log.id}>
                  <TableCell className="text-sm text-muted-foreground font-mono">
                    {new Date(log.log.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-sm font-medium">{log.userName || 'Unknown'}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`text-[10px] capitalize ${actionColors[log.log.action] || 'bg-muted text-muted-foreground'}`}>
                      {log.log.action}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px] capitalize">
                      {log.log.entityType}
                      {log.log.entityId && <span className="ml-1">#{log.log.entityId}</span>}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-[300px] truncate">{log.log.description || '-'}</TableCell>
                  <TableCell className="text-sm font-mono text-muted-foreground">{log.log.ipAddress || '-'}</TableCell>
                </TableRow>
              ))}
              {logs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No audit logs found
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
