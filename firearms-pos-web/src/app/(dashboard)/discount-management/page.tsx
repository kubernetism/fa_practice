'use client'

import { useState, useEffect } from 'react'
import { Percent, DollarSign, TrendingDown, BarChart3 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { getDiscountSummary, getDiscountReport, analyzeDiscountImpact } from '@/actions/discount-management'
import { toast } from 'sonner'
import { PageLoader } from '@/components/ui/page-loader'

export default function DiscountManagementPage() {
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState<any>(null)
  const [report, setReport] = useState<any>(null)
  const [impact, setImpact] = useState<any>(null)
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date(); d.setMonth(d.getMonth() - 1)
    return d.toISOString().slice(0, 10)
  })
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().slice(0, 10))

  useEffect(() => { loadData() }, [dateFrom, dateTo])

  async function loadData() {
    try {
      setLoading(true)
      const [summaryRes, reportRes, impactRes] = await Promise.all([
        getDiscountSummary(),
        getDiscountReport(dateFrom, dateTo),
        analyzeDiscountImpact(dateFrom, dateTo),
      ])
      if (summaryRes.success) setSummary(summaryRes.data)
      if (reportRes.success) setReport(reportRes.data)
      if (impactRes.success) setImpact(impactRes.data)
    } catch {
      toast.error('Failed to load discount data')
    } finally {
      setLoading(false)
    }
  }

  const summaryCards = [
    { title: 'Total Discounts', value: 'Rs. ' + Number(summary?.totalDiscount || 0).toLocaleString(), icon: Percent, accent: 'text-primary' },
    { title: 'Sales with Discounts', value: String(summary?.discountedSalesCount || 0), icon: DollarSign, accent: 'text-success' },
    { title: 'Avg Discount', value: 'Rs. ' + Number(summary?.avgDiscount || 0).toLocaleString(), icon: TrendingDown, accent: 'text-warning' },
    { title: 'Discount Rate', value: Number(summary?.discountRate || 0).toFixed(1) + '%', icon: BarChart3, accent: 'text-primary' },
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Discount Management</h1>
        <PageLoader />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Discount Management</h1>
        <p className="text-sm text-muted-foreground mt-1">Analyze discounts and their impact on revenue</p>
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

      {impact && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="card-tactical">
            <CardContent className="p-5">
              <h3 className="font-semibold mb-3">Sales with Discounts</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Count</span><span className="font-medium">{impact.withDiscount?.count || 0}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Avg Sale Value</span><span className="font-medium">Rs. {Number(impact.withDiscount?.avgTotal || 0).toLocaleString()}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Avg Discount</span><span className="font-medium">Rs. {Number(impact.withDiscount?.avgDiscount || 0).toLocaleString()}</span></div>
              </div>
            </CardContent>
          </Card>
          <Card className="card-tactical">
            <CardContent className="p-5">
              <h3 className="font-semibold mb-3">Sales without Discounts</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-muted-foreground">Count</span><span className="font-medium">{impact.withoutDiscount?.count || 0}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Avg Sale Value</span><span className="font-medium">Rs. {Number(impact.withoutDiscount?.avgTotal || 0).toLocaleString()}</span></div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardContent className="p-0">
          <div className="p-4 border-b"><h3 className="font-semibold">Daily Discount Breakdown</h3></div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Sales Count</TableHead>
                <TableHead className="text-right">Total Discounted</TableHead>
                <TableHead className="text-right">Total Discount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {report?.dailyBreakdown?.map((row: any, i: number) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{row.date}</TableCell>
                  <TableCell className="text-right">{row.salesCount}</TableCell>
                  <TableCell className="text-right">Rs. {Number(row.totalSales || 0).toLocaleString()}</TableCell>
                  <TableCell className="text-right font-semibold text-destructive">Rs. {Number(row.totalDiscount || 0).toLocaleString()}</TableCell>
                </TableRow>
              )) || (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No discount data found</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
