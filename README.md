# Flexi Savings Health Care — Interactive Calculator

แบบประกันออมทรัพย์คุ้มครองสุขภาพ พัฒนาด้วย Nuxt 3 + Vue 3 + Pinia

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Nuxt 3 (SSR) |
| UI | Vue 3 Composition API (`<script setup>`) |
| State | Pinia |
| Styling | Tailwind CSS + inline style tokens |
| Charts | vue-chartjs + Chart.js |
| Date Picker | v-calendar (Buddhist Era / พ.ศ.) |
| Testing | Vitest |
| Language | TypeScript (strict) |

---

## Getting Started

```bash
npm install
npm run dev        # Dev server → http://localhost:8080
npm test           # Unit tests (Vitest)
npx tsc --noEmit   # TypeScript type check
npm run build      # Production build
```

---

## Project Structure

```
├── pages/
│   └── index.vue                    # Main page — layout + init fetch
├── components/flexi/
│   ├── FlexiSetup.vue               # Gender / DOB / Input mode / Tax / Calculate
│   ├── FlexiBenefitSummary.vue      # Collapsible health benefit section
│   ├── HospitalDropdown.vue         # Hospital tier selector
│   ├── IllnessGrid.vue              # Illness/scenario selector grid
│   ├── CoverageGrid.vue             # Amount-first coverage grid
│   ├── FlexiProjectionTable.vue     # 12-year projection table + chart
│   └── FlexiPayoutSummary.vue       # Total benefit summary card
├── composables/
│   └── useBECalendar.ts             # Buddhist Era v-calendar (composable)
├── stores/
│   └── flexiCalculator.ts           # Pinia store — all calculator state
├── server/api/                      # Nuxt server routes (proxy layer)
│   ├── flexi/calculate.post.ts      # POST /api/flexi/calculate
│   ├── benefit-table.post.ts        # POST /api/benefit-table
│   ├── hospitals.get.ts             # GET  /api/hospitals
│   ├── scenarios.get.ts             # GET  /api/scenarios
│   └── tax-options.get.ts           # GET  /api/tax-options
├── services/                        # Mock service layer (← แก้ไขตรงนี้เมื่อต่อ API จริง)
│   ├── premiumService.ts            # คำนวณเบี้ย / ทุนประกัน / ค่ารักษา
│   ├── taxService.ts                # ตัวเลือกอัตราภาษี
│   ├── hospitalService.ts           # รายชื่อโรงพยาบาล + สถานการณ์โรค
│   └── benefitService.ts            # ตารางผลประโยชน์ 12 ปี
├── utils/
│   ├── flexiCalc.ts                 # Core calculation engine (pure functions)
│   ├── formatters.ts                # Display helpers (fmt)
│   ├── taxCalc.ts                   # Pure tax saving helpers
│   └── dateFormat.ts                # Thai Buddhist Era date helpers
├── constants/
│   ├── illnesses.ts                 # Illness lists + hospital tier constants
│   └── flexiConstants.ts            # UI config + input mode definitions
├── types/
│   ├── index.ts                     # Domain types
│   └── api.ts                       # API request/response contracts
└── tests/unit/
    └── flexiCalc.test.ts            # Unit tests for calculation engine
```

---

## Architecture

```
Browser (Vue + Pinia store)
         │
         │  $fetch('/api/*')
         ▼
Nuxt Server Routes     ← validate input, handle errors, add auth headers
  (server/api/)
         │
         │  function call
         ▼
  Services Layer       ← mock data (ปัจจุบัน) → real HTTP call (อนาคต)
  (services/*.ts)
         │
         ▼
  Backend API          ← your real server
```

**ข้อดีของ Proxy Layer:**
- Validate input ก่อน forward ไป backend
- ใส่ auth header / API key ได้โดยไม่ expose ใน browser
- รองรับ CORS ได้สะดวก
- Swap mock → real ได้โดยแก้แค่ `services/` ไม่ต้องแตะ store หรือ component เลย

