<!--
  FlexiSetup.vue
  Buddhist Era date picker — comprehensive CE→BE conversion:
  1. #header-title slot  → main calendar header "มิถุนายน 2540" ✅
  2. #nav-title slot     → year-range popup title "2535 - 2546" ✅
  3. #nav-item slot      → individual year items "2540" ✅
  4. MutationObserver    → bulletproof fallback for any remaining CE numbers ✅
-->
<template>
  <div class="rounded-xl p-5 space-y-4" style="background:#EBF0FA;border:1.5px solid #9BB8E8">
    <p class="text-[11px] font-bold uppercase tracking-wider" style="color:#0066B3">
      ตั้งค่าการคำนวณ / Calculator Setup
    </p>

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <!-- Gender toggle -->
      <div class="space-y-1.5">
        <label class="text-[11px] font-semibold" style="color:#666666">เพศ / Gender</label>
        <div class="flex rounded-xl overflow-hidden" style="border:1.5px solid #9BB8E8">
          <button
            v-for="g in (['M', 'F'] as const)"
            :key="g"
            class="flex-1 py-2 text-xs font-semibold transition-colors"
            :style="store.gender === g
              ? 'background:#0066B3;color:#FFFFFF'
              : 'background:#FFFFFF;color:#666666'"
            @click="store.gender = g"
          >
            {{ g === 'M' ? '♂ ชาย' : '♀ หญิง' }}
          </button>
        </div>
      </div>

      <!-- DOB -->
      <div class="space-y-1.5">
        <label class="text-[11px] font-semibold" style="color:#666666">วันเกิด / Date of Birth</label>

        <div ref="calendarWrap" class="relative">

          <!-- Trigger button: always in DOM, no v-calendar dependency -->
          <button
            type="button"
            class="w-full rounded-xl text-xs text-left flex items-center gap-2 transition-all focus:outline-none"
            :style="`background:#FFFFFF;border:1.5px solid ${calendarOpen ? '#0066B3' : '#9BB8E8'};color:#333333;padding:8px 10px;height:38px`"
            @click="calendarOpen = !calendarOpen"
          >
            <svg
              width="14" height="14" viewBox="0 0 24 24" fill="none"
              :stroke="calendarOpen ? '#0066B3' : '#9BB8E8'"
              stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            <span :style="dobAsDate ? 'color:#333333' : 'color:#AAAAAA'" class="flex-1">
              {{ dobAsDate ? formatBE(dobAsDate) : 'เลือกวันเกิด (พ.ศ.)' }}
            </span>
            <svg
              class="shrink-0 transition-transform duration-200"
              :class="calendarOpen ? 'rotate-180' : ''"
              width="12" height="12" viewBox="0 0 24 24" fill="none"
              stroke="#9BB8E8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
            >
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>

          <!-- Calendar: client-only (calendarComp = null on server) -->
          <div
            v-if="calendarComp"
            v-show="calendarOpen"
            class="absolute z-50 rounded-xl overflow-hidden"
            style="top:calc(100% + 4px);left:0;box-shadow:0 8px 32px rgba(0,102,179,0.18);border:1.5px solid #9BB8E8;background:#FFFFFF"
          >
            <component
              :is="calendarComp"
              locale="th-TH"
              :max-date="today"
              :min-date="minBirthDate"
              :initial-page="calendarInitialPage"
              color="blue"
              :attributes="calendarAttrs"
              @dayclick="onDayClick"
            >
              <!-- ① Main calendar header: "มิถุนายน 2540" -->
              <template #header-title="s">
                <span class="text-sm font-bold select-none" style="color:#1A2B4A">
                  {{ beHeader(s as Record<string,unknown>) }}
                </span>
              </template>

              <!-- ② Year-range popup title: "2535 - 2546" (slot forwarded CalendarPane → CalendarNav) -->
              <template #nav-title="s">
                <button
                  class="vc-nav-title"
                  style="font-weight:700;color:#1A2B4A"
                  @click="(s as any).toggleMode?.()"
                >
                  {{ ceToBE((s as any).title ?? '') }}
                </button>
              </template>

              <!-- ③ Individual year items in popup: 1997 → 2540 -->
              <template #nav-item="s">
                {{ navItemBE((s as any).item ?? s) }}
              </template>
            </component>
          </div>

        </div>
      </div>

      <!-- Age (read-only) -->
      <div class="space-y-1.5">
        <label class="text-[11px] font-semibold" style="color:#666666">อายุ / Age</label>
        <div class="flex items-center gap-2">
          <div
            class="flex items-center justify-center rounded-xl flex-1"
            style="background:#FFFFFF;border:1.5px solid #9BB8E8;height:38px"
          >
            <span class="text-xl font-bold" style="color:#0066B3">{{ store.age ?? '—' }}</span>
          </div>
          <span class="text-xs shrink-0" style="color:#666666">
            ปี<template v-if="store.premiumResult"> · อัตรา {{ store.premiumResult.rate }}/พัน</template>
          </span>
        </div>
      </div>
    </div>

    <!-- Bidirectional Input: 3-col tabs -->
    <div class="rounded-xl overflow-hidden" style="border:1.5px solid #9BB8E8;background:#FFFFFF">
      <div class="grid grid-cols-3" style="border-bottom:1.5px solid #9BB8E8">
        <button
          v-for="(mode, idx) in MODE_ORDER"
          :key="mode"
          class="relative px-4 py-3 text-left transition-all"
          :style="`background:${isActiveMode(mode) ? MODE_CONFIG[mode].bg : '#F5F8FF'};border-right:${idx < 2 ? '1px solid #9BB8E8' : 'none'}`"
          @click="!isActiveMode(mode) && store.switchMode(mode)"
        >
          <span
            v-if="isActiveMode(mode)"
            class="absolute top-0 left-0 right-0"
            :style="`height:3px;background:${MODE_CONFIG[mode].color};border-radius:8px 8px 0 0`"
          />
          <div class="flex items-center justify-between gap-1 mt-0.5">
            <p
              class="text-[10px] font-bold uppercase tracking-wider leading-tight"
              :style="`color:${isActiveMode(mode) ? MODE_CONFIG[mode].color : '#AAAAAA'}`"
            >{{ MODE_CONFIG[mode].label }}</p>
            <svg
              v-if="isActiveMode(mode)"
              width="12" height="12" viewBox="0 0 24 24" fill="none"
              :stroke="MODE_CONFIG[mode].color"
              stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            <span v-else class="text-[9px] px-1.5 py-0.5 rounded-full font-medium" style="color:#888;background:#E2E8F0">คลิก</span>
          </div>
          <p class="text-[9px] mt-0.5 leading-tight" style="color:#BBBBBB">{{ MODE_CONFIG[mode].subLabel }}</p>
        </button>
      </div>

      <div class="grid grid-cols-3">
        <div
          v-for="(mode, idx) in MODE_ORDER"
          :key="mode"
          class="px-4 py-3 flex items-baseline gap-0.5"
          :style="`background:${isActiveMode(mode) ? '#FFFFFF' : '#FAFAFA'};border-right:${idx < 2 ? '1px solid #E2E8F0' : 'none'};box-shadow:${isActiveMode(mode) ? `inset 0 -2px 0 ${MODE_CONFIG[mode].color}` : 'none'}`"
        >
          <template v-if="isActiveMode(mode)">
            <span class="text-sm font-bold leading-none pb-px" :style="`color:${MODE_CONFIG[mode].color}`">฿</span>
            <input
              type="number"
              :min="MODE_CONFIG[mode].min"
              :max="MODE_CONFIG[mode].max"
              :step="MODE_CONFIG[mode].step"
              :value="store.primaryValue ?? ''"
              :placeholder="String(MODE_CONFIG[mode].min)"
              class="w-full text-xl font-bold focus:outline-none bg-transparent"
              :style="`color:${MODE_CONFIG[mode].color}`"
              autofocus
              @input="store.primaryValue = Math.max(MODE_CONFIG[mode].min, +($event.target as HTMLInputElement).value || MODE_CONFIG[mode].min)"
            />
          </template>
          <template v-else-if="store.premiumResult">
            <p class="text-base font-bold tracking-tight" style="color:#1A2B4A">฿{{ fmt(modeDisplay(mode)) }}</p>
          </template>
          <template v-else>
            <p class="text-base font-bold tracking-tight" style="color:#CCCCCC">—</p>
          </template>
        </div>
      </div>
    </div>

    <!-- Min premium warning -->
    <div
      v-if="premiumTooLow"
      class="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold"
      style="background:#FEF2F2;border:1.5px solid #FCA5A5;color:#DC2626"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
      เบี้ยประกันขั้นต่ำ ฿{{ (50000).toLocaleString() }} ต่อปี — กรุณาเพิ่มทุนประกัน
    </div>

    <!-- Tax rate section -->
    <div class="pt-3" style="border-top:1.5px solid #E2E8F0">
      <div class="flex items-center justify-between mb-2.5">
        <div class="flex items-center gap-2">
          <p class="text-[10px] font-bold uppercase tracking-wider" style="color:#004CB3">ประโยชน์ทางภาษี / Tax Benefit</p>
          <span v-if="store.taxSaving > 0" class="text-[10px] font-bold px-2 py-0.5 rounded-full" style="background:#F0FFF4;color:#0A8A4C">
            ประหยัด ฿{{ fmt(store.taxSaving) }}/ปี
          </span>
        </div>
        <span v-if="!store.selectedTaxOption || store.selectedTaxOption.rate === 0" class="text-[10px]" style="color:#BBBBBB">
          เลือกอัตราภาษีของคุณ
        </span>
      </div>
      <div class="grid grid-cols-8 gap-1.5">
        <button
          v-for="opt in store.taxOptions"
          :key="opt.id"
          class="py-2.5 rounded-xl text-[11px] font-bold transition-all"
          :style="store.selectedTaxOption?.id === opt.id
            ? `background:${opt.rate === 0 ? '#004CB3' : '#0A8A4C'};color:#FFFFFF;border:1.5px solid ${opt.rate === 0 ? '#004CB3' : '#0A8A4C'};box-shadow:0 2px 8px ${opt.rate === 0 ? '#004CB340' : '#0A8A4C44'}`
            : 'background:#FFFFFF;color:#444444;border:1.5px solid #CBD5E1'"
          @click="store.selectedTaxOption = opt"
        >{{ opt.rateLabel }}</button>
        <template v-if="store.taxOptions.length === 0">
          <div v-for="i in 8" :key="i" class="py-2.5 rounded-xl" style="background:#F0F0F0" />
        </template>
      </div>
      <span class="inline-block mt-2 px-3 py-1 rounded-full text-[11px] font-bold" style="background:#FFF8E1;color:#D97706">
        ประกันสะสมทรัพย์ลดหย่อนภาษีได้ทุกปีสูงสุด 100,000 บาท (ตามที่กฎหมายกำหนด)
      </span>
    </div>

    <!-- Auto-calc status bar (replaces manual calculate button) -->
    <div class="flex items-center justify-center gap-2 min-h-[42px] rounded-xl px-4 py-2.5"
         :style="autoCalcBarStyle">

      <!-- ① Calculating -->
      <template v-if="store.loadingCalc">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0066B3"
             stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
             class="animate-spin shrink-0">
          <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
        </svg>
        <span class="text-xs font-semibold" style="color:#0066B3">กำลังคำนวณ…</span>
      </template>

      <!-- ② Error -->
      <template v-else-if="store.calcError">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#DC2626"
             stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <span class="text-xs font-semibold" style="color:#DC2626">{{ store.calcError }}</span>
      </template>

      <!-- ③ Calculated OK -->
      <template v-else-if="store.isCalculated">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#0A8A4C"
             stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="shrink-0">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
          <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
        <span class="text-xs font-semibold" style="color:#0A8A4C">
          คำนวณอัตโนมัติแล้ว — แก้ไขข้อมูลเพื่ออัปเดต
        </span>
      </template>

      <!-- ④ Waiting for required fields -->
      <template v-else>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#AAAAAA"
             stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="shrink-0">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        <span class="text-xs" style="color:#AAAAAA">{{ validationHint }}</span>
      </template>

    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { useFlexiCalculatorStore } from '~/stores/flexiCalculator'
