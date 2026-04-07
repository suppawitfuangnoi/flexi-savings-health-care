/**
 * POST /api/benefit-table
 * Builds the 12-year benefit projection table from pre-computed premium data.
 */
import { getBenefitTable } from '~/services/benefitService'
import type { BenefitTableRequest } from '~/types/api'

export default defineEventHandler(async (event) => {
  const body = await readBody<BenefitTableRequest>(event)

  if (typeof body.sumAssured !== 'number'    || body.sumAssured <= 0)
    throw createError({ statusCode: 400, statusMessage: 'sumAssured must be a positive number' })
  if (typeof body.age !== 'number'           || body.age < 1)
    throw createError({ statusCode: 400, statusMessage: 'age must be a positive number' })
  if (typeof body.annualPremium !== 'number' || body.annualPremium <= 0)
    throw createError({ statusCode: 400, statusMessage: 'annualPremium must be a positive number' })
  if (typeof body.healthPerYear !== 'number' || body.healthPerYear <= 0)
    throw createError({ statusCode: 400, statusMessage: 'healthPerYear must be a positive number' })

  return await getBenefitTable(body)
})
