import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { Shield, Copy, Key, Power, RefreshCw, Terminal, AlertTriangle, CheckCircle2, Clock, XCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { ActivateLicenseDialog } from '@/components/license/activate-license-dialog'
import { LicenseHistory } from '@/components/license/license-history'

// Static — defined at module level to avoid recreating on every render
const DEACTIVATION_CONSEQUENCES = [
  'Remove your full license from this machine',
  'Revert the application to trial mode (30 days)',
  'Require you to generate a new license key to continue',
] as const

type LicenseStatus =
  | 'TRIAL_ACTIVE'
  | 'TRIAL_EXPIRED'
  | 'LICENSE_ACTIVE'
  | 'LICENSE_EXPIRED'
  | 'NO_MACHINE_ID'

interface LicenseInfo {
  status: LicenseStatus
  isValid: boolean
  isActivated: boolean
  isTrial: boolean
  machineId: string
  expiresAt: string | null
  daysRemaining: number
  message: string
  installationDate: string | null
  trialStartDate: string | null
  trialEndDate: string | null
  licenseStartDate: string | null
  licenseEndDate: string | null
}

interface LicenseHistoryItem {
  id: number
  type: string
  status: string
  activatedBy: string
  activatedAt: string
  expiresAt: string
}

export function LicenseSettingsScreen() {
  const { user } = useAuth()
  const [licenseInfo, setLicenseInfo] = useState<LicenseInfo | null>(null)
  const [licenseHistory, setLicenseHistory] = useState<LicenseHistoryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isActivating, setIsActivating] = useState(false)
  const [isDeactivating, setIsDeactivating] = useState(false)
  const [showActivateDialog, setShowActivateDialog] = useState(false)
  const [machineId, setMachineId] = useState<string>('')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [deactivateConfirmOpen, setDeactivateConfirmOpen] = useState(false)
  const [deactivateClickCount, setDeactivateClickCount] = useState(0)
  const [showFinalWarning, setShowFinalWarning] = useState(false)

  // Defined before fetchLicenseInfo so it is in scope when the callback runs
  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }, [])

  const fetchLicenseInfo = useCallback(async () => {
    try {
      setIsLoading(true)
      const [appInfoResult, historyResult, requestResult] = await Promise.all([
        window.api.license.getApplicationInfo(),
        window.api.license.getHistory(),
        window.api.license.generateLicenseRequest(),
      ])

      if (appInfoResult.success && appInfoResult.data) {
        setLicenseInfo(appInfoResult.data)
      }

      if (historyResult.success && historyResult.data) {
        setLicenseHistory(historyResult.data)
      }

      if (requestResult.success && requestResult.data) {
        setMachineId(requestResult.data.machineId || '')
      }
    } catch (error) {
      console.error('Failed to fetch license info:', error)
      showToast('Failed to load license information', 'error')
    } finally {
      setIsLoading(false)
    }
  }, [showToast])

  useEffect(() => {
    fetchLicenseInfo()
  }, [fetchLicenseInfo])

  const handleCopyMachineId = () => {
    if (machineId) {
      navigator.clipboard.writeText(machineId)
      showToast('Machine ID copied to clipboard', 'success')
    }
  }

  const handleGenerateRequest = async () => {
    if (machineId) {
      await navigator.clipboard.writeText(machineId)
      showToast('Machine ID copied to clipboard. Now run the license generator script.', 'success')
    }
  }

  const handleActivate = async (licenseKey: string) => {
    setIsActivating(true)
    try {
      const result = await window.api.license.activate(licenseKey)
      if (result.success) {
        showToast('License activated successfully for 1 year!', 'success')
        setShowActivateDialog(false)
        await fetchLicenseInfo()
      } else {
        showToast(result.message || 'Failed to activate license', 'error')
      }
    } catch (error) {
      console.error('Activate license error:', error)
      showToast('Failed to activate license', 'error')
    } finally {
      setIsActivating(false)
    }
  }

  const handleDeactivate = async () => {
    const newCount = deactivateClickCount + 1
    setDeactivateClickCount(newCount)

    if (newCount < 5) {
      setDeactivateConfirmOpen(true)
      return
    }

    // 5th click - show final warning
    setShowFinalWarning(true)
    return
  }

  const confirmDeactivate = async () => {
    setDeactivateConfirmOpen(false)
    setIsDeactivating(true)
    try {
      const result = await window.api.license.deactivate()
      if (result.success) {
        showToast('License deactivated successfully', 'success')
        await fetchLicenseInfo()
      } else {
        showToast(result.message || 'Failed to deactivate license', 'error')
      }
    } catch (error) {
      console.error('Deactivate license error:', error)
      showToast('Failed to deactivate license', 'error')
    } finally {
      setIsDeactivating(false)
      setDeactivateClickCount(0)
    }
  }

  const cancelDeactivate = () => {
    setDeactivateConfirmOpen(false)
  }

  const handleFinalWarningClose = () => {
    setShowFinalWarning(false)
    setDeactivateClickCount(0)
  }

  // Admin access check
  if (user?.role?.toLowerCase() !== 'admin') {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Card className="max-w-md border border-red-500/30 bg-card">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-red-500/10">
                <Shield className="h-7 w-7 text-red-500" />
              </div>
              <div>
                <p className="text-red-500 dark:text-red-400 font-semibold text-lg tracking-wide">Access Denied</p>
                <p className="text-red-500/70 text-sm">Administrator clearance required</p>
              </div>
            </div>
            <p className="text-muted-foreground text-sm border-l-2 border-red-500/50 pl-3">
              You do not have permission to access the license settings. Only administrators can manage application licensing.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-3">
        <RefreshCw className="w-7 h-7 animate-spin text-primary" />
        <p className="text-muted-foreground text-sm tracking-widest uppercase text-xs">Loading License Data</p>
      </div>
    )
  }

  // Dark-mode compatible status configurations
  const getStatusConfig = () => {
    switch (licenseInfo?.status) {
      case 'TRIAL_ACTIVE':
        return {
          color: 'text-amber-500',
          bg: 'bg-amber-500/10',
          border: 'border-amber-500',
          label: 'Trial Active',
          icon: Clock,
          progressColor: 'bg-amber-500',
        }
      case 'TRIAL_EXPIRED':
        return {
          color: 'text-orange-500',
          bg: 'bg-orange-500/10',
          border: 'border-orange-500',
          label: 'Trial Expired',
          icon: XCircle,
          progressColor: 'bg-orange-500',
        }
      case 'LICENSE_ACTIVE':
        return {
          color: 'text-emerald-500',
          bg: 'bg-emerald-500/10',
          border: 'border-emerald-500',
          label: 'Licensed',
          icon: CheckCircle2,
          progressColor: 'bg-emerald-500',
        }
      case 'LICENSE_EXPIRED':
        return {
          color: 'text-red-500',
          bg: 'bg-red-500/10',
          border: 'border-red-500',
          label: 'License Expired',
          icon: XCircle,
          progressColor: 'bg-red-500',
        }
      default:
        return {
          color: 'text-muted-foreground',
          bg: 'bg-zinc-500/10',
          border: 'border-zinc-500',
          label: 'Unknown',
          icon: Shield,
          progressColor: 'bg-zinc-500',
        }
    }
  }

  const statusConfig = getStatusConfig()
  const StatusIcon = statusConfig.icon

  // Calculate progress bar width for days remaining (cap at 365)
  const maxDays = 365
  const daysRemaining = licenseInfo?.daysRemaining ?? 0
  const progressPct = Math.min(Math.max((daysRemaining / maxDays) * 100, 0), 100)

  return (
    <div className="border-t-2 border-primary/30">
      <div className="p-5 max-w-7xl mx-auto space-y-5">

        {/* Toast */}
        {toast && (
          <div
            className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-2xl text-sm font-medium border transition-all ${
              toast.type === 'success'
                ? 'bg-card border-primary/50 text-primary shadow-primary/10'
                : 'bg-card border-red-500/50 text-red-500 dark:text-red-400 shadow-red-500/10'
            }`}
          >
            {toast.type === 'success'
              ? <CheckCircle2 className="w-4 h-4 shrink-0" />
              : <AlertTriangle className="w-4 h-4 shrink-0" />
            }
            {toast.message}
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground tracking-wide">
                License Settings
              </h1>
              <p className="text-xs text-muted-foreground">Manage application licensing and trial status</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchLicenseInfo}
            disabled={isLoading}
            className="border-border text-muted-foreground hover:text-primary hover:border-primary/50 bg-transparent text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Main 2-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

          {/* LEFT COLUMN — Status + Machine ID */}
          <div className="lg:col-span-2 flex flex-col gap-4">

            {/* License Status Panel */}
            <Card className={`border-l-4 ${statusConfig.border} border-border bg-card`}>
              <CardContent className="pt-5 pb-5 space-y-4">
                {/* Status header */}
                <div className="flex items-center justify-between">
                  <div className={`flex items-center gap-2 ${statusConfig.color}`}>
                    <div className={`p-1.5 rounded-md ${statusConfig.bg}`}>
                      <StatusIcon className="w-4 h-4" />
                    </div>
                    <span className="font-semibold text-sm tracking-wide">{statusConfig.label}</span>
                  </div>
                  <Badge
                    className={`text-xs font-medium border ${statusConfig.bg} ${statusConfig.color} ${statusConfig.border} bg-opacity-10`}
                  >
                    {licenseInfo?.isActivated ? 'ACTIVATED' : licenseInfo?.isTrial ? 'TRIAL' : 'INACTIVE'}
                  </Badge>
                </div>

                {/* Status message */}
                <div className={`px-3 py-2.5 rounded-md ${statusConfig.bg} border ${statusConfig.border} border-opacity-30`}>
                  <p className={`text-xs font-medium ${statusConfig.color}`}>{licenseInfo?.message}</p>
                  {licenseInfo?.expiresAt && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Expires {new Date(licenseInfo.expiresAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </p>
                  )}
                </div>

                {/* Days remaining progress bar */}
                {daysRemaining > 0 && (
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">Days Remaining</span>
                      <span className={`text-xs font-semibold tabular-nums ${statusConfig.color}`}>
                        {daysRemaining}d
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${statusConfig.progressColor}`}
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Machine ID Card */}
            <Card className="border-border bg-card">
              <CardHeader className="pb-2 pt-4 px-4">
                <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-primary" />
                  Machine Identifier
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 pb-4 space-y-3">
                <div className="relative group">
                  <code className="block w-full p-2.5 rounded-md bg-muted border border-border text-xs font-mono text-foreground break-all leading-relaxed pr-9">
                    {machineId || '—'}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCopyMachineId}
                    className="absolute top-1.5 right-1.5 h-6 w-6 text-muted-foreground hover:text-primary hover:bg-primary/10"
                    title="Copy Machine ID"
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/50 bg-transparent"
                  onClick={handleGenerateRequest}
                >
                  <Copy className="w-3.5 h-3.5 mr-1.5" />
                  Copy ID &amp; Generate License
                </Button>
              </CardContent>
            </Card>

          </div>

          {/* RIGHT COLUMN — Details + Actions */}
          <div className="lg:col-span-3 flex flex-col gap-4">

            {licenseInfo?.isActivated && licenseInfo.status === 'LICENSE_ACTIVE' ? (
              /* Full License Details */
              <>
                <Card className="border-border bg-card">
                  <CardHeader className="pb-3 pt-4 px-5">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-md bg-emerald-500/10">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      </div>
                      <div>
                        <CardTitle className="text-sm font-semibold text-foreground">Full License Active</CardTitle>
                        <CardDescription className="text-xs text-muted-foreground">Your license is valid and operational</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="px-5 pb-5 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">License Key</p>
                        <code className="block p-1.5 rounded bg-muted border border-border text-xs font-mono text-muted-foreground break-all">
                          {licenseInfo.licenseStartDate ? '••••  ••••  ••••  ••••' : '—'}
                        </code>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">License Type</p>
                        <span className="text-sm font-medium text-foreground">Subscription License</span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Installation Date</p>
                        <span className="text-sm font-medium text-foreground">
                          {licenseInfo.installationDate
                            ? new Date(licenseInfo.installationDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                            : '—'}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Days Remaining</p>
                        <span className="text-sm font-semibold text-emerald-400">
                          {licenseInfo.daysRemaining} days
                        </span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">License Start Date</p>
                        <span className="text-sm font-medium text-foreground">
                          {licenseInfo.licenseStartDate
                            ? new Date(licenseInfo.licenseStartDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                            : '—'}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">License End Date</p>
                        <span className="text-sm font-medium text-foreground">
                          {licenseInfo.licenseEndDate
                            ? new Date(licenseInfo.licenseEndDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                            : '—'}
                        </span>
                      </div>
                      <div className="space-y-1 col-span-2">
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Machine ID</p>
                        <code className="block p-1.5 rounded bg-muted border border-border text-xs font-mono text-muted-foreground break-all">
                          {machineId}
                        </code>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-border">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleDeactivate}
                        disabled={isDeactivating}
                        className="gap-2 text-xs"
                      >
                        <Power className="w-3.5 h-3.5" />
                        {isDeactivating ? 'Deactivating...' : 'Deactivate License'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              /* Trial / Non-activated Details */
              <>
                <Card className="border-border bg-card">
                  <CardHeader className="pb-3 pt-4 px-5">
                    <CardTitle className="text-sm font-semibold text-foreground">License Details</CardTitle>
                    <CardDescription className="text-xs text-muted-foreground">Current license and trial information</CardDescription>
                  </CardHeader>
                  <CardContent className="px-5 pb-5 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Installation Date</p>
                        <span className="text-sm font-medium text-foreground">
                          {licenseInfo?.installationDate
                            ? new Date(licenseInfo.installationDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                            : '—'}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Trial End Date</p>
                        <span className="text-sm font-medium text-foreground">
                          {licenseInfo?.trialEndDate
                            ? new Date(licenseInfo.trialEndDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                            : '—'}
                        </span>
                      </div>

                      {licenseInfo?.isActivated && (
                        <>
                          <div className="space-y-1">
                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">License Start</p>
                            <span className="text-sm font-medium text-foreground">
                              {licenseInfo.licenseStartDate
                                ? new Date(licenseInfo.licenseStartDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                                : '—'}
                            </span>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">License End</p>
                            <span className="text-sm font-medium text-foreground">
                              {licenseInfo.licenseEndDate
                                ? new Date(licenseInfo.licenseEndDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                                : '—'}
                            </span>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-2 border-t border-border flex gap-2">
                      {licenseInfo?.isTrial ? (
                        <Button
                          size="sm"
                          onClick={() => setShowActivateDialog(true)}
                          className="gap-2 text-xs bg-primary hover:bg-primary/80 text-primary-foreground font-semibold"
                        >
                          <Key className="w-3.5 h-3.5" />
                          Activate License
                        </Button>
                      ) : licenseInfo?.isActivated ? (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={handleDeactivate}
                          disabled={isDeactivating}
                          className="gap-2 text-xs"
                        >
                          <Power className="w-3.5 h-3.5" />
                          {isDeactivating ? 'Deactivating...' : 'Deactivate License'}
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => setShowActivateDialog(true)}
                          className="gap-2 text-xs bg-primary hover:bg-primary/80 text-primary-foreground font-semibold"
                        >
                          <Key className="w-3.5 h-3.5" />
                          Activate License
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>

        {/* License History */}
        <div>
          <LicenseHistory history={licenseHistory} />
        </div>

        {/* Activate License Dialog */}
        <ActivateLicenseDialog
          open={showActivateDialog}
          onOpenChange={setShowActivateDialog}
          onActivate={handleActivate}
          isActivating={isActivating}
          machineId={machineId}
        />

        {/* Deactivate Confirmation Dialog */}
        <AlertDialog open={deactivateConfirmOpen} onOpenChange={setDeactivateConfirmOpen}>
          <AlertDialogContent className="bg-card border border-border">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-primary">
                <div className="p-1.5 rounded-md bg-primary/10">
                  <AlertTriangle className="w-4 h-4 text-primary" />
                </div>
                Deactivate License?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-muted-foreground text-sm">
                Are you sure you want to deactivate the license? This will revert the application
                to trial mode and you will need to activate a new license to continue using all features.
                <br /><br />
                <span className="text-primary/80 font-medium">
                  Click the button {5 - deactivateClickCount} more time(s) before deactivation proceeds.
                </span>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <Button
                variant="outline"
                size="sm"
                onClick={cancelDeactivate}
                className="border-border text-muted-foreground hover:text-foreground bg-transparent"
              >
                Cancel
              </Button>
              <Button variant="destructive" size="sm" onClick={confirmDeactivate}>
                Yes, Deactivate
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Final Warning Dialog (5th click) */}
        <AlertDialog open={showFinalWarning} onOpenChange={handleFinalWarningClose}>
          <AlertDialogContent className="max-w-md bg-card border border-red-500/40">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2 text-red-400">
                <div className="p-1.5 rounded-md bg-red-500/10">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                </div>
                WARNING: Final Confirmation Required
              </AlertDialogTitle>
              <AlertDialogDescription asChild>
                <div className="space-y-3 text-muted-foreground text-sm">
                  <p className="font-medium text-foreground">
                    You are about to deactivate your license!
                  </p>
                  <p>This action will:</p>
                  <ul className="space-y-1.5 pl-1">
                    {DEACTIVATION_CONSEQUENCES.map((item) => (
                      <li key={item} className="flex items-start gap-2 text-muted-foreground">
                        <span className="mt-1 w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <p className="font-medium text-foreground pt-1">
                    Are you absolutely sure you want to proceed?
                  </p>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <Button
                variant="outline"
                size="sm"
                onClick={handleFinalWarningClose}
                className="border-border text-muted-foreground hover:text-foreground bg-transparent"
              >
                No, Keep License
              </Button>
              <Button variant="destructive" size="sm" onClick={confirmDeactivate}>
                Yes, Deactivate License
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
