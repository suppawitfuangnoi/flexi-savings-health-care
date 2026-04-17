<!--
  FlexiBenefitSummary.vue
  Collapsible "วิเคราะห์ความคุ้มครองด้านสุขภาพ" panel.
  Matches React FlexiCalculatorModal.tsx lines ~935–1130 exactly:

  Step ① — bar chart to pick a policy year
  Step ② — hospital selector + 4-column ✓/✗ coverage grid

  Design decisions:
  - Single mode only (no scenario builder, no amount-first mode).
  - IllnessGrid is a pure read-only viewer — no selection or add flow.
  - All data is API-driven (hospitals + illness lists per hospital).
  - Children tab is hidden when age > 18, matching React behaviour.
  - CI colours: #F8F8F8 header bg / #004CB3 text (React source).
-->
<template>
  <div class="rounded-xl overflow-hidden" style="border:1.5px solid #E2E8F0">

    <!-- ── Collapsible header ───────────────────────────────────────────────── -->
    <button
      class="w-full px-5 py-3 flex items-center gap-2.5 transition-opacity hover:opacity-90"
      :style="`background:#F8F8F8;border-bottom:${store.benefitExpanded ? '1px solid #E2E8F0' : 'none'}`"
      @click="store.benefitExpanded = !store.benefitExpanded"
    >
      <!-- HeartPulse icon -->
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#004CB3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0">
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
        <path d="M3.22 12H9.5l1.5-3 2 4.5 1.5-3h4.28"/>
      </svg>
      <div class="flex-1 text-left">
        <p class="font-bold text-sm" style="color:#004CB3">วิเคราะห์ความคุ้มครองด้านสุขภาพ</p>
        <p v-if="store.benefitExpanded" class="text-[11px]" style="color:#999999">
          วงเงินเติบโต 10% ต่อปี — เลือกปีเพื่อดูโรคที่คุ้มครองได้
        </p>
        <p v-else class="text-[11px]" style="color:#999999">
          วงเงินสูงสุดปีที่ 12:
          <span style="color:#004CB3;font-weight:700">฿{{ fmt(maxBudget) }}</span>
          <span style="color:#BBBBBB"> — แตะเพื่อดูรายละเอียด</span>
        </p>
      </div>
      <!-- Chevron -->
      <svg
        width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#004CB3"
        stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
        class="shrink-0 transition-transform"
        :style="`transform:${store.benefitExpanded ? 'rotate(180deg)' : 'rotate(0deg)'}`"
      >
        <polyline points="6 9 12 15 18 9"/>
      </svg>
    </button>

    <!-- ── Expanded content ────────────────────────────────────────────────── -->
    <div v-show="store.benefitExpanded" class="p-5 space-y-4 bg-white">

      <!-- ── Step 1: Pick a year from bar chart ─────────────────────────── -->
      <div>
        <p class="text-[13px] font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
          <span
            class="inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-black text-white"
            style="background:#004CB3"
          >1</span>
          <span style="color:#003893">เลือกปีกรมธรรม์ที่ต้องการวิเคราะห์</span>
        </p>
        <div style="height:150px">
          <Bar :data="barData" :options="barOptions" />
        </div>
        <div class="mt-2 flex items-center justify-center gap-4">
          <div class="text-center">
            <p class="text-[10px]" style="color:#999999">วงเงินคุ้มครองสะสม</p>
            <p class="text-sm font-bold" style="color:#004CB3">฿{{ fmt(selectedBudget) }}</p>
          </div>
          <div class="w-px h-8" style="background:#E2E8F0" />
          <div class="text-center">
            <p class="text-[10px]" style="color:#999999">ปีที่วิเคราะห์</p>
            <p class="text-sm font-bold" style="color:#333333">ปีที่ {{ store.pendingYear }}</p>
          </div>
        </div>
      </div>

      <!-- ── Hospital selector ───────────────────────────────────────────── -->
      <HospitalDropdown />

      <!-- ── Step 2: Coverage grid ───────────────────────────────────────── -->
      <div>
        <!-- Step heading + adult/children tab toggle -->
        <div class="flex items-center justify-between mb-2">
          <p class="text-[13px] font-bold uppercase tracking-wider flex items-center gap-2">
            <span
              class="inline-flex items-center justify-center w-5 h-5 rounded-full text-[10px] font-black text-white"
              style="background:#004CB3"
            >2</span>
            <span style="color:#003893">โรคที่วงเงินของคุณรองรับได้ในปีที่ {{ store.pendingYear }}</span>
          </p>

          <!-- Children tab toggle — shown only when age ≤ 18 (mirrors React) -->
          <div
            v-if="store.age !== null && store.age <= 18"
            class="flex rounded-lg overflow-hidden"
            style="border:1.5px solid #E2E8F0"
          >
            <button
              v-for="(tab, idx) in ILLNESS_TABS"
              :key="tab.key"
              class="px-3 py-1 text-[11px] font-bold transition-all"
              :style="store.illnessTab === tab.key
                ? 'background:#004CB3;color:#FFFFFF'
                : `background:#FAFAFA;color:#666666;${idx > 0 ? 'border-left:1px solid #E2E8F0' : ''}`"
              @click="store.illnessTab = tab.key"
            >{{ tab.label }}</button>
          </div>
        </div>

        <!-- Loading spinner -->
        <div v-if="store.loadingScenarios" class="flex justify-center py-6">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#004CB3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="animate-spin">
            <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
          </svg>
        </div>

        <!-- Coverage grid -->
        <IllnessGrid
          v-else
          :list="store.currentTabScenarios"
          :budget="selectedBudget"
          :expandable="true"
          :expanded="store.illnessExpanded"
          @toggle-expand="store.illnessExpanded = !store.illnessExpanded"
        />
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip } from 'chart.js'
import { useFlexiCalculatorStore } from '~/stores/flexiCalculator'
import { fmt } from '~/utils/formatters'
import HospitalDropdown from '~/components/flexi/HospitalDropdown.vue'
import IllnessGrid      from '~/components/flexi/IllnessGrid.vue'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip)

