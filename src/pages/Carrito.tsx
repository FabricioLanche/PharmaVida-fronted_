import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/AuthContext'
import { useCart } from '../hooks/CartContext'
import Navbar from '../components/commons/Navbar'
import Footer from '../components/commons/Footer'

function Carrito() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { items, updateQuantity, removeFromCart, clearCart } = useCart()

  const total = items.reduce((sum, item) => sum + (item.precio || 0) * item.cantidad, 0)

  const handleProcederCompra = () => {
    if (!isAuthenticated) {
      alert('Debes iniciar sesión para realizar la compra')
      navigate('/login')
    } else {
      navigate('/checkout')
    }
  }

  return (
    <div>
      <Navbar />
      
      <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
        <h1>Carrito de Compras</h1>

        {items.length === 0 ? (
          <div>
            <p>Tu carrito está vacío</p>
            <button onClick={() => navigate('/')}>Ver productos</button>
          </div>
        ) : (
          <div>
            <table border={1} style={{ width: '100%', marginBottom: '2rem' }}>
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>Precio</th>
                  <th>Cantidad</th>
                  <th>Subtotal</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.productoId}>
                    <td>{item.nombre || `Producto #${item.productoId}`}</td>
                    <td>S/ {(item.precio || 0).toFixed(2)}</td>
                    <td>
                      <input 
                        type="number" 
                        min="1" 
                        value={item.cantidad}
                        onChange={(e) => updateQuantity(item.productoId, Number(e.target.value))}
                        style={{ width: '60px', padding: '0.25rem' }}
                      />
                    </td>
                    <td>S/ {((item.precio || 0) * item.cantidad).toFixed(2)}</td>
                    <td>
                      <button onClick={() => removeFromCart(item.productoId)}>Eliminar</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div style={{ textAlign: 'right', marginBottom: '2rem' }}>
              <h2>Total: S/ {total.toFixed(2)}</h2>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button onClick={clearCart} style={{ padding: '0.75rem 1.5rem' }}>
                Vaciar Carrito
              </button>
              <button onClick={() => navigate('/')} style={{ padding: '0.75rem 1.5rem' }}>
                Seguir Comprando
              </button>
              <button 
                onClick={handleProcederCompra}
                style={{ 
                  padding: '0.75rem 1.5rem', 
                  backgroundColor: '#27ae60', 
                  color: 'white', 
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Proceder a Comprar
              </button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}

export default Carrito
