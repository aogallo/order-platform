import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { toast } from 'sonner'
import api from '../lib/axiosClient'
import type { CreateOrderRequest, CreateOrderResponse } from '@order-platform/shared-types'
import './CreateOrder.css'

function CreateOrder() {
  const navigate = useNavigate()
  const [item, setItem] = useState('')
  const [amount, setAmount] = useState('')

  const { mutate, isPending } = useMutation({
    mutationFn: (data: CreateOrderRequest) =>
      api.post<CreateOrderResponse>('/orders', data).then((r) => r.data),
    onSuccess: (data) => {
      toast.success('Order created successfully!')
      navigate(`/tracking?id=${data.id}`)
    },
    onError: () => {
      toast.error('Failed to create order. Please try again.')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!item.trim() || !amount) return

    mutate({
      item: item.trim(),
      amount: Number.parseFloat(amount),
    })
  }

  return (
    <div className="create-order">
      <h1 className="create-order__title">Create an Order</h1>
      <form className="create-order__form" onSubmit={handleSubmit}>
        <label className="create-order__field">
          <span className="create-order__label">Item</span>
          <input
            className="create-order__input"
            type="text"
            placeholder="e.g. Wireless Mouse"
            value={item}
            onChange={(e) => setItem(e.target.value)}
            required
          />
        </label>

        <label className="create-order__field">
          <span className="create-order__label">Amount ($)</span>
          <input
            className="create-order__input"
            type="number"
            step="0.01"
            min="0"
            placeholder="e.g. 49.99"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </label>

        <button
          className="create-order__submit"
          type="submit"
          disabled={isPending || !item.trim() || !amount}
        >
          {isPending ? 'Creating...' : 'Create Order'}
        </button>
      </form>
    </div>
  )
}

export default CreateOrder
