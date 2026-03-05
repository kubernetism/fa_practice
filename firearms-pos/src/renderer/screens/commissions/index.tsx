import React, { useState, useEffect } from 'react'
import { Plus, Search, Pencil, Trash2, DollarSign, Users, TrendingUp, UserPlus, FileText, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useBranch } from '@/contexts/branch-context'
import { ReversalRequestModal } from '@/components/reversal-request-modal'
import { ReversalStatusBadge } from '@/components/reversal-status-badge'

interface Commission {
  id: number
  saleId: number
  userId: number | null
  referralPersonId: number | null
  branchId: number
  commissionType: string
  baseAmount: number
  rate: number
  commissionAmount: number
  status: string
  paidDate: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
  // Joined data
  user?: {
    id: number
    username: string
    fullName: string
  }
  referralPerson?: {
    id: number
    name: string
    contact: string | null
  }
  sale?: {
    id: number
    invoiceNumber: string
    totalAmount: number
    saleDate: string
  }
}

interface ReferralPerson {
  id: number
  name: string
  contact: string | null
  commissionRate: number | null
}

interface Sale {
  id: number
  invoiceNumber: string
  totalAmount: number
  saleDate: string
}

interface CommissionFormData {
  saleId: string
  commissionType: string
  baseAmount: string
  rate: string
  referralPersonId: string
  userId: string
  notes: string
}

const COMMISSION_TYPES = [
  { value: 'referral', label: 'Referral Commission' },
  { value: 'sale', label: 'Employee Commission' },
  { value: 'bonus', label: 'Bonus' },
]

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'paid', label: 'Paid' },
  { value: 'cancelled', label: 'Cancelled' },
]

const initialFormData: CommissionFormData = {
  saleId: '',
  commissionType: 'referral',
  baseAmount: '',
  rate: '',
  referralPersonId: '',
  userId: '',
  notes: '',
}

