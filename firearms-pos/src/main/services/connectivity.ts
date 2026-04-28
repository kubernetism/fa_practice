import { EventEmitter } from 'node:events'

export interface ConnectivityDeps {
  fetchImpl?: typeof fetch
  intervalMs?: number
  timeoutMs?: number
  probeUrl?: string
  preCheck?: () => boolean
}

function defaultPreCheck(): boolean {
  try {
    // Lazy require so this module is safe in non-Electron (test) environments.
    // biome-ignore lint/suspicious/noExplicitAny: dynamic require shape is permissive
    const req: any = (globalThis as any).require
    if (typeof req !== 'function') return true
    // biome-ignore lint/suspicious/noExplicitAny: electron module shape is dynamic at runtime
    const electron: any = req('electron')
    const isOnline = electron?.net?.isOnline
    if (typeof isOnline === 'function') return Boolean(isOnline())
    const appIsOnline = electron?.app?.net?.isOnline
    if (typeof appIsOnline === 'function') return Boolean(appIsOnline())
    return true
  } catch {
    return true
  }
}

export class ConnectivityWatcher extends EventEmitter {
  private online: boolean | null = null
  private timer: NodeJS.Timeout | null = null
  private running = false
  private fetchImpl: typeof fetch
  private intervalMs: number
  private timeoutMs: number
  private probeUrl: string
  private preCheck: () => boolean

  constructor(deps: ConnectivityDeps = {}) {
    super()
    this.fetchImpl = deps.fetchImpl ?? fetch
    this.intervalMs = deps.intervalMs ?? 30_000
    this.timeoutMs = deps.timeoutMs ?? 5_000
    this.probeUrl = deps.probeUrl ?? 'https://www.google.com/generate_204'
    this.preCheck = deps.preCheck ?? defaultPreCheck
  }

  start(): void {
    if (this.running) return
    this.running = true
    // Fire an immediate probe; ignore returned promise (errors are swallowed inside).
    void this.probeOnce()
    this.timer = setInterval(() => {
      void this.probeOnce()
    }, this.intervalMs)
  }

  stop(): void {
    if (!this.running) return
    this.running = false
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
  }

  isOnline(): boolean {
    // Default to true before any probe completes so the upload queue isn't
    // unnecessarily blocked at startup.
    return this.online ?? true
  }

  async probeOnce(): Promise<boolean> {
    let next: boolean

    if (!this.preCheck()) {
      next = false
    } else {
      try {
        const res = await this.fetchImpl(this.probeUrl, {
          method: 'HEAD',
          signal: AbortSignal.timeout(this.timeoutMs),
        })
        next = res.status === 204 || (res.status >= 200 && res.status < 300)
      } catch {
        next = false
      }
    }

    const prev = this.online
    this.online = next
    if (prev !== next) {
      this.emit('change', next)
      this.emit(next ? 'online' : 'offline')
    }
    return next
  }
}
