import { Shield, AlertTriangle, CheckCircle, XCircle, Copy, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface LicenseStatusCardProps {
  status: string
  isValid: boolean
  isActivated: boolean
  isTrial: boolean
  machineId: string
  expiresAt: string | null
  daysRemaining: number
  message: string
  onCopyMachineId: () => void
  onGenerateRequest: () => void
}

export function LicenseStatusCard({
  status,
  isValid,
  isActivated,
  isTrial,
  machineId,
  expiresAt,
  daysRemaining,
  message,
  onCopyMachineId,
  onGenerateRequest,
}: LicenseStatusCardProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'TRIAL_ACTIVE':
        return {
          icon: Shield,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-100 dark:bg-yellow-900',
          badgeColor: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
          label: 'Trial Active',
        }
      case 'TRIAL_EXPIRED':
        return {
          icon: AlertTriangle,
          color: 'text-orange-600',
          bgColor: 'bg-orange-100 dark:bg-orange-900',
          badgeColor: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
          label: 'Trial Expired',
        }
      case 'LICENSE_ACTIVE':
        return {
          icon: CheckCircle,
          color: 'text-green-600',
          bgColor: 'bg-green-100 dark:bg-green-900',
          badgeColor: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
          label: 'License Active',
        }
      case 'LICENSE_EXPIRED':
        return {
          icon: XCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-100 dark:bg-red-900',
          badgeColor: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
          label: 'License Expired',
        }
      default:
        return {
          icon: AlertTriangle,
          color: 'text-gray-600',
          bgColor: 'bg-gray-100 dark:bg-gray-900',
          badgeColor: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
          label: 'Unknown',
        }
    }
  }

  const config = getStatusConfig()
  const Icon = config.icon

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className={`w-5 h-5 ${config.color}`} />
          License Status
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Badge className={config.badgeColor}>{config.label}</Badge>
          <span className="text-sm text-muted-foreground">
            {daysRemaining} days remaining
          </span>
        </div>

        <div className="p-4 rounded-lg bg-muted">
          <p className="text-sm font-medium">{message}</p>
          {expiresAt && (
            <p className="text-xs text-muted-foreground mt-1">
              Expires: {new Date(expiresAt).toLocaleDateString()}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Machine ID</label>
          <div className="flex gap-2">
            <code className="flex-1 p-2 rounded bg-muted text-xs font-mono break-all">
              {machineId.substring(0, 16)}...
            </code>
            <Button variant="outline" size="sm" onClick={onCopyMachineId}>
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button variant="outline" size="sm" onClick={onGenerateRequest}>
            <ExternalLink className="w-4 h-4 mr-2" />
            Generate License Request
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
