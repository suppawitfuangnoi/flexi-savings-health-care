/**
 * services/hospitalService.ts
 * Mock implementation of hospital list and scenario list APIs.
 * Adapts existing hardcoded constants to API response format.
 */
import { HOSPITALS, ILLNESSES, CHILDREN_ILLNESSES, TIER_STYLE } from '~/constants/illnesses'
import type {
  HospitalListResponse, ScenarioListResponse,
  ApiHospital, ApiScenario, ApiScenarioCategory,
} from '~/types/api'

const delay = (ms = 300) => new Promise<void>(resolve => setTimeout(resolve, ms))

/**
 * API 4: Get list of hospitals.
 */
export async function getHospitals(): Promise<HospitalListResponse> {
  await delay(200)
  const hospitals: ApiHospital[] = HOSPITALS.map((h, i) => {
    const style = TIER_STYLE[h.tier]
    return {
      id:             i + 1,
      code:           h.short.toLowerCase().replace(/[^a-z]/g, ''),
      name:           h.name,
      short:          h.short,
      tier:           h.tier,
      tierLabel:      style.label,
      tierStyle:      { bg: style.bg, color: style.color },
      costMultiplier: h.pct,
    }
  })
  return { hospitals }
}

/**
 * API 5: Get scenario list for a specific hospital and category.
 * Costs are pre-calculated using the hospital's costMultiplier.
 */
export async function getScenarios(
  hospitalId: number,
  category: ApiScenarioCategory,
): Promise<ScenarioListResponse> {
  await delay(300)

  const hospital = HOSPITALS.find((_, i) => i + 1 === hospitalId)
  const pct      = hospital?.pct ?? 0.5
  const source   = category === 'children' ? CHILDREN_ILLNESSES : ILLNESSES

  const scenarios: ApiScenario[] = source.map((ill, i) => ({
    id:            category === 'children' ? 1000 + i + 1 : i + 1,
    name:          ill.name,
    nameEn:        ill.en,
    category,
    estimatedCost: (ill.min === 0 && ill.max === 0)
      ? 0
      : Math.round(ill.min + (ill.max - ill.min) * pct),
    popular:       ill.popular ?? false,
    icon:          ill.icon,
    isCustom:      ill.min === 0 && ill.max === 0,
  }))

  return { hospitalId, category, scenarios }
}
