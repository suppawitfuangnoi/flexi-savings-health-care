/**
 * stores/flexiCalculator.ts
 * Pinia store for the Flexi Calculator.
 * All data is API-driven. State is blank (null) until user completes setup and triggers calculation.
 */
import { defineStore } from 'pinia'
import { dobFromAge, ageFromDob, CONTRACT_YEARS, benefitAtYear, balanceBeforeScenario } from '~/utils/flexiCalc'
import { calculatePremium }  from '~/services/premiumService'
import { getTaxOptions }     from '~/services/taxService'
import { getHospitals, getScenarios } from '~/services/hospitalService'
import { getBenefitTable }   from '~/services/benefitService'
import type { InputMode, Scenario } from '~/types'
import type {
  PremiumCalcResponse, BenefitTableResponse,
  ApiHospital, ApiScenario, TaxOption, ApiScenarioCategory,
} from '~/types/api'

const MODE_MIN: Record<InputMode, number> = {
  premium: 10_000,
  sa:      50_000,
  health:  5_000,
}

interface FlexiCalculatorState {
  // ── Setup ─────────────────────────────────────────────────────────────────
  gender:       'M' | 'F' | null
  age:          number | null
  dob:          string | null
  // ── Input ─────────────────────────────────────────────────────────────────
  inputMode:    InputMode
  primaryValue: number | null
  // ── Calculation state ─────────────────────────────────────────────────────
  isCalculated:    boolean
  loadingCalc:     boolean
  loadingHospitals: boolean
  loadingScenarios: boolean
  // ── API results ───────────────────────────────────────────────────────────
  premiumResult:     PremiumCalcResponse | null
  benefitTable:      BenefitTableResponse | null
  apiHospitals:      ApiHospital[]
  adultScenarios:    ApiScenario[]
  childrenScenarios: ApiScenario[]
  taxOptions:        TaxOption[]
  selectedTaxOption: TaxOption | null
  // ── Scenarios ─────────────────────────────────────────────────────────────
  scenarios:         Scenario[]
  pendingYear:       number
  pendingScenarioId: number | null
  illnessTab:        ApiScenarioCategory
  scenarioMode:      'year-first' | 'amount-first'
  amountInput:       number
  customIllCost:     number
  // ── Hospital ──────────────────────────────────────────────────────────────
  selectedHospitalId:   number | null
  hospitalDropdownOpen: boolean
  // ── UI ────────────────────────────────────────────────────────────────────
  benefitExpanded: boolean
  illnessExpanded: boolean
  projectionView:  'table' | 'chart'
}

