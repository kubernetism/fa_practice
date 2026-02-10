'use client'

import { useState, useEffect } from 'react'
import { ClipboardList, Plus, Play, Pause, Trash2, ShoppingCart, Clock, CheckCircle2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import {
  getSalesTabs, createSalesTab, holdTab, deleteSalesTab,
} from '@/actions/sales-tabs'
import { toast } from 'sonner'
import { PageLoader } from '@/components/ui/page-loader'

export default function PosTabsPage() {
  const [loading, setLoading] = useState(true)
  const [tabs, setTabs] = useState<any[]>([])
  const [filterStatus, setFilterStatus] = useState('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [formData, setFormData] = useState({ tabName: '', customerName: '', branchId: '' })

  useEffect(() => { loadData() }, [filterStatus])

  async function loadData() {
    try {
      setLoading(true)
      const res = await getSalesTabs({
        status: filterStatus !== 'all' ? filterStatus : undefined,
      })
      if (res.success) setTabs(res.data)
    } catch {
      toast.error('Failed to load tabs')
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    try {
      const res = await createSalesTab({
        branchId: Number(formData.branchId) || 1,
        notes: formData.customerName || undefined,
      })
      if (res.success) {
        toast.success('Tab created')
        setDialogOpen(false)
        setFormData({ tabName: '', customerName: '', branchId: '' })
        loadData()
      } else {
        toast.error('message' in res ? (res as any).message : 'Failed to create tab')
      }
    } catch {
      toast.error('Failed to create tab')
    }
  }

  async function handleHold(id: number) {
    try {
      const res = await holdTab(id)
      if (res.success) { toast.success('Tab put on hold'); loadData() }
    } catch { toast.error('Failed to hold tab') }
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this tab?')) return
    try {
      const res = await deleteSalesTab(id)
      if (res.success) { toast.success('Tab deleted'); loadData() }
    } catch { toast.error('Failed to delete tab') }
  }

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      open: 'bg-success/10 text-success border-success/20',
      on_hold: 'bg-warning/10 text-warning border-warning/20',
      closed: 'bg-muted text-muted-foreground',
    }
    return <Badge variant="outline" className={`text-[10px] ${styles[status] || ''}`}>{status.replace('_', ' ')}</Badge>
  }

  const counts = {
    total: tabs.length,
    open: tabs.filter(t => t.status === 'open').length,
    onHold: tabs.filter(t => t.status === 'on_hold').length,
    closed: tabs.filter(t => t.status === 'closed').length,
  }

  const summaryCards = [
    { title: 'Total Tabs', value: String(counts.total), icon: ClipboardList, accent: 'text-primary' },
    { title: 'Open', value: String(counts.open), icon: Play, accent: 'text-success' },
    { title: 'On Hold', value: String(counts.onHold), icon: Pause, accent: 'text-warning' },
    { title: 'Closed', value: String(counts.closed), icon: CheckCircle2, accent: 'text-muted-foreground' },
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">POS Tabs</h1>
        <PageLoader />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">POS Tabs</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage open orders and sales tabs</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="brass-glow"><Plus className="w-4 h-4 mr-2" />New Tab</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[420px]">
            <DialogHeader><DialogTitle>Create Sales Tab</DialogTitle></DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Notes (Optional)</Label>
                <Input placeholder="e.g., Walk-in customer, Table 1" value={formData.customerName} onChange={(e) => setFormData({ ...formData, customerName: e.target.value })} />
              </div>
              <Button type="submit" className="w-full brass-glow">Create Tab</Button>
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
            <Clock className="w-4 h-4 text-muted-foreground" />
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="on_hold">On Hold</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
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
                <TableHead>Tab #</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-[120px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tabs.map((tab) => (
                <TableRow key={tab.id}>
                  <TableCell className="font-medium">{tab.tabNumber}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{tab.notes || '-'}</TableCell>
                  <TableCell>{statusBadge(tab.status)}</TableCell>
                  <TableCell className="text-right font-semibold">Rs. {Number(tab.finalAmount || 0).toLocaleString()}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{new Date(tab.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {tab.status === 'open' && (
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleHold(tab.id)} title="Put on hold">
                          <Pause className="w-3.5 h-3.5" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(tab.id)} title="Delete">
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {tabs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No tabs found</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
