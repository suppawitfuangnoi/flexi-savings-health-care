/**
 * stores/flexiCalculator.ts
 * Pinia store for the Flexi Calculator.
 * All data is fetched via server API routes (/api/*).
 * State is blank (null) until the user completes setup and triggers calculation.
 */
import { defineStore } from 'pinia'
import { $fetch } from 'ofetch'
import {
  dobFromAge, ageFromDob,
  CONTRACT_YEARS, NO_CLAIM_BONUS_PCT, MAX_AGE,
  benefitAtYear, balanceBeforeScenario,
} from '~/utils/flexiCalc'
import { MODE_CONFIG } from '~/constants/flexiConstants'
import { DEFAULT_HOSPITAL_SHORT } from '~/constants/flexiConstants'
import type { InputMode, Scenario } from '~/types'
import type {
  PremiumCalcResponse, BenefitTableResponse,
  ApiHospital, ApiScenario, TaxOption, ApiScenarioCategory,
  HospitalListResponse, ScenarioListResponse, TaxOptionsResponse,
} from '~/types/api'

// ─── State interface ──────────────────────────────────────────────────────────

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
  calcError:       string | null
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

// ─── Store ────────────────────────────────────────────────────────────────────

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
    calcError:       null,

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
      return benefitAtYear(CONTRACT_YEARS, this.scenarios, this.healthPerYear) * NO_CLAIM_BONUS_PCT
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
      const maxAccum     = benefitAtYear(CONTRACT_YEARS, this.scenarios, this.healthPerYear)
      const noClaimBonus = maxAccum * NO_CLAIM_BONUS_PCT
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
        this.age !== null &&
        this.age > 0 &&
        this.age <= MAX_AGE &&
        this.primaryValue !== null &&
        this.primaryValue >= MODE_CONFIG[this.inputMode].min
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
      this.primaryValue = Math.max(MODE_CONFIG[newMode].min, Math.round(valueMap[newMode]))
    },

    async calculate() {
      if (!this.canCalculate) return
      this.loadingCalc = true
      this.calcError   = null
      try {
        const premRes = await $fetch<PremiumCalcResponse>('/api/flexi/calculate', {
          method: 'POST',
          body: {
            age:       this.age!,
            gender:    this.gender!,
            inputMode: this.inputMode,
            value:     this.primaryValue!,
          },
        })
        const tableRes = await $fetch<BenefitTableResponse>('/api/benefit-table', {
          method: 'POST',
          body: {
            age:           this.age!,
            gender:        this.gender!,
            sumAssured:    premRes.sumAssured,
            annualPremium: premRes.annualPremium,
            healthPerYear: premRes.healthPerYear,
          },
        })
        this.scenarios     = []
        this.premiumResult = premRes
        this.benefitTable  = tableRes
        this.isCalculated  = true
        if (this.selectedHospitalId) {
          await Promise.all([
            this.fetchScenarios(this.selectedHospitalId, 'adult'),
            this.fetchScenarios(this.selectedHospitalId, 'children'),
          ])
        }
      } catch (e: unknown) {
        // ofetch wraps HTTP errors in FetchError — e.message is the raw
        // "[POST] /api/…: 422 Unprocessable Entity" string which is not
        // user-friendly.  Extract the Nuxt statusMessage from the response
        // body instead, then fall back to a generic Thai message.
        const fe  = e as { response?: { status?: number; _data?: { statusMessage?: string } } }
        const status    = fe?.response?.status
        const serverMsg = fe?.response?._data?.statusMessage

        if (status === 422) {
          this.calcError = serverMsg ?? 'ทุนประกันต่ำกว่าขั้นต่ำที่กำหนด (ขั้นต่ำ ฿50,000)'
        } else if (status === 400) {
          this.calcError = 'ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง'
        } else {
          this.calcError = 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง'
        }
        this.isCalculated = false
      } finally {
        this.loadingCalc = false
      }
    },

    async fetchHospitals() {
      this.loadingHospitals = true
      try {
        const res = await $fetch<HospitalListResponse>('/api/hospitals')
        this.apiHospitals = res.hospitals
        if (res.hospitals.length > 0 && !this.selectedHospitalId) {
          const defaultHospital = res.hospitals.find((h: ApiHospital) => h.short === DEFAULT_HOSPITAL_SHORT)
          this.selectedHospitalId = defaultHospital?.id ?? res.hospitals[0].id
        }
      } finally {
        this.loadingHospitals = false
      }
    },

    async fetchTaxOptions() {
      const res = await $fetch<TaxOptionsResponse>('/api/tax-options')
      this.taxOptions        = res.options
      this.selectedTaxOption = res.options.find((o: TaxOption) => o.rate === 0) ?? null
    },

    async fetchScenarios(hospitalId: number, category: ApiScenarioCategory) {
      this.loadingScenarios = true
      try {
        const res = await $fetch<ScenarioListResponse>('/api/scenarios', {
          query: { hospitalId, category },
        })
        if (category === 'adult') this.adultScenarios    = res.scenarios
        else                      this.childrenScenarios = res.scenarios
        if (!this.pendingScenarioId || this.illnessTab === category) {
          const first = res.scenarios.find((s: ApiScenario) => !s.isCustom)
          if (first) this.pendingScenarioId = first.id
        }
      } finally {
        this.loadingScenarios = false
      }
    },

    async selectHospital(hospitalId: number) {
      this.selectedHospitalId   = hospitalId
      this.hospitalDropdownOpen = false

      // Fetch new hospital's scenario lists first — do NOT clear scenarios yet
      await Promise.all([
        this.fetchScenarios(hospitalId, 'adult'),
        this.fetchScenarios(hospitalId, 'children'),
      ])

      // Remap costs of already-selected scenarios to the new hospital's pricing.
      // Match by name (same disease list across all hospitals, only cost differs).
      // Custom scenarios (user-typed cost) are left unchanged.
      this.scenarios = this.scenarios.map(sc => {
        if (sc.isCustom) return sc
        const list = sc.category === 'children' ? this.childrenScenarios : this.adultScenarios
        const match = list.find(s => s.name === sc.name)
        return match ? { ...sc, cost: match.estimatedCost } : sc
      })
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
