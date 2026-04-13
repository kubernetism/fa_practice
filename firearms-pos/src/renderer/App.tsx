import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { AuthProvider } from '@/contexts/auth-context'
import { BranchProvider } from '@/contexts/branch-context'
import { SettingsProvider } from '@/contexts/settings-context'

import { ThemeProvider } from '@/contexts/theme-context'
import { SetupProvider, useSetup } from '@/contexts/setup-context'
import { AppRoutes } from './routes'
import { LicenseLockScreen } from '@/screens/license-lock-screen'

function SetupGuard({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { needsSetup, isCheckingSetup } = useSetup()

  // STRIPPED DOWN - no logging, no render tracking
  useEffect(() => {
    if (isCheckingSetup) return
    if (needsSetup && location.pathname !== '/setup') {
      navigate('/setup', { replace: true })
    }
  }, [needsSetup, isCheckingSetup, location.pathname, navigate])

  // Show loading while checking setup status
  if (isCheckingSetup) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 mx-auto animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

function LicenseGuard({ children }: { children: React.ReactNode }) {
  const [isLocked, setIsLocked] = useState<boolean | null>(null)
  const [machineId, setMachineId] = useState('')

  const checkLockStatus = useCallback(async () => {
    try {
      const result = await window.api.license.checkLockStatus()
      if (result.success && result.data) {
        setIsLocked(result.data.isLocked)
        setMachineId(result.data.machineId || '')
      } else {
        setIsLocked(false)
      }
    } catch (error) {
      console.error('Failed to check lock status:', error)
      setIsLocked(false)
    }
  }, [])

  useEffect(() => {
    checkLockStatus()
  }, [checkLockStatus])

  useEffect(() => {
    // Listen for unlock events from the main process
    const cleanup = window.api.license.onApplicationUnlocked(() => {
      setIsLocked(false)
    })
    return cleanup
  }, [])

  // Still loading
  if (isLocked === null) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 mx-auto animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mt-4 text-muted-foreground">Checking license status...</p>
        </div>
      </div>
    )
  }

  // Application is locked
  if (isLocked) {
    return (
      <LicenseLockScreen
        machineId={machineId}
        onUnlock={() => {
          setIsLocked(false)
          // Force a full page reload to reinitialize everything
          window.location.reload()
        }}
      />
    )
  }

  return <>{children}</>
}

function App() {
  return (
    <ThemeProvider>
      <LicenseGuard>
        <SetupProvider>
          <AuthProvider>
            <SettingsProvider>
              <BranchProvider>
                  <SetupGuard>
                    <AppRoutes />
                  </SetupGuard>
              </BranchProvider>
            </SettingsProvider>
          </AuthProvider>
        </SetupProvider>
      </LicenseGuard>
    </ThemeProvider>
  )
}

export default App
