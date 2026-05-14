import type { OrderStatus } from '@order-platform/shared-types'

const ORDER_ID_PATTERN = /^ord-[a-zA-Z0-9]+$/

const VALID_STATUSES: ReadonlySet<string> = new Set([
  'PENDING',
  'CONFIRMED',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
])

/**
 * Validates that the given string is a non-empty order ID matching the pattern `ord-<alphanumeric>`.
 */
export function isValidOrderId(id: string): boolean {
  if (typeof id !== 'string') return false
  return ORDER_ID_PATTERN.test(id)
}

/**
 * Validates that the given value is a finite positive number greater than zero.
 * Returns false for NaN, Infinity, -Infinity, zero, and negative values.
 */
export function isValidAmount(amount: number): boolean {
  if (typeof amount !== 'number') return false
  if (!Number.isFinite(amount)) return false
  return amount > 0
}

/**
 * Type-narrowing check. Returns true when `status` is a known OrderStatus literal,
 * and narrows the type to `OrderStatus` in the calling scope.
 */
export function isValidOrderStatus(status: string): status is OrderStatus {
  if (typeof status !== 'string') return false
  return VALID_STATUSES.has(status)
}
