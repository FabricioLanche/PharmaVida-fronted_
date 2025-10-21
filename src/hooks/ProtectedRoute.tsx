import { Navigate, Outlet } from 'react-router-dom'

interface ProtectedRouteProps {
  allowedRoles: string[]
}

export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  // Por ahora simulamos el role, luego conectaremos con el contexto de autenticación
  const token = localStorage.getItem('token')
  const userRole = localStorage.getItem('role') || 'guest'

  if (!token) {
    return <Navigate to="/login" replace />
  }

  if (!allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
