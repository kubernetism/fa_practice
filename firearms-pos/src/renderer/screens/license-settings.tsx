import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { Shield, Copy, Key, Power, RefreshCw, Terminal, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { ActivateLicenseDialog } from '@/components/license/activate-license-dialog'
import { LicenseHistory } from '@/components/license/license-history'

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
  const [instructions, setInstructions] = useState<string>('')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [deactivateConfirmOpen, setDeactivateConfirmOpen] = useState(false)
  const [deactivateClickCount, setDeactivateClickCount] = useState(0)
  const [showFinalWarning, setShowFinalWarning] = useState(false)

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
        setInstructions(requestResult.data.instructions || '')
      }
    } catch (error) {
      console.error('Failed to fetch license info:', error)
      showToast('Failed to load license information', 'error')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLicenseInfo()
  }, [fetchLicenseInfo])

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

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
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-red-700 font-semibold text-lg">Access Denied</p>
                <p className="text-red-600 text-sm">Admin Only Access</p>
              </div>
            </div>
            <p className="text-red-600 text-sm">
              You do not have permission to access the license settings. Only administrators can manage application licensing.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const getStatusConfig = () => {
    switch (licenseInfo?.status) {
      case 'TRIAL_ACTIVE':
        return { color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Trial Period', icon: Shield }
      case 'TRIAL_EXPIRED':
        return { color: 'text-orange-600', bg: 'bg-orange-100', label: 'Trial Expired', icon: Shield }
      case 'LICENSE_ACTIVE':
        return { color: 'text-green-600', bg: 'bg-green-100', label: 'Licensed', icon: Shield }
      case 'LICENSE_EXPIRED':
        return { color: 'text-red-600', bg: 'bg-red-100', label: 'License Expired', icon: Shield }
      default:
        return { color: 'text-gray-600', bg: 'bg-gray-100', label: 'Unknown', icon: Shield }
    }
  }

  const statusConfig = getStatusConfig()
  const StatusIcon = statusConfig.icon

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="w-8 h-8" />
            Application Licence Settings
          </h1>
          <p className="text-muted-foreground">
            Manage your application license and trial status
          </p>
        </div>
        <Button variant="outline" onClick={fetchLicenseInfo} disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-md shadow-lg ${
            toast.type === 'success'
              ? 'bg-green-500 text-white'
              : 'bg-red-500 text-white'
          }`}
        >
          {toast.message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* License Status Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <StatusIcon className={`w-5 h-5 ${statusConfig.color}`} />
              License Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge className={`${statusConfig.bg} ${statusConfig.color}`}>
                {statusConfig.label}
              </Badge>
              {licenseInfo?.daysRemaining !== undefined && licenseInfo.daysRemaining > 0 && (
                <span className="text-sm text-muted-foreground">
                  {licenseInfo.daysRemaining} days remaining
                </span>
              )}
            </div>

            <div className="p-4 rounded-lg bg-muted">
              <p className="text-sm font-medium">{licenseInfo?.message}</p>
              {licenseInfo?.expiresAt && (
                <p className="text-xs text-muted-foreground mt-1">
                  Expires: {new Date(licenseInfo.expiresAt).toLocaleDateString()}
                </p>
              )}
            </div>

            {/* Machine ID */}
            <div className="space-y-2">
              <Label>Machine ID</Label>
              <div className="flex gap-2">
                <code className="flex-1 p-2 rounded bg-muted text-xs font-mono break-all">
                  {machineId.substring(0, 20)}...
                </code>
                <Button variant="outline" size="sm" onClick={handleCopyMachineId}>
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Generate License Button */}
            <Button variant="outline" className="w-full" onClick={handleGenerateRequest}>
              <Terminal className="w-4 h-4 mr-2" />
              Copy Machine ID & Generate License
            </Button>
          </CardContent>
        </Card>

        {/* License Details */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>License Details</CardTitle>
            <CardDescription>
              {licenseInfo?.isActivated ? 'Your full license information' : 'Current license information and actions'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Full License Details - Show when licensed */}
            {licenseInfo?.isActivated && licenseInfo.status === 'LICENSE_ACTIVE' ? (
              <div className="space-y-6">
                <div className="flex items-center gap-3 p-4 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
                  <Shield className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="font-semibold text-green-800 dark:text-green-200">Full License Activated</p>
                    <p className="text-sm text-green-600 dark:text-green-300">
                      Your license is valid and active
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">License Key</p>
                    <code className="flex items-center gap-2 p-2 rounded bg-muted text-xs font-mono break-all">
                      {licenseInfo.licenseStartDate ? '••••••••••••••••' : '-'}
                    </code>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">License Type</p>
                    <p className="font-medium">Annual License (1 Year)</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Installation Date</p>
                    <p className="font-medium">
                      {licenseInfo.installationDate
                        ? new Date(licenseInfo.installationDate).toLocaleDateString()
                        : '-'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">License Start Date</p>
                    <p className="font-medium">
                      {licenseInfo.licenseStartDate
                        ? new Date(licenseInfo.licenseStartDate).toLocaleDateString()
                        : '-'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">License End Date</p>
                    <p className="font-medium">
                      {licenseInfo.licenseEndDate
                        ? new Date(licenseInfo.licenseEndDate).toLocaleDateString()
                        : '-'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Days Remaining</p>
                    <p className="font-medium text-green-600">
                      {licenseInfo.daysRemaining} days
                    </p>
                  </div>
                  <div className="space-y-1 col-span-2">
                    <p className="text-sm text-muted-foreground">Machine ID</p>
                    <code className="flex items-center gap-2 p-2 rounded bg-muted text-xs font-mono break-all">
                      {machineId}
                    </code>
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    variant="destructive"
                    onClick={handleDeactivate}
                    disabled={isDeactivating}
                    className="gap-2"
                  >
                    <Power className="w-4 h-4" />
                    {isDeactivating ? 'Deactivating...' : 'Deactivate License'}
                  </Button>
                </div>
              </div>
            ) : (
              /* Trial Details */
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Installation Date</p>
                    <p className="font-medium">
                      {licenseInfo?.installationDate
                        ? new Date(licenseInfo.installationDate).toLocaleDateString()
                        : '-'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Trial End Date</p>
                    <p className="font-medium">
                      {licenseInfo?.trialEndDate
                        ? new Date(licenseInfo.trialEndDate).toLocaleDateString()
                        : '-'}
                    </p>
                  </div>
                  {licenseInfo?.isActivated && (
                    <>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">License Start</p>
                        <p className="font-medium">
                          {licenseInfo.licenseStartDate
                            ? new Date(licenseInfo.licenseStartDate).toLocaleDateString()
                            : '-'}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-muted-foreground">License End</p>
                        <p className="font-medium">
                          {licenseInfo.licenseEndDate
                            ? new Date(licenseInfo.licenseEndDate).toLocaleDateString()
                            : '-'}
                        </p>
                      </div>
                    </>
                  )}
                </div>

                {/* Instructions */}
                <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
                  <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                    How to Generate License Key:
                  </p>
                  <ol className="text-sm text-blue-700 dark:text-blue-300 list-decimal list-inside space-y-1">
                    <li>Click "Copy Machine ID" button above</li>
                    <li>Open terminal in the application folder</li>
                    <li>Run: <code className="px-1 bg-blue-100 dark:bg-blue-900 rounded">node generate-license.js [paste_machine_id]</code></li>
                    <li>Copy the generated license key</li>
                    <li>Paste it in the Activate License dialog below</li>
                  </ol>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4">
                  {licenseInfo?.isTrial ? (
                    <Button onClick={() => setShowActivateDialog(true)}>
                      <Key className="w-4 h-4 mr-2" />
                      Activate License
                    </Button>
                  ) : licenseInfo?.isActivated ? (
                    <>
                      <Button variant="outline" onClick={handleDeactivate} disabled={isDeactivating}>
                        <Power className="w-4 h-4 mr-2" />
                        {isDeactivating ? 'Deactivating...' : 'Deactivate License'}
                      </Button>
                    </>
                  ) : null}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* License History */}
      <div className="mt-6">
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
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Deactivate License?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to deactivate the license? This will revert the application
              to trial mode and you will need to activate a new license to continue using all features.
              <br /><br />
              You have clicked the button {5 - deactivateClickCount} more time(s) before deactivation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" onClick={cancelDeactivate}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeactivate}>
              Yes, Deactivate
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Final Warning Dialog (5th click) */}
      <AlertDialog open={showFinalWarning} onOpenChange={handleFinalWarningClose}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="w-6 h-6" />
              WARNING: Final Confirmation Required
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p className="text-base font-medium text-foreground">
                You are about to deactivate your license!
              </p>
              <p>
                This action will:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                <li>Remove your full license from this machine</li>
                <li>Revert the application to trial mode (30 days)</li>
                <li>Require you to generate a new license key to continue</li>
              </ul>
              <p className="text-sm font-medium text-foreground pt-2">
                Are you absolutely sure you want to proceed?
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" onClick={handleFinalWarningClose}>
              No, Keep License
            </Button>
            <Button variant="destructive" onClick={confirmDeactivate}>
              Yes, Deactivate License
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
