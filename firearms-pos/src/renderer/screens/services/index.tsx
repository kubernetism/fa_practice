import React, { useState, useEffect, useCallback } from 'react'
import { Plus, Search, Edit, Trash2, Wrench, Clock, DollarSign, ChevronLeft, ChevronRight, X, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
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

  // Fetch service categories from the service_categories table
  const fetchCategories = useCallback(async () => {
    try {
      const result = await window.api.services.getCategories()
      if (result.success && result.data) {
        setCategories(result.data)
      }
    } catch (error) {
      console.error('Failed to fetch service categories:', error)
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

  // Computed stats
  const totalServices = services.length
  const flatCount = services.filter(s => s.pricingType === 'flat').length
  const hourlyCount = services.filter(s => s.pricingType === 'hourly').length

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* ── Header: Title + Stats + Action ── */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Services</h1>
            <p className="text-xs text-muted-foreground/70">
              Repairs, maintenance, customization & testing
            </p>
          </div>
          {/* Inline stats pills */}
          {!isLoading && totalServices > 0 && (
            <div className="flex items-center gap-1.5 ml-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-muted/60 px-2.5 py-0.5 text-[10px] font-medium tabular-nums text-muted-foreground">
                {totalServices} total
              </span>
              {flatCount > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/8 px-2.5 py-0.5 text-[10px] font-medium tabular-nums text-primary/70">
                  <DollarSign className="h-2.5 w-2.5" />
                  {flatCount} flat
                </span>
              )}
              {hourlyCount > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-info/10 px-2.5 py-0.5 text-[10px] font-medium tabular-nums text-info">
                  <Clock className="h-2.5 w-2.5" />
                  {hourlyCount} hourly
                </span>
              )}
            </div>
          )}
        </div>
        <Button size="sm" onClick={handleNewService} className="h-8 px-3 text-xs font-semibold gap-1.5">
          <Plus className="h-3.5 w-3.5" />
          Add Service
        </Button>
      </div>

      {/* ── Toolbar: Search + Category Filter ── */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50" />
          <Input
            placeholder="Search services..."
            className="h-8 pl-8 pr-8 text-xs bg-card border-border/50 focus:border-primary/40 focus:ring-1 focus:ring-primary/20 placeholder:text-muted-foreground/40"
            onChange={(e) => debouncedSearch(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => { setSearchQuery(''); setPage(1) }}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-muted-foreground/40 hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </div>
        <Select
          value={selectedCategory}
          onValueChange={(value) => {
            setSelectedCategory(value === 'all' ? '' : value)
            setPage(1)
          }}
        >
          <SelectTrigger className="h-8 w-44 text-xs border-border/50 bg-card">
            <Filter className="h-3 w-3 mr-1.5 text-muted-foreground/50" />
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

      {/* ── Table ── */}
      <div className="flex-1 min-h-0 rounded-lg border border-border/50 bg-card/40 overflow-hidden">
        {isLoading ? (
          <div className="flex h-full items-center justify-center gap-2">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-info/50 border-t-transparent" />
            <span className="text-xs text-muted-foreground/50">Loading services...</span>
          </div>
        ) : services.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-muted-foreground/50 gap-2">
            <Wrench className="h-8 w-8 opacity-20" />
            <p className="text-xs">{searchQuery ? `No results for "${searchQuery}"` : 'No services found'}</p>
            {!searchQuery && (
              <Button variant="link" size="sm" onClick={handleNewService} className="text-xs h-auto p-0 text-primary/70">
                Add your first service
              </Button>
            )}
          </div>
        ) : (
          <div className="h-full overflow-auto">
            <TooltipProvider delayDuration={300}>
              <Table>
                <TableHeader>
                  <TableRow className="border-border/40 bg-muted/30 hover:bg-muted/30">
                    <TableHead className="h-8 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 w-[100px]">Code</TableHead>
                    <TableHead className="h-8 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">Service</TableHead>
                    <TableHead className="h-8 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 w-[120px]">Category</TableHead>
                    <TableHead className="h-8 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 text-right w-[100px]">Price</TableHead>
                    <TableHead className="h-8 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 w-[80px]">Type</TableHead>
                    <TableHead className="h-8 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 text-center w-[80px]">Duration</TableHead>
                    <TableHead className="h-8 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 w-[60px]">Tax</TableHead>
                    <TableHead className="h-8 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60 text-right w-[70px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {services.map((service) => (
                    <TableRow
                      key={service.id}
                      className="group border-border/30 hover:bg-muted/20 transition-colors h-9 cursor-pointer"
                      onClick={() => handleEditService(service)}
                    >
                      <TableCell className="py-1.5 px-3">
                        <span className="font-mono text-[11px] text-muted-foreground/70">{service.code}</span>
                      </TableCell>
                      <TableCell className="py-1.5 px-3">
                        <div className="flex flex-col">
                          <span className="text-xs font-medium leading-tight truncate max-w-[260px]">{service.name}</span>
                          {service.description && (
                            <span className="text-[10px] text-muted-foreground/40 leading-tight truncate max-w-[260px]">{service.description}</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="py-1.5 px-3">
                        <span className="text-[11px] text-muted-foreground/60 truncate">
                          {categories.find((c) => c.id === service.categoryId)?.name || '—'}
                        </span>
                      </TableCell>
                      <TableCell className="py-1.5 px-3 text-right">
                        <span className="text-xs font-semibold tabular-nums">{formatCurrency(service.price)}</span>
                        {service.pricingType === 'hourly' && (
                          <span className="text-[9px] text-muted-foreground/40 ml-0.5">/hr</span>
                        )}
                      </TableCell>
                      <TableCell className="py-1.5 px-3">
                        <Badge
                          variant="outline"
                          className={`h-4 px-1.5 text-[9px] font-semibold gap-0.5 ${
                            service.pricingType === 'hourly'
                              ? 'border-info/30 text-info bg-info/5'
                              : 'border-border/40 text-muted-foreground/60 bg-transparent'
                          }`}
                        >
                          {service.pricingType === 'hourly' ? (
                            <Clock className="h-2.5 w-2.5" />
                          ) : (
                            <DollarSign className="h-2.5 w-2.5" />
                          )}
                          {service.pricingType}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-1.5 px-3 text-center">
                        <span className="text-[11px] tabular-nums text-muted-foreground/50">
                          {service.estimatedDuration ? `${service.estimatedDuration}m` : '—'}
                        </span>
                      </TableCell>
                      <TableCell className="py-1.5 px-3">
                        {service.isTaxable ? (
                          <Badge variant="outline" className="h-4 px-1 text-[9px] font-medium border-border/40 text-muted-foreground/50 bg-transparent">
                            {service.taxRate}%
                          </Badge>
                        ) : (
                          <span className="text-[10px] text-muted-foreground/30">—</span>
                        )}
                      </TableCell>
                      <TableCell className="py-1.5 px-3 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => handleEditService(service)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="text-[10px]">Edit</TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 hover:bg-destructive/10 hover:text-destructive"
                                onClick={() => handleDeleteService(service)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="bottom" className="text-[10px]">Deactivate</TooltipContent>
                          </Tooltip>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TooltipProvider>
          </div>
        )}
      </div>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between shrink-0 px-1">
          <span className="text-[10px] text-muted-foreground/50 tabular-nums">
            Page {page} of {totalPages}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 border-border/40"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 border-border/40"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}

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
