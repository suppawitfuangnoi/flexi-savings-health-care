/**
 * POST /api/flexi/calculate
 * Validates input and computes premium / sum assured / health benefit.
 * Delegates computation to premiumService (swap with real API when ready).
 */
import { calculatePremium } from '~/services/premiumService'
import { saFromMode, MIN_SA, MAX_AGE } from '~/utils/flexiCalc'
import type { PremiumCalcRequest } from '~/types/api'

export default defineEventHandler(async (event) => {
  const body = await readBody<PremiumCalcRequest>(event)

  if (!['premium', 'sa', 'health'].includes(body.inputMode)) {
    throw createError({ statusCode: 400, statusMessage: 'inputMode must be premium | sa | health' })
  }
  if (typeof body.value !== 'number' || body.value <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'value must be a positive number' })
  }
  if (typeof body.age !== 'number' || body.age < 1 || body.age > MAX_AGE) {
    throw createError({ statusCode: 400, statusMessage: `age must be between 1 and ${MAX_AGE}` })
  }
  if (!['M', 'F'].includes(body.gender)) {
    throw createError({ statusCode: 400, statusMessage: "gender must be 'M' or 'F'" })
  }

  const sa = saFromMode(body.inputMode, body.value, body.age)
  if (sa < MIN_SA) {
    throw createError({
      statusCode: 422,
      statusMessage: 'ทุนประกันต่ำกว่าขั้นต่ำที่กำหนด',
      data: { minSA: MIN_SA },
    })
  }

  return await calculatePremium(body)
})