---

## Actuarial Constants

> ⚠️ ค่าเหล่านี้เป็น business-critical — **ห้ามแก้ไขโดยไม่ผ่าน actuary**

| Constant | Value | Description |
|---|---|---|
| `CONTRACT_YEARS` | 12 | อายุกรมธรรม์ (ปี) |
| `PAYMENT_YEARS` | 6 | ช่วงชำระเบี้ย (ปี) |
| `CASH_RETURN_PCT` | 2% | เงินคืนทุกปี |
| `HEALTH_BENEFIT_PCT` | 10% | วงเงินสุขภาพต่อปี |
| `MATURITY_PCT` | 500% | เงินครบสัญญาปีที่ 12 |
| `NO_CLAIM_BONUS_PCT` | 20% | โบนัสไม่เคลมวงเงินคงเหลือ |
| `MIN_PREMIUM` | ฿50,000 | เบี้ยประกันขั้นต่ำ (UI validation) |
| `MIN_SA` | ฿50,000 | ทุนประกันขั้นต่ำ (server validation) |
| `MAX_AGE` | 85 | อายุรับประกันสูงสุด |

---

## Design System

| Token | Value |
|---|---|
| Primary Blue | `#0066B3` |
| Navy | `#1A2B4A` |
| Light Gray | `#F5F5F5` |
| Border | `#9BB8E8` |
| Muted Text | `#666666` |

---

---

# 🔌 คู่มือการต่อ Real Backend API

## ภาพรวม: ต้องแก้ไขที่ไหน?

เมื่อ backend พร้อม **แก้แค่ `services/` เพียง 4 ไฟล์** — ไม่ต้องแตะ store, component, หรือ server routes เลย

```
services/
├── premiumService.ts   ← API 1: คำนวณเบี้ย/ทุน/ค่ารักษา
├── taxService.ts       ← API 2: ตัวเลือกภาษี
├── hospitalService.ts  ← API 3+4: โรงพยาบาล + สถานการณ์โรค
└── benefitService.ts   ← API 5: ตารางผลประโยชน์ 12 ปี
```

---

## Step 1 — ตั้งค่า Environment Variable

สร้างไฟล์ `.env` ที่ root ของโปรเจกต์:

```bash
# .env
NUXT_API_BASE_URL=https://your-backend.example.com
```

เพิ่มใน `nuxt.config.ts`:

```ts
export default defineNuxtConfig({
  // ... existing config ...

  runtimeConfig: {
    // ค่านี้ใช้ได้เฉพาะ server-side (ไม่ expose ใน browser)
    apiBaseUrl: process.env.NUXT_API_BASE_URL ?? 'http://localhost:3001',
  },
})
```

> **หมายเหตุ:** ค่าใน `runtimeConfig` (ไม่มี `public`) จะอยู่บน server เท่านั้น ไม่ถูก expose ใน browser bundle

---

## Step 2 — API Contracts (Request / Response)

> Type contracts อยู่ใน `types/api.ts` แล้ว — backend ต้อง implement ให้ตรงกับรูปแบบนี้

---

### API 1 — คำนวณเบี้ยประกัน / ทุนประกัน / ค่ารักษา

**Endpoint:** `POST /flexi/calculate`

**Request Body:**

```json
{
  "age": 35,
  "gender": "M",
  "inputMode": "health",
  "value": 50000
}
```

| Field | Type | Description |
|---|---|---|
| `age` | `number` | อายุผู้เอาประกัน (1–85) |
| `gender` | `"M" \| "F"` | เพศ |
| `inputMode` | `"premium" \| "sa" \| "health"` | โหมดที่ผู้ใช้กรอก |
| `value` | `number` | ค่าที่กรอก (เบี้ย / ทุน / ค่ารักษา ขึ้นอยู่กับ inputMode) |

**Response Body:**

