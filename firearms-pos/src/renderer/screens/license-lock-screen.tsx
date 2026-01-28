import { useState } from 'react'
import { Shield, Lock, Key, Copy, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface LicenseLockScreenProps {
  machineId: string
  onUnlock: () => void
}

export function LicenseLockScreen({ machineId, onUnlock }: LicenseLockScreenProps) {
  const [licenseKey, setLicenseKey] = useState('')
  const [isUnlocking, setIsUnlocking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean
    isValidFormat: boolean
    message: string
  } | null>(null)
  const [copied, setCopied] = useState(false)

  const formatLicenseKey = (value: string) => {
    return value.toUpperCase().replace(/\s/g, '')
  }

  const handleKeyChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatLicenseKey(e.target.value)
    setLicenseKey(formatted)
    setError(null)
    setValidationResult(null)

    if (formatted.length === 32 || formatted.length === 64) {
      try {
        const result = await window.api.license.validateKey(formatted)
        if (result.success) {
          setValidationResult(result.data)
        }
      } catch (err) {
        console.error('Validation error:', err)
      }
    }
  }

  const handleUnlock = async () => {
    if (licenseKey.length !== 32 && licenseKey.length !== 64) {
      setError('Please enter a valid license key (32 or 64 characters)')
      return
    }

    setError(null)
    setIsUnlocking(true)

    try {
      const result = await window.api.license.unlockApplication(licenseKey)
      if (result.success) {
        onUnlock()
      } else {
        setError(result.message || 'Failed to unlock application')
      }
    } catch (err) {
      console.error('Unlock error:', err)
      setError('Failed to unlock application. Please try again.')
    } finally {
      setIsUnlocking(false)
    }
  }

  const handleCopyMachineId = async () => {
    try {
      await navigator.clipboard.writeText(machineId)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for clipboard API failure
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-red-950 dark:via-orange-950 dark:to-yellow-950">
      <div className="w-full max-w-lg mx-4">
        {/* Lock Icon Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 dark:bg-red-900 mb-4">
            <Lock className="w-10 h-10 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Application Locked
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Your trial period has expired or your license is invalid.
            <br />
            Enter a valid license key to unlock the application and decrypt your data.
          </p>
        </div>

        {/* Unlock Card */}
        <Card className="border-red-200 dark:border-red-800 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-300">
              <Shield className="w-5 h-5" />
              Unlock Application
            </CardTitle>
            <CardDescription>
              Your database is encrypted and inaccessible. Enter the license key for this machine to decrypt and unlock.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Machine ID */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Machine ID</Label>
              <div className="flex gap-2">
                <code className="flex-1 p-3 rounded-md bg-gray-100 dark:bg-gray-800 text-xs font-mono break-all border">
                  {machineId}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyMachineId}
                  className="shrink-0"
                >
                  {copied ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Copy this Machine ID and use it to generate a license key.
              </p>
            </div>

            {/* License Key Input */}
            <div className="space-y-2">
              <Label htmlFor="unlock-key" className="text-sm font-medium">
                License Key
              </Label>
              <Input
                id="unlock-key"
                value={licenseKey}
                onChange={handleKeyChange}
                placeholder="Enter your 64-character license key"
                maxLength={64}
                className="font-mono text-sm"
                disabled={isUnlocking}
              />
            </div>

            {/* Validation Status */}
            {validationResult && (
              <div
                className={`flex items-center gap-2 p-3 rounded-md text-sm ${
                  validationResult.isValid
                    ? 'bg-green-50 text-green-800 border border-green-200 dark:bg-green-950 dark:text-green-200 dark:border-green-800'
                    : 'bg-red-50 text-red-800 border border-red-200 dark:bg-red-950 dark:text-red-200 dark:border-red-800'
                }`}
              >
                {validationResult.isValid ? (
                  <CheckCircle className="w-4 h-4 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{validationResult.message}</span>
              </div>
            )}

            {/* Error Display */}
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-md bg-red-50 text-red-800 border border-red-200 dark:bg-red-950 dark:text-red-200 dark:border-red-800 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Unlock Button */}
            <Button
              onClick={handleUnlock}
              disabled={isUnlocking || licenseKey.length < 32}
              className="w-full gap-2"
              size="lg"
            >
              {isUnlocking ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Decrypting & Unlocking...
                </>
              ) : (
                <>
                  <Key className="w-4 h-4" />
                  Unlock Application
                </>
              )}
            </Button>

            {/* Instructions */}
            <div className="p-4 rounded-md bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
              <p className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                How to get a license key:
              </p>
              <ol className="text-xs text-blue-700 dark:text-blue-300 list-decimal list-inside space-y-1">
                <li>Copy the Machine ID above</li>
                <li>Contact the administrator or run the license generator</li>
                <li>
                  Run:{' '}
                  <code className="px-1 bg-blue-100 dark:bg-blue-900 rounded">
                    node generate-license.js [machine_id]
                  </code>
                </li>
                <li>Paste the generated key above and click Unlock</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          Firearms POS - All data is encrypted and secure. Only a valid license key can restore access.
        </p>
      </div>
    </div>
  )
}
