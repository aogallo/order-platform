import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '../lib/axiosClient'
import type { GetOrderResponse } from '@order-platform/shared-types'
import './TrackOrder.css'

const statusLabels: Record<string, string> = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
}

function TrackOrder() {
  const [searchParams, setSearchParams] = useSearchParams()
  const initialId = searchParams.get('id') ?? ''
  const [orderId, setOrderId] = useState(initialId)
  const [submittedId, setSubmittedId] = useState(initialId)

  const {
    data,
    isLoading,
    isError,
    error,
  } = useQuery<GetOrderResponse>({
    queryKey: ['order', submittedId],
    queryFn: () => api.get(`/orders/${submittedId}`).then((r) => r.data),
    enabled: !!submittedId,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!orderId.trim()) return
    setSubmittedId(orderId.trim())
    setSearchParams({ id: orderId.trim() })
  }

  const order = data?.order

  return (
    <div className="track-order">
      <h1 className="track-order__title">Track an Order</h1>

      <form className="track-order__form" onSubmit={handleSubmit}>
        <label className="track-order__field">
          <span className="track-order__label">Order ID</span>
          <input
            className="track-order__input"
            type="text"
            placeholder="e.g. ord-001"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
          />
        </label>
        <button
          className="track-order__submit"
          type="submit"
          disabled={!orderId.trim() || isLoading}
        >
          {isLoading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {isLoading && <p className="track-order__status">Looking up order...</p>}

      {isError && (
        <p className="track-order__status track-order__status--error">
          {error instanceof Error ? error.message : 'Order not found. Please check the ID and try again.'}
        </p>
      )}

      {order && (
        <div className="track-order__result">
          <div className="track-order__row">
            <span className="track-order__key">ID</span>
            <span className="track-order__value">{order.id}</span>
          </div>
          <div className="track-order__row">
            <span className="track-order__key">Item</span>
            <span className="track-order__value">{order.item}</span>
          </div>
          <div className="track-order__row">
            <span className="track-order__key">Amount</span>
            <span className="track-order__value">${Number(order.amount).toFixed(2)}</span>
          </div>
          <div className="track-order__row">
            <span className="track-order__key">Status</span>
            <span className={`track-order__value track-order__status-badge track-order__status-badge--${order.status}`}>
              {statusLabels[order.status] ?? order.status}
            </span>
          </div>
          <div className="track-order__row">
            <span className="track-order__key">Created</span>
            <span className="track-order__value">{new Date(order.createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      )}
    </div>
  )
}

export default TrackOrder