export default function CommissionsScreen() {
  const { currentBranch } = useBranch()
  const [commissions, setCommissions] = useState<Commission[]>([])
  const [referralPersons, setReferralPersons] = useState<ReferralPerson[]>([])
  const [availableInvoices, setAvailableInvoices] = useState<Sale[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [referralPersonFilter, setReferralPersonFilter] = useState<string>('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState<CommissionFormData>(initialFormData)
  const [editingCommission, setEditingCommission] = useState<Commission | null>(null)
  const [createMode, setCreateMode] = useState<'select' | 'referral' | 'employee'>('referral')
  const [selectedTab, setSelectedTab] = useState<'referral' | 'employee'>('referral')
  const [isReversalModalOpen, setIsReversalModalOpen] = useState(false)
  const [reversalTarget, setReversalTarget] = useState<Commission | null>(null)

  useEffect(() => {
    if (currentBranch) {
      fetchInitialData()
    }
  }, [currentBranch])

  const fetchInitialData = async () => {
    await Promise.all([fetchCommissions(), fetchReferralPersons()])
  }

  const fetchCommissions = async () => {
    if (!currentBranch) return

    try {
      setIsLoading(true)
      const response = await window.api.commissions.getAll({ page: 1, limit: 100, branchId: currentBranch.id })

      if (response?.success && response?.data) {
        // Filter by branch on client side as well
        const filteredData = response.data.filter((item: any) =>
          item.commission.branchId === currentBranch.id
        )
        setCommissions(filteredData.map((item: any) => ({
          ...item.commission,
          user: item.user,
          referralPerson: item.referralPerson,
          sale: item.sale,
        })))
      } else {
        setCommissions([])
      }
    } catch (error) {
      console.error('Failed to fetch commissions:', error)
      setCommissions([])
    } finally {
      setIsLoading(false)
    }
  }

  const fetchReferralPersons = async () => {
    try {
      const response = await window.api.referralPersons.getForSelect()
      if (response?.success && response?.data) {
        setReferralPersons(response.data)
      }
    } catch (error) {
      console.error('Failed to fetch referral persons:', error)
    }
  }

  const fetchAvailableInvoices = async (referralPersonId?: number) => {
    try {
      const response = await window.api.commissions.getAvailableInvoices(referralPersonId)
      if (response?.success && response?.data) {
        setAvailableInvoices(response.data)
      } else {
        setAvailableInvoices([])
      }
    } catch (error) {
      console.error('Failed to fetch available invoices:', error)
      setAvailableInvoices([])
    }
  }

  const handleOpenDialog = (commission?: Commission, mode: 'referral' | 'employee' = 'referral') => {
    setSelectedTab(mode)
    setCreateMode(mode)
    if (commission) {
      setEditingCommission(commission)
      setFormData({
        saleId: commission.saleId.toString(),
        commissionType: commission.commissionType,
        baseAmount: commission.baseAmount.toString(),
        rate: commission.rate.toString(),
        referralPersonId: commission.referralPersonId?.toString() || '',
        userId: commission.userId?.toString() || '',
        notes: commission.notes || '',
      })
    } else {
      setEditingCommission(null)
      setFormData({
        ...initialFormData,
        commissionType: mode === 'referral' ? 'referral' : 'sale',
      })
    }

    // Fetch ALL available invoices when opening dialog
    fetchAvailableInvoices()

    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingCommission(null)
    setFormData(initialFormData)
    setAvailableInvoices([])
  }

  const handleCommissionTypeChange = (type: string) => {
    setSelectedTab(type === 'referral' ? 'referral' : 'employee')
    setFormData({ ...formData, commissionType: type })
  }

  const handleReferralPersonChange = async (referralPersonId: string) => {
    setFormData({ ...formData, referralPersonId })
    // Invoices are already loaded - no need to refetch
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!currentBranch) {
      alert('Please select a branch first')
      return
    }

    const isReferralCommission = formData.commissionType === 'referral'
    if (isReferralCommission && !formData.referralPersonId) {
      alert('Please select a referral person')
      return
    }
    if (!isReferralCommission && !formData.userId) {
      alert('Please select an employee')
      return
    }
    if (!formData.saleId) {
      alert('Please select a sale/invoice')
      return
    }
    if (!formData.baseAmount || !formData.rate) {
      alert('Please fill in base amount and rate')
      return
    }

    const baseAmount = parseFloat(formData.baseAmount)
    const rate = parseFloat(formData.rate)

    if (baseAmount <= 0 || rate <= 0) {
      alert('Base amount and rate must be greater than 0')
      return
    }

    try {
      const commissionData = {
        saleId: parseInt(formData.saleId),
        branchId: currentBranch.id,
        commissionType: formData.commissionType,
        baseAmount,
        rate,
        notes: formData.notes || undefined,
        referralPersonId: formData.referralPersonId ? parseInt(formData.referralPersonId) : undefined,
        userId: formData.userId ? parseInt(formData.userId) : undefined,
      }

      if (editingCommission) {
        const response = await window.api.commissions.update(editingCommission.id, commissionData)
        if (!response.success) {
          alert(response.message || 'Failed to update commission')
          return
        }
      } else {
        const response = await window.api.commissions.create(commissionData)
        if (!response.success) {
          alert(response.message || 'Failed to create commission')
          return
        }
      }

      await fetchCommissions()
      await fetchReferralPersons()
      handleCloseDialog()
    } catch (error) {
      console.error('Failed to save commission:', error)
      alert('Failed to save commission. Please try again.')
    }
  }

  const handleDelete = async (commissionId: number) => {
    if (!confirm('Are you sure you want to delete this commission?')) {
      return
    }

    try {
      const response = await window.api.commissions.delete(commissionId)
      if (response.success) {
        await fetchCommissions()
        await fetchReferralPersons()
      } else {
        alert(response.message || 'Failed to delete commission')
      }
    } catch (error) {
      console.error('Failed to delete commission:', error)
      alert('Failed to delete commission. Please try again.')
    }
  }

  const handleApprove = async (id: number) => {
    try {
      const response = await window.api.commissions.approve([id])
      if (response.success) {
        await fetchCommissions()
      } else {
        alert(response.message || 'Failed to approve commission')
      }
    } catch (error) {
      console.error('Failed to approve commission:', error)
    }
  }

  const handleMarkPaid = async (id: number) => {
    try {
      const response = await window.api.commissions.markPaid([id])
      if (response.success) {
        await fetchCommissions()
        await fetchReferralPersons()
      } else {
        alert(response.message || 'Failed to mark commission as paid')
      }
    } catch (error) {
      console.error('Failed to mark commission as paid:', error)
    }
  }

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      approved: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      paid: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      cancelled: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    }
    return colors[status] || colors.pending
  }

  const filteredCommissions = commissions.filter((commission) => {
    const matchesSearch =
      commission.sale?.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      commission.referralPerson?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      commission.user?.fullName?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'all' || commission.status === statusFilter
    const matchesType = typeFilter === 'all' || commission.commissionType === typeFilter
    const matchesReferralPerson =
      referralPersonFilter === 'all' ||
      (referralPersonFilter === 'unassigned' && !commission.referralPersonId) ||
      (referralPersonFilter !== 'unassigned' && commission.referralPersonId === parseInt(referralPersonFilter))

    return matchesSearch && matchesStatus && matchesType && matchesReferralPerson
  })

  // Calculate statistics
  const totalCommission = filteredCommissions.reduce((sum, c) => sum + c.commissionAmount, 0)
  const paidCommissions = filteredCommissions.filter((c) => c.status === 'paid')
  const totalPaid = paidCommissions.reduce((sum, c) => sum + c.commissionAmount, 0)
  const pendingCommissions = filteredCommissions.filter((c) => c.status === 'pending')
  const totalPending = pendingCommissions.reduce((sum, c) => sum + c.commissionAmount, 0)
  const referralCommissions = filteredCommissions.filter((c) => c.commissionType === 'referral')
  const totalReferralCommission = referralCommissions.reduce((sum, c) => sum + c.commissionAmount, 0)

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-lg">Loading commissions...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Commission Management</h1>
        <p className="text-muted-foreground">
          Pay commissions to Referral Persons and Employees based on sales invoices {currentBranch && `- ${currentBranch.name}`}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Commissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <p className="text-2xl font-bold">Rs. {totalCommission.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Paid Commissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <p className="text-2xl font-bold">Rs. {totalPaid.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Commissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <p className="text-2xl font-bold">Rs. {totalPending.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Referral Commissions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-muted-foreground" />
              <p className="text-2xl font-bold">Rs. {totalReferralCommission.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search commissions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="referral">Referral</SelectItem>
            <SelectItem value="sale">Employee</SelectItem>
            <SelectItem value="bonus">Bonus</SelectItem>
          </SelectContent>
        </Select>
        <Select value={referralPersonFilter} onValueChange={setReferralPersonFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by person" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Persons</SelectItem>
            <SelectItem value="unassigned">Unassigned</SelectItem>
            {referralPersons.map((rp) => (
              <SelectItem key={rp.id} value={rp.id.toString()}>
                {rp.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={() => handleOpenDialog(undefined, 'referral')}>
          <Plus className="h-4 w-4 mr-2" />
          Create Commission
        </Button>
      </div>

      <div className="border rounded-lg p-6 bg-card flex-1 overflow-auto">
        {filteredCommissions.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {searchTerm || statusFilter !== 'all' || typeFilter !== 'all' || referralPersonFilter !== 'all'
                ? 'No commissions match your filters.'
                : 'No commissions yet. Click "Create Commission" to get started.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Found {filteredCommissions.length} commission(s)
            </p>
            <div className="space-y-2">
              {filteredCommissions.map((commission) => (
                <div key={commission.id} className="border rounded p-4 hover:bg-accent/50 transition-colors">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-base">
                          {commission.sale?.invoiceNumber || `Sale #${commission.saleId}`}
                        </p>
                        <Badge className={getStatusBadge(commission.status)}>
                          {commission.status}
                        </Badge>
                        <ReversalStatusBadge entityType="commission" entityId={commission.id} />
                        <Badge variant="outline">
                          {commission.commissionType}
                        </Badge>
                        {commission.commissionType === 'referral' && commission.referralPerson && (
                          <Badge variant="secondary">
                            <UserPlus className="h-3 w-3 mr-1" />
                            {commission.referralPerson.name}
                          </Badge>
                        )}
                        {commission.commissionType === 'sale' && commission.user && (
                          <Badge variant="secondary">
                            {commission.user.fullName}
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div className="flex items-center gap-4">
                          <span>Base: Rs. {commission.baseAmount.toFixed(2)}</span>
                          <span>Rate: {commission.rate}%</span>
                          <span className="font-semibold text-primary">
                            Commission: Rs. {commission.commissionAmount.toFixed(2)}
                          </span>
                        </div>
                        {commission.sale?.saleDate && (
                          <span>Sale Date: {new Date(commission.sale.saleDate).toLocaleDateString()}</span>
                        )}
                        {commission.referralPerson?.contact && (
                          <span>Contact: {commission.referralPerson.contact}</span>
                        )}
                      </div>
                      {commission.notes && (
                        <p className="text-sm text-muted-foreground italic">{commission.notes}</p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      {commission.status === 'pending' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleApprove(commission.id)}
                          title="Approve commission"
                        >
                          <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </Button>
                      )}
                      {commission.status === 'approved' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMarkPaid(commission.id)}
                          title="Mark as paid"
                        >
                          <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
                        </Button>
                      )}
                      {commission.status !== 'cancelled' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setReversalTarget(commission)
                            setIsReversalModalOpen(true)
                          }}
                          title="Request Reversal"
                        >
                          <RotateCcw className="h-4 w-4 text-amber-500" />
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(commission)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(commission.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingCommission ? 'Edit Commission' : 'Create New Commission'}
            </DialogTitle>
            <DialogDescription>
              {editingCommission
                ? 'Update commission information below.'
                : 'Select an invoice and referral person/employee to create a commission.'}
            </DialogDescription>
          </DialogHeader>

          <Tabs value={selectedTab} onValueChange={(v: any) => setSelectedTab(v)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="referral">
                <UserPlus className="h-4 w-4 mr-2" />
                Referral Commission
              </TabsTrigger>
              <TabsTrigger value="employee">
                <Users className="h-4 w-4 mr-2" />
                Employee Commission
              </TabsTrigger>
            </TabsList>

            {/* Referral Commission Tab */}
            <TabsContent value="referral" className="space-y-4 mt-4">
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="referralPerson">Referral Person *</Label>
                    <Select
                      value={formData.referralPersonId}
                      onValueChange={handleReferralPersonChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select referral person" />
                      </SelectTrigger>
                      <SelectContent>
                        {referralPersons.map((rp) => (
                          <SelectItem key={rp.id} value={rp.id.toString()}>
                            <div>
                              <span className="font-medium">{rp.name}</span>
                              {rp.commissionRate && (
                                <span className="text-xs text-muted-foreground ml-2">
                                  (Default: {rp.commissionRate}%)
                                </span>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="saleId-referral">Select Invoice *</Label>
                    <Select
                      value={formData.saleId}
                      onValueChange={(v) => setFormData({ ...formData, saleId: v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select invoice" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableInvoices.map((sale) => (
                          <SelectItem key={sale.id} value={sale.id.toString()}>
                            <div className="flex justify-between w-full pr-2">
                              <span>{sale.invoiceNumber}</span>
                              <span className="text-muted-foreground">
                                Rs. {(sale.totalAmount || 0).toFixed(2)}
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                        {availableInvoices.length === 0 && (
                          <div className="p-2 text-sm text-muted-foreground text-center">
                            No completed invoices available
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {formData.saleId && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="baseAmount-referral">Base Amount (Rs.) *</Label>
                        <Input
                          id="baseAmount-referral"
                          type="number"
                          step="0.01"
                          min="0"
                          value={formData.baseAmount}
                          onChange={(e) => setFormData({ ...formData, baseAmount: e.target.value })}
                          placeholder="0.00"
                          required
                        />
                        <p className="text-xs text-muted-foreground">
                          Amount from sale invoice that commission is based on
                        </p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="rate-referral">Commission Rate (%) *</Label>
                        <Input
                          id="rate-referral"
                          type="number"
                          step="0.01"
                          min="0"
                          max="100"
                          value={formData.rate}
                          onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                          placeholder="0.00"
                          required
                        />
                        {formData.referralPersonId && (
                          <p className="text-xs text-muted-foreground">
                            {referralPersons.find(
                              (rp) => rp.id === parseInt(formData.referralPersonId)
                            )?.commissionRate && (
                              <span>
                                Default for this person:{' '}
                                {
                                  referralPersons.find(
                                    (rp) => rp.id === parseInt(formData.referralPersonId)
                                  )?.commissionRate
                                }
                                %
                              </span>
                            )}
                          </p>
                        )}
                      </div>
                    </>
                  )}

                  {formData.baseAmount && formData.rate && (
                    <div className="col-span-2 p-4 bg-muted rounded-md">
                      <p className="text-sm text-muted-foreground">Commission Amount:</p>
                      <p className="text-2xl font-bold text-primary">
                        Rs. {((parseFloat(formData.baseAmount) * parseFloat(formData.rate)) / 100).toFixed(2)}
                      </p>
                    </div>
                  )}

                  <div className="space-y-2 col-span-2">
                    <Label htmlFor="notes-referral">Notes</Label>
                    <Textarea
                      id="notes-referral"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Additional notes about this commission..."
                      rows={3}
                    />
                  </div>
                </div>

                <DialogFooter className="mt-4">
                  <Button type="button" variant="outline" onClick={handleCloseDialog}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingCommission ? 'Update' : 'Create'} Commission
                  </Button>
                </DialogFooter>
              </form>
            </TabsContent>

            {/* Employee Commission Tab */}
            <TabsContent value="employee" className="space-y-4 mt-4">
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div className="p-4 bg-muted/50 rounded-md border border-dashed">
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <UserPlus className="h-4 w-4" />
                      For referral commissions, use the "Referral Commission" tab above.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="userId">Employee</Label>
                    <Select
                      value={formData.userId || "none"}
                      onValueChange={(v) => setFormData({ ...formData, userId: v === "none" ? "" : v })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select employee (optional)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No employee selected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="saleId-employee">Select Invoice *</Label>
                    <Input
                      id="saleId-employee"
                      type="number"
                      value={formData.saleId}
                      onChange={(e) => setFormData({ ...formData, saleId: e.target.value })}
                      placeholder="Enter sale/invoice ID"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter the sale/invoice ID to create commission for
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="baseAmount-employee">Base Amount (Rs.) *</Label>
                      <Input
                        id="baseAmount-employee"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.baseAmount}
                        onChange={(e) => setFormData({ ...formData, baseAmount: e.target.value })}
                        placeholder="0.00"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="rate-employee">Commission Rate (%) *</Label>
                      <Input
                        id="rate-employee"
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={formData.rate}
                        onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                        placeholder="0.00"
                        required
                      />
                    </div>
                  </div>

                  {formData.baseAmount && formData.rate && (
                    <div className="p-4 bg-muted rounded-md">
                      <p className="text-sm text-muted-foreground">Commission Amount:</p>
                      <p className="text-2xl font-bold text-primary">
                        Rs. {((parseFloat(formData.baseAmount) * parseFloat(formData.rate)) / 100).toFixed(2)}
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="notes-employee">Notes</Label>
                    <Textarea
                      id="notes-employee"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Additional notes about this commission..."
                      rows={3}
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={handleCloseDialog}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingCommission ? 'Update' : 'Create'} Commission
                  </Button>
                </DialogFooter>
              </form>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Reversal Request Modal */}
      {reversalTarget && (
        <ReversalRequestModal
          open={isReversalModalOpen}
          onClose={() => {
            setIsReversalModalOpen(false)
            setReversalTarget(null)
          }}
          entityType="commission"
          entityId={reversalTarget.id}
          entityLabel={`Commission #${reversalTarget.id} (${reversalTarget.sale?.invoiceNumber || `Sale #${reversalTarget.saleId}`})`}
          branchId={reversalTarget.branchId}
          onSuccess={fetchCommissions}
        />
      )}
    </div>
  )
}
