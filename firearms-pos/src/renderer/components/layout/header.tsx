import React from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, User, Bell, ChevronDown, Building2, Sun, Moon, Monitor } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/contexts/auth-context'
import { useBranch } from '@/contexts/branch-context'
import { useTheme } from '@/contexts/theme-context'
import { getInitials } from '@/lib/utils'

export function Header() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { branches, currentBranch, setCurrentBranch } = useBranch()
  const { theme, setTheme, resolvedTheme } = useTheme()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const handleBranchChange = (branchId: string) => {
    const branch = branches.find((b) => b.id === Number(branchId))
    if (branch) {
      setCurrentBranch(branch)
    }
  }

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-6">
      <div className="flex items-center gap-4">
        {branches.length > 1 && (
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            <Select value={currentBranch?.id?.toString()} onValueChange={handleBranchChange}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select branch" />
              </SelectTrigger>
              <SelectContent>
                {branches.map((branch) => (
                  <SelectItem key={branch.id} value={branch.id.toString()}>
                    {branch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        {branches.length === 1 && currentBranch && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Building2 className="h-4 w-4" />
            <span>{currentBranch.name}</span>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        {/* Theme Toggle */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" title="Toggle theme">
              {resolvedTheme === 'dark' ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setTheme('light')}>
              <Sun className="mr-2 h-4 w-4" />
              Light
              {theme === 'light' && <span className="ml-auto text-xs text-muted-foreground">Active</span>}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme('dark')}>
              <Moon className="mr-2 h-4 w-4" />
              Dark
              {theme === 'dark' && <span className="ml-auto text-xs text-muted-foreground">Active</span>}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme('system')}>
              <Monitor className="mr-2 h-4 w-4" />
              System
              {theme === 'system' && <span className="ml-auto text-xs text-muted-foreground">Active</span>}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-white">
            3
          </span>
        </Button>

        <div className="flex items-center gap-3 border-l pl-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <span className="text-sm font-medium">{user ? getInitials(user.fullName) : 'U'}</span>
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium">{user?.fullName}</p>
            <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
          </div>
          <Button variant="ghost" size="icon" onClick={handleLogout} title="Logout">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}
