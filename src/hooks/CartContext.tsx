import { createContext, useContext, useState, type ReactNode } from 'react'

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

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  const addToCart = (productoId: number, cantidad: number, nombre?: string, precio?: number) => {
    setItems(prev => {
      const existing = prev.find(item => item.productoId === productoId)
      if (existing) {
        return prev.map(item =>
          item.productoId === productoId
            ? { ...item, cantidad: item.cantidad + cantidad }
            : item
        )
      }
      return [...prev, { productoId, cantidad, nombre, precio }]
    })
  }

  const removeFromCart = (productoId: number) => {
    setItems(prev => prev.filter(item => item.productoId !== productoId))
  }

  const updateQuantity = (productoId: number, cantidad: number) => {
    if (cantidad <= 0) {
      removeFromCart(productoId)
      return
    }
    setItems(prev =>
      prev.map(item =>
        item.productoId === productoId ? { ...item, cantidad } : item
      )
    )
  }

  const clearCart = () => {
    setItems([])
  }

  const getTotalItems = () => {
    return items.reduce((sum, item) => sum + item.cantidad, 0)
  }

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, getTotalItems }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within CartProvider')
  }
  return context
}
