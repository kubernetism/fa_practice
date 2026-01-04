import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { BusinessSettings as BusinessSettingsType } from '@shared/types'
import { useAuth } from './auth-context'

interface SettingsContextType {
  globalSettings: BusinessSettingsType | null
  branchSettings: Map<number, BusinessSettingsType>
  currentBranchSettings: BusinessSettingsType | null
  isLoading: boolean
  refreshSettings: () => Promise<void>
  getSettingsForBranch: (branchId: number) => BusinessSettingsType | null
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [globalSettings, setGlobalSettings] = useState<BusinessSettingsType | null>(null)
  const [branchSettings, setBranchSettings] = useState<Map<number, BusinessSettingsType>>(new Map())
  const [currentBranchSettings, setCurrentBranchSettings] = useState<BusinessSettingsType | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshSettings = useCallback(async () => {
    if (!user) {
      setGlobalSettings(null)
      setBranchSettings(new Map())
      setCurrentBranchSettings(null)
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      // Fetch global settings
      const global = await window.api.businessSettings.getGlobal()
      setGlobalSettings(global)

      // Fetch all settings (admin only)
      if (user.role === 'admin') {
        try {
          const allSettings = await window.api.businessSettings.getAll(user.userId)

          const branchMap = new Map<number, BusinessSettingsType>()
          let foundGlobal = false

          for (const setting of allSettings) {
            if (setting.branchId === null) {
              foundGlobal = true
              // Update global settings if we found it in the list
              if (!global) {
                setGlobalSettings(setting)
              }
            } else {
              branchMap.set(setting.branchId, setting)
            }
          }

          setBranchSettings(branchMap)
        } catch {
          // Non-admin users or error case - just use global settings
          console.warn('Could not fetch branch settings')
        }
      }

      // Get settings for current branch
      try {
        // If we have branch settings in cache, use those, otherwise get from API
        const currentBranchId = user.branchId
        if (currentBranchId) {
          const branchSetting = branchSettings.get(currentBranchId) ||
            await window.api.businessSettings.getByBranch(currentBranchId)
          setCurrentBranchSettings(branchSetting || global)
        } else {
          setCurrentBranchSettings(global)
        }
      } catch {
        setCurrentBranchSettings(global)
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setIsLoading(false)
    }
  }, [user])

  const getSettingsForBranch = useCallback(
    (branchId: number): BusinessSettingsType | null => {
      return branchSettings.get(branchId) || globalSettings
    },
    [branchSettings, globalSettings]
  )

  useEffect(() => {
    refreshSettings()
  }, [refreshSettings])

  return (
    <SettingsContext.Provider
      value={{
        globalSettings,
        branchSettings,
        currentBranchSettings,
        isLoading,
        refreshSettings,
        getSettingsForBranch,
      }}
    >
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider')
  }
  return context
}

// Hook for getting effective settings for a specific branch
export function useBranchSettings(branchId: number | null) {
  const { getSettingsForBranch, globalSettings, isLoading } = useSettings()

  if (branchId === null) {
    return { settings: globalSettings, isLoading }
  }

  const settings = getSettingsForBranch(branchId)
  return { settings, isLoading }
}

// Hook for getting effective settings for current branch
export function useCurrentBranchSettings() {
  const { currentBranchSettings, globalSettings, isLoading } = useSettings()
  const settings = currentBranchSettings || globalSettings
  return { settings, isLoading }
}
