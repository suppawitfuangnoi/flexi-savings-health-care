<!--
  FlexiSetup.vue
  Calculator Setup section — gender/DOB/age + bidirectional input tabs + min-premium warning + tax rate.
  Pixel-perfect port of React FlexiCalculatorModal.tsx lines 455–700.
-->
<template>
  <!-- Blue section box -->
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
        <input
          type="date"
          :value="store.dob"
          class="w-full rounded-xl text-xs focus:outline-none transition-all"
          style="background:#FFFFFF;border:1.5px solid #9BB8E8;color:#333333;padding:8px 10px"
          @input="store.setDob(($event.target as HTMLInputElement).value)"
          @focus="($event.target as HTMLElement).style.borderColor = '#0066B3'"
          @blur="($event.target as HTMLElement).style.borderColor = '#9BB8E8'"
        />
      </div>

      <!-- Age -->
      <div class="space-y-1.5">
        <label class="text-[11px] font-semibold" style="color:#666666">อายุ / Age</label>
        <div class="flex items-center gap-2">
          <input
            type="number"
            :min="0"
            :max="99"
            :value="store.age"
            class="flex-1 px-3 py-2 rounded-xl text-sm font-bold text-center focus:outline-none transition-all"
            style="background:#FFFFFF;border:1.5px solid #9BB8E8;color:#0066B3"
            @input="onAgeInput"
            @focus="($event.target as HTMLElement).style.borderColor = '#0066B3'"
            @blur="($event.target as HTMLElement).style.borderColor = '#9BB8E8'"
          />
          <span class="text-xs shrink-0" style="color:#666666">ปี · อัตรา {{ store.result.rate }}/พัน</span>
        </div>
      </div>
    </div>

    <!-- Bidirectional Input: 3-col tabs -->
    <div class="rounded-xl overflow-hidden" style="border:1.5px solid #9BB8E8;background:#FFFFFF">
      <!-- Tab headers -->
      <div class="grid grid-cols-3" style="border-bottom:1.5px solid #9BB8E8">
        <button
          v-for="(mode, idx) in MODE_ORDER"
          :key="mode"
          class="relative px-4 py-3 text-left transition-all"
          :style="`background:${isActiveMode(mode) ? MODE_CONFIG[mode].bg : '#F5F8FF'};border-right:${idx < 2 ? '1px solid #9BB8E8' : 'none'};cursor:${isActiveMode(mode) ? 'default' : 'pointer'}`"
          @click="!isActiveMode(mode) && store.switchMode(mode)"
        >
          <!-- Active indicator bar at top -->
          <span
            v-if="isActiveMode(mode)"
            class="absolute top-0 left-0 right-0"
            :style="`height:3px;background:${MODE_CONFIG[mode].color};border-radius:8px 8px 0 0`"
          />
          <div class="flex items-center justify-between gap-1 mt-0.5">
            <p
              class="text-[10px] font-bold uppercase tracking-wider leading-tight"
              :style="`color:${isActiveMode(mode) ? MODE_CONFIG[mode].color : '#AAAAAA'}`"
            >
              {{ MODE_CONFIG[mode].label }}
            </p>
            <!-- Pencil icon for active -->
            <svg
              v-if="isActiveMode(mode)"
              width="12" height="12" viewBox="0 0 24 24" fill="none"
              :stroke="MODE_CONFIG[mode].color"
              stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            <!-- คลิก badge for inactive -->
            <span
              v-else
              class="text-[9px] px-1.5 py-0.5 rounded-full font-medium"
              style="color:#888;background:#E2E8F0"
            >คลิก</span>
          </div>
          <p class="text-[9px] mt-0.5 leading-tight" style="color:#BBBBBB">{{ MODE_CONFIG[mode].subLabel }}</p>
        </button>
      </div>

      <!-- Value row -->
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
              :value="store.primaryValue"
              class="w-full text-xl font-bold focus:outline-none bg-transparent"
              :style="`color:${MODE_CONFIG[mode].color}`"
              autofocus
              @input="store.primaryValue = Math.max(MODE_CONFIG[mode].min, +($event.target as HTMLInputElement).value || MODE_CONFIG[mode].min)"
            />
          </template>
          <p v-else class="text-base font-bold tracking-tight" style="color:#1A2B4A">฿{{ fmt(modeDisplay(mode)) }}</p>
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
    <div class="pt-3" style="border-top:1.5px solid #9BB8E8">
      <div class="flex items-center justify-between mb-2.5">
        <div class="flex items-center gap-2">
          <p class="text-[10px] font-bold uppercase tracking-wider" style="color:#0066B3">
            ประโยชน์ทางภาษี / Tax Benefit
          </p>
          <span
            v-if="store.taxRate > 0"
            class="text-[10px] font-bold px-2 py-0.5 rounded-full"
            style="background:#F0FFF4;color:#0A8A4C"
          >
            ประหยัด ฿{{ fmt(Math.min(store.result.annualPremium, 100000) * store.taxRate / 100) }}/ปี
          </span>
        </div>
        <span v-if="store.taxRate === 0" class="text-[10px]" style="color:#9BB8E8">เลือกอัตราภาษีของคุณ</span>
      </div>
      <div class="flex flex-wrap gap-1.5">
        <button
          v-for="rate in [0, 5, 10, 15, 20, 25, 30, 35]"
          :key="rate"
          class="px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all"
          :style="store.taxRate === rate
            ? `background:${rate === 0 ? '#0066B3' : '#0A8A4C'};color:#FFFFFF;box-shadow:0 2px 8px ${rate === 0 ? '#0066B344' : '#0A8A4C44'}`
            : 'background:#FFFFFF;color:#777777'"
          @click="store.taxRate = rate"
        >
          {{ rate === 0 ? 'ไม่คำนวณ' : `${rate}%` }}
        </button>
      </div>
      <span class="inline-block mt-2 px-3 py-1 rounded-full text-[11px] font-bold" style="background:#FFF8E1;color:#D97706">
        ประกันสะสมทรัพย์ลดหย่อนภาษีได้ทุกปีสูงสุด 100,000 บาท (ตามที่กฎหมายกำหนด)
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useFlexiCalculatorStore } from '~/stores/flexiCalculator'
import { MODE_CONFIG, MODE_ORDER } from '~/constants/flexiConstants'
import { fmt } from '~/utils/flexiCalc'
import type { InputMode } from '~/types'

const store = useFlexiCalculatorStore()

const isActiveMode = (mode: InputMode) => store.inputMode === mode

const premiumTooLow = computed(() => store.sa < 50_000)

function modeDisplay(mode: InputMode): number {
  const r = store.result
  if (mode === 'premium') return r.annualPremium
  if (mode === 'sa') return r.sa
  return r.healthPerYear
}

function onAgeInput(e: Event) {
  const a = Math.max(0, +(e.target as HTMLInputElement).value || 0)
  store.setAge(a)
}
</script>