```json
{
  "sumAssured": 500000,
  "annualPremium": 489500,
  "totalPremium": 2937000,
  "healthPerYear": 50000,
  "cashReturn": 10000,
  "maturity": 2500000,
  "rate": 979,
  "contractYears": 12,
  "paymentYears": 6
}
```

| Field | Type | Description |
|---|---|---|
| `sumAssured` | `number` | ทุนประกัน (฿) |
| `annualPremium` | `number` | เบี้ยประกันรายปี (฿) |
| `totalPremium` | `number` | เบี้ยรวมตลอดสัญญา (annualPremium × 6) |
| `healthPerYear` | `number` | วงเงินสุขภาพต่อปี = 10% × SA |
| `cashReturn` | `number` | เงินคืนรายปี = 2% × SA |
| `maturity` | `number` | เงินครบสัญญา = 500% × SA |
| `rate` | `number` | อัตราเบี้ยต่อพัน (จาก rate table) |
| `contractYears` | `number` | อายุสัญญา (12) |
| `paymentYears` | `number` | ปีชำระเบี้ย (6) |

**Error — ทุนประกันต่ำกว่าขั้นต่ำ:**

```
HTTP 422
{ "statusMessage": "ทุนประกันต่ำกว่าขั้นต่ำที่กำหนด", "data": { "minSA": 50000 } }
```

---

### API 2 — ตารางผลประโยชน์ 12 ปี

**Endpoint:** `POST /benefit-table`

**Request Body:**

```json
{
  "age": 35,
  "gender": "M",
  "sumAssured": 500000,
  "annualPremium": 489500,
  "healthPerYear": 50000
}
```

**Response Body:**

```json
{
  "contractYears": 12,
  "paymentYears": 6,
  "sumAssured": 500000,
  "annualPremium": 489500,
  "healthPerYear": 50000,
  "maturityAmount": 2500000,
  "noClaimBonusMax": 120000,
  "cashReturnTotal": 120000,
  "totalBenefitMax": 2740000,
  "rows": [
    {
      "year": 1,
      "age": 36,
      "annualPremium": 489500,
      "cumulativePremium": 489500,
      "cashReturn": 10000,
      "cumulativeCashReturn": 10000,
      "healthBenefit": 50000,
      "cumulativeHealthBenefit": 50000,
      "lifeProtectionPct": 101,
      "lifeProtectionAmount": 505000
    }
    // ... rows 2–12 (year 7–12 จะมี annualPremium = 0)
  ]
}
```

| Field | Type | Description |
|---|---|---|
| `maturityAmount` | `number` | เงินครบสัญญา = 500% × SA |
| `noClaimBonusMax` | `number` | โบนัสไม่เคลมสูงสุด = 20% × (healthPerYear × 12) |
| `cashReturnTotal` | `number` | เงินคืนรวม = 2% × SA × 12 |
| `totalBenefitMax` | `number` | ผลประโยชน์รวมสูงสุด |
| `rows[].lifeProtectionPct` | `number` | ความคุ้มครองชีวิต: ปีที่ 1 = 101%, ปีที่ 2 = 202%, ..., ปีที่ 6+ = 606% |
| `rows[].annualPremium` | `number` | 0 สำหรับปีที่ 7–12 (หมดช่วงชำระเบี้ย) |

---

### API 3 — รายชื่อโรงพยาบาล

**Endpoint:** `GET /hospitals`

**Response Body:**

```json
{
  "hospitals": [
    {
      "id": 1,
      "code": "bumrungrad",
      "name": "โรงพยาบาลบำรุงราษฎร์",
      "short": "Bumrungrad",
      "tier": "premium",
      "tierLabel": "Premium",
      "tierStyle": { "bg": "#FFF3E0", "color": "#E65100" },
      "costMultiplier": 0.92
    },
    {
      "id": 2,
      "code": "bdms",
      "name": "โรงพยาบาลกรุงเทพ",
      "short": "BDMS",
      "tier": "premium",
      "tierLabel": "Premium",
      "tierStyle": { "bg": "#FFF3E0", "color": "#E65100" },
      "costMultiplier": 0.88
    }
  ]
}
```

