/**
 * POST /api/products
 * Returns recommended product names for a given (objective, aumTier, segment) triple.
 * Keeps the PRODUCTS catalogue on the server — not bundled into client JS.
 */
import { getProducts } from '~/utils/productLogic'
import type { ObjectiveKey, AumTier, SegmentKey } from '~/types'

interface ProductsRequestBody {
  objective: ObjectiveKey
  aumTier:   AumTier
  segment:   SegmentKey
}

const VALID_OBJECTIVES: ObjectiveKey[] = [
  'tax_saving', 'investment_saving', 'inheritance',
  'lifestyle_protection', 'protect_family', 'retirement',
]

const VALID_AUM_TIERS: AumTier[] = ['low', 'mid', 'high', 'unknown']

const VALID_SEGMENTS: SegmentKey[] = [
  'sinks_dinks', 'entrepreneur', 'senior', 'senior_wealth', 'parents',
]

export default defineEventHandler(async (event) => {
  const body = await readBody<ProductsRequestBody>(event)

  if (!VALID_OBJECTIVES.includes(body.objective)) {
    throw createError({ statusCode: 400, statusMessage: `Invalid objective: ${body.objective}` })
  }
  if (!VALID_AUM_TIERS.includes(body.aumTier)) {
    throw createError({ statusCode: 400, statusMessage: `Invalid aumTier: ${body.aumTier}` })
  }
  if (!VALID_SEGMENTS.includes(body.segment)) {
    throw createError({ statusCode: 400, statusMessage: `Invalid segment: ${body.segment}` })
  }

  const products = getProducts(body.objective, body.aumTier, body.segment)

  return { products }
})
