/**
 * POST /api/flexi/calculate
 * Runs the Flexi product computation on the server.
 * Keeps actuarial formulas server-side for auditability and versioning.
 */
import { compute, saFromMode, MIN_PREMIUM } from '~/utils/flexiCalc'
import type { InputMode } from '~/types'

interface CalculateRequestBody {
  mode:      InputMode
  value:     number
  age:       number
  usagePct?: number
}

export default defineEventHandler(async (event) => {
  const body = await readBody<CalculateRequestBody>(event)

  if (!['premium', 'sa', 'health'].includes(body.mode)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid mode' })
  }
  if (typeof body.value !== 'number' || body.value <= 0) {
    throw createError({ statusCode: 400, statusMessage: 'value must be a positive number' })
  }
  if (typeof body.age !== 'number' || body.age < 1 || body.age > 85) {
    throw createError({ statusCode: 400, statusMessage: 'age must be between 1 and 85' })
  }

  const usagePct = body.usagePct ?? 0
  if (usagePct < 0 || usagePct > 100) {
    throw createError({ statusCode: 400, statusMessage: 'usagePct must be between 0 and 100' })
  }

  const sa = saFromMode(body.mode, body.value, body.age)

  if (sa < MIN_PREMIUM) {
    return {
      error: 'premiumTooLow',
      minPremium: MIN_PREMIUM,
      result: null,
    }
  }

  const result = compute(sa, body.age, usagePct)

  return { error: null, result }
})
