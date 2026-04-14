import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { formatCurrency } from '@/lib/utils'
import { AlertTriangle, CheckCircle2, RotateCcw } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

interface PurchaseSummary {
  id: number
  purchaseOrderNumber: string
  supplierName?: string | null
  totalAmount: number
  createdAt: string
}

interface Preflight {
  allowed: boolean
  blockers: string[]
}

interface Props {
  purchase: PurchaseSummary | null
  open: boolean
  onClose: () => void
  onConfirmed: (prefillDraft: Record<string, unknown>) => void
}

export function ReverseDialog({ purchase, open, onClose, onConfirmed }: Props) {
  const [preflight, setPreflight] = useState<Preflight | null>(null)
  const [reason, setReason] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const runPreflight = useCallback(async (purchaseId: number) => {
    const api = (
      window as unknown as {
        api: { purchases: { checkReversible: (id: number) => Promise<Preflight> } }
      }
    ).api
    const result = await api.purchases.checkReversible(purchaseId)
    setPreflight(result)
  }, [])

  useEffect(() => {
    if (!open || !purchase) return
    setPreflight(null)
    setReason('')
    setError(null)
    setSubmitting(false)
    runPreflight(purchase.id)
  }, [open, purchase, runPreflight])

  const trimmedReason = reason.trim()
  const canConfirm = preflight?.allowed === true && trimmedReason.length >= 10 && !submitting

  const handleConfirm = async () => {
    if (!purchase) return
    setSubmitting(true)
    setError(null)
    const api = (
      window as unknown as {
        api: {
          purchases: {
            reverseAndReenter: (
              id: number,
              reason: string,
            ) => Promise<{
              success: boolean
              error?: string
              prefillDraft?: Record<string, unknown>
            }>
          }
        }
      }
    ).api
    const result = await api.purchases.reverseAndReenter(purchase.id, trimmedReason)
    setSubmitting(false)
    if (!result.success) {
      setError(result.error ?? 'Reversal failed.')
      return
    }
    if (result.prefillDraft) {
      onConfirmed(result.prefillDraft)
    } else {
      onClose()
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RotateCcw className="h-4 w-4" /> Reverse Purchase Order
          </DialogTitle>
        </DialogHeader>

        {purchase && (
          <div className="space-y-4">
            <div className="rounded border p-3 text-sm bg-muted/30">
              <div className="font-mono font-medium">{purchase.purchaseOrderNumber}</div>
              <div className="text-muted-foreground">
                {purchase.supplierName ?? 'Supplier'} — {formatCurrency(purchase.totalAmount)}
              </div>
            </div>

            {preflight === null ? (
              <p className="text-xs text-muted-foreground">Checking reversibility…</p>
            ) : preflight.allowed ? (
              <div className="flex items-start gap-2 rounded bg-green-500/10 p-2 text-xs text-green-700 dark:text-green-400">
                <CheckCircle2 className="h-4 w-4 mt-0.5" />
                Ready to reverse. Stock, cost layers, and linked payable/expense will be cascaded.
              </div>
            ) : (
              <div className="space-y-1 rounded bg-destructive/10 p-2 text-xs text-destructive">
                <div className="flex items-center gap-1 font-medium">
                  <AlertTriangle className="h-3 w-3" /> Cannot reverse:
                </div>
                <ul className="ml-5 list-disc">
                  {preflight.blockers.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="space-y-1">
              <label htmlFor="reverse-reason" className="text-xs font-medium">
                Reason (required, min 10 characters)
              </label>
              <Textarea
                id="reverse-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Why is this being reversed? Logged permanently."
                rows={3}
                disabled={!preflight?.allowed || submitting}
              />
              <p className="text-[10px] text-muted-foreground">
                {trimmedReason.length}/10 characters minimum
              </p>
            </div>

            <div className="flex items-start gap-2 rounded border border-amber-500/30 bg-amber-500/5 p-2 text-[11px] text-amber-700 dark:text-amber-400">
              <AlertTriangle className="h-3 w-3 mt-0.5" />
              This reverses stock quantities, cost layers, and any linked payable / expense. The
              reversal and reason are permanent.
            </div>

            {error && <div className="text-xs text-destructive">{error}</div>}
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleConfirm} disabled={!canConfirm}>
            {submitting ? 'Reversing…' : 'Reverse and open re-entry form'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
