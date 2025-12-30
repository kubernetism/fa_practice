import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  Users,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  CheckCircle,
  User,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Calendar,
  FileText,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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
import { Separator } from '@/components/ui/separator'
import { formatDateTime, cn } from '@/lib/utils'

interface Customer {
  id: number
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
  address: string | null
  city: string | null
  state: string | null
  zipCode: string | null
  governmentIdType: string | null
  governmentIdNumber: string | null
  firearmLicenseNumber: string | null
  licenseExpiryDate: string | null
  dateOfBirth: string | null
  notes: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface CustomerFormData {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zipCode: string
  governmentIdType: string
  governmentIdNumber: string
  firearmLicenseNumber: string
  licenseExpiryDate: string
  dateOfBirth: string
  notes: string
}

const initialFormData: CustomerFormData = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  state: '',
  zipCode: '',
  governmentIdType: '',
  governmentIdNumber: '',
  firearmLicenseNumber: '',
  licenseExpiryDate: '',
  dateOfBirth: '',
  notes: '',
}

const GOVERNMENT_ID_TYPES = [
  { value: 'drivers_license', label: "Driver's License" },
  { value: 'passport', label: 'Passport' },
  { value: 'state_id', label: 'State ID' },
  { value: 'military_id', label: 'Military ID' },
  { value: 'other', label: 'Other' },
]

const ITEMS_PER_PAGE = 10

