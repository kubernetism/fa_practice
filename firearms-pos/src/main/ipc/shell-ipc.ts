import { ipcMain, shell } from 'electron'

export function registerShellHandlers(): void {
  ipcMain.handle('shell:openPath', async (_, filePath: string) => {
    try {
      const result = await shell.openPath(filePath)
      if (result) {
        // shell.openPath returns an error string if it fails, empty string on success
        return { success: false, message: result }
      }
      return { success: true }
    } catch (error) {
      return { success: false, message: String(error) }
    }
  })
}
