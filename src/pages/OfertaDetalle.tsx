import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import Navbar from '../components/commons/Navbar'
import Footer from '../components/commons/Footer'
import { ofertasService } from '../services/productos_y_ofertas/ofertasAPI'
import { productosService } from '../services/productos_y_ofertas/productosAPI'
import { type Oferta } from '../types/oferta.types'
import { type Producto } from '../types/producto.types'

function OfertaDetalle() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [oferta, setOferta] = useState<Oferta | null>(null)
  const [productos, setProductos] = useState<Map<number, Producto>>(new Map())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      cargarOferta(Number(id))
    }
  }, [id])

  const cargarOferta = async (ofertaId: number) => {
    setLoading(true)
    try {
      const response = await ofertasService.obtenerPorId(ofertaId)
      const ofertaData = response.data
      setOferta(ofertaData)

      // Cargar información de productos
      const productosMap = new Map<number, Producto>()
      for (const detalle of ofertaData.detalles) {
        try {
          const prodResponse = await productosService.obtenerPorId(detalle.producto_id)
          productosMap.set(detalle.producto_id, prodResponse.data)
        } catch (error) {
          console.error(`Error al cargar producto ${detalle.producto_id}:`, error)
        }
      }
      setProductos(productosMap)
    } catch (error) {
      console.error('Error al cargar oferta:', error)
      alert('Error al cargar la oferta')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div>
        <Navbar />
        <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem', textAlign: 'center' }}>
          <p>Cargando oferta...</p>
        </main>
        <Footer />
      </div>
    )
  }

  if (!oferta) {
    return (
      <div>
        <Navbar />
        <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem', textAlign: 'center' }}>
          <h2>Oferta no encontrada</h2>
          <button onClick={() => navigate('/ofertas')} style={{
            padding: '0.75rem 2rem',
            backgroundColor: '#3498db',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginTop: '1rem'
          }}>
            Ver todas las ofertas
          </button>
        </main>
        <Footer />
      </div>
    )
  }

  const fechaVencimiento = new Date(oferta.fecha_vencimiento)
  const hoy = new Date()
  const diasRestantes = Math.ceil((fechaVencimiento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))
  const estaVencida = diasRestantes < 0
  const proximaVencer = diasRestantes <= 7 && diasRestantes >= 0

  return (
    <div>
      <Navbar />
      
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        <button 
          onClick={() => navigate('/ofertas')}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#95a5a6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginBottom: '2rem'
          }}
        >
          ← Volver a ofertas
        </button>

        <div style={{
          backgroundColor: 'white',
          border: `2px solid ${estaVencida ? '#e74c3c' : '#f39c12'}`,
          borderRadius: '8px',
          padding: '2rem',
          marginBottom: '2rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h1 style={{ margin: 0, color: '#2c3e50' }}>
              🎁 Oferta #{oferta.id}
            </h1>
            <div style={{
              backgroundColor: estaVencida ? '#e74c3c' : proximaVencer ? '#e67e22' : '#27ae60',
              color: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '6px',
              fontWeight: 'bold'
            }}>
              {estaVencida ? '❌ Vencida' : proximaVencer ? '⏰ Por vencer' : '✨ Activa'}
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem'
          }}>
            <div style={{ backgroundColor: '#f8f9fa', padding: '1rem', borderRadius: '6px' }}>
              <strong>📅 Fecha de vencimiento:</strong>
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '1.2rem' }}>
                {fechaVencimiento.toLocaleDateString('es-PE')}
              </p>
            </div>

            {!estaVencida && (
              <div style={{ backgroundColor: '#f8f9fa', padding: '1rem', borderRadius: '6px' }}>
                <strong>⏱️ Días restantes:</strong>
                <p style={{ 
                  margin: '0.5rem 0 0 0', 
                  fontSize: '1.2rem',
                  color: proximaVencer ? '#e67e22' : '#27ae60',
                  fontWeight: 'bold'
                }}>
                  {diasRestantes} días
                </p>
              </div>
            )}

            <div style={{ backgroundColor: '#f8f9fa', padding: '1rem', borderRadius: '6px' }}>
              <strong>📦 Productos en oferta:</strong>
              <p style={{ margin: '0.5rem 0 0 0', fontSize: '1.2rem' }}>
                {oferta.detalles.length}
              </p>
            </div>
          </div>
        </div>

        <h2 style={{ marginBottom: '1.5rem' }}>Productos en Oferta</h2>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '1.5rem'
        }}>
          {oferta.detalles.map(detalle => {
            const producto = productos.get(detalle.producto_id)
            
            if (!producto) {
              return (
                <div key={detalle.id} style={{
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '1rem',
                  backgroundColor: '#f8f9fa'
                }}>
                  <p>Cargando producto...</p>
                </div>
              )
            }

            const precioOriginal = producto.precio
            const precioConDescuento = precioOriginal * (1 - detalle.descuento / 100)
            const ahorro = precioOriginal - precioConDescuento

            return (
              <Link
                key={detalle.id}
                to={`/producto/${producto.id}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div style={{
                  border: '2px solid #f39c12',
                  borderRadius: '8px',
                  padding: '1.5rem',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  height: '100%'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)'
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(243, 156, 18, 0.3)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
                >
                  <div style={{
                    backgroundColor: '#f39c12',
                    color: 'white',
                    padding: '0.5rem',
                    borderRadius: '6px',
                    fontWeight: 'bold',
                    textAlign: 'center',
                    marginBottom: '1rem',
                    fontSize: '1.2rem'
                  }}>
                    🔥 {detalle.descuento.toFixed(1)}% OFF
                  </div>

                  <h3 style={{ margin: '0 0 1rem 0', color: '#2c3e50' }}>
                    {producto.nombre}
                  </h3>

                  <div style={{
                    display: 'inline-block',
                    backgroundColor: '#3498db',
                    color: 'white',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.85rem',
                    marginBottom: '1rem'
                  }}>
                    {producto.tipo}
                  </div>

                  <div style={{ marginBottom: '1rem' }}>
                    <p style={{ 
                      margin: '0',
                      fontSize: '1rem',
                      color: '#999',
                      textDecoration: 'line-through'
                    }}>
                      Antes: S/ {precioOriginal.toFixed(2)}
                    </p>
                    <p style={{ 
                      margin: '0.25rem 0',
                      fontSize: '1.8rem',
                      fontWeight: 'bold',
                      color: '#27ae60'
                    }}>
                      S/ {precioConDescuento.toFixed(2)}
                    </p>
                    <p style={{
                      margin: '0',
                      fontSize: '0.9rem',
                      color: '#e74c3c',
                      fontWeight: 'bold'
                    }}>
                      Ahorras: S/ {ahorro.toFixed(2)}
                    </p>
                  </div>

                  <p style={{ 
                    fontSize: '0.9rem',
                    color: producto.stock > 0 ? '#27ae60' : '#e74c3c',
                    margin: '0.5rem 0'
                  }}>
                    Stock: {producto.stock} unidades
                  </p>

                  {producto.requiere_receta && (
                    <div style={{
                      backgroundColor: '#f39c12',
                      color: 'white',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.85rem',
                      display: 'inline-block',
                      marginTop: '0.5rem'
                    }}>
                      ⚕️ Requiere Receta
                    </div>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default OfertaDetalle
