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

export function BranchProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth()
  const [branches, setBranches] = useState<Branch[]>([])
  const [currentBranch, setCurrentBranchState] = useState<Branch | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshBranches = useCallback(async () => {
    if (!isAuthenticated) {
      setBranches([])
      setCurrentBranchState(null)
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      const result = await window.api.branches.getActive()
      if (result.success && result.data) {
        setBranches(result.data)

        // Single Branch Mode: Always use main branch or first available branch
        // Priority order:
        // 1. Main branch (isMain = true)
        // 2. First available branch

        let selectedBranch: Branch | null = null

        if (result.data.length > 0) {
          // Always select main branch or first branch
          const mainBranch = result.data.find((b: Branch) => b.isMain)
          selectedBranch = mainBranch || result.data[0]
        }

        if (selectedBranch) {
          setCurrentBranchState(selectedBranch)
        }
      }
    } catch (error) {
      console.error('Failed to fetch branches:', error)
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated])

  useEffect(() => {
    refreshBranches()
  }, [refreshBranches])

  // setCurrentBranch is kept for compatibility but doesn't persist or change selection
  // In single branch mode, this is essentially a no-op that just updates state
  const setCurrentBranch = useCallback((branch: Branch) => {
    setCurrentBranchState(branch)
    // Note: No localStorage persistence in single branch mode
    // Note: No custom event dispatch as branch switching is not allowed
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
