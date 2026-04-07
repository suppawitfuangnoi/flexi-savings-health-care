/**
 * utils/formatters.ts
 * Display-only formatting helpers. No business logic or side effects.
 */

/** Format a number to Thai-style currency string (comma-separated, no decimals, always positive). */
export function fmt(n: number): string {
  return Math.abs(Math.round(n)).toLocaleString('en-US')
}
