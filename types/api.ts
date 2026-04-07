/**
 * types/api.ts
 * API request/response type contracts for Flexi Calculator.
 * Mock implementations in services/ use these types.
 * Backend AdaptorAPI should map to these interfaces.
 */
import type { InputMode } from '~/types'

// ─── Premium Service ──────────────────────────────────────────────────────────

export interface PremiumCalcRequest {
  age: number
  gender: 'M' | 'F'
  inputMode: InputMode
  value: number
}

export interface PremiumCalcResponse {
  sumAssured:    number
  annualPremium: number
  totalPremium:  number
  healthPerYear: number
  cashReturn:    number
  maturity:      number
  rate:          number
  contractYears: number
  paymentYears:  number
}

// ─── Tax Service ──────────────────────────────────────────────────────────────

export interface TaxOption {
  id:             number
  rate:           number        // decimal: 0.00 – 0.35
  rateLabel:      string        // "ไม่คำนวณ" | "5%" | "10%" …
  maxDeductible:  number        // 100_000 for life insurance in TH
}

export interface TaxOptionsResponse {
  options:                     TaxOption[]
  lifeInsuranceMaxDeductible:  number
  remark:                      string
}

export interface TaxCalcResult {
  annualSaving:     number      // premium_deductible × rate
  sixYearSaving:    number      // annualSaving × paymentYears
  deductibleAmount: number      // min(premium, maxDeductible)
  taxRate:          number
}

// ─── Hospital Service ─────────────────────────────────────────────────────────

export type ApiHospitalTier = 'premium' | 'upper' | 'mid'

export interface ApiHospital {
  id:             number
  code:           string
  name:           string
  short:          string
  tier:           ApiHospitalTier
  tierLabel:      string
  tierStyle:      { bg: string; color: string }
  costMultiplier: number        // 0.25 – 0.92
}

export interface HospitalListResponse {
  hospitals: ApiHospital[]
}

// ─── Scenario / Illness Service ───────────────────────────────────────────────

export type ApiScenarioCategory = 'adult' | 'children'

export interface ApiScenario {
  id:            number
  name:          string                  // Thai name
  nameEn:        string                  // English name
  category:      ApiScenarioCategory
  estimatedCost: number                  // cost already adjusted for selected hospital
  popular:       boolean
  icon:          string                  // SVG path snippet (24×24 viewBox)
  isCustom:      boolean
}

export interface ScenarioListResponse {
  hospitalId: number
  category:   ApiScenarioCategory
  scenarios:  ApiScenario[]
}

// ─── Benefit Table Service ────────────────────────────────────────────────────

export interface BenefitTableRequest {
  age:           number
  gender:        'M' | 'F'
  sumAssured:    number
  annualPremium: number
  healthPerYear: number
}

export interface BenefitRow {
  year:                    number
  age:                     number
  annualPremium:           number         // 0 after paymentYears
  cumulativePremium:       number
  cashReturn:              number          // annual 2% of SA
  cumulativeCashReturn:    number
  healthBenefit:           number          // annual health benefit (= healthPerYear)
  cumulativeHealthBenefit: number
  lifeProtectionPct:       number          // 101, 202 … 606
  lifeProtectionAmount:    number
}

export interface BenefitTableResponse {
  contractYears:   number
  paymentYears:    number
  rows:            BenefitRow[]
  maturityAmount:  number          // 500% of SA
  noClaimBonusMax: number          // 20% of total health benefit (if 100% unused)
  cashReturnTotal: number          // 24% of SA
  totalBenefitMax: number          // maturity + noClaimBonusMax + cashReturnTotal
  sumAssured:      number
  annualPremium:   number
  healthPerYear:   number
}
