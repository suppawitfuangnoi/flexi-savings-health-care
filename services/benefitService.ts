/**
 * services/benefitService.ts
 * Mock implementation of benefit table API.
 * Builds a 12-row projection from actuarial constants.
 */
import { compute, CONTRACT_YEARS, PAYMENT_YEARS } from '~/utils/flexiCalc'
import type { BenefitTableRequest, BenefitTableResponse, BenefitRow } from '~/types/api'

const delay = (ms = 300) => new Promise<void>(resolve => setTimeout(resolve, ms))

/**
 * Build the full 12-year benefit table from premium calculation params.
 */
export async function getBenefitTable(req: BenefitTableRequest): Promise<BenefitTableResponse> {
  await delay(300)

  const res = compute(req.sumAssured, req.age, 0)

  const rows: BenefitRow[] = Array.from({ length: CONTRACT_YEARS }, (_, i) => {
    const year = i + 1
    return {
      year,
      age:                     req.age + year,
      annualPremium:           year <= PAYMENT_YEARS ? res.annualPremium : 0,
      cumulativePremium:       res.annualPremium * Math.min(year, PAYMENT_YEARS),
      cashReturn:              res.cashReturn,
      cumulativeCashReturn:    res.cashReturn * year,
      healthBenefit:           res.healthPerYear,
      cumulativeHealthBenefit: res.healthPerYear * year,
      lifeProtectionPct:       Math.min(year * 101, 606),
      lifeProtectionAmount:    req.sumAssured * Math.min(year * 1.01, 6.06),
    }
  })

  const noClaimBonusMax = res.healthPerYear * CONTRACT_YEARS * 0.20

  return {
    contractYears:   CONTRACT_YEARS,
    paymentYears:    PAYMENT_YEARS,
    rows,
    maturityAmount:  res.maturity,
    noClaimBonusMax,
    cashReturnTotal: res.totalCash,
    totalBenefitMax: res.maturity + noClaimBonusMax + res.totalCash,
    sumAssured:      req.sumAssured,
    annualPremium:   req.annualPremium,
    healthPerYear:   req.healthPerYear,
  }
}
