'use client'

import { useState, useEffect } from 'react'
import {
  Ticket,
  Plus,
  Filter,
  Copy,
  Trash2,
  ToggleLeft,
  DollarSign,
  CheckCircle2,
  Tag,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  getVouchers,
  getVoucherSummary,
  createVoucher,
  toggleVoucher,
  deleteVoucher,
} from '@/actions/vouchers'
import { toast } from 'sonner'

export default function VouchersPage() {
  const [loading, setLoading] = useState(true)
  const [vouchers, setVouchers] = useState<any[]>([])
  const [summary, setSummary] = useState<any>(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountAmount: '',
    expiresAt: '',
  })

  useEffect(() => {
    loadData()
  }, [filterStatus])

  async function loadData() {
    try {
      setLoading(true)
      const [vouchersRes, summaryRes] = await Promise.all([
        getVouchers({
          status: filterStatus !== 'all' ? filterStatus : undefined,
        }),
        getVoucherSummary(),
      ])
      if (vouchersRes.success) {
        setVouchers(vouchersRes.data)
      }
      if (summaryRes.success) {
        setSummary(summaryRes.data)
      }
    } catch (error) {
      console.error('Failed to load vouchers:', error)
      toast.error('Failed to load vouchers')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const res = await createVoucher({
        code: formData.code,
        description: formData.description,
        discountAmount: formData.discountAmount,
        expiresAt: formData.expiresAt,
      })
      if (res.success) {
        toast.success('Voucher created successfully')
        setDialogOpen(false)
        setFormData({
          code: '',
          description: '',
          discountAmount: '',
          expiresAt: '',
        })
        loadData()
      } else {
        toast.error(res.message || 'Failed to create voucher')
      }
    } catch (error) {
      console.error('Failed to create voucher:', error)
      toast.error('Failed to create voucher')
    }
  }

  async function handleToggle(id: number) {
    try {
      const res = await toggleVoucher(id)
      if (res.success) {
        toast.success('Voucher updated')
        loadData()
      }
    } catch (error) {
      console.error('Failed to toggle voucher:', error)
      toast.error('Failed to toggle voucher')
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Are you sure you want to delete this voucher?')) return
    try {
      const res = await deleteVoucher(id)
      if (res.success) {
        toast.success('Voucher deleted')
        loadData()
      }
    } catch (error) {
      console.error('Failed to delete voucher:', error)
      toast.error('Failed to delete voucher')
    }
  }

  function copyCode(code: string) {
    navigator.clipboard.writeText(code)
    toast.success(`Copied: ${code}`)
  }

  const summaryCards = [
    { title: 'Total Vouchers', value: String(summary?.totalVouchers || 0), icon: Ticket, accent: 'text-primary' },
    { title: 'Active', value: String(summary?.activeCount || 0), icon: Tag, accent: 'text-success' },
    { title: 'Used', value: String(summary?.usedCount || 0), icon: CheckCircle2, accent: 'text-muted-foreground' },
    { title: 'Total Value', value: 'Rs. ' + Number(summary?.totalDiscount || 0).toLocaleString(), icon: DollarSign, accent: 'text-primary' },
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Vouchers</h1>
            <p className="text-sm text-muted-foreground mt-1">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Vouchers</h1>
          <p className="text-sm text-muted-foreground mt-1">Create and manage discount voucher codes</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="brass-glow">
              <Plus className="w-4 h-4 mr-2" />
              Create Voucher
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[420px]">
            <DialogHeader>
              <DialogTitle>Create New Voucher</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Voucher Code</Label>
                <Input
                  placeholder="e.g., SAVE5000"
                  className="uppercase"
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                  required
                />
                <p className="text-[11px] text-muted-foreground">Code will be auto-uppercased</p>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input placeholder="What is this voucher for?" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Discount Amount (Rs.)</Label>
                  <Input type="number" placeholder="0" value={formData.discountAmount} onChange={(e) => setFormData({...formData, discountAmount: e.target.value})} required />
                </div>
                <div className="space-y-2">
                  <Label>Expires At</Label>
                  <Input type="date" value={formData.expiresAt} onChange={(e) => setFormData({...formData, expiresAt: e.target.value})} />
                </div>
              </div>
              <Button type="submit" className="w-full brass-glow">Create Voucher</Button>
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
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="used">Used</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
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
                <TableHead>Code</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Discount</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-[120px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vouchers.map((v) => (
                <TableRow key={v.id} className={!v.isActive ? 'opacity-50' : ''}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <code className="text-sm font-bold font-mono bg-primary/10 text-primary px-2 py-0.5 rounded">
                        {v.code}
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => copyCode(v.code)}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{v.description || '-'}</TableCell>
                  <TableCell className="text-right text-sm font-semibold">Rs. {Number(v.discountAmount).toLocaleString()}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {v.expiresAt ? new Date(v.expiresAt).toLocaleDateString() : 'Never'}
                  </TableCell>
                  <TableCell>
                    {v.isUsed ? (
                      <Badge variant="outline" className="text-[10px] bg-muted text-muted-foreground">Used</Badge>
                    ) : v.isActive ? (
                      <Badge variant="outline" className="text-[10px] bg-success/10 text-success border-success/20">Active</Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] bg-muted text-muted-foreground">Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(v.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {!v.isUsed && (
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleToggle(v.id)}>
                          <ToggleLeft className="w-3.5 h-3.5" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(v.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {vouchers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No vouchers found
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
