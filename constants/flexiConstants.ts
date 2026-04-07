/**
 * constants/flexiConstants.ts
 * Input mode UI configuration for the Flexi Calculator.
 * Separate from actuarial constants (utils/flexiCalc.ts) to avoid bundling
 * calculation logic into components that only need display config.
 */
import type { InputMode } from '~/types'

export interface ModeConfig {
  label:    string
  subLabel: string
  color:    string
  bg:       string
  border:   string
  min:      number
  max:      number
  step:     number
}

export const MODE_CONFIG: Record<InputMode, ModeConfig> = {
  premium: {
    label: 'เบี้ยประกัน', subLabel: 'Annual Premium',
    color: '#E67E22', bg: '#FFF3E0', border: '#F5C791',
    min: 10_000, max: 3_000_000, step: 1_000,
  },
  sa: {
    label: 'ทุนประกัน', subLabel: 'Sum Assured',
    color: '#2E5AAC', bg: '#EBF0FA', border: '#9BB8E8',
    min: 50_000, max: 1_000_000, step: 5_000,
  },
  health: {
    label: 'ค่ารักษา/ปี', subLabel: 'Health Benefit / Year',
    color: '#0066B3', bg: '#EBF0FA', border: '#9BB8E8',
    min: 5_000, max: 2_000_000, step: 1_000,
  },
}

export const MODE_ORDER: InputMode[] = ['premium', 'sa', 'health']

export const TAX_RATES = [0, 5, 10, 15, 20, 25, 30, 35] as const
export type TaxRate = typeof TAX_RATES[number]

/** Short name of the default hospital pre-selected on first load. */
export const DEFAULT_HOSPITAL_SHORT = 'Phyathai' as const
