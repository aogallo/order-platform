import type { OrderStatus } from './order'

export interface OrderCreatedEvent {
  type: 'order.created'
  orderId: string
  total: number
}

export interface OrderUpdatedEvent {
  type: 'order.updated'
  orderId: string
  status: OrderStatus
}

export type OrderEvent = OrderCreatedEvent | OrderUpdatedEvent
