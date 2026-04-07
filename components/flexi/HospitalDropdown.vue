<!--
  HospitalDropdown.vue
  Hospital tier selector driven by store.apiHospitals (API data).
-->
<template>
  <div>
    <p class="text-[11px] font-bold uppercase tracking-wider mb-2" style="color:#666666">
      ระดับโรงพยาบาล / Hospital Level
    </p>
    <div class="relative">
      <!-- Trigger button -->
      <button
        class="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-sm transition-colors"
        style="border:1.5px solid #9BB8E8;background:#FFFFFF"
        @click="store.hospitalDropdownOpen = !store.hospitalDropdownOpen"
      >
        <div class="flex items-center gap-2">
          <span
            v-if="store.selectedHospital"
            class="text-[10px] font-bold px-2 py-0.5 rounded-full"
            :style="`background:${store.selectedHospital.tierStyle.bg};color:${store.selectedHospital.tierStyle.color}`"
          >{{ store.selectedHospital.tierLabel }}</span>
          <span class="font-semibold text-sm" style="color:#1A2B4A">
            {{ store.selectedHospital?.short ?? 'เลือกโรงพยาบาล' }}
          </span>
        </div>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0066B3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
          class="shrink-0 transition-transform"
          :style="`transform:${store.hospitalDropdownOpen ? 'rotate(180deg)' : 'none'}`"
        >
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      <!-- Dropdown list -->
      <div
        v-if="store.hospitalDropdownOpen"
        class="absolute z-50 w-full mt-1 rounded-xl overflow-hidden"
        style="border:1.5px solid #9BB8E8;background:#FFFFFF;box-shadow:0 4px 20px rgba(0,102,179,0.12)"
      >
        <button
          v-for="h in store.apiHospitals"
          :key="h.id"
          class="w-full flex items-center justify-between gap-2 px-3 py-2.5 text-left transition-colors"
          :style="store.selectedHospitalId === h.id
            ? 'background:#EBF0FA'
            : 'background:#FFFFFF'"
          @mouseenter="($event.currentTarget as HTMLElement).style.background = store.selectedHospitalId === h.id ? '#EBF0FA' : '#F5F8FF'"
          @mouseleave="($event.currentTarget as HTMLElement).style.background = store.selectedHospitalId === h.id ? '#EBF0FA' : '#FFFFFF'"
          @click="store.selectHospital(h.id)"
        >
          <div class="flex items-center gap-2">
            <span
              class="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
              :style="`background:${h.tierStyle.bg};color:${h.tierStyle.color}`"
            >{{ h.tierLabel }}</span>
            <div>
              <p class="font-semibold text-xs leading-tight" style="color:#1A2B4A">{{ h.short }}</p>
              <p v-if="h.name !== h.short" class="text-[10px]" style="color:#999999">{{ h.name }}</p>
            </div>
          </div>
          <svg v-if="store.selectedHospitalId === h.id" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0066B3" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useFlexiCalculatorStore } from '~/stores/flexiCalculator'
const store = useFlexiCalculatorStore()
</script>
