import React, { useState, useEffect, useCallback } from 'react'
import {
  ClipboardList,
  Plus,
  Play,
  CheckCircle,
  XCircle,
  FileText,
  RefreshCw,
  AlertTriangle,
  ArrowUpDown,
  Package,
  Search,
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
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { useBranch } from '@/contexts/branch-context'
import { useAuth } from '@/contexts/auth-context'
import { formatCurrency, formatDateTime, cn } from '@/lib/utils'

interface InventoryCount {
  id: number
  countNumber: string
  branchId: number
  countType: 'full' | 'cycle' | 'spot' | 'annual'
  status: 'draft' | 'in_progress' | 'completed' | 'cancelled'
  scheduledDate?: string
  startedAt?: string
  completedAt?: string
  totalItems: number
  itemsCounted: number
  varianceCount: number
  varianceValue: number
  notes?: string
  branch?: { name: string }
  createdByUser?: { username: string }
}

interface CountItem {
  id: number
  countId: number
  productId: number
  expectedQuantity: number
  expectedCost: number
  countedQuantity: number | null
  varianceQuantity: number | null
  varianceValue: number | null
  variancePercent: number | null
  adjustmentCreated: boolean
  notes?: string
  product?: { name: string; sku: string }
}

interface VarianceReportData {
  summary: {
    countNumber: string
    countType: string
    status: string
    branchName: string
    completedAt: string
    totalItems: number
    itemsCounted: number
    totalExpectedValue: number
    totalCountedValue: number
    totalVarianceValue: number
    variancePercent: number
    itemsWithVariance: number
    positiveVarianceCount: number
    positiveVarianceValue: number
    negativeVarianceCount: number
    negativeVarianceValue: number
  }
  items: Array<{
    productId: number
    productName: string
    sku: string
    expectedQuantity: number
    countedQuantity: number
    varianceQuantity: number
    varianceValue: number
    variancePercent: number
    adjustmentCreated: boolean
  }>
}

export function CycleCountManager() {
  const { currentBranch } = useBranch()
  const { user } = useAuth()

  // State
  const [counts, setCounts] = useState<InventoryCount[]>([])
  const [selectedCount, setSelectedCount] = useState<InventoryCount | null>(null)
  const [countItems, setCountItems] = useState<CountItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isCountDialogOpen, setIsCountDialogOpen] = useState(false)
  const [isVarianceDialogOpen, setIsVarianceDialogOpen] = useState(false)
  const [varianceReport, setVarianceReport] = useState<VarianceReportData | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  // Create form state
  const [createForm, setCreateForm] = useState({
    countType: 'cycle' as 'full' | 'cycle' | 'spot' | 'annual',
    scheduledDate: new Date().toISOString().split('T')[0],
    notes: '',
  })

  // Fetch counts
  const fetchCounts = useCallback(async () => {
    if (!currentBranch?.id) return
    try {
      setIsLoading(true)
      const result = await window.api.inventoryCounts.list(currentBranch.id)
      if (result.success && result.data) {
        setCounts(result.data)
      }
    } catch (error) {
      console.error('Failed to fetch counts:', error)
    } finally {
      setIsLoading(false)
    }
  }, [currentBranch?.id])

  useEffect(() => {
    fetchCounts()
  }, [fetchCounts])

  // Create new count
  const handleCreateCount = async () => {
    if (!currentBranch?.id) {
      alert('Please select a branch first')
      return
    }
    if (!user?.userId) {
      alert('User not logged in')
      return
    }
    try {
      console.log('Creating count with:', {
        branchId: currentBranch.id,
        countType: createForm.countType,
        scheduledDate: createForm.scheduledDate,
        notes: createForm.notes,
        userId: user.userId,
      })
      const result = await window.api.inventoryCounts.create({
        branchId: currentBranch.id,
        countType: createForm.countType,
        scheduledDate: createForm.scheduledDate,
        notes: createForm.notes,
        userId: user.userId,
      })

      console.log('Create count result:', result)

      if (result.success) {
        setIsCreateDialogOpen(false)
        setCreateForm({
          countType: 'cycle',
          scheduledDate: new Date().toISOString().split('T')[0],
          notes: '',
        })
        fetchCounts()
      } else {
        alert(result.message || 'Failed to create count')
      }
    } catch (error) {
      console.error('Failed to create count:', error)
      alert('Failed to create count: ' + (error instanceof Error ? error.message : 'Unknown error'))
    }
  }

  // Start count
  const handleStartCount = async (countId: number) => {
    if (!user?.userId) return
    try {
      const result = await window.api.inventoryCounts.start(countId, user.userId)
      if (result.success) {
        fetchCounts()
      } else {
        alert(result.message)
      }
    } catch (error) {
      console.error('Failed to start count:', error)
    }
  }

  // Open count for counting
  const handleOpenCount = async (count: InventoryCount) => {
    try {
      const result = await window.api.inventoryCounts.get(count.id)
      if (result.success && result.data) {
        setSelectedCount(result.data)
        setCountItems(result.data.items || [])
        setIsCountDialogOpen(true)
      }
    } catch (error) {
      console.error('Failed to get count:', error)
    }
  }

  // Record count for item
  const handleRecordCount = async (itemId: number, countedQuantity: number) => {
    if (!user?.userId) return
    try {
      const result = await window.api.inventoryCounts.recordCount({
        countItemId: itemId,
        countedQuantity,
        userId: user.userId,
      })

      if (result.success) {
        // Update local state
        setCountItems((prev) =>
          prev.map((item) =>
            item.id === itemId
              ? {
                  ...item,
                  countedQuantity,
                  varianceQuantity: result.data?.varianceQuantity,
                  varianceValue: result.data?.varianceValue,
                  variancePercent: result.data?.variancePercent,
                }
              : item
          )
        )
      }
    } catch (error) {
      console.error('Failed to record count:', error)
    }
  }

  // Complete count
  const handleCompleteCount = async () => {
    if (!selectedCount || !user?.userId) return
    try {
      const result = await window.api.inventoryCounts.complete(selectedCount.id, user.userId)
      if (result.success) {
        setIsCountDialogOpen(false)
        fetchCounts()
      } else {
        alert(result.message)
      }
    } catch (error) {
      console.error('Failed to complete count:', error)
    }
  }

  // Cancel count
  const handleCancelCount = async (countId: number) => {
    if (!user?.userId) return
    if (!confirm('Are you sure you want to cancel this count?')) return
    try {
      const result = await window.api.inventoryCounts.cancel(countId, user.userId)
      if (result.success) {
        fetchCounts()
      } else {
        alert(result.message)
      }
    } catch (error) {
      console.error('Failed to cancel count:', error)
    }
  }

  // View variance report
  const handleViewVarianceReport = async (countId: number) => {
    try {
      const result = await window.api.inventoryCounts.varianceReport(countId)
      if (result.success && result.data) {
        setVarianceReport(result.data)
        setIsVarianceDialogOpen(true)
      }
    } catch (error) {
      console.error('Failed to get variance report:', error)
    }
  }

  // Apply adjustments
  const handleApplyAdjustments = async (countId: number) => {
    if (!user?.userId) return
    if (!confirm('This will update inventory quantities based on count variances. Continue?')) return
    try {
      const result = await window.api.inventoryCounts.applyAdjustments(countId, user.userId)
      if (result.success) {
        alert(`Applied ${result.data?.adjustedCount} inventory adjustments`)
        fetchCounts()
        if (varianceReport) {
          handleViewVarianceReport(countId)
        }
      } else {
        alert(result.message)
      }
    } catch (error) {
      console.error('Failed to apply adjustments:', error)
    }
  }

  // Filter items by search
  const filteredItems = countItems.filter(
    (item) =>
      item.product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.product?.sku?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="secondary">Draft</Badge>
      case 'in_progress':
        return <Badge variant="default">In Progress</Badge>
      case 'completed':
        return <Badge className="bg-green-600">Completed</Badge>
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  // Count type label
  const getCountTypeLabel = (type: string) => {
    switch (type) {
      case 'full':
        return 'Full Inventory'
      case 'cycle':
        return 'Cycle Count'
      case 'spot':
        return 'Spot Check'
      case 'annual':
        return 'Annual Count'
      default:
        return type
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Cycle Counts</h3>
          <p className="text-sm text-muted-foreground">
            Manage inventory counts and reconciliation
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Count
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Counts</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Play className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {counts.filter((c) => c.status === 'in_progress').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {counts.filter((c) => c.status === 'completed').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Variance</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                counts
                  .filter((c) => c.status === 'completed')
                  .reduce((sum, c) => sum + (c.varianceValue || 0), 0)
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Counts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Count Sessions</CardTitle>
        </CardHeader>
        <CardContent>
          {counts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <ClipboardList className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No cycle counts yet</p>
              <p className="text-sm text-muted-foreground">
                Create a new count to start reconciling inventory
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Count #</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Scheduled</TableHead>
                  <TableHead className="text-center">Items</TableHead>
                  <TableHead className="text-center">Progress</TableHead>
                  <TableHead className="text-right">Variance</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {counts.map((count) => (
                  <TableRow key={count.id}>
                    <TableCell className="font-medium">{count.countNumber}</TableCell>
                    <TableCell>{getCountTypeLabel(count.countType)}</TableCell>
                    <TableCell>{getStatusBadge(count.status)}</TableCell>
                    <TableCell>
                      {count.scheduledDate
                        ? new Date(count.scheduledDate).toLocaleDateString()
                        : '-'}
                    </TableCell>
                    <TableCell className="text-center">{count.totalItems}</TableCell>
                    <TableCell className="text-center">
                      {count.itemsCounted}/{count.totalItems}
                    </TableCell>
                    <TableCell className="text-right">
                      {count.status === 'completed' ? (
                        <span
                          className={cn(
                            'font-medium',
                            (count.varianceValue || 0) < 0
                              ? 'text-red-600'
                              : (count.varianceValue || 0) > 0
                                ? 'text-green-600'
                                : ''
                          )}
                        >
                          {formatCurrency(count.varianceValue || 0)}
                        </span>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {count.status === 'draft' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStartCount(count.id)}
                            >
                              <Play className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleCancelCount(count.id)}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {count.status === 'in_progress' && (
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleOpenCount(count)}
                          >
                            <ClipboardList className="mr-1 h-4 w-4" />
                            Count
                          </Button>
                        )}
                        {count.status === 'completed' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleViewVarianceReport(count.id)}
                            >
                              <FileText className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handleApplyAdjustments(count.id)}
                            >
                              <ArrowUpDown className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create Count Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Count</DialogTitle>
            <DialogDescription>
              Start a new inventory count session. All active products will be included.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Count Type</Label>
              <Select
                value={createForm.countType}
                onValueChange={(value: any) =>
                  setCreateForm((prev) => ({ ...prev, countType: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full">Full Inventory Count</SelectItem>
                  <SelectItem value="cycle">Cycle Count</SelectItem>
                  <SelectItem value="spot">Spot Check</SelectItem>
                  <SelectItem value="annual">Annual Count</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Scheduled Date</Label>
              <Input
                type="date"
                value={createForm.scheduledDate}
                onChange={(e) =>
                  setCreateForm((prev) => ({ ...prev, scheduledDate: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Notes (Optional)</Label>
              <Textarea
                value={createForm.notes}
                onChange={(e) =>
                  setCreateForm((prev) => ({ ...prev, notes: e.target.value }))
                }
                placeholder="Any notes about this count..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateCount}>Create Count</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Count Entry Dialog */}
      <Dialog open={isCountDialogOpen} onOpenChange={setIsCountDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>
              Count: {selectedCount?.countNumber}
              <span className="ml-2">{getStatusBadge(selectedCount?.status || '')}</span>
            </DialogTitle>
            <DialogDescription>
              Enter the actual counted quantities for each product
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Progress */}
            <div className="flex items-center gap-4 text-sm">
              <span>
                Progress: {countItems.filter((i) => i.countedQuantity !== null).length}/
                {countItems.length} items
              </span>
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all"
                  style={{
                    width: `${(countItems.filter((i) => i.countedQuantity !== null).length / countItems.length) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Items Table */}
            <ScrollArea className="h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead className="text-center">Expected</TableHead>
                    <TableHead className="text-center">Counted</TableHead>
                    <TableHead className="text-center">Variance</TableHead>
                    <TableHead className="text-right">Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item) => (
                    <TableRow
                      key={item.id}
                      className={cn(
                        item.varianceQuantity !== null && item.varianceQuantity !== 0
                          ? item.varianceQuantity < 0
                            ? 'bg-red-50'
                            : 'bg-green-50'
                          : ''
                      )}
                    >
                      <TableCell className="font-medium">
                        {item.product?.name || `Product #${item.productId}`}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {item.product?.sku || '-'}
                      </TableCell>
                      <TableCell className="text-center">{item.expectedQuantity}</TableCell>
                      <TableCell className="text-center">
                        <Input
                          type="number"
                          min="0"
                          className="w-20 text-center"
                          value={item.countedQuantity ?? ''}
                          onChange={(e) => {
                            const value = parseInt(e.target.value) || 0
                            handleRecordCount(item.id, value)
                          }}
                          placeholder="-"
                        />
                      </TableCell>
                      <TableCell className="text-center">
                        {item.varianceQuantity !== null ? (
                          <span
                            className={cn(
                              'font-medium',
                              item.varianceQuantity < 0
                                ? 'text-red-600'
                                : item.varianceQuantity > 0
                                  ? 'text-green-600'
                                  : ''
                            )}
                          >
                            {item.varianceQuantity > 0 ? '+' : ''}
                            {item.varianceQuantity}
                          </span>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.varianceValue !== null ? (
                          <span
                            className={cn(
                              item.varianceValue < 0
                                ? 'text-red-600'
                                : item.varianceValue > 0
                                  ? 'text-green-600'
                                  : ''
                            )}
                          >
                            {formatCurrency(item.varianceValue)}
                          </span>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCountDialogOpen(false)}>
              Close
            </Button>
            <Button
              onClick={handleCompleteCount}
              disabled={countItems.some((i) => i.countedQuantity === null)}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Complete Count
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Variance Report Dialog */}
      <Dialog open={isVarianceDialogOpen} onOpenChange={setIsVarianceDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Variance Report: {varianceReport?.summary.countNumber}</DialogTitle>
            <DialogDescription>
              Completed: {varianceReport?.summary.completedAt ? formatDateTime(varianceReport.summary.completedAt) : '-'}
            </DialogDescription>
          </DialogHeader>

          {varianceReport && (
            <div className="space-y-4">
              {/* Summary Cards */}
              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-sm text-muted-foreground">Expected Value</div>
                    <div className="text-xl font-bold">
                      {formatCurrency(varianceReport.summary.totalExpectedValue)}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-sm text-muted-foreground">Counted Value</div>
                    <div className="text-xl font-bold">
                      {formatCurrency(varianceReport.summary.totalCountedValue)}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-sm text-muted-foreground">Total Variance</div>
                    <div
                      className={cn(
                        'text-xl font-bold',
                        varianceReport.summary.totalVarianceValue < 0
                          ? 'text-red-600'
                          : varianceReport.summary.totalVarianceValue > 0
                            ? 'text-green-600'
                            : ''
                      )}
                    >
                      {formatCurrency(varianceReport.summary.totalVarianceValue)}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4">
                    <div className="text-sm text-muted-foreground">Items with Variance</div>
                    <div className="text-xl font-bold">
                      {varianceReport.summary.itemsWithVariance}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Variance Breakdown */}
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="border-green-200 bg-green-50">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2">
                      <div className="text-green-600 text-sm font-medium">Positive Variance (Surplus)</div>
                    </div>
                    <div className="text-lg font-bold text-green-700">
                      {varianceReport.summary.positiveVarianceCount} items |{' '}
                      {formatCurrency(varianceReport.summary.positiveVarianceValue)}
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-red-200 bg-red-50">
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2">
                      <div className="text-red-600 text-sm font-medium">Negative Variance (Shortage)</div>
                    </div>
                    <div className="text-lg font-bold text-red-700">
                      {varianceReport.summary.negativeVarianceCount} items |{' '}
                      {formatCurrency(varianceReport.summary.negativeVarianceValue)}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Items with Variance */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Items with Variance</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[250px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Product</TableHead>
                          <TableHead>SKU</TableHead>
                          <TableHead className="text-center">Expected</TableHead>
                          <TableHead className="text-center">Counted</TableHead>
                          <TableHead className="text-center">Variance</TableHead>
                          <TableHead className="text-right">Value</TableHead>
                          <TableHead className="text-center">Adjusted</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {varianceReport.items
                          .filter((i) => i.varianceQuantity !== 0)
                          .map((item, idx) => (
                            <TableRow key={idx}>
                              <TableCell className="font-medium">{item.productName}</TableCell>
                              <TableCell className="text-muted-foreground">{item.sku}</TableCell>
                              <TableCell className="text-center">{item.expectedQuantity}</TableCell>
                              <TableCell className="text-center">{item.countedQuantity}</TableCell>
                              <TableCell className="text-center">
                                <span
                                  className={cn(
                                    'font-medium',
                                    item.varianceQuantity < 0
                                      ? 'text-red-600'
                                      : 'text-green-600'
                                  )}
                                >
                                  {item.varianceQuantity > 0 ? '+' : ''}
                                  {item.varianceQuantity}
                                </span>
                              </TableCell>
                              <TableCell className="text-right">
                                <span
                                  className={cn(
                                    item.varianceValue < 0 ? 'text-red-600' : 'text-green-600'
                                  )}
                                >
                                  {formatCurrency(item.varianceValue)}
                                </span>
                              </TableCell>
                              <TableCell className="text-center">
                                {item.adjustmentCreated ? (
                                  <CheckCircle className="h-4 w-4 text-green-600 mx-auto" />
                                ) : (
                                  <XCircle className="h-4 w-4 text-muted-foreground mx-auto" />
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsVarianceDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
