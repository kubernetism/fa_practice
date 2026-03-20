import React, { useState, useEffect } from 'react'
import { Plus, Search, Pencil, Trash2, Building2, MapPin, Phone, Mail, Shield, Clock, RefreshCw, Globe, Hash } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
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
  const mainBranch = branches.find((b) => b.isMain)
  const licensedCount = branches.filter((b) => b.licenseNumber).length

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="flex flex-col h-full p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Building2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold leading-tight">Branch Management</h1>
              <p className="text-xs text-muted-foreground">
                Manage business locations
                {mainBranch && (
                  <span className="ml-1.5 text-primary">
                    &middot; HQ: {mainBranch.name}
                  </span>
                )}
              </p>
            </div>
          </div>
          <Button size="sm" onClick={() => handleOpenDialog()}>
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Add Branch
          </Button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-5 gap-3">
          <Card className="border-border/50">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Total</span>
                <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
              <p className="text-xl font-bold mt-1">{branches.length}</p>
            </CardContent>
          </Card>
          <Card className="border-green-500/20">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Active</span>
                <Globe className="w-3.5 h-3.5 text-green-500" />
              </div>
              <p className="text-xl font-bold text-green-600 dark:text-green-400 mt-1">{activeCount}</p>
            </CardContent>
          </Card>
          <Card className="border-red-500/20">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Inactive</span>
                <Building2 className="w-3.5 h-3.5 text-red-500" />
              </div>
              <p className="text-xl font-bold text-red-600 dark:text-red-400 mt-1">{inactiveCount}</p>
            </CardContent>
          </Card>
          <Card className="border-blue-500/20">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Licensed</span>
                <Shield className="w-3.5 h-3.5 text-blue-500" />
              </div>
              <p className="text-xl font-bold text-blue-600 dark:text-blue-400 mt-1">{licensedCount}</p>
            </CardContent>
          </Card>
          <Card className="border-amber-500/20">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Unlicensed</span>
                <Shield className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <p className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1">{branches.length - licensedCount}</p>
            </CardContent>
          </Card>
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search by name, code, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 h-8 text-xs"
            />
          </div>
          <span className="ml-auto text-xs text-muted-foreground">
            {filteredBranches.length} branch{filteredBranches.length !== 1 ? 'es' : ''}
          </span>
        </div>

        {/* Table */}
        <Card className="flex-1 overflow-hidden">
          <CardContent className="p-0">
            {filteredBranches.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <Building2 className="w-10 h-10 mb-3 opacity-20" />
                <p className="font-medium text-sm">
                  {searchTerm ? 'No branches match your search' : 'No branches yet'}
                </p>
                <p className="text-xs mt-1">
                  {searchTerm ? 'Try different keywords' : 'Click "Add Branch" to get started'}
                </p>
              </div>
            ) : (
              <div className="overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="text-xs w-20">Code</TableHead>
                      <TableHead className="text-xs">Branch Name</TableHead>
                      <TableHead className="text-xs">Address</TableHead>
                      <TableHead className="text-xs w-32">Phone</TableHead>
                      <TableHead className="text-xs w-40">Email</TableHead>
                      <TableHead className="text-xs w-32">License #</TableHead>
                      <TableHead className="text-xs w-20">Status</TableHead>
                      <TableHead className="text-xs w-24">Created</TableHead>
                      <TableHead className="text-xs text-right w-20">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBranches.map((branch) => (
                      <TableRow key={branch.id}>
                        <TableCell className="py-2">
                          <div className="flex items-center gap-1.5">
                            <Badge variant="secondary" className="font-mono text-[10px] px-1.5 py-0">
                              {branch.code}
                            </Badge>
                            {branch.isMain && (
                              <Badge variant="outline" className="text-[9px] px-1 py-0 bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">
                                HQ
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="py-2">
                          <span className="text-sm font-medium">{branch.name}</span>
                        </TableCell>
                        <TableCell className="py-2 text-xs text-muted-foreground max-w-[200px]">
                          {branch.address ? (
                            <div className="flex items-start gap-1">
                              <MapPin className="w-3 h-3 mt-0.5 shrink-0" />
                              <span className="truncate">{branch.address}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground/40">—</span>
                          )}
                        </TableCell>
                        <TableCell className="py-2 text-xs text-muted-foreground">
                          {branch.phone ? (
                            <div className="flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {branch.phone}
                            </div>
                          ) : (
                            <span className="text-muted-foreground/40">—</span>
                          )}
                        </TableCell>
                        <TableCell className="py-2 text-xs text-muted-foreground">
                          {branch.email ? (
                            <div className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              <span className="truncate">{branch.email}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground/40">—</span>
                          )}
                        </TableCell>
                        <TableCell className="py-2">
                          {branch.licenseNumber ? (
                            <div className="flex items-center gap-1 text-xs">
                              <Hash className="w-3 h-3 text-muted-foreground" />
                              <span className="font-mono text-[11px]">{branch.licenseNumber}</span>
                            </div>
                          ) : (
                            <Badge variant="outline" className="text-[9px] px-1 py-0 text-amber-600 dark:text-amber-400 border-amber-500/20">
                              None
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="py-2">
                          <Badge
                            variant="outline"
                            className={`text-[10px] px-1.5 py-0 ${
                              branch.isActive
                                ? 'bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/20'
                                : 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/20'
                            }`}
                          >
                            {branch.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-2">
                          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {new Date(branch.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
                          </div>
                        </TableCell>
                        <TableCell className="text-right py-2">
                          <div className="flex items-center justify-end gap-0.5">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => handleOpenDialog(branch)}>
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Edit</TooltipContent>
                            </Tooltip>
                            {!branch.isMain && (
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive hover:text-destructive" onClick={() => handleDelete(branch.id, branch.name)}>
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Delete</TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

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
                      placeholder="e.g., BR001"
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
    </TooltipProvider>
  )
}
