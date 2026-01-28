import { ipcMain, app, dialog, BrowserWindow } from 'electron'
import { getDbPath, closeDatabase, initDatabase, getRawDatabase, getDatabase } from '../db'
import { existsSync, mkdirSync, copyFileSync, readdirSync, statSync, unlinkSync, readFileSync, writeFileSync } from 'node:fs'
import { join, basename } from 'node:path'
import Database from 'better-sqlite3-multiple-ciphers'
// Note: Audit logging for backup operations is disabled because the audit_logs
// table schema doesn't include backup-related action types

// Import categories configuration
export interface ImportCategory {
  id: string
  name: string
  description: string
  tables: string[]
}

export const IMPORT_CATEGORIES: ImportCategory[] = [
  {
    id: 'inventory',
    name: 'Inventory',
    description: 'Products, Categories, Inventory, Purchases, Returns, Stock Adjustments',
    tables: ['products', 'categories', 'inventory', 'purchases', 'purchase_items', 'returns', 'return_items', 'stock_adjustments', 'stock_transfers']
  },
  {
    id: 'management',
    name: 'Management',
    description: 'Customers, Suppliers, Expenses, Commissions, Referral Persons, Receivables, Payables',
    tables: ['customers', 'suppliers', 'expenses', 'commissions', 'referral_persons', 'account_receivables', 'account_payables']
  },
  {
    id: 'finance',
    name: 'Finance',
    description: 'Cash Register, Chart of Accounts',
    tables: ['cash_register_sessions', 'cash_register_transactions', 'chart_of_accounts', 'journal_entries', 'journal_entry_lines']
  },
  {
    id: 'sales',
    name: 'Sales',
    description: 'Sales History, Sale Items, POS Tabs',
    tables: ['sales', 'sale_items', 'sales_tabs', 'sales_tab_items']
  },
  {
    id: 'system',
    name: 'System',
    description: 'Users, Branches, Settings (Warning: may affect login)',
    tables: ['users', 'branches', 'settings', 'business_settings']
  }
]

export interface BackupPreview {
  isValid: boolean
  categories: {
    id: string
    name: string
    description: string
    tables: { name: string; count: number }[]
    totalRecords: number
  }[]
  backupDate: string | null
  backupSize: number
}

// Backup configuration storage
interface BackupConfig {
  autoBackupEnabled: boolean
  autoBackupOnClose: boolean
  autoBackupFrequency: 'daily' | 'weekly' | 'monthly' | 'custom'
  autoBackupTime: string // HH:MM format
  autoBackupDay: number // 0-6 for weekly (Sunday = 0), 1-31 for monthly
  backupRetentionDays: number
  lastBackupTime: string | null
}

let backupConfig: BackupConfig = {
  autoBackupEnabled: false,
  autoBackupOnClose: false,
  autoBackupFrequency: 'daily',
  autoBackupTime: '23:00',
  autoBackupDay: 0,
  backupRetentionDays: 30,
  lastBackupTime: null
}

let backupScheduleTimer: NodeJS.Timeout | null = null

function getBackupDir(): string {
  const userDataPath = app.getPath('userData')
  const backupDir = join(userDataPath, 'backups')

  if (!existsSync(backupDir)) {
    mkdirSync(backupDir, { recursive: true })
  }

  return backupDir
}

function getConfigFilePath(): string {
  const userDataPath = app.getPath('userData')
  return join(userDataPath, 'backup-config.json')
}

function loadBackupConfig(): BackupConfig {
  const configPath = getConfigFilePath()
  try {
    if (existsSync(configPath)) {
      const data = readFileSync(configPath, 'utf-8')
      return { ...backupConfig, ...JSON.parse(data) }
    }
  } catch (err) {
    console.error('Failed to load backup config:', err)
  }
  return backupConfig
}

function saveBackupConfig(config: BackupConfig): void {
  const configPath = getConfigFilePath()
  try {
    writeFileSync(configPath, JSON.stringify(config, null, 2))
    backupConfig = config
  } catch (err) {
    console.error('Failed to save backup config:', err)
  }
}

