import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
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
import { Textarea } from '@/components/ui/textarea'
import {
  Landmark,
  Plus,
  RefreshCw,
  CheckCircle,
  XCircle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  FileText,
  Building,
  Wallet,
  CreditCard,
  PiggyBank,
  Receipt,
  AlertTriangle,
} from 'lucide-react'
import { format } from 'date-fns'
import { useBranch } from '@/contexts/branch-context'

interface Account {
  id: number
  accountCode: string
  accountName: string
  accountType: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense'
  accountSubType: string | null
  parentAccountId: number | null
  description: string | null
  isActive: boolean
  isSystemAccount: boolean
  normalBalance: 'debit' | 'credit'
  currentBalance: number
  createdAt: string
  updatedAt: string
  parentAccount?: Account
  childAccounts?: Account[]
}

interface BalanceSheet {
  assets: { accounts: Account[]; total: number }
  liabilities: { accounts: Account[]; total: number }
  equity: { accounts: Account[]; total: number }
  totalLiabilitiesAndEquity: number
  isBalanced: boolean
}

interface IncomeStatement {
  revenue: { accounts: Account[]; total: number }
  expenses: { accounts: Account[]; total: number }
  netIncome: number
  startDate: string
  endDate: string
}

interface TrialBalance {
  accounts: Array<Account & { debit: number; credit: number }>
  totalDebits: number
  totalCredits: number
  isBalanced: boolean
  asOfDate: string
}

