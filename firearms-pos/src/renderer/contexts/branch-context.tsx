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

        // Set current branch based on user's branch or first available
        if (user?.branchId) {
          const userBranch = result.data.find((b: Branch) => b.id === user.branchId)
          if (userBranch) {
            setCurrentBranchState(userBranch)
          } else if (result.data.length > 0) {
            setCurrentBranchState(result.data[0])
          }
        } else if (result.data.length > 0) {
          // Default to main branch or first branch
          const mainBranch = result.data.find((b: Branch) => b.isMain)
          setCurrentBranchState(mainBranch || result.data[0])
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
