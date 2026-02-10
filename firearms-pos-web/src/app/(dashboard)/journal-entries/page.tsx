'use client'

import { useState, useEffect } from 'react'
import {
  FileText,
  Plus,
  Filter,
  CheckCircle2,
  Clock,
  RotateCcw,
  Eye,
  PlayCircle,
  XCircle,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { getJournalEntries, getJournalEntrySummary, createJournalEntry, postJournalEntry, reverseJournalEntry } from '@/actions/journal-entries'
import { getAccounts } from '@/actions/chart-of-accounts'
import { PageLoader } from '@/components/ui/page-loader'

const statusConfig: Record<string, { color: string; icon: typeof CheckCircle2 }> = {
  draft: { color: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20', icon: Clock },
  posted: { color: 'bg-success/10 text-success border-success/20', icon: CheckCircle2 },
  reversed: { color: 'bg-red-500/10 text-red-400 border-red-500/20', icon: RotateCcw },
}

interface EntryLine {
  accountId: string
  debitAmount: string
  creditAmount: string
  description: string
}

export default function JournalEntriesPage() {
  const [filterStatus, setFilterStatus] = useState('all')
  const [entries, setEntries] = useState<any[]>([])
  const [summary, setSummary] = useState<any>(null)
  const [accounts, setAccounts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    entryDate: '',
    description: '',
  })
  const [entryLines, setEntryLines] = useState<EntryLine[]>([
    { accountId: '', debitAmount: '', creditAmount: '', description: '' },
    { accountId: '', debitAmount: '', creditAmount: '', description: '' },
  ])

  useEffect(() => {
    loadData()
  }, [filterStatus])

  async function loadData() {
    try {
      setLoading(true)
      const [entriesRes, summaryRes, accountsRes] = await Promise.all([
        getJournalEntries({ status: filterStatus }),
        getJournalEntrySummary(),
        getAccounts({ active: 'active' }),
      ])

      if (entriesRes.success) {
        setEntries(entriesRes.data)
      }
      if (summaryRes.success) {
        setSummary(summaryRes.data)
      }
      if (accountsRes.success) {
        setAccounts(accountsRes.data)
      }
    } catch (error) {
      console.error('Failed to load journal entries:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateEntry(e: React.FormEvent) {
    e.preventDefault()
    try {
      const lines = entryLines.filter(line => line.accountId && (line.debitAmount || line.creditAmount))

      if (lines.length < 2) {
        alert('At least 2 entry lines are required')
        return
      }

      const result = await createJournalEntry({
        entryDate: formData.entryDate,
        description: formData.description,
        lines: lines.map(line => ({
          accountId: Number(line.accountId),
          debitAmount: line.debitAmount || '0',
          creditAmount: line.creditAmount || '0',
          description: line.description || undefined,
        })),
      })

      if (result.success) {
        setIsDialogOpen(false)
        setFormData({ entryDate: '', description: '' })
        setEntryLines([
          { accountId: '', debitAmount: '', creditAmount: '', description: '' },
          { accountId: '', debitAmount: '', creditAmount: '', description: '' },
        ])
        loadData()
      } else {
        alert(result.message || 'Failed to create entry')
      }
    } catch (error) {
      console.error('Failed to create entry:', error)
      alert('Failed to create entry')
    }
  }

  async function handlePostEntry(id: number) {
    try {
      const result = await postJournalEntry(id)
      if (result.success) {
        loadData()
      } else {
        alert(result.message || 'Failed to post entry')
      }
    } catch (error) {
      console.error('Failed to post entry:', error)
      alert('Failed to post entry')
    }
  }

  async function handleReverseEntry(id: number) {
    if (!confirm('Are you sure you want to reverse this entry?')) return

    try {
      const result = await reverseJournalEntry(id)
      if (result.success) {
        loadData()
      } else {
        alert(result.message || 'Failed to reverse entry')
      }
    } catch (error) {
      console.error('Failed to reverse entry:', error)
      alert('Failed to reverse entry')
    }
  }

  function addEntryLine() {
    setEntryLines([...entryLines, { accountId: '', debitAmount: '', creditAmount: '', description: '' }])
  }

  function updateEntryLine(index: number, field: keyof EntryLine, value: string) {
    const updated = [...entryLines]
    updated[index][field] = value
    setEntryLines(updated)
  }

  const summaryCards = [
    {
      title: 'Total Entries',
      value: String(summary?.totalEntries || 0),
      icon: FileText,
      accent: 'text-primary'
    },
    {
      title: 'Draft',
      value: String(summary?.draftCount || 0),
      icon: Clock,
      accent: 'text-yellow-400'
    },
    {
      title: 'Posted',
      value: String(summary?.postedCount || 0),
      icon: CheckCircle2,
      accent: 'text-success'
    },
    {
      title: 'Reversed',
      value: String(summary?.reversedCount || 0),
      icon: RotateCcw,
      accent: 'text-red-400'
    },
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Journal Entries</h1>
            <p className="text-sm text-muted-foreground mt-1">Record and manage double-entry transactions</p>
          </div>
        </div>
        <PageLoader />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Journal Entries</h1>
          <p className="text-sm text-muted-foreground mt-1">Record and manage double-entry transactions</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="brass-glow">
              <Plus className="w-4 h-4 mr-2" />
              New Entry
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create Journal Entry</DialogTitle>
            </DialogHeader>
            <form className="space-y-4 mt-4" onSubmit={handleCreateEntry}>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Entry Date</Label>
                  <Input
                    type="date"
                    value={formData.entryDate}
                    onChange={(e) => setFormData({ ...formData, entryDate: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input
                    placeholder="Entry description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="border rounded-lg p-4 space-y-3">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Entry Lines</p>
                <div className="grid grid-cols-12 gap-2 text-xs text-muted-foreground font-medium">
                  <div className="col-span-5">Account</div>
                  <div className="col-span-3 text-right">Debit</div>
                  <div className="col-span-3 text-right">Credit</div>
                  <div className="col-span-1"></div>
                </div>
                {entryLines.map((line, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2">
                    <div className="col-span-5">
                      <Select
                        value={line.accountId}
                        onValueChange={(value) => updateEntryLine(index, 'accountId', value)}
                      >
                        <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select account" /></SelectTrigger>
                        <SelectContent>
                          {accounts.map((account) => (
                            <SelectItem key={account.id} value={String(account.id)}>
                              {account.accountCode} - {account.accountName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-3">
                      <Input
                        type="number"
                        placeholder="0.00"
                        className="h-9 text-sm text-right"
                        value={line.debitAmount}
                        onChange={(e) => updateEntryLine(index, 'debitAmount', e.target.value)}
                      />
                    </div>
                    <div className="col-span-3">
                      <Input
                        type="number"
                        placeholder="0.00"
                        className="h-9 text-sm text-right"
                        value={line.creditAmount}
                        onChange={(e) => updateEntryLine(index, 'creditAmount', e.target.value)}
                      />
                    </div>
                    <div className="col-span-1"></div>
                  </div>
                ))}
                <Button type="button" variant="outline" size="sm" className="w-full" onClick={addEntryLine}>
                  <Plus className="w-3 h-3 mr-1" /> Add Line
                </Button>
              </div>
              <Button type="submit" className="w-full brass-glow">Save as Draft</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card) => (
          <Card key={card.title} className="card-tactical">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{card.title}</p>
                  <p className="text-2xl font-bold tracking-tight">{card.value}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <card.icon className={`w-5 h-5 ${card.accent}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="posted">Posted</SelectItem>
                <SelectItem value="reversed">Reversed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Entry #</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Debit</TableHead>
                <TableHead className="text-right">Credit</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[120px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry) => {
                const cfg = statusConfig[entry.status]
                return (
                  <TableRow key={entry.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <code className="text-sm font-bold font-mono bg-primary/10 text-primary px-2 py-0.5 rounded">
                          {entry.entryNumber}
                        </code>
                        {entry.isAutoGenerated && (
                          <span className="text-[10px] text-muted-foreground/60 uppercase">Auto</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(entry.entryDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-sm font-medium">{entry.description}</TableCell>
                    <TableCell className="text-right text-sm font-semibold">
                      Rs. {Number(entry.totalDebit || 0).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right text-sm font-semibold">
                      Rs. {Number(entry.totalCredit || 0).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[10px] capitalize ${cfg.color}`}>
                        {entry.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" title="View">
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                        {entry.status === 'draft' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-success"
                            title="Post"
                            onClick={() => handlePostEntry(entry.id)}
                          >
                            <PlayCircle className="w-3.5 h-3.5" />
                          </Button>
                        )}
                        {entry.status === 'posted' && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-red-400"
                            title="Reverse"
                            onClick={() => handleReverseEntry(entry.id)}
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
              {entries.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No journal entries found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
