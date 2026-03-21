import { useState } from 'react'
import { Building2, Sparkles, Shield, RotateCcw, Crosshair, Loader2, CheckCircle2, AlertCircle, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface WelcomeStepProps {
  onRestoreComplete?: () => void
}

export function WelcomeStep({ onRestoreComplete }: WelcomeStepProps) {
  const [isRestoring, setIsRestoring] = useState(false)
  const [restoreResult, setRestoreResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleRestore = async () => {
    setIsRestoring(true)
    setRestoreResult(null)

    try {
      const result = await window.api.backup.import()
      if (result.success) {
        setRestoreResult({ success: true, message: 'Database restored successfully. Reloading...' })
        // The main process reloads the window automatically after restore.
        // If it doesn't reload within 3s, navigate manually as fallback.
        setTimeout(() => {
          onRestoreComplete?.()
        }, 3000)
      } else {
        // "Import cancelled" is not an error — user just closed the dialog
        if (result.message === 'Import cancelled') {
          setRestoreResult(null)
        } else {
          setRestoreResult({ success: false, message: result.message || 'Restore failed.' })
        }
      }
    } catch (err) {
      setRestoreResult({
        success: false,
        message: `Restore failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
      })
    } finally {
      setIsRestoring(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Crosshair className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">Welcome to Your POS System</h1>
            <p className="text-sm text-muted-foreground">Complete Point of Sale & Inventory Management</p>
          </div>
        </div>
      </div>

      {/* Restore from Backup — prominent option */}
      <div className="rounded-lg border-2 border-dashed border-primary/25 bg-primary/[0.03] p-5">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <RotateCcw className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-foreground">Restore from Backup</h3>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Have an existing database backup? Restore it to skip the setup process and continue where you left off.
              A safety backup of the current state will be created automatically.
            </p>

            {/* Result message */}
            {restoreResult && (
              <div
                className={`mt-3 flex items-center gap-2 rounded-md px-3 py-2 text-xs ${
                  restoreResult.success
                    ? 'bg-success/10 text-success border border-success/20'
                    : 'bg-destructive/10 text-destructive border border-destructive/20'
                }`}
              >
                {restoreResult.success ? (
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                ) : (
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                )}
                <span>{restoreResult.message}</span>
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={handleRestore}
              disabled={isRestoring || restoreResult?.success}
              className="mt-3 gap-2 text-xs border-primary/30 hover:bg-primary/5"
            >
              {isRestoring ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Restoring...
                </>
              ) : restoreResult?.success ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Restored — Redirecting...
                </>
              ) : (
                <>
                  <Upload className="h-3.5 w-3.5" />
                  Select Backup File
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border/50" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-background px-3 text-[10px] uppercase tracking-widest text-muted-foreground/50">
            Or start fresh
          </span>
        </div>
      </div>

      {/* Feature highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="flex items-start gap-3 rounded-lg border border-border/50 bg-card p-3.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/8">
            <Building2 className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs font-semibold text-foreground">Multi-Branch</h3>
            <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">
              Manage multiple store locations with centralized control
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-lg border border-border/50 bg-card p-3.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/8">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs font-semibold text-foreground">Easy to Use</h3>
            <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">
              Intuitive interface designed for daily operations
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 rounded-lg border border-border/50 bg-card p-3.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/8">
            <Shield className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs font-semibold text-foreground">Secure</h3>
            <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">
              Role-based access control & comprehensive audit logs
            </p>
          </div>
        </div>
      </div>

      {/* Setup info */}
      <div className="rounded-lg bg-muted/30 border border-border/30 px-4 py-3">
        <p className="text-xs text-muted-foreground leading-relaxed">
          This wizard will guide you through configuring your business details, setting up your primary branch,
          and creating an admin account. Click <span className="font-semibold text-foreground">Next</span> to begin the fresh setup.
        </p>
      </div>
    </div>
  )
}
