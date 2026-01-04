import React from 'react'
import { AuthProvider } from '@/contexts/auth-context'
import { BranchProvider } from '@/contexts/branch-context'
import { SettingsProvider } from '@/contexts/settings-context'
import { TabsProvider } from '@/contexts/tabs-context'
import { ThemeProvider } from '@/contexts/theme-context'
import { AppRoutes } from './routes'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SettingsProvider>
          <BranchProvider>
            <TabsProvider>
              <AppRoutes />
            </TabsProvider>
          </BranchProvider>
        </SettingsProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
