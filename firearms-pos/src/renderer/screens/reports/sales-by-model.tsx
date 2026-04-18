import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatCurrency } from '@/lib/utils'

interface Row {
  model: string
  units_sold: number
  revenue: number
}

function defaultRange(): { start: string; end: string } {
  const end = new Date()
  const start = new Date(end.getTime() - 30 * 24 * 3600 * 1000)
  return { start: start.toISOString(), end: end.toISOString() }
}

export default function SalesByModelReport() {
  const [range, setRange] = useState(defaultRange())
  const [rows, setRows] = useState<Row[]>([])

  useEffect(() => {
    window.api.firearmReports
      .salesByModel({ ...range, limit: 25 })
      .then((r: { success: boolean; data?: Row[] }) => {
        if (r.success && r.data) setRows(r.data)
      })
      .catch(() => {})
  }, [range])

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Sales by Model — Top 25</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div>
              <Label>Start</Label>
              <Input
                type="date"
                value={range.start.slice(0, 10)}
                onChange={(e) =>
                  setRange({ ...range, start: new Date(e.target.value).toISOString() })
                }
              />
            </div>
            <div>
              <Label>End</Label>
              <Input
                type="date"
                value={range.end.slice(0, 10)}
                onChange={(e) =>
                  setRange({ ...range, end: new Date(e.target.value).toISOString() })
                }
              />
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Model</TableHead>
                <TableHead className="text-right">Units</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">
                    No sales in range.
                  </TableCell>
                </TableRow>
              )}
              {rows.map((r) => (
                <TableRow key={r.model}>
                  <TableCell>{r.model}</TableCell>
                  <TableCell className="text-right">{r.units_sold}</TableCell>
                  <TableCell className="text-right tabular-nums">
                    {formatCurrency(r.revenue)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