function generateBackupFileName(): string {
  const now = new Date()
  const timestamp = now.toISOString().replace(/[:.]/g, '-').slice(0, 19)
  return `firearms-pos-backup-${timestamp}.db`
}

async function createBackup(reason: string = 'manual'): Promise<{ success: boolean; message: string; filePath?: string }> {
  try {
    const dbPath = getDbPath()
    const backupDir = getBackupDir()
    const backupFileName = generateBackupFileName()
    const backupPath = join(backupDir, backupFileName)

    // Check if source database exists
    if (!existsSync(dbPath)) {
      return { success: false, message: 'Database file not found' }
    }

    // Get raw database and checkpoint WAL to ensure all data is in main db file
    try {
      const rawDb = getRawDatabase()
      rawDb.pragma('wal_checkpoint(TRUNCATE)')
    } catch (err) {
      console.warn('Could not checkpoint WAL:', err)
    }

    // Copy database file
    copyFileSync(dbPath, backupPath)

    // Also copy WAL and SHM files if they exist
    const walPath = dbPath + '-wal'
    const shmPath = dbPath + '-shm'
    if (existsSync(walPath)) {
      copyFileSync(walPath, backupPath + '-wal')
    }
    if (existsSync(shmPath)) {
      copyFileSync(shmPath, backupPath + '-shm')
    }

    // Update last backup time
    backupConfig.lastBackupTime = new Date().toISOString()
    saveBackupConfig(backupConfig)

    console.log(`Backup created successfully: ${backupPath} (reason: ${reason})`)

    return {
      success: true,
      message: `Backup created successfully: ${backupFileName}`,
      filePath: backupPath
    }
  } catch (err) {
    console.error('Backup creation failed:', err)
    return {
      success: false,
      message: `Failed to create backup: ${err instanceof Error ? err.message : 'Unknown error'}`
    }
  }
}

async function restoreBackup(backupPath: string): Promise<{ success: boolean; message: string }> {
  try {
    // Verify backup file exists
    if (!existsSync(backupPath)) {
      return { success: false, message: 'Backup file not found' }
    }

    const dbPath = getDbPath()

    // Close the current database connection
    closeDatabase()

    // Create a pre-restore backup (safety backup)
    const backupDir = getBackupDir()
    const safetyBackupName = `pre-restore-backup-${Date.now()}.db`
    const safetyBackupPath = join(backupDir, safetyBackupName)

    if (existsSync(dbPath)) {
      copyFileSync(dbPath, safetyBackupPath)
      console.log('Safety backup created before restore:', safetyBackupPath)
    }

    // Remove existing database files
    const walPath = dbPath + '-wal'
    const shmPath = dbPath + '-shm'

    if (existsSync(dbPath)) unlinkSync(dbPath)
    if (existsSync(walPath)) unlinkSync(walPath)
    if (existsSync(shmPath)) unlinkSync(shmPath)

    // Copy backup to database location
    copyFileSync(backupPath, dbPath)

    // Also copy WAL and SHM if they exist in backup
    if (existsSync(backupPath + '-wal')) {
      copyFileSync(backupPath + '-wal', walPath)
    }
    if (existsSync(backupPath + '-shm')) {
      copyFileSync(backupPath + '-shm', shmPath)
    }

    // Reinitialize database
    initDatabase()

    console.log('Database restored successfully from:', backupPath)

    return {
      success: true,
      message: 'Database restored successfully. Please restart the application.'
    }
  } catch (err) {
    console.error('Restore failed:', err)
    // Try to reinitialize database anyway
    try {
      initDatabase()
    } catch (_initErr) {
      // ignore
    }
    return {
      success: false,
      message: `Failed to restore backup: ${err instanceof Error ? err.message : 'Unknown error'}`
    }
  }
}

