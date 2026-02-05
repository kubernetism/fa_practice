'use client'

import { useState } from 'react'
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

const mockTodos = [
  { id: 1, title: 'Restock 9mm ammunition', description: 'Low inventory alert', status: 'pending', priority: 'high', assignedToName: 'Admin User', dueDate: '2026-02-07', createdAt: '2026-02-05' },
  { id: 2, title: 'Process pending customer refund', description: 'Customer #15 refund request', status: 'in_progress', priority: 'urgent', assignedToName: 'Manager Khan', dueDate: '2026-02-06', createdAt: '2026-02-04' },
  { id: 3, title: 'Update product catalog photos', description: 'New products added last week need photos', status: 'pending', priority: 'medium', assignedToName: 'Cashier Ali', dueDate: '2026-02-10', createdAt: '2026-02-03' },
  { id: 4, title: 'Monthly inventory audit', description: 'Complete physical count for February', status: 'pending', priority: 'high', assignedToName: 'Admin User', dueDate: '2026-02-28', createdAt: '2026-02-01' },
  { id: 5, title: 'Submit tax documents', description: 'Q4 2025 filing', status: 'completed', priority: 'urgent', assignedToName: 'Admin User', dueDate: '2026-02-01', createdAt: '2026-01-25' },
  { id: 6, title: 'Clean display cases', description: 'Weekly cleaning schedule', status: 'completed', priority: 'low', assignedToName: 'Cashier Ali', dueDate: '2026-02-03', createdAt: '2026-02-02' },
]

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

const summaryCards = [
  { title: 'Total Tasks', value: String(mockTodos.length), icon: ListTodo, accent: 'text-primary' },
  { title: 'Pending', value: String(mockTodos.filter((t) => t.status === 'pending').length), icon: Clock, accent: 'text-muted-foreground' },
  { title: 'In Progress', value: String(mockTodos.filter((t) => t.status === 'in_progress').length), icon: Loader2, accent: 'text-blue-400' },
  { title: 'Urgent', value: String(mockTodos.filter((t) => t.priority === 'urgent' && t.status !== 'completed').length), icon: AlertTriangle, accent: 'text-red-400' },
]

export default function TodosPage() {
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterPriority, setFilterPriority] = useState('all')

  const filtered = mockTodos.filter((t) => {
    if (filterStatus !== 'all' && t.status !== filterStatus) return false
    if (filterPriority !== 'all' && t.priority !== filterPriority) return false
    return true
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tasks</h1>
          <p className="text-sm text-muted-foreground mt-1">Assign and track team tasks</p>
        </div>
        <Dialog>
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
            <form className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input placeholder="What needs to be done?" />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input placeholder="Additional details" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select>
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
                  <Input type="date" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Assign To</Label>
                  <Select>
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
                  <Select>
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
              {filtered.map((todo) => (
                <TableRow key={todo.id} className={todo.status === 'completed' ? 'opacity-50' : ''}>
                  <TableCell>
                    <div>
                      <p className="text-sm font-medium">{todo.title}</p>
                      {todo.description && (
                        <p className="text-[11px] text-muted-foreground mt-0.5">{todo.description}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`text-[10px] capitalize ${priorityColors[todo.priority]}`}>
                      {todo.priority}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{todo.assignedToName}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{todo.dueDate}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`text-[10px] ${statusColors[todo.status]}`}>
                      {statusLabels[todo.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {todo.status === 'pending' && (
                        <Button variant="ghost" size="sm" className="h-7 text-xs">
                          Start
                        </Button>
                      )}
                      {todo.status === 'in_progress' && (
                        <Button variant="ghost" size="sm" className="h-7 text-xs text-success">
                          Complete
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive">
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
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
