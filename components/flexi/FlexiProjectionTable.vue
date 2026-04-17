<!--
  FlexiProjectionTable.vue
  12-year benefit projection table (transposed) with optional chart view.
  CI colours aligned to React source (FlexiCalculatorModal.tsx § Projection Table).

  Design decisions:
  - All colour tokens live in one `C` constant — single place to update CI.
  - Shared base-style strings (ROW_LABEL_BASE, DATA_CELL_BASE) eliminate repetition.
  - Pure helper functions (yearHeaderCellStyle, dataCellStyle, healthCellStyle)
    keep the template declarative and free of inline logic.
  - Nuxt-specific behaviour (scenario integration in the health row) is preserved
    intact; only colour values are changed to match the React CI.
-->
<template>
  <div class="rounded-xl overflow-hidden" style="border:1.5px solid #E2E8F0">

    <!-- ── Header ─────────────────────────────────────────────────────────── -->
    <div
      class="px-5 py-4 flex items-center justify-between"
      :style="`background:${C.headerBg};border-bottom:2px solid ${C.headerBorder}`"
    >
      <div>
        <p class="font-bold text-sm tracking-wide" style="color:#FFFFFF">
          ตารางแสดงผลประโยชน์ / Benefit Projection
        </p>
        <p class="text-[11px] mt-0.5" style="color:rgba(255,255,255,0.55)">
          ทุนประกัน ฿{{ fmt(r?.sumAssured ?? 0) }} — ปีกรมธรรม์ 1–12
        </p>
      </div>

      <!-- View toggle -->
      <div class="flex rounded-lg overflow-hidden" style="border:1.5px solid rgba(255,255,255,0.25)">
        <button
          v-for="v in (['table', 'chart'] as const)"
          :key="v"
          class="px-3 py-1.5 text-[11px] font-bold transition-all"
          :style="store.projectionView === v
            ? 'background:rgba(255,255,255,0.2);color:#FFFFFF'
            : 'background:rgba(255,255,255,0.07);color:rgba(255,255,255,0.65)'"
          @click="store.projectionView = v"
        >
          <span class="flex items-center gap-1">
            <svg v-if="v === 'table'" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18"/>
            </svg>
            <svg v-else width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="12" width="4" height="9" rx="1"/><rect x="10" y="7" width="4" height="14" rx="1"/><rect x="17" y="3" width="4" height="18" rx="1"/>
            </svg>
            {{ v === 'table' ? 'ตาราง' : 'กราฟ' }}
          </span>
        </button>
      </div>
    </div>

    <!-- ── Chart view ──────────────────────────────────────────────────────── -->
    <template v-if="store.projectionView === 'chart'">
      <div class="p-5">
        <p class="text-[11px] font-bold uppercase tracking-wider mb-3" style="color:#666">
          ผลประโยชน์สะสม VS เบี้ยสะสม
        </p>
        <div style="height:280px">
          <Line :data="lineChartData" :options="lineChartOptions" />
        </div>
        <div class="mt-2 flex flex-wrap gap-x-5 gap-y-1.5 justify-center text-[10px]" style="color:#666">
          <span class="flex items-center gap-1.5">
            <span style="display:inline-block;width:18px;height:2.5px;background:#0066B3;border-radius:2px" />ผลประโยชน์รวม
          </span>
          <span class="flex items-center gap-1.5">
            <svg width="18" height="4"><line x1="0" y1="2" x2="18" y2="2" stroke="#E53E3E" stroke-width="2" stroke-dasharray="4 2"/></svg>เบี้ยสะสม
          </span>
          <span class="flex items-center gap-1.5">
            <svg width="18" height="4"><line x1="0" y1="2" x2="18" y2="2" stroke="#E67E22" stroke-width="1.5" stroke-dasharray="3 2"/></svg>วงเงินสุขภาพสะสม
          </span>
          <span class="flex items-center gap-1.5">
            <svg width="18" height="4"><line x1="0" y1="2" x2="18" y2="2" stroke="#2196F3" stroke-width="1.5" stroke-dasharray="3 2"/></svg>เงินคืน 2% สะสม
          </span>
        </div>
      </div>
    </template>

    <!-- ── Table view ──────────────────────────────────────────────────────── -->
    <template v-else>
      <div class="overflow-x-auto">

        <!-- Payment period indicator -->
        <div style="display:grid;grid-template-columns:140px repeat(12,minmax(64px,1fr)) 80px;background:#F8F9FF;border-bottom:1px solid #E2E8F0">
          <div style="padding:4px 14px" />
          <div style="grid-column:span 6;text-align:center;padding:4px 8px;font-size:9px;font-weight:700;color:#003893;letter-spacing:0.05em;border-right:2px dashed #CBD5E1">
            ◀ ช่วงชำระเบี้ย ปีที่ 1–6 ▶
          </div>
          <div style="grid-column:span 6;text-align:center;padding:4px 8px;font-size:9px;font-weight:700;color:#004CB3;letter-spacing:0.05em">
            ◀ ไม่ต้องชำระเบี้ย ปีที่ 7–12 ▶
          </div>
          <div />
        </div>

        <table style="border-collapse:collapse;width:100%">
          <thead>
            <tr>
              <!-- Type column header -->
              <th :style="`background:${C.typeColBg};color:#FFFFFF;font-weight:700;font-size:11px;padding:10px 14px;white-space:nowrap;position:sticky;left:0;z-index:1;min-width:140px;text-align:left;border-bottom:2px solid ${C.headerBorder}`">
                ประเภท
              </th>
              <!-- Year columns -->
              <th
                v-for="y in 12"
                :key="y"
                :style="yearHeaderCellStyle(y)"
              >
                <span style="font-size:11px">ปี {{ y }}</span>
                <span v-if="y === 12" style="display:block;font-size:8px;color:rgba(255,255,255,0.75);margin-top:1px">ครบสัญญา</span>
              </th>
              <!-- Summary column header -->
              <th :style="`padding:8px 4px;text-align:center;font-size:11px;background:${C.summaryColBg};color:#FFFFFF;font-weight:700;border-bottom:none;min-width:88px;border-left:2px solid rgba(255,255,255,0.25)`">
                สรุป
              </th>
            </tr>
          </thead>

          <tbody>
            <!-- ── Row 1: เบี้ยประกัน ────────────────────────────────────── -->
            <tr>
              <td :style="`${ROW_LABEL_BASE};background:${C.rowPremium}`">
                <div style="display:flex;align-items:center;gap:6px">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>
                  </svg>
                  <div>
                    <div style="font-size:11px;font-weight:700">เบี้ยประกัน</div>
                    <div style="font-size:9px;color:rgba(255,255,255,0.65);font-weight:400">ชำระ 6 ปี</div>
                  </div>
                </div>
              </td>
              <td v-for="y in 12" :key="y" :style="dataCellStyle(y)">
                <template v-if="y <= 6">
                  <span :style="`font-weight:700;display:block;font-size:11px;color:${C.premiumValue}`">
                    ฿{{ fmt(r?.annualPremium ?? 0) }}
                  </span>
                  <span :style="`display:block;font-size:9px;color:${C.premiumSubLabel}`">ชำระเบี้ย</span>
                </template>
                <span v-else style="color:#DDDDDD;font-size:13px">—</span>
              </td>
              <td :style="`${DATA_CELL_BASE};background:${C.premiumSummaryBg};border-left:2px solid ${C.premiumSummaryBorder}`">
                <span style="font-weight:700;display:block;color:#E53E3E;font-size:12px">-฿{{ fmt(r?.totalPremium ?? 0) }}</span>
                <span style="display:block;color:#999;font-size:9px">รวม 6 ปี</span>
              </td>
            </tr>

            <!-- ── Row 2: คุ้มครองชีวิต ──────────────────────────────────── -->
            <tr>
              <td :style="`${ROW_LABEL_BASE};background:${C.rowLifeCover}`">
                <div style="display:flex;align-items:center;gap:6px">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                  <div>
                    <div style="font-size:11px;font-weight:700">คุ้มครองชีวิต</div>
                    <div style="font-size:9px;color:rgba(255,255,255,0.65);font-weight:400">สูงสุด 606%</div>
                  </div>
                </div>
              </td>
              <td v-for="y in 12" :key="y" :style="dataCellStyle(y)">
                <span
                  style="font-weight:700"
                  :style="`color:${C.coverageValue};font-size:${coveragePercent(y) === MAX_COVERAGE ? 12 : 11}px`"
                >{{ coveragePercent(y) }}%</span>
              </td>
              <td :style="`${DATA_CELL_BASE};background:${C.coverageSummaryBg};border-left:2px solid ${C.coverageSummaryBorder}`">
                <span :style="`font-weight:700;display:block;font-size:12px;color:${C.coverageValue}`">{{ MAX_COVERAGE }}%</span>
                <span style="display:block;color:#999;font-size:9px">สูงสุด</span>
              </td>
            </tr>

            <!-- ── Row 3: เงินคืน 2% ─────────────────────────────────────── -->
            <tr>
              <td :style="`${ROW_LABEL_BASE};background:${C.rowCashReturn}`">
                <div style="display:flex;align-items:center;gap:6px">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="8"/>
                    <path d="M12 8v8M9 10.5c0-1.38 1.34-2.5 3-2.5s3 1.12 3 2.5c0 2.5-6 2.5-6 5 0 1.38 1.34 2.5 3 2.5s3-1.12 3-2.5"/>
                  </svg>
                  <div>
                    <div style="font-size:11px;font-weight:700">เงินคืน 2%</div>
                    <div style="font-size:9px;color:rgba(255,255,255,0.65);font-weight:400">ทุกปี ตลอด 12 ปี</div>
                  </div>
                </div>
              </td>
              <td v-for="y in 12" :key="y" :style="dataCellStyle(y)">
                <span :style="`font-weight:700;font-size:11px;color:${C.cashReturnValue}`">2%</span>
                <span style="display:block;color:#999;font-size:9px">฿{{ fmt(r?.cashReturn ?? 0) }}</span>
              </td>
              <td :style="`${DATA_CELL_BASE};background:${C.cashSummaryBg};border-left:2px solid ${C.cashSummaryBorder}`">
                <span :style="`font-weight:700;display:block;font-size:12px;color:${C.cashReturnValue}`">฿{{ fmt((r?.cashReturn ?? 0) * 12) }}</span>
                <span style="display:block;color:#999;font-size:9px">24% × ทุน</span>
              </td>
            </tr>

            <!-- ── Row 4: ค่ารักษา/ปี — static display, matches React source ─── -->
            <tr>
              <td :style="`${ROW_LABEL_BASE};background:${C.rowHealth}`">
                <div style="display:flex;align-items:center;gap:6px">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M12 8v8M8 12h8"/>
                  </svg>
                  <div>
                    <div style="font-size:11px;font-weight:700">ค่ารักษา/ปี</div>
                    <div style="font-size:9px;color:rgba(255,255,255,0.65);font-weight:400">+10%/ปี สะสม</div>
                  </div>
                </div>
              </td>
              <td v-for="y in 12" :key="y" :style="healthCellStyle(y)">
                <span :style="`font-weight:700;font-size:11px;color:${C.healthValue}`">{{ y * 10 }}%</span>
                <span style="display:block;color:#999;font-size:9px">฿{{ fmt(benefitForYear(y)) }}</span>
              </td>
              <td :style="`${DATA_CELL_BASE};background:${C.healthSummaryBg};border-left:2px solid ${C.healthSummaryBorder}`">
                <span :style="`font-weight:700;display:block;font-size:12px;color:${C.healthValue}`">฿{{ fmt(maxAccumulated) }}</span>
                <span style="display:block;color:#999;font-size:9px">120% × ทุน</span>
              </td>
            </tr>

          </tbody>
        </table>
      </div>
    </template>

    <!-- ── Payout cards: โบนัส + ครบสัญญา ───────────────────────────────── -->
    <div class="grid grid-cols-2 gap-0" :style="`border-top:${C.cardDivider}`">

      <!-- Card 1: โบนัส 20% -->
      <div
        class="p-4 flex gap-3 items-center"
        :style="`border-right:${C.cardBorderRight};background:${C.card1Bg}`"
      >
        <div
          class="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
          :style="`background:${C.card1IconBg};box-shadow:0 3px 10px rgba(0,56,147,0.25)`"
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 12 20 22 4 22 4 12"/>
            <rect x="2" y="7" width="20" height="5"/>
            <path d="M12 22V7"/>
            <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
            <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
          </svg>
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-1.5 mb-1 flex-wrap">
            <span
              class="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
              :style="`background:${C.card1BadgeBg};color:${C.card1BadgeText}`"
            >ปีที่ 12</span>
            <span class="text-[9px] font-semibold" :style="`color:${C.card1Label}`">
              โบนัส 20% สุขภาพคงเหลือ
            </span>
          </div>
          <p class="text-xl font-extrabold leading-none" :style="`color:${C.card1Amount}`">
            ฿{{ fmt(noClaimBonusAdj) }}
          </p>
          <p class="text-[10px] mt-1" :style="`color:${C.card1Sub}`">
            20% × ฿{{ fmt(maxAccumulated) }}
            <span v-if="maxAccumulated < (r?.healthPerYear ?? 0) * 12" style="color:#DC2626">
              (ปรับตามใช้จริง)
            </span>
          </p>
        </div>
      </div>

      <!-- Card 2: เงินครบสัญญา 500% -->
      <div class="p-4 flex gap-3 items-center" :style="`background:${C.card2Bg}`">
        <div
          class="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
          :style="`background:${C.card2IconBg};box-shadow:0 3px 10px rgba(0,0,0,0.15)`"
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
            <path d="M4 22h16"/>
            <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
            <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
            <path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/>
          </svg>
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-1.5 mb-1 flex-wrap">
            <span
              class="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
              :style="`background:${C.card2BadgeBg};color:${C.card2BadgeText}`"
            >ปีที่ 12</span>
            <span class="text-[9px] font-semibold" :style="`color:${C.card2SubText}`">
              เงินครบสัญญา 500%
            </span>
          </div>
          <p class="text-xl font-extrabold leading-none" :style="`color:${C.card2Amount}`">
            ฿{{ fmt(r?.maturity ?? 0) }}
          </p>
          <p class="text-[10px] mt-1" :style="`color:${C.card2SubText}`">
            500% × ฿{{ fmt(r?.sumAssured ?? 0) }}
          </p>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend,
} from 'chart.js'
import { useFlexiCalculatorStore } from '~/stores/flexiCalculator'
import { fmt }                     from '~/utils/formatters'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend)

