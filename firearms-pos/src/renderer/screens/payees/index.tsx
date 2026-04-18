import React, { useState, useEffect, useCallback } from 'react'
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
  RefreshCw,
  Contact,
  Link2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

// Vendor payees are managed exclusively via the Suppliers screen.
const PAYEE_TYPES = [
  { value: 'landlord', label: 'Landlord' },
  { value: 'utility', label: 'Utility' },
  { value: 'employee', label: 'Employee' },
  { value: 'government', label: 'Government' },
  { value: 'other', label: 'Other' },
] as const

const ALL_FILTER_TYPES = [
  { value: 'all', label: 'All types' },
  { value: 'vendor', label: 'Vendor' },
  ...PAYEE_TYPES,
] as const

interface Payee {
  id: number
  name: string
  payeeType: 'vendor' | 'landlord' | 'utility' | 'employee' | 'government' | 'other'
  linkedSupplierId: number | null
  contactPhone: string | null
  contactEmail: string | null
  address: string | null
  notes: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  linkedSupplier?: {
    id: number
    name: string
  } | null
}

interface PayeeFormData {
  name: string
  payeeType: string
  contactPhone: string
  contactEmail: string
  address: string
  notes: string
  isActive: boolean
}

const initialFormData: PayeeFormData = {
  name: '',
  payeeType: 'other',
  contactPhone: '',
  contactEmail: '',
  address: '',
  notes: '',
  isActive: true,
}

const typeBadgeColors: Record<string, string> = {
  vendor: 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/20',
  landlord: 'bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/20',
  utility: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/20',
  employee: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
  government: 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/20',
  other: 'bg-muted text-muted-foreground border-muted',
}

