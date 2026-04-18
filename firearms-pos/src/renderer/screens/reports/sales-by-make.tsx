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
  make: string
  sale_count: number
  units_sold: number
  revenue: number
  margin: number
}

function defaultRange(): { start: string; end: string } {
  const end = new Date()
  const start = new Date(end.getTime() - 30 * 24 * 3600 * 1000)
  return { start: start.toISOString(), end: end.toISOString() }
}

export default function SalesByMakeReport() {
  const [range, setRange] = useState(defaultRange())
  const [rows, setRows] = useState<Row[]>([])

  useEffect(() => {
    window.api.firearmReports
      .salesByMake(range)
      .then((r: { success: boolean; data?: Row[] }) => {
        if (r.success && r.data) setRows(r.data)
      })
      .catch(() => {})
  }, [range])

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Sales by Make (Local vs Imported)</CardTitle>
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
                <TableHead>Make</TableHead>
                <TableHead className="text-right">Sales</TableHead>
                <TableHead className="text-right">Units</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">Margin</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No sales in range.
                  </TableCell>
                </TableRow>
              )}
              {rows.map((r) => (
                <TableRow key={r.make}>
                  <TableCell className="capitalize">{r.make}</TableCell>
                  <TableCell className="text-right">{r.sale_count}</TableCell>
                  <TableCell className="text-right">{r.units_sold}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatCurrency(r.revenue)}</TableCell>
                  <TableCell className="text-right tabular-nums">{formatCurrency(r.margin)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
