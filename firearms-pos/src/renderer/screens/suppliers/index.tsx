import React, { useState, useEffect, useCallback } from 'react'
import {
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  Building2,
  ChevronLeft,
  ChevronRight,
  User,
  Phone,
  Mail,
  MapPin,
  FileText,
  X,
  RefreshCw,
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
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from '@/components/ui/tooltip'
import { Separator } from '@/components/ui/separator'
import { formatDateTime, cn } from '@/lib/utils'

interface Supplier {
  id: number
  name: string
  contactPerson: string | null
  email: string | null
  phone: string | null
  address: string | null
  city: string | null
  state: string | null
  zipCode: string | null
  taxId: string | null
  paymentTerms: string | null
  notes: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface SupplierFormData {
  name: string
  contactPerson: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
  taxId: string
  paymentTerms: string
  notes: string
}

const initialFormData: SupplierFormData = {
  name: '',
  contactPerson: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  zipCode: '',
  taxId: '',
  paymentTerms: '',
  notes: '',
}

function buildFullAddress(supplier: Supplier): string {
  return [supplier.address, supplier.city, supplier.state, supplier.zipCode]
    .filter(Boolean)
    .join(', ')
}

export default function SuppliersScreen() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalSuppliers, setTotalSuppliers] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)
  const [viewingSupplier, setViewingSupplier] = useState<Supplier | null>(null)
  const [formData, setFormData] = useState<SupplierFormData>(initialFormData)
  const [errors, setErrors] = useState<Partial<SupplierFormData>>({})

  const itemsPerPage = 20

  const fetchSuppliers = useCallback(async () => {
    setIsLoading(true)
    try {
      const response = await window.api.suppliers.getAll({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        isActive: true,
      })

      if (response.success && response.data) {
        setSuppliers(response.data)
        setTotalPages(response.totalPages || 1)
        setTotalSuppliers(response.total || 0)
      }
    } catch (error) {
      console.error('Failed to fetch suppliers:', error)
    } finally {
      setIsLoading(false)
    }
  }, [currentPage, searchTerm])

  useEffect(() => {
    fetchSuppliers()
  }, [fetchSuppliers])

  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setCurrentPage(1)
  }

  const handleOpenDialog = (supplier?: Supplier) => {
    if (supplier) {
      setEditingSupplier(supplier)
      setFormData({
        name: supplier.name,
        contactPerson: supplier.contactPerson || '',
        email: supplier.email || '',
        phone: supplier.phone || '',
        address: supplier.address || '',
        city: supplier.city || '',
        state: supplier.state || '',
        zipCode: supplier.zipCode || '',
        taxId: supplier.taxId || '',
        paymentTerms: supplier.paymentTerms || '',
        notes: supplier.notes || '',
      })
    } else {
      setEditingSupplier(null)
      setFormData(initialFormData)
    }
    setErrors({})
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingSupplier(null)
    setFormData(initialFormData)
    setErrors({})
  }

  const handleViewSupplier = (supplier: Supplier) => {
    setViewingSupplier(supplier)
    setIsViewDialogOpen(true)
  }

  const handleCloseViewDialog = () => {
    setIsViewDialogOpen(false)
    setViewingSupplier(null)
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<SupplierFormData> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Supplier name is required'
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      if (editingSupplier) {
        const response = await window.api.suppliers.update(editingSupplier.id, formData)
        if (!response.success) {
          alert(response.message || 'Failed to update supplier')
          return
        }
      } else {
        const response = await window.api.suppliers.create(formData)
        if (!response.success) {
          alert(response.message || 'Failed to create supplier')
          return
        }
      }

      await fetchSuppliers()
      handleCloseDialog()
    } catch (error) {
      console.error('Failed to save supplier:', error)
      alert('Failed to save supplier. Please try again.')
    }
  }

  const handleDelete = async (supplierId: number) => {
    if (!confirm('Are you sure you want to deactivate this supplier? This action will mark them as inactive.')) {
      return
    }

    try {
      const response = await window.api.suppliers.delete(supplierId)
      if (!response.success) {
        alert(response.message || 'Failed to delete supplier')
        return
      }
      await fetchSuppliers()
    } catch (error) {
      console.error('Failed to delete supplier:', error)
      alert('Failed to delete supplier. It may have associated purchase transactions.')
    }
  }

  const handleInputChange = (field: keyof SupplierFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const activeCount = suppliers.filter((s) => s.isActive).length
  const inactiveCount = totalSuppliers - activeCount

  const handleAddNew = () => handleOpenDialog()

  return (
    <TooltipProvider>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <h1 className="text-xl font-semibold shrink-0">Suppliers</h1>
            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium">
              <Building2 className="h-3 w-3" />
              {totalSuppliers} total
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
              {activeCount} active this page
            </span>
            {inactiveCount > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
                {inactiveCount} inactive
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search suppliers..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="h-8 pl-8 pr-8 w-56 text-sm"
              />
              {searchTerm && (
                <button
                  onClick={() => handleSearch('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={fetchSuppliers}
                  disabled={isLoading}
                >
                  <RefreshCw className={cn('h-3.5 w-3.5', isLoading && 'animate-spin')} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Refresh</TooltipContent>
            </Tooltip>
            <Button size="sm" className="h-8" onClick={handleAddNew}>
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              Add Supplier
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground">
                  Supplier
                </TableHead>
                <TableHead className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground">
                  Contact
                </TableHead>
                <TableHead className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground">
                  Business Info
                </TableHead>
                <TableHead className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground">
                  Status
                </TableHead>
                <TableHead className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground w-[100px] text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-sm text-muted-foreground">
                    Loading suppliers...
                  </TableCell>
                </TableRow>
              ) : suppliers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-sm text-muted-foreground">
                    {searchTerm
                      ? 'No suppliers found matching your search.'
                      : 'No suppliers yet. Add your first supplier to get started.'}
                  </TableCell>
                </TableRow>
              ) : (
                suppliers.map((supplier) => {
                  const address = buildFullAddress(supplier)
                  return (
                    <TableRow key={supplier.id} className="group h-9">
                      {/* Supplier Name + Address */}
                      <TableCell className="py-1.5">
                        <div className="flex flex-col">
                          <span className="font-medium text-sm leading-tight">{supplier.name}</span>
                          {address && (
                            <span className="text-[11px] text-muted-foreground leading-tight flex items-center gap-1 mt-0.5">
                              <MapPin className="h-2.5 w-2.5 shrink-0" />
                              {address}
                            </span>
                          )}
                        </div>
                      </TableCell>

                      {/* Contact Person + Phone + Email */}
                      <TableCell className="py-1.5">
                        {supplier.contactPerson || supplier.phone || supplier.email ? (
                          <div className="flex flex-col">
                            {supplier.contactPerson && (
                              <span className="text-sm font-medium leading-tight flex items-center gap-1">
                                <User className="h-3 w-3 text-muted-foreground shrink-0" />
                                {supplier.contactPerson}
                              </span>
                            )}
                            <div className="flex items-center gap-2 mt-0.5">
                              {supplier.phone && (
                                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                                  <Phone className="h-2.5 w-2.5 shrink-0" />
                                  {supplier.phone}
                                </span>
                              )}
                              {supplier.email && (
                                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                                  <Mail className="h-2.5 w-2.5 shrink-0" />
                                  {supplier.email}
                                </span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>

                      {/* Tax ID + Payment Terms */}
                      <TableCell className="py-1.5">
                        {supplier.taxId || supplier.paymentTerms ? (
                          <div className="flex flex-col gap-0.5">
                            {supplier.taxId && (
                              <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                                <FileText className="h-2.5 w-2.5 shrink-0" />
                                Tax: {supplier.taxId}
                              </span>
                            )}
                            {supplier.paymentTerms && (
                              <span className="text-[11px] text-muted-foreground">
                                Terms: {supplier.paymentTerms}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>

                      {/* Status */}
                      <TableCell className="py-1.5">
                        <Badge
                          variant={supplier.isActive ? 'default' : 'secondary'}
                          className="text-[10px] px-1.5 py-0"
                        >
                          {supplier.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="py-1.5 text-right">
                        <div className="flex items-center justify-end gap-0.5">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => handleViewSupplier(supplier)}
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>View details</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => handleOpenDialog(supplier)}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Edit supplier</TooltipContent>
                          </Tooltip>
                          {supplier.isActive && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => handleDelete(supplier.id)}
                                >
                                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Deactivate supplier</TooltipContent>
                            </Tooltip>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-2 border-t bg-muted/10">
            <p className="text-xs text-muted-foreground">
              {suppliers.length > 0
                ? `${(currentPage - 1) * itemsPerPage + 1}–${Math.min(currentPage * itemsPerPage, totalSuppliers)} of ${totalSuppliers} suppliers`
                : 'No suppliers'}
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
              <span className="text-xs text-muted-foreground px-1 tabular-nums">
                {currentPage} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="icon"
                className="h-7 w-7"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages || totalPages === 0}
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Add/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}</DialogTitle>
              <DialogDescription>
                {editingSupplier
                  ? 'Update the supplier information below.'
                  : 'Enter the details for the new supplier.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                {/* Basic Information */}
                <div>
                  <h3 className="text-sm font-semibold mb-3">Basic Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="name">
                        Supplier Name <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Enter supplier company name"
                        className={cn(errors.name && 'border-destructive')}
                      />
                      {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contactPerson">Contact Person</Label>
                      <Input
                        id="contactPerson"
                        value={formData.contactPerson}
                        onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                        placeholder="Enter contact person name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="Enter phone number"
                      />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="Enter email address"
                        className={cn(errors.email && 'border-destructive')}
                      />
                      {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Address Information */}
                <div>
                  <h3 className="text-sm font-semibold mb-3">Address Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="address">Street Address</Label>
                      <Input
                        id="address"
                        value={formData.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        placeholder="Enter street address"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        placeholder="Enter city"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        value={formData.state}
                        onChange={(e) => handleInputChange('state', e.target.value)}
                        placeholder="Enter state"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zipCode">ZIP Code</Label>
                      <Input
                        id="zipCode"
                        value={formData.zipCode}
                        onChange={(e) => handleInputChange('zipCode', e.target.value)}
                        placeholder="Enter ZIP code"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Business Information */}
                <div>
                  <h3 className="text-sm font-semibold mb-3">Business Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="taxId">Tax ID</Label>
                      <Input
                        id="taxId"
                        value={formData.taxId}
                        onChange={(e) => handleInputChange('taxId', e.target.value)}
                        placeholder="Enter tax ID number"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="paymentTerms">Payment Terms</Label>
                      <Input
                        id="paymentTerms"
                        value={formData.paymentTerms}
                        onChange={(e) => handleInputChange('paymentTerms', e.target.value)}
                        placeholder="e.g., Net 30, Net 60"
                      />
                    </div>
                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => handleInputChange('notes', e.target.value)}
                        placeholder="Additional notes about this supplier"
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancel
                </Button>
                <Button type="submit">{editingSupplier ? 'Update' : 'Create'} Supplier</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* View Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Supplier Details</DialogTitle>
            </DialogHeader>
            {viewingSupplier && (
              <div className="space-y-6 py-4">
                {/* Basic Information */}
                <div>
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Supplier Name</Label>
                      <p className="font-medium">{viewingSupplier.name}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Status</Label>
                      <div className="mt-1">
                        <Badge variant={viewingSupplier.isActive ? 'default' : 'secondary'}>
                          {viewingSupplier.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Contact Person</Label>
                      <p className="font-medium">{viewingSupplier.contactPerson || '-'}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Phone</Label>
                      <p className="font-medium">{viewingSupplier.phone || '-'}</p>
                    </div>
                    <div className="col-span-2">
                      <Label className="text-muted-foreground">Email</Label>
                      <p className="font-medium">{viewingSupplier.email || '-'}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Address Information */}
                <div>
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Address
                  </h3>
                  <div className="space-y-2">
                    <p className="font-medium">{viewingSupplier.address || '-'}</p>
                    <p className="text-sm text-muted-foreground">
                      {[viewingSupplier.city, viewingSupplier.state, viewingSupplier.zipCode]
                        .filter(Boolean)
                        .join(', ') || '-'}
                    </p>
                  </div>
                </div>

                <Separator />

                {/* Business Information */}
                <div>
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Business Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Tax ID</Label>
                      <p className="font-medium">{viewingSupplier.taxId || '-'}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Payment Terms</Label>
                      <p className="font-medium">{viewingSupplier.paymentTerms || '-'}</p>
                    </div>
                    {viewingSupplier.notes && (
                      <div className="col-span-2">
                        <Label className="text-muted-foreground">Notes</Label>
                        <p className="font-medium whitespace-pre-wrap">{viewingSupplier.notes}</p>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Metadata */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="text-muted-foreground">Created</Label>
                    <p>{formatDateTime(viewingSupplier.createdAt)}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Last Updated</Label>
                    <p>{formatDateTime(viewingSupplier.updatedAt)}</p>
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={handleCloseViewDialog}>
                Close
              </Button>
              {viewingSupplier && (
                <Button
                  onClick={() => {
                    handleCloseViewDialog()
                    handleOpenDialog(viewingSupplier)
                  }}
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  )
}
