import React, { useState, useEffect } from 'react'
import { Plus, Search, Pencil, Trash2, UserCog, Shield, ShieldCheck, ShieldQuestion, User, Users, UserX, UserCheck, Mail, Clock, RefreshCw } from 'lucide-react'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SecurityQuestionsDialog } from './security-questions-dialog'

interface User {
  id: number
  username: string
  password: string
  email: string
  fullName: string
  role: string
  permissions: string[]
  isActive: boolean
  lastLogin: string | null
  branchId: number | null
  createdAt: string
  updatedAt: string
}

interface UserFormData {
  username: string
  fullName: string
  email: string
  password: string
  role: string
}

const USER_ROLES = [
  { value: 'admin', label: 'Admin' },
  { value: 'manager', label: 'Manager' },
  { value: 'cashier', label: 'Cashier' },
]

const initialFormData: UserFormData = {
  username: '',
  fullName: '',
  email: '',
  password: '',
  role: 'cashier',
}

function getRoleBadge(role: string) {
  const map: Record<string, { className: string; icon: React.ElementType }> = {
    admin: { className: 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/20', icon: Shield },
    manager: { className: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/20', icon: ShieldCheck },
    cashier: { className: 'bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/20', icon: User },
  }
  const cfg = map[role.toLowerCase()] ?? { className: 'bg-zinc-500/15 text-zinc-500 border-zinc-500/20', icon: User }
  const Icon = cfg.icon
  return (
    <Badge variant="outline" className={`${cfg.className} text-[11px] font-medium gap-1 px-1.5 py-0`}>
      <Icon className="w-3 h-3" />
      {role.charAt(0).toUpperCase() + role.slice(1)}
    </Badge>
  )
}

function formatRelativeDate(iso: string | null) {
  if (!iso) return 'Never'
  try {
    const d = new Date(iso)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays}d ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  } catch {
    return iso
  }
}

export default function UsersScreen() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRole, setFilterRole] = useState<string>('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState<UserFormData>(initialFormData)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [securityQuestionsUser, setSecurityQuestionsUser] = useState<{ id: number; name: string } | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      const response = await window.api.users.getAll({ page: 1, limit: 100 })
      if (response?.success && response?.data) {
        setUsers(response.data)
      } else {
        setUsers([])
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
      setUsers([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenDialog = (user?: User) => {
    if (user) {
      setEditingUser(user)
      setFormData({
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        password: '',
        role: user.role,
      })
    } else {
      setEditingUser(null)
      setFormData(initialFormData)
    }
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingUser(null)
    setFormData(initialFormData)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.username.trim() || !formData.fullName.trim() || !formData.email.trim()) {
      alert('Username, full name, and email are required')
      return
    }

    if (!editingUser && !formData.password) {
      alert('Password is required for new users')
      return
    }

    if (formData.password && formData.password.length < 6) {
      alert('Password must be at least 6 characters')
      return
    }

    try {
      const userData: any = {
        username: formData.username.trim(),
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        role: formData.role,
      }

      if (formData.password) {
        userData.password = formData.password
      }

      if (editingUser) {
        const response = await window.api.users.update(editingUser.id, userData)
        if (!response.success) {
          alert(response.message || 'Failed to update user')
          return
        }
      } else {
        userData.password = formData.password
        const response = await window.api.users.create(userData)
        if (!response.success) {
          alert(response.message || 'Failed to create user')
          return
        }
      }

      await fetchUsers()
      handleCloseDialog()
    } catch (error: any) {
      console.error('Failed to save user:', error)
      alert('Failed to save user. Please try again.')
    }
  }

  const handleDelete = async (userId: number, userName: string) => {
    if (!confirm(`Are you sure you want to delete user "${userName}"?`)) {
      return
    }

    try {
      const response = await window.api.users.delete(userId)
      if (response.success) {
        await fetchUsers()
      } else {
        alert(response.message || 'Failed to delete user')
      }
    } catch (error) {
      console.error('Failed to delete user:', error)
      alert('Failed to delete user. Please try again.')
    }
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = filterRole === 'all' || user.role.toLowerCase() === filterRole
    return matchesSearch && matchesRole
  })

  const totalUsers = users.length
  const activeUsers = users.filter((u) => u.isActive).length
  const inactiveUsers = users.filter((u) => !u.isActive).length
  const adminCount = users.filter((u) => u.role.toLowerCase() === 'admin').length
  const managerCount = users.filter((u) => u.role.toLowerCase() === 'manager').length
  const cashierCount = users.filter((u) => u.role.toLowerCase() === 'cashier').length

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
              <UserCog className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold leading-tight">User Management</h1>
              <p className="text-xs text-muted-foreground">Manage system users, roles and access</p>
            </div>
          </div>
          <Button size="sm" onClick={() => handleOpenDialog()}>
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Add User
          </Button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-6 gap-3">
          <Card className="border-border/50">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Total</span>
                <Users className="w-3.5 h-3.5 text-muted-foreground" />
              </div>
              <p className="text-xl font-bold mt-1">{totalUsers}</p>
            </CardContent>
          </Card>
          <Card className="border-green-500/20">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Active</span>
                <UserCheck className="w-3.5 h-3.5 text-green-500" />
              </div>
              <p className="text-xl font-bold text-green-600 dark:text-green-400 mt-1">{activeUsers}</p>
            </CardContent>
          </Card>
          <Card className="border-red-500/20">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Inactive</span>
                <UserX className="w-3.5 h-3.5 text-red-500" />
              </div>
              <p className="text-xl font-bold text-red-600 dark:text-red-400 mt-1">{inactiveUsers}</p>
            </CardContent>
          </Card>
          <Card className="border-red-400/20">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Admins</span>
                <Shield className="w-3.5 h-3.5 text-red-400" />
              </div>
              <p className="text-xl font-bold mt-1">{adminCount}</p>
            </CardContent>
          </Card>
          <Card className="border-blue-400/20">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Managers</span>
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              </div>
              <p className="text-xl font-bold mt-1">{managerCount}</p>
            </CardContent>
          </Card>
          <Card className="border-green-400/20">
            <CardContent className="p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Cashiers</span>
                <User className="w-3.5 h-3.5 text-green-400" />
              </div>
              <p className="text-xl font-bold mt-1">{cashierCount}</p>
            </CardContent>
          </Card>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search by name, username, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 h-8 text-xs"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">Role:</span>
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="h-8 w-[110px] text-xs">
                <SelectValue placeholder="All" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                {USER_ROLES.map((role) => (
                  <SelectItem key={role.value} value={role.value}>{role.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <span className="ml-auto text-xs text-muted-foreground">
            {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Table */}
        <Card className="flex-1 overflow-hidden">
          <CardContent className="p-0">
            {filteredUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <Users className="w-10 h-10 mb-3 opacity-20" />
                <p className="font-medium text-sm">
                  {searchTerm || filterRole !== 'all' ? 'No users match your filters' : 'No users yet'}
                </p>
                <p className="text-xs mt-1">
                  {searchTerm || filterRole !== 'all' ? 'Try adjusting your search' : 'Click "Add User" to get started'}
                </p>
              </div>
            ) : (
              <div className="overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="text-xs w-8">#</TableHead>
                      <TableHead className="text-xs">Full Name</TableHead>
                      <TableHead className="text-xs">Username</TableHead>
                      <TableHead className="text-xs">Email</TableHead>
                      <TableHead className="text-xs w-24">Role</TableHead>
                      <TableHead className="text-xs w-20">Status</TableHead>
                      <TableHead className="text-xs w-24">Last Login</TableHead>
                      <TableHead className="text-xs w-24">Created</TableHead>
                      <TableHead className="text-xs text-right w-20">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((user, idx) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-mono text-[11px] text-muted-foreground py-2">
                          {idx + 1}
                        </TableCell>
                        <TableCell className="py-2">
                          <span className="text-sm font-medium">{user.fullName}</span>
                        </TableCell>
                        <TableCell className="py-2">
                          <span className="text-xs font-mono text-muted-foreground">@{user.username}</span>
                        </TableCell>
                        <TableCell className="py-2">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Mail className="w-3 h-3" />
                            {user.email}
                          </div>
                        </TableCell>
                        <TableCell className="py-2">
                          {getRoleBadge(user.role)}
                        </TableCell>
                        <TableCell className="py-2">
                          <Badge
                            variant="outline"
                            className={`text-[10px] px-1.5 py-0 ${
                              user.isActive
                                ? 'bg-green-500/15 text-green-600 dark:text-green-400 border-green-500/20'
                                : 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/20'
                            }`}
                          >
                            {user.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-2">
                          <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                            <Clock className="w-3 h-3" />
                            {formatRelativeDate(user.lastLogin)}
                          </div>
                        </TableCell>
                        <TableCell className="py-2">
                          <span className="text-[11px] text-muted-foreground">
                            {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
                          </span>
                        </TableCell>
                        <TableCell className="text-right py-2">
                          <div className="flex items-center justify-end gap-0.5">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => setSecurityQuestionsUser({ id: user.id, name: user.fullName })}>
                                  <ShieldQuestion className="h-3.5 w-3.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Security Questions</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => handleOpenDialog(user)}>
                                  <Pencil className="h-3.5 w-3.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Edit</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive hover:text-destructive" onClick={() => handleDelete(user.id, user.fullName)}>
                                  <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Delete</TooltipContent>
                            </Tooltip>
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
              <DialogTitle>{editingUser ? 'Edit User' : 'Create New User'}</DialogTitle>
              <DialogDescription>
                {editingUser ? 'Update user information.' : 'Create a new user account.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username *</Label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      placeholder="Enter username"
                      required
                      disabled={!!editingUser}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role *</Label>
                    <Select value={formData.role} onValueChange={(value) => setFormData({ ...formData, role: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        {USER_ROLES.map((role) => (
                          <SelectItem key={role.value} value={role.value}>
                            {role.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Enter full name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="user@example.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">
                    Password {editingUser ? '(leave blank to keep current)' : '*'}
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder={editingUser ? 'Enter new password' : 'Minimum 6 characters'}
                    required={!editingUser}
                    minLength={6}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleCloseDialog}>
                  Cancel
                </Button>
                <Button type="submit">{editingUser ? 'Update' : 'Create'} User</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Security Questions Dialog */}
        {securityQuestionsUser && (
          <SecurityQuestionsDialog
            open={!!securityQuestionsUser}
            onOpenChange={(open) => { if (!open) setSecurityQuestionsUser(null) }}
            userId={securityQuestionsUser.id}
            userName={securityQuestionsUser.name}
          />
        )}
      </div>
    </TooltipProvider>
  )
}
