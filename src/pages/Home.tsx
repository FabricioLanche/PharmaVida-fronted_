import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/AuthContext'
import Navbar from '../components/commons/Navbar'
import Footer from '../components/commons/Footer'
import ProductoCard from '../components/productos/ProductoCard'
import Paginacion from '../components/commons/Paginacion'
import { productosService } from '../services/productos_y_ofertas/productosAPI'
import { type ProductosResponse, type ProductosFiltros, TIPOS_PRODUCTOS } from '../types/producto.types'

function Home() {
  const { user, isAuthenticated } = useAuth()
  const [productosData, setProductosData] = useState<ProductosResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [filtros, setFiltros] = useState<ProductosFiltros>({
    page: 1,
    pagesize: 25
  })
  const [busqueda, setBusqueda] = useState('')

  useEffect(() => {
    cargarProductos()
  }, [filtros])

  const cargarProductos = async () => {
    setLoading(true)
    try {
      const response = await productosService.listar(filtros)
      setProductosData(response.data)
    } catch (error) {
      console.error('Error al cargar productos:', error)
      alert('Error al cargar productos')
    } finally {
      setLoading(false)
    }
  }

  const handleFiltroChange = (key: keyof ProductosFiltros, value: any) => {
    // Limpiar otros filtros cuando se selecciona uno nuevo
    const nuevosFiltros: ProductosFiltros = { page: 1, pagesize: 25 }
    if (value !== undefined && value !== '') {
      nuevosFiltros[key] = value
    }
    setFiltros(nuevosFiltros)
    setBusqueda('') // Limpiar búsqueda también
  }

  const handleBuscar = (e: React.FormEvent) => {
    e.preventDefault()
    if (busqueda.trim()) {
      setFiltros({ nombre: busqueda, page: 1, pagesize: 25 })
    }
  }

  // Determinar qué filtro está activo
  const filtroActivo = filtros.nombre ? 'nombre' 
    : filtros.tipo ? 'tipo'
    : filtros.requiere_receta !== undefined ? 'receta'
    : filtros.stock_min !== undefined ? 'stock'
    : 'ninguno'

  const handlePageChange = (page: number) => {
    setFiltros({ ...filtros, page })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const totalPages = productosData 
    ? Math.ceil(productosData.total / productosData.pagesize)
    : 0

  return (
    <div>
      <Navbar />
      
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        <h1 style={{ textAlign: 'center', color: '#2c3e50', marginBottom: '1rem' }}>
          Bienvenido a PharmaVida
        </h1>
        
        {isAuthenticated && user && (
          <p style={{ textAlign: 'center', color: '#666', marginBottom: '2rem' }}>
            Hola {user.nombre} {user.apellido}
          </p>
        )}

        {/* Indicador de filtro activo */}
        {filtroActivo !== 'ninguno' && (
          <div style={{
            backgroundColor: '#3498db',
            color: 'white',
            padding: '0.75rem',
            borderRadius: '6px',
            marginBottom: '1rem',
            textAlign: 'center',
            fontSize: '0.9rem'
          }}>
            ℹ️ <strong>Filtro activo:</strong> {
              filtroActivo === 'nombre' ? `Búsqueda: "${filtros.nombre}"` :
              filtroActivo === 'tipo' ? `Tipo: ${filtros.tipo}` :
              filtroActivo === 'receta' ? `Requiere receta: ${filtros.requiere_receta ? 'Sí' : 'No'}` :
              filtroActivo === 'stock' ? `Stock mínimo: ${filtros.stock_min}` : ''
            }
            {' '}(Solo puedes usar un filtro a la vez)
          </div>
        )}

        {/* Buscador */}
        <form onSubmit={handleBuscar} style={{ marginBottom: '2rem' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '0.5rem', 
              fontWeight: 'bold',
              color: filtroActivo !== 'ninguno' && filtroActivo !== 'nombre' ? '#999' : '#2c3e50'
            }}>
              🔍 Buscar por nombre
              {filtroActivo !== 'ninguno' && filtroActivo !== 'nombre' && (
                <span style={{ fontSize: '0.85rem', marginLeft: '0.5rem', fontWeight: 'normal' }}>
                  (Desactiva otros filtros primero)
                </span>
              )}
            </label>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                placeholder="Buscar productos por nombre..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                disabled={filtroActivo !== 'ninguno' && filtroActivo !== 'nombre'}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem',
                  opacity: (filtroActivo !== 'ninguno' && filtroActivo !== 'nombre') ? 0.5 : 1,
                  cursor: (filtroActivo !== 'ninguno' && filtroActivo !== 'nombre') ? 'not-allowed' : 'text'
                }}
              />
              <button
                type="submit"
                disabled={!busqueda.trim() || (filtroActivo !== 'ninguno' && filtroActivo !== 'nombre')}
                style={{
                  padding: '0.75rem 2rem',
                  backgroundColor: (!busqueda.trim() || (filtroActivo !== 'ninguno' && filtroActivo !== 'nombre')) ? '#95a5a6' : '#3498db',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: (!busqueda.trim() || (filtroActivo !== 'ninguno' && filtroActivo !== 'nombre')) ? 'not-allowed' : 'pointer',
                  fontSize: '1rem'
                }}
              >
                Buscar
              </button>
            </div>
          </div>
        </form>

        {/* Filtros */}
        <div style={{
          backgroundColor: '#f8f9fa',
          padding: '1.5rem',
          borderRadius: '8px',
          marginBottom: '2rem'
        }}>
          <h3 style={{ marginTop: 0 }}>
            Filtros Avanzados
            <span style={{ fontSize: '0.85rem', fontWeight: 'normal', marginLeft: '0.5rem', color: '#666' }}>
              (Solo puedes usar un filtro a la vez)
            </span>
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                fontWeight: 'bold',
                color: filtroActivo !== 'ninguno' && filtroActivo !== 'tipo' ? '#999' : '#2c3e50'
              }}>
                Tipo de Producto
                {filtroActivo !== 'ninguno' && filtroActivo !== 'tipo' && (
                  <span style={{ fontSize: '0.75rem', marginLeft: '0.5rem', fontWeight: 'normal' }}>
                    (Deshabilitado)
                  </span>
                )}
              </label>
              <select
                value={filtros.tipo || ''}
                onChange={(e) => handleFiltroChange('tipo', e.target.value || undefined)}
                disabled={filtroActivo !== 'ninguno' && filtroActivo !== 'tipo'}
                style={{ 
                  width: '100%', 
                  padding: '0.5rem', 
                  borderRadius: '4px', 
                  border: '1px solid #ddd',
                  opacity: (filtroActivo !== 'ninguno' && filtroActivo !== 'tipo') ? 0.5 : 1,
                  cursor: (filtroActivo !== 'ninguno' && filtroActivo !== 'tipo') ? 'not-allowed' : 'pointer'
                }}
              >
                <option value="">Todos</option>
                {TIPOS_PRODUCTOS.map(tipo => (
                  <option key={tipo} value={tipo}>{tipo}</option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                fontWeight: 'bold',
                color: filtroActivo !== 'ninguno' && filtroActivo !== 'receta' ? '#999' : '#2c3e50'
              }}>
                Requiere Receta
                {filtroActivo !== 'ninguno' && filtroActivo !== 'receta' && (
                  <span style={{ fontSize: '0.75rem', marginLeft: '0.5rem', fontWeight: 'normal' }}>
                    (Deshabilitado)
                  </span>
                )}
              </label>
              <select
                value={filtros.requiere_receta === undefined ? '' : String(filtros.requiere_receta)}
                onChange={(e) => handleFiltroChange('requiere_receta', e.target.value === '' ? undefined : e.target.value === 'true')}
                disabled={filtroActivo !== 'ninguno' && filtroActivo !== 'receta'}
                style={{ 
                  width: '100%', 
                  padding: '0.5rem', 
                  borderRadius: '4px', 
                  border: '1px solid #ddd',
                  opacity: (filtroActivo !== 'ninguno' && filtroActivo !== 'receta') ? 0.5 : 1,
                  cursor: (filtroActivo !== 'ninguno' && filtroActivo !== 'receta') ? 'not-allowed' : 'pointer'
                }}
              >
                <option value="">Todos</option>
                <option value="true">Sí</option>
                <option value="false">No</option>
              </select>
            </div>

            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '0.5rem', 
                fontWeight: 'bold',
                color: filtroActivo !== 'ninguno' && filtroActivo !== 'stock' ? '#999' : '#2c3e50'
              }}>
                Stock Mínimo
                {filtroActivo !== 'ninguno' && filtroActivo !== 'stock' && (
                  <span style={{ fontSize: '0.75rem', marginLeft: '0.5rem', fontWeight: 'normal' }}>
                    (Deshabilitado)
                  </span>
                )}
              </label>
              <input
                type="number"
                min="0"
                value={filtros.stock_min || ''}
                onChange={(e) => handleFiltroChange('stock_min', e.target.value ? Number(e.target.value) : undefined)}
                disabled={filtroActivo !== 'ninguno' && filtroActivo !== 'stock'}
                style={{ 
                  width: '100%', 
                  padding: '0.5rem', 
                  borderRadius: '4px', 
                  border: '1px solid #ddd',
                  opacity: (filtroActivo !== 'ninguno' && filtroActivo !== 'stock') ? 0.5 : 1,
                  cursor: (filtroActivo !== 'ninguno' && filtroActivo !== 'stock') ? 'not-allowed' : 'text'
                }}
                placeholder="Ej: 10"
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button
                onClick={() => {
                  setFiltros({ page: 1, pagesize: 25 })
                  setBusqueda('')
                }}
                disabled={filtroActivo === 'ninguno'}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  backgroundColor: filtroActivo === 'ninguno' ? '#95a5a6' : '#e74c3c',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: filtroActivo === 'ninguno' ? 'not-allowed' : 'pointer',
                  opacity: filtroActivo === 'ninguno' ? 0.6 : 1
                }}
              >
                {filtroActivo === 'ninguno' ? '✓ Sin Filtros' : '✕ Limpiar Filtro'}
              </button>
            </div>
          </div>
        </div>

        {/* Resultados */}
        {loading ? (
          <p style={{ textAlign: 'center', fontSize: '1.2rem' }}>Cargando productos...</p>
        ) : productosData ? (
          <>
            <p style={{ marginBottom: '1rem', color: '#666' }}>
              Mostrando {productosData.productos.length} de {productosData.total} productos
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
              gap: '1.5rem',
              marginBottom: '2rem'
            }}>
              {productosData.productos.map(producto => (
                <ProductoCard key={producto.id} producto={producto} />
              ))}
            </div>

            {totalPages > 1 && (
              <Paginacion
                currentPage={productosData.page}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </>
        ) : (
          <p style={{ textAlign: 'center' }}>No se encontraron productos</p>
        )}
      </main>

      <Footer />
    </div>
  )
}

export default Home
