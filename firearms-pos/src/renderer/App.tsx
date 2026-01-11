import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { AuthProvider } from '@/contexts/auth-context'
import { BranchProvider } from '@/contexts/branch-context'
import { SettingsProvider } from '@/contexts/settings-context'
import { TabsProvider } from '@/contexts/tabs-context'
import { ThemeProvider } from '@/contexts/theme-context'
import { SetupProvider, useSetup } from '@/contexts/setup-context'
import { AppRoutes } from './routes'

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
