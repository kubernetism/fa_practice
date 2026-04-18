export const MAKE_VALUES = ['local', 'imported'] as const
export type Make = (typeof MAKE_VALUES)[number]

export interface FirearmFieldsInput {
  make?: string | null
  madeYear?: number | null
  madeCountry?: string | null
  firearmModelId?: number | null
  caliberId?: number | null
  shapeId?: number | null
  designId?: number | null
  defaultSupplierId?: number | null
}

export interface FirearmValidationResult {
  valid: boolean
  errors: string[]
}

export function validateFirearmFields(
  input: FirearmFieldsInput,
  category: { isFirearm: boolean },
): FirearmValidationResult {
  const errors: string[] = []
  const thisYear = new Date().getFullYear()

  if (
    input.make !== undefined &&
    input.make !== null &&
    !MAKE_VALUES.includes(input.make as Make)
  ) {
    errors.push(`Make must be one of: ${MAKE_VALUES.join(', ')}`)
  }

  if (input.madeYear !== undefined && input.madeYear !== null) {
    if (
      !Number.isInteger(input.madeYear) ||
      input.madeYear < 1800 ||
      input.madeYear > thisYear + 1
    ) {
      errors.push(`Made year must be an integer between 1800 and ${thisYear + 1}`)
    }
  }

  if (category.isFirearm) {
    if (!input.make) errors.push('Make is required for firearm products')
    if (!input.firearmModelId) errors.push('Model is required for firearm products')
    if (!input.caliberId) errors.push('Caliber is required for firearm products')
  }

  return { valid: errors.length === 0, errors }
}
