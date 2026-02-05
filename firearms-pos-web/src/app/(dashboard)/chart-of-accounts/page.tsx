'use client'

import { useState } from 'react'
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

const accountTypes = ['asset', 'liability', 'equity', 'revenue', 'expense']

const mockAccounts = [
  { id: 1, accountCode: '1000', accountName: 'Cash', accountType: 'asset', normalBalance: 'debit', currentBalance: '250000', isActive: true, isSystemAccount: true },
  { id: 2, accountCode: '1100', accountName: 'Accounts Receivable', accountType: 'asset', normalBalance: 'debit', currentBalance: '85000', isActive: true, isSystemAccount: true },
  { id: 3, accountCode: '1200', accountName: 'Inventory', accountType: 'asset', normalBalance: 'debit', currentBalance: '1500000', isActive: true, isSystemAccount: true },
  { id: 4, accountCode: '2000', accountName: 'Accounts Payable', accountType: 'liability', normalBalance: 'credit', currentBalance: '120000', isActive: true, isSystemAccount: true },
  { id: 5, accountCode: '3000', accountName: 'Owner Equity', accountType: 'equity', normalBalance: 'credit', currentBalance: '500000', isActive: true, isSystemAccount: true },
  { id: 6, accountCode: '4000', accountName: 'Sales Revenue', accountType: 'revenue', normalBalance: 'credit', currentBalance: '3200000', isActive: true, isSystemAccount: true },
  { id: 7, accountCode: '5000', accountName: 'Cost of Goods Sold', accountType: 'expense', normalBalance: 'debit', currentBalance: '1800000', isActive: true, isSystemAccount: false },
  { id: 8, accountCode: '5100', accountName: 'Operating Expenses', accountType: 'expense', normalBalance: 'debit', currentBalance: '450000', isActive: true, isSystemAccount: false },
  { id: 9, accountCode: '5200', accountName: 'Utilities', accountType: 'expense', normalBalance: 'debit', currentBalance: '35000', isActive: false, isSystemAccount: false },
]

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

const summaryCards = [
  { title: 'Total Accounts', value: String(mockAccounts.length), icon: BookOpen, accent: 'text-primary' },
  { title: 'Assets', value: String(mockAccounts.filter((a) => a.accountType === 'asset').length), icon: TrendingUp, accent: 'text-blue-400' },
  { title: 'Revenue', value: String(mockAccounts.filter((a) => a.accountType === 'revenue').length), icon: Landmark, accent: 'text-green-400' },
  { title: 'Expenses', value: String(mockAccounts.filter((a) => a.accountType === 'expense').length), icon: Wallet, accent: 'text-orange-400' },
]

export default function ChartOfAccountsPage() {
  const [filterType, setFilterType] = useState('all')

  const filtered = mockAccounts.filter((a) => {
    if (filterType !== 'all' && a.accountType !== filterType) return false
    return true
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Chart of Accounts</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your general ledger account structure</p>
        </div>
        <Dialog>
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
            <form className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Account Code</Label>
                  <Input placeholder="e.g., 1000" />
                </div>
                <div className="space-y-2">
                  <Label>Account Name</Label>
                  <Input placeholder="e.g., Cash" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Account Type</Label>
                  <Select>
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
                  <Select>
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
                <Input placeholder="e.g., Current Assets" />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input placeholder="Brief description of this account" />
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
              {filtered.map((account) => (
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
                    Rs. {Number(account.currentBalance).toLocaleString()}
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
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive">
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
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
