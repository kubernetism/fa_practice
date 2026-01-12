import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2 } from 'lucide-react'
import { TodosPanel } from '@/components/todos/todos-panel'
import { MessagesPanel } from '@/components/messages/messages-panel'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAuth } from '@/contexts/auth-context'
import { useBranch } from '@/contexts/branch-context'
import { UserDropdownMenu } from '@/components/user/user-dropdown-menu'

export function Header() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { branches, currentBranch, setCurrentBranch } = useBranch()
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
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
        {/* Messages */}
        <MessagesPanel />

        <TodosPanel />

        <div className="border-l pl-4">
          <UserDropdownMenu onShowToast={showToast} />
        </div>
      </div>

      {/* Toast notification */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-top-2">
          <div
            className={`rounded-lg border px-4 py-3 shadow-lg ${
              toast.type === 'success'
                ? 'border-green-200 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-950 dark:text-green-100'
                : 'border-red-200 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100'
            }`}
          >
            <p className="text-sm font-medium">{toast.message}</p>
          </div>
        </div>
      )}
    </header>
  )
}