import { MODE_CONFIG, MODE_ORDER } from '~/constants/flexiConstants'
import { fmt } from '~/utils/formatters'
import { formatBE } from '~/utils/dateFormat'
import { useBECalendar } from '~/composables/useBECalendar'
import type { InputMode } from '~/types'

const store = useFlexiCalculatorStore()

// ── Date model ───────────────────────────────────────────────────────────────
const dobAsDate = computed<Date | null>(() =>
  store.dob ? new Date(store.dob) : null
)

// ── Calendar (Buddhist Era date picker) ──────────────────────────────────────
const {
  calendarComp,
  calendarOpen,
  calendarWrap,
  calendarAttrs,
  calendarInitialPage,
  today,
  minBirthDate,
  beHeader,
  navItemBE,
  ceToBE,
  onDayClick,
} = useBECalendar(dobAsDate, (isoDate) => store.setDob(isoDate))

// ── Auto-calculation: Watch + Debounce ───────────────────────────────────────
// Fires 800 ms after the last change to any of the 4 key fields.
// canCalculate acts as a guard — all required fields must be valid before
// the API is called (เพศ ✓  วันเกิด ✓  จำนวนเงิน ≥ min ✓  อายุ ≤ MAX_AGE ✓)
const debouncedCalculate = useDebounceFn(() => {
  if (store.canCalculate) store.calculate()
}, 800)