// ── Store ─────────────────────────────────────────────────────────────────────
const store = useFlexiCalculatorStore()
const r     = computed(() => store.premiumResult)

// ── Business constants ────────────────────────────────────────────────────────
const MAX_COVERAGE = 606 // Max life-cover % (101% × 6 years)

// ── Design tokens — CI aligned to React source ────────────────────────────────
// Single source of truth for all colour values. Update here to restyle globally.
const C = {
  // Table header chrome
  headerBg:              'linear-gradient(135deg, #001240 0%, #002D7A 60%, #003893 100%)',
  headerBorder:          '#004CB3',
  typeColBg:             '#001240',
  summaryColBg:          '#003893',

  // Year column headers
  yearPaying:            '#003893', // ปีที่ 1–6  (paying period)
  yearFree:              '#004CB3', // ปีที่ 7–11 (free period)
  yearMaturity:          '#0047AB', // ปีที่ 12   (maturity year)

  // Row label backgrounds (left sticky column)
  rowPremium:            '#003893',
  rowLifeCover:          '#003893',
  rowCashReturn:         '#004CB3',
  rowHealth:             '#E65100',

  // Data cell alternating backgrounds (rows 1–3)
  cellEven:              '#EEF3FC',
  cellOdd:               '#F5F8FF',

  // Health row data cell alternating backgrounds (row 4)
  healthCellEven:        '#FFF3E8',
  healthCellOdd:         '#FFF9F5',

  // Value text colours in data cells
  premiumValue:          '#003893',
  premiumSubLabel:       '#7099D4',
  coverageValue:         '#003893',
  cashReturnValue:       '#004CB3',
  healthValue:           '#E65100',

  // Summary column (rightmost) backgrounds & borders
  premiumSummaryBg:      '#FFF0F0',
  premiumSummaryBorder:  '#F5AAAA',
  coverageSummaryBg:     '#E6EDF8',
  coverageSummaryBorder: '#CBD5E1',
  cashSummaryBg:         '#E6EDF8',
  cashSummaryBorder:     '#CBD5E1',
  healthSummaryBg:       '#FFF3E8',
  healthSummaryBorder:   '#E8A84C',

  // Payout cards chrome
  cardDivider:           '1.5px solid #7099D4',
  cardBorderRight:       '1px solid #7099D4',

  // Card 1 – โบนัส 20% (light navy theme)
  card1Bg:               'linear-gradient(135deg, #E6EDF8 0%, #EDF2FB 100%)',
  card1IconBg:           'linear-gradient(135deg, #003893, #004CB3)',
  card1BadgeBg:          '#003893',
  card1BadgeText:        '#FFFFFF',
  card1Label:            '#004CB3',
  card1Amount:           '#003893',
  card1Sub:              '#5577AA',

  // Card 2 – ครบสัญญา 500% (deep navy theme)
  card2Bg:               'linear-gradient(135deg, #003893 0%, #004CB3 100%)',
  card2IconBg:           'rgba(255,255,255,0.15)',
  card2BadgeBg:          'rgba(255,255,255,0.2)',
  card2BadgeText:        '#FFFFFF',
  card2Amount:           '#FFFFFF',
  card2SubText:          'rgba(255,255,255,0.65)',
} as const

