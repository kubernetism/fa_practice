'use client'

import { useState, useEffect } from 'react'
import {
  ListTodo,
  Plus,
  Filter,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Loader2,
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
  getTodos,
  getTodoSummary,
  createTodo,
  updateTodoStatus,
  deleteTodo,
} from '@/actions/todos'
import { toast } from 'sonner'

const statusColors: Record<string, string> = {
  pending: 'bg-muted text-muted-foreground',
  in_progress: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  completed: 'bg-success/10 text-success border-success/20',
  cancelled: 'bg-red-500/10 text-red-400 border-red-500/20',
}

const priorityColors: Record<string, string> = {
  low: 'bg-muted text-muted-foreground',
  medium: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  high: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  urgent: 'bg-red-500/10 text-red-400 border-red-500/20',
}

const statusLabels: Record<string, string> = {
  pending: 'Pending',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

export default function TodosPage() {
  const [loading, setLoading] = useState(true)
  const [todos, setTodos] = useState<any[]>([])
  const [summary, setSummary] = useState<any>(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterPriority, setFilterPriority] = useState('all')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    assignedTo: '1',
    assignedToRole: 'admin',
    dueDate: '',
  })

  useEffect(() => {
    loadData()
  }, [filterStatus, filterPriority])

  async function loadData() {
    try {
      setLoading(true)
      const [todosRes, summaryRes] = await Promise.all([
        getTodos({
          status: filterStatus !== 'all' ? filterStatus : undefined,
          priority: filterPriority !== 'all' ? filterPriority : undefined,
        }),
        getTodoSummary(),
      ])
      if (todosRes.success) {
        setTodos(todosRes.data)
      }
      if (summaryRes.success) {
        setSummary(summaryRes.data)
      }
    } catch (error) {
      console.error('Failed to load todos:', error)
      toast.error('Failed to load todos')
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      const res = await createTodo({
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        assignedTo: Number(formData.assignedTo),
        assignedToRole: formData.assignedToRole,
        dueDate: formData.dueDate,
      })
      if (res.success) {
        toast.success('Task created successfully')
        setDialogOpen(false)
        setFormData({
          title: '',
          description: '',
          priority: 'medium',
          assignedTo: '1',
          assignedToRole: 'admin',
          dueDate: '',
        })
        loadData()
      }
    } catch (error) {
      console.error('Failed to create task:', error)
      toast.error('Failed to create task')
    }
  }

  async function handleStatusChange(id: number, status: string) {
    try {
      const res = await updateTodoStatus(id, status)
      if (res.success) {
        toast.success('Task updated')
        loadData()
      }
    } catch (error) {
      console.error('Failed to update task:', error)
      toast.error('Failed to update task')
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Are you sure you want to delete this task?')) return
    try {
      const res = await deleteTodo(id)
      if (res.success) {
        toast.success('Task deleted')
        loadData()
      }
    } catch (error) {
      console.error('Failed to delete task:', error)
      toast.error('Failed to delete task')
    }
  }

  const summaryCards = [
    { title: 'Total Tasks', value: String(summary?.totalTodos || 0), icon: ListTodo, accent: 'text-primary' },
    { title: 'Pending', value: String(summary?.pendingCount || 0), icon: Clock, accent: 'text-muted-foreground' },
    { title: 'In Progress', value: String(summary?.inProgressCount || 0), icon: Loader2, accent: 'text-blue-400' },
    { title: 'Urgent', value: String(summary?.urgentCount || 0), icon: AlertTriangle, accent: 'text-red-400' },
  ]

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>
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
          <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>
          <p className="text-sm text-muted-foreground mt-1">Assign and track team tasks</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="brass-glow">
              <Plus className="w-4 h-4 mr-2" />
              New Task
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input placeholder="What needs to be done?" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input placeholder="Additional details" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select value={formData.priority} onValueChange={(v) => setFormData({...formData, priority: v})}>
                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Due Date</Label>
                  <Input type="date" value={formData.dueDate} onChange={(e) => setFormData({...formData, dueDate: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Assign To</Label>
                  <Select value={formData.assignedTo} onValueChange={(v) => setFormData({...formData, assignedTo: v})}>
                    <SelectTrigger><SelectValue placeholder="Select member" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Admin User</SelectItem>
                      <SelectItem value="2">Manager Khan</SelectItem>
                      <SelectItem value="3">Cashier Ali</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select value={formData.assignedToRole} onValueChange={(v) => setFormData({...formData, assignedToRole: v})}>
                    <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="cashier">Cashier</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button type="submit" className="w-full brass-glow">Create Task</Button>
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
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
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
                <TableHead>Task</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[120px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {todos.map((todo) => (
                <TableRow key={todo.todo.id} className={todo.todo.status === 'completed' ? 'opacity-50' : ''}>
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium">{todo.todo.title}</p>
                      {todo.todo.description && (
                        <p className="text-[11px] text-muted-foreground mt-0.5">{todo.todo.description}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`text-[10px] capitalize ${priorityColors[todo.todo.priority]}`}>
                      {todo.todo.priority}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{todo.assignedToName || 'Unassigned'}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {todo.todo.dueDate ? new Date(todo.todo.dueDate).toLocaleDateString() : '-'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`text-[10px] ${statusColors[todo.todo.status]}`}>
                      {statusLabels[todo.todo.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {todo.todo.status === 'pending' && (
                        <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => handleStatusChange(todo.todo.id, 'in_progress')}>
                          Start
                        </Button>
                      )}
                      {todo.todo.status === 'in_progress' && (
                        <Button variant="ghost" size="sm" className="h-7 text-xs text-success" onClick={() => handleStatusChange(todo.todo.id, 'completed')}>
                          Complete
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(todo.todo.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {todos.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No tasks found
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
