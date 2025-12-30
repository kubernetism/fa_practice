import React, { useState, useEffect } from 'react'
import { Plus, Search, Pencil, Trash2, DollarSign, Users, TrendingUp } from 'lucide-react'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Commission {
  id: number
  saleId: number
  userId: number
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
  sale?: {
    id: number
    invoiceNumber: string
    totalAmount: number
  }
}

interface CommissionFormData {
  saleId: string
  commissionType: string
  baseAmount: string
  rate: string
  notes: string
}

const COMMISSION_TYPES = [
  { value: 'sale', label: 'Sale' },
  { value: 'referral', label: 'Referral' },
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
  commissionType: 'sale',
  baseAmount: '',
  rate: '',
  notes: '',
}

export default function CommissionsScreen() {
  const [commissions, setCommissions] = useState<Commission[]>([])
  const [sales, setSales] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState<CommissionFormData>(initialFormData)
  const [editingCommission, setEditingCommission] = useState<Commission | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const [commissionsResponse, salesResponse] = await Promise.all([
        window.api.commissions.getAll({ page: 1, limit: 100 }),
        window.api.sales.getAll({ page: 1, limit: 100 }),
      ])

      if (commissionsResponse?.success && commissionsResponse?.data) {
        setCommissions(commissionsResponse.data.map((item: any) => ({
          ...item.commission,
          user: item.user,
          sale: item.sale,
        })))
      } else {
        setCommissions([])
      }

      if (salesResponse?.success && salesResponse?.data) {
        setSales(salesResponse.data)
      } else {
        setSales([])
      }
    } catch (error) {
      console.error('Failed to fetch commissions:', error)
      setCommissions([])
      setSales([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenDialog = (commission?: Commission) => {
    if (commission) {
      setEditingCommission(commission)
      setFormData({
        saleId: commission.saleId.toString(),
        commissionType: commission.commissionType,
        baseAmount: commission.baseAmount.toString(),
        rate: commission.rate.toString(),
        notes: commission.notes || '',
      })
    } else {
      setEditingCommission(null)
      setFormData(initialFormData)
    }
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingCommission(null)
    setFormData(initialFormData)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.saleId || !formData.baseAmount || !formData.rate) {
      alert('Please fill in all required fields')
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
        commissionType: formData.commissionType,
        baseAmount,
        rate,
        commissionAmount: (baseAmount * rate) / 100,
        notes: formData.notes || undefined,
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

      await fetchData()
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
        await fetchData()
      } else {
        alert(response.message || 'Failed to delete commission')
      }
    } catch (error) {
      console.error('Failed to delete commission:', error)
      alert('Failed to delete commission. Please try again.')
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

  const filteredCommissions = commissions.filter((commission) =>
    commission.sale?.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    commission.user?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    commission.commissionType.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Calculate statistics
  const totalCommission = filteredCommissions.reduce((sum, c) => sum + c.commissionAmount, 0)
  const paidCommissions = filteredCommissions.filter((c) => c.status === 'paid')
  const totalPaid = paidCommissions.reduce((sum, c) => sum + c.commissionAmount, 0)
  const pendingCommissions = filteredCommissions.filter((c) => c.status === 'pending')
  const totalPending = pendingCommissions.reduce((sum, c) => sum + c.commissionAmount, 0)

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
        <p className="text-muted-foreground">Track and manage sales commissions</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search commissions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Add Commission
        </Button>
      </div>

      <div className="border rounded-lg p-6 bg-card">
        {filteredCommissions.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No commissions yet. Click "Add Commission" to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Found {filteredCommissions.length} commission(s)
            </p>
            <div className="space-y-2">
              {filteredCommissions.map((commission) => (
                <div key={commission.id} className="flex items-center justify-between p-4 border rounded">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium">{commission.sale?.invoiceNumber || `Sale #${commission.saleId}`}</p>
                      <Badge className={getStatusBadge(commission.status)}>
                        {commission.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {commission.user?.fullName || 'Unknown User'} • {commission.commissionType}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Base: Rs. {commission.baseAmount.toFixed(2)} • Rate: {commission.rate}% •
                      Commission: <span className="font-semibold">Rs. {commission.commissionAmount.toFixed(2)}</span>
                    </p>
                    {commission.notes && (
                      <p className="text-sm text-muted-foreground mt-1">{commission.notes}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(commission)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(commission.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingCommission ? 'Edit Commission' : 'Add New Commission'}</DialogTitle>
            <DialogDescription>
              {editingCommission
                ? 'Update the commission information below.'
                : 'Enter the details for the new commission.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="saleId">Sale / Invoice *</Label>
                <Select
                  value={formData.saleId}
                  onValueChange={(value) => setFormData({ ...formData, saleId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select sale" />
                  </SelectTrigger>
                  <SelectContent>
                    {sales.map((sale) => (
                      <SelectItem key={sale.id} value={sale.id.toString()}>
                        {sale.invoiceNumber} - Rs. {sale.totalAmount?.toFixed(2) || '0.00'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="commissionType">Commission Type</Label>
                <Select
                  value={formData.commissionType}
                  onValueChange={(value) => setFormData({ ...formData, commissionType: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {COMMISSION_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="baseAmount">Base Amount (Rs.) *</Label>
                <Input
                  id="baseAmount"
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
                <Label htmlFor="rate">Commission Rate (%) *</Label>
                <Input
                  id="rate"
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

              {formData.baseAmount && formData.rate && (
                <div className="p-3 bg-muted rounded-md">
                  <p className="text-sm text-muted-foreground">Commission Amount:</p>
                  <p className="text-lg font-bold">
                    Rs. {((parseFloat(formData.baseAmount) * parseFloat(formData.rate)) / 100).toFixed(2)}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button type="submit">{editingCommission ? 'Update' : 'Create'} Commission</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
