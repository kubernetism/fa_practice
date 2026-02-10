/**
 * Input validation utilities for server actions.
 * Return boolean indicating whether input passes format checks.
 */

/** Validate email format */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email.trim())
}

/** Validate phone format — accepts international formats */
export function isValidPhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s\-()]/g, '')
  // At least 7 digits, optionally starting with +
  const phoneRegex = /^\+?\d{7,15}$/
  return phoneRegex.test(cleaned)
}

/** Validate required string — non-empty after trim */
export function isRequired(value: string | null | undefined): boolean {
  return !!value && value.trim().length > 0
}

/** Validate numeric string — must parse to a valid number */
export function isValidNumber(value: string): boolean {
  const num = Number(value)
  return !isNaN(num) && isFinite(num)
}

/** Validate positive numeric string */
export function isPositiveNumber(value: string): boolean {
  const num = Number(value)
  return !isNaN(num) && isFinite(num) && num > 0
}

/** Validate non-negative numeric string (zero allowed) */
export function isNonNegativeNumber(value: string): boolean {
  const num = Number(value)
  return !isNaN(num) && isFinite(num) && num >= 0
}

/** Validate a CNIC number (Pakistani format: XXXXX-XXXXXXX-X) */
export function isValidCNIC(cnic: string): boolean {
  const cnicRegex = /^\d{5}-?\d{7}-?\d{1}$/
  return cnicRegex.test(cnic.replace(/\s/g, ''))
}

/** Validate date string (ISO format or common date formats) */
export function isValidDate(dateStr: string): boolean {
  const date = new Date(dateStr)
  return !isNaN(date.getTime())
}

/**
 * Validate input fields and return errors.
 * Rules map field names to validation functions.
 */
export function validateFields(
  input: Record<string, any>,
  rules: Record<string, { validate: (value: any) => boolean; message: string }[]>
): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {}

  for (const [field, fieldRules] of Object.entries(rules)) {
    const value = input[field]
    for (const rule of fieldRules) {
      if (!rule.validate(value)) {
        errors[field] = rule.message
        break
      }
    }
  }

  return { valid: Object.keys(errors).length === 0, errors }
}
