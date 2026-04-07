<!--
  FlexiBenefitSummary.vue
  Collapsible "Health Benefit" section with bar chart, hospital selector,
  illness grid and add-scenario button.
  Pixel-perfect port of React FlexiCalculatorModal.tsx lines ~700–1150.
-->
<template>
  <div class="rounded-xl overflow-hidden" style="border:1.5px solid #9BB8E8">

    <!-- Collapsible header -->
    <button
      class="w-full px-5 py-3 flex items-center gap-2.5 transition-opacity hover:opacity-90"
      :style="`background:#EBF0FA;border-bottom:${store.benefitExpanded ? '1px solid #9BB8E8' : 'none'}`"
      @click="store.benefitExpanded = !store.benefitExpanded"
    >
      <!-- HeartPulse icon (lucide) -->
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0066B3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0">
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
        <path d="M3.22 12H9.5l1.5-3 2 4.5 1.5-3h4.28"/>
      </svg>
      <div class="flex-1 text-left">
        <p class="font-bold text-sm" style="color:#0066B3">ตัวช่วยการคำนวณค่าใช้จ่ายด้านสุขภาพ</p>
        <p v-if="store.benefitExpanded" class="text-[11px]" style="color:#999999">วงเงินเพิ่มขึ้น 10% ของทุนประกันทุกปี</p>
        <p v-else class="text-[11px]" style="color:#999999">
          วงเงินปีที่ 12 = <span style="color:#0066B3;font-weight:700">฿{{ fmt(_benefitAtYear(12)) }}</span>
          <template v-if="store.scenarios.length > 0"> · {{ store.scenarios.length }} สถานการณ์</template>
          <span style="color:#9BB8E8"> — คลิกเพื่อขยาย</span>
        </p>
      </div>
      <!-- ChevronDown icon -->
      <svg
        width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0066B3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
        class="shrink-0 transition-transform"
        :style="`transform:${store.benefitExpanded ? 'rotate(180deg)' : 'rotate(0deg)'}`"
      >
        <polyline points="6 9 12 15 18 9"/>
      </svg>
    </button>

    <!-- Expanded content -->
    <div v-show="store.benefitExpanded" class="p-5 space-y-4 bg-white">

      <!-- Mode toggle: year-first / amount-first -->
      <div class="flex rounded-xl overflow-hidden" style="border:1.5px solid #E2E8F0">
        <button
          v-for="m in SCENARIO_MODES"
          :key="m.key"
          class="flex-1 px-4 py-2.5 text-left transition-all"
          :style="store.scenarioMode === m.key
            ? 'background:#EBF0FA;border-right:1px solid #E2E8F0'
            : 'background:#F8F8F8;border-right:1px solid #E2E8F0'"
          @click="store.scenarioMode = m.key"
        >
          <p class="text-[11px] font-bold" :style="`color:${store.scenarioMode === m.key ? '#0066B3' : '#AAAAAA'}`">{{ m.label }}</p>
          <p class="text-[10px] mt-0.5" style="color:#BBBBBB">{{ m.sub }}</p>
        </button>
      </div>

      <!-- ═══════════════ YEAR-FIRST MODE ═══════════════ -->
      <template v-if="store.scenarioMode === 'year-first'">

        <!-- Step 1: Pick a year from bar chart -->
        <div>
          <p class="text-[11px] font-bold uppercase tracking-wider mb-2" style="color:#666666">
            1. เลือกปี / Select Year
          </p>
          <div style="height:150px">
            <Bar :data="barData" :options="barOptions" />
          </div>
          <div class="mt-2 flex items-center justify-center gap-4">
            <div class="text-center">
              <p class="text-[10px]" style="color:#999999">วงเงินสะสม</p>
              <p class="text-sm font-bold" style="color:#0066B3">฿{{ fmt(_benefitAtYear(store.pendingYear)) }}</p>
            </div>
            <div class="w-px h-8" style="background:#E2E8F0" />
            <div class="text-center">
              <p class="text-[10px]" style="color:#999999">ปีที่เลือก</p>
              <p class="text-sm font-bold" style="color:#333333">ปีที่ {{ store.pendingYear }}</p>
            </div>
          </div>
        </div>

        <!-- Hospital dropdown -->
        <HospitalDropdown />

        <!-- Step 2: Pick an illness -->
        <div>
          <p class="text-[11px] font-bold uppercase tracking-wider mb-2" style="color:#666666">
            2. เลือกสถานการณ์ / Select Scenario
          </p>

          <!-- Illness tab switcher -->
          <div class="flex rounded-xl overflow-hidden mb-2" style="border:1.5px solid #E2E8F0">
            <!-- General tab -->
            <button
              class="flex-1 px-4 py-2 text-left transition-all flex items-center gap-2"
              :style="store.illnessTab === 'general'
                ? 'background:#EBF0FA;border-right:1px solid #E2E8F0;color:#0066B3'
                : 'background:#F8F8F8;border-right:1px solid #E2E8F0;color:#AAAAAA'"
              @click="switchToTab('general')"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="7" r="4"/><path d="M5.5 21a8.5 8.5 0 0 1 13 0"/>
              </svg>
              <div>
                <p class="text-[11px] font-bold leading-tight">ทั่วไป</p>
                <p class="text-[10px] mt-0.5" style="color:#BBBBBB">โรคสำหรับผู้ใหญ่</p>
              </div>
            </button>
            <!-- Children tab (only shown when age ≤ 18) -->
            <button
              v-if="store.age <= 18"
              class="flex-1 px-4 py-2 text-left transition-all flex items-center gap-2"
              :style="store.illnessTab === 'children'
                ? 'background:#EBF0FA;color:#0066B3'
                : 'background:#F8F8F8;color:#AAAAAA'"
              @click="switchToTab('children')"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="8" r="3"/><path d="M6 21v-1a6 6 0 0 1 12 0v1"/><path d="M12 14v2"/>
              </svg>
              <div>
                <p class="text-[11px] font-bold leading-tight">โรคในเด็ก</p>
                <p class="text-[10px] mt-0.5" style="color:#BBBBBB">โรคที่พบบ่อยในเด็ก</p>
              </div>
            </button>
          </div>

          <!-- Illness grid -->
          <IllnessGrid
            :list="currentIllnesses"
            :list-key="store.illnessTab"
            :accent-color="store.illnessTab === 'children' ? '#0A8A4C' : '#0066B3'"
            :expandable="true"
            :pending-ill-idx="store.pendingIllIdx"
            :pending-list="store.pendingList"
            :custom-ill-cost="store.customIllCost"
            :hospital-pct="store.hospitalPct"
            :illness-expanded="store.illnessExpanded"
            @select="onIllnessSelect"
            @toggle-expand="store.illnessExpanded = !store.illnessExpanded"
            @custom-cost="store.customIllCost = $event"
          />
        </div>

        <!-- Step 3: Add scenario button -->
        <button
          class="w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all"
          :style="`background:${addBtnColor};color:#FFFFFF`"
          @mouseenter="($event.currentTarget as HTMLElement).style.background = addBtnHover"
          @mouseleave="($event.currentTarget as HTMLElement).style.background = addBtnColor"
          @click="addScenario"
        >
          <!-- Plus icon -->
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          เพิ่มสถานการณ์นี้ — ปีที่ {{ store.pendingYear }} / {{ addBtnIllName }}
        </button>

      </template>

      <!-- ═══════════════ AMOUNT-FIRST MODE ═══════════════ -->
      <template v-else>
        <div class="space-y-4">

          <!-- Hospital dropdown -->
          <HospitalDropdown />

          <!-- Amount input -->
          <div>
            <p class="text-[11px] font-bold uppercase tracking-wider mb-2" style="color:#666666">
              ใส่วงเงิน / Enter Amount
            </p>
            <div class="flex items-center gap-3 rounded-xl px-4 py-3" style="border:1.5px solid #9BB8E8;background:#EBF0FA">
              <span class="text-sm font-bold shrink-0" style="color:#0066B3">฿</span>
              <input
                type="number"
                :min="0"
                :step="10000"
                :value="store.amountInput || undefined"
                :placeholder="fmt(store.result.healthPerYear)"
                class="flex-1 text-base font-bold focus:outline-none bg-transparent"
                style="color:#1A2B4A"
                @input="store.amountInput = Math.max(0, +($event.target as HTMLInputElement).value || 0)"
              />
              <span
                v-if="store.amountInput > 0 && store.result.healthPerYear > 0"
                class="text-[11px] shrink-0 px-2 py-0.5 rounded-full"
                style="background:#EBF0FA;color:#0066B3"
              >
                ≈ ปีที่ {{ Math.ceil(store.amountInput / store.result.healthPerYear) }}
              </span>
            </div>
            <p v-if="store.amountInput === 0" class="text-[11px] mt-1.5" style="color:#AAAAAA">
              เช่น วงเงินปีที่ 1 = ฿{{ fmt(store.result.healthPerYear) }}, ปีที่ 5 = ฿{{ fmt(store.result.healthPerYear * 5) }}
            </p>
          </div>

          <!-- Coverage check grid -->
          <div>
            <p class="text-[11px] font-bold uppercase tracking-wider mb-2" style="color:#666666">
              ครอบคลุมสถานการณ์ใด / Coverage Check
            </p>
            <CoverageGrid :amount="store.amountInput > 0 ? store.amountInput : store.result.healthPerYear" />
          </div>

        </div>
      </template>

      <!-- Scenario list (year-first only) -->
      <template v-if="store.scenarioMode === 'year-first'">
        <div
          v-if="store.scenarios.length > 0"
          class="rounded-xl overflow-hidden"
          style="border:1.5px solid #E2E8F0"
        >
          <!-- Header row -->
          <div
            class="grid gap-1.5 px-3 py-2 text-[10px] font-bold uppercase tracking-wider"
            style="grid-template-columns:44px 1fr 72px 72px 68px 28px;background:#F5F5F5;color:#999999"
          >
            <span>ปีที่</span>
            <span>สถานการณ์</span>
            <span class="text-right">วงเงิน</span>
            <span class="text-right">ค่ารักษา</span>
            <span class="text-right">สถานะ</span>
            <span />
          </div>
          <!-- Scenario rows -->
          <div
            v-for="(sc, idx) in store.scenarios"
            :key="idx"
            class="grid gap-1.5 px-3 py-3 items-center text-xs"
            style="grid-template-columns:44px 1fr 72px 72px 68px 28px;border-top:1px solid #F0F0F0"
          >
            <!-- Year badge -->
            <span
              class="font-bold text-center px-1 py-0.5 rounded-lg text-[11px]"
              style="background:#EBF0FA;color:#0066B3"
            >ปี {{ sc.year }}</span>
            <!-- Illness name -->
            <div>
              <p class="font-semibold leading-tight text-[11px]" style="color:#1A2B4A">{{ getIllness(sc.illIdx, sc.list).name }}</p>
              <p class="text-[10px]" style="color:#999999">{{ getIllness(sc.illIdx, sc.list).en }}</p>
            </div>
            <!-- Available balance -->
            <p class="font-bold text-right" :style="`color:${scenarioStatusColor(idx).text}`">
              ฿{{ fmt(_balanceBeforeScenario(idx)) }}
            </p>
            <!-- Cost -->
            <p class="text-right text-[10px] font-semibold" style="color:#555555">
              ฿{{ fmt(_costUsed(getIllness(sc.illIdx, sc.list))) }}
            </p>
            <!-- Status badge -->
            <span
              class="text-[10px] font-bold text-right justify-self-end px-1.5 py-0.5 rounded-full whitespace-nowrap"
              :style="`background:${scenarioStatusColor(idx).text};color:#fff`"
            >
              {{ scenarioStatusBadge(idx) }}
            </span>
            <!-- Delete button -->
            <button
              class="flex items-center justify-center w-6 h-6 rounded-lg transition-colors"
              style="color:#BBBBBB"
              @mouseenter="($event.currentTarget as HTMLElement).style.color = '#E53E3E'"
              @mouseleave="($event.currentTarget as HTMLElement).style.color = '#BBBBBB'"
              @click="store.removeScenario(idx)"
            >
              <!-- Trash2 icon -->
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
              </svg>
            </button>
          </div>
        </div>
        <p v-else class="text-center text-xs py-2" style="color:#BBBBBB">
          ยังไม่มีสถานการณ์ — กดปุ่มเพิ่มเพื่อเริ่ม
        </p>
      </template>

    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { Bar } from 'vue-chartjs'
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip,
} from 'chart.js'
import { useFlexiCalculatorStore } from '~/stores/flexiCalculator'
import { ILLNESSES, CHILDREN_ILLNESSES } from '~/constants/illnesses'
import {
  fmt, getIllness, costUsed, benefitAtYear, balanceBeforeScenario,
} from '~/utils/flexiCalc'
import HospitalDropdown from '~/components/flexi/HospitalDropdown.vue'
import IllnessGrid      from '~/components/flexi/IllnessGrid.vue'
import CoverageGrid     from '~/components/flexi/CoverageGrid.vue'
import type { ScenarioList } from '~/types'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip)

