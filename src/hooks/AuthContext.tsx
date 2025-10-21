import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { jwtDecode } from 'jwt-decode'

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
  sub: string // DNI
  role: string
  iat: number
  exp: number
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (token: string, userData: User) => void
  logout: () => void
  isAuthenticated: boolean
  getAuthHeaders: () => Record<string, string>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('role')
  }

  useEffect(() => {
    const savedToken = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')
    
    if (savedToken && savedUser) {
      try {
        const decoded = jwtDecode<JWTPayload>(savedToken)
        
        const currentTime = Date.now() / 1000
        if (decoded.exp < currentTime) {
          logout()
          return
        }
        
        const userData = JSON.parse(savedUser)
        userData.role = decoded.role
        userData.dni = decoded.sub
        
        setToken(savedToken)
        setUser(userData)
        localStorage.setItem('role', decoded.role)
      } catch (error) {
        console.error('Error al decodificar token:', error)
        logout()
      }
    }
  }, [])

  const login = (newToken: string, userData: User) => {
    try {
      const decoded = jwtDecode<JWTPayload>(newToken)
      
      const userWithRole = {
        ...userData,
        role: decoded.role,
        dni: decoded.sub
      }
      
      setToken(newToken)
      setUser(userWithRole)
      localStorage.setItem('token', newToken)
      localStorage.setItem('user', JSON.stringify(userWithRole))
      localStorage.setItem('role', decoded.role)
    } catch (error) {
      console.error('Error al decodificar token en login:', error)
    }
  }

  const getAuthHeaders = () => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    
    return headers
  }

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token, getAuthHeaders }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
