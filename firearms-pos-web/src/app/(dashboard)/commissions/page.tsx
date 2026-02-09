'use client'

import { useState, useEffect } from 'react'
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
import {
  getCommissions,
  getCommissionSummary,
  approveCommission,
  payCommission,
} from '@/actions/commissions'

type Commission = {
  commission: {
    id: number
    saleId: number
    commissionType: string
    baseAmount: string
    rate: string
    commissionAmount: string
    status: string
    createdAt: Date
  }
  userName: string | null
  referralName: string | null
}

type Summary = {
  totalEarned: string
  totalPending: string
  totalPaid: string
  totalCount: number
}

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
  const [commissions, setCommissions] = useState<Commission[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [filterStatus, filterType])

  async function loadData() {
    setLoading(true)
    try {
      const [commissionsRes, summaryRes] = await Promise.all([
        getCommissions({
          status: filterStatus !== 'all' ? filterStatus : undefined,
          type: filterType !== 'all' ? filterType : undefined,
        }),
        getCommissionSummary(),
      ])

      if (commissionsRes.success) {
        setCommissions(commissionsRes.data)
      }
      if (summaryRes.success) {
        setSummary(summaryRes.data)
      }
    } catch (error) {
      console.error('Failed to load commissions:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleApprove(id: number) {
    try {
      await approveCommission(id)
      loadData()
    } catch (error) {
      console.error('Failed to approve commission:', error)
    }
  }

  async function handlePay(id: number) {
    try {
      await payCommission(id)
      loadData()
    } catch (error) {
      console.error('Failed to pay commission:', error)
    }
  }

  const avgRate =
    commissions.length > 0
      ? (
          commissions.reduce((sum, c) => sum + Number(c.commission.rate), 0) /
          commissions.length
        ).toFixed(2)
      : '0.00'

  const summaryCards = [
    {
      title: 'Total Earned',
      value: `Rs. ${Number(summary?.totalEarned || 0).toLocaleString()}`,
      icon: DollarSign,
      accent: 'text-primary',
    },
    {
      title: 'Pending',
      value: `Rs. ${Number(summary?.totalPending || 0).toLocaleString()}`,
      icon: Clock,
      accent: 'text-warning',
    },
    {
      title: 'Paid Out',
      value: `Rs. ${Number(summary?.totalPaid || 0).toLocaleString()}`,
      icon: Banknote,
      accent: 'text-success',
    },
    {
      title: 'Avg Rate',
      value: `${avgRate}%`,
      icon: Percent,
      accent: 'text-muted-foreground',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Commissions</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Track employee and referral commissions
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card) => (
          <Card key={card.title} className="card-tactical">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {card.title}
                  </p>
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
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
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
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : (
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
                {commissions.map((c) => (
                  <TableRow key={c.commission.id}>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(c.commission.createdAt).toLocaleDateString('en-PK')}
                    </TableCell>
                    <TableCell className="text-sm font-mono">
                      #{c.commission.saleId}
                    </TableCell>
                    <TableCell className="text-sm font-medium">
                      {c.userName || c.referralName}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-[10px] capitalize ${
                          typeColors[c.commission.commissionType]
                        }`}
                      >
                        {c.commission.commissionType}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-sm text-muted-foreground">
                      Rs. {Number(c.commission.baseAmount).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      {c.commission.rate}%
                    </TableCell>
                    <TableCell className="text-right text-sm font-semibold">
                      Rs. {Number(c.commission.commissionAmount).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-[10px] ${statusColors[c.commission.status]}`}
                      >
                        {c.commission.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {c.commission.status === 'pending' && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => handleApprove(c.commission.id)}
                          >
                            <Check className="w-3 h-3 mr-1" />
                            Approve
                          </Button>
                        )}
                        {c.commission.status === 'approved' && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => handlePay(c.commission.id)}
                          >
                            <Banknote className="w-3 h-3 mr-1" />
                            Pay
                          </Button>
                        )}
                        {c.commission.status === 'paid' && (
                          <CheckCircle2 className="w-4 h-4 text-success" />
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {commissions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      No commissions found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
