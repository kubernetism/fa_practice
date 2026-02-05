'use client'

import { useEffect, useRef, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'
import type { ServerToClientEvents, ClientToServerEvents } from '@/lib/realtime/events'

type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>

let socket: TypedSocket | null = null

function getSocket(): TypedSocket {
  if (!socket) {
    socket = io({
      path: '/api/socketio',
      autoConnect: false,
    })
  }
  return socket
}

export function useSocket() {
  const socketRef = useRef<TypedSocket>(getSocket())

  useEffect(() => {
    const s = socketRef.current
    if (!s.connected) {
      s.connect()
    }

    return () => {
      // Don't disconnect — shared singleton
    }
  }, [])

  const on = useCallback(
    <E extends keyof ServerToClientEvents>(
      event: E,
      handler: ServerToClientEvents[E]
    ) => {
      const s = socketRef.current
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      s.on(event as any, handler as any)
      return () => {
        s.off(event as any, handler as any)
      }
    },
    []
  )

  const emit = useCallback(
    <E extends keyof ClientToServerEvents>(
      event: E,
      ...args: Parameters<ClientToServerEvents[E]>
    ) => {
      socketRef.current.emit(event, ...args)
    },
    []
  )

  return {
    on,
    emit,
    socket: socketRef.current,
    isConnected: socketRef.current?.connected ?? false,
  }
}
