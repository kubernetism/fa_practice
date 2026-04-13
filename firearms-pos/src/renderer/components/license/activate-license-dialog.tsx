import { useState } from 'react'
import { Key, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface ActivateLicenseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onActivate: (licenseKey: string) => Promise<void>
  isActivating: boolean
  machineId: string
}

export function ActivateLicenseDialog({
  open,
  onOpenChange,
  onActivate,
  isActivating,
  machineId,
}: ActivateLicenseDialogProps) {
  const [licenseKey, setLicenseKey] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isValidating, setIsValidating] = useState(false)
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean
    isValidFormat: boolean
    message: string
  } | null>(null)

  const formatLicenseKey = (value: string) => {
    // Remove spaces and convert to uppercase
    return value.toUpperCase().replace(/\s/g, '')
  }

  const handleKeyChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatLicenseKey(e.target.value)
    setLicenseKey(formatted)
    setError(null)
    setValidationResult(null)

    // Validate when key is 64 (legacy) or 100 (new format) characters
    if (formatted.length === 64 || formatted.length === 100) {
      setIsValidating(true)
      try {
        const result = await window.api.license.validateKey(formatted)
        if (result.success) {
          setValidationResult(result.data)
        }
      } catch (err) {
        console.error('Validation error:', err)
      } finally {
        setIsValidating(false)
      }
    }
  }

  const handleActivate = async () => {
    if (licenseKey.length !== 64 && licenseKey.length !== 100) {
      setError('Please enter a valid license key (64 or 100 characters)')
      return
    }

    setError(null)
    await onActivate(licenseKey)
  }

  const handleClose = () => {
    setLicenseKey('')
    setError(null)
    setValidationResult(null)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            Activate License
          </DialogTitle>
          <DialogDescription>
            Enter the license key to activate your application. The license key is tied to this machine.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="licenseKey">License Key</Label>
            <Input
              id="licenseKey"
              value={licenseKey}
              onChange={handleKeyChange}
              placeholder="Enter license key"
              maxLength={100}
              className="font-mono"
              disabled={isActivating}
            />
            <p className="text-xs text-muted-foreground">
              Machine ID: {machineId.substring(0, 8)}...
            </p>
          </div>

          {validationResult && (
            <div
              className={`flex items-center gap-2 p-3 rounded-md ${
                validationResult.isValid
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              }`}
            >
              {validationResult.isValid ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <XCircle className="w-4 h-4" />
              )}
              <span className="text-sm">{validationResult.message}</span>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 text-destructive">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isActivating}>
            Cancel
          </Button>
          <Button onClick={handleActivate} disabled={isActivating || isValidating}>
            {isActivating ? 'Activating...' : 'Activate License'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
