import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { useBranch } from '@/contexts/branch-context'
import { Navigate } from 'react-router-dom'
import {
  FileText,
  Download,
  TrendingUp,
  Package,
  DollarSign,
  ShoppingCart,
  RotateCcw,
  BadgePercent,
  Receipt,
  Users,
  Building2,
  Banknote,
  History,
  Loader2,
  Calendar,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { ReportType, TimePeriod, Branch } from '@shared/types'

interface ReportCard {
  type: ReportType
  title: string
  description: string
  icon: React.ElementType
  color: string
}

const reportCards: ReportCard[] = [
  {
    type: 'sales',
    title: 'Sales Report',
    description: 'Comprehensive sales analysis with revenue, transactions, and top products',
    icon: TrendingUp,
    color: 'text-green-600',
  },
  {
    type: 'inventory',
    title: 'Inventory Report',
    description: 'Current stock levels, valuations, and low stock alerts',
    icon: Package,
    color: 'text-blue-600',
  },
  {
    type: 'profit-loss',
    title: 'Profit & Loss',
    description: 'Financial summary with revenue, expenses, and profit calculations',
    icon: DollarSign,
    color: 'text-purple-600',
  },
  {
    type: 'expenses',
    title: 'Expense Report',
    description: 'Detailed expense tracking and analysis by category',
    icon: Receipt,
    color: 'text-red-600',
  },
  {
    type: 'purchases',
    title: 'Purchase Report',
    description: 'Supplier purchase analysis and payment tracking',
    icon: ShoppingCart,
    color: 'text-orange-600',
  },
  {
    type: 'returns',
    title: 'Returns Report',
    description: 'Product returns analysis and refund tracking',
    icon: RotateCcw,
    color: 'text-yellow-600',
  },
  {
    type: 'commissions',
    title: 'Commission Report',
    description: 'Sales commission tracking by salesperson',
    icon: BadgePercent,
    color: 'text-pink-600',
  },
  {
    type: 'tax',
    title: 'Tax Report',
    description: 'Tax collection summary and compliance tracking',
    icon: Receipt,
    color: 'text-indigo-600',
  },
  {
    type: 'customer',
    title: 'Customer Report',
    description: 'Customer analytics and purchase history',
    icon: Users,
    color: 'text-teal-600',
  },
  {
    type: 'branch-performance',
    title: 'Branch Performance',
    description: 'Multi-branch comparison and performance metrics',
    icon: Building2,
    color: 'text-cyan-600',
  },
  {
    type: 'cash-flow',
    title: 'Cash Flow Report',
    description: 'Money in/out tracking and cash position',
    icon: Banknote,
    color: 'text-emerald-600',
  },
  {
    type: 'audit-trail',
    title: 'Audit Trail',
    description: 'System activity and user action logs',
    icon: History,
    color: 'text-gray-600',
  },
]

export default function ReportsScreen() {
  const { user } = useAuth()
  const { currentBranch } = useBranch()
  const [branches, setBranches] = useState<Branch[]>([])
  const [selectedReport, setSelectedReport] = useState<ReportType | null>(null)
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('monthly')
  const [selectedBranch, setSelectedBranch] = useState<string>(currentBranch?.id?.toString() || 'all')
  const [startDate, setStartDate] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
  )
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0])
  const [isGenerating, setIsGenerating] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [reportData, setReportData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  // Admin-only protection
  if (!user || user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />
  }

  useEffect(() => {
    fetchBranches()
  }, [])

  // Update selected branch when current branch changes
  useEffect(() => {
    if (currentBranch && selectedBranch === 'all') {
      setSelectedBranch(currentBranch.id.toString())
    }
  }, [currentBranch])

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
        weekStart.setDate(now.getDate() - now.getDay())
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

  const handleGenerateReport = async (reportType: ReportType) => {
    setSelectedReport(reportType)
    setIsGenerating(true)
    setError(null)
    setReportData(null)

    try {
      const params: any = {
        startDate,
        endDate,
      }

      if (selectedBranch !== 'all') {
        params.branchId = parseInt(selectedBranch)
      }

      let response
      const channelMap: Record<ReportType, string> = {
        'sales': 'reports:sales-report',
        'inventory': 'reports:inventory-report',
        'profit-loss': 'reports:profit-loss',
        'expenses': 'reports:expenses-report',
        'purchases': 'reports:purchases-report',
        'returns': 'reports:returns-report',
        'commissions': 'reports:commissions-report',
        'tax': 'reports:tax-report',
        'customer': 'reports:customer-report',
        'branch-performance': 'reports:branch-performance',
        'cash-flow': 'reports:cash-flow',
        'audit-trail': 'reports:audit-trail',
      }

      const channel = channelMap[reportType]
      if (!channel) {
        throw new Error(`Unknown report type: ${reportType}`)
      }

      response = await window.api.reports[reportType](params)

      if (response?.success && response?.data) {
        setReportData(response.data)
      } else {
        setError(response?.message || 'Failed to generate report')
      }
    } catch (error) {
      console.error('Failed to generate report:', error)
      setError(error instanceof Error ? error.message : 'Failed to generate report. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownloadPDF = async () => {
    if (!selectedReport || !reportData) return

    setIsDownloading(true)
    setError(null)

    try {
      const branchName = selectedBranch === 'all'
        ? 'All Branches'
        : branches.find((b) => b.id.toString() === selectedBranch)?.name || 'Unknown Branch'

      // For audit-trail, fetch comprehensive data for the PDF
      let pdfData = reportData
      if (selectedReport === 'audit-trail') {
        const auditParams: any = {
          timePeriod,
          startDate,
          endDate,
        }
        if (selectedBranch !== 'all') {
          auditParams.branchId = parseInt(selectedBranch)
        }
        const comprehensiveResponse = await window.api.reports.comprehensiveAudit(auditParams)
        if (comprehensiveResponse?.success && comprehensiveResponse?.data) {
          pdfData = comprehensiveResponse.data
        }
      }

      const result = await window.api.reports.exportPDF({
        reportType: selectedReport,
        data: pdfData,
        filters: {
          timePeriod,
          startDate,
          endDate,
          branchName,
        },
      })

      if (result?.success && result?.filePath) {
        alert(`Report downloaded successfully!\n\nLocation: ${result.filePath}`)
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

  const renderSummaryCards = () => {
    if (!reportData) return null

    const summary = reportData.summary
    if (!summary) return null

    // Different summaries for different report types
    if (selectedReport === 'sales') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground mb-1">Total Sales</div>
              <div className="text-2xl font-bold">{summary.totalSales || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground mb-1">Total Revenue</div>
              <div className="text-2xl font-bold text-green-600">
                Rs. {(summary.totalRevenue || 0).toFixed(2)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground mb-1">Avg Order Value</div>
              <div className="text-2xl font-bold text-blue-600">
                Rs. {(summary.avgOrderValue || 0).toFixed(2)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground mb-1">Tax Collected</div>
              <div className="text-2xl font-bold">Rs. {(summary.totalTax || 0).toFixed(2)}</div>
            </CardContent>
          </Card>
        </div>
      )
    }

    if (selectedReport === 'profit-loss') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground mb-1">Revenue</div>
              <div className="text-2xl font-bold text-green-600">
                Rs. {(summary.revenue || reportData.revenue || 0).toFixed(2)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground mb-1">Gross Profit</div>
              <div className="text-2xl font-bold text-blue-600">
                Rs. {(summary.grossProfit || reportData.grossProfit || 0).toFixed(2)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {(summary.grossMargin || reportData.grossMargin || 0).toFixed(2)}% margin
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground mb-1">Net Profit</div>
              <div className={`text-2xl font-bold ${(reportData.netProfit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                Rs. {(summary.netProfit || reportData.netProfit || 0).toFixed(2)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {(summary.netMargin || reportData.netMargin || 0).toFixed(2)}% margin
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    // Generic summary for other reports
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {Object.entries(summary).slice(0, 3).map(([key, value]) => (
          <Card key={key}>
            <CardContent className="pt-6">
              <div className="text-sm text-muted-foreground mb-1 capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </div>
              <div className="text-2xl font-bold">
                {typeof value === 'number' ? value.toFixed(2) : value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Reports & Analytics</h1>
        <p className="text-muted-foreground">Generate comprehensive business reports and download as PDF</p>
        <div className="mt-2 inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
          Admin Only
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Report Configuration</CardTitle>
          <CardDescription>Select time period and branch to filter reports</CardDescription>
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

            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value)
                  setTimePeriod('custom')
                }}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value)
                  setTimePeriod('custom')
                }}
              />
            </div>

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
        </CardContent>
      </Card>

      {/* Report Types */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {reportCards.map((card) => (
          <Card
            key={card.type}
            className={`cursor-pointer transition-all hover:shadow-lg ${
              selectedReport === card.type ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => !isGenerating && handleGenerateReport(card.type)}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <card.icon className={`h-5 w-5 ${card.color}`} />
                {card.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{card.description}</p>
              <Button
                onClick={(e) => {
                  e.stopPropagation()
                  handleGenerateReport(card.type)
                }}
                disabled={isGenerating}
                className="w-full"
                size="sm"
              >
                {isGenerating && selectedReport === card.type ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Report
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Error Display */}
      {error && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-700">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Report Preview */}
      {reportData && (
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>
                  {reportCards.find((r) => r.type === selectedReport)?.title || 'Report'} Summary
                </CardTitle>
                <CardDescription>
                  {timePeriod.charAt(0).toUpperCase() + timePeriod.slice(1)} report from {startDate} to{' '}
                  {endDate}
                </CardDescription>
              </div>
              <Button onClick={handleDownloadPDF} disabled={isDownloading}>
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
            </div>
          </CardHeader>
          <CardContent>
            {renderSummaryCards()}

            {/* Additional report data display can go here */}
            <div className="text-sm text-muted-foreground mt-4">
              Report generated successfully. Click "Download PDF" to save a detailed copy.
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
