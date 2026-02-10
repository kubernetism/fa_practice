'use client'

import { useState, useEffect } from 'react'
import { Shield, Download, Users, Activity } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  getAuditLogs, getAuditLogSummary, getAuditLogsByUser,
  getAuditLogsByEntity, getAuditLogsByDateRange, exportAuditLogs,
} from '@/actions/audit-logs'
import { toast } from 'sonner'
import { PageLoader } from '@/components/ui/page-loader'

export default function AuditReportsPage() {
  const [loading, setLoading] = useState(true)
  const [logs, setLogs] = useState<any[]>([])
  const [summary, setSummary] = useState<any>(null)
  const [filterAction, setFilterAction] = useState('all')
  const [filterEntity, setFilterEntity] = useState('all')
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date(); d.setDate(d.getDate() - 7)
    return d.toISOString().slice(0, 10)
  })
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().slice(0, 10))

  useEffect(() => { loadData() }, [filterAction, filterEntity, dateFrom, dateTo])

  async function loadData() {
    try {
      setLoading(true)
      const [logsRes, summaryRes] = await Promise.all([
        getAuditLogs({
          action: filterAction !== 'all' ? filterAction : undefined,
          entityType: filterEntity !== 'all' ? filterEntity : undefined,
          dateFrom,
          dateTo,
        }),
        getAuditLogSummary(),
      ])
      if (logsRes.success) setLogs(logsRes.data)
      if (summaryRes.success) setSummary(summaryRes.data)
    } catch {
      toast.error('Failed to load audit logs')
    } finally {
      setLoading(false)
    }
  }

  async function handleExport() {
    try {
      const res = await exportAuditLogs({ dateFrom, dateTo })
      if (res.success) {
        const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `audit-logs-${dateFrom}-to-${dateTo}.json`
        a.click()
        URL.revokeObjectURL(url)
        toast.success('Audit logs exported')
      }
    } catch {
      toast.error('Failed to export')
    }
  }

  const actionBadge = (action: string) => {
    const styles: Record<string, string> = {
      create: 'bg-success/10 text-success border-success/20',
      update: 'bg-primary/10 text-primary border-primary/20',
      delete: 'bg-destructive/10 text-destructive border-destructive/20',
      login: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      logout: 'bg-muted text-muted-foreground',
      void: 'bg-destructive/10 text-destructive border-destructive/20',
      refund: 'bg-warning/10 text-warning border-warning/20',
      adjustment: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    }
    return <Badge variant="outline" className={`text-[10px] ${styles[action] || ''}`}>{action}</Badge>
  }

  const summaryCards = [
    { title: 'Total Logs', value: String(summary?.totalLogs || 0), icon: Shield, accent: 'text-primary' },
    { title: 'Today', value: String(summary?.todayCount || 0), icon: Activity, accent: 'text-success' },
    { title: 'Creates', value: String(summary?.createCount || 0), icon: Users, accent: 'text-primary' },
    { title: 'Deletes', value: String(summary?.deleteCount || 0), icon: Shield, accent: 'text-destructive' },
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Audit Reports</h1>
        <PageLoader />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Audit Reports</h1>
          <p className="text-sm text-muted-foreground mt-1">System activity and security audit trail</p>
        </div>
        <Button variant="outline" onClick={handleExport}>
          <Download className="w-4 h-4 mr-2" />Export
        </Button>
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
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-1">
              <Label className="text-xs">Action</Label>
              <Select value={filterAction} onValueChange={setFilterAction}>
                <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="create">Create</SelectItem>
                  <SelectItem value="update">Update</SelectItem>
                  <SelectItem value="delete">Delete</SelectItem>
                  <SelectItem value="login">Login</SelectItem>
                  <SelectItem value="logout">Logout</SelectItem>
                  <SelectItem value="void">Void</SelectItem>
                  <SelectItem value="refund">Refund</SelectItem>
                  <SelectItem value="adjustment">Adjustment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Entity</Label>
              <Select value={filterEntity} onValueChange={setFilterEntity}>
                <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="sale">Sale</SelectItem>
                  <SelectItem value="purchase">Purchase</SelectItem>
                  <SelectItem value="product">Product</SelectItem>
                  <SelectItem value="customer">Customer</SelectItem>
                  <SelectItem value="inventory">Inventory</SelectItem>
                  <SelectItem value="expense">Expense</SelectItem>
                  <SelectItem value="return">Return</SelectItem>
                  <SelectItem value="auth">Auth</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">From</Label>
              <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-[160px]" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">To</Label>
              <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-[160px]" />
            </div>
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
                <TableHead>Entity ID</TableHead>
                <TableHead>Description</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((item) => (
                <TableRow key={item.log.id}>
                  <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(item.log.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-sm">{item.userName || '-'}</TableCell>
                  <TableCell>{actionBadge(item.log.action)}</TableCell>
                  <TableCell className="text-sm">{item.log.entityType}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{item.log.entityId || '-'}</TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">{item.log.description || '-'}</TableCell>
                </TableRow>
              ))}
              {logs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No audit logs found</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
