<!--
  IllnessGrid.vue
  Read-only 4-column coverage grid — matches React's illness card display.
  Each card shows ✓ (green) or ✗ (red) depending on whether the year's
  health budget covers the estimated cost.

  Design decisions:
  - Props: list + budget + expand controls only. No selection state.
  - This is a passive viewer, not a selector — matches React source intent.
  - Summary counts and disclaimer render inline (same as React source).
  - MAX_COLLAPSED (12) mirrors React's slice(0, 12) default.
-->
<template>
  <div>
    <!-- 4-column coverage cards grid -->
    <div class="grid grid-cols-4 gap-1.5">
      <div
        v-for="item in displayList"
        :key="item.id"
        class="px-2.5 py-2 rounded-lg"
        :style="cardStyle(item)"
      >
        <!-- Icon + name row -->
        <div class="flex items-center gap-1.5 mb-0.5">
          <svg
            width="12" height="12" viewBox="0 0 24 24" fill="none"
            :stroke="isCovered(item) ? '#0A8A4C' : '#E53E3E'"
            stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
            v-html="item.icon"
          />
          <span
            class="text-[10px] font-semibold leading-tight"
            :style="`color:${isCovered(item) ? '#0A8A4C' : '#E53E3E'}`"
          >{{ item.name }}</span>
        </div>
        <!-- Cost + status mark row -->
        <div class="flex items-center justify-between">
          <span
            class="text-[9px] font-semibold"
            :style="`color:${isCovered(item) ? '#6EE7B7' : '#FCA5A5'}`"
          >฿{{ fmtShort(item.estimatedCost) }}</span>
          <span
            class="text-[9px] font-black"
            :style="`color:${isCovered(item) ? '#0A8A4C' : '#E53E3E'}`"
          >{{ isCovered(item) ? '✓' : '✗' }}</span>
        </div>
      </div>
    </div>

    <!-- Expand / collapse button -->
    <button
      v-if="expandable && visibleList.length > MAX_COLLAPSED"
      class="mt-1.5 w-full py-1.5 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 transition-all"
      style="background:#EBF4FF;color:#004CB3;border:1px solid #B8D6F5"
      @click="emit('toggle-expand')"
    >
      <svg
        width="12" height="12" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2"
        stroke-linecap="round" stroke-linejoin="round"
        :style="`transform:${expanded ? 'rotate(180deg)' : 'none'};transition:transform 0.2s`"
      >
        <polyline points="6 9 12 15 18 9"/>
      </svg>
      {{ expanded ? 'แสดงน้อยลง' : `ดูทั้งหมด ${visibleList.length} โรค` }}
    </button>

    <!-- Summary counts — mirrors React stat row -->
    <div class="mt-2 flex items-center gap-3 text-[10px]">
      <span style="color:#0A8A4C">✓ ดูแลได้ {{ coveredCount }} รายการ</span>
      <span style="color:#E53E3E">✗ วงเงินไม่เพียงพอ {{ uncoveredCount }} รายการ</span>
      <span style="color:#999999">คงเหลือ ฿{{ fmtLong(budget) }}</span>
    </div>

    <!-- Disclaimer — matches React source text exactly -->
    <p class="text-[10px] mt-1 leading-relaxed" style="color:#BBBBBB">
      * ค่าใช้จ่ายเป็นค่าประมาณการ อิงจากโรงพยาบาลที่เลือก ไม่รวมค่าเงินเฟ้อทางการแพทย์
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ApiScenario } from '~/types/api'

// ── Constants ─────────────────────────────────────────────────────────────────
/** Number of cards shown before the "expand" button appears (mirrors React). */
const MAX_COLLAPSED = 12

// ── Props & emits ─────────────────────────────────────────────────────────────
const props = defineProps<{
  list:       ApiScenario[] // Full illness list for the current tab
  budget:     number        // Health budget for the selected year
  expandable: boolean
  expanded:   boolean
}>()

const emit = defineEmits<{
  'toggle-expand': []
}>()

// ── Coverage helpers ──────────────────────────────────────────────────────────

/** True when the year's budget fully covers this item's estimated cost. */
const isCovered = (item: ApiScenario): boolean =>
  item.estimatedCost === 0 || props.budget >= item.estimatedCost

function cardStyle(item: ApiScenario): string {
  return isCovered(item)
    ? 'background:#F0FBF4;border:1.5px solid #A5D6B7'
    : 'background:#FEF2F2;border:1.5px solid #FCA5A5'
}

// ── List slicing ──────────────────────────────────────────────────────────────

/** Exclude the "custom" placeholder entry — only show real illness cards. */
const visibleList = computed(() => props.list.filter(i => !i.isCustom))

const displayList = computed(() =>
  props.expandable && !props.expanded
    ? visibleList.value.slice(0, MAX_COLLAPSED)
    : visibleList.value,
)

// ── Summary counts ────────────────────────────────────────────────────────────
const coveredCount   = computed(() => visibleList.value.filter(i => isCovered(i)).length)
const uncoveredCount = computed(() => visibleList.value.filter(i => !isCovered(i)).length)

// ── Formatters ────────────────────────────────────────────────────────────────
function fmtShort(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `${Math.round(n / 1_000)}K`
  return String(n)
}

function fmtLong(n: number): string {
  return n.toLocaleString('th-TH')
}
</script>
