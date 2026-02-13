import React, { useState, useEffect, useCallback } from 'react'
import { Plus, Search, Edit, Trash2, Wrench, Clock, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
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
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatCurrency, debounce } from '@/lib/utils'
import type { Service } from '@shared/types'

interface Category {
  id: number
  name: string
  description: string | null
  isActive: boolean
}

export function ServicesScreen() {
  // Services state
  const [services, setServices] = useState<Service[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [showServiceDialog, setShowServiceDialog] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [serviceFormData, setServiceFormData] = useState({
    code: '',
    name: '',
    description: '',
    categoryId: '',
    price: '',
    pricingType: 'flat' as 'flat' | 'hourly',
    estimatedDuration: '60',
    isTaxable: true,
    taxRate: '0',
  })
  const [isSaving, setIsSaving] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  // Fetch services
  const fetchServices = useCallback(async () => {
    setIsLoading(true)
    try {
      const result = await window.api.services.getAll({
        page,
        limit: 20,
        search: searchQuery,
        categoryId: selectedCategory ? parseInt(selectedCategory) : undefined,
        isActive: true,
      })

      if (result.success && result.data) {
        setServices(result.data)
        setTotalPages(result.totalPages || 1)
      }
    } catch (error) {
      console.error('Failed to fetch services:', error)
    } finally {
      setIsLoading(false)
    }
  }, [page, searchQuery, selectedCategory])

  // Fetch categories from the main categories table
  const fetchCategories = useCallback(async () => {
    try {
      const result = await window.api.categories.getAll()
      if (result.success && result.data) {
        setCategories(result.data)
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }, [])

  useEffect(() => {
    fetchServices()
    fetchCategories()
  }, [fetchServices, fetchCategories])

  // Handle search with debounce
  const debouncedSearch = useCallback(
    debounce((query: string) => {
      setSearchQuery(query)
      setPage(1)
    }, 300),
    []
  )

  // Open dialog for new service
  const handleNewService = () => {
    setEditingService(null)
    setServiceFormData({
      code: '',
      name: '',
      description: '',
      categoryId: '',
      price: '',
      pricingType: 'flat',
      estimatedDuration: '60',
      isTaxable: true,
      taxRate: '0',
    })
    setShowServiceDialog(true)
  }

  // Open dialog for editing service
  const handleEditService = (service: Service) => {
    setEditingService(service)
    setServiceFormData({
      code: service.code,
      name: service.name,
      description: service.description || '',
      categoryId: service.categoryId?.toString() || '',
      price: service.price.toString(),
      pricingType: service.pricingType,
      estimatedDuration: service.estimatedDuration?.toString() || '60',
      isTaxable: service.isTaxable,
      taxRate: service.taxRate.toString(),
    })
    setShowServiceDialog(true)
  }

  // Save service
  const handleSaveService = async () => {
    setIsSaving(true)
    try {
      const serviceData = {
        code: serviceFormData.code,
        name: serviceFormData.name,
        description: serviceFormData.description || null,
        categoryId: serviceFormData.categoryId ? parseInt(serviceFormData.categoryId) : null,
        price: parseFloat(serviceFormData.price),
        pricingType: serviceFormData.pricingType,
        estimatedDuration: parseInt(serviceFormData.estimatedDuration),
        isTaxable: serviceFormData.isTaxable,
        taxRate: parseFloat(serviceFormData.taxRate),
      }

      let result
      if (editingService) {
        result = await window.api.services.update(editingService.id, serviceData)
      } else {
        result = await window.api.services.create(serviceData)
      }

      if (result.success) {
        setShowServiceDialog(false)
        fetchServices()
      } else {
        alert(result.message || 'Failed to save service')
      }
    } catch (error) {
      console.error('Save service error:', error)
      alert('An error occurred while saving')
    } finally {
      setIsSaving(false)
    }
  }

  // Delete service
  const handleDeleteService = async (service: Service) => {
    if (!confirm(`Are you sure you want to deactivate "${service.name}"?`)) return

    try {
      const result = await window.api.services.delete(service.id)
      if (result.success) {
        fetchServices()
      } else {
        alert(result.message || 'Failed to delete service')
      }
    } catch (error) {
      console.error('Delete service error:', error)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Services</h1>
          <p className="text-muted-foreground">
            Manage your service offerings like repairs, maintenance, customization, and testing
          </p>
        </div>
      </div>

      <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex gap-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search services..."
                  className="pl-9"
                  onChange={(e) => debouncedSearch(e.target.value)}
                />
              </div>
              <Select
                value={selectedCategory}
                onValueChange={(value) => {
                  setSelectedCategory(value === 'all' ? '' : value)
                  setPage(1)
                }}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories
                    .filter((c) => c.isActive)
                    .map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleNewService}>
              <Plus className="mr-2 h-4 w-4" />
              Add Service
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex h-64 items-center justify-center">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
              ) : services.length === 0 ? (
                <div className="flex h-64 flex-col items-center justify-center text-muted-foreground">
                  <Wrench className="mb-2 h-12 w-12" />
                  <p>No services found</p>
                  <Button variant="link" onClick={handleNewService}>
                    Add your first service
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Code</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead>Pricing Type</TableHead>
                      <TableHead className="text-center">Duration</TableHead>
                      <TableHead>Tax</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {services.map((service) => (
                      <TableRow key={service.id}>
                        <TableCell className="font-mono">{service.code}</TableCell>
                        <TableCell className="font-medium">{service.name}</TableCell>
                        <TableCell>
                          {categories.find((c) => c.id === service.categoryId)?.name || '-'}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(service.price)}
                          {service.pricingType === 'hourly' && (
                            <span className="text-xs text-muted-foreground">/hr</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={service.pricingType === 'flat' ? 'default' : 'secondary'}>
                            {service.pricingType === 'flat' ? (
                              <DollarSign className="mr-1 h-3 w-3" />
                            ) : (
                              <Clock className="mr-1 h-3 w-3" />
                            )}
                            {service.pricingType}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          {service.estimatedDuration ? `${service.estimatedDuration} min` : '-'}
                        </TableCell>
                        <TableCell>
                          {service.isTaxable ? (
                            <Badge variant="outline">{service.taxRate}%</Badge>
                          ) : (
                            <span className="text-muted-foreground">N/A</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditService(service)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteService(service)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          )}
      </div>

      {/* Service Dialog */}
      <Dialog open={showServiceDialog} onOpenChange={setShowServiceDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingService ? 'Edit Service' : 'New Service'}</DialogTitle>
            <DialogDescription>
              {editingService
                ? 'Update service information'
                : 'Add a new service to your catalog'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">Service Code *</Label>
                <Input
                  id="code"
                  value={serviceFormData.code}
                  onChange={(e) =>
                    setServiceFormData({ ...serviceFormData, code: e.target.value })
                  }
                  placeholder="SRV-001"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={serviceFormData.categoryId}
                  onValueChange={(value) =>
                    setServiceFormData({ ...serviceFormData, categoryId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories
                      .filter((c) => c.isActive)
                      .map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Service Name *</Label>
              <Input
                id="name"
                value={serviceFormData.name}
                onChange={(e) => setServiceFormData({ ...serviceFormData, name: e.target.value })}
                placeholder="e.g., Weapon Repair, Part Replacement"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={serviceFormData.description}
                onChange={(e) =>
                  setServiceFormData({ ...serviceFormData, description: e.target.value })
                }
                placeholder="Describe the service..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={serviceFormData.price}
                  onChange={(e) =>
                    setServiceFormData({ ...serviceFormData, price: e.target.value })
                  }
                  placeholder="0.00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pricingType">Pricing Type</Label>
                <Select
                  value={serviceFormData.pricingType}
                  onValueChange={(value: 'flat' | 'hourly') =>
                    setServiceFormData({ ...serviceFormData, pricingType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="flat">Flat Rate</SelectItem>
                    <SelectItem value="hourly">Hourly Rate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="estimatedDuration">Est. Duration (min)</Label>
                <Input
                  id="estimatedDuration"
                  type="number"
                  value={serviceFormData.estimatedDuration}
                  onChange={(e) =>
                    setServiceFormData({ ...serviceFormData, estimatedDuration: e.target.value })
                  }
                  placeholder="60"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isTaxable"
                  checked={serviceFormData.isTaxable}
                  onChange={(e) =>
                    setServiceFormData({ ...serviceFormData, isTaxable: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="isTaxable">Taxable</Label>
              </div>
              {serviceFormData.isTaxable && (
                <div className="space-y-2">
                  <Label htmlFor="taxRate">Tax Rate (%)</Label>
                  <Input
                    id="taxRate"
                    type="number"
                    step="0.01"
                    value={serviceFormData.taxRate}
                    onChange={(e) =>
                      setServiceFormData({ ...serviceFormData, taxRate: e.target.value })
                    }
                    placeholder="0"
                  />
                </div>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowServiceDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveService}
              disabled={
                isSaving ||
                !serviceFormData.code ||
                !serviceFormData.name ||
                !serviceFormData.price
              }
            >
              {isSaving ? 'Saving...' : editingService ? 'Update Service' : 'Create Service'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}
