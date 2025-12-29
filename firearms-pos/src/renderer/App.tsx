import React from 'react'
import { AuthProvider } from '@/contexts/auth-context'
import { BranchProvider } from '@/contexts/branch-context'
import { ThemeProvider } from '@/contexts/theme-context'
import { AppRoutes } from './routes'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BranchProvider>
          <AppRoutes />
        </BranchProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
