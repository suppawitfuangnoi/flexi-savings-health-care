/**
 * utils/flexiCalc.ts
 * Core calculation engine for the Flexi Savings Health Care 12/6 product.
 *
 * ⚠️  Business-critical constants — DO NOT change without actuary confirmation.
 * All functions are pure (no side effects) and safe to run on server or client.
 */
import type { InputMode, FlexiComputeResult, Scenario } from '~/types'

// ─── Actuarial constants ──────────────────────────────────────────────────────

export const CONTRACT_YEARS      = 12     // Policy duration (years)
export const PAYMENT_YEARS       = 6      // Premium payment period
export const CASH_RETURN_PCT     = 0.02   // 2% annual cash return on SA
export const HEALTH_BENEFIT_PCT  = 0.10   // 10% annual health benefit on SA
export const MATURITY_PCT        = 5.00   // 500% maturity payout at end
export const NO_CLAIM_BONUS_PCT  = 0.20   // 20% no-claim bonus on unused health
/** Minimum annual premium (฿) enforced in UI validation. */
export const MIN_PREMIUM         = 50_000
/** Minimum Sum Assured (฿) — bottom of SA band 0. Used for server-side validation. */
export const MIN_SA  = 50_000
/** Maximum insured entry age supported by the rate table. */
export const MAX_AGE = 85

// ─── Rate table: age bracket × SA bracket → rate per 1,000 SA ────────────────

export const SA_BANDS = [
  { min: 50_000,    max: 199_999  },
  { min: 200_000,   max: 499_999  },
  { min: 500_000,   max: 999_999  },
  { min: 1_000_000, max: Infinity },
] as const

export const RATE_TABLE: Array<{
  ageMin: number
  ageMax: number
  rates:  [number, number, number, number]
}> = [
  { ageMin:  0, ageMax: 60, rates: [999, 989, 979, 969] },
  { ageMin: 61, ageMax: 70, rates: [999, 994, 989, 984] },
  { ageMin: 71, ageMax: 80, rates: [999, 996, 993, 989] },
  { ageMin: 81, ageMax: 85, rates: [999, 999, 999, 999] },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getBandIndex(sa: number): number {
  const idx = SA_BANDS.findIndex(b => sa >= b.min && sa <= b.max)
  return idx === -1 ? 0 : idx
}

export function getRate(age: number, sa: number): number {
  const bracket = RATE_TABLE.find(b => age >= b.ageMin && age <= b.ageMax) ?? RATE_TABLE[0]
  return bracket.rates[getBandIndex(sa)]
}

export function ageFromDob(dob: string): number | null {
  if (!dob) return null
  const birth = new Date(dob)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  if (
    today.getMonth() < birth.getMonth() ||
    (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())
  ) age--
  return Math.max(0, age)
}

export function dobFromAge(age: number): string {
  const d = new Date()
  d.setFullYear(d.getFullYear() - age)
  return d.toISOString().split('T')[0]
}

/**
 * Derives Sum Assured from the active input mode.
 * For 'premium' mode, resolves the circular dependency by testing each SA band.
 */
export function saFromMode(mode: InputMode, value: number, age: number): number {
  switch (mode) {
    case 'health':  return value / HEALTH_BENEFIT_PCT
    case 'sa':      return value
    case 'premium': {
      for (let i = 0; i < SA_BANDS.length; i++) {
        const bracket = RATE_TABLE.find(b => age >= b.ageMin && age <= b.ageMax) ?? RATE_TABLE[0]
        const rate = bracket.rates[i]
        const sa   = (value * 1000) / rate
        const band = SA_BANDS[i]
        if (sa >= band.min && sa <= band.max) return sa
      }
      // Fallback: use band 0 rate
      const fallbackRate = (RATE_TABLE.find(b => age >= b.ageMin && age <= b.ageMax) ?? RATE_TABLE[0]).rates[0]
      return (value * 1000) / fallbackRate
    }
  }
}

/**
 * Core benefit computation.
 * @param sa        - Sum Assured (฿)
 * @param age       - Insured age at entry
 * @param usagePct  - Health benefit usage percentage (0–100)
 */
export function compute(sa: number, age: number, usagePct: number): FlexiComputeResult {
  const rate            = getRate(age, sa)
  const annualPremium   = (sa / 1000) * rate
  const totalPremium    = annualPremium * PAYMENT_YEARS
  const cashReturn      = sa * CASH_RETURN_PCT
  const healthPerYear   = sa * HEALTH_BENEFIT_PCT
  const healthUsed      = healthPerYear * (usagePct / 100)
  const maturity        = sa * MATURITY_PCT
  const noClaimBonus    = healthPerYear * (1 - usagePct / 100) * CONTRACT_YEARS * NO_CLAIM_BONUS_PCT
  const finalPayout     = maturity + noClaimBonus
  const totalCash       = cashReturn * CONTRACT_YEARS
  const totalHealthUsed = healthUsed * CONTRACT_YEARS
  const totalReceived   = totalCash + totalHealthUsed + finalPayout
  const netGainLoss     = totalReceived - totalPremium

  return {
    sa, rate, annualPremium, totalPremium,
    cashReturn, healthPerYear, healthUsed,
    maturity, noClaimBonus, finalPayout,
    totalCash, totalHealthUsed, totalReceived, netGainLoss,
  }
}

/**
 * Running health-benefit balance at the end of year y.
 * Adds healthPerYear each year and deducts scenario costs.
 */
export function benefitAtYear(
  y: number,
  scenarios: Scenario[],
  healthPerYear: number,
): number {
  let balance = 0
  for (let yr = 1; yr <= y; yr++) {
    balance += healthPerYear
    scenarios
      .filter(s => s.year === yr)
      .forEach(s => {
        balance = Math.max(0, balance - s.cost)
      })
  }
  return balance
}

/**
 * Available balance just before scenario at array index idx is applied.
 * Stops iteration at the target scenario — preceding scenarios in the same year are deducted.
 */
export function balanceBeforeScenario(
  idx: number,
  scenarios: Scenario[],
  healthPerYear: number,
): number {
  const sc = scenarios[idx]
  let balance = 0
  for (let yr = 1; yr <= sc.year; yr++) {
    balance += healthPerYear
    const yearScens = scenarios.filter(s => s.year === yr)
    for (const s of yearScens) {
      if (s === sc) break
      balance = Math.max(0, balance - s.cost)
    }
  }
  return balance
}
