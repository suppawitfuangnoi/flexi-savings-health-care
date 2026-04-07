<!--
  FlexiProjectionTable.vue
  Transposed 12-year benefit projection table (or chart toggle).
  Pixel-perfect port of React FlexiCalculatorModal.tsx lines ~1162–1425.
  Wraps both the table view and imports FlexiProjectionChart for chart view.
-->
<template>
  <div class="rounded-xl overflow-hidden" style="border:1.5px solid #9BB8E8">

    <!-- Header -->
    <div class="px-5 py-3 flex items-center justify-between" style="background:#EBF0FA;border-bottom:1px solid #9BB8E8">
      <div>
        <p class="font-bold text-sm" style="color:#0066B3">ตารางแสดงผลประโยชน์ / Benefit Projection</p>
        <p class="text-[11px]" style="color:#999999">ทุนประกัน ฿{{ fmt(r?.sumAssured ?? 0) }} — ปีกรมธรรม์ 1–12</p>
      </div>
      <!-- View toggle -->
      <div class="flex rounded-lg overflow-hidden" style="border:1.5px solid #9BB8E8">
        <button
          v-for="v in (['table', 'chart'] as const)"
          :key="v"
          class="px-3 py-1.5 text-[11px] font-bold transition-all"
          :style="store.projectionView === v ? 'background:#0066B3;color:#FFFFFF' : 'background:#FFFFFF;color:#0066B3'"
          @click="store.projectionView = v"
        >
          <span class="flex items-center gap-1">
            <!-- Table icon -->
            <svg v-if="v === 'table'" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18"/>
            </svg>
            <!-- Chart icon -->
            <svg v-else width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="12" width="4" height="9" rx="1"/><rect x="10" y="7" width="4" height="14" rx="1"/><rect x="17" y="3" width="4" height="18" rx="1"/>
            </svg>
            {{ v === 'table' ? 'ตาราง' : 'กราฟ' }}
          </span>
        </button>
      </div>
    </div>

    <!-- Chart view -->
    <template v-if="store.projectionView === 'chart'">
      <div class="p-5">
        <p class="text-[11px] font-bold uppercase tracking-wider mb-3" style="color:#666">ผลประโยชน์สะสม VS เบี้ยสะสม</p>
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

    <!-- Table view -->
    <template v-else>
      <div class="overflow-x-auto">
        <!-- Payment period indicator row -->
        <div
          style="display:grid;grid-template-columns:140px repeat(12, minmax(64px,1fr)) 80px;background:#F8F9FF;border-bottom:1px solid #E2E8F0"
        >
          <div style="padding:4px 14px" />
          <div style="grid-column:span 6;text-align:center;padding:4px 8px;font-size:9px;font-weight:700;color:#4CAF50;letter-spacing:0.05em;border-right:2px dashed #C8E6C9">
            ◀ ช่วงชำระเบี้ย ปีที่ 1–6 ▶
          </div>
          <div style="grid-column:span 6;text-align:center;padding:4px 8px;font-size:9px;font-weight:700;color:#2E5AAC;letter-spacing:0.05em">
            ◀ ไม่ต้องชำระเบี้ย ปีที่ 7–12 ▶
          </div>
          <div />
        </div>

        <table style="border-collapse:collapse;width:100%">
          <thead>
            <tr>
              <!-- Type column header -->
              <th style="background:#0D1B2E;color:#FFFFFF;font-weight:700;font-size:11px;padding:10px 14px;white-space:nowrap;position:sticky;left:0;z-index:1;min-width:140px;text-align:left;border-bottom:2px solid #0066B3">
                ประเภท
              </th>
              <!-- Year columns -->
              <th
                v-for="y in 12"
                :key="y"
                :style="`padding:8px 4px;text-align:center;font-size:11px;border-left:${y === 7 ? '2px dashed rgba(255,255,255,0.3)' : '1px solid rgba(255,255,255,0.08)'};min-width:64px;background:${y === 12 ? '#0A8A4C' : y <= 6 ? '#1A2B4A' : '#2A3D5C'};color:#FFFFFF;font-weight:700;border-bottom:none`"
              >
                <span style="font-size:11px">ปี {{ y }}</span>
                <span v-if="y === 12" style="display:block;font-size:8px;color:rgba(255,255,255,0.7);margin-top:1px">ครบสัญญา</span>
              </th>
              <!-- Summary header -->
              <th style="padding:8px 4px;text-align:center;font-size:11px;background:#0066B3;color:#FFFFFF;font-weight:700;border-bottom:none;min-width:88px;border-left:2px solid rgba(255,255,255,0.2)">
                สรุป
              </th>
            </tr>
          </thead>
          <tbody>

            <!-- Row 1: เบี้ยประกัน -->
            <tr>
              <td style="background:#388E3C;color:#FFFFFF;font-weight:700;font-size:11px;padding:10px 14px;white-space:nowrap;position:sticky;left:0;z-index:1;min-width:140px">
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
              <td
                v-for="y in 12"
                :key="y"
                :style="`padding:8px 4px;text-align:center;font-size:11px;border-left:${y === 7 ? '2px dashed #E2E8F0' : '1px solid #EBF0FA'};border-bottom:1px solid #EBF0FA;min-width:64px;background:${y <= 6 ? (y % 2 === 0 ? '#F1FBF2' : '#FFFFFF') : (y % 2 === 0 ? '#FAFAFA' : '#FFFFFF')}`"
              >
                <template v-if="y <= 6">
                  <span style="font-weight:700;display:block;font-size:11px;color:#2E7D32">฿{{ fmt(r?.annualPremium ?? 0) }}</span>
                  <span style="display:block;font-size:9px;color:#A5D6A7">ชำระเบี้ย</span>
                </template>
                <span v-else style="color:#DDDDDD;font-size:13px">—</span>
              </td>
              <td style="padding:8px 4px;text-align:center;font-size:11px;border-left:2px solid #F5AAAA;border-bottom:1px solid #EBF0FA;min-width:64px;background:#FFF0F0">
                <span style="font-weight:700;display:block;color:#E53E3E;font-size:12px">-฿{{ fmt(r?.totalPremium ?? 0) }}</span>
                <span style="display:block;color:#999;font-size:9px">รวม 6 ปี</span>
              </td>
            </tr>

            <!-- Row 2: คุ้มครองชีวิต -->
            <tr>
              <td style="background:#1565C0;color:#FFFFFF;font-weight:700;font-size:11px;padding:10px 14px;white-space:nowrap;position:sticky;left:0;z-index:1;min-width:140px">
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
              <td
                v-for="y in 12"
                :key="y"
                :style="`padding:8px 4px;text-align:center;font-size:11px;border-left:${y === 7 ? '2px dashed #E2E8F0' : '1px solid #EBF0FA'};border-bottom:1px solid #EBF0FA;min-width:64px;background:${y % 2 === 0 ? '#EEF3FF' : '#FFFFFF'}`"
              >
                <span
                  style="font-weight:700"
                  :style="`color:${Math.min(y * 101, 606) === 606 ? '#0A8A4C' : '#2E5AAC'};font-size:${Math.min(y * 101, 606) === 606 ? 12 : 11}px`"
                >{{ Math.min(y * 101, 606) }}%</span>
              </td>
              <td style="padding:8px 4px;text-align:center;font-size:11px;border-left:2px solid #9BB8E8;border-bottom:1px solid #EBF0FA;background:#EEF3FF">
                <span style="font-weight:700;display:block;color:#0A8A4C;font-size:12px">606%</span>
                <span style="display:block;color:#999;font-size:9px">สูงสุด</span>
              </td>
            </tr>

            <!-- Row 3: เงินคืน 2% -->
            <tr>
              <td style="background:#0277BD;color:#FFFFFF;font-weight:700;font-size:11px;padding:10px 14px;white-space:nowrap;position:sticky;left:0;z-index:1;min-width:140px">
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
              <td
                v-for="y in 12"
                :key="y"
                :style="`padding:8px 4px;text-align:center;font-size:11px;border-left:${y === 7 ? '2px dashed #E2E8F0' : '1px solid #EBF0FA'};border-bottom:1px solid #EBF0FA;min-width:64px;background:${y % 2 === 0 ? '#E3F4FF' : '#FFFFFF'}`"
              >
                <span style="font-weight:700;color:#0277BD;font-size:11px">2%</span>
                <span style="display:block;color:#999;font-size:9px">฿{{ fmt(r?.cashReturn ?? 0) }}</span>
              </td>
              <td style="padding:8px 4px;text-align:center;font-size:11px;border-left:2px solid #9BB8E8;border-bottom:1px solid #EBF0FA;background:#E3F4FF">
                <span style="font-weight:700;display:block;color:#0277BD;font-size:12px">฿{{ fmt((r?.cashReturn ?? 0) * 12) }}</span>
                <span style="display:block;color:#999;font-size:9px">24% × ทุน</span>
              </td>
            </tr>

            <!-- Row 4: วงเงินสุขภาพ -->
            <tr>
              <td style="background:#E65100;color:#FFFFFF;font-weight:700;font-size:11px;padding:10px 14px;white-space:nowrap;position:sticky;left:0;z-index:1;min-width:140px">
                <div style="display:flex;align-items:center;gap:6px">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M12 8v8M8 12h8"/>
                  </svg>
                  <div>
                    <div style="font-size:11px;font-weight:700">วงเงินสุขภาพ</div>
                    <div style="font-size:9px;color:rgba(255,255,255,0.65);font-weight:400">+10%/ปี สะสม</div>
                  </div>
                </div>
              </td>
              <td
                v-for="yd in yearData"
                :key="yd.y"
                :style="`padding:8px 4px;text-align:center;font-size:11px;border-bottom:1px solid #EBF0FA;min-width:64px;
                  background:${yd.coverageStatus ? statusColors[yd.coverageStatus].bg : yd.y % 2 === 0 ? '#FFF3E8' : '#FFFFFF'};
                  border-left:${yd.hasScenario ? `2px solid ${statusColors[yd.coverageStatus ?? 'full'].text}` : yd.y === 7 ? '2px dashed #E2E8F0' : '1px solid #EBF0FA'}`"
              >
                <template v-if="yd.hasScenario">
                  <span
                    v-for="(sc, j) in yd.yearScenarios"
                    :key="j"
                    style="display:block;font-weight:700;line-height:1.2"
                    :style="`color:${statusColors[yd.coverageStatus ?? 'full'].text};font-size:9px`"
                  >{{ sc.name }}</span>
                  <span
                    v-if="yd.totalCost > 0"
                    style="display:block;font-weight:600;font-size:9px"
                    :style="`color:${statusColors[yd.coverageStatus ?? 'full'].text}`"
                  >
                    {{ yd.outOfPocket > 0 ? `เกิน ฿${fmt(yd.outOfPocket)}` : `✓ ฿${fmt(yd.covered)}` }}
                  </span>
                  <span v-else :style="`color:${statusColors[yd.coverageStatus ?? 'full'].text};font-size:10px`">♥</span>
                  <span style="display:block;font-weight:600;color:#999;font-size:9px">฿{{ fmt(_benefitAtYear(yd.y)) }}</span>
                </template>
                <template v-else>
                  <span style="font-weight:700;color:#E65100;font-size:11px">{{ yd.y * 10 }}%</span>
                  <span style="display:block;color:#999;font-size:9px">฿{{ fmt(_benefitAtYear(yd.y)) }}</span>
                </template>
              </td>
              <td style="padding:8px 4px;text-align:center;font-size:11px;border-left:2px solid #E8A84C;border-bottom:1px solid #EBF0FA;background:#FFF3E8">
                <span style="font-weight:700;display:block;color:#E65100;font-size:12px">฿{{ fmt(maxAccumulated) }}</span>
                <span style="display:block;color:#999;font-size:9px">120% × ทุน</span>
              </td>
            </tr>

          </tbody>
        </table>
      </div>
    </template>

    <!-- ── Payout cards: โบนัส + ครบสัญญา (attached to bottom of table, matching React) ── -->
    <div class="grid grid-cols-2 gap-0" style="border-top:1.5px solid #E2E8F0">

      <!-- Card 1: โบนัส 20% -->
      <div
        class="p-5 flex gap-4 items-start"
        style="border-right:1px solid #E2E8F0;background:linear-gradient(135deg,#FFFDF5 0%,#FFF8E7 100%)"
      >
        <div
          class="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
          style="background:linear-gradient(135deg,#F59E0B,#D97706);box-shadow:0 4px 12px rgba(217,119,6,0.25)"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 12 20 22 4 22 4 12"/>
            <rect x="2" y="7" width="20" height="5"/>
            <path d="M12 22V7"/>
            <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
            <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
          </svg>
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-1 flex-wrap">
            <span class="text-[9px] font-bold px-2 py-0.5 rounded-full" style="background:#FEF3C7;color:#B45309">จ่ายปีที่ 12</span>
          </div>
          <p class="text-[10px] font-semibold leading-snug mb-1.5" style="color:#78350F">
            โบนัส 20% ของผลประโยชน์เพิ่มพิเศษ<br/>ด้านสุขภาพคงเหลือ
          </p>
          <p class="text-2xl font-extrabold leading-none" style="color:#0A8A4C">฿{{ fmt(noClaimBonusAdj) }}</p>
          <div class="mt-2 rounded-lg px-3 py-1.5" style="background:rgba(0,0,0,0.04)">
            <p class="text-[10px]" style="color:#92400E">
              20% × วงเงินคงเหลือ <span class="font-bold" style="color:#B45309">฿{{ fmt(maxAccumulated) }}</span>
            </p>
            <p
              v-if="maxAccumulated < (r?.healthPerYear ?? 0) * 12"
              class="text-[10px] mt-0.5"
              style="color:#DC2626"
            >ลดลงจากสถานการณ์ที่เพิ่ม</p>
          </div>
        </div>
      </div>

      <!-- Card 2: ครบสัญญา 500% -->
      <div
        class="p-5 flex gap-4 items-start"
        style="background:linear-gradient(135deg,#F0F7FF 0%,#EBF2FF 100%)"
      >
        <div
          class="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
          style="background:linear-gradient(135deg,#1A2B4A,#2E5AAC);box-shadow:0 4px 12px rgba(46,90,172,0.25)"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
            <path d="M4 22h16"/>
            <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
            <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
            <path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/>
          </svg>
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 mb-1 flex-wrap">
            <span class="text-[9px] font-bold px-2 py-0.5 rounded-full" style="background:#DBEAFE;color:#1D4ED8">จ่ายปีที่ 12</span>
            <span class="text-[9px] font-bold px-2 py-0.5 rounded-full" style="background:#D1FAE5;color:#065F46">500% ทุนประกัน</span>
          </div>
          <p class="text-[10px] font-semibold leading-snug mb-1.5" style="color:#1E3A5F">เงินครบสัญญา</p>
          <p class="text-2xl font-extrabold leading-none" style="color:#0A8A4C">฿{{ fmt(r?.maturity ?? 0) }}</p>
          <div class="mt-2 rounded-lg px-3 py-1.5" style="background:rgba(0,0,0,0.04)">
            <p class="text-[10px]" style="color:#1E3A5F">
              500% × ทุนประกัน <span class="font-bold" style="color:#2E5AAC">฿{{ fmt(r?.sumAssured ?? 0) }}</span>
            </p>
          </div>
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
import { benefitAtYear } from '~/utils/flexiCalc'
import { fmt } from '~/utils/formatters'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend)

const store = useFlexiCalculatorStore()

// Use premiumResult from API
const r = computed(() => store.premiumResult)

// Simplified wrapper — cost is in scenario.cost, no hospitalPct needed
const _benefitAtYear = (y: number) =>
  benefitAtYear(y, store.scenarios, store.healthPerYear)

// Per-year data
const statusColors: Record<string, { bg: string; text: string }> = {
  healthy: { bg: '#E3F2FD', text: '#2E5AAC' },
  full:    { bg: '#E8F5E9', text: '#0A8A4C' },
  partial: { bg: '#FFF3E0', text: '#E67E22' },
  low:     { bg: '#FEECEC', text: '#E53E3E' },
}

const yearData = computed(() => Array.from({ length: 12 }, (_, i) => {
  const y             = i + 1
  const yearScenarios = store.scenarios.filter(s => s.year === y)
  const hasScenario   = yearScenarios.length > 0
  const totalCost     = yearScenarios.reduce((sum, sc) => sum + sc.cost, 0)
  const healthAcc     = store.healthPerYear * y
  const covered       = Math.min(totalCost, healthAcc)
  const outOfPocket   = Math.max(0, totalCost - healthAcc)
  const coverageStatus = hasScenario
    ? (totalCost === 0 ? 'healthy' : outOfPocket === 0 ? 'full' : covered > 0 ? 'partial' : 'low')
    : null
  return { y, yearScenarios, hasScenario, totalCost, covered, outOfPocket, coverageStatus }
}))

const maxAccumulated  = computed(() => _benefitAtYear(12))
const noClaimBonusAdj = computed(() => maxAccumulated.value * 0.20)

// Line chart
const lineChartData = computed(() => {
  if (!r.value) return { labels: [], datasets: [] }
  const res            = r.value
  const taxSavingTotal = (store.selectedTaxOption?.rate ?? 0) > 0
    ? Math.min(res.annualPremium, 100000) * (store.selectedTaxOption!.rate) * 6
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
        data:  years.map(y => res.cashReturn * y + _benefitAtYear(y) + (y === 12 ? res.maturity + taxSavingTotal : 0)),
        borderColor: '#0066B3', borderWidth: 2.5,
        backgroundColor: 'rgba(0,102,179,0.10)', fill: true, tension: 0.4, pointRadius: 0,
      },
      {
        label: 'วงเงินสุขภาพสะสม',
        data:  years.map(y => _benefitAtYear(y)),
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
