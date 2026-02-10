'use client'

import { useState, useEffect } from 'react'
import {
  BookOpen,
  Plus,
  Filter,
  TrendingUp,
  TrendingDown,
  Landmark,
  PiggyBank,
  Wallet,
  Edit,
  Trash2,
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
import { getAccounts, getAccountsSummary, createAccount, deleteAccount } from '@/actions/chart-of-accounts'
import { PageLoader } from '@/components/ui/page-loader'

const accountTypes = ['asset', 'liability', 'equity', 'revenue', 'expense']

const typeIcons: Record<string, typeof TrendingUp> = {
  asset: TrendingUp,
  liability: TrendingDown,
  equity: PiggyBank,
  revenue: Landmark,
  expense: Wallet,
}

const typeColors: Record<string, string> = {
  asset: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  liability: 'bg-red-500/10 text-red-400 border-red-500/20',
  equity: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  revenue: 'bg-green-500/10 text-green-400 border-green-500/20',
  expense: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
}

export default function ChartOfAccountsPage() {
  const [filterType, setFilterType] = useState('all')
  const [accounts, setAccounts] = useState<any[]>([])
  const [summary, setSummary] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    accountCode: '',
    accountName: '',
    accountType: '',
    accountSubType: '',
    description: '',
    normalBalance: '',
  })

  useEffect(() => {
    loadData()
  }, [filterType])

  async function loadData() {
    try {
      setLoading(true)
      const [accountsRes, summaryRes] = await Promise.all([
        getAccounts({ type: filterType }),
        getAccountsSummary(),
      ])

      if (accountsRes.success) {
        setAccounts(accountsRes.data)
      }
      if (summaryRes.success) {
        setSummary(summaryRes.data)
      }
    } catch (error) {
      console.error('Failed to load accounts:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreateAccount(e: React.FormEvent) {
    e.preventDefault()
    try {
      const result = await createAccount({
        accountCode: formData.accountCode,
        accountName: formData.accountName,
        accountType: formData.accountType,
        accountSubType: formData.accountSubType || undefined,
        description: formData.description || undefined,
        normalBalance: formData.normalBalance,
      })

      if (result.success) {
        setIsDialogOpen(false)
        setFormData({
          accountCode: '',
          accountName: '',
          accountType: '',
          accountSubType: '',
          description: '',
          normalBalance: '',
        })
        loadData()
      }
    } catch (error) {
      console.error('Failed to create account:', error)
    }
  }

  async function handleDeleteAccount(id: number) {
    if (!confirm('Are you sure you want to delete this account?')) return

    try {
      const result = await deleteAccount(id)
      if (result.success) {
        loadData()
      } else {
        alert(result.message || 'Failed to delete account')
      }
    } catch (error) {
      console.error('Failed to delete account:', error)
      alert('Failed to delete account')
    }
  }

  const summaryCards = [
    {
      title: 'Total Accounts',
      value: String(summary?.totalAccounts || 0),
      icon: BookOpen,
      accent: 'text-primary'
    },
    {
      title: 'Assets',
      value: String(summary?.assetCount || 0),
      icon: TrendingUp,
      accent: 'text-blue-400'
    },
    {
      title: 'Revenue',
      value: String(summary?.revenueCount || 0),
      icon: Landmark,
      accent: 'text-green-400'
    },
    {
      title: 'Expenses',
      value: String(summary?.expenseCount || 0),
      icon: Wallet,
      accent: 'text-orange-400'
    },
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Chart of Accounts</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage your general ledger account structure</p>
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
          <h1 className="text-2xl font-bold tracking-tight">Chart of Accounts</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your general ledger account structure</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="brass-glow">
              <Plus className="w-4 h-4 mr-2" />
              Add Account
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create GL Account</DialogTitle>
            </DialogHeader>
            <form className="space-y-4 mt-4" onSubmit={handleCreateAccount}>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Account Code</Label>
                  <Input
                    placeholder="e.g., 1000"
                    value={formData.accountCode}
                    onChange={(e) => setFormData({ ...formData, accountCode: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Account Name</Label>
                  <Input
                    placeholder="e.g., Cash"
                    value={formData.accountName}
                    onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Account Type</Label>
                  <Select
                    value={formData.accountType}
                    onValueChange={(value) => setFormData({ ...formData, accountType: value })}
                    required
                  >
                    <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                    <SelectContent>
                      {accountTypes.map((t) => (
                        <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Normal Balance</Label>
                  <Select
                    value={formData.normalBalance}
                    onValueChange={(value) => setFormData({ ...formData, normalBalance: value })}
                    required
                  >
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="debit">Debit</SelectItem>
                      <SelectItem value="credit">Credit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Sub-Type (Optional)</Label>
                <Input
                  placeholder="e.g., Current Assets"
                  value={formData.accountSubType}
                  onChange={(e) => setFormData({ ...formData, accountSubType: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  placeholder="Brief description of this account"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <Button type="submit" className="w-full brass-glow">Create Account</Button>
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
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {accountTypes.map((t) => (
                  <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                ))}
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
                <TableHead>Code</TableHead>
                <TableHead>Account Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Normal Balance</TableHead>
                <TableHead className="text-right">Balance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {accounts.map((account) => (
                <TableRow key={account.id} className={!account.isActive ? 'opacity-50' : ''}>
                  <TableCell>
                    <code className="text-sm font-bold font-mono bg-primary/10 text-primary px-2 py-0.5 rounded">
                      {account.accountCode}
                    </code>
                  </TableCell>
                  <TableCell className="text-sm font-medium">
                    {account.accountName}
                    {account.isSystemAccount && (
                      <span className="ml-2 text-[10px] text-muted-foreground/60 uppercase">System</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`text-[10px] capitalize ${typeColors[account.accountType]}`}>
                      {account.accountType}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm capitalize text-muted-foreground">{account.normalBalance}</TableCell>
                  <TableCell className="text-right text-sm font-semibold">
                    Rs. {Number(account.currentBalance || 0).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {account.isActive ? (
                      <Badge variant="outline" className="text-[10px] bg-success/10 text-success border-success/20">Active</Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] bg-muted text-muted-foreground">Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                      {!account.isSystemAccount && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDeleteAccount(account.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {accounts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No accounts found
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
