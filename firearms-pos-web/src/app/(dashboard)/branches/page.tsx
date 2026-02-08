'use client'

import { useState } from 'react'
import {
  Building2,
  Plus,
  Edit2,
  Trash2,
  MapPin,
  Phone,
  Mail,
  Star,
  Search,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

type Branch = {
  id: number
  name: string
  code: string
  address: string
  phone: string
  email: string
  licenseNumber: string
  isActive: boolean
  isMain: boolean
  userCount: number
  createdAt: string
}

const mockBranches: Branch[] = [
  { id: 1, name: 'Islamabad HQ', code: 'ISB-HQ', address: 'Plot 45, Blue Area, Jinnah Avenue, Islamabad', phone: '+92-51-2345678', email: 'hq@firearms.pk', licenseNumber: 'DL-ISB-2024-001', isActive: true, isMain: true, userCount: 3, createdAt: '2024-01-01' },
  { id: 2, name: 'Rawalpindi Branch', code: 'RWP-01', address: 'Shop 12, Saddar Bazaar, The Mall Road, Rawalpindi', phone: '+92-51-9876543', email: 'rwp@firearms.pk', licenseNumber: 'DL-RWP-2024-015', isActive: true, isMain: false, userCount: 2, createdAt: '2024-03-15' },
  { id: 3, name: 'Lahore Branch', code: 'LHR-01', address: 'Floor 2, Liberty Market, Gulberg III, Lahore', phone: '+92-42-3456789', email: 'lhr@firearms.pk', licenseNumber: 'DL-LHR-2024-042', isActive: true, isMain: false, userCount: 1, createdAt: '2024-06-01' },
  { id: 4, name: 'Karachi Branch', code: 'KHI-01', address: 'Block 5, Clifton, Karachi', phone: '+92-21-1234567', email: 'khi@firearms.pk', licenseNumber: 'DL-KHI-2025-008', isActive: false, isMain: false, userCount: 0, createdAt: '2025-01-10' },
]

export default function BranchesPage() {
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)

  const filtered = mockBranches.filter((b) => {
    if (search) {
      const q = search.toLowerCase()
      if (!b.name.toLowerCase().includes(q) && !b.code.toLowerCase().includes(q) && !b.address.toLowerCase().includes(q)) return false
    }
    return true
  })

  const summaryCards = [
    { title: 'Total Branches', value: String(mockBranches.length), icon: Building2, accent: 'text-primary' },
    { title: 'Active', value: String(mockBranches.filter(b => b.isActive).length), icon: Building2, accent: 'text-success' },
    { title: 'Total Staff', value: String(mockBranches.reduce((s, b) => s + b.userCount, 0)), accent: 'text-blue-400' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Branches</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage store locations, licenses, and contact info</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="brass-glow">
              <Plus className="w-4 h-4 mr-2" />
              Add Branch
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Branch</DialogTitle>
              <DialogDescription>Register a new store location</DialogDescription>
            </DialogHeader>
            <form className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Branch Name *</Label>
                  <Input placeholder="e.g. Peshawar Branch" />
                </div>
                <div className="space-y-2">
                  <Label>Branch Code *</Label>
                  <Input placeholder="e.g. PSH-01" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Input placeholder="Full address" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input placeholder="+92-xx-xxxxxxx" />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" placeholder="branch@firearms.pk" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>License Number</Label>
                <Input placeholder="Dealer license number" />
              </div>
              <div className="flex items-center gap-2">
                <Switch id="is-main" />
                <Label htmlFor="is-main" className="text-sm">Set as main branch</Label>
              </div>
              <Button type="submit" className="w-full brass-glow">Create Branch</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {summaryCards.map((card) => (
          <Card key={card.title} className="card-tactical">
            <CardContent className="p-5">
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{card.title}</p>
                <p className={`text-2xl font-bold tracking-tight ${card.accent}`}>{card.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search branches..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      {/* Branch Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((branch) => (
          <Card key={branch.id} className={`card-tactical ${!branch.isActive ? 'opacity-50' : ''}`}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{branch.name}</h3>
                      {branch.isMain && (
                        <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/20">
                          <Star className="w-2.5 h-2.5 mr-0.5" />
                          Main
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs font-mono text-muted-foreground">{branch.code}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Badge variant="outline" className={`text-[10px] ${branch.isActive ? 'bg-success/10 text-success border-success/20' : 'bg-destructive/10 text-destructive border-destructive/20'}`}>
                    {branch.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                    <Edit2 className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <MapPin className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                  <span className="text-muted-foreground">{branch.address}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-muted-foreground">{branch.phone}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-muted-foreground">{branch.email}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-border/50">
                  <span className="text-xs text-muted-foreground">License: <span className="font-mono">{branch.licenseNumber}</span></span>
                  <span className="text-xs text-muted-foreground">{branch.userCount} staff</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">No branches found</div>
        )}
      </div>
    </div>
  )
}
