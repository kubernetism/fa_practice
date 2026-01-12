import React, { useState, useEffect } from 'react'
import { Loader2, User as UserIcon, Mail, Phone, Lock, Eye, EyeOff } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/contexts/auth-context'

interface UserProfileDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onShowToast?: (message: string, type: 'success' | 'error') => void
}

/**
 * UserProfileDialog component for viewing and editing user profile information.
 * Includes tabs for Profile Information and Password Reset.
 */
export function UserProfileDialog({ open, onOpenChange, onShowToast }: UserProfileDialogProps) {
  const { user, refreshUser } = useAuth()

  const showToast = (message: string, type: 'success' | 'error') => {
    if (onShowToast) {
      onShowToast(message, type)
    } else {
      alert(message)
    }
  }

  // Profile form state
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)

  // Password form state
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '')
      setEmail(user.email || '')
      setPhone(user.phone || '')
    }
  }, [user])

  // Reset password fields when dialog closes
  useEffect(() => {
    if (!open) {
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setShowCurrentPassword(false)
      setShowNewPassword(false)
      setShowConfirmPassword(false)
    }
  }, [open])

  /**
   * Handles profile information update
   */
  const handleUpdateProfile = async () => {
    if (!user) return

    // Validation
    if (!fullName.trim()) {
      showToast('Name is required', 'error')
      return
    }

    if (!email.trim()) {
      showToast('Email is required', 'error')
      return
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      showToast('Please enter a valid email address', 'error')
      return
    }

    setIsUpdatingProfile(true)

    try {
      const result = await window.api.users.update(user.userId, {
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim() || null,
      })

      if (result.success) {
        showToast('Profile updated successfully', 'success')
        // Refresh the user context to get updated data
        await refreshUser()
      } else {
        showToast(result.message || 'Failed to update profile', 'error')
      }
    } catch (error) {
      console.error('Update profile error:', error)
      showToast('An unexpected error occurred', 'error')
    } finally {
      setIsUpdatingProfile(false)
    }
  }

  /**
   * Handles password change
   */
  const handleChangePassword = async () => {
    if (!user) return

    // Validation
    if (!currentPassword) {
      showToast('Current password is required', 'error')
      return
    }

    if (!newPassword) {
      showToast('New password is required', 'error')
      return
    }

    if (newPassword.length < 6) {
      showToast('Password must be at least 6 characters', 'error')
      return
    }

    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match', 'error')
      return
    }

    if (currentPassword === newPassword) {
      showToast('New password must be different from current password', 'error')
      return
    }

    setIsChangingPassword(true)

    try {
      const result = await window.api.auth.changePassword(
        user.userId,
        currentPassword,
        newPassword
      )

      if (result.success) {
        showToast('Password changed successfully', 'success')
        // Reset form
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        showToast(result.message || 'Failed to change password', 'error')
      }
    } catch (error) {
      console.error('Change password error:', error)
      showToast('An unexpected error occurred', 'error')
    } finally {
      setIsChangingPassword(false)
    }
  }

  if (!user) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>User Profile</DialogTitle>
          <DialogDescription>
            View and manage your profile information and security settings
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="profile">Profile Information</TabsTrigger>
            <TabsTrigger value="password">Change Password</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4 pt-4">
            <div className="space-y-4">
              {/* Username (read-only) */}
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="flex items-center gap-2">
                  <UserIcon className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="username"
                    value={user.username}
                    disabled
                    className="flex-1 bg-muted"
                  />
                </div>
                <p className="text-xs text-muted-foreground">Username cannot be changed</p>
              </div>

              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="fullName">
                  Full Name <span className="text-destructive">*</span>
                </Label>
                <div className="flex items-center gap-2">
                  <UserIcon className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    className="flex-1"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">
                  Email <span className="text-destructive">*</span>
                </Label>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="flex-1"
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Enter your phone number"
                    className="flex-1"
                  />
                </div>
              </div>

              <Separator />

              {/* Role (read-only) */}
              <div className="space-y-2">
                <Label>Role</Label>
                <div className="rounded-md border bg-muted px-3 py-2">
                  <p className="text-sm capitalize">{user.role}</p>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateProfile} disabled={isUpdatingProfile}>
                {isUpdatingProfile && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </DialogFooter>
          </TabsContent>

          <TabsContent value="password" className="space-y-4 pt-4">
            <div className="space-y-4">
              {/* Current Password */}
              <div className="space-y-2">
                <Label htmlFor="currentPassword">
                  Current Password <span className="text-destructive">*</span>
                </Label>
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  <div className="relative flex-1">
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-2">
                <Label htmlFor="newPassword">
                  New Password <span className="text-destructive">*</span>
                </Label>
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  <div className="relative flex-1">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Password must be at least 6 characters
                </p>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">
                  Confirm New Password <span className="text-destructive">*</span>
                </Label>
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  <div className="relative flex-1">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Password Requirements:</strong>
                </p>
                <ul className="mt-2 list-inside list-disc space-y-1 text-xs text-blue-700 dark:text-blue-300">
                  <li>At least 6 characters long</li>
                  <li>Different from your current password</li>
                  <li>Confirm password must match</li>
                </ul>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleChangePassword} disabled={isChangingPassword}>
                {isChangingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Change Password
              </Button>
            </DialogFooter>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
