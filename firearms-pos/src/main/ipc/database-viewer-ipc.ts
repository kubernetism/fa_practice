import { ipcMain } from 'electron'
import { getDatabase } from '../db'

interface TableInfo {
  name: string
  type: string
  notnull: number
  dflt_value: string | null
  pk: number
}

interface TableData {
  columns: string[]
  rows: unknown[][]
  count: number
}

export function registerDatabaseViewerHandlers(): void {
  const db = getDatabase()

  // Get list of all tables in the database
  ipcMain.handle('database:get-tables', async () => {
    try {
      const tables = await db.all(`
        SELECT name, sql
        FROM sqlite_master
        WHERE type='table'
        AND name NOT LIKE 'sqlite_%'
        AND name NOT LIKE 'drizzle_%'
        ORDER BY name
      `)
      return { success: true, tables }
    } catch (err) {
      console.error('Error fetching tables:', err)
      return { success: false, error: String(err), tables: [] }
    }
  })

  // Get table structure (columns)
  ipcMain.handle('database:get-table-info', async (_, tableName: string) => {
    try {
      const info = await db.all<TableInfo>(`PRAGMA table_info(${tableName})`)
      return { success: true, columns: info }
    } catch (err) {
      console.error('Error fetching table info:', err)
      return { success: false, error: String(err), columns: [] }
    }
  })

  // Get table data with pagination
  ipcMain.handle(
    'database:get-table-data',
    async (_, { tableName, page = 1, limit = 100 }: { tableName: string; page?: number; limit?: number }) => {
      try {
        // Get total count
        const countResult = await db.get<{ count: number }>(
          `SELECT COUNT(*) as count FROM ${tableName}`
        )
        const totalCount = countResult?.count || 0

        // Get data with pagination
        const offset = (page - 1) * limit
        const data = await db.all(`SELECT * FROM ${tableName} LIMIT ${limit} OFFSET ${offset}`)

        // Get column names
        const columnsResult = await db.all<{ name: string }>(`PRAGMA table_info(${tableName})`)
        const columns = columnsResult.map((col) => col.name)

        return {
          success: true,
          data: {
            columns,
            rows: data as unknown[][],
            count: totalCount,
            page,
            limit,
            totalPages: Math.ceil(totalCount / limit),
          },
        }
      } catch (err) {
        console.error('Error fetching table data:', err)
        return { success: false, error: String(err), data: null }
      }
    }
  )

  // Execute raw SQL query (admin only)
  ipcMain.handle(
    'database:execute-query',
    async (_, { query, userId }: { query: string; userId: number }) => {
      try {
        // Basic security check - only allow SELECT queries for viewing
        const normalizedQuery = query.trim().toLowerCase()
        if (!normalizedQuery.startsWith('select') && !normalizedQuery.startsWith('pragma')) {
          return {
            success: false,
            error: 'Only SELECT queries are allowed for security reasons',
            data: null,
          }
        }

        // Prevent dangerous queries
        if (
          normalizedQuery.includes('drop') ||
          normalizedQuery.includes('delete') ||
          normalizedQuery.includes('update') ||
          normalizedQuery.includes('insert') ||
          normalizedQuery.includes('alter') ||
          normalizedQuery.includes('create')
        ) {
          return {
            success: false,
            error: 'Only SELECT and PRAGMA queries are allowed for viewing',
            data: null,
          }
        }

        const result = await db.all(query)

        // Get column names if result is not empty
        let columns: string[] = []
        if (result.length > 0) {
          columns = Object.keys(result[0])
        }

        return {
          success: true,
          data: {
            columns,
            rows: result as unknown[][],
            count: result.length,
          },
        }
      } catch (err) {
        console.error('Error executing query:', err)
        return { success: false, error: String(err), data: null }
      }
    }
  )

  // Get database size and info
  ipcMain.handle('database:get-info', async () => {
    try {
      const dbPath = db.config.filename

      // Get all table names and their row counts
      const tables = await db.all(`
        SELECT m.name as table_name, (
          SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name=m.name
        ) as exists
        FROM sqlite_master m
        WHERE m.type='table'
        AND m.name NOT LIKE 'sqlite_%'
        AND m.name NOT LIKE 'drizzle_%'
      `)

      const tableCounts = await Promise.all(
        tables.map(async (table: { name: string }) => {
          const result = await db.get<{ count: number }>(
            `SELECT COUNT(*) as count FROM ${table.name}`
          )
          return { name: table.name, count: result?.count || 0 }
        })
      )

      return {
        success: true,
        info: {
          path: dbPath,
          tableCounts,
        },
      }
    } catch (err) {
      console.error('Error fetching database info:', err)
      return { success: false, error: String(err), info: null }
    }
  })
}
