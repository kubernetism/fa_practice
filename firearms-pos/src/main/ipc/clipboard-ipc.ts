import { ipcMain, clipboard, nativeImage } from 'electron'

export function registerClipboardHandlers(): void {
  ipcMain.handle('clipboard:copy-image', async (_, dataUrl: string) => {
    try {
      const image = nativeImage.createFromDataURL(dataUrl)
      clipboard.writeImage(image)
      return { success: true }
    } catch (error) {
      console.error('Clipboard copy image error:', error)
      return { success: false, message: 'Failed to copy image to clipboard' }
    }
  })
}
