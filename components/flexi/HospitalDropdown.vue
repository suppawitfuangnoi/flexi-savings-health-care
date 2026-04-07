<!--
  HospitalDropdown.vue
  Hospital tier selector dropdown.
  Extracted from FlexiBenefitSummary.vue — logic identical.
-->
<template>
  <div class="relative">
    <p class="text-[11px] font-bold uppercase tracking-wider mb-1.5" style="color:#666666">
      ระดับโรงพยาบาล / Hospital
    </p>

    <!-- Selected hospital button -->
    <button
      class="w-full flex items-center justify-between rounded-xl px-3 py-2.5 transition-all"
      :style="`background:#EBF0FA;border:1.5px solid ${store.hospitalDropdownOpen ? '#0066B3' : '#CBD5E1'}`"
      @click="store.hospitalDropdownOpen = !store.hospitalDropdownOpen"
    >
      <div class="flex items-center gap-2">
        <span class="text-[12px] font-semibold" style="color:#1A2B4A">
          {{ HOSPITALS[store.selectedHospital]?.short }}
        </span>
        <span
          class="px-1.5 py-0.5 rounded text-[9px] font-bold"
          :style="`background:${tierStyle(store.selectedHospital).bg};color:${tierStyle(store.selectedHospital).color}`"
        >{{ tierStyle(store.selectedHospital).label }}</span>
      </div>
      <span
        class="text-[10px] transition-transform duration-200"
        style="color:#0066B3;display:inline-block"
        :style="`transform:${store.hospitalDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)'}`"
      >▼</span>
    </button>

    <!-- Dropdown list -->
    <div
      v-if="store.hospitalDropdownOpen"
      class="absolute z-50 w-full mt-1 rounded-xl overflow-hidden shadow-lg"
      style="border:1.5px solid #CBD5E1;background:#FFFFFF"
    >
      <button
        v-for="(h, i) in HOSPITALS"
        :key="i"
        class="w-full flex items-center justify-between px-3 py-2.5 transition-colors text-left"
        :style="`background:${store.selectedHospital === i ? '#EBF0FA' : 'transparent'};border-bottom:${i < HOSPITALS.length - 1 ? '1px solid #F1F5F9' : 'none'}`"
        @click="selectHospital(i)"
      >
        <div class="flex items-center gap-2">
          <span
            class="text-[12px] font-semibold"
            :style="`color:${store.selectedHospital === i ? '#0066B3' : '#1A2B4A'}`"
          >{{ h.short }}</span>
          <span class="text-[10px]" style="color:#888">
            {{ h.name !== h.short ? h.name.replace(h.short, '').trim() : '' }}
          </span>
        </div>
        <span
          class="px-1.5 py-0.5 rounded text-[9px] font-bold shrink-0"
          :style="`background:${store.selectedHospital === i ? '#0066B3' : tierStyle(i).bg};color:${store.selectedHospital === i ? '#FFFFFF' : tierStyle(i).color}`"
        >{{ tierStyle(i).label }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useFlexiCalculatorStore } from '~/stores/flexiCalculator'
import { HOSPITALS, TIER_STYLE } from '~/constants/illnesses'

const store = useFlexiCalculatorStore()

function tierStyle(idx: number) {
  return TIER_STYLE[HOSPITALS[idx]?.tier] ?? TIER_STYLE.mid
}

function selectHospital(i: number) {
  store.selectedHospital      = i
  store.hospitalDropdownOpen  = false
}
</script>
