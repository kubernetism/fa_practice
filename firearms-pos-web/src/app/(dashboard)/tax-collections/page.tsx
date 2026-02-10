'use client'

import { useState, useEffect } from 'react'
import { Receipt, DollarSign, TrendingUp, Calendar } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { getTaxSummary, getTaxReport } from '@/actions/tax-collections'
import { toast } from 'sonner'
import { PageLoader } from '@/components/ui/page-loader'

export default function TaxCollectionsPage() {
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState<any>(null)
  const [report, setReport] = useState<any>(null)
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date(); d.setMonth(d.getMonth() - 1)
    return d.toISOString().slice(0, 10)
  })
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().slice(0, 10))

  useEffect(() => { loadData() }, [dateFrom, dateTo])

  async function loadData() {
    try {
      setLoading(true)
      const [summaryRes, reportRes] = await Promise.all([
        getTaxSummary(),
        getTaxReport(dateFrom, dateTo),
      ])
      if (summaryRes.success) setSummary(summaryRes.data)
      if (reportRes.success) setReport(reportRes.data)
    } catch {
      toast.error('Failed to load tax data')
    } finally {
      setLoading(false)
    }
  }

  const summaryCards = [
    { title: 'Total Tax Collected', value: 'Rs. ' + Number(summary?.totalTax || 0).toLocaleString(), icon: DollarSign, accent: 'text-primary' },
    { title: 'Taxable Sales', value: 'Rs. ' + Number(summary?.taxableSales || 0).toLocaleString(), icon: TrendingUp, accent: 'text-success' },
    { title: 'Tax-Free Sales', value: 'Rs. ' + Number(summary?.nonTaxableSales || 0).toLocaleString(), icon: Receipt, accent: 'text-muted-foreground' },
    { title: 'Avg Tax Rate', value: Number(summary?.avgTaxRate || 0).toFixed(2) + '%', icon: Calendar, accent: 'text-primary' },
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Tax Collections</h1>
        <PageLoader />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Tax Collections</h1>
        <p className="text-sm text-muted-foreground mt-1">Tax collection summary and reports</p>
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
          <div className="flex items-center gap-4">
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
          <div className="p-4 border-b">
            <h3 className="font-semibold">Monthly Tax Breakdown</h3>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Period</TableHead>
                <TableHead className="text-right">Taxable Sales</TableHead>
                <TableHead className="text-right">Tax Collected</TableHead>
                <TableHead className="text-right">Avg Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {report?.monthlyBreakdown?.map((row: any, i: number) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{row.period}</TableCell>
                  <TableCell className="text-right">Rs. {Number(row.taxableSales || 0).toLocaleString()}</TableCell>
                  <TableCell className="text-right font-semibold">Rs. {Number(row.taxCollected || 0).toLocaleString()}</TableCell>
                  <TableCell className="text-right">{Number(row.avgRate || 0).toFixed(2)}%</TableCell>
                </TableRow>
              )) || (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No tax data found</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
