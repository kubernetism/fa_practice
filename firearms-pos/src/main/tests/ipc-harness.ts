import { vi } from 'vitest'

type Handler = (event: unknown, ...args: unknown[]) => unknown

const handlers = new Map<string, Handler>()

export function mockIpcMain() {
  return {
    handle: (channel: string, handler: Handler) => {
      handlers.set(channel, handler)
    },
    removeHandler: (channel: string) => {
      handlers.delete(channel)
    },
    _invokeFor: async <T = unknown>(channel: string, ...args: unknown[]): Promise<T> => {
      const handler = handlers.get(channel)
      if (!handler) throw new Error(`No IPC handler registered for channel: ${channel}`)
      return (await handler({}, ...args)) as T
    },
    _reset: () => {
      handlers.clear()
    },
  }
}

export function applyIpcMainMock() {
  const mock = mockIpcMain()
  vi.mock('electron', () => ({ ipcMain: mock }))
  return mock
}

export async function invoke<T = unknown>(channel: string, ...args: unknown[]): Promise<T> {
  const { ipcMain } = await import('electron')
  return await (ipcMain as unknown as {
    _invokeFor: (ch: string, ...a: unknown[]) => Promise<T>
  })._invokeFor(channel, ...args)
}

export function resetIpcHandlers() {
  handlers.clear()
}
