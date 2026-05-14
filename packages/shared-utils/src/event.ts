import type { OrderStatus, OrderCreatedEvent, OrderUpdatedEvent } from '@order-platform/shared-types'
import { isValidOrderId, isValidAmount, isValidOrderStatus } from './validation'
import { ValidationError } from './errors'

/**
 * Creates a type-safe `OrderCreatedEvent`.
 *
 * @throws {ValidationError} If orderId fails validation or total is not a valid amount.
 */
export function createOrderCreatedEvent(orderId: string, total: number): OrderCreatedEvent {
  if (!isValidOrderId(orderId)) {
    throw new ValidationError(`Invalid orderId: "${orderId}". Expected format "ord-<alphanumeric>".`)
  }
  if (!isValidAmount(total)) {
    throw new ValidationError(
      `Invalid total: ${String(total)}. Expected a finite positive number.`,
    )
  }

  return {
    type: 'order.created',
    orderId,
    total,
  }
}

/**
 * Creates a type-safe `OrderUpdatedEvent`.
 *
 * @throws {ValidationError} If orderId fails validation or status is not a valid OrderStatus.
 */
export function createOrderUpdatedEvent(orderId: string, status: OrderStatus): OrderUpdatedEvent {
  if (!isValidOrderId(orderId)) {
    throw new ValidationError(`Invalid orderId: "${orderId}". Expected format "ord-<alphanumeric>".`)
  }
  if (!isValidOrderStatus(status)) {
    throw new ValidationError(
      `Invalid status: "${status}". Expected one of PENDING, CONFIRMED, SHIPPED, DELIVERED, CANCELLED.`,
    )
  }

  return {
    type: 'order.updated',
    orderId,
    status,
  }
}
