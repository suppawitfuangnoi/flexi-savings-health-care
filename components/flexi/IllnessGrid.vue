<!--
  IllnessGrid.vue
  Grid of illness/scenario cards driven by ApiScenario[] from hospital API.
-->
<template>
  <div>
    <!-- 4-column grid -->
    <div class="grid grid-cols-4 gap-1.5">
      <button
        v-for="item in displayItems"
        :key="item.id"
        class="rounded-xl p-2 text-left transition-all flex flex-col gap-1"
        :style="isSelected(item)
          ? `background:${accentColor};color:#FFFFFF;border:1.5px solid ${accentColor}`
          : 'background:#F5F5F5;color:#333333;border:1.5px solid transparent'"
        @click="emit('select', { id: item.id, category: item.category })"
      >
        <!-- Icon -->
        <svg
          width="16" height="16" viewBox="0 0 24 24" fill="none"
          :stroke="isSelected(item) ? '#FFFFFF' : accentColor"
          stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
          v-html="item.icon"
        />
        <!-- Name -->
        <p class="text-[10px] font-bold leading-tight">{{ item.name }}</p>
        <!-- Cost or popular badge -->
        <div class="flex items-center gap-1 flex-wrap">
          <span
            v-if="item.popular && !isSelected(item)"
            class="text-[8px] px-1 rounded-full font-bold"
            style="background:#FFF3E0;color:#E67E22"
          >ฮิต</span>
          <span
            v-if="!item.isCustom"
            class="text-[9px] font-semibold"
            :style="`color:${isSelected(item) ? 'rgba(255,255,255,0.8)' : '#999999'}`"
          >฿{{ fmtShort(item.estimatedCost) }}</span>
          <span v-else class="text-[9px]" :style="`color:${isSelected(item) ? 'rgba(255,255,255,0.8)' : '#AAAAAA'}`">กำหนดเอง</span>
        </div>
      </button>
    </div>

    <!-- Expand/collapse -->
    <button
      v-if="expandable && props.list.length > 1"
      class="w-full mt-2 py-1.5 rounded-xl text-[11px] font-semibold transition-colors flex items-center justify-center gap-1"
      style="background:#F0F4FF;color:#0066B3"
      @click="emit('toggle-expand')"
    >
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline :points="illnessExpanded ? '18 15 12 9 6 15' : '6 9 12 15 18 9'"/>
      </svg>
      {{ illnessExpanded ? 'ย่อรายการ' : `แสดงทั้งหมด (${props.list.length} รายการ)` }}
    </button>

    <!-- Custom illness cost input -->
    <div v-if="isCustomSelected" class="mt-2">
      <div
        class="flex items-center gap-2 rounded-xl px-3 py-2"
        :style="`border:1.5px solid ${accentColor};background:#F5F5F5`"
      >
        <span class="text-sm font-bold shrink-0" :style="`color:${accentColor}`">฿</span>
        <input
          type="number"
          :min="0"
          :step="1000"
          :value="customIllCost || undefined"
          placeholder="ระบุค่าใช้จ่าย"
          class="flex-1 text-sm font-bold focus:outline-none bg-transparent"
          style="color:#1A2B4A"
          @input="emit('custom-cost', Math.max(0, +($event.target as HTMLInputElement).value || 0))"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ApiScenario, ApiScenarioCategory } from '~/types/api'

const props = defineProps<{
  list:             ApiScenario[]
  accentColor:      string
  expandable:       boolean
  pendingScenarioId: number | null
  customIllCost:    number
  illnessExpanded:  boolean
}>()

const emit = defineEmits<{
  select:        [payload: { id: number; category: ApiScenarioCategory }]
  'toggle-expand': []
  'custom-cost': [value: number]
}>()

const isSelected = (item: ApiScenario) => item.id === props.pendingScenarioId

const customItem  = computed(() => props.list.find(i => i.isCustom))
const isCustomSelected = computed(() => customItem.value && isSelected(customItem.value))

const displayItems = computed(() => {
  if (!props.expandable) return props.list
  if (props.illnessExpanded) return props.list
  // Collapsed: show custom card only + a few popular ones
  const customs  = props.list.filter(i => i.isCustom)
  const populars = props.list.filter(i => i.popular && !i.isCustom).slice(0, 7)
  return [...populars, ...customs]
})

function fmtShort(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `${Math.round(n / 1_000)}K`
  return String(n)
}
</script>
