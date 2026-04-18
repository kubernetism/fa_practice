import { ipcMain } from 'electron'
import { sql } from 'drizzle-orm'
import { getDatabase } from '../db'

export function registerFirearmReportsHandlers(): void {
  const db = getDatabase()

  ipcMain.handle('reports:inventory-by-caliber', async () => {
    try {
      const rows = await db.all(sql`
        SELECT fc.name as caliber,
               COUNT(p.id) as product_count,
               COALESCE(SUM(i.quantity), 0) as qty_on_hand,
               COALESCE(SUM(i.quantity * p.cost_price), 0) as total_cost_value
        FROM firearm_calibers fc
        LEFT JOIN products p ON p.caliber_id = fc.id AND p.is_active = 1
        LEFT JOIN inventory i ON i.product_id = p.id
        GROUP BY fc.id
        HAVING product_count > 0
        ORDER BY total_cost_value DESC
      `)
      return { success: true, data: rows }
    } catch (err) {
      console.error('reports:inventory-by-caliber', err)
      return { success: false, message: 'Report failed' }
    }
  })

  ipcMain.handle(
    'reports:sales-by-make',
    async (_e, range: { start: string; end: string }) => {
      try {
        const rows = await db.all(sql`
        SELECT COALESCE(p.make, 'unspecified') as make,
               COUNT(DISTINCT s.id) as sale_count,
               SUM(si.quantity) as units_sold,
               SUM(si.quantity * si.unit_price) as revenue,
               SUM(si.quantity * (si.unit_price - p.cost_price)) as margin
        FROM sales s
        JOIN sale_items si ON si.sale_id = s.id
        JOIN products p ON p.id = si.product_id
        WHERE s.created_at BETWEEN ${range.start} AND ${range.end}
        GROUP BY p.make
      `)
        return { success: true, data: rows }
      } catch (err) {
        console.error('reports:sales-by-make', err)
        return { success: false, message: 'Report failed' }
      }
    },
  )

  ipcMain.handle(
    'reports:sales-by-model',
    async (_e, range: { start: string; end: string; limit?: number }) => {
      try {
        const limit = range.limit ?? 25
        const rows = await db.all(sql`
        SELECT fm.name as model,
               SUM(si.quantity) as units_sold,
               SUM(si.quantity * si.unit_price) as revenue
        FROM firearm_models fm
        JOIN products p ON p.firearm_model_id = fm.id
        JOIN sale_items si ON si.product_id = p.id
        JOIN sales s ON s.id = si.sale_id
        WHERE s.created_at BETWEEN ${range.start} AND ${range.end}
        GROUP BY fm.id
        ORDER BY revenue DESC
        LIMIT ${limit}
      `)
        return { success: true, data: rows }
      } catch (err) {
        console.error('reports:sales-by-model', err)
        return { success: false, message: 'Report failed' }
      }
    },
  )

  ipcMain.handle('reports:stock-by-supplier', async () => {
    try {
      const rows = await db.all(sql`
        SELECT sup.name as supplier,
               COUNT(DISTINCT p.id) as products,
               COALESCE(SUM(i.quantity), 0) as qty_on_hand,
               COALESCE(SUM(i.quantity * p.cost_price), 0) as total_cost_value
        FROM suppliers sup
        LEFT JOIN products p ON p.default_supplier_id = sup.id AND p.is_active = 1
        LEFT JOIN inventory i ON i.product_id = p.id
        GROUP BY sup.id
        HAVING products > 0
        ORDER BY total_cost_value DESC
      `)
      return { success: true, data: rows }
    } catch (err) {
      console.error('reports:stock-by-supplier', err)
      return { success: false, message: 'Report failed' }
    }
  })
}