export default function PayeesScreen() {
  const [payees, setPayees] = useState<Payee[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalPayees, setTotalPayees] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPayee, setEditingPayee] = useState<Payee | null>(null)
  const [formData, setFormData] = useState<PayeeFormData>(initialFormData)
  const [errors, setErrors] = useState<Partial<Record<keyof PayeeFormData, string>>>({})

  const itemsPerPage = 20

  const fetchPayees = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await window.api.payees.getAll({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm || undefined,
        payeeType: typeFilter !== 'all' ? typeFilter : undefined,
      })
      if (response.success && response.data) {
        setPayees(response.data)
        setTotalPages(response.totalPages || 1)
        setTotalPayees(response.total || 0)
      } else {
        setPayees([])
      }
    } catch (error) {
      console.error('Failed to fetch payees:', error)
      setPayees([])
    } finally {
      setIsLoading(false)
    }
  }, [currentPage, searchTerm, typeFilter])

  useEffect(() => {
    fetchPayees()
  }, [fetchPayees])

  const handleOpenCreateDialog = () => {
    setEditingPayee(null)
    setFormData(initialFormData)
    setErrors({})
    setIsDialogOpen(true)
  }

  const handleOpenEditDialog = (payee: Payee) => {
    if (payee.payeeType === 'vendor') {
      alert('Vendor payees are managed from the Suppliers screen.')
      return
    }
    setEditingPayee(payee)
    setFormData({
      name: payee.name,
      payeeType: payee.payeeType,
      contactPhone: payee.contactPhone || '',
      contactEmail: payee.contactEmail || '',
      address: payee.address || '',
      notes: payee.notes || '',
      isActive: payee.isActive,
    })
    setErrors({})
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingPayee(null)
    setFormData(initialFormData)
    setErrors({})
  }

  const validate = (): boolean => {
    const next: Partial<Record<keyof PayeeFormData, string>> = {}
    if (!formData.name.trim()) next.name = 'Name is required'
    if (!formData.payeeType) next.payeeType = 'Type is required'
    if (formData.payeeType === 'vendor') {
      next.payeeType = 'Vendor payees are auto-created from the Suppliers screen'
    }
    if (formData.contactEmail && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(formData.contactEmail)) {
      next.contactEmail = 'Invalid email'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    const payload = {
      name: formData.name.trim(),
      payeeType: formData.payeeType,
      contactPhone: formData.contactPhone.trim() || undefined,
      contactEmail: formData.contactEmail.trim() || undefined,
      address: formData.address.trim() || undefined,
      notes: formData.notes.trim() || undefined,
      isActive: formData.isActive,
    }

    try {
      const response = editingPayee
        ? await window.api.payees.update(editingPayee.id, payload)
        : await window.api.payees.create(payload)

      if (response.success) {
        handleCloseDialog()
        await fetchPayees()
      } else {
        alert(response.message || 'Failed to save payee')
      }
    } catch (error) {
      console.error('Failed to save payee:', error)
      alert('Failed to save payee. Please try again.')
    }
  }

  const handleDelete = async (payee: Payee) => {
    if (payee.payeeType === 'vendor') {
      alert('Vendor payees are managed from the Suppliers screen. Deactivate the supplier instead.')
      return
    }
    if (!confirm(`Deactivate payee "${payee.name}"? This will hide them from expense entry.`)) return
    try {
      const response = await window.api.payees.delete(payee.id)
      if (response.success) {
        await fetchPayees()
      } else {
        alert(response.message || 'Failed to deactivate payee')
      }
    } catch (error) {
      console.error('Failed to delete payee:', error)
      alert('Failed to deactivate payee. Please try again.')
    }
  }

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-xl font-semibold leading-tight">Payees</h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Recipients of expense payments (vendors, landlords, utilities, employees, government, etc.)
            </p>
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium">
                <Contact className="h-3 w-3" />
                {totalPayees} {totalPayees === 1 ? 'payee' : 'payees'}
              </span>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button onClick={handleOpenCreateDialog} size="sm">
              <Plus className="h-4 w-4 mr-1.5" />
              Add Payee
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search by name…"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className="h-8 pl-8 pr-8 text-sm"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => { setSearchTerm(''); setCurrentPage(1) }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <Select
            value={typeFilter}
            onValueChange={(v) => {
              setTypeFilter(v)
              setCurrentPage(1)
            }}
          >
            <SelectTrigger className="h-8 w-[160px] text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ALL_FILTER_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={fetchPayees}
                aria-label="Refresh payees"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Refresh</TooltipContent>
          </Tooltip>
        </div>

        {/* Table */}
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="text-[10px] font-semibold tracking-wider uppercase h-8 py-0">Name</TableHead>
                <TableHead className="text-[10px] font-semibold tracking-wider uppercase h-8 py-0">Type</TableHead>
                <TableHead className="text-[10px] font-semibold tracking-wider uppercase h-8 py-0">Phone</TableHead>
                <TableHead className="text-[10px] font-semibold tracking-wider uppercase h-8 py-0">Email</TableHead>
                <TableHead className="text-[10px] font-semibold tracking-wider uppercase h-8 py-0">Status</TableHead>
                <TableHead className="text-[10px] font-semibold tracking-wider uppercase h-8 py-0 w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-sm text-muted-foreground">
                    Loading payees…
                  </TableCell>
                </TableRow>
              ) : payees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-sm text-muted-foreground">
                    {searchTerm || typeFilter !== 'all'
                      ? 'No payees match your filters.'
                      : 'No payees yet. Click "Add Payee" to get started.'}
                  </TableCell>
                </TableRow>
              ) : (
                payees.map((payee) => (
                  <TableRow key={payee.id} className="h-9 group">
                    <TableCell className="py-1.5 text-xs font-medium">
                      <div className="flex items-center gap-2">
                        {payee.name}
                        {payee.linkedSupplier && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground/60">
                                <Link2 className="h-3 w-3" />
                                supplier
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              Linked to supplier: {payee.linkedSupplier.name}
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="py-1.5">
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-[10px] px-1.5 py-0 h-4 font-medium capitalize',
                          typeBadgeColors[payee.payeeType] || typeBadgeColors.other
                        )}
                      >
                        {payee.payeeType}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-1.5 text-xs text-muted-foreground">
                      {payee.contactPhone || <span className="text-muted-foreground/40">—</span>}
                    </TableCell>
                    <TableCell className="py-1.5 text-xs text-muted-foreground">
                      {payee.contactEmail || <span className="text-muted-foreground/40">—</span>}
                    </TableCell>
                    <TableCell className="py-1.5">
                      <Badge
                        variant={payee.isActive ? 'default' : 'secondary'}
                        className={cn(
                          'text-[10px] px-1.5 py-0 h-4 font-medium',
                          payee.isActive
                            ? 'bg-green-500/15 text-green-700 dark:text-green-400 border-green-500/20'
                            : 'bg-muted text-muted-foreground'
                        )}
                      >
                        {payee.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-1.5">
                      <div className="flex items-center gap-0.5">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => handleOpenEditDialog(payee)}
                              disabled={payee.payeeType === 'vendor'}
                              aria-label="Edit payee"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {payee.payeeType === 'vendor'
                              ? 'Edit via Suppliers screen'
                              : 'Edit'}
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => handleDelete(payee)}
                              disabled={payee.payeeType === 'vendor'}
                              aria-label="Deactivate payee"
                            >
                              <Trash2 className="h-3.5 w-3.5 text-destructive" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {payee.payeeType === 'vendor'
                              ? 'Deactivate via Suppliers'
                              : 'Deactivate'}
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}

        {/* Add / Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={(open) => (open ? setIsDialogOpen(true) : handleCloseDialog())}>
          <DialogContent className="max-w-md max-h-[85vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>{editingPayee ? 'Edit Payee' : 'Add New Payee'}</DialogTitle>
              <DialogDescription>
                {editingPayee
                  ? 'Update payee details. Vendor-type payees are managed via the Suppliers screen.'
                  : 'Enter the details for the new payee. For suppliers, add them via the Suppliers screen instead.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
              <div className="space-y-3 py-3 overflow-y-auto px-1">
                <div className="space-y-2">
                  <Label htmlFor="payee-name">Name *</Label>
                  <Input
                    id="payee-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. KE (Karachi Electric)"
                    required
                  />
                  {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payee-type">Type *</Label>
                  <Select
                    value={formData.payeeType}
                    onValueChange={(v) => setFormData({ ...formData, payeeType: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAYEE_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.payeeType && <p className="text-xs text-destructive">{errors.payeeType}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payee-phone">Phone</Label>
                  <Input
                    id="payee-phone"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    placeholder="+92 300 1234567"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payee-email">Email</Label>
                  <Input
                    id="payee-email"
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    placeholder="contact@example.com"
                  />
                  {errors.contactEmail && <p className="text-xs text-destructive">{errors.contactEmail}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payee-address">Address</Label>
                  <Textarea
                    id="payee-address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Street, city, state…"
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="payee-notes">Notes</Label>
                  <Textarea
                    id="payee-notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Internal notes"
                    rows={2}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    id="payee-active"
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="h-4 w-4 rounded border-input"
                  />
                  <Label htmlFor="payee-active" className="font-normal">Active</Label>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancel
                </Button>
                <Button type="submit">{editingPayee ? 'Save Changes' : 'Create Payee'}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  )
}
