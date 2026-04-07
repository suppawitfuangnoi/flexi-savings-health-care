/**
 * services/premiumService.ts
 * Mock implementation of premium calculation APIs.
 * Replace internal logic with real HTTP calls when backend is ready.
 */
import { saFromMode, compute, ageFromDob, CONTRACT_YEARS, PAYMENT_YEARS } from '~/utils/flexiCalc'
import type { PremiumCalcRequest, PremiumCalcResponse } from '~/types/api'

const delay = (ms = 400) => new Promise<void>(resolve => setTimeout(resolve, ms))

/**
 * API 1: Calculate age from birth date.
 */
export async function calculateAge(birthDate: string): Promise<{ age: number; birthDate: string }> {
  await delay(100)
  const age = ageFromDob(birthDate) ?? 0
  return { age, birthDate }
}

/**
 * API 2: Calculate premium / sum assured / health benefit (bidirectional).
 * Given any one input value, returns all computed metrics.
 */
export async function calculatePremium(req: PremiumCalcRequest): Promise<PremiumCalcResponse> {
  await delay(400)
  const sa  = saFromMode(req.inputMode, req.value, req.age)
  const res = compute(sa, req.age, 0)
  return {
    sumAssured:    res.sa,
    annualPremium: res.annualPremium,
    totalPremium:  res.totalPremium,
    healthPerYear: res.healthPerYear,
    cashReturn:    res.cashReturn,
    maturity:      res.maturity,
    rate:          res.rate,
    contractYears: CONTRACT_YEARS,
    paymentYears:  PAYMENT_YEARS,
  }
}
