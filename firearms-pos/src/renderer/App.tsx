import React from 'react'
import { AuthProvider } from '@/contexts/auth-context'
import { BranchProvider } from '@/contexts/branch-context'
import { AppRoutes } from './routes'

function App() {
  return (
    <AuthProvider>
      <BranchProvider>
        <AppRoutes />
      </BranchProvider>
    </AuthProvider>
  )
}

export default App
