export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'

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
  message: string
  data: Order
}

export interface GetOrderResponse {
  order: Order
}

export interface ListOrdersResponse {
  orders: Order[]
}
