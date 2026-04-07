<!--
  CoverageGrid.vue
  Amount-first mode: shows which illnesses are fully/partially covered by a given amount.
  Extracted from FlexiBenefitSummary.vue — logic identical.
-->
<template>
  <div class="space-y-3">

    <!-- Children section -->
    <template v-if="store.age <= 18 && childItems.length > 0">
      <p class="text-[10px] font-bold uppercase tracking-wider mb-1.5" style="color:#0A8A4C">
        โรคในเด็ก
      </p>
      <div class="grid grid-cols-4 gap-1.5">
        <CoverageCard v-for="(item, i) in childItems" :key="i" :item="item" />
      </div>
    </template>

    <!-- Divider -->
    <div
      v-if="store.age <= 18 && childItems.length > 0 && generalItems.length > 0"
      style="border-top:1px dashed #E2E8F0"
    />

    <!-- General section -->
    <template v-if="generalItems.length > 0">
      <p class="text-[10px] font-bold uppercase tracking-wider mb-1.5" style="color:#0066B3">
        โรคทั่วไป
      </p>
      <div class="grid grid-cols-4 gap-1.5">
        <CoverageCard v-for="(item, i) in generalItems" :key="i" :item="item" />
      </div>
    </template>

    <!-- Empty state -->
    <p
      v-if="childItems.length === 0 && generalItems.length === 0"
      class="text-[11px] py-2"
      style="color:#AAAAAA"
    >ยังไม่มีสถานการณ์ที่ครอบคลุม — ลองเพิ่มวงเงิน</p>

    <!-- Summary -->
    <div class="flex gap-3 text-[10px]" style="color:#999999">
      <span style="color:#0A8A4C">✓ ครอบคลุม {{ fullCount }} รายการ</span>
      <span v-if="partialCount > 0" style="color:#E67E22">~ บางส่วน {{ partialCount }} รายการ</span>
      <span>✗ ไม่ครอบคลุม {{ notCovered }}</span>
    </div>

  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, h } from 'vue'
import { useFlexiCalculatorStore } from '~/stores/flexiCalculator'
import { ILLNESSES, CHILDREN_ILLNESSES } from '~/constants/illnesses'
import { fmt } from '~/utils/flexiCalc'
import type { Illness } from '~/types'

const props = defineProps<{ amount: number }>()

const store = useFlexiCalculatorStore()

type Status = 'full' | 'partial' | 'low'
const statusStyle: Record<Status, { bg: string; border: string; nameColor: string; costColor: string; badge: string }> = {
  full:    { bg: '#F0FBF4', border: '#A5D6B7', nameColor: '#0A8A4C', costColor: '#0A8A4C', badge: '✓' },
  partial: { bg: '#FFF8EE', border: '#F5C791', nameColor: '#B45309', costColor: '#E67E22', badge: '~' },
  low:     { bg: '#F8F8F8', border: '#E2E8F0', nameColor: '#AAAAAA', costColor: '#CCCCCC', badge: '✗' },
}

function toEligible(list: Illness[]) {
  return list
    .filter(ill => ill.min > 0)
    .map(ill => {
      const cost = Math.round(ill.min + (ill.max - ill.min) * store.hospitalPct)
      const status: Status = props.amount >= cost
        ? 'full'
        : props.amount >= ill.min
        ? 'partial'
        : 'low'
      return { ill, cost, status }
    })
}

const generalAll   = computed(() => toEligible(ILLNESSES))
const childAll     = computed(() => store.age <= 18 ? toEligible(CHILDREN_ILLNESSES) : [])
const generalItems = computed(() => generalAll.value.filter(x => x.status !== 'low'))
const childItems   = computed(() => childAll.value.filter(x => x.status !== 'low'))

const fullCount    = computed(() => [...childAll.value, ...generalAll.value].filter(x => x.status === 'full').length)
const partialCount = computed(() => [...childAll.value, ...generalAll.value].filter(x => x.status === 'partial').length)
const notCovered   = computed(() => childAll.value.length + generalAll.value.length - fullCount.value - partialCount.value)

// Inline card sub-component (small enough to keep here)
const CoverageCard = defineComponent({
  props: { item: { type: Object as () => ReturnType<typeof toEligible>[0], required: true } },
  setup(p) {
    return () => {
      const s = statusStyle[p.item.status]
      return h('div', {
        class: 'rounded-lg px-2.5 py-2',
        style: `background:${s.bg};border:1.5px solid ${s.border}`,
      }, [
        h('div', { class: 'flex items-center gap-1 mb-0.5' }, [
          h('svg', {
            width: 10, height: 10, viewBox: '0 0 24 24', fill: 'none',
            stroke: s.nameColor, 'stroke-width': 2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round',
            innerHTML: p.item.ill.icon,
          }),
          h('span', { class: 'text-[10px] font-semibold leading-tight', style: `color:${s.nameColor}` }, p.item.ill.name),
        ]),
        h('div', { class: 'flex items-center justify-between' }, [
          h('span', { class: 'text-[9px] font-bold', style: `color:${s.costColor}` }, `฿${fmt(p.item.cost)}`),
          p.item.status === 'partial'
            ? h('span', { class: 'text-[9px] font-bold', style: `color:${s.nameColor}` }, `ได้ ฿${fmt(props.amount)}`)
            : h('span', { class: 'text-[9px] font-bold', style: `color:${s.nameColor}` }, s.badge),
        ]),
      ])
    }
  },
})
</script>
