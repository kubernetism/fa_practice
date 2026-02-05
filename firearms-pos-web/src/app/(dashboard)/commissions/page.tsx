'use client'

import { useState } from 'react'
import {
  Percent,
  Filter,
  DollarSign,
  Clock,
  CheckCircle2,
  Check,
  Banknote,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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

const mockCommissions = [
  { id: 1, saleId: 24, userName: 'Kashif Ali', referralName: null, commissionType: 'sale', baseAmount: '85000', rate: '2.50', commissionAmount: '2125', status: 'pending', createdAt: '2026-02-05' },
  { id: 2, saleId: 22, userName: null, referralName: 'Hasan Malik', commissionType: 'referral', baseAmount: '35000', rate: '5.00', commissionAmount: '1750', status: 'approved', createdAt: '2026-02-04' },
  { id: 3, saleId: 20, userName: 'Fahad Ahmed', referralName: null, commissionType: 'sale', baseAmount: '120000', rate: '2.50', commissionAmount: '3000', status: 'paid', createdAt: '2026-02-03' },
  { id: 4, saleId: 18, userName: null, referralName: 'Imran Shah', commissionType: 'referral', baseAmount: '250000', rate: '3.00', commissionAmount: '7500', status: 'pending', createdAt: '2026-02-02' },
  { id: 5, saleId: 15, userName: 'Kashif Ali', referralName: null, commissionType: 'bonus', baseAmount: '500000', rate: '1.00', commissionAmount: '5000', status: 'paid', createdAt: '2026-02-01' },
]

const summaryCards = [
  { title: 'Total Earned', value: 'Rs. 19,375', icon: DollarSign, accent: 'text-primary' },
  { title: 'Pending', value: 'Rs. 11,375', icon: Clock, accent: 'text-warning' },
  { title: 'Paid Out', value: 'Rs. 8,000', icon: Banknote, accent: 'text-success' },
  { title: 'Avg Rate', value: '2.80%', icon: Percent, accent: 'text-muted-foreground' },
]

const statusColors: Record<string, string> = {
  pending: 'bg-warning/10 text-warning border-warning/20',
  approved: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  paid: 'bg-success/10 text-success border-success/20',
  cancelled: 'bg-muted text-muted-foreground border-border',
}

const typeColors: Record<string, string> = {
  sale: 'bg-primary/10 text-primary border-primary/20',
  referral: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  bonus: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
}

export default function CommissionsPage() {
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterType, setFilterType] = useState('all')

  const filtered = mockCommissions.filter((c) => {
    if (filterStatus !== 'all' && c.status !== filterStatus) return false
    if (filterType !== 'all' && c.commissionType !== filterType) return false
    return true
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Commissions</h1>
        <p className="text-sm text-muted-foreground mt-1">Track employee and referral commissions</p>
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
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="sale">Sale</SelectItem>
                <SelectItem value="referral">Referral</SelectItem>
                <SelectItem value="bonus">Bonus</SelectItem>
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
                <TableHead>Date</TableHead>
                <TableHead>Sale #</TableHead>
                <TableHead>Earned By</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Base Amount</TableHead>
                <TableHead className="text-right">Rate</TableHead>
                <TableHead className="text-right">Commission</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="text-sm text-muted-foreground">{c.createdAt}</TableCell>
                  <TableCell className="text-sm font-mono">#{c.saleId}</TableCell>
                  <TableCell className="text-sm font-medium">
                    {c.userName || c.referralName}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`text-[10px] capitalize ${typeColors[c.commissionType]}`}>
                      {c.commissionType}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-sm text-muted-foreground">
                    Rs. {Number(c.baseAmount).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right text-sm">{c.rate}%</TableCell>
                  <TableCell className="text-right text-sm font-semibold">
                    Rs. {Number(c.commissionAmount).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`text-[10px] ${statusColors[c.status]}`}>
                      {c.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {c.status === 'pending' && (
                        <Button variant="outline" size="sm" className="h-7 text-xs">
                          <Check className="w-3 h-3 mr-1" />
                          Approve
                        </Button>
                      )}
                      {c.status === 'approved' && (
                        <Button variant="outline" size="sm" className="h-7 text-xs">
                          <Banknote className="w-3 h-3 mr-1" />
                          Pay
                        </Button>
                      )}
                      {c.status === 'paid' && (
                        <CheckCircle2 className="w-4 h-4 text-success" />
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
