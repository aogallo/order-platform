import type { OrderStatus, UserGroup } from '@order-platform/shared-types'

/**
 * All valid order lifecycle statuses.
 */
export const ORDER_STATUSES: readonly OrderStatus[] = Object.freeze([
  'PENDING',
  'CONFIRMED',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
] as const)

/**
 * All valid user groups for access control.
 */
export const USER_GROUPS: readonly UserGroup[] = Object.freeze([
  'admin',
  'operator',
  'viewer',
] as const)

/**
 * All valid order event type strings.
 */
export const VALID_ORDER_EVENT_TYPES: readonly string[] = Object.freeze([
  'order.created',
  'order.updated',
] as const)
