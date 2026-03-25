import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'

interface SidebarContextType {
  collapsed: boolean
  toggle: () => void
  setCollapsed: (v: boolean) => void
}

const SidebarContext = createContext<SidebarContextType>({
  collapsed: false,
  toggle: () => {},
  setCollapsed: () => {},
})

const STORAGE_KEY = 'sidebar-collapsed'

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'true'
    } catch {
      return false
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, String(collapsed))
    } catch {
      // ignore
    }
  }, [collapsed])

  const toggle = useCallback(() => setCollapsed((v) => !v), [])

  return (
    <SidebarContext.Provider value={{ collapsed, toggle, setCollapsed }}>
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  return useContext(SidebarContext)
}
