// Socket.io event type definitions

export interface ServerToClientEvents {
  'inventory:updated': (data: { productId: number; newQuantity: number }) => void
  'sale:created': (data: { saleId: number; invoiceNumber: string; total: number }) => void
  'sale:voided': (data: { saleId: number }) => void
  'dashboard:refresh': (data: { type: string }) => void
  'notification:new': (data: { title: string; message: string; type: string }) => void
  'cash-register:updated': (data: { sessionId: number; action: string }) => void
}

export interface ClientToServerEvents {
  'join:room': (room: string) => void
  'leave:room': (room: string) => void
}

// Room helpers
export function tenantRoom(tenantId: number) {
  return `tenant:${tenantId}`
}

export function branchRoom(tenantId: number, branchId: number) {
  return `tenant:${tenantId}:branch:${branchId}`
}

export function userRoom(tenantId: number, userId: number) {
  return `tenant:${tenantId}:user:${userId}`
}
