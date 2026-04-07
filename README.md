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
| Icons | Lucide (inline SVG) |
| Testing | Vitest |
| Language | TypeScript |

---

## Project Structure

```
├── pages/
│   └── index.vue                  # Main full-screen calculator page
├── components/flexi/
│   ├── FlexiSetup.vue             # Gender / DOB / Age / Input mode / Tax
│   ├── FlexiBenefitSummary.vue    # Collapsible health benefit section
│   ├── HospitalDropdown.vue       # Hospital tier selector
│   ├── IllnessGrid.vue            # Illness selection grid
│   ├── CoverageGrid.vue           # Amount-first coverage grid
│   ├── FlexiProjectionTable.vue   # 12-year projection table + chart
│   └── FlexiPayoutSummary.vue     # Total benefit summary card
├── stores/
│   └── flexiCalculator.ts         # Pinia store — all calculator state
├── utils/
│   └── flexiCalc.ts               # Core calculation engine + scenario helpers
├── constants/
│   ├── illnesses.ts               # Illness lists + hospital tiers
│   └── flexiConstants.ts          # UI constants
├── types/
│   └── index.ts                   # TypeScript type definitions
└── tests/
    └── unit/                      # Vitest unit tests
```

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
| `MIN_PREMIUM` | ฿50,000 | เบี้ยประกันขั้นต่ำต่อปี |

---

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Run unit tests
npm test

# Type check
npx tsc --noEmit

# Production build
npm run build
```

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

## Changelog

### v1.0.0
- Initial release — Full-screen Flexi Savings Health Care Calculator
- Ported from React + Vite → Nuxt 3 SSR
- Pinia store replaces ~20 React `useState()` calls
- Shared calculation helpers in `utils/flexiCalc.ts` (DRY)
- Sub-components: HospitalDropdown, IllnessGrid, CoverageGrid extracted to separate SFCs
- 39 general illnesses + 20 children illnesses + 6 hospital tiers
- 12-year projection table with chart toggle
- Scenario builder with year-first and amount-first modes
