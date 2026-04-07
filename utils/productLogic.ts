/**
 * utils/productLogic.ts
 * Single source of truth for segment derivation and product catalogue.
 * Pure functions — no framework imports. Safe to use on server and client.
 *
 * ⚠️  Import this file ONLY from server/api routes or server/utils.
 *     Client components must call $fetch('/api/products') instead so that
 *     the PRODUCTS catalogue is NOT bundled into the client JavaScript.
 */
import type { AumTier, AumOption, SegmentKey, ObjectiveKey } from '~/types'

// ─── AUM pill → tier ──────────────────────────────────────────────────────────

export const AUM_TIER_MAP: Record<AumOption, AumTier> = {
  '3MB':  'low',   // Mass      < 3 M
  '5MB':  'mid',   // Affluent  3–10 M
  '10MB': 'high',  // Wealth    10–30 M
  '30MB': 'high',  // HNW       30+ M
}

// ─── Segment derivation ───────────────────────────────────────────────────────
// Priority: entrepreneur > parents > senior_wealth > senior > sinks_dinks

export function deriveSegment(
  age: number,
  aumTier: AumTier,
  isBusinessOwner: boolean,
  hasChild: boolean,
): SegmentKey {
  if (isBusinessOwner)                  return 'entrepreneur'
  if (hasChild)                         return 'parents'
  if (age >= 60 && aumTier === 'high')  return 'senior_wealth'
  if (age >= 60)                        return 'senior'
  return 'sinks_dinks'
}

// ─── Product catalogue — objective × aumTier × segment ───────────────────────

type ProductMap = Partial<Record<SegmentKey, readonly string[]>>
type TierMap    = Partial<Record<AumTier, ProductMap>>

const PRODUCTS: Record<ObjectiveKey, TierMap> = {
  tax_saving: {
    low: { sinks_dinks: ['Gain 1st E-saving (10/5)'] },
    mid: { sinks_dinks: ['Gain 1st Speed return (10/5)'] },
    high: {},
  },

  investment_saving: {
    low: {
      sinks_dinks:   ['Gain 1st Simple (15/15)', 'Gain 1st Speed up (15/8)'],
      senior_wealth: ['Gain 1st Speed up (15/8)'],
    },
    mid: {
      sinks_dinks: [
        'Gain 1st 810 (15/7)',
        'Gain 1st 650 (14/6) par',
        'Gain 1st 10x (15/10)',
        'Gain 1st 348 (branch)',
        'Gain 1st 424 par',
      ],
    },
    high: {
      sinks_dinks:   ['Gain 1st 525 par', 'Gain 1st 348', 'Gain 1st 424 par', 'Gain 1st 10x (ส่วนลดทุนสูง)'],
      senior_wealth: ['Gain 1st 525 par', 'Gain 1st 348', 'Gain 1st 424 par', 'Gain 1st 10x (ส่วนลดทุนสูง)'],
    },
  },

  // Reserved for future use
  inheritance: { low: {}, mid: {}, high: {} },

  lifestyle_protection: {
    low: {
      sinks_dinks:   ['Gain 1st Protection (15/10)', 'Gain 1st Saving and Care (15/10)'],
      senior_wealth: ['Gain 1st Protection (15/10)'],
    },
    mid: {
      sinks_dinks:   ['Gain 1st Savings Health Care 12/6 (Flexi)'],
      senior_wealth: ['Gain 1st Savings Health Care 12/6 (Flexi)'],
    },
    high: {
      sinks_dinks:  ['Gain 1st Savings Health Care 12/6 (Flexi)'],
      entrepreneur: ['Gain 1st Savings Health Care 12/6 (Flexi)'],
    },
  },

  protect_family: {
    low:  { parents: ['Gain 1st Saving and Care for kids'] },
    mid:  { parents: ['Gain 1st Savings Health Care for Kids 12/6 (Flexi)'] },
    high: {},
  },

  retirement: {
    low: { sinks_dinks: ['Gain 1st Simple (15/15)', 'Gain 1st Speed up (15/8)'] },
    mid: {
      sinks_dinks: [
        'Gain 1st 810 (15/7)',
        'Gain 1st 650 (14/6) par',
        'Gain 1st 10x (15/10)',
        'Gain 1st 348 (branch)',
        'Gain 1st 424 par',
      ],
    },
    high: {},
  },
}

/** Returns recommended product names for a given (objective, aumTier, segment) triple. */
export function getProducts(
  objective: ObjectiveKey,
  aumTier: AumTier,
  segment: SegmentKey,
): readonly string[] {
  return PRODUCTS[objective]?.[aumTier]?.[segment] ?? []
}