function listBackups(): { name: string; path: string; size: number; createdAt: string }[] {
  const backupDir = getBackupDir()
  const backups: { name: string; path: string; size: number; createdAt: string }[] = []

  try {
    const files = readdirSync(backupDir)
    for (const file of files) {
      if (file.endsWith('.db') && !file.endsWith('-wal') && !file.endsWith('-shm')) {
        const filePath = join(backupDir, file)
        const stats = statSync(filePath)
        backups.push({
          name: file,
          path: filePath,
          size: stats.size,
          createdAt: stats.mtime.toISOString()
        })
      }
    }
    // Sort by creation date (newest first)
    backups.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  } catch (err) {
    console.error('Failed to list backups:', err)
  }

  return backups
}

function deleteBackup(backupPath: string): { success: boolean; message: string } {
  try {
    if (!existsSync(backupPath)) {
      return { success: false, message: 'Backup file not found' }
    }

    unlinkSync(backupPath)

    // Also delete WAL and SHM files if they exist
    if (existsSync(backupPath + '-wal')) unlinkSync(backupPath + '-wal')
    if (existsSync(backupPath + '-shm')) unlinkSync(backupPath + '-shm')

    return { success: true, message: 'Backup deleted successfully' }
  } catch (err) {
    console.error('Failed to delete backup:', err)
    return {
      success: false,
      message: `Failed to delete backup: ${err instanceof Error ? err.message : 'Unknown error'}`
    }
  }
}

function cleanOldBackups(retentionDays: number): number {
  const backups = listBackups()
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - retentionDays)

  let deletedCount = 0

  for (const backup of backups) {
    const backupDate = new Date(backup.createdAt)
    if (backupDate < cutoffDate) {
      const result = deleteBackup(backup.path)
      if (result.success) {
        deletedCount++
        console.log(`Deleted old backup: ${backup.name}`)
      }
    }
  }

  return deletedCount
}

// Preview backup file contents
async function previewBackup(backupPath: string): Promise<{ success: boolean; message?: string; data?: BackupPreview }> {
  try {
    if (!existsSync(backupPath)) {
      return { success: false, message: 'Backup file not found' }
    }

    const stats = statSync(backupPath)
    const backupDb = new Database(backupPath, { readonly: true })

    try {
      // Get list of tables in the backup
      const tablesResult = backupDb.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all() as { name: string }[]
      const backupTables = tablesResult.map(t => t.name)

      const categories: BackupPreview['categories'] = []

      for (const category of IMPORT_CATEGORIES) {
        const tables: { name: string; count: number }[] = []
        let totalRecords = 0

        for (const tableName of category.tables) {
          if (backupTables.includes(tableName)) {
            try {
              const countResult = backupDb.prepare(`SELECT COUNT(*) as count FROM "${tableName}"`).get() as { count: number }
              const count = countResult?.count || 0
              tables.push({ name: tableName, count })
              totalRecords += count
            } catch (err) {
              // Table might not exist or be corrupted
              tables.push({ name: tableName, count: 0 })
            }
          }
        }

        if (tables.length > 0) {
          categories.push({
            id: category.id,
            name: category.name,
            description: category.description,
            tables,
            totalRecords
          })
        }
      }

      // Try to get backup date from a known table
      let backupDate: string | null = null
      try {
        const dateResult = backupDb.prepare("SELECT MAX(created_at) as latest FROM sales UNION SELECT MAX(created_at) FROM purchases ORDER BY latest DESC LIMIT 1").get() as { latest: string } | undefined
        backupDate = dateResult?.latest || null
      } catch {
        // Ignore - backup date is optional
      }

      backupDb.close()

      return {
        success: true,
        data: {
          isValid: categories.length > 0,
          categories,
          backupDate,
          backupSize: stats.size
        }
      }
    } catch (err) {
      backupDb.close()
      throw err
    }
  } catch (err) {
    console.error('Preview backup failed:', err)
    return {
      success: false,
      message: `Failed to preview backup: ${err instanceof Error ? err.message : 'Unknown error'}`
    }
  }
}

// Tables that should ALWAYS be replaced (singleton tables or those with unique constraints)
const SINGLETON_TABLES = ['business_settings', 'settings']

