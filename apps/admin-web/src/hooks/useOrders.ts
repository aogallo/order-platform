import { useMutation, useQuery } from '@tanstack/react-query'
import api from '../lib/axiosClient'
import type {
  Order,
  GetOrderResponse,
  CreateOrderResponse,
  CreateOrderRequest,
} from '@order-platform/shared-types'
import { toast } from 'sonner'
const MOCK_ORDERS: Order[] = [
  {
    id: 'ord-001',
    amount: 45.99,
    item: 'Wireless Mouse',
    status: 'PENDING',
    createdAt: '2026-05-20T10:00:00Z',
    updatedAt: '2026-05-20T10:00:00Z',
  },
  {
    id: 'ord-002',
    amount: 129.99,
    item: 'Mechanical Keyboard',
    status: 'CONFIRMED',
    createdAt: '2026-05-19T14:30:00Z',
    updatedAt: '2026-05-19T16:00:00Z',
  },
  {
    id: 'ord-003',
    amount: 799.99,
    item: '27" Monitor',
    status: 'SHIPPED',
    createdAt: '2026-05-18T09:15:00Z',
    updatedAt: '2026-05-19T08:00:00Z',
  },
  {
    id: 'ord-004',
    amount: 39.99,
    item: 'USB-C Hub',
    status: 'DELIVERED',
    createdAt: '2026-05-15T11:00:00Z',
    updatedAt: '2026-05-17T14:00:00Z',
  },
  {
    id: 'ord-005',
    amount: 249.99,
    item: 'Webcam HD',
    status: 'CANCELLED',
    createdAt: '2026-05-14T08:00:00Z',
    updatedAt: '2026-05-14T09:30:00Z',
  },
]

export function useOrders() {
  return useQuery<Order[]>({
    queryKey: ['orders'],
    queryFn: () =>
      api.get('/orders').then((r) => {
        console.log('API response', r.data)

        return r.data
      }),
    placeholderData: MOCK_ORDERS,
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
