import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { Plus, Search, Pencil, Trash2, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip'
import { useBranch } from '@/contexts/branch-context'

const ITEMS_PER_PAGE = 10

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
  const [currentPage, setCurrentPage] = useState(1)

  const fetchData = useCallback(async () => {
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
  }, [currentBranch])

  useEffect(() => {
    if (currentBranch) {
      fetchData()
    }
  }, [currentBranch, fetchData])

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

  const filteredReferralPersons = useMemo(() => {
    return referralPersons.filter((rp) => {
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
  }, [referralPersons, searchTerm, filterStatus])

  // Calculate statistics — derived from the memoized filtered list
  const totalCommissionEarned = useMemo(
    () => filteredReferralPersons.reduce((sum, rp) => sum + (rp.totalCommissionEarned || 0), 0),
    [filteredReferralPersons]
  )
  const totalCommissionPaid = useMemo(
    () => filteredReferralPersons.reduce((sum, rp) => sum + (rp.totalCommissionPaid || 0), 0),
    [filteredReferralPersons]
  )
  const totalPending = totalCommissionEarned - totalCommissionPaid
  const activeCount = useMemo(
    () => filteredReferralPersons.filter((rp) => rp.isActive).length,
    [filteredReferralPersons]
  )

  const paginatedPersons = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredReferralPersons.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredReferralPersons, currentPage])

  const totalPages = Math.ceil(filteredReferralPersons.length / ITEMS_PER_PAGE) || 1

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-lg">Loading referral persons...</p>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="space-y-3">
        {/* Header with inline pills */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold">Referral Persons</h1>
            <div className="flex items-center gap-1.5">
              <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium">
                {filteredReferralPersons.length} Total
              </span>
              <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium">
                {activeCount} Active
              </span>
              <span className="rounded-full bg-green-500/10 text-green-500 px-2.5 py-0.5 text-xs font-medium">
                Rs. {totalCommissionEarned.toFixed(2)} Earned
              </span>
              {totalPending > 0 && (
                <span className="rounded-full bg-yellow-500/10 text-yellow-500 px-2.5 py-0.5 text-xs font-medium">
                  Rs. {totalPending.toFixed(2)} Pending
                </span>
              )}
            </div>
          </div>
          <Button size="sm" className="h-8" onClick={() => handleOpenDialog()}>
            <Plus className="mr-1.5 h-3.5 w-3.5" />
            Add Person
          </Button>
        </div>

        {/* Compact search + filter */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, contact, address..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1) }}
              className="h-8 pl-8 text-sm"
            />
            {searchTerm && (
              <button
                aria-label="Clear search"
                onClick={() => { setSearchTerm(''); setCurrentPage(1) }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <Select value={filterStatus} onValueChange={(v) => { setFilterStatus(v as 'all' | 'active' | 'inactive'); setCurrentPage(1) }}>
            <SelectTrigger className="h-8 w-[130px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="rounded-md border overflow-hidden">
          {paginatedPersons.length === 0 ? (
            <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
              No referral persons found
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="text-[10px] font-semibold uppercase tracking-wider">Name</TableHead>
                  <TableHead className="text-[10px] font-semibold uppercase tracking-wider">Contact</TableHead>
                  <TableHead className="text-[10px] font-semibold uppercase tracking-wider">Rate</TableHead>
                  <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-right">Earned</TableHead>
                  <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-right">Paid</TableHead>
                  <TableHead className="text-[10px] font-semibold uppercase tracking-wider text-right">Pending</TableHead>
                  <TableHead className="text-[10px] font-semibold uppercase tracking-wider">Status</TableHead>
                  <TableHead className="text-[10px] font-semibold uppercase tracking-wider w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedPersons.map((rp) => {
                  const pending = (rp.totalCommissionEarned || 0) - (rp.totalCommissionPaid || 0)
                  return (
                    <TableRow key={rp.id} className="group h-9">
                      <TableCell className="py-1.5">
                        <span className="text-sm font-medium">{rp.name}</span>
                        {rp.address && (
                          <span className="block text-[11px] text-muted-foreground truncate max-w-[180px]">
                            {rp.address}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="py-1.5 text-sm">
                        {rp.contact || <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell className="py-1.5 text-sm">
                        {rp.commissionRate ? `${rp.commissionRate}%` : <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell className="py-1.5 text-right text-sm tabular-nums text-green-600 dark:text-green-400">
                        Rs. {(rp.totalCommissionEarned || 0).toFixed(2)}
                      </TableCell>
                      <TableCell className="py-1.5 text-right text-sm tabular-nums text-blue-600 dark:text-blue-400">
                        Rs. {(rp.totalCommissionPaid || 0).toFixed(2)}
                      </TableCell>
                      <TableCell
                        className="py-1.5 text-right text-sm tabular-nums font-medium"
                        style={{ color: pending > 0 ? 'var(--color-warning)' : undefined }}
                      >
                        Rs. {pending.toFixed(2)}
                      </TableCell>
                      <TableCell className="py-1.5">
                        <Badge
                          variant={rp.isActive ? 'default' : 'secondary'}
                          className="text-[10px] px-1.5 py-0"
                        >
                          {rp.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-1.5">
                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => handleToggleActive(rp)}
                              >
                                <div className={`h-2 w-2 rounded-full ${rp.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>{rp.isActive ? 'Deactivate' : 'Activate'}</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => handleOpenDialog(rp)}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Edit</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => handleDelete(rp.id, rp.name)}
                              >
                                <Trash2 className="h-3.5 w-3.5 text-destructive" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Delete</TooltipContent>
                          </Tooltip>
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
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-1">
            <p className="text-xs text-muted-foreground">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredReferralPersons.length)} of {filteredReferralPersons.length}
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              <span className="text-xs tabular-nums px-1">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}

        {/* Add/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-md" onOpenAutoFocus={(e) => {
            e.preventDefault()
            const nameInput = document.getElementById('name') as HTMLInputElement
            nameInput?.focus()
          }}>
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
    </TooltipProvider>
  )
}
