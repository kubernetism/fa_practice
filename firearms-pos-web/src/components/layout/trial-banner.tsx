import { auth } from '@/lib/auth/config'
import { Clock, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export async function TrialBanner() {
  const session = await auth()

  if (!session || session.subscriptionStatus !== 'trial' || !session.trialEndsAt) {
    return null
  }

  const trialEnd = new Date(session.trialEndsAt)
  const now = new Date()
  const diffMs = trialEnd.getTime() - now.getTime()
  const daysRemaining = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)))

  const isUrgent = daysRemaining <= 3
  const isExpired = daysRemaining === 0

  return (
    <div
      className={`flex items-center justify-center gap-3 px-4 py-2 text-sm font-medium ${
        isExpired
          ? 'bg-destructive/90 text-destructive-foreground'
          : isUrgent
            ? 'bg-gradient-to-r from-red-900/80 via-red-800/80 to-red-900/80 text-red-100 border-b border-red-700/50'
            : 'bg-gradient-to-r from-amber-900/60 via-amber-800/60 to-amber-900/60 text-amber-100 border-b border-amber-700/40'
      }`}
    >
      <Clock className="w-4 h-4 shrink-0" />
      <span>
        {isExpired
          ? 'Your free trial has expired. Upgrade now to continue using all features.'
          : `You're on a free trial — ${daysRemaining} day${daysRemaining === 1 ? '' : 's'} remaining.`}
      </span>
      <Link
        href="/billing"
        className={`inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-semibold transition-colors ${
          isExpired || isUrgent
            ? 'bg-white/20 hover:bg-white/30 text-white'
            : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-100'
        }`}
      >
        Upgrade
        <ArrowRight className="w-3 h-3" />
      </Link>
    </div>
  )
}
