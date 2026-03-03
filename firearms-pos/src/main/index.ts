import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'node:path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { initDatabase, closeDatabase } from './db'
import { runMigrations, seedInitialData } from './db/migrate'
import { registerAllHandlers, registerLicenseOnlyHandlers, setApplicationLocked } from './ipc'
import { performCloseBackup, stopBackupScheduler } from './ipc/backup-ipc'
import { initializeEncryption } from './utils/encryption'
import { isDbEncrypted } from './utils/db-cipher'
import { checkAndLockIfExpired, lockApplication } from './ipc/license-ipc'

// Global error handler for uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error)
  dialog.showErrorBox('Application Error', `An unexpected error occurred:\n\n${error.message}\n\n${error.stack}`)
  app.quit()
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
})

let mainWindow: BrowserWindow | null = null
let isAppLocked = false

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    // Open external links in browser
    require('electron').shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // Load the renderer
  if (is.dev && process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// Initialize app
app.whenReady().then(async () => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.firearms.pos')

  // Default open or close DevTools by F12 in development
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  try {
    // Check if the database is already encrypted (from a previous lock)
    if (isDbEncrypted()) {
      console.log('Database is encrypted from previous lock. Starting in locked mode.')
      isAppLocked = true
      setApplicationLocked(true)

      // Initialize encryption utility (for sensitive data, not DB cipher)
      initializeEncryption()

      // Only register license handlers (DB is encrypted, can't register others)
      registerLicenseOnlyHandlers()
      console.log('License-only IPC handlers registered (locked mode)')
    } else {
      // Normal startup: Initialize database
      initDatabase()
      console.log('Database initialized')

      // Initialize encryption for sensitive data (Section 5.3 Security)
      initializeEncryption()
      console.log('Encryption initialized')

      // Run migrations
      await runMigrations()

      // Seed initial data
      await seedInitialData()

      // Check if trial/license has expired
      const shouldLock = checkAndLockIfExpired()

      if (shouldLock) {
        console.log('Trial/License expired - locking application...')
        try {
          const lockResult = lockApplication()
          if (lockResult.success) {
            console.log('Application locked and database encrypted')
          } else {
            console.error('Failed to lock application:', lockResult.message)
          }
        } catch (lockError) {
          console.error('Error during lock application:', lockError)
        }
        // Always enter locked mode when trial/license expired, even if encryption fails
        isAppLocked = true
        setApplicationLocked(true)
        registerLicenseOnlyHandlers()
      } else {
        // Register all IPC handlers
        registerAllHandlers()
        console.log('IPC handlers registered')
      }
    }
  } catch (error) {
    // Check if this is the DATABASE_ENCRYPTED error
    if (error instanceof Error && error.message === 'DATABASE_ENCRYPTED') {
      console.log('Database is encrypted - starting in locked mode')
      isAppLocked = true
      setApplicationLocked(true)
      initializeEncryption()
      registerLicenseOnlyHandlers()
    } else {
      console.error('Failed to initialize app:', error)
      const errorMessage = error instanceof Error ? error.message : String(error)
      const errorStack = error instanceof Error ? error.stack : ''
      dialog.showErrorBox(
        'Initialization Error',
        `Failed to initialize the application:\n\n${errorMessage}\n\n${errorStack}`
      )
      app.quit()
      return
    }
  }

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', async () => {
  // Perform backup on close if enabled
  if (!isAppLocked) {
    await performCloseBackup()
    stopBackupScheduler()
  }
  closeDatabase()
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// Handle app quit
app.on('before-quit', async () => {
  // Perform backup on close if enabled
  if (!isAppLocked) {
    await performCloseBackup()
    stopBackupScheduler()
  }
  closeDatabase()
})