const store = useFlexiCalculatorStore()

// ── Constants ─────────────────────────────────────────────────────────────────
const CONTRACT_YEARS = 12

/** Tab definitions for the adult / children toggle. */
const ILLNESS_TABS = [
  { key: 'adult'    as const, label: 'ทั่วไป' },
  { key: 'children' as const, label: 'เด็ก'   },
]

// ── Derived budgets ───────────────────────────────────────────────────────────

/**
 * Health balance at the selected year — uses store.benefitAtYear so that
 * actual yearExpenses entered in the projection table are reflected here too.
 */
const selectedBudget = computed(() =>
  store.benefitAtYear(store.pendingYear),
)

/**
 * Remaining health balance at year 12 — shown in the collapsed header.
 * Decreases if the user has entered yearExpenses in the projection table.
 */
const maxBudget = computed(() =>
  store.benefitAtYear(CONTRACT_YEARS),
)

// ── Reset children tab when age goes above 18 ────────────────────────────────
watch(() => store.age, (newAge) => {
  if (newAge !== null && newAge > 18 && store.illnessTab === 'children') {
    store.illnessTab = 'adult'
  }
})

// ── Bar chart ─────────────────────────────────────────────────────────────────
const barData = computed(() => ({
  labels: Array.from({ length: CONTRACT_YEARS }, (_, i) => `ปี ${i + 1}`),
  datasets: [{
    data: Array.from({ length: CONTRACT_YEARS }, (_, i) =>
      store.benefitAtYear(i + 1),
    ),
    backgroundColor: Array.from({ length: CONTRACT_YEARS }, (_, i) =>
      store.pendingYear === i + 1 ? '#004CB3' : '#7099D4',
    ),
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
        title: (items: any[]) => `ปีกรมธรรม์ที่ ${items[0].label.replace('ปี ', '')}`,
        label: (item: any)    => `฿${fmt(item.raw)}`,
      },
    },
  },
  scales: {
    x: { grid: { display: false }, ticks: { font: { size: 10 }, color: '#999999' } },
    y: { display: false },
  },
  onClick: (_: any, elements: any[]) => {
    if (elements.length > 0) store.pendingYear = elements[0].index + 1
  },
}
</script>
