/**
 * Data Validation Utilities
 * Provides input sanitization and range validation for financial data
 *
 * Section 5.2 Data Validation - Audit Report Fix
 */

// ============================================================================
// INPUT SANITIZATION
// ============================================================================

/**
 * Sanitize text input to prevent XSS and injection attacks
 * Removes HTML tags, trims whitespace, and normalizes unicode
 */
export function sanitizeText(input: string | null | undefined): string {
  if (input === null || input === undefined) {
    return ''
  }

  return (
    String(input)
      // Trim whitespace
      .trim()
      // Remove HTML tags
      .replace(/<[^>]*>/g, '')
      // Remove potential script injections
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '')
      // Normalize unicode whitespace
      .replace(/\s+/g, ' ')
      // Remove null bytes
      .replace(/\0/g, '')
  )
}

/**
 * Sanitize text for SQL-safe storage (beyond ORM protections)
 * Escapes special characters that could be problematic
 */
export function sanitizeForStorage(input: string | null | undefined): string {
  if (input === null || input === undefined) {
    return ''
  }

  return sanitizeText(input)
    // Remove control characters except newlines and tabs
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
}

/**
 * Sanitize name fields (first name, last name, business names)
 * Allows letters, spaces, hyphens, apostrophes, and common diacritics
 */
