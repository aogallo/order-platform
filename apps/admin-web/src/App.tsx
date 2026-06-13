import { PublicLayout } from './components/PublicLayout'
import { Layout } from './components/Layout'
import { Navigate, Route, Routes } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Users from './pages/Users'
import Orders from './pages/Orders'
import Login from './pages/Login'
import Home from './pages/Home'
import CreateOrder from './pages/CreateOrder'
import TrackOrder from './pages/TrackOrder'
import ProtectedRoute from './routes/ProtectedRoute'

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/orders/new" element={<CreateOrder />} />
        <Route path="/tracking" element={<TrackOrder />} />
      </Route>

      {/* Login */}
      <Route path="/login" element={<Login />} />

      {/* Admin routes - protected */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute>
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/users" element={<Users />} />
                <Route path="*" element={<Navigate to="/admin" replace />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}

export default App
