<!--
  IllnessGrid.vue
  4-column illness selection grid with expand/collapse and custom cost input.
  Extracted from FlexiBenefitSummary.vue — logic identical.
-->
<template>
  <div>
    <!-- 4-column grid of illness cards -->
    <div class="grid grid-cols-4 gap-1.5">
      <button
        v-for="{ ill, i } in displayItems"
        :key="i"
        class="px-2.5 py-2 rounded-lg text-left transition-all"
        :style="isSelected(i)
          ? `background:${accentColor};color:#FFFFFF;border:1.5px solid ${accentColor}`
          : 'background:#F5F5F5;color:#555555;border:1.5px solid #E2E8F0'"
        @click="emit('select', { listKey, idx: i })"
      >
        <div class="flex items-center gap-1.5 mb-0.5">
          <svg
            width="12" height="12" viewBox="0 0 24 24" fill="none"
            :stroke="isSelected(i) ? '#FFFFFF' : accentColor"
            stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
            v-html="ill.icon"
          />
          <span class="text-[11px] font-semibold leading-tight">{{ ill.name }}</span>
        </div>
        <div class="flex items-center gap-1 flex-wrap">
          <span
            v-if="ill.popular"
            class="text-[8px] font-bold px-1 py-0.5 rounded"
            :style="`background:${isSelected(i) ? 'rgba(255,255,255,0.25)' : '#FFF3E0'};color:${isSelected(i) ? '#FFFFFF' : '#E67E22'}`"
          >พบบ่อย</span>
          <span
            v-if="itemCost(ill, i) !== null"
            class="text-[8px] font-semibold"
            :style="`color:${isSelected(i) ? 'rgba(255,255,255,0.75)' : '#999999'}`"
          >฿{{ fmt(itemCost(ill, i)!) }}</span>
        </div>
      </button>
    </div>

    <!-- Expand / collapse button -->
    <button
      v-if="expandable && list.length > 1"
      class="mt-1.5 w-full py-1.5 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-all"
      :style="`background:#F0F4FF;color:${accentColor};border:1px solid #D0DCFF`"
      @click="emit('toggle-expand')"
    >
      <svg
        width="12" height="12" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
        :style="`transform:${illnessExpanded ? 'rotate(180deg)' : 'none'};transition:transform 0.2s`"
      >
        <polyline points="6 9 12 15 18 9"/>
      </svg>
      {{ illnessExpanded ? 'ย่อรายการ' : `ดูทั้งหมด ${list.length} รายการ` }}
    </button>

    <!-- Custom cost input (shown when custom illness is selected) -->
    <div
      v-if="isCustomSelected"
      class="mt-2 flex items-center gap-2 rounded-xl px-3 py-2.5"
      :style="`border:1.5px solid ${listKey === 'children' ? '#A5D6B7' : '#9BB8E8'};background:${listKey === 'children' ? '#F0FBF4' : '#EBF0FA'}`"
    >
      <span class="text-sm font-bold shrink-0" :style="`color:${accentColor}`">฿</span>
      <input
        type="number"
        :min="0"
        :step="1000"
        :value="customIllCost || undefined"
        placeholder="ระบุค่าใช้จ่าย..."
        class="flex-1 text-sm font-bold focus:outline-none bg-transparent"
        style="color:#1A2B4A"
        @input="emit('custom-cost', Math.max(0, +($event.target as HTMLInputElement).value || 0))"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { fmt } from '~/utils/flexiCalc'
import type { Illness, ScenarioList } from '~/types'

const props = defineProps<{
  list:           Illness[]
  listKey:        ScenarioList
  accentColor:    string
  expandable:     boolean
  pendingIllIdx:  number
  pendingList:    ScenarioList
  customIllCost:  number
  hospitalPct:    number
  illnessExpanded: boolean
}>()

const emit = defineEmits<{
  select:        [payload: { listKey: ScenarioList; idx: number }]
  'toggle-expand': []
  'custom-cost': [value: number]
}>()

const customIdx = computed(() => props.list.length - 1)

const displayItems = computed(() => {
  const items = props.list.map((ill, i) => ({ ill, i }))
  if (props.expandable && props.illnessExpanded) return items
  return [{ ill: props.list[customIdx.value], i: customIdx.value }]
})

const isCustomSelected = computed(() =>
  props.pendingList === props.listKey && props.pendingIllIdx === customIdx.value,
)

function isSelected(i: number): boolean {
  return props.pendingList === props.listKey && props.pendingIllIdx === i
}

function itemCost(ill: Illness, i: number): number | null {
  const isCustomCard = i === customIdx.value
  if (isCustomCard || ill.min === 0) return null
  return Math.round(ill.min + (ill.max - ill.min) * props.hospitalPct)
}
</script>
