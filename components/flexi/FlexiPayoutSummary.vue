<!--
  FlexiPayoutSummary.vue
  Payout summary section: โบนัส 20% + ครบสัญญา 500% cards + Total Benefit hero card.
  Pixel-perfect port of React FlexiCalculatorModal.tsx lines ~1430–1570.
-->
<template>
  <!-- TOTAL BENEFIT CARD -->
  <div class="rounded-2xl overflow-hidden" style="border:1.5px solid #CBD5E1;box-shadow:0 4px 20px rgba(0,102,179,0.10)">

    <!-- Hero section: dark gradient bg -->
    <div class="px-5 py-5" style="background:linear-gradient(135deg,#0F1E3A 0%,#1A3680 60%,#2E5AAC 100%)">
      <p class="text-[10px] font-bold uppercase tracking-widest mb-3" style="color:rgba(255,255,255,0.40)">
        ผลประโยชน์รวมตลอดอายุสัญญา / TOTAL BENEFIT
      </p>
      <p class="text-[32px] font-extrabold text-white leading-none tracking-tight">
        ฿{{ fmt(totalReceivedAdj) }}
      </p>
      <div class="mt-3 flex items-center gap-3 flex-wrap">
        <span class="flex items-center gap-1.5 text-[11px]" style="color:rgba(255,255,255,0.45)">
          <span style="color:#FCA5A5;font-weight:700">−฿{{ fmt(r.totalPremium) }}</span> จ่ายเบี้ยรวม
        </span>
        <span style="color:rgba(255,255,255,0.2)">·</span>
        <span class="text-[11px]" style="color:rgba(255,255,255,0.40)">ทุนประกัน ฿{{ fmt(r.sa) }}</span>
      </div>
    </div>

    <!-- Sub-metrics: Tax | Profit -->
    <div class="grid grid-cols-2" style="border-top:1px solid #E2E8F0">

      <!-- Tax benefit -->
      <div
        class="px-4 py-4"
        :style="`border-right:1px solid #E2E8F0;background:${store.taxRate > 0 ? '#F0FBF4' : '#FAFAFA'}`"
      >
        <div class="flex items-center gap-1.5 mb-2">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
            :stroke="store.taxRate > 0 ? '#0A8A4C' : '#CCCCCC'"
            stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
          >
            <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
          </svg>
          <p
            class="text-[10px] font-bold uppercase tracking-wider"
            :style="`color:${store.taxRate > 0 ? '#0A8A4C' : '#BBBBBB'}`"
          >ประโยชน์ทางภาษี</p>
        </div>
        <template v-if="store.taxRate > 0">
          <p class="text-[22px] font-extrabold leading-none" style="color:#0A8A4C">+฿{{ fmt(taxSaving) }}</p>
          <p class="text-[10px] mt-1.5 font-semibold" style="color:#6EE7B7">ประหยัดได้/ปี · อัตรา {{ store.taxRate }}%</p>
          <span class="inline-block mt-2 px-3 py-1 rounded-full text-[10px] font-bold" style="background:#FFF8E1;color:#D97706">
            ประกันสะสมทรัพย์ลดหย่อนภาษีได้ทุกปีสูงสุด 100,000 บาท (ตามที่กฎหมายกำหนด)
          </span>
        </template>
        <template v-else>
          <p class="text-[18px] font-bold leading-none" style="color:#DDDDDD">—</p>
          <p class="text-[10px] mt-1.5" style="color:#BBBBBB">เลือกอัตราภาษีด้านบน</p>
        </template>
      </div>

      <!-- Net profit -->
      <div
        class="px-4 py-4"
        :style="`background:${netGainLossAdj >= 0 ? '#EBF0FA' : '#FFF5F5'}`"
      >
        <div class="flex items-center gap-1.5 mb-2">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
            :stroke="netGainLossAdj >= 0 ? '#0066B3' : '#E53E3E'"
            stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
          >
            <template v-if="netGainLossAdj >= 0">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
              <polyline points="17 6 23 6 23 12"/>
            </template>
            <template v-else>
              <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/>
              <polyline points="17 18 23 18 23 12"/>
            </template>
          </svg>
          <p
            class="text-[10px] font-bold uppercase tracking-wider"
            :style="`color:${netGainLossAdj >= 0 ? '#0066B3' : '#E53E3E'}`"
          >กำไรสุทธิ / PROFIT</p>
        </div>
        <p
          class="text-[22px] font-extrabold leading-none"
          :style="`color:${netGainLossAdj >= 0 ? '#0066B3' : '#E53E3E'}`"
        >
          {{ netGainLossAdj >= 0 ? '+' : '−' }}฿{{ fmt(Math.abs(netGainLossAdj)) }}
        </p>
        <p
          class="text-[10px] mt-1.5 font-semibold"
          :style="`color:${netGainLossAdj >= 0 ? '#9BB8E8' : '#FCA5A5'}`"
        >
          {{ netGainLossAdj >= 0 ? 'ได้รับมากกว่าที่จ่าย' : 'จ่ายมากกว่าที่ได้รับ' }}
        </p>
      </div>
    </div>

    <!-- Minor remark (age ≤ 18) -->
    <div
      v-if="store.age <= 18"
      class="px-5 py-3 flex items-start gap-2"
      style="background:#EBF0FA;border-top:1px solid #CBD5E1"
    >
      <span class="text-[11px] shrink-0 mt-px" style="color:#0066B3">ℹ</span>
      <p class="text-[11px] leading-relaxed" style="color:#2E5AAC">
        กรณีผู้ชำระเบี้ยประกันภัยเสียชีวิตจากอุบัติเหตุ จะได้รับการยกเว้นเบี้ยประกันภัย
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useFlexiCalculatorStore } from '~/stores/flexiCalculator'
import { fmt, getIllness, costUsed, benefitAtYear, balanceBeforeScenario } from '~/utils/flexiCalc'

const store = useFlexiCalculatorStore()
const r     = computed(() => store.result)

// ─── Computed values ──────────────────────────────────────────────────────────
const maxAccumulated = computed(() =>
  benefitAtYear(12, store.scenarios, r.value.healthPerYear, store.hospitalPct, store.customIllCost))

const noClaimBonusAdj = computed(() => maxAccumulated.value * 0.20)

const totalReceivedAdj = computed(() =>
  r.value.maturity + r.value.totalCash + maxAccumulated.value + noClaimBonusAdj.value
)

const taxSaving = computed(() =>
  store.taxRate > 0
    ? Math.min(r.value.annualPremium, 100000) * (store.taxRate / 100)
    : 0
)

const totalOutOfPocket = computed(() => {
  const totalCost = store.scenarios.reduce((sum, sc) => {
    const ill = getIllness(sc.illIdx, sc.list)
    return sum + costUsed(ill, store.hospitalPct, store.customIllCost)
  }, 0)
  const covered = store.scenarios.reduce((sum, sc, idx) => {
    const avail = balanceBeforeScenario(idx, store.scenarios, r.value.healthPerYear, store.hospitalPct, store.customIllCost)
    const ill   = getIllness(sc.illIdx, sc.list)
    return sum + Math.min(costUsed(ill, store.hospitalPct, store.customIllCost), avail)
  }, 0)
  return Math.max(0, totalCost - covered)
})

const netGainLossAdj = computed(() =>
  totalReceivedAdj.value - r.value.totalPremium - totalOutOfPocket.value
)
</script>
