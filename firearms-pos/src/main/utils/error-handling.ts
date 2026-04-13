/**
 * Error handling utilities for the Firearms POS application.
 *
 * Provides error classification, retry logic for transient errors,
 * and structured error responses for IPC handlers.
 */

// -- Error Categories --

export type ErrorCategory = 'validation' | 'database' | 'business_logic' | 'system'

// -- AppError Class --

export class AppError extends Error {
  readonly code: string
  readonly category: ErrorCategory
  readonly isRetryable: boolean

  constructor(
    message: string,
    options: {
      code?: string
      category?: ErrorCategory
      isRetryable?: boolean
      cause?: unknown
    } = {}
  ) {
    super(message)
    this.name = 'AppError'
    this.code = options.code || 'UNKNOWN_ERROR'
    this.category = options.category || 'system'
    this.isRetryable = options.isRetryable || false
    if (options.cause) {
      this.cause = options.cause
    }
  }
}

// -- Error Classification --

interface ClassifiedError {
  message: string
  code: string
  category: ErrorCategory
  isRetryable: boolean
  originalError: unknown
}

/**
 * Classify an error by inspecting its type and message.
 * SQLite errors are detected by their error codes embedded in messages.
 */
export function classifyError(error: unknown): ClassifiedError {
  if (error instanceof AppError) {
    return {
      message: error.message,
      code: error.code,
      category: error.category,
      isRetryable: error.isRetryable,
      originalError: error,
    }
  }

  const errorMessage = error instanceof Error ? error.message : String(error)
  const errorCode = (error as Record<string, unknown>)?.code as string | undefined

  // SQLite BUSY — another connection has a write lock
  if (errorCode === 'SQLITE_BUSY' || errorMessage.includes('SQLITE_BUSY') || errorMessage.includes('database is locked')) {
    return {
      message: 'Database is busy. Please try again.',
      code: 'SQLITE_BUSY',
      category: 'database',
      isRetryable: true,
      originalError: error,
    }
  }

  // SQLite LOCKED — table-level lock conflict
  if (errorCode === 'SQLITE_LOCKED' || errorMessage.includes('SQLITE_LOCKED')) {
    return {
      message: 'Database table is locked. Please try again.',
      code: 'SQLITE_LOCKED',
      category: 'database',
      isRetryable: true,
      originalError: error,
    }
  }

  // SQLite CONSTRAINT — unique/FK/check violation
  if (errorCode === 'SQLITE_CONSTRAINT' || errorMessage.includes('SQLITE_CONSTRAINT') || errorMessage.includes('UNIQUE constraint') || errorMessage.includes('FOREIGN KEY constraint')) {
    let userMessage = 'A data constraint was violated.'
    if (errorMessage.includes('UNIQUE constraint')) {
      userMessage = 'A record with this value already exists.'
    } else if (errorMessage.includes('FOREIGN KEY constraint')) {
      userMessage = 'Referenced record does not exist or cannot be removed.'
    }
    return {
      message: userMessage,
      code: 'SQLITE_CONSTRAINT',
      category: 'database',
      isRetryable: false,
      originalError: error,
    }
  }

  // SQLite READONLY
  if (errorCode === 'SQLITE_READONLY' || errorMessage.includes('SQLITE_READONLY')) {
    return {
      message: 'Database is read-only.',
      code: 'SQLITE_READONLY',
      category: 'database',
      isRetryable: false,
      originalError: error,
    }
  }

  // Generic system error
  return {
    message: 'An unexpected error occurred.',
    code: errorCode || 'UNKNOWN_ERROR',
    category: 'system',
    isRetryable: false,
    originalError: error,
  }
}

// -- Retry Logic --

interface RetryOptions {
  maxAttempts?: number
  baseDelayMs?: number
}

/**
 * Retry a function if it fails with a retryable error.
 * Uses exponential backoff: 100ms, 200ms, 400ms by default.
 * Non-retryable errors are rethrown immediately.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const { maxAttempts = 3, baseDelayMs = 100 } = options

  let lastError: unknown

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      const classified = classifyError(error)

      if (!classified.isRetryable || attempt === maxAttempts) {
        throw error
      }

      const delay = baseDelayMs * Math.pow(2, attempt - 1)
      console.warn(
        `Retryable error (${classified.code}), attempt ${attempt}/${maxAttempts}. ` +
        `Retrying in ${delay}ms...`
      )
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  throw lastError
}

// -- Handler Error Helper --

/**
 * Formats an error for IPC handler responses.
 * Use in catch blocks: `return handleIpcError('Create sale', error)`
 */
export function handleIpcError(
  operation: string,
  error: unknown
): { success: false; message: string } {
  const classified = classifyError(error)
  console.error(`${operation} error [${classified.category}/${classified.code}]:`, error)
  return { success: false, message: classified.message }
}
