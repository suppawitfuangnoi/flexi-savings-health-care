<!--
  FlexiOtherCare.vue
  "สิทธิประโยชน์เพิ่มเติม" hero section — 4 care categories:
  Proactive / Preventive / Restorative / Aesthetics
-->
<template>
  <div class="rounded-2xl overflow-hidden" style="border:1.5px solid #1A3A6A;box-shadow:0 4px 24px rgba(0,102,179,0.18)">

    <!-- Hero Header -->
    <div style="background:linear-gradient(135deg,#001240 0%,#003893 55%,#004CB3 100%);position:relative;overflow:hidden">
      <!-- Decorative orbs -->
      <div style="position:absolute;top:-24px;right:-24px;width:96px;height:96px;border-radius:50%;background:rgba(255,255,255,0.04)" />
      <div style="position:absolute;bottom:-16px;left:60px;width:64px;height:64px;border-radius:50%;background:rgba(255,255,255,0.05)" />

      <div class="px-5 pt-4 pb-2">
        <p class="font-black leading-tight mb-0.5" style="font-size:15px;color:#FFFFFF;letter-spacing:-0.2px">
          สิทธิประโยชน์เพิ่มเติม
        </p>
        <p class="text-[11px] font-medium" style="color:#7FB8E8">
          ครอบคลุมค่าใช้จ่ายด้านสุขภาพและคุณภาพชีวิต
        </p>
      </div>

      <!-- Category buttons -->
      <div class="px-5 pb-4 flex gap-2 flex-wrap">
        <button
          v-for="cat in otherCategories"
          :key="cat.key"
          class="flex items-center gap-1.5 whitespace-nowrap font-bold text-[12px] transition-all"
          :style="activeCat === cat.key
            ? `background:${cat.color};color:#FFFFFF;border:1.5px solid ${cat.color};border-radius:10px;padding:6px 14px;box-shadow:0 3px 12px ${cat.color}55`
            : 'background:rgba(255,255,255,0.1);color:#FFFFFF;border:1.5px solid rgba(255,255,255,0.22);border-radius:10px;padding:6px 14px'"
          @click="toggleCat(cat.key as OtherCareKey)"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
            :stroke="activeCat === cat.key ? '#FFFFFF' : '#A8D4F5'"
            stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
            v-html="cat.icon"
          />
          {{ cat.label }}
        </button>
      </div>
    </div>

    <!-- Info panel — shown when a category is selected -->
    <div v-if="activeCat && activeCatConfig" class="bg-white">

      <!-- Concept line -->
      <div class="px-5 pt-4 pb-3" style="border-bottom:1px solid #F0F4F8">
        <p class="text-[11px] leading-relaxed" style="color:#555555">
          {{ CARE_INFO[activeCat].concept }}
        </p>
      </div>

      <!-- Group tabs -->
      <div class="px-5 pt-3 pb-1">
        <p class="text-[13px] font-bold uppercase tracking-wider mb-2" style="color:#003893">
          เลือกสถานการณ์ / Select Scenario
        </p>
        <div class="flex rounded-xl overflow-hidden mb-4" style="border:1.5px solid #E2E8F0">
          <button
            v-for="(grp, gi) in visibleGroups"
            :key="gi"
            class="flex-1 px-4 py-2.5 text-left transition-all"
            :style="gi === activeGroupIdx
              ? `background:${activeCatConfig.color};border-right:${gi < visibleGroups.length - 1 ? `1px solid ${activeCatConfig.color}` : 'none'}`
              : `background:#FAFAFA;border-right:${gi < visibleGroups.length - 1 ? '1px solid #E2E8F0' : 'none'}`"
            @click="activeGroupIdx = gi"
          >
            <p class="text-[12px] font-bold leading-tight"
              :style="`color:${gi === activeGroupIdx ? '#FFFFFF' : '#003893'}`">
              {{ grp.label }}
            </p>
            <p class="text-[10px] mt-0.5"
              :style="`color:${gi === activeGroupIdx ? 'rgba(255,255,255,0.75)' : '#999999'}`">
              {{ grp.label.includes('เด็ก') ? 'สำหรับเด็ก' : 'สำหรับผู้ใหญ่' }}
            </p>
          </button>
        </div>
      </div>

      <!-- Card grid -->
      <div v-if="activeGroup" class="px-5 pb-5">
        <div class="grid grid-cols-2 gap-2.5">
          <div
            v-for="(item, ii) in activeGroup.items"
            :key="ii"
            class="rounded-xl p-3 flex flex-col gap-1.5"
            :style="`background:${activeCatConfig.color}0D;border:1.5px solid ${activeCatConfig.color}22`"
          >
            <!-- Icon + title row -->
            <div class="flex items-center gap-2">
              <div class="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center"
                :style="`background:${activeCatConfig.color}20`">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                  :stroke="activeCatConfig.color"
                  stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                  v-html="item.icon"
                />
              </div>
              <p class="text-[12px] font-bold leading-tight" :style="`color:${activeCatConfig.color}`">
                {{ itemTitle(item.text) }}
              </p>
            </div>
            <!-- Description -->
            <p v-if="itemDesc(item.text)" class="text-[11px] leading-snug pl-9" style="color:#555555">
              {{ itemDesc(item.text) }}
            </p>
          </div>
        </div>
      </div>

      <!-- Aesthetics: clinic list (non-children tabs) -->
      <div
        v-if="activeCat === 'aesthetics' && activeGroup && !activeGroup.label.includes('เด็ก')"
        class="px-5 pb-4"
      >
        <p class="text-[10px] font-bold uppercase tracking-wider mb-2 pb-1"
          :style="`color:${activeCatConfig.color};border-bottom:1.5px solid ${activeCatConfig.color}33`">
          ตัวอย่าง {{ AESTHETIC_CLINICS.length }} คลินิกที่สามารถเบิกได้
        </p>
        <div class="flex flex-wrap gap-1.5">
          <span
            v-for="(clinic, ci) in AESTHETIC_CLINICS"
            :key="ci"
            class="px-3 py-1.5 rounded-xl text-[11px] font-semibold"
            style="background:#FDF0F9;color:#D946A1;border:1px solid #F0C0E055"
          >
            {{ clinic.name }}
          </span>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useFlexiCalculatorStore } from '~/stores/flexiCalculator'
