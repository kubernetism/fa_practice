'use client'

import { useState, useEffect } from 'react'
import { FolderTree, Plus, Pencil, Trash2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { getCategories } from '@/actions/products'
import { getServiceCategories, createServiceCategory, deleteServiceCategory } from '@/actions/services'
import { createCategory, updateCategory, deleteCategory } from '@/actions/categories'
import { toast } from 'sonner'
import { PageLoader } from '@/components/ui/page-loader'

export default function CategoriesPage() {
  const [loading, setLoading] = useState(true)
  const [productCategories, setProductCategories] = useState<any[]>([])
  const [servicesCats, setServicesCats] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'product' | 'service'>('product')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [formData, setFormData] = useState({ name: '', description: '' })

  useEffect(() => { loadData() }, [])

  async function loadData() {
    try {
      setLoading(true)
      const [prodRes, svcRes] = await Promise.all([
        getCategories(),
        getServiceCategories(),
      ])
      if (prodRes.success) setProductCategories(prodRes.data)
      if (svcRes.success) setServicesCats(svcRes.data)
    } catch {
      toast.error('Failed to load categories')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      let res
      if (activeTab === 'product') {
        if (editingId) {
          res = await updateCategory(editingId, formData)
        } else {
          res = await createCategory(formData)
        }
      } else {
        res = await createServiceCategory(formData)
      }
      if (res.success) {
        toast.success(editingId ? 'Category updated' : 'Category created')
        setDialogOpen(false)
        setEditingId(null)
        setFormData({ name: '', description: '' })
        loadData()
      } else {
        toast.error('message' in res ? (res as any).message : 'Failed to save')
      }
    } catch {
      toast.error('Failed to save category')
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this category?')) return
    try {
      const res = activeTab === 'product'
        ? await deleteCategory(id)
        : await deleteServiceCategory(id)
      if (res.success) { toast.success('Category deleted'); loadData() }
      else toast.error(res.message || 'Failed to delete')
    } catch { toast.error('Failed to delete category') }
  }

  function startEdit(cat: any) {
    setEditingId(cat.id)
    setFormData({ name: cat.name, description: cat.description || '' })
    setDialogOpen(true)
  }

  const categories = activeTab === 'product' ? productCategories : servicesCats

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Categories</h1>
        <PageLoader />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Categories</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage product and service categories</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(v) => { setDialogOpen(v); if (!v) { setEditingId(null); setFormData({ name: '', description: '' }) } }}>
          <DialogTrigger asChild>
            <Button className="brass-glow"><Plus className="w-4 h-4 mr-2" />Add Category</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[420px]">
            <DialogHeader><DialogTitle>{editingId ? 'Edit' : 'Create'} {activeTab === 'product' ? 'Product' : 'Service'} Category</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
              </div>
              <Button type="submit" className="w-full brass-glow">{editingId ? 'Update' : 'Create'} Category</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex gap-2">
            <Button variant={activeTab === 'product' ? 'default' : 'outline'} size="sm" onClick={() => setActiveTab('product')}>
              Product Categories ({productCategories.length})
            </Button>
            <Button variant={activeTab === 'service' ? 'default' : 'outline'} size="sm" onClick={() => setActiveTab('service')}>
              Service Categories ({servicesCats.length})
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((cat) => (
                <TableRow key={cat.id}>
                  <TableCell className="font-medium">{cat.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{cat.description || '-'}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{new Date(cat.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {activeTab === 'product' && (
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => startEdit(cat)}>
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(cat.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {categories.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No categories found</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
