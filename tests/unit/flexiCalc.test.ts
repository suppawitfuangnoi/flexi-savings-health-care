/**
 * tests/unit/flexiCalc.test.ts
 * Unit tests for the core Flexi calculation engine.
 * These functions contain business-critical logic — test all branches.
 */
import { describe, it, expect } from 'vitest'
import {
  compute, saFromMode, getRate, getBandIndex,
  ageFromDob, dobFromAge,
  CONTRACT_YEARS, PAYMENT_YEARS, HEALTH_BENEFIT_PCT, CASH_RETURN_PCT,
  MATURITY_PCT, NO_CLAIM_BONUS_PCT,
} from '../../utils/flexiCalc'

describe('getBandIndex()', () => {
  it('returns 0 for SA in 50k–199k', () => {
    expect(getBandIndex(50_000)).toBe(0)
    expect(getBandIndex(100_000)).toBe(0)
    expect(getBandIndex(199_999)).toBe(0)
  })
  it('returns 1 for SA in 200k–499k', () => {
    expect(getBandIndex(200_000)).toBe(1)
    expect(getBandIndex(499_999)).toBe(1)
  })
  it('returns 2 for SA in 500k–999k', () => {
    expect(getBandIndex(500_000)).toBe(2)
  })
  it('returns 3 for SA >= 1M', () => {
    expect(getBandIndex(1_000_000)).toBe(3)
    expect(getBandIndex(5_000_000)).toBe(3)
  })
})

describe('getRate()', () => {
  it('uses age bracket 0–60 for young insured', () => {
    expect(getRate(30, 100_000)).toBe(999) // band 0
    expect(getRate(60, 500_000)).toBe(979) // band 2
  })
  it('uses age bracket 61–70', () => {
    expect(getRate(65, 200_000)).toBe(994) // band 1
  })
  it('uses age bracket 71–80', () => {
    expect(getRate(75, 1_000_000)).toBe(989) // band 3
  })
  it('uses age bracket 81–85', () => {
    expect(getRate(82, 300_000)).toBe(999) // all bands 999
  })
})

describe('compute()', () => {
  const SA    = 200_000
  const AGE   = 35
  const USAGE = 0 // 0% health usage

  const result = compute(SA, AGE, USAGE)

  it('calculates annual premium correctly', () => {
    const rate = getRate(AGE, SA)
    expect(result.annualPremium).toBeCloseTo((SA / 1000) * rate)
  })

  it('calculates total premium over payment years', () => {
    expect(result.totalPremium).toBeCloseTo(result.annualPremium * PAYMENT_YEARS)
  })

  it('calculates cash return', () => {
    expect(result.cashReturn).toBeCloseTo(SA * CASH_RETURN_PCT)
  })

  it('calculates health benefit per year', () => {
    expect(result.healthPerYear).toBeCloseTo(SA * HEALTH_BENEFIT_PCT)
  })

  it('calculates maturity at 500%', () => {
    expect(result.maturity).toBeCloseTo(SA * MATURITY_PCT)
  })

  it('calculates no-claim bonus with 0% usage', () => {
    expect(result.noClaimBonus).toBeCloseTo(
      result.healthPerYear * 1 * CONTRACT_YEARS * NO_CLAIM_BONUS_PCT,
    )
  })

  it('calculates net gain/loss correctly', () => {
    expect(result.netGainLoss).toBeCloseTo(result.totalReceived - result.totalPremium)
  })
})

describe('saFromMode()', () => {
  it('returns value directly for sa mode', () => {
    expect(saFromMode('sa', 200_000, 35)).toBe(200_000)
  })
  it('returns value / 0.10 for health mode', () => {
    expect(saFromMode('health', 20_000, 35)).toBe(200_000)
  })
  it('derives SA from premium mode (consistent band)', () => {
    const age = 35
    const annualPremium = 198_200  // rate 991 × SA / 1000 = SA × 0.991
    const sa = saFromMode('premium', annualPremium, age)
    expect(sa).toBeGreaterThan(0)
    // Re-check: compute(sa, age) should give back approximately the same premium
    const recomputed = compute(sa, age, 0)
    expect(recomputed.annualPremium).toBeCloseTo(annualPremium, -2) // within ±100
  })
})

describe('ageFromDob() and dobFromAge()', () => {
  it('dobFromAge returns a valid YYYY-MM-DD string', () => {
    const dob = dobFromAge(35)
    expect(dob).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('roundtrip: ageFromDob(dobFromAge(age)) ≈ age', () => {
    const age = 40
    const dob = dobFromAge(age)
    const derived = ageFromDob(dob)
    expect(derived).not.toBeNull()
    expect(Math.abs((derived ?? 0) - age)).toBeLessThanOrEqual(1) // ±1 due to birthday timing
  })

  it('returns null for empty string', () => {
    expect(ageFromDob('')).toBeNull()
  })
})
