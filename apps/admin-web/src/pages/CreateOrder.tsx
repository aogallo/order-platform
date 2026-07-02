import { useState } from 'react'
import './CreateOrder.css'
import { useCreateOrder } from '../hooks/useOrders'

function CreateOrder() {
  const [item, setItem] = useState('')
  const [amount, setAmount] = useState('')

  const { mutate, isPending } = useCreateOrder()

  const handleSubmit = (e: React.SubmitEvent) => {
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
