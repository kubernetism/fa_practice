import React, { useState, useEffect, useCallback } from 'react'
import {
  Search,
  RefreshCw,
  Settings,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Filter,
  Download,
  Percent,
  AlertCircle,
  CheckCircle,
  Clock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useBranch } from '@/contexts/branch-context'
import { useCurrentBranchSettings } from '@/contexts/settings-context'
import { formatCurrency, formatDateTime, cn } from '@/lib/utils'

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
  const filteredRecords = taxRecords.filter((record) => {
    const matchesSearch =
      record.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (record.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
    const matchesStatus = statusFilter === 'all' || record.paymentStatus === statusFilter
    return matchesSearch && matchesStatus
  })

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-lg">Loading tax collections...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tax Collections</h1>
          <p className="text-muted-foreground">
            Track collected and pending taxes • {currentBranch?.name || 'Select a branch'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchTaxData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setShowSettingsDialog(true)}>
            <Settings className="h-4 w-4 mr-2" />
            Tax Settings
          </Button>
        </div>
      </div>

      {/* Current Tax Rate Display */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Percent className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Tax Rate</p>
                <p className="text-2xl font-bold">
                  {taxSettings.taxName}: {taxSettings.taxRate}%
                  {taxSettings.secondaryTaxRate > 0 && (
                    <span className="text-lg ml-2">
                      + {taxSettings.secondaryTaxName || 'Secondary'}: {taxSettings.secondaryTaxRate}%
                    </span>
                  )}
                </p>
              </div>
            </div>
            <div className="flex gap-4 text-sm">
              <Badge variant={taxSettings.isTaxInclusive ? 'default' : 'secondary'}>
                {taxSettings.isTaxInclusive ? 'Tax Inclusive' : 'Tax Exclusive'}
              </Badge>
              <Badge variant={taxSettings.showTaxOnReceipt ? 'default' : 'secondary'}>
                {taxSettings.showTaxOnReceipt ? 'Shown on Receipt' : 'Hidden on Receipt'}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Collected</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(taxSummary?.totalCollected || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              From {taxSummary?.paidSales || 0} paid sales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Collection</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {formatCurrency(taxSummary?.totalPending || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              From {taxSummary?.pendingSales || 0} pending sales
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tax Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency((taxSummary?.totalCollected || 0) + (taxSummary?.totalPending || 0))}
            </div>
            <p className="text-xs text-muted-foreground">Collected + Pending</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Tax Per Sale</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(taxSummary?.averageTaxPerSale || 0)}
            </div>
            <p className="text-xs text-muted-foreground">Per transaction</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by invoice or customer..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-[150px]">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange((prev) => ({ ...prev, startDate: e.target.value }))}
              />
            </div>
            <div className="w-[150px]">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange((prev) => ({ ...prev, endDate: e.target.value }))}
              />
            </div>
            <div className="w-[150px]">
              <Label htmlFor="status">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="partial">Partial</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tax Records Table */}
      <Card className="flex-1">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Tax Records</CardTitle>
              <CardDescription>
                Showing {filteredRecords.length} of {taxRecords.length} records
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="text-right">Subtotal</TableHead>
                <TableHead className="text-right">Tax Amount</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No tax records found for the selected period
                  </TableCell>
                </TableRow>
              ) : (
                filteredRecords.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{record.invoiceNumber}</TableCell>
                    <TableCell>{formatDateTime(record.saleDate)}</TableCell>
                    <TableCell>{record.customerName || 'Walk-in'}</TableCell>
                    <TableCell className="text-right">{formatCurrency(record.subtotal)}</TableCell>
                    <TableCell className="text-right font-medium text-primary">
                      {formatCurrency(record.taxAmount)}
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(record.totalAmount)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          record.paymentStatus === 'paid'
                            ? 'default'
                            : record.paymentStatus === 'partial'
                            ? 'secondary'
                            : 'destructive'
                        }
                      >
                        {record.paymentStatus === 'paid' && <CheckCircle className="h-3 w-3 mr-1" />}
                        {record.paymentStatus === 'pending' && <Clock className="h-3 w-3 mr-1" />}
                        {record.paymentStatus === 'partial' && <AlertCircle className="h-3 w-3 mr-1" />}
                        {record.paymentStatus.charAt(0).toUpperCase() + record.paymentStatus.slice(1)}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Tax Settings Dialog */}
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
  )
}

export default TaxCollectionsScreen
