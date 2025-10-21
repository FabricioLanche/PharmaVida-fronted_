import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Navbar from '../components/commons/Navbar'
import Footer from '../components/commons/Footer'
import { productosService } from '../services/productos_y_ofertas/productosAPI'
import { type Producto } from '../types/producto.types'
import { useCart } from '../hooks/CartContext'

function ProductoDetalle() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [producto, setProducto] = useState<Producto | null>(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart()
  const [cantidad, setCantidad] = useState(1)

  useEffect(() => {
    if (id) {
      cargarProducto(Number(id));
    }
  }, [id]);

  const cargarProducto = async (productoId: number) => {
    setLoading(true);
    try {
      const response = await productosService.obtenerPorId(productoId);
      setProducto(response.data);
    } catch (error) {
      console.error('Error al cargar producto:', error);
      alert('Error al cargar el producto');
    } finally {
      setLoading(false);
    }
  };

  const handleAgregarCarrito = () => {
    if (!producto) return
    addToCart(producto.id, cantidad, producto.nombre, producto.precio)
    alert(`✅ ${cantidad} unidad(es) de ${producto.nombre} agregadas al carrito`)
    setCantidad(1) // Resetear cantidad después de agregar
  }

  if (loading) {
    return (
      <div>
        <Navbar />
        <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem', textAlign: 'center' }}>
          <p>Cargando producto...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!producto) {
    return (
      <div>
        <Navbar />
        <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem', textAlign: 'center' }}>
          <h2>Producto no encontrado</h2>
          <button
            onClick={() => navigate('/')} 
            style={{
              padding: '0.75rem 2rem',
              backgroundColor: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginTop: '1rem'
            }}>
            Volver al inicio
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div>
      <Navbar />

      <main style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            padding: '0.5rem 1rem',
            backgroundColor: '#95a5a6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginBottom: '2rem'
          }}>
          ← Volver
        </button>

        <div style={{
          backgroundColor: 'white',
          border: '1px solid #ddd',
          borderRadius: '8px',
          padding: '2rem'
        }}>
          <h1 style={{ marginTop: 0, color: '#2c3e50' }}>
            {producto.nombre}
          </h1>

          <div style={{
            display: 'inline-block',
            backgroundColor: '#3498db',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '4px',
            marginBottom: '1.5rem'
          }}>
            {producto.tipo}
          </div>

          <div style={{
            fontSize: '2.5rem',
            fontWeight: 'bold',
            color: '#27ae60',
            marginBottom: '1.5rem'
          }}>
            S/ {producto.precio.toFixed(2)}
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem'
          }}>
            <div style={{
              backgroundColor: '#f8f9fa',
              padding: '1rem',
              borderRadius: '6px'
            }}>
              <strong>Stock Disponible:</strong>
              <p style={{
                fontSize: '1.5rem',
                color: producto.stock > 0 ? '#27ae60' : '#e74c3c',
                margin: '0.5rem 0 0 0'
              }}>
                {producto.stock} unidades
              </p>
            </div>

            <div style={{
              backgroundColor: '#f8f9fa',
              padding: '1rem',
              borderRadius: '6px'
            }}>
              <strong>Requiere Receta:</strong>
              <p style={{
                fontSize: '1.5rem',
                color: producto.requiere_receta ? '#f39c12' : '#27ae60',
                margin: '0.5rem 0 0 0'
              }}>
                {producto.requiere_receta ? '⚕️ Sí' : '✓ No'}
              </p>
            </div>
          </div>

          <div style={{
            borderTop: '1px solid #ddd',
            paddingTop: '1.5rem',
            marginTop: '1.5rem'
          }}>
            <h3>Información adicional</h3>
            <p><strong>ID:</strong> {producto.id}</p>
            <p><strong>Fecha de creación:</strong> {new Date(producto.fecha_creacion).toLocaleDateString('es-PE')}</p>
            <p><strong>Última actualización:</strong> {new Date(producto.fecha_actualizacion).toLocaleDateString('es-PE')}</p>
          </div>

          <div style={{ marginTop: '2rem', marginBottom: '1rem' }}>
            <label style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>Cantidad: </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button
                onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                disabled={producto.stock === 0 || cantidad <= 1}
                style={{
                  padding: '0.5rem 1rem',
                  fontSize: '1.2rem',
                  cursor: producto.stock === 0 || cantidad <= 1 ? 'not-allowed' : 'pointer',
                  backgroundColor: '#f0f0f0',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              >
                -
              </button>
              <input 
                type="number" 
                min="1" 
                max={producto.stock}
                value={cantidad}
                onChange={(e) => setCantidad(Math.max(1, Math.min(producto.stock, Number(e.target.value))))}
                disabled={producto.stock === 0}
                style={{ 
                  width: '80px', 
                  padding: '0.5rem', 
                  textAlign: 'center',
                  fontSize: '1.1rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              />
              <button
                onClick={() => setCantidad(Math.min(producto.stock, cantidad + 1))}
                disabled={producto.stock === 0 || cantidad >= producto.stock}
                style={{
                  padding: '0.5rem 1rem',
                  fontSize: '1.2rem',
                  cursor: producto.stock === 0 || cantidad >= producto.stock ? 'not-allowed' : 'pointer',
                  backgroundColor: '#f0f0f0',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              >
                +
              </button>
            </div>
          </div>

          <button
            onClick={handleAgregarCarrito}
            disabled={producto.stock === 0}
            style={{
              width: '100%',
              padding: '1rem',
              backgroundColor: producto.stock === 0 ? '#ccc' : '#27ae60',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              cursor: producto.stock === 0 ? 'not-allowed' : 'pointer',
              marginTop: '1rem'
            }}>
            {producto.stock === 0 ? 'Sin Stock' : '🛒 Agregar al Carrito'}
          </button>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default ProductoDetalle
