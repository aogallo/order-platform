import { useMutation, useQuery } from '@tanstack/react-query'
import api from '../lib/axiosClient'
import type {
  Order,
  GetOrderResponse,
  CreateOrderResponse,
  CreateOrderRequest,
  ListOrdersResponse,
} from '@order-platform/shared-types'

import { toast } from 'sonner'

export function useOrders() {
  return useQuery<Order[]>({
    queryKey: ['orders'],
    queryFn: () =>
      api.get<ListOrdersResponse>('/orders').then((r) => {
        return r.data.orders
      }),
  })
}

export function useOrder(orderId: string) {
  return useQuery<GetOrderResponse>({
    queryKey: ['order', orderId],
    queryFn: () => api.get(`/orders/${orderId}`).then((r) => r.data),
    enabled: !!orderId,
  })
}

export function useCreateOrder() {
  return useMutation({
    mutationFn: (data: CreateOrderRequest) =>
      api.post<CreateOrderResponse>('/orders', data).then((r) => r.data),
    onSuccess: () => {
      toast.success('Order created successfully!')
    },
    onError: () => {
      toast.error('Failed to create order. Please try again.')
    },
  })
}
