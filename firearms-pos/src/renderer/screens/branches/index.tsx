import React, { useState, useEffect } from 'react'
import { Plus, Search, Pencil, Trash2, Building2, MapPin, Phone, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface Branch {
  id: number
  name: string
  code: string
  address: string | null
  phone: string | null
  email: string | null
  licenseNumber: string | null
  isActive: boolean
  isMain: boolean
  createdAt: string
  updatedAt: string
}

interface BranchFormData {
  name: string
  code: string
  address: string
  phone: string
  email: string
  licenseNumber: string
}

const initialFormData: BranchFormData = {
  name: '',
  code: '',
  address: '',
  phone: '',
  email: '',
  licenseNumber: '',
}

export default function BranchesScreen() {
  const [branches, setBranches] = useState<Branch[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState<BranchFormData>(initialFormData)
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null)

  useEffect(() => {
    fetchBranches()
  }, [])

  const fetchBranches = async () => {
    try {
      setIsLoading(true)
      const response = await window.api.branches.getAll()

      if (response?.success && response?.data) {
        setBranches(response.data)
      } else if (response?.data) {
        setBranches(response.data)
      } else {
        setBranches([])
      }
    } catch (error) {
      console.error('Failed to fetch branches:', error)
      setBranches([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenDialog = (branch?: Branch) => {
    if (branch) {
      setEditingBranch(branch)
      setFormData({
        name: branch.name,
        code: branch.code,
        address: branch.address || '',
        phone: branch.phone || '',
        email: branch.email || '',
        licenseNumber: branch.licenseNumber || '',
      })
    } else {
      setEditingBranch(null)
      setFormData(initialFormData)
    }
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingBranch(null)
    setFormData(initialFormData)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.code.trim() || !formData.name.trim()) {
      alert('Branch code and name are required')
      return
    }

    try {
      const branchData: any = {
        code: formData.code.trim().toUpperCase(),
        name: formData.name.trim(),
        address: formData.address.trim() || undefined,
        phone: formData.phone.trim() || undefined,
        email: formData.email.trim() || undefined,
        licenseNumber: formData.licenseNumber.trim() || undefined,
      }

      if (editingBranch) {
        const response = await window.api.branches.update(editingBranch.id, branchData)
        if (!response.success) {
          alert(response.message || 'Failed to update branch')
          return
        }
      } else {
        const response = await window.api.branches.create(branchData)
        if (!response.success) {
          alert(response.message || 'Failed to create branch')
          return
        }
      }

      await fetchBranches()
      handleCloseDialog()
    } catch (error: any) {
      console.error('Failed to save branch:', error)
      if (error.message?.includes('unique') || error.message?.includes('duplicate')) {
        alert('Branch code already exists. Please use a different code.')
      } else {
        alert('Failed to save branch. Please try again.')
      }
    }
  }

  const handleDelete = async (branchId: number, branchName: string) => {
    if (!confirm(`Are you sure you want to delete branch "${branchName}"?`)) {
      return
    }

    try {
      const response = await window.api.branches.delete(branchId)
      if (response.success) {
        await fetchBranches()
      } else {
        alert(response.message || 'Failed to delete branch')
      }
    } catch (error) {
      console.error('Failed to delete branch:', error)
      alert('Failed to delete branch. Please try again.')
    }
  }

  const filteredBranches = branches.filter((branch) =>
    branch.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    branch.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    branch.phone?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const activeCount = branches.filter((b) => b.isActive).length
  const inactiveCount = branches.filter((b) => !b.isActive).length

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-lg">Loading branches...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Branch Management</h1>
        <p className="text-muted-foreground">Manage multiple business locations</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-card p-4 rounded-lg border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Branches</p>
              <p className="text-2xl font-bold">{branches.length}</p>
            </div>
            <Building2 className="h-8 w-8 text-muted-foreground" />
          </div>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <p className="text-sm text-muted-foreground">Active Branches</p>
          <p className="text-2xl font-bold text-green-600">{activeCount}</p>
        </div>
        <div className="bg-card p-4 rounded-lg border">
          <p className="text-sm text-muted-foreground">Inactive Branches</p>
          <p className="text-2xl font-bold text-red-600">{inactiveCount}</p>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search branches..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Add Branch
        </Button>
      </div>

      <div className="border rounded-lg p-6 bg-card">
        {filteredBranches.length === 0 ? (
          <div className="text-center py-12">
            <Building2 className="h-16 w-16 mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">
              {searchTerm ? 'No branches found matching your search.' : 'No branches yet. Click "Add Branch" to get started.'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Found {filteredBranches.length} branch(es)
            </p>
            <div className="space-y-2">
              {filteredBranches.map((branch) => (
                <div key={branch.id} className="flex items-center justify-between p-4 border rounded">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <p className="font-medium">{branch.name}</p>
                      <span className="text-xs px-2 py-1 rounded font-mono bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
                        {branch.code}
                      </span>
                      <Badge variant={branch.isActive ? 'default' : 'secondary'}>
                        {branch.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      {branch.isMain && (
                        <Badge variant="outline" className="text-xs">Main</Badge>
                      )}
                    </div>
                    {branch.address && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        {branch.address}
                      </div>
                    )}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      {branch.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {branch.phone}
                        </div>
                      )}
                      {branch.email && (
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {branch.email}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(branch)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    {!branch.isMain && (
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(branch.id, branch.name)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingBranch ? 'Edit Branch' : 'Create New Branch'}</DialogTitle>
            <DialogDescription>
              {editingBranch ? 'Update branch information.' : 'Create a new branch location.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Branch Code *</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="e.g., BR001, NYC"
                    required
                    maxLength={20}
                    disabled={!!editingBranch}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Branch Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Main Office"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Street address, city, state, zip"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="branch@company.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="licenseNumber">License Number</Label>
                <Input
                  id="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                  placeholder="Business/trade license number"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button type="submit">{editingBranch ? 'Update' : 'Create'} Branch</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
