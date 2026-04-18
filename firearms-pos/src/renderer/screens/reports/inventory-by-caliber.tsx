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
import { formatCurrency } from '@/lib/utils'

interface Row {
  caliber: string
  product_count: number
  qty_on_hand: number
  total_cost_value: number
}

export default function InventoryByCaliberReport() {
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    window.api.firearmReports
      .inventoryByCaliber()
      .then((r: { success: boolean; data?: Row[] }) => {
        if (r.success && r.data) setRows(r.data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>Inventory by Caliber</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading…</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Caliber</TableHead>
                  <TableHead className="text-right">Products</TableHead>
                  <TableHead className="text-right">Qty On Hand</TableHead>
                  <TableHead className="text-right">Cost Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      No firearm inventory.
                    </TableCell>
                  </TableRow>
                )}
                {rows.map((r) => (
                  <TableRow key={r.caliber}>
                    <TableCell className="font-mono">{r.caliber}</TableCell>
                    <TableCell className="text-right">{r.product_count}</TableCell>
                    <TableCell className="text-right">{r.qty_on_hand}</TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatCurrency(r.total_cost_value)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
