/**
 * stores/flexiCalculator.ts
 * Pinia store for the Flexi Calculator modal.
 * Owns all calculator state: input mode, scenarios, hospital selection.
 *
 * Replaces the ~20 useState() calls from FlexiCalculatorModal.tsx.
 * This store is ephemeral — it resets when the modal closes.
 */
import { defineStore } from 'pinia'
import {
  compute, saFromMode, dobFromAge, ageFromDob,
  CONTRACT_YEARS, PAYMENT_YEARS, HEALTH_BENEFIT_PCT, CASH_RETURN_PCT, NO_CLAIM_BONUS_PCT,
  getIllness, costUsed, benefitAtYear,
} from '~/utils/flexiCalc'
import { HOSPITALS, ILLNESSES, CHILDREN_ILLNESSES } from '~/constants/illnesses'
import type { InputMode, ScenarioList, Scenario, FlexiComputeResult } from '~/types'

// Input-mode minimum values (mirrors MODE_CONFIG in FlexiCalculatorModal.tsx)
const MODE_MIN: Record<InputMode, number> = {
  premium: 10_000,
  sa:      50_000,
  health:  5_000,
}

interface FlexiCalculatorState {
  // Patient setup
  gender:       'M' | 'F'
  age:          number
  dob:          string

  // Input
  inputMode:    InputMode
  primaryValue: number

  // Scenarios
  scenarios:       Scenario[]
  pendingYear:     number
  pendingIllIdx:   number
  illnessTab:      ScenarioList
  pendingList:     ScenarioList
  scenarioMode:    'year-first' | 'amount-first'
  amountInput:     number
  customIllCost:   number

  // Hospital & tax
  selectedHospital:     number
  hospitalDropdownOpen: boolean
  taxRate:              number

  // UI
  benefitExpanded:  boolean
  illnessExpanded:  boolean
  projectionView:   'table' | 'chart'
}

export const useFlexiCalculatorStore = defineStore('flexiCalculator', {
  state: (): FlexiCalculatorState => ({
    gender:        'M',
    age:           35,
    dob:           dobFromAge(35),
    inputMode:     'health',
    primaryValue:  50_000,
    scenarios:     [],
    pendingYear:   1,
    pendingIllIdx: 0,
    illnessTab:    'general',
    pendingList:   'general',
    scenarioMode:  'year-first',
    amountInput:   0,
    customIllCost: 0,
    selectedHospital:     3, // default Phyathai — index 3 in HOSPITALS array
    hospitalDropdownOpen: false,
    taxRate:       0,
    benefitExpanded:  false,
    illnessExpanded:  false,
    projectionView:   'table',
  }),

  getters: {
    /** Derived SA from the current input mode and value. */
    sa: (state): number => saFromMode(state.inputMode, state.primaryValue, state.age),

    /** Hospital cost multiplier for the selected hospital. */
    hospitalPct: (state): number => HOSPITALS[state.selectedHospital]?.pct ?? 1,

    /** Core benefit computation result. */
    result(): FlexiComputeResult {
      return compute(this.sa, this.age, 0)
    },

    /** Year-by-year projection (12 rows). */
    yearlyData(): Array<{ year: number; cashReturn: number; healthBenefit: number; accumulated: number; premiumPaid: number }> {
      const r = this.result
      return Array.from({ length: CONTRACT_YEARS }, (_, i) => {
        const year      = i + 1
        const cash      = r.cashReturn * year
        const health    = r.healthPerYear * year
        const premium   = r.annualPremium * Math.min(year, PAYMENT_YEARS)
        return {
          year,
          cashReturn:    r.cashReturn,
          healthBenefit: r.healthPerYear,
          accumulated:   cash + health,
          premiumPaid:   premium,
        }
      })
    },

    /** Cost of a scenario based on selected hospital pct and illness cost range. */
    scenarioCost(): (illMin: number, illMax: number) => number {
      const pct = this.hospitalPct
      return (illMin: number, illMax: number) =>
        Math.round(illMin + (illMax - illMin) * pct)
    },

    /** Running balance at year 12 after all scenario deductions × NO_CLAIM_BONUS_PCT. */
    noClaimBonusAdj(): number {
      const r = this.result
      return benefitAtYear(CONTRACT_YEARS, this.scenarios, r.healthPerYear, this.hospitalPct, this.customIllCost) * NO_CLAIM_BONUS_PCT
    },

    /** Total illness cost across all scenarios (at the selected hospital). */
    totalScenarioCost(): number {
      return this.scenarios.reduce((sum, s) => {
        const ill = getIllness(s.illIdx, s.list)
        return sum + costUsed(ill, this.hospitalPct, this.customIllCost)
      }, 0)
    },
  },

  actions: {
    setAge(age: number) {
      this.age = age
      this.dob = dobFromAge(age)
    },

    setDob(dob: string) {
      this.dob = dob
      const derived = ageFromDob(dob)
      if (derived !== null) this.age = derived
    },

    switchMode(newMode: InputMode) {
      // Carry the equivalent value into the new mode, clamped to mode minimum
      const r = this.result
      const valueMap: Record<InputMode, number> = {
        premium: r.annualPremium,
        sa:      r.sa,
        health:  r.healthPerYear,
      }
      this.inputMode    = newMode
      this.primaryValue = Math.max(MODE_MIN[newMode], Math.round(valueMap[newMode]))
    },

    addScenario(scenario: Scenario) {
      // Guard: custom illness requires a positive cost
      const customIdx = scenario.list === 'children'
        ? CHILDREN_ILLNESSES.length - 1
        : ILLNESSES.length - 1
      if (scenario.illIdx === customIdx && this.customIllCost <= 0) return

      // Prevent duplicate (same year + same illness + same list)
      const exists = this.scenarios.some(
        s => s.year === scenario.year && s.illIdx === scenario.illIdx && s.list === scenario.list,
      )
      if (!exists) {
        // React appends without sorting — preserve insertion order
        this.scenarios.push(scenario)
      }
    },

    removeScenario(index: number) {
      this.scenarios.splice(index, 1)
    },

    reset() {
      this.$reset()
    },
  },
})
