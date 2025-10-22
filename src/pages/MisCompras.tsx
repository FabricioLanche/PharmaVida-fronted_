import { useState, useEffect } from 'react'
import { orquestadorService } from '../services/orquestador/orquestadorAPI'
import Navbar from '../components/commons/Navbar'
import Footer from '../components/commons/Footer'

interface ProductoDetalle {
  producto_id: number
  cantidad: number
  nombre: string
  precio: number
  tipo: string
  stock: number
}

interface Compra {
  id: number
  fechaCompra: string
  usuarioId: number
  productos: number[]
  cantidades: number[]
  productos_detalle: ProductoDetalle[]
}

function MisCompras() {
  const [compras, setCompras] = useState<Compra[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchMisCompras()
  }, [])

  const fetchMisCompras = async () => {
    try {
      setLoading(true)
      const response = await orquestadorService.listarMisComprasDetalladas()
      console.log('Respuesta de compras detalladas:', response.data)
      setCompras(response.data.compras)
      setError('')
    } catch (err: any) {
      console.error('Error al cargar compras:', err)
      setError(err.response?.data?.message || 'Error al cargar las compras')
    } finally {
      setLoading(false)
    }
  }

  const calcularTotal = (productos: ProductoDetalle[]) => {
    return productos.reduce((sum, prod) => sum + (prod.precio * prod.cantidad), 0)
  }

  return (
    <div>
      <Navbar />
      
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        <h1>Mis Compras</h1>

        {loading && <p>Cargando compras...</p>}
        
        {error && <div style={{ color: 'red', padding: '1rem', border: '1px solid red' }}>{error}</div>}

        {!loading && !error && compras.length === 0 && (
          <p>No tienes compras registradas aún.</p>
        )}

        {!loading && !error && compras.length > 0 && (
          <div>
            <p style={{ marginBottom: '2rem' }}>Total de compras: {compras.length}</p>
            
            {compras.map((compra) => (
              <div key={compra.id} style={{ border: '1px solid #ddd', padding: '1.5rem', marginBottom: '2rem' }}>
                <h3>Compra #{compra.id}</h3>
                <p><strong>Fecha:</strong> {new Date(compra.fechaCompra).toLocaleString()}</p>
                
                <h4 style={{ marginTop: '1rem' }}>Productos:</h4>
                <table border={1} style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f5f5f5' }}>
                      <th style={{ padding: '0.5rem' }}>Producto</th>
                      <th style={{ padding: '0.5rem' }}>Tipo</th>
                      <th style={{ padding: '0.5rem' }}>Cantidad</th>
                      <th style={{ padding: '0.5rem' }}>Precio Unitario</th>
                      <th style={{ padding: '0.5rem' }}>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {compra.productos_detalle.map((producto, index) => (
                      <tr key={index}>
                        <td style={{ padding: '0.5rem' }}>{producto.nombre}</td>
                        <td style={{ padding: '0.5rem' }}>{producto.tipo}</td>
                        <td style={{ padding: '0.5rem', textAlign: 'center' }}>{producto.cantidad}</td>
                        <td style={{ padding: '0.5rem', textAlign: 'right' }}>S/ {producto.precio.toFixed(2)}</td>
                        <td style={{ padding: '0.5rem', textAlign: 'right' }}>
                          S/ {(producto.precio * producto.cantidad).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ backgroundColor: '#f5f5f5', fontWeight: 'bold' }}>
                      <td colSpan={4} style={{ padding: '0.5rem', textAlign: 'right' }}>Total:</td>
                      <td style={{ padding: '0.5rem', textAlign: 'right' }}>
                        S/ {calcularTotal(compra.productos_detalle).toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  )
}

export default MisCompras
