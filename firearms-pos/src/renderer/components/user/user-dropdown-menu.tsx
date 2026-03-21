import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Settings, LogOut, ChevronDown, Shield, KeyRound } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-context'
import { getInitials } from '@/lib/utils'
import { UserProfileDialog } from './user-profile-dialog'

interface UserDropdownMenuProps {
  onShowToast?: (message: string, type: 'success' | 'error') => void
}

export function UserDropdownMenu({ onShowToast }: UserDropdownMenuProps) {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [showProfileDialog, setShowProfileDialog] = useState(false)

  if (!user) return null

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login')
    } catch (error) {
      console.error('Logout error:', error)
      if (onShowToast) {
        onShowToast('Failed to logout. Please try again.', 'error')
      }
    }
  }

  const handleSettings = () => {
    navigate('/settings')
  }

  const handleProfile = () => {
    setShowProfileDialog(true)
  }

  const isAdmin = user.role?.toLowerCase() === 'admin'

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex items-center gap-2.5 px-2 h-10 hover:bg-accent/50 rounded-lg transition-colors"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shrink-0 text-xs font-semibold">
              {getInitials(user.fullName)}
            </div>
            <div className="hidden md:block text-left leading-tight">
              <p className="text-xs font-semibold text-foreground">{user.fullName}</p>
              <p className="text-[10px] text-muted-foreground capitalize">{user.role}</p>
            </div>
            <ChevronDown className="h-3 w-3 text-muted-foreground hidden md:block" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-60 p-1.5">
          {/* User Info Header */}
          <div className="px-2.5 py-2.5 mb-1">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground shrink-0 font-semibold text-sm">
                {getInitials(user.fullName)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground truncate">{user.fullName}</p>
                <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  {isAdmin ? (
                    <Shield className="h-2.5 w-2.5 text-primary" />
                  ) : (
                    <KeyRound className="h-2.5 w-2.5 text-muted-foreground" />
                  )}
                  <span className={`text-[10px] font-medium capitalize ${isAdmin ? 'text-primary' : 'text-muted-foreground'}`}>
                    {user.role}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <DropdownMenuSeparator className="mx-1" />

          <DropdownMenuItem
            onClick={handleProfile}
            className="cursor-pointer gap-2.5 px-2.5 py-2 rounded-md text-xs"
          >
            <User className="h-3.5 w-3.5 text-muted-foreground" />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={handleSettings}
            className="cursor-pointer gap-2.5 px-2.5 py-2 rounded-md text-xs"
          >
            <Settings className="h-3.5 w-3.5 text-muted-foreground" />
            <span>Settings</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator className="mx-1" />

          <DropdownMenuItem
            onClick={handleLogout}
            className="cursor-pointer gap-2.5 px-2.5 py-2 rounded-md text-xs text-destructive focus:text-destructive focus:bg-destructive/10"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Logout</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <UserProfileDialog
        open={showProfileDialog}
        onOpenChange={setShowProfileDialog}
        onShowToast={onShowToast}
      />
    </>
  )
}
