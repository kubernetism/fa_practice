'use client'

import { Search } from 'lucide-react'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

export function PlatformHeader() {
  return (
    <header className="flex items-center gap-3 h-14 px-4 border-b border-border bg-card/50 backdrop-blur-sm">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="h-5" />

      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search tenants..."
            className="pl-9 h-9 bg-background/50 border-border text-sm"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <Badge variant="outline" className="border-primary/30 text-primary text-[10px] font-bold tracking-wider">
          PLATFORM ADMIN
        </Badge>
      </div>
    </header>
  )
}
