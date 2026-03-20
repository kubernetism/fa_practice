import { useState, useEffect, useMemo } from 'react'
import { RefreshCw, Download, FileText, CheckCircle, Clock, XCircle, RotateCcw, ChevronLeft, ChevronRight, Search, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip'
import { useBranch } from '@/contexts/branch-context'
import { useAuth } from '@/contexts/auth-context'
import { ReversalRequestModal } from '@/components/reversal-request-modal'
import { ReversalStatusBadge } from '@/components/reversal-status-badge'

interface JournalEntryLine {
  id: number
  accountId: number
  debitAmount: number
  creditAmount: number
  description: string | null
  account: {
    id: number
    accountCode: string
    accountName: string
    accountType: string
  } | null
}

interface JournalEntry {
  id: number
  entryNumber: string
  entryDate: string
  description: string
  status: 'draft' | 'posted' | 'reversed'
  referenceType: string | null
  referenceId: number | null
  branchId: number | null
  createdBy: number
  postedBy: number | null
  postedAt: string | null
  createdAt: string
  lines: JournalEntryLine[]
  createdByUser?: { fullName: string } | null
  postedByUser?: { fullName: string } | null
}

interface JournalSummary {
  totalEntries: number
  postedEntries: number
  draftEntries: number
  reversedEntries: number
  totalDebits: number
  totalCredits: number
  isBalanced: boolean
  byReferenceType: Record<string, { count: number; debits: number; credits: number }>
}

export function JournalsScreen() {
  const { currentBranch } = useBranch()
  const { user } = useAuth()

  const [activeTab, setActiveTab] = useState('all')
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [summary, setSummary] = useState<JournalSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null)
  const [showDetail, setShowDetail] = useState(false)

  // Reversal request modal state
  const [isReversalModalOpen, setIsReversalModalOpen] = useState(false)
  const [reversalTargetEntry, setReversalTargetEntry] = useState<JournalEntry | null>(null)

  // Filters
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
  })
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [referenceTypeFilter, setReferenceTypeFilter] = useState<string>('all')

  // Pagination
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const limit = 20

  // Fetch journal entries
  const fetchEntries = async () => {
    try {
      setIsLoading(true)
      const filters: Record<string, unknown> = {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        page,
        limit,
      }

      if (currentBranch?.id) {
        filters.branchId = currentBranch.id
      }

      if (statusFilter !== 'all') {
        filters.status = statusFilter
      }

      if (referenceTypeFilter !== 'all') {
        filters.referenceType = referenceTypeFilter
      }

      const response = await window.api.journal.getAll(filters)
      if (response?.success) {
        setEntries(response.data || [])
        setTotal(response.total || 0)
        setTotalPages(response.totalPages || 1)
      }
    } catch (error) {
      console.error('Failed to fetch journal entries:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch summary
  const fetchSummary = async () => {
    try {
      const params: Record<string, unknown> = {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      }

      if (currentBranch?.id) {
        params.branchId = currentBranch.id
      }

      const response = await window.api.journal.getSummary(params as { branchId?: number; startDate?: string; endDate?: string })
      if (response?.success) {
        setSummary(response.data)
      }
    } catch (error) {
      console.error('Failed to fetch journal summary:', error)
    }
  }

  useEffect(() => {
    fetchEntries()
    fetchSummary()
  }, [dateRange, statusFilter, referenceTypeFilter, page, currentBranch?.id])

  // Export/Download report
  const handleExport = async () => {
    try {
      const params = {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        branchId: currentBranch?.id,
      }

      const response = await window.api.journal.export(params as { branchId?: number; startDate: string; endDate: string })
      if (response?.success) {
        // Create downloadable file
        const dataStr = JSON.stringify(response.data, null, 2)
        const blob = new Blob([dataStr], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `journal-entries-${dateRange.startDate}-to-${dateRange.endDate}.json`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Failed to export journal entries:', error)
    }
  }

  // Export as CSV
  const handleExportCSV = async () => {
    try {
      const params = {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        branchId: currentBranch?.id,
      }

      const response = await window.api.journal.export(params as { branchId?: number; startDate: string; endDate: string })
      if (response?.success) {
        // Convert to CSV
        const entries = response.data.entries
        let csv = 'Entry Number,Date,Description,Status,Reference Type,Ref ID,Account Code,Account Name,Debit,Credit,Line Description\n'

        entries.forEach((entry: { entryNumber: string; entryDate: string; description: string; status: string; referenceType: string; referenceId: number | null; lines: Array<{ accountCode: string; accountName: string; debit: number; credit: number; description: string }> }) => {
          entry.lines.forEach((line) => {
            csv += `"${entry.entryNumber}","${entry.entryDate}","${entry.description}","${entry.status}","${entry.referenceType}","${entry.referenceId || ''}","${line.accountCode}","${line.accountName}",${line.debit},${line.credit},"${line.description || ''}"\n`
          })
        })

        const blob = new Blob([csv], { type: 'text/csv' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `journal-entries-${dateRange.startDate}-to-${dateRange.endDate}.csv`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Failed to export journal entries:', error)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'posted':
        return <Badge className="text-[10px] px-1.5 py-0 bg-green-500/10 text-green-500 border-green-500/20"><CheckCircle className="h-3 w-3 mr-1" />Posted</Badge>
      case 'draft':
        return <Badge variant="secondary" className="text-[10px] px-1.5 py-0"><Clock className="h-3 w-3 mr-1" />Draft</Badge>
      case 'reversed':
        return <Badge variant="destructive" className="text-[10px] px-1.5 py-0"><XCircle className="h-3 w-3 mr-1" />Reversed</Badge>
      default:
        return <Badge variant="outline" className="text-[10px] px-1.5 py-0">{status}</Badge>
    }
  }

  const getReferenceTypeLabel = (type: string | null) => {
    if (!type) return 'Manual'
    const labels: Record<string, string> = {
      sale: 'Sale',
      sale_void: 'Sale Void',
      purchase: 'Purchase',
      expense: 'Expense',
      return: 'Return',
      receivable_payment: 'AR Payment',
      payable_payment: 'AP Payment',
      stock_adjustment: 'Stock Adjustment',
      manual: 'Manual',
    }
    return labels[type] || type
  }

  const viewEntryDetail = (entry: JournalEntry) => {
    setSelectedEntry(entry)
    setShowDetail(true)
  }

  const filteredEntries = useMemo(() => entries.filter((entry) => {
    if (activeTab === 'all') return true
    if (activeTab === 'posted') return entry.status === 'posted'
    if (activeTab === 'draft') return entry.status === 'draft'
    if (activeTab === 'auto') return entry.referenceType !== null
    if (activeTab === 'manual') return entry.referenceType === null
    return true
  }), [entries, activeTab])

  return (
    <TooltipProvider>
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold">Journal Entries</h1>
            {summary && (
              <>
                <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium">
                  {summary.totalEntries} entries
                </span>
                <span className="rounded-full bg-blue-500/10 text-blue-500 px-2.5 py-0.5 text-xs font-medium">
                  Dr {formatCurrency(summary.totalDebits)}
                </span>
                <span className="rounded-full bg-green-500/10 text-green-500 px-2.5 py-0.5 text-xs font-medium">
                  Cr {formatCurrency(summary.totalCredits)}
                </span>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${summary.isBalanced ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                  {summary.isBalanced ? 'Balanced' : 'Unbalanced'}
                </span>
              </>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={handleExportCSV}>
              <Download className="h-3.5 w-3.5 mr-1.5" />
              CSV
            </Button>
            <Button variant="outline" size="sm" className="h-8 text-xs" onClick={handleExport}>
              <FileText className="h-3.5 w-3.5 mr-1.5" />
              JSON
            </Button>
            <Button size="sm" className="h-8 text-xs" onClick={() => { fetchEntries(); fetchSummary() }}>
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Filters - inline row */}
        <div className="flex items-end gap-3">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Start Date</Label>
            <Input
              type="date"
              className="h-8 text-xs w-[140px]"
              value={dateRange.startDate}
              onChange={(e) => {
                setDateRange({ ...dateRange, startDate: e.target.value })
                setPage(1)
              }}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">End Date</Label>
            <Input
              type="date"
              className="h-8 text-xs w-[140px]"
              value={dateRange.endDate}
              onChange={(e) => {
                setDateRange({ ...dateRange, endDate: e.target.value })
                setPage(1)
              }}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Status</Label>
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1) }}>
              <SelectTrigger className="h-8 text-xs w-[130px]">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="posted">Posted</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="reversed">Reversed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Reference Type</Label>
            <Select value={referenceTypeFilter} onValueChange={(v) => { setReferenceTypeFilter(v); setPage(1) }}>
              <SelectTrigger className="h-8 text-xs w-[150px]">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="sale">Sales</SelectItem>
                <SelectItem value="sale_void">Sale Voids</SelectItem>
                <SelectItem value="purchase">Purchases</SelectItem>
                <SelectItem value="expense">Expenses</SelectItem>
                <SelectItem value="return">Returns</SelectItem>
                <SelectItem value="receivable_payment">AR Payments</SelectItem>
                <SelectItem value="payable_payment">AP Payments</SelectItem>
                <SelectItem value="stock_adjustment">Stock Adjustments</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tabs and Table */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="h-8">
            <TabsTrigger value="all" className="h-6 px-2 text-xs">All ({total})</TabsTrigger>
            <TabsTrigger value="posted" className="h-6 px-2 text-xs">Posted</TabsTrigger>
            <TabsTrigger value="draft" className="h-6 px-2 text-xs">Draft</TabsTrigger>
            <TabsTrigger value="auto" className="h-6 px-2 text-xs">Auto-Generated</TabsTrigger>
            <TabsTrigger value="manual" className="h-6 px-2 text-xs">Manual</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-2">
            <div className="rounded-md border overflow-hidden">
              {isLoading ? (
                <div className="text-center py-8 text-sm text-muted-foreground">Loading journal entries...</div>
              ) : filteredEntries.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground">No journal entries found</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead className="text-[10px] font-semibold tracking-wider uppercase">Entry #</TableHead>
                      <TableHead className="text-[10px] font-semibold tracking-wider uppercase">Date</TableHead>
                      <TableHead className="text-[10px] font-semibold tracking-wider uppercase">Description</TableHead>
                      <TableHead className="text-[10px] font-semibold tracking-wider uppercase">Type</TableHead>
                      <TableHead className="text-[10px] font-semibold tracking-wider uppercase">Status</TableHead>
                      <TableHead className="text-[10px] font-semibold tracking-wider uppercase text-right">Debit</TableHead>
                      <TableHead className="text-[10px] font-semibold tracking-wider uppercase text-right">Credit</TableHead>
                      <TableHead className="text-[10px] font-semibold tracking-wider uppercase w-[80px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredEntries.map((entry) => {
                      const totalDebit = entry.lines.reduce((sum, l) => sum + l.debitAmount, 0)
                      const totalCredit = entry.lines.reduce((sum, l) => sum + l.creditAmount, 0)

                      return (
                        <TableRow key={entry.id} className="group h-9">
                          <TableCell className="py-1.5">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs">{entry.entryNumber}</span>
                              <ReversalStatusBadge entityType="journal_entry" entityId={entry.id} />
                            </div>
                          </TableCell>
                          <TableCell className="py-1.5 text-xs">{new Date(entry.entryDate).toLocaleDateString()}</TableCell>
                          <TableCell className="py-1.5 text-xs max-w-[200px] truncate">{entry.description}</TableCell>
                          <TableCell className="py-1.5">
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0">{getReferenceTypeLabel(entry.referenceType)}</Badge>
                          </TableCell>
                          <TableCell className="py-1.5">{getStatusBadge(entry.status)}</TableCell>
                          <TableCell className="py-1.5 text-right font-mono text-xs text-blue-500">{formatCurrency(totalDebit)}</TableCell>
                          <TableCell className="py-1.5 text-right font-mono text-xs text-green-500">{formatCurrency(totalCredit)}</TableCell>
                          <TableCell className="py-1.5">
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => viewEntryDetail(entry)}>
                                    <Eye className="h-3.5 w-3.5" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>View Details</TooltipContent>
                              </Tooltip>
                              {entry.status !== 'reversed' && entry.status !== 'draft' && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7"
                                      onClick={() => {
                                        setReversalTargetEntry(entry)
                                        setIsReversalModalOpen(true)
                                      }}
                                    >
                                      <RotateCcw className="h-3.5 w-3.5 text-amber-500" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Request Reversal</TooltipContent>
                                </Tooltip>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              )}
            </div>

            {/* Pagination */}
            {!isLoading && filteredEntries.length > 0 && (
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-muted-foreground">
                  {((page - 1) * limit) + 1}-{Math.min(page * limit, total)} of {total}
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-muted-foreground">{page} / {totalPages}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    disabled={page <= 1}
                    onClick={() => setPage(page - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    disabled={page >= totalPages}
                    onClick={() => setPage(page + 1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Reversal Request Modal */}
        {reversalTargetEntry && (
          <ReversalRequestModal
            open={isReversalModalOpen}
            onClose={() => {
              setIsReversalModalOpen(false)
              setReversalTargetEntry(null)
            }}
            entityType="journal_entry"
            entityId={reversalTargetEntry.id}
            entityLabel={`Journal Entry #${reversalTargetEntry.entryNumber}`}
            branchId={reversalTargetEntry.branchId ?? currentBranch?.id ?? 0}
            onSuccess={() => { fetchEntries(); fetchSummary() }}
          />
        )}

        {/* Entry Detail Dialog */}
        <Dialog open={showDetail} onOpenChange={setShowDetail}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                Journal Entry: {selectedEntry?.entryNumber}
                {selectedEntry && <ReversalStatusBadge entityType="journal_entry" entityId={selectedEntry.id} />}
              </DialogTitle>
              <DialogDescription>
                {selectedEntry?.description}
              </DialogDescription>
            </DialogHeader>

            {selectedEntry && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Date:</span>{' '}
                    <span className="font-medium">{new Date(selectedEntry.entryDate).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status:</span>{' '}
                    {getStatusBadge(selectedEntry.status)}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Reference:</span>{' '}
                    <span className="font-medium">
                      {getReferenceTypeLabel(selectedEntry.referenceType)}
                      {selectedEntry.referenceId && ` #${selectedEntry.referenceId}`}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Created By:</span>{' '}
                    <span className="font-medium">{selectedEntry.createdByUser?.fullName || 'Unknown'}</span>
                  </div>
                  {selectedEntry.postedAt && (
                    <div>
                      <span className="text-muted-foreground">Posted:</span>{' '}
                      <span className="font-medium">
                        {new Date(selectedEntry.postedAt).toLocaleString()} by {selectedEntry.postedByUser?.fullName}
                      </span>
                    </div>
                  )}
                </div>

                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30">
                        <TableHead className="text-[10px] font-semibold tracking-wider uppercase">Account Code</TableHead>
                        <TableHead className="text-[10px] font-semibold tracking-wider uppercase">Account Name</TableHead>
                        <TableHead className="text-[10px] font-semibold tracking-wider uppercase">Description</TableHead>
                        <TableHead className="text-[10px] font-semibold tracking-wider uppercase text-right">Debit</TableHead>
                        <TableHead className="text-[10px] font-semibold tracking-wider uppercase text-right">Credit</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedEntry.lines.map((line) => (
                        <TableRow key={line.id}>
                          <TableCell className="font-mono text-xs">{line.account?.accountCode}</TableCell>
                          <TableCell className="text-xs">{line.account?.accountName}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{line.description || '-'}</TableCell>
                          <TableCell className="text-right font-mono text-xs">
                            {line.debitAmount > 0 ? formatCurrency(line.debitAmount) : '-'}
                          </TableCell>
                          <TableCell className="text-right font-mono text-xs">
                            {line.creditAmount > 0 ? formatCurrency(line.creditAmount) : '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="font-bold bg-muted/50">
                        <TableCell colSpan={3} className="text-right text-xs">Totals:</TableCell>
                        <TableCell className="text-right font-mono text-xs">
                          {formatCurrency(selectedEntry.lines.reduce((sum, l) => sum + l.debitAmount, 0))}
                        </TableCell>
                        <TableCell className="text-right font-mono text-xs">
                          {formatCurrency(selectedEntry.lines.reduce((sum, l) => sum + l.creditAmount, 0))}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  )
}

export default JournalsScreen
