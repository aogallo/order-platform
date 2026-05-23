import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import type { PropsWithChildren } from 'react'

function ProtectedRoute({ children }: PropsWithChildren) {
  const { user, loading } = useAuth()

  if (loading) {
    return <div>Loading...</div>
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }
  return children
}

export default ProtectedRoute
