/**
 * services/benefitService.ts
 * Mock implementation of benefit table API.
 * Builds a 12-row projection from actuarial constants.
 */
import { CONTRACT_YEARS, PAYMENT_YEARS, CASH_RETURN_PCT, MATURITY_PCT, NO_CLAIM_BONUS_PCT } from '~/utils/flexiCalc'
import type { BenefitTableRequest, BenefitTableResponse, BenefitRow } from '~/types/api'

const delay = (ms = 300) => new Promise<void>(resolve => setTimeout(resolve, ms))

/**
 * Build the full 12-year benefit table from premium calculation params.
 */
export async function getBenefitTable(req: BenefitTableRequest): Promise<BenefitTableResponse> {
  await delay(300)

  const cashReturn     = req.sumAssured * CASH_RETURN_PCT
  const maturityAmount = req.sumAssured * MATURITY_PCT

  const rows: BenefitRow[] = Array.from({ length: CONTRACT_YEARS }, (_, i) => {
    const year = i + 1
    return {
      year,
      age:                     req.age + year,
      annualPremium:           year <= PAYMENT_YEARS ? req.annualPremium : 0,
      cumulativePremium:       req.annualPremium * Math.min(year, PAYMENT_YEARS),
      cashReturn,
      cumulativeCashReturn:    cashReturn * year,
      healthBenefit:           req.healthPerYear,
      cumulativeHealthBenefit: req.healthPerYear * year,
      lifeProtectionPct:       Math.min(year * 101, 606),
      lifeProtectionAmount:    req.sumAssured * Math.min(year * 1.01, 6.06),
    }
  })

  const noClaimBonusMax = req.healthPerYear * CONTRACT_YEARS * NO_CLAIM_BONUS_PCT

  return {
    contractYears:   CONTRACT_YEARS,
    paymentYears:    PAYMENT_YEARS,
    rows,
    maturityAmount,
    noClaimBonusMax,
    cashReturnTotal: cashReturn * CONTRACT_YEARS,
    totalBenefitMax: maturityAmount + noClaimBonusMax + (cashReturn * CONTRACT_YEARS),
    sumAssured:      req.sumAssured,
    annualPremium:   req.annualPremium,
    healthPerYear:   req.healthPerYear,
  }
}