// Tables with unique constraints that need special handling in merge mode
const UNIQUE_CONSTRAINT_TABLES: Record<string, string[]> = {
  'users': ['username'],
  'branches': ['name'],
  'categories': ['name'],
  'products': ['sku', 'serialNumber']
}

// Selective import from backup
async function importSelective(
  backupPath: string,
  selectedCategories: string[],
  mergeMode: 'replace' | 'merge' = 'replace'
): Promise<{ success: boolean; message: string; imported?: { category: string; tables: string[]; records: number }[] }> {
  try {
    if (!existsSync(backupPath)) {
      return { success: false, message: 'Backup file not found' }
    }

    if (selectedCategories.length === 0) {
      return { success: false, message: 'No categories selected for import' }
    }

    // Get tables to import based on selected categories
    const tablesToImport: string[] = []
    for (const categoryId of selectedCategories) {
      const category = IMPORT_CATEGORIES.find(c => c.id === categoryId)
      if (category) {
        tablesToImport.push(...category.tables)
      }
    }

    if (tablesToImport.length === 0) {
      return { success: false, message: 'No valid tables found for selected categories' }
    }

    // Open backup database in read-only mode
    const backupDb = new Database(backupPath, { readonly: true })

    // Get current database
    const currentDb = getRawDatabase()

    // Create safety backup before import
    const backupDir = getBackupDir()
    const safetyBackupName = `pre-import-backup-${Date.now()}.db`
    const safetyBackupPath = join(backupDir, safetyBackupName)
    const dbPath = getDbPath()

    try {
      currentDb.pragma('wal_checkpoint(TRUNCATE)')
      copyFileSync(dbPath, safetyBackupPath)
      console.log('Safety backup created before selective import:', safetyBackupPath)
    } catch (err) {
      console.warn('Could not create safety backup:', err)
    }

    const imported: { category: string; tables: string[]; records: number }[] = []

    // Get list of tables in the backup
    const tablesResult = backupDb.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").all() as { name: string }[]
    const backupTables = tablesResult.map(t => t.name)

    // Process each selected category
    for (const categoryId of selectedCategories) {
      const category = IMPORT_CATEGORIES.find(c => c.id === categoryId)
      if (!category) continue

      const importedTables: string[] = []
      let totalRecords = 0

      for (const tableName of category.tables) {
        if (!backupTables.includes(tableName)) continue

        try {
          // Check if table exists in current database
          const tableExistsResult = currentDb.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name=?").get(tableName) as { name: string } | undefined

          if (!tableExistsResult) {
            console.log(`Table ${tableName} does not exist in current database, skipping`)
            continue
          }

          // Get column info from current database to ensure compatibility
          const columnsResult = currentDb.prepare(`PRAGMA table_info("${tableName}")`).all() as { name: string }[]
          const currentColumns = columnsResult.map(c => c.name)

          // Get data from backup
          const rows = backupDb.prepare(`SELECT * FROM "${tableName}"`).all() as Record<string, unknown>[]

          if (rows.length === 0) continue

          // Filter columns to only those that exist in current schema
          const backupColumns = Object.keys(rows[0])
          const validColumns = backupColumns.filter(c => currentColumns.includes(c))

          if (validColumns.length === 0) continue

          // Determine if this is a singleton table (should always be replaced)
          const isSingleton = SINGLETON_TABLES.includes(tableName)

          // Determine the appropriate import mode for this table
          const effectiveMode = isSingleton ? 'replace' : mergeMode

          // Get unique constraint columns for this table (if any)
          const uniqueColumns = UNIQUE_CONSTRAINT_TABLES[tableName] || []

          // Begin transaction for this table
          const transaction = currentDb.transaction(() => {
            currentDb.pragma('foreign_keys = OFF')

            if (effectiveMode === 'replace') {
              // Clear existing data for replace mode or singleton tables
              currentDb.prepare(`DELETE FROM "${tableName}"`).run()
              console.log(`Cleared existing data from ${tableName} (${isSingleton ? 'singleton table' : 'replace mode'})`)
            }

            // Prepare insert statement based on mode
            const placeholders = validColumns.map(() => '?').join(', ')
            const columnNames = validColumns.map(c => `"${c}"`).join(', ')

            let insertedCount = 0
            let skippedCount = 0

            if (effectiveMode === 'merge' && uniqueColumns.length > 0) {
              // For merge mode with unique constraints, check for duplicates first
              for (const row of rows) {
                const values = validColumns.map(col => row[col])

                // Check if record with same unique values already exists
                let isDuplicate = false
                for (const uniqueCol of uniqueColumns) {
                  if (validColumns.includes(uniqueCol) && row[uniqueCol]) {
                    const existingCheck = currentDb.prepare(
                      `SELECT COUNT(*) as count FROM "${tableName}" WHERE "${uniqueCol}" = ?`
                    ).get(row[uniqueCol]) as { count: number }

                    if (existingCheck.count > 0) {
                      isDuplicate = true
                      break
                    }
                  }
                }

                if (isDuplicate) {
                  skippedCount++
                  continue
                }

                try {
                  // Use INSERT OR IGNORE to safely handle any other potential conflicts
                  const insertStmt = currentDb.prepare(
                    `INSERT OR IGNORE INTO "${tableName}" (${columnNames}) VALUES (${placeholders})`
                  )
                  const result = insertStmt.run(...values)
                  if (result.changes > 0) {
                    insertedCount++
                  } else {
                    skippedCount++
                  }
                } catch (insertErr) {
                  console.warn(`Failed to insert row into ${tableName}:`, insertErr)
                  skippedCount++
                }
              }
            } else {
              // For replace mode or tables without unique constraints
              const insertStmt = currentDb.prepare(
                `INSERT OR REPLACE INTO "${tableName}" (${columnNames}) VALUES (${placeholders})`
              )

              for (const row of rows) {
                const values = validColumns.map(col => row[col])
                try {
                  insertStmt.run(...values)
                  insertedCount++
                } catch (insertErr) {
                  console.warn(`Failed to insert row into ${tableName}:`, insertErr)
                  skippedCount++
                }
              }
            }

            currentDb.pragma('foreign_keys = ON')

            if (skippedCount > 0) {
              console.log(`${tableName}: Inserted ${insertedCount}, Skipped ${skippedCount} duplicates`)
            }
          })

          transaction()

          importedTables.push(tableName)
          totalRecords += rows.length
          console.log(`Processed ${rows.length} records for ${tableName}`)
        } catch (tableErr) {
          console.error(`Failed to import table ${tableName}:`, tableErr)
        }
      }

      if (importedTables.length > 0) {
        imported.push({
          category: category.name,
          tables: importedTables,
          records: totalRecords
        })
      }
    }

    backupDb.close()

    if (imported.length === 0) {
      return { success: false, message: 'No data was imported. The selected categories may be empty or incompatible.' }
    }

    const totalImported = imported.reduce((sum, cat) => sum + cat.records, 0)

    return {
      success: true,
      message: `Successfully imported ${totalImported} records from ${imported.length} category(ies)`,
      imported
    }
  } catch (err) {
    console.error('Selective import failed:', err)
    return {
      success: false,
      message: `Import failed: ${err instanceof Error ? err.message : 'Unknown error'}`
    }
  }
}

