import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/AuthContext'
import { useCart } from '../hooks/CartContext'
import Navbar from '../components/commons/Navbar'
import Footer from '../components/commons/Footer'
import { orquestadorService } from '../services/orquestador/orquestadorAPI'

function Checkout() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { items, clearCart } = useCart()
  const [procesando, setProcesando] = useState(false)

  const total = items.reduce((sum, item) => sum + (item.precio || 0) * item.cantidad, 0)

  const handleComprar = async () => {
    if (!user?.dni) {
      alert('Error: Usuario no identificado')
      return
    }

    setProcesando(true)
    try {
      const productos = items.map(item => item.productoId)
      const cantidades = items.map(item => item.cantidad)

      // El backend espera usuarioId (number), no dni
      // Necesitas obtener el ID del usuario desde el contexto
      if (!user?.id) {
        alert('Error: No se pudo obtener el ID del usuario')
        return
      }

      await orquestadorService.registrarCompra({
        dni: user.dni,
        productos,
        cantidades
      })

      alert('✅ Compra realizada exitosamente')
      clearCart()
      navigate('/mis-compras')
    } catch (error: any) {
      console.error('Error en compra:', error)
      
      // Manejar error de productos que requieren receta
      if (error.response?.status === 400 && error.response?.data?.details?.productos_sin_receta) {
        const productosConReceta = error.response.data.details.productos_sin_receta.join(', ')
        alert(
          `⚠️ Atención: Los siguientes productos requieren receta médica validada:\n\n` +
          `${productosConReceta}\n\n` +
          `Por favor, sube una receta médica válida en la sección "Mis Recetas" antes de continuar con la compra.`
        )
        const subirReceta = confirm('¿Deseas ir a la sección de recetas ahora?')
        if (subirReceta) {
          navigate('/recetas')
        }
      } else {
        alert(`❌ Error al procesar la compra: ${error.response?.data?.error || error.message}`)
      }
    } finally {
      setProcesando(false)
    }
  }

  if (items.length === 0) {
    return (
      <div>
        <Navbar />
        <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
          <h1>Checkout</h1>
          <p>No hay productos en el carrito</p>
          <button onClick={() => navigate('/')}>Ver productos</button>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div>
      <Navbar />
      
      <main style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
        <h1>Resumen de Compra</h1>

        <section style={{ border: '1px solid #ddd', padding: '1rem', marginBottom: '2rem' }}>
          <h2>Datos del Cliente</h2>
          <p><strong>Nombre:</strong> {user?.nombre} {user?.apellido}</p>
          <p><strong>DNI:</strong> {user?.dni}</p>
          <p><strong>Email:</strong> {user?.email}</p>
        </section>

        <section style={{ border: '1px solid #ddd', padding: '1rem', marginBottom: '2rem' }}>
          <h2>Productos</h2>
          <table border={1} style={{ width: '100%' }}>
            <thead>
              <tr>
                <th>Producto</th>
                <th>Precio</th>
                <th>Cantidad</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.productoId}>
                  <td>{item.nombre || `Producto #${item.productoId}`}</td>
                  <td>S/ {(item.precio || 0).toFixed(2)}</td>
                  <td>{item.cantidad}</td>
                  <td>S/ {((item.precio || 0) * item.cantidad).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section style={{ textAlign: 'right', marginBottom: '2rem' }}>
          <h2>Total a Pagar: S/ {total.toFixed(2)}</h2>
        </section>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
          <button 
            onClick={() => navigate('/carrito')}
            disabled={procesando}
            style={{ padding: '0.75rem 1.5rem' }}
          >
            Volver al Carrito
          </button>
          <button 
            onClick={handleComprar}
            disabled={procesando}
            style={{ 
              padding: '0.75rem 2rem', 
              backgroundColor: procesando ? '#ccc' : '#27ae60', 
              color: 'white', 
              border: 'none',
              cursor: procesando ? 'not-allowed' : 'pointer',
              fontSize: '1.1rem',
              fontWeight: 'bold'
            }}
          >
            {procesando ? 'Procesando...' : '✓ Confirmar Compra'}
          </button>
        </div>

        <p style={{ marginTop: '2rem', fontSize: '0.9rem', color: '#666' }}>
          Nota: Si algún producto requiere receta, el sistema verificará automáticamente que tengas una receta válida.
        </p>
      </main>

      <Footer />
    </div>
  )
}

export default Checkout
