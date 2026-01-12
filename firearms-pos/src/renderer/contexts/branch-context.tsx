import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { Branch } from '@shared/types'
import { useAuth } from './auth-context'

interface BranchContextType {
  branches: Branch[]
  currentBranch: Branch | null
  isLoading: boolean
  setCurrentBranch: (branch: Branch) => void
  refreshBranches: () => Promise<void>
}

const BranchContext = createContext<BranchContextType | undefined>(undefined)

const STORAGE_KEY = 'selected-branch-id'

export function BranchProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth()
  const [branches, setBranches] = useState<Branch[]>([])
  const [currentBranch, setCurrentBranchState] = useState<Branch | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshBranches = useCallback(async () => {
    if (!isAuthenticated) {
      setBranches([])
      setCurrentBranchState(null)
      localStorage.removeItem(STORAGE_KEY)
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      const result = await window.api.branches.getActive()
      if (result.success && result.data) {
        setBranches(result.data)

        // Priority order for setting current branch:
        // 1. Previously selected branch from localStorage
        // 2. User's assigned branch
        // 3. Main branch
        // 4. First available branch

        let selectedBranch: Branch | null = null

        // Check localStorage first
        const storedBranchId = localStorage.getItem(STORAGE_KEY)
        if (storedBranchId) {
          selectedBranch = result.data.find((b: Branch) => b.id === parseInt(storedBranchId))
        }

        // Fall back to user's branch if no stored selection or stored branch not found
        if (!selectedBranch && user?.branchId) {
          selectedBranch = result.data.find((b: Branch) => b.id === user.branchId)
        }

        // Fall back to main branch or first branch
        if (!selectedBranch && result.data.length > 0) {
          const mainBranch = result.data.find((b: Branch) => b.isMain)
          selectedBranch = mainBranch || result.data[0]
        }

        if (selectedBranch) {
          setCurrentBranchState(selectedBranch)
          localStorage.setItem(STORAGE_KEY, selectedBranch.id.toString())
        }
      }
    } catch (error) {
      console.error('Failed to fetch branches:', error)
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated, user?.branchId])

  useEffect(() => {
    refreshBranches()
  }, [refreshBranches])

  const setCurrentBranch = useCallback((branch: Branch) => {
    setCurrentBranchState(branch)
    // Persist to localStorage
    localStorage.setItem(STORAGE_KEY, branch.id.toString())

    // Dispatch custom event to notify other components of branch change
    window.dispatchEvent(new CustomEvent('branch-changed', { detail: { branchId: branch.id } }))
  }, [])

  return (
    <BranchContext.Provider
      value={{
        branches,
        currentBranch,
        isLoading,
        setCurrentBranch,
        refreshBranches,
      }}
    >
      {children}
    </BranchContext.Provider>
  )
}

export function useBranch() {
  const context = useContext(BranchContext)
  if (context === undefined) {
    throw new Error('useBranch must be used within a BranchProvider')
  }
  return context
}
