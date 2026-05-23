import './Dashboard.css'
import { useOrders } from '../hooks/useOrders'

function Dashboard() {
  const { isLoading } = useOrders()

  const totalOrders = 299999
  const totalRevenue = 101
  const pendingOrders = 22
  const shippedOrders = 9999

  return (
    <div>
      <h1 className="dashboard__title">Dashboard</h1>

      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div className="dashboard__grid">
          <div className="dashboard__card">
            <p className="dashboard__card-label">Total Orders</p>
            <p className="dashboard__card-value">{totalOrders}</p>
          </div>
          <div className="dashboard__card">
            <p className="dashboard__card-label">Revenue</p>
            <p className="dashboard__card-value">{totalRevenue}</p>
          </div>
          <div className="dashboard__card">
            <p className="dashboard__card-label">Pending</p>
            <p className="dashboard__card-value">{pendingOrders}</p>
          </div>
          <div className="dashboard__card">
            <p className="dashboard__card-label">Shipped</p>
            <p className="dashboard__card-value">{shippedOrders}</p>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
