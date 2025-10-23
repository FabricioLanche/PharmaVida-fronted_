import { useState, useEffect } from 'react'
import Navbar from '../components/commons/Navbar'
import Footer from '../components/commons/Footer'
import ProductoCard from '../components/productos/ProductoCard'
import { productosService } from '../services/productos_y_ofertas/productosAPI'
import { type ProductosResponse, type ProductosFiltros, TIPOS_PRODUCTOS } from '../types/producto.types'

function Home() {
  const [productosData, setProductosData] = useState<ProductosResponse | null>(null)
  const [loading, setLoading] = useState(false)

  // Filtros / búsqueda
  const [filtros, setFiltros] = useState<ProductosFiltros>({ page: 1, pagesize: 25 })
  const [busqueda, setBusqueda] = useState('')

  // UI: mostrar filtros cuando el usuario toca el buscador
  const [showFiltros, setShowFiltros] = useState(false)
  const [toggleVisible, setToggleVisible] = useState(false)

  useEffect(() => { cargarProductos() }, [filtros])

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

  // Solo un filtro activo a la vez
  const handleFiltroChange = (key: keyof ProductosFiltros, value: any) => {
    const nuevos: ProductosFiltros = { page: 1, pagesize: 25 }
    if (value !== undefined && value !== '') nuevos[key] = value
    setFiltros(nuevos)
    setBusqueda('')
  }

  const handleBuscar = (e: React.FormEvent) => {
    e.preventDefault()
    if (busqueda.trim()) {
      setFiltros({ nombre: busqueda.trim(), page: 1, pagesize: 25 })
    }
  }

  const filtroActivo =
    filtros.nombre ? 'nombre'
      : filtros.tipo ? 'tipo'
      : filtros.requiere_receta !== undefined ? 'receta'
      : filtros.stock_min !== undefined ? 'stock'
      : 'ninguno'

  // Paginación (para barra inferior)
  const totalPages   = productosData ? Math.ceil(productosData.total / productosData.pagesize) : 0
  const paginaActual = productosData?.page ?? filtros.page
  const hasPrev      = (paginaActual ?? 1) > 1
  const hasNext      = totalPages ? (paginaActual ?? 1) < totalPages : true
  const showTotal    = (paginaActual ?? 1) > 1

  const handlePageChange = (page: number) => {
    if (page < 1) return
    setFiltros({ ...filtros, page })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div>
      <Navbar />

      <main className="container-xl">
        <section className="pv-card p-4 mb-6">
          <h2 className="title-xl" style={{ marginBottom: '1.5rem' }}>Productos</h2>

          {/* Buscador */}
          <form onSubmit={handleBuscar} className="mb-3">
            <div style={{ 
              display: 'flex', 
              gap: '0.5rem',
              marginBottom: '1rem'
            }}>
              <input
                type="text"
                placeholder="Buscar por nombre"
                value={busqueda}
                onFocus={() => { setShowFiltros(true); setToggleVisible(true) }}
                onClick={() => { setShowFiltros(true); setToggleVisible(true) }}
                onChange={(e) => setBusqueda(e.target.value)}
                disabled={filtroActivo !== 'ninguno' && filtroActivo !== 'nombre'}
                style={{
                  flex: 1,
                  padding: '0.5rem 0.75rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '0.95rem',
                  opacity: (filtroActivo !== 'ninguno' && filtroActivo !== 'nombre') ? 0.6 : 1,
                  cursor: (filtroActivo !== 'ninguno' && filtroActivo !== 'nombre') ? 'not-allowed' : 'text'
                }}
              />
              <button
                type="submit"
                disabled={!busqueda.trim() || (filtroActivo !== 'ninguno' && filtroActivo !== 'nombre')}
                style={{
                  padding: '0.5rem 1.5rem',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: !busqueda.trim() || (filtroActivo !== 'ninguno' && filtroActivo !== 'nombre') ? 'not-allowed' : 'pointer',
                  fontSize: '0.95rem',
                  fontWeight: '500',
                  opacity: !busqueda.trim() || (filtroActivo !== 'ninguno' && filtroActivo !== 'nombre') ? 0.6 : 1
                }}
                onClick={() => setToggleVisible(true)}
              >
                Buscar
              </button>
              <button
                type="button"
                onClick={() => { setFiltros({ page: 1, pagesize: 25 }); setBusqueda('') }}
                style={{
                  padding: '0.5rem 1.5rem',
                  backgroundColor: '#ff8c00',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.95rem',
                  fontWeight: '500'
                }}
              >
                Refrescar
              </button>
            </div>
          </form>

          {/* Toggle filtros */}
          {toggleVisible && (
            <button
              type="button"
              className="toggle-filtros"
              onClick={() => setShowFiltros(v => !v)}
            >
              {showFiltros ? 'Ocultar filtros ▲' : 'Más filtros ▼'}
            </button>
          )}

          {/* Banner filtro activo */}
          {filtroActivo !== 'ninguno' && (
            <div className="banner-info mb-3">
              ℹ️ <strong>Filtro activo:</strong>{' '}
              {filtroActivo === 'nombre' ? `Búsqueda: "${filtros.nombre}"` :
                filtroActivo === 'tipo' ? `Tipo: ${filtros.tipo}` :
                filtroActivo === 'receta' ? `Requiere receta: ${filtros.requiere_receta ? 'Sí' : 'No'}` :
                filtroActivo === 'stock' ? `Stock mínimo: ${filtros.stock_min}` : ''}{' '}
              (Solo puedes usar un filtro a la vez)
            </div>
          )}

          {/* Panel filtros */}
          {showFiltros && (
            <div className="filter-panel mb-4">
              <h3 className="m-0">
                Filtros Avanzados
                <span className="hint"> (Solo puedes usar un filtro a la vez)</span>
              </h3>

              <div className="filters-grid">
                <div>
                  <label className="form-label d-block mb-2">
                    Tipo de Producto
                    {filtroActivo !== 'ninguno' && filtroActivo !== 'tipo' && <span className="hint"> (Deshabilitado)</span>}
                  </label>
                  <select
                    className="form-select"
                    value={filtros.tipo || ''}
                    onChange={(e) => handleFiltroChange('tipo', e.target.value || undefined)}
                    disabled={filtroActivo !== 'ninguno' && filtroActivo !== 'tipo'}
                  >
                    <option value="">Todos</option>
                    {TIPOS_PRODUCTOS.map(tipo => (
                      <option key={tipo} value={tipo}>{tipo}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label d-block mb-2">
                    Requiere Receta
                    {filtroActivo !== 'ninguno' && filtroActivo !== 'receta' && <span className="hint"> (Deshabilitado)</span>}
                  </label>
                  <select
                    className="form-select"
                    value={filtros.requiere_receta === undefined ? '' : String(filtros.requiere_receta)}
                    onChange={(e) => handleFiltroChange('requiere_receta', e.target.value === '' ? undefined : e.target.value === 'true')}
                    disabled={filtroActivo !== 'ninguno' && filtroActivo !== 'receta'}
                  >
                    <option value="">Todos</option>
                    <option value="true">Sí</option>
                    <option value="false">No</option>
                  </select>
                </div>

                <div>
                  <label className="form-label d-block mb-2">
                    Stock Mínimo
                    {filtroActivo !== 'ninguno' && filtroActivo !== 'stock' && <span className="hint"> (Deshabilitado)</span>}
                  </label>
                  <input
                    type="number"
                    min={0}
                    className="form-control"
                    placeholder="Ej: 10"
                    value={filtros.stock_min || ''}
                    onChange={(e) => handleFiltroChange('stock_min', e.target.value ? Number(e.target.value) : undefined)}
                    disabled={filtroActivo !== 'ninguno' && filtroActivo !== 'stock'}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Tarjetas de productos - DISEÑO DE LISTA */}
          {loading ? (
            <p className="text-center text-lg">Cargando productos...</p>
          ) : productosData ? (
            <>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '4.5rem 1.5rem',
                marginBottom: '2rem'
              }}>
                {productosData.productos.map((p) => (
                  <ProductoCard key={p.id} producto={p} />
                ))}
              </div>

              {/* Paginación ABAJO */}
              {productosData.total > productosData.pagesize && (
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '1rem 0',
                  borderTop: '1px solid #e0e0e0'
                }}>
                  <span style={{ 
                    fontSize: '0.9rem',
                    color: '#666'
                  }}>
                    Page {paginaActual}{showTotal && totalPages ? ` / ${totalPages}` : ''}
                  </span>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      type="button"
                      disabled={!hasPrev}
                      onClick={() => handlePageChange((paginaActual ?? 1) - 1)}
                      style={{
                        padding: '0.4rem 1rem',
                        backgroundColor: hasPrev ? 'white' : '#f5f5f5',
                        color: hasPrev ? '#333' : '#999',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        cursor: hasPrev ? 'pointer' : 'not-allowed',
                        fontSize: '0.9rem'
                      }}
                    >
                      Prev
                    </button>
                    <button
                      type="button"
                      disabled={!hasNext}
                      onClick={() => handlePageChange((paginaActual ?? 1) + 1)}
                      style={{
                        padding: '0.4rem 1rem',
                        backgroundColor: hasNext ? 'white' : '#f5f5f5',
                        color: hasNext ? '#333' : '#999',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        cursor: hasNext ? 'pointer' : 'not-allowed',
                        fontSize: '0.9rem'
                      }}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <p className="text-center">No se encontraron productos</p>
          )}
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default Home