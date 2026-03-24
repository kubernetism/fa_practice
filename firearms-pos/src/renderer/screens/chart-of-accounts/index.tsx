import { useState, useEffect, useMemo, useCallback, useRef } from 'react'
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip'
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
  Calculator,
  Pencil,
  ChevronLeft,
  ChevronRight,
  X,
  Trash2,
  Camera,
  Check,
  Loader2,
  ArrowDownCircle,
  ArrowUpCircle,
  Search,
} from 'lucide-react'
import { toPng } from 'html-to-image'
import { format } from 'date-fns'
import { useBranch } from '@/contexts/branch-context'
import { CoaReportCard } from './report-card'

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
  netIncome: number
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

interface CashFlowTransaction {
  id: number
  transactionType: string
  amount: number
  description: string | null
  referenceType: string | null
  referenceId: number | null
  transactionDate: string
  sessionDate: string
}

interface CashFlowDetail {
  transactions: CashFlowTransaction[]
  summaryByType: Record<string, { count: number; totalAmount: number }>
  totalInflows: number
  totalOutflows: number
  netCashFlow: number
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
  const [adjustDialog, setAdjustDialog] = useState(false)
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)
  const [adjustTarget, setAdjustTarget] = useState('')
  const [adjustReason, setAdjustReason] = useState('')
  const [recalculating, setRecalculating] = useState(false)
  const [isCopying, setIsCopying] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [businessName, setBusinessName] = useState('')
  const reportRef = useRef<HTMLDivElement>(null)

  // Cash Flow tab states
  const [cashFlowData, setCashFlowData] = useState<CashFlowDetail | null>(null)
  const [cashFlowLoading, setCashFlowLoading] = useState(false)
  const [cfStartDate, setCfStartDate] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
  })
  const [cfEndDate, setCfEndDate] = useState(() => new Date().toISOString().split('T')[0])

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

  const loadData = useCallback(async () => {
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
  }, [branchId])

  const loadCashFlow = useCallback(async () => {
    if (!branchId) return
    setCashFlowLoading(true)
    try {
      const result = await window.api.chartOfAccounts.getCashFlowDetail({
        branchId,
        startDate: cfStartDate,
        endDate: cfEndDate,
      })
      if (result.success && result.data) {
        // Convert summaryByType from array to map
        const summaryMap: Record<string, { count: number; totalAmount: number }> = {}
        if (Array.isArray(result.data.summaryByType)) {
          for (const item of result.data.summaryByType) {
            summaryMap[item.transactionType] = {
              count: Number(item.count),
              totalAmount: Number(item.totalAmount),
            }
          }
        } else {
          Object.assign(summaryMap, result.data.summaryByType)
        }
        setCashFlowData({
          transactions: result.data.transactions || [],
          summaryByType: summaryMap,
          totalInflows: result.data.totalInflows,
          totalOutflows: result.data.totalOutflows,
          netCashFlow: result.data.netCashFlow,
        })
      }
    } catch (error) {
      console.error('Failed to load cash flow data:', error)
    } finally {
      setCashFlowLoading(false)
    }
  }, [branchId, cfStartDate, cfEndDate])

  useEffect(() => {
    if (activeTab === 'cash-flow' && branchId) {
      loadCashFlow()
    }
  }, [activeTab, loadCashFlow])

  // Fetch business name for the report header
  useEffect(() => {
    const fetchBizName = async () => {
      try {
        const result = await window.api.businessSettings.getGlobal()
        if (result.success && result.data?.businessName) {
          setBusinessName(result.data.businessName)
        }
      } catch {
        // ignore — will fall back to default
      }
    }
    fetchBizName()
  }, [])

  const handleCopySnapshot = useCallback(async () => {
    if (!balanceSheet || !reportRef.current || isCopying) return

    setIsCopying(true)
    try {
      const node = reportRef.current
      const prevPos = node.style.position
      const prevLeft = node.style.left
      const prevTop = node.style.top
      node.style.position = 'fixed'
      node.style.left = '0px'
      node.style.top = '0px'
      node.style.zIndex = '-1'

      const dataUrl = await toPng(node, {
        pixelRatio: 2,
        backgroundColor: '#0f172a',
      })

      node.style.position = prevPos
      node.style.left = prevLeft
      node.style.top = prevTop
      node.style.zIndex = ''

      await window.api.clipboard.copyImage(dataUrl)

      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2500)
    } catch (error) {
      console.error('Failed to capture COA snapshot:', error)
    } finally {
      setIsCopying(false)
    }
  }, [balanceSheet, isCopying])

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
        parentAccountId: formData.parentAccountId && formData.parentAccountId !== 'none' ? parseInt(formData.parentAccountId) : undefined,
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

  const handleRecalculateBalances = async () => {
    if (!confirm('Recalculate all account balances from journal entries? This will fix any balance discrepancies.')) {
      return
    }

    setRecalculating(true)
    try {
      const result = await window.api.chartOfAccounts.recalculateBalances()
      if (result.success) {
        const { totalAccounts, adjustedCount, adjustments } = result.data
        if (adjustedCount === 0) {
          alert(`All ${totalAccounts} accounts are already correct. No adjustments needed.`)
        } else {
          const details = adjustments
            .map((a: { accountCode: string; oldBalance: number; newBalance: number }) =>
              `${a.accountCode}: ${formatCurrency(a.oldBalance)} → ${formatCurrency(a.newBalance)}`)
            .join('\n')
          alert(`Recalculated ${adjustedCount} of ${totalAccounts} accounts:\n\n${details}`)
        }
        await loadData()
      } else {
        alert('Failed to recalculate: ' + result.message)
      }
    } catch (error) {
      console.error('Recalculate balances error:', error)
      alert('Failed to recalculate balances: ' + (error as Error).message)
    } finally {
      setRecalculating(false)
    }
  }

  const openAdjustDialog = (account: Account) => {
    setSelectedAccount(account)
    setAdjustTarget(account.currentBalance.toString())
    setAdjustReason('')
    setAdjustDialog(true)
  }

  const handleAdjustBalance = async () => {
    if (!selectedAccount) return

    const target = parseFloat(adjustTarget)
    if (isNaN(target)) {
      alert('Please enter a valid number')
      return
    }

    if (!adjustReason.trim()) {
      alert('Please provide a reason for the adjustment')
      return
    }

    try {
      const result = await window.api.chartOfAccounts.adjustBalance(
        selectedAccount.id,
        target,
        adjustReason.trim(),
        1 // postedBy — system/admin
      )
      if (result.success) {
        if (result.data.adjusted) {
          alert(`Balance adjusted from ${formatCurrency(result.data.oldBalance)} to ${formatCurrency(result.data.newBalance)}.\nJournal entry: ${result.data.journalEntry}`)
        } else {
          alert(result.message || 'Balance is already correct')
        }
        setAdjustDialog(false)
        setSelectedAccount(null)
        await loadData()
      } else {
        alert('Failed to adjust: ' + result.message)
      }
    } catch (error) {
      console.error('Adjust balance error:', error)
      alert('Failed to adjust balance: ' + (error as Error).message)
    }
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
        return <Building className="h-4 w-4 text-blue-400" />
      case 'liability':
        return <CreditCard className="h-4 w-4 text-red-400" />
      case 'equity':
        return <PiggyBank className="h-4 w-4 text-purple-400" />
      case 'revenue':
        return <TrendingUp className="h-4 w-4 text-green-400" />
      case 'expense':
        return <TrendingDown className="h-4 w-4 text-orange-400" />
      default:
        return <Wallet className="h-4 w-4" />
    }
  }

  const getAccountTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      asset: 'bg-blue-500/10 text-blue-400',
      liability: 'bg-red-500/10 text-red-400',
      equity: 'bg-purple-500/10 text-purple-400',
      revenue: 'bg-green-500/10 text-green-400',
      expense: 'bg-orange-500/10 text-orange-400',
    }
    return (
      <Badge className={`${colors[type] || 'bg-muted text-muted-foreground'} text-[10px] px-1.5 py-0`}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    )
  }

  const filteredAccounts = useMemo(() =>
    typeFilter === 'all'
      ? accounts
      : accounts.filter((a) => a.accountType === typeFilter),
    [accounts, typeFilter]
  )

  const groupedAccounts = useMemo(() =>
    filteredAccounts.reduce((acc, account) => {
      const type = account.accountType
      if (!acc[type]) acc[type] = []
      acc[type].push(account)
      return acc
    }, {} as Record<string, Account[]>),
    [filteredAccounts]
  )

  const accountStats = useMemo(() => ({
    assets: balanceSheet?.assets.total || 0,
    liabilities: balanceSheet?.liabilities.total || 0,
    equity: (balanceSheet?.equity.total || 0) + (balanceSheet?.netIncome || 0),
    netIncome: balanceSheet?.netIncome ?? incomeStatement?.netIncome ?? 0,
  }), [balanceSheet, incomeStatement])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-semibold">Chart of Accounts</h1>
            {currentBranch && (
              <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                {currentBranch.name}
              </span>
            )}
            <span className="rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-medium text-blue-400">
              Assets {formatCurrency(accountStats.assets)}
            </span>
            <span className="rounded-full bg-red-500/10 px-2.5 py-0.5 text-xs font-medium text-red-400">
              Liabilities {formatCurrency(accountStats.liabilities)}
            </span>
            <span className="rounded-full bg-purple-500/10 px-2.5 py-0.5 text-xs font-medium text-purple-400">
              Equity {formatCurrency(accountStats.equity)}
            </span>
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
              accountStats.netIncome >= 0
                ? 'bg-green-500/10 text-green-400'
                : 'bg-red-500/10 text-red-400'
            }`}>
              Net Income {formatCurrency(accountStats.netIncome)}
            </span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopySnapshot}
              disabled={!balanceSheet || isCopying}
              className="h-8 px-2 gap-1.5 text-xs"
            >
              {isCopying ? (
                <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Capturing...</>
              ) : isCopied ? (
                <><Check className="h-3.5 w-3.5 text-green-500" /> Copied!</>
              ) : (
                <><Camera className="h-3.5 w-3.5" /> Screenshot</>
              )}
            </Button>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={handleRecalculateBalances} variant="outline" size="sm" disabled={recalculating}>
                  <Calculator className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{recalculating ? 'Recalculating...' : 'Recalculate Balances'}</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button onClick={() => loadData()} variant="outline" size="sm">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Refresh</TooltipContent>
            </Tooltip>
            <Button onClick={() => setCreateDialog(true)} size="sm">
              <Plus className="h-4 w-4 mr-1" />
              Add Account
            </Button>
          </div>
        </div>

        {/* Balance Check Warning */}
        {balanceSheet && !balanceSheet.isBalanced && (
          <div className="rounded-md border border-yellow-500/30 bg-yellow-500/10 px-3 py-2">
            <div className="flex items-center gap-2 text-yellow-400 text-sm">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span className="font-medium">Balance Sheet is not balanced!</span>
              <span className="text-xs text-yellow-400/80">
                Assets ({formatCurrency(balanceSheet.assets.total)}) should equal Liabilities + Equity ({formatCurrency(balanceSheet.totalLiabilitiesAndEquity)})
              </span>
            </div>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="h-8">
            <TabsTrigger value="accounts" className="h-6 px-2 text-xs">Accounts</TabsTrigger>
            <TabsTrigger value="balance-sheet" className="h-6 px-2 text-xs">Balance Sheet</TabsTrigger>
            <TabsTrigger value="income-statement" className="h-6 px-2 text-xs">Income Statement</TabsTrigger>
            <TabsTrigger value="trial-balance" className="h-6 px-2 text-xs">Trial Balance</TabsTrigger>
            <TabsTrigger value="cash-flow" className="h-6 px-2 text-xs">Cash Flow</TabsTrigger>
          </TabsList>

          {/* Accounts Tab */}
          <TabsContent value="accounts" className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">
                  {filteredAccounts.length} account{filteredAccounts.length !== 1 ? 's' : ''}
                </span>
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-36 h-8 text-xs">
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

            {Object.entries(groupedAccounts).map(([type, typeAccounts]) => (
              <div key={type}>
                <div className="flex items-center gap-2 mb-1.5">
                  {getAccountTypeIcon(type)}
                  <h3 className="text-sm font-semibold capitalize">{type}s</h3>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                    {typeAccounts.length}
                  </span>
                </div>
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30">
                        <TableHead className="text-[10px] font-semibold tracking-wider uppercase">Code</TableHead>
                        <TableHead className="text-[10px] font-semibold tracking-wider uppercase">Account Name</TableHead>
                        <TableHead className="text-[10px] font-semibold tracking-wider uppercase">Sub Type</TableHead>
                        <TableHead className="text-[10px] font-semibold tracking-wider uppercase">Normal Balance</TableHead>
                        <TableHead className="text-[10px] font-semibold tracking-wider uppercase text-right">Current Balance</TableHead>
                        <TableHead className="text-[10px] font-semibold tracking-wider uppercase">Status</TableHead>
                        <TableHead className="text-[10px] font-semibold tracking-wider uppercase text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {typeAccounts
                        .sort((a, b) => a.accountCode.localeCompare(b.accountCode))
                        .map((account) => (
                          <TableRow key={account.id} className="h-9 group">
                            <TableCell className="py-1.5 font-mono text-xs">{account.accountCode}</TableCell>
                            <TableCell className="py-1.5">
                              <div className="flex items-center gap-1.5 text-sm">
                                {account.accountName}
                                {account.isSystemAccount && (
                                  <Badge variant="secondary" className="text-[10px] px-1.5 py-0">System</Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="py-1.5 capitalize text-xs text-muted-foreground">
                              {account.accountSubType?.replace(/_/g, ' ') || '-'}
                            </TableCell>
                            <TableCell className="py-1.5">
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0">{account.normalBalance}</Badge>
                            </TableCell>
                            <TableCell className={`py-1.5 text-right text-sm font-medium ${
                              account.currentBalance >= 0 ? 'text-foreground' : 'text-red-500'
                            }`}>
                              {formatCurrency(account.currentBalance)}
                            </TableCell>
                            <TableCell className="py-1.5">
                              {account.isActive ? (
                                <Badge className="bg-green-500/10 text-green-400 text-[10px] px-1.5 py-0">Active</Badge>
                              ) : (
                                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Inactive</Badge>
                              )}
                            </TableCell>
                            <TableCell className="py-1.5 text-right">
                              <div className="flex justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7"
                                      onClick={() => openAdjustDialog(account)}
                                    >
                                      <DollarSign className="h-3.5 w-3.5" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Adjust Balance</TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7"
                                      onClick={() => openEditDialog(account)}
                                    >
                                      <Pencil className="h-3.5 w-3.5" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Edit Account</TooltipContent>
                                </Tooltip>
                                {!account.isSystemAccount && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 text-red-500 hover:text-red-400"
                                        onClick={() => handleDeleteAccount(account)}
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Delete Account</TooltipContent>
                                  </Tooltip>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ))}
          </TabsContent>

          {/* Balance Sheet Tab */}
          <TabsContent value="balance-sheet" className="space-y-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileText className="h-4 w-4" />
                  Balance Sheet
                </CardTitle>
                <CardDescription className="text-xs">
                  As of {format(new Date(), 'MMMM d, yyyy')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Assets */}
                  <div>
                    <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <Building className="h-4 w-4 text-blue-400" />
                      Assets
                    </h3>
                    <div className="rounded-md border overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/30">
                            <TableHead className="text-[10px] font-semibold tracking-wider uppercase">Account</TableHead>
                            <TableHead className="text-[10px] font-semibold tracking-wider uppercase text-right">Balance</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {balanceSheet?.assets.accounts.map((account) => (
                            <TableRow key={account.id} className="h-9">
                              <TableCell className="py-1.5 text-sm">{account.accountName}</TableCell>
                              <TableCell className="py-1.5 text-right text-sm font-medium">
                                {formatCurrency(account.currentBalance)}
                              </TableCell>
                            </TableRow>
                          ))}
                          <TableRow className="border-t-2 h-9">
                            <TableCell className="py-1.5 font-bold text-sm">Total Assets</TableCell>
                            <TableCell className="py-1.5 text-right font-bold text-sm text-blue-500">
                              {formatCurrency(balanceSheet?.assets.total || 0)}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  {/* Liabilities & Equity */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-red-400" />
                        Liabilities
                      </h3>
                      <div className="rounded-md border overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-muted/30">
                              <TableHead className="text-[10px] font-semibold tracking-wider uppercase">Account</TableHead>
                              <TableHead className="text-[10px] font-semibold tracking-wider uppercase text-right">Balance</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {balanceSheet?.liabilities.accounts.map((account) => (
                              <TableRow key={account.id} className="h-9">
                                <TableCell className="py-1.5 text-sm">{account.accountName}</TableCell>
                                <TableCell className="py-1.5 text-right text-sm font-medium">
                                  {formatCurrency(account.currentBalance)}
                                </TableCell>
                              </TableRow>
                            ))}
                            <TableRow className="border-t-2 h-9">
                              <TableCell className="py-1.5 font-bold text-sm">Total Liabilities</TableCell>
                              <TableCell className="py-1.5 text-right font-bold text-sm text-red-500">
                                {formatCurrency(balanceSheet?.liabilities.total || 0)}
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                        <PiggyBank className="h-4 w-4 text-purple-400" />
                        Equity
                      </h3>
                      <div className="rounded-md border overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-muted/30">
                              <TableHead className="text-[10px] font-semibold tracking-wider uppercase">Account</TableHead>
                              <TableHead className="text-[10px] font-semibold tracking-wider uppercase text-right">Balance</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {balanceSheet?.equity.accounts.map((account) => (
                              <TableRow key={account.id} className="h-9">
                                <TableCell className="py-1.5 text-sm">{account.accountName}</TableCell>
                                <TableCell className="py-1.5 text-right text-sm font-medium">
                                  {formatCurrency(account.currentBalance)}
                                </TableCell>
                              </TableRow>
                            ))}
                            <TableRow className="h-9">
                              <TableCell className="py-1.5 text-sm italic">Current Net Income</TableCell>
                              <TableCell className={`py-1.5 text-right text-sm font-medium ${(balanceSheet?.netIncome || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {formatCurrency(balanceSheet?.netIncome || 0)}
                              </TableCell>
                            </TableRow>
                            <TableRow className="border-t-2 h-9">
                              <TableCell className="py-1.5 font-bold text-sm">Total Equity</TableCell>
                              <TableCell className="py-1.5 text-right font-bold text-sm text-purple-500">
                                {formatCurrency((balanceSheet?.equity.total || 0) + (balanceSheet?.netIncome || 0))}
                              </TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    </div>

                    <div className="pt-3 border-t-2">
                      <div className="flex justify-between text-sm font-bold">
                        <span>Total Liabilities + Equity</span>
                        <span>{formatCurrency(balanceSheet?.totalLiabilitiesAndEquity || 0)}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-1.5">
                        {balanceSheet?.isBalanced ? (
                          <>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-green-500 text-sm">Balanced</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="h-4 w-4 text-red-500" />
                            <span className="text-red-500 text-sm">Not Balanced</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Income Statement Tab */}
          <TabsContent value="income-statement" className="space-y-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Receipt className="h-4 w-4" />
                  Income Statement (Profit & Loss)
                </CardTitle>
                <CardDescription className="text-xs">
                  For the period {incomeStatement?.startDate} to {incomeStatement?.endDate}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="max-w-2xl mx-auto space-y-4">
                  {/* Revenue */}
                  <div>
                    <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-400" />
                      Revenue
                    </h3>
                    <div className="rounded-md border overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/30">
                            <TableHead className="text-[10px] font-semibold tracking-wider uppercase">Account</TableHead>
                            <TableHead className="text-[10px] font-semibold tracking-wider uppercase text-right">Amount</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {incomeStatement?.revenue.accounts.map((account) => (
                            <TableRow key={account.id} className="h-9">
                              <TableCell className="py-1.5 text-sm">{account.accountName}</TableCell>
                              <TableCell className="py-1.5 text-right text-sm font-medium text-green-500">
                                {formatCurrency(account.currentBalance)}
                              </TableCell>
                            </TableRow>
                          ))}
                          <TableRow className="border-t-2 bg-green-500/10 h-9">
                            <TableCell className="py-1.5 font-bold text-sm">Total Revenue</TableCell>
                            <TableCell className="py-1.5 text-right font-bold text-sm text-green-500">
                              {formatCurrency(incomeStatement?.revenue.total || 0)}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  {/* Expenses */}
                  <div>
                    <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                      <TrendingDown className="h-4 w-4 text-red-400" />
                      Expenses
                    </h3>
                    <div className="rounded-md border overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-muted/30">
                            <TableHead className="text-[10px] font-semibold tracking-wider uppercase">Account</TableHead>
                            <TableHead className="text-[10px] font-semibold tracking-wider uppercase text-right">Amount</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {incomeStatement?.expenses.accounts.map((account) => (
                            <TableRow key={account.id} className="h-9">
                              <TableCell className="py-1.5 text-sm">{account.accountName}</TableCell>
                              <TableCell className="py-1.5 text-right text-sm font-medium text-red-500">
                                {formatCurrency(account.currentBalance)}
                              </TableCell>
                            </TableRow>
                          ))}
                          <TableRow className="border-t-2 bg-red-500/10 h-9">
                            <TableCell className="py-1.5 font-bold text-sm">Total Expenses</TableCell>
                            <TableCell className="py-1.5 text-right font-bold text-sm text-red-500">
                              {formatCurrency(incomeStatement?.expenses.total || 0)}
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  {/* Net Income */}
                  <div className="p-4 rounded-lg bg-blue-500/5">
                    <div className="flex justify-between items-center">
                      <span className="text-base font-bold">Net Income</span>
                      <span className={`text-lg font-bold ${(incomeStatement?.netIncome || 0) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {formatCurrency(incomeStatement?.netIncome || 0)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Trial Balance Tab */}
          <TabsContent value="trial-balance" className="space-y-3">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <DollarSign className="h-4 w-4" />
                  Trial Balance
                </CardTitle>
                <CardDescription className="text-xs">
                  As of {trialBalance?.asOfDate || format(new Date(), 'yyyy-MM-dd')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/30">
                        <TableHead className="text-[10px] font-semibold tracking-wider uppercase">Code</TableHead>
                        <TableHead className="text-[10px] font-semibold tracking-wider uppercase">Account Name</TableHead>
                        <TableHead className="text-[10px] font-semibold tracking-wider uppercase">Type</TableHead>
                        <TableHead className="text-[10px] font-semibold tracking-wider uppercase text-right">Debit</TableHead>
                        <TableHead className="text-[10px] font-semibold tracking-wider uppercase text-right">Credit</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {trialBalance?.accounts.map((account) => (
                        <TableRow key={account.id} className="h-9">
                          <TableCell className="py-1.5 font-mono text-xs">{account.accountCode}</TableCell>
                          <TableCell className="py-1.5 text-sm">{account.accountName}</TableCell>
                          <TableCell className="py-1.5">{getAccountTypeBadge(account.accountType)}</TableCell>
                          <TableCell className="py-1.5 text-right text-sm">
                            {account.debit > 0 ? formatCurrency(account.debit) : '-'}
                          </TableCell>
                          <TableCell className="py-1.5 text-right text-sm">
                            {account.credit > 0 ? formatCurrency(account.credit) : '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="border-t-2 font-bold bg-muted h-9">
                        <TableCell colSpan={3} className="py-1.5 text-sm">Total</TableCell>
                        <TableCell className="py-1.5 text-right text-sm">{formatCurrency(trialBalance?.totalDebits || 0)}</TableCell>
                        <TableCell className="py-1.5 text-right text-sm">{formatCurrency(trialBalance?.totalCredits || 0)}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>

                <div className="mt-3 flex items-center justify-center gap-2">
                  {trialBalance?.isBalanced ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-green-500 font-medium text-sm">Trial Balance is balanced</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span className="text-red-500 font-medium text-sm">
                        Trial Balance is NOT balanced (Difference: {formatCurrency(Math.abs((trialBalance?.totalDebits || 0) - (trialBalance?.totalCredits || 0)))})
                      </span>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Cash Flow Tab */}
          <TabsContent value="cash-flow" className="space-y-3">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-base">
                      <Wallet className="h-4 w-4" />
                      Cash Flow Summary
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Detailed cash transactions for selected period
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="date"
                      value={cfStartDate}
                      onChange={(e) => setCfStartDate(e.target.value)}
                      className="h-8 w-36 text-xs"
                    />
                    <span className="text-xs text-muted-foreground">to</span>
                    <Input
                      type="date"
                      value={cfEndDate}
                      onChange={(e) => setCfEndDate(e.target.value)}
                      className="h-8 w-36 text-xs"
                    />
                    <Button size="sm" variant="outline" className="h-8" onClick={loadCashFlow} disabled={cashFlowLoading}>
                      <Search className="h-3.5 w-3.5 mr-1" />
                      Filter
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {cashFlowLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : cashFlowData ? (
                  <div className="space-y-4">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="rounded-lg border bg-green-500/5 p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <ArrowDownCircle className="h-4 w-4 text-green-500" />
                          <span className="text-xs font-medium text-muted-foreground">Total Inflows</span>
                        </div>
                        <p className="text-lg font-bold text-green-500">{formatCurrency(cashFlowData.totalInflows)}</p>
                      </div>
                      <div className="rounded-lg border bg-red-500/5 p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <ArrowUpCircle className="h-4 w-4 text-red-500" />
                          <span className="text-xs font-medium text-muted-foreground">Total Outflows</span>
                        </div>
                        <p className="text-lg font-bold text-red-500">{formatCurrency(cashFlowData.totalOutflows)}</p>
                      </div>
                      <div className="rounded-lg border bg-blue-500/5 p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <DollarSign className="h-4 w-4 text-blue-500" />
                          <span className="text-xs font-medium text-muted-foreground">Net Cash Flow</span>
                        </div>
                        <p className={`text-lg font-bold ${cashFlowData.netCashFlow >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {formatCurrency(cashFlowData.netCashFlow)}
                        </p>
                      </div>
                    </div>

                    {/* Summary by Type */}
                    {Object.keys(cashFlowData.summaryByType).length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold mb-2">Breakdown by Type</h3>
                        <div className="rounded-md border overflow-hidden">
                          <Table>
                            <TableHeader>
                              <TableRow className="bg-muted/30">
                                <TableHead className="text-[10px] font-semibold tracking-wider uppercase">Type</TableHead>
                                <TableHead className="text-[10px] font-semibold tracking-wider uppercase text-center">Transactions</TableHead>
                                <TableHead className="text-[10px] font-semibold tracking-wider uppercase text-right">Total Amount</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {Object.entries(cashFlowData.summaryByType).map(([type, data]) => {
                                const isInflow = ['sale', 'ar_collection', 'deposit', 'adjustment_add'].includes(type)
                                return (
                                  <TableRow key={type} className="h-9">
                                    <TableCell className="py-1.5 text-sm capitalize">{type.replace(/_/g, ' ')}</TableCell>
                                    <TableCell className="py-1.5 text-center text-sm">{data.count}</TableCell>
                                    <TableCell className={`py-1.5 text-right text-sm font-medium ${isInflow ? 'text-green-500' : 'text-red-500'}`}>
                                      {isInflow ? '+' : '-'}{formatCurrency(Math.abs(data.totalAmount))}
                                    </TableCell>
                                  </TableRow>
                                )
                              })}
                            </TableBody>
                          </Table>
                        </div>
                      </div>
                    )}

                    {/* Transaction List */}
                    <div>
                      <h3 className="text-sm font-semibold mb-2">
                        Transactions ({cashFlowData.transactions.length})
                      </h3>
                      <div className="rounded-md border overflow-hidden max-h-[400px] overflow-y-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-muted/30 sticky top-0">
                              <TableHead className="text-[10px] font-semibold tracking-wider uppercase">Date</TableHead>
                              <TableHead className="text-[10px] font-semibold tracking-wider uppercase">Type</TableHead>
                              <TableHead className="text-[10px] font-semibold tracking-wider uppercase">Description</TableHead>
                              <TableHead className="text-[10px] font-semibold tracking-wider uppercase text-right">Inflow</TableHead>
                              <TableHead className="text-[10px] font-semibold tracking-wider uppercase text-right">Outflow</TableHead>
                              <TableHead className="text-[10px] font-semibold tracking-wider uppercase">Reference</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {cashFlowData.transactions.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground text-sm">
                                  No transactions found for this period
                                </TableCell>
                              </TableRow>
                            ) : (
                              cashFlowData.transactions.map((txn) => {
                                const isInflow = ['sale', 'ar_collection', 'deposit', 'adjustment_add'].includes(txn.transactionType)
                                return (
                                  <TableRow key={txn.id} className="h-9">
                                    <TableCell className="py-1.5 text-xs">
                                      {format(new Date(txn.transactionDate || txn.sessionDate), 'MMM d, yyyy')}
                                    </TableCell>
                                    <TableCell className="py-1.5">
                                      <Badge variant="outline" className="text-[10px] px-1.5 py-0 capitalize">
                                        {txn.transactionType.replace(/_/g, ' ')}
                                      </Badge>
                                    </TableCell>
                                    <TableCell className="py-1.5 text-xs text-muted-foreground max-w-[200px] truncate">
                                      {txn.description || '-'}
                                    </TableCell>
                                    <TableCell className="py-1.5 text-right text-sm font-medium text-green-500">
                                      {isInflow ? formatCurrency(Math.abs(txn.amount)) : '-'}
                                    </TableCell>
                                    <TableCell className="py-1.5 text-right text-sm font-medium text-red-500">
                                      {!isInflow ? formatCurrency(Math.abs(txn.amount)) : '-'}
                                    </TableCell>
                                    <TableCell className="py-1.5 text-xs text-muted-foreground">
                                      {txn.referenceType ? `${txn.referenceType}${txn.referenceId ? `#${txn.referenceId}` : ''}` : '-'}
                                    </TableCell>
                                  </TableRow>
                                )
                              })
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
                    Select a date range and click Filter to load cash flow data
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Create Account Dialog */}
        <Dialog open={createDialog} onOpenChange={setCreateDialog}>
          <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
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
                    <SelectItem value="none">None</SelectItem>
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
          <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
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

        {/* Adjust Balance Dialog */}
        <Dialog open={adjustDialog} onOpenChange={setAdjustDialog}>
          <DialogContent onOpenAutoFocus={(e) => e.preventDefault()}>
            <DialogHeader>
              <DialogTitle>Adjust Account Balance</DialogTitle>
              <DialogDescription>
                {selectedAccount && (
                  <>Set the actual balance for <strong>{selectedAccount.accountCode} - {selectedAccount.accountName}</strong>. An adjusting journal entry will be created automatically.</>
                )}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Current Balance</Label>
                  <Input
                    value={selectedAccount ? formatCurrency(selectedAccount.currentBalance) : ''}
                    disabled
                  />
                </div>
                <div>
                  <Label>Target Balance *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="Enter actual balance"
                    value={adjustTarget}
                    onChange={(e) => setAdjustTarget(e.target.value)}
                  />
                </div>
              </div>
              {selectedAccount && adjustTarget && !isNaN(parseFloat(adjustTarget)) && (
                <div className={`p-3 rounded-lg text-sm ${
                  parseFloat(adjustTarget) - selectedAccount.currentBalance >= 0
                    ? 'bg-green-500/10 text-green-400'
                    : 'bg-red-500/10 text-red-400'
                }`}>
                  Adjustment: {formatCurrency(parseFloat(adjustTarget) - selectedAccount.currentBalance)}
                </div>
              )}
              <div>
                <Label>Reason *</Label>
                <Textarea
                  placeholder="e.g., Bank reconciliation, opening balance correction, physical count adjustment..."
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setAdjustDialog(false); setSelectedAccount(null); }}>
                Cancel
              </Button>
              <Button onClick={handleAdjustBalance}>
                Apply Adjustment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        {/* Off-screen report card for screenshot capture */}
        {balanceSheet && (
          <CoaReportCard
            ref={reportRef}
            businessName={businessName}
            branchName={currentBranch?.name || 'Branch'}
            generatedAt={new Date().toLocaleString()}
            formatCurrency={formatCurrency}
            balanceSheet={balanceSheet}
            cashFlowData={cashFlowData || undefined}
            cashFlowPeriod={cashFlowData ? `${cfStartDate} to ${cfEndDate}` : undefined}
          />
        )}
      </div>
    </TooltipProvider>
  )
}
