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
  ChevronRight,
  BarChart3,
  Shield,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
  category: 'financial' | 'operations' | 'analytics'
}

const reportCards: ReportCard[] = [
  {
    type: 'sales',
    title: 'Sales Report',
    description: 'Revenue, transactions, top products',
    icon: TrendingUp,
    color: 'text-green-600 dark:text-green-400',
    category: 'financial',
  },
  {
    type: 'profit-loss',
    title: 'Profit & Loss',
    description: 'Revenue, expenses, profit calculations',
    icon: DollarSign,
    color: 'text-purple-600 dark:text-purple-400',
    category: 'financial',
  },
  {
    type: 'expenses',
    title: 'Expense Report',
    description: 'Expense tracking by category',
    icon: Receipt,
    color: 'text-red-600 dark:text-red-400',
    category: 'financial',
  },
  {
    type: 'cash-flow',
    title: 'Cash Flow',
    description: 'Money in/out and cash position',
    icon: Banknote,
    color: 'text-emerald-600 dark:text-emerald-400',
    category: 'financial',
  },
  {
    type: 'tax',
    title: 'Tax Report',
    description: 'Tax collection and compliance',
    icon: Receipt,
    color: 'text-indigo-600 dark:text-indigo-400',
    category: 'financial',
  },
  {
    type: 'inventory',
    title: 'Inventory Report',
    description: 'Stock levels, valuations, alerts',
    icon: Package,
    color: 'text-blue-600 dark:text-blue-400',
    category: 'operations',
  },
  {
    type: 'purchases',
    title: 'Purchase Report',
    description: 'Supplier purchases and payments',
    icon: ShoppingCart,
    color: 'text-orange-600 dark:text-orange-400',
    category: 'operations',
  },
  {
    type: 'returns',
    title: 'Returns Report',
    description: 'Product returns and refunds',
    icon: RotateCcw,
    color: 'text-yellow-600 dark:text-yellow-400',
    category: 'operations',
  },
  {
    type: 'customer',
    title: 'Customer Report',
    description: 'Customer analytics and history',
    icon: Users,
    color: 'text-teal-600 dark:text-teal-400',
    category: 'analytics',
  },
  {
    type: 'commissions',
    title: 'Commissions',
    description: 'Sales commission by person',
    icon: BadgePercent,
    color: 'text-pink-600 dark:text-pink-400',
    category: 'analytics',
  },
  {
    type: 'branch-performance',
    title: 'Branch Performance',
    description: 'Multi-branch comparison metrics',
    icon: Building2,
    color: 'text-cyan-600 dark:text-cyan-400',
    category: 'analytics',
  },
  {
    type: 'audit-trail',
    title: 'Audit Trail',
    description: 'System activity and user logs',
    icon: History,
    color: 'text-gray-600 dark:text-gray-400',
    category: 'analytics',
  },
]

