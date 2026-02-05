'use client'

import { useState } from 'react'
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
import { toast } from 'sonner'

const mockVouchers = [
  { id: 1, code: 'WELCOME2026', description: 'New customer welcome discount', discountAmount: '2000', expiresAt: '2026-03-31', isUsed: false, isActive: true, createdAt: '2026-02-01' },
  { id: 2, code: 'LOYALTY500', description: 'Loyalty reward voucher', discountAmount: '500', expiresAt: '2026-02-28', isUsed: true, usedAt: '2026-02-03', isActive: true, createdAt: '2026-01-15' },
  { id: 3, code: 'BULK10K', description: 'Bulk purchase discount', discountAmount: '10000', expiresAt: '2026-06-30', isUsed: false, isActive: true, createdAt: '2026-02-05' },
  { id: 4, code: 'REFUND1K', description: 'Service recovery voucher', discountAmount: '1000', expiresAt: null, isUsed: false, isActive: false, createdAt: '2026-01-20' },
  { id: 5, code: 'SPRING5K', description: 'Spring sale promotion', discountAmount: '5000', expiresAt: '2026-04-30', isUsed: false, isActive: true, createdAt: '2026-02-04' },
]

const summaryCards = [
  { title: 'Total Vouchers', value: String(mockVouchers.length), icon: Ticket, accent: 'text-primary' },
  { title: 'Active', value: String(mockVouchers.filter((v) => v.isActive && !v.isUsed).length), icon: Tag, accent: 'text-success' },
  { title: 'Used', value: String(mockVouchers.filter((v) => v.isUsed).length), icon: CheckCircle2, accent: 'text-muted-foreground' },
  { title: 'Total Value', value: 'Rs. ' + mockVouchers.reduce((s, v) => s + Number(v.discountAmount), 0).toLocaleString(), icon: DollarSign, accent: 'text-primary' },
]

export default function VouchersPage() {
  const [filterStatus, setFilterStatus] = useState('all')

  const filtered = mockVouchers.filter((v) => {
    if (filterStatus === 'active') return v.isActive && !v.isUsed
    if (filterStatus === 'used') return v.isUsed
    if (filterStatus === 'inactive') return !v.isActive
    return true
  })

  function copyCode(code: string) {
    navigator.clipboard.writeText(code)
    toast.success(`Copied: ${code}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Vouchers</h1>
          <p className="text-sm text-muted-foreground mt-1">Create and manage discount voucher codes</p>
        </div>
        <Dialog>
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
            <form className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Voucher Code</Label>
                <Input placeholder="e.g., SAVE5000" className="uppercase" />
                <p className="text-[11px] text-muted-foreground">Code will be auto-uppercased</p>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input placeholder="What is this voucher for?" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Discount Amount (Rs.)</Label>
                  <Input type="number" placeholder="0" />
                </div>
                <div className="space-y-2">
                  <Label>Expires At</Label>
                  <Input type="date" />
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
              {filtered.map((v) => (
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
                  <TableCell className="text-sm text-muted-foreground">{v.description}</TableCell>
                  <TableCell className="text-right text-sm font-semibold">Rs. {Number(v.discountAmount).toLocaleString()}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {v.expiresAt || 'Never'}
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
                  <TableCell className="text-sm text-muted-foreground">{v.createdAt}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {!v.isUsed && (
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <ToggleLeft className="w-3.5 h-3.5" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive">
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
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