// ── Shared base style strings (DRY) ──────────────────────────────────────────
const ROW_LABEL_BASE =
  'color:#FFFFFF;font-weight:700;font-size:11px;padding:10px 14px;' +
  'white-space:nowrap;position:sticky;left:0;z-index:1;min-width:140px'

const DATA_CELL_BASE =
  'padding:8px 4px;text-align:center;font-size:11px;' +
  'border-bottom:1px solid #EBF0FA;min-width:64px'

// ── Style helper functions ────────────────────────────────────────────────────

/** Returns the inline style string for a year-column header cell. */
function yearHeaderCellStyle(y: number): string {
  const bg         = y === 12 ? C.yearMaturity : y <= 6 ? C.yearPaying : C.yearFree
  const opacity    = y > 6 && y < 12 ? '0.88' : '1'
  const borderLeft = y === 7
    ? '2px dashed rgba(255,255,255,0.3)'
    : '1px solid rgba(255,255,255,0.10)'
  return (
    `padding:8px 4px;text-align:center;font-size:11px;min-width:64px;` +
    `background:${bg};color:#FFFFFF;font-weight:700;border-bottom:none;` +
    `border-left:${borderLeft};opacity:${opacity}`
  )
}

/**
 * Returns the inline style string for a standard data cell (rows 1–3).
 * Alternates between two light blues regardless of which row it belongs to,
 * matching the React CI.
 */
