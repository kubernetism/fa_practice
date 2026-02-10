/**
 * Input sanitization utilities for server actions.
 * All functions return cleaned strings safe for storage.
 */

/** Strip leading/trailing whitespace and collapse internal whitespace in name fields */
export function sanitizeName(name: string): string {
  return name.trim().replace(/\s+/g, ' ')
}

/** Lowercase and trim email, strip invalid characters */
export function sanitizeEmail(email: string): string {
  return email.trim().toLowerCase().replace(/[^\w.@+-]/g, '')
}

/** Strip non-phone characters, keep digits, +, -, (, ), spaces */
export function sanitizePhone(phone: string): string {
  return phone.trim().replace(/[^\d+\-()\s]/g, '')
}

/** Generic text cleaning — trim whitespace, normalize line breaks */
export function sanitizeText(text: string): string {
  return text.trim().replace(/\r\n/g, '\n').replace(/\r/g, '\n')
}

/** Strip HTML tags and encode special characters to prevent XSS in stored text */
export function sanitizeForStorage(text: string): string {
  return text
    .replace(/<[^>]*>/g, '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim()
}

/** Sanitize a numeric string — keep digits, decimal point, minus sign */
export function sanitizeNumeric(value: string): string {
  return value.trim().replace(/[^\d.\-]/g, '')
}

/**
 * Apply sanitization to an object's string fields based on field names.
 * Automatically detects field types by name conventions.
 */
export function sanitizeInput<T extends Record<string, any>>(input: T): T {
  const result = { ...input }

  for (const [key, value] of Object.entries(result)) {
    if (typeof value !== 'string') continue

    if (key === 'email' || key.endsWith('Email')) {
      ;(result as any)[key] = sanitizeEmail(value)
    } else if (key === 'phone' || key.endsWith('Phone')) {
      ;(result as any)[key] = sanitizePhone(value)
    } else if (
      key === 'firstName' ||
      key === 'lastName' ||
      key === 'fullName' ||
      key === 'name'
    ) {
      ;(result as any)[key] = sanitizeName(value)
    } else if (
      key === 'description' ||
      key === 'notes' ||
      key === 'reason' ||
      key === 'content' ||
      key === 'address'
    ) {
      ;(result as any)[key] = sanitizeForStorage(value)
    } else if (
      key === 'costPrice' ||
      key === 'sellingPrice' ||
      key === 'price' ||
      key === 'taxRate' ||
      key === 'commissionRate'
    ) {
      ;(result as any)[key] = sanitizeNumeric(value)
    }
  }

  return result
}
