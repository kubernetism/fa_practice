import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface CurrencyFormatOptions {
  symbol?: string
  code?: string
  position?: 'prefix' | 'suffix'
  decimalPlaces?: number
  thousandSeparator?: string
  decimalSeparator?: string
}

export function formatCurrency(amount: number, options?: CurrencyFormatOptions): string {
  const {
    symbol = 'Rs.',
    position = 'prefix',
    decimalPlaces = 2,
    thousandSeparator = ',',
    decimalSeparator = '.',
  } = options || {}

  // Format the number with proper separators
  const fixedAmount = Math.abs(amount).toFixed(decimalPlaces)
  const [integerPart, fractionalPart] = fixedAmount.split('.')

  // Add thousand separators
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, thousandSeparator)

  // Combine integer and fractional parts
  const formattedNumber = fractionalPart
    ? `${formattedInteger}${decimalSeparator}${fractionalPart}`
    : formattedInteger

  // Handle negative numbers
  const sign = amount < 0 ? '-' : ''

  // Apply currency symbol position
  if (position === 'suffix') {
    return `${sign}${formattedNumber} ${symbol}`
  }
  return `${sign}${symbol} ${formattedNumber}`
}

export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }
  return new Intl.DateTimeFormat('en-US', options || defaultOptions).format(
    typeof date === 'string' ? new Date(date) : date
  )
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(typeof date === 'string' ? new Date(date) : date)
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num)
}

export function formatPercent(num: number): string {
  return `${num.toFixed(2)}%`
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return `${str.slice(0, length)}...`
}

export function debounce<T extends (...args: Parameters<T>) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function pluralize(count: number, singular: string, plural?: string): string {
  return count === 1 ? singular : plural || `${singular}s`
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[\d\s\-+()]{10,}$/
  return phoneRegex.test(phone)
}

export function getStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    // Payment status
    paid: 'text-success bg-success/10',
    partial: 'text-warning bg-warning/10',
    pending: 'text-muted-foreground bg-muted',

    // Commission status
    approved: 'text-info bg-info/10',

    // Purchase status
    draft: 'text-muted-foreground bg-muted',
    ordered: 'text-info bg-info/10',
    received: 'text-success bg-success/10',
    cancelled: 'text-destructive bg-destructive/10',

    // Transfer status
    in_transit: 'text-warning bg-warning/10',
    completed: 'text-success bg-success/10',

    // General
    active: 'text-success bg-success/10',
    inactive: 'text-muted-foreground bg-muted',
  }
  return statusColors[status.toLowerCase()] || 'text-muted-foreground bg-muted'
}
export function formatTimeAgo(dateString: string): string {
  const now = Date.now()
  const date = new Date(dateString).getTime()
  const seconds = Math.floor((now - date) / 1000)

  const intervals = [
    { label: "y", seconds: 31536000 },
    { label: "mo", seconds: 2592000 },
    { label: "d", seconds: 86400 },
    { label: "h", seconds: 3600 },
    { label: "m", seconds: 60 },
  ]

  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds)
    if (count >= 1) {
      return `${count}${interval.label} ago`
    }
  }
  return "Just now"
}
