/**
 * POST /api/segment
 * Derives the customer segment from profile inputs.
 * Thin wrapper around deriveSegment() — exists for future audit logging.
 */
import { deriveSegment, AUM_TIER_MAP } from '~/utils/productLogic'
import type { AumOption } from '~/types'

interface SegmentRequestBody {
  age:             number
  aum:             AumOption
  isBusinessOwner: boolean
  hasChild:        boolean
}

export default defineEventHandler(async (event) => {
  const body = await readBody<SegmentRequestBody>(event)

  if (typeof body.age !== 'number' || body.age < 0 || body.age > 120) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid age' })
  }
  if (!['3MB', '5MB', '10MB', '30MB'].includes(body.aum)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid aum value' })
  }

  const aumTier = AUM_TIER_MAP[body.aum]
  const segment = deriveSegment(body.age, aumTier, body.isBusinessOwner, body.hasChild)

  return { segment }
})