| Field | Type | Description |
|---|---|---|
| `id` | `number` | ID ใช้อ้างอิงใน API scenarios |
| `tier` | `"premium" \| "upper" \| "mid"` | ระดับโรงพยาบาล |
| `tierStyle` | `{ bg, color }` | สี badge แสดงใน UI |
| `costMultiplier` | `number` | ตัวคูณค่าใช้จ่าย (0.0–1.0) ใช้คำนวณ estimatedCost |

> **หมายเหตุเกี่ยวกับ `short`:** ค่า `short` ของโรงพยาบาล default (`DEFAULT_HOSPITAL_SHORT = 'Phyathai'`) ถูกใช้เลือก default hospital ตอนโหลดหน้า — ถ้าต้องการเปลี่ยน default ให้แก้ค่านี้ใน `constants/flexiConstants.ts`

---

### API 4 — รายการสถานการณ์โรค

**Endpoint:** `GET /scenarios?hospitalId=1&category=adult`

| Query Param | Type | Description |
|---|---|---|
| `hospitalId` | `number` | ID ของโรงพยาบาลที่เลือก |
| `category` | `"adult" \| "children"` | กลุ่มสถานการณ์ |

**Response Body:**

```json
{
  "hospitalId": 1,
  "category": "adult",
  "scenarios": [
    {
      "id": 1,
      "name": "ผ่าตัดหัวใจ",
      "nameEn": "Heart Surgery",
      "category": "adult",
      "estimatedCost": 920000,
      "popular": true,
      "icon": "M12 21.593c-5.63...",
      "isCustom": false
    },
    {
      "id": 40,
      "name": "กำหนดเอง",
      "nameEn": "Custom",
      "category": "adult",
      "estimatedCost": 0,
      "popular": false,
      "icon": "M12 20h9...",
      "isCustom": true
    }
  ]
}
```

| Field | Type | Description |
|---|---|---|
| `estimatedCost` | `number` | **ต้องคำนวณตาม hospital แล้ว** (ปรับตาม costMultiplier ของโรงพยาบาลนั้น) |
| `isCustom` | `boolean` | `true` = ผู้ใช้กรอกค่าเองได้ (estimatedCost จะเป็น 0) |
| `icon` | `string` | SVG path snippet (24×24 viewBox) |
| `popular` | `boolean` | ใช้แสดง badge "ยอดนิยม" |

---

### API 5 — ตัวเลือกอัตราภาษี

**Endpoint:** `GET /tax-options`

**Response Body:**

```json
{
  "options": [
    { "id": 0, "rate": 0,    "rateLabel": "ไม่คำนวณ", "maxDeductible": 100000 },
    { "id": 1, "rate": 0.05, "rateLabel": "5%",        "maxDeductible": 100000 },
    { "id": 2, "rate": 0.10, "rateLabel": "10%",       "maxDeductible": 100000 },
    { "id": 3, "rate": 0.15, "rateLabel": "15%",       "maxDeductible": 100000 },
    { "id": 4, "rate": 0.20, "rateLabel": "20%",       "maxDeductible": 100000 },
    { "id": 5, "rate": 0.25, "rateLabel": "25%",       "maxDeductible": 100000 },
    { "id": 6, "rate": 0.30, "rateLabel": "30%",       "maxDeductible": 100000 },
    { "id": 7, "rate": 0.35, "rateLabel": "35%",       "maxDeductible": 100000 }
  ],
  "lifeInsuranceMaxDeductible": 100000,
  "remark": "ประกันสะสมทรัพย์ลดหย่อนภาษีได้ทุกปีสูงสุด 100,000 บาท (ตามที่กฎหมายกำหนด)"
}
```

