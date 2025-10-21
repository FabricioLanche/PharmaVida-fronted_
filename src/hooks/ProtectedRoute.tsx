import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './AuthContext'

interface ProtectedRouteProps {
  allowedRoles: string[]
}

export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { user, token, isAuthenticated } = useAuth()

  if (!isAuthenticated || !token || !user) {
    return <Navigate to="/login" replace />
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
