import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'node:path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { initDatabase, closeDatabase } from './db'
import { runMigrations, seedInitialData } from './db/migrate'
import { registerAllHandlers } from './ipc'
import { performCloseBackup, stopBackupScheduler } from './ipc/backup-ipc'

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
    // Initialize database
    initDatabase()
    console.log('Database initialized')

    // Run migrations
    await runMigrations()

    // Seed initial data
    await seedInitialData()

    // Register IPC handlers
    registerAllHandlers()
    console.log('IPC handlers registered')
  } catch (error) {
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

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', async () => {
  // Perform backup on close if enabled
  await performCloseBackup()
  stopBackupScheduler()
  closeDatabase()
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// Handle app quit
app.on('before-quit', async () => {
  // Perform backup on close if enabled
  await performCloseBackup()
  stopBackupScheduler()
  closeDatabase()
})