| Field | Type | Description |
|---|---|---|
| `rate` | `number` | อัตราภาษีเป็น decimal: 0.10 = 10% |
| `maxDeductible` | `number` | วงเงินลดหย่อนสูงสุดตามกฎหมาย (100,000 ฿) |

---

## Step 3 — แก้ไข Service Files

แก้เพียง 4 ไฟล์ใน `services/` ให้เรียก backend จริงแทน mock data:

### 3A. `services/premiumService.ts`

```ts
import { useRuntimeConfig } from '#imports'
import type { PremiumCalcRequest, PremiumCalcResponse } from '~/types/api'

export async function calculatePremium(req: PremiumCalcRequest): Promise<PremiumCalcResponse> {
  const config = useRuntimeConfig()
  return await $fetch<PremiumCalcResponse>(`${config.apiBaseUrl}/flexi/calculate`, {
    method: 'POST',
    body: req,
  })
}
```

### 3B. `services/benefitService.ts`

```ts
import { useRuntimeConfig } from '#imports'
import type { BenefitTableRequest, BenefitTableResponse } from '~/types/api'

export async function getBenefitTable(req: BenefitTableRequest): Promise<BenefitTableResponse> {
  const config = useRuntimeConfig()
  return await $fetch<BenefitTableResponse>(`${config.apiBaseUrl}/benefit-table`, {
    method: 'POST',
    body: req,
  })
}
```

### 3C. `services/hospitalService.ts`

```ts
import { useRuntimeConfig } from '#imports'
import type {
  HospitalListResponse, ScenarioListResponse, ApiScenarioCategory,
} from '~/types/api'

export async function getHospitals(): Promise<HospitalListResponse> {
  const config = useRuntimeConfig()
  return await $fetch<HospitalListResponse>(`${config.apiBaseUrl}/hospitals`)
}

export async function getScenarios(
  hospitalId: number,
  category: ApiScenarioCategory,
): Promise<ScenarioListResponse> {
  const config = useRuntimeConfig()
  return await $fetch<ScenarioListResponse>(`${config.apiBaseUrl}/scenarios`, {
    query: { hospitalId, category },
  })
}
```

### 3D. `services/taxService.ts`

```ts
import { useRuntimeConfig } from '#imports'
import type { TaxOptionsResponse } from '~/types/api'

export async function getTaxOptions(): Promise<TaxOptionsResponse> {
  const config = useRuntimeConfig()
  return await $fetch<TaxOptionsResponse>(`${config.apiBaseUrl}/tax-options`)
}
```

---

## Step 4 — (Optional) เพิ่ม Auth Header

ถ้า backend ต้องการ API Key หรือ Bearer Token:

เพิ่มใน `nuxt.config.ts`:

```ts
runtimeConfig: {
  apiBaseUrl: process.env.NUXT_API_BASE_URL ?? 'http://localhost:3001',
  apiSecret:  process.env.NUXT_API_SECRET  ?? '',   // ← เพิ่มบรรทัดนี้
},
```

เพิ่มใน `.env`:

```bash
NUXT_API_BASE_URL=https://your-backend.example.com
NUXT_API_SECRET=your-secret-key-here
```

ใส่ header ใน service function:

```ts
export async function calculatePremium(req: PremiumCalcRequest): Promise<PremiumCalcResponse> {
  const config = useRuntimeConfig()
  return await $fetch<PremiumCalcResponse>(`${config.apiBaseUrl}/flexi/calculate`, {
    method: 'POST',
    body: req,
    headers: {
      'Authorization': `Bearer ${config.apiSecret}`,
    },
  })
}
```

> **Security:** `config.apiSecret` อยู่บน server เท่านั้น — ไม่ถูก expose ใน browser bundle เพราะเป็น server-only runtime config

---

## Step 5 — ลบ Mock Delay

ทุก service ปัจจุบันมี `await delay(...)` สำหรับจำลอง network latency ให้ลบออกก่อน deploy:

```ts
// ลบบรรทัดนี้ออกจากทุก service:
const delay = (ms = 300) => new Promise<void>(resolve => setTimeout(resolve, ms))
await delay(400)
```

---

## Step 6 — ทดสอบการเชื่อมต่อ

```bash
# ตั้งค่า .env ให้ชี้ไป backend จริง
# แล้วรัน dev server
npm run dev

# เปิด browser → http://localhost:8080
# กรอกข้อมูล (เพศ + วันเกิด + จำนวนเงิน) — ระบบคำนวณอัตโนมัติ
# เปิด DevTools → Network tab
# ควรเห็น request ไป /api/flexi/calculate (Nuxt proxy)
# และ server route forward ต่อไป backend ของคุณ
```

---

## Step 7 — Checklist ก่อน Production

- [ ] ตั้งค่า `NUXT_API_BASE_URL` ใน production environment variables
- [ ] ตั้งค่า `NUXT_API_SECRET` (ถ้า backend ต้องการ auth)
- [ ] ลบ `await delay(...)` ออกจาก `services/` ทุกไฟล์
- [ ] ตรวจสอบ CORS ที่ backend ให้รับ request จาก Nuxt server ได้
- [ ] ทดสอบ error path: backend ล่ม → frontend แสดง error message ใน auto-calc status bar
- [ ] Run `npm run build` และทดสอบ production build
- [ ] Run `npm test` — unit tests ยังผ่านครบ 21 tests

---

## Error Handling

| สถานการณ์ | HTTP Status | ผลลัพธ์ใน Frontend |
|---|---|---|
| Input ไม่ถูกต้อง | 400 | `store.calcError` แสดงใน auto-calc status bar (สีแดง) |
| ทุนประกันต่ำกว่าขั้นต่ำ | 422 | `store.calcError` แสดงใน auto-calc status bar (สีแดง) |
| Backend ล่ม / Network error | 500 / Network Error | `store.calcError` แสดงใน auto-calc status bar (สีแดง) |
| อายุเกิน MAX_AGE (85) | — | `canCalculate = false` — ไม่ส่ง request, แสดง hint สีเทา |

---

## Changelog

### v1.2.0 (current)
- **19-point refactor** ตาม code review
- Store เรียก server routes ผ่าน `$fetch('/api/*')` — ไม่เรียก services โดยตรงอีกต่อไป
- แยก `fmt()` → `utils/formatters.ts`, `calcTaxSaving()` → `utils/taxCalc.ts`
- แยก calendar BE logic → `composables/useBECalendar.ts`
- เพิ่ม `calcError` state + graceful error handling
- เพิ่ม `MIN_SA`, `MAX_AGE` constants; แก้ชื่อให้ถูกบริบท
- ลบ dead code: legacy utils, legacy types, dead server routes
- **Fix timezone bug:** `toISODate()` ใช้ local date components (แก้ปัญหากด 12 ได้วัน 11 ใน UTC+7)

### v1.1.0
- **API-driven architecture**: ข้อมูลทั้งหมดมาจาก Mock API (`services/`)
- **Blank form on load**: ไม่มี default values — ผู้ใช้ต้องกรอกข้อมูลเอง
- **Auto-calculation**: กรอกข้อมูลครบ (เพศ + วันเกิด + จำนวนเงิน) — ระบบคำนวณอัตโนมัติโดยไม่ต้องกดปุ่ม
- **New types**: `types/api.ts` สำหรับ API contracts
- **Buddhist Era calendar**: v-calendar แสดงปี พ.ศ. ครบทุก view

### v1.0.0
- Initial release — Ported from React + Vite → Nuxt 3 SSR
- Pinia store replaces ~20 React `useState()` calls
- 39 general illnesses + 20 children illnesses + 6 hospital tiers
- 12-year projection table with chart toggle
- Scenario builder: year-first and amount-first modes
