import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ConnectivityWatcher } from '../connectivity'

function mockFetch(behavior: 'ok' | 'fail' | (() => Promise<Response> | Response)): typeof fetch {
  // biome-ignore lint/suspicious/noExplicitAny: test mock needs a permissive signature
  return ((..._args: any[]) => {
    if (behavior === 'ok') return Promise.resolve(new Response(null, { status: 204 }))
    if (behavior === 'fail') return Promise.reject(new Error('network'))
    const r = behavior()
    return r instanceof Promise ? r : Promise.resolve(r)
    // biome-ignore lint/suspicious/noExplicitAny: cast to fetch shape
  }) as any
}

describe('ConnectivityWatcher', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('probeOnce returns true on 204 and emits online + change(true) on first probe', async () => {
    const fetchImpl = vi.fn(mockFetch('ok'))
    const w = new ConnectivityWatcher({ fetchImpl })
    const onChange = vi.fn()
    const onOnline = vi.fn()
    const onOffline = vi.fn()
    w.on('change', onChange)
    w.on('online', onOnline)
    w.on('offline', onOffline)

    const result = await w.probeOnce()
    expect(result).toBe(true)
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith(true)
    expect(onOnline).toHaveBeenCalledTimes(1)
    expect(onOffline).not.toHaveBeenCalled()
    expect(fetchImpl).toHaveBeenCalledTimes(1)
  })

  it('probeOnce returns false when fetch throws and emits offline + change(false)', async () => {
    const fetchImpl = vi.fn(mockFetch('fail'))
    const w = new ConnectivityWatcher({ fetchImpl })
    const onChange = vi.fn()
    const onOnline = vi.fn()
    const onOffline = vi.fn()
    w.on('change', onChange)
    w.on('online', onOnline)
    w.on('offline', onOffline)

    const result = await w.probeOnce()
    expect(result).toBe(false)
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith(false)
    expect(onOffline).toHaveBeenCalledTimes(1)
    expect(onOnline).not.toHaveBeenCalled()
  })

  it("transitions only emit on change: two consecutive online probes emit 'change' once", async () => {
    const fetchImpl = vi.fn(mockFetch('ok'))
    const w = new ConnectivityWatcher({ fetchImpl })
    const onChange = vi.fn()
    w.on('change', onChange)

    await w.probeOnce()
    await w.probeOnce()

    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith(true)
  })

  it('preCheck returning false short-circuits and fetch is NOT called', async () => {
    const fetchImpl = vi.fn(mockFetch('ok'))
    const preCheck = vi.fn(() => false)
    const w = new ConnectivityWatcher({ fetchImpl, preCheck })
    const onChange = vi.fn()
    const onOffline = vi.fn()
    w.on('change', onChange)
    w.on('offline', onOffline)

    const result = await w.probeOnce()
    expect(result).toBe(false)
    expect(fetchImpl).not.toHaveBeenCalled()
    expect(preCheck).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith(false)
    expect(onOffline).toHaveBeenCalledTimes(1)
  })

  it('start() runs an immediate probe and schedules subsequent probes at intervalMs', async () => {
    const fetchImpl = vi.fn(mockFetch('ok'))
    const w = new ConnectivityWatcher({ fetchImpl, intervalMs: 1000 })

    w.start()
    // Immediate probe is async; flush microtasks.
    await vi.advanceTimersByTimeAsync(0)
    expect(fetchImpl).toHaveBeenCalledTimes(1)

    await vi.advanceTimersByTimeAsync(1000)
    expect(fetchImpl).toHaveBeenCalledTimes(2)

    await vi.advanceTimersByTimeAsync(1000)
    expect(fetchImpl).toHaveBeenCalledTimes(3)

    w.stop()
  })

  it('stop() clears the timer — no further probes', async () => {
    const fetchImpl = vi.fn(mockFetch('ok'))
    const w = new ConnectivityWatcher({ fetchImpl, intervalMs: 1000 })

    w.start()
    await vi.advanceTimersByTimeAsync(0)
    expect(fetchImpl).toHaveBeenCalledTimes(1)

    w.stop()
    await vi.advanceTimersByTimeAsync(5000)
    expect(fetchImpl).toHaveBeenCalledTimes(1)
  })

  it('isOnline() returns true before any probe runs', () => {
    const fetchImpl = vi.fn(mockFetch('ok'))
    const w = new ConnectivityWatcher({ fetchImpl })
    expect(w.isOnline()).toBe(true)
  })

  it('start() is idempotent — calling twice does not double-schedule', async () => {
    const fetchImpl = vi.fn(mockFetch('ok'))
    const w = new ConnectivityWatcher({ fetchImpl, intervalMs: 1000 })

    w.start()
    w.start()
    await vi.advanceTimersByTimeAsync(0)
    // Only one immediate probe from the single effective start.
    expect(fetchImpl).toHaveBeenCalledTimes(1)

    await vi.advanceTimersByTimeAsync(1000)
    // Only one scheduled probe per interval, not two.
    expect(fetchImpl).toHaveBeenCalledTimes(2)

    w.stop()
  })
})