const CATEGORY_LABELS = {
  financial: { label: 'Financial', icon: DollarSign },
  operations: { label: 'Operations', icon: Package },
  analytics: { label: 'Analytics', icon: BarChart3 },
}

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
  const [activeCategory, setActiveCategory] = useState<string>('financial')

  if (!user || user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />
  }

  useEffect(() => {
    fetchBranches()
  }, [])

  useEffect(() => {
    if (currentBranch && selectedBranch === 'all') {
      setSelectedBranch(currentBranch.id.toString())
    }
  }, [currentBranch])

  useEffect(() => {
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
      const params: any = { startDate, endDate }
      if (selectedBranch !== 'all') {
        params.branchId = parseInt(selectedBranch)
      }

      const response = await window.api.reports[reportType](params)

      if (response?.success && response?.data) {
        setReportData(response.data)
      } else {
        setError(response?.message || 'Failed to generate report')
      }
    } catch (error) {
      console.error('Failed to generate report:', error)
      setError(error instanceof Error ? error.message : 'Failed to generate report.')
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

      let pdfData = reportData
      if (selectedReport === 'audit-trail') {
        const auditParams: any = { timePeriod, startDate, endDate }
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
        filters: { timePeriod, startDate, endDate, branchName },
      })

      if (result?.success && result?.filePath) {
        alert(`Report downloaded!\n\nLocation: ${result.filePath}`)
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

  const renderSummaryCards = () => {
    if (!reportData) return null
    const summary = reportData.summary
    if (!summary) return null

    if (selectedReport === 'sales') {
      return (
        <div className="grid grid-cols-4 gap-3">
          <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Total Sales</p>
            <p className="text-lg font-bold mt-0.5">{summary.totalSales || 0}</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Revenue</p>
            <p className="text-lg font-bold text-green-600 dark:text-green-400 mt-0.5">Rs. {(summary.totalRevenue || 0).toFixed(2)}</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Avg Order</p>
            <p className="text-lg font-bold text-blue-600 dark:text-blue-400 mt-0.5">Rs. {(summary.avgOrderValue || 0).toFixed(2)}</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Tax Collected</p>
            <p className="text-lg font-bold mt-0.5">Rs. {(summary.totalTax || 0).toFixed(2)}</p>
          </div>
        </div>
      )
    }

    if (selectedReport === 'profit-loss') {
      return (
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Revenue</p>
            <p className="text-lg font-bold text-green-600 dark:text-green-400 mt-0.5">Rs. {(summary.revenue || reportData.revenue || 0).toFixed(2)}</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Gross Profit</p>
            <p className="text-lg font-bold text-blue-600 dark:text-blue-400 mt-0.5">Rs. {(summary.grossProfit || reportData.grossProfit || 0).toFixed(2)}</p>
            <p className="text-[10px] text-muted-foreground">{(summary.grossMargin || reportData.grossMargin || 0).toFixed(1)}% margin</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Net Profit</p>
            <p className={`text-lg font-bold mt-0.5 ${(reportData.netProfit || 0) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              Rs. {(summary.netProfit || reportData.netProfit || 0).toFixed(2)}
            </p>
            <p className="text-[10px] text-muted-foreground">{(summary.netMargin || reportData.netMargin || 0).toFixed(1)}% margin</p>
          </div>
        </div>
      )
    }

    // Generic
    return (
      <div className="grid grid-cols-3 gap-3">
        {Object.entries(summary).slice(0, 3).map(([key, value]) => (
          <div key={key} className="p-3 rounded-lg bg-muted/50 border border-border/50">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
              {key.replace(/([A-Z])/g, ' $1').trim()}
            </p>
            <p className="text-lg font-bold mt-0.5">
              {typeof value === 'number' ? value.toFixed(2) : String(value)}
            </p>
          </div>
        ))}
      </div>
    )
  }

  const filteredReports = reportCards.filter((c) => c.category === activeCategory)

  return (
    <div className="flex flex-col h-full p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <FileText className="w-5 h-5 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold leading-tight">Reports & Analytics</h1>
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20">
                <Shield className="w-3 h-3 mr-0.5" />
                Admin
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">Generate business reports and download as PDF</p>
          </div>
        </div>
      </div>

      {/* Configuration Bar - Inline */}
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

        <div className="space-y-1">
          <Label className="text-[10px] text-muted-foreground">From</Label>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => { setStartDate(e.target.value); setTimePeriod('custom') }}
            className="h-8 w-[140px] text-xs"
          />
        </div>

        <div className="space-y-1">
          <Label className="text-[10px] text-muted-foreground">To</Label>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => { setEndDate(e.target.value); setTimePeriod('custom') }}
            className="h-8 w-[140px] text-xs"
          />
        </div>

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

        <div className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">
          <Calendar className="w-3.5 h-3.5" />
          {startDate} to {endDate}
        </div>
      </div>

      {/* Category Tabs + Report Grid */}
      <Tabs value={activeCategory} onValueChange={setActiveCategory} className="flex-1 flex flex-col">
        <TabsList className="w-fit">
          {Object.entries(CATEGORY_LABELS).map(([key, { label, icon: Icon }]) => (
            <TabsTrigger key={key} value={key} className="text-xs gap-1.5">
              <Icon className="w-3.5 h-3.5" />
              {label}
              <Badge variant="secondary" className="text-[9px] px-1 py-0 ml-0.5">
                {reportCards.filter((c) => c.category === key).length}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="mt-3 flex-1 overflow-auto">
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {filteredReports.map((card) => {
              const isActive = selectedReport === card.type
              const isCurrentlyGenerating = isGenerating && selectedReport === card.type
              return (
                <Card
                  key={card.type}
                  className={`cursor-pointer transition-all hover:shadow-md group ${
                    isActive ? 'ring-1 ring-primary shadow-md' : 'hover:border-primary/30'
                  }`}
                  onClick={() => !isGenerating && handleGenerateReport(card.type)}
                >
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="p-1.5 rounded-md bg-muted/80">
                        <card.icon className={`h-4 w-4 ${card.color}`} />
                      </div>
                      {isCurrentlyGenerating ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
                      )}
                    </div>
                    <h3 className="text-sm font-semibold leading-tight">{card.title}</h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5 leading-tight">{card.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </Tabs>

      {/* Error */}
      {error && (
        <Card className="border-destructive/30">
          <CardContent className="p-3">
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Report Preview */}
      {reportData && (
        <Card>
          <CardHeader className="p-3 pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm">
                  {reportCards.find((r) => r.type === selectedReport)?.title || 'Report'} Summary
                </CardTitle>
                <CardDescription className="text-[11px]">
                  {timePeriod.charAt(0).toUpperCase() + timePeriod.slice(1)} &middot; {startDate} to {endDate}
                </CardDescription>
              </div>
              <Button size="sm" variant="outline" onClick={handleDownloadPDF} disabled={isDownloading} className="h-7 text-xs">
                {isDownloading ? (
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                ) : (
                  <Download className="h-3.5 w-3.5 mr-1.5" />
                )}
                {isDownloading ? 'Downloading...' : 'Download PDF'}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            {renderSummaryCards()}
            <p className="text-[11px] text-muted-foreground mt-3">
              Report generated. Click "Download PDF" for a detailed copy.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
