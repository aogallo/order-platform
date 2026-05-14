import { ValidationError } from './errors'

/**
 * Formats a numeric amount as a locale-aware currency string.
 *
 * @param amount - A finite positive number.
 * @param currency - ISO 4217 currency code (default: 'USD').
 * @returns A formatted string such as "$49.99".
 * @throws {ValidationError} If the amount is not a valid finite positive number.
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  if (typeof amount !== 'number' || !Number.isFinite(amount) || amount < 0) {
    throw new ValidationError(
      `Invalid amount: ${String(amount)}. Expected a finite non-negative number.`,
    )
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount)
}

/**
 * Formats a Date or ISO 8601 string into a human-readable localised datetime.
 *
 * @param date - A Date object or ISO 8601 string.
 * @returns A formatted string such as "May 12, 2026, 3:45 PM".
 * @throws {ValidationError} If the input is not a valid date.
 */
export function formatTimestamp(date: Date | string): string {
  const parsed = typeof date === 'string' ? new Date(date) : date

  if (!(parsed instanceof Date) || isNaN(parsed.getTime())) {
    throw new ValidationError(
      `Invalid date: ${String(date)}. Expected a valid Date object or ISO 8601 string.`,
    )
  }

  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  }).format(parsed)
}
