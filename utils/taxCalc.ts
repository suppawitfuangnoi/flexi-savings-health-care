/**
 * utils/taxCalc.ts
 * Pure tax-saving calculation helpers.
 * No async, no side effects — safe to call anywhere.
 */
import type { TaxCalcResult } from '~/types/api'

const PAYMENT_YEARS = 6

/**
 * Calculate tax saving for life insurance deduction.
 * @param annualPremium - Annual insurance premium in Baht
 * @param taxRate       - Marginal tax rate as decimal (e.g. 0.10 for 10%)
 * @param maxDeductible - Maximum deductible amount (default: 100,000)
 */
export function calcTaxSaving(
  annualPremium: number,
  taxRate: number,
  maxDeductible = 100_000,
): TaxCalcResult {
  const deductibleAmount = Math.min(annualPremium, maxDeductible)
  const annualSaving     = Math.round(deductibleAmount * taxRate)
  const sixYearSaving    = annualSaving * PAYMENT_YEARS
  return { annualSaving, sixYearSaving, deductibleAmount, taxRate }
}
