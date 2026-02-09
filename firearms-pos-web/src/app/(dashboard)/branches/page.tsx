'use client'

import { useState, useEffect } from 'react'
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
import { getBranches, createBranch, updateBranch, deleteBranch } from '@/actions/branches'

type BranchData = {
  id: number
  name: string
  code: string
  address: string | null
  phone: string | null
  email: string | null
  licenseNumber: string | null
  isActive: boolean
  isMain: boolean
  createdAt: Date
  updatedAt: Date | null
  tenantId: number
}

type BranchWithCount = {
  branch: BranchData
  userCount: number
}

export default function BranchesPage() {
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [branches, setBranches] = useState<BranchWithCount[]>([])
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    address: '',
    phone: '',
    email: '',
    licenseNumber: '',
    isMain: false,
  })

  useEffect(() => {
    loadBranches()
  }, [])

  async function loadBranches() {
    setLoading(true)
    try {
      const result = await getBranches()
      if (result.success) {
        setBranches(result.data)
      }
    } catch (error) {
      console.error('Failed to load branches:', error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const result = await createBranch(formData)
      if (result.success) {
        setDialogOpen(false)
        setFormData({
          name: '',
          code: '',
          address: '',
          phone: '',
          email: '',
          licenseNumber: '',
          isMain: false,
        })
        loadBranches()
      } else {
        alert(result.message || 'Failed to create branch')
      }
    } catch (error) {
      console.error('Failed to create branch:', error)
      alert('Failed to create branch')
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Are you sure you want to deactivate this branch?')) return
    try {
      await deleteBranch(id)
      loadBranches()
    } catch (error) {
      console.error('Failed to delete branch:', error)
    }
  }

  const filtered = branches.filter((item) => {
    if (search) {
      const q = search.toLowerCase()
      const b = item.branch
      if (!b.name.toLowerCase().includes(q) && !b.code.toLowerCase().includes(q) && !(b.address || '').toLowerCase().includes(q)) return false
    }
    return true
  })

  const totalBranches = branches.length
  const activeBranches = branches.filter(item => item.branch.isActive).length
  const totalStaff = branches.reduce((s, item) => s + item.userCount, 0)

  const summaryCards = [
    { title: 'Total Branches', value: String(totalBranches), icon: Building2, accent: 'text-primary' },
    { title: 'Active', value: String(activeBranches), icon: Building2, accent: 'text-success' },
    { title: 'Total Staff', value: String(totalStaff), accent: 'text-blue-400' },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Loading branches...</p>
      </div>
    )
  }

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
            <form className="space-y-4 mt-4" onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Branch Name *</Label>
                  <Input
                    placeholder="e.g. Peshawar Branch"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Branch Code *</Label>
                  <Input
                    placeholder="e.g. PSH-01"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Input
                  placeholder="Full address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    placeholder="+92-xx-xxxxxxx"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    placeholder="branch@firearms.pk"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>License Number</Label>
                <Input
                  placeholder="Dealer license number"
                  value={formData.licenseNumber}
                  onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="is-main"
                  checked={formData.isMain}
                  onCheckedChange={(checked) => setFormData({ ...formData, isMain: checked })}
                />
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
        {filtered.map((item) => {
          const branch = item.branch
          return (
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
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => handleDelete(branch.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">{branch.address || 'No address'}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-muted-foreground">{branch.phone || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-muted-foreground">{branch.email || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t border-border/50">
                    <span className="text-xs text-muted-foreground">License: <span className="font-mono">{branch.licenseNumber || 'N/A'}</span></span>
                    <span className="text-xs text-muted-foreground">{item.userCount} staff</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
        {filtered.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">No branches found</div>
        )}
      </div>
    </div>
  )
}
