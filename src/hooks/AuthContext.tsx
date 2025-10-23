import { createContext, useContext, useState, useEffect, useMemo, type ReactNode } from 'react'
import { jwtDecode } from 'jwt-decode'

/** ===== Tipos ===== */
interface User {
  id?: number
  nombre: string
  apellido: string
  email: string
  role: string
  dni: string
  distrito?: string
}

interface JWTPayload {
  sub: string   // DNI
  role: string
  iat: number
  exp: number   // segundos desde epoch
}

interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  authReady: boolean
  login: (token: string, userData: Partial<User>) => void
  logout: () => void
  getAuthHeaders: () => Record<string, string>
}

/** ===== Helpers ===== */
const STORAGE_KEYS = {
  token: 'token',
  user: 'user',
  role: 'role',
} as const

const decodeSafe = (token: string): JWTPayload | null => {
  try {
    return jwtDecode<JWTPayload>(token)
  } catch {
    return null
  }
}

const isExpired = (payload: JWTPayload | null): boolean => {
  if (!payload) return true
  const nowSec = Math.floor(Date.now() / 1000)
  return payload.exp <= nowSec
}

const toNormalizedRole = (role?: string) => (role ?? '').toUpperCase()

/** ===== Contexto ===== */
const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [authReady, setAuthReady] = useState(false) // <- evita el salto a login en refresh

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem(STORAGE_KEYS.token)
    localStorage.removeItem(STORAGE_KEYS.user)
    localStorage.removeItem(STORAGE_KEYS.role)
  }

  // Hidratar sesión desde localStorage al montar
  useEffect(() => {
    const savedToken = localStorage.getItem(STORAGE_KEYS.token)
    const savedUser = localStorage.getItem(STORAGE_KEYS.user)

    if (!savedToken) {
      setAuthReady(true)
      return
    }

    const payload = decodeSafe(savedToken)
    if (!payload || isExpired(payload)) {
      logout()
      setAuthReady(true)
      return
    }

    // Construir usuario: usa lo guardado si existe, sino arma mínimo con datos del token
    let nextUser: User | null = null
    try {
      const base: Partial<User> = savedUser ? JSON.parse(savedUser) : {}
      nextUser = {
        id: base.id,
        nombre: base.nombre ?? '',
        apellido: base.apellido ?? '',
        email: base.email ?? '',
        distrito: base.distrito,
        dni: payload.sub,
        role: toNormalizedRole(payload.role),
      }
    } catch {
      nextUser = {
        nombre: '',
        apellido: '',
        email: '',
        dni: payload.sub,
        role: toNormalizedRole(payload.role),
      }
    }

    setToken(savedToken)
    setUser(nextUser)
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(nextUser))
    localStorage.setItem(STORAGE_KEYS.role, nextUser.role)
    setAuthReady(true)
  }, [])

  const login = (newToken: string, userData: Partial<User>) => {
    const payload = decodeSafe(newToken)
    if (!payload || isExpired(payload)) {
      // Si el token es inválido/expirado, limpio y no guardo nada
      logout()
      return
    }

    const merged: User = {
      id: userData.id,
      nombre: userData.nombre ?? '',
      apellido: userData.apellido ?? '',
      email: userData.email ?? '',
      distrito: userData.distrito,
      dni: payload.sub,
      role: toNormalizedRole(payload.role),
    }

    setToken(newToken)
    setUser(merged)
    localStorage.setItem(STORAGE_KEYS.token, newToken)
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(merged))
    localStorage.setItem(STORAGE_KEYS.role, merged.role)
  }

  const getAuthHeaders = () => {
    // fallback al token persistido para primeras llamadas mientras se hidrata
    const t = token ?? localStorage.getItem(STORAGE_KEYS.token)
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (t) headers['Authorization'] = `Bearer ${t}`
    return headers
  }

  // isAuthenticated sólo cuando hay token válido
  const isAuthenticated = useMemo(() => {
    const t = token ?? localStorage.getItem(STORAGE_KEYS.token)
    if (!t) return false
    const payload = decodeSafe(t)
    return !!payload && !isExpired(payload)
  }, [token])

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated,
    authReady,
    login,
    logout,
    getAuthHeaders,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
