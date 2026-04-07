/**
 * tests/unit/productLogic.test.ts
 * Unit tests for deriveSegment() and getProducts().
 * Ported from React version — only import paths changed.
 */
import { describe, it, expect } from 'vitest'
import { deriveSegment, getProducts, AUM_TIER_MAP } from '../../utils/productLogic'

describe('deriveSegment()', () => {
  it('returns entrepreneur when isBusinessOwner is true (highest priority)', () => {
    expect(deriveSegment(25, 'low', true, false)).toBe('entrepreneur')
    expect(deriveSegment(65, 'high', true, true)).toBe('entrepreneur') // beats all other flags
  })

  it('returns parents when hasChild is true (second priority)', () => {
    expect(deriveSegment(30, 'low', false, true)).toBe('parents')
    expect(deriveSegment(70, 'high', false, true)).toBe('parents') // beats senior_wealth
  })

  it('returns senior_wealth when age >= 60 and AUM is high (third priority)', () => {
    expect(deriveSegment(60, 'high', false, false)).toBe('senior_wealth')
    expect(deriveSegment(75, 'high', false, false)).toBe('senior_wealth')
  })

  it('returns senior when age >= 60 and AUM is not high (fourth priority)', () => {
    expect(deriveSegment(60, 'low',  false, false)).toBe('senior')
    expect(deriveSegment(60, 'mid',  false, false)).toBe('senior')
    expect(deriveSegment(80, 'unknown', false, false)).toBe('senior')
  })

  it('returns sinks_dinks as default', () => {
    expect(deriveSegment(35, 'mid', false, false)).toBe('sinks_dinks')
    expect(deriveSegment(25, 'low', false, false)).toBe('sinks_dinks')
  })
})

describe('AUM_TIER_MAP', () => {
  it('maps all AUM options correctly', () => {
    expect(AUM_TIER_MAP['3MB']).toBe('low')
    expect(AUM_TIER_MAP['5MB']).toBe('mid')
    expect(AUM_TIER_MAP['10MB']).toBe('high')
    expect(AUM_TIER_MAP['30MB']).toBe('high')
  })
})

describe('getProducts()', () => {
  it('returns products for tax_saving + low + sinks_dinks', () => {
    const products = getProducts('tax_saving', 'low', 'sinks_dinks')
    expect(products).toContain('Gain 1st E-saving (10/5)')
  })

  it('returns products for tax_saving + mid + sinks_dinks', () => {
    const products = getProducts('tax_saving', 'mid', 'sinks_dinks')
    expect(products).toContain('Gain 1st Speed return (10/5)')
  })

  it('returns empty array for unknown segment', () => {
    const products = getProducts('tax_saving', 'low', 'entrepreneur')
    expect(products).toEqual([])
  })

  it('returns flexi products for lifestyle_protection + mid + sinks_dinks', () => {
    const products = getProducts('lifestyle_protection', 'mid', 'sinks_dinks')
    expect(products.some(p => p.includes('Flexi'))).toBe(true)
  })

  it('returns children product for protect_family + low + parents', () => {
    const products = getProducts('protect_family', 'low', 'parents')
    expect(products).toContain('Gain 1st Saving and Care for kids')
  })

  it('returns empty array for inheritance (reserved)', () => {
    expect(getProducts('inheritance', 'low', 'sinks_dinks')).toEqual([])
    expect(getProducts('inheritance', 'mid', 'parents')).toEqual([])
    expect(getProducts('inheritance', 'high', 'entrepreneur')).toEqual([])
  })

  it('returns investment products for high-tier senior_wealth', () => {
    const products = getProducts('investment_saving', 'high', 'senior_wealth')
    expect(products.length).toBeGreaterThan(0)
    expect(products).toContain('Gain 1st 525 par')
  })
})