export default function ChartOfAccountsScreen() {
  const { currentBranch } = useBranch()
  const [activeTab, setActiveTab] = useState('accounts')
  const [accounts, setAccounts] = useState<Account[]>([])
  const [balanceSheet, setBalanceSheet] = useState<BalanceSheet | null>(null)
  const [incomeStatement, setIncomeStatement] = useState<IncomeStatement | null>(null)
  const [trialBalance, setTrialBalance] = useState<TrialBalance | null>(null)
  const [loading, setLoading] = useState(true)

  // Dialog states
  const [createDialog, setCreateDialog] = useState(false)
  const [editDialog, setEditDialog] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)

  // Form states
  const [formData, setFormData] = useState({
    accountCode: '',
    accountName: '',
    accountType: '' as 'asset' | 'liability' | 'equity' | 'revenue' | 'expense' | '',
    accountSubType: '',
    parentAccountId: '',
    description: '',
    normalBalance: '' as 'debit' | 'credit' | '',
  })

  // Filter states
  const [typeFilter, setTypeFilter] = useState<string>('all')

  const branchId = currentBranch?.id

  useEffect(() => {
    if (currentBranch) {
      loadData()
    }
  }, [branchId])

  const loadData = async () => {
    setLoading(true)
    try {
      const [accountsData, balanceSheetData, trialBalanceData] = await Promise.all([
        window.api.chartOfAccounts.getAll(),
        window.api.chartOfAccounts.getBalanceSheet(branchId),
        window.api.chartOfAccounts.getTrialBalance(),
      ])

      setAccounts(accountsData || [])
      setBalanceSheet(balanceSheetData)
      setTrialBalance(trialBalanceData)

      // Load income statement for current month
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]
      const incomeData = await window.api.chartOfAccounts.getIncomeStatement(startOfMonth, endOfMonth, branchId)
      setIncomeStatement(incomeData)
    } catch (error) {
      console.error('Failed to load chart of accounts data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateAccount = async () => {
    if (!formData.accountCode || !formData.accountName || !formData.accountType || !formData.normalBalance) {
      alert('Please fill in all required fields')
      return
    }

    try {
      await window.api.chartOfAccounts.create({
        accountCode: formData.accountCode,
        accountName: formData.accountName,
        accountType: formData.accountType,
        accountSubType: formData.accountSubType || undefined,
        parentAccountId: formData.parentAccountId ? parseInt(formData.parentAccountId) : undefined,
        description: formData.description || undefined,
        normalBalance: formData.normalBalance,
      })
      setCreateDialog(false)
      resetForm()
      await loadData()
    } catch (error) {
      console.error('Failed to create account:', error)
      alert('Failed to create account: ' + (error as Error).message)
    }
  }

  const handleUpdateAccount = async () => {
    if (!selectedAccount) return

    try {
      await window.api.chartOfAccounts.update(selectedAccount.id, {
        accountName: formData.accountName,
        accountSubType: formData.accountSubType || undefined,
        description: formData.description || undefined,
      })
      setEditDialog(false)
      setSelectedAccount(null)
      resetForm()
      await loadData()
    } catch (error) {
      console.error('Failed to update account:', error)
      alert('Failed to update account: ' + (error as Error).message)
    }
  }

  const handleDeleteAccount = async (account: Account) => {
    if (account.isSystemAccount) {
      alert('System accounts cannot be deleted')
      return
    }

    if (!confirm(`Are you sure you want to delete account "${account.accountName}"?`)) {
      return
    }

    try {
      await window.api.chartOfAccounts.delete(account.id)
      await loadData()
    } catch (error) {
      console.error('Failed to delete account:', error)
      alert('Failed to delete account: ' + (error as Error).message)
    }
  }

  const openEditDialog = (account: Account) => {
    setSelectedAccount(account)
    setFormData({
      accountCode: account.accountCode,
      accountName: account.accountName,
      accountType: account.accountType,
      accountSubType: account.accountSubType || '',
      parentAccountId: account.parentAccountId?.toString() || '',
      description: account.description || '',
      normalBalance: account.normalBalance,
    })
    setEditDialog(true)
  }

  const resetForm = () => {
    setFormData({
      accountCode: '',
      accountName: '',
      accountType: '',
      accountSubType: '',
      parentAccountId: '',
      description: '',
      normalBalance: '',
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getAccountTypeIcon = (type: string) => {
    switch (type) {
      case 'asset':
        return <Building className="h-4 w-4 text-blue-500" />
      case 'liability':
        return <CreditCard className="h-4 w-4 text-red-500" />
      case 'equity':
        return <PiggyBank className="h-4 w-4 text-purple-500" />
      case 'revenue':
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'expense':
        return <TrendingDown className="h-4 w-4 text-orange-500" />
      default:
        return <Wallet className="h-4 w-4" />
    }
  }

  const getAccountTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      asset: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      liability: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      equity: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      revenue: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      expense: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    }
    return (
      <Badge className={colors[type] || 'bg-gray-100 text-gray-800'}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    )
  }

  const filteredAccounts = typeFilter === 'all'
    ? accounts
    : accounts.filter((a) => a.accountType === typeFilter)

  const groupedAccounts = filteredAccounts.reduce((acc, account) => {
    const type = account.accountType
    if (!acc[type]) acc[type] = []
    acc[type].push(account)
    return acc
  }, {} as Record<string, Account[]>)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Chart of Accounts</h1>
          <p className="text-muted-foreground">
            Manage your accounting structure and view financial reports
            {currentBranch && <span className="text-primary font-medium"> - {currentBranch.name}</span>}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => loadData()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Account
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
            <Building className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(balanceSheet?.assets.total || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Liabilities</CardTitle>
            <CreditCard className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {formatCurrency(balanceSheet?.liabilities.total || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Equity</CardTitle>
            <PiggyBank className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(balanceSheet?.equity.total || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Net Income (MTD)</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${(incomeStatement?.netIncome || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(incomeStatement?.netIncome || 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Balance Check */}
      {balanceSheet && !balanceSheet.isBalanced && (
        <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-300">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-medium">Balance Sheet is not balanced!</span>
              <span className="text-sm">
                Assets ({formatCurrency(balanceSheet.assets.total)}) should equal Liabilities + Equity ({formatCurrency(balanceSheet.totalLiabilitiesAndEquity)})
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="accounts">Accounts</TabsTrigger>
          <TabsTrigger value="balance-sheet">Balance Sheet</TabsTrigger>
          <TabsTrigger value="income-statement">Income Statement</TabsTrigger>
          <TabsTrigger value="trial-balance">Trial Balance</TabsTrigger>
        </TabsList>

        <TabsContent value="accounts" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>All Accounts</CardTitle>
                  <CardDescription>Chart of accounts organized by type</CardDescription>
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="asset">Assets</SelectItem>
                    <SelectItem value="liability">Liabilities</SelectItem>
                    <SelectItem value="equity">Equity</SelectItem>
                    <SelectItem value="revenue">Revenue</SelectItem>
                    <SelectItem value="expense">Expenses</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {Object.entries(groupedAccounts).map(([type, typeAccounts]) => (
                <div key={type} className="mb-6">
                  <div className="flex items-center gap-2 mb-3">
                    {getAccountTypeIcon(type)}
                    <h3 className="text-lg font-semibold capitalize">{type}s</h3>
                    <span className="text-sm text-muted-foreground">({typeAccounts.length})</span>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Code</TableHead>
                        <TableHead>Account Name</TableHead>
                        <TableHead>Sub Type</TableHead>
                        <TableHead>Normal Balance</TableHead>
                        <TableHead className="text-right">Current Balance</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {typeAccounts
                        .sort((a, b) => a.accountCode.localeCompare(b.accountCode))
                        .map((account) => (
                          <TableRow key={account.id}>
                            <TableCell className="font-mono">{account.accountCode}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {account.accountName}
                                {account.isSystemAccount && (
                                  <Badge variant="secondary" className="text-xs">System</Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="capitalize">
                              {account.accountSubType?.replace(/_/g, ' ') || '-'}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{account.normalBalance}</Badge>
                            </TableCell>
                            <TableCell className={`text-right font-medium ${
                              account.currentBalance >= 0 ? 'text-foreground' : 'text-red-600'
                            }`}>
                              {formatCurrency(account.currentBalance)}
                            </TableCell>
                            <TableCell>
                              {account.isActive ? (
                                <Badge className="bg-green-100 text-green-800">Active</Badge>
                              ) : (
                                <Badge variant="secondary">Inactive</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openEditDialog(account)}
                                >
                                  Edit
                                </Button>
                                {!account.isSystemAccount && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-600"
                                    onClick={() => handleDeleteAccount(account)}
                                  >
                                    Delete
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="balance-sheet" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Balance Sheet
              </CardTitle>
              <CardDescription>
                As of {format(new Date(), 'MMMM d, yyyy')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Assets */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Building className="h-5 w-5 text-blue-500" />
                    Assets
                  </h3>
                  <Table>
                    <TableBody>
                      {balanceSheet?.assets.accounts.map((account) => (
                        <TableRow key={account.id}>
                          <TableCell>{account.accountName}</TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(account.currentBalance)}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="border-t-2">
                        <TableCell className="font-bold">Total Assets</TableCell>
                        <TableCell className="text-right font-bold text-blue-600">
                          {formatCurrency(balanceSheet?.assets.total || 0)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>

                {/* Liabilities & Equity */}
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-red-500" />
                    Liabilities
                  </h3>
                  <Table>
                    <TableBody>
                      {balanceSheet?.liabilities.accounts.map((account) => (
                        <TableRow key={account.id}>
                          <TableCell>{account.accountName}</TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(account.currentBalance)}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="border-t-2">
                        <TableCell className="font-bold">Total Liabilities</TableCell>
                        <TableCell className="text-right font-bold text-red-600">
                          {formatCurrency(balanceSheet?.liabilities.total || 0)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>

                  <h3 className="text-lg font-semibold mb-4 mt-6 flex items-center gap-2">
                    <PiggyBank className="h-5 w-5 text-purple-500" />
                    Equity
                  </h3>
                  <Table>
                    <TableBody>
                      {balanceSheet?.equity.accounts.map((account) => (
                        <TableRow key={account.id}>
                          <TableCell>{account.accountName}</TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(account.currentBalance)}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="border-t-2">
                        <TableCell className="font-bold">Total Equity</TableCell>
                        <TableCell className="text-right font-bold text-purple-600">
                          {formatCurrency(balanceSheet?.equity.total || 0)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>

                  <div className="mt-4 pt-4 border-t-2">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total Liabilities + Equity</span>
                      <span>{formatCurrency(balanceSheet?.totalLiabilitiesAndEquity || 0)}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      {balanceSheet?.isBalanced ? (
                        <>
                          <CheckCircle className="h-5 w-5 text-green-500" />
                          <span className="text-green-600">Balanced</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="h-5 w-5 text-red-500" />
                          <span className="text-red-600">Not Balanced</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="income-statement" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Income Statement (Profit & Loss)
              </CardTitle>
              <CardDescription>
                For the period {incomeStatement?.startDate} to {incomeStatement?.endDate}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-w-2xl mx-auto">
                {/* Revenue */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    Revenue
                  </h3>
                  <Table>
                    <TableBody>
                      {incomeStatement?.revenue.accounts.map((account) => (
                        <TableRow key={account.id}>
                          <TableCell>{account.accountName}</TableCell>
                          <TableCell className="text-right font-medium text-green-600">
                            {formatCurrency(account.currentBalance)}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="border-t-2 bg-green-50 dark:bg-green-950">
                        <TableCell className="font-bold">Total Revenue</TableCell>
                        <TableCell className="text-right font-bold text-green-600">
                          {formatCurrency(incomeStatement?.revenue.total || 0)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>

                {/* Expenses */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <TrendingDown className="h-5 w-5 text-red-500" />
                    Expenses
                  </h3>
                  <Table>
                    <TableBody>
                      {incomeStatement?.expenses.accounts.map((account) => (
                        <TableRow key={account.id}>
                          <TableCell>{account.accountName}</TableCell>
                          <TableCell className="text-right font-medium text-red-600">
                            {formatCurrency(account.currentBalance)}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="border-t-2 bg-red-50 dark:bg-red-950">
                        <TableCell className="font-bold">Total Expenses</TableCell>
                        <TableCell className="text-right font-bold text-red-600">
                          {formatCurrency(incomeStatement?.expenses.total || 0)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>

                {/* Net Income */}
                <div className="p-6 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold">Net Income</span>
                    <span className={`text-2xl font-bold ${(incomeStatement?.netIncome || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(incomeStatement?.netIncome || 0)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trial-balance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Trial Balance
              </CardTitle>
              <CardDescription>
                As of {trialBalance?.asOfDate || format(new Date(), 'yyyy-MM-dd')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Account Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="text-right">Debit</TableHead>
                    <TableHead className="text-right">Credit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trialBalance?.accounts.map((account) => (
                    <TableRow key={account.id}>
                      <TableCell className="font-mono">{account.accountCode}</TableCell>
                      <TableCell>{account.accountName}</TableCell>
                      <TableCell>{getAccountTypeBadge(account.accountType)}</TableCell>
                      <TableCell className="text-right">
                        {account.debit > 0 ? formatCurrency(account.debit) : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        {account.credit > 0 ? formatCurrency(account.credit) : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="border-t-2 font-bold bg-muted">
                    <TableCell colSpan={3}>Total</TableCell>
                    <TableCell className="text-right">{formatCurrency(trialBalance?.totalDebits || 0)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(trialBalance?.totalCredits || 0)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>

              <div className="mt-4 flex items-center justify-center gap-2">
                {trialBalance?.isBalanced ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-green-600 font-medium">Trial Balance is balanced</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-red-500" />
                    <span className="text-red-600 font-medium">
                      Trial Balance is NOT balanced (Difference: {formatCurrency(Math.abs((trialBalance?.totalDebits || 0) - (trialBalance?.totalCredits || 0)))})
                    </span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Account Dialog */}
      <Dialog open={createDialog} onOpenChange={setCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Account</DialogTitle>
            <DialogDescription>
              Add a new account to the chart of accounts
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Account Code *</Label>
                <Input
                  placeholder="e.g., 1100"
                  value={formData.accountCode}
                  onChange={(e) => setFormData({ ...formData, accountCode: e.target.value })}
                />
              </div>
              <div>
                <Label>Account Type *</Label>
                <Select
                  value={formData.accountType}
                  onValueChange={(v) => setFormData({
                    ...formData,
                    accountType: v as typeof formData.accountType,
                    normalBalance: ['asset', 'expense'].includes(v) ? 'debit' : 'credit',
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="asset">Asset</SelectItem>
                    <SelectItem value="liability">Liability</SelectItem>
                    <SelectItem value="equity">Equity</SelectItem>
                    <SelectItem value="revenue">Revenue</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Account Name *</Label>
              <Input
                placeholder="e.g., Accounts Receivable"
                value={formData.accountName}
                onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Sub Type</Label>
                <Input
                  placeholder="e.g., accounts_receivable"
                  value={formData.accountSubType}
                  onChange={(e) => setFormData({ ...formData, accountSubType: e.target.value })}
                />
              </div>
              <div>
                <Label>Normal Balance *</Label>
                <Select
                  value={formData.normalBalance}
                  onValueChange={(v) => setFormData({ ...formData, normalBalance: v as 'debit' | 'credit' })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="debit">Debit</SelectItem>
                    <SelectItem value="credit">Credit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Parent Account (Optional)</Label>
              <Select
                value={formData.parentAccountId}
                onValueChange={(v) => setFormData({ ...formData, parentAccountId: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select parent account" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {accounts
                    .filter((a) => a.accountType === formData.accountType)
                    .map((account) => (
                      <SelectItem key={account.id} value={account.id.toString()}>
                        {account.accountCode} - {account.accountName}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                placeholder="Account description..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setCreateDialog(false); resetForm(); }}>
              Cancel
            </Button>
            <Button onClick={handleCreateAccount}>
              Create Account
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Account Dialog */}
      <Dialog open={editDialog} onOpenChange={setEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Account</DialogTitle>
            <DialogDescription>
              Update account details
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Account Code</Label>
                <Input value={formData.accountCode} disabled />
              </div>
              <div>
                <Label>Account Type</Label>
                <Input value={formData.accountType} disabled className="capitalize" />
              </div>
            </div>

            <div>
              <Label>Account Name</Label>
              <Input
                value={formData.accountName}
                onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
              />
            </div>

            <div>
              <Label>Sub Type</Label>
              <Input
                value={formData.accountSubType}
                onChange={(e) => setFormData({ ...formData, accountSubType: e.target.value })}
              />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setEditDialog(false); setSelectedAccount(null); resetForm(); }}>
              Cancel
            </Button>
            <Button onClick={handleUpdateAccount}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
