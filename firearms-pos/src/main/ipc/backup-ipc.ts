import { ipcMain, app, dialog, BrowserWindow } from 'electron'
import { getDbPath, closeDatabase, initDatabase, getRawDatabase } from '../db'
import { existsSync, mkdirSync, copyFileSync, readdirSync, statSync, unlinkSync, readFileSync, writeFileSync } from 'node:fs'
import { join, basename } from 'node:path'
import { logAudit } from '../utils/audit'

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
  ipcMain.handle('backup:create', async (_, userId?: number) => {
    const result = await createBackup('manual')
    if (result.success && userId) {
      await logAudit({
        userId,
        action: 'BACKUP_CREATE',
        entityType: 'system',
        entityId: 0,
        details: { filePath: result.filePath }
      })
    }
    return result
  })

  // Restore from backup
  ipcMain.handle('backup:restore', async (_, backupPath: string, userId?: number) => {
    const result = await restoreBackup(backupPath)
    if (result.success && userId) {
      try {
        await logAudit({
          userId,
          action: 'BACKUP_RESTORE',
          entityType: 'system',
          entityId: 0,
          details: { backupPath }
        })
      } catch (_err) {
        // Audit log may fail after restore
      }
    }
    return result
  })

  // List all backups
  ipcMain.handle('backup:list', async () => {
    return { success: true, data: listBackups() }
  })

  // Delete a specific backup
  ipcMain.handle('backup:delete', async (_, backupPath: string, userId?: number) => {
    const result = deleteBackup(backupPath)
    if (result.success && userId) {
      await logAudit({
        userId,
        action: 'BACKUP_DELETE',
        entityType: 'system',
        entityId: 0,
        details: { backupPath }
      })
    }
    return result
  })

  // Get backup configuration
  ipcMain.handle('backup:get-config', async () => {
    return { success: true, data: backupConfig }
  })

  // Update backup configuration
  ipcMain.handle('backup:update-config', async (_, newConfig: Partial<BackupConfig>, userId?: number) => {
    try {
      backupConfig = { ...backupConfig, ...newConfig }
      saveBackupConfig(backupConfig)

      // Reschedule backups if needed
      scheduleNextBackup()

      if (userId) {
        await logAudit({
          userId,
          action: 'BACKUP_CONFIG_UPDATE',
          entityType: 'system',
          entityId: 0,
          details: newConfig
        })
      }

      return { success: true, message: 'Backup configuration updated', data: backupConfig }
    } catch (err) {
      return {
        success: false,
        message: `Failed to update config: ${err instanceof Error ? err.message : 'Unknown error'}`
      }
    }
  })

  // Export backup to custom location (file dialog)
  ipcMain.handle('backup:export', async (_, userId?: number) => {
    try {
      const focusedWindow = BrowserWindow.getFocusedWindow()

      const dialogOptions = {
        title: 'Export Database Backup',
        defaultPath: generateBackupFileName(),
        filters: [
          { name: 'SQLite Database', extensions: ['db'] },
          { name: 'All Files', extensions: ['*'] }
        ]
      }

      const result = focusedWindow
        ? await dialog.showSaveDialog(focusedWindow, dialogOptions)
        : await dialog.showSaveDialog(dialogOptions)

      if (result.canceled || !result.filePath) {
        return { success: false, message: 'Export cancelled' }
      }

      const dbPath = getDbPath()

      // Check if database exists
      if (!existsSync(dbPath)) {
        return { success: false, message: 'Database file not found' }
      }

      // Checkpoint WAL before export
      try {
        const rawDb = getRawDatabase()
        rawDb.pragma('wal_checkpoint(TRUNCATE)')
      } catch (walErr) {
        console.warn('Could not checkpoint WAL:', walErr)
      }

      copyFileSync(dbPath, result.filePath)

      if (userId) {
        await logAudit({
          userId,
          action: 'BACKUP_EXPORT',
          entityType: 'system',
          entityId: 0,
          details: { filePath: result.filePath }
        })
      }

      return { success: true, message: `Database exported successfully to: ${result.filePath}`, filePath: result.filePath }
    } catch (err) {
      console.error('Export backup failed:', err)
      return {
        success: false,
        message: `Export failed: ${err instanceof Error ? err.message : 'Unknown error'}`
      }
    }
  })

  // Import backup from file (file dialog)
  ipcMain.handle('backup:import', async (_, userId?: number) => {
    try {
      const focusedWindow = BrowserWindow.getFocusedWindow()

      const dialogOptions = {
        title: 'Import Database Backup',
        filters: [
          { name: 'SQLite Database', extensions: ['db'] },
          { name: 'All Files', extensions: ['*'] }
        ],
        properties: ['openFile'] as const
      }

      const result = focusedWindow
        ? await dialog.showOpenDialog(focusedWindow, dialogOptions)
        : await dialog.showOpenDialog(dialogOptions)

      if (result.canceled || result.filePaths.length === 0) {
        return { success: false, message: 'Import cancelled' }
      }

      const importPath = result.filePaths[0]

      // Verify the selected file exists and is readable
      if (!existsSync(importPath)) {
        return { success: false, message: 'Selected file does not exist' }
      }

      const restoreResult = await restoreBackup(importPath)

      if (restoreResult.success && userId) {
        try {
          await logAudit({
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
        message: `Import failed: ${err instanceof Error ? err.message : 'Unknown error'}`
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
