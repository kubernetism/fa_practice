'use client'

import { useState } from 'react'
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

const mockPnL = {
  revenue: '3200000',
  costOfGoods: '1800000',
  grossProfit: '1400000',
  expenses: '450000',
  netProfit: '950000',
}

const mockBalanceSheet = {
  assets: '1835000',
  liabilities: '120000',
  equity: '1715000',
}

const mockSalesReport = {
  totalSales: '3200000',
  totalDiscount: '95000',
  totalTax: '280000',
  saleCount: 142,
  avgSale: '22535',
}

const mockTopProducts = [
  { name: 'Glock 19 Gen5', code: 'GLK-19G5', sellingPrice: '185000', costPrice: '145000' },
  { name: '9mm Luger 50rd', code: 'AMM-9MM50', sellingPrice: '4500', costPrice: '3200' },
  { name: 'AR-15 Complete Upper', code: 'AR15-UPR', sellingPrice: '120000', costPrice: '85000' },
  { name: 'Cleaning Kit Pro', code: 'CLN-PRO', sellingPrice: '3500', costPrice: '1800' },
  { name: 'Tactical Holster', code: 'HOL-TAC', sellingPrice: '8500', costPrice: '4200' },
]

const summaryCards = [
  { title: 'Revenue', value: 'Rs. 3.2M', icon: TrendingUp, accent: 'text-success', trend: '+12%' },
  { title: 'Net Profit', value: 'Rs. 950K', icon: DollarSign, accent: 'text-primary', trend: '+8%' },
  { title: 'Expenses', value: 'Rs. 450K', icon: TrendingDown, accent: 'text-orange-400', trend: '-3%' },
  { title: 'Sales Count', value: '142', icon: Activity, accent: 'text-blue-400', trend: '+15%' },
]

export default function ReportsPage() {
  const [dateFrom, setDateFrom] = useState('2026-02-01')
  const [dateTo, setDateTo] = useState('2026-02-28')

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
            <Button variant="outline" size="sm">Apply</Button>
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
                    <TableCell className="text-right text-sm font-semibold text-success">Rs. {Number(mockPnL.revenue).toLocaleString()}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-sm font-medium">Cost of Goods Sold</TableCell>
                    <TableCell className="text-right text-sm font-semibold text-red-400">(Rs. {Number(mockPnL.costOfGoods).toLocaleString()})</TableCell>
                  </TableRow>
                  <TableRow className="bg-muted/30">
                    <TableCell className="text-sm font-bold">Gross Profit</TableCell>
                    <TableCell className="text-right text-sm font-bold">Rs. {Number(mockPnL.grossProfit).toLocaleString()}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-sm font-medium">Operating Expenses</TableCell>
                    <TableCell className="text-right text-sm font-semibold text-red-400">(Rs. {Number(mockPnL.expenses).toLocaleString()})</TableCell>
                  </TableRow>
                  <TableRow className="bg-primary/5 border-t-2 border-primary/20">
                    <TableCell className="text-sm font-bold text-primary">Net Profit</TableCell>
                    <TableCell className="text-right text-sm font-bold text-primary">Rs. {Number(mockPnL.netProfit).toLocaleString()}</TableCell>
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
                  <p className="text-2xl font-bold text-blue-400">Rs. {Number(mockBalanceSheet.assets).toLocaleString()}</p>
                </div>
                <div className="text-center p-6 rounded-lg bg-red-500/5 border border-red-500/20">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">Total Liabilities</p>
                  <p className="text-2xl font-bold text-red-400">Rs. {Number(mockBalanceSheet.liabilities).toLocaleString()}</p>
                </div>
                <div className="text-center p-6 rounded-lg bg-green-500/5 border border-green-500/20">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">Owner&apos;s Equity</p>
                  <p className="text-2xl font-bold text-green-400">Rs. {Number(mockBalanceSheet.equity).toLocaleString()}</p>
                </div>
              </div>
              <div className="mt-4 p-3 rounded-lg bg-muted/30 text-center">
                <p className="text-xs text-muted-foreground">
                  Assets ({Number(mockBalanceSheet.assets).toLocaleString()}) = Liabilities ({Number(mockBalanceSheet.liabilities).toLocaleString()}) + Equity ({Number(mockBalanceSheet.equity).toLocaleString()})
                  {Number(mockBalanceSheet.assets) === Number(mockBalanceSheet.liabilities) + Number(mockBalanceSheet.equity)
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
                    <TableCell className="text-right text-sm font-semibold">Rs. {Number(mockSalesReport.totalSales).toLocaleString()}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-sm font-medium">Total Discounts</TableCell>
                    <TableCell className="text-right text-sm font-semibold text-orange-400">(Rs. {Number(mockSalesReport.totalDiscount).toLocaleString()})</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-sm font-medium">Total Tax Collected</TableCell>
                    <TableCell className="text-right text-sm font-semibold">Rs. {Number(mockSalesReport.totalTax).toLocaleString()}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-sm font-medium">Number of Sales</TableCell>
                    <TableCell className="text-right text-sm font-semibold">{mockSalesReport.saleCount}</TableCell>
                  </TableRow>
                  <TableRow className="bg-primary/5">
                    <TableCell className="text-sm font-bold text-primary">Average Sale Value</TableCell>
                    <TableCell className="text-right text-sm font-bold text-primary">Rs. {Number(mockSalesReport.avgSale).toLocaleString()}</TableCell>
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
                  {mockTopProducts.map((p, i) => {
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
                  <p className="text-2xl font-bold">Rs. {Number(mockSalesReport.totalSales).toLocaleString()}</p>
                </div>
                <div className="p-6 rounded-lg bg-primary/5 border border-primary/20">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">Sales Tax Collected</p>
                  <p className="text-2xl font-bold text-primary">Rs. {Number(mockSalesReport.totalTax).toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