export function CustomersScreen() {
  // Customer data
  const [customers, setCustomers] = useState<Customer[]>([])

  // Dialog states
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  // Form states
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null)
  const [deletingCustomer, setDeletingCustomer] = useState<Customer | null>(null)
  const [formData, setFormData] = useState<CustomerFormData>(initialFormData)

  // UI states
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showInactive, setShowInactive] = useState(false)

  // Summary stats
  const [summary, setSummary] = useState({
    totalCustomers: 0,
    activeCustomers: 0,
    expiringLicenses: 0,
    expiredLicenses: 0,
  })

  // Fetch customers
  const fetchCustomers = useCallback(async () => {
    try {
      setIsLoading(true)
      const result = await window.api.customers.getAll({ limit: 1000 })

      if (result.success && result.data) {
        setCustomers(result.data)
        calculateSummary(result.data)
      }
    } catch (error) {
      console.error('Error fetching customers:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  // Calculate summary statistics
  const calculateSummary = (customersData: Customer[]) => {
    const today = new Date()
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)

    const activeCustomers = customersData.filter(c => c.isActive)
    let expiringLicenses = 0
    let expiredLicenses = 0

    activeCustomers.forEach(c => {
      if (c.licenseExpiryDate) {
        const expiryDate = new Date(c.licenseExpiryDate)
        if (expiryDate < today) {
          expiredLicenses++
        } else if (expiryDate < thirtyDaysFromNow) {
          expiringLicenses++
        }
      }
    })

    setSummary({
      totalCustomers: customersData.length,
      activeCustomers: activeCustomers.length,
      expiringLicenses,
      expiredLicenses,
    })
  }

  // License status helpers
  const isLicenseExpired = (expiryDate: string | null): boolean => {
    if (!expiryDate) return false
    return new Date(expiryDate) < new Date()
  }

  const isLicenseExpiringSoon = (expiryDate: string | null): boolean => {
    if (!expiryDate) return false
    const expiry = new Date(expiryDate)
    const today = new Date()
    const thirtyDaysFromNow = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000)
    return expiry < thirtyDaysFromNow && expiry > today
  }

  const getLicenseStatusBadge = (customer: Customer) => {
    if (!customer.firearmLicenseNumber) {
      return <span className="text-muted-foreground text-sm">No License</span>
    }

    if (isLicenseExpired(customer.licenseExpiryDate)) {
      return (
        <Badge variant="destructive" className="gap-1">
          <AlertTriangle className="h-3 w-3" />
          Expired
        </Badge>
      )
    }

    if (isLicenseExpiringSoon(customer.licenseExpiryDate)) {
      return (
        <Badge variant="warning" className="gap-1">
          <AlertTriangle className="h-3 w-3" />
          Expiring Soon
        </Badge>
      )
    }

    return (
      <Badge variant="success" className="gap-1">
        <CheckCircle className="h-3 w-3" />
        Valid
      </Badge>
    )
  }

  // Helper functions
  const getFullName = (customer: Customer): string => {
    return `${customer.firstName} ${customer.lastName}`.trim()
  }

  const getFullAddress = (customer: Customer): string => {
    const parts = [customer.address, customer.city, customer.state, customer.zipCode].filter(Boolean)
    return parts.join(', ') || 'N/A'
  }

  const getIdTypeLabel = (type: string | null): string => {
    if (!type) return 'N/A'
    const found = GOVERNMENT_ID_TYPES.find(t => t.value === type)
    return found?.label || type
  }

  // Filtering logic
  const filteredCustomers = useMemo(() => {
    return customers.filter(customer => {
      // Active filter
      if (!showInactive && !customer.isActive) return false

      // Search filter
      const search = searchTerm.toLowerCase()
      const matchesSearch =
        customer.firstName.toLowerCase().includes(search) ||
        customer.lastName.toLowerCase().includes(search) ||
        (customer.phone || '').toLowerCase().includes(search) ||
        (customer.email || '').toLowerCase().includes(search) ||
        (customer.address || '').toLowerCase().includes(search) ||
        (customer.governmentIdNumber || '').toLowerCase().includes(search) ||
        (customer.firearmLicenseNumber || '').toLowerCase().includes(search)

      return matchesSearch
    })
  }, [customers, searchTerm, showInactive])

  // Sort by name
  const sortedCustomers = useMemo(() => {
    return [...filteredCustomers].sort((a, b) =>
      getFullName(a).localeCompare(getFullName(b))
    )
  }, [filteredCustomers])

  // Pagination
  const totalPages = Math.ceil(sortedCustomers.length / ITEMS_PER_PAGE) || 1
  const paginatedCustomers = sortedCustomers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  // Dialog handlers
  const handleOpenDialog = (customer?: Customer) => {
    if (customer) {
      setEditingCustomer(customer)
      setFormData({
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email || '',
        phone: customer.phone || '',
        address: customer.address || '',
        city: customer.city || '',
        state: customer.state || '',
        zipCode: customer.zipCode || '',
        governmentIdType: customer.governmentIdType || '',
        governmentIdNumber: customer.governmentIdNumber || '',
        firearmLicenseNumber: customer.firearmLicenseNumber || '',
        licenseExpiryDate: customer.licenseExpiryDate?.split('T')[0] || '',
        dateOfBirth: customer.dateOfBirth?.split('T')[0] || '',
        notes: customer.notes || '',
      })
    } else {
      setEditingCustomer(null)
      setFormData(initialFormData)
    }
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingCustomer(null)
    setFormData(initialFormData)
  }

  const handleViewCustomer = (customer: Customer) => {
    setViewingCustomer(customer)
    setIsViewDialogOpen(true)
  }

  const handleOpenDeleteDialog = (customer: Customer) => {
    setDeletingCustomer(customer)
    setIsDeleteDialogOpen(true)
  }

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      alert('First name and last name are required')
      return
    }

    try {
      setIsSubmitting(true)

      const customerData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim() || null,
        phone: formData.phone.trim() || null,
        address: formData.address.trim() || null,
        city: formData.city.trim() || null,
        state: formData.state.trim() || null,
        zipCode: formData.zipCode.trim() || null,
        governmentIdType: formData.governmentIdType || null,
        governmentIdNumber: formData.governmentIdNumber.trim() || null,
        firearmLicenseNumber: formData.firearmLicenseNumber.trim() || null,
        licenseExpiryDate: formData.licenseExpiryDate || null,
        dateOfBirth: formData.dateOfBirth || null,
        notes: formData.notes.trim() || null,
      }

      let result
      if (editingCustomer) {
        result = await window.api.customers.update(editingCustomer.id, customerData)
      } else {
        result = await window.api.customers.create(customerData)
      }

      if (result.success) {
        handleCloseDialog()
        fetchCustomers()
      } else {
        alert(result.message || 'Failed to save customer')
      }
    } catch (error) {
      console.error('Error saving customer:', error)
      alert('An error occurred while saving the customer')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Delete handler
  const handleDelete = async () => {
    if (!deletingCustomer) return

    try {
      setIsDeleting(true)
      const result = await window.api.customers.delete(deletingCustomer.id)

      if (result.success) {
        setIsDeleteDialogOpen(false)
        setDeletingCustomer(null)
        fetchCustomers()
      } else {
        alert(result.message || 'Failed to delete customer')
      }
    } catch (error) {
      console.error('Error deleting customer:', error)
      alert('An error occurred while deleting the customer')
    } finally {
      setIsDeleting(false)
    }
  }

  // Form field change handler
  const handleInputChange = (field: keyof CustomerFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Loading customers...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Customers</h1>
          <p className="text-muted-foreground">
            Manage customer information and licenses
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Add Customer
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalCustomers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All registered customers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.activeCustomers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Licenses</CardTitle>
            <AlertTriangle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{summary.expiringLicenses}</div>
            <p className="text-xs text-muted-foreground">Within 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expired Licenses</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{summary.expiredLicenses}</div>
            <p className="text-xs text-muted-foreground">Need renewal</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, phone, email, address, or license..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
                className="pl-9"
              />
            </div>
            <Button
              variant={showInactive ? 'default' : 'outline'}
              size="sm"
              onClick={() => {
                setShowInactive(!showInactive)
                setCurrentPage(1)
              }}
            >
              {showInactive ? 'Showing All' : 'Show Inactive'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card>
        <CardContent className="p-0">
          {paginatedCustomers.length === 0 ? (
            <div className="flex h-40 items-center justify-center text-muted-foreground">
              <div className="text-center">
                <Users className="mx-auto mb-2 h-12 w-12" />
                <p>No customers found</p>
                {searchTerm && (
                  <Button variant="link" size="sm" onClick={() => setSearchTerm('')}>
                    Clear search to see all customers
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>License No</TableHead>
                  <TableHead>License Status</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedCustomers.map((customer) => (
                  <TableRow key={customer.id} className={cn(!customer.isActive && 'opacity-50')}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{getFullName(customer)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {customer.phone ? (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{customer.phone}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">N/A</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {customer.email ? (
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{customer.email}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">N/A</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {customer.firearmLicenseNumber ? (
                        <span className="font-mono text-sm">{customer.firearmLicenseNumber}</span>
                      ) : (
                        <span className="text-muted-foreground text-sm">No License</span>
                      )}
                    </TableCell>
                    <TableCell>{getLicenseStatusBadge(customer)}</TableCell>
                    <TableCell>
                      {customer.isActive ? (
                        <Badge variant="success">Active</Badge>
                      ) : (
                        <Badge variant="secondary">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewCustomer(customer)}
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenDialog(customer)}
                          title="Edit Customer"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        {customer.isActive && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleOpenDeleteDialog(customer)}
                            title="Deactivate Customer"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {sortedCustomers.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{' '}
            {Math.min(currentPage * ITEMS_PER_PAGE, sortedCustomers.length)} of {sortedCustomers.length} customers
          </div>
          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                <ChevronLeft className="mr-1 h-4 w-4" />
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                Next
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Customer Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        if (!open) handleCloseDialog()
      }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {editingCustomer ? 'Edit Customer' : 'Add Customer'}
            </DialogTitle>
            <DialogDescription>
              {editingCustomer
                ? 'Update customer information'
                : 'Enter customer details to create a new record'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm text-muted-foreground">Basic Information</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    placeholder="John"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    placeholder="Doe"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+1 234 567 8900"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Street Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="123 Main St"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="New York"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    placeholder="NY"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zipCode">ZIP Code</Label>
                  <Input
                    id="zipCode"
                    value={formData.zipCode}
                    onChange={(e) => handleInputChange('zipCode', e.target.value)}
                    placeholder="10001"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                />
              </div>
            </div>

            <Separator />

            {/* Identification & License Information */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm text-muted-foreground">Identification & License</h4>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="governmentIdType">Government ID Type</Label>
                  <Select
                    value={formData.governmentIdType}
                    onValueChange={(value) => handleInputChange('governmentIdType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select ID type" />
                    </SelectTrigger>
                    <SelectContent>
                      {GOVERNMENT_ID_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="governmentIdNumber">Government ID Number</Label>
                  <Input
                    id="governmentIdNumber"
                    value={formData.governmentIdNumber}
                    onChange={(e) => handleInputChange('governmentIdNumber', e.target.value)}
                    placeholder="ID Number"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firearmLicenseNumber">Firearm License Number</Label>
                  <Input
                    id="firearmLicenseNumber"
                    value={formData.firearmLicenseNumber}
                    onChange={(e) => handleInputChange('firearmLicenseNumber', e.target.value)}
                    placeholder="LIC-123456"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="licenseExpiryDate">License Expiry Date</Label>
                  <Input
                    id="licenseExpiryDate"
                    type="date"
                    value={formData.licenseExpiryDate}
                    onChange={(e) => handleInputChange('licenseExpiryDate', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Additional Information */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm text-muted-foreground">Additional Information</h4>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Additional customer information..."
                  rows={3}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? 'Saving...'
                  : editingCustomer
                    ? 'Update Customer'
                    : 'Create Customer'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Customer Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Customer Details
            </DialogTitle>
            <DialogDescription>
              {viewingCustomer && getFullName(viewingCustomer)}
            </DialogDescription>
          </DialogHeader>

          {viewingCustomer && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Full Name</p>
                  <p className="font-medium">{getFullName(viewingCustomer)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  {viewingCustomer.isActive ? (
                    <Badge variant="success">Active</Badge>
                  ) : (
                    <Badge variant="secondary">Inactive</Badge>
                  )}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium">{viewingCustomer.phone || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{viewingCustomer.email || 'N/A'}</p>
                </div>
              </div>

              {/* Address */}
              <div>
                <p className="text-sm text-muted-foreground">Address</p>
                <p className="font-medium">{getFullAddress(viewingCustomer)}</p>
              </div>

              {/* Date of Birth */}
              {viewingCustomer.dateOfBirth && (
                <div>
                  <p className="text-sm text-muted-foreground">Date of Birth</p>
                  <p className="font-medium">
                    {new Date(viewingCustomer.dateOfBirth).toLocaleDateString()}
                  </p>
                </div>
              )}

              <Separator />

              {/* ID & License Info */}
              <div className="space-y-4">
                <h4 className="font-medium">Identification & License</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Government ID Type</p>
                    <p className="font-medium">{getIdTypeLabel(viewingCustomer.governmentIdType)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Government ID Number</p>
                    <p className="font-medium font-mono">
                      {viewingCustomer.governmentIdNumber || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Firearm License Number</p>
                    <p className="font-medium font-mono">
                      {viewingCustomer.firearmLicenseNumber || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">License Expiry</p>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">
                        {viewingCustomer.licenseExpiryDate
                          ? new Date(viewingCustomer.licenseExpiryDate).toLocaleDateString()
                          : 'N/A'}
                      </p>
                      {viewingCustomer.firearmLicenseNumber && getLicenseStatusBadge(viewingCustomer)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {viewingCustomer.notes && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground">Notes</p>
                    <p className="mt-1">{viewingCustomer.notes}</p>
                  </div>
                </>
              )}

              <Separator />

              {/* Metadata */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Created</p>
                  <p>{formatDateTime(viewingCustomer.createdAt)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Last Updated</p>
                  <p>{formatDateTime(viewingCustomer.updatedAt)}</p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
            {viewingCustomer && (
              <Button onClick={() => {
                setIsViewDialogOpen(false)
                handleOpenDialog(viewingCustomer)
              }}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit Customer
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Deactivate Customer
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to deactivate this customer? They will be marked as inactive but their records will be preserved.
            </DialogDescription>
          </DialogHeader>

          {deletingCustomer && (
            <div className="rounded-lg bg-muted p-4">
              <p className="font-medium">{getFullName(deletingCustomer)}</p>
              <p className="text-sm text-muted-foreground">
                {deletingCustomer.phone || 'No phone'} • {deletingCustomer.email || 'No email'}
              </p>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deactivating...' : 'Deactivate Customer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
