import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Settings, LogOut, ChevronDown } from 'lucide-react'
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

/**
 * UserDropdownMenu component displays a dropdown menu with user options.
 * Includes Profile, Settings, and Logout options.
 */
export function UserDropdownMenu({ onShowToast }: UserDropdownMenuProps) {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [showProfileDialog, setShowProfileDialog] = useState(false)

  if (!user) return null

  /**
   * Handles user logout
   */
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

  /**
   * Navigates to settings page
   */
  const handleSettings = () => {
    navigate('/settings')
  }

  /**
   * Opens profile dialog
   */
  const handleProfile = () => {
    setShowProfileDialog(true)
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="flex items-center gap-3 px-3 hover:bg-accent"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <span className="text-sm font-medium">{getInitials(user.fullName)}</span>
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium">{user.fullName}</p>
              <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user.fullName}</p>
              <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleProfile} className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleSettings} className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleLogout}
            className="cursor-pointer text-destructive focus:text-destructive"
          >
            <LogOut className="mr-2 h-4 w-4" />
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
