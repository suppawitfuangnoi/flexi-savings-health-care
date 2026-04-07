<!--
  CoverageGrid.vue
  Amount-first mode: shows which scenarios are covered/partial/not covered
  at a given budget. Uses API-driven scenario lists.
-->
<template>
  <div class="space-y-3">

    <!-- Children section (age ≤ 18 only) -->
    <template v-if="store.age !== null && store.age <= 18 && store.childrenScenarios.length > 0">
      <p class="text-[10px] font-bold uppercase tracking-wider" style="color:#0A8A4C">โรคในเด็ก</p>
      <div class="grid grid-cols-2 gap-1.5">
        <div
          v-for="item in store.childrenScenarios.filter(s => !s.isCustom)"
          :key="item.id"
          class="rounded-xl p-2.5"
          :style="`background:${coverageStyle(item).bg};border:1px solid ${coverageStyle(item).border}`"
        >
          <div class="flex items-start justify-between gap-1">
            <div class="flex-1 min-w-0">
              <p class="text-[10px] font-bold leading-tight truncate" :style="`color:${coverageStyle(item).text}`">{{ item.name }}</p>
              <p class="text-[9px] mt-0.5" style="color:#999999">฿{{ item.estimatedCost.toLocaleString() }}</p>
            </div>
            <span class="text-[11px] font-bold shrink-0" :style="`color:${coverageStyle(item).text}`">
              {{ coverageMark(item) }}
            </span>
          </div>
        </div>
      </div>
      <hr style="border-color:#E2E8F0" />
    </template>

    <!-- Adult section -->
    <div v-if="store.adultScenarios.length > 0">
      <p class="text-[10px] font-bold uppercase tracking-wider mb-2" style="color:#0066B3">โรคทั่วไป</p>
      <div class="grid grid-cols-2 gap-1.5">
        <div
          v-for="item in store.adultScenarios.filter(s => !s.isCustom)"
          :key="item.id"
          class="rounded-xl p-2.5"
          :style="`background:${coverageStyle(item).bg};border:1px solid ${coverageStyle(item).border}`"
        >
          <div class="flex items-start justify-between gap-1">
            <div class="flex-1 min-w-0">
              <p class="text-[10px] font-bold leading-tight truncate" :style="`color:${coverageStyle(item).text}`">{{ item.name }}</p>
              <p class="text-[9px] mt-0.5" style="color:#999999">฿{{ item.estimatedCost.toLocaleString() }}</p>
            </div>
            <span class="text-[11px] font-bold shrink-0" :style="`color:${coverageStyle(item).text}`">
              {{ coverageMark(item) }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <p v-if="store.adultScenarios.length === 0" class="text-center text-xs py-3" style="color:#BBBBBB">
      กำลังโหลดสถานการณ์…
    </p>

    <!-- Summary counts -->
    <div v-if="store.adultScenarios.length > 0" class="flex gap-3 pt-1 text-[10px]">
      <span style="color:#0A8A4C">✓ ครบ {{ fullCount }}</span>
      <span style="color:#E67E22">~ บางส่วน {{ partialCount }}</span>
      <span style="color:#E53E3E">✗ ไม่ครบ {{ lowCount }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useFlexiCalculatorStore } from '~/stores/flexiCalculator'
import type { ApiScenario } from '~/types/api'

const props = defineProps<{ amount: number }>()
const store = useFlexiCalculatorStore()

type CovStatus = 'full' | 'partial' | 'low'

function coverageStatus(item: ApiScenario): CovStatus {
  if (item.estimatedCost === 0) return 'full'
  if (props.amount >= item.estimatedCost) return 'full'
  if (props.amount > 0) return 'partial'
  return 'low'
}

function coverageStyle(item: ApiScenario): { bg: string; border: string; text: string } {
  const s = coverageStatus(item)
  if (s === 'full')    return { bg: '#E8F5E9', border: '#A5D6A7', text: '#0A8A4C' }
  if (s === 'partial') return { bg: '#FFF3E0', border: '#FFCC80', text: '#E67E22' }
  return { bg: '#FEECEC', border: '#FFAAAA', text: '#E53E3E' }
}

function coverageMark(item: ApiScenario): string {
  const s = coverageStatus(item)
  if (s === 'full')    return '✓'
  if (s === 'partial') return '~'
  return '✗'
}

const allItems   = computed(() => [...store.adultScenarios, ...store.childrenScenarios].filter(s => !s.isCustom))
const fullCount   = computed(() => allItems.value.filter(i => coverageStatus(i) === 'full').length)
const partialCount = computed(() => allItems.value.filter(i => coverageStatus(i) === 'partial').length)
const lowCount    = computed(() => allItems.value.filter(i => coverageStatus(i) === 'low').length)
</script>
