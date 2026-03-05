import React, { useEffect, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { RotateCcw, Clock, CheckCircle2, XCircle, AlertTriangle, Ban } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ReversalStatusBadgeProps {
  entityType: string
  entityId: number
  className?: string
}

type ReversalStatus = 'pending' | 'approved' | 'completed' | 'failed' | 'rejected'

const STATUS_CONFIG: Record<
  ReversalStatus,
  { label: string; icon: React.ElementType; className: string }
> = {
  pending: {
    label: 'Reversal Pending',
    icon: Clock,
    className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  },
  approved: {
    label: 'Reversal Approved',
    icon: RotateCcw,
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  },
  completed: {
    label: 'Reversed',
    icon: CheckCircle2,
    className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  },
  failed: {
    label: 'Reversal Failed',
    icon: AlertTriangle,
    className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  },
  rejected: {
    label: 'Reversal Rejected',
    icon: Ban,
    className: 'bg-gray-100 text-gray-600 dark:bg-gray-800/30 dark:text-gray-400',
  },
}

/**
 * Checks if an entity has a reversal request and shows the appropriate status badge.
 * Renders nothing if no reversal request exists.
 */
export function ReversalStatusBadge({ entityType, entityId, className }: ReversalStatusBadgeProps) {
  const [status, setStatus] = useState<ReversalStatus | null>(null)

  useEffect(() => {
    let cancelled = false

    async function check() {
      try {
        const result = await window.api.reversals.check({ entityType, entityId })
        if (!cancelled && result?.success && result.data) {
          setStatus(result.data.status as ReversalStatus)
        }
      } catch {
        // Silently ignore — badge simply won't render
      }
    }

    check()
    return () => {
      cancelled = true
    }
  }, [entityType, entityId])

  if (!status) return null

  const config = STATUS_CONFIG[status]
  if (!config) return null

  const Icon = config.icon

  return (
    <Badge variant="outline" className={cn('gap-1 border-0 font-medium', config.className, className)}>
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  )
}
