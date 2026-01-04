import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { History } from 'lucide-react'

interface LicenseHistoryItem {
  id: number
  type: string
  status: string
  activatedBy: string
  activatedAt: string
  expiresAt: string
}

interface LicenseHistoryProps {
  history: LicenseHistoryItem[]
}

export function LicenseHistory({ history }: LicenseHistoryProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'EXPIRED':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'FULL':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'TRIAL':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="w-5 h-5" />
          License History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {history.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No license history available</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Activated By</TableHead>
                <TableHead>Activated At</TableHead>
                <TableHead>Expires At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <Badge className={getTypeBadge(item.type)}>{item.type}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusBadge(item.status)}>{item.status}</Badge>
                  </TableCell>
                  <TableCell>{item.activatedBy}</TableCell>
                  <TableCell>
                    {item.activatedAt
                      ? new Date(item.activatedAt).toLocaleDateString()
                      : '-'}
                  </TableCell>
                  <TableCell>
                    {item.expiresAt
                      ? new Date(item.expiresAt).toLocaleDateString()
                      : '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
