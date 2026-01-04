import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import type { SalesTab, SalesTabWithItems, SalesTabItem, Sale, TabFilters, TabCheckoutData } from '@shared/types'

interface TabsContextType {
  tabs: SalesTabWithItems[]
  activeTab: SalesTabWithItems | null
  isLoading: boolean
  fetchTabs: (filters?: TabFilters) => Promise<void>
  createTab: (branchId: number, customerId?: number, notes?: string) => Promise<SalesTab | undefined>
  updateTab: (tabId: number, data: Partial<SalesTab>) => Promise<boolean>
  deleteTab: (tabId: number) => Promise<boolean>
  setActiveTab: (tab: SalesTabWithItems | null) => void
  addToTab: (tabId: number, productId: number, quantity?: number, serialNumber?: string) => Promise<boolean>
  updateTabItem: (tabId: number, itemId: number, quantity: number) => Promise<boolean>
  removeFromTab: (tabId: number, itemId: number) => Promise<boolean>
  clearTabItems: (tabId: number) => Promise<boolean>
  checkoutTab: (tabId: number, checkoutData: TabCheckoutData) => Promise<{ sale?: Sale; invoiceNumber?: string } | undefined>
  refreshActiveTab: () => Promise<void>
}

const TabsContext = createContext<TabsContextType | undefined>(undefined)

export function TabsProvider({ children }: { children: React.ReactNode }) {
  const [tabs, setTabs] = useState<SalesTabWithItems[]>([])
  const [activeTab, setActiveTab] = useState<SalesTabWithItems | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const fetchTabs = useCallback(async (filters?: TabFilters) => {
    setIsLoading(true)
    try {
      const result = await window.api.salesTabs.getAll({
        page: 1,
        limit: 100,
        ...filters,
      })
      if (result.success && result.data) {
        setTabs(result.data)
      }
    } catch (error) {
      console.error('Failed to fetch tabs:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const createTab = useCallback(async (branchId: number, customerId?: number, notes?: string) => {
    try {
      const result = await window.api.salesTabs.create({
        branchId,
        customerId,
        notes,
      })
      if (result.success && result.data) {
        await fetchTabs()
        return result.data
      }
      return undefined
    } catch (error) {
      console.error('Failed to create tab:', error)
      return undefined
    }
  }, [fetchTabs])

  const updateTab = useCallback(async (tabId: number, data: Partial<SalesTab>) => {
    try {
      const result = await window.api.salesTabs.update(tabId, data)
      if (result.success) {
        await fetchTabs()
        return true
      }
      return false
    } catch (error) {
      console.error('Failed to update tab:', error)
      return false
    }
  }, [fetchTabs])

  const deleteTab = useCallback(async (tabId: number) => {
    try {
      const result = await window.api.salesTabs.delete(tabId)
      if (result.success) {
        await fetchTabs()
        if (activeTab?.id === tabId) {
          setActiveTab(null)
        }
        return true
      }
      return false
    } catch (error) {
      console.error('Failed to delete tab:', error)
      return false
    }
  }, [fetchTabs, activeTab])

  const addToTab = useCallback(async (tabId: number, productId: number, quantity = 1, serialNumber?: string) => {
    try {
      const result = await window.api.salesTabs.addItem(tabId, {
        productId,
        quantity,
        serialNumber,
      })
      if (result.success) {
        if (activeTab?.id === tabId) {
          await refreshActiveTab()
        }
        return true
      }
      return false
    } catch (error) {
      console.error('Failed to add item to tab:', error)
      return false
    }
  }, [activeTab])

  const updateTabItem = useCallback(async (tabId: number, itemId: number, quantity: number) => {
    try {
      const result = await window.api.salesTabs.updateItem(tabId, itemId, { quantity })
      if (result.success) {
        if (activeTab?.id === tabId) {
          await refreshActiveTab()
        }
        return true
      }
      return false
    } catch (error) {
      console.error('Failed to update tab item:', error)
      return false
    }
  }, [activeTab])

  const removeFromTab = useCallback(async (tabId: number, itemId: number) => {
    try {
      const result = await window.api.salesTabs.removeItem(tabId, itemId)
      if (result.success) {
        if (activeTab?.id === tabId) {
          await refreshActiveTab()
        }
        return true
      }
      return false
    } catch (error) {
      console.error('Failed to remove item from tab:', error)
      return false
    }
  }, [activeTab])

  const clearTabItems = useCallback(async (tabId: number) => {
    try {
      const result = await window.api.salesTabs.clearItems(tabId)
      if (result.success) {
        if (activeTab?.id === tabId) {
          await refreshActiveTab()
        }
        return true
      }
      return false
    } catch (error) {
      console.error('Failed to clear tab items:', error)
      return false
    }
  }, [activeTab])

  const checkoutTab = useCallback(async (tabId: number, checkoutData: TabCheckoutData) => {
    try {
      const result = await window.api.salesTabs.checkout(tabId, checkoutData)
      if (result.success && result.data) {
        await fetchTabs()
        if (activeTab?.id === tabId) {
          setActiveTab(null)
        }
        return result.data
      }
      return undefined
    } catch (error) {
      console.error('Failed to checkout tab:', error)
      return undefined
    }
  }, [fetchTabs, activeTab])

  const refreshActiveTab = useCallback(async () => {
    if (activeTab) {
      try {
        const result = await window.api.salesTabs.getById(activeTab.id)
        if (result.success && result.data) {
          setActiveTab(result.data as SalesTabWithItems)
        }
      } catch (error) {
        console.error('Failed to refresh active tab:', error)
      }
    }
  }, [activeTab])

  // Auto-refresh tabs every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!activeTab) {
        fetchTabs()
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [fetchTabs, activeTab])

  return (
    <TabsContext.Provider
      value={{
        tabs,
        activeTab,
        isLoading,
        fetchTabs,
        createTab,
        updateTab,
        deleteTab,
        setActiveTab,
        addToTab,
        updateTabItem,
        removeFromTab,
        clearTabItems,
        checkoutTab,
        refreshActiveTab,
      }}
    >
      {children}
    </TabsContext.Provider>
  )
}

export function useTabs() {
  const context = useContext(TabsContext)
  if (context === undefined) {
    throw new Error('useTabs must be used within a TabsProvider')
  }
  return context
}
