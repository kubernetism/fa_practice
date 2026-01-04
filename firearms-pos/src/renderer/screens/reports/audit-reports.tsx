import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { Navigate } from 'react-router-dom'
import {
  FileText,
  Download,
  Loader2,
  TrendingUp,
  Package,
  DollarSign,
  Receipt,
  RotateCcw,
  BadgePercent,
  AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { TimePeriod, Branch, AuditTrailData } from '@shared/types'

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

  // Admin-only access check
  if (!user || user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-screen">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <p className="text-red-700 font-semibold">Access Denied: Admin Only</p>
            </div>
            <p className="text-sm text-red-600 mt-2">
              You do not have permission to access this page. Only administrators can view and generate audit reports.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  useEffect(() => {
    fetchBranches()
  }, [])

  useEffect(() => {
    // Auto-update date range when time period changes
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
      const params: any = {
        timePeriod,
        startDate,
        endDate,
      }

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
      setError(error instanceof Error ? error.message : 'Failed to generate audit report. Please try again.')
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
        filters: {
          timePeriod,
          startDate,
          endDate,
          branchName,
        },
      })

      if (result?.success && result?.filePath) {
        alert(`Audit Report downloaded successfully!\n\nLocation: ${result.filePath}`)
      } else {
        setError(result?.message || 'Failed to download PDF')
      }
    } catch (error) {
      console.error('Failed to download PDF:', error)
      setError(error instanceof Error ? error.message : 'Failed to download PDF. Please try again.')
    } finally {
      setIsDownloading(false)
    }
  }

  return (
    <div className="flex flex-col h-full p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Comprehensive Audit Reports</h1>
        <p className="text-muted-foreground">
          Generate detailed business audit reports with sales, inventory, expenses, and financial data
        </p>
        <div className="mt-2 inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
          Admin Only
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Report Filters</CardTitle>
          <CardDescription>Select time period and branch to generate comprehensive audit report</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="timePeriod">Time Period</Label>
              <Select value={timePeriod} onValueChange={(value) => setTimePeriod(value as TimePeriod)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                  <SelectItem value="all-time">All Time</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {timePeriod === 'custom' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="branch">Branch</Label>
              <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                <SelectTrigger>
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
          </div>

          <div className="mt-4 flex gap-3">
            <Button onClick={handleGenerateReport} disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating Report...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Audit Report
                </>
              )}
            </Button>

            {reportData && (
              <Button onClick={handleDownloadPDF} disabled={isDownloading} variant="outline">
                {isDownloading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Download PDF
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <p className="text-red-700">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Report Preview */}
      {reportData && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900 dark:text-gray-100">{reportData.salesSummary?.totalSales || 0}</div>
                <p className="text-xs text-slate-600 dark:text-gray-400 mt-1">
                  Rs. {(reportData.salesSummary?.totalRevenue || 0).toFixed(2)}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Receipt className="h-4 w-4 text-red-600 dark:text-red-400" />
                  <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  Rs. {(reportData.expensesSummary?.totalExpenses || 0).toFixed(2)}
                </div>
                <p className="text-xs text-slate-600 dark:text-gray-400 mt-1">
                  {reportData.expensesSummary?.expenseCount || 0} transactions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${(reportData.financialSummary?.netProfit || 0) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  Rs. {(reportData.financialSummary?.netProfit || 0).toFixed(2)}
                </div>
                <p className="text-xs text-slate-600 dark:text-gray-400 mt-1">
                  {(reportData.financialSummary?.profitMargin || 0).toFixed(2)}% margin
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  Rs. {(reportData.inventorySummary?.totalValue || 0).toFixed(2)}
                </div>
                <p className="text-xs text-slate-600 dark:text-gray-400 mt-1">
                  {reportData.inventorySummary?.totalProducts || 0} products
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Sales Analysis */}
          {reportData.salesSummary && (
            <Card>
              <CardHeader>
                <CardTitle>Sales Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm font-medium text-slate-700 dark:text-gray-300">Total Sales</p>
                      <p className="text-lg font-semibold text-slate-900 dark:text-gray-100">{reportData.salesSummary.totalSales}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700 dark:text-gray-300">Total Revenue</p>
                      <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                        Rs. {reportData.salesSummary.totalRevenue.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700 dark:text-gray-300">Avg Order Value</p>
                      <p className="text-lg font-semibold text-slate-900 dark:text-gray-100">
                        Rs. {reportData.salesSummary.avgOrderValue.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700 dark:text-gray-300">Tax Collected</p>
                      <p className="text-lg font-semibold text-slate-900 dark:text-gray-100">
                        Rs. {reportData.salesSummary.totalTax.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {reportData.salesByPaymentMethod && reportData.salesByPaymentMethod.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-semibold mb-2 text-slate-900 dark:text-gray-100">Sales by Payment Method</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        {reportData.salesByPaymentMethod.map((pm) => (
                          <div key={pm.paymentMethod} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded">
                            <span className="text-sm font-medium text-slate-900 dark:text-gray-100">{pm.paymentMethod}</span>
                            <div className="text-right">
                              <div className="text-sm font-semibold text-slate-900 dark:text-gray-100">Rs. {pm.total.toFixed(2)}</div>
                              <div className="text-xs text-slate-600 dark:text-gray-400">{pm.count} sales</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Top Products */}
          {reportData.topProducts && reportData.topProducts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Top 10 Selling Products</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                      <tr>
                        <th className="px-4 py-2 text-left font-semibold text-slate-900 dark:text-gray-100">Product Code</th>
                        <th className="px-4 py-2 text-left font-semibold text-slate-900 dark:text-gray-100">Product Name</th>
                        <th className="px-4 py-2 text-right font-semibold text-slate-900 dark:text-gray-100">Qty Sold</th>
                        <th className="px-4 py-2 text-right font-semibold text-slate-900 dark:text-gray-100">Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.topProducts.map((product, idx) => (
                        <tr key={idx} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="px-4 py-2 font-mono text-xs text-slate-900 dark:text-gray-100">{product.productCode}</td>
                          <td className="px-4 py-2 text-slate-900 dark:text-gray-100">{product.productName}</td>
                          <td className="px-4 py-2 text-right font-semibold text-slate-900 dark:text-gray-100">{product.quantitySold}</td>
                          <td className="px-4 py-2 text-right text-green-600 dark:text-green-400 font-semibold">
                            Rs. {product.revenue.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Financial Summary */}
          {reportData.financialSummary && (
            <Card>
              <CardHeader>
                <CardTitle>Financial Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="font-semibold text-slate-900 dark:text-gray-100">Gross Revenue</span>
                    <span className="text-green-600 dark:text-green-400 font-bold">
                      Rs. {reportData.financialSummary.grossRevenue.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-slate-900 dark:text-gray-100">Returns/Refunds</span>
                    <span className="text-red-600 dark:text-red-400">- Rs. {reportData.financialSummary.refunds.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-blue-900/20">
                    <span className="font-semibold text-slate-900 dark:text-gray-100">Net Revenue</span>
                    <span className="text-blue-600 dark:text-blue-400 font-bold">
                      Rs. {reportData.financialSummary.netRevenue.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-slate-900 dark:text-gray-100">Cost of Goods Sold</span>
                    <span className="text-red-600 dark:text-red-400">- Rs. {reportData.financialSummary.cogs.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-blue-900/20">
                    <span className="font-semibold text-slate-900 dark:text-gray-100">Gross Profit</span>
                    <span className="text-blue-600 dark:text-blue-400 font-bold">
                      Rs. {reportData.financialSummary.grossProfit.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                    <span className="text-slate-900 dark:text-gray-100">Operating Expenses</span>
                    <span className="text-red-600 dark:text-red-400">- Rs. {reportData.financialSummary.expenses.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 bg-green-50 dark:bg-green-900/20">
                    <span className="font-bold text-slate-900 dark:text-gray-100">Net Profit</span>
                    <span className={`font-bold text-lg ${reportData.financialSummary.netProfit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                      Rs. {reportData.financialSummary.netProfit.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-slate-900 dark:text-gray-100">Profit Margin</span>
                    <span className="font-semibold text-slate-900 dark:text-gray-100">{reportData.financialSummary.profitMargin.toFixed(2)}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Audit Logs */}
          {reportData.auditLogs && reportData.auditLogs.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recent System Audit Logs (Last 50)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                      <tr>
                        <th className="px-4 py-2 text-left font-semibold text-slate-900 dark:text-gray-100">Date/Time</th>
                        <th className="px-4 py-2 text-left font-semibold text-slate-900 dark:text-gray-100">User</th>
                        <th className="px-4 py-2 text-left font-semibold text-slate-900 dark:text-gray-100">Action</th>
                        <th className="px-4 py-2 text-left font-semibold text-slate-900 dark:text-gray-100">Table</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.auditLogs.map((log) => (
                        <tr key={log.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="px-4 py-2 text-xs text-slate-900 dark:text-gray-100">
                            {new Date(log.timestamp).toLocaleString()}
                          </td>
                          <td className="px-4 py-2 text-slate-900 dark:text-gray-100">{log.userName}</td>
                          <td className="px-4 py-2">
                            <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded text-xs font-medium">
                              {log.action}
                            </span>
                          </td>
                          <td className="px-4 py-2 font-mono text-xs text-slate-900 dark:text-gray-100">{log.tableName}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
