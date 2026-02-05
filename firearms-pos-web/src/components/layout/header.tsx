'use client'

import { useState, useEffect } from 'react'
import { Bell, Search, Globe, Check, X } from 'lucide-react'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    setIsOnline(navigator.onLine)

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return isOnline
}

export function Header() {
  const isOnline = useOnlineStatus()

  return (
    <header className="flex items-center gap-3 h-14 px-4 border-b border-border bg-card/50 backdrop-blur-sm">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="h-5" />

      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search products, customers, sales..."
            className="pl-9 h-9 bg-background/50 border-border text-sm"
          />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded font-mono">
            ⌘K
          </kbd>
        </div>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {/* Connection status */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 border border-border">
                <div className="relative">
                  <Globe className="w-4 h-4 text-muted-foreground" />
                  {isOnline ? (
                    <Check className="absolute -bottom-1 -right-1 w-2.5 h-2.5 text-success stroke-[3]" />
                  ) : (
                    <X className="absolute -bottom-1 -right-1 w-2.5 h-2.5 text-destructive stroke-[3]" />
                  )}
                </div>
                <span className={`text-xs font-medium ${isOnline ? 'text-success' : 'text-destructive'}`}>
                  {isOnline ? 'Connected' : 'Disconnected'}
                </span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>{isOnline ? 'Internet connection active' : 'No internet connection'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-4 h-4" />
          <Badge className="absolute -top-1 -right-1 w-4 h-4 p-0 flex items-center justify-center text-[9px] bg-destructive border-background">
            3
          </Badge>
        </Button>
      </div>
    </header>
  )
}
