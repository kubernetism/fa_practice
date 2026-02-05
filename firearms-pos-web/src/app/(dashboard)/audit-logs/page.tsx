'use client'

import { useState } from 'react'
import {
  Shield,
  Filter,
  Activity,
  AlertTriangle,
  Plus,
  Trash2,
  Eye,
  LogIn,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
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

const actions = ['create', 'update', 'delete', 'login', 'logout', 'void', 'refund', 'adjustment', 'transfer', 'export', 'view']
const entityTypes = ['user', 'branch', 'category', 'product', 'inventory', 'customer', 'supplier', 'sale', 'purchase', 'return', 'expense', 'commission', 'setting', 'auth']

const mockLogs = [
  { id: 1, userName: 'Admin User', action: 'create', entityType: 'sale', entityId: 42, description: 'Created sale INV-0042', ipAddress: '192.168.1.10', createdAt: '2026-02-05 14:30' },
  { id: 2, userName: 'Admin User', action: 'update', entityType: 'product', entityId: 15, description: 'Updated stock for 9mm Ammunition', ipAddress: '192.168.1.10', createdAt: '2026-02-05 14:28' },
  { id: 3, userName: 'Cashier Ali', action: 'login', entityType: 'auth', entityId: null, description: 'User logged in', ipAddress: '192.168.1.25', createdAt: '2026-02-05 09:00' },
  { id: 4, userName: 'Admin User', action: 'delete', entityType: 'expense', entityId: 8, description: 'Deleted expense #8', ipAddress: '192.168.1.10', createdAt: '2026-02-04 16:45' },
  { id: 5, userName: 'Manager Khan', action: 'void', entityType: 'sale', entityId: 38, description: 'Voided sale INV-0038 — duplicate entry', ipAddress: '192.168.1.15', createdAt: '2026-02-04 15:20' },
  { id: 6, userName: 'Admin User', action: 'create', entityType: 'customer', entityId: 22, description: 'Created customer record', ipAddress: '192.168.1.10', createdAt: '2026-02-04 11:05' },
  { id: 7, userName: 'Cashier Ali', action: 'create', entityType: 'sale', entityId: 41, description: 'Created sale INV-0041', ipAddress: '192.168.1.25', createdAt: '2026-02-04 10:30' },
  { id: 8, userName: 'Admin User', action: 'export', entityType: 'sale', entityId: null, description: 'Exported sales report (Feb 2026)', ipAddress: '192.168.1.10', createdAt: '2026-02-03 17:00' },
]

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

const actionIcons: Record<string, typeof Plus> = {
  create: Plus,
  update: Activity,
  delete: Trash2,
  login: LogIn,
  void: AlertTriangle,
  view: Eye,
}

const summaryCards = [
  { title: 'Total Logs', value: String(mockLogs.length), icon: Shield, accent: 'text-primary' },
  { title: 'Today', value: String(mockLogs.filter((l) => l.createdAt.startsWith('2026-02-05')).length), icon: Activity, accent: 'text-blue-400' },
  { title: 'Creates', value: String(mockLogs.filter((l) => l.action === 'create').length), icon: Plus, accent: 'text-green-400' },
  { title: 'Destructive', value: String(mockLogs.filter((l) => ['delete', 'void'].includes(l.action)).length), icon: AlertTriangle, accent: 'text-red-400' },
]

export default function AuditLogsPage() {
  const [filterAction, setFilterAction] = useState('all')
  const [filterEntity, setFilterEntity] = useState('all')

  const filtered = mockLogs.filter((l) => {
    if (filterAction !== 'all' && l.action !== filterAction) return false
    if (filterEntity !== 'all' && l.entityType !== filterEntity) return false
    return true
  })

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
              {filtered.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="text-sm text-muted-foreground font-mono">{log.createdAt}</TableCell>
                  <TableCell className="text-sm font-medium">{log.userName}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`text-[10px] capitalize ${actionColors[log.action]}`}>
                      {log.action}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px] capitalize">
                      {log.entityType}
                      {log.entityId && <span className="ml-1">#{log.entityId}</span>}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground max-w-[300px] truncate">{log.description}</TableCell>
                  <TableCell className="text-sm font-mono text-muted-foreground">{log.ipAddress}</TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
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