function dataCellStyle(y: number): string {
  const bg = y % 2 === 0 ? C.cellEven : C.cellOdd
  const bl = y === 7 ? '2px dashed #E2E8F0' : '1px solid #EBF0FA'
  return `${DATA_CELL_BASE};background:${bg};border-left:${bl}`
}

/**
 * Returns the inline style string for a health-row data cell (row 4).
 * Static orange alternating palette — matches React source (no scenario colours).
 */
function healthCellStyle(y: number): string {
  const bg = y % 2 === 0 ? C.healthCellEven : C.healthCellOdd
  const bl = y === 7 ? '2px dashed #E2E8F0' : '1px solid #EBF0FA'
  return `${DATA_CELL_BASE};background:${bg};border-left:${bl}`
}

/** Life-cover cumulative percentage for a given year, capped at MAX_COVERAGE. */
function coveragePercent(y: number): number {
  return Math.min(y * 101, MAX_COVERAGE)
}

// ── Health row helpers ────────────────────────────────────────────────────────

/** Accumulated health benefit for year y — simple linear growth, no scenarios. */
const benefitForYear = (y: number): number => store.healthPerYear * y

/** Max accumulated health benefit at contract end (year 12). */
const maxAccumulated  = computed(() => benefitForYear(12))

/** No-claim bonus from store (already simplified, no scenario deductions). */
const noClaimBonusAdj = computed(() => store.noClaimBonusAdj)

