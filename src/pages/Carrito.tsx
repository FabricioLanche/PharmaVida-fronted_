// src/pages/Carrito.tsx
import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Navbar from '../components/commons/Navbar'
import Footer from '../components/commons/Footer'
import { useCart } from '../hooks/CartContext'

type CartItem = {
  id?: number
  productoId?: number
  nombre: string
  precio: number
  requiere_receta?: boolean
  cantidad: number
}

export default function Carrito() {
  const navigate = useNavigate()
  const cart = useCart() as any
  const items: CartItem[] = cart.items || cart.cart || []

  const updateQuantity =
    cart.updateQuantity || cart.setQuantity || ((_id: number, _q: number) => {})
  const removeOne =
    cart.removeFromCart || cart.removeItem || ((_id: number) => {})

  const getPid = (it: CartItem) => (it.productoId ?? it.id) as number

  const total: number = useMemo(() => {
    if (typeof cart.total === 'number') return cart.total
    return (items || []).reduce(
      (acc: number, it: CartItem) => acc + Number(it.precio) * Number(it.cantidad),
      0
    )
  }, [items, cart.total])

  const handlePagar = () => {
    // <- ¡esto faltaba!
    navigate('/checkout')
  }

  return (
    <div>
      <Navbar />

      <main className="container-xl">
        <section className="pv-card p-4 mb-6">
          <h2 className="title-xl">Mi Carrito</h2>

          <div className="cart-list">
            {(!items || items.length === 0) && (
              <p className="text-center">
                Tu carrito está vacío.{' '}
                <Link to="/" className="pv-link">Ir a comprar</Link>
              </p>
            )}

            {items?.map((it) => {
              const pid = getPid(it)
              return (
                <div key={pid} className="cart-item">
                  <div className="item-info">
                    <h4 className="item-title">{it.nombre}</h4>
                    <div className="item-meta">Precio: S/ {Number(it.precio).toFixed(2)}</div>
                    <div className="item-meta">Requiere receta: {it.requiere_receta ? 'Sí' : 'No'}</div>
                  </div>

                  <div className="item-actions">
                    <input
                      type="number"
                      min={1}
                      className="qty-input"
                      value={it.cantidad}
                      onChange={(e) =>
                        updateQuantity(pid, Math.max(1, Number(e.target.value)))
                      }
                    />
                    <button className="btn btn-danger-outline" onClick={() => removeOne(pid)}>
                      Eliminar
                    </button>
                  </div>
                </div>
              )
            })}
          </div>

          {items?.length > 0 && (
            <>
              <div className="cart-total">Total: S/ {total.toFixed(2)}</div>

              <div className="cart-actions">
                <button className="btn btn-primary" onClick={handlePagar}>
                  Proceder a pagar
                </button>
                <button className="btn btn-outline" onClick={() => navigate('/')}>
                  Seguir comprando
                </button>
              </div>
            </>
          )}
        </section>
      </main>

      <Footer />
    </div>
  )
}
