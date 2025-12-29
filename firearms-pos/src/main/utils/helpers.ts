import { format } from 'date-fns'

export function generateInvoiceNumber(): string {
  const date = format(new Date(), 'yyyyMMdd')
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `INV-${date}-${random}`
}

export function generatePurchaseOrderNumber(): string {
  const date = format(new Date(), 'yyyyMMdd')
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `PO-${date}-${random}`
}

export function generateReturnNumber(): string {
  const date = format(new Date(), 'yyyyMMdd')
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `RET-${date}-${random}`
}

export function generateTransferNumber(): string {
  const date = format(new Date(), 'yyyyMMdd')
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `TRF-${date}-${random}`
}

export function generateSKU(category: string, id: number): string {
  const prefix = category.substring(0, 3).toUpperCase()
  return `${prefix}-${String(id).padStart(6, '0')}`
}

export function calculateTax(amount: number, taxRate: number): number {
  return Math.round(amount * (taxRate / 100) * 100) / 100
}

export function formatCurrency(amount: number, symbol = '$'): string {
  return `${symbol}${amount.toFixed(2)}`
}

export function isLicenseExpired(expiryDate: string | null): boolean {
  if (!expiryDate) return true
  return new Date(expiryDate) < new Date()
}

export function isLicenseExpiringSoon(expiryDate: string | null, daysThreshold = 30): boolean {
  if (!expiryDate) return true
  const expiry = new Date(expiryDate)
  const threshold = new Date()
  threshold.setDate(threshold.getDate() + daysThreshold)
  return expiry <= threshold
}

export interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}
