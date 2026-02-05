'use client'

import { useState } from 'react'
import {
  Wrench,
  Plus,
  Filter,
  Clock,
  DollarSign,
  Tag,
  Edit,
  Trash2,
  ToggleLeft,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
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

const mockCategories = [
  { id: 1, name: 'Gunsmithing' },
  { id: 2, name: 'Cleaning & Maintenance' },
  { id: 3, name: 'Custom Work' },
  { id: 4, name: 'Training' },
]

const mockServices = [
  { id: 1, code: 'SVC-001', name: 'Barrel Threading', categoryName: 'Gunsmithing', price: '8500', pricingType: 'flat', estimatedDuration: 120, isTaxable: true, taxRate: '18', isActive: true },
  { id: 2, code: 'SVC-002', name: 'Full Cleaning Service', categoryName: 'Cleaning & Maintenance', price: '2500', pricingType: 'flat', estimatedDuration: 60, isTaxable: true, taxRate: '18', isActive: true },
  { id: 3, code: 'SVC-003', name: 'Custom Engraving', categoryName: 'Custom Work', price: '1500', pricingType: 'hourly', estimatedDuration: 180, isTaxable: true, taxRate: '18', isActive: true },
  { id: 4, code: 'SVC-004', name: 'Trigger Job', categoryName: 'Gunsmithing', price: '5000', pricingType: 'flat', estimatedDuration: 90, isTaxable: true, taxRate: '18', isActive: true },
  { id: 5, code: 'SVC-005', name: 'Firearms Safety Course', categoryName: 'Training', price: '3000', pricingType: 'flat', estimatedDuration: 240, isTaxable: false, taxRate: '0', isActive: true },
  { id: 6, code: 'SVC-006', name: 'Sight Installation', categoryName: 'Gunsmithing', price: '4000', pricingType: 'flat', estimatedDuration: 45, isTaxable: true, taxRate: '18', isActive: false },
]

const summaryCards = [
  { title: 'Total Services', value: String(mockServices.length), icon: Wrench, accent: 'text-primary' },
  { title: 'Active', value: String(mockServices.filter((s) => s.isActive).length), icon: Tag, accent: 'text-success' },
  { title: 'Avg Duration', value: Math.round(mockServices.reduce((s, v) => s + v.estimatedDuration, 0) / mockServices.length) + ' min', icon: Clock, accent: 'text-blue-400' },
  { title: 'Avg Price', value: 'Rs. ' + Math.round(mockServices.reduce((s, v) => s + Number(v.price), 0) / mockServices.length).toLocaleString(), icon: DollarSign, accent: 'text-primary' },
]

export default function ServicesPage() {
  const [filterCategory, setFilterCategory] = useState('all')

  const filtered = mockServices.filter((s) => {
    if (filterCategory !== 'all' && s.categoryName !== filterCategory) return false
    return true
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Services</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage service offerings and pricing</p>
        </div>
        <Dialog>
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
            <form className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Service Code</Label>
                  <Input placeholder="e.g., SVC-007" />
                </div>
                <div className="space-y-2">
                  <Label>Service Name</Label>
                  <Input placeholder="e.g., Scope Mounting" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      {mockCategories.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Pricing Type</Label>
                  <Select>
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
                  <Input type="number" placeholder="0" />
                </div>
                <div className="space-y-2">
                  <Label>Duration (min)</Label>
                  <Input type="number" placeholder="60" />
                </div>
                <div className="space-y-2">
                  <Label>Tax Rate (%)</Label>
                  <Input type="number" placeholder="18" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input placeholder="Service description" />
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
                {mockCategories.map((c) => (
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
                <TableRow key={svc.id} className={!svc.isActive ? 'opacity-50' : ''}>
                  <TableCell>
                    <code className="text-sm font-bold font-mono bg-primary/10 text-primary px-2 py-0.5 rounded">
                      {svc.code}
                    </code>
                  </TableCell>
                  <TableCell className="text-sm font-medium">{svc.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-[10px]">{svc.categoryName}</Badge>
                  </TableCell>
                  <TableCell className="text-sm capitalize text-muted-foreground">
                    {svc.pricingType === 'hourly' ? 'Per Hour' : 'Flat Rate'}
                  </TableCell>
                  <TableCell className="text-right text-sm font-semibold">
                    Rs. {Number(svc.price).toLocaleString()}
                    {svc.pricingType === 'hourly' && <span className="text-muted-foreground font-normal">/hr</span>}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {svc.estimatedDuration} min
                    </div>
                  </TableCell>
                  <TableCell>
                    {svc.isActive ? (
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
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive">
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
