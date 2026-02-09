'use client'

import { useState } from 'react'
import { Loader2, Plus, KeyRound } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'

export default function PlatformSettingsPage() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [changingPassword, setChangingPassword] = useState(false)

  const [newAdminEmail, setNewAdminEmail] = useState('')
  const [newAdminName, setNewAdminName] = useState('')
  const [newAdminPassword, setNewAdminPassword] = useState('')
  const [addingAdmin, setAddingAdmin] = useState(false)

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault()
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }

    setChangingPassword(true)
    try {
      const res = await fetch('/api/platform/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Password changed successfully')
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        toast.error(data.message || 'Failed to change password')
      }
    } catch {
      toast.error('Failed to change password')
    }
    setChangingPassword(false)
  }

  async function handleAddAdmin(e: React.FormEvent) {
    e.preventDefault()
    if (newAdminPassword.length < 8) {
      toast.error('Password must be at least 8 characters')
      return
    }

    setAddingAdmin(true)
    try {
      const res = await fetch('/api/platform/add-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: newAdminEmail,
          fullName: newAdminName,
          password: newAdminPassword,
        }),
      })
      const data = await res.json()
      if (data.success) {
        toast.success('Admin added successfully')
        setNewAdminEmail('')
        setNewAdminName('')
        setNewAdminPassword('')
      } else {
        toast.error(data.message || 'Failed to add admin')
      }
    } catch {
      toast.error('Failed to add admin')
    }
    setAddingAdmin(false)
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-sm">Platform admin account settings</p>
      </div>

      {/* Change Password */}
      <Card className="card-tactical">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-primary" />
            Change Password
          </CardTitle>
          <CardDescription>Update your platform admin password</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current Password</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="bg-input/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="bg-input/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="bg-input/50"
              />
            </div>
            <Button type="submit" disabled={changingPassword} className="platform-glow">
              {changingPassword ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Change Password
            </Button>
          </form>
        </CardContent>
      </Card>

      <Separator />

      {/* Add New Admin */}
      <Card className="card-tactical">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary" />
            Add Platform Admin
          </CardTitle>
          <CardDescription>Create a new platform administrator account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddAdmin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-name">Full Name</Label>
              <Input
                id="admin-name"
                type="text"
                value={newAdminName}
                onChange={(e) => setNewAdminName(e.target.value)}
                required
                className="bg-input/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-email">Email</Label>
              <Input
                id="admin-email"
                type="email"
                value={newAdminEmail}
                onChange={(e) => setNewAdminEmail(e.target.value)}
                required
                className="bg-input/50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-password">Password</Label>
              <Input
                id="admin-password"
                type="password"
                value={newAdminPassword}
                onChange={(e) => setNewAdminPassword(e.target.value)}
                required
                className="bg-input/50"
              />
            </div>
            <Button type="submit" disabled={addingAdmin} className="platform-glow">
              {addingAdmin ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Add Admin
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
