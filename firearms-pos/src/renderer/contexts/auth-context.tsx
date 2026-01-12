import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import type { SessionUser } from '@shared/types'

interface AuthContextType {
  user: SessionUser | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (username: string, password: string) => Promise<{ success: boolean; message?: string }>
  logout: () => Promise<void>
  checkPermission: (permission: string) => boolean
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check for existing session on mount
    const checkSession = async () => {
      try {
        const currentUser = await window.api.auth.getCurrentUser()
        if (currentUser) {
          setUser(currentUser)
        }
      } catch (error) {
        console.error('Failed to check session:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkSession()
  }, [])

  const login = useCallback(async (username: string, password: string) => {
    try {
      const result = await window.api.auth.login(username, password)
      if (result.success && result.user) {
        setUser(result.user)
        return { success: true }
      }
      return { success: false, message: result.message || 'Login failed' }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, message: 'An unexpected error occurred' }
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      await window.api.auth.logout()
      setUser(null)
    } catch (error) {
      console.error('Logout error:', error)
    }
  }, [])

  const checkPermission = useCallback(
    (permission: string) => {
      if (!user) return false
      if (user.role === 'admin') return true
      if (user.permissions.includes('*')) return true
      return user.permissions.includes(permission)
    },
    [user]
  )

  const refreshUser = useCallback(async () => {
    try {
      const currentUser = await window.api.auth.getCurrentUser()
      if (currentUser) {
        setUser(currentUser)
      }
    } catch (error) {
      console.error('Failed to refresh user:', error)
    }
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        checkPermission,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
