export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'CANCELLED'

export interface Order {
  id: string
  amount: number
  item: string
  status: OrderStatus
  createdAt: string
  updatedAt: string
}

export interface CreateOrderRequest {
  amount: number
  item: string
}

export interface CreateOrderResponse {
  id: string
  amount: number
  item: string
  status: OrderStatus
  createdAt: string
}

export interface GetOrderResponse {
  order: Order
}
