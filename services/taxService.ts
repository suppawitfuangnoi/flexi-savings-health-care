/**
 * services/taxService.ts
 * Mock implementation of tax benefit API.
 */
import type { TaxOptionsResponse, TaxOption } from '~/types/api'

const delay = (ms = 200) => new Promise<void>(resolve => setTimeout(resolve, ms))

const TAX_RATES                     = [0, 5, 10, 15, 20, 25, 30, 35]
const LIFE_INSURANCE_MAX_DEDUCTIBLE = 100_000

/**
 * API 3: Get available tax rate options for life insurance deduction.
 */
export async function getTaxOptions(): Promise<TaxOptionsResponse> {
  await delay(200)
  const options: TaxOption[] = TAX_RATES.map((r, i) => ({
    id:           i,
    rate:         r / 100,
    rateLabel:    r === 0 ? 'ไม่คำนวณ' : `${r}%`,
    maxDeductible: LIFE_INSURANCE_MAX_DEDUCTIBLE,
  }))
  return {
    options,
    lifeInsuranceMaxDeductible: LIFE_INSURANCE_MAX_DEDUCTIBLE,
    remark: 'ประกันสะสมทรัพย์ลดหย่อนภาษีได้ทุกปีสูงสุด 100,000 บาท (ตามที่กฎหมายกำหนด)',
  }
}

