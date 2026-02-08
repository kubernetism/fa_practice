'use client'

import { useState } from 'react'
import {
  UserCog,
  Plus,
  Search,
  Edit2,
  Trash2,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Clock,
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
  DialogDescription,
  DialogFooter,
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

type User = {
  id: number
  fullName: string
  username: string
  email: string
  phone: string
  role: 'admin' | 'manager' | 'cashier'
  branchName: string
  isActive: boolean
  lastLogin: string | null
  provider: string
}

const mockUsers: User[] = [
  { id: 1, fullName: 'Safdar Ali Shah', username: 'safdar', email: 'safdar@firearms.pk', phone: '+92-300-1112233', role: 'admin', branchName: 'Islamabad HQ', isActive: true, lastLogin: '2026-02-08 09:15', provider: 'credentials' },
  { id: 2, fullName: 'Ahmad Khan', username: 'ahmad.khan', email: 'ahmad@firearms.pk', phone: '+92-321-4445566', role: 'manager', branchName: 'Islamabad HQ', isActive: true, lastLogin: '2026-02-07 18:30', provider: 'credentials' },
  { id: 3, fullName: 'Sana Ahmed', username: 'sana.ahmed', email: 'sana@firearms.pk', phone: '+92-333-7778899', role: 'cashier', branchName: 'Rawalpindi Branch', isActive: true, lastLogin: '2026-02-08 08:45', provider: 'credentials' },
  { id: 4, fullName: 'Hassan Ali', username: 'hassan.ali', email: 'hassan@firearms.pk', phone: '+92-345-1234567', role: 'cashier', branchName: 'Lahore Branch', isActive: true, lastLogin: '2026-02-06 17:00', provider: 'credentials' },
  { id: 5, fullName: 'Fatima Noor', username: 'fatima.noor', email: 'fatima@firearms.pk', phone: '+92-300-9998877', role: 'manager', branchName: 'Rawalpindi Branch', isActive: false, lastLogin: '2026-01-15 12:00', provider: 'google' },
  { id: 6, fullName: 'Bilal Raza', username: 'bilal.raza', email: 'bilal@firearms.pk', phone: '+92-312-5556677', role: 'cashier', branchName: 'Islamabad HQ', isActive: true, lastLogin: null, provider: 'credentials' },
]

const branches = ['Islamabad HQ', 'Rawalpindi Branch', 'Lahore Branch']

const roleBadgeStyles: Record<string, string> = {
  admin: 'bg-primary/10 text-primary border-primary/20',
  manager: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  cashier: 'bg-muted text-muted-foreground border-border',
}

const roleIcons: Record<string, typeof Shield> = {
  admin: ShieldCheck,
  manager: ShieldAlert,
  cashier: Shield,
}

export default function UsersPage() {
  const [search, setSearch] = useState('')
  const [filterRole, setFilterRole] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [dialogOpen, setDialogOpen] = useState(false)

  const filtered = mockUsers.filter((u) => {
    if (filterRole !== 'all' && u.role !== filterRole) return false
    if (filterStatus === 'active' && !u.isActive) return false
    if (filterStatus === 'inactive' && u.isActive) return false
    if (search) {
      const q = search.toLowerCase()
      if (!u.fullName.toLowerCase().includes(q) && !u.username.toLowerCase().includes(q) && !u.email.toLowerCase().includes(q)) return false
    }
    return true
  })

  const summaryCards = [
    { title: 'Total Users', value: String(mockUsers.length), icon: UserCog, accent: 'text-primary' },
    { title: 'Admins', value: String(mockUsers.filter(u => u.role === 'admin').length), icon: ShieldCheck, accent: 'text-primary' },
    { title: 'Managers', value: String(mockUsers.filter(u => u.role === 'manager').length), icon: ShieldAlert, accent: 'text-blue-400' },
    { title: 'Cashiers', value: String(mockUsers.filter(u => u.role === 'cashier').length), icon: Shield, accent: 'text-muted-foreground' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Users</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage staff accounts, roles, and permissions</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="brass-glow">
              <Plus className="w-4 h-4 mr-2" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New User</DialogTitle>
              <DialogDescription>Create a staff account with role-based access</DialogDescription>
            </DialogHeader>
            <form className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Full Name *</Label>
                  <Input placeholder="Full name" />
                </div>
                <div className="space-y-2">
                  <Label>Username *</Label>
                  <Input placeholder="username" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email *</Label>
                  <Input type="email" placeholder="user@example.pk" />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input placeholder="+92-3xx-xxxxxxx" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Password *</Label>
                <Input type="password" placeholder="Minimum 8 characters" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Role *</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="cashier">Cashier</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Branch *</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Select branch" /></SelectTrigger>
                    <SelectContent>
                      {branches.map((b) => (
                        <SelectItem key={b} value={b}>{b}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button type="submit" className="w-full brass-glow">Create User</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
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

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search by name, username, or email..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
            </div>
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="cashier">Cashier</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[130px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Branch</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((user) => {
                const RoleIcon = roleIcons[user.role]
                return (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <p className="text-sm font-medium">{user.fullName}</p>
                        <p className="text-[10px] text-muted-foreground">@{user.username} &middot; {user.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[10px] ${roleBadgeStyles[user.role]}`}>
                        <RoleIcon className="w-3 h-3 mr-1" />
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{user.branchName}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{user.phone}</TableCell>
                    <TableCell>
                      {user.lastLogin ? (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {user.lastLogin}
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground italic">Never</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-[10px] ${user.isActive ? 'bg-success/10 text-success border-success/20' : 'bg-destructive/10 text-destructive border-destructive/20'}`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                          <Edit2 className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">No users found</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
