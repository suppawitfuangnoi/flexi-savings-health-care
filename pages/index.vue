<template>
  <div class="min-h-screen" style="background:#F5F5F5">

    <!-- ── Sticky Header ── -->
    <header class="bg-white sticky top-0 z-10" style="border-bottom:1px solid #9BB8E8">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-3">
        <div class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style="background:#0066B3">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
        </div>
        <div class="flex-1 min-w-0">
          <p class="font-bold text-base leading-tight" style="color:#0066B3">Flexi Savings Health Care</p>
          <p class="text-[11px]" style="color:#666666">แบบประกันออมทรัพย์คุ้มครองสุขภาพ — Interactive Calculator</p>
        </div>
        <!-- Reset button -->
        <button
          @click="calcStore.$reset()"
          class="flex items-center gap-1.5 rounded-xl text-xs font-semibold transition-colors px-3 py-2"
          style="color:#0066B3;border:1.5px solid #9BB8E8;background:#FFFFFF"
          @mouseenter="($event.currentTarget as HTMLElement).style.background='#EBF0FA'"
          @mouseleave="($event.currentTarget as HTMLElement).style.background='#FFFFFF'"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4"/>
          </svg>
          รีเซ็ต
        </button>
      </div>
    </header>

    <!-- ── Main Content ── -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-5">
      <FlexiSetup />
      <FlexiBenefitSummary />
      <FlexiProjectionTable />
      <FlexiPayoutSummary />
    </main>

  </div>
</template>

<script setup lang="ts">
import { useFlexiCalculatorStore } from '~/stores/flexiCalculator'
import FlexiSetup           from '~/components/flexi/FlexiSetup.vue'
import FlexiBenefitSummary  from '~/components/flexi/FlexiBenefitSummary.vue'
import FlexiProjectionTable from '~/components/flexi/FlexiProjectionTable.vue'
import FlexiPayoutSummary   from '~/components/flexi/FlexiPayoutSummary.vue'

useHead({ title: 'Flexi Savings Health Care — Calculator' })

const calcStore = useFlexiCalculatorStore()
</script>
