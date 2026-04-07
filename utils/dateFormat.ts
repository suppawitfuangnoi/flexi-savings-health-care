/**
 * utils/dateFormat.ts
 * Date formatting helpers for Thai Buddhist Era (พ.ศ.) display.
 * Internally all dates are stored as ISO 8601 strings (ค.ศ.) — conversion is display-only.
 */

/**
 * Format a Date object to Thai Buddhist Era string.
 * e.g. new Date('1990-01-15') → "15/01/2533"
 */
export function formatBE(date: Date | null | undefined): string {
  if (!date) return ''
  return new Intl.DateTimeFormat('th-TH-u-ca-buddhist', {
    day:   '2-digit',
    month: '2-digit',
    year:  'numeric',
  }).format(date)
}

/**
 * Format a Date object to Thai Buddhist Era string with full month name.
 * e.g. new Date('1990-01-15') → "15 มกราคม 2533"
 */
export function formatBELong(date: Date | null | undefined): string {
  if (!date) return ''
  return new Intl.DateTimeFormat('th-TH-u-ca-buddhist', {
    day:   'numeric',
    month: 'long',
    year:  'numeric',
  }).format(date)
}

/**
 * Convert a Date object to ISO date string (ค.ศ.) for API transmission.
 * Uses LOCAL date components (not UTC) to avoid timezone off-by-one errors.
 * e.g. clicking June 12 in UTC+7 correctly returns "1990-06-12", not "1990-06-11".
 */
export function toISODate(date: Date | null | undefined): string | null {
  if (!date) return null
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}
