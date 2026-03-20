import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import {
  FileText,
  Download,
  Loader2,
  TrendingUp,
  Package,
  DollarSign,
  Receipt,
  AlertCircle,
  Shield,
  Calendar,
  FileBarChart,
  CreditCard,
  BarChart3,
  Clock,
  User,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { TimePeriod, Branch, AuditTrailData } from '@shared/types'

function getActionBadge(action: string) {
  const map: Record<string, string> = {
    INSERT: 'bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/20',
    UPDATE: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20',
    DELETE: 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/20',
    CREATE: 'bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/20',
  }
  const cls = map[action.toUpperCase()] ?? 'bg-zinc-500/15 text-zinc-600 dark:text-zinc-400 border-zinc-500/20'
  return (
    <Badge variant="outline" className={`${cls} text-[10px] px-1.5 py-0 font-mono`}>
      {action}
    </Badge>
  )
}

export default function AuditReportsScreen() {
  const { user } = useAuth()
  const [branches, setBranches] = useState<Branch[]>([])
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('monthly')
  const [selectedBranch, setSelectedBranch] = useState<string>('all')
  const [startDate, setStartDate] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
  )
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0])
  const [isGenerating, setIsGenerating] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [reportData, setReportData] = useState<AuditTrailData | null>(null)
  const [error, setError] = useState<string | null>(null)

  if (!user || user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Card className="border-destructive/30 max-w-md">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 rounded-lg bg-destructive/10">
                <AlertCircle className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="font-semibold text-lg">Access Denied</p>
                <p className="text-muted-foreground text-sm">Admin privileges required</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  useEffect(() => {
    fetchBranches()
  }, [])

  useEffect(() => {
    const now = new Date()
    switch (timePeriod) {
      case 'daily':
        setStartDate(now.toISOString().split('T')[0])
        setEndDate(now.toISOString().split('T')[0])
        break
      case 'weekly':
        const weekStart = new Date(now)
        const dayOfWeek = weekStart.getDay()
        const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
        weekStart.setDate(weekStart.getDate() + diff)
        setStartDate(weekStart.toISOString().split('T')[0])
        setEndDate(now.toISOString().split('T')[0])
        break
      case 'monthly':
        setStartDate(new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0])
        setEndDate(new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0])
        break
      case 'yearly':
        setStartDate(new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0])
        setEndDate(new Date(now.getFullYear(), 11, 31).toISOString().split('T')[0])
        break
      case 'all-time':
        setStartDate('2000-01-01')
        setEndDate(now.toISOString().split('T')[0])
        break
    }
  }, [timePeriod])

  const fetchBranches = async () => {
    try {
      const response = await window.api.branches.getAll()
      if (response?.success && response?.data) {
        setBranches(response.data)
      } else if (response?.data) {
        setBranches(response.data)
      } else {
        setBranches([])
      }
    } catch (error) {
      console.error('Failed to fetch branches:', error)
      setBranches([])
    }
  }

  const handleGenerateReport = async () => {
    setIsGenerating(true)
    setError(null)
    setReportData(null)

    try {
      const params: any = { timePeriod, startDate, endDate }
      if (selectedBranch !== 'all') {
        params.branchId = parseInt(selectedBranch)
      }

      const response = await window.api.reports.comprehensiveAudit(params)

      if (response?.success && response?.data) {
        setReportData(response.data)
      } else {
        setError(response?.message || 'Failed to generate audit report')
      }
    } catch (error) {
      console.error('Failed to generate audit report:', error)
      setError(error instanceof Error ? error.message : 'Failed to generate audit report.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownloadPDF = async () => {
    if (!reportData) return

    setIsDownloading(true)
    setError(null)

    try {
      const branchName = selectedBranch === 'all'
        ? 'All Branches'
        : branches.find((b) => b.id.toString() === selectedBranch)?.name || 'Unknown Branch'

      const result = await window.api.reports.exportPDF({
        reportType: 'audit-trail',
        data: reportData,
        filters: { timePeriod, startDate, endDate, branchName },
      })

      if (result?.success && result?.filePath) {
        alert(`Audit Report downloaded!\n\nLocation: ${result.filePath}`)
      } else {
        setError(result?.message || 'Failed to download PDF')
      }
    } catch (error) {
      console.error('Failed to download PDF:', error)
      setError(error instanceof Error ? error.message : 'Failed to download PDF.')
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="flex flex-col h-full p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <FileBarChart className="w-5 h-5 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold leading-tight">Comprehensive Audit Report</h1>
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20">
                <Shield className="w-3 h-3 mr-0.5" />
                Admin
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">Sales, inventory, expenses, and financial audit data</p>
          </div>
        </div>
      </div>

      {/* Filters - Inline Bar */}
      <div className="flex items-end gap-3 flex-wrap">
        <div className="space-y-1">
          <Label className="text-[10px] text-muted-foreground">Period</Label>
          <Select value={timePeriod} onValueChange={(value) => setTimePeriod(value as TimePeriod)}>
            <SelectTrigger className="h-8 w-[120px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
              <SelectItem value="all-time">All Time</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {timePeriod === 'custom' && (
          <>
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">From</Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="h-8 w-[140px] text-xs" />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">To</Label>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="h-8 w-[140px] text-xs" />
            </div>
          </>
        )}

        <div className="space-y-1">
          <Label className="text-[10px] text-muted-foreground">Branch</Label>
          <Select value={selectedBranch} onValueChange={setSelectedBranch}>
            <SelectTrigger className="h-8 w-[160px] text-xs">
              <SelectValue placeholder="All Branches" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Branches</SelectItem>
              {branches.map((branch) => (
                <SelectItem key={branch.id} value={branch.id.toString()}>
                  {branch.code} - {branch.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button size="sm" onClick={handleGenerateReport} disabled={isGenerating} className="h-8">
          {isGenerating ? (
            <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
          ) : (
            <FileText className="h-3.5 w-3.5 mr-1.5" />
          )}
          {isGenerating ? 'Generating...' : 'Generate'}
        </Button>

        {reportData && (
          <Button size="sm" variant="outline" onClick={handleDownloadPDF} disabled={isDownloading} className="h-8">
            {isDownloading ? (
              <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
            ) : (
              <Download className="h-3.5 w-3.5 mr-1.5" />
            )}
            Download PDF
          </Button>
        )}

        <div className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">
          <Calendar className="w-3.5 h-3.5" />
          {startDate} to {endDate}
        </div>
      </div>

      {/* Error */}
      {error && (
        <Card className="border-destructive/30">
          <CardContent className="p-3 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Report Data */}
      {reportData && (
        <div className="flex-1 overflow-auto space-y-4">
          {/* Summary Cards Row */}
          <div className="grid grid-cols-4 gap-3">
            <Card className="border-green-500/20">
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">Total Sales</span>
                  <TrendingUp className="w-3.5 h-3.5 text-green-500" />
                </div>
                <p className="text-xl font-bold">{reportData.salesSummary?.totalSales || 0}</p>
                <p className="text-[11px] text-green-600 dark:text-green-400 font-medium">
                  Rs. {(reportData.salesSummary?.totalRevenue || 0).toFixed(2)}
                </p>
              </CardContent>
            </Card>

            <Card className="border-red-500/20">
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">Total Expenses</span>
                  <Receipt className="w-3.5 h-3.5 text-red-500" />
                </div>
                <p className="text-xl font-bold text-red-600 dark:text-red-400">
                  Rs. {(reportData.expensesSummary?.totalExpenses || 0).toFixed(2)}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {reportData.expensesSummary?.expenseCount || 0} transactions
                </p>
              </CardContent>
            </Card>

            <Card className={`border-${(reportData.financialSummary?.netProfit || 0) >= 0 ? 'green' : 'red'}-500/20`}>
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">Net Profit</span>
                  <DollarSign className={`w-3.5 h-3.5 ${(reportData.financialSummary?.netProfit || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`} />
                </div>
                <p className={`text-xl font-bold ${(reportData.financialSummary?.netProfit || 0) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  Rs. {(reportData.financialSummary?.netProfit || 0).toFixed(2)}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {(reportData.financialSummary?.profitMargin || 0).toFixed(1)}% margin
                </p>
              </CardContent>
            </Card>

            <Card className="border-blue-500/20">
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">Inventory Value</span>
                  <Package className="w-3.5 h-3.5 text-blue-500" />
                </div>
                <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                  Rs. {(reportData.inventorySummary?.totalValue || 0).toFixed(2)}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {reportData.inventorySummary?.totalProducts || 0} products
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Sales + Financial in two columns */}
          <div className="grid grid-cols-2 gap-4">
            {/* Sales Analysis */}
            {reportData.salesSummary && (
              <Card>
                <CardHeader className="p-3 pb-2">
                  <CardTitle className="text-sm flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-green-500" />
                    Sales Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0 space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: 'Total Sales', value: String(reportData.salesSummary.totalSales) },
                      { label: 'Revenue', value: `Rs. ${reportData.salesSummary.totalRevenue.toFixed(2)}`, color: 'text-green-600 dark:text-green-400' },
                      { label: 'Avg Order', value: `Rs. ${reportData.salesSummary.avgOrderValue.toFixed(2)}` },
                      { label: 'Tax Collected', value: `Rs. ${reportData.salesSummary.totalTax.toFixed(2)}` },
                    ].map(({ label, value, color }) => (
                      <div key={label} className="p-2 rounded bg-muted/40 border border-border/30">
                        <p className="text-[10px] text-muted-foreground">{label}</p>
                        <p className={`text-sm font-semibold ${color || ''}`}>{value}</p>
                      </div>
                    ))}
                  </div>

                  {reportData.salesByPaymentMethod && reportData.salesByPaymentMethod.length > 0 && (
                    <div>
                      <p className="text-[10px] font-medium text-muted-foreground mb-1.5 uppercase tracking-wide">By Payment Method</p>
                      <div className="space-y-1">
                        {reportData.salesByPaymentMethod.map((pm: any) => (
                          <div key={pm.paymentMethod} className="flex items-center justify-between py-1 px-2 rounded bg-muted/30 text-xs">
                            <div className="flex items-center gap-1.5">
                              <CreditCard className="w-3 h-3 text-muted-foreground" />
                              <span className="font-medium">{pm.paymentMethod}</span>
                            </div>
                            <div className="text-right">
                              <span className="font-semibold">Rs. {pm.total.toFixed(2)}</span>
                              <span className="text-muted-foreground ml-1.5">({pm.count})</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Financial Summary */}
            {reportData.financialSummary && (
              <Card>
                <CardHeader className="p-3 pb-2">
                  <CardTitle className="text-sm flex items-center gap-1.5">
                    <BarChart3 className="w-4 h-4 text-blue-500" />
                    Financial Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <div className="space-y-0.5 text-xs">
                    {[
                      { label: 'Gross Revenue', value: reportData.financialSummary.grossRevenue, color: 'text-green-600 dark:text-green-400', bold: true },
                      { label: 'Returns/Refunds', value: -reportData.financialSummary.refunds, color: 'text-red-600 dark:text-red-400', prefix: '- ' },
                      { label: 'Net Revenue', value: reportData.financialSummary.netRevenue, color: 'text-blue-600 dark:text-blue-400', bold: true, highlight: true },
                      { label: 'Cost of Goods Sold', value: -reportData.financialSummary.cogs, color: 'text-red-600 dark:text-red-400', prefix: '- ' },
                      { label: 'Gross Profit', value: reportData.financialSummary.grossProfit, color: 'text-blue-600 dark:text-blue-400', bold: true, highlight: true },
                      { label: 'Operating Expenses', value: -reportData.financialSummary.expenses, color: 'text-red-600 dark:text-red-400', prefix: '- ' },
                      { label: 'Net Profit', value: reportData.financialSummary.netProfit, color: reportData.financialSummary.netProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400', bold: true, highlight: true, large: true },
                    ].map(({ label, value, color, bold, highlight, large, prefix }) => (
                      <div key={label} className={`flex justify-between items-center py-1.5 px-2 rounded ${highlight ? 'bg-muted/50' : ''}`}>
                        <span className={bold ? 'font-semibold' : ''}>{label}</span>
                        <span className={`${color} ${bold ? 'font-bold' : 'font-medium'} ${large ? 'text-sm' : ''}`}>
                          {prefix || ''}Rs. {Math.abs(value).toFixed(2)}
                        </span>
                      </div>
                    ))}
                    <div className="flex justify-between items-center py-1.5 px-2">
                      <span>Profit Margin</span>
                      <span className="font-semibold">{reportData.financialSummary.profitMargin.toFixed(1)}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Top Products */}
          {reportData.topProducts && reportData.topProducts.length > 0 && (
            <Card>
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-sm flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-blue-500" />
                  Top 10 Selling Products
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="text-xs w-8">#</TableHead>
                      <TableHead className="text-xs w-28">Code</TableHead>
                      <TableHead className="text-xs">Product Name</TableHead>
                      <TableHead className="text-xs text-right w-20">Qty Sold</TableHead>
                      <TableHead className="text-xs text-right w-28">Revenue</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportData.topProducts.map((product: any, idx: number) => (
                      <TableRow key={idx}>
                        <TableCell className="text-[11px] text-muted-foreground py-1.5">{idx + 1}</TableCell>
                        <TableCell className="font-mono text-[11px] py-1.5">{product.productCode}</TableCell>
                        <TableCell className="text-xs py-1.5">{product.productName}</TableCell>
                        <TableCell className="text-xs text-right font-semibold py-1.5">{product.quantitySold}</TableCell>
                        <TableCell className="text-xs text-right text-green-600 dark:text-green-400 font-semibold py-1.5">
                          Rs. {product.revenue.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Audit Logs */}
          {reportData.auditLogs && reportData.auditLogs.length > 0 && (
            <Card>
              <CardHeader className="p-3 pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    Recent Audit Logs
                  </CardTitle>
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                    Last {reportData.auditLogs.length}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="text-xs w-36">Date/Time</TableHead>
                      <TableHead className="text-xs w-28">User</TableHead>
                      <TableHead className="text-xs w-20">Action</TableHead>
                      <TableHead className="text-xs">Table</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportData.auditLogs.map((log: any) => (
                      <TableRow key={log.id}>
                        <TableCell className="py-1.5">
                          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            {new Date(log.timestamp).toLocaleString('en-US', {
                              month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                            })}
                          </div>
                        </TableCell>
                        <TableCell className="py-1.5">
                          <div className="flex items-center gap-1 text-xs">
                            <User className="w-3 h-3 text-muted-foreground" />
                            {log.userName}
                          </div>
                        </TableCell>
                        <TableCell className="py-1.5">
                          {getActionBadge(log.action)}
                        </TableCell>
                        <TableCell className="font-mono text-[11px] text-muted-foreground py-1.5">
                          {log.tableName}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Empty state when no report generated yet */}
      {!reportData && !error && !isGenerating && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <FileBarChart className="w-12 h-12 mx-auto mb-3 text-muted-foreground/20" />
            <p className="text-sm font-medium text-muted-foreground">No report generated yet</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Select filters and click "Generate" to create an audit report</p>
          </div>
        </div>
      )}
    </div>
  )
}
