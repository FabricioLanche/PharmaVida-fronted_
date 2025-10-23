import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './AuthContext'

type ProtectedRouteProps = {
  /** Si se omite o viene vacío, basta con estar autenticado */
  allowedRoles?: string[]
}

export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { user, isAuthenticated, authReady } = useAuth()

  // 1) Espera a que AuthContext termine de hidratar desde localStorage
  if (!authReady) {
    return <div style={{ padding: 16 }}>Cargando…</div>
  }

  // 2) Si no hay sesión válida -> login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />
  }

  // 3) Si hay restricción de roles, validarla (normalizando a UPPERCASE)
  if (allowedRoles && allowedRoles.length > 0) {
    const role = (user.role ?? '').toUpperCase()
    const whitelist = allowedRoles.map(r => r.toUpperCase())
    if (!whitelist.includes(role)) {
      return <Navigate to="/" replace />
    }
  }

  // 4) Acceso concedido
  return <Outlet />
}
