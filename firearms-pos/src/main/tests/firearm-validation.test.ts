import { describe, it, expect } from 'vitest'
import { validateFirearmFields, MAKE_VALUES } from '../utils/firearm-validation'

describe('validateFirearmFields', () => {
  const thisYear = new Date().getFullYear()

  it('accepts all-null firearm fields when category is not firearm', () => {
    const res = validateFirearmFields({ make: null, madeYear: null }, { isFirearm: false })
    expect(res.valid).toBe(true)
    expect(res.errors).toEqual([])
  })

  it('requires make, firearmModelId, caliberId when category is firearm', () => {
    const res = validateFirearmFields(
      { make: null, firearmModelId: null, caliberId: null },
      { isFirearm: true },
    )
    expect(res.valid).toBe(false)
    expect(res.errors).toContain('Make is required for firearm products')
    expect(res.errors).toContain('Model is required for firearm products')
    expect(res.errors).toContain('Caliber is required for firearm products')
  })

  it('rejects invalid make value', () => {
    const res = validateFirearmFields({ make: 'foreign' }, { isFirearm: false })
    expect(res.valid).toBe(false)
    expect(res.errors.some((e) => e.toLowerCase().includes('make'))).toBe(true)
  })

  it('accepts make=local and make=imported', () => {
    MAKE_VALUES.forEach((make) => {
      const res = validateFirearmFields({ make }, { isFirearm: false })
      expect(res.valid).toBe(true)
    })
  })

  it('rejects made_year < 1800', () => {
    const res = validateFirearmFields({ madeYear: 1799 }, { isFirearm: false })
    expect(res.valid).toBe(false)
    expect(res.errors.some((e) => e.includes('year'))).toBe(true)
  })

  it(`rejects made_year > ${thisYear + 1}`, () => {
    const res = validateFirearmFields({ madeYear: thisYear + 2 }, { isFirearm: false })
    expect(res.valid).toBe(false)
  })

  it('accepts made_year within range', () => {
    const res = validateFirearmFields({ madeYear: 2020 }, { isFirearm: false })
    expect(res.valid).toBe(true)
  })
})
