/**
 * tests/unit/deriveSegment.test.ts
 * Tests for the legacy deriveSegment helper functions.
 * Ported from React version — only import paths changed.
 */
import { describe, it, expect } from 'vitest'
import { deriveAgeSegment, deriveWealthTier, deriveLifestyle } from '../../utils/deriveSegment'

describe('deriveAgeSegment()', () => {
  it('returns first_step for age <= 22', () => {
    expect(deriveAgeSegment(18)).toBe('first_step')
    expect(deriveAgeSegment(22)).toBe('first_step')
  })
  it('returns building for age 23–35', () => {
    expect(deriveAgeSegment(23)).toBe('building')
    expect(deriveAgeSegment(35)).toBe('building')
  })
  it('returns stable for age 36–44', () => {
    expect(deriveAgeSegment(36)).toBe('stable')
    expect(deriveAgeSegment(44)).toBe('stable')
  })
  it('returns wealthy for age 45–60', () => {
    expect(deriveAgeSegment(45)).toBe('wealthy')
    expect(deriveAgeSegment(60)).toBe('wealthy')
  })
  it('returns retired for age > 60', () => {
    expect(deriveAgeSegment(61)).toBe('retired')
    expect(deriveAgeSegment(85)).toBe('retired')
  })
})

describe('deriveWealthTier()', () => {
  it('returns wealth for high income', () => {
    expect(deriveWealthTier('high')).toBe('wealth')
  })
  it('returns affluent for medium income', () => {
    expect(deriveWealthTier('medium')).toBe('affluent')
  })
  it('returns mass for low income', () => {
    expect(deriveWealthTier('low')).toBe('mass')
  })
})

describe('deriveLifestyle()', () => {
  it('returns senior_wealth for retired + high income', () => {
    expect(deriveLifestyle({ age: 65, hasChildren: false, isBusinessOwner: false, incomeLevel: 'high' })).toBe('senior_wealth')
  })
  it('returns senior_wealth for retired + business owner', () => {
    expect(deriveLifestyle({ age: 70, hasChildren: false, isBusinessOwner: true, incomeLevel: 'low' })).toBe('senior_wealth')
  })
  it('returns parent when hasChildren is true', () => {
    expect(deriveLifestyle({ age: 35, hasChildren: true, isBusinessOwner: false, incomeLevel: 'medium' })).toBe('parent')
  })
  it('returns entrepreneur when isBusinessOwner is true', () => {
    expect(deriveLifestyle({ age: 40, hasChildren: false, isBusinessOwner: true, incomeLevel: 'medium' })).toBe('entrepreneur')
  })
  it('returns sink_dink as default', () => {
    expect(deriveLifestyle({ age: 30, hasChildren: false, isBusinessOwner: false, incomeLevel: 'medium' })).toBe('sink_dink')
  })
})
