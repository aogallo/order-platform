import type { OrderStatus } from './order'

export interface TrackingEntry {
  orderId: string
  status: OrderStatus
  timestamp: string
  updatedBy?: string
}