export const useFlexiCalculatorStore = defineStore('flexiCalculator', {
  state: (): FlexiCalculatorState => ({
    gender:       null,
    age:          null,
    dob:          null,
    inputMode:    'health',
    primaryValue: null,

    isCalculated:    false,
    loadingCalc:     false,
    loadingHospitals: false,
    loadingScenarios: false,

    premiumResult:     null,
    benefitTable:      null,
    apiHospitals:      [],
    adultScenarios:    [],
    childrenScenarios: [],
    taxOptions:        [],
    selectedTaxOption: null,

    scenarios:         [],
    pendingYear:       1,
    pendingScenarioId: null,
    illnessTab:        'adult',
    scenarioMode:      'year-first',
    amountInput:       0,
    customIllCost:     0,

    selectedHospitalId:   null,
    hospitalDropdownOpen: false,

    benefitExpanded: false,
    illnessExpanded: false,
    projectionView:  'table',
  }),

  getters: {
    selectedHospital: (state): ApiHospital | null =>
      state.apiHospitals.find(h => h.id === state.selectedHospitalId) ?? null,

    healthPerYear(): number {
      return this.premiumResult?.healthPerYear ?? 0
    },

    currentTabScenarios(): ApiScenario[] {
      return this.illnessTab === 'adult' ? this.adultScenarios : this.childrenScenarios
    },

    noClaimBonusAdj(): number {
      return benefitAtYear(CONTRACT_YEARS, this.scenarios, this.healthPerYear) * 0.20
    },

    totalScenarioCost(): number {
      return this.scenarios.reduce((sum, s) => sum + s.cost, 0)
    },

    taxSaving(): number {
      if (!this.selectedTaxOption || this.selectedTaxOption.rate === 0 || !this.premiumResult) return 0
      const deductible = Math.min(this.premiumResult.annualPremium, this.selectedTaxOption.maxDeductible)
      return Math.round(deductible * this.selectedTaxOption.rate)
    },

    totalOutOfPocket(): number {
      let out = 0
      this.scenarios.forEach((sc, idx) => {
        const avail = balanceBeforeScenario(idx, this.scenarios, this.healthPerYear)
        out += Math.max(0, sc.cost - avail)
      })
      return out
    },

    totalReceivedAdj(): number {
      if (!this.premiumResult) return 0
      const maxAccum    = benefitAtYear(CONTRACT_YEARS, this.scenarios, this.healthPerYear)
      const noClaimBonus = maxAccum * 0.20
      return this.premiumResult.maturity
        + this.premiumResult.cashReturn * CONTRACT_YEARS
        + maxAccum + noClaimBonus
    },

    netGainLossAdj(): number {
      if (!this.premiumResult) return 0
      return this.totalReceivedAdj - this.premiumResult.totalPremium - this.totalOutOfPocket
    },

    canCalculate(): boolean {
      return (
        this.gender !== null &&
        this.age !== null && this.age > 0 &&
        this.primaryValue !== null &&
        this.primaryValue >= MODE_MIN[this.inputMode]
      )
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
      if (!this.premiumResult) {
        this.inputMode = newMode
        return
      }
      const valueMap: Record<InputMode, number> = {
        premium: this.premiumResult.annualPremium,
        sa:      this.premiumResult.sumAssured,
        health:  this.premiumResult.healthPerYear,
      }
      this.inputMode    = newMode
      this.primaryValue = Math.max(MODE_MIN[newMode], Math.round(valueMap[newMode]))
    },

    async calculate() {
      if (!this.canCalculate) return
      this.loadingCalc = true
      try {
        const premRes = await calculatePremium({
          age:       this.age!,
          gender:    this.gender!,
          inputMode: this.inputMode,
          value:     this.primaryValue!,
        })
        const tableRes = await getBenefitTable({
          age:           this.age!,
          gender:        this.gender!,
          sumAssured:    premRes.sumAssured,
          annualPremium: premRes.annualPremium,
          healthPerYear: premRes.healthPerYear,
        })
        this.scenarios    = []
        this.premiumResult = premRes
        this.benefitTable  = tableRes
        this.isCalculated  = true
        // Auto-fetch scenarios for selected hospital
        if (this.selectedHospitalId) {
          await Promise.all([
            this.fetchScenarios(this.selectedHospitalId, 'adult'),
            this.fetchScenarios(this.selectedHospitalId, 'children'),
          ])
        }
      } finally {
        this.loadingCalc = false
      }
    },

    async fetchHospitals() {
      this.loadingHospitals = true
      try {
        const res = await getHospitals()
        this.apiHospitals = res.hospitals
        if (res.hospitals.length > 0 && !this.selectedHospitalId) {
          // Default: index 3 = Phyathai (same as before)
          const phyathai = res.hospitals.find(h => h.short === 'Phyathai')
          this.selectedHospitalId = phyathai?.id ?? res.hospitals[0].id
        }
      } finally {
        this.loadingHospitals = false
      }
    },

    async fetchTaxOptions() {
      const res = await getTaxOptions()
      this.taxOptions        = res.options
      this.selectedTaxOption = res.options.find(o => o.rate === 0) ?? null
    },

    async fetchScenarios(hospitalId: number, category: ApiScenarioCategory) {
      this.loadingScenarios = true
      try {
        const res = await getScenarios(hospitalId, category)
        if (category === 'adult')    this.adultScenarios    = res.scenarios
        else                         this.childrenScenarios = res.scenarios
        // Auto-select first non-custom scenario
        if (!this.pendingScenarioId || this.illnessTab === category) {
          const first = res.scenarios.find(s => !s.isCustom)
          if (first) this.pendingScenarioId = first.id
        }
      } finally {
        this.loadingScenarios = false
      }
    },

    async selectHospital(hospitalId: number) {
      this.selectedHospitalId   = hospitalId
      this.hospitalDropdownOpen = false
      this.scenarios = []
      await Promise.all([
        this.fetchScenarios(hospitalId, 'adult'),
        this.fetchScenarios(hospitalId, 'children'),
      ])
    },

    addScenario(scenario: Scenario) {
      if (scenario.isCustom && scenario.cost <= 0) return
      const exists = this.scenarios.some(
        s => s.year === scenario.year && s.scenarioId === scenario.scenarioId,
      )
      if (!exists) this.scenarios.push(scenario)
    },

    removeScenario(index: number) {
      this.scenarios.splice(index, 1)
    },

    reset() {
      this.$reset()
    },
  },
})
