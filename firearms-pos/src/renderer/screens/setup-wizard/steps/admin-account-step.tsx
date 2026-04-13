import { useSetup } from '@/contexts/setup-context'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { UserPlus } from 'lucide-react'

export function AdminAccountStep() {
  const { adminAccountInfo, updateAdminAccountInfo } = useSetup()

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <UserPlus className="h-4.5 w-4.5 text-primary" />
        </div>
        <div>
          <h2 className="text-lg font-bold tracking-tight">Create Admin Account</h2>
          <p className="text-xs text-muted-foreground">Set up your administrator credentials</p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-sm">
        This will be the main administrator account. You can add more users after setup is complete.
      </div>

      {/* Form */}
      <div className="grid gap-4">
        {/* Full Name + Username */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Full Name */}
          <div className="grid gap-2">
            <Label htmlFor="fullName">
              Full Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="fullName"
              placeholder="Enter your full name"
              value={adminAccountInfo.fullName}
              onChange={(e) => updateAdminAccountInfo({ fullName: e.target.value })}
              required
            />
          </div>

          {/* Username */}
          <div className="grid gap-2">
            <Label htmlFor="username">
              Username <span className="text-destructive">*</span>
            </Label>
            <Input
              id="username"
              placeholder="admin"
              value={adminAccountInfo.username}
              onChange={(e) => updateAdminAccountInfo({ username: e.target.value })}
              autoComplete="off"
              required
            />
          </div>
        </div>

        {/* Email + Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Email */}
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@yourstore.com"
              value={adminAccountInfo.email}
              onChange={(e) => updateAdminAccountInfo({ email: e.target.value })}
            />
          </div>

          {/* Phone */}
          <div className="grid gap-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              placeholder="Phone number"
              value={adminAccountInfo.phone}
              onChange={(e) => updateAdminAccountInfo({ phone: e.target.value })}
            />
          </div>
        </div>

        {/* Password + Confirm Password */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Password */}
          <div className="grid gap-2">
            <Label htmlFor="password">
              Password <span className="text-destructive">*</span>
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="Minimum 6 characters"
              value={adminAccountInfo.password}
              onChange={(e) => updateAdminAccountInfo({ password: e.target.value })}
              required
            />
          </div>

          {/* Confirm Password */}
          <div className="grid gap-2">
            <Label htmlFor="confirmPassword">
              Confirm Password <span className="text-destructive">*</span>
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Re-enter password"
              value={adminAccountInfo.confirmPassword}
              onChange={(e) => updateAdminAccountInfo({ confirmPassword: e.target.value })}
              required
            />
          </div>
        </div>

        {/* Password mismatch validation */}
        {adminAccountInfo.password.length > 0 &&
          adminAccountInfo.confirmPassword.length > 0 &&
          adminAccountInfo.password !== adminAccountInfo.confirmPassword && (
            <p className="text-sm text-destructive">Passwords do not match</p>
          )}
      </div>
    </div>
  )
}
