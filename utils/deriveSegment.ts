/**
 * utils/deriveSegment.ts
 * Helper functions for legacy segmentation flow.
 * Pure functions — no framework imports.
 */
import type { AgeSegment, WealthTier, Lifestyle } from '~/types'

export interface BasicQuestions {
  age:             number
  hasChildren:     boolean
  isBusinessOwner: boolean
  incomeLevel:     'high' | 'medium' | 'low'
}

export function deriveAgeSegment(age: number): AgeSegment {
  if (age <= 22) return 'first_step'
  if (age <= 35) return 'building'
  if (age <= 44) return 'stable'
  if (age <= 60) return 'wealthy'
  return 'retired'
}

export function deriveWealthTier(incomeLevel: 'high' | 'medium' | 'low'): WealthTier {
  if (incomeLevel === 'high')   return 'wealth'
  if (incomeLevel === 'medium') return 'affluent'
  return 'mass'
}

export function deriveLifestyle(q: BasicQuestions): Lifestyle {
  const ageSegment = deriveAgeSegment(q.age)

  if (ageSegment === 'retired' && (q.incomeLevel === 'high' || q.isBusinessOwner)) {
    return 'senior_wealth'
  }
  if (q.hasChildren)     return 'parent'
  if (q.isBusinessOwner) return 'entrepreneur'
  return 'sink_dink'
}
