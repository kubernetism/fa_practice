import React from 'react'
import { Navigate } from 'react-router-dom'
import { Sidebar } from './sidebar'
import { Header } from './header'
import { KeepAliveOutlet } from './keep-alive-outlet'
import { useAuth } from '@/contexts/auth-context'
import { SidebarProvider } from '@/contexts/sidebar-context'
import { ScreenRefreshProvider } from '@/contexts/screen-refresh-context'

export function MainLayout() {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return (
    <SidebarProvider>
      <ScreenRefreshProvider>
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <div className="flex flex-1 flex-col overflow-hidden">
            <Header />
            <main className="flex-1 overflow-auto bg-muted/30 p-6">
              <KeepAliveOutlet />
            </main>
          </div>
        </div>
      </ScreenRefreshProvider>
    </SidebarProvider>
  )
}
