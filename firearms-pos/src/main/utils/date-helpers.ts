export interface DateRange {
  start: string
  end: string
}

/**
 * Normalize plain date strings (e.g. "2026-03-25") to full ISO range.
 * Database stores dates as ISO timestamps ("2026-03-25T14:30:00.000Z"),
 * so plain date strings fail with SQLite's lexicographic `between` comparison.
 */
export function normalizeDateRange(startDate: string, endDate: string): DateRange {
  // If already an ISO timestamp, use as-is
  if (startDate.includes('T') && endDate.includes('T')) {
    return { start: startDate, end: endDate }
  }

  const start = new Date(startDate)
  start.setHours(0, 0, 0, 0)

  const end = new Date(endDate)
  end.setHours(23, 59, 59, 999)

  return {
    start: start.toISOString(),
    end: end.toISOString(),
  }
}

export type TimePeriod = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'all-time' | 'custom'

/**
 * Get date range based on time period
 */
export function getDateRange(period: TimePeriod, customStart?: string, customEnd?: string): DateRange {
  const now = new Date()

  switch (period) {
    case 'daily':
      const startOfDay = new Date(now)
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(now)
      endOfDay.setHours(23, 59, 59, 999)
      return {
        start: startOfDay.toISOString(),
        end: endOfDay.toISOString(),
      }

    case 'weekly':
      const startOfWeek = new Date(now)
      const dayOfWeek = startOfWeek.getDay()
      const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek // Monday as start
      startOfWeek.setDate(startOfWeek.getDate() + diff)
      startOfWeek.setHours(0, 0, 0, 0)

      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 6)
      endOfWeek.setHours(23, 59, 59, 999)

      return {
        start: startOfWeek.toISOString(),
        end: endOfWeek.toISOString(),
      }

    case 'monthly':
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      startOfMonth.setHours(0, 0, 0, 0)

      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      endOfMonth.setHours(23, 59, 59, 999)

      return {
        start: startOfMonth.toISOString(),
        end: endOfMonth.toISOString(),
      }

    case 'yearly':
      const startOfYear = new Date(now.getFullYear(), 0, 1)
      startOfYear.setHours(0, 0, 0, 0)

      const endOfYear = new Date(now.getFullYear(), 11, 31)
      endOfYear.setHours(23, 59, 59, 999)

      return {
        start: startOfYear.toISOString(),
        end: endOfYear.toISOString(),
      }

    case 'all-time':
      return {
        start: new Date('2000-01-01').toISOString(),
        end: now.toISOString(),
      }

    case 'custom':
      if (!customStart || !customEnd) {
        throw new Error('Custom date range requires start and end dates')
      }
      const start = new Date(customStart)
      start.setHours(0, 0, 0, 0)
      const end = new Date(customEnd)
      end.setHours(23, 59, 59, 999)
      return {
        start: start.toISOString(),
        end: end.toISOString(),
      }

    default:
      throw new Error(`Unknown time period: ${period}`)
  }
}

/**
 * Format date for display
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Format date and time for display
 */
export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Get period label for reports
 */
export function getPeriodLabel(period: TimePeriod, startDate?: string, endDate?: string): string {
  switch (period) {
    case 'daily':
      return formatDate(new Date())
    case 'weekly':
      return 'This Week'
    case 'monthly':
      return new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    case 'yearly':
      return new Date().getFullYear().toString()
    case 'all-time':
      return 'All Time'
    case 'custom':
      if (startDate && endDate) {
        return `${formatDate(startDate)} - ${formatDate(endDate)}`
      }
      return 'Custom Range'
    default:
      return 'Unknown Period'
  }
}
