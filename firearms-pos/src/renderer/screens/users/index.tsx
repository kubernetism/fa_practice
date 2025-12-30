import React, { useState, useEffect } from 'react'
import { Plus, Search, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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

export default function UsersScreen() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [formData, setFormData] = useState<UserFormData>(initialFormData)
  const [editingUser, setEditingUser] = useState<User | null>(null)

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

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-lg">Loading users...</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">User Management</h1>
        <p className="text-muted-foreground">Manage system users and assign roles</p>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      <div className="border rounded-lg p-6 bg-card">
        {users.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No users yet. Click "Add User" to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Found {users.length} user(s)
            </p>
            <div className="space-y-2">
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 border rounded">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{user.fullName}</p>
                      <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {user.role}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      @{user.username} • {user.email}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Status: {user.isActive ? 'Active' : 'Inactive'} •
                      Last login: {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" onClick={() => handleOpenDialog(user)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(user.id, user.fullName)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
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
            <DialogTitle>{editingUser ? 'Edit User' : 'Create New User'}</DialogTitle>
            <DialogDescription>
              {editingUser ? 'Update user information.' : 'Create a new user account.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
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
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button type="submit">{editingUser ? 'Update' : 'Create'} User</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