function scheduleNextBackup(): void {
  // Clear existing timer
  if (backupScheduleTimer) {
    clearTimeout(backupScheduleTimer)
    backupScheduleTimer = null
    console.log('Cleared existing backup schedule')
  }

  if (!backupConfig.autoBackupEnabled) {
    console.log('Auto backup is disabled, not scheduling')
    return
  }

  try {
    const now = new Date()
    let nextBackupTime: Date

    // Parse time safely
    const timeParts = backupConfig.autoBackupTime.split(':')
    const hours = parseInt(timeParts[0]) || 23
    const minutes = parseInt(timeParts[1]) || 0

    switch (backupConfig.autoBackupFrequency) {
      case 'daily': {
        nextBackupTime = new Date(now)
        nextBackupTime.setHours(hours, minutes, 0, 0)
        if (nextBackupTime <= now) {
          nextBackupTime.setDate(nextBackupTime.getDate() + 1)
        }
        break
      }
      case 'weekly': {
        nextBackupTime = new Date(now)
        nextBackupTime.setHours(hours, minutes, 0, 0)
        const targetDay = backupConfig.autoBackupDay || 0
        const daysUntilTarget = (targetDay - now.getDay() + 7) % 7
        if (daysUntilTarget === 0 && nextBackupTime <= now) {
          nextBackupTime.setDate(nextBackupTime.getDate() + 7)
        } else {
          nextBackupTime.setDate(nextBackupTime.getDate() + daysUntilTarget)
        }
        break
      }
      case 'monthly': {
        nextBackupTime = new Date(now)
        const targetDayOfMonth = Math.min(Math.max(backupConfig.autoBackupDay || 1, 1), 28)
        nextBackupTime.setDate(targetDayOfMonth)
        nextBackupTime.setHours(hours, minutes, 0, 0)
        if (nextBackupTime <= now) {
          nextBackupTime.setMonth(nextBackupTime.getMonth() + 1)
        }
        break
      }
      default:
        console.log('Unknown backup frequency:', backupConfig.autoBackupFrequency)
        return
    }

    const delay = nextBackupTime.getTime() - now.getTime()

    // Maximum timeout value in JavaScript is about 24.8 days
    // For longer delays, we'll set a shorter interval and recalculate
    const MAX_TIMEOUT = 24 * 60 * 60 * 1000 // 24 hours in ms

    if (delay > MAX_TIMEOUT) {
      console.log(`Next backup scheduled for: ${nextBackupTime.toISOString()}`)
      console.log(`Delay too long (${Math.round(delay / 1000 / 60 / 60)} hours), will recheck in 24 hours`)

      backupScheduleTimer = setTimeout(() => {
        scheduleNextBackup()
      }, MAX_TIMEOUT)
    } else {
      console.log(`Next backup scheduled for: ${nextBackupTime.toISOString()} (in ${Math.round(delay / 1000 / 60)} minutes)`)

      backupScheduleTimer = setTimeout(async () => {
        console.log('Running scheduled backup...')
        try {
          const result = await createBackup('scheduled')
          if (result.success) {
            console.log('Scheduled backup completed successfully')
            // Clean old backups after successful backup
            cleanOldBackups(backupConfig.backupRetentionDays)
          } else {
            console.error('Scheduled backup failed:', result.message)
          }
        } catch (err) {
          console.error('Error during scheduled backup:', err)
        }
        // Schedule next backup
        scheduleNextBackup()
      }, delay)
    }
  } catch (err) {
    console.error('Error scheduling backup:', err)
  }
}

