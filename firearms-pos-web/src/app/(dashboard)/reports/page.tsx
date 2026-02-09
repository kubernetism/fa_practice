'use client'

import { useState, useEffect } from 'react'
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  FileText,
  Calendar,
  Download,
  PieChart,
  Activity,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  getProfitAndLoss,
  getBalanceSheet,
  getSalesReport,
  getTopProducts,
  getTaxReport,
} from '@/actions/reports'

export default function ReportsPage() {
  const [dateFrom, setDateFrom] = useState('2026-02-01')
  const [dateTo, setDateTo] = useState('2026-02-28')
  const [loading, setLoading] = useState(true)
  const [pnlData, setPnlData] = useState<any>(null)
  const [balanceData, setBalanceData] = useState<any>(null)
  const [salesData, setSalesData] = useState<any>(null)
  const [topProducts, setTopProducts] = useState<any[]>([])
  const [taxData, setTaxData] = useState<any>(null)

  useEffect(() => {
    loadReports()
  }, [])

  async function loadReports() {
    setLoading(true)
    try {
      const [pnl, balance, sales, products, tax] = await Promise.all([
        getProfitAndLoss(dateFrom, dateTo),
        getBalanceSheet(),
        getSalesReport(dateFrom, dateTo),
        getTopProducts(5),
        getTaxReport(dateFrom, dateTo),
      ])

      if (pnl.success) setPnlData(pnl.data)
      if (balance.success) setBalanceData(balance.data)
      if (sales.success) setSalesData(sales.data)
      if (products.success) setTopProducts(products.data)
      if (tax.success) setTaxData(tax.data)
    } catch (error) {
      console.error('Failed to load reports:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleApply() {
    loadReports()
  }

  const summaryCards = [
    {
      title: 'Revenue',
      value: `Rs. ${salesData ? (Number(salesData.totalSales) / 1000000).toFixed(1) : 0}M`,
      icon: TrendingUp,
      accent: 'text-success',
      trend: '+12%',
    },
    {
      title: 'Net Profit',
      value: `Rs. ${pnlData ? (Number(pnlData.netProfit) / 1000).toFixed(0) : 0}K`,
      icon: DollarSign,
      accent: 'text-primary',
      trend: '+8%',
    },
    {
      title: 'Expenses',
      value: `Rs. ${pnlData ? (Number(pnlData.expenses) / 1000).toFixed(0) : 0}K`,
      icon: TrendingDown,
      accent: 'text-orange-400',
      trend: '-3%',
    },
    {
      title: 'Sales Count',
      value: String(salesData?.saleCount || 0),
      icon: Activity,
      accent: 'text-blue-400',
      trend: '+15%',
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Loading reports...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
          <p className="text-sm text-muted-foreground mt-1">Business analytics, P&L, balance sheet and tax reports</p>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <div className="flex items-center gap-2">
              <Label className="text-sm">From</Label>
              <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-[160px]" />
            </div>
            <div className="flex items-center gap-2">
              <Label className="text-sm">To</Label>
              <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-[160px]" />
            </div>
            <Button variant="outline" size="sm" onClick={handleApply}>Apply</Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card) => (
          <Card key={card.title} className="card-tactical">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{card.title}</p>
                  <p className="text-2xl font-bold tracking-tight">{card.value}</p>
                  <p className={`text-xs font-medium ${card.trend.startsWith('+') ? 'text-success' : 'text-orange-400'}`}>
                    {card.trend} vs last month
                  </p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <card.icon className={`w-5 h-5 ${card.accent}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="pnl" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pnl">Profit & Loss</TabsTrigger>
          <TabsTrigger value="balance">Balance Sheet</TabsTrigger>
          <TabsTrigger value="sales">Sales Report</TabsTrigger>
          <TabsTrigger value="products">Top Products</TabsTrigger>
          <TabsTrigger value="tax">Tax Report</TabsTrigger>
        </TabsList>

        <TabsContent value="pnl">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Profit & Loss Statement
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="text-sm font-medium">Revenue</TableCell>
                    <TableCell className="text-right text-sm font-semibold text-success">
                      Rs. {Number(pnlData?.revenue || 0).toLocaleString()}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-sm font-medium">Cost of Goods Sold</TableCell>
                    <TableCell className="text-right text-sm font-semibold text-red-400">
                      (Rs. {Number(pnlData?.costOfGoods || 0).toLocaleString()})
                    </TableCell>
                  </TableRow>
                  <TableRow className="bg-muted/30">
                    <TableCell className="text-sm font-bold">Gross Profit</TableCell>
                    <TableCell className="text-right text-sm font-bold">
                      Rs. {(Number(pnlData?.revenue || 0) - Number(pnlData?.costOfGoods || 0)).toLocaleString()}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-sm font-medium">Operating Expenses</TableCell>
                    <TableCell className="text-right text-sm font-semibold text-red-400">
                      (Rs. {Number(pnlData?.expenses || 0).toLocaleString()})
                    </TableCell>
                  </TableRow>
                  <TableRow className="bg-primary/5 border-t-2 border-primary/20">
                    <TableCell className="text-sm font-bold text-primary">Net Profit</TableCell>
                    <TableCell className="text-right text-sm font-bold text-primary">
                      Rs. {Number(pnlData?.netProfit || 0).toLocaleString()}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="balance">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <PieChart className="w-5 h-5 text-primary" />
                Balance Sheet
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-6">
                <div className="text-center p-6 rounded-lg bg-blue-500/5 border border-blue-500/20">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">Total Assets</p>
                  <p className="text-2xl font-bold text-blue-400">Rs. {Number(balanceData?.assets || 0).toLocaleString()}</p>
                </div>
                <div className="text-center p-6 rounded-lg bg-red-500/5 border border-red-500/20">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">Total Liabilities</p>
                  <p className="text-2xl font-bold text-red-400">Rs. {Number(balanceData?.liabilities || 0).toLocaleString()}</p>
                </div>
                <div className="text-center p-6 rounded-lg bg-green-500/5 border border-green-500/20">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">Owner&apos;s Equity</p>
                  <p className="text-2xl font-bold text-green-400">Rs. {Number(balanceData?.equity || 0).toLocaleString()}</p>
                </div>
              </div>
              <div className="mt-4 p-3 rounded-lg bg-muted/30 text-center">
                <p className="text-xs text-muted-foreground">
                  Assets ({Number(balanceData?.assets || 0).toLocaleString()}) = Liabilities ({Number(balanceData?.liabilities || 0).toLocaleString()}) + Equity ({Number(balanceData?.equity || 0).toLocaleString()})
                  {Number(balanceData?.assets || 0) === Number(balanceData?.liabilities || 0) + Number(balanceData?.equity || 0)
                    ? <Badge className="ml-2 text-[10px] bg-success/10 text-success border-success/20" variant="outline">Balanced</Badge>
                    : <Badge className="ml-2 text-[10px] bg-red-500/10 text-red-400 border-red-500/20" variant="outline">Imbalanced</Badge>
                  }
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sales">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Sales Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell className="text-sm font-medium">Total Sales</TableCell>
                    <TableCell className="text-right text-sm font-semibold">
                      Rs. {Number(salesData?.totalSales || 0).toLocaleString()}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-sm font-medium">Total Discounts</TableCell>
                    <TableCell className="text-right text-sm font-semibold text-orange-400">
                      (Rs. {Number(salesData?.totalDiscount || 0).toLocaleString()})
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-sm font-medium">Total Tax Collected</TableCell>
                    <TableCell className="text-right text-sm font-semibold">
                      Rs. {Number(salesData?.totalTax || 0).toLocaleString()}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-sm font-medium">Number of Sales</TableCell>
                    <TableCell className="text-right text-sm font-semibold">{salesData?.saleCount || 0}</TableCell>
                  </TableRow>
                  <TableRow className="bg-primary/5">
                    <TableCell className="text-sm font-bold text-primary">Average Sale Value</TableCell>
                    <TableCell className="text-right text-sm font-bold text-primary">
                      Rs. {Number(salesData?.avgSale || 0).toLocaleString()}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Top Products
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead className="text-right">Selling Price</TableHead>
                    <TableHead className="text-right">Cost Price</TableHead>
                    <TableHead className="text-right">Margin</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {topProducts.map((p, i) => {
                    const margin = ((Number(p.sellingPrice) - Number(p.costPrice)) / Number(p.sellingPrice) * 100).toFixed(1)
                    return (
                      <TableRow key={p.code}>
                        <TableCell className="text-sm font-bold text-muted-foreground">{i + 1}</TableCell>
                        <TableCell className="text-sm font-medium">{p.name}</TableCell>
                        <TableCell>
                          <code className="text-xs font-mono bg-primary/10 text-primary px-1.5 py-0.5 rounded">{p.code}</code>
                        </TableCell>
                        <TableCell className="text-right text-sm font-semibold">Rs. {Number(p.sellingPrice).toLocaleString()}</TableCell>
                        <TableCell className="text-right text-sm text-muted-foreground">Rs. {Number(p.costPrice).toLocaleString()}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant="outline" className="text-[10px] bg-success/10 text-success border-success/20">
                            {margin}%
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                  {topProducts.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No products found</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tax">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Tax Report
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div className="p-6 rounded-lg bg-primary/5 border border-primary/20">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">Taxable Revenue</p>
                  <p className="text-2xl font-bold">Rs. {Number(taxData?.taxableRevenue || 0).toLocaleString()}</p>
                </div>
                <div className="p-6 rounded-lg bg-primary/5 border border-primary/20">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">Sales Tax Collected</p>
                  <p className="text-2xl font-bold text-primary">Rs. {Number(taxData?.salesTax || 0).toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
