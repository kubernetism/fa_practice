import React, { useState, useEffect } from 'react'
import { Bell, Plus, X, Check, Clock, AlertCircle, Trash2, Edit2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { TodoWithDetails, TodoCounts, TodoStatus, TodoPriority } from '@/shared/types'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/auth-context'

// Simple toast notification helper
const showToast = (message: string, type: 'success' | 'error' = 'success') => {
  // For now, using console and alert. Can be replaced with a proper toast library later
  if (type === 'error') {
    console.error(message)
    alert(message)
  } else {
    console.log(message)
  }
}

export function TodosPanel() {
  const { user } = useAuth()
  const [todos, setTodos] = useState<TodoWithDetails[]>([])
  const [counts, setCounts] = useState<TodoCounts | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedTodo, setSelectedTodo] = useState<TodoWithDetails | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as TodoPriority,
    dueDate: '',
  })

  useEffect(() => {
    if (isOpen) {
      loadTodos()
      loadCounts()
    }
  }, [isOpen])

  const loadTodos = async () => {
    try {
      const result = await window.api.todos.getAll()
      if (result.success) {
        setTodos(result.data || [])
      }
    } catch (error) {
      console.error('Failed to load todos:', error)
    }
  }

  const loadCounts = async () => {
    try {
      const result = await window.api.todos.getCounts()
      if (result.success) {
        setCounts(result.data)
      }
    } catch (error) {
      console.error('Failed to load counts:', error)
    }
  }

  const handleCreateTodo = async () => {
    if (!formData.title.trim()) {
      showToast('Title is required', 'error')
      return
    }

    if (!user) {
      showToast('User not found', 'error')
      return
    }

    setIsLoading(true)
    try {
      const result = await window.api.todos.create({
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        dueDate: formData.dueDate || undefined,
        assignedTo: user.userId, // Assign to self
      })

      if (result.success) {
        showToast('Todo created successfully', 'success')
        setIsCreateDialogOpen(false)
        setFormData({
          title: '',
          description: '',
          priority: 'medium',
          dueDate: '',
        })
        loadTodos()
        loadCounts()
      } else {
        showToast(result.message || 'Failed to create todo', 'error')
      }
    } catch (error) {
      showToast('An error occurred', 'error')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditTodo = (todo: TodoWithDetails) => {
    setSelectedTodo(todo)
    setFormData({
      title: todo.title,
      description: todo.description || '',
      priority: todo.priority as TodoPriority,
      dueDate: todo.dueDate || '',
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdateTodo = async () => {
    if (!selectedTodo) return

    if (!formData.title.trim()) {
      showToast('Title is required', 'error')
      return
    }

    setIsLoading(true)
    try {
      const result = await window.api.todos.update({
        id: selectedTodo.id,
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        dueDate: formData.dueDate || undefined,
      })

      if (result.success) {
        showToast('Todo updated successfully', 'success')
        setIsEditDialogOpen(false)
        setSelectedTodo(null)
        setFormData({
          title: '',
          description: '',
          priority: 'medium',
          dueDate: '',
        })
        loadTodos()
        loadCounts()
      } else {
        showToast(result.message || 'Failed to update todo', 'error')
      }
    } catch (error) {
      showToast('An error occurred', 'error')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateStatus = async (id: number, status: TodoStatus) => {
    try {
      const result = await window.api.todos.update({ id, status })

      if (result.success) {
        showToast('Todo updated successfully', 'success')
        loadTodos()
        loadCounts()
      } else {
        showToast(result.message || 'Failed to update todo', 'error')
      }
    } catch (error) {
      showToast('An error occurred', 'error')
      console.error(error)
    }
  }

  const handleDeleteTodo = async (id: number) => {
    if (!confirm('Are you sure you want to delete this todo?')) return

    try {
      const result = await window.api.todos.delete(id)

      if (result.success) {
        showToast('Todo deleted successfully', 'success')
        loadTodos()
        loadCounts()
      } else {
        showToast(result.message || 'Failed to delete todo', 'error')
      }
    } catch (error) {
      showToast('An error occurred', 'error')
      console.error(error)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500'
      case 'high':
        return 'bg-orange-500'
      case 'medium':
        return 'bg-yellow-500'
      case 'low':
        return 'bg-blue-500'
      default:
        return 'bg-gray-500'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <Check className="h-4 w-4" />
      case 'in_progress':
        return <Clock className="h-4 w-4" />
      case 'cancelled':
        return <X className="h-4 w-4" />
      default:
        return <AlertCircle className="h-4 w-4" />
    }
  }

  const pendingCount = counts?.pending || 0
  const inProgressCount = counts?.in_progress || 0
  const activeCount = pendingCount + inProgressCount

  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {activeCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] text-white">
                {activeCount > 99 ? '99+' : activeCount}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-96 p-0">
          <div className="flex items-center justify-between border-b p-4">
            <div>
              <h3 className="font-semibold">My Todos</h3>
              <p className="text-xs text-muted-foreground">
                {activeCount} active task{activeCount !== 1 ? 's' : ''}
              </p>
            </div>
            <Button size="sm" onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-1 h-4 w-4" />
              New
            </Button>
          </div>

          <ScrollArea className="h-[400px]">
            {todos.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center">
                <AlertCircle className="mb-2 h-12 w-12 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No todos yet</p>
                <Button
                  variant="link"
                  size="sm"
                  className="mt-2"
                  onClick={() => setIsCreateDialogOpen(true)}
                >
                  Create your first todo
                </Button>
              </div>
            ) : (
              <div className="divide-y">
                {todos.map((todo) => (
                  <div
                    key={todo.id}
                    className={cn(
                      'p-4 hover:bg-accent/50 transition-colors',
                      todo.status === 'completed' && 'opacity-60'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          'mt-0.5 h-2 w-2 rounded-full flex-shrink-0',
                          getPriorityColor(todo.priority)
                        )}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4
                            className={cn(
                              'text-sm font-medium',
                              todo.status === 'completed' && 'line-through'
                            )}
                          >
                            {todo.title}
                          </h4>
                          <div className="flex items-center gap-1">
                            {todo.status !== 'completed' && todo.status !== 'cancelled' && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => handleEditTodo(todo)}
                                  title="Edit todo"
                                >
                                  <Edit2 className="h-3.5 w-3.5" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7"
                                  onClick={() => handleUpdateStatus(todo.id, 'completed')}
                                  title="Mark as complete"
                                >
                                  <Check className="h-3.5 w-3.5" />
                                </Button>
                              </>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7"
                              onClick={() => handleDeleteTodo(todo.id)}
                              title="Delete todo"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                        {todo.description && (
                          <p className="mt-1 text-xs text-muted-foreground line-clamp-2">
                            {todo.description}
                          </p>
                        )}
                        <div className="mt-2 flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {getStatusIcon(todo.status)}
                            <span className="ml-1 capitalize">
                              {todo.status.replace('_', ' ')}
                            </span>
                          </Badge>
                          {todo.dueDate && (
                            <span className="text-xs text-muted-foreground">
                              Due: {new Date(todo.dueDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Todo</DialogTitle>
            <DialogDescription>Add a new task to your todo list</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter todo title"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter todo description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value: TodoPriority) =>
                    setFormData({ ...formData, priority: value })
                  }
                >
                  <SelectTrigger id="priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="dueDate">Due Date</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateTodo} disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Todo'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Todo</DialogTitle>
            <DialogDescription>Update your task details</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Title *</Label>
              <Input
                id="edit-title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter todo title"
              />
            </div>

            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter todo description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-priority">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value: TodoPriority) =>
                    setFormData({ ...formData, priority: value })
                  }
                >
                  <SelectTrigger id="edit-priority">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="edit-dueDate">Due Date</Label>
                <Input
                  id="edit-dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateTodo} disabled={isLoading}>
              {isLoading ? 'Updating...' : 'Update Todo'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
