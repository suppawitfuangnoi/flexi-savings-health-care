/**
 * GET /api/scenarios?hospitalId=1&category=adult
 * Returns scenario list for a given hospital and illness category.
 */
import { getScenarios } from '~/services/hospitalService'
import type { ApiScenarioCategory } from '~/types/api'

export default defineEventHandler(async (event) => {
  const query      = getQuery(event)
  const hospitalId = Number(query.hospitalId)
  const category   = String(query.category) as ApiScenarioCategory

  if (!hospitalId || isNaN(hospitalId) || hospitalId < 1) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid hospitalId' })
  }
  if (!['adult', 'children'].includes(category)) {
    throw createError({ statusCode: 400, statusMessage: "category must be 'adult' or 'children'" })
  }

  return await getScenarios(hospitalId, category)
})
