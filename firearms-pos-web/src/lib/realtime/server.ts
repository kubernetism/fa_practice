// Socket.io server-side emission helper
// This will be initialized when Socket.io server is set up

let io: any = null

export function setSocketServer(socketIo: any) {
  io = socketIo
}

export async function emitToRoom(room: string, event: string, data: any) {
  if (!io) {
    console.warn('Socket.io server not initialized, skipping emit')
    return
  }
  io.to(room).emit(event, data)
}