export function sanitizeName(input: string | null | undefined): string {
  if (input === null || input === undefined) {
    return ''
  }

  return sanitizeText(input)
    // Remove characters that aren't valid in names
    .replace(/[^a-zA-Z\s\-'.\u00C0-\u024F]/g, '')
    // Collapse multiple spaces
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Sanitize alphanumeric identifiers (product codes, invoice numbers, etc.)
 */
export function sanitizeAlphanumeric(input: string | null | undefined): string {
  if (input === null || input === undefined) {
    return ''
  }

  return (
    String(input)
      .trim()
      // Only allow alphanumeric, hyphens, and underscores
      .replace(/[^a-zA-Z0-9\-_]/g, '')
  )
}

/**
 * Sanitize phone numbers - keeps only digits and common formatting
 */
export function sanitizePhone(input: string | null | undefined): string {
  if (input === null || input === undefined) {
    return ''
  }

  return (
    String(input)
      .trim()
      // Keep digits, plus sign, hyphens, parentheses, spaces
      .replace(/[^0-9+\-() ]/g, '')
      // Collapse multiple spaces
      .replace(/\s+/g, ' ')
      .trim()
  )
}

/**
 * Sanitize email addresses
 */
export function sanitizeEmail(input: string | null | undefined): string {
  if (input === null || input === undefined) {
    return ''
  }

  return (
    String(input)
      .trim()
      .toLowerCase()
      // Only allow valid email characters
      .replace(/[^a-z0-9@._\-+]/g, '')
  )
}

// ============================================================================
// RANGE VALIDATION
// ============================================================================

interface NumericRangeOptions {
  min?: number
  max?: number
  allowNegative?: boolean
  allowZero?: boolean
  maxDecimalPlaces?: number
}

/**
 * Validate and clamp a numeric value within a specified range
 * Returns the validated number or null if invalid
 */
export function validateNumericRange(
  value: number | string | null | undefined,
  options: NumericRangeOptions = {}
): number | null {
  const {
    min = Number.MIN_SAFE_INTEGER,
    max = Number.MAX_SAFE_INTEGER,
    allowNegative = true,
    allowZero = true,
    maxDecimalPlaces,
  } = options

  if (value === null || value === undefined || value === '') {
    return null
  }

  let num = typeof value === 'string' ? parseFloat(value) : value

  // Check if it's a valid number
  if (isNaN(num) || !isFinite(num)) {
    return null
  }

  // Check negative constraint
  if (!allowNegative && num < 0) {
    return null
  }

  // Check zero constraint
  if (!allowZero && num === 0) {
    return null
  }

  // Clamp to range
  num = Math.max(min, Math.min(max, num))

  // Round to max decimal places if specified
  if (maxDecimalPlaces !== undefined) {
    const factor = Math.pow(10, maxDecimalPlaces)
    num = Math.round(num * factor) / factor
  }

  return num
}

/**
 * Validate monetary amount (0 or positive, max 2 decimal places)
 */
export function validateAmount(value: number | string | null | undefined): number | null {
  return validateNumericRange(value, {
    min: 0,
    max: 999999999.99, // ~1 billion max
    allowNegative: false,
    allowZero: true,
    maxDecimalPlaces: 2,
  })
}

/**
 * Validate quantity (positive integer)
 */
export function validateQuantity(value: number | string | null | undefined): number | null {
  const result = validateNumericRange(value, {
    min: 0,
    max: 999999999,
    allowNegative: false,
    allowZero: true,
    maxDecimalPlaces: 0,
  })
  return result !== null ? Math.floor(result) : null
}

/**
 * Validate percentage (0-100)
 */
export function validatePercentage(value: number | string | null | undefined): number | null {
  return validateNumericRange(value, {
    min: 0,
    max: 100,
    allowNegative: false,
    allowZero: true,
    maxDecimalPlaces: 2,
  })
}

/**
 * Validate tax rate (0-100)
 */
export function validateTaxRate(value: number | string | null | undefined): number | null {
  return validatePercentage(value)
}

/**
 * Validate discount amount (non-negative)
 */
export function validateDiscountAmount(value: number | string | null | undefined): number | null {
  return validateAmount(value)
}

/**
 * Validate price (positive, non-zero)
 */
export function validatePrice(value: number | string | null | undefined): number | null {
  return validateNumericRange(value, {
    min: 0.01,
    max: 999999999.99,
    allowNegative: false,
    allowZero: false,
    maxDecimalPlaces: 2,
  })
}

/**
 * Validate cost price (non-negative)
 */
export function validateCostPrice(value: number | string | null | undefined): number | null {
  return validateAmount(value)
}

// ============================================================================
// FORMAT VALIDATION
// ============================================================================

/**
 * Validate email format
 */
export function isValidEmail(email: string | null | undefined): boolean {
  if (!email) return false
  // RFC 5322 simplified regex
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
  return emailRegex.test(email)
}

/**
 * Validate phone number format (basic validation)
 */
export function isValidPhone(phone: string | null | undefined): boolean {
  if (!phone) return false
  // At least 7 digits, allowing common formatting
  const digitsOnly = phone.replace(/\D/g, '')
  return digitsOnly.length >= 7 && digitsOnly.length <= 15
}

/**
 * Validate date string format (ISO 8601 or common formats)
 */
export function isValidDate(dateStr: string | null | undefined): boolean {
  if (!dateStr) return false
  const date = new Date(dateStr)
  return !isNaN(date.getTime())
}

/**
 * Validate future date (for expiry dates)
 */
export function isValidFutureDate(dateStr: string | null | undefined): boolean {
  if (!dateStr) return false
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return false
  return date > new Date()
}

// ============================================================================
// STRING LENGTH VALIDATION
// ============================================================================

interface StringLengthOptions {
  minLength?: number
  maxLength?: number
  required?: boolean
}

/**
 * Validate string length
 */
export function validateStringLength(
  value: string | null | undefined,
  options: StringLengthOptions = {}
): { valid: boolean; error?: string } {
  const { minLength = 0, maxLength = 10000, required = false } = options

  if (value === null || value === undefined || value === '') {
    if (required) {
      return { valid: false, error: 'This field is required' }
    }
    return { valid: true }
  }

  const str = String(value)

  if (str.length < minLength) {
    return { valid: false, error: `Minimum length is ${minLength} characters` }
  }

  if (str.length > maxLength) {
    return { valid: false, error: `Maximum length is ${maxLength} characters` }
  }

  return { valid: true }
}

// ============================================================================
// BATCH SANITIZATION
// ============================================================================

type SanitizableObject = Record<string, unknown>

interface FieldSanitizationRule {
  field: string
  type: 'text' | 'name' | 'email' | 'phone' | 'alphanumeric' | 'amount' | 'quantity' | 'percentage' | 'price'
}

/**
 * Sanitize multiple fields of an object based on rules
 */
export function sanitizeObject<T extends SanitizableObject>(
  obj: T,
  rules: FieldSanitizationRule[]
): T {
  const result: SanitizableObject = { ...obj }

  for (const rule of rules) {
    const value = result[rule.field]

    switch (rule.type) {
      case 'text':
        result[rule.field] = sanitizeForStorage(value as string)
        break
      case 'name':
        result[rule.field] = sanitizeName(value as string)
        break
      case 'email':
        result[rule.field] = sanitizeEmail(value as string)
        break
      case 'phone':
        result[rule.field] = sanitizePhone(value as string)
        break
      case 'alphanumeric':
        result[rule.field] = sanitizeAlphanumeric(value as string)
        break
      case 'amount':
        result[rule.field] = validateAmount(value as number)
        break
      case 'quantity':
        result[rule.field] = validateQuantity(value as number)
        break
      case 'percentage':
        result[rule.field] = validatePercentage(value as number)
        break
      case 'price':
        result[rule.field] = validatePrice(value as number)
        break
    }
  }

  return result as T
}

// ============================================================================
// EXPORT VALIDATION ERROR HELPER
// ============================================================================

export interface ValidationError {
  field: string
  message: string
}

export interface ValidationResult {
  valid: boolean
  errors: ValidationError[]
}

/**
 * Create a validation result helper
 */
export function createValidationResult(errors: ValidationError[] = []): ValidationResult {
  return {
    valid: errors.length === 0,
    errors,
  }
}