export function registerBackupHandlers(): void {
  // Load saved config on startup
  backupConfig = loadBackupConfig()

  // Start backup scheduler
  scheduleNextBackup()

  // Create backup now
  ipcMain.handle('backup:create', async (_) => {
    const result = await createBackup('manual')
    return result
  })

  // Restore from backup
  ipcMain.handle('backup:restore', async (_, backupPath: string) => {
    const result = await restoreBackup(backupPath)
    return result
  })

  // List all backups
  ipcMain.handle('backup:list', async () => {
    return { success: true, data: listBackups() }
  })

  // Delete a specific backup
  ipcMain.handle('backup:delete', async (_, backupPath: string) => {
    const result = deleteBackup(backupPath)
    return result
  })

  // Get backup configuration
  ipcMain.handle('backup:get-config', async () => {
    return { success: true, data: backupConfig }
  })

  // Update backup configuration
  ipcMain.handle('backup:update-config', async (_, newConfig: Partial<BackupConfig>) => {
    console.log('backup:update-config called with:', newConfig)
    try {
      const previousConfig = { ...backupConfig }
      backupConfig = { ...backupConfig, ...newConfig }
      saveBackupConfig(backupConfig)
      console.log('Backup config saved:', backupConfig)

      // Reschedule backups if auto backup settings changed
      if (
        previousConfig.autoBackupEnabled !== backupConfig.autoBackupEnabled ||
        previousConfig.autoBackupFrequency !== backupConfig.autoBackupFrequency ||
        previousConfig.autoBackupTime !== backupConfig.autoBackupTime ||
        previousConfig.autoBackupDay !== backupConfig.autoBackupDay
      ) {
        console.log('Auto backup settings changed, rescheduling...')
        scheduleNextBackup()
      }

      return { success: true, message: 'Backup configuration updated', data: backupConfig }
    } catch (err) {
      console.error('Failed to update backup config:', err)
      return {
        success: false,
        message: `Failed to update config: ${err instanceof Error ? err.message : String(err)}`
      }
    }
  })

  // Export backup to custom location (file dialog)
  ipcMain.handle('backup:export', async () => {
    console.log('backup:export called')
    try {
      // Get all windows and use the first one if no focused window
      const focusedWindow = BrowserWindow.getFocusedWindow() || BrowserWindow.getAllWindows()[0]

      if (!focusedWindow) {
        console.error('No browser window available for dialog')
        return { success: false, message: 'No window available for dialog' }
      }

      const defaultFileName = generateBackupFileName()
      console.log('Opening save dialog with default filename:', defaultFileName)

      const result = await dialog.showSaveDialog(focusedWindow, {
        title: 'Export Database Backup',
        defaultPath: defaultFileName,
        filters: [
          { name: 'SQLite Database', extensions: ['db'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      })

      console.log('Save dialog result:', result)

      if (result.canceled || !result.filePath) {
        return { success: false, message: 'Export cancelled' }
      }

      const dbPath = getDbPath()
      console.log('Database path:', dbPath)

      // Check if database exists
      if (!existsSync(dbPath)) {
        console.error('Database file not found at:', dbPath)
        return { success: false, message: 'Database file not found' }
      }

      // Checkpoint WAL before export
      try {
        const rawDb = getRawDatabase()
        rawDb.pragma('wal_checkpoint(TRUNCATE)')
        console.log('WAL checkpoint completed')
      } catch (walErr) {
        console.warn('Could not checkpoint WAL:', walErr)
      }

      copyFileSync(dbPath, result.filePath)
      console.log('Database copied to:', result.filePath)

      return { success: true, message: `Database exported successfully to: ${result.filePath}`, filePath: result.filePath }
    } catch (err) {
      console.error('Export backup failed:', err)
      return {
        success: false,
        message: `Export failed: ${err instanceof Error ? err.message : String(err)}`
      }
    }
  })

  // Import backup from file (file dialog)
  ipcMain.handle('backup:import', async (_, userId?: number) => {
    console.log('backup:import called')
    try {
      // Get all windows and use the first one if no focused window
      const focusedWindow = BrowserWindow.getFocusedWindow() || BrowserWindow.getAllWindows()[0]

      if (!focusedWindow) {
        console.error('No browser window available for dialog')
        return { success: false, message: 'No window available for dialog' }
      }

      console.log('Opening open dialog for import')

      const result = await dialog.showOpenDialog(focusedWindow, {
        title: 'Import Database Backup',
        filters: [
          { name: 'SQLite Database', extensions: ['db'] },
          { name: 'All Files', extensions: ['*'] }
        ],
        properties: ['openFile']
      })

      console.log('Open dialog result:', result)

      if (result.canceled || result.filePaths.length === 0) {
        return { success: false, message: 'Import cancelled' }
      }

      const importPath = result.filePaths[0]
      console.log('Import path selected:', importPath)

      // Verify the selected file exists and is readable
      if (!existsSync(importPath)) {
        console.error('Selected file does not exist:', importPath)
        return { success: false, message: 'Selected file does not exist' }
      }

      console.log('Starting restore from:', importPath)
      const restoreResult = await restoreBackup(importPath)
      console.log('Restore result:', restoreResult)

      if (restoreResult.success && userId) {
        try {
          await createAuditLog({
            userId,
            action: 'BACKUP_IMPORT',
            entityType: 'system',
            entityId: 0,
            details: { filePath: importPath }
          })
        } catch (auditErr) {
          console.warn('Audit log failed after import:', auditErr)
        }
      }

      return restoreResult
    } catch (err) {
      console.error('Import backup failed:', err)
      return {
        success: false,
        message: `Import failed: ${err instanceof Error ? err.message : String(err)}`
      }
    }
  })

  // Clean old backups manually
  ipcMain.handle('backup:clean-old', async (_, retentionDays?: number) => {
    const days = retentionDays ?? backupConfig.backupRetentionDays
    const deletedCount = cleanOldBackups(days)
    return {
      success: true,
      message: `Cleaned ${deletedCount} old backup(s)`,
      deletedCount
    }
  })

  // Get backup directory path
  ipcMain.handle('backup:get-directory', async () => {
    return { success: true, data: getBackupDir() }
  })

  // Get available import categories
  ipcMain.handle('backup:get-import-categories', async () => {
    return {
      success: true,
      data: IMPORT_CATEGORIES.map(c => ({
        id: c.id,
        name: c.name,
        description: c.description
      }))
    }
  })

  // Preview backup file (select file and show contents)
  ipcMain.handle('backup:preview', async (_, backupPath?: string) => {
    try {
      let filePath = backupPath

      // If no path provided, open file dialog
      if (!filePath) {
        const focusedWindow = BrowserWindow.getFocusedWindow() || BrowserWindow.getAllWindows()[0]
        if (!focusedWindow) {
          return { success: false, message: 'No window available for dialog' }
        }

        const result = await dialog.showOpenDialog(focusedWindow, {
          title: 'Select Backup File to Import',
          filters: [
            { name: 'SQLite Database', extensions: ['db'] },
            { name: 'All Files', extensions: ['*'] }
          ],
          properties: ['openFile']
        })

        if (result.canceled || result.filePaths.length === 0) {
          return { success: false, message: 'File selection cancelled' }
        }

        filePath = result.filePaths[0]
      }

      const previewResult = await previewBackup(filePath)

      if (previewResult.success && previewResult.data) {
        return {
          success: true,
          data: {
            ...previewResult.data,
            filePath
          }
        }
      }

      return previewResult
    } catch (err) {
      console.error('Preview failed:', err)
      return {
        success: false,
        message: `Preview failed: ${err instanceof Error ? err.message : String(err)}`
      }
    }
  })

  // Selective import from backup
  ipcMain.handle('backup:import-selective', async (_, params: {
    filePath: string
    categories: string[]
    mergeMode?: 'replace' | 'merge'
  }) => {
    try {
      const { filePath, categories, mergeMode = 'replace' } = params

      if (!filePath) {
        return { success: false, message: 'No backup file specified' }
      }

      if (!categories || categories.length === 0) {
        return { success: false, message: 'No categories selected' }
      }

      console.log(`Starting selective import from ${filePath}`)
      console.log(`Categories: ${categories.join(', ')}`)
      console.log(`Mode: ${mergeMode}`)

      const result = await importSelective(filePath, categories, mergeMode)

      return result
    } catch (err) {
      console.error('Selective import failed:', err)
      return {
        success: false,
        message: `Import failed: ${err instanceof Error ? err.message : String(err)}`
      }
    }
  })

  // Full database import (legacy - now shows warning to use selective import)
  ipcMain.handle('backup:import-full', async (_, backupPath: string) => {
    console.log('Full import requested for:', backupPath)
    const result = await restoreBackup(backupPath)
    return result
  })

  console.log('Backup IPC handlers registered')
}

// Function to trigger backup on application close
export async function performCloseBackup(): Promise<void> {
  if (backupConfig.autoBackupOnClose) {
    console.log('Performing backup on application close...')
    await createBackup('on-close')
  }
}

// Function to stop the backup scheduler
export function stopBackupScheduler(): void {
  if (backupScheduleTimer) {
    clearTimeout(backupScheduleTimer)
    backupScheduleTimer = null
  }
}
