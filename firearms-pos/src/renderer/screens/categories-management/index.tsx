import React, { useState, useEffect, useCallback } from 'react'
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  FolderTree,
  ChevronRight,
  ChevronDown,
  RefreshCw,
  X,
  FolderOpen,
  Folder,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
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


// Tree node component — compact redesign
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
          'flex items-center gap-1.5 py-1 px-2 rounded-md hover:bg-muted/40 group transition-colors',
          !category.isActive && 'opacity-40'
        )}
        style={{ paddingLeft: `${level * 20 + 8}px` }}
      >
        {/* Expand/collapse toggle */}
        <button
          onClick={() => hasChildren && toggleExpand(category.id)}
          className={cn(
            'w-4 h-4 flex items-center justify-center shrink-0 rounded-sm transition-colors',
            hasChildren ? 'hover:bg-muted/60 text-muted-foreground/60' : 'invisible'
          )}
        >
          {hasChildren && (isExpanded
            ? <ChevronDown className="h-3 w-3" />
            : <ChevronRight className="h-3 w-3" />
          )}
        </button>

        {/* Folder icon */}
        {hasChildren && isExpanded ? (
          <FolderOpen className="h-3.5 w-3.5 text-warning/70 shrink-0" />
        ) : hasChildren ? (
          <Folder className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0" />
        ) : (
          <div className="w-3.5 h-3.5 shrink-0 flex items-center justify-center">
            <div className="w-1 h-1 rounded-full bg-muted-foreground/30" />
          </div>
        )}

        {/* Name */}
        <span className="flex-1 text-xs font-medium truncate">{category.name}</span>

        {/* Description hint */}
        {category.description && (
          <span className="text-[10px] text-muted-foreground/30 truncate max-w-[150px] hidden xl:block">
            {category.description}
          </span>
        )}

        {/* Children count */}
        {hasChildren && (
          <span className="text-[9px] tabular-nums text-muted-foreground/40 font-medium">
            {category.children!.length}
          </span>
        )}

        {/* Inactive badge */}
        {!category.isActive && (
          <Badge variant="outline" className="h-3.5 px-1 text-[8px] font-medium border-border/40 text-muted-foreground/50">
            OFF
          </Badge>
        )}

        {/* Actions — hover reveal */}
        <div className="flex items-center gap-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => onEdit(category)}>
                <Pencil className="h-2.5 w-2.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-[10px]">Edit</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-5 w-5 hover:bg-destructive/10 hover:text-destructive" onClick={() => onDelete(category)}>
                <Trash2 className="h-2.5 w-2.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-[10px]">Delete</TooltipContent>
          </Tooltip>
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

  // Fetch categories — parallel calls, skip spinner on refetch
  const fetchCategories = useCallback(async (showSpinner = true) => {
    try {
      if (showSpinner) setIsLoading(true)

      // Fetch both in parallel instead of sequentially
      const [response, treeResponse] = await Promise.all([
        window.api.categories.getAll(),
        window.api.categories.getTree(),
      ])

      if (response?.success) {
        setCategories(response.data || [])
      }

      if (treeResponse?.success) {
        setCategoryTree(treeResponse.data || [])
        // Only auto-expand on first load
        if (showSpinner) {
          const rootIds = new Set((treeResponse.data || []).map((c: Category) => c.id))
          setExpandedIds(rootIds)
        }
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

  // Expand / collapse all
  const expandAll = () => {
    const allIds = new Set(categories.map(c => c.id))
    setExpandedIds(allIds)
  }
  const collapseAll = () => {
    setExpandedIds(new Set())
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
        await fetchCategories(false)
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
        await fetchCategories(false)
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
        await fetchCategories(false)
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

  return (
    <TooltipProvider delayDuration={300}>
    <div className="flex flex-col gap-3" style={{ height: 'calc(100vh - 8rem)' }}>
      {/* ── Header: Title + Stats + Actions ── */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight">Categories</h1>
            <p className="text-xs text-muted-foreground/70">
              Organize products, services & expenses
            </p>
          </div>
          {/* Inline stats pills */}
          {!isLoading && stats.total > 0 && (
            <div className="flex items-center gap-1.5 ml-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-muted/60 px-2.5 py-0.5 text-[10px] font-medium tabular-nums text-muted-foreground">
                {stats.total} total
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2.5 py-0.5 text-[10px] font-medium tabular-nums text-success">
                {stats.active} active
              </span>
              {stats.inactive > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-muted/60 px-2.5 py-0.5 text-[10px] font-medium tabular-nums text-muted-foreground/60">
                  {stats.inactive} inactive
                </span>
              )}
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-medium tabular-nums text-primary/70">
                <FolderTree className="h-2.5 w-2.5" />
                {stats.rootLevel} root
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="icon" className="h-8 w-8 border-border/40" onClick={fetchCategories}>
                <RefreshCw className="h-3.5 w-3.5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="text-[10px]">Refresh</TooltipContent>
          </Tooltip>
          <Button size="sm" onClick={handleOpenCreateDialog} className="h-8 px-3 text-xs font-semibold gap-1.5">
            <Plus className="h-3.5 w-3.5" />
            Add Category
          </Button>
        </div>
      </div>

      {/* ── Main Content: Tree + Quick Add side panel ── */}
      <div className="flex gap-3 flex-1 min-h-0">
        {/* ── Left: Category Tree ── */}
        <div className="flex-1 min-w-0 flex flex-col rounded-lg border border-border/50 bg-card/40 overflow-hidden">
          {/* Tree toolbar */}
          <div className="flex items-center gap-2 px-3 py-2 border-b border-border/30 bg-muted/20 shrink-0">
            <div className="relative flex-1 max-w-xs">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50" />
              <Input
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-7 pl-8 pr-7 text-xs bg-card/80 border-border/40 focus:border-primary/40 focus:ring-1 focus:ring-primary/20 placeholder:text-muted-foreground/40"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-muted-foreground/40 hover:text-foreground hover:bg-muted/50 transition-colors"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              )}
            </div>
            {!searchTerm && categoryTree.length > 0 && (
              <div className="flex items-center gap-0.5 ml-auto">
                <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px] text-muted-foreground/50 hover:text-foreground" onClick={expandAll}>
                  Expand all
                </Button>
                <span className="text-muted-foreground/20 text-[10px]">|</span>
                <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px] text-muted-foreground/50 hover:text-foreground" onClick={collapseAll}>
                  Collapse
                </Button>
              </div>
            )}
          </div>

          {/* Tree content */}
          <ScrollArea className="flex-1">
              {isLoading ? (
                <div className="flex h-full items-center justify-center gap-2 py-20">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary/50 border-t-transparent" />
                  <span className="text-xs text-muted-foreground/50">Loading categories...</span>
                </div>
              ) : searchTerm ? (
                // Filtered flat list
                <div className="p-1.5">
                  {filteredCategories.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground/50 gap-1.5">
                      <Search className="h-6 w-6 opacity-20" />
                      <p className="text-xs">No categories match "{searchTerm}"</p>
                    </div>
                  ) : (
                    filteredCategories.map((category) => (
                      <div
                        key={category.id}
                        className={cn(
                          'flex items-center gap-1.5 py-1 px-2 rounded-md hover:bg-muted/40 group transition-colors cursor-pointer',
                          !category.isActive && 'opacity-40'
                        )}
                        onClick={() => handleEdit(category)}
                      >
                        <FolderTree className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />
                        <span className="flex-1 text-xs font-medium truncate">{category.name}</span>
                        {category.description && (
                          <span className="text-[10px] text-muted-foreground/30 truncate max-w-[180px] hidden xl:block">
                            {category.description}
                          </span>
                        )}
                        {category.parentId && (
                          <Badge variant="outline" className="h-3.5 px-1 text-[8px] font-medium border-border/30 text-muted-foreground/40">
                            sub
                          </Badge>
                        )}
                        {!category.isActive && (
                          <Badge variant="outline" className="h-3.5 px-1 text-[8px] font-medium border-border/40 text-muted-foreground/50">
                            OFF
                          </Badge>
                        )}
                        <div className="flex items-center gap-0 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => handleEdit(category)}>
                            <Pencil className="h-2.5 w-2.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-5 w-5 hover:bg-destructive/10 hover:text-destructive" onClick={() => handleDeleteClick(category)}>
                            <Trash2 className="h-2.5 w-2.5" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ) : (
                // Tree view
                <div className="p-1.5">
                  {categoryTree.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground/50 gap-2">
                      <FolderTree className="h-8 w-8 opacity-20" />
                      <p className="text-xs">No categories yet</p>
                      <Button variant="link" size="sm" onClick={handleOpenCreateDialog} className="text-xs h-auto p-0 text-primary/70">
                        Create your first category
                      </Button>
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
        </div>

        {/* ── Right: Quick Add Panel ── */}
        <div className="w-64 xl:w-72 shrink-0 rounded-lg border border-border/50 bg-card/40 overflow-hidden flex flex-col">
          <div className="px-3 py-2 border-b border-border/30 bg-muted/20">
            <p className="text-xs font-semibold">Quick Add</p>
            <p className="text-[10px] text-muted-foreground/50">Add a root category instantly</p>
          </div>
          <div className="p-3 space-y-2">
            <div className="flex gap-1.5">
              <Input
                placeholder="Category name..."
                value={quickAddName}
                onChange={(e) => setQuickAddName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && quickAddName.trim()) {
                    handleQuickAdd()
                  }
                }}
                className="h-8 text-xs bg-card/80 border-border/40 focus:border-primary/40 focus:ring-1 focus:ring-primary/20 placeholder:text-muted-foreground/40 flex-1"
              />
              <Button
                size="sm"
                className="h-8 px-2.5 shrink-0"
                onClick={handleQuickAdd}
                disabled={!quickAddName.trim() || isQuickAdding}
              >
                {isQuickAdding ? (
                  <RefreshCw className="h-3 w-3 animate-spin" />
                ) : (
                  <Plus className="h-3.5 w-3.5" />
                )}
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground/30 leading-relaxed">
              Press Enter or click + to add. Use "Add Category" button for subcategories and descriptions.
            </p>
          </div>

        </div>
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
    </TooltipProvider>
  )
}

export default CategoriesManagementScreen
