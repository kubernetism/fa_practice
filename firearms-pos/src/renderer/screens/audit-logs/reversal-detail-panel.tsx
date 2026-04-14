import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import { Calendar, Info, MapPin, Package, RotateCcw, User } from 'lucide-react'

interface AuditLogEntry {
  auditLog: {
    id: number
    userId: number | null
    branchId: number | null
    action: string
    entityType: string
    entityId: number | null
    oldValues: Record<string, unknown> | null
    newValues: Record<string, unknown> | null
    description: string | null
    createdAt: string
  }
  user: {
    id: number
    fullName: string | null
    username: string
    role: string | null
  } | null
}

interface Props {
  log: AuditLogEntry | null
  open: boolean
  onClose: () => void
}

interface OldPurchaseSnapshot {
  purchase?: {
    purchaseOrderNumber?: string
    supplierId?: number
    branchId?: number
    totalAmount?: number
    paymentMethod?: string
    createdAt?: string
  }
  items?: Array<{
    productId: number
    quantity: number
    unitCost: number
    totalCost: number
  }>
  payable?: { id: number; totalAmount: number; remainingAmount: number; status: string } | null
  expense?: { id: number; amount: number } | null
  payablePayments?: Array<{ id: number; amount: number }>
}

interface NewReversalValues {
  status?: string
  reason?: string
  reversalDetails?: Record<string, unknown>
}

export function ReversalDetailPanel({ log, open, onClose }: Props) {
  if (!log) return null

  const old = (log.auditLog.oldValues ?? {}) as OldPurchaseSnapshot
  const next = (log.auditLog.newValues ?? {}) as NewReversalValues
  const po = old.purchase
  const reason = next.reason ?? log.auditLog.description ?? ''
  const reversalDetails = next.reversalDetails ?? {}

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <RotateCcw className="h-4 w-4 text-destructive" />
            Purchase Reversal
            {po?.purchaseOrderNumber && (
              <span className="font-mono text-sm text-muted-foreground">
                {po.purchaseOrderNumber}
              </span>
            )}
          </DialogTitle>
          <DialogDescription>Immutable record of the reversal cascade.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Field icon={<User className="h-3.5 w-3.5" />} label="Reversed by">
              {log.user?.fullName || log.user?.username || '—'}
              <span className="ml-1 text-[10px] text-muted-foreground capitalize">
                ({log.user?.role ?? 'system'})
              </span>
            </Field>
            <Field icon={<Calendar className="h-3.5 w-3.5" />} label="When">
              {formatDateTime(log.auditLog.createdAt)}
            </Field>
            <Field icon={<MapPin className="h-3.5 w-3.5" />} label="Branch">
              #{log.auditLog.branchId ?? '—'}
            </Field>
            <Field icon={<Package className="h-3.5 w-3.5" />} label="Total reversed">
              {po?.totalAmount != null ? formatCurrency(po.totalAmount) : '—'}
            </Field>
          </div>

          <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1 flex items-center gap-1">
              <Info className="h-3 w-3" /> Reason
            </p>
            <p className="text-sm leading-relaxed">{reason || '—'}</p>
          </div>

          {old.items && old.items.length > 0 && (
            <Section title={`Items reversed (${old.items.length})`}>
              <div className="divide-y divide-border/50">
                {old.items.map((it) => (
                  <div
                    key={`${it.productId}-${it.quantity}-${it.unitCost}`}
                    className="flex items-center justify-between px-3 py-1.5 text-xs"
                  >
                    <span className="font-mono text-muted-foreground">Product #{it.productId}</span>
                    <span>
                      {it.quantity} × {formatCurrency(it.unitCost)}
                    </span>
                    <span className="font-medium">{formatCurrency(it.totalCost)}</span>
                  </div>
                ))}
              </div>
            </Section>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Section title="Linked payable">
              {old.payable ? (
                <div className="px-3 py-2 text-xs space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-muted-foreground">#{old.payable.id}</span>
                    <Badge variant="destructive" className="text-[10px]">
                      reversed
                    </Badge>
                  </div>
                  <div className="text-muted-foreground">
                    {formatCurrency(old.payable.totalAmount)} — was{' '}
                    <span className="capitalize">{old.payable.status}</span>
                  </div>
                </div>
              ) : (
                <p className="px-3 py-2 text-xs text-muted-foreground">None</p>
              )}
            </Section>

            <Section title="Linked expense">
              {old.expense ? (
                <div className="px-3 py-2 text-xs">
                  <span className="font-mono text-muted-foreground">#{old.expense.id}</span>
                  <span className="ml-2">{formatCurrency(old.expense.amount)}</span>
                  <Badge variant="destructive" className="text-[10px] ml-2">
                    reversed
                  </Badge>
                </div>
              ) : (
                <p className="px-3 py-2 text-xs text-muted-foreground">None</p>
              )}
            </Section>
          </div>

          {Object.keys(reversalDetails).length > 0 && (
            <Section title="Cascade details">
              <pre className="p-3 bg-muted/30 text-[11px] overflow-x-auto leading-relaxed max-h-48">
                {JSON.stringify(reversalDetails, null, 2)}
              </pre>
            </Section>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

function Field({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="rounded-md bg-muted/30 border border-border px-3 py-2">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-1 flex items-center gap-1">
        {icon}
        {label}
      </p>
      <p className="text-xs">{children}</p>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-md border border-border overflow-hidden">
      <div className="px-3 py-1.5 bg-muted/40 border-b border-border">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
          {title}
        </p>
      </div>
      {children}
    </div>
  )
}