const store = useFlexiCalculatorStore()

const r = computed(() => store.result)

const CUSTOM_ILL_IDX          = ILLNESSES.length - 1
const CHILDREN_CUSTOM_ILL_IDX = CHILDREN_ILLNESSES.length - 1

// Wrappers that bind store params — keeps call sites clean
const _costUsed = (ill: ReturnType<typeof getIllness>) =>
  costUsed(ill, store.hospitalPct, store.customIllCost)

const _benefitAtYear = (y: number) =>
  benefitAtYear(y, store.scenarios, r.value.healthPerYear, store.hospitalPct, store.customIllCost)

const _balanceBeforeScenario = (idx: number) =>
  balanceBeforeScenario(idx, store.scenarios, r.value.healthPerYear, store.hospitalPct, store.customIllCost)

// ─── Scenario status helpers ──────────────────────────────────────────────────
function scenarioStatusColor(idx: number): { text: string } {
  const sc    = store.scenarios[idx]
  const avail = _balanceBeforeScenario(idx)
  const cost  = _costUsed(getIllness(sc.illIdx, sc.list))
  if (avail >= cost) return { text: '#0A8A4C' }
  if (avail > 0)    return { text: '#E67E22' }
  return { text: '#E53E3E' }
}

function scenarioStatusBadge(idx: number): string {
  const sc    = store.scenarios[idx]
  const avail = _balanceBeforeScenario(idx)
  const cost  = _costUsed(getIllness(sc.illIdx, sc.list))
  if (avail >= cost) return '✓ ครบ'
  if (avail > 0)    return '⚠ บางส่วน'
  return '✗ ไม่ครบ'
}

