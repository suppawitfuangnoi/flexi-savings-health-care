<!--
  FlexiProjectionChart.vue
  Standalone Line chart view for the 12-year benefit projection.
  Uses vue-chartjs Line with 4 datasets (area + line).
  Must be used inside <ClientOnly> or this is imported by FlexiProjectionTable which handles the toggle.
-->
<template>
  <div class="p-5">
    <p class="text-[11px] font-bold uppercase tracking-wider mb-3" style="color:#666">
      ผลประโยชน์สะสม VS เบี้ยสะสม
    </p>
    <div style="height:280px">
      <Line :data="chartData" :options="chartOptions" />
    </div>
    <!-- Legend -->
    <div class="mt-2 flex flex-wrap gap-x-5 gap-y-1.5 justify-center text-[10px]" style="color:#666">
      <span class="flex items-center gap-1.5">
        <span style="display:inline-block;width:18px;height:2.5px;background:#0066B3;border-radius:2px" />ผลประโยชน์รวม
      </span>
      <span class="flex items-center gap-1.5">
        <svg width="18" height="4"><line x1="0" y1="2" x2="18" y2="2" stroke="#E53E3E" stroke-width="2" stroke-dasharray="4 2"/></svg>เบี้ยสะสม
      </span>
      <span class="flex items-center gap-1.5">
        <svg width="18" height="4"><line x1="0" y1="2" x2="18" y2="2" stroke="#E67E22" stroke-width="1.5" stroke-dasharray="3 2"/></svg>วงเงินสุขภาพสะสม
      </span>
      <span class="flex items-center gap-1.5">
        <svg width="18" height="4"><line x1="0" y1="2" x2="18" y2="2" stroke="#2196F3" stroke-width="1.5" stroke-dasharray="3 2"/></svg>เงินคืน 2% สะสม
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale,
  PointElement, LineElement,
  Filler, Tooltip, Legend,
} from 'chart.js'
import { useFlexiCalculatorStore } from '~/stores/flexiCalculator'
import { fmt } from '~/utils/formatters'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend)

const store = useFlexiCalculatorStore()

/**
 * Health balance at year y — delegates to store getter so the chart reflects
 * any yearExpenses the user has entered in the projection table row.
 */
const _benefitAtYear = (y: number): number => store.benefitAtYear(y)

const chartData = computed(() => {
  const r = store.premiumResult
  if (!r) return { labels: [], datasets: [] }
  const taxSavingTotal = (store.selectedTaxOption?.rate ?? 0) > 0
    ? Math.min(r.annualPremium, 100000) * (store.selectedTaxOption!.rate) * 6
    : 0
  const years = Array.from({ length: 12 }, (_, i) => i + 1)

  return {
    labels: years.map(y => `ปี ${y}`),
    datasets: [
      {
        label: 'เบี้ยสะสม',
        data: years.map(y => Math.min(y, 6) * r.annualPremium),
        borderColor: '#E53E3E',
        borderWidth: 2,
        borderDash: [5, 3],
        backgroundColor: 'rgba(229,62,62,0.08)',
        fill: true,
        tension: 0.4,
        pointRadius: 0,
      },
      {
        label: 'ผลประโยชน์รวม',
        data: years.map(y =>
          r.cashReturn * y + _benefitAtYear(y) + (y === 12 ? r.maturity + taxSavingTotal : 0)
        ),
        borderColor: '#0066B3',
        borderWidth: 2.5,
        backgroundColor: 'rgba(0,102,179,0.10)',
        fill: true,
        tension: 0.4,
        pointRadius: 0,
      },
      {
        label: 'วงเงินสุขภาพสะสม',
        data: years.map(y => _benefitAtYear(y)),
        borderColor: '#E67E22',
        borderWidth: 1.5,
        borderDash: [3, 2],
        backgroundColor: 'transparent',
        fill: false,
        tension: 0.4,
        pointRadius: 0,
      },
      {
        label: 'เงินคืน 2% สะสม',
        data: years.map(y => r.cashReturn * y),
        borderColor: '#2196F3',
        borderWidth: 1.5,
        borderDash: [3, 2],
        backgroundColor: 'transparent',
        fill: false,
        tension: 0.4,
        pointRadius: 0,
      },
    ],
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: (ctx: any) => `฿${fmt(ctx.raw)}`,
        title: (items: any[]) => `ปีที่ ${items[0].label.replace('ปี ', '')}`,
      },
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { font: { size: 10 }, color: '#999' },
    },
    y: {
      ticks: {
        font: { size: 9 },
        color: '#999',
        callback: (v: any) => {
          if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`
          if (v >= 1_000) return `${Math.round(v / 1_000)}K`
          return String(v)
        },
      },
      grid: { color: 'rgba(0,0,0,0.05)' },
    },
  },
}
</script>
