import React, { useState, useEffect, useCallback } from 'react'
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  FolderTree,
  Package,
  ChevronRight,
  ChevronDown,
  RefreshCw,
  AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'

interface Category {
  id: number
  name: string
  description: string | null
  parentId: number | null
  isActive: boolean
  createdAt: string
  updatedAt: string
  children?: Category[]
}

interface CategoryFormData {
  name: string
  description: string
  parentId: string
  isActive: boolean
}

const initialFormData: CategoryFormData = {
  name: '',
  description: '',
  parentId: '',
  isActive: true,
}


// Tree node component
function CategoryTreeNode({
  category,
  level = 0,
  onEdit,
  onDelete,
  expandedIds,
  toggleExpand,
}: {
  category: Category
  level?: number
  onEdit: (category: Category) => void
  onDelete: (category: Category) => void
  expandedIds: Set<number>
  toggleExpand: (id: number) => void
}) {
  const hasChildren = category.children && category.children.length > 0
  const isExpanded = expandedIds.has(category.id)

  return (
    <div className="select-none">
      <div
        className={cn(
          'flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-accent group',
          !category.isActive && 'opacity-50'
        )}
        style={{ marginLeft: level * 24 }}
      >
        <button
          onClick={() => hasChildren && toggleExpand(category.id)}
          className={cn('w-5 h-5 flex items-center justify-center', !hasChildren && 'invisible')}
        >
          {hasChildren && (isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />)}
        </button>
        <FolderTree className="h-4 w-4 text-muted-foreground" />
        <span className="flex-1 font-medium">{category.name}</span>
        {!category.isActive && (
          <Badge variant="secondary" className="text-xs">
            Inactive
          </Badge>
        )}
        <div className="opacity-0 group-hover:opacity-100 flex gap-1">
          <Button variant="ghost" size="sm" onClick={() => onEdit(category)}>
            <Pencil className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onDelete(category)}>
            <Trash2 className="h-3 w-3 text-destructive" />
          </Button>
        </div>
      </div>
      {hasChildren && isExpanded && (
        <div>
          {category.children!.map((child) => (
            <CategoryTreeNode
              key={child.id}
              category={child}
              level={level + 1}
              onEdit={onEdit}
              onDelete={onDelete}
              expandedIds={expandedIds}
              toggleExpand={toggleExpand}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function CategoriesManagementScreen() {
  const [categories, setCategories] = useState<Category[]>([])
  const [categoryTree, setCategoryTree] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState<CategoryFormData>(initialFormData)
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set())
  const [isSaving, setIsSaving] = useState(false)
  const [quickAddName, setQuickAddName] = useState('')
  const [isQuickAdding, setIsQuickAdding] = useState(false)

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      setIsLoading(true)

      // Get flat list
      const response = await window.api.categories.getAll()
      if (response?.success) {
        setCategories(response.data || [])
      }

      // Get tree structure
      const treeResponse = await window.api.categories.getTree()
      if (treeResponse?.success) {
        setCategoryTree(treeResponse.data || [])
        // Auto-expand root level
        const rootIds = new Set((treeResponse.data || []).map((c: Category) => c.id))
        setExpandedIds(rootIds)
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  // Toggle expand/collapse
  const toggleExpand = (id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  // Open dialog for creating
  const handleOpenCreateDialog = () => {
    setSelectedCategory(null)
    setFormData(initialFormData)
    setIsDialogOpen(true)
  }

  // Open dialog for editing
  const handleEdit = (category: Category) => {
    setSelectedCategory(category)
    setFormData({
      name: category.name,
      description: category.description || '',
      parentId: category.parentId?.toString() || '',
      isActive: category.isActive,
    })
    setIsDialogOpen(true)
  }

  // Open delete confirmation
  const handleDeleteClick = (category: Category) => {
    setSelectedCategory(category)
    setIsDeleteDialogOpen(true)
  }

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      alert('Category name is required')
      return
    }

    try {
      setIsSaving(true)

      const data = {
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        parentId: formData.parentId ? parseInt(formData.parentId) : null,
        isActive: formData.isActive,
      }

      let response
      if (selectedCategory) {
        response = await window.api.categories.update(selectedCategory.id, data)
      } else {
        response = await window.api.categories.create(data)
      }

      if (response?.success) {
        await fetchCategories()
        setIsDialogOpen(false)
        setFormData(initialFormData)
        setSelectedCategory(null)
      } else {
        alert(response?.message || 'Failed to save category')
      }
    } catch (error) {
      console.error('Failed to save category:', error)
      alert('Failed to save category')
    } finally {
      setIsSaving(false)
    }
  }

  // Delete category
  const handleDelete = async () => {
    if (!selectedCategory) return

    try {
      const response = await window.api.categories.delete(selectedCategory.id)
      if (response?.success) {
        await fetchCategories()
        setIsDeleteDialogOpen(false)
        setSelectedCategory(null)
      } else {
        alert(response?.message || 'Failed to delete category')
      }
    } catch (error) {
      console.error('Failed to delete category:', error)
      alert('Failed to delete category')
    }
  }

  // Quick add category
  const handleQuickAdd = async () => {
    if (!quickAddName.trim()) return

    try {
      setIsQuickAdding(true)
      const response = await window.api.categories.create({
        name: quickAddName.trim(),
        description: null,
        parentId: null,
        isActive: true,
      })

      if (response?.success) {
        setQuickAddName('')
        await fetchCategories()
      } else {
        alert(response?.message || 'Failed to add category')
      }
    } catch (error) {
      console.error('Quick add failed:', error)
      alert('Failed to add category')
    } finally {
      setIsQuickAdding(false)
    }
  }

  // Filter categories based on search
  const filteredCategories = categories.filter(
    (cat) =>
      cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (cat.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
  )

  // Get parent categories for dropdown (exclude self and children)
  const getParentOptions = () => {
    return categories.filter((cat) => {
      if (!selectedCategory) return cat.isActive
      // Exclude self
      if (cat.id === selectedCategory.id) return false
      // Exclude children (simplified - just check immediate parent)
      if (cat.parentId === selectedCategory.id) return false
      return cat.isActive
    })
  }

  // Stats
  const stats = {
    total: categories.length,
    active: categories.filter((c) => c.isActive).length,
    inactive: categories.filter((c) => !c.isActive).length,
    rootLevel: categories.filter((c) => !c.parentId).length,
  }

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-lg">Loading categories...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Categories Management</h1>
          <p className="text-muted-foreground">
            Organize categories for products, purchases, receipts, and cart items
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchCategories}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleOpenCreateDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900">
                <FolderTree className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total Categories</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900">
                <Package className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.active}</p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-100 dark:bg-yellow-900">
                <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.inactive}</p>
                <p className="text-xs text-muted-foreground">Inactive</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900">
                <FolderTree className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.rootLevel}</p>
                <p className="text-xs text-muted-foreground">Root Categories</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        {/* Category Tree */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Category Hierarchy</CardTitle>
                <CardDescription>View and manage your category structure</CardDescription>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              {searchTerm ? (
                // Show filtered flat list when searching
                <div className="space-y-1">
                  {filteredCategories.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">No categories found</p>
                  ) : (
                    filteredCategories.map((category) => (
                      <div
                        key={category.id}
                        className={cn(
                          'flex items-center gap-2 py-2 px-3 rounded-lg hover:bg-accent group',
                          !category.isActive && 'opacity-50'
                        )}
                      >
                        <FolderTree className="h-4 w-4 text-muted-foreground" />
                        <span className="flex-1 font-medium">{category.name}</span>
                        {category.description && (
                          <span className="text-sm text-muted-foreground truncate max-w-[200px]">
                            {category.description}
                          </span>
                        )}
                        {!category.isActive && (
                          <Badge variant="secondary" className="text-xs">
                            Inactive
                          </Badge>
                        )}
                        <div className="opacity-0 group-hover:opacity-100 flex gap-1">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(category)}>
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteClick(category)}>
                            <Trash2 className="h-3 w-3 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                // Show tree when not searching
                <div className="space-y-1">
                  {categoryTree.length === 0 ? (
                    <div className="text-center py-12">
                      <FolderTree className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No categories yet</p>
                      <p className="text-sm text-muted-foreground">
                        Click "Add Category" to create your first category
                      </p>
                    </div>
                  ) : (
                    categoryTree.map((category) => (
                      <CategoryTreeNode
                        key={category.id}
                        category={category}
                        onEdit={handleEdit}
                        onDelete={handleDeleteClick}
                        expandedIds={expandedIds}
                        toggleExpand={toggleExpand}
                      />
                    ))
                  )}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Quick Add Section */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Add Category</CardTitle>
            <CardDescription>Quickly add a new root category</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Input
                placeholder="Enter category name..."
                value={quickAddName}
                onChange={(e) => setQuickAddName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && quickAddName.trim()) {
                    handleQuickAdd()
                  }
                }}
              />
              <Button
                className="w-full"
                onClick={handleQuickAdd}
                disabled={!quickAddName.trim() || isQuickAdding}
              >
                {isQuickAdding ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Category
                  </>
                )}
              </Button>
            </div>
            <div className="border-t pt-4">
              <p className="text-sm text-muted-foreground mb-3">
                Need more options? Use the "Add Category" button for:
              </p>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li className="flex items-center gap-2">
                  <ChevronRight className="h-3 w-3" />
                  Adding subcategories
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="h-3 w-3" />
                  Adding descriptions
                </li>
                <li className="flex items-center gap-2">
                  <ChevronRight className="h-3 w-3" />
                  Setting active status
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{selectedCategory ? 'Edit Category' : 'Add New Category'}</DialogTitle>
            <DialogDescription>
              {selectedCategory
                ? 'Update the category details below'
                : 'Enter the details for the new category'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Category Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter category name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder="Optional description"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="parentId">Parent Category</Label>
                <Select
                  value={formData.parentId || 'none'}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, parentId: value === 'none' ? '' : value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select parent (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None (Root Category)</SelectItem>
                    {getParentOptions().map((cat) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="isActive">Active Status</Label>
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isActive: checked }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? 'Saving...' : selectedCategory ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedCategory?.name}"? This action cannot be
              undone. The category will be deactivated instead of permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default CategoriesManagementScreen
