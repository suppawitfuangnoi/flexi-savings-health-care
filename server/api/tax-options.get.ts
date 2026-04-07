/**
 * GET /api/tax-options
 * Returns available tax rate options for life insurance deduction.
 */
import { getTaxOptions } from '~/services/taxService'

export default defineEventHandler(async () => {
  return await getTaxOptions()
})
