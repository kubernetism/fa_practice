import { useState, useEffect } from 'react'
import { RefreshCw, Download, FileText, BookOpen, CheckCircle, Clock, XCircle, Filter, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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
import { ScrollArea } from '@/components/ui/scroll-area'
import { useBranch } from '@/contexts/branch-context'
import { useAuth } from '@/contexts/auth-context'
import { ReversalRequestModal } from '@/components/reversal-request-modal'

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
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Posted</Badge>
      case 'draft':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Draft</Badge>
      case 'reversed':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Reversed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
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

  const filteredEntries = entries.filter((entry) => {
    if (activeTab === 'all') return true
    if (activeTab === 'posted') return entry.status === 'posted'
    if (activeTab === 'draft') return entry.status === 'draft'
    if (activeTab === 'auto') return entry.referenceType !== null
    if (activeTab === 'manual') return entry.referenceType === null
    return true
  })

  return (
    <div className="flex flex-col h-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            Journal Entries
          </h1>
          <p className="text-muted-foreground">
            View and manage all journal entries and GL transactions
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <FileText className="h-4 w-4 mr-2" />
            Export JSON
          </Button>
          <Button onClick={() => { fetchEntries(); fetchSummary() }}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Entries</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.totalEntries}</div>
              <p className="text-xs text-muted-foreground">
                {summary.postedEntries} posted, {summary.draftEntries} draft
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Debits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{formatCurrency(summary.totalDebits)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Credits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(summary.totalCredits)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Balance Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${summary.isBalanced ? 'text-green-600' : 'text-red-600'}`}>
                {summary.isBalanced ? 'Balanced' : 'Unbalanced'}
              </div>
              <p className="text-xs text-muted-foreground">
                Diff: {formatCurrency(Math.abs(summary.totalDebits - summary.totalCredits))}
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => {
                  setDateRange({ ...dateRange, startDate: e.target.value })
                  setPage(1)
                }}
              />
            </div>
            <div className="space-y-2">
              <Label>End Date</Label>
              <Input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => {
                  setDateRange({ ...dateRange, endDate: e.target.value })
                  setPage(1)
                }}
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1) }}>
                <SelectTrigger>
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
            <div className="space-y-2">
              <Label>Reference Type</Label>
              <Select value={referenceTypeFilter} onValueChange={(v) => { setReferenceTypeFilter(v); setPage(1) }}>
                <SelectTrigger>
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
        </CardContent>
      </Card>

      {/* Tabs and Table */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
        <TabsList>
          <TabsTrigger value="all">All Entries ({total})</TabsTrigger>
          <TabsTrigger value="posted">Posted</TabsTrigger>
          <TabsTrigger value="draft">Draft</TabsTrigger>
          <TabsTrigger value="auto">Auto-Generated</TabsTrigger>
          <TabsTrigger value="manual">Manual</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="flex-1">
          <Card>
            <CardContent className="pt-6">
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">Loading journal entries...</div>
              ) : filteredEntries.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No journal entries found</div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Entry #</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Debit</TableHead>
                        <TableHead className="text-right">Credit</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredEntries.map((entry) => {
                        const totalDebit = entry.lines.reduce((sum, l) => sum + l.debitAmount, 0)
                        const totalCredit = entry.lines.reduce((sum, l) => sum + l.creditAmount, 0)

                        return (
                          <TableRow key={entry.id}>
                            <TableCell className="font-mono">{entry.entryNumber}</TableCell>
                            <TableCell>{new Date(entry.entryDate).toLocaleDateString()}</TableCell>
                            <TableCell className="max-w-[200px] truncate">{entry.description}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{getReferenceTypeLabel(entry.referenceType)}</Badge>
                            </TableCell>
                            <TableCell>{getStatusBadge(entry.status)}</TableCell>
                            <TableCell className="text-right font-mono">{formatCurrency(totalDebit)}</TableCell>
                            <TableCell className="text-right font-mono">{formatCurrency(totalCredit)}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Button variant="ghost" size="sm" onClick={() => viewEntryDetail(entry)}>
                                  View
                                </Button>
                                {entry.status !== 'reversed' && entry.status !== 'draft' && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setReversalTargetEntry(entry)
                                      setIsReversalModalOpen(true)
                                    }}
                                    title="Request Reversal"
                                  >
                                    <RotateCcw className="h-4 w-4 text-amber-500" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>

                  {/* Pagination */}
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-muted-foreground">
                      Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, total)} of {total} entries
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={page <= 1}
                        onClick={() => setPage(page - 1)}
                      >
                        Previous
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={page >= totalPages}
                        onClick={() => setPage(page + 1)}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
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
            <DialogTitle>Journal Entry: {selectedEntry?.entryNumber}</DialogTitle>
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

              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Account Code</TableHead>
                      <TableHead>Account Name</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Debit</TableHead>
                      <TableHead className="text-right">Credit</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedEntry.lines.map((line) => (
                      <TableRow key={line.id}>
                        <TableCell className="font-mono">{line.account?.accountCode}</TableCell>
                        <TableCell>{line.account?.accountName}</TableCell>
                        <TableCell className="text-muted-foreground">{line.description || '-'}</TableCell>
                        <TableCell className="text-right font-mono">
                          {line.debitAmount > 0 ? formatCurrency(line.debitAmount) : '-'}
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {line.creditAmount > 0 ? formatCurrency(line.creditAmount) : '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow className="font-bold bg-muted/50">
                      <TableCell colSpan={3} className="text-right">Totals:</TableCell>
                      <TableCell className="text-right font-mono">
                        {formatCurrency(selectedEntry.lines.reduce((sum, l) => sum + l.debitAmount, 0))}
                      </TableCell>
                      <TableCell className="text-right font-mono">
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
  )
}

export default JournalsScreen
