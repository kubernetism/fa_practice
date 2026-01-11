import React, { useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { AuthProvider } from '@/contexts/auth-context'
import { BranchProvider } from '@/contexts/branch-context'
import { SettingsProvider } from '@/contexts/settings-context'
import { TabsProvider } from '@/contexts/tabs-context'
import { ThemeProvider } from '@/contexts/theme-context'
import { SetupProvider, useSetup } from '@/contexts/setup-context'
import { AppRoutes } from './routes'

// Debug logging helper
const DEBUG = true
const log = (message: string, ...args: unknown[]) => {
  if (DEBUG) {
    console.log(`[SetupGuard] ${message}`, ...args)
  }
}

function SetupGuard({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()
  const location = useLocation()
  const { needsSetup, isCheckingSetup } = useSetup()

  // Track render count
  const renderCount = useRef(0)
  renderCount.current += 1

  // Log renders
  useEffect(() => {
    log(`Rendered - count: ${renderCount.current}, path: ${location.pathname}, needsSetup: ${needsSetup}, isChecking: ${isCheckingSetup}`)
  })

  // Warn for excessive renders
  useEffect(() => {
    if (renderCount.current > 50) {
      console.error('[SetupGuard] WARNING: Excessive renders!', renderCount.current)
    }
  })

  useEffect(() => {
    // Don't redirect while still checking setup status
    if (isCheckingSetup) {
      log('Still checking setup status, skipping redirect')
      return
    }

    // If setup is needed and we're not already on setup page, redirect to setup
    if (needsSetup && location.pathname !== '/setup') {
      log(`Redirecting to /setup from ${location.pathname}`)
      navigate('/setup', { replace: true })
    } else {
      log(`No redirect needed - needsSetup: ${needsSetup}, path: ${location.pathname}`)
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

function App() {
  return (
    <ThemeProvider>
      <SetupProvider>
        <AuthProvider>
          <SettingsProvider>
            <BranchProvider>
              <TabsProvider>
                <SetupGuard>
                  <AppRoutes />
                </SetupGuard>
              </TabsProvider>
            </BranchProvider>
          </SettingsProvider>
        </AuthProvider>
      </SetupProvider>
    </ThemeProvider>
  )
}

export default App
