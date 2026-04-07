/**
 * composables/useBECalendar.ts
 * Encapsulates v-calendar Buddhist Era (พ.ศ.) conversion and calendar state.
 * - Lazy-loads v-calendar client-only (SSR-safe via shallowRef + onMounted)
 * - Converts all CE year numbers to BE (+543) in all 4 calendar layers:
 *     ① #header-title slot  ② #nav-title slot  ③ #nav-item slot  ④ MutationObserver
 * - today and minBirthDate are computed refs — stay fresh across midnight
 */
import {
  ref, shallowRef, computed, onMounted, onUnmounted, nextTick,
  type Component, type ComputedRef,
} from 'vue'
import { onClickOutside } from '@vueuse/core'
import { toISODate } from '~/utils/dateFormat'

// ─── Thai month names ─────────────────────────────────────────────────────────

const THAI_MONTHS = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน',
  'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม',
  'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
]

// ─── CE → BE conversion ───────────────────────────────────────────────────────

/**
 * Replace all 4-digit CE years (1850–2099) with BE (+543) in a string.
 * BE years (2393+) are safely outside this range — no double-conversion risk.
 */
function ceToBE(text: string): string {
  return text.replace(/\b(\d{4})\b/g, m => {
    const n = Number(m)
    return n >= 1850 && n <= 2099 ? String(n + 543) : m
  })
}

// ─── Composable ───────────────────────────────────────────────────────────────

/**
 * @param dobAsDate      - Reactive computed ref to selected DOB as Date | null
 * @param onDateSelected - Callback with ISO date string (YYYY-MM-DD) on day click
 */
export function useBECalendar(
  dobAsDate: ComputedRef<Date | null>,
  onDateSelected: (isoDate: string) => void,
) {
  // ── Date bounds — computed so they update if the tab lives past midnight ────
  const today = computed(() => new Date())
  const minBirthDate = computed(() => {
    const d = today.value
    return new Date(d.getFullYear() - 100, d.getMonth(), d.getDate())
  })

  // ── v-calendar initial page ──────────────────────────────────────────────
  const calendarInitialPage = computed(() => {
    if (dobAsDate.value) {
      return { month: dobAsDate.value.getMonth() + 1, year: dobAsDate.value.getFullYear() }
    }
    const t = today.value
    return { month: t.getMonth() + 1, year: t.getFullYear() }
  })

  // ── Calendar component (lazy client-only) ────────────────────────────────
  const calendarComp = shallowRef<Component | null>(null)
  const calendarOpen = ref(false)
  const calendarWrap = ref<HTMLElement | null>(null)
  let navObserver: MutationObserver | null = null

  onClickOutside(calendarWrap, () => { calendarOpen.value = false })

  onMounted(async () => {
    const { Calendar } = await import('v-calendar')
    calendarComp.value = Calendar
    await nextTick()
    if (calendarWrap.value) {
      navObserver = new MutationObserver(fixNavBE)
      navObserver.observe(calendarWrap.value, { subtree: true, childList: true })
    }
  })

  onUnmounted(() => {
    navObserver?.disconnect()
    navObserver = null
  })

  // ── Calendar attributes (selected day highlight) ─────────────────────────
  const calendarAttrs = computed(() => {
    if (!dobAsDate.value) return []
    return [{
      key: 'selected',
      dates: dobAsDate.value,
      highlight: { color: 'blue', fillMode: 'solid' },
    }]
  })

  // ── Day click handler ────────────────────────────────────────────────────
  function onDayClick(day: { date: Date; isDisabled?: boolean }) {
    if (day.isDisabled) return
    const iso = toISODate(day.date)
    if (iso) {
      onDateSelected(iso)
      calendarOpen.value = false
    }
  }

  // ── Slot helpers ─────────────────────────────────────────────────────────

  /** ① Main calendar header: "มิถุนายน 2540" */
  function beHeader(s: Record<string, unknown>): string {
    if (!s) return ''
    if (typeof s.month === 'number' && typeof s.year === 'number') {
      return `${THAI_MONTHS[s.month - 1]} ${s.year + 543}`
    }
    if (typeof s.title === 'string') return ceToBE(s.title)
    return ''
  }

  /** ③ Individual year items in nav popup: 1997 → 2540, Thai month abbr passes through */
  function navItemBE(item: Record<string, unknown>): string | number {
    const label = String(item?.label ?? item?.year ?? '')
    if (/^\d{4}$/.test(label)) {
      const n = Number(label)
      if (n >= 1850 && n <= 2099) return n + 543
    }
    return label
  }

  // ── ④ MutationObserver: fix any remaining CE years in nav DOM ────────────
  function fixNavBE() {
    const root = calendarWrap.value
    if (!root) return
    root.querySelectorAll<HTMLElement>('.vc-nav-title').forEach(el => {
      const text  = el.textContent ?? ''
      const fixed = ceToBE(text)
      if (fixed !== text) el.textContent = fixed
    })
    root.querySelectorAll<HTMLElement>('.vc-nav-item').forEach(el => {
      const text = (el.textContent ?? '').trim()
      if (/^\d{4}$/.test(text)) {
        const n = Number(text)
        if (n >= 1850 && n <= 2099) el.textContent = String(n + 543)
      }
    })
  }

  return {
    calendarComp,
    calendarOpen,
    calendarWrap,
    calendarAttrs,
    calendarInitialPage,
    today,
    minBirthDate,
    beHeader,
    navItemBE,
    ceToBE,
    onDayClick,
  }
}
