// src/hooks/CartContext.tsx
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useAuth } from './AuthContext'

interface CartItem {
  productoId: number
  cantidad: number
  nombre?: string
  precio?: number
}

interface CartContextType {
  items: CartItem[]
  addToCart: (productoId: number, cantidad: number, nombre?: string, precio?: number) => void
  removeFromCart: (productoId: number) => void
  updateQuantity: (productoId: number, cantidad: number) => void
  clearCart: () => void
  getTotalItems: () => number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const STORAGE_BASE = 'pv_cart_v1'
const keyFor = (dni?: string | null) => (dni ? `${STORAGE_BASE}:${dni}` : STORAGE_BASE)

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()

  // 1) Cargar estado inicial desde localStorage (clave global primero)
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const raw = localStorage.getItem(keyFor(null))
      return raw ? JSON.parse(raw) as CartItem[] : []
    } catch {
      return []
    }
  })

  // 2) Cuando hay usuario, migrar carrito global -> carrito del usuario si aún no existe
  useEffect(() => {
    const dni = user?.dni ?? null
    if (!dni) return

    const userKey = keyFor(dni)
    const globalKey = keyFor(null)

    try {
      const userRaw = localStorage.getItem(userKey)
      if (userRaw) {
        // ya había carrito del usuario → úsalo
        setItems(JSON.parse(userRaw))
        return
      }
      const globalRaw = localStorage.getItem(globalKey)
      if (globalRaw) {
        // migra lo global al carrito del usuario
        localStorage.setItem(userKey, globalRaw)
        localStorage.removeItem(globalKey)
        setItems(JSON.parse(globalRaw))
      }
    } catch {
      // ignora errores de parse
    }
  }, [user?.dni])

  // 3) Guardar cambios del carrito en localStorage (por usuario si existe)
  useEffect(() => {
    try {
      const dni = user?.dni ?? null
      localStorage.setItem(keyFor(dni), JSON.stringify(items))
    } catch {
      // almacenamiento lleno o deshabilitado
    }
  }, [items, user?.dni])

  // 4) Sincronizar entre pestañas (si se modifica desde otra pestaña)
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      const dni = user?.dni ?? null
      if (e.key === keyFor(dni) && e.newValue) {
        try {
          setItems(JSON.parse(e.newValue))
        } catch {
          /* noop */
        }
      }
    }
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [user?.dni])

  const addToCart = (productoId: number, cantidad: number, nombre?: string, precio?: number) => {
    setItems(prev => {
      const existing = prev.find(i => i.productoId === productoId)
      if (existing) {
        return prev.map(i =>
          i.productoId === productoId ? { ...i, cantidad: i.cantidad + cantidad } : i
        )
      }
      return [...prev, { productoId, cantidad, nombre, precio }]
    })
  }

  const removeFromCart = (productoId: number) => {
    setItems(prev => prev.filter(i => i.productoId !== productoId))
  }

  const updateQuantity = (productoId: number, cantidad: number) => {
    if (cantidad <= 0) return removeFromCart(productoId)
    setItems(prev =>
      prev.map(i => (i.productoId === productoId ? { ...i, cantidad } : i))
    )
  }

  const clearCart = () => {
    setItems([])
    try {
      const dni = user?.dni ?? null
      localStorage.removeItem(keyFor(dni))
    } catch {
      /* noop */
    }
  }

  const getTotalItems = () =>
    items.reduce((sum, i) => sum + (Number(i.cantidad) || 0), 0)

  const value = useMemo<CartContextType>(() => ({
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalItems,
  }), [items])

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