watch(
  () => [store.gender, store.age, store.primaryValue, store.inputMode] as const,
  () => {
    // Clear any previous error immediately so user gets instant feedback
    // that they are fixing the issue — error only reappears if the new
    // value still fails after the debounce fires.
    store.calcError = null
    debouncedCalculate()
  },
)

// ── Bidirectional tabs ───────────────────────────────────────────────────────
const isActiveMode = (mode: InputMode) => store.inputMode === mode

const premiumTooLow = computed(() => {
  if (!store.primaryValue) return false
  if (store.inputMode === 'premium') return store.primaryValue < 50_000
  if (store.premiumResult) return store.premiumResult.annualPremium < 50_000
  return false
})

function modeDisplay(mode: InputMode): number {
  const p = store.premiumResult
  if (!p) return 0
  if (mode === 'premium') return p.annualPremium
  if (mode === 'sa')      return p.sumAssured
  return p.healthPerYear
}

// ── Validation hint (shown when fields are incomplete) ───────────────────────
const validationHint = computed(() => {
  if (!store.gender)       return 'กรุณาเลือกเพศ'
  if (!store.dob)          return 'กรุณาเลือกวันเกิด'
  if (!store.primaryValue) return 'กรุณากรอกจำนวนเงิน'
  return 'กรุณาตรวจสอบข้อมูล'
})

// ── Status bar background style ──────────────────────────────────────────────
const autoCalcBarStyle = computed(() => {
  if (store.loadingCalc)                  return 'background:#EBF5FF;border:1.5px solid #9BB8E8'
  if (store.calcError)                    return 'background:#FEF2F2;border:1.5px solid #FCA5A5'
  if (store.isCalculated)                 return 'background:#F0FFF4;border:1.5px solid #6EE7B7'
  return 'background:#F5F5F5;border:1.5px solid #E2E8F0'
})
</script>
