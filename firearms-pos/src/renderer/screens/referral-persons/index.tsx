import React, { useState, useEffect } from 'react'
import { Plus, Search, Pencil, Trash2, UserPlus, DollarSign, TrendingUp, Phone, MapPin } from 'lucide-react'
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
import { useBranch } from '@/contexts/branch-context'

interface ReferralPerson {
  id: number
  branchId: number
  name: string
  contact: string | null
  address: string | null
  notes: string | null
  isActive: boolean
  totalCommissionEarned: number
  totalCommissionPaid: number
  commissionRate: number | null
  createdAt: string
  updatedAt: string
}

interface ReferralPersonFormData {
  name: string
  contact: string
  address: string
  notes: string
  commissionRate: string
  isActive: boolean
}

const initialFormData: ReferralPersonFormData = {
  name: '',
  contact: '',
  address: '',
  notes: '',
  commissionRate: '',
  isActive: true,
}

export default function ReferralPersonsScreen() {
  const { currentBranch } = useBranch()
  const [referralPersons, setReferralPersons] = useState<ReferralPerson[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState<ReferralPersonFormData>(initialFormData)
  const [editingReferralPerson, setEditingReferralPerson] = useState<ReferralPerson | null>(null)

  useEffect(() => {
    if (currentBranch) {
      fetchData()
    }
  }, [currentBranch])

  const fetchData = async () => {
    if (!currentBranch) return

    try {
      setIsLoading(true)
      const response = await window.api.referralPersons.getAll({ page: 1, limit: 100, branchId: currentBranch.id })

      if (response?.success && response?.data) {
        // Filter by branch on client side as well
        const filteredData = response.data.filter((rp: ReferralPerson) =>
          rp.branchId === currentBranch.id
        )
        setReferralPersons(filteredData)
      } else {
        setReferralPersons([])
      }
    } catch (error) {
      console.error('Failed to fetch referral persons:', error)
      setReferralPersons([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenDialog = (referralPerson?: ReferralPerson) => {
    if (referralPerson) {
      setEditingReferralPerson(referralPerson)
      setFormData({
        name: referralPerson.name,
        contact: referralPerson.contact || '',
        address: referralPerson.address || '',
        notes: referralPerson.notes || '',
        commissionRate: referralPerson.commissionRate?.toString() || '',
        isActive: referralPerson.isActive,
      })
    } else {
      setEditingReferralPerson(null)
      setFormData(initialFormData)
    }
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingReferralPerson(null)
    setFormData(initialFormData)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!currentBranch) {
      alert('Please select a branch first')
      return
    }

    if (!formData.name.trim()) {
      alert('Please enter a name')
      return
    }

    try {
      const data = {
        name: formData.name.trim(),
        contact: formData.contact.trim() || null,
        address: formData.address.trim() || null,
        notes: formData.notes.trim() || null,
        commissionRate: formData.commissionRate ? parseFloat(formData.commissionRate) : null,
        isActive: formData.isActive,
        branchId: currentBranch.id,
      }

      if (editingReferralPerson) {
        const response = await window.api.referralPersons.update(editingReferralPerson.id, data)
        if (!response.success) {
          alert(response.message || 'Failed to update referral person')
          return
        }
      } else {
        const response = await window.api.referralPersons.create(data)
        if (!response.success) {
          alert(response.message || 'Failed to create referral person')
          return
        }
      }

      await fetchData()
      handleCloseDialog()
    } catch (error) {
      console.error('Failed to save referral person:', error)
      alert('Failed to save referral person. Please try again.')
    }
  }

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) {
      return
    }

    try {
      const response = await window.api.referralPersons.delete(id)
      if (response.success) {
        await fetchData()
      } else {
        alert(response.message || 'Failed to delete referral person')
      }
    } catch (error) {
      console.error('Failed to delete referral person:', error)
      alert('Failed to delete referral person. Please try again.')
    }
  }

  const handleToggleActive = async (referralPerson: ReferralPerson) => {
    try {
      const response = await window.api.referralPersons.update(referralPerson.id, {
        isActive: !referralPerson.isActive,
      })
      if (response.success) {
        await fetchData()
      } else {
        alert(response.message || 'Failed to update referral person')
      }
    } catch (error) {
      console.error('Failed to update referral person:', error)
    }
  }

  const filteredReferralPersons = referralPersons.filter((rp) => {
    const matchesSearch =
      rp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (rp.contact && rp.contact.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (rp.address && rp.address.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && rp.isActive) ||
      (filterStatus === 'inactive' && !rp.isActive)

    return matchesSearch && matchesStatus
  })

  // Calculate statistics
  const totalCommissionEarned = filteredReferralPersons.reduce((sum, rp) => sum + (rp.totalCommissionEarned || 0), 0)
  const totalCommissionPaid = filteredReferralPersons.reduce((sum, rp) => sum + (rp.totalCommissionPaid || 0), 0)
  const totalPending = totalCommissionEarned - totalCommissionPaid
  const activeCount = filteredReferralPersons.filter((rp) => rp.isActive).length

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-lg">Loading referral persons...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Referral Persons</h1>
        <p className="text-muted-foreground">Manage commission referral persons and track their earnings {currentBranch && `- ${currentBranch.name}`}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Referral Persons</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-muted-foreground" />
              <p className="text-2xl font-bold">{filteredReferralPersons.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Persons</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-muted-foreground" />
              <p className="text-2xl font-bold">{activeCount}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Commission Earned</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <p className="text-2xl font-bold">Rs. {totalCommissionEarned.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <p className="text-2xl font-bold">Rs. {totalPending.toFixed(2)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search referral persons..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterStatus} onValueChange={(v: any) => setFilterStatus(v)}>
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active Only</SelectItem>
            <SelectItem value="inactive">Inactive Only</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Add Referral Person
        </Button>
      </div>

      <div className="border rounded-lg p-6 bg-card flex-1 overflow-auto">
        {filteredReferralPersons.length === 0 ? (
          <div className="text-center py-12">
            <UserPlus className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">
              {searchTerm || filterStatus !== 'all'
                ? 'No referral persons match your search.'
                : 'No referral persons yet. Click "Add Referral Person" to get started.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Found {filteredReferralPersons.length} referral person(s)
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredReferralPersons.map((referralPerson) => (
                <Card key={referralPerson.id} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg font-semibold">{referralPerson.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant={referralPerson.isActive ? 'default' : 'secondary'}>
                            {referralPerson.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                          {referralPerson.commissionRate && (
                            <Badge variant="outline">{referralPerson.commissionRate}% default rate</Badge>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleActive(referralPerson)}
                        title={referralPerson.isActive ? 'Deactivate' : 'Activate'}
                      >
                        <div
                          className={`h-2 w-2 rounded-full ${
                            referralPerson.isActive ? 'bg-green-500' : 'bg-gray-400'
                          }`}
                        />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {referralPerson.contact && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">{referralPerson.contact}</span>
                      </div>
                    )}
                    {referralPerson.address && (
                      <div className="flex items-start gap-2 text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <span className="text-muted-foreground">{referralPerson.address}</span>
                      </div>
                    )}
                    <div className="pt-2 border-t space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total Earned:</span>
                        <span className="font-semibold text-green-600 dark:text-green-400">
                          Rs. {(referralPerson.totalCommissionEarned || 0).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Total Paid:</span>
                        <span className="font-semibold text-blue-600 dark:text-blue-400">
                          Rs. {(referralPerson.totalCommissionPaid || 0).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm font-medium">
                        <span className="text-muted-foreground">Pending:</span>
                        <span
                          className={`${
                            (referralPerson.totalCommissionEarned || 0) -
                              (referralPerson.totalCommissionPaid || 0) >
                            0
                              ? 'text-orange-600 dark:text-orange-400'
                              : 'text-green-600 dark:text-green-400'
                          }`}
                        >
                          Rs.{' '}
                          {(
                            (referralPerson.totalCommissionEarned || 0) -
                            (referralPerson.totalCommissionPaid || 0)
                          ).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                  <div className="absolute top-3 right-3 flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenDialog(referralPerson)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(referralPerson.id, referralPerson.name)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingReferralPerson ? 'Edit Referral Person' : 'Add New Referral Person'}
            </DialogTitle>
            <DialogDescription>
              {editingReferralPerson
                ? 'Update referral person information below.'
                : 'Enter details for new referral person.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter referral person's name"
                  required
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contact">Contact</Label>
                <Input
                  id="contact"
                  value={formData.contact}
                  onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                  placeholder="Phone number or email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Physical address"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="commissionRate">Default Commission Rate (%)</Label>
                <Input
                  id="commissionRate"
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={formData.commissionRate}
                  onChange={(e) => setFormData({ ...formData, commissionRate: e.target.value })}
                  placeholder="Leave empty to use invoice-specific rate"
                />
                <p className="text-xs text-muted-foreground">
                  This rate will be used by default when creating commissions. You can override it per invoice.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="isActive" className="cursor-pointer">
                  Active (can earn commissions)
                </Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes about this referral person..."
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button type="submit">
                {editingReferralPerson ? 'Update' : 'Create'} Referral Person
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
