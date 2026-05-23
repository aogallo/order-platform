import './Order.css'
import { useOrders } from '../hooks/useOrders'

const statusLabels: Record<string, string> = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  SHIPPED: 'Shipped',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
}

function Orders() {
  const { data: orders, isLoading } = useOrders()

  return (
    <div className="orders">
      <div className="orders__header">
        <h1 className="orders__title">Orders</h1>
      </div>

      {isLoading && <div className="orders__loading">Loading orders...</div>}

      {orders && orders.length === 0 && <div className="orders__empty">No orders found</div>}

      {orders && orders.length > 0 && (
        <table className="orders__table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Item</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{order.item}</td>
                <td>{Number(order.amount).toFixed(2)}</td>
                <td>
                  <span className={`orders__status orders__status--${order.status}`}>
                    {statusLabels[order.status] ?? order.status}
                  </span>
                </td>
                <td>{new Date(order.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default Orders
