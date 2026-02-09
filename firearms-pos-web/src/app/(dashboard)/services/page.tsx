'use client'

import { useState, useEffect } from 'react'
import {
  Wrench,
  Plus,
  Filter,
  Clock,
  DollarSign,
  Tag,
  Edit,
  Trash2,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  getServices,
  getServiceCategories,
  createService,
  deleteService,
} from '@/actions/services'
import { toast } from 'sonner'

export default function ServicesPage() {
  const [loading, setLoading] = useState(true)
  const [services, setServices] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [filterCategory, setFilterCategory] = useState('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    categoryId: '',
    pricingType: 'flat',
    price: '',
    estimatedDuration: '60',
    taxRate: '18',
    description: '',
  })

  useEffect(() => {
    loadData()
  }, [filterCategory])

  async function loadData() {
    try {
      setLoading(true)
      const [servicesRes, categoriesRes] = await Promise.all([
        getServices(),
        getServiceCategories(),
      ])
      if (servicesRes.success) {
        setServices(servicesRes.data)
      }
      if (categoriesRes.success) {
        setCategories(categoriesRes.data)
      }
    } catch (error) {
      console.error('Failed to load services:', error)
      toast.error('Failed to load services')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const res = await createService({
        code: formData.code,
        name: formData.name,
        description: formData.description,
        categoryId: formData.categoryId ? Number(formData.categoryId) : undefined,
        price: formData.price,
        pricingType: formData.pricingType,
        estimatedDuration: Number(formData.estimatedDuration),
        isTaxable: Number(formData.taxRate) > 0,
        taxRate: formData.taxRate,
      })
      if (res.success) {
        toast.success('Service created successfully')
        setDialogOpen(false)
        setFormData({
          code: '',
          name: '',
          categoryId: '',
          pricingType: 'flat',
          price: '',
          estimatedDuration: '60',
          taxRate: '18',
          description: '',
        })
        loadData()
      }
    } catch (error) {
      console.error('Failed to create service:', error)
      toast.error('Failed to create service')
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Are you sure you want to delete this service?')) return
    try {
      const res = await deleteService(id)
      if (res.success) {
        toast.success('Service deleted')
        loadData()
      }
    } catch (error) {
      console.error('Failed to delete service:', error)
      toast.error('Failed to delete service')
    }
  }

  const filtered = services.filter((s) => {
    if (filterCategory !== 'all' && s.categoryName !== filterCategory) return false
    return true
  })

  const summaryCards = [
    { title: 'Total Services', value: String(services.length), icon: Wrench, accent: 'text-primary' },
    { title: 'Active', value: String(services.filter((s) => s.service.isActive).length), icon: Tag, accent: 'text-success' },
    {
      title: 'Avg Duration',
      value: services.length > 0
        ? Math.round(services.reduce((s, v) => s + (v.service.estimatedDuration || 0), 0) / services.length) + ' min'
        : '0 min',
      icon: Clock,
      accent: 'text-blue-400'
    },
    {
      title: 'Avg Price',
      value: services.length > 0
        ? 'Rs. ' + Math.round(services.reduce((s, v) => s + Number(v.service.price || 0), 0) / services.length).toLocaleString()
        : 'Rs. 0',
      icon: DollarSign,
      accent: 'text-primary'
    },
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Services</h1>
            <p className="text-sm text-muted-foreground mt-1">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Services</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage service offerings and pricing</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="brass-glow">
              <Plus className="w-4 h-4 mr-2" />
              Add Service
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Service</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Service Code</Label>
                  <Input placeholder="e.g., SVC-007" value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value})} required />
                </div>
                <div className="space-y-2">
                  <Label>Service Name</Label>
                  <Input placeholder="e.g., Scope Mounting" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={formData.categoryId} onValueChange={(v) => setFormData({...formData, categoryId: v})}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Pricing Type</Label>
                  <Select value={formData.pricingType} onValueChange={(v) => setFormData({...formData, pricingType: v})}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="flat">Flat Rate</SelectItem>
                      <SelectItem value="hourly">Hourly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Price (Rs.)</Label>
                  <Input type="number" placeholder="0" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} required />
                </div>
                <div className="space-y-2">
                  <Label>Duration (min)</Label>
                  <Input type="number" placeholder="60" value={formData.estimatedDuration} onChange={(e) => setFormData({...formData, estimatedDuration: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Tax Rate (%)</Label>
                  <Input type="number" placeholder="18" value={formData.taxRate} onChange={(e) => setFormData({...formData, taxRate: e.target.value})} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input placeholder="Service description" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
              </div>
              <Button type="submit" className="w-full brass-glow">Create Service</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card) => (
          <Card key={card.title} className="card-tactical">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{card.title}</p>
                  <p className="text-2xl font-bold tracking-tight">{card.value}</p>
                </div>
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <card.icon className={`w-5 h-5 ${card.accent}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Service Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Pricing</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((svc) => (
                <TableRow key={svc.service.id} className={!svc.service.isActive ? 'opacity-50' : ''}>
                  <TableCell>
                    <code className="text-sm font-bold font-mono bg-primary/10 text-primary px-2 py-0.5 rounded">
                      {svc.service.code}
                    </code>
                  </TableCell>
                  <TableCell className="text-sm font-medium">{svc.service.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px]">{svc.categoryName || 'Uncategorized'}</Badge>
                  </TableCell>
                  <TableCell className="text-sm capitalize text-muted-foreground">
                    {svc.service.pricingType === 'hourly' ? 'Per Hour' : 'Flat Rate'}
                  </TableCell>
                  <TableCell className="text-right text-sm font-semibold">
                    Rs. {Number(svc.service.price).toLocaleString()}
                    {svc.service.pricingType === 'hourly' && <span className="text-muted-foreground font-normal">/hr</span>}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {svc.service.estimatedDuration} min
                    </div>
                  </TableCell>
                  <TableCell>
                    {svc.service.isActive ? (
                      <Badge variant="outline" className="text-[10px] bg-success/10 text-success border-success/20">Active</Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] bg-muted text-muted-foreground">Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(svc.service.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No services found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
