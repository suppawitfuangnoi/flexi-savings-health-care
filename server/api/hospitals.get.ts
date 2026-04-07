/**
 * GET /api/hospitals
 * Returns the list of hospitals with tier metadata.
 */
import { getHospitals } from '~/services/hospitalService'

export default defineEventHandler(async () => {
  return await getHospitals()
})