// ─── Bar chart ────────────────────────────────────────────────────────────────
const barData = computed(() => ({
  labels: Array.from({ length: 12 }, (_, i) => `ปี ${i + 1}`),
  datasets: [{
    data: Array.from({ length: 12 }, (_, i) => _benefitAtYear(i + 1)),
    backgroundColor: Array.from({ length: 12 }, (_, i) =>
      store.pendingYear === i + 1 ? '#0066B3' : '#9BB8E8'),
    borderRadius: 4,
  }],
}))

const barOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        title: (items: any[]) => `ปีที่ ${items[0].label.replace('ปี ', '')}`,
        label: (item: any) => `฿${fmt(item.raw)}`,
      },
    },
  },
  scales: {
    x: { grid: { display: false }, ticks: { font: { size: 10 }, color: '#999' } },
    y: { display: false },
  },
  onClick: (_: any, elements: any[]) => {
    if (elements.length > 0) store.pendingYear = elements[0].index + 1
  },
}

// ─── Illness tab & grid ───────────────────────────────────────────────────────
const SCENARIO_MODES = [
  { key: 'year-first'   as const, label: 'ปีที่ → สถานการณ์',  sub: 'เลือกปี แล้วเพิ่มสถานการณ์' },
  { key: 'amount-first' as const, label: 'วงเงิน → ครอบคลุม', sub: 'ใส่จำนวนเงิน ดูว่าครอบคลุมอะไร' },
]