import {
  CARE_CATEGORIES, CARE_INFO, AESTHETIC_CLINICS,
} from '~/constants/illnesses'
import type { OtherCareKey } from '~/types'

const store = useFlexiCalculatorStore()

// ── Local state ──────────────────────────────────────────────────────────────
const activeCat      = ref<OtherCareKey | null>(null)
const activeGroupIdx = ref(0)

// ── Computed ─────────────────────────────────────────────────────────────────
const otherCategories = CARE_CATEGORIES.filter(c => c.key !== 'health')

const activeCatConfig = computed(() =>
  activeCat.value ? CARE_CATEGORIES.find(c => c.key === activeCat.value) ?? null : null
)

// Filter out child groups when age > 18
const visibleGroups = computed(() => {
  if (!activeCat.value) return []
  return CARE_INFO[activeCat.value].groups.filter(
    g => (store.age ?? 0) <= 18 || !g.label.includes('เด็ก'),
  )
})

const activeGroup = computed(() => {
  const groups = visibleGroups.value
  if (!groups.length) return null
  const safeIdx = Math.min(activeGroupIdx.value, groups.length - 1)
  return groups[safeIdx] ?? null
})

// ── Helpers ───────────────────────────────────────────────────────────────────
function toggleCat(key: OtherCareKey) {
  if (activeCat.value === key) {
    activeCat.value = null
  } else {
    activeCat.value = key
    activeGroupIdx.value = 0
  }
}

// Split "Title — Description" text
function itemTitle(text: string): string {
  return text.split(' — ')[0] ?? text
}
function itemDesc(text: string): string {
  const parts = text.split(' — ')
  return parts.length > 1 ? parts.slice(1).join(' — ') : ''
}
</script>
