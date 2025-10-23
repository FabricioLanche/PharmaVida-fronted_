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
      <main style={{ maxWidth: '780px', margin: '0 auto', padding: '1.7rem' }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            padding: '0.45rem 0.9rem',
            backgroundColor: '#95a5a6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginBottom: '1.7rem',
            fontSize: '0.95rem'
          }}>
          ← Volver
        </button>

        <div style={{
          backgroundColor: 'white',
          border: '1px solid #ddd',
          borderRadius: '8px',
          padding: '1.7rem'
        }}>
          <h1 style={{ marginTop: 0, color: '#2c3e50', fontSize: '1.9rem' }}>
            {producto.nombre}
          </h1>

          <div style={{
            display: 'inline-block',
            backgroundColor: '#3498db',
            color: 'white',
            padding: '0.4rem 0.85rem',
            borderRadius: '4px',
            marginBottom: '1.3rem',
            fontSize: '0.9rem'
          }}>
            {producto.tipo}
          </div>

          <div style={{
            fontSize: '2.1rem',
            fontWeight: 'bold',
            color: '#27ae60',
            marginBottom: '1.3rem'
          }}>
            S/ {producto.precio.toFixed(2)}
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '0.85rem',
            marginBottom: '1.7rem'
          }}>
            <div style={{
              backgroundColor: '#f8f9fa',
              padding: '0.85rem',
              borderRadius: '6px'
            }}>
              <strong style={{ fontSize: '0.95rem' }}>Stock Disponible:</strong>
              <p style={{
                fontSize: '1.3rem',
                color: producto.stock > 0 ? '#27ae60' : '#e74c3c',
                margin: '0.4rem 0 0 0'
              }}>
                {producto.stock} unidades
              </p>
            </div>

            <div style={{
              backgroundColor: '#f8f9fa',
              padding: '0.85rem',
              borderRadius: '6px'
            }}>
              <strong style={{ fontSize: '0.95rem' }}>Requiere Receta:</strong>
              <p style={{
                fontSize: '1.3rem',
                color: producto.requiere_receta ? '#f39c12' : '#27ae60',
                margin: '0.4rem 0 0 0'
              }}>
                {producto.requiere_receta ? '⚕️ Sí' : '✓ No'}
              </p>
            </div>
          </div>

          <div style={{
            borderTop: '1px solid #ddd',
            paddingTop: '1.3rem',
            marginTop: '1.3rem'
          }}>
            <h3 style={{ fontSize: '1.1rem' }}>Información adicional</h3>
            <p style={{ fontSize: '0.95rem' }}><strong>ID:</strong> {producto.id}</p>
            <p style={{ fontSize: '0.95rem' }}><strong>Fecha de creación:</strong> {new Date(producto.fecha_creacion).toLocaleDateString('es-PE')}</p>
            <p style={{ fontSize: '0.95rem' }}><strong>Última actualización:</strong> {new Date(producto.fecha_actualizacion).toLocaleDateString('es-PE')}</p>
          </div>

          <div style={{ marginTop: '1.7rem', marginBottom: '0.85rem' }}>
            <label style={{ fontSize: '1rem', fontWeight: 'bold' }}>Cantidad: </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginTop: '0.45rem' }}>
              <button
                onClick={() => setCantidad(Math.max(1, cantidad - 1))}
                disabled={producto.stock === 0 || cantidad <= 1}
                style={{
                  padding: '0.45rem 0.85rem',
                  fontSize: '1.1rem',
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
                  width: '70px', 
                  padding: '0.45rem', 
                  textAlign: 'center',
                  fontSize: '1rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              />
              <button
                onClick={() => setCantidad(Math.min(producto.stock, cantidad + 1))}
                disabled={producto.stock === 0 || cantidad >= producto.stock}
                style={{
                  padding: '0.45rem 0.85rem',
                  fontSize: '1.1rem',
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
              padding: '0.85rem',
              backgroundColor: producto.stock === 0 ? '#ccc' : '#27ae60',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: producto.stock === 0 ? 'not-allowed' : 'pointer',
              marginTop: '0.85rem'
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