const currentIllnesses = computed(() =>
  store.illnessTab === 'general' ? ILLNESSES : CHILDREN_ILLNESSES)

function switchToTab(tab: ScenarioList) {
  store.illnessTab    = tab
  store.pendingIllIdx = 0
  store.pendingList   = tab
  store.illnessExpanded = false
}

// Reset children tab when age exceeds 18 (mirrors React useEffect)
watch(() => store.age, (newAge) => {
  if (newAge > 18 && store.illnessTab === 'children') {
    store.illnessTab    = 'general'
    store.pendingList   = 'general'
    store.pendingIllIdx = 0
  }
})

function onIllnessSelect(payload: { listKey: ScenarioList; idx: number }) {
  store.pendingList   = payload.listKey
  store.pendingIllIdx = payload.idx
}

// ─── Add scenario ─────────────────────────────────────────────────────────────
const addBtnColor = computed(() => store.pendingList === 'children' ? '#0A8A4C' : '#0066B3')
const addBtnHover = computed(() => store.pendingList === 'children' ? '#06703D' : '#004F8C')

const addBtnIllName = computed(() => {
  const activeList = store.pendingList === 'children' ? CHILDREN_ILLNESSES : ILLNESSES
  const customIdx  = store.pendingList === 'children' ? CHILDREN_CUSTOM_ILL_IDX : CUSTOM_ILL_IDX
  const isCustom   = store.pendingIllIdx === customIdx
  return isCustom
    ? `กำหนดเอง ฿${store.customIllCost.toLocaleString()}`
    : activeList[store.pendingIllIdx]?.name ?? ''
})

function addScenario() {
  store.addScenario({
    year:   store.pendingYear,
    illIdx: store.pendingIllIdx,
    list:   store.pendingList,
  })
}
</script>
