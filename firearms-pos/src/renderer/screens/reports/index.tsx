import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { useBranch } from '@/contexts/branch-context'
import { Navigate, useNavigate } from 'react-router-dom'
import {
  FileText,
  Download,
  Loader2,
  Calendar,
  Shield,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  GitCompareArrows,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
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
import type { ReportType, TimePeriod, Branch, ComparisonMode, GroupBy } from '@shared/types'
import {
  REPORT_FILTER_CONFIG,
  REPORT_CATEGORIES,
  PAYMENT_METHOD_OPTIONS,
  PAYMENT_STATUS_OPTIONS,
  AUDIT_ACTION_OPTIONS,
  AUDIT_ENTITY_OPTIONS,
  GROUP_BY_OPTIONS,
  getReportsByCategory,
  type ReportFilterConfig,
} from './report-filter-config'

// Format helpers
function formatCurrency(value: number | null | undefined): string {
  return `Rs. ${(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}
function formatNumber(value: number | null | undefined): string {
  return (value || 0).toLocaleString('en-US')
}
function formatPercent(value: number | null | undefined): string {
  return `${(value || 0).toFixed(1)}%`
}
function formatDate(value: string | null | undefined): string {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
function formatDateTime(value: string | null | undefined): string {
  if (!value) return '-'
  return new Date(value).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function formatCellValue(value: unknown, format?: string): string {
  if (value === null || value === undefined) return '-'
  switch (format) {
    case 'currency': return formatCurrency(value as number)
    case 'number': return formatNumber(value as number)
    case 'percent': return formatPercent(value as number)
    case 'date': return formatDate(value as string)
    case 'datetime': return formatDateTime(value as string)
    default: return String(value)
  }
}

function getComparisonChange(current: number, previous: number): { percent: number; direction: 'up' | 'down' | 'same' } {
  if (previous === 0) return { percent: current > 0 ? 100 : 0, direction: current > 0 ? 'up' : 'same' }
  const percent = ((current - previous) / Math.abs(previous)) * 100
  return { percent: Math.abs(percent), direction: percent > 0 ? 'up' : percent < 0 ? 'down' : 'same' }
}

export default function ReportsScreen() {
  const { user } = useAuth()
  const { currentBranch } = useBranch()
  const navigate = useNavigate()

  // Data state
  const [branches, setBranches] = useState<Branch[]>([])
  const [customers, setCustomers] = useState<Array<{ id: number; firstName: string; lastName: string }>>([])
  const [suppliersData, setSuppliersData] = useState<Array<{ id: number; name: string }>>([])
  const [payeesData, setPayeesData] = useState<Array<{ id: number; name: string; payeeType: string }>>([])
  const [categoriesData, setCategoriesData] = useState<Array<{ id: number; name: string }>>([])
  const [usersData, setUsersData] = useState<Array<{ id: number; fullName: string }>>([])

  // Report selection
  const [reportType, setReportType] = useState<ReportType>('sales')
  const config = REPORT_FILTER_CONFIG[reportType]

  // Filters
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('monthly')
  const [startDate, setStartDate] = useState(
    new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
  )
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedBranch, setSelectedBranch] = useState<string>(currentBranch?.id?.toString() || 'all')
  const [paymentMethod, setPaymentMethod] = useState<string>('all')
  const [paymentStatus, setPaymentStatus] = useState<string>('all')
  const [customerId, setCustomerId] = useState<string>('all')
  const [supplierId, setSupplierId] = useState<string>('all')
  const [payeeId, setPayeeId] = useState<string>('all')
  const [payeeTypeFilter, setPayeeTypeFilter] = useState<string>('all')
  const [categoryId, setCategoryId] = useState<string>('all')
  const [salespersonId, setSalespersonId] = useState<string>('all')
  const [actionType, setActionType] = useState<string>('all')
  const [entityType, setEntityType] = useState<string>('all')
  const [groupBy, setGroupBy] = useState<GroupBy>('day')
  const [reason, setReason] = useState<string>('all')

  // Comparison
  const [comparisonMode, setComparisonMode] = useState<ComparisonMode>('none')
  const [comparisonBranchId, setComparisonBranchId] = useState<string>('all')

  // Report data
  const [reportData, setReportData] = useState<any>(null)
  const [comparisonData, setComparisonData] = useState<any>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(25)

  // Sort
  const [sortColumn, setSortColumn] = useState<string>('')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  if (!user || user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />
  }

  // Fetch reference data on mount
  useEffect(() => {
    fetchBranches()
    fetchReferenceData()
  }, [])

  useEffect(() => {
    if (currentBranch && selectedBranch === 'all') {
      setSelectedBranch(currentBranch.id.toString())
    }
  }, [currentBranch])

  // Reset filters when report type changes
  useEffect(() => {
    setReportData(null)
    setComparisonData(null)
    setCurrentPage(1)
    setSortColumn('')
    setPaymentMethod('all')
    setPaymentStatus('all')
    setCustomerId('all')
    setSupplierId('all')
    setPayeeId('all')
    setPayeeTypeFilter('all')
    setCategoryId('all')
    setSalespersonId('all')
    setActionType('all')
    setEntityType('all')
    setReason('all')
    setComparisonMode('none')
  }, [reportType])

  // Update date range when period changes
  useEffect(() => {
    const now = new Date()
    switch (timePeriod) {
      case 'daily':
        setStartDate(now.toISOString().split('T')[0])
        setEndDate(now.toISOString().split('T')[0])
        break
      case 'weekly': {
        const weekStart = new Date(now)
        weekStart.setDate(now.getDate() - now.getDay())
        setStartDate(weekStart.toISOString().split('T')[0])
        setEndDate(now.toISOString().split('T')[0])
        break
      }
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
      setBranches(response?.data || [])
    } catch { setBranches([]) }
  }

  const fetchReferenceData = async () => {
    try {
      const [custRes, suppRes, payeeRes, catRes, userRes] = await Promise.all([
        window.api.customers?.getAll?.() || { data: [] },
        window.api.suppliers?.getAll?.() || { data: [] },
        window.api.payees?.getAll?.({ isActive: true, limit: 1000 }) || { data: [] },
        window.api.categories?.getAll?.() || { data: [] },
        window.api.users?.getAll?.() || { data: [] },
      ])
      setCustomers(custRes?.data || [])
      setSuppliersData(suppRes?.data || [])
      setPayeesData(payeeRes?.data || [])
      setCategoriesData(catRes?.data || [])
      setUsersData(userRes?.data || [])
    } catch {
      // Non-critical - filter dropdowns will just be empty
    }
  }

  const buildParams = useCallback((overrides?: Record<string, unknown>) => {
    const params: Record<string, unknown> = {
      startDate,
      endDate,
      page: currentPage,
      limit: pageSize,
      ...(groupBy && config.hasGroupBy ? { groupBy } : {}),
    }
    if (selectedBranch !== 'all') params.branchId = parseInt(selectedBranch)
    if (paymentMethod !== 'all') params.paymentMethod = paymentMethod
    if (paymentStatus !== 'all') params.paymentStatus = paymentStatus
    if (customerId !== 'all') params.customerId = parseInt(customerId)
    if (supplierId !== 'all') params.supplierId = parseInt(supplierId)
    if (payeeId !== 'all') params.payeeId = parseInt(payeeId)
    if (payeeTypeFilter !== 'all') params.payeeType = payeeTypeFilter
    if (categoryId !== 'all') params.categoryId = parseInt(categoryId)
    if (salespersonId !== 'all') params.salespersonId = parseInt(salespersonId)
    if (actionType !== 'all') params.actionType = actionType
    if (entityType !== 'all') params.entityType = entityType
    if (reason !== 'all') params.reason = reason
    if (overrides) Object.assign(params, overrides)
    return params
  }, [startDate, endDate, currentPage, pageSize, groupBy, config.hasGroupBy, selectedBranch, paymentMethod, paymentStatus, customerId, supplierId, payeeId, payeeTypeFilter, categoryId, salespersonId, actionType, entityType, reason])

  const getComparisonParams = useCallback(() => {
    if (comparisonMode === 'branch') {
      return buildParams({ branchId: comparisonBranchId !== 'all' ? parseInt(comparisonBranchId) : undefined })
    }
    if (comparisonMode === 'period') {
      const start = new Date(startDate)
      const end = new Date(endDate)
      const duration = end.getTime() - start.getTime()
      const prevEnd = new Date(start.getTime() - 1)
      const prevStart = new Date(prevEnd.getTime() - duration)
      return buildParams({
        startDate: prevStart.toISOString().split('T')[0],
        endDate: prevEnd.toISOString().split('T')[0],
      })
    }
    return null
  }, [comparisonMode, comparisonBranchId, buildParams, startDate, endDate])

  const handleGenerateReport = async () => {
    setIsGenerating(true)
    setError(null)
    setReportData(null)
    setComparisonData(null)
    setCurrentPage(1)

    try {
      const params = buildParams({ page: 1 })

      let apiMethod: string = reportType
      if (reportType === 'comprehensive-audit') {
        apiMethod = 'comprehensiveAudit'
        ;(params as any).timePeriod = timePeriod
      }

      const response = await (window.api.reports as any)[apiMethod](params)

      if (response?.success && response?.data) {
        setReportData(response.data)
      } else {
        setError(response?.message || 'Failed to generate report')
      }

      // Comparison data
      if (comparisonMode !== 'none') {
        const compParams = getComparisonParams()
        if (compParams) {
          const compResponse = await (window.api.reports as any)[apiMethod](compParams)
          if (compResponse?.success && compResponse?.data) {
            setComparisonData(compResponse.data)
          }
        }
      }
    } catch (err) {
      console.error('Failed to generate report:', err)
      setError(err instanceof Error ? err.message : 'Failed to generate report.')
    } finally {
      setIsGenerating(false)
    }
  }

  const handlePageChange = async (newPage: number) => {
    setCurrentPage(newPage)
    setIsGenerating(true)
    try {
      const params = buildParams({ page: newPage })
      let apiMethod: string = reportType
      if (reportType === 'comprehensive-audit') {
        apiMethod = 'comprehensiveAudit'
        ;(params as any).timePeriod = timePeriod
      }
      const response = await (window.api.reports as any)[apiMethod](params)
      if (response?.success && response?.data) {
        setReportData((prev: any) => ({
          ...prev,
          details: response.data.details,
        }))
      }
    } catch (err) {
      console.error('Failed to fetch page:', err)
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
        : branches.find((b) => b.id.toString() === selectedBranch)?.name || 'Unknown'

      let pdfData = reportData
      if (reportType === 'audit-trail' || reportType === 'comprehensive-audit') {
        const auditParams: any = { timePeriod, startDate, endDate }
        if (selectedBranch !== 'all') auditParams.branchId = parseInt(selectedBranch)
        const resp = await window.api.reports.comprehensiveAudit(auditParams)
        if (resp?.success && resp?.data) pdfData = resp.data
      }

      const result = await window.api.reports.exportPDF({
        reportType,
        data: pdfData,
        filters: { timePeriod, startDate, endDate, branchName },
      })

      if (result?.success && result?.filePath) {
        alert(`Report downloaded!\n\nLocation: ${result.filePath}`)
      } else {
        setError(result?.message || 'Failed to download PDF')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download PDF.')
    } finally {
      setIsDownloading(false)
    }
  }

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(column)
      setSortDirection('desc')
    }
  }

  const handleDrillDown = (row: any) => {
    if (!config.drillDownRoute) return
    navigate(config.drillDownRoute)
  }

  // Sort detail rows client-side
  const sortedDetails = useMemo(() => {
    const details = reportData?.details?.rows || []
    if (!sortColumn || details.length === 0) return details
    return [...details].sort((a: any, b: any) => {
      const aVal = a[sortColumn]
      const bVal = b[sortColumn]
      if (aVal === bVal) return 0
      if (aVal === null || aVal === undefined) return 1
      if (bVal === null || bVal === undefined) return -1
      const cmp = typeof aVal === 'number' ? aVal - bVal : String(aVal).localeCompare(String(bVal))
      return sortDirection === 'asc' ? cmp : -cmp
    })
  }, [reportData?.details?.rows, sortColumn, sortDirection])

  // Get summary values for comparison
  const getSummaryValue = (data: any, key: string): number => {
    if (!data) return 0
    // Check in summary object first
    const summary = data.summary || data
    if (summary[key] !== undefined) return Number(summary[key]) || 0
    // Check in financial summary
    if (data.financialSummary?.[key] !== undefined) return Number(data.financialSummary[key]) || 0
    if (data.salesSummary?.[key] !== undefined) return Number(data.salesSummary[key]) || 0
    if (data.expensesSummary?.[key] !== undefined) return Number(data.expensesSummary[key]) || 0
    if (data.inventorySummary?.[key] !== undefined) return Number(data.inventorySummary[key]) || 0
    // Direct key on data
    if (data[key] !== undefined) return Number(data[key]) || 0
    return 0
  }

  const reportsByCategory = useMemo(() => getReportsByCategory(), [])

  // ------ RENDER ------

  return (
    <div className="flex flex-col h-full p-4 space-y-3">
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
            <p className="text-xs text-muted-foreground">
              {config.description}
            </p>
          </div>
        </div>
      </div>

      {/* Row 1: Report Type + Date filters */}
      <div className="flex items-end gap-2.5 flex-wrap">
        {/* Report Type Dropdown */}
        <div className="space-y-1">
          <Label className="text-[10px] text-muted-foreground">Report Type</Label>
          <Select value={reportType} onValueChange={(v) => setReportType(v as ReportType)}>
            <SelectTrigger className="h-8 w-[200px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(reportsByCategory).map(([cat, reports]) => (
                <SelectGroup key={cat}>
                  <SelectLabel className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    {REPORT_CATEGORIES[cat as keyof typeof REPORT_CATEGORIES]?.label || cat}
                  </SelectLabel>
                  {reports.map(({ type, config: c }) => (
                    <SelectItem key={type} value={type} className="text-xs">
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date Filters */}
        {config.hasDateFilter && (
          <>
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">Period</Label>
              <Select value={timePeriod} onValueChange={(v) => setTimePeriod(v as TimePeriod)}>
                <SelectTrigger className="h-8 w-[110px] text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Today</SelectItem>
                  <SelectItem value="weekly">This Week</SelectItem>
                  <SelectItem value="monthly">This Month</SelectItem>
                  <SelectItem value="yearly">This Year</SelectItem>
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
                className="h-8 w-[130px] text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] text-muted-foreground">To</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => { setEndDate(e.target.value); setTimePeriod('custom') }}
                className="h-8 w-[130px] text-xs"
              />
            </div>
          </>
        )}

        {/* Group By */}
        {config.hasGroupBy && (
          <div className="space-y-1">
            <Label className="text-[10px] text-muted-foreground">Group By</Label>
            <Select value={groupBy} onValueChange={(v) => setGroupBy(v as GroupBy)}>
              <SelectTrigger className="h-8 w-[90px] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {GROUP_BY_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">
          <Calendar className="w-3.5 h-3.5" />
          {startDate} to {endDate}
        </div>
      </div>

      {/* Row 2: Entity filters + Comparison + Actions */}
      <div className="flex items-end gap-2.5 flex-wrap">
        {/* Branch filter */}
        {config.entityFilters.includes('branch') && (
          <div className="space-y-1">
            <Label className="text-[10px] text-muted-foreground">Branch</Label>
            <Select value={selectedBranch} onValueChange={setSelectedBranch}>
              <SelectTrigger className="h-8 w-[150px] text-xs">
                <SelectValue placeholder="All Branches" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Branches</SelectItem>
                {branches.map((b) => (
                  <SelectItem key={b.id} value={b.id.toString()}>
                    {b.code} - {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Customer filter */}
        {config.entityFilters.includes('customer') && (
          <div className="space-y-1">
            <Label className="text-[10px] text-muted-foreground">Customer</Label>
            <Select value={customerId} onValueChange={setCustomerId}>
              <SelectTrigger className="h-8 w-[150px] text-xs">
                <SelectValue placeholder="All Customers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Customers</SelectItem>
                {customers.map((c) => (
                  <SelectItem key={c.id} value={c.id.toString()}>
                    {c.firstName} {c.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Supplier filter */}
        {config.entityFilters.includes('supplier') && (
          <div className="space-y-1">
            <Label className="text-[10px] text-muted-foreground">Supplier</Label>
            <Select value={supplierId} onValueChange={setSupplierId}>
              <SelectTrigger className="h-8 w-[150px] text-xs">
                <SelectValue placeholder="All Suppliers" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Suppliers</SelectItem>
                {suppliersData.map((s) => (
                  <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Payee filter */}
        {config.entityFilters.includes('payee') && (
          <div className="space-y-1">
            <Label className="text-[10px] text-muted-foreground">Payee</Label>
            <Select value={payeeId} onValueChange={setPayeeId}>
              <SelectTrigger className="h-8 w-[180px] text-xs">
                <SelectValue placeholder="All Payees" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Payees</SelectItem>
                {payeesData.map((p) => (
                  <SelectItem key={p.id} value={p.id.toString()}>
                    <span className="capitalize text-muted-foreground text-[10px] mr-1">
                      {p.payeeType}
                    </span>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Payee Type filter */}
        {config.entityFilters.includes('payeeType') && (
          <div className="space-y-1">
            <Label className="text-[10px] text-muted-foreground">Payee Type</Label>
            <Select value={payeeTypeFilter} onValueChange={setPayeeTypeFilter}>
              <SelectTrigger className="h-8 w-[130px] text-xs">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="vendor">Vendor</SelectItem>
                <SelectItem value="landlord">Landlord</SelectItem>
                <SelectItem value="utility">Utility</SelectItem>
                <SelectItem value="employee">Employee</SelectItem>
                <SelectItem value="government">Government</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Category filter */}
        {config.entityFilters.includes('category') && (
          <div className="space-y-1">
            <Label className="text-[10px] text-muted-foreground">Category</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger className="h-8 w-[140px] text-xs">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categoriesData.map((c) => (
                  <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Payment Method filter */}
        {config.entityFilters.includes('paymentMethod') && (
          <div className="space-y-1">
            <Label className="text-[10px] text-muted-foreground">Payment</Label>
            <Select value={paymentMethod} onValueChange={setPaymentMethod}>
              <SelectTrigger className="h-8 w-[110px] text-xs">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                {PAYMENT_METHOD_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Payment Status filter */}
        {config.entityFilters.includes('paymentStatus') && (
          <div className="space-y-1">
            <Label className="text-[10px] text-muted-foreground">Status</Label>
            <Select value={paymentStatus} onValueChange={setPaymentStatus}>
              <SelectTrigger className="h-8 w-[100px] text-xs">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {PAYMENT_STATUS_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Salesperson filter */}
        {config.entityFilters.includes('salesperson') && (
          <div className="space-y-1">
            <Label className="text-[10px] text-muted-foreground">Salesperson</Label>
            <Select value={salespersonId} onValueChange={setSalespersonId}>
              <SelectTrigger className="h-8 w-[140px] text-xs">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Salespersons</SelectItem>
                {usersData.map((u) => (
                  <SelectItem key={u.id} value={u.id.toString()}>{u.fullName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* User filter (audit) */}
        {config.entityFilters.includes('user') && (
          <div className="space-y-1">
            <Label className="text-[10px] text-muted-foreground">User</Label>
            <Select value={salespersonId} onValueChange={setSalespersonId}>
              <SelectTrigger className="h-8 w-[130px] text-xs">
                <SelectValue placeholder="All Users" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                {usersData.map((u) => (
                  <SelectItem key={u.id} value={u.id.toString()}>{u.fullName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Action Type filter (audit) */}
        {config.entityFilters.includes('actionType') && (
          <div className="space-y-1">
            <Label className="text-[10px] text-muted-foreground">Action</Label>
            <Select value={actionType} onValueChange={setActionType}>
              <SelectTrigger className="h-8 w-[100px] text-xs">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                {AUDIT_ACTION_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Entity Type filter (audit) */}
        {config.entityFilters.includes('entityType') && (
          <div className="space-y-1">
            <Label className="text-[10px] text-muted-foreground">Entity</Label>
            <Select value={entityType} onValueChange={setEntityType}>
              <SelectTrigger className="h-8 w-[110px] text-xs">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Entities</SelectItem>
                {AUDIT_ENTITY_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Reason filter (returns) */}
        {config.entityFilters.includes('reason') && (
          <div className="space-y-1">
            <Label className="text-[10px] text-muted-foreground">Reason</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger className="h-8 w-[120px] text-xs">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Reasons</SelectItem>
                <SelectItem value="defective">Defective</SelectItem>
                <SelectItem value="wrong_item">Wrong Item</SelectItem>
                <SelectItem value="not_needed">Not Needed</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Row 3: Comparison + Generate + Download */}
      <div className="flex items-end gap-2.5 flex-wrap">
        {/* Comparison Mode */}
        <div className="space-y-1">
          <Label className="text-[10px] text-muted-foreground">Compare</Label>
          <Select value={comparisonMode} onValueChange={(v) => setComparisonMode(v as ComparisonMode)}>
            <SelectTrigger className="h-8 w-[140px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No Comparison</SelectItem>
              <SelectItem value="period">vs Previous Period</SelectItem>
              <SelectItem value="branch">vs Another Branch</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {comparisonMode === 'branch' && (
          <div className="space-y-1">
            <Label className="text-[10px] text-muted-foreground">Compare Branch</Label>
            <Select value={comparisonBranchId} onValueChange={setComparisonBranchId}>
              <SelectTrigger className="h-8 w-[150px] text-xs">
                <SelectValue placeholder="Select Branch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Branches</SelectItem>
                {branches.map((b) => (
                  <SelectItem key={b.id} value={b.id.toString()}>
                    {b.code} - {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {comparisonMode === 'period' && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-2 py-1.5 rounded">
            <GitCompareArrows className="w-3.5 h-3.5" />
            Comparing with previous {timePeriod === 'custom' ? 'period' : timePeriod.replace('-', ' ')}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-2 ml-auto">
          <Button size="sm" onClick={handleGenerateReport} disabled={isGenerating} className="h-8">
            {isGenerating ? (
              <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
            ) : (
              <FileText className="h-3.5 w-3.5 mr-1.5" />
            )}
            {isGenerating ? 'Generating...' : 'Generate Report'}
          </Button>

          {reportData && (
            <Button size="sm" variant="outline" onClick={handleDownloadPDF} disabled={isDownloading} className="h-8">
              {isDownloading ? (
                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
              ) : (
                <Download className="h-3.5 w-3.5 mr-1.5" />
              )}
              PDF
            </Button>
          )}
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

      {/* Report Content */}
      {reportData && (
        <div className="flex-1 overflow-auto space-y-3">
          {/* Summary Cards */}
          <div className={`grid grid-cols-${Math.min(config.summaryCards.length, 4)} gap-3`}>
            {config.summaryCards.map((card) => {
              const value = getSummaryValue(reportData, card.key)
              const compValue = comparisonData ? getSummaryValue(comparisonData, card.key) : null
              const change = compValue !== null ? getComparisonChange(value, compValue) : null

              const colorClasses: Record<string, string> = {
                green: 'text-green-600 dark:text-green-400',
                red: 'text-red-600 dark:text-red-400',
                blue: 'text-blue-600 dark:text-blue-400',
              }

              return (
                <Card key={card.key} className={card.color ? `border-${card.color}-500/20` : ''}>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] text-muted-foreground uppercase tracking-wide">{card.label}</span>
                      {change && change.direction !== 'same' && (
                        <Badge
                          variant="outline"
                          className={`text-[9px] px-1 py-0 ${
                            change.direction === 'up'
                              ? 'bg-green-500/10 text-green-600 border-green-500/20'
                              : 'bg-red-500/10 text-red-600 border-red-500/20'
                          }`}
                        >
                          {change.direction === 'up' ? <TrendingUp className="w-2.5 h-2.5 mr-0.5" /> : <TrendingDown className="w-2.5 h-2.5 mr-0.5" />}
                          {change.percent.toFixed(1)}%
                        </Badge>
                      )}
                    </div>
                    <p className={`text-lg font-bold ${card.color ? colorClasses[card.color] || '' : ''}`}>
                      {card.format === 'currency' ? formatCurrency(value) : card.format === 'percent' ? formatPercent(value) : formatNumber(value)}
                    </p>
                    {compValue !== null && (
                      <p className="text-[10px] text-muted-foreground">
                        vs {card.format === 'currency' ? formatCurrency(compValue) : card.format === 'percent' ? formatPercent(compValue) : formatNumber(compValue)}
                      </p>
                    )}
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Expense payee analysis */}
          {reportType === 'expenses' && reportData.expensesByPayee && reportData.expensesByPayee.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Expenses by Payee Type */}
              <Card>
                <CardHeader className="p-3 pb-2">
                  <h3 className="text-xs font-semibold tracking-wide uppercase">Expenses by Payee Type</h3>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  {(() => {
                    const types = reportData.expensesByPayeeType || []
                    const totalForTypes = types.reduce(
                      (s: number, r: any) => s + (Number(r.amount) || 0),
                      0
                    )
                    if (types.length === 0) {
                      return <p className="text-xs text-muted-foreground">No data.</p>
                    }
                    return (
                      <div className="space-y-1.5">
                        {types.map((r: any) => {
                          const amount = Number(r.amount) || 0
                          const pct = totalForTypes > 0 ? (amount / totalForTypes) * 100 : 0
                          return (
                            <div key={r.payeeType} className="space-y-0.5">
                              <div className="flex items-center justify-between text-xs">
                                <span className="capitalize font-medium">{r.payeeType}</span>
                                <span className="tabular-nums text-muted-foreground">
                                  {formatCurrency(amount)} · {pct.toFixed(1)}% · {Number(r.count) || 0} txn
                                </span>
                              </div>
                              <div className="h-1.5 bg-muted rounded overflow-hidden">
                                <div
                                  className="h-full bg-primary/70"
                                  style={{ width: `${Math.min(pct, 100)}%` }}
                                />
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )
                  })()}
                </CardContent>
              </Card>

              {/* Top Payees + Concentration */}
              <Card>
                <CardHeader className="p-3 pb-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold tracking-wide uppercase">Top Payees</h3>
                    {(() => {
                      const total = (reportData.expensesByPayee as any[]).reduce(
                        (s, r) => s + (Number(r.amount) || 0),
                        0
                      )
                      const top3 = (reportData.expensesByPayee as any[])
                        .slice(0, 3)
                        .reduce((s, r) => s + (Number(r.amount) || 0), 0)
                      const pct = total > 0 ? (top3 / total) * 100 : 0
                      return (
                        <span className="text-[10px] text-muted-foreground">
                          Top 3: {pct.toFixed(1)}% of total
                        </span>
                      )
                    })()}
                  </div>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                  <div className="space-y-1">
                    {(reportData.expensesByPayee as any[]).slice(0, 5).map((r, idx) => (
                      <div
                        key={r.payeeId ?? idx}
                        className="flex items-center justify-between text-xs py-1 border-b border-border/40 last:border-b-0"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="text-muted-foreground w-4 tabular-nums">{idx + 1}.</span>
                          <span className="capitalize text-[10px] text-muted-foreground/70">
                            {r.payeeType}
                          </span>
                          <span className="truncate font-medium">{r.payeeName}</span>
                        </div>
                        <span className="tabular-nums shrink-0">
                          {formatCurrency(Number(r.amount) || 0)}
                        </span>
                      </div>
                    ))}
                    {reportData.expensesByPayee.length === 0 && (
                      <p className="text-xs text-muted-foreground">No payee data.</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Detail Table */}
          {reportData.details && reportData.details.rows && reportData.details.rows.length > 0 && (
            <Card>
              <CardHeader className="p-3 pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">
                    {config.label} Details
                  </CardTitle>
                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                    {reportData.details.total} records
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      {config.tableColumns.map((col) => (
                        <TableHead
                          key={col.key}
                          className={`text-xs ${col.align === 'right' ? 'text-right' : ''} ${col.sortable ? 'cursor-pointer select-none hover:text-foreground' : ''}`}
                          onClick={() => col.sortable && handleSort(col.key)}
                        >
                          <div className={`flex items-center gap-1 ${col.align === 'right' ? 'justify-end' : ''}`}>
                            {col.label}
                            {col.sortable && (
                              sortColumn === col.key
                                ? sortDirection === 'asc'
                                  ? <ArrowUp className="w-3 h-3" />
                                  : <ArrowDown className="w-3 h-3" />
                                : <ArrowUpDown className="w-3 h-3 opacity-30" />
                            )}
                          </div>
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedDetails.map((row: any, idx: number) => (
                      <TableRow
                        key={row.id || idx}
                        className={config.drillDownRoute ? 'cursor-pointer hover:bg-muted/50' : ''}
                        onClick={() => config.drillDownRoute && handleDrillDown(row)}
                      >
                        {config.tableColumns.map((col) => (
                          <TableCell
                            key={col.key}
                            className={`text-xs py-1.5 ${col.align === 'right' ? 'text-right' : ''} ${col.format === 'currency' ? 'font-semibold' : ''}`}
                          >
                            {col.format === 'badge' ? (
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0 font-mono">
                                {String(row[col.key] || '-')}
                              </Badge>
                            ) : (
                              formatCellValue(row[col.key], col.format)
                            )}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {reportData.details.totalPages > 1 && (
                  <div className="flex items-center justify-between px-3 py-2 border-t">
                    <p className="text-[11px] text-muted-foreground">
                      Page {reportData.details.page} of {reportData.details.totalPages}
                    </p>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 w-7 p-0"
                        disabled={reportData.details.page <= 1 || isGenerating}
                        onClick={() => handlePageChange(reportData.details.page - 1)}
                      >
                        <ChevronLeft className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 w-7 p-0"
                        disabled={reportData.details.page >= reportData.details.totalPages || isGenerating}
                        onClick={() => handlePageChange(reportData.details.page + 1)}
                      >
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Voided Transactions Section (Audit reports only) */}
          {(reportType === 'comprehensive-audit' || reportType === 'audit-trail') &&
            reportData.voidedTransactions &&
            reportData.voidedTransactions.length > 0 && (
            <Card className="border-amber-500/30">
              <CardHeader className="p-3 pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    Voided / Reversed Transactions
                  </CardTitle>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-amber-500/10 text-amber-600 border-amber-500/20">
                    {reportData.voidedTransactions.length} voided
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="text-xs">Type</TableHead>
                      <TableHead className="text-xs">Reference</TableHead>
                      <TableHead className="text-xs">Date</TableHead>
                      <TableHead className="text-xs">Void Reason</TableHead>
                      <TableHead className="text-xs text-right">Original Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reportData.voidedTransactions.map((vt: any, idx: number) => (
                      <TableRow key={idx} className="text-muted-foreground">
                        <TableCell className="text-xs py-1.5">
                          <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-red-500/10 text-red-600 border-red-500/20">
                            {vt.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs py-1.5 line-through">{vt.reference || '-'}</TableCell>
                        <TableCell className="text-xs py-1.5">{formatDateTime(vt.voidedDate)}</TableCell>
                        <TableCell className="text-xs py-1.5">{vt.voidReason || 'No reason'}</TableCell>
                        <TableCell className="text-xs py-1.5 text-right font-semibold text-red-600 dark:text-red-400">
                          {formatCurrency(vt.originalAmount)}
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

      {/* Empty state */}
      {!reportData && !error && !isGenerating && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <config.icon className="w-12 h-12 mx-auto mb-3 text-muted-foreground/20" />
            <p className="text-sm font-medium text-muted-foreground">Select filters and click "Generate Report"</p>
            <p className="text-xs text-muted-foreground/60 mt-1">{config.description}</p>
          </div>
        </div>
      )}
    </div>
  )
}
