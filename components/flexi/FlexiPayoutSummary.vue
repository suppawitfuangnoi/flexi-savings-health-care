<!--
  FlexiPayoutSummary.vue
  Total Benefit hero card — pixel-perfect port of React FlexiCalculatorModal.tsx lines ~1578–1732.

  Layout:
    ① Hero (dark gradient) — 3-column grid
       Col 1  ผลประโยชน์รวม    fixedTotalReceived  (white)
       Col 2  ใช้ผลประโยชน์สุขภาพ  totalHealthUsedByUser  (orange, progress bar)
       Col 3  ได้รับมากกว่าที่จ่าย  fixedNetGain  (sky-blue #7DD3FC)
    ② Tax section — horizontal (icon+label left, amount+badge right)
    ③ Remark — age ≤ 18 only

  Design decisions:
  - Hero uses React's exact gradient (#000D30 → #0F2356 → #1A3A7A) + decorative orbs.
  - Col 2 shows progress bar that fills as the user enters yearExpenses in Row 5.
  - fixedTotalReceived / fixedNetGain always use full health potential (not deducted),
    matching React's fixedTotalReceived / fixedNetGain.
  - Tax shows 6-year total (taxSaving × 6) with "ประหยัดได้ตลอด 6 ปี" — not per-year.
-->
<template>
  <div class="rounded-2xl overflow-hidden" style="border:1.5px solid #002D7A;box-shadow:0 8px 32px rgba(0,0,0,0.18)">

    <!-- ── Hero: 3-col dark gradient ──────────────────────────────────────── -->
    <div style="background:linear-gradient(135deg,#000D30 0%,#0F2356 45%,#1A3A7A 100%);position:relative;overflow:hidden">

      <!-- Decorative orbs (matching React source exactly) -->
      <div style="position:absolute;top:-40px;right:-40px;width:160px;height:160px;border-radius:50%;background:rgba(100,160,255,0.06);pointer-events:none" />
      <div style="position:absolute;bottom:-20px;left:80px;width:100px;height:100px;border-radius:50%;background:rgba(255,165,80,0.05);pointer-events:none" />

      <div class="grid grid-cols-3">

        <!-- ── Col 1: ผลประโยชน์รวม ────────────────────────────────────── -->
        <div class="px-5 py-6" style="border-right:1px solid rgba(255,255,255,0.08)">
          <div class="flex items-center gap-1.5 mb-3">
            <div class="w-4 h-4 rounded flex items-center justify-center" style="background:rgba(255,255,255,0.1)">
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
                <path d="M4 22h16"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2z"/>
              </svg>
            </div>
            <p class="text-[9px] font-bold uppercase tracking-widest" style="color:rgba(255,255,255,0.38)">
              ผลประโยชน์รวม / TOTAL
            </p>
          </div>
          <p class="text-[30px] font-extrabold text-white leading-none tracking-tight">
            ฿{{ fmt(totalReceivedAdj) }}
          </p>
          <div class="mt-2.5 space-y-1">
            <div class="flex items-center gap-1.5">
              <span class="text-[9px] font-bold px-1.5 py-0.5 rounded" style="background:rgba(252,165,165,0.15);color:#FCA5A5">จ่าย</span>
              <span class="text-[11px] font-semibold" style="color:rgba(255,255,255,0.45)">−฿{{ fmt(r?.totalPremium ?? 0) }}</span>
            </div>
            <div class="flex items-center gap-1.5">
              <span class="text-[9px] font-bold px-1.5 py-0.5 rounded" style="background:rgba(125,211,252,0.12);color:#7DD3FC">ทุน</span>
              <span class="text-[11px] font-semibold" style="color:rgba(255,255,255,0.35)">฿{{ fmt(r?.sumAssured ?? 0) }}</span>
            </div>
          </div>
        </div>

        <!-- ── Col 2: ใช้ผลประโยชน์สุขภาพ ──────────────────────────────── -->
        <div class="px-5 py-6" style="border-right:1px solid rgba(255,255,255,0.08);background:rgba(230,81,0,0.08)">
          <div class="flex items-center gap-1.5 mb-3">
            <div class="w-4 h-4 rounded flex items-center justify-center" style="background:rgba(230,81,0,0.25)">
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#FFAB76" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
              </svg>
            </div>
            <p class="text-[9px] font-bold uppercase tracking-widest" style="color:rgba(255,171,118,0.75)">
              ใช้ผลประโยชน์สุขภาพ
            </p>
          </div>

          <!-- Has expenses -->
          <template v-if="totalHealthUsedByUser > 0">
            <p class="text-[30px] font-extrabold leading-none" style="color:#FFB347">
              ฿{{ fmt(totalHealthUsedByUser) }}
            </p>
            <!-- Progress bar -->
            <div class="mt-3 rounded-full overflow-hidden" style="background:rgba(255,255,255,0.08);height:5px">
              <div
                :style="`width:${healthUsedPct}%;height:100%;background:linear-gradient(90deg,#E65100,#FF8C42);border-radius:99px;transition:width 0.4s ease`"
              />
            </div>
            <div class="mt-1.5 flex items-center justify-between">
              <span class="text-[9px] font-semibold" style="color:rgba(255,171,118,0.6)">
                {{ healthUsedPct.toFixed(0) }}% ใช้แล้ว
              </span>
              <span class="text-[9px] font-semibold" style="color:rgba(255,255,255,0.3)">
                /{{ fmt(fullHealthAccumulated) }}
              </span>
            </div>
          </template>

          <!-- Empty state -->
          <template v-else>
            <p class="text-[26px] font-extrabold leading-none" style="color:rgba(255,255,255,0.18)">—</p>
            <div class="mt-3 rounded-full overflow-hidden" style="background:rgba(255,255,255,0.06);height:5px">
              <div style="width:0%;height:100%" />
            </div>
            <p class="mt-1.5 text-[9px]" style="color:rgba(255,171,118,0.45)">
              กรอกค่าใช้จ่ายในตารางด้านบน
            </p>
          </template>
        </div>

        <!-- ── Col 3: ได้รับมากกว่าที่จ่าย ───────────────────────────────── -->
        <div class="px-5 py-6" style="background:rgba(125,211,252,0.05)">
          <div class="flex items-center gap-1.5 mb-3">
            <div class="w-4 h-4 rounded flex items-center justify-center" style="background:rgba(125,211,252,0.15)">
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#7DD3FC" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
                <polyline points="17 6 23 6 23 12"/>
              </svg>
            </div>
            <p class="text-[9px] font-bold uppercase tracking-widest" style="color:rgba(125,211,252,0.65)">
              ได้รับมากกว่าที่จ่าย
            </p>
          </div>
          <p class="text-[30px] font-extrabold leading-none" style="color:#7DD3FC">
            +฿{{ fmt(netGainLossAdj) }}
          </p>
          <div class="mt-2.5 space-y-1">
            <div class="flex items-center gap-1.5">
              <span class="text-[9px] font-bold px-1.5 py-0.5 rounded" style="background:rgba(125,211,252,0.12);color:#7DD3FC">คงที่</span>
              <span class="text-[10px]" style="color:rgba(255,255,255,0.35)">ไม่รวมภาษี</span>
            </div>
            <p class="text-[9px]" style="color:rgba(255,255,255,0.25)">ค่ารักษา/ปี = มูลค่าที่ได้รับเสมอ</p>
          </div>
        </div>

      </div>
    </div>

    <!-- ── Tax section: horizontal layout ────────────────────────────────── -->
    <div style="border-top:1px solid #E2E8F0">
      <div
        class="px-5 py-4 flex items-center justify-between flex-wrap gap-3"
        :style="`background:${taxRatePct > 0 ? '#F0FBF4' : '#FAFAFA'}`"
      >
        <!-- Left: icon + label + sub -->
        <div class="flex items-center gap-2">
          <div
            class="w-7 h-7 rounded-lg flex items-center justify-center"
            :style="`background:${taxRatePct > 0 ? '#D1FAE5' : '#F0F0F0'}`"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
              :stroke="taxRatePct > 0 ? '#0A8A4C' : '#CCCCCC'"
              stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          <div>
            <p
              class="text-[10px] font-bold uppercase tracking-wider"
              :style="`color:${taxRatePct > 0 ? '#0A8A4C' : '#BBBBBB'}`"
            >ประโยชน์ทางภาษี</p>
            <p v-if="taxRatePct > 0" class="text-[9px]" style="color:#6EE7B7">
              ประหยัดได้ตลอด 6 ปี · อัตรา {{ taxRatePct }}%
            </p>
            <p v-else class="text-[9px]" style="color:#BBBBBB">เลือกอัตราภาษีด้านบน</p>
          </div>
        </div>

        <!-- Right: amount + badge -->
        <div v-if="taxRatePct > 0" class="flex items-center gap-3">
          <p class="text-[20px] font-extrabold" style="color:#0A8A4C">+฿{{ fmt(totalTaxBenefit) }}</p>
          <span class="px-3 py-1 rounded-full text-[9px] font-bold" style="background:#FFF8E1;color:#D97706">
            ลดหย่อนสูงสุดปีละ ฿100,000
          </span>
        </div>
        <p v-else class="text-[18px] font-bold" style="color:#DDDDDD">—</p>
      </div>
    </div>

    <!-- ── Remark: age ≤ 18 only ──────────────────────────────────────────── -->
    <div
      v-if="store.age !== null && store.age <= 18"
      class="px-5 py-3 flex items-start gap-2"
      style="background:#F8F8F8;border-top:1px solid #CBD5E1"
    >
      <span class="text-[11px] shrink-0 mt-px" style="color:#004CB3">ℹ</span>
      <p class="text-[11px] leading-relaxed" style="color:#003893">
        กรณีผู้ชำระเบี้ยประกันภัยเสียชีวิตจากอุบัติเหตุ จะได้รับการยกเว้นเบี้ยประกันภัย
      </p>
    </div>

  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useFlexiCalculatorStore } from '~/stores/flexiCalculator'
import { fmt } from '~/utils/formatters'

const store = useFlexiCalculatorStore()
const r     = computed(() => store.premiumResult)

// ── Financials from store ─────────────────────────────────────────────────────
const totalReceivedAdj      = computed(() => store.totalReceivedAdj)
const netGainLossAdj        = computed(() => store.netGainLossAdj)
const taxSaving             = computed(() => store.taxSaving)        // kept for ref
const totalTaxBenefit       = computed(() => store.totalTaxBenefit)  // 6-year total
const totalHealthUsedByUser = computed(() => store.totalHealthUsedByUser)

/** Full 12-year health accumulation (unreduced — denominator for progress bar). */
const fullHealthAccumulated = computed(() =>
  (store.premiumResult?.healthPerYear ?? 0) * 12,
)

/** Tax rate as an integer percentage (e.g. 20 for 20%). */
const taxRatePct = computed(() =>
  Math.round((store.selectedTaxOption?.rate ?? 0) * 100),
)

/** Progress bar fill width (0–100). */
const healthUsedPct = computed(() =>
  fullHealthAccumulated.value > 0
    ? Math.min(100, (totalHealthUsedByUser.value / fullHealthAccumulated.value) * 100)
    : 0,
)
</script>