// ── Line chart ────────────────────────────────────────────────────────────────
const lineChartData = computed(() => {
  if (!r.value) return { labels: [], datasets: [] }
  const res            = r.value
  const taxSavingTotal = (store.selectedTaxOption?.rate ?? 0) > 0
    ? Math.min(res.annualPremium, 100_000) * store.selectedTaxOption!.rate * 6
    : 0
  const years = Array.from({ length: 12 }, (_, i) => i + 1)
  return {
    labels: years.map(y => `ปี ${y}`),
    datasets: [
      {
        label: 'เบี้ยสะสม',
        data:  years.map(y => Math.min(y, 6) * res.annualPremium),
        borderColor: '#E53E3E', borderWidth: 2, borderDash: [5, 3],
        backgroundColor: 'rgba(229,62,62,0.08)', fill: true, tension: 0.4, pointRadius: 0,
      },
      {
        label: 'ผลประโยชน์รวม',
        data:  years.map(y =>
          res.cashReturn * y + benefitForYear(y) + (y === 12 ? res.maturity + taxSavingTotal : 0),
        ),
        borderColor: '#0066B3', borderWidth: 2.5,
        backgroundColor: 'rgba(0,102,179,0.10)', fill: true, tension: 0.4, pointRadius: 0,
      },
      {
        label: 'วงเงินสุขภาพสะสม',
        data:  years.map(y => benefitForYear(y)),
        borderColor: '#E67E22', borderWidth: 1.5, borderDash: [3, 2],
        backgroundColor: 'transparent', fill: false, tension: 0.4, pointRadius: 0,
      },
      {
        label: 'เงินคืน 2% สะสม',
        data:  years.map(y => res.cashReturn * y),
        borderColor: '#2196F3', borderWidth: 1.5, borderDash: [3, 2],
        backgroundColor: 'transparent', fill: false, tension: 0.4, pointRadius: 0,
      },
    ],
  }
})

const lineChartOptions = {
  responsive: true, maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (ctx: any)     => `฿${fmt(ctx.raw)}`,
        title: (items: any[]) => `ปีที่ ${items[0].label.replace('ปี ', '')}`,
      },
    },
  },
  scales: {
    x: { grid: { display: false }, ticks: { font: { size: 10 }, color: '#999' } },
    y: {
      ticks: {
        font: { size: 9 }, color: '#999',
        callback: (v: any) => {
          if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`
          if (v >= 1_000)     return `${Math.round(v / 1_000)}K`
          return String(v)
        },
      },
      grid: { color: 'rgba(0,0,0,0.05)' },
    },
  },
}
</script>
