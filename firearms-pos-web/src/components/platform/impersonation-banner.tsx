'use client'

import { useSession } from 'next-auth/react'
import { AlertTriangle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { exitImpersonation } from '@/actions/platform/impersonation'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function ImpersonationBanner() {
  const { data: session } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const isImpersonating = (session as any)?.isImpersonating
  const tenantName = (session as any)?.impersonatedTenantName

  if (!isImpersonating) return null

  async function handleExit() {
    setLoading(true)
    await exitImpersonation()
    router.push('/platform/dashboard')
    router.refresh()
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-amber-600 text-black px-4 py-2 flex items-center justify-center gap-3 text-sm font-medium">
      <AlertTriangle className="w-4 h-4" />
      <span>
        Viewing as tenant: <strong>{tenantName}</strong>
      </span>
      <Button
        size="sm"
        variant="outline"
        className="h-7 ml-2 bg-transparent border-black/30 text-black hover:bg-black/10"
        onClick={handleExit}
        disabled={loading}
      >
        <X className="w-3 h-3 mr-1" />
        Exit Impersonation
      </Button>
    </div>
  )
}
