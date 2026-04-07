/**
 * types/index.ts
 * Central type definitions for Goal Genie Pro.
 * All business-domain types live here; no framework-specific imports.
 */

// ─── AUM / Segment / Objective ───────────────────────────────────────────────

export type AumTier    = 'low' | 'mid' | 'high' | 'unknown'
export type AumOption  = '3MB' | '5MB' | '10MB' | '30MB'

export type SegmentKey =
  | 'sinks_dinks'
  | 'entrepreneur'
  | 'senior'
  | 'senior_wealth'
  | 'parents'

export type ObjectiveKey =
  | 'tax_saving'
  | 'investment_saving'
  | 'inheritance'
  | 'lifestyle_protection'
  | 'protect_family'
  | 'retirement'

// ─── Client Profile ───────────────────────────────────────────────────────────

export interface ClientProfile {
  age:          number
  aum:          AumOption
  ownBusiness:  boolean
  hasChild:     boolean
  segment:      SegmentKey
}

export interface ClientPersonalInfo {
  firstName: string
  lastName:  string
  phone:     string
  email:     string
  branch:    string
  gender:    'M' | 'F'
  dob:       string
}

// ─── Flexi Calculator ────────────────────────────────────────────────────────

export type InputMode    = 'premium' | 'sa' | 'health'
export type ScenarioList = 'general' | 'children'

export interface Scenario {
  year:    number
  illIdx:  number
  list:    ScenarioList
}

export interface Illness {
  name:      string
  en:        string
  min:       number
  max:       number
  popular?:  boolean
  icon:      string
}

export interface Hospital {
  name:  string
  short: string
  tier:  'premium' | 'upper' | 'mid'
  pct:   number
}

export interface FlexiComputeResult {
  sa:              number
  rate:            number
  annualPremium:   number
  totalPremium:    number
  cashReturn:      number
  healthPerYear:   number
  healthUsed:      number
  maturity:        number
  noClaimBonus:    number
  finalPayout:     number
  totalCash:       number
  totalHealthUsed: number
  totalReceived:   number
  netGainLoss:     number
}

export interface YearlyProjection {
  year:             number
  cashReturn:       number
  healthBenefit:    number
  accumulated:      number
  premiumPaid:      number
}

// ─── Legacy segmentation (kept for compatibility) ─────────────────────────────

export type AgeSegment  = 'first_step' | 'building' | 'stable' | 'wealthy' | 'retired'
export type WealthTier  = 'wealth' | 'affluent' | 'mass'
export type Lifestyle   = 'sink_dink' | 'parent' | 'entrepreneur' | 'senior_wealth'
export type BehaviorType = 'risk_averse' | 'balanced' | 'growth_oriented' | 'income_seeker'
export type RiskLevel   = 'low' | 'medium' | 'high'
export type FinancialNeed = 'protection' | 'savings' | 'investment' | 'retirement' | 'tax' | 'inheritance'
export type HealthConcern = 'none' | 'moderate' | 'high'

export interface LegacyCustomerProfile {
  ageSegment:    AgeSegment
  wealthTier:    WealthTier
  lifestyle:     Lifestyle
  behavior:      BehaviorType
  riskLevel:     RiskLevel
  financialNeeds: FinancialNeed[]
  healthConcern: HealthConcern
}

export interface Recommendation {
  product:    string
  confidence: number
  reasons:    string[]
  features:   string[]
}
