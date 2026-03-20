import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Search,
  RefreshCw,
  Settings,
  X,
  ChevronLeft,
  ChevronRight,
  Percent,
  AlertCircle,
  CheckCircle,
  Clock,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip'
import { useBranch } from '@/contexts/branch-context'
import { useCurrentBranchSettings } from '@/contexts/settings-context'
import { formatCurrency, formatDateTime, cn } from '@/lib/utils'

// ─── Constants ───────────────────────────────────────────────────────────────

const ITEMS_PER_PAGE = 15

// ─── Interfaces ──────────────────────────────────────────────────────────────

interface TaxSummary {
  totalCollected: number
  totalPending: number
  paidSales: number
  pendingSales: number
  averageTaxPerSale: number
}

interface TaxRecord {
  id: number
  invoiceNumber: string
  saleDate: string
  subtotal: number
  taxAmount: number
  totalAmount: number
  paymentStatus: 'paid' | 'partial' | 'pending'
  customerName: string | null
}

interface TaxSettings {
  taxRate: number
  taxName: string
  secondaryTaxRate: number
  secondaryTaxName: string | null
  isTaxInclusive: boolean
  showTaxOnReceipt: boolean
}

export function TaxCollectionsScreen() {
  const { currentBranch } = useBranch()
  const { settings, refreshSettings } = useCurrentBranchSettings()
  const [taxSummary, setTaxSummary] = useState<TaxSummary | null>(null)
  const [taxRecords, setTaxRecords] = useState<TaxRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  })
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showSettingsDialog, setShowSettingsDialog] = useState(false)
  const [taxSettings, setTaxSettings] = useState<TaxSettings>({
    taxRate: 0,
    taxName: 'GST',
    secondaryTaxRate: 0,
    secondaryTaxName: null,
    isTaxInclusive: false,
    showTaxOnReceipt: true,
  })
  const [isSaving, setIsSaving] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  // Load tax data
  const fetchTaxData = useCallback(async () => {
    if (!currentBranch) return

    try {
      setIsLoading(true)

      // Get tax summary from sales
      const response = await window.api.taxCollections.getSummary({
        branchId: currentBranch.id,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      })

      if (response?.success) {
        setTaxSummary(response.data.summary)
        setTaxRecords(response.data.records)
      }
    } catch (error) {
      console.error('Failed to fetch tax data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [currentBranch, dateRange])

  // Load settings
  useEffect(() => {
    if (settings) {
      setTaxSettings({
        taxRate: settings.taxRate ?? 0,
        taxName: settings.taxName ?? 'GST',
        secondaryTaxRate: settings.secondaryTaxRate ?? 0,
        secondaryTaxName: settings.secondaryTaxName ?? null,
        isTaxInclusive: settings.isTaxInclusive ?? false,
        showTaxOnReceipt: settings.showTaxOnReceipt ?? true,
      })
    }
  }, [settings])

  useEffect(() => {
    fetchTaxData()
  }, [fetchTaxData])

  // Save tax settings
  const handleSaveSettings = async () => {
    try {
      setIsSaving(true)

      // Get current user for update
      const userResponse = await window.api.auth.getCurrentUser()
      if (!userResponse?.success) {
        alert('Failed to get current user')
        return
      }

      // Get current settings ID
      const globalSettings = await window.api.businessSettings.getGlobal()
      if (!globalSettings?.success || !globalSettings.data) {
        alert('Failed to get settings')
        return
      }

      const response = await window.api.businessSettings.update(
        userResponse.data.id,
        globalSettings.data.settingId,
        {
          taxRate: taxSettings.taxRate,
          taxName: taxSettings.taxName,
          secondaryTaxRate: taxSettings.secondaryTaxRate,
          secondaryTaxName: taxSettings.secondaryTaxName,
          isTaxInclusive: taxSettings.isTaxInclusive,
          showTaxOnReceipt: taxSettings.showTaxOnReceipt,
        }
      )

      if (response?.success) {
        await refreshSettings()
        setShowSettingsDialog(false)
        alert('Tax settings updated successfully!')
      } else {
        alert(response?.message || 'Failed to update settings')
      }
    } catch (error) {
      console.error('Failed to save settings:', error)
      alert('Failed to save settings')
    } finally {
      setIsSaving(false)
    }
  }

  // Filter records
  const filteredRecords = useMemo(() => {
    return taxRecords.filter((record) => {
      const matchesSearch =
        record.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (record.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
      const matchesStatus = statusFilter === 'all' || record.paymentStatus === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [taxRecords, searchTerm, statusFilter])

  // Pagination
  const { totalPages, safePage, pageStart, pageRecords } = useMemo(() => {
    const totalPages = Math.max(1, Math.ceil(filteredRecords.length / ITEMS_PER_PAGE))
    const safePage = Math.min(currentPage, totalPages)
    const pageStart = (safePage - 1) * ITEMS_PER_PAGE
    const pageRecords = filteredRecords.slice(pageStart, pageStart + ITEMS_PER_PAGE)
    return { totalPages, safePage, pageStart, pageRecords }
  }, [filteredRecords, currentPage])

  // ─── Loading state ────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Loading tax collections...</p>
      </div>
    )
  }

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <TooltipProvider>
      <div className="space-y-3">
        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-xl font-semibold leading-tight">Tax Collections</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {currentBranch?.name || 'Select a branch'}
            </p>
            {/* Stat pills */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                Collected: {formatCurrency(taxSummary?.totalCollected || 0)}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium">
                <span className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
                Pending: {formatCurrency(taxSummary?.totalPending || 0)}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium">
                Total: {formatCurrency((taxSummary?.totalCollected || 0) + (taxSummary?.totalPending || 0))}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium">
                Avg/Sale: {formatCurrency(taxSummary?.averageTaxPerSale || 0)}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex shrink-0 items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowSettingsDialog(true)}>
              <Settings className="h-3.5 w-3.5 mr-1.5" />
              Tax Settings
            </Button>
          </div>
        </div>

        {/* ── Tax Rate Banner ── */}
        <div className="rounded-md border border-primary/20 bg-primary/5 p-2.5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <Percent className="h-4 w-4 text-primary shrink-0" />
              <span className="text-sm font-medium">
                {taxSettings.taxName}: {taxSettings.taxRate}%
                {taxSettings.secondaryTaxRate > 0 && (
                  <span className="text-muted-foreground ml-2">
                    + {taxSettings.secondaryTaxName || 'Secondary'}: {taxSettings.secondaryTaxRate}%
                  </span>
                )}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Badge
                variant={taxSettings.isTaxInclusive ? 'default' : 'secondary'}
                className="text-[10px] px-1.5 py-0"
              >
                {taxSettings.isTaxInclusive ? 'Inclusive' : 'Exclusive'}
              </Badge>
              <Badge
                variant={taxSettings.showTaxOnReceipt ? 'default' : 'secondary'}
                className="text-[10px] px-1.5 py-0"
              >
                {taxSettings.showTaxOnReceipt ? 'On Receipt' : 'Hidden'}
              </Badge>
            </div>
          </div>
        </div>

        {/* ── Filters Row ── */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search by invoice or customer..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className="h-8 pl-8 pr-8 text-sm"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => { setSearchTerm(''); setCurrentPage(1) }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <Input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => setDateRange((prev) => ({ ...prev, startDate: e.target.value }))}
            className="h-8 w-[140px] text-sm"
          />
          <Input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => setDateRange((prev) => ({ ...prev, endDate: e.target.value }))}
            className="h-8 w-[140px] text-sm"
          />
          <Select
            value={statusFilter}
            onValueChange={(value) => {
              setStatusFilter(value)
              setCurrentPage(1)
            }}
          >
            <SelectTrigger className="h-8 w-[120px] text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="partial">Partial</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
            </SelectContent>
          </Select>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={fetchTaxData}
                aria-label="Refresh tax data"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Refresh</TooltipContent>
          </Tooltip>
        </div>

        {/* ── Table ── */}
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="text-[10px] font-semibold tracking-wider uppercase h-8 py-0">
                  Invoice
                </TableHead>
                <TableHead className="text-[10px] font-semibold tracking-wider uppercase h-8 py-0">
                  Date
                </TableHead>
                <TableHead className="text-[10px] font-semibold tracking-wider uppercase h-8 py-0">
                  Customer
                </TableHead>
                <TableHead className="text-[10px] font-semibold tracking-wider uppercase h-8 py-0 text-right">
                  Subtotal
                </TableHead>
                <TableHead className="text-[10px] font-semibold tracking-wider uppercase h-8 py-0 text-right">
                  Tax Amount
                </TableHead>
                <TableHead className="text-[10px] font-semibold tracking-wider uppercase h-8 py-0 text-right">
                  Total
                </TableHead>
                <TableHead className="text-[10px] font-semibold tracking-wider uppercase h-8 py-0">
                  Status
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pageRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-sm text-muted-foreground">
                    No tax records found for the selected period
                  </TableCell>
                </TableRow>
              ) : (
                pageRecords.map((record) => (
                  <TableRow key={record.id} className="h-9 group">
                    <TableCell className="py-1.5 text-xs font-medium">
                      {record.invoiceNumber}
                    </TableCell>
                    <TableCell className="py-1.5 text-xs text-muted-foreground">
                      {formatDateTime(record.saleDate)}
                    </TableCell>
                    <TableCell className="py-1.5 text-xs">
                      {record.customerName || <span className="text-muted-foreground/50">Walk-in</span>}
                    </TableCell>
                    <TableCell className="py-1.5 text-xs text-right tabular-nums">
                      {formatCurrency(record.subtotal)}
                    </TableCell>
                    <TableCell className="py-1.5 text-xs text-right tabular-nums font-medium text-primary">
                      {formatCurrency(record.taxAmount)}
                    </TableCell>
                    <TableCell className="py-1.5 text-xs text-right tabular-nums">
                      {formatCurrency(record.totalAmount)}
                    </TableCell>
                    <TableCell className="py-1.5">
                      <Badge
                        variant={
                          record.paymentStatus === 'paid'
                            ? 'default'
                            : record.paymentStatus === 'partial'
                            ? 'secondary'
                            : 'destructive'
                        }
                        className="text-[10px] px-1.5 py-0"
                      >
                        {record.paymentStatus === 'paid' && <CheckCircle className="h-2.5 w-2.5 mr-0.5" />}
                        {record.paymentStatus === 'pending' && <Clock className="h-2.5 w-2.5 mr-0.5" />}
                        {record.paymentStatus === 'partial' && <AlertCircle className="h-2.5 w-2.5 mr-0.5" />}
                        {record.paymentStatus.charAt(0).toUpperCase() + record.paymentStatus.slice(1)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* ── Pagination ── */}
        {filteredRecords.length > ITEMS_PER_PAGE && (
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {pageStart + 1}–{Math.min(pageStart + ITEMS_PER_PAGE, filteredRecords.length)} of{' '}
              {filteredRecords.length}
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                disabled={safePage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                aria-label="Previous page"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              <span className="px-1 tabular-nums">
                {safePage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                disabled={safePage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                aria-label="Next page"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}

        {/* ── Tax Settings Dialog ── */}
        <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Tax Settings</DialogTitle>
              <DialogDescription>
                Configure tax rates. Changes will sync with Settings.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="taxName">Primary Tax Name</Label>
                  <Input
                    id="taxName"
                    value={taxSettings.taxName}
                    onChange={(e) => setTaxSettings((prev) => ({ ...prev, taxName: e.target.value }))}
                    placeholder="e.g., GST, VAT"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="taxRate">Tax Rate (%)</Label>
                  <Input
                    id="taxRate"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={taxSettings.taxRate}
                    onChange={(e) =>
                      setTaxSettings((prev) => ({ ...prev, taxRate: parseFloat(e.target.value) || 0 }))
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="secondaryTaxName">Secondary Tax Name</Label>
                  <Input
                    id="secondaryTaxName"
                    value={taxSettings.secondaryTaxName || ''}
                    onChange={(e) =>
                      setTaxSettings((prev) => ({ ...prev, secondaryTaxName: e.target.value || null }))
                    }
                    placeholder="Optional"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secondaryTaxRate">Secondary Rate (%)</Label>
                  <Input
                    id="secondaryTaxRate"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={taxSettings.secondaryTaxRate}
                    onChange={(e) =>
                      setTaxSettings((prev) => ({
                        ...prev,
                        secondaryTaxRate: parseFloat(e.target.value) || 0,
                      }))
                    }
                  />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="isTaxInclusive">Tax Inclusive Pricing</Label>
                <input
                  id="isTaxInclusive"
                  type="checkbox"
                  checked={taxSettings.isTaxInclusive}
                  onChange={(e) =>
                    setTaxSettings((prev) => ({ ...prev, isTaxInclusive: e.target.checked }))
                  }
                  className="h-4 w-4"
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="showTaxOnReceipt">Show Tax on Receipt</Label>
                <input
                  id="showTaxOnReceipt"
                  type="checkbox"
                  checked={taxSettings.showTaxOnReceipt}
                  onChange={(e) =>
                    setTaxSettings((prev) => ({ ...prev, showTaxOnReceipt: e.target.checked }))
                  }
                  className="h-4 w-4"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowSettingsDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveSettings} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  )
}

export default TaxCollectionsScreen
