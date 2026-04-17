/**
 * types/index.ts
 * Central type definitions for Flexi Savings Health Care.
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
export type ScenarioList = 'adult' | 'children'
export type CareCategory = 'health' | 'proactive' | 'preventive' | 'restorative' | 'aesthetics'
export type OtherCareKey = Exclude<CareCategory, 'health'>

export interface CareInfoItem  { icon: string; text: string }
export interface CareAgeGroup  { label: string; items: CareInfoItem[] }
export interface CareInfoEntry { concept: string; groups: CareAgeGroup[] }
export interface AestheticClinic { name: string; tier: 'luxury' | 'premium' | 'standard' }

export interface Scenario {
  year:       number
  scenarioId: number
  name:       string
  nameEn:     string
  cost:       number
  isCustom:   boolean
  category:   ScenarioList
  icon:       string
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